import { getPowerLevel, POWER_MODELS } from '../../data_model/powers.js';
import { WAR_CRY } from '../../data_model/passives.js';
import { SKILLS_VISUALS as V } from '../../data_model/visuals/effects/skills_visual.js';
import { ctx, player, powers, state } from '../core/state.js';
import { easeOutBack, easeOutCubic } from './fx/easing.js';
import { drawGlow } from './fx/glow.js';
import { getDashedRing } from './fx/rings.js';

// --- SKILLS DOS RAMOS (desenho) ---
// Efeitos de js/systems/skills_*.js. Quem tem muitos por quadro usa brilhos em cache e anéis prontos.
const TAU = Math.PI * 2;

// --- NO CHÃO ---
export function renderCracks() {
    const C = V.crack;
    if (state.cracks.length === 0) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const c of state.cracks) {
        const k = Math.min(1, c.life / (c.maxLife * 0.4));
        ctx.globalAlpha = k;
        ctx.strokeStyle = C.color;
        ctx.lineWidth = C.width;
        ctx.beginPath();
        for (const ray of c.rays) {
            ctx.moveTo(c.x, c.y);
            for (const p of ray) ctx.lineTo(c.x + p.x, c.y + p.y);
        }
        ctx.stroke();
        if (c.molten) {
            ctx.strokeStyle = C.molten;
            ctx.lineWidth = C.width * 0.7;
            ctx.stroke();
            ctx.strokeStyle = C.moltenCore;
            ctx.lineWidth = C.width * 0.25;
            ctx.stroke();
        } else {
            ctx.strokeStyle = C.edge;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    ctx.globalAlpha = 1;
}

export function renderFireRing() {
    const level = getPowerLevel(powers.fireRing);
    if (!level) return;
    const F = V.fireRing;
    const evolved = powers.fireRing.evolved;
    const colors = evolved ? F.evolvedColors : F.colors;
    const count = F.tongues[state.quality];
    const t = performance.now() / 1000;
    const r = level.radius;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = F.line;
    ctx.lineWidth = POWER_MODELS.fireRing.width * 0.5;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(state.coreX, state.coreY, r, 0, TAU);
    ctx.stroke();
    for (let i = 0; i < count; i++) {
        const a = (i / count) * TAU + t * 0.12;
        const wobble = 0.7 + 0.3 * Math.sin(t * 9 + i * 2.3);
        const up = (t * 1.2 + i * 0.37) % 1;
        const x = state.coreX + Math.cos(a) * r;
        const y = state.coreY + Math.sin(a) * r;
        drawGlow(ctx, evolved ? F.evolvedGlow : F.glow, x, y, 22, 0.4);
        drawGlow(ctx, colors[i % colors.length], x, y - up * 18, 15 * wobble * (1 - up * 0.5), 0.75 * (1 - up));
    }
    ctx.restore();
}

export function renderRifts() {
    const R = V.rift;
    if (state.rifts.length === 0) return;
    const t = performance.now() / 1000;
    for (const r of state.rifts) {
        const open = Math.min(1, r.age / 0.2);
        const closing = Math.max(0, (r.age - (r.seconds - 0.16)) / 0.16);
        const size = r.radius * easeOutBack(open) * (1 - closing * 0.75);
        const rim = r.evolved ? R.evolvedRim : R.rim;
        const light = r.evolved ? R.evolvedLight : R.rimLight;

        ctx.save();
        drawGlow(ctx, R.glow, r.x, r.y, size * 1.5, 0.55);
        drawGlow(ctx, R.core, r.x, r.y, size * 0.95, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';

        // Braços da espiral girando para dentro
        ctx.translate(r.x, r.y);
        ctx.rotate(t * 4.2);
        ctx.strokeStyle = rim;
        ctx.lineWidth = 3;
        for (let s = 0; s < R.spirals; s++) {
            ctx.rotate(TAU / R.spirals);
            ctx.beginPath();
            for (let i = 0; i <= 8; i++) {
                const k = i / 8;
                const a = k * 2.6;
                const d = size * (0.15 + k * 0.78);
                if (i === 0) ctx.moveTo(Math.cos(a) * d, Math.sin(a) * d);
                else ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d);
            }
            ctx.stroke();
        }
        ctx.rotate(-t * 4.2);

        ctx.strokeStyle = light;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.96, 0, TAU);
        ctx.stroke();

        // Poeira sendo sugada
        ctx.fillStyle = light;
        for (let i = 0; i < R.motes; i++) {
            const phase = (t * 1.4 + i / R.motes) % 1;
            const a = i * 2.399 + phase * 3.4;
            const d = size * 1.7 * (1 - phase);
            ctx.globalAlpha = phase;
            ctx.fillRect(Math.cos(a) * d - 1.2, Math.sin(a) * d - 1.2, 2.4, 2.4);
        }
        ctx.restore();
    }
}

// Embaixo do herói: fome e rugido acesos
export function renderSkillAuras() {
    const level = getPowerLevel(powers.bloodlust);
    const stacks = level ? state.bloodlust.stacks : 0;
    if (stacks > 0) {
        const B = V.bloodlust;
        const k = stacks / level.stacks;
        drawGlow(ctx, B.aura, player.x, player.y, 24 + k * 22, 0.25 + k * 0.45);
        ctx.strokeStyle = B.arc;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(player.x, player.y, B.arcRadius, Math.PI / 2 - k * Math.PI, Math.PI / 2 + k * Math.PI);
        ctx.stroke();
    }
    if (state.warCryTimer > 0) {
        const W = V.warCry;
        const k = Math.min(1, state.warCryTimer / WAR_CRY.bonusSeconds);
        drawGlow(ctx, W.aura, player.x, player.y, W.radius + Math.sin(performance.now() / 70) * 3, 0.3 + k * 0.4);
    }
}

// --- SOBRE OS MONSTROS ---
export function renderSmokes() {
    const S = V.smoke;
    if (state.smokes.length === 0) return;
    const t = performance.now() / 1000;
    for (const s of state.smokes) {
        const p = s.age / s.seconds;
        const fade = Math.min(1, s.age / 0.15) * (1 - p * p);
        for (let i = 0; i < S.puffs; i++) {
            const a = (i / S.puffs) * TAU + s.seed + t * 0.25;
            const d = s.radius * (0.2 + 0.55 * ((i * 0.37) % 1)) * (0.7 + p * 0.5);
            const size = s.radius * (0.55 + 0.22 * Math.sin(t * 1.4 + i)) * (0.8 + p * 0.5);
            drawGlow(ctx, i % 2 ? S.color : S.dark, s.x + Math.cos(a) * d, s.y + Math.sin(a) * d * 0.8, size, fade);
        }
    }
}

// Marca, maldição e tontura em cima de cada monstro
export function renderMonsterCurses() {
    const t = performance.now() / 1000;
    const M = V.mark;
    const H = V.hex;
    const S = V.stun;
    for (const e of state.enemies) {
        if (e.hexTimer > 0) {
            drawGlow(ctx, H.glow, e.x, e.y, e.radius * 1.7, 0.45 + 0.2 * Math.sin(t * 8 + e.x));
            ctx.fillStyle = H.spark;
            for (let i = 0; i < 3; i++) {
                const up = (t * 1.1 + i * 0.33 + e.y * 0.01) % 1;
                ctx.globalAlpha = 1 - up;
                ctx.fillRect(e.x + Math.sin(i * 2.1 + t * 3) * e.radius * 0.7 - 1, e.y - up * e.radius * 1.9, 2, 2);
            }
            ctx.globalAlpha = 1;
        }
        if (e.marked > 0) {
            const r = e.radius + M.gap;
            const a = t * 2.4;
            drawGlow(ctx, M.glow, e.x, e.y, r * 1.3, 0.6);
            ctx.strokeStyle = M.color;
            ctx.lineWidth = 2;
            ctx.translate(e.x, e.y);
            ctx.rotate(a);
            ctx.stroke(getDashedRing(r, 5));
            ctx.fillStyle = M.core;
            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.beginPath();
                ctx.moveTo(r + 7, 0);
                ctx.lineTo(r + 1, -3);
                ctx.lineTo(r + 1, 3);
                ctx.closePath();
                ctx.fill();
            }
            ctx.rotate(-a - Math.PI * 2);
            ctx.translate(-e.x, -e.y);
        }
        if (e.stunned > 0) {
            ctx.fillStyle = S.color;
            for (let i = 0; i < S.dots; i++) {
                const a = t * 7 + (i / S.dots) * TAU;
                ctx.fillRect(e.x + Math.cos(a) * S.orbit - 1.5, e.y - e.radius - 6 + Math.sin(a) * 3 - 1.5, 3, 3);
            }
        }
    }
}

// --- NO AR ---
export function renderCrescents() {
    const C = V.crescent;
    if (state.crescents.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const w of state.crescents) {
        const r = C.radius * Math.min(1, 0.5 + w.age * 7);
        drawGlow(ctx, C.glow, w.x + Math.cos(w.angle) * r * 0.5, w.y + Math.sin(w.angle) * r * 0.5, r * 0.95, 0.3);
        ctx.translate(w.x, w.y);
        ctx.rotate(w.angle);
        ctx.fillStyle = C.color;
        ctx.beginPath();
        ctx.arc(-r * 0.3, 0, r, -1.15, 1.15);
        ctx.arc(-r * 0.95, 0, r * 1.35, 0.8, -0.8, true);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = C.core;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-r * 0.3, 0, r, -1, 1);
        ctx.stroke();
        ctx.rotate(-w.angle);
        ctx.translate(-w.x, -w.y);
    }
    ctx.restore();
}

function crossSlash(x, y, angle, length, width, color, core) {
    ctx.translate(x, y);
    ctx.rotate(angle);
    for (let i = 0; i < 2; i++) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-length, 0);
        ctx.lineTo(0, -width);
        ctx.lineTo(length, 0);
        ctx.lineTo(0, width);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = core;
        ctx.fillRect(-length * 0.7, -width * 0.16, length * 1.4, width * 0.32);
        ctx.rotate(Math.PI / 2);
    }
    ctx.rotate(-Math.PI - angle);
    ctx.translate(-x, -y);
}

// Golpe de misericórdia (Executioner) e marca detonada (Death Mark): um X que estala no monstro
export function renderSkillHits() {
    if (state.executions.length === 0 && state.markBursts.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const E = V.execution;
    for (const h of state.executions) {
        const p = h.age / h.seconds;
        const k = easeOutCubic(Math.min(1, p * 2.4));
        ctx.globalAlpha = 1 - p * p;
        drawGlow(ctx, E.glow, h.x, h.y, (E.length + h.radius) * 1.2, (1 - p) * 0.8);
        ctx.globalAlpha = 1 - p * p;
        crossSlash(h.x, h.y, h.angle, (E.length + h.radius) * k, 6 * (1 - p) + 1, E.color, E.core);
    }
    const B = V.markBurst;
    for (const h of state.markBursts) {
        const p = h.age / h.seconds;
        const k = easeOutCubic(Math.min(1, p * 2.4));
        const length = (B.length + h.radius) * (h.big ? 1.5 : 1) * k;
        ctx.globalAlpha = 1 - p;
        crossSlash(h.x, h.y, Math.PI / 4, length, 4 * (1 - p) + 1, B.color, B.core);
    }
    ctx.restore();
}

// Caveira em chamas que acompanha o herói (Grave Wisp)
export function renderWisp() {
    if (powers.graveWisp.lvl <= 0 || !state.wisp.placed) return;
    const W = V.wisp;
    const { x, y, flash } = state.wisp;
    const t = performance.now() / 1000;
    const fire = flash > 0 ? 1.5 : 1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, W.flame, x, y - 4, 15 * fire, 0.75);
    for (let i = 0; i < 3; i++) {
        const up = (t * 1.9 + i / 3) % 1;
        drawGlow(ctx, W.flameCore, x + Math.sin(t * 7 + i * 2) * 3, y - 6 - up * 12, 6 * (1 - up) + 1, 0.9 * (1 - up));
    }
    ctx.restore();
    ctx.fillStyle = W.bone;
    ctx.beginPath();
    ctx.arc(x, y - 1, 5.6, 0, TAU);
    ctx.fill();
    ctx.fillRect(x - 3, y + 2.5, 6, 3.2);
    ctx.fillStyle = W.boneShade;
    ctx.fillRect(x - 1.6, y + 4, 0.8, 1.7);
    ctx.fillRect(x + 0.8, y + 4, 0.8, 1.7);
    ctx.fillStyle = W.eye;
    ctx.beginPath();
    ctx.arc(x - 2.1, y - 1, 1.4, 0, TAU);
    ctx.arc(x + 2.1, y - 1, 1.4, 0, TAU);
    ctx.fill();
}

// Escudo do Vigil: uma redoma com a base em chamas
export function renderShield() {
    if (player.shield <= 0) return;
    const S = V.shield;
    const t = performance.now() / 1000;
    const x = player.x;
    const y = player.y - 12;
    const r = S.radius + Math.sin(t * 3) * 1.2;
    ctx.save();
    drawGlow(ctx, S.glow, x, y, r * 1.5, 0.45);
    ctx.fillStyle = S.fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = S.ring;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
        const a = Math.PI * (0.1 + i * 0.114);
        const up = (t * 1.6 + i * 0.3) % 1;
        drawGlow(ctx, S.tongue, x + Math.cos(a) * r, y + Math.sin(a) * r - up * 9, 7 * (1 - up) + 1, 0.8 * (1 - up));
    }
    ctx.restore();
}

// Asas de fogo do Phoenix Pact: abrem, batem uma vez e somem
export function renderPhoenix() {
    const fx = state.phoenixFx;
    if (!fx) return;
    const P = V.phoenix;
    const p = fx.age / fx.seconds;
    const open = easeOutBack(Math.min(1, p * 2.6));
    const flap = Math.sin(p * Math.PI * 1.4) * 0.35;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.globalAlpha = 1 - p * p;
    ctx.translate(fx.x, fx.y - 24);
    for (const side of [-1, 1]) {
        for (let i = 0; i < P.feathers; i++) {
            const k = i / (P.feathers - 1);
            const a = -0.95 + k * 1.5 + flap;
            const length = P.span * open * (1 - k * 0.5);
            const tipX = side * Math.cos(a) * length;
            const tipY = Math.sin(a) * length;
            ctx.strokeStyle = P.colors[i % P.colors.length];
            ctx.lineWidth = 11 - k * 5;
            ctx.beginPath();
            ctx.moveTo(side * 6, 0);
            ctx.quadraticCurveTo(side * length * 0.5, tipY * 0.2 - 22, tipX, tipY);
            ctx.stroke();
        }
    }
    ctx.restore();
}
