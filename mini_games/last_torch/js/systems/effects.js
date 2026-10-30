import { LEVEL_UP_VISUALS } from '../../data_model/visuals/effects/level_up_visual.js';
import { JUICE_VISUALS as J } from '../../data_model/visuals/effects/juice_visual.js';
import { save } from '../core/save.js';
import { player, state } from '../core/state.js';

// --- EFEITOS VISUAIS (Partículas, Screen Shake e sensação de impacto) ---
export function shakeScreen(intensity) {
    if (!save.settings.shake) return;
    state.shakeIntensity = Math.max(state.shakeIntensity, intensity);
}

const MAX_PARTICLES = 220;

// Registra de onde veio o golpe no herói (só para a animação de empurrão)
export function registerPlayerHit(fromX, fromY) {
    const dx = player.x - fromX;
    const dy = player.y - fromY;
    const len = Math.hypot(dx, dy) || 1;
    player.hitDirX = dx / len;
    player.hitDirY = dy / len;
    player.hitTime = performance.now();
}

export function createExplosion(x, y, color, count = 10) {
    // Limite de partículas vivas: evita acúmulo de memória em momentos caóticos
    if (state.lowQuality) count = Math.ceil(count / 2);
    count = Math.min(count, MAX_PARTICLES - state.particles.length);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 160;
        state.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.2 + Math.random() * 0.3,
            maxLife: 0.5,
            color,
            size: 2 + Math.random() * 3
        });
    }
}

// --- TEMPO ---
// Hit stop: congela a lógica por um instante para o golpe "pesar". Tem recarga: com ataque rápido
// virariam engasgos em vez de impacto.
let lastHitStop = -1;
export function hitStop(seconds) {
    if (state.runTime - lastHitStop < J.hitStopCooldownSeconds) return;
    lastHitStop = state.runTime;
    state.hitStop = Math.max(state.hitStop, seconds);
}

export function slowMotion(scale, seconds) {
    state.slowMoScale = scale;
    state.slowMoTimer = Math.max(state.slowMoTimer, seconds);
}

// Devolve o dt que a lógica deve usar neste quadro (0 durante o hit stop)
export function advanceTime(dt) {
    if (state.hitStop > 0) {
        state.hitStop -= dt;
        return 0;
    }
    if (state.slowMoTimer > 0) {
        state.slowMoTimer -= dt;
        return dt * state.slowMoScale;
    }
    return dt;
}

export function screenFlash(color, alpha) {
    state.flash.color = color;
    state.flash.alpha = Math.max(state.flash.alpha, alpha);
}

export function zoomPunch(amount) {
    state.zoomPunch = Math.max(state.zoomPunch, amount);
}

export function addShockwave(x, y, { radius = 60, color = '#ffffff', width = 4, seconds = 0.4 } = {}) {
    state.shockwaves.push({ x, y, radius, color, width, age: 0, seconds });
}

// Texto curto que sobe (ouro, cura, avisos em cima de quem recebeu)
export function addFloater(x, y, text, color = '#f1f5f9') {
    state.floaters.push({ x, y, text, color, age: 0, seconds: J.floater.seconds, rise: J.floater.rise, font: J.floater.font });
}

export function addDamageNumber(x, y, value, crit = false, color = null) {
    if (!save.settings.numbers) return;
    const N = J.number;
    const { floaters } = state;
    if (floaters.length >= N.maxActive) floaters.shift();
    floaters.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 6,
        text: `${Math.round(value)}`,
        color: color ?? (crit ? N.critColor : N.color),
        age: 0,
        seconds: N.seconds * (crit ? 1.25 : 1),
        rise: N.rise,
        font: crit ? N.critFont : N.font,
        pop: crit
    });
}

// Pedaços que voam na morte: cada um tem altura (z), quica uma vez e fica no chão até sumir
export function addGibs(type, x, y, scale = 1) {
    const bits = J.deathBits[type];
    if (!bits) return;
    const G = J.gibs;
    const count = Math.min(Math.round(bits.count * scale), G.maxActive - state.gibs.length);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = G.speedMin + Math.random() * (G.speedMax - G.speedMin);
        const life = G.lifeMin + Math.random() * (G.lifeMax - G.lifeMin);
        state.gibs.push({
            x, y,
            z: 6,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            vz: G.liftMin + Math.random() * (G.liftMax - G.liftMin),
            rotation: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 16,
            size: (2.2 + Math.random() * 3.4) * Math.min(1.6, 0.8 + scale * 0.2),
            color: bits.colors[Math.floor(Math.random() * bits.colors.length)],
            shape: bits.shape,
            life,
            maxLife: life
        });
    }
}

// Mancha no chão: um borrão principal e respingos em volta, nunca um oval limpo
export function addStain(type, x, y, radius) {
    const bits = J.deathBits[type];
    if (!bits) return;
    const { stains } = state;
    if (stains.length >= J.stains.maxActive) stains.shift();
    const blobs = [{ x: 0, y: 0, r: radius * 0.7 }];
    for (let i = 0; i < J.stains.splatters; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = radius * (0.5 + Math.random() * 0.8);
        blobs.push({ x: Math.cos(a) * d, y: Math.sin(a) * d * 0.6, r: radius * (0.1 + Math.random() * 0.22) });
    }
    stains.push({ x, y, blobs, color: bits.stain, life: J.stains.lifeSeconds });
}

// Efeitos que seguem no tempo real, mesmo durante o hit stop
export function updateRealTimeEffects(dt) {
    if (state.shakeIntensity > 0) state.shakeIntensity = Math.max(0, state.shakeIntensity - dt * 30);
    if (state.zoomPunch > 0) state.zoomPunch = Math.max(0, state.zoomPunch - state.zoomPunch * J.zoomPunchDecay * dt - dt * 0.002);
    if (state.flash.alpha > 0) state.flash.alpha = Math.max(0, state.flash.alpha - J.flashDecay * state.flash.alpha * dt - dt * 0.02);
}

function updateGibs(dt) {
    const G = J.gibs;
    for (let i = state.gibs.length - 1; i >= 0; i--) {
        const g = state.gibs[i];
        g.life -= dt;
        if (g.life <= 0) {
            state.gibs.splice(i, 1);
            continue;
        }
        if (g.z > 0 || g.vz > 0) {
            g.x += g.vx * dt;
            g.y += g.vy * dt;
            g.z += g.vz * dt;
            g.vz -= G.gravity * dt;
            g.rotation += g.spin * dt;
            if (g.z <= 0) {
                g.z = 0;
                g.vz = -g.vz * G.bounce;
                g.vx *= 0.5;
                g.vy *= 0.5;
                g.spin *= 0.4;
                if (g.vz < 26) g.vz = 0;
            }
        }
    }
}

function updateList(list, dt) {
    for (let i = list.length - 1; i >= 0; i--) {
        list[i].age += dt;
        if (list[i].age >= list[i].seconds) list.splice(i, 1);
    }
}

export function updateEffects(dt) {
    // Blade Slashes animación
    for (let i = state.bladeSlashes.length - 1; i >= 0; i--) {
        const s = state.bladeSlashes[i];
        s.life -= dt;
        if (s.life <= 0) state.bladeSlashes.splice(i, 1);
    }

    // Animação de level up
    if (state.levelUpFx) {
        state.levelUpFx.age += dt;
        if (state.levelUpFx.age >= LEVEL_UP_VISUALS.durationSeconds) state.levelUpFx = null;
    }

    // Partículas
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) state.particles.splice(i, 1);
    }

    updateGibs(dt);
    updateList(state.shockwaves, dt);
    updateList(state.floaters, dt);
    updateList(state.dashGhosts, dt);

    for (let i = state.stains.length - 1; i >= 0; i--) {
        state.stains[i].life -= dt;
        if (state.stains[i].life <= 0) state.stains.splice(i, 1);
    }
}
