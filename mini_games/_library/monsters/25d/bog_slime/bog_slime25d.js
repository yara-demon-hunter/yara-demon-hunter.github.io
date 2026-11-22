import { BOG_SLIME_25D_VISUALS as S } from './bog_slime25d_visual.js';
import { registerCreature, glowAt } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';

const TAU = Math.PI * 2;

// --- LODO VIVO 2.5D ---
// Uma bola grande que balança (aperta e estica) com pseudópodes em volta que se arrastam, uma poça escura no chão, bolhas claras subindo por dentro, um
// crânio meio dissolvido visível no corpo, o brilho molhado no alto e dois olhos amarelos. Medidas e cores: bog_slime25d_visual.js.
// Uso: renderBogSlime25D(e), ou o modelo 'bog_slime' em renderHero25D.
function parts(pose, rig) {
    const { C, project, ball, limb } = rig;
    const t = pose.t;
    const w = Math.sin(t * S.wobbleHz * TAU);
    const sx = 1 + S.wobble * w;                       // aperta de um lado e estica do outro
    const R = S.bodyR;
    const zc = R * 0.85 + 0.6 - S.wobble * w * 0.8;
    const items = [];
    const body = [];
    for (let i = 0; i < S.blobs; i++) {
        const a = (i / S.blobs) * TAU + 0.5;
        const reach = R * (0.95 + 0.2 * Math.sin(t * TAU + i * 1.7));
        body.push({ p: [Math.cos(a) * reach * sx, Math.sin(a) * reach, 1.5 + 0.5 * Math.sin(t * TAU * 2 + i)], r: R * (0.48 + 0.1 * Math.sin(i * 2.3)) });
    }
    for (const b of body) {
        items.push({ depth: project(0, 0, zc).depth - 0.6, draw() { ball(b.p, b.r + 0.35, C.outline); ball(b.p, b.r, C.bodyDark); ball([b.p[0], b.p[1], b.p[2] + b.r * 0.35], b.r * 0.6, C.body); } });
    }
    items.push({
        depth: project(0, 0, zc).depth,
        draw() {
            glowAt(rig, [0, 0, zc], C.glow, R * 2, 0.4);
            ball([0, 0, zc], R + 0.45, C.outline);
            ball([0, 0, zc], R, C.bodyDark);
            ball([0.3, 0, zc + R * 0.2], R * 0.86, C.body);
            ball([0.6, 0, zc + R * 0.5], R * 0.55, C.bodyLight);
            // Crânio meio dissolvido por dentro
            ball([-0.9, 0.5, zc + 0.4], 1.9, C.skull);
            ball([-0.5, 0.5, zc - 0.7], 1.1, C.skull);
            // Bolhas subindo pelo corpo
            for (let i = 0; i < S.bubbles; i++) {
                const k = (t + i / S.bubbles) % 1;
                const a = i * 2.4;
                ball([Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.55, zc - R * 0.5 + k * R * 1.3], 0.32 + (i % 3) * 0.14, C.bubble);
            }
            // Brilho molhado no alto
            limb([[-0.4, -R * 0.5, zc + R * 0.9], [0.4, -R * 0.15, zc + R * 1.0]], 0.7, C.shine);
            ball([0.2, -R * 0.62, zc + R * 0.7], 0.55, C.shine);
            // Olhos amarelos e a boca escura, na frente
            for (const sd of [-1, 1]) {
                const eye = [R * 0.78, sd * R * 0.36, zc + R * 0.34];
                ball(eye, 0.95, C.outline);
                ball(eye, 0.78, C.eye);
                ball([eye[0] + 0.45, eye[1], eye[2]], 0.34, C.pupil);
            }
            ball([R * 0.92, 0, zc - R * 0.16], R * 0.2, C.mouth);
        }
    });
    return items;
}

registerCreature('bog_slime', S, parts);

export function renderBogSlime25D(e) {
    renderMonster25D(e, 'bog_slime', S);
}
