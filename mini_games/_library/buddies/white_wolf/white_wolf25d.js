import { WHITE_WOLF_25D_VISUALS as S } from './white_wolf25d_visual.js';
import { registerCreature, withAlpha } from '../../monsters/25d/creature25d.js';
import { wolfFrame, wolfParts } from '../../monsters/25d/wolf25d.js';
import { renderMonster25D } from '../../monsters/25d/monster25d.js';
import { flowChain, drawRibbon, mix } from '../../characters/hunter/kit25d.js';
import { flameWisp } from '../spectral_flame.js';

// --- LOBO BRANCO 2.5D ---
// Segue a arte de art_reference/images/white_wolf.webp: lobo branco-gelo, contorno petróleo, olhos azuis acesos e boca aberta
// rosnando, ENVOLTO num espectro verde-água: chamas sobem por todo o lombo, a juba é de mechas brancas pontudas com
// labaredas por cima, cada pata solta fogo e a cauda é uma labareda grande curvada para trás e para cima.
// Mesmo corpo e mesmas medidas do Lobo Sombrio (monsters/25d/wolf25d.js). É um BUDDY, não um monstro: o aliado do Rowan.
// Medidas: white_wolf25d_visual.js. Uso: renderWhiteWolf25D(e).
const tuft = (rig, pose, root, len, width, color, phase, up = 0.25) => drawRibbon(rig, flowChain(root, pose, rig.anim, {
    hang: [-1, 0, up], stream: [-1, 0, 0.05], len, segs: 3, amp: 0.25, ampRun: 0.4, speed: 5, speedRun: 9, waveLength: 1.5, phase, lag: 0.12
}), width, 0.1, color, rig.C.ink, false);

// A cauda de fogo: uma corrente que sai da garupa, vai para trás e sobe, ondulando; três camadas da borda escura ao miolo claro
function flameTail(rig, pose, f) {
    const { C } = rig;
    const root = [f.hip[0] - 1.2, 0, f.hip[2] + 0.8];
    const layers = [[C.flameDark, 2.6, 1], [C.flame, 1.8, 0.9], [C.flameLight, 0.8, 0.75]];
    for (const [color, width, k] of layers) {
        const chain = flowChain(root, pose, rig.anim, {
            hang: [-1, 0, S.tailRise], stream: [-1, 0, S.tailRise * 0.6], len: S.tailLength * k, segs: 6,
            amp: 0.9, ampRun: 0.8, speed: 4, speedRun: 7, waveLength: 2.2, phase: 0, lag: 0.25
        });
        withAlpha(0.9, () => drawRibbon(rig, chain, width, 0.15, color, color, false));
    }
}

function parts(pose, rig) {
    const { C, limb } = rig;
    const frame = wolfFrame(pose, rig, S);         // o mesmo esqueleto do quadro, para as chamas das patas
    return wolfParts(pose, rig, S, {
        body(r, f) {
            // Faixa clara no lombo e mechas brancas para trás
            limb([[f.hip[0] + 1, 0, f.hip[2] + S.bodyWidth * 0.42], [f.sh[0] - 0.5, 0, f.sh[2] + S.bodyWidth * 0.5]], 0.9, C.furMid);
            for (let i = 0; i < S.backTufts; i++) {
                const p = mix(f.sh, f.hip, 0.15 + (i / S.backTufts) * 0.7);
                tuft(rig, pose, [p[0], (i % 2 ? 1 : -1) * 0.8, p[2] + S.bodyWidth * 0.48], 2.6, 0.55, i % 2 ? C.furLight : C.furMid, i * 1.3, 0.35);
            }
            // O espectro sobe do lombo inteiro, da garupa ao peito, e dos flancos
            for (let i = 0; i < S.flames; i++) {
                const p = mix(f.hip, f.sh, (i + 0.5) / S.flames);
                flameWisp(rig, f, S, [p[0], ((i % 3) - 1) * S.bodyWidth * 0.42, p[2] + S.bodyWidth * 0.5], i, 1.5 + (i % 2) * 0.6);
            }
        },
        tail(r, f) {
            flameTail(rig, pose, f);
            for (let i = 0; i < S.tailFlames; i++) flameWisp(rig, f, S, [f.hip[0] - 3 - i * 1.6, ((i % 3) - 1) * 0.9, f.hip[2] + 1.6 + i * 0.8], i + 7, 1.6);
        },
        neck(r, f) {
            // Juba: mechas brancas pontudas para trás, com labaredas saindo do alto
            for (let i = 0; i < S.maneTufts; i++) {
                const a = (i / (S.maneTufts - 1) - 0.5) * Math.PI * 1.3;
                const c = mix(f.sh, f.head, 0.55);
                const root = [c[0], Math.sin(a) * S.bodyWidth * 0.4, c[2] + Math.cos(a) * S.bodyWidth * 0.42];
                tuft(rig, pose, root, S.maneLength * (0.8 + 0.3 * Math.cos(a)), 0.9, i % 3 === 1 ? C.furLight : C.furMid, i * 0.9, 0.45 * Math.cos(a));
            }
            for (let i = 0; i < S.maneFlames; i++) {
                const c = mix(f.sh, f.head, 0.3 + i * 0.12);
                flameWisp(rig, f, S, [c[0], ((i % 3) - 1) * 1.3, c[2] + S.bodyWidth * 0.5], i + 3, 1.5);
            }
        },
        paw(r, paw, front, side) {
            // Garras claras, três por pata, e o fogo saindo da pata
            for (let k = -1; k <= 1; k++) {
                limb([[paw[0] + S.legWidth * 0.5, paw[1] + k * 0.38, paw[2] + 0.05], [paw[0] + S.legWidth * 1.3, paw[1] + k * 0.55, paw[2] - 0.15]], 0.32, C.claw);
            }
            for (let k = 0; k < S.pawFlames; k++) flameWisp(rig, frame, S, [paw[0] - 0.4, paw[1], paw[2] + 0.6], (front ? 11 : 13) + (side > 0 ? 1 : 0) + k, 1.1);
        },
        head(r, f) {
            const R = S.headRadius;
            // Faixa clara no focinho, rugas do rosnado e sobrancelhas franzidas
            limb([[f.head[0] + R * 0.9, 0, f.head[2] + R * 0.42], [f.snout[0] - 1.4, 0, f.snout[2] + S.snoutWidth * 0.5]], 0.32, C.furLight);
            limb([[f.snout[0] - 2.4, 0, f.snout[2] + S.snoutWidth * 0.55], [f.snout[0] - 1.6, 0, f.snout[2] + S.snoutWidth * 0.62]], 0.22, C.furDark);
            for (const side of [-1, 1]) {
                limb([[f.head[0] + R * 0.25, side * R * 0.85, f.head[2] + R * 0.62], [f.head[0] + R * 0.85, side * R * 0.35, f.head[2] + R * 0.36]], 0.5, C.ink);
            }
        }
    });
}

registerCreature('white_wolf', S, parts);

export function renderWhiteWolf25D(e) {
    renderMonster25D(e, 'white_wolf', S);
}
