import { GOLD_VISUALS as G } from '../../../data_model/visuals/items/gold_visual.js';
import { KNIFE_VISUALS as K } from '../../../data_model/visuals/effects/knife_visual.js';
import { getGlowSprite } from './glow.js';
import { drawDagger } from '../knife.js';

// --- SPRITES PEQUENOS ---
// Tudo que aparece muitas vezes é desenhado uma vez e depois carimbado: moeda e adaga.
export function makeCanvas(width, height, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    if (draw) draw(canvas.getContext('2d'));
    return canvas;
}

// Moeda girando: os quadros vão da moeda de frente até de lado
const COIN_FRAMES = 6;
const COIN_PIXELS = 3;              // pixels por unidade do mundo
export const COIN_SIZE = G.radius * 5.6;
let coins = null;

export function getCoinAtlas() {
    if (coins) return coins;
    const cell = Math.ceil(COIN_SIZE * COIN_PIXELS);
    const canvas = makeCanvas(cell * COIN_FRAMES, cell, (g) => {
        const glow = getGlowSprite(G.glowColor);
        for (let f = 0; f < COIN_FRAMES; f++) {
            const spin = Math.abs(Math.cos((f / COIN_FRAMES) * Math.PI));
            const cx = (f + 0.5) * cell;
            const cy = cell / 2;
            const r = G.radius * COIN_PIXELS;
            g.globalAlpha = 0.55;
            g.drawImage(glow, f * cell, 0, cell, cell);
            g.globalAlpha = 1;
            g.fillStyle = G.edgeColor;
            g.beginPath();
            g.ellipse(cx, cy, Math.max(COIN_PIXELS, r * spin), r, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = G.faceColor;
            g.beginPath();
            g.ellipse(cx, cy, Math.max(COIN_PIXELS * 0.6, r * spin * 0.7), r * 0.7, 0, 0, Math.PI * 2);
            g.fill();
        }
    });
    coins = { canvas, cell, frames: COIN_FRAMES };
    return coins;
}

// Adaga parada, apontando para +x, com a origem no centro do sprite
const DAGGER_PIXELS = 2;
export const DAGGER_LENGTH = 30;    // unidades da adaga
export const DAGGER_WIDTH = 12;
let dagger = null;

export function getDaggerSprite() {
    if (dagger) return dagger;
    dagger = makeCanvas(DAGGER_LENGTH * DAGGER_PIXELS, DAGGER_WIDTH * DAGGER_PIXELS, (g) => {
        g.scale(DAGGER_PIXELS, DAGGER_PIXELS);
        g.translate(DAGGER_LENGTH / 2 - K.shape.centerX, DAGGER_WIDTH / 2);
        drawDagger(g, 0);
    });
    return dagger;
}
