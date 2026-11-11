import { HEADLESS_KNIGHT_25D_VISUALS as S } from './headless_knight25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { HERO_25D_VISUALS as V } from '../../../characters/hunter/hero25d_visual.js';
import { mix, norm, olimb, oball, flowChain, drawRibbon } from '../../../characters/hunter/kit25d.js';
import { trunk, frontArc, greatsword, flame, glowAt, facesCamera } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';

// --- CAVALEIRO SEM CABEÇA 2.5D ---
// O Cavaleiro de topdown/headless_knight/headless_knight.js no boneco 2.5D: armadura de aço gasta (peitoral com crista,
// cinto com fivela dourada, manchas de ferrugem), ombreiras enormes com espinhos, manoplas, grevas com joelheiras, a
// capa roxa cobrindo as costas, o montante arrastando no chão do lado direito (soltando faíscas ao andar), o gorjal
// oco com a chama azul subindo onde estaria a cabeça e o elmo flutuando do lado esquerdo, com a pluma rasgada e a
// fenda dos olhos em brasa. Medidas: headless_knight25d_visual.js (cores do topdown).
// Uso: renderHeadlessKnight25D(e), ou o modelo 'headless_knight' em renderHero25D.
const FLAMES = (C) => [C.flame, C.flameMid, C.flameTip];

function drawLeg(rig, { hip, knee, ankle, toe }) {
    const { C } = rig;
    olimb(rig, [hip, knee], S.legWidth, C.steelDark);
    olimb(rig, [knee, ankle], S.legWidth + 0.3, C.steel);
    oball(rig, knee, S.legWidth * 0.55, C.steelLight);
    olimb(rig, [ankle, [toe[0] + 0.5, toe[1], toe[2]]], S.legWidth + 0.5, C.steelDark);
}

function drawTorso(rig, pose, bottom, top, wb, wt) {
    const { C, limb, ball } = rig;
    trunk(rig, bottom, top, wb, wt, C.steel, C.ink, S.chestWiden, C.steelDark);
    const front = rig.sinF > -0.25;
    // Cinto escuro com a fivela dourada
    const beltZ = bottom.z + 1.6;
    frontArc(rig, bottom.a, beltZ, bottom.A * 1.08, bottom.B * 1.08, 1.5, C.ink);
    if (!front) return;
    ball([bottom.a + bottom.A * 1.1, 0, beltZ], 0.8, C.gold);
    // Crista central do peitoral, placa de baixo e marcas de ferrugem
    limb([[top.a + top.A * 0.95, 0, top.z - 1], [bottom.a + bottom.A * 1.05, 0, beltZ + 1.2]], 0.55, C.steelLight);
    frontArc(rig, mix([bottom.a], [top.a], 0.45)[0], bottom.z + (top.z - bottom.z) * 0.45, bottom.A * 1.1, bottom.B * 1.12, 0.4, C.steelDark);
    ball([top.a + top.A * 0.85, top.B * 0.5, top.z - 2], 0.6, C.rust);
    ball([bottom.a + bottom.A, -bottom.B * 0.5, bottom.z + 4], 0.75, C.rust);
}

function drawArm(rig, shoulder, elbow, hand) {
    const { C, limb, ball } = rig;
    const side = Math.sign(shoulder[1]) || 1;
    const sh = [shoulder[0], shoulder[1] * S.shoulderScale, shoulder[2]];
    olimb(rig, [sh, elbow], S.armWidth, C.steelDark);
    olimb(rig, [elbow, hand], S.gauntletWidth, C.steel);
    limb([mix(elbow, hand, 0.55), mix(elbow, hand, 0.62)], S.gauntletWidth + 0.5, C.steelDark);
    oball(rig, hand, 1.35, C.steelDark);
    // Ombreira: cúpula em camadas, com dois espinhos
    const p = [sh[0], sh[1] + side * 0.5, sh[2] + 0.9];
    for (const k of [-0.6, 0.5]) {
        limb([[p[0] + k, p[1], p[2] + 0.5], [p[0] + k * 2.2, p[1] + side * S.spikeLength, p[2] + S.spikeLength * 0.75]], 1.1, C.steelDark);
    }
    oball(rig, p, S.pauldronRadius, C.steelDark);
    ball([p[0], p[1], p[2] + 0.5], S.pauldronRadius * 0.86, C.steel);
    ball([p[0] + 0.3, p[1] - side * 0.3, p[2] + S.pauldronRadius * 0.45], S.pauldronRadius * 0.45, C.steelLight);
    ball([p[0] + S.pauldronRadius * 0.5, p[1], p[2] - 0.2], 0.5, C.rust);
}

// Gorjal oco e a chama azul; e o elmo flutuando ao lado
function headParts(pose, rig) {
    const { C, project, ball, limb, anim } = rig;
    const t = pose.t;
    const n = [pose.lean, 0, pose.shoulderZ + 0.9];
    const h = [pose.lean + S.helmForward, -(V.chest.B + S.helmSide), S.helmHeight + Math.sin(t * 1.5) * S.helmFloat];
    const R = S.helmRadius;
    return [{
        depth: project(...n).depth + 0.2,
        draw() {
            oball(rig, n, S.gorgetRadius, C.steelDark);
            ball([n[0], 0, n[2] + 0.6], S.gorgetRadius * 0.72, C.ink);
            glowAt(rig, [n[0], 0, n[2] + S.flameHeight * 0.4], C.flameGlow, S.flameHeight * 1.1, 0.7);
            for (const [da, db, k, ph] of [[-0.7, 0.9, 0.6, 1], [0.6, -0.8, 0.7, 2.2], [0, 0, 1, 0]]) {
                const base = [n[0] + da, db, n[2] + 0.8];
                const hgt = S.flameHeight * k * (0.88 + 0.12 * Math.sin(t * 9 + ph));
                flame(rig, base, [base[0] - 0.6 - pose.run * 2, db, base[2] + hgt], S.flameWidth * (0.6 + 0.4 * k), FLAMES(C), Math.sin(t * 7 + ph) * 0.8);
            }
        }
    }, {
        depth: project(...h).depth,
        draw() {
            // Fiapos da chama que o seguram e a pluma rasgada, para trás
            for (const [db, ph] of [[-0.8, 0], [0.7, 1.6]]) {
                const base = [h[0] - 0.3, h[1] + db, h[2] - R * 0.7];
                flame(rig, base, [base[0] - 0.5, base[1], base[2] - 2.8 - Math.sin(t * 6 + ph) * 0.4], 0.7, FLAMES(C), Math.sin(t * 8 + ph) * 0.5);
            }
            for (let i = 0; i < 3; i++) {
                const chain = flowChain([h[0] - R * 0.3, h[1] + (i - 1) * 0.5, h[2] + R * 0.85], pose, anim, {
                    hang: [-0.8, 0, 0.5], stream: [-1, 0, 0.1], len: S.plumeLength * (1 - Math.abs(i - 1) * 0.2), segs: 4,
                    amp: 0.35, ampRun: 0.5, speed: 3, speedRun: 6, waveLength: 1.6, phase: i * 1.4, lag: 0.2
                });
                drawRibbon(rig, chain, 0.8, 0.15, i === 1 ? C.clothMid : C.cloth, C.clothDark, true);
            }
            // Cúpula, crista e a fenda dos olhos em brasa
            oball(rig, h, R, C.steelDark);
            ball([h[0], h[1], h[2] + 0.3], R * 0.88, C.steel);
            limb([[h[0] - R * 0.8, h[1], h[2] + R * 0.75], [h[0], h[1], h[2] + R * 1.02], [h[0] + R * 0.8, h[1], h[2] + R * 0.7]], 0.6, C.steelLight);
            const visor = [h[0] + R * 0.9, h[1], h[2] + 0.1];
            if (!facesCamera(rig, visor, h)) return;
            limb([[visor[0] - 0.3, h[1] - R * 0.62, visor[2]], visor, [visor[0] - 0.3, h[1] + R * 0.62, visor[2]]], 1.0, C.ink);
            for (const side of [-1, 1]) {
                const eye = [visor[0] - 0.05, h[1] + side * R * 0.32, visor[2]];
                glowAt(rig, eye, C.eyeGlow, 1.6, 0.9);
                ball(eye, 0.32, C.eye);
            }
        }
    }];
}

registerBody('headless_knight', {
    vis: S,
    drawLeg,
    drawTorso,
    // Capa roxa presa por cima das ombreiras; vista de costas, cobre o tronco
    drawBack: (rig, pose, anchors, hem) => rig.drawCapeShape(
        anchors.map(p => [p[0] - 0.3, p[1] * S.capeSpread, p[2] + S.capeRise]),
        hem.map(p => [p[0], p[1] * 1.15, p[2]]),
        { thickness: 0.35 }
    ),
    backDepth: (rig, pose, depth) => (rig.sinF < 0 ? Math.max(depth, rig.project(pose.lean * 0.6, 0, 13.5).depth + 0.05) : depth),
    drawArm: (rig, shoulder, elbow, hand) => drawArm(rig, shoulder, elbow, hand),
    // Em repouso o montante arrasta no chão, atrás e do lado direito; no golpe volta à varredura normal
    swordRest(rig, pose, { hand, dir, blend }) {
        const k = 1 - blend;
        const rest = [pose.lean * 0.5 + 0.6, V.chest.B + S.dragSide, S.dragHandHeight - pose.crouch];
        const drop = (rest[2] - 0.3) / S.bladeLength;
        const flat = Math.sqrt(Math.max(0.01, 1 - drop * drop));
        const restDir = [-flat * 0.98, flat * 0.2, -drop];
        return { hand: mix(hand, rest, k), dir: norm(mix(dir, restDir, k)) };
    },
    drawBlade(rig, hand, dir, alpha) {
        const { C } = rig;
        const tip = greatsword(rig, hand, dir, S.bladeLength, S.bladeWidth, { blade: C.blade, edge: C.edge, guard: C.steelDark, grip: C.ink, dark: C.ink });
        // Faíscas onde a ponta risca o chão, ao andar
        if (tip[2] > 1 || rig.anim.run < 0.15) return;
        const t = performance.now() / 1000;
        for (let i = 0; i < S.sparks; i++) {
            const p = (t * 3 + i / S.sparks) % 1;
            glowAt(rig, [tip[0] - p * 2.5, tip[1] + Math.sin(i * 2.7) * 0.8, tip[2] + p * (1.5 + i * 0.4)], C.spark, 0.9 * (1 - p) + 0.2, (1 - p) * alpha);
        }
    },
    headParts
});

export function renderHeadlessKnight25D(e) {
    renderMonster25D(e, 'headless_knight', S);
}

// De onde sai o tiro: o elmo flutuante, no mundo do jogo (como knightHeadPosition do desenho de cima). Segue o desenho:
// ponto (frente, lado, altura) do boneco projetado pela câmera do jogo e tirado do centro do corpo.
export function knightHeadPosition25D(e) {
    const f = e.facing ?? e.angle;
    const k = e.radius * S.scalePerRadius * S.bodyScale;
    const a = S.helmForward + 0.8;
    const b = -(V.chest.B + S.helmSide);
    const z = S.helmHeight - S.center;
    return {
        x: e.x + (a * Math.cos(f) - b * Math.sin(f)) * k,
        y: e.y + ((a * Math.sin(f) + b * Math.cos(f)) * V.groundSquash - z * V.heightScale) * k
    };
}
