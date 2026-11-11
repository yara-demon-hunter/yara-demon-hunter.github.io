// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/topdown/bone_colossus/bone_colossus.js e rode o sync.
import { BONE_COLOSSUS_VISUALS as V } from './bone_colossus_visual.js';
import { SKELETON_VISUALS } from '../skeleton/skeleton_visual.js';
import { ctx } from '../../../core/canvas.js';
import { renderSkeleton } from '../skeleton/skeleton.js';

// --- COLOSSO DE OSSOS (desenho procedural, sem imagens) ---
// É o esqueleto normal, repintado e gigante, com a espada na mão direita. O golpe é só esse braço: recua
// (slamState 1), vai rápido para a frente até a ponta bater na tocha (2) e volta devagar (slamRecover).
const TAU = Math.PI * 2;
// Tempos do golpe (os mesmos que a lógica do jogo usa): bone_colossus_visual.js
const SLAM = V.slam;

const smooth = (p) => p * p * (3 - 2 * p);
const mix = (from, to, k) => ({
    reach: from.reach + (to.reach - from.reach) * k,
    spread: from.spread + (to.spread - from.spread) * k,
    angle: from.angle + (to.angle - from.angle) * k
});

function armPose(e) {
    const { rest, back, hit } = V.poses;
    if (e.slamState === 1) return mix(rest, back, smooth(Math.min(1, (1 - e.slamTimer / SLAM.windupSeconds) / 0.7)));
    if (e.slamState === 2) {
        const p = 1 - e.slamTimer / SLAM.strikeSeconds;
        return mix(back, hit, p * p);
    }
    if (e.slamRecover > 0) {
        // Fica um instante na tocha e só então volta
        const q = 1 - e.slamRecover / SLAM.recoverSeconds;
        return mix(hit, rest, q < 0.25 ? 0 : smooth((q - 0.25) / 0.75));
    }
    return rest;
}

// Espada apontando para +x, com a mão fechada no cabo
function drawSword(r) {
    const S = V.sword;
    const len = S.length * r;
    const w = S.width * r;

    ctx.fillStyle = S.grip;
    ctx.fillRect(-w * 0.8, -w * 0.22, w * 1.5, w * 0.44);
    ctx.fillStyle = S.gold;
    ctx.beginPath();
    ctx.arc(-w * 0.85, 0, w * 0.3, 0, TAU);
    ctx.fill();
    ctx.fillRect(w * 0.6, -w * 0.9, w * 0.4, w * 1.8);

    // Lâmina larga, com sulco no meio e gume mais claro
    ctx.fillStyle = S.steelDark;
    ctx.beginPath();
    ctx.moveTo(w, -w * 0.5);
    ctx.lineTo(len * 0.9, -w * 0.5);
    ctx.lineTo(len, 0);
    ctx.lineTo(len * 0.9, w * 0.5);
    ctx.lineTo(w, w * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = S.steel;
    ctx.fillRect(w, -w * 0.32, len * 0.65, w * 0.64);
    ctx.strokeStyle = S.edge;
    ctx.lineWidth = Math.max(0.8, w * 0.08);
    ctx.beginPath();
    ctx.moveTo(w, w * 0.5);
    ctx.lineTo(len * 0.9, w * 0.5);
    ctx.lineTo(len, 0);
    ctx.stroke();
}

// Quanto o golpe já carregou (0 a 1), para o brilho na tocha
export function colossusCharge(e) {
    if (e.slamState === 2) return 1;
    return e.slamState === 1 ? 1 - e.slamTimer / SLAM.windupSeconds : 0;
}

// Prévias: põe o golpe no instante pedido, para repetir o ciclo sem a lógica da partida
export const COLOSSUS_ATTACK_SECONDS = SLAM.windupSeconds + SLAM.strikeSeconds + SLAM.recoverSeconds;
export function setColossusAttackClock(e, seconds) {
    const strikeStart = SLAM.windupSeconds;
    const strikeEnd = strikeStart + SLAM.strikeSeconds;
    e.planted = true;
    e.slamState = seconds < strikeStart ? 1 : seconds < strikeEnd ? 2 : 0;
    e.slamTimer = seconds < strikeStart ? strikeStart - seconds : strikeEnd - seconds;
    e.slamRecover = Math.max(0, COLOSSUS_ATTACK_SECONDS - Math.max(seconds, strikeEnd));
}

export function renderBoneColossus(e) {
    const arm = armPose(e);

    // O esqueleto lê as cores de SKELETON_VISUALS: troca por um instante, como nas outras reaproveitadas
    const original = SKELETON_VISUALS.colors;
    SKELETON_VISUALS.colors = V.colors;
    renderSkeleton(e, {
        planted: e.planted,
        held: {
            reach: arm.reach,
            spread: arm.spread,
            draw: (hand, r) => {
                ctx.save();
                ctx.translate(hand[0], hand[1]);
                ctx.rotate(arm.angle);
                drawSword(r);
                ctx.restore();
            }
        }
    });
    SKELETON_VISUALS.colors = original;
}
