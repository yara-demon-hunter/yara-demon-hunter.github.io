import { ctx, passives, state } from '../core/state.js';
import { drawGlow } from '../../library/core/glow.js';
import { drawFlameTongue } from './fire.js';
import { FIRE_TORNADO } from '../../data_model/passives.js';

// --- FIRE TORNADO (visual) ---
// Um furacão de fogo de verdade: um funil com corpo (anéis de chama que giram, mais estreitos embaixo e largos em cima, com língua de
// fogo subindo pela borda), um vórtice de brasa no chão por todo o raio e fagulhas girando. Sem estado: tudo é função do tempo.
// Nasce crescendo do centro até a borda e se apaga nos últimos instantes.
const LOOKS = {
    fire: {
        core: 'rgba(255, 244, 190, 0.95)', mid: 'rgba(251, 146, 60, 0.9)', edge: 'rgba(220, 38, 38, 0.8)', dark: 'rgba(52, 20, 10, 0.55)',
        glow: 'rgba(249, 115, 22, 0.55)', ember: 'rgba(253, 224, 71, 0.9)', bands: ['#fff1a8', '#fdba3c', '#f97316', '#dc2626', '#7f1d1d']
    },
    blue: {
        core: 'rgba(224, 242, 254, 0.95)', mid: 'rgba(96, 165, 250, 0.9)', edge: 'rgba(37, 99, 235, 0.8)', dark: 'rgba(12, 24, 60, 0.55)',
        glow: 'rgba(37, 99, 235, 0.55)', ember: 'rgba(191, 219, 254, 0.9)', bands: ['#e0f2fe', '#7dd3fc', '#3b82f6', '#1d4ed8', '#1e3a8a']
    }
};
const FLATTEN = 0.5;            // achatamento dos anéis (visão de cima inclinada)
const FUNNEL_HEIGHT = 250;
const TOP_RADIUS = 96;
const BASE_RADIUS = 14;
const TAU = Math.PI * 2;

// Raio do funil na altura h (0 = chão, 1 = topo): estreito embaixo, abrindo para cima
const funnelRadius = (h) => BASE_RADIUS + (TOP_RADIUS - BASE_RADIUS) * h ** 1.35;

function bandColor(look, h) {
    const k = Math.min(look.bands.length - 1, Math.floor(h * look.bands.length));
    return look.bands[k];
}

export function renderFireTornado() {
    const T = state.fireTornado;
    if (passives.fireTornado.lvl <= 0 || T.left <= 0) return;
    if (state.phase !== 'HUNT') {                // fim da onda: o furacão some na hora (a lógica não roda fora da caçada)
        T.left = 0;
        return;
    }
    const L = LOOKS[passives.blueTorch.lvl > 0 ? 'blue' : 'fire'];
    const grow = Math.min(1, T.age / 0.8);
    const fade = Math.min(1, T.left / 0.7);
    const power = (1 - (1 - grow) ** 3) * fade;
    const R = FIRE_TORNADO.radius * (0.25 + 0.75 * grow);
    const t = T.age;
    const cx = state.coreX, cy = state.coreY;
    const low = state.quality >= 2;
    const H = FUNNEL_HEIGHT * grow;

    ctx.save();

    // 1) Chão chamuscado: sombra escura e brasa avermelhada por todo o círculo
    ctx.globalAlpha = 0.35 * power;
    ctx.fillStyle = L.dark;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * FLATTEN, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, L.glow, cx, cy, R * 1.2, 0.35 * power);

    // 2) Vórtice no chão: arcos de chama girando em vários raios (mais rápido perto do centro)
    const lanes = low ? 3 : 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < lanes; i++) {
        const u = (i + 1) / lanes;
        const r = R * (0.3 + 0.7 * u);
        const a0 = t * (3.4 - 2.2 * u) + i * 1.7;
        ctx.strokeStyle = i % 2 ? L.mid : L.edge;
        ctx.lineWidth = 4 + 4 * u;
        ctx.globalAlpha = 0.45 * power;
        for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, r, r * FLATTEN, 0, a0 + k * (TAU / 3), a0 + k * (TAU / 3) + 1.3);
            ctx.stroke();
        }
    }

    // 3) Corpo do funil: anéis de chama (cada um com dois arcos que giram) do chão ao topo
    const bands = low ? 12 : 20;
    for (let j = 0; j < bands; j++) {
        const h = j / (bands - 1);
        const w = funnelRadius(h);
        const y = cy - h * H;
        const wob = Math.sin(t * 3 + h * 5) * 9 * h;               // o topo balança
        const a0 = t * (8.5 - 4 * h) + j * 1.1;
        const ry = w * FLATTEN * 0.62;
        // sombra de fumaça por baixo do brilho: dá corpo e contraste ao funil
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.16 * power;
        ctx.strokeStyle = L.dark;
        ctx.lineWidth = 16 + 22 * h;
        ctx.beginPath();
        ctx.ellipse(cx + wob, y, w, ry, 0, 0, TAU);
        ctx.stroke();
        // brilho: dois arcos opostos
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = bandColor(L, h);
        ctx.lineWidth = 7 + 11 * h;
        ctx.globalAlpha = (0.85 - 0.25 * h) * power;
        for (let k = 0; k < 2; k++) {
            ctx.beginPath();
            ctx.ellipse(cx + wob, y, w, ry, 0, a0 + k * Math.PI, a0 + k * Math.PI + 2.1);
            ctx.stroke();
        }
    }

    // 4) Línguas de fogo subindo pela borda do funil
    const tongues = low ? 8 : 16;
    ctx.globalAlpha = 0.9 * power;
    for (let i = 0; i < tongues; i++) {
        const rise = (t * 0.55 + i / tongues + (i % 3) * 0.13) % 1;
        const h = rise;
        const a = t * (6 - 3 * h) + i * 2.1;
        const w = funnelRadius(h) * 1.05;
        const x = cx + Math.cos(a) * w + Math.sin(t * 3 + h * 5) * 9 * h;
        const y = cy - h * H + Math.sin(a) * w * FLATTEN * 0.62;
        ctx.globalAlpha = Math.min(1, power * (1 - rise * 0.6));
        drawFlameTongue(x, y, 7 + 12 * h, t, i * 1.3);
    }

    // 5) Núcleo claro na base e fagulhas girando por fora
    ctx.globalAlpha = 1;
    drawGlow(ctx, L.core, cx, cy - 8, 26 * power + 4, 0.8 * power);
    drawGlow(ctx, L.mid, cx, cy - H * 0.45, 70 * power, 0.22 * power);
    const sparks = low ? 18 : 40;
    for (let i = 0; i < sparks; i++) {
        const u = (i * 0.618034) % 1;
        const rise = (t * (0.35 + 0.4 * u) + u * 3) % 1;
        const r = funnelRadius(rise) + 12 + R * 0.5 * u * rise;
        const a = t * (4 - 2 * rise) + i * 2.399;
        drawGlow(ctx, L.ember, cx + Math.cos(a) * r, cy - rise * H * 1.05 + Math.sin(a) * r * FLATTEN * 0.62, 3 + 3 * u, (1 - rise) * power);
    }
    ctx.restore();
}
