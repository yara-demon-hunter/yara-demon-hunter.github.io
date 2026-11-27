// --- CONVERSÃO (Avgustino) ---
// De tempos em tempos o padre reza por um monstro comum perto dele: o monstro sai de state.enemies e entra em state.converts,
// do lado do herói, até o fim da noite. Os convertidos se acumulam (até CONVERSION.maxAllies), andam atrás do monstro mais
// perto e batem nele; sem ninguém por perto, seguem o herói. Também PROVOCAM: os monstros comuns por perto vão atrás deles
// (js/systems/enemies.js usa provokingConvert) e os machucam no contato (hurtConvert). Bosses e elites nunca são convertidos.
// Números em data_model/passives.js (CONVERSION); desenho em js/render/entities.js (renderConverts...).
import { CONVERSION } from '../../data_model/passives.js';
import { MONSTER_MODELS } from '../../data_model/monsters.js';
import { POWER_MODELS } from '../../data_model/powers.js';
import { audio, passives, player, state } from '../core/state.js';
import { dealDamage } from './damage.js';
import { addFloater, addShockwave, createExplosion } from './effects.js';
import { lerpAngle } from '../../library/core/easing.js';

const C = CONVERSION;
const FX_SECONDS = 0.9;

export function resetConversion() {
    state.converts.length = 0;
    state.conversion.timer = C.firstDelaySeconds;
    state.conversion.fx.length = 0;
}

// Pode ser convertido: monstro comum, vivo, sem ser boss, elite, sombra do rival ou monstro invocado por um boss
function convertible(e) {
    if (e.hp <= 0 || e.isBoss || e.elite || e.shadowOwner || e.invulnerable || e === state.currentBoss) return false;
    return Boolean(MONSTER_MODELS[e.type]) && !MONSTER_MODELS[e.type].isShadow;
}

function convertNearest() {
    let best = null;
    let bestD = C.range;
    let bestI = -1;
    state.enemies.forEach((e, i) => {
        if (!convertible(e)) return;
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d < bestD) { bestD = d; best = e; bestI = i; }
    });
    if (!best) return false;

    // Sai da horda sem morrer: sem ouro, XP nem pontos (o golpe preparado do golem some junto)
    if (best.slamTele) {
        const t = state.telegraphs.indexOf(best.slamTele);
        if (t >= 0) state.telegraphs.splice(t, 1);
        best.slamTele = null;
    }
    state.enemies.splice(bestI, 1);
    Object.assign(best, {
        ally: true, vx: 0, vy: 0, lungeState: 0, rooted: 0, frozen: 0, stunned: 0, marked: 0, blessed: 0,
        chilled: 0, burning: 0, ravenMark: 0, slow: 0, hitFlash: 0, allyCd: 0,
        punchState: 0, punchCooldown: 0.4, swing: 0, throwArm: 0, slamHit: false, shotTimer: undefined, lungeTimer: 0.4
    });
    best.hp = best.maxHp;           // a mesma vida de antes, mas cheia (mesmo que estivesse ferido); depois disso, nunca se cura
    state.converts.push(best);
    state.conversion.fx.push({ x: best.x, y: best.y, age: 0, ally: best });
    addFloater(best.x, best.y - best.radius - 14, 'CONVERTED', '#fde68a');
    audio.playBell?.(true);
    return true;
}

// O monstro comum mais perto deste inimigo que o está provocando (dentro de provokeRadius), ou null
export function provokingConvert(e) {
    const allies = state.converts;
    if (allies.length === 0) return null;
    let best = null;
    let bestD = C.provokeRadius;
    for (const a of allies) {
        const d = Math.hypot(a.x - e.x, a.y - e.y);
        if (d < bestD) { bestD = d; best = a; }
    }
    return best;
}

export function hurtConvert(a, amount) {
    if (a.hp <= 0) return;
    a.hp -= amount;
    a.hitFlash = 0.12;

}

// --- DANO NOS ESQUELETOS INVOCADOS (Summon Skeletons): tiros, explosões e golpes em área dos monstros os atingem; o chefe fere BOSS_MULT x mais ---
const bossMult = () => POWER_MODELS.summonSkeletons.base.bossDamageMultiplier;
// O dano de um golpe de chefe num esqueleto: o dano x bossDamageMultiplier, mas NUNCA menos que bossMinHitRatio da vida máxima dele (o chefe os derruba em poucos golpes, mesmo os mais resistentes: eles não atrapalham a luta)
const bossHit = (a, amount) => Math.max(amount * bossMult(), a.maxHp * POWER_MODELS.summonSkeletons.base.bossMinHitRatio);
const hitAmount = (a, amount, fromBoss) => (fromBoss ? bossHit(a, amount) : amount);
export function summonedHit(x, y, radius) {
    for (const a of state.converts) if (a.summoned && a.hp > 0 && Math.hypot(a.x - x, a.y - y) < radius + a.radius) return a;
    return null;
}
export function hurtSummonsCircle(x, y, radius, amount, fromBoss = false) {
    for (const a of state.converts) {
        if (!a.summoned || a.hp <= 0 || Math.hypot(a.x - x, a.y - y) >= radius + a.radius) continue;
        hurtConvert(a, hitAmount(a, amount, fromBoss));
    }
}
// Golpe em leque (a espada do chefe): quem está dentro do alcance e do ângulo (arc, em radianos) leva o dano
export function hurtSummonsArc(x, y, angle, range, arc, amount, fromBoss = false) {
    for (const a of state.converts) {
        if (!a.summoned || a.hp <= 0) continue;
        const dx = a.x - x, dy = a.y - y;
        if (Math.hypot(dx, dy) >= range + a.radius) continue;
        let diff = Math.atan2(dy, dx) - angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) < arc / 2) hurtConvert(a, hitAmount(a, amount, fromBoss));
    }
}
// A investida do chefe (dash): fere cada esqueleto UMA vez ao passar por ele (hit = o Set de quem já levou)
export function hurtSummonsDash(x1, y1, x2, y2, reach, amount, hit) {
    for (const a of state.converts) {
        if (!a.summoned || a.hp <= 0 || hit.has(a)) continue;
        const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy || 1;
        const k = Math.max(0, Math.min(1, ((a.x - x1) * dx + (a.y - y1) * dy) / len2));
        if (Math.hypot(a.x - (x1 + dx * k), a.y - (y1 + dy * k)) < reach + a.radius) { hit.add(a); hurtConvert(a, bossHit(a, amount)); }
    }
}
export function hurtSummonsSegment(x1, y1, x2, y2, width, amount, fromBoss = false) {
    const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy || 1;
    for (const a of state.converts) {
        if (!a.summoned || a.hp <= 0) continue;
        const k = Math.max(0, Math.min(1, ((a.x - x1) * dx + (a.y - y1) * dy) / len2));
        if (Math.hypot(a.x - (x1 + dx * k), a.y - (y1 + dy * k)) < width / 2 + a.radius) hurtConvert(a, hitAmount(a, amount, fromBoss));
    }
}

function nearestEnemy(a) {
    let best = null;
    let bestD = C.seekRange;
    for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        const d = Math.hypot(e.x - a.x, e.y - a.y);
        if (d < bestD) { bestD = d; best = e; }
    }
    return best;
}

// O alvo de um esqueleto invocado: o que ele já escolheu (se ainda vive); senão o monstro mais perto que NENHUM outro esqueleto invocado escolheu; sem livre, o mais perto de todos
function stickyTarget(a, claimed) {
    if (a.target && a.target.hp > 0 && state.enemies.includes(a.target)) return a.target;
    let best = null, bestD = C.seekRange;
    for (const e of state.enemies) {
        if (e.hp <= 0 || claimed.has(e)) continue;
        const d = Math.hypot(e.x - a.x, e.y - a.y);
        if (d < bestD) { bestD = d; best = e; }
    }
    a.target = best ?? nearestEnemy(a);
    if (best) claimed.add(best);
    return a.target;
}

function moveToward(a, x, y, stopAt, dt) {
    const dx = x - a.x;
    const dy = y - a.y;
    const d = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    a.angle = angle;
    a.facing = lerpAngle(a.facing ?? angle, angle, Math.min(1, dt * 8));
    a.idle = d <= stopAt;                 // parado: o desenho não mexe os pés (js/render/entities.js, liveNow)
    if (d <= stopAt) return d;
    const step = Math.min(d - stopAt, a.speed * C.speedScale * dt);
    a.x += Math.cos(angle) * step;
    a.y += Math.sin(angle) * step;
    return d;
}

// --- O ATAQUE DE CADA CONVERTIDO: o mesmo golpe que ele usava contra o herói, agora contra os monstros ---
// Tiro (bruxa, cavaleiro, pedra do golem, necromante): para a uma distância e atira um tiro que persegue o monstro (o "tiro
// refletido" do Mirror Ward, em js/systems/enemies.js, com a cor do monstro). Soco (treant) em leque e pancada em área (golem),
// com a mesma preparação de braços. Investida (espectro, lobo zumbi): mira e dispara atravessando. Inchado: corre e explode.
// Os outros: mordida corpo a corpo, com um tranco para a frente para o golpe aparecer.
const GOLD = '#fde68a';

function allyShot(a, model, target) {
    const angle = Math.atan2(target.y - a.y, target.x - a.x);
    const speed = (model.projectileSpeed ?? 170) * 1.25;
    state.enemyProjectiles.push({
        owner: a.type, color: model.projectileColor ?? model.color, allyShot: true, reflected: true,
        target: a.summoned ? null : target,          // os esqueletos invocados NÃO miram a flecha: ela sai reta; se errar, passa reto (e pode acertar outro monstro). Os convertidos do Avgustino continuam com o tiro que persegue
        x: a.x, y: a.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        radius: model.projectileRadius ?? 6,
        damage: a.damage * (model.projectileDamageMultiplier ?? 1) * C.damageScale,
        hitColor: model.projectileColor ?? model.color
    });
}

// Monstros acertados por um golpe do convertido (leque ou área). Bosses também apanham
function strike(a, P, damage) {
    for (const e of state.enemies) {
        const dx = e.x - a.x, dy = e.y - a.y;
        const d = Math.hypot(dx, dy);
        if (P.area) {
            if (d > P.areaRadius + e.radius) continue;
        } else {
            const diff = Math.atan2(Math.sin(Math.atan2(dy, dx) - a.punchAngle), Math.cos(Math.atan2(dy, dx) - a.punchAngle));
            if (d > P.range + e.radius || Math.abs(diff) > P.halfAngle) continue;
        }
        dealDamage(e, damage, { noCrit: true, kbX: (dx / (d || 1)) * 160, kbY: (dy / (d || 1)) * 160 });
    }
}

// Soco/pancada com preparação (a.punchState 1 = braços subindo, 2 = golpe, 3 = volta), igual ao do monstro. true = está golpeando
function allyPunch(a, P, target, d, dt) {
    if (a.punchState === 1) {
        a.punchTimer -= dt;
        a.swing = 1 - Math.max(0, a.punchTimer) / P.windupSeconds;
        if (a.punchTimer <= 0) {
            a.punchState = 2;
            a.punchTimer = P.strikeSeconds;
            a.slamHit = Boolean(P.area);
            strike(a, P, a.damage * P.damageMultiplier * C.damageScale);
            const fx = P.area ? { x: a.x, y: a.y, r: P.areaRadius } : { x: a.x + Math.cos(a.punchAngle) * 28, y: a.y + Math.sin(a.punchAngle) * 28, r: 34 };
            addShockwave(fx.x, fx.y, { radius: fx.r, color: GOLD, width: P.area ? 7 : 5, seconds: 0.35 });
            createExplosion(fx.x, fx.y, a.color, 10);
            audio.playSlam?.(P.area ? 0.6 : 0.45);
        }
        return true;
    }
    if (a.punchState === 2) {
        a.punchTimer -= dt;
        a.swing = 1;
        if (a.punchTimer <= 0) { a.punchState = 3; a.punchTimer = P.recoverySeconds; a.slamHit = false; }
        return true;
    }
    if (a.punchState === 3) {
        a.punchTimer -= dt;
        a.swing = Math.max(0, a.punchTimer / P.recoverySeconds);
        if (a.punchTimer <= 0) a.punchState = 0;
        return true;
    }
    a.swing = 0;
    a.punchCooldown = (a.punchCooldown ?? 0.6) - dt;
    if (!target || d > (P.area ? P.areaRadius * 0.6 : P.range) || a.punchCooldown > 0) return false;
    a.punchAngle = Math.atan2(target.y - a.y, target.x - a.x);
    a.punchState = 1;
    a.punchTimer = P.windupSeconds * 0.8;           // o aliado prepara um pouco mais rápido
    a.punchCooldown = P.cooldownSeconds * 0.7;
    return true;
}

// Investida: mira um instante e dispara atravessando; cada monstro no caminho leva um golpe. true = controla o movimento
function allyLunge(a, L, target, d, dt) {
    if (a.lungeState === 2) {
        a.x += a.lungeX * L.speed * dt;
        a.y += a.lungeY * L.speed * dt;
        for (const e of state.enemies) {
            if (a.lungeHits.has(e) || Math.hypot(e.x - a.x, e.y - a.y) > e.radius + a.radius) continue;
            a.lungeHits.add(e);
            dealDamage(e, a.damage * C.damageScale * 1.5, { noCrit: true, kbX: a.lungeX * 220, kbY: a.lungeY * 220 });
        }
        if ((a.lungeTimer -= dt) <= 0) { a.lungeState = 0; a.lungeTimer = L.cooldownSeconds * 0.8; }
        return true;
    }
    if (a.lungeState === 1) {
        if ((a.lungeTimer -= dt) <= 0) { a.lungeState = 2; a.lungeTimer = L.seconds; a.lungeHits = new Set(); audio.playDash?.(); }
        return true;
    }
    a.lungeTimer = (a.lungeTimer ?? 0.5) - dt;
    if (!target || a.lungeTimer > 0 || d > Math.min(L.triggerDistance, 260)) return false;
    const angle = Math.atan2(target.y - a.y, target.x - a.x);
    a.lungeState = 1;
    a.lungeTimer = L.aimSeconds;
    a.lungeX = Math.cos(angle);
    a.lungeY = Math.sin(angle);
    a.angle = a.facing = angle;
    return true;
}

// Inchado convertido: corre até o monstro e explode do lado do herói (morre no estouro)
function allyBurst(a, model) {
    const X = model.explosion;
    const radius = X.radius * (a.radius / model.radius);
    for (const e of state.enemies) {
        if (Math.hypot(e.x - a.x, e.y - a.y) > radius + e.radius) continue;
        const ang = Math.atan2(e.y - a.y, e.x - a.x);
        dealDamage(e, e.isBoss ? a.damage * 4 : e.maxHp * X.monsterDamageRatio, { noCrit: true, kbX: Math.cos(ang) * 320, kbY: Math.sin(ang) * 320 });
    }
    addShockwave(a.x, a.y, { radius, color: GOLD, width: 7, seconds: 0.35 });
    createExplosion(a.x, a.y, a.color, 20);
    audio.playBlast?.();
    a.hp = 0;
}

function fight(a, target, dt) {
    const model = MONSTER_MODELS[a.type] ?? {};
    const d = Math.hypot(target.x - a.x, target.y - a.y);
    const touch = a.radius + target.radius + 2;
    const face = Math.atan2(target.y - a.y, target.x - a.x);

    if (a.lungeState === 2 || a.lungeState === 1) return allyLunge(a, model.lunge, target, d, dt);
    if (a.punchState > 0) return allyPunch(a, model.punch, target, d, dt);
    a.angle = face;
    a.facing = lerpAngle(a.facing ?? face, face, Math.min(1, dt * 8));

    if (model.explosion) {
        if (d <= touch + 4) return allyBurst(a, model);
        return moveToward(a, target.x, target.y, touch, dt);
    }
    if (model.punch && allyPunch(a, model.punch, target, d, dt)) return;
    if (model.lunge && allyLunge(a, model.lunge, target, d, dt)) return;

    // Atirador (e o necromante, que atira uma alma no lugar de levantar mortos): fica a uma distância e atira
    const ranged = model.projectileSpeed || model.summon;
    if (ranged && !(model.punch && d <= model.punch.range)) {
        const range = model.shootRange ?? 300;
        const hold = Math.min(range * 0.8, model.keepDistance ?? range * 0.7);
        // Arqueiro: nos últimos aimSeconds PARA e puxa a corda (a.aim, 0 a 1); depois do tiro a corda vibra por releaseSeconds (a.release): a mesma animação do arqueiro inimigo
        const aiming = model.aimSeconds && d <= range && (a.shotTimer ?? 0.4) < model.aimSeconds;
        moveToward(a, target.x, target.y, aiming ? Infinity : hold, dt);        // puxando a corda: fica parado (olhando o alvo)
        const cooldown = (model.shootCooldownSeconds ?? 2.5) * 0.8;
        a.shotTimer = (a.shotTimer ?? 0.4) - dt;           // o primeiro tiro sai logo
        // Golem: a mão sobe nos últimos instantes antes da pedra
        if (model.throwWindup) a.throwArm = a.shotTimer < model.throwWindup ? 1 - Math.max(0, a.shotTimer) / model.throwWindup : 0;
        if (model.aimSeconds) a.aim = d <= range && a.shotTimer < model.aimSeconds ? 1 - Math.max(0, a.shotTimer) / model.aimSeconds : 0;
        if (d <= range && a.shotTimer <= 0) {
            a.shotTimer = cooldown;
            a.throwArm = 0;
            if (model.aimSeconds) { a.aim = 0; a.release = model.releaseSeconds; }
            allyShot(a, model, target);
        }
        return;
    }

    // Corpo a corpo: encosta e morde, com um tranco para a frente (o golpe aparece) e faíscas douradas
    moveToward(a, target.x, target.y, touch, dt);
    if (d <= touch + 3 && a.allyCd <= 0) {
        a.allyCd = C.hitSeconds;
        a.x += Math.cos(face) * 7;
        a.y += Math.sin(face) * 7;
        dealDamage(target, a.damage * C.damageScale, { noCrit: true, kbX: Math.cos(face) * 90, kbY: Math.sin(face) * 90 });
        createExplosion(a.x + Math.cos(face) * a.radius, a.y + Math.sin(face) * a.radius, GOLD, 4);
    }
}

// Ninguém fica em cima de ninguém: convertidos e monstros se empurram (o monstro que o provoca para encostado, não no meio dele)
function separate(a, others, allyOnly) {
    for (const b of others) {
        if (b === a || b.hp <= 0) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const min = a.radius + b.radius;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min) continue;
        const d = Math.sqrt(d2) || 1;
        const push = (min - d) / (allyOnly || b.isBoss || b.immovable ? 1 : 2);
        a.x += (dx / d) * push; a.y += (dy / d) * push;
        if (!allyOnly && !b.isBoss && !b.immovable) { b.x -= (dx / d) * push; b.y -= (dy / d) * push; }
    }
}

export function updateConversion(dt) {
    const S = state.conversion;
    for (let i = S.fx.length - 1; i >= 0; i--) if ((S.fx[i].age += dt) > FX_SECONDS) S.fx.splice(i, 1);
    const allies = state.converts;

    // Fora da caçada (acampamento, fim da onda): os convertidos esperam, sem se curar
    if (state.phase !== 'HUNT') {
        for (const a of allies) {
            a.punchState = 0; a.lungeState = 0; a.swing = 0; a.throwArm = 0;
        }
        return;
    }

    if (passives.conversion.lvl > 0) {
        S.timer -= dt;
        if (S.timer <= 0 && allies.length < C.maxAllies) S.timer = convertNearest() ? C.cooldownSeconds : 0.5;
    }

    // Esqueletos invocados (Summon Skeletons): cada um fica com um monstro DIFERENTE (o alvo é guardado em a.target até ele morrer); só quando não sobra nenhum livre eles dividem
    const claimed = new Set();
    for (const a of allies) if (a.summoned && a.target && a.target.hp > 0 && state.enemies.includes(a.target)) claimed.add(a.target);
    for (let i = allies.length - 1; i >= 0; i--) {
        const a = allies[i];
        if (a.hitFlash > 0) a.hitFlash -= dt;
        a.allyCd = Math.max(0, (a.allyCd ?? 0) - dt);
        if (a.release > 0) a.release -= dt;
        const target = a.hp > 0 ? (a.summoned ? stickyTarget(a, claimed) : nearestEnemy(a)) : null;
        if (target) fight(a, target, dt);
        else if (a.hp > 0) {
            a.punchState = 0; a.lungeState = 0; a.swing = 0; a.aim = 0;
            moveToward(a, player.x, player.y, C.followDistance, dt);
        }
        if (a.hp <= 0) {
            allies.splice(i, 1);
            state.conversion.fx.push({ x: a.x, y: a.y, age: 0, fade: true });
            continue;
        }
        if (a.lungeState !== 2) {
            separate(a, allies, true);
            separate(a, state.enemies, false);
        }
        a.x = Math.max(a.radius, Math.min(state.width - a.radius, a.x));
        a.y = Math.max(a.radius, Math.min(state.height - a.radius, a.y));
    }
}
