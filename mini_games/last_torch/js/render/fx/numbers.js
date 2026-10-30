import { JUICE_VISUALS as J } from '../../../data_model/visuals/effects/juice_visual.js';
import { ctx } from '../../core/state.js';

// --- NÚMEROS EM ATLAS ---
// Texto com contorno é das coisas mais caras do canvas. Os algarismos são desenhados uma vez, por
// estilo, e os números de dano são montados carimbando esses recortes.
const GLYPHS = '0123456789+-';
const PIXELS = 2;                   // resolução do atlas em relação ao tamanho no mundo
const atlases = new Map();

function buildAtlas(style) {
    const cell = Math.ceil(style.size * 1.5);
    const canvas = document.createElement('canvas');
    canvas.width = cell * PIXELS * GLYPHS.length;
    canvas.height = cell * PIXELS;
    const g = canvas.getContext('2d');
    g.scale(PIXELS, PIXELS);
    g.font = style.font;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    g.lineWidth = J.number.outlineWidth;
    g.strokeStyle = J.number.outline;
    g.fillStyle = style.color;
    [...GLYPHS].forEach((glyph, i) => {
        g.strokeText(glyph, (i + 0.5) * cell, cell / 2);
        g.fillText(glyph, (i + 0.5) * cell, cell / 2);
    });
    return { canvas, cell, advance: style.size * 0.66 };
}

function getAtlas(styleKey) {
    let atlas = atlases.get(styleKey);
    if (!atlas) {
        atlas = buildAtlas(J.numberStyles[styleKey]);
        atlases.set(styleKey, atlas);
    }
    return atlas;
}

function drawGlyph(atlas, index, x, y, cellSize) {
    const source = atlas.cell * PIXELS;
    ctx.drawImage(atlas.canvas, index * source, 0, source, source, x - cellSize / 2, y - cellSize / 2, cellSize, cellSize);
}

// Número centrado em (x, y). sign: 0 = nenhum, 1 = +, -1 = -. Não cria strings a cada quadro.
export function drawNumber(value, sign, x, y, styleKey, scale = 1) {
    const atlas = getAtlas(styleKey);
    const n = Math.max(0, Math.round(value));
    let digits = 1;
    for (let v = n; v >= 10; v = Math.floor(v / 10)) digits++;
    const count = digits + (sign ? 1 : 0);
    const advance = atlas.advance * scale;
    const cellSize = atlas.cell * scale;

    let cx = x + ((count - 1) * advance) / 2;
    let rest = n;
    for (let i = 0; i < digits; i++) {
        drawGlyph(atlas, rest % 10, cx, y, cellSize);
        rest = Math.floor(rest / 10);
        cx -= advance;
    }
    if (sign) drawGlyph(atlas, sign > 0 ? 10 : 11, cx, y, cellSize);
}
