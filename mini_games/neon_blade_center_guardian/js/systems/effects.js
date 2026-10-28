import { state } from '../core/state.js';

// --- EFEITOS VISUAIS (Partículas e Screen Shake) ---
export function shakeScreen(intensity) {
    state.shakeIntensity = Math.max(state.shakeIntensity, intensity);
}

export function createExplosion(x, y, color, count = 10) {
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

export function updateEffects(dt) {
    if (state.shakeIntensity > 0) state.shakeIntensity -= dt * 30;

    // Blade Slashes animación
    for (let i = state.bladeSlashes.length - 1; i >= 0; i--) {
        const s = state.bladeSlashes[i];
        s.life -= dt;
        if (s.life <= 0) state.bladeSlashes.splice(i, 1);
    }

    // Partículas
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) state.particles.splice(i, 1);
    }
}
