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
            life: 1.0
        });
    }
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
    for (let i = state.popups.length - 1; i >= 0; i--) {
        state.popups[i].y -= 0.8;
        if (--state.popups[i].life <= 0) state.popups.splice(i, 1);
    }
}


