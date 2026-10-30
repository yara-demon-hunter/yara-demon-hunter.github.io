import { getPowerLevel } from '../../data_model/powers.js';
import { POWERS_VISUALS as V } from '../../data_model/visuals/effects/powers_visual.js';
import { ctx, player, powers, state } from '../core/state.js';
import { drawGlow } from './fx/glow.js';
import { getDashedRing } from './fx/rings.js';
import { DAGGER_LENGTH, DAGGER_WIDTH, getDaggerSprite } from './fx/sprites.js';
import { resetWorldView, stamp } from './fx/stamp.js';

// --- PODERES (desenho procedural) ---
const TAU = Math.PI * 2;

export function renderGroundFires() {
    const t = performance.now() / 1000;
    const F = V.fire;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    state.groundFires.forEach((f, i) => {
        const k = Math.min(1, f.life / (f.maxLife * 0.35));
        const r = f.radius * (0.55 + 0.45 * k);
        const colors = f.hostile ? F.hostileColors : f.evolved ? F.evolvedColors : F.colors;
        drawGlow(ctx, f.hostile ? F.hostileGlow : F.glow, f.x, f.y, r * 1.5, 0.28 * k);
        for (let n = 0; n < F.tongues; n++) {
            const a = t * (2.2 + n) + i * 1.9 + n * 2.1;
            const wobble = 0.7 + 0.3 * Math.sin(t * 11 + i + n * 2);
            const up = (t * 1.4 + n * 0.33 + i * 0.17) % 1;
            drawGlow(ctx, colors[n % colors.length],
                f.x + Math.cos(a) * r * 0.3,
                f.y + Math.sin(a) * r * 0.18 - up * r * 0.9,
                r * 0.62 * wobble * (1 - up * 0.5), 0.62 * k * (1 - up));
        }
    });
    ctx.restore();
}

// Lâminas orbitando: a mesma adaga do arremesso, girando em volta do herói
export function renderOrbitBlades() {
    const level = getPowerLevel(powers.orbitBlades);
    if (!level) return;
    const O = V.orbit;
    const glow = powers.orbitBlades.evolved ? O.evolvedGlow : O.glow;
    const dagger = getDaggerSprite();
    const width = DAGGER_LENGTH * O.scale;
    const height = DAGGER_WIDTH * O.scale;
    for (let i = 0; i < level.count; i++) {
        const a = state.orbitAngle + (i / level.count) * TAU;
        const x = player.x + Math.cos(a) * level.radius;
        const y = player.y + Math.sin(a) * level.radius;
        drawGlow(ctx, glow, x, y, O.glowRadius, 0.5);
        stamp(dagger, 0, 0, dagger.width, dagger.height, x, y, a + Math.PI / 2, width, height);
        resetWorldView();
    }
}

export function renderChillAura() {
    const level = getPowerLevel(powers.chillAura);
    if (!level) return;
    const C = V.chill;
    const t = performance.now() / 1000;
    ctx.fillStyle = C.fill;
    ctx.beginPath();
    ctx.arc(player.x, player.y, level.radius, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = C.ring;
    ctx.lineWidth = 1.5;
    ctx.translate(player.x, player.y);
    ctx.stroke(getDashedRing(level.radius, 6));
    ctx.translate(-player.x, -player.y);
    ctx.fillStyle = C.flake;
    ctx.globalAlpha = 0.65;
    for (let i = 0; i < C.flakes; i++) {
        const a = (i / C.flakes) * TAU + t * 0.5;
        const r = level.radius * (0.45 + 0.5 * Math.abs(Math.sin(t * 0.7 + i * 1.3)));
        ctx.fillRect(player.x + Math.cos(a) * r - 1, player.y + Math.sin(a) * r - 1, 2, 2);
    }
    ctx.globalAlpha = 1;
}

export function renderLightning() {
    const L = V.lightning;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    state.lightning.forEach(bolt => {
        ctx.globalAlpha = Math.min(1, (bolt.life / bolt.maxLife) * 1.6);
        ctx.beginPath();
        bolt.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.strokeStyle = L.glow;
        ctx.lineWidth = L.glowWidth;
        ctx.stroke();
        ctx.strokeStyle = L.color;
        ctx.lineWidth = L.width;
        ctx.stroke();
        ctx.strokeStyle = L.core;
        ctx.lineWidth = L.coreWidth;
        ctx.stroke();
    });
    ctx.restore();
}

export function renderBolts() {
    const B = V.bolt;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    state.bolts.forEach(b => {
        const speed = Math.hypot(b.vx, b.vy) || 1;
        const bx = -b.vx / speed;
        const by = -b.vy / speed;
        ctx.fillStyle = B.mid;
        for (let i = 1; i <= B.trail; i++) {
            ctx.globalAlpha = 0.7 * (1 - i / (B.trail + 1));
            ctx.beginPath();
            ctx.arc(b.x + bx * i * B.trailGap, b.y + by * i * B.trailGap, B.radius * (1 - i / (B.trail + 2)), 0, TAU);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        drawGlow(ctx, B.glow, b.x, b.y, B.radius * 3, 0.8);
        ctx.fillStyle = B.core;
        ctx.beginPath();
        ctx.arc(b.x, b.y, B.radius * 0.7, 0, TAU);
        ctx.fill();
    });
    ctx.restore();
}

export function renderStars() {
    const S = V.star;
    ctx.save();
    ctx.lineCap = 'round';
    state.stars.forEach(s => {
        if (s.age < 0) return;
        const p = Math.min(1, s.age / s.seconds);
        // Marca no chão
        ctx.globalAlpha = 0.25 + p * 0.5;
        ctx.strokeStyle = S.ring;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, TAU);
        ctx.stroke();
        // Estrela caindo
        const y = s.y - S.height * (1 - p * p);
        ctx.globalAlpha = 1;
        drawGlow(ctx, S.glow, s.x, y, 16, 0.9);
        ctx.strokeStyle = S.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(s.x, y);
        ctx.lineTo(s.x, y - S.tail * (0.4 + p));
        ctx.stroke();
    });
    ctx.restore();
}

// Rastro do dash: silhuetas de sombra pelo caminho
export function renderDashGhosts() {
    const G = V.dashGhost;
    ctx.save();
    state.dashGhosts.forEach(g => {
        const k = 1 - g.age / g.seconds;
        ctx.globalAlpha = k * 0.75;
        ctx.fillStyle = G.color;
        ctx.beginPath();
        ctx.ellipse(g.x, g.y - 14, G.radius * 0.8, G.radius * 1.5, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = G.core;
        ctx.beginPath();
        ctx.arc(g.x, g.y - 30, G.radius * 0.5, 0, TAU);
        ctx.fill();
    });
    ctx.restore();
}
