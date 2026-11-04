import { BLOB_SPRITE as B, COIN_SPRITE as C, ITEM_SPRITE as I } from '../../data_model/visuals/sprites.js';
import { ctx } from '../core/canvas.js';
import { state } from '../core/state.js';
import { getBlobSprite, getCoinAtlas, getItemSprite } from './fx/sprites.js';

// --- MOEDAS, ITENS E MASSA NO CHÃO: sprites carimbados ---
export function drawPickups() {
    const f = state.frameCount;

    const coin = getCoinAtlas();
    state.spawnableCoins.forEach(c => {
        const y = c.y + Math.sin(f * C.bobSpeed + c.x) * C.bobAmount;
        const frame = Math.floor(f / C.spinFrames + c.x) % coin.frames;
        const size = c.radius * C.sizeInRadii;
        ctx.drawImage(coin.canvas, frame * coin.cell, 0, coin.cell, coin.cell, c.x - size / 2, y - size / 2, size, size);
    });

    state.airDrops.forEach(p => {
        const item = getItemSprite(p.type);
        const size = p.radius * I.sizeInRadii;
        const y = p.y + Math.sin(f * I.bobSpeed + p.x) * I.bobAmount;
        ctx.drawImage(item.canvas, p.x - size / 2, y - size / 2, size, size);
    });

    state.massBlobs.forEach(b => {
        if (b.life < B.blinkBelowFrames && f % 10 < 5) return;
        const sprite = getBlobSprite(b.color);
        const w = Math.sin(f * B.wobbleSpeed + b.wob) * B.wobbleAmount;
        const sw = b.r * 2.4 * (1 + w);
        const sh = b.r * 2.4 * (0.75 - w);
        ctx.drawImage(sprite, b.x - sw / 2, b.y - sh / 2, sw, sh);
    });
}
