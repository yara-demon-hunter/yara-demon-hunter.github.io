import { audio, player, state } from '../core/state.js';
import { showBanner } from '../ui/banner.js';
import { addShockwave, createExplosion, hitStop, screenFlash, shakeScreen } from './effects.js';
import { hurtPlayer } from './player.js';
import { addMonster } from './spawner.js';

// --- ATAQUES DOS BOSSES ---
// Cada boss repete em ciclo a lista model.patterns. Entre um ataque e outro, e.shootTimer conta a
// pausa (é também o que a arte usa para carregar o golpe na mão).
const TAU = Math.PI * 2;

function fireShot(e, model, angle, speedScale = 1) {
    state.enemyProjectiles.push({
        owner: e.type,
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
export function addSlam(x, y, radius, delay, damage, color = null) {
    state.telegraphs.push({ kind: 'circle', x, y, radius, age: 0, seconds: delay, damage, color });
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
                e.damage * model.slamDamageMultiplier
            );
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
    // Some numa nuvem e reaparece longe do herói
    blink(e, model) {
        createExplosion(e.x, e.y, model.color, 26);
        const a = Math.random() * TAU;
        const d = 240 + Math.random() * 160;
        e.x = Math.max(70, Math.min(state.width - 70, player.x + Math.cos(a) * d));
        e.y = Math.max(90, Math.min(state.height - 70, player.y + Math.sin(a) * d));
        createExplosion(e.x, e.y, model.color, 26);
        addShockwave(e.x, e.y, { radius: 110, color: model.color, width: 5, seconds: 0.35 });
        audio.playDash();
    }
};

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
        } else if (t.kind === 'grave') {
            if (state.phase === 'HUNT') addMonster(t.monsterType, t.x, t.y);
            createExplosion(t.x, t.y, '#a8a29e', 10);
        }
    }
}
