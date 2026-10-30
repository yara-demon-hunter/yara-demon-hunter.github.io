import { ctx } from '../../core/state.js';

// --- CARIMBOS ---
// Sprites girados sem ctx.save/restore por objeto, que é caro quando repetido dezenas de vezes por
// quadro: a transformação do mundo fica guardada aqui e cada carimbo escreve a sua direto.
const view = { scale: 1, x: 0, y: 0 };

export function setWorldView(scale, x, y) {
    view.scale = scale;
    view.x = x;
    view.y = y;
    ctx.setTransform(scale, 0, 0, scale, x, y);
}

export function getWorldView() {
    return view;
}

// Volta à transformação do mundo (chamar depois de uma série de carimbos)
export function resetWorldView() {
    ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
}

// Recorte (sx, sy, sw, sh) da imagem, centrado em (x, y) no mundo, girado e com o tamanho dw x dh
export function stamp(image, sx, sy, sw, sh, x, y, rotation, dw, dh) {
    const c = Math.cos(rotation) * view.scale;
    const s = Math.sin(rotation) * view.scale;
    ctx.setTransform(c, s, -s, c, view.x + x * view.scale, view.y + y * view.scale);
    ctx.drawImage(image, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
}
