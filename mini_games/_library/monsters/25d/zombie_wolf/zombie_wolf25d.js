import { ZOMBIE_WOLF_25D_VISUALS as S } from './zombie_wolf25d_visual.js';
import { registerCreature, flame, glowAt, facesCamera } from '../creature25d.js';
import { wolfParts } from '../wolf25d.js';
import { renderMonster25D } from '../monster25d.js';
import { mix } from '../../../characters/hunter/kit25d.js';

// --- LOBO ZUMBI 2.5D ---
// O Lobo Zumbi de topdown/zombie_wolf/zombie_wolf.js no corpo de lobo 2.5D (../wolf25d.js): magro, com as costelas à
// mostra nos flancos, a chama roxa da maldição subindo da espinha e da ponta da cauda, o crânio exposto de um lado do
// rosto, olhos que brilham e a coleira de ferro partida com a corrente chacoalhando. Medidas: zombie_wolf25d_visual.js.
// Uso: renderZombieWolf25D(e), ou o modelo 'zombie_wolf' em renderHero25D.
function parts(pose, rig) {
    const { C, limb, ball } = rig;
    const flames = [C.flame, C.flameMid, C.flameTip];
    return wolfParts(pose, rig, S, {
        body(r, f) {
            // Costelas: carne escura no flanco e os ossos por cima, dos dois lados
            for (const side of [-1, 1]) {
                const c = mix(f.hip, f.sh, 0.58);
                const y = side * S.bodyWidth * 0.5;
                if (!facesCamera(rig, [c[0], y, c[2]], [c[0], 0, c[2]])) continue;
                limb([[c[0] - S.ribPatchLength / 2, y, c[2] - 0.2], [c[0] + S.ribPatchLength / 2, y, c[2]]], S.bodyWidth * 0.55, C.gum);
                for (let i = 0; i < S.ribs; i++) {
                    const x = c[0] - S.ribPatchLength / 2 + (i / (S.ribs - 1)) * S.ribPatchLength;
                    limb([[x - 0.2, y * 0.9, c[2] + S.bodyWidth * 0.28], [x + 0.25, y * 1.05, c[2]], [x - 0.2, y * 0.9, c[2] - S.bodyWidth * 0.28]], 0.42, C.bone);
                }
            }
            // Chama ao longo da espinha, apontando para cima e para trás
            for (let i = 0; i < S.spineFlames; i++) {
                const k = i / (S.spineFlames - 1);
                const base = mix(f.sh, f.hip, k).map((v, j) => (j === 2 ? v + S.bodyWidth * 0.42 : v));
                const h = S.flameHeight * (0.65 + 0.35 * Math.sin(i * 1.9 + 1)) * (0.85 + 0.15 * Math.sin(f.t * 9 + i * 2.3));
                const tip = [base[0] - h * (0.45 + f.run * 0.4), Math.sin(f.t * 6 + i) * 0.3, base[2] + h];
                if (i % 3 === 0) glowAt(rig, base, C.flameGlow, S.flameHeight * 1.2, 0.5);
                flame(rig, base, tip, S.flameWidth, flames, Math.sin(f.t * 8 + i * 1.7) * 0.5);
            }
        },
        tail(r, f) {
            // Cauda magra de pelo e a chama na ponta
            const sway = Math.sin(f.t * 5) * 0.8;
            const mid = [f.hip[0] - S.tailLength * 0.5, sway * 0.5, f.hip[2] + 0.4];
            const tip = [f.hip[0] - S.tailLength, sway, f.hip[2] - 1.2];
            limb([f.hip, mid, tip], 1.5, C.ink);
            limb([f.hip, mid, tip], 1.0, C.furDark);
            glowAt(rig, tip, C.flameGlow, S.tailFlame * 1.3, 0.55);
            flame(rig, tip, [tip[0] - S.tailFlame * 0.7, sway, tip[2] + S.tailFlame * 0.75], S.flameWidth * 1.1, flames, Math.sin(f.t * 8) * 0.5);
        },
        neck(r, f) {
            // Coleira de ferro partida e a corrente chacoalhando
            const c = mix(f.sh, f.head, 0.62);
            limb([[c[0] - 0.4, 0, c[2] - S.bodyWidth * 0.42], [c[0] + 0.3, 0, c[2] + S.bodyWidth * 0.42]], S.bodyWidth * 0.78, C.iron);
            limb([[c[0] - 0.4, 0, c[2] - S.bodyWidth * 0.3], [c[0] + 0.3, 0, c[2] + S.bodyWidth * 0.3]], S.bodyWidth * 0.5, C.rust);
            for (let i = 0; i < 3; i++) {
                ball([c[0] - 0.3 + Math.sin(f.t * 7 + i) * 0.35 * (i + 1) * 0.5, 0.3, c[2] - S.bodyWidth * 0.5 - 0.7 * (i + 1)], 0.42, C.rust);
            }
        },
        head(r, f) {
            // Crânio exposto do lado direito do rosto: osso com a órbita funda
            const R = S.headRadius;
            const side = [f.head[0] + R * 0.25, R * 0.72, f.head[2] + R * 0.15];
            if (facesCamera(rig, side, f.head)) {
                // Mancha de osso achatada na lateral (duas bolas pequenas), com a órbita escura e o olho no fundo
                ball(side, R * 0.46, C.boneDark);
                ball(side, R * 0.38, C.bone);
                ball([side[0] + R * 0.45, side[1] - R * 0.05, side[2] - R * 0.15], R * 0.3, C.bone);
                const socket = [f.head[0] + R * 0.55, R * 0.9, f.head[2] + R * 0.25];
                ball(socket, R * 0.2, C.ink);
                ball(socket, R * 0.09, C.eye);
            }
        }
    });
}

registerCreature('zombie_wolf', S, parts);

export function renderZombieWolf25D(e) {
    renderMonster25D(e, 'zombie_wolf', S);
}
