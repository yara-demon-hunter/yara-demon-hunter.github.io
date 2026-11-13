// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/buddies/white_wolf/white_wolf25d.js e rode o sync.
import { WHITE_WOLF_25D_VISUALS as S } from './white_wolf25d_visual.js';
import { registerCreature, withAlpha } from '../../monsters/25d/creature25d.js';
import { wolfParts } from '../../monsters/25d/wolf25d.js';
import { renderMonster25D } from '../../monsters/25d/monster25d.js';
import { flowChain, drawRibbon, mix } from '../../characters/hunter/kit25d.js';
import { flameWisp } from '../spectral_flame.js';

// --- LOBO BRANCO 2.5D ---
// O Lobo Sombrio (../shadow_wolf/shadow_wolf25d.js) em cores de gelo: pelo branco-prateado com mechas claras no lombo, juba
// desgrenhada, sobrancelhas franzidas, olhos azul-gelo e a traseira se desfazendo em névoa clara (a cauda é névoa).
// Mesmo corpo e mesmas medidas do Lobo Sombrio. É um BUDDY, não um monstro: o aliado do Rowan (The White Wolf).
// Medidas: white_wolf25d_visual.js. Uso: renderWhiteWolf25D(e).
const tuft = (rig, pose, root, len, width, color, phase, up = 0.25) => drawRibbon(rig, flowChain(root, pose, rig.anim, {
    hang: [-1, 0, up], stream: [-1, 0, 0.05], len, segs: 3, amp: 0.25, ampRun: 0.4, speed: 5, speedRun: 9, waveLength: 1.5, phase, lag: 0.12
}), width, 0.1, color, rig.C.ink, false);

function parts(pose, rig) {
    const { C, limb, ball } = rig;
    return wolfParts(pose, rig, S, {
        body(r, f) {
            // Faixa clara no lombo e mechas claras para trás
            limb([[f.hip[0] + 1, 0, f.hip[2] + S.bodyWidth * 0.42], [f.sh[0] - 0.5, 0, f.sh[2] + S.bodyWidth * 0.5]], 0.9, C.furMid);
            for (let i = 0; i < S.backTufts; i++) {
                const p = mix(f.sh, f.hip, 0.15 + (i / S.backTufts) * 0.7);
                tuft(rig, pose, [p[0], (i % 2 ? 1 : -1) * 0.8, p[2] + S.bodyWidth * 0.48], 2.6, 0.55, i % 2 ? C.furLight : C.furMid, i * 1.3, 0.35);
            }
            // O espectro verde-azulado sobe do lombo, dos ombros e da garupa e some (como a chama roxa do Lobo Sombrio)
            for (let i = 0; i < S.flames; i++) {
                const p = mix(f.hip, f.sh, (i + 0.5) / S.flames);
                flameWisp(rig, f, S, [p[0], ((i % 3) - 1) * S.bodyWidth * 0.35, p[2] + S.bodyWidth * 0.55], i, 1.4 + (i % 2) * 0.5);
            }
        },
        tail(r, f) {
            // Cauda de névoa clara e nuvens soltando da traseira
            for (let i = 0; i < S.smokeTails; i++) {
                const chain = flowChain([f.hip[0] - 1.5, (i - 1) * 1.1, f.hip[2] + 0.6], pose, rig.anim, {
                    hang: [-1, (i - 1) * 0.15, 0.25], stream: [-1, 0, 0.1], len: S.smokeLength * (1 - Math.abs(i - 1) * 0.25), segs: 5,
                    amp: 0.8, ampRun: 0.7, speed: 3.5, speedRun: 6, waveLength: 2, phase: i * 2.1, lag: 0.3
                });
                withAlpha(0.85, () => drawRibbon(rig, chain, 1.5, 0.2, C.smoke, C.ink, false));
            }
            for (let i = 0; i < S.smokePuffs; i++) {
                const p = (f.t * 0.7 + i / S.smokePuffs) % 1;
                withAlpha((1 - p) * 0.7, () => ball([f.hip[0] - 1 - p * 7, Math.sin(i * 2.4 + f.t) * 1.6, f.hip[2] + 0.5 + p * 3], 1.5 * (1 - p * 0.5), C.smoke));
            }
            for (let i = 0; i < S.tailFlames; i++) flameWisp(rig, f, S, [f.hip[0] - 3 - i * 0.9, ((i % 3) - 1) * 0.9, f.hip[2] + 1.4], i + 7, 1.7);
        },
        neck(r, f) {
            // Juba: mechas em volta do pescoço, para trás
            for (let i = 0; i < S.maneTufts; i++) {
                const a = (i / (S.maneTufts - 1) - 0.5) * Math.PI * 1.3;
                const c = mix(f.sh, f.head, 0.55);
                const root = [c[0], Math.sin(a) * S.bodyWidth * 0.4, c[2] + Math.cos(a) * S.bodyWidth * 0.42];
                tuft(rig, pose, root, S.maneLength * (0.8 + 0.3 * Math.cos(a)), 0.9, i % 3 === 1 ? C.furLight : C.furMid, i * 0.9, 0.3 * Math.cos(a));
            }
            for (let i = 0; i < 3; i++) flameWisp(rig, f, S, [f.sh[0] + 1, (i - 1) * 1.5, f.sh[2] + S.bodyWidth * 0.5], i + 3, 1.4);
        },
        head(r, f) {
            const R = S.headRadius;
            // Faixa clara no focinho e sobrancelhas franzidas
            limb([[f.head[0] + R * 0.9, 0, f.head[2] + R * 0.42], [f.snout[0] - 1.4, 0, f.snout[2] + S.snoutWidth * 0.5]], 0.32, C.furLight);
            for (const side of [-1, 1]) {
                limb([[f.head[0] + R * 0.25, side * R * 0.85, f.head[2] + R * 0.6], [f.head[0] + R * 0.85, side * R * 0.35, f.head[2] + R * 0.38]], 0.45, C.ink);
            }
        }
    });
}

registerCreature('white_wolf', S, parts);

export function renderWhiteWolf25D(e) {
    renderMonster25D(e, 'white_wolf', S);
}
