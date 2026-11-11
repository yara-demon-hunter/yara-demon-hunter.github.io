// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/wraith/wraith25d.js e rode o sync.
import { WRAITH_25D_VISUALS as S } from './wraith25d_visual.js';
import { registerCreature, glowAt, facesCamera, withAlpha } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';
import { flowChain, drawRibbon, mix } from '../../../characters/hunter/kit25d.js';

// --- ESPECTRO 2.5D ---
// O Espectro de topdown/wraith/wraith.js em 2.5D: um manto meio transparente que flutua sem pernas, de ombros largos
// afinando até a barra em fiapos que ondulam para trás; capuz vazio e escuro com dois olhos frios brilhando; mangas
// vazias pendendo. Mirando, ele brilha; disparando, os fiapos esticam. Medidas: wraith25d_visual.js (cores do topdown).
// Uso: renderWraith25D(e) (lê e.lungeState: 1 = mirando, 2 = disparando), ou o modelo 'wraith' em renderHero25D.

// Estado do ataque: o jogo informa por renderWraith25D; sem ele, previewAim / previewLunge
let state = null;
const aimNow = () => (state ? (state.aim ? 1 : 0) : S.previewAim);
const lungeNow = () => (state ? (state.lunge ? 1 : 0) : S.previewLunge);

function parts(pose, rig) {
    const { C, project, ball, limb, anim } = rig;
    const t = pose.t;
    const bobZ = Math.sin(t * S.floatHz * Math.PI * 2) * S.floatAmount;
    const sh = [S.lean, 0, S.shoulderHeight + bobZ];
    const hem = [-0.6, 0, S.floatHeight + bobZ];
    const hood = [S.lean + 1.1, 0, S.hoodHeight + bobZ];
    const stretch = 1 + (S.lungeStretch - 1) * lungeNow();
    return [{
        // Fiapos da barra
        depth: project(-3, 0, S.floatHeight).depth - 0.5,
        draw: () => withAlpha(S.alpha, () => {
            for (let i = 0; i < S.wisps; i++) {
                const k = i / (S.wisps - 1) - 0.5;
                const root = [hem[0] + Math.cos(k * 3) * 0.6, k * S.shoulderRadius * S.taper * 2.2, hem[2] + 0.4];
                const chain = flowChain(root, pose, anim, {
                    hang: [-0.35, k * 0.3, -1], stream: [-1, k * 0.2, -0.25], len: S.wispLength * stretch * (1 - Math.abs(k) * 0.5), segs: 5,
                    amp: 0.7, ampRun: 0.6, speed: 4.5, speedRun: 6, waveLength: 2.4, phase: i * 1.7, lag: 0.3
                });
                drawRibbon(rig, chain, S.wispWidth * (1 - Math.abs(k) * 0.6), 0.1, C.wisp, C.wisp, false);
            }
        })
    }, {
        // Manto, mangas e capuz
        depth: project(...sh).depth,
        draw: () => withAlpha(S.alpha, () => {
            if (aimNow() > 0) glowAt(rig, mix(sh, hood, 0.5), C.aimAura, S.auraRadius * 0.7, 0.5 * aimNow());
            // Mangas vazias, pendendo e balançando
            for (const side of [-1, 1]) {
                const top = [sh[0], side * S.shoulderRadius * 0.85, sh[2]];
                const end = [sh[0] + 1.2 + Math.sin(t * 1.7 + side) * 0.6, side * (S.shoulderRadius + 0.6), sh[2] - S.sleeveLength];
                limb([top, mix(top, end, 0.5).map((v, i) => (i === 1 ? v + side * 0.6 : v)), end], S.sleeveWidth + 0.5, C.cloak);
                limb([mix(top, end, 0.75), end], S.sleeveWidth + 1.1, C.cloak);
            }
            // Corpo: dos ombros afinando até a barra
            for (let i = 0; i <= 5; i++) {
                const k = i / 5;
                ball(mix(sh, hem, k), S.shoulderRadius * (1 - (1 - S.taper) * k), C.cloak);
            }
            ball([sh[0] + 0.6, 0, sh[2] + 0.8], S.shoulderRadius * 0.62, C.cloakLight);
            // Capuz vazio: bola clara, abertura escura e os dois olhos frios
            ball(hood, S.hoodRadius, C.cloakLight);
            ball([hood[0] - 0.9, 0, hood[2] + 0.5], S.hoodRadius * 0.8, C.cloak);
            const open = [hood[0] + S.hoodRadius * 0.5, 0, hood[2] - 0.3];
            if (facesCamera(rig, open, hood)) {
                ball(open, S.hoodRadius * 0.68, C.hoodInner);
                for (const side of [-1, 1]) {
                    const eye = [open[0] + S.hoodRadius * 0.45, side * S.eyeSpread, open[2] + 0.2];
                    glowAt(rig, eye, C.eyeGlow, S.eyeGlow * (1 + 0.5 * aimNow()), 0.9);
                    ball(eye, 0.4, C.eye);
                }
            }
        })
    }];
}

registerCreature('wraith', S, parts);

export function renderWraith25D(e) {
    renderMonster25D(e, 'wraith', S, { before: () => { state = { aim: e.lungeState === 1, lunge: e.lungeState === 2 }; } });
    state = null;
}
