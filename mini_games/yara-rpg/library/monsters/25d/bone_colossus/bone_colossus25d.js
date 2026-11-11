// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/bone_colossus/bone_colossus25d.js e rode o sync.
import { BONE_COLOSSUS_25D_VISUALS as S } from './bone_colossus25d_visual.js';
import { BONE_COLOSSUS_VISUALS as TD } from '../../topdown/bone_colossus/bone_colossus_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { HERO_25D_VISUALS as V } from '../../../characters/hunter/hero25d_visual.js';
import { mix, norm } from '../../../characters/hunter/kit25d.js';
import { skeletonBody, renderSkeletonModel } from '../skeleton/skeleton25d.js';
import { greatsword } from '../creature25d.js';

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
        greatsword(rig, hand, dir, S.bladeLength, S.bladeWidth, { blade: C.swordSteel, edge: C.swordEdge, guard: C.swordGold, grip: C.swordGrip, dark: C.swordDark });
    }
});

export function renderBoneColossus25D(e) {
    slam = slamFromGame(e);
    renderSkeletonModel(e, 'bone_colossus', S);
    slam = null;
}
