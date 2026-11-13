import { SHADOW_WOLF_BUDDY_25D_VISUALS as S } from './shadow_wolf25d_visual.js';
import { registerCreature, withAlpha } from '../../monsters/25d/creature25d.js';
import { wolfParts } from '../../monsters/25d/wolf25d.js';
import { renderMonster25D } from '../../monsters/25d/monster25d.js';
import { flowChain, drawRibbon, mix } from '../../characters/hunter/kit25d.js';
import { flameWisp } from '../spectral_flame.js';

// --- LOBO SOMBRIO ALIADO 2.5D (buddy do Rowan) ---
// Um lobo de verdade para o Shadow Wolf do Rowan: negro, muito mais peludo que o lobo sombrio inimigo, um pouco maior e agachado
// para o ataque (ombros altos, cabeça baixa e para a frente, boca arreganhada). Olhos vermelhos brilhando sob sobrancelhas
// franzidas e uma chama roxa escura que sai do corpo, sobe e some. Pelo: uma juba de espetos em volta do pescoço e do lombo,
// mechas nos flancos e nas bochechas, garras claras. Mesmo corpo de lobo (../../monsters/25d/wolf25d.js).
// Referência: art_reference/images/shadow-wolf-BODY.webp. Medidas e cores: shadow_wolf25d_visual.js e shadow_wolf_visual.js.
// Uso: renderShadowWolfBuddy25D(e).
const tuft = (rig, pose, root, len, width, color, phase, hang = [-1, 0, 0.3], amp = 0.3) => drawRibbon(rig, flowChain(root, pose, rig.anim, {
    hang, stream: [-1, 0, 0.1], len, segs: 3, amp, ampRun: amp * 1.6, speed: 5, speedRun: 9, waveLength: 1.5, phase, lag: 0.12
}), width, 0.1, color, rig.C.ink, false);

function parts(pose, rig) {
    const { C, limb, ball } = rig;
    return wolfParts(pose, rig, S, {
        body(r, f) {
            // Lombo: juba de espetos do ombro à garupa, mais alta perto do pescoço (como na referência)
            for (let i = 0; i < S.backTufts; i++) {
                const k = 0.1 + (i / (S.backTufts - 1)) * 0.8;
                const p = mix(f.sh, f.hip, k);
                const top = [p[0], 0, p[2] + S.bodyWidth * 0.5];
                tuft(rig, pose, top, 3.4 + (1 - k) * 2.8, 0.9 + (1 - k) * 0.5, i % 5 === 2 ? C.furLight : i % 2 ? C.furMid : C.furDark, i * 1.3, [-0.8, 0, 0.85], 0.25);
            }
            // Flancos: mechas compridas para trás dos dois lados
            for (const side of [-1, 1]) {
                for (let i = 0; i < S.flankTufts; i++) {
                    const k = 0.15 + (i / (S.flankTufts - 1)) * 0.7;
                    const p = mix(f.sh, f.hip, k);
                    tuft(rig, pose, [p[0], side * S.bodyWidth * 0.5, p[2] - 0.2], 2.8, 0.7, i % 2 ? C.furMid : C.furDark, i * 0.9 + side, [-1, side * 0.2, -0.1], 0.3);
                }
            }
            // A chama roxa que sai do corpo: dos ombros, do lombo e da garupa
            for (let i = 0; i < S.flames; i++) {
                const k = (i + 0.5) / S.flames;
                const p = mix(f.hip, f.sh, k);
                flameWisp(rig, f, S, [p[0], ((i % 3) - 1) * S.bodyWidth * 0.35, p[2] + S.bodyWidth * 0.55], i, 1.5 + (i % 2) * 0.5);
            }
        },
        tail(r, f) {
            // Cauda grossa e peluda, com a ponta virando chama roxa
            const root = [f.hip[0] - 1.2, 0, f.hip[2] + 0.6];
            for (let i = 0; i < 3; i++) {
                const chain = flowChain([root[0], (i - 1) * 0.9, root[2]], pose, rig.anim, {
                    hang: [-1, (i - 1) * 0.2, 0.35], stream: [-1, 0, 0.18], len: S.tailLength * (1 - Math.abs(i - 1) * 0.18), segs: 5,
                    amp: 0.7, ampRun: 0.9, speed: 3.2, speedRun: 6, waveLength: 2, phase: i * 2.1, lag: 0.3
                });
                drawRibbon(rig, chain, 2.2, 0.35, i === 1 ? C.furDark : C.fur, C.ink, false);
            }
            for (let i = 0; i < S.tailFlames; i++) flameWisp(rig, f, S, [f.hip[0] - 3 - i * 0.9, ((i % 3) - 1) * 0.9, f.hip[2] + 1.5], i + 7, 1.9);
        },
        neck(r, f) {
            // Juba em volta do pescoço: espetos grossos para trás, bem mais cheios que os do lobo inimigo
            for (let i = 0; i < S.maneTufts; i++) {
                const a = (i / (S.maneTufts - 1) - 0.5) * Math.PI * 1.55;
                const c = mix(f.sh, f.head, 0.55);
                const root = [c[0], Math.sin(a) * S.bodyWidth * 0.48, c[2] + Math.cos(a) * S.bodyWidth * 0.5];
                tuft(rig, pose, root, S.maneLength * (0.85 + 0.35 * Math.cos(a)), 1.15, i % 5 === 2 ? C.furLight : i % 2 ? C.furMid : C.furDark, i * 0.9, [-1, 0, 0.35 * Math.cos(a)], 0.35);
            }
            for (let i = 0; i < 3; i++) flameWisp(rig, f, S, [f.sh[0] + 1.2, (i - 1) * 1.6, f.sh[2] + S.bodyWidth * 0.55], i + 3, 1.6);
        },
        head(r, f) {
            const R = S.headRadius;
            // Sobrancelhas franzidas: duas riscas grossas e inclinadas por cima dos olhos (rosto bravo)
            for (const side of [-1, 1]) {
                limb([[f.head[0] + R * 0.1, side * R * 0.95, f.head[2] + R * 0.78], [f.head[0] + R * 0.95, side * R * 0.3, f.head[2] + R * 0.42]], 0.7, C.ink);
                limb([[f.head[0] + R * 0.2, side * R * 0.9, f.head[2] + R * 0.84], [f.head[0] + R * 0.85, side * R * 0.33, f.head[2] + R * 0.5]], 0.38, C.furLight);
            }
            // Testa e bochechas: tufos de pelo (as bochechas com o roxo da chama)
            for (let i = 0; i < 4; i++) {
                const a = (i / 3 - 0.5) * 1.5;
                tuft(rig, pose, [f.head[0] + R * 0.2, Math.sin(a) * R * 0.85, f.head[2] + R * 0.9 + Math.cos(a) * 0.4], 2.2, 0.7, i === 2 ? C.furLight : C.furMid, i * 1.1, [-1, 0, 0.9], 0.2);
            }
            for (const side of [-1, 1]) {
                for (let i = 0; i < 3; i++) tuft(rig, pose, [f.head[0] - R * 0.1 + i * 0.5, side * R * 0.95, f.head[2] - R * 0.25 - i * 0.2], 2.6 - i * 0.3, 0.6, i === 1 ? C.furLight : C.furMid, i * 0.8 + side, [-1, side * 0.5, -0.1], 0.3);
            }
            // Focinho franzido: uma ruga clara acima do nariz
            limb([[f.snout[0] - 1.6, 0, f.snout[2] + S.snoutWidth * 0.55], [f.snout[0] - 0.2, 0, f.snout[2] + S.snoutWidth * 0.35]], 0.3, C.furLight);
        },
        paw(r, paw, front) {
            // Garras claras, três por pata, abertas para a frente
            for (let k = -1; k <= 1; k++) {
                limb([[paw[0] + S.legWidth * 0.5, paw[1] + k * 0.38, paw[2] + 0.05], [paw[0] + S.legWidth * 1.3, paw[1] + k * 0.55, paw[2] - 0.15]], 0.32, C.claw);
            }
            // Pelo do pé: dois tufos para trás
            if (front) tuft(rig, pose, [paw[0] - 0.4, paw[1], paw[2] + 1.3], 1.8, 0.6, C.furMid, paw[1], [-1, 0, 0.3], 0.2);
        }
    });
}

registerCreature('buddy_shadow_wolf', S, parts);

export function renderShadowWolfBuddy25D(e) {
    renderMonster25D(e, 'buddy_shadow_wolf', S);
}
