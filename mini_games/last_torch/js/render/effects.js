import { CHARACTER_MODEL } from '../../data_model/character.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { JUICE_VISUALS as J } from '../../data_model/visuals/effects/juice_visual.js';
import { ctx, player, state } from '../core/state.js';
import { mod } from '../systems/modifiers.js';
import { easeOutBack, easeOutCubic } from './fx/easing.js';

// --- EFEITOS: manchas, pedaços, ondas de choque, avisos no chão, números, clarão ---
const TAU = Math.PI * 2;

// Manchas de batalha, sob tudo que anda
export function renderStains() {
    const fade = J.stains.fadeSeconds;
    ctx.save();
    state.stains.forEach(s => {
        ctx.globalAlpha = Math.min(1, s.life / fade);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        s.blobs.forEach(b => {
            ctx.moveTo(s.x + b.x + b.r, s.y + b.y);
            ctx.arc(s.x + b.x, s.y + b.y, b.r, 0, TAU);
        });
        ctx.fill();
    });
    ctx.restore();
}

// Calor da tocha: anel fraco no chão, só visível quando o herói precisa de cura
export function renderWarmth() {
    if (player.hp >= player.maxHp) return;
    const reach = CHARACTER_MODEL.warmthRadius * (1 + mod('warmth'));
    ctx.save();
    ctx.fillStyle = J.warmth.color;
    ctx.beginPath();
    ctx.arc(state.coreX, state.coreY, reach, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = J.warmth.ringColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 9]);
    ctx.stroke();
    ctx.restore();
}

// Tocha ferida: anel pulsando em volta, para o jogador achar o perigo sem olhar a barra
export function renderTorchAlarm() {
    if (state.coreHp <= 0 || state.coreHp >= state.coreHpMax * CORE_MODEL.lowHpRatio) return;
    const t = performance.now() / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(t * J.torchAlarm.pulseHz * TAU);
    ctx.save();
    ctx.strokeStyle = J.torchAlarm.color;
    ctx.globalAlpha = 0.3 + pulse * 0.6;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(state.coreX, state.coreY, CORE_MODEL.pulseRadius + 16 + pulse * 10, 0, TAU);
    ctx.stroke();
    ctx.restore();
}

function drawGib(g) {
    const s = g.size;
    if (g.shape === 'bone') {
        ctx.fillRect(-s * 1.2, -s * 0.34, s * 2.4, s * 0.68);
        ctx.fillRect(-s * 1.4, -s * 0.6, s * 0.6, s * 1.2);
        ctx.fillRect(s * 0.8, -s * 0.6, s * 0.6, s * 1.2);
    } else if (g.shape === 'blob') {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.8, 0, TAU);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.moveTo(s, 0);
        ctx.lineTo(-s * 0.6, s * 0.7);
        ctx.lineTo(-s * 0.3, -s * 0.8);
        ctx.closePath();
        ctx.fill();
    }
}

export function renderGibs() {
    ctx.save();
    state.gibs.forEach(g => {
        ctx.globalAlpha = Math.min(1, (g.life / g.maxLife) * 2.5);
        ctx.fillStyle = g.color;
        ctx.save();
        ctx.translate(g.x, g.y - g.z);
        ctx.rotate(g.rotation);
        drawGib(g);
        ctx.restore();
    });
    ctx.restore();
}

export function renderShockwaves() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    state.shockwaves.forEach(w => {
        const p = w.age / w.seconds;
        const ease = easeOutCubic(p);
        ctx.globalAlpha = (1 - p) * 0.9;
        ctx.strokeStyle = w.color;
        ctx.lineWidth = Math.max(0.5, w.width * (1 - p));
        ctx.beginPath();
        ctx.arc(w.x, w.y, Math.max(1, w.radius * ease), 0, TAU);
        ctx.stroke();
    });
    ctx.restore();
}

// Avisos no chão: círculos que enchem até estourar, linhas de mira e covas
export function renderTelegraphs() {
    const T = J.telegraph;
    ctx.save();
    state.telegraphs.forEach(t => {
        if (t.age < 0) return;
        const p = Math.min(1, t.age / t.seconds);
        if (t.kind === 'line') {
            if (t.owner.hp <= 0) return;
            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.rotate(t.angle);
            ctx.fillStyle = T.lineGlow;
            ctx.fillRect(0, -7, t.length, 14);
            ctx.fillStyle = T.lineCore;
            ctx.globalAlpha = 0.35 + p * 0.65;
            ctx.fillRect(0, -1 - p, t.length * easeOutCubic(p), 2 + p * 2);
            ctx.restore();
            return;
        }
        if (t.kind === 'grave') {
            ctx.globalAlpha = Math.min(1, p * 2);
            ctx.fillStyle = 'rgba(28, 25, 23, 0.8)';
            ctx.beginPath();
            ctx.ellipse(t.x, t.y, t.radius * easeOutBack(p), t.radius * 0.6 * easeOutBack(p), 0, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = 'rgba(168, 162, 158, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
            return;
        }
        ctx.fillStyle = T.fill;
        ctx.strokeStyle = T.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius * easeOutCubic(p), 0, TAU);
        ctx.fill();
    });
    ctx.restore();
}

export function renderFloaters() {
    const N = J.number;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = N.outline;
    ctx.lineWidth = N.outlineWidth;
    state.floaters.forEach(f => {
        const p = f.age / f.seconds;
        const y = f.y - f.rise * easeOutCubic(p);
        ctx.globalAlpha = p < 0.7 ? 1 : (1 - p) / 0.3;
        ctx.font = f.font;
        ctx.fillStyle = f.color;

        // Crítico: nasce grande e encolhe
        const popP = f.pop ? Math.min(1, f.age / N.popSeconds) : 1;
        const scale = 1 + (N.popScale - 1) * (1 - popP);
        if (scale !== 1) {
            ctx.save();
            ctx.translate(f.x, y);
            ctx.scale(scale, scale);
            ctx.strokeText(f.text, 0, 0);
            ctx.fillText(f.text, 0, 0);
            ctx.restore();
            return;
        }
        ctx.strokeText(f.text, f.x, y);
        ctx.fillText(f.text, f.x, y);
    });
    ctx.restore();
}

// Fim da hora: a onda de fogo saindo da tocha
export function renderClearWave() {
    if (state.phase !== 'CLEAR' && state.phase !== 'DAWN') return;
    const W = J.clearWave;
    const r = state.clearWaveRadius;
    if (r <= 0 || r > Math.hypot(state.width, state.height)) return;

    const inner = Math.max(1, r - W.width * 2);
    const grad = ctx.createRadialGradient(state.coreX, state.coreY, inner, state.coreX, state.coreY, r);
    grad.addColorStop(0, `rgba(${W.color}, 0)`);
    grad.addColorStop(0.75, `rgba(${W.color}, 0.5)`);
    grad.addColorStop(0.93, `rgba(${W.coreColor}, 0.9)`);
    grad.addColorStop(1, `rgba(${W.color}, 0)`);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.restore();
}

// Amanhecer: a luz entra de um canto, em raios, e a noite vira dourado
export function renderDawn() {
    if (state.dawn <= 0) return;
    const D = J.dawn;
    const a = easeOutCubic(state.dawn);
    const { width: w, height: h } = state;
    const t = performance.now() / 1000;
    const sunX = w * D.sunX;
    const sunY = h * D.sunY;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const sky = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.hypot(w, h));
    sky.addColorStop(0, `rgba(${D.sunColor}, ${a * 0.75})`);
    sky.addColorStop(0.35, `rgba(${D.skyColor}, ${a * 0.34})`);
    sky.addColorStop(1, `rgba(${D.horizonColor}, ${a * 0.1})`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Raios de sol, abrindo devagar
    const length = Math.hypot(w, h);
    D.rays.forEach((ray, i) => {
        const angle = ray.angle + Math.sin(t * 0.25 + i) * 0.03;
        const half = ray.width * (0.6 + 0.4 * a);
        const grad = ctx.createLinearGradient(sunX, sunY, sunX + Math.cos(angle) * length, sunY + Math.sin(angle) * length);
        grad.addColorStop(0, `rgba(${D.sunColor}, ${a * ray.alpha})`);
        grad.addColorStop(1, `rgba(${D.sunColor}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(sunX + Math.cos(angle - half) * length, sunY + Math.sin(angle - half) * length);
        ctx.lineTo(sunX + Math.cos(angle + half) * length, sunY + Math.sin(angle + half) * length);
        ctx.closePath();
        ctx.fill();
    });
    ctx.restore();
}

export function renderScreenFlash() {
    const { flash } = state;
    if (flash.alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, flash.alpha);
    ctx.fillStyle = flash.color;
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.restore();
}
