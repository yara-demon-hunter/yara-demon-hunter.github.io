import { SLIZORK_25D_VISUALS as S } from './slizork25d_visual.js';
import { registerCreature, glowAt } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';

const TAU = Math.PI * 2;
const CLAW_SECONDS = 0.95;       // dura o golpe de garra (boss_ai.js: padrão 'rake' guarda e.clawAt)
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
        // Golpe de garra: 0 a 0,45 ergue os braços para trás, 0,45 a 0,65 varre para a frente e para baixo (rápido), depois recolhe
        let raise = 0, fwd = 0;
        if (clawP > 0) {
            if (clawP < 0.45) raise = clawP / 0.45;
            else if (clawP < 0.65) { const k = (clawP - 0.45) / 0.2; raise = 1 - k * 1.6; fwd = k; }
            else { const k = (clawP - 0.65) / 0.35; raise = -0.6 * (1 - k); fwd = 1 - k; }
        }
        const hand = [R * 0.9 + fwd * R * 1.0 - raise * R * 0.1, sd * R * (1.15 - fwd * 0.5), zc - R * 0.2 + lift + raise * R * 0.95];
        items.push({
            depth: project(...hand).depth + 0.3,
            draw() {
                limb([[R * 0.2, sd * R * 0.75, zc + R * 0.1], [R * 0.6, sd * R * 1.05, zc - R * 0.05 + lift * 0.5], hand], 3.1, C.outline);
                limb([[R * 0.2, sd * R * 0.75, zc + R * 0.1], [R * 0.6, sd * R * 1.05, zc - R * 0.05 + lift * 0.5], hand], 2.5, C.body);
                // Garras de espada: três lâminas enferrujadas e serrilhadas fundidas na gosma
                ball(hand, 2.0, C.outline);
                ball(hand, 1.7, C.bodyDark);
                for (let b = -1; b <= 1; b++) {
                    const tip = [hand[0] + 6.5 + (b === 0 ? 1.5 : 0), hand[1] + sd * (2 + b * 2.2), hand[2] + 0.4 - Math.abs(b) * 0.3];
                    limb([hand, tip], 1.5, C.outline);
                    limb([hand, tip], 1.0, b === 0 ? C.blade : C.bladeDark);
                    limb([[hand[0] + 1.5, hand[1], hand[2]], [tip[0] - 1, tip[1], tip[2]]], 0.3, C.rust);
                }
            }
        });
    }
    // Rosto, dentes, coroa e gotas, na frente
    items.push({
        depth: project(R * 0.8, 0, zc).depth + 0.5,
        draw() {
            // Boca escancarada: interior vinho escuro com língua e MUITAS presas (uma fileira em cima e outra embaixo), em vez de um buraco preto
            const my = zc - R * 0.2;
            for (let i = -4; i <= 4; i++) {
                const a = Math.abs(i);
                ball([R * 0.97, i * R * 0.1, my - a * R * 0.012], R * (0.2 - a * 0.012) + 0.3, C.outline);
                ball([R * 0.99, i * R * 0.1, my - a * R * 0.012], R * (0.2 - a * 0.012), C.mouth);
            }
            ball([R * 0.95, 0, my - R * 0.1], R * 0.17, C.tongue);
            ball([R * 0.98, 0, my - R * 0.06], R * 0.1, C.tongueLight);
            for (let i = -4; i <= 4; i++) {
                const a = Math.abs(i), x = i * R * 0.1;
                const up = R * (0.2 + (4 - a) * 0.035);           // presas de cima: maiores no meio
                const upBase = [R * 1.06, x, my + R * 0.19 - a * R * 0.012];
                limb([upBase, [upBase[0] + 0.15, x * 1.02, upBase[2] - up * 0.55]], 0.95, C.outline);
                limb([upBase, [upBase[0] + 0.15, x * 1.02, upBase[2] - up * 0.55]], 0.7, C.tooth);
                limb([[upBase[0] + 0.15, x * 1.02, upBase[2] - up * 0.5], [upBase[0] + 0.2, x * 1.03, upBase[2] - up]], 0.4, C.tooth);
                if (i % 2 === 0) {                                   // fileira de baixo, mais curta, apontando para cima
                    const lowBase = [R * 1.04, x * 0.92, my - R * 0.2 - a * R * 0.01];
                    const lo = R * (0.14 + (4 - a) * 0.02);
                    limb([lowBase, [lowBase[0] + 0.1, x * 0.92, lowBase[2] + lo * 0.55]], 0.8, C.outline);
                    limb([lowBase, [lowBase[0] + 0.1, x * 0.92, lowBase[2] + lo * 0.55]], 0.58, C.tooth);
                    limb([[lowBase[0] + 0.1, x * 0.92, lowBase[2] + lo * 0.5], [lowBase[0] + 0.15, x * 0.93, lowBase[2] + lo]], 0.32, C.tooth);
                }
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
            // Coroa enferrujada de espinhos, torta no alto
            const cz = zc + R * 0.98;
            ball([-0.2, 0, cz], R * 0.46 + 0.3, C.crownDark);
            for (let i = 0; i < 5; i++) {
                const a = (i / 4 - 0.5) * 2.2;
                const base = [0.5 + Math.cos(a) * R * 0.3, Math.sin(a) * R * 0.38, cz + 0.4];
                const tip = [base[0], base[1], cz + 2.6 + (i % 2) * 0.9];
                limb([base, tip], 1.3, C.crownDark);
                limb([base, tip], 0.9, C.crown);
            }
            ball([0.9, 0, cz + 0.9], 0.6, C.crownGem);
            // Gotas de gosma escorrendo da boca e do queixo
            for (let i = 0; i < S.drips; i++) {
                const k = (t * 1 + i / S.drips) % 1;
                const x = R * (0.78 + 0.1 * (i % 2));
                const y = (i - 1.5) * R * 0.22;
                ball([x, y, my - 0.5 - k * R * 0.7], 0.45 * (1 - k * 0.5), C.drip);
            }
        }
    });
    return items;
}

registerCreature('slizork', S, parts);

export function renderSlizork25D(e) {
    const p = e.clawAt ? (performance.now() - e.clawAt) / (CLAW_SECONDS * 1000) : 0;
    clawP = p > 0 && p < 1 ? p : 0;
    renderMonster25D(e, 'slizork', S);
}
