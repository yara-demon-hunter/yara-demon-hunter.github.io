import { CORE_MODEL } from '../../data_model/core.js';
import { TORCH_VISUALS as T } from '../../data_model/visuals.js';
import { ctx, player, state } from '../core/state.js';
import { getAtkRadius } from '../systems/stats.js';
import { drawGlow } from './fx/glow.js';

// --- ARENA: Núcleo e Raio de Alcance ---
// (o chão/fundo fica em forest.js)
// Tocha (Center Tower) vista de cima: base de pedra, chama que tremula e brasas.
// A chama encolhe conforme o núcleo perde vida.
export function renderCore() {
    const { coreX: x, coreY: y } = state;
    const t = performance.now() / 1000;
    const hpRatio = Math.max(0, Math.min(1, state.coreHp / state.coreHpMax));
    const scale = T.flameMinScale + (1 - T.flameMinScale) * hpRatio;
    const flicker = 1 + Math.sin(t * 17) * 0.08 + Math.sin(t * 31) * 0.06;

    // Base de pedra
    ctx.fillStyle = T.baseColor;
    ctx.beginPath();
    ctx.arc(x, y, CORE_MODEL.visualRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = T.baseRimColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Halo quente
    drawGlow(ctx, T.flameGlowColor, x, y, 46 * scale * flicker, 0.7);

    // Línguas de fogo giratórias
    for (let i = 0; i < T.tongues; i++) {
        const a = (i / T.tongues) * Math.PI * 2 + t * (0.9 + i * 0.12);
        const wobble = 0.7 + 0.3 * Math.sin(t * 9 + i * 1.7);
        const r = CORE_MODEL.visualRadius * 0.5 * scale * wobble;
        ctx.fillStyle = T.flameColors[i % T.flameColors.length];
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.9, r * 0.55, a, 0, Math.PI * 2);
        ctx.fill();
    }

    // Miolo claro da chama
    drawGlow(ctx, '#fde68a', x, y, 13 * scale * flicker, 1);
    drawGlow(ctx, T.flameCoreColor, x, y, 6 * scale, 0.9);

    // Brasas subindo (saem do centro para fora)
    ctx.fillStyle = T.emberColor;
    for (let k = 0; k < T.embers; k++) {
        const phase = (t * 0.55 + k / T.embers) % 1;
        const a = k * 2.399 + Math.floor(t * 0.55 + k / T.embers) * 1.3;
        const r = (CORE_MODEL.visualRadius * 0.4 + phase * 30) * scale;
        ctx.globalAlpha = (1 - phase) * 0.9;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.6 * (1 - phase * 0.6), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// Raio de Alcance do herói: Círculo Vermelho com Linhas Tracejadas
export function renderAttackRange() {
    ctx.save();
    ctx.strokeStyle = state.frenzyActiveTimer > 0 ? 'rgba(236, 72, 153, 0.7)' : 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]); // Linha tracejada
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(player.x, player.y, getAtkRadius(), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
