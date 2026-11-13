// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/objects/torch/torch25d.js e rode o sync.
import { drawGlow } from '../../core/glow.js';
import { buildSpriteSheet, drawSheetFrame, frameAt } from '../../core/sprite_sheet.js';
import { TORCH25D_VISUALS as V } from './torch25d_visual.js';

// --- TOCHA 2,5D ---
// O objeto que o jogador defende: um poste de madeira fino com uma GAIOLA de fogo em cima (4 barras que se abrem no alto, um anel
// e o poste central em cruz), na câmera do jogo (um pouco de cima, como os bonecos 2.5D). Do tamanho do herói.
// Peças montadas UMA vez ao criar a tocha:
//   - a ESTRUTURA em dois sprites parados: o que fica atrás do fogo (sombra, poste, colar, barras de trás, o fogo visto pelos
//     vãos) e o que fica na frente (a cruz com o nó e as barras da frente), como na referência;
//   - o FOGO: um atlas de poucos quadros com a mistura da fogueira antiga (línguas que giram rente à cesta, miolo claro, brasas
//     que saem para os lados) e da chama nova (camadas que sobem). O mesmo método dos monstros e dos cenários.
// Em cena, a tocha inteira custa 4 drawImage: o brilho, a parte de trás, um quadro do fogo e a parte da frente.
//
//   const torch = createTorch25D({ res, frames });       // res = pixels por unidade do mundo; frames = quadros do fogo
//   torch.render(ctx, x, y, { flame, time });             // (x, y) = a base do poste no chão; flame = tamanho do fogo (0 a 1)
//
// O jogo decide o tamanho do fogo (no Last Torch ele encolhe com a vida da tocha) e o relógio; a arte não conhece o jogo.
// Ficha de como foi criada: art_reference/object.md.

const TAU = Math.PI * 2;

const poleX = (t) => V.pole.crook * Math.sin(t * Math.PI * 1.2 + 0.4);
const poleHalf = (t) => (V.pole.baseWidth + (V.pole.topWidth - V.pole.baseWidth) * t) / 2;
// Centro da boca da gaiola (onde o fogo nasce), em relação à base do poste
const rimY = () => -V.cage.top;

// Uma barra da gaiola no ângulo `a` (visto de cima): sobe do colar, encosta no anel e se abre para fora no alto, com a ponta
// virada (o "recorte de coroa" da referência). Contorno escuro largo por baixo, madeira por cima, fio de luz.
function bar(g, a) {
    const G = V.cage;
    const C = V.colors;
    const at = (r, y) => [Math.cos(a) * r, -y + Math.sin(a) * r * G.squash];
    const [x0, y0] = at(G.bottomR, G.bottom);
    const [x1, y1] = at(G.ringR, G.ring);
    const [x2, y2] = at(G.tipR, G.top);
    const [x3, y3] = at(G.tipR + 2.2, G.top + 1.6);           // a ponta virada para fora
    const path = () => {
        g.beginPath();
        g.moveTo(x0, y0);
        g.quadraticCurveTo(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2);
        g.quadraticCurveTo(x2, y2, x3, y3);
    };
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = C.outline;
    g.lineWidth = 3.2;
    path();
    g.stroke();
    g.strokeStyle = C.wood;
    g.lineWidth = 1.9;
    path();
    g.stroke();
    g.strokeStyle = C.woodLight;
    g.lineWidth = 0.6;
    path();
    g.stroke();
}

// Metade do anel do meio: 'back' (atrás do fogo) ou 'front' (na frente)
function ring(g, half) {
    const G = V.cage;
    const C = V.colors;
    const [from, to] = half === 'back' ? [Math.PI, TAU] : [0, Math.PI];
    [[C.outline, 3], [C.wood, 1.8], [C.woodLight, 0.6]].forEach(([color, width]) => {
        g.strokeStyle = color;
        g.lineWidth = width;
        g.beginPath();
        g.ellipse(0, -G.ring, G.ringR, G.ringR * G.squash, 0, from, to);
        g.stroke();
    });
}

// O que fica ATRÁS do fogo: sombra, poste, colar, barras de trás, metade de trás do anel e o fogo visto pelos vãos
function paintBack(g) {
    const C = V.colors;
    const G = V.cage;
    const H = V.pole.height;

    // Sombra no chão
    g.fillStyle = C.shadow;
    g.beginPath();
    g.ellipse(1.5, 1, 11, 5.5, 0, 0, TAU);
    g.fill();

    // Poste: contorno escuro, corpo e a faixa de luz no meio
    const N = 8;
    const pole = (inset) => {
        g.beginPath();
        g.moveTo(poleX(0) - poleHalf(0) * inset - 1.2 * inset, 0.6);
        for (let i = 0; i <= N; i++) g.lineTo(poleX(i / N) - poleHalf(i / N) * inset, -H * (i / N));
        for (let i = N; i >= 0; i--) g.lineTo(poleX(i / N) + poleHalf(i / N) * inset, -H * (i / N));
        g.lineTo(poleX(0) + poleHalf(0) * inset + 1.2 * inset, 0.6);
        g.closePath();
    };
    g.fillStyle = C.outline;
    pole(1.35);
    g.fill();
    const body = g.createLinearGradient(0, 0, 0, -H);
    body.addColorStop(0, C.poleDark);
    body.addColorStop(1, C.poleMid);
    g.fillStyle = body;
    pole(1);
    g.fill();
    g.fillStyle = C.poleLit;
    g.globalAlpha = 0.75;
    pole(0.32);
    g.fill();
    g.globalAlpha = 1;

    // O fogo visto pelos vãos: o "miolo" da gaiola, do colar até a boca, aceso
    const glow = g.createRadialGradient(0, -G.ring, 0, 0, -G.ring, G.tipR * 1.1);
    glow.addColorStop(0, C.fireHot);
    glow.addColorStop(0.55, C.fireWarm);
    glow.addColorStop(1, C.fireEdge);
    g.fillStyle = glow;
    g.beginPath();
    g.moveTo(-G.bottomR, -G.bottom);
    g.quadraticCurveTo(-G.ringR, -G.ring, -G.tipR * 0.92, -G.top);
    g.ellipse(0, -G.top, G.tipR * 0.92, G.tipR * 0.92 * G.squash, 0, Math.PI, TAU);
    g.quadraticCurveTo(G.ringR, -G.ring, G.bottomR, -G.bottom);
    g.closePath();
    g.fill();

    // Barras de trás e metade de trás do anel (o fogo passa na frente delas)
    [Math.PI * 1.25, Math.PI * 1.75].forEach(a => bar(g, a));
    ring(g, 'back');

    // Colar decorado prendendo a gaiola ao poste
    g.fillStyle = C.outline;
    g.beginPath();
    g.ellipse(poleX(1), -H - 1, G.bottomR * 0.75 + 1.2, (G.bottomR * 0.75 + 1.2) * G.squash + 1, 0, 0, TAU);
    g.fill();
    g.fillStyle = C.collar;
    g.beginPath();
    g.ellipse(poleX(1), -H - 1, G.bottomR * 0.75 + 0.5, (G.bottomR * 0.75 + 0.5) * G.squash + 0.5, 0, 0, TAU);
    g.fill();
    g.fillStyle = C.woodLight;
    g.globalAlpha = 0.6;
    g.fillRect(poleX(1) - G.bottomR * 0.55, -H - 1.6, G.bottomR * 1.1, 0.6);
    g.globalAlpha = 1;
}

// O que fica NA FRENTE do fogo: a cruz (o poste central com o nó), a metade da frente do anel e as barras da frente
function paintFront(g) {
    const G = V.cage;
    const C = V.colors;
    const tipY = -G.top - G.postTip;
    [[C.outline, 3], [C.wood, 1.8], [C.woodLight, 0.6]].forEach(([color, width]) => {
        g.strokeStyle = color;
        g.lineWidth = width;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(0, -G.bottom);
        g.lineTo(0, tipY);
        g.stroke();
    });
    g.fillStyle = C.outline;
    g.beginPath();
    g.arc(0, tipY - 0.6, 1.6, 0, TAU);
    g.fill();
    g.fillStyle = C.wood;
    g.beginPath();
    g.arc(0, tipY - 0.6, 0.9, 0, TAU);
    g.fill();
    ring(g, 'front');
    [Math.PI * 0.25, Math.PI * 0.75].forEach(a => bar(g, a));
}

// Um quadro do fogo (phase de 0 a 1; o último emenda com o primeiro). r recomeça igual em todo quadro: a forma não pula.
// Tudo o que mexe usa frequências inteiras do ciclo: o laço é sem emenda.
function paintFire(g, r, phase) {
    const F = V.flame;
    const rx = V.cage.tipR * 0.95;
    const ry = rx * V.cage.squash;
    const p = phase * TAU;

    // 1. Da fogueira antiga: línguas deitadas que giram e pulsam rente à boca da cesta
    for (let i = 0; i < F.swirl; i++) {
        const a = (i / F.swirl) * TAU + 0.35 * Math.sin(p + i);
        const wobble = 0.7 + 0.3 * Math.sin(p * 2 + i * 1.7);
        const len = rx * 0.55 * wobble;
        g.fillStyle = F.swirlColors[i % F.swirlColors.length];
        g.beginPath();
        g.ellipse(Math.cos(a) * len * 0.55, Math.sin(a) * len * 0.55 * (ry / rx), len * 0.9, len * 0.5 * (ry / rx) + 1, a * (ry / rx), 0, TAU);
        g.fill();
    }

    // 2. Da chama nova: camadas que sobem, do vermelho ao quase branco. Cada língua tem o seu ritmo (1, 2 ou 3 vezes por ciclo,
    //    sempre inteiro: o laço emenda) para crescer, encolher e balançar; a base respira. Assim o formato muda de verdade.
    const K = F.tongues;
    const breath = 1 + F.breathe * Math.sin(p * 2 + 0.6);
    const w = F.width * breath;
    const h = F.height;
    const tongues = Array.from({ length: K }, (_, i) => {
        const u = K === 1 ? 0 : (i / (K - 1)) * 2 - 1;
        return { u, h: h * (0.55 + 0.35 * r()) * (1 - Math.abs(u) * 0.35), ph: r() * TAU, wd: 0.45 + 0.1 * r(), beat: 1 + (i % 3) };
    });
    tongues[Math.floor(K / 2)].h = h * (0.95 + 0.08 * r());
    const shaped = tongues.map(t => {
        const grow = 1 + F.stretch * Math.sin(p * t.beat + t.ph);
        const sway = F.sway * w * Math.sin(p * t.beat + t.ph * 1.7) * (t.h / h);
        const drift = 0.12 * w * Math.sin(p + t.ph);              // a língua inteira escorrega um pouco para o lado
        return { x: t.u * w * 0.7 + drift, tipX: t.u * w * 0.7 + drift + sway, h: t.h * grow, wd: w * t.wd };
    });
    F.colors.forEach((color, layer) => {
        const s = F.scales[layer];
        const pts = [[-w, 1]];
        shaped.forEach((t, i) => {
            if (i === 0) pts.push([t.x - t.wd, -h * 0.3]);
            pts.push([t.tipX, -t.h]);
            const next = shaped[i + 1];
            pts.push(next ? [(t.x + next.x) / 2, -h * (0.3 + 0.06 * Math.sin(p * 2 + i))] : [t.x + t.wd, -h * 0.3]);
        });
        pts.push([w, 1]);
        g.save();
        g.translate(0, 1.5 * (1 - s));
        g.scale(s, s);
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length - 1; i++) {
            g.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
        }
        g.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
        g.closePath();
        g.fill();
        g.restore();
    });

    // 3. Miolo claro (da fogueira antiga), pulsando
    const core = g.createRadialGradient(0, -2, 0, 0, -2, 7);
    const beat = 0.85 + 0.15 * Math.sin(p * 3);
    core.addColorStop(0, `rgba(255, 247, 237, ${0.95 * beat})`);
    core.addColorStop(0.45, `rgba(253, 230, 138, ${0.6 * beat})`);
    core.addColorStop(1, 'rgba(253, 230, 138, 0)');
    g.fillStyle = core;
    g.fillRect(-7, -9, 14, 14);

    // 4. Brasas que saem para os lados e sobem (da fogueira antiga)
    g.fillStyle = F.emberColor;
    for (let k = 0; k < F.embers; k++) {
        const s = (phase + k / F.embers) % 1;
        const a = k * 2.399;
        const d = 5 + s * 20;
        g.globalAlpha = (1 - s) * 0.9;
        g.beginPath();
        g.arc(Math.cos(a) * d, Math.sin(a) * d * (ry / rx) - s * 16, 1.4 * (1 - s * 0.6), 0, TAU);
        g.fill();
    }
    g.globalAlpha = 1;
}

// Cria a tocha na resolução `res` (pixels por unidade do mundo). Recrie quando a resolução ou o detalhe mudarem.
export function createTorch25D({ res, frames = V.frames[0] }) {
    const G = V.cage;
    const k = V.size ?? 1;                 // tamanho geral: entra no desenho e nas células (o atlas nasce nítido, sem esticar)
    const up = G.top + G.postTip + 4;
    const cell = [(G.tipR * 2 + 12) * k, (up + 8) * k];
    const anchor = [0.5, up / (up + 8)];
    const scaled = (paint) => (g, r, phase) => { g.scale(k, k); paint(g, r, phase); };
    const back = buildSpriteSheet({ cell, anchor, frames: 1, variants: 1, res, seed: 11, paint: scaled(paintBack) });
    const front = buildSpriteSheet({ cell, anchor, frames: 1, variants: 1, res, seed: 12, paint: scaled(paintFront) });
    const fireW = Math.max(G.tipR * 3, V.flame.width * (2 + V.flame.breathe * 2 + V.flame.sway) + 14, 46);
    const fireUp = V.flame.height * (1 + V.flame.stretch) + 20;
    const fireDown = 10;
    const fire = buildSpriteSheet({
        cell: [fireW * k, (fireUp + fireDown) * k], anchor: [0.5, fireUp / (fireUp + fireDown)], frames, variants: 1, res, seed: 23, paint: scaled(paintFire)
    });
    return {
        bytes: back.bytes + front.bytes + fire.bytes,
        // (x, y) = a base do poste no chão. flame: tamanho do fogo (1 = cheio, perto de 0 = quase apagado)
        render(ctx, x, y, { flame: size = 1, time = 0 } = {}) {
            const fireY = y + rimY() * k;
            const flicker = 1 + Math.sin(time * 17) * 0.08 + Math.sin(time * 31) * 0.06;
            ctx.globalCompositeOperation = 'lighter';
            drawGlow(ctx, V.halo.color, x, fireY - 4 * k, V.halo.radius * k * size * flicker, V.halo.alpha);
            ctx.globalCompositeOperation = 'source-over';
            // Atrás do fogo (poste, colar, barras de trás), o fogo, e na frente dele a cruz e as barras da frente
            drawSheetFrame(ctx, back, 0, 0, x, y, 1);
            drawSheetFrame(ctx, fire, 0, frameAt(fire, time, V.flame.cycleSeconds, 0), x, fireY, size);
            drawSheetFrame(ctx, front, 0, 0, x, y, 1);
        }
    };
}
