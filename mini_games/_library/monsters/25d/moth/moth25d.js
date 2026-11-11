import { MOTH_25D_VISUALS as S } from './moth25d_visual.js';
import { registerCreature, poly, glowAt, withAlpha } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';
import { mix } from '../../../characters/hunter/kit25d.js';

// --- MARIPOSA DE CINZAS 2.5D ---
// A Mariposa de topdown/moth/moth.js voando em 2.5D: quatro asas empoeiradas (a da frente clara, com o "olho" desenhado;
// a de trás menor e escura) batendo para cima e para baixo, corpo peludo com o tórax claro, antenas curvas e um rastro
// de cinzas em brasa atrás. Medidas: moth25d_visual.js (cores do topdown).
// Uso: renderMoth25D(e), ou o modelo 'moth' em renderHero25D.

// Asa arredondada: do encaixe (frente e trás) abrindo até a ponta larga
function wingShape(root, back, span, chord, side, elev, sweep) {
    const out = (k, a) => [root[0] + a, root[1] + side * span * k * Math.cos(elev), root[2] + span * k * Math.sin(elev)];
    return [root, out(0.55, chord * 0.35), out(1, sweep), out(0.95, sweep - chord * 0.55), out(0.5, -chord * 0.75), back];
}

// Gravando num atlas (e.baking), o balanço e as brasas ficam de fora: o jogo aplica o balanço no carimbo
let baking = false;

function parts(pose, rig) {
    const { C, project, ball, limb } = rig;
    const t = pose.t;
    const flap = Math.sin(t * S.flapHz * Math.PI * 2);
    const sway = baking ? 0 : Math.sin(t * S.wobbleHz * Math.PI * 2) * S.wobble;
    const z0 = S.flyHeight - flap * S.bob;
    const elev = flap * S.flapAngle + 0.15;
    const wingPart = (side) => ({
        depth: project(-1, sway + side * S.foreSpan * 0.5, z0 + S.foreSpan * 0.5 * Math.sin(elev)).depth,
        draw() {
            // Asa de trás primeiro (fica por baixo)
            const hind = wingShape([-0.8, sway + side * 0.6, z0], [-2.6, sway + side * 0.5, z0 - 0.2], S.hindSpan, S.hindChord, side, elev * 0.8, -S.hindChord * 0.9);
            poly(rig, hind, C.wing, C.wingEdge, 0.35);
            const fore = wingShape([1.2, sway + side * 0.6, z0 + 0.3], [-1, sway + side * 0.6, z0 + 0.1], S.foreSpan, S.foreChord, side, elev, -S.foreChord * 0.35);
            poly(rig, fore, C.wingLight, C.wingEdge, 0.4);
            // Olho desenhado na asa
            const spot = mix(mix(fore[1], fore[4], 0.5), fore[2], 0.45);
            ball(spot, S.eyeSpot, C.eyeRing);
            ball(spot, S.eyeSpot * 0.55, C.eye);
        }
    });
    return [wingPart(-1), wingPart(1), {
        depth: project(0, sway, z0).depth + 0.2,
        draw() {
            const tail = [-S.bodyLength * 0.6, sway, z0 - 0.5];
            const chest = [S.bodyLength * 0.25, sway, z0];
            limb([tail, chest], S.bodyWidth + 0.4, C.wingEdge);
            limb([tail, chest], S.bodyWidth, C.body);
            const head = [S.bodyLength * 0.42, sway, z0 + 0.3];
            ball(head, S.fuzzRadius, C.fuzz);
            // Antenas curvas
            for (const side of [-1, 1]) {
                limb([[head[0] + 0.6, sway + side * 0.4, head[2] + 0.6], [head[0] + S.antennaLength * 0.7, sway + side * 1.0, head[2] + 1.8],
                    [head[0] + S.antennaLength, sway + side * 2.2, head[2] + 1.6]], 0.28, C.fuzz);
            }
        }
    }, {
        // Rastro de cinzas em brasa
        depth: project(-S.emberTrail * 0.5, sway, z0).depth - 1,
        draw() {
            if (baking) return;
            for (let i = 0; i < S.embers; i++) {
                const p = (t * 1.4 + i / S.embers) % 1;
                const pos = [-3 - p * S.emberTrail, sway * (1 - p) + Math.sin(t * 9 + i) * 0.8, z0 - p * 3 + Math.cos(t * 7 + i) * 0.6];
                withAlpha((1 - p) * 0.8, () => {
                    glowAt(rig, pos, C.ember, 1.2, 0.6);
                    ball(pos, 0.3, C.ember);
                });
            }
        }
    }];
}

registerCreature('moth', S, parts);

export function renderMoth25D(e) {
    baking = !!e.baking;
    renderMonster25D(e, 'moth', S);
}
