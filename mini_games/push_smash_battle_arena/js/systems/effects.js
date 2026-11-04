import { FX } from '../../data_model/visuals/sprites.js';
import { state } from '../core/state.js';

export function createParticles(x, y, color, count = 12, power = 10) {
    for (let i = 0; i < count; i++) {
        state.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * power,
            vy: (Math.random() - 0.5) * power,
            radius: Math.random() * 4 + 2,
            color: color,
            kind: 'glow',
            life: 1.0
        });
    }
}

// Poeira em nuvenzinhas que sobem e somem (pulo, pouso, smash no chão)
export function createDust(x, y, count = 6, spread = 3) {
    for (let i = 0; i < count; i++) {
        state.particles.push({
            x: x + (Math.random() - 0.5) * spread * 4,
            y,
            vx: (Math.random() - 0.5) * spread,
            vy: -Math.random() * 1.2,
            radius: 5 + Math.random() * 5,
            color: '#ffffff',
            kind: 'dust',
            life: 1.0
        });
    }
}

// Foguete do SKY DROP: chamas descendo e fumaça por baixo de quem sobe
export function rocketTrail(x, y) {
    const R = FX.rocket;
    for (let i = 0; i < R.flamesPerFrame; i++) {
        state.particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y,
            vx: (Math.random() - 0.5) * 2.5,
            vy: R.flameSpeed * (0.6 + Math.random() * 0.6),
            radius: 3 + Math.random() * 4,
            color: R.flames[Math.floor(Math.random() * R.flames.length)],
            kind: 'glow',
            life: 0.8
        });
    }
    for (let i = 0; i < R.smokePerFrame; i++) {
        state.particles.push({
            x: x + (Math.random() - 0.5) * 14,
            y: y + 6,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 1 + Math.random() * 1.5,
            radius: 6 + Math.random() * 6,
            color: '#ffffff',
            kind: 'dust',
            life: 0.9
        });
    }
}

// Estrela de impacto: aparece grande, gira e some
export function addBurst(x, y, size, color = '#ffd32a') {
    state.bursts.push({ x, y, size, color, life: FX.star.life, rot: Math.random() * Math.PI });
}

// Onda de choque que se expande
export function addRing(x, y, maxRadius, color = '#ffffff') {
    state.rings.push({ x, y, maxRadius, color, life: FX.ring.life });
}

export function addPopup(x, y, text, color = '#ffffff') {
    state.popups.push({ x, y, text, color, life: 60 });
}


export const comboBanner = document.getElementById('comboBanner');
export let bannerTimeout = null;
export function showBanner(text, color = '#ffd32a', ms = 900, big = false) {
    comboBanner.innerText = text;
    comboBanner.style.color = color;
    comboBanner.classList.toggle('big', big);
    comboBanner.classList.add('combo-active');
    clearTimeout(bannerTimeout);
    bannerTimeout = setTimeout(() => comboBanner.classList.remove('combo-active'), ms);
}

export function updateEffects() {
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.bursts.length - 1; i >= 0; i--) {
        const b = state.bursts[i];
        b.rot += FX.star.spin;
        if (--b.life <= 0) state.bursts.splice(i, 1);
    }
    for (let i = state.rings.length - 1; i >= 0; i--) {
        if (--state.rings[i].life <= 0) state.rings.splice(i, 1);
    }
    for (let i = state.popups.length - 1; i >= 0; i--) {
        state.popups[i].y -= 0.8;
        if (--state.popups[i].life <= 0) state.popups.splice(i, 1);
    }
}


