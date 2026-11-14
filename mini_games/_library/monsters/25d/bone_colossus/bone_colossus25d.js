import { BONE_COLOSSUS_25D_VISUALS as S } from './bone_colossus25d_visual.js';
import { BONE_COLOSSUS_VISUALS as TD } from '../../topdown/bone_colossus/bone_colossus_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { HERO_25D_VISUALS as V } from '../../../characters/hunter/hero25d_visual.js';
import { mix, norm } from '../../../characters/hunter/kit25d.js';
import { skeletonBody, renderSkeletonModel } from '../skeleton/skeleton25d.js';
import { poly } from '../creature25d.js';

// --- COLOSSO DE OSSOS 2.5D ---
// Como no desenho de cima (topdown/bone_colossus): é o Esqueleto 2.5D (../skeleton/skeleton25d.js) em tamanho gigante,
// com ossos mais escuros e grossos, a alma em brasa laranja e o montante pesado na mão direita. O golpe na tocha é só
// esse braço: recua erguendo a espada, desce rápido à frente e volta devagar (tempos em TD.slam, os mesmos do jogo).
// Medidas: bone_colossus25d_visual.js. Uso: renderBoneColossus25D(e) (lê e.slamState, e.slamTimer, e.slamRecover),
// ou o modelo 'bone_colossus' em renderHero25D.
const base = skeletonBody(S);

// Mão e direção da espada em cada momento do golpe
const POSES = {
    rest: { hand: [4.5, 6, 10.5], dir: norm([0.82, 0.25, 0.5]) },
    back: { hand: [-1.5, 6.5, 18], dir: norm([-0.6, 0.25, 0.76]) },
    hit: { hand: [7.5, 3, 8.5], dir: norm([0.95, -0.1, -0.3]) }
};
const blendPose = (a, b, k) => ({ hand: mix(a.hand, b.hand, k), dir: norm(mix(a.dir, b.dir, k)) });
const smooth = (k) => k * k * (3 - 2 * k);

// Pose do golpe: o jogo informa por renderBoneColossus25D; sem ele, previewSlam
let slam = null;
function swordPose() {
    if (slam) return slam;
    const k = Math.max(0, Math.min(1, S.previewSlam));
    return k < 0.5 ? blendPose(POSES.rest, POSES.back, k * 2) : blendPose(POSES.back, POSES.hit, (k - 0.5) * 2);
}

function slamFromGame(e) {
    const T = TD.slam;
    if (e.slamState === 1) return blendPose(POSES.rest, POSES.back, smooth(Math.min(1, (1 - e.slamTimer / T.windupSeconds) / 0.7)));
    if (e.slamState === 2) {
        const p = 1 - e.slamTimer / T.strikeSeconds;
        return blendPose(POSES.back, POSES.hit, p * p);
    }
    if (e.slamRecover > 0) {
        const q = 1 - e.slamRecover / T.recoverSeconds;
        return blendPose(POSES.hit, POSES.rest, q < 0.25 ? 0 : smooth((q - 0.25) / 0.75));
    }
    return POSES.rest;
}

registerBody('bone_colossus', {
    ...base,
    drawn: () => 1,
    // Em repouso (e no golpe na tocha) a espada fica na pose do Colosso; no golpe do combo (blend → 1) a mão acompanha
    // a varredura do motor, e o braço vai junto (swordArmPart lê a mesma mão)
    swordRest(rig, pose, { hand, dir, blend }) {
        const p = swordPose();
        const k = 1 - blend;
        return { hand: mix(hand, p.hand, k), dir: norm(mix(dir, p.dir, k)) };
    },
    // O braço direito segue a mão no cabo da espada
    swordArmPart(rig, pose) {
        const { hand } = rig.swordArmPose(pose);
        const shoulder = [pose.lean, V.chest.B * 0.98, pose.shoulderZ - 0.4];
        const elbow = [(shoulder[0] + hand[0]) / 2 - 0.5, (shoulder[1] + hand[1]) / 2 + 1.2, (shoulder[2] + hand[2]) / 2 - 1.5];
        return { depth: rig.project(...elbow).depth + 0.1, draw: () => base.drawArm(rig, shoulder, elbow, hand) };
    },
    drawBlade(rig, hand, dir) {
        const { C } = rig;
        const at = (d) => [hand[0] + dir[0] * d, hand[1] + dir[1] * d, hand[2] + dir[2] * d];
        const flat = Math.hypot(dir[0], dir[1]);
        const side = flat > 0.05 ? [-dir[1] / flat, dir[0] / flat, 0] : [0, 1, 0];
        const offset = (point, amount) => [point[0] + side[0] * amount, point[1] + side[1] * amount, point[2]];
        rig.limb([at(-2.6), at(0.6)], 1.3, C.swordGrip);
        rig.ball(at(-2.8), 0.9, C.swordGold);
        const guard = at(1);
        rig.limb([offset(guard, -S.bladeWidth * 1.5), offset(guard, S.bladeWidth * 1.5)], 1.2, C.swordGold);

        // Montante facetado: gumes paralelos no corpo e um bico comprido, reto e anguloso.
        const base = at(1.3);
        const shoulder = at(S.bladeLength - S.bladeWidth * 1.7);
        const tip = at(S.bladeLength);
        const half = S.bladeWidth * 0.9;
        poly(rig, [offset(base, -half), offset(shoulder, -half), tip, offset(shoulder, half), offset(base, half)], C.swordDark, C.ink, 0.55);
        poly(rig, [offset(base, -half * 0.62), offset(shoulder, -half * 0.62), tip, offset(shoulder, half * 0.55), offset(base, half * 0.55)], C.swordSteel);
        poly(rig, [offset(base, -half * 0.62), offset(shoulder, -half * 0.62), tip], C.swordEdge);
    }
});

export function renderBoneColossus25D(e) {
    slam = slamFromGame(e);
    renderSkeletonModel(e, 'bone_colossus', S);
    slam = null;
}
