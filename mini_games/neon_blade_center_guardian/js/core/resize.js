import { CHARACTER_MODEL } from '../../data_model/character.js';
import { canvas, ctx, player, state } from './state.js';

// Telas 2x/3x (retina) têm 4x/9x mais pixels para pintar; 1.5 é um bom equilíbrio
const MAX_PIXEL_RATIO = 1.5;

// --- RESIZE ---
export function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    canvas.width = Math.round(state.width * pixelRatio);
    canvas.height = Math.round(state.height * pixelRatio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    state.coreX = state.width / 2;
    state.coreY = state.height / 2;

    if (state.gameState === 'START') {
        player.x = state.coreX;
        player.y = state.coreY + CHARACTER_MODEL.initialPositionOffsetY;
        player.targetX = player.x;
        player.targetY = player.y;
    }
}
