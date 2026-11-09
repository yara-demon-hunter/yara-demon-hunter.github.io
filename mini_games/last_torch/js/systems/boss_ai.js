import { BOSS_MODELS } from '../../data_model/bosses.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { createEnemy } from '../../data_model/monsters.js';
import { audio, player, state } from '../core/state.js';
import { showBanner } from '../ui/banner.js';
import { addShockwave, createExplosion, hitStop, screenFlash, shakeScreen } from './effects.js';
import { hurtPlayer } from './player.js';
import { addMonster } from './spawner.js';
import { hurtTorch } from './torch.js';

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

function aimAngle(e) {
    return Math.atan2(player.y - e.y, player.x - e.x);
}

// Círculo no chão que estoura depois de delay segundos
export function addSlam(x, y, radius, delay, damage, color = null, torchDamage = 0) {
    state.telegraphs.push({ kind: 'circle', x, y, radius, age: 0, seconds: delay, damage, color, torchDamage });
}

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
    // Círculos no chão: o primeiro no herói, os outros em volta dele
    slam(e, model) {
        for (let i = 0; i < model.slamCount; i++) {
            const a = Math.random() * TAU;
            const d = i === 0 ? 0 : 70 + Math.random() * 120;
            addSlam(
                Math.max(40, Math.min(state.width - 40, player.x + Math.cos(a) * d)),
                Math.max(40, Math.min(state.height - 40, player.y + Math.sin(a) * d)),
                model.slamRadius,
                model.slamDelaySeconds + i * 0.14,
                e.damage * model.slamDamageMultiplier,
                null,
                model.slamTorchDamage ?? 0
            );
        }
        // Corpo de herói que bate no chão (Brutos): o machado desce junto com o aviso
        if (model.slamSwing) {
            e.angle = aimAngle(e);
            e.comboStep = ((e.comboStep ?? 1) % 3) + 1;
        }
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
        const toX = Math.max(60, Math.min(state.width - 60, e.x + Math.cos(angle) * model.lungeLength));
        const toY = Math.max(90, Math.min(state.height - 60, e.y + Math.sin(angle) * model.lungeLength));
        const line = {
            kind: 'line', owner: e, x: e.x, y: e.y, angle,
            length: Math.hypot(toX - e.x, toY - e.y), age: 0, seconds: model.lungeWindupSeconds
        };
        // A linha de aviso não é mais desenhada (não entra em state.telegraphs): o jogador lê a investida pelo
        // boneco, que para e mira durante lungeWindupSeconds. `line` só guarda o ângulo e o alcance.
        ai.lunge = { line, fromX: e.x, fromY: e.y, toX, toY, wait: model.lungeWindupSeconds, t: 0, hit: false };
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
        e.x = L.fromX;
        e.y = L.fromY;
        e.angle = L.line.angle;
        if (L.wait <= 0) {
            // Golpe de espada no arranque (o boneco detecta a troca de comboStep)
            e.comboStep = (e.comboStep % 3) + 1;
            addShockwave(e.x, e.y, { radius: 70, color: model.color, width: 4, seconds: 0.25 });
            audio.playDash();
        }
        return;
    }
    e.invulnerable = true;      // imune durante o avanço (js/systems/damage.js): não morre atravessando os golpes do herói
    const prevX = e.x;
    const prevY = e.y;
    L.t = Math.min(1, L.t + dt / model.lungeSeconds);
    e.x = L.fromX + (L.toX - L.fromX) * L.t;
    e.y = L.fromY + (L.toY - L.fromY) * L.t;
    e.angle = L.line.angle;
    e.chainX = e.x;
    e.chainY = e.y;
    e.dashTimer = model.lungeSeconds * (1 - L.t);
    // O avanço é tão rápido que num quadro ele passa por cima do herói: confere o trecho percorrido, não só o ponto final
    if (!L.hit && distanceToSegment(player.x, player.y, prevX, prevY, e.x, e.y) < e.radius + model.lungeHitRadius) {
        L.hit = hurtPlayer(e.damage * model.lungeDamageMultiplier, e.x, e.y, 0.6);
    }
    if (L.t >= 1) {
        e.dashTimer = 0;
        e.invulnerable = false;
        ai.lunge = null;
        createExplosion(e.x, e.y, model.color, 14);
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
                hurtPlayer(e.damage * model.meleeDamageMultiplier, e.x, e.y, 0.5);
            }
        }
    }
    if (ai.meleeTimer > 0 || Math.hypot(player.x - e.x, player.y - e.y) > model.meleeRange) return;
    ai.meleeTimer = model.meleeCooldownSeconds * (e.enraged ? model.enrageGapMultiplier : 1);
    ai.meleeAngle = aimAngle(e);
    ai.meleeHit = model.meleeHitDelaySeconds;
    e.angle = ai.meleeAngle;
    e.comboStep = (e.comboStep % 3) + 1;
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

export function updateBossAI(e, model, dt) {
    const ai = e.ai ?? (e.ai = { step: 0, shots: 0, interval: 0, wait: 0, fire: null });

    if (!e.enraged && e.hp < e.maxHp * model.enrageRatio) enrage(e, model);

    if (ai.lunge) {
        updateLunge(e, model, ai, dt);
        return;
    }
    if (model.renderAs === 'RIVAL') updateRival(e, model, ai, dt);

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

    const action = model.patterns[ai.step % model.patterns.length];
    ai.step++;
    ACTIONS[action](e, model, ai);
    e.shootTimer = model.patternGapSeconds * (e.enraged ? model.enrageGapMultiplier : 1);
}

// Avisos no chão: círculos que estouram e linhas (espectro), mais as covas que levantam esqueletos
export function updateTelegraphs(dt) {
    const { telegraphs } = state;
    for (let i = telegraphs.length - 1; i >= 0; i--) {
        const t = telegraphs[i];
        t.age += dt;
        if (t.age < t.seconds) continue;
        telegraphs.splice(i, 1);

        if (t.kind === 'circle') {
            addShockwave(t.x, t.y, { radius: t.radius, color: '#f87171', width: 7, seconds: 0.3 });
            createExplosion(t.x, t.y, '#f97316', 16);
            shakeScreen(5);
            audio.playBlast();
            if (Math.hypot(player.x - t.x, player.y - t.y) < t.radius) hurtPlayer(t.damage, t.x, t.y, 0.5);
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
