import { createRandom } from './random.js';

// --- ATLAS DE ANIMAÇÃO E TRAÇOS (usados por cenários e por objetos) ---
// Movimento sem gastar memória: ver buildSpriteSheet. Quem desenha cenários também os encontra em scenery/scenery_kit.js.

export function makeCanvas(width, height, options) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    if (options) canvas.getContext('2d', options);
    return canvas;
}

// --- ATLAS DE ANIMAÇÃO (movimento sem gastar memória) ---
// Mesma técnica dos monstros do Last Torch: o desenho animado roda UMA vez por quadro de animação, na hora de montar o
// cenário, e cada quadro vai para um atlas pequeno. Em cena, cada coisa que balança é só um drawImage de um recorte
// do atlas: nada de traçar curvas a cada quadro, e o atlas inteiro ocupa poucas centenas de KB.
//
//   sheet = buildSpriteSheet({ cell: [largura, altura], anchor: [0.5, 0.5], frames, variants, res, seed,
//                              paint(g, r, phase, variant) })
//   cell      tamanho de uma célula em unidades do mundo; anchor = onde fica o "pé" da peça dentro dela (0 a 1)
//   frames    quantos quadros tem UM ciclo (o último volta ao primeiro: o ciclo é sem emenda)
//   variants  quantos desenhos diferentes (cada um é uma linha do atlas)
//   res       pixels por unidade do mundo (env.res): o atlas nasce na resolução em que será mostrado
//   paint     desenha UM quadro. g já está em unidades do mundo com a origem no pé da peça. phase vai de 0 a 1 (0 = início
//             do ciclo; use Math.sin(phase * Math.PI * 2) para balançar). r é um sorteio que recomeça igual em TODO
//             quadro da mesma variante: use-o para a forma (quantas folhas, que tamanho) e a forma não pula entre quadros.
export function buildSpriteSheet({ cell, anchor = [0.5, 0.5], frames, variants, res, seed, paint }) {
    const cw = Math.max(1, Math.ceil(cell[0] * res));
    const ch = Math.max(1, Math.ceil(cell[1] * res));
    const canvas = makeCanvas(cw * frames, ch * variants);
    const g = canvas.getContext('2d');
    for (let v = 0; v < variants; v++) {
        for (let f = 0; f < frames; f++) {
            g.setTransform(res, 0, 0, res, f * cw + anchor[0] * cell[0] * res, v * ch + anchor[1] * cell[1] * res);
            g.save();
            g.beginPath();
            g.rect(-anchor[0] * cell[0], -anchor[1] * cell[1], cell[0], cell[1]);
            g.clip();
            paint(g, createRandom(seed + v * 131), f / frames, v);
            g.restore();
        }
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    return { canvas, cw, ch, cell, anchor, frames, variants, bytes: canvas.width * canvas.height * 4 };
}

// Mostra um quadro do atlas com o pé em (x, y) do mundo, no tamanho `scale` (1 = tamanho da célula)
export function drawSheetFrame(ctx, sheet, variant, frame, x, y, scale = 1) {
    const w = sheet.cell[0] * scale;
    const h = sheet.cell[1] * scale;
    ctx.drawImage(sheet.canvas, frame * sheet.cw, variant * sheet.ch, sheet.cw, sheet.ch,
        x - sheet.anchor[0] * w, y - sheet.anchor[1] * h, w, h);
}

// Qual quadro mostrar: `cycleSeconds` é a duração do ciclo; `offset` (0 a 1) defasa uma peça das vizinhas
export function frameAt(sheet, t, cycleSeconds, offset) {
    const p = t / cycleSeconds - offset;
    return Math.floor((p - Math.floor(p)) * sheet.frames) % sheet.frames;
}

// Traço que afina: curva de (x0, y0) a (x1, y1) puxada por (cx, cy), largura w0 → w1
export function taper(g, x0, y0, cx, cy, x1, y1, w0, w1, color) {
    const n = 8;
    g.strokeStyle = color;
    g.lineCap = 'round';
    let px = x0;
    let py = y0;
    for (let i = 1; i <= n; i++) {
        const t = i / n;
        const u = 1 - t;
        const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
        const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
        g.lineWidth = w0 + (w1 - w0) * (t - 0.5 / n);
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(x, y);
        g.stroke();
        px = x;
        py = y;
    }
}
