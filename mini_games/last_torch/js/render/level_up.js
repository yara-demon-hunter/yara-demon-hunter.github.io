import { LEVEL_UP_VISUALS as V } from '../../data_model/visuals/effects/level_up_visual.js';
import { ctx, player, state } from '../core/state.js';
import { easeOutCubic, easeOutQuad } from './fx/easing.js';
import { drawGlow } from './fx/glow.js';

// --- LEVEL UP ---
// Aviso discreto em cima do herói: fios de energia roxa sobem girando em volta dele e um texto
// pequeno mostra os pontos de skill ganhos. Acompanha o herói enquanto ele anda.
// Os dados visuais ficam em LEVEL_UP_VISUALS (data_model/visuals/effects/level_up_visual.js).

const TAU = Math.PI * 2;

// Número fixo entre 0 e 1 para (i, k): cada fio tem sempre o mesmo início
function seeded(i, k) {
    const n = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

// Só durante a partida: na loja e no game over a animação não fica presa na tela
function activeFx() {
    return state.gameState === 'PLAYING' ? state.levelUpFx : null;
}

function getFade(age) {
    return Math.max(0, Math.min(1, (V.durationSeconds - age) / V.fadeSeconds));
}

// front = true: só a metade do círculo na frente do herói; false: só a de trás
function renderStreaks(age, fade, front) {
    ctx.lineCap = 'round';
    for (let i = 0; i < V.streakCount; i++) {
        const p = (age - seeded(i, 1) * V.streakDelayMax) / V.streakSeconds;
        if (p < 0 || p >= 1) continue;
        const angle = seeded(i, 2) * TAU + p * V.streakSpin;
        if ((Math.sin(angle) >= 0) !== front) continue;

        const x = Math.cos(angle) * V.streakRadius;
        const y = Math.sin(angle) * V.streakRadius * V.groundSquash - easeOutQuad(p) * V.streakRise;
        const alpha = Math.sin(p * Math.PI) * fade;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + V.streakLength);
        ctx.globalAlpha = alpha * 0.45;
        ctx.strokeStyle = V.colors.energy;
        ctx.lineWidth = V.streakGlowWidth;
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = V.colors.energyCore;
        ctx.lineWidth = V.streakWidth;
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

// Camada atrás do herói: brilho nos pés e metade de trás da energia
export function renderLevelUpBack() {
    const fx = activeFx();
    if (!fx) return;
    const fade = getFade(fx.age);

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.save();
    ctx.scale(1, V.groundSquash);
    drawGlow(ctx, V.colors.glow, 0, 0, V.glowRadius, fade);
    ctx.restore();
    renderStreaks(fx.age, fade, false);
    ctx.restore();
}

function renderLabel(text, x, y, font, color) {
    ctx.font = font;
    ctx.strokeStyle = V.colors.outline;
    ctx.fillStyle = color;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
}

// Camada da frente (acima da névoa): a mensagem precisa ser lida mesmo no meio da luta
export function renderLevelUpFront() {
    const fx = activeFx();
    if (!fx) return;
    const fade = getFade(fx.age);

    ctx.save();
    ctx.translate(player.x, player.y);
    renderStreaks(fx.age, fade, true);
    ctx.restore();

    const rise = V.riseDistance * easeOutCubic(fx.age / V.durationSeconds);
    const x = Math.max(V.textMarginX, Math.min(state.width - V.textMarginX, player.x));
    const y = Math.max(V.textMinY, player.y - V.textOffsetY - rise);
    const label = `+${fx.points} SKILL POINT${fx.points === 1 ? '' : 'S'}`;

    ctx.save();
    ctx.globalAlpha = fade * Math.min(1, fx.age / V.fadeInSeconds);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = V.outlineWidth;
    renderLabel(V.titleText, x, y, V.titleFont, V.colors.title);
    renderLabel(label, x, y + V.pointsGap, V.pointsFont, V.colors.points);
    ctx.restore();
}
