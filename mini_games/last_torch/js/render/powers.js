import { getPowerLevel, POWER_MODELS } from '../../data_model/powers.js';
import { POWERS_VISUALS as V } from '../../data_model/visuals/effects/powers_visual.js';
import { SKILLS_VISUALS } from '../../data_model/visuals/effects/skills_visual.js';
import { ctx, passives, player, powers, state } from '../core/state.js';
import { drawFireOrb } from './fire.js';
import { drawGlow } from '../../library/core/glow.js';
import { getDashedRing } from './fx/rings.js';
import { DAGGER_LENGTH, DAGGER_WIDTH, getDaggerSprite } from './fx/sprites.js';
import { resetWorldView, stamp } from './fx/stamp.js';

// --- PODERES (desenho procedural) ---
const TAU = Math.PI * 2;

// Fogo no chão do herói com a Blue Torch (o fogo dos inimigos continua vermelho)
const BLUE_GROUND = {
    colors: ['rgba(29, 78, 216, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(147, 197, 253, 0.85)'],
    evolved: ['rgba(30, 64, 175, 0.85)', 'rgba(56, 189, 248, 0.9)', 'rgba(224, 242, 254, 0.95)'],
    glow: 'rgba(37, 99, 235, 0.75)'
};

export function renderGroundFires() {
    const blue = passives.blueTorch.lvl > 0;
    const t = performance.now() / 1000;
    const F = V.fire;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    state.groundFires.forEach((f, i) => {
        const k = Math.min(1, f.life / (f.maxLife * 0.35));
        const r = f.radius * (0.55 + 0.45 * k);
        const colors = f.hostile ? F.hostileColors : blue ? (f.evolved ? BLUE_GROUND.evolved : BLUE_GROUND.colors) : f.evolved ? F.evolvedColors : F.colors;
        drawGlow(ctx, f.hostile ? F.hostileGlow : blue ? BLUE_GROUND.glow : F.glow, f.x, f.y, r * 1.5, 0.28 * k);
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

// Spectral Blade (Blade Path): as lâminas fantasmas aparecem crescendo, giram e somem encolhendo (state.spectralBlade; js/systems/powers.js). Mesma adaga do arremesso, em roxo
export function renderSpectralBlade() {
    const R = state.spectralBlade;
    if (R.left <= 0) return;
    const level = getPowerLevel(powers.spectralBlade);
    if (!level) return;
    const M = POWER_MODELS.spectralBlade.base;
    const grow = Math.max(0, Math.min(1, R.age / M.appearSeconds, R.left / M.vanishSeconds));
    const dagger = getDaggerSprite();
    const width = DAGGER_LENGTH * 0.8 * (0.4 + 0.6 * grow);
    const height = DAGGER_WIDTH * 0.8 * (0.4 + 0.6 * grow);
    const radius = level.radius * (0.55 + 0.45 * grow);
    ctx.save();
    ctx.globalAlpha = grow;
    for (let i = 0; i < level.count; i++) {
        const a = R.angle + (i / level.count) * TAU;
        const x = player.x + Math.cos(a) * radius;
        const y = player.y + Math.sin(a) * radius;
        drawGlow(ctx, 'rgba(167, 139, 250, 0.85)', x, y, 18, 0.55 * grow);
        stamp(dagger, 0, 0, dagger.width, dagger.height, x, y, a + Math.PI / 2, width, height);
        resetWorldView();
    }
    ctx.restore();
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
        const look = bolt.hex ? SKILLS_VISUALS.hex.beam : L;
        ctx.globalAlpha = Math.min(1, (bolt.life / bolt.maxLife) * 1.6);
        ctx.beginPath();
        bolt.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.strokeStyle = look.glow;
        ctx.lineWidth = L.glowWidth;
        ctx.stroke();
        ctx.strokeStyle = look.color;
        ctx.lineWidth = L.width;
        ctx.stroke();
        ctx.strokeStyle = look.core;
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
        if (b.fire) return;
        const look = b.soul ? SKILLS_VISUALS.soulBolt : b.blue ? V.blueBolt : B;
        const speed = Math.hypot(b.vx, b.vy) || 1;
        const bx = -b.vx / speed;
        const by = -b.vy / speed;
        ctx.fillStyle = look.mid;
        for (let i = 1; i <= B.trail; i++) {
            ctx.globalAlpha = 0.7 * (1 - i / (B.trail + 1));
            ctx.beginPath();
            ctx.arc(b.x + bx * i * B.trailGap, b.y + by * i * B.trailGap, B.radius * (1 - i / (B.trail + 2)), 0, TAU);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        drawGlow(ctx, look.glow, b.x, b.y, B.radius * 3, 0.8);
        ctx.fillStyle = look.core;
        ctx.beginPath();
        ctx.arc(b.x, b.y, B.radius * 0.7, 0, TAU);
        ctx.fill();
    });
    ctx.restore();
    // Bolas de fogo da fênix: a mesma das Fireballs, com cauda
    const t = performance.now() / 1000;
    for (const b of state.bolts) {
        if (b.fire) drawFireOrb(b.x, b.y, SKILLS_VISUALS.fire.orbRadius, t, Math.atan2(b.vy, b.vx), 1);
    }
}

const POWER_MODELS_ABS = POWER_MODELS.absoluteZero;
// Permafrost: o GELO no chão. Em vez do setor liso do sopro, cada camada é uma crosta irregular de placas de gelo (polígonos tortos que se sobrepõem), com rachaduras claras, bordas
// brilhantes e cristais; nasce se espalhando e some derretendo. As placas são sorteadas UMA vez por camada (p.plates) dentro da área onde o sopro passou, e cada camada é desenhada
// com poucos traços (um caminho para todas as placas, um para as bordas e um para as rachaduras). Camada de CHÃO (desenhada antes dos personagens).
function makeIcePlates(p) {
    const plates = [];
    const count = state.quality >= 2 ? 6 : 10;
    for (let i = 0; i < count; i++) {
        const d = p.range * (0.12 + 0.88 * Math.sqrt(Math.random()));
        const a = p.angle + (Math.random() * 2 - 1) * p.half * 1.05;
        const cx = Math.cos(a) * d, cy = Math.sin(a) * d;
        const size = 9 + Math.random() * 12;
        const sides = 5 + Math.floor(Math.random() * 3);
        const rot = Math.random() * TAU;
        const pts = [];
        for (let k = 0; k < sides; k++) {
            const ang = rot + (k / sides) * TAU + (Math.random() - 0.5) * 0.5;
            const r = size * (0.55 + Math.random() * 0.6);
            pts.push(Math.cos(ang) * r, Math.sin(ang) * r * 0.62);       // achatado: gelo deitado no chão
        }
        plates.push({ cx, cy, pts, delay: (d / p.range) * 0.25 });
    }
    p.plates = plates;
    // Rachaduras curtas: do centro de algumas placas até um canto delas, passando um pouco além (cada uma tem seu desvio)
    p.cracks = [];
    for (let i = 0; i < plates.length; i += 2) {
        const q = plates[i], v = (Math.floor(Math.random() * (q.pts.length / 2))) * 2;
        const ex = q.cx + q.pts[v] * 1.25, ey = q.cy + q.pts[v + 1] * 1.25;
        p.cracks.push(q.cx, q.cy, (q.cx + ex) / 2 + (Math.random() - 0.5) * 6, (q.cy + ey) / 2 + (Math.random() - 0.5) * 4, ex, ey);
    }
}
export function renderIcePatches() {
    const patches = state.icePatches;
    if (patches.length === 0) return;
    const t = performance.now() / 1000;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const p of patches) {
        if (!p.plates) makeIcePlates(p);
        const age = p.maxLife - p.life;
        const fade = Math.max(0, Math.min(1, p.life / 1.4));                    // derrete nos últimos 1,4 s
        const melt = 0.75 + 0.25 * fade;                                        // e as placas encolhem um pouco
        // Placas (um caminho só): crescem do centro para fora no começo
        ctx.beginPath();
        for (const pl of p.plates) {
            const g = Math.max(0, Math.min(1, (age - pl.delay) / 0.2)) * melt;
            if (g <= 0) continue;
            const n = pl.pts.length;
            ctx.moveTo(p.x + pl.cx + pl.pts[0] * g, p.y + pl.cy + pl.pts[1] * g);
            for (let k = 2; k < n; k += 2) ctx.lineTo(p.x + pl.cx + pl.pts[k] * g, p.y + pl.cy + pl.pts[k + 1] * g);
            ctx.closePath();
        }
        ctx.globalAlpha = 0.26 * fade;
        ctx.fillStyle = '#9fdcf8';
        ctx.fill();
        ctx.globalAlpha = 0.75 * fade;
        ctx.strokeStyle = '#e8f7ff';
        ctx.lineWidth = 1.3;
        ctx.stroke();
        // Rachaduras: traços claros ligando as placas
        ctx.beginPath();
        for (let i = 0; i < p.cracks.length; i += 6) {
            ctx.moveTo(p.x + p.cracks[i], p.y + p.cracks[i + 1]);
            ctx.quadraticCurveTo(p.x + p.cracks[i + 2], p.y + p.cracks[i + 3], p.x + p.cracks[i + 4], p.y + p.cracks[i + 5]);
        }
        ctx.globalAlpha = 0.5 * fade;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.9;
        ctx.stroke();
        // Brilhos: um cristal piscando no meio de algumas placas
        if (state.quality < 2) {
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < p.plates.length; i += 3) {
                const pl = p.plates[i];
                ctx.globalAlpha = Math.max(0, Math.sin(t * 2.6 + i * 1.7)) * 0.85 * fade;
                ctx.fillRect(p.x + pl.cx - 1.5, p.y + pl.cy - 1.5, 3, 3);
            }
        }
    }
    ctx.restore();
}

// Freezing Breath: o sopro gelado sai da boca do herói e abre em cone por 3 s, girando com ele: nuvem de gelo que corre da boca até a ponta do cone (cada puff nasce na boca,
// viaja e some), cacos que voam e névoa. Tudo em função da idade e do rumo de agora (nada guardado); b.range/b.half vêm do nível.
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export function renderFrostBreaths() {
    if (state.frostBreaths.length === 0) return;
    const SECONDS = POWER_MODELS_ABS.breathSeconds;
    const puffs = state.quality >= 2 ? 12 : 26;
    ctx.save();
    for (const b of state.frostBreaths) {
        const fade = Math.min(1, b.age / 0.15, (SECONDS - b.age) / 0.35);            // entra e sai de leve
        if (fade <= 0) continue;
        const ox = player.x + Math.cos(b.angle) * 10, oy = player.y - 16 + Math.sin(b.angle) * 4;      // a boca: um pouco acima do centro
        const nx = -Math.sin(b.angle), ny = Math.cos(b.angle);
        const spreadK = Math.tan(b.half);
        // Névoa do cone: brilhos largos ao longo dele
        for (let k = 0; k < 5; k++) {
            const t = (k + 1) / 5;
            drawGlow(ctx, 'rgba(125, 211, 252, 0.9)', ox + Math.cos(b.angle) * b.range * t, oy + Math.sin(b.angle) * b.range * t, 14 + spreadK * b.range * t * 0.9, 0.2 * fade);
        }
        // Nuvem: cada puff nasce na boca e corre até a ponta, abrindo e esmaecendo
        for (let k = 0; k < puffs; k++) {
            const phase = (b.age * 1.7 + hash(k) + k / puffs) % 1;
            const dist = b.range * phase;
            const spread = (hash(k + 7) - 0.5) * 2 * spreadK * dist * 0.85;
            const wob = Math.sin(b.age * 12 + k) * 2;
            drawGlow(ctx, k % 3 === 0 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(165, 243, 252, 0.95)',
                ox + Math.cos(b.angle) * dist + nx * (spread + wob), oy + Math.sin(b.angle) * dist + ny * (spread + wob),
                5 + 9 * phase + hash(k + 90) * 4, (0.85 - 0.6 * phase) * fade);
        }
        // Cacos de gelo que voam no sopro
        ctx.fillStyle = '#e0f2fe';
        for (let k = 0; k < 10; k++) {
            const phase = (b.age * 1.3 + hash(k + 200)) % 1;
            const dist = b.range * phase;
            const spread = (hash(k + 220) - 0.5) * 2 * spreadK * dist * 0.9;
            ctx.save();
            ctx.globalAlpha = Math.max(0, (1 - phase) * fade);
            ctx.translate(ox + Math.cos(b.angle) * dist + nx * spread, oy + Math.sin(b.angle) * dist + ny * spread);
            ctx.rotate(b.age * 8 + k);
            ctx.fillRect(-1.6, -1.6, 3.2, 3.2);
            ctx.restore();
        }
        // O contorno do cone aparece de leve no começo (mostra a área que o sopro pega)
        if (b.age < 0.4) {
            ctx.globalAlpha = (0.4 - b.age) * 1.2;
            ctx.strokeStyle = '#bae6fd';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.arc(ox, oy, b.range, b.angle - b.half, b.angle + b.half);
            ctx.closePath();
            ctx.stroke();
        }
    }
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

// Rastro do dash: silhuetas de sombra pelo caminho, com a capa esticada para trás
// (dark: a sombra do Night Reaper correndo atrás do herói)
export function renderDashGhosts() {
    const G = V.dashGhost;
    const E = SKILLS_VISUALS.echo;
    ctx.save();
    state.dashGhosts.forEach(g => {
        const k = 1 - g.age / g.seconds;
        const color = g.dark ? E.color : G.color;
        const backX = -Math.cos(g.angle ?? 0) * G.radius * 2.6;
        const backY = -Math.sin(g.angle ?? 0) * G.radius * 2.6;
        ctx.globalAlpha = k * 0.75;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(g.x, g.y - 14, G.radius * 0.8, G.radius * 1.5, 0, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(g.x - G.radius * 0.7, g.y - 24);
        ctx.lineTo(g.x + backX, g.y - 8 + backY);
        ctx.lineTo(g.x + G.radius * 0.7, g.y - 24);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = g.dark ? E.core : G.core;
        ctx.beginPath();
        ctx.arc(g.x, g.y - 30, G.radius * 0.5, 0, TAU);
        ctx.fill();
    });
    ctx.restore();
}
