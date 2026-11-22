import { BOG_TOAD_25D_VISUALS as S } from './bog_toad25d_visual.js';
import { registerCreature, facesCamera } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';

const TAU = Math.PI * 2;

// --- SAPO DO PÂNTANO 2.5D ---
// Corpo largo e baixo (uma bola grande com as laterais cheias), cabeça com a boca larga, dois olhos saltados no alto, o papo amarelo que infla e
// desinfla, verrugas nas costas, patas da frente curtas e as traseiras dobradas em Z que se esticam no pulo (a cada passada, só ao andar).
// Medidas e cores: bog_toad25d_visual.js. Uso: renderBogToad25D(e), ou o modelo 'bog_toad' em renderHero25D.
function parts(pose, rig) {
    const { C, project, ball, limb } = rig;
    const t = pose.t;
    // Pulinho: um por passada (sobe e desce suave); sem andar, fica agachado
    const hop = (0.5 - 0.5 * Math.cos(rig.anim.stride)) * S.hop * Math.min(1, pose.run * 2.5);
    const z = S.bodyHeight + hop;
    const R = S.bodyR;
    const breath = 0.5 + 0.5 * Math.sin(t * S.throatPulseHz * TAU);
    const items = [];
    const add = (center, draw) => items.push({ depth: project(...center).depth, draw });
    // Pernas traseiras: coxa, perna e pé comprido, dobrados em Z; esticam no pulo
    for (const sd of [-1, 1]) {
        const stretch = Math.min(1, hop / S.hop || 0);
        const hip = [-R * 0.55, sd * R * 0.75, z - 0.2];
        const knee = [-R * 0.55 - 1.8 - stretch * 1.5, sd * (R * 1.25 + 0.4), 1.7 + stretch * 1.4];
        const foot = [-R * 0.1 + stretch * 1.6, sd * (R * 1.2), 0.5 + stretch * 0.4];
        add(knee, () => {
            limb([hip, knee], S.thigh + 0.6, C.outline);
            limb([hip, knee], S.thigh, C.bodyDark);
            limb([knee, foot], S.thigh * 0.8 + 0.6, C.outline);
            limb([knee, foot], S.thigh * 0.8, C.body);
            limb([foot, [foot[0] + 2.1, foot[1] + sd * 0.4, foot[2]]], 1.3 + 0.6, C.outline);
            limb([foot, [foot[0] + 2.1, foot[1] + sd * 0.4, foot[2]]], 1.3, C.bodyLight);
            for (const k of [-0.7, 0, 0.7]) limb([[foot[0] + 1.8, foot[1] + sd * 0.4 + k, foot[2]], [foot[0] + 2.9, foot[1] + sd * 0.4 + k * 1.5, foot[2]]], 0.4, C.bodyLight);
        });
    }
    // Patas da frente
    for (const sd of [-1, 1]) {
        const top = [R * 0.55, sd * R * 0.7, z - 0.6];
        const foot = [R * 0.95, sd * R * 0.85, 0.5];
        add(foot, () => {
            limb([top, foot], 1.9 + 0.6, C.outline);
            limb([top, foot], 1.9, C.bodyDark);
            limb([foot, [foot[0] + 1.4, foot[1] + sd * 0.3, foot[2]]], 1.2, C.bodyLight);
        });
    }
    // Corpo: a bola grande, as laterais e a barriga clara
    add([0, 0, z], () => {
        ball([0, 0, z], R + 0.4, C.outline);
        ball([0, 0, z], R, C.body);
        for (const sd of [-1, 1]) ball([-0.3, sd * R * 0.62, z - 0.5], R * 0.75, C.bodyDark);
        ball([0.5, 0, z + R * 0.28], R * 0.8, C.bodyLight);
        ball([0.9, 0, z - R * 0.6], R * 0.62, C.belly);
        // Verrugas nas costas
        for (let i = 0; i < S.warts; i++) {
            const a = (i / S.warts) * TAU * 1.7;
            const d = 0.35 + (i % 3) * 0.2;
            ball([Math.cos(a) * R * d - 0.6, Math.sin(a) * R * d * 1.1, z + R * 0.82 - d * 0.8], 0.45 + (i % 2) * 0.2, C.wart);
        }
    });
    // Cabeça com a boca larga, o papo e os olhos saltados
    const hc = [R * 0.95, 0, z + 0.9];
    const Hr = S.headR;
    add([hc[0] + 1, 0, hc[2]], () => {
        ball(hc, Hr + 0.4, C.outline);
        ball(hc, Hr, C.body);
        ball([hc[0] + 0.7, 0, hc[2] + 0.6], Hr * 0.7, C.bodyLight);
        // Papo: infla e desinfla na frente de baixo da cabeça
        ball([hc[0] + Hr * 0.55, 0, hc[2] - Hr * 0.85], Hr * (0.5 + 0.22 * breath), C.throat);
        const mouthY = (a) => [hc[0] + Hr * (0.92 - Math.abs(a) * 0.18), a * Hr * 0.95, hc[2] - Hr * 0.35];
        limb([mouthY(-1), mouthY(-0.5), mouthY(0), mouthY(0.5), mouthY(1)], 0.55, C.mouth);
        for (const sd of [-1, 1]) {
            const eye = [hc[0] + 0.4, sd * Hr * 0.62, hc[2] + Hr * 0.95];
            ball(eye, S.eyeR + 0.3, C.outline);
            ball(eye, S.eyeR, C.eyeRim);
            ball([eye[0] + 0.25, eye[1], eye[2] + 0.1], S.eyeR * 0.82, C.eye);
            if (facesCamera(rig, [eye[0] + S.eyeR, eye[1], eye[2]], eye)) limb([[eye[0] + S.eyeR * 0.85, eye[1], eye[2] - S.eyeR * 0.5], [eye[0] + S.eyeR * 0.85, eye[1], eye[2] + S.eyeR * 0.5]], 0.38, C.pupil);
            ball([hc[0] + Hr * 0.95, sd * Hr * 0.22, hc[2] + Hr * 0.12], 0.2, C.mouth);
        }
    });
    return items;
}

registerCreature('bog_toad', S, parts);

export function renderBogToad25D(e) {
    renderMonster25D(e, 'bog_toad', S);
}
