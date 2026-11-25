import { ROSE_PETALS } from '../../data_model/passives.js';
import { ctx, passives, player, state } from '../core/state.js';
import { drawRose } from '../../library/weapons/rose/rose.js';
import { drawGlow } from '../../library/core/glow.js';

// --- ROSE PETALS (js/systems/skills_nature.js, updateRosePetals) ---
// Um furacão de pétalas em volta do herói: dezenas de pétalas soltas sobem em espiral girando, e algumas rosas inteiras orbitam mais perto. O raio do
// círculo no chão é o do dano (ROSE_PETALS.radius). Só elipses pequenas e a rosa da biblioteca; nada de sprite novo.
const TAU = Math.PI * 2;
const SQUASH = 0.62;                    // achatamento do chão (a mesma perspectiva do resto)
const PETALS = 64;
const ROSES = 6;
const COLORS = ['#e11d48', '#fb7185', '#fda4af', '#be123c', '#f43f5e'];
const DARK_COLORS = ['#17101f', '#2a1740', '#4c2f6e', '#0b0612', '#3b2457'];           // Dark Roses (Rowan): pétalas e rosas negras
const ROSE_SIZE = 1.14;                // as rosas que giram: 0,95 x 1,2 (20% maiores)
const frac = (v) => v - Math.floor(v);

export function renderRosePetals() {
    const s = state.nature.storm;
    if (!s) return;
    const P = ROSE_PETALS;
    const t = state.runTime;
    const dark = passives.darkRoses.lvl > 0;
    const colors = dark ? DARK_COLORS : COLORS;
    const grow = Math.min(1, s.age / 0.35);
    const fade = Math.min(1, (P.durationSeconds - s.age) / 0.45);
    const R = P.radius * (0.35 + 0.65 * grow);
    const cx = player.x;
    const cy = player.y - 4;
    ctx.save();
    // O círculo do dano no chão: um anel fraco girando
    ctx.globalAlpha = 0.32 * fade;
    ctx.strokeStyle = dark ? '#a78bfa' : '#fb7185';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 9]);
    ctx.lineDashOffset = -t * 40;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, R, R * SQUASH, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    // Brilho rosado no centro
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, dark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(251, 113, 133, 0.8)', cx, cy - 10, R * 0.55, 0.16 * fade);
    ctx.restore();
    // Pétalas soltas: cada uma sobe em espiral (o ciclo dá a volta), girando em torno do herói e de si mesma
    for (let i = 0; i < PETALS; i++) {
        const up = frac(t * (0.32 + (i % 4) * 0.05) + i * 0.137);           // 0 embaixo, 1 no alto
        const a = t * (1.6 + (i % 5) * 0.22) + i * 2.399;
        const r = R * (0.2 + 0.8 * frac(i * 0.618 + up * 0.35)) * (0.55 + 0.45 * up);
        const x = cx + Math.cos(a) * r;
        const y = cy + 8 + Math.sin(a) * r * SQUASH - up * 62;
        const size = 2.6 + (i % 3) * 0.9;
        const behind = Math.sin(a) < 0 ? 0.7 : 1;
        ctx.globalAlpha = Math.min(1, Math.min(up * 6, (1 - up) * 3 + 0.3)) * fade * behind;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.55, a + Math.PI / 2 + t * 3 + i, 0, TAU);
        ctx.fill();
        if (dark) {
            ctx.strokeStyle = 'rgba(167, 139, 250, 0.6)';
            ctx.lineWidth = 0.7;
            ctx.stroke();
        }
    }
    // Rosas inteiras orbitando, viradas para onde giram
    for (let i = 0; i < ROSES; i++) {
        const a = t * 2.1 + (i / ROSES) * TAU;
        const r = R * 0.62;
        const x = cx + Math.cos(a) * r;
        const y = cy + 6 + Math.sin(a) * r * SQUASH - 14 - Math.sin(t * 3 + i) * 4;
        ctx.globalAlpha = fade * (Math.sin(a) < 0 ? 0.75 : 1);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a + Math.PI / 2);
        ctx.scale(ROSE_SIZE, ROSE_SIZE);
        drawRose(ctx, t, dark);
        ctx.restore();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
}
