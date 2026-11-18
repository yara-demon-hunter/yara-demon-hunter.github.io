import { HEARTH_PHOENIX_VISUALS as V } from './hearth_phoenix_visual.js';
import { drawGlow } from '../../core/glow.js';
import { renderNow } from '../../core/clock.js';

// --- FÊNIX DA TOCHA (buddy) ---
// A fênix de fogo, asas abertas batendo e a ave inteira em chamas, paira junto da fogueira. O desenho é 3D procedural feito no Laboratório
// (tools/lab/fenix_foto.js: penas PBR, chamas e fagulhas sem estado) e gravado em atlas: um por paleta, 'fire' e 'blue' (Blue Torch).
// Cada atlas é uma linha de quadros com fundo transparente (no Laboratório o preto vira alfa: a chama aparece mesmo sobre o chão claro).
// Olhando para a direita, com a ave no centro do quadro. Ficha: art_reference/buddy.md.
const atlases = {};
const base = import.meta.url.includes('/library/') ? new URL('./', import.meta.url).href : new URL('library/buddies/hearth_phoenix/', document.baseURI).href;

// Começa a carregar o atlas da paleta ('fire' ou 'blue'); até chegar, só o brilho aparece. `mobile` não muda nada (os quadros já são pequenos).
export function prepareHearthPhoenix(kind = 'fire') {
    if (atlases[kind]) return atlases[kind];
    const image = new Image();
    atlases[kind] = { image, ready: false };
    image.onload = () => { atlases[kind].ready = true; };
    image.src = new URL(V.atlas[kind], base).href;
    return atlases[kind];
}

// De que lado se vê a ave, pela direção do voo (dx, dy na tela, y para baixo): 0 lado, 1 frente-lado, 2 frente, 3 costas-lado, 4 costas
export function hearthPhoenixView(dx, dy) {
    const a = Math.atan2(dy, Math.abs(dx)) / (Math.PI / 2); // -1 (sobe) a 1 (desce)
    const m = Math.abs(a);
    if (m < 0.25) return 0;
    if (m < 0.75) return a > 0 ? 1 : 3;
    return a > 0 ? 2 : 4;
}

export function drawHearthPhoenixSprite(g, x, y, size, facing, tilt, kind = 'fire', alpha = 1, view = 0) {
    const atlas = prepareHearthPhoenix(kind);
    if (!atlas.ready) return;
    const frame = Math.floor(renderNow() / 1000 * V.framesPerSecond) % V.frames;
    const side = V.size * size;
    g.save();
    g.translate(x, y);
    g.rotate(tilt);
    g.scale(facing, 1);
    g.globalAlpha = alpha;
    g.drawImage(atlas.image, frame * V.cell, view * V.cell, V.cell, V.cell, -side / 2, -side / 2, side, side);
    g.restore();
}

// De onde sai a bola de fogo (o bico)
export function hearthPhoenixBeak(x, y, facing, view = 0) {
    const b = V.beak[view];
    return { x: x + facing * b.x, y: y + b.y };
}

// A ave em campo: brilho grande, a ave em chamas e brasas subindo. bird: { x, y, facing, tilt, flash, rise }; kind: 'fire' | 'blue'
export function renderHearthPhoenix(g, bird, kind = 'fire', quality = 0) {
    const P = V.palettes[kind];
    const { x, y, facing, tilt, flash, rise } = bird;
    const view = bird.view ?? 0;
    const t = renderNow() / 1000;
    const hot = Math.max(0, 1 - rise) + (flash > 0 ? 0.6 : 0);
    g.save();
    g.globalCompositeOperation = 'lighter';
    drawGlow(g, P.glow, x, y, 58 + Math.sin(t * 4.5) * 4 + hot * 34, 0.7);
    if (hot > 0) drawGlow(g, P.glowHot, x, y - 4, 22 + hot * 18, Math.min(1, hot));
    const embers = quality >= 2 ? 3 : V.embers;
    for (let i = 0; i < embers; i++) {
        const u = (t * 0.45 + i / embers) % 1;
        drawGlow(g, P.glowHot, x + Math.sin(t * 2.4 + i * 2.1) * (10 + u * 12), y - 10 - u * 52, 3.2 * (1 - u) + 0.8, 0.85 * (1 - u));
    }
    g.restore();
    drawHearthPhoenixSprite(g, x, y, 0.2 + 0.8 * Math.min(1, rise) ** 0.6, facing, tilt, kind, 1, view);
    if (flash > 0) {
        const beak = hearthPhoenixBeak(x, y, facing, view);
        g.save();
        g.globalCompositeOperation = 'lighter';
        drawGlow(g, P.glowHot, beak.x, beak.y, 14, 1);
        g.restore();
    }
}
