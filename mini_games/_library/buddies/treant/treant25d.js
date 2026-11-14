import { TREANT_25D_VISUALS as S } from './treant25d_visual.js';
import { registerCreature, glowAt, facesCamera } from '../../monsters/25d/creature25d.js';
import { renderMonster25D } from '../../monsters/25d/monster25d.js';
import { mix } from '../../characters/hunter/kit25d.js';

// --- TREANT 2.5D (buddy: a árvore andante) ---
// A árvore do Wicked Oak depois da Ancient Grove: sai andando e luta. Duas pernas de raiz com passos pesados (a passada vem do
// motor, rig.anim.stride), tronco largo de casca com veios e musgo, uma cara entalhada com olhos âmbar brilhando, dois braços de
// galho que balançam no ritmo do passo (e erguem ao bater) e uma copa de folhas por cima. Medidas e cores: treant25d_visual.js.
// Uso: renderTreant25D(e); e.swing (0..1) ergue os braços para o golpe.
let swing = null;
const swingNow = () => swing ?? 0;

function leg(rig, pose, side) {
    const { C, limb, ball } = rig;
    const g = rig.anim.stride + (side > 0 ? 0 : Math.PI);
    const run = pose.run;
    const hip = [0, side * S.legSpread, S.hipHeight];
    const reach = Math.sin(g) * S.stride * (0.15 + run);
    const lift = Math.max(0, Math.cos(g)) * S.footLift * (0.15 + run);
    const foot = [reach, side * S.legSpread * 1.15, 0.8 + lift];
    const knee = [reach * 0.45 + 1, side * S.legSpread * 1.05, S.hipHeight * 0.52 + lift * 0.5];
    return {
        depth: rig.project(...knee).depth,
        draw() {
            limb([hip, knee, foot], S.legWidth + 0.7, C.ink);
            limb([hip, knee, foot], S.legWidth, C.bark);
            limb([[hip[0] + 0.5, hip[1], hip[2] - 1], [knee[0] + 0.5, knee[1], knee[2]]], S.legWidth * 0.3, C.barkLight);
            // Pé de raiz: três dedos abertos para a frente
            for (const k of [-1, 0, 1]) limb([foot, [foot[0] + 2.2, foot[1] + k * 1.5, foot[2] - 0.3]], 1.2, C.barkDark);
            ball(foot, S.legWidth * 0.7, C.barkDark);
        }
    };
}

function arm(rig, pose, side) {
    const { C, limb, ball } = rig;
    const g = rig.anim.stride + (side > 0 ? Math.PI : 0);
    const run = pose.run;
    const k = swingNow();
    const shoulder = [0.6, side * (S.trunkWidth * 0.52), S.chestHeight - 2];
    const idle = [Math.sin(g) * 3 * run + 1.5, side * (S.trunkWidth * 0.52 + 4), S.chestHeight - 12];
    const raised = [S.armLength * 0.55, side * 5, S.chestHeight + 3];
    const hand = mix(idle, raised, k);
    const elbow = [(shoulder[0] + hand[0]) / 2 - 0.5, (shoulder[1] + hand[1]) / 2 + side * 2.2, (shoulder[2] + hand[2]) / 2 + 0.8];
    return {
        depth: rig.project(...elbow).depth + 0.3,
        draw() {
            limb([shoulder, elbow, hand], S.armWidth + 0.7, C.ink);
            limb([shoulder, elbow, hand], S.armWidth, C.bark);
            limb([mix(shoulder, elbow, 0.2), mix(elbow, hand, 0.7)].map(p => [p[0] + 0.3, p[1], p[2] + 0.4]), S.armWidth * 0.3, C.barkLight);
            // Mão de galhos: quatro dedos finos com uma folha na ponta
            const dir = [hand[0] - elbow[0], hand[1] - elbow[1], hand[2] - elbow[2]];
            const len = Math.hypot(...dir) || 1;
            for (const f of [-1.2, -0.4, 0.4, 1.2]) {
                const tip = [hand[0] + dir[0] / len * 4 + 0.2, hand[1] + dir[1] / len * 4 + f * 1.4, hand[2] + dir[2] / len * 4 + Math.abs(f) * 0.3];
                limb([hand, tip], 0.75, C.barkDark);
                ball(tip, 0.7, C.leafDark);
            }
            ball(hand, S.armWidth * 0.75, C.bark);
        }
    };
}

function body(rig, pose) {
    const { C, limb, ball } = rig;
    const bounce = Math.sin(rig.anim.stride * 2) * S.bounce * pose.run;
    const base = [0, 0, S.hipHeight + bounce];
    const top = [0, 0, S.chestHeight + bounce];
    return {
        depth: rig.project(0, 0, (base[2] + top[2]) / 2).depth,
        draw() {
            // Tronco: mais largo embaixo (as raízes que o seguram), casca com veios e musgo no ombro
            limb([[0, 0, S.hipHeight - 2 + bounce], base, top], S.trunkWidth + 0.8, C.ink);
            limb([[0, 0, S.hipHeight - 2 + bounce], base, top], S.trunkWidth, C.bark);
            ball([0, 0, S.hipHeight + 0.5 + bounce], S.trunkWidth * 0.5, C.barkDark);
            ball([0, 0, S.chestHeight + 0.4 + bounce], S.trunkWidth * 0.55, C.bark);
            for (const side of [-1, 1]) {
                limb([[0.8, side * S.trunkWidth * 0.3, base[2] + 0.5], [0.8, side * S.trunkWidth * 0.38, top[2] - 1]], 0.7, C.barkDark);
                limb([[1.5, side * S.trunkWidth * 0.12, base[2] + 1], [1.5, side * S.trunkWidth * 0.16, top[2] - 2]], 0.5, C.barkLight);
            }
            ball([1.2, S.trunkWidth * 0.34, top[2] - 0.6], 1.4, C.moss);
            ball([1.4, -S.trunkWidth * 0.22, base[2] + 3], 1.1, C.moss);
            // Cara entalhada no alto do tronco: sobrancelhas franzidas, olhos âmbar brilhando e uma boca funda
            const fz = S.chestHeight - 4.2 + bounce;
            const front = S.trunkWidth * 0.5;
            for (const side of [-1, 1]) {
                const eye = [front, side * 2.2, fz];
                if (!facesCamera(rig, eye, [0, 0, fz], 0.1)) continue;
                limb([[front - 0.2, side * 3.6, fz + 1.6], [front, side * 1.2, fz + 0.9]], 0.75, C.ink);
                glowAt(rig, eye, C.eyeGlow, 3.4, 0.9);
                ball(eye, 0.85, C.eye);
            }
            const mouth = [front, 0, fz - 3.3];
            if (facesCamera(rig, mouth, [0, 0, fz], 0.1)) limb([[front, -2.2, fz - 3.1], [front + 0.1, 0, fz - 3.8], [front, 2.2, fz - 3.1]], 1.05, C.mouth);
        }
    };
}

function crown(rig, pose) {
    const { C, ball, limb } = rig;
    const bounce = Math.sin(rig.anim.stride * 2) * S.bounce * pose.run;
    const c = [0, 0, S.crownHeight + bounce];
    return {
        depth: rig.project(...c).depth + 0.5,
        draw() {
            // Galhos grossos que sobem do tronco para sustentar a copa
            for (const side of [-1, 1]) limb([[0, side * 2, S.chestHeight - 1 + bounce], [0.5, side * 4.6, S.crownHeight - 2 + bounce]], 1.8, C.bark);
            // A copa: um monte de bolas de folhas, as escuras por baixo e as claras em cima
            for (let i = 0; i < S.crownBlobs; i++) {
                const a = (i / S.crownBlobs) * Math.PI * 2 + 0.4;
                const r = S.crownRadius * (0.55 + 0.25 * ((i * 5) % 3) / 2);
                const p = [Math.cos(a) * r * 0.9, Math.sin(a) * r, c[2] + ((i * 3) % 4) * 0.9 - 1.2];
                ball(p, S.crownRadius * 0.62, i % 3 === 0 ? C.leafDark : C.leaf);
            }
            ball([0, 0, c[2] + 2.2], S.crownRadius * 0.7, C.leaf);
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2 + 1.1;
                ball([Math.cos(a) * 3.6, Math.sin(a) * 4, c[2] + 4 + (i % 2)], 1.9, C.leafLight);
            }
        }
    };
}

function parts(pose, rig) {
    const order = [leg(rig, pose, -1), leg(rig, pose, 1), body(rig, pose), arm(rig, pose, -1), arm(rig, pose, 1), crown(rig, pose)];
    return order;
}

registerCreature('buddy_treant', S, parts);

export function renderTreant25D(e) {
    swing = e.swing ?? 0;
    renderMonster25D(e, 'buddy_treant', S);
    swing = null;
}
