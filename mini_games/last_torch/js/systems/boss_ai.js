import { BOSS_MODELS, BOSS_TARGETING } from '../../data_model/bosses.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { createEnemy } from '../../data_model/monsters.js';
import { audio, player, shadowClones, state } from '../core/state.js';
import { showBanner } from '../ui/banner.js';
import { addShockwave, createExplosion, hitStop, screenFlash, shakeScreen } from './effects.js';
import { hurtPlayer } from './player.js';
import { addMonster } from './spawner.js';
import { clipSegment } from './colliders.js';
import { hurtTorch } from './torch.js';
import { hurtOaks, hurtOaksOnSegment } from './skills_nature.js';
import { damageShadowClone } from './shadow_clone.js';
import { damageAngel, liveAngel } from './skills_light.js';

// --- ATAQUES DOS BOSSES ---
// Cada boss repete em ciclo a lista model.patterns. Entre um ataque e outro, e.shootTimer conta a
// pausa (é também o que a arte usa para carregar o golpe na mão).
const TAU = Math.PI * 2;

function fireShot(e, model, angle, speedScale = 1) {
    // Rival: a mão sobe a cada tiro (o mesmo gesto de feitiço do herói) e ele vira para onde atira
    if (model.castSeconds) {
        e.castAge = 0;
        e.castAngle = angle;
    }
    state.enemyProjectiles.push({
        owner: e.type,
        range: model.projectileRange ?? 0,      // 0 = vai até sair da tela
        travelled: 0,
        color: model.color,
        x: e.x, y: e.y,
        vx: Math.cos(angle) * model.projectileSpeed * speedScale,
        vy: Math.sin(angle) * model.projectileSpeed * speedScale,
        radius: model.projectileRadius,
        damage: e.damage * model.projectileDamageMultiplier,
        torchDamage: model.projectileTorchDamage ?? 0
    });
}

const clampX = (x) => Math.max(40, Math.min(state.width - 40, x));
const clampY = (y) => Math.max(70, Math.min(state.height - 40, y));

// Ação marcada para daqui a alguns segundos (o golpe que "volta" depois do aviso)
function later(ai, seconds, fn) {
    (ai.later ??= []).push({ t: seconds, fn });
}

// Depois de um golpe pesado o boss fica aberto por um instante: leva mais dano (dealDamage) e um anel dourado avisa
const OPEN_SECONDS = 1.3;
function openWindow(e, model) {
    e.openTimer = OPEN_SECONDS;
    addShockwave(e.x, e.y, { radius: e.radius * 2.2, color: '#fde047', width: 4, seconds: 0.4 });
}
// Golpes que deixam o boss aberto (o tempo é o do aviso no chão)
const OPENS_AFTER = { slam: 1.5, quake: 1.4, stomp: 1.6, meteors: 2.2, bloom: 2.0, eclipse: 2.2, traps: 2.4, columns: 1.6, mark: 1.7 };

// Em quem o chefe mira: o herói, ou a SOMBRA mais perto quando ela está dentro do raio de provocação dela (BOSS_TARGETING) e mais perto que o herói
export function bossTarget(e) {
    const heroD = Math.hypot(player.x - e.x, player.y - e.y);
    let best = null, bd = BOSS_TARGETING.cloneProvokeRadius + e.radius;
    for (const c of shadowClones) {
        if (!c.active || c.hp <= 0) continue;
        const d = Math.hypot(c.x - e.x, c.y - e.y);
        if (d < bd && d < heroD) { bd = d; best = c; }
    }
    return best ? { x: best.x, y: best.y, dist: bd, clone: best } : { x: player.x, y: player.y, dist: heroD, clone: null };
}
function aimAngle(e) {
    const t = bossTarget(e);
    return Math.atan2(t.y - e.y, t.x - e.x);
}

// Os golpes do chefe também ferem as sombras (como o herói): em círculo ou em risco
function hurtClonesCircle(x, y, radius, amount, fromX = x, fromY = y) {
    for (const c of shadowClones) if (c.active && Math.hypot(c.x - x, c.y - y) < radius + 12) damageShadowClone(c, amount * BOSS_TARGETING.cloneDamageRatio, fromX, fromY, 0.5);
    const an = liveAngel();
    if (an && Math.hypot(an.x - x, an.y - y) < radius + an.radius) damageAngel(amount * BOSS_TARGETING.cloneDamageRatio, 0.5);
}
function hurtClonesSegment(x1, y1, x2, y2, width, amount) {
    for (const c of shadowClones) if (c.active && distanceToSegment(c.x, c.y, x1, y1, x2, y2) < width / 2 + 12) damageShadowClone(c, amount * BOSS_TARGETING.cloneDamageRatio, x1, y1, 0.5);
    const an = liveAngel();
    if (an && distanceToSegment(an.x, an.y, x1, y1, x2, y2) < width / 2 + an.radius) damageAngel(amount * BOSS_TARGETING.cloneDamageRatio, 0.5);
}

// Círculo no chão que estoura depois de delay segundos
// shockColor (opcional): cor do anel quando estoura. Devolve o aviso (quem o criou pode cancelá-lo se morrer antes)
export function addSlam(x, y, radius, delay, damage, color = null, torchDamage = 0, shockColor = null) {
    const t = { kind: 'circle', x, y, radius, age: 0, seconds: delay, damage, color, torchDamage, shockColor };
    state.telegraphs.push(t);
    return t;
}

const TELL_SECONDS = 0.55;
const LUNGE_WINDUP_SCALE = 1.5;     // aviso da investida 50% mais longo
const LUNGE_TIME_SCALE = 1.5;       // e a corrida em si 50% mais lenta
const TELLED = new Set(['crescent', 'skulls', 'frenzy', 'claws', 'bubbles', 'goo', 'volley', 'ring', 'spiral', 'shackle', 'fireshield', 'bloodfog', 'darkness', 'holyground', 'mirror']);
// Correntes do Demon Hunter (a skill Shadow Shackle virada contra o herói): voam a 700 px/s e prendem por 1,5 s.
// Quem estiver em dash (ou invulnerável) na hora em que a ponta chega escapa: a corrente erra e se desfaz.
export const BOSS_SHACKLE = { speed: 700, holdSeconds: 1.5 };

const ACTIONS = {
    // Rajada mirada: um tiro a cada burstIntervalSeconds
    volley(e, model, ai) {
        ai.shots = model.burstCount;
        ai.interval = model.burstIntervalSeconds;
        ai.fire = () => fireShot(e, model, aimAngle(e));
    },
    // Anel fechado com uma brecha para passar
    ring(e, model) {
        const count = model.ringCount;
        const gapAt = Math.floor(Math.random() * count);
        for (let i = 0; i < count; i++) {
            if (i === gapAt || i === (gapAt + 1) % count) continue;
            fireShot(e, model, (i / count) * TAU, 0.85);
        }
        addShockwave(e.x, e.y, { radius: e.radius * 2.6, color: model.color, width: 5, seconds: 0.35 });
        audio.playBossAttack();
    },
    // Espiral: tiros girando
    spiral(e, model, ai) {
        ai.shots = model.spiralShots;
        ai.interval = model.spiralIntervalSeconds;
        ai.spin = Math.random() * TAU;
        ai.fire = () => {
            ai.spin += 0.62;
            fireShot(e, model, ai.spin, 0.8);
            fireShot(e, model, ai.spin + Math.PI, 0.8);
        };
    },
    // Onda de curto alcance em volta do próprio boss (Captain Brutos): o machado ergue e desce no chão; quem estiver perto
    // quando o aviso termina leva o golpe. Sem mira no herói: ele precisa chegar perto para ser atingido.
    quake(e, model) {
        e.angle = aimAngle(e);
        e.comboStep = ((e.comboStep ?? 1) % 3) + 1;
        addSlam(e.x, e.y, model.quakeRadius, model.quakeDelaySeconds, e.damage * model.quakeDamageMultiplier, null, model.quakeTorchDamage ?? 0);
        audio.playBossAttack();
    },
    // Martelada: um círculo GRANDE em cima do herói, e mais dois que seguem onde ele estiver (um a cada 0,7 s).
    // Diferente dos meteoros: poucos, grandes e que perseguem, em vez de vários pequenos espalhados.
    slam(e, model, ai) {
        const radius = model.slamRadius * 1.5;
        const hit = () => addSlam(player.x, player.y, radius, model.slamDelaySeconds * 0.8, e.damage * model.slamDamageMultiplier * 1.1, null, 0);
        hit();
        later(ai, 0.7, hit);
        later(ai, 1.4, hit);
        audio.playBossAttack();
    },
    summon(e, model) {
        for (let i = 0; i < model.summonCount; i++) {
            const a = (i / model.summonCount) * TAU;
            addMonster(model.summonType, e.x + Math.cos(a) * (e.radius + 30), e.y + Math.sin(a) * (e.radius + 30));
        }
        addShockwave(e.x, e.y, { radius: e.radius * 3, color: model.color, width: 4, seconds: 0.4 });
        audio.playSummon();
    },
    // Sombras (rivais): shadowCount cópias dele em volta, cada uma com shadowHpRatio da vida máxima dele.
    // Enquanto alguma ainda estiver de pé, este ataque passa a vez.
    shadows(e, model) {
        if (state.enemies.some(o => o.shadowOwner === e)) return;
        const type = `${e.type.replace(/_FINAL$/, '')}_SHADOW`;
        const shadow = BOSS_MODELS[type];
        for (let i = 0; i < model.shadowCount; i++) {
            const a = aimAngle(e) + Math.PI + (i - (model.shadowCount - 1) / 2) * 1.1;
            const x = Math.max(40, Math.min(state.width - 40, e.x + Math.cos(a) * 70));
            const y = Math.max(70, Math.min(state.height - 40, e.y + Math.sin(a) * 70));
            const s = createEnemy(shadow, type, state.turn, x, y);
            s.hp = s.maxHp = Math.max(1, Math.round(e.maxHp * model.shadowHpRatio));
            s.damage = e.damage * shadow.shadowDamageRatio;
            s.speed = e.speed;
            s.shadowOwner = e;
            s.angle = e.angle;
            state.enemies.push(s);
            createExplosion(x, y, '#7c3aed', 12);
        }
        addShockwave(e.x, e.y, { radius: 150, color: '#7c3aed', width: 6, seconds: 0.45 });
        audio.playSummon();
    },
    // Investida (rivais): mira uma linha até o herói e depois a atravessa com a espada (updateLunge)
    lunge(e, model, ai) {
        const angle = aimAngle(e);
        // Investida mais lenta e legível: aviso maior (no combo, o aviso encurta menos, para dar tempo de escapar)
        const windup = (ai.inChain ? model.lungeWindupSeconds * 0.85 : model.lungeWindupSeconds) * LUNGE_WINDUP_SCALE;
        let toX = Math.max(60, Math.min(state.width - 60, e.x + Math.cos(angle) * model.lungeLength));
        let toY = Math.max(90, Math.min(state.height - 60, e.y + Math.sin(angle) * model.lungeLength));
        // Uma parede (área de contato) no caminho: a investida termina nela. O risco vermelho nunca passa de onde o chefe chega de verdade
        const reach = clipSegment(e.x, e.y, toX, toY, e.radius * 0.85, 'monsters');
        toX = reach.x;
        toY = reach.y;
        const line = {
            kind: 'line', owner: e, x: e.x, y: e.y, angle,
            length: Math.hypot(toX - e.x, toY - e.y), age: 0, seconds: windup
        };
        // Sem linha de aviso no chão (de propósito): o brilho crescendo no boss anuncia o golpe, e o risco vermelho só aparece
        // depois, como o corte que ele deixou (ver 'scar' em updateLunge)
        ai.lunge = { line, fromX: e.x, fromY: e.y, toX, toY, wait: windup, t: 0, hit: false };
    },
    // Azael: marca o chão onde o herói está (a sombra estoura ali) e reaparece colado nele para o corte
    mark(e, model, ai) {
        const tx = player.x, ty = player.y;
        addSlam(tx, ty, 70, 1.3, e.damage * 0.8, null, 0, '#ef4444');
        createExplosion(e.x, e.y, model.color, 18);
        later(ai, 1.3, () => {
            const a = Math.random() * TAU;
            createExplosion(e.x, e.y, model.color, 22);
            e.x = clampX(player.x + Math.cos(a) * 70);
            e.y = clampY(player.y + Math.sin(a) * 70);
            e.chainX = e.x;
            e.chainY = e.y;
            e.angle = aimAngle(e);
            e.comboStep = ((e.comboStep ?? 1) % 3) + 1;
            addShockwave(e.x, e.y, { radius: 90, color: model.color, width: 5, seconds: 0.3 });
            addSlam(player.x, player.y, 66, 0.5, e.damage * 1.1, null, 0, '#ef4444');
            audio.playDash();
        });
    },
    // Azael: três investidas seguidas, cada uma com um aviso mais curto
    combo(e, model, ai) {
        ai.chain = 2;
        ai.inChain = false;
        ACTIONS.lunge(e, model, ai);
    },
    // Demon Hunter: círculos sagrados armados em volta do herói, com o pavio longo (dá para sair deles)
    traps(e, model) {
        const n = model.trapCount ?? 5;
        for (let i = 0; i < n; i++) {
            const a = Math.random() * TAU;
            const d = i === 0 ? 0 : 90 + Math.random() * 90;
            addSlam(clampX(player.x + Math.cos(a) * d), clampY(player.y + Math.sin(a) * d), 54, 2 + i * 0.12, e.damage * 0.9, null, model.slamTorchDamage ?? 0, '#7dd3fc');
        }
        audio.playBossAttack();
    },
    // --- GOLPES DE VARIAÇÃO: pausas, espaço e respostas às skills (nada aqui aumenta muito a dificuldade) ---
    // Cansaço: o boss para ofegante por 1,6 s, aberto (+30% de dano). É a hora de bater
    rest(e, model) {
        e.holdStill = 1.6;
        e.chainX = e.x;
        e.chainY = e.y;
        e.tired = 1.6;
        e.openTimer = 1.6;
        addShockwave(e.x, e.y, { radius: e.radius * 2.2, color: '#fde047', width: 4, seconds: 0.4 });
    },
    // Machado preso (Brutos): crava o machado no chão e fica parado e aberto por 1,5 s
    anchor(e, model) {
        e.angle = aimAngle(e);
        e.comboStep = ((e.comboStep ?? 1) % 3) + 1;
        e.holdStill = 1.5;
        e.chainX = e.x;
        e.chainY = e.y;
        e.tired = 1.5;
        e.openTimer = 1.5;
        addShockwave(e.x, e.y, { radius: e.radius * 2.6, color: '#a8a29e', width: 6, seconds: 0.45 });
        createExplosion(e.x, e.y, '#a8a29e', 14);
        shakeScreen(5);
        audio.playBossAttack();
    },
    // Escudo de Fogo (Demon Lord): 3 s de chamas em volta dele. Imune, e queima quem encosta; depois fica aberto
    fireshield(e) {
        e.fireShield = 3;
        e.invulnerable = true;
        audio.playBossAttack();
    },
    // Névoa de Sangue (Condessa): 4 s de névoa vermelha; o boss fica quase invisível e o herói anda 35% mais devagar (stats.js). Sem dano
    bloodfog(e) {
        state.bossFx = { kind: 'fog', boss: e, age: 0, seconds: 4 };
        audio.playBossAttack();
    },
    // Escuridão (Long Night): 4 s com a luz da tocha encolhida. Fique perto dela. Não causa dano
    darkness(e) {
        state.bossFx = { kind: 'dark', boss: e, age: 0, seconds: 4 };
        audio.playBossAttack();
    },
    // Chão Sagrado (Demon Hunter): um círculo verde no chão por 5 s. Cura o boss se ele ficar dentro e fere o herói que entra
    holyground(e, model) {
        state.bossZone = { boss: e, x: e.x, y: e.y, radius: 85, age: 0, seconds: 5, tick: 0, damage: e.damage * 0.35 };
        addShockwave(e.x, e.y, { radius: 85, color: '#4ade80', width: 5, seconds: 0.5 });
        audio.playBossAttack();
    },
    // Adaga Devolvida: 2,5 s em que toda adaga que o acerta volta contra o herói (sem ferir o boss)
    mirror(e) {
        e.reflectTimer = 2.5;
        audio.playBossAttack();
    },
    // Espelho (Azael): imita o último movimento do herói. Dash recente: investida (com aviso); adaga recente: uma adaga só
    echo(e, model, ai) {
        const dashedLast = (player.lastDashAt ?? -1e9) > (state.knifeThrowTime ?? -1e9);
        addShockwave(e.x, e.y, { radius: e.radius * 2.4, color: '#a5f3fc', width: 4, seconds: 0.4 });
        if (dashedLast) ACTIONS.lunge(e, model, ai);
        else {
            ai.shots = 1;
            ai.interval = 0.3;
            ai.fire = () => fireShot(e, model, aimAngle(e));
        }
    },
    // Demon Hunter: a corrente da Shadow Shackle sai dele e prende o herói no chão por 1,5 s (dash na hora certa escapa)
    shackle(e) {
        state.bossShackle = { boss: e, reach: 0, held: false, age: 0 };
        audio.playShackle(false);
    },
    // Demon Hunter: colunas de luz em fila, do boss até o herói
    columns(e, model) {
        const a = aimAngle(e);
        for (let i = 1; i <= 6; i++) {
            addSlam(clampX(e.x + Math.cos(a) * (50 + i * 70)), clampY(e.y + Math.sin(a) * (50 + i * 70)), 46, 0.6 + i * 0.16, e.damage * 0.9, null, 0, '#7dd3fc');
        }
        audio.playBossAttack();
    },
    // Brutos: o machado racha o chão numa linha que avança na direção do herói
    stomp(e, model) {
        const a = aimAngle(e);
        e.angle = a;
        e.comboStep = ((e.comboStep ?? 1) % 3) + 1;
        for (let i = 1; i <= 6; i++) {
            addSlam(clampX(e.x + Math.cos(a) * (40 + i * 85)), clampY(e.y + Math.sin(a) * (40 + i * 85)), 70, 0.5 + i * 0.14, e.damage * 1.1, null, 6, '#a8a29e');
        }
        shakeScreen(6);
        audio.playBossAttack();
    },
    // Demon Lord: chuva de meteoros em volta do herói (um deles cai na tocha)
    meteors(e, model) {
        for (let i = 0; i < 7; i++) {
            const a = Math.random() * TAU;
            const d = i === 0 ? 0 : 60 + Math.random() * 170;
            const onTorch = i === 1;
            const x = onTorch ? state.coreX : clampX(player.x + Math.cos(a) * d);
            const y = onTorch ? state.coreY : clampY(player.y + Math.sin(a) * d);
            addSlam(x, y, 58, 1.1 + i * 0.2, e.damage * 0.9, null, onTorch ? (model.slamTorchDamage ?? 6) : 0, '#fb923c');
        }
        audio.playBossAttack();
    },
    // Slizork, golpe de garra: de perto ou a meia distância ele corta o ar com as garras e deixa TRÊS RISCOS vermelhos à frente, na direção do herói. Os riscos
    // aparecem como aviso e, passado o tempo, cortam: quem estiver em cima de um deles leva o dano (dá para ficar entre eles ou sair). Longe demais, ele solta bolhas
    claws(e, model, ai) {
        const range = model.clawRange ?? 340;
        if (Math.hypot(player.x - e.x, player.y - e.y) > range + 140) { ACTIONS.bubbles(e, model, ai); return; }
        const a = aimAngle(e);
        e.clawAt = performance.now();
        e.clawSide = e.clawSide === 1 ? -1 : 1;           // alterna a mão que corta (library/monsters/25d/slizork/slizork25d.js)
        const gap = model.clawGap ?? 44;
        const nx = -Math.sin(a), ny = Math.cos(a);
        const lines = [-1, 0, 1].map(k => {
            const x1 = e.x + nx * k * gap, y1 = e.y + ny * k * gap;
            return { x1, y1, x2: x1 + Math.cos(a) * range, y2: y1 + Math.sin(a) * range };
        });
        state.telegraphs.push({ kind: 'claws', age: 0, seconds: model.clawDelay ?? 0.85, lines, width: model.clawWidth ?? 26, damage: e.damage * 1.05 });
        audio.playBossAttack();
    },
    // Slizork, bolhas: solta bolhas de gosma que SEGUEM o herói devagar por alguns segundos e então estouram (também estouram ao encostar)
    bubbles(e, model) {
        const n = model.bubbleCount ?? 4;
        const base = aimAngle(e);
        for (let i = 0; i < n; i++) {
            const a = base + (i - (n - 1) / 2) * 0.7;
            state.enemyProjectiles.push({
                owner: e.type, bubble: true, age: 0, life: model.bubbleLife ?? 4.2, color: '#86efac', range: 0, travelled: 0,
                x: e.x + Math.cos(a) * e.radius * 0.8, y: e.y + Math.sin(a) * e.radius * 0.8,
                vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, radius: 15, speed: model.bubbleSpeed ?? 95,
                burstRadius: model.bubbleBurstRadius ?? 64, damage: e.damage * 0.9, torchDamage: 0
            });
        }
        createExplosion(e.x, e.y, '#86efac', 14);
        audio.playBossAttack();
    },
    // Slizork, fúria: ele ruge, fica enfurecido e CORRE atrás do herói bem mais depressa por alguns segundos (e não solta outro golpe até acabar)
    frenzy(e, model, ai) {
        const secs = model.frenzySeconds ?? 3.5;
        const m = model.frenzySpeedMultiplier ?? 2.4;
        if (e.frenzy) return;
        e.frenzy = true;
        e.speed *= m;
        e.shootTimer = Math.max(e.shootTimer, secs);
        e.enraged = true;                                      // a arte e o brilho de fúria já existem
        addShockwave(e.x, e.y, { radius: e.radius * 3.2, color: '#ef4444', width: 8, seconds: 0.5 });
        screenFlash('#ef4444', 0.18);
        shakeScreen(8);
        audio.playBossRoar();
        later(ai, secs, () => { e.speed /= m; e.frenzy = false; if (e.hp > e.maxHp * model.enrageRatio) e.enraged = false; });
    },
    // Azael (vermelha) e Demon Hunter-chefe (azul), Maré Carmesim: ele corta o ar com a espada e solta meias-luas de sangue em leque na direção do herói (uma onda; crescentWaves > 1 solta mais, 0,55 s uma da outra).
    // Cada meia-lua voa reta até o alcance e fere quem tocar (herói, árvore do druida, tocha). Desenho em js/render/entities.js (p.crescent)
    crescent(e, model, ai) {
        const n = model.crescentCount ?? 3;
        e.comboStep = ((e.comboStep ?? 1) % 3) + 1;               // o boneco faz o golpe de espada quando este número troca
        addShockwave(e.x, e.y, { radius: 70, color: model.color, width: 4, seconds: 0.25 });
        const wave = () => {
            const base = aimAngle(e);
            e.angle = base;
            for (let i = 0; i < n; i++) {
                const a = base + (i - (n - 1) / 2) * 0.32;
                state.enemyProjectiles.push({
                    owner: e.type, crescent: true, color: model.crescentColor ?? '#ef4444', fill: model.crescentFill ?? 'rgba(220, 38, 38, 0.9)', glow: model.crescentGlow ?? 'rgba(239, 68, 68, 0.55)', core: model.crescentCore ?? '#fecaca', range: model.crescentRange ?? 560, travelled: 0,
                    x: e.x + Math.cos(a) * e.radius, y: e.y + Math.sin(a) * e.radius,
                    vx: Math.cos(a) * (model.crescentSpeed ?? 420), vy: Math.sin(a) * (model.crescentSpeed ?? 420),
                    radius: model.crescentRadius ?? 22, damage: e.damage * (model.crescentDamageMultiplier ?? 1), torchDamage: 4
                });
            }
            audio.playBossAttack();
        };
        wave();
        for (let k = 1; k < (model.crescentWaves ?? 1); k++) later(ai, 0.55 * k, wave);         // ondas extras só se o chefe pedir (crescentWaves > 1)
    },
    // Grave King, avanço: um DASH curto e rápido até perto do herói (para logo antes dele), para emendar o corte de espada. Usa a investida dos rivais
    // (aviso + corrida, updateLunge) com o comprimento cortado na distância até o herói
    dash(e, model, ai) {
        const dist = Math.hypot(player.x - e.x, player.y - e.y);
        const length = Math.max(60, Math.min(model.dashLength ?? 300, dist - e.radius - 24));
        ACTIONS.lunge(e, { ...model, lungeLength: length }, ai);
    },
    // Grave King, chuva de ossos: ossos caem do céu em volta do herói, um depois do outro. A sombra no chão cresce mostrando onde cada um vai cair
    // (dá para fugir das sombras); o primeiro mira o lugar onde o herói está
    bonerain(e, model) {
        const n = model.boneCount ?? 9;
        for (let i = 0; i < n; i++) {
            const a = Math.random() * TAU, d = i === 0 ? 0 : 50 + Math.random() * (model.boneSpread ?? 190);
            state.telegraphs.push({
                kind: 'circle', bone: true, x: clampX(player.x + Math.cos(a) * d), y: clampY(player.y + Math.sin(a) * d), radius: model.boneRadius ?? 34,
                age: -i * 0.12, seconds: model.boneFallSeconds ?? 1.0, damage: e.damage * 0.6, color: null, torchDamage: 4, shockColor: '#e7e0cf', spin: Math.random() * TAU
            });
        }
        audio.playBossAttack();
    },
    // River Spirit, chuva: o mesmo golpe da chuva de ossos, mas caem GOTAS DE ÁGUA grandes (sombra azul no chão, gota descendo, respingo ao bater)
    rainfall(e, model) {
        const n = model.dropCount ?? 10;
        for (let i = 0; i < n; i++) {
            const a = Math.random() * TAU, d = i === 0 ? 0 : 50 + Math.random() * (model.dropSpread ?? 200);
            state.telegraphs.push({
                kind: 'circle', drop: true, x: clampX(player.x + Math.cos(a) * d), y: clampY(player.y + Math.sin(a) * d), radius: model.dropRadius ?? 36,
                age: -i * 0.11, seconds: model.dropFallSeconds ?? 1.0, damage: e.damage * 0.6, color: null, torchDamage: 4, shockColor: '#7dd3fc'
            });
        }
        audio.playBossAttack();
    },
    // Grave King, caveira: solta caveiras que SEGUEM o herói por alguns segundos, batendo a mandíbula como se rissem, e depois explodem
    // (mesmo voo das bolhas do Slizork: js/systems/enemies.js, updateBubble; desenho em js/render/entities.js)
    skulls(e, model) {
        const n = model.skullCount ?? 2;
        const base = aimAngle(e);
        for (let i = 0; i < n; i++) {
            const a = base + (i - (n - 1) / 2) * 0.9;
            state.enemyProjectiles.push({
                owner: e.type, bubble: true, skull: true, age: 0, life: model.skullLife ?? 4.5, color: '#e5e0cf', range: 0, travelled: 0,
                x: e.x + Math.cos(a) * e.radius, y: e.y + Math.sin(a) * e.radius,
                vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, radius: 14, speed: model.skullSpeed ?? 115,
                burstRadius: model.skullBurstRadius ?? 70, burstColor: '#f87171', damage: e.damage * 0.95, torchDamage: 0
            });
        }
        createExplosion(e.x, e.y, '#a8a29e', 14);
        audio.playBossAttack();
    },
    // Slizork, gosma: uma poça de gosma verde é marcada no chão onde o herói está; se ele ainda estiver nela quando estoura, os pés ficam presos por alguns segundos
    goo(e, model) {
        state.telegraphs.push({
            kind: 'circle', goo: true, x: player.x, y: player.y, radius: model.gooRadius ?? 80, age: 0, seconds: model.gooDelay ?? 1.0,
            damage: e.damage * 0.35, color: null, torchDamage: 0, shockColor: '#4ade80', root: model.gooRootSeconds ?? 2.6
        });
        createExplosion(e.x, e.y, '#4ade80', 12);
        audio.playBossAttack();
    },
    // Demon Lord: garra larga, um leque de fogo à frente dele
    claw(e, model) {
        const a = aimAngle(e);
        const n = 9;
        for (let i = 0; i < n; i++) fireShot(e, model, a + (i - (n - 1) / 2) * 0.15, 1.25);
        addShockwave(e.x, e.y, { radius: e.radius * 2.8, color: model.color, width: 6, seconds: 0.3 });
        audio.playBossAttack();
    },
    // Condessa / Long Night: onda de círculos que se abre do boss para fora, com brechas entre eles
    bloom(e, model) {
        const x0 = e.x, y0 = e.y;
        for (let k = 0; k < 3; k++) {
            const n = 6 + k * 3;
            const off = Math.random() * TAU;
            for (let i = 0; i < n; i++) {
                const a = off + (i / n) * TAU;
                const d = 110 + k * 110;
                const x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d;
                if (x < 30 || x > state.width - 30 || y < 50 || y > state.height - 30) continue;
                addSlam(x, y, 48, 0.9 + k * 0.45, e.damage * 0.8, null, 0, '#fb7185');
            }
        }
        addShockwave(e.x, e.y, { radius: e.radius * 3, color: model.color, width: 5, seconds: 0.4 });
        audio.playBossAttack();
    },
    // Long Night: um eclipse enorme em cima do herói (é preciso sair dele) e fragmentos em volta
    eclipse(e, model) {
        addSlam(player.x, player.y, 190, 1.7, e.damage * 1.2, null, 0, '#7c3aed');
        for (let i = 0; i < 4; i++) {
            const a = Math.random() * TAU, d = 150 + Math.random() * 150;
            addSlam(clampX(player.x + Math.cos(a) * d), clampY(player.y + Math.sin(a) * d), 60, 1.2 + i * 0.15, e.damage * 0.8, null, 0, '#7c3aed');
        }
        screenFlash(model.color, 0.2);
        audio.playBossAttack();
    },
    // Some numa nuvem e reaparece longe do herói
    blink(e, model) {
        createExplosion(e.x, e.y, model.color, 26);
        const a = Math.random() * TAU;
        const d = 240 + Math.random() * 160;
        e.x = Math.max(70, Math.min(state.width - 70, player.x + Math.cos(a) * d));
        e.y = Math.max(90, Math.min(state.height - 70, player.y + Math.sin(a) * d));
        // Shadow Shackle: o teleporte funciona, e a corrente segue o boss até o ponto novo
        e.chainX = e.x;
        e.chainY = e.y;
        createExplosion(e.x, e.y, model.color, 26);
        addShockwave(e.x, e.y, { radius: 110, color: model.color, width: 5, seconds: 0.35 });
        audio.playDash();
    }
};

function distanceToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

// Investida em andamento: parado mirando, depois corre a linha em lungeSeconds. Fere o herói uma vez ao passar
// por ele. Preso pelo Shadow Shackle, desiste da investida.
function updateLunge(e, model, ai, dt) {
    const L = ai.lunge;
    if (e.chained) {
        const i = state.telegraphs.indexOf(L.line);
        if (i >= 0) state.telegraphs.splice(i, 1);
        e.dashTimer = 0;
        e.invulnerable = false;
        ai.lunge = null;
        return;
    }
    if (L.wait > 0) {
        L.wait -= dt;
        e.tellRatio = Math.min(1, 1 - Math.max(0, L.wait) / L.line.seconds);      // brilho que cresce até o arranque
        e.x = L.fromX;
        e.y = L.fromY;
        e.angle = L.line.angle;
        if (L.wait <= 0) {
            e.tellRatio = 0;
            // Golpe de espada no arranque (o boneco detecta a troca de comboStep)
            e.comboStep = ((e.comboStep ?? 1) % 3) + 1;
            addShockwave(e.x, e.y, { radius: 70, color: model.color, width: 4, seconds: 0.25 });
            audio.playDash();
        }
        return;
    }
    e.invulnerable = true;      // imune durante o avanço (js/systems/damage.js): não morre atravessando os golpes do herói
    const prevX = e.x;
    const prevY = e.y;
    L.t = Math.min(1, L.t + dt / (model.lungeSeconds * LUNGE_TIME_SCALE));
    e.x = L.fromX + (L.toX - L.fromX) * L.t;
    e.y = L.fromY + (L.toY - L.fromY) * L.t;
    e.angle = L.line.angle;
    e.chainX = e.x;
    e.chainY = e.y;
    e.dashTimer = model.lungeSeconds * LUNGE_TIME_SCALE * (1 - L.t);
    // O avanço é tão rápido que num quadro ele passa por cima do herói: confere o trecho percorrido, não só o ponto final
    if (!L.hit && distanceToSegment(player.x, player.y, prevX, prevY, e.x, e.y) < e.radius + model.lungeHitRadius) {
        L.hit = hurtPlayer(e.damage * model.lungeDamageMultiplier, e.x, e.y, 0.6, e);
    }
    if (L.t >= 1) {
        // O corte vermelho que ficou no chão por onde ele passou
        state.telegraphs.push({ kind: 'scar', x: L.fromX, y: L.fromY, toX: e.x, toY: e.y, age: 0, seconds: 0.7 });      // até onde ele chegou de verdade
        // O avanço COMPLETA mesmo com a tocha no caminho e fere o que estiver na frente: a tocha (se o trecho passou por ela) e a árvore do druida
        if (distanceToSegment(state.coreX, state.coreY, L.fromX, L.fromY, e.x, e.y) < CORE_MODEL.collisionRadius + model.lungeHitRadius) {
            hurtTorch(model.lungeTorchDamage ?? 10, state.coreX, state.coreY);
            addShockwave(state.coreX, state.coreY, { radius: 60, color: model.color, width: 5, seconds: 0.3 });
        }
        hurtOaksOnSegment(L.fromX, L.fromY, e.x, e.y, model.lungeHitRadius * 2, e.damage * model.lungeDamageMultiplier);
        hurtClonesSegment(L.fromX, L.fromY, e.x, e.y, model.lungeHitRadius * 2, e.damage * model.lungeDamageMultiplier);
        e.dashTimer = 0;
        e.invulnerable = false;
        ai.lunge = null;
        createExplosion(e.x, e.y, model.color, 14);
        // Combo: mais uma investida logo em seguida (aviso mais curto); só a última deixa o boss aberto
        if (ai.chain > 0) {
            ai.chain--;
            ai.inChain = true;
            ACTIONS.lunge(e, model, ai);
            return;
        }
        ai.inChain = false;
        openWindow(e, model);
        e.shootTimer = model.patternGapSeconds * (e.enraged ? model.enrageGapMultiplier : 1);
    }
}

// --- RIVAIS: o jeito de lutar do herói ---
// Golpe automático quando o herói chega perto: troca o comboStep (o boneco faz o corte) e acerta logo depois
function updateRivalMelee(e, model, ai, dt) {
    ai.meleeTimer = (ai.meleeTimer ?? 0) - dt;
    if (ai.meleeHit != null) {
        ai.meleeHit -= dt;
        if (ai.meleeHit <= 0) {
            ai.meleeHit = null;
            const dx = player.x - e.x;
            const dy = player.y - e.y;
            let diff = Math.atan2(dy, dx) - ai.meleeAngle;
            while (diff > Math.PI) diff -= TAU;
            while (diff < -Math.PI) diff += TAU;
            if (Math.hypot(dx, dy) < model.meleeRange + 18 && Math.abs(diff) < model.meleeArc / 2) {
                hurtPlayer(e.damage * model.meleeDamageMultiplier, e.x, e.y, 0.5, e);
            }
        }
    }
    if (ai.meleeTimer > 0 || Math.hypot(player.x - e.x, player.y - e.y) > model.meleeRange) return;
    ai.meleeTimer = model.meleeCooldownSeconds * (e.enraged ? model.enrageGapMultiplier : 1);
    ai.meleeAngle = aimAngle(e);
    ai.meleeHit = model.meleeHitDelaySeconds;
    e.angle = ai.meleeAngle;
    e.comboStep = ((e.comboStep ?? 1) % 3) + 1;
    audio.playBossAttack();
}

// Anda em volta do herói de forma contínua. A perseguição (js/systems/enemies.js) já empurrou o rival para a frente
// neste quadro; aqui só se soma a diferença até a velocidade que ele quer. Nada muda de uma vez: a velocidade para
// frente/trás e a lateral se aproximam do alvo aos poucos (antes, perto do keepRange o chefe vibrava a cada
// quadro entre avançar e recuar, e o andar de lado trocava de sentido de repente).
const RIVAL_RADIAL_RESPONSE = 6;        // quão rápido a velocidade para frente/trás segue o alvo (por segundo)
const RIVAL_STRAFE_RESPONSE = 3;        // idem para a lateral
const RIVAL_KEEP_BAND = 60;             // faixa em volta do keepRange em que ele desacelera até parar

function updateRivalMovement(e, model, ai, dt) {
    if (e.chained) return;
    ai.strafeTimer = (ai.strafeTimer ?? 0) - dt;
    if (ai.strafeTimer <= 0) {
        ai.strafeTimer = model.strafeSwitchSeconds * (0.7 + Math.random() * 0.6);
        ai.strafeDir = Math.random() < 0.5 ? -1 : 1;
    }
    const a = aimAngle(e);
    const dist = Math.hypot(player.x - e.x, player.y - e.y);

    // Para frente (+) ou para trás (-): sem keepRange vai sempre ao herói; com keepRange avança se está longe,
    // para na distância certa e recua se o herói chega perto, tudo gradual
    const target = model.keepRange
        ? Math.max(-1, Math.min(1, (dist - model.keepRange) / RIVAL_KEEP_BAND)) * e.speed
        : e.speed;
    ai.radialV ??= e.speed;
    ai.radialV += (target - ai.radialV) * Math.min(1, dt * RIVAL_RADIAL_RESPONSE);

    const strafeTarget = ai.strafeDir * model.strafeSpeed * (e.enraged ? model.enrageSpeedMultiplier : 1);
    ai.strafeV ??= 0;
    ai.strafeV += (strafeTarget - ai.strafeV) * Math.min(1, dt * RIVAL_STRAFE_RESPONSE);

    const forward = (ai.radialV - e.speed) * dt;        // a perseguição já somou e.speed * dt
    const mx = Math.cos(a) * forward - Math.sin(a) * ai.strafeV * dt;
    const my = Math.sin(a) * forward + Math.cos(a) * ai.strafeV * dt;
    e.x = Math.max(40, Math.min(state.width - 40, e.x + mx));
    e.y = Math.max(70, Math.min(state.height - 40, e.y + my));
}

function updateRival(e, model, ai, dt) {
    if (e.castAge >= 0) e.castAge = e.castAge + dt >= model.castSeconds ? -1 : e.castAge + dt;
    updateRivalMelee(e, model, ai, dt);
    updateRivalMovement(e, model, ai, dt);
}

// Sombra do rival: o golpe de perto e o andar do rival, sem a lista de ataques. As que mantêm distância
// (shadowThrowSeconds) jogam uma adaga no herói de tempos em tempos
export function updateShadowAI(e, model, dt) {
    const ai = e.ai ??= {};
    updateRival(e, model, ai, dt);
    if (!model.shadowThrowSeconds || e.chained || state.phase !== 'HUNT') return;
    ai.throwTimer ??= model.shadowThrowSeconds * (0.4 + Math.random() * 0.8);    // não jogam todas juntas
    ai.throwTimer -= dt;
    if (ai.throwTimer > 0) return;
    ai.throwTimer = model.shadowThrowSeconds * (0.85 + Math.random() * 0.3);
    fireShot(e, model, aimAngle(e));
}

function enrage(e, model) {
    e.enraged = true;
    e.speed *= model.enrageSpeedMultiplier;
    hitStop(0.12);
    shakeScreen(16);
    screenFlash(model.color, 0.45);
    addShockwave(e.x, e.y, { radius: 240, color: model.color, width: 9, seconds: 0.6 });
    showBanner('', `${model.name.toUpperCase()} ENRAGES`, '', 'danger');
    audio.playBossRoar();
}

// Sandbox (aba Boss moves): faz o boss executar um golpe agora, do mesmo jeito que o sorteio faria (com o aviso, quando tem)
export function forceBossAction(e, model, action) {
    if (!ACTIONS[action]) return false;
    const ai = e.ai ?? (e.ai = { step: 0, shots: 0, interval: 0, wait: 0, fire: null });
    if (ai.lunge) return false;
    ai.shots = 0;
    ai.pending = null;
    if (TELLED.has(action)) {
        ai.pending = action;
        ai.tell = TELL_SECONDS;
    } else ACTIONS[action](e, model, ai);
    return true;
}

// Golpe de espada de perto (model.melee, o Grave King): quando o herói chega perto ele para, ergue a espada e corta à frente. A animação é a mesma do
// Ateliê (o boneco lê e.atk de 0 a 1: prepara, golpeia, recolhe). Enquanto corta, nenhum outro golpe começa. Devolve true enquanto o golpe dura.
function updateBossMelee(e, model, dt) {
    const M = model.melee;
    e.meleeCooldown = Math.max(0, (e.meleeCooldown ?? M.firstDelay ?? 0.6) - dt);
    if (e.atkT === undefined || e.atkT === null) {
        const target = bossTarget(e);                       // o herói, ou a sombra que provocou o chefe
        const dist = target.dist;
        if (e.meleeCooldown > 0 || dist > M.range + e.radius || state.phase !== 'HUNT') return false;
        e.atkT = 0;
        e.atkAngle = Math.atan2(target.y - e.y, target.x - e.x);
        e.atkHit = false;
        e.holdAim = true;                                    // fica parado enquanto corta
    }
    e.atkT += dt;
    const p = Math.min(1, e.atkT / M.seconds);
    e.atk = p;
    e.angle = e.atkAngle;
    if (!e.atkHit && p >= M.strikeAt) {
        e.atkHit = true;
        // O corte: um leque à frente dele, do tamanho do alcance da espada
        const tipX = e.x + Math.cos(e.atkAngle) * (M.range * 0.7 + e.radius), tipY = e.y + Math.sin(e.atkAngle) * (M.range * 0.7 + e.radius);
        state.telegraphs.push({ kind: 'scar', x: e.x + Math.cos(e.atkAngle - 0.9) * (M.range * 0.8 + e.radius), y: e.y + Math.sin(e.atkAngle - 0.9) * (M.range * 0.8 + e.radius),
            toX: e.x + Math.cos(e.atkAngle + 0.9) * (M.range * 0.8 + e.radius), toY: e.y + Math.sin(e.atkAngle + 0.9) * (M.range * 0.8 + e.radius), age: 0, seconds: 0.35 });
        addShockwave(tipX, tipY, { radius: 46, color: '#e5e7eb', width: 4, seconds: 0.25 });
        shakeScreen(6);
        audio.playBossAttack();
        const dx = player.x - e.x, dy = player.y - e.y;
        let diff = Math.atan2(dy, dx) - e.atkAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.hypot(dx, dy) < M.range + e.radius + 14 && Math.abs(diff) < M.arc / 2) hurtPlayer(e.damage * M.damageMultiplier, e.x, e.y, 0.6, e);
        hurtOaks(e.x + Math.cos(e.atkAngle) * (M.range * 0.6), e.y + Math.sin(e.atkAngle) * (M.range * 0.6), M.range * 0.5, e.damage * M.damageMultiplier);
        for (const c of shadowClones) {                      // as sombras dentro do leque também levam o corte
            if (!c.active) continue;
            const cx = c.x - e.x, cy = c.y - e.y;
            let cd = Math.atan2(cy, cx) - e.atkAngle;
            while (cd > Math.PI) cd -= Math.PI * 2;
            while (cd < -Math.PI) cd += Math.PI * 2;
            if (Math.hypot(cx, cy) < M.range + e.radius + 14 && Math.abs(cd) < M.arc / 2) damageShadowClone(c, e.damage * M.damageMultiplier * BOSS_TARGETING.cloneDamageRatio, e.x, e.y, 0.5);
        }
        const an = liveAngel();                              // e o anjo guardião também
        if (an) {
            const ax = an.x - e.x, ay = an.y - e.y;
            let ad = Math.atan2(ay, ax) - e.atkAngle;
            while (ad > Math.PI) ad -= Math.PI * 2;
            while (ad < -Math.PI) ad += Math.PI * 2;
            if (Math.hypot(ax, ay) < M.range + e.radius + 14 && Math.abs(ad) < M.arc / 2) damageAngel(e.damage * M.damageMultiplier * BOSS_TARGETING.cloneDamageRatio, 0.5);
        }
    }
    if (p >= 1) {
        e.atkT = null;
        e.atk = 0;
        e.holdAim = false;
        e.meleeCooldown = M.cooldown * (e.enraged ? 0.75 : 1);
        return false;
    }
    return true;
}

export function updateBossAI(e, model, dt) {
    const ai = e.ai ?? (e.ai = { step: 0, shots: 0, interval: 0, wait: 0, fire: null });
    if (model.melee && !ai.lunge && updateBossMelee(e, model, dt)) return;

    if (!e.enraged && e.hp < e.maxHp * model.enrageRatio) enrage(e, model);

    // Fases: abaixo de cada limite o boss troca a lista de golpes (e ganha golpes novos)
    const nextPhase = model.phases?.[(e.bossPhase ?? 0) + 1];
    if (nextPhase && e.hp < e.maxHp * nextPhase.at) {
        e.bossPhase = (e.bossPhase ?? 0) + 1;
        ai.shots = 0;
        ai.last = ai.last2 = null;
        ai.pending = null;
        e.tellRatio = 0;
        e.shootTimer = 1.2;
        hitStop(0.08);
        shakeScreen(10);
        screenFlash(model.color, 0.3);
        addShockwave(e.x, e.y, { radius: 200, color: model.color, width: 7, seconds: 0.5 });
        showBanner('', `${model.name.toUpperCase()} · ${nextPhase.label ?? 'NEW POWER'}`, '', 'danger');
        audio.playBossRoar();
    }
    if (e.openTimer > 0) e.openTimer -= dt;
    if (e.holdStill > 0) e.holdStill -= dt;
    if (e.tired > 0) e.tired -= dt;
    if (e.reflectTimer > 0) e.reflectTimer -= dt;
    if (e.fireShield > 0) {
        e.fireShield -= dt;
        // Quem encosta no escudo leva uma queimadura (de 0,6 em 0,6 s)
        e.shieldTick = (e.shieldTick ?? 0) - dt;
        if (e.shieldTick <= 0 && Math.hypot(player.x - e.x, player.y - e.y) < e.radius + 46) {
            e.shieldTick = 0.6;
            hurtPlayer(e.damage * 0.3, e.x, e.y, 0.5);
        }
        if (e.fireShield <= 0) {
            e.invulnerable = false;
            openWindow(e, model);
        }
    }
    if (ai.later?.length) {
        for (let i = ai.later.length - 1; i >= 0; i--) {
            const l = ai.later[i];
            l.t -= dt;
            if (l.t > 0) continue;
            ai.later.splice(i, 1);
            if (state.phase === 'HUNT' && e.hp > 0) l.fn();
        }
    }

    if (ai.lunge) {
        updateLunge(e, model, ai, dt);
        return;
    }
    if (model.renderAs === 'RIVAL') updateRival(e, model, ai, dt);

    // Aviso dos golpes de tiro: o boss "carrega" por TELL_SECONDS (brilho que cresce, ver renderEnemyOverlays) antes de disparar.
    // Os golpes de chão (círculos) e a investida já têm o próprio aviso, então ficam de fora.
    if (ai.pending) {
        ai.tell -= dt;
        e.tellRatio = Math.min(1, 1 - ai.tell / TELL_SECONDS);
        if (ai.tell > 0) return;
        const action = ai.pending;
        ai.pending = null;
        e.tellRatio = 0;
        ACTIONS[action](e, model, ai);
        e.shootTimer = model.patternGapSeconds * (e.enraged ? model.enrageGapMultiplier : 1);
        return;
    }

    // Ataque em andamento (rajada, espiral): um tiro por intervalo
    if (ai.shots > 0) {
        ai.wait -= dt;
        e.shootTimer = Math.max(0.01, ai.wait);
        if (ai.wait <= 0) {
            ai.fire();
            ai.shots--;
            ai.wait = ai.interval;
            e.shootTimer = ai.interval + 0.2;       // a arte detecta o disparo por este salto
            if (ai.shots === 0) e.shootTimer = model.patternGapSeconds * (e.enraged ? model.enrageGapMultiplier : 1);
        }
        return;
    }

    e.shootTimer -= dt;
    if (e.shootTimer > 0) return;

    // Sorteia o próximo golpe da fase (sem repetir os dois últimos, e sem "sombras" se elas ainda estão em campo)
    const pool = model.phases ? model.phases[Math.min(e.bossPhase ?? 0, model.phases.length - 1)].patterns : model.patterns;
    const shadowsUp = state.enemies.some(o => o.shadowOwner === e);
    let options = pool.filter(a => a !== ai.last && a !== ai.last2 && !(a === 'shadows' && shadowsUp));
    if (!options.length) options = pool.filter(a => !(a === 'shadows' && shadowsUp));
    if (!options.length) options = pool;
    const action = options[Math.floor(Math.random() * options.length)];
    ai.last2 = ai.last;
    ai.last = action;
    ai.step++;
    if (TELLED.has(action)) {
        ai.pending = action;
        ai.tell = TELL_SECONDS;
        audio.playHorn();
        return;
    }
    ACTIONS[action](e, model, ai);
    if (OPENS_AFTER[action]) later(ai, OPENS_AFTER[action], () => openWindow(e, model));
    e.shootTimer = model.patternGapSeconds * (e.enraged ? model.enrageGapMultiplier : 1);
}

// Avisos no chão: círculos que estouram e linhas (espectro), mais as covas que levantam esqueletos
function releaseBossShackle() {
    state.bossShackle = null;
    player.shackledTimer = 0;
    player.rootedTimer = 0;
}

// Névoa, escuridão e chão sagrado: efeitos de campo dos golpes de variação (o desenho está em render/atmosphere.js e render/effects.js)
function updateBossFields(dt) {
    const fx = state.bossFx;
    if (fx) {
        fx.age += dt;
        if (fx.age >= fx.seconds || state.phase !== 'HUNT' || fx.boss.hp <= 0) state.bossFx = null;
    }
    const z = state.bossZone;
    if (!z) return;
    z.age += dt;
    const boss = z.boss;
    if (z.age >= z.seconds || state.phase !== 'HUNT' || boss.hp <= 0) {
        state.bossZone = null;
        return;
    }
    if (Math.hypot(boss.x - z.x, boss.y - z.y) < z.radius) boss.hp = Math.min(boss.maxHp, boss.hp + boss.maxHp * 0.008 * dt);
    z.tick -= dt;
    if (z.tick <= 0 && Math.hypot(player.x - z.x, player.y - z.y) < z.radius) {
        z.tick = 0.7;
        hurtPlayer(z.damage, z.x, z.y, 0.5);
    }
}

function updateBossShackle(dt) {
    const s = state.bossShackle;
    if (!s) return;
    if (state.phase !== 'HUNT' || s.boss.hp <= 0 || player.hp <= 0) {
        releaseBossShackle();
        return;
    }
    if (s.held) {
        s.age += dt;
        player.shackledTimer = Math.max(0, BOSS_SHACKLE.holdSeconds - s.age);
        if (s.age >= BOSS_SHACKLE.holdSeconds) {
            createExplosion(player.x, player.y, '#a78bfa', 8);
            releaseBossShackle();
        }
        return;
    }
    s.reach += BOSS_SHACKLE.speed * dt;
    if (s.reach < Math.hypot(player.x - s.boss.x, player.y - s.boss.y)) return;
    if (player.dashTimer > 0 || player.iFrames > 0) {
        // Errou: o herói estava no meio do dash
        addShockwave(player.x, player.y, { radius: 40, color: '#a78bfa', width: 3, seconds: 0.25 });
        state.bossShackle = null;
        return;
    }
    s.held = true;
    s.age = 0;
    player.shackledTimer = BOSS_SHACKLE.holdSeconds;
    createExplosion(player.x, player.y, '#a78bfa', 10);
    addShockwave(player.x, player.y, { radius: 56, color: '#a78bfa', width: 4, seconds: 0.3 });
    shakeScreen(3);
    audio.playShackle(true);
}

export function updateTelegraphs(dt) {
    updateBossShackle(dt);
    updateBossFields(dt);
    const { telegraphs } = state;
    for (let i = telegraphs.length - 1; i >= 0; i--) {
        const t = telegraphs[i];
        t.age += dt;
        if (t.age < t.seconds) continue;
        telegraphs.splice(i, 1);

        if (t.kind === 'claws') {
            // Os três cortes: cada risco fica no chão por um instante; quem estiver em cima de algum leva o dano (uma vez)
            let hit = false;
            for (const L of t.lines) {
                state.telegraphs.push({ kind: 'scar', x: L.x1, y: L.y1, toX: L.x2, toY: L.y2, age: 0, seconds: 0.6 });
                const dx = L.x2 - L.x1, dy = L.y2 - L.y1;
                const k = Math.max(0, Math.min(1, ((player.x - L.x1) * dx + (player.y - L.y1) * dy) / (dx * dx + dy * dy)));
                if (Math.hypot(player.x - (L.x1 + dx * k), player.y - (L.y1 + dy * k)) < t.width / 2 + 12) hit = true;
            }
            shakeScreen(7);
            audio.playBlast();
            if (hit) hurtPlayer(t.damage, t.lines[1].x1, t.lines[1].y1, 0.5);
            for (const L of t.lines) { hurtOaksOnSegment(L.x1, L.y1, L.x2, L.y2, t.width, t.damage); hurtClonesSegment(L.x1, L.y1, L.x2, L.y2, t.width, t.damage); }
        } else if (t.kind === 'circle') {
            addShockwave(t.x, t.y, { radius: t.radius, color: t.shockColor ?? '#f87171', width: 7, seconds: 0.3 });
            createExplosion(t.x, t.y, t.goo ? '#4ade80' : t.bone ? '#e7e0cf' : t.drop ? '#7dd3fc' : t.shockColor ? '#a8a29e' : '#f97316', 16);
            shakeScreen(5);
            audio.playBlast();
            if (Math.hypot(player.x - t.x, player.y - t.y) < t.radius) hurtPlayer(t.damage, t.x, t.y, 0.5);
            hurtOaks(t.x, t.y, t.radius, t.damage);          // a árvore do druida também leva o golpe
            hurtClonesCircle(t.x, t.y, t.radius, t.damage);  // e as sombras
            // Gosma: os pés ficam presos (não anda nem dá dash; ainda ataca), como as raízes do Treant
            if (t.root && Math.hypot(player.x - t.x, player.y - t.y) < t.radius) {
                player.rootedTimer = Math.max(player.rootedTimer ?? 0, t.root);
                player.rootedMax = player.rootedTimer;
                player.rootGoo = true;
            }
            // Boss lutando perto da tocha: o círculo que pega a chama também a fere
            if (t.torchDamage && Math.hypot(state.coreX - t.x, state.coreY - t.y) < t.radius + CORE_MODEL.collisionRadius) {
                hurtTorch(t.torchDamage, state.coreX, state.coreY);
            }
        } else if (t.kind === 'grave') {
            if (state.phase === 'HUNT') addMonster(t.monsterType, t.x, t.y);
            createExplosion(t.x, t.y, '#a8a29e', 10);
        }
    }
}
