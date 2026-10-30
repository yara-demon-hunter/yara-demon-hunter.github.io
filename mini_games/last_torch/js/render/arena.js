import { CORE_MODEL } from '../../data_model/core.js';
import { SHADOW_CLONE } from '../../data_model/passives.js';
import { HERO_VISUALS } from '../../data_model/visuals/characters/hero_visual.js';
import { SHADOW_CLONE_VISUALS } from '../../data_model/visuals/characters/shadow_clone_visual.js';
import { TORCH_VISUALS as T } from '../../data_model/visuals/scenery/torch_visual.js';
import { ctx, player, shadowClone, state } from '../core/state.js';
import { getAtkRadius } from '../systems/stats.js';
import { drawGlow } from './fx/glow.js';
import { drawHpBar } from './fx/hp_bar.js';

// --- ARENA: Núcleo e Raio de Alcance ---
// (o chão/fundo fica em forest.js)
// Tocha (Center Tower) vista de cima: base de pedra, chama que tremula e brasas.
// A chama encolhe conforme o núcleo perde vida.
let shownHpRatio = 1;
let lastFlameTime = 0;

function getCoreHpRatio() {
    return Math.max(0, Math.min(1, state.coreHp / state.coreHpMax));
}

// A chama não salta de tamanho: desce suave até a vida atual
function updateShownHpRatio(now) {
    const dt = Math.min(0.1, lastFlameTime ? now - lastFlameTime : 0);
    lastFlameTime = now;
    shownHpRatio += (getCoreHpRatio() - shownHpRatio) * Math.min(1, dt * T.flameSmoothing);
    return shownHpRatio;
}

export function renderCore() {
    const { coreX: x, coreY: y } = state;
    const t = performance.now() / 1000;
    const hpRatio = updateShownHpRatio(t);
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

// Barrinhas de vida da fogueira e do herói. Ficam acima da névoa para serem vistas mesmo com pouca luz
export function renderHpBars() {
    drawHpBar(ctx, T.hpBar, state.coreX, state.coreY, getCoreHpRatio());
    drawHpBar(ctx, HERO_VISUALS.hpBar, player.x, player.y, Math.max(0, Math.min(1, player.hp / player.maxHp)));
}

// Círculo vermelho tracejado de alcance em volta de (x, y); alpha < 1 deixa mais apagado
function drawRangeCircle(x, y, radius, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.setLineDash([8, 8]); // Linha tracejada
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    // Brilho: traço largo e translúcido por baixo (bem mais barato que shadowBlur)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.18)';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = state.frenzyActiveTimer > 0 ? 'rgba(236, 72, 153, 0.7)' : 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

// Raio de Alcance do herói e do Shadow Clone (o do clone um pouco mais apagado)
export function renderAttackRange() {
    if (shadowClone.active) {
        const appear = Math.min(1, (performance.now() - shadowClone.spawnTime) / 1000 / SHADOW_CLONE_VISUALS.spawnSeconds);
        drawRangeCircle(shadowClone.x, shadowClone.y, getAtkRadius() * SHADOW_CLONE.radiusMultiplier,
            SHADOW_CLONE_VISUALS.rangeAlpha * appear);
    }
    drawRangeCircle(player.x, player.y, getAtkRadius());
}
