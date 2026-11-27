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

// Golden Tornado (Curse Path): um funil dourado de luz que gira (state.goldenTornado; js/systems/powers.js). Desenhado POR CIMA dos monstros (depois deles na ordem do quadro):
// corpo translúcido com volume, anéis que sobem alargando, núcleo brilhante, cacos de ouro e poeira girando, e uma luz dourada com arcos em volta de cada monstro engolido (e.swallow)
// para parecer que ele está dentro do tornado. Tudo em função do relógio e do estado (nada guardado; poucos desenhos de brilho em cache).
export function renderGoldenTornado() {
    const T = state.goldenTornado;
    if (!T) return;
    const M = POWER_MODELS.goldenTornado.base;
    const rise = Math.min(1, T.age / M.riseSeconds, (T.seconds - T.age) / M.fadeSeconds);
    if (rise <= 0) return;
    const t = performance.now() / 1000;
    const low = state.quality >= 2;
    const height = (80 + T.radius * 0.8) * rise;
    const layers = low ? 7 : 12;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    // Chão: brilho largo e arcos de vento girando em volta da base
    drawGlow(ctx, 'rgba(251, 191, 36, 0.95)', T.x, T.y, T.radius * 1.9, 0.28 * rise);
    for (let k = 0; k < 4; k++) {
        const rr = T.radius * (1.05 + 0.28 * k);
        const a = t * (3.2 - k * 0.5) + k * 1.7;
        ctx.globalAlpha = (0.55 - k * 0.1) * rise;
        ctx.strokeStyle = k % 2 ? '#fde68a' : '#f59e0b';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.ellipse(T.x, T.y, rr, rr * 0.34, 0, a, a + 1.5);
        ctx.stroke();
    }
    // Corpo: camadas translúcidas empilhadas (dão volume ao funil) + o anel de cada camada em dois arcos opostos
    for (let k = 0; k < layers; k++) {
        const u = k / (layers - 1);                                  // 0 = base, 1 = topo
        const rr = T.radius * (0.32 + 0.98 * u) * (0.88 + 0.12 * Math.sin(t * 5 + k));
        const y = T.y - u * height;
        const spin = t * (8 - u * 3.5) + k * 1.9;
        ctx.globalAlpha = (0.14 + 0.06 * (1 - u)) * rise;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(T.x, y, rr, rr * 0.32, 0, 0, TAU);
        ctx.fill();
        ctx.lineWidth = 3.4 - u * 1.5;
        ctx.strokeStyle = k % 2 ? '#fde68a' : '#f59e0b';
        for (const off of [0, Math.PI]) {
            ctx.globalAlpha = (0.9 - 0.4 * u) * rise;
            ctx.beginPath();
            ctx.ellipse(T.x, y, rr, rr * 0.32, 0, spin + off, spin + off + 1.25);
            ctx.stroke();
        }
    }
    // Núcleo: uma coluna de luz branca-dourada no eixo
    for (let k = 0; k < 6; k++) {
        const u = k / 5;
        drawGlow(ctx, 'rgba(255, 251, 235, 0.95)', T.x + Math.sin(t * 9 + k) * 2, T.y - (0.15 + u * 0.85) * height * 0.9, 8 + (1 - u) * 6, 0.3 * rise);
    }
    // Cacos de ouro e poeira girando em alturas e raios diferentes
    ctx.fillStyle = '#fffbeb';
    const bits = low ? 8 : 20;
    for (let i = 0; i < bits; i++) {
        const u = (t * 0.55 + i / bits + (i % 3) * 0.13) % 1;
        const a = t * (5 + (i % 4)) + i * 2.4;
        const rr = T.radius * (0.4 + 1.0 * u);
        ctx.globalAlpha = Math.min(1, (1 - u) * 1.4) * rise;
        ctx.save();
        ctx.translate(T.x + Math.cos(a) * rr, T.y - u * height + Math.sin(a) * rr * 0.32);
        ctx.rotate(a * 2);
        ctx.fillRect(-1.6, -1.1, 3.2 + (i % 3), 2.2);
        ctx.restore();
    }
    // Monstros engolidos: luz dourada por cima deles e arcos girando em volta, para parecer que estão dentro do tornado
    let shown = 0;
    for (const e of state.enemies) {
        if (!(e.swallow > 0.12) || e.hp <= 0 || shown >= 14) continue;
        shown++;
        const k = e.swallow * rise;
        drawGlow(ctx, 'rgba(253, 224, 71, 0.9)', e.x, e.y - e.radius * 0.3, e.radius * 2.1, 0.2 * k);
        const a = t * 9 + e.phase;
        ctx.strokeStyle = '#fde68a';
        for (let r = 0; r < 2; r++) {
            ctx.globalAlpha = (0.85 - r * 0.25) * k;
            ctx.lineWidth = 2.6 - r * 0.8;
            ctx.beginPath();
            ctx.ellipse(e.x, e.y - e.radius * (0.1 + r * 0.55), e.radius * (1.45 - r * 0.3), e.radius * 0.55, 0, a + r * 2.4, a + r * 2.4 + 2.1);
            ctx.stroke();
        }
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
