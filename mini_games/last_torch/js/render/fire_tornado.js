import { ctx, passives, state } from '../core/state.js';
import { drawGlow } from '../../library/core/glow.js';
import { FIRE_TORNADO } from '../../data_model/passives.js';

// --- FIRE TORNADO (visual) ---
// Um furacão de fogo sobre a tocha: um funil que gira no centro e braços de chama em espiral por todo o círculo tracejado.
// Sem estado: a posição de cada brilho é função do tempo. Nasce crescendo do centro até a borda e se apaga nos últimos instantes.
const LOOKS = {
    fire: { core: 'rgba(254, 240, 138, 0.95)', mid: 'rgba(251, 146, 60, 0.85)', edge: 'rgba(220, 38, 38, 0.7)', smoke: 'rgba(120, 53, 15, 0.5)' },
    blue: { core: 'rgba(224, 242, 254, 0.95)', mid: 'rgba(96, 165, 250, 0.85)', edge: 'rgba(37, 99, 235, 0.7)', smoke: 'rgba(30, 58, 138, 0.5)' }
};
const FLATTEN = 0.62;           // achatamento do chão (visão de cima inclinada)
const FUNNEL_HEIGHT = 230;

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
    const t = T.age + FIRE_TORNADO.durationSeconds - T.left;
    const cx = state.coreX, cy = state.coreY;
    const low = state.quality >= 2;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Chão em brasa: brilho largo e o anel da borda girando
    drawGlow(ctx, L.edge, cx, cy, R * 1.15, 0.22 * power);
    const rim = low ? 18 : 34;
    for (let i = 0; i < rim; i++) {
        const a = t * 1.6 + (i / rim) * Math.PI * 2;
        drawGlow(ctx, i % 2 ? L.mid : L.edge, cx + Math.cos(a) * R, cy + Math.sin(a) * R * FLATTEN, 17 + 6 * Math.sin(t * 9 + i), 0.55 * power);
    }

    // Braços de chama em espiral: giram mais rápido perto do centro e sobem enquanto andam para dentro
    const N = low ? 46 : 96;
    for (let i = 0; i < N; i++) {
        const u = (i * 0.618034) % 1;                            // faixa fixa de cada brilho
        const run = (t * 0.32 + (i / N) * 3) % 1;                // 0 = borda, 1 = centro
        const r = R * (1 - run) * (0.2 + 0.8 * u) + 8;
        const a = t * (2.2 + 4.5 * run) + i * 2.399;
        const lift = run * FUNNEL_HEIGHT * 0.55 * (0.4 + u);
        const size = (9 + 16 * (1 - run)) * (0.7 + 0.5 * u);
        const color = run < 0.35 ? L.edge : run < 0.75 ? L.mid : L.core;
        drawGlow(ctx, color, cx + Math.cos(a) * r, cy + Math.sin(a) * r * FLATTEN - lift, size, Math.min(1, 0.75 * power));
    }

    // O funil: anéis que giram e se alargam para cima
    const rings = low ? 16 : 28;
    const arms = low ? 2 : 4;
    for (let j = 0; j < rings; j++) {
        const h = j / (rings - 1);
        const w = 6 + h * h * 70 + h * 34;
        const y = cy - h * FUNNEL_HEIGHT * grow;
        const wob = Math.sin(t * 5 + j * 0.9) * 5 * h;
        const a = t * (9 - h * 3) + j * 0.7;
        const color = h < 0.1 ? L.core : h < 0.55 ? L.mid : L.edge;
        for (let k = 0; k < arms; k++) {
            const b = a + (k / arms) * Math.PI * 2;
            drawGlow(ctx, color, cx + wob + Math.cos(b) * w, y + Math.sin(b) * w * 0.28, 6 + h * 15, 0.5 * power);
        }
    }
    // Núcleo claro na base e fumaça quente no topo
    drawGlow(ctx, L.core, cx, cy - 6, 22 * power + 4, 0.7 * power);
    drawGlow(ctx, L.smoke, cx, cy - FUNNEL_HEIGHT * grow, 60 * power, 0.4 * power);
    ctx.restore();
}
