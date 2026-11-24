// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/slizork/slizork25d.js e rode o sync.
import { SLIZORK_25D_VISUALS as S } from './slizork25d_visual.js';
import { registerCreature, glowAt } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';

const TAU = Math.PI * 2;
const CLAW_SECONDS = 0.95;       // dura o golpe de garra (boss_ai.js: padrão 'rake' guarda e.clawAt)
let clawSide = 1;                // qual mão corta (1 ou -1)
let clawP = 0;                   // andamento do golpe de garra (0 = parado, 0 a 1 = preparando, golpeando, recolhendo)

// --- SLIZORK, O TIRANO DE LODO, 2.5D (chefe) ---
// Gosma gigante com cara de chefe: poça escura, pseudópodes em volta, corpo em camadas que aperta e estica, ossos e crânios engolidos, bolhas subindo,
// braços de gosma com punhos, olhos amarelos furiosos sob sobrancelhas grossas, boca larga com dentes e uma coroa enferrujada. Medidas e cores: slizork25d_visual.js.
function parts(pose, rig) {
    const { C, project, ball, limb } = rig;
    const t = pose.t;
    const w = Math.sin(t * S.wobbleHz * TAU);
    const sx = 1 + S.wobble * w;
    const R = S.bodyR;
    const zc = R * 0.85 + 0.8 - S.wobble * w * 1.2;
    const items = [];

    // Pseudópodes arrastando em volta
    for (let i = 0; i < S.blobs; i++) {
        const a = (i / S.blobs) * TAU + 0.4;
        const reach = R * (1.02 + 0.2 * Math.sin(t * TAU + i * 1.7));
        const b = { p: [Math.cos(a) * reach * sx, Math.sin(a) * reach, 2 + 0.7 * Math.sin(t * TAU * 2 + i)], r: R * (0.42 + 0.1 * Math.sin(i * 2.3)) };
        items.push({ depth: project(0, 0, zc).depth - 0.8, draw() { ball(b.p, b.r + 0.4, C.outline); ball(b.p, b.r, C.bodyDark); ball([b.p[0], b.p[1], b.p[2] + b.r * 0.35], b.r * 0.6, C.body); } });
    }
    // Corpo
    items.push({
        depth: project(0, 0, zc).depth,
        draw() {
            glowAt(rig, [0, 0, zc], C.glow, R * 2.1, 0.45);
            ball([0, 0, zc], R + 0.5, C.outline);
            ball([0, 0, zc], R, C.bodyDark);
            ball([0.4, 0, zc + R * 0.18], R * 0.88, C.body);
            ball([0.8, 0, zc + R * 0.5], R * 0.56, C.bodyLight);
            // Ossos e crânios engolidos
            ball([-1.8, 1.4, zc + 0.6], 2.2, C.skull);
            ball([-1.1, -2.3, zc - 1.2], 1.5, C.skull);
            limb([[-3.4, -1.2, zc - 1.8], [-1.0, 1.0, zc - 2.6]], 0.55, C.bone);
            limb([[-2.8, 2.6, zc - 0.8], [-0.6, 3.1, zc - 2.2]], 0.5, C.bone);
            // Bolhas subindo
            for (let i = 0; i < S.bubbles; i++) {
                const k = (t + i / S.bubbles) % 1;
                const a = i * 2.4;
                ball([Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.55, zc - R * 0.55 + k * R * 1.5], 0.35 + (i % 3) * 0.16, C.bubble);
            }
            // Brilho molhado
            limb([[-0.5, -R * 0.5, zc + R * 0.9], [0.5, -R * 0.15, zc + R * 1.0]], 0.9, C.shine);
            ball([0.3, -R * 0.62, zc + R * 0.7], 0.7, C.shine);
        }
    });
    // Braços de gosma com punhos, ao lado do corpo (levantam e baixam)
    for (const sd of [-1, 1]) {
        const lift = Math.sin(t * TAU + (sd > 0 ? Math.PI : 0)) * 0.9;
        // Golpe de garra com UMA mão (a que e.clawSide escolhe; alterna a cada golpe): 0 a 0,45 ergue a mão para trás e para fora, 0,45 a 0,65
        // CORTA na diagonal, de fora para dentro e para baixo, cruzando a frente do corpo (rápido), depois volta ao repouso. A outra mão fica parada.
        const rest = [R * 0.9, sd * R * 1.15, zc - R * 0.2 + lift];
        let hand = rest;
        if (clawP > 0 && sd === clawSide) {
            const A = [R * 0.55, sd * R * 1.7, zc + R * 0.95];             // mão no alto, aberta
            const B = [R * 2.25, -sd * R * 0.8, zc - R * 0.55];            // fim do corte: à frente, do outro lado, embaixo
            const mixp = (u, v, k) => u.map((n, a) => n + (v[a] - n) * k);
            const ease = (k) => k * k * (3 - 2 * k);
            if (clawP < 0.45) hand = mixp(rest, A, ease(clawP / 0.45));
            else if (clawP < 0.65) hand = mixp(A, B, (clawP - 0.45) / 0.2);
            else hand = mixp(B, rest, ease((clawP - 0.65) / 0.35));
        }
        items.push({
            depth: project(...hand).depth + 0.3,
            draw() {
                limb([[R * 0.2, sd * R * 0.75, zc + R * 0.1], [R * 0.6, sd * R * 1.05, zc - R * 0.05 + lift * 0.5], hand], 3.1, C.outline);
                limb([[R * 0.2, sd * R * 0.75, zc + R * 0.1], [R * 0.6, sd * R * 1.05, zc - R * 0.05 + lift * 0.5], hand], 2.5, C.body);
                // Garras de espada CURVAS: três dedos compridos e o polegar (mais curto, do lado de dentro, apontando para dentro). As lâminas se curvam
                // para dentro como um alfange e ficam mexendo: mais ainda quando ele anda (pose.run)
                ball(hand, 2.0, C.outline);
                ball(hand, 1.7, C.bodyDark);
                const CLAWS = [{ o: 1.5, L: 10.5, c: 3.2, fan: 0.04 }, { o: 0.15, L: 11.5, c: 3.4, fan: 0 }, { o: -1.2, L: 10.5, c: 3.2, fan: -0.04 }, { o: -2.9, L: 7, c: 2.6, fan: -0.3 }];
                CLAWS.forEach((cl, idx) => {
                    const run = pose.run ?? 0;
                    const wig = Math.sin(t * TAU * (1 + run * 1.5) + idx * 1.3 + (sd > 0 ? 0 : 2.2)) * (0.25 + 0.65 * run);
                    const pts = [];
                    for (let q = 0; q <= 4; q++) {
                        const k = q / 4;
                        const lat = cl.o + cl.fan * cl.L * k - cl.c * k * k + wig * k * 1.8;
                        pts.push([hand[0] + 0.8 + cl.L * k * (1 - 0.08 * k), hand[1] + sd * lat, hand[2] + 0.2 + Math.abs(wig) * k * 0.7]);
                    }
                    // Lâmina em duas metades (larga na base, fina na ponta): poucas peças, porque são 8 lâminas por quadro
                    const col = idx === 3 ? C.bladeDark : C.blade;
                    limb(pts.slice(0, 3), 2.4, C.outline);
                    limb(pts.slice(0, 3), 1.8, col);
                    limb(pts.slice(2), 1.6, C.outline);
                    limb(pts.slice(2), 0.95, col);
                });
            }
        });
    }
    // Rosto, dentes, coroa e gotas, na frente
    items.push({
        depth: project(R * 0.8, 0, zc).depth + 0.5,
        draw() {
            // Boca escancarada, SEM dentes: um buraco fundo e verde-escuro, com lábios de gosma e fios grossos esticados entre o de cima e o de baixo
            const my = zc - R * 0.22;
            for (let i = -5; i <= 5; i++) {
                const a = Math.abs(i);
                const r = R * (0.24 - a * 0.012);
                ball([R * 0.96, i * R * 0.095, my - a * R * 0.015], r + 0.35, C.outline);
                ball([R * 0.98, i * R * 0.095, my - a * R * 0.015], r, C.mouth);
            }
            for (let i = -3; i <= 3; i++) ball([R * 0.99, i * R * 0.11, my - R * 0.13 - Math.abs(i) * R * 0.015], R * 0.1, C.mouthDeep);
            // Lábios de gosma, brilhando em volta da boca
            for (let i = -5; i <= 5; i++) {
                const a = Math.abs(i);
                ball([R * 1.0, i * R * 0.1, my + R * (0.24 - a * 0.012)], R * 0.07 + 0.2, C.bodyLight);
                ball([R * 1.0, i * R * 0.1, my - R * (0.24 - a * 0.012) - a * R * 0.015], R * 0.07 + 0.2, C.body);
            }
            // Fios de gosma esticados de cima para baixo, balançando
            for (const [fx, sag] of [[-0.34, 0.9], [-0.1, 1.5], [0.14, 1.1], [0.38, 0.8]]) {
                const x = R * fx;
                const top = [R * 1.02, x, my + R * 0.21];
                const bot = [R * 1.02, x + Math.sin(t * TAU + fx * 9) * 0.35, my - R * 0.24];
                const mid = [R * 1.04, (top[1] + bot[1]) / 2 + Math.sin(t * TAU * 2 + fx * 5) * 0.2, (top[2] + bot[2]) / 2 - sag * 0.15];
                limb([top, mid, bot], 1.5, C.outline);
                limb([top, mid, bot], 1.05, C.bodyLight);
                limb([top, mid, bot], 0.35, C.shine);
            }
            // Muitos olhos vermelhos, brasas que surgem e somem na superfície, com duas sobrancelhas grossas nos maiores
            const EYES = [[0.8, -0.4, 0.38, 1.35], [0.8, 0.4, 0.38, 1.35], [0.55, -0.72, 0.1, 0.8], [0.55, 0.7, 0.05, 0.85], [0.35, -0.2, 0.78, 0.7], [0.3, 0.3, 0.7, 0.62], [0.5, 0.05, -0.1, 0.6]];
            EYES.forEach(([ex, ey, ez, er], k) => {
                const on = Math.max(0, Math.min(1, 1.7 * Math.sin(t * TAU * (k % 2 + 1) + k * 2.1) + 0.9));   // alguns piscam e somem
                if (k > 1 && on <= 0.05) return;
                const eye = [R * ex, R * ey, zc + R * ez];
                glowAt(rig, eye, C.eyeGlow, 2.6 * er, 0.8 * (k > 1 ? on : 1));
                ball(eye, er + 0.3, C.outline);
                ball(eye, er, C.eye);
                ball([eye[0] + er * 0.4, eye[1], eye[2]], er * 0.35, C.pupil);
            });
            // Gosma caindo da boca: fios que alongam e soltam gotas, em vários pontos do lábio de baixo
            const lipZ = my - R * 0.3;
            for (let i = 0; i < S.drips + 3; i++) {
                const k = (t + i / (S.drips + 3)) % 1;
                const y = (i - (S.drips + 2) / 2) * R * 0.16;
                const x = R * (1.0 + 0.04 * (i % 2));
                const len = R * (0.2 + 0.55 * k);
                limb([[x, y, lipZ], [x + 0.1, y, lipZ - len]], 1.1 * (1 - k * 0.5) + 0.3, C.drip);
                ball([x + 0.1, y, lipZ - len - 0.25], 0.55 * (1 - k * 0.4), C.drip);
            }
        }
    });
    // A coroa é uma peça à parte: o corpo nunca a cobre, de nenhum ângulo (antes ela sumia atrás do corpo quando ele virava)
    {
        const cz0 = zc + R * 0.98;
        items.push({
            depth: project(-0.2, 0, cz0).depth + 3,
            draw() {
                // Coroa: um ANEL de ouro com pontas, vazado no meio (o buraco dá profundidade: por dentro se vê a gosma), pousada no alto da cabeça
                const cz = zc + R * 0.98;
                const cx = -0.2, cr = R * 0.42, N = 14;
                const ring = [];
                for (let q = 0; q < N; q++) {
                    const a = (q / N) * TAU;
                    ring.push([cx + Math.cos(a) * cr, Math.sin(a) * cr, cz + Math.sin(a * 2) * 0.12]);
                }
                for (const p of ring) ball(p, 1.0 + 0.3, C.crownDark);
                for (const p of ring) ball(p, 1.0, C.crown);
                for (let q = 0; q < N; q += 2) {                       // sete pontas em cima do anel
                    const p = ring[q];
                    const tip = [p[0], p[1], p[2] + 2.9 + (q % 4 === 0 ? 0.9 : 0)];
                    limb([[p[0], p[1], p[2] + 0.4], tip], 1.9, C.crownDark);
                    limb([[p[0], p[1], p[2] + 0.4], tip], 1.3, C.crown);
                    ball(tip, 0.35, C.crownLight);
                }
            }
        });
    }
    return items;
}

registerCreature('slizork', S, parts);

export function renderSlizork25D(e) {
    const p = e.clawAt ? (performance.now() - e.clawAt) / (CLAW_SECONDS * 1000) : 0;
    clawP = p > 0 && p < 1 ? p : 0;
    clawSide = e.clawSide ?? 1;
    renderMonster25D(e, 'slizork', S);
}
