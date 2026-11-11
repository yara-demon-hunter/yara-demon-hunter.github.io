import { VAMPIRE_25D_VISUALS as S } from './vampire25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { HERO_25D_VISUALS as V } from '../../../characters/hunter/hero25d_visual.js';
import { mix, add, norm, sub, olimb, oball } from '../../../characters/hunter/kit25d.js';
import { trunk, frontArc, poly, glowAt, facesCamera } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';
import { host } from '../../../core/host.js';

// --- VAMPIRO 2.5D ---
// O Vampiro de topdown/vampire/vampire.js no boneco 2.5D: nobre pálido de cabelo preto penteado para trás com o bico
// na testa, orelhas pontudas, olhos vermelhos e presas; gola alta de pontas rígidas com forro vermelho; capa preta em
// leque com o forro vermelho na borda; casaca escura de frisos prateados com o medalhão vermelho pulsando no peito.
// Desliza com as mãos juntas na frente do corpo e estica os braços, de unhas abertas, ao chegar perto do alvo.
// Medidas: vampire25d_visual.js (cores do topdown). Uso: renderVampire25D(e), ou o modelo 'vampire' em renderHero25D.

// Quanto ele está agarrando (0 a 1): o jogo informa por renderVampire25D; sem ele, previewGrab
let grab = null;
const grabNow = () => grab ?? S.previewGrab;

function drawTorso(rig, pose, bottom, top, wb, wt) {
    const { C, limb, ball } = rig;
    trunk(rig, bottom, top, wb, wt, C.suit, C.capeShade, 1, C.suitLight);
    frontArc(rig, bottom.a, bottom.z + 1.2, bottom.A * 1.06, bottom.B * 1.06, 0.9, C.capeShade);
    if (rig.sinF < -0.25) return;
    // Frisos prateados em V e o medalhão vermelho pulsando
    const chest = [top.a + top.A * 0.95, 0, top.z - 1.6];
    for (const side of [-1, 1]) limb([[top.a + top.A * 0.6, side * top.B * 0.7, top.z - 0.4], [bottom.a + bottom.A, 0, bottom.z + 2.5]], 0.3, C.trim);
    const pulse = 0.5 + 0.5 * Math.sin(pose.t * 2.4);
    glowAt(rig, chest, C.eyeGlow, S.medallionRadius * (1.8 + pulse), 0.4 + 0.3 * pulse);
    ball(chest, S.medallionRadius + 0.25, C.medallionRim);
    ball(chest, S.medallionRadius, C.medallion);
}

// Mãos juntas na frente do corpo → braços esticados agarrando
function armPose(pose, side) {
    const g = grabNow();
    const shoulder = [pose.lean, side * V.chest.B * 0.95, pose.shoulderZ - 0.5];
    const rest = [pose.lean + 3.4, side * 0.7, pose.shoulderZ - 5.6];
    const reach = [pose.lean + S.grabReach, side * 2.4, pose.shoulderZ - 1.2 + Math.sin(pose.t * 3 + side) * 0.3];
    let hand = mix(rest, reach, g);
    const held = side > 0 ? pose.sword : pose.free;
    if (held) hand = mix(hand, held.hand, held.w);
    const elbow = [(shoulder[0] + hand[0]) / 2 - 0.3 + (1 - g) * 0.8, (shoulder[1] + hand[1]) / 2 + side * (1.6 - g), (shoulder[2] + hand[2]) / 2 - 1.2 * (1 - g)];
    return { shoulder, elbow, hand };
}

function drawArm(rig, shoulder, elbow, hand) {
    const { C, limb } = rig;
    const g = grabNow();
    oball(rig, shoulder, S.sleeveWidth * 0.6, C.suit);
    olimb(rig, [shoulder, elbow, mix(elbow, hand, 0.82)], S.sleeveWidth, C.suit);
    limb([mix(elbow, hand, 0.74), mix(elbow, hand, 0.84)], S.sleeveWidth + 0.3, C.trim);
    oball(rig, hand, S.handRadius, C.skin);
    // Unhas compridas, abrindo em leque ao agarrar
    const d = norm(sub(hand, elbow));
    const side = norm([-d[1], d[0], 0]);
    for (let i = 0; i < 4; i++) {
        const k = (i / 3 - 0.5) * (0.5 + g);
        limb([add(add(hand, d, S.handRadius * 0.6), side, k * 0.8), add(add(hand, d, S.handRadius * 0.6 + S.nailLength * (0.5 + 0.5 * g)), side, k * 1.6)], 0.22, C.nail);
    }
}

function headParts(pose, rig) {
    const { C, project, ball, limb } = rig;
    const c = [pose.headA, 0, pose.headZ];
    const R = S.headRadius;
    const g = grabNow();
    const pulse = 0.5 + 0.5 * Math.sin(pose.t * 2.4);
    const neck = [pose.lean, 0, pose.shoulderZ];
    return [{
        // Gola alta: duas pontas rígidas atrás e dos lados da cabeça, com forro vermelho
        depth: project(neck[0] - 1.8, 0, pose.headZ).depth - 0.3,
        draw() {
            for (const side of [-1, 1]) {
                const back = [neck[0] - 1.6, side * 0.4, neck[2] + 0.4];
                const tip = [neck[0] - 1.9, side * S.collarSpread, neck[2] + S.collarHeight + 1.4];
                const front = [neck[0] + 1.6, side * S.collarSpread * 0.72, neck[2] + 0.6];
                poly(rig, [back, tip, front], C.collar, C.capeShade, 0.4);
                poly(rig, [mix(back, front, 0.25), mix(mix(back, front, 0.5), tip, 0.82), mix(back, front, 0.9)], C.collarLining);
            }
        }
    }, {
        depth: project(...c).depth,
        draw() {
            // Pescoço e orelhas pontudas
            limb([[neck[0], 0, neck[2]], [c[0] - 0.2, 0, c[2] - R * 0.7]], 1.6, C.skinShade);
            for (const side of [-1, 1]) {
                poly(rig, [[c[0] - 0.2, side * R * 0.85, c[2] - 0.3], [c[0] - 0.9, side * (R + 1.1), c[2] + 1.3], [c[0] + 0.3, side * R * 0.9, c[2] + 0.5]], C.skin, C.capeShade, 0.3);
            }
            oball(rig, c, R, C.skin);
            // Cabelo preto penteado para trás, com o bico na testa e o brilho em riscos
            ball([c[0] - R * 0.55, 0, c[2] + R * 0.42], R * 0.82, C.hair);
            limb([[c[0] - R * 0.1, 0, c[2] + R * 1.0], [c[0] + R * 0.62, 0, c[2] + R * 0.66]], 0.8, C.hair);
            for (const b of [-0.9, 0, 0.9]) {
                limb([[c[0] + R * 0.05, b, c[2] + R * 1.05], [c[0] - R * 0.8, b * 1.3, c[2] + R * 0.85]], 0.2, C.hairShine);
            }
            const face = [c[0] + R * 0.85, 0, c[2]];
            if (!facesCamera(rig, face, c)) return;
            // Olhos vermelhos (brilham mais ao agarrar), sobrancelhas e presas
            for (const side of [-1, 1]) {
                const eye = [c[0] + R * 0.86, side * R * 0.36, c[2] + R * 0.08];
                glowAt(rig, eye, C.eyeGlow, S.eyeGlow * (0.8 + 0.3 * pulse + 0.6 * g), 0.85);
                ball(eye, 0.3, C.eye);
                limb([[eye[0], side * R * 0.62, eye[2] + 0.7], [eye[0] + 0.1, side * R * 0.14, eye[2] + 0.42]], 0.24, C.hair);
                const fang = [c[0] + R * 0.86, side * 0.32, c[2] - R * 0.5];
                limb([fang, [fang[0], fang[1], fang[2] - S.fangLength * (0.6 + 0.4 * g)]], 0.22, C.fang);
            }
            limb([[c[0] + R * 0.88, -0.6, c[2] - R * 0.48], [c[0] + R * 0.92, 0, c[2] - R * 0.52], [c[0] + R * 0.88, 0.6, c[2] - R * 0.48]], 0.16, C.skinShade);
        }
    }];
}

registerBody('vampire', {
    vis: S,
    // Desliza flutuando: o corpo sobe e desce devagar
    poseTweak: (pose) => {
        const bob = Math.sin(pose.t * S.floatHz * Math.PI * 2) * S.floatAmount;
        pose.hipZ += bob;
        pose.shoulderZ += bob;
        pose.headZ += bob;
    },
    drawTorso,
    // Capa preta em leque, com o forro vermelho na borda; vista de costas, cobre o tronco
    drawBack: (rig, pose, anchors, hem) => rig.drawCapeShape(
        anchors.map(p => [p[0] - 0.2, p[1] * S.capeSpread, p[2] + 0.5]),
        hem.map(p => [p[0], p[1] * S.capeHemSpread, Math.max(0.4, p[2] - 1.6)]),
        { thickness: S.capeLining }
    ),
    backDepth: (rig, pose, depth) => (rig.sinF < 0 ? Math.max(depth, rig.project(pose.lean * 0.6, 0, 13.5).depth + 0.05) : depth),
    freeArm: (rig, pose) => armPose(pose, -1),
    drawArm: (rig, shoulder, elbow, hand) => drawArm(rig, shoulder, elbow, hand),
    swordArmPart: (rig, pose) => {
        const { shoulder, elbow, hand } = armPose(pose, 1);
        return { depth: rig.project(...elbow).depth + 0.1, draw: () => drawArm(rig, shoulder, elbow, hand) };
    },
    drawn: () => 0,
    headParts
});

// --- NO JOGO (câmera do Last Torch) ---
// Estica os braços quando o alvo (o herói, informado pelo jogo em core/host.js) chega perto
const grabByVampire = new WeakMap();
export function renderVampire25D(e) {
    const target = host.target();
    const near = target && Math.hypot(target.x - e.x, target.y - e.y) < S.grabDistance + e.radius ? 1 : 0;
    const g = (grabByVampire.get(e) ?? 0) + (near - (grabByVampire.get(e) ?? 0)) * 0.1;
    grabByVampire.set(e, g);
    grab = g;
    renderMonster25D(e, 'vampire', S);
    grab = null;
}
