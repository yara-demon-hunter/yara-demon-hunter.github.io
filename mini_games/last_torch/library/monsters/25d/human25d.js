// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/human25d.js e rode o sync.
import { registerBody } from '../../characters/hunter/body_registry.js';
import { HERO_25D_VISUALS as V } from '../../characters/hunter/hero25d_visual.js';
import { mix, add, norm, sub, olimb, oball, flowChain, drawRibbon } from '../../characters/hunter/kit25d.js';
import { ctx } from '../../core/canvas.js';
import { renderNow } from '../../core/clock.js';
import { trunk, frontArc, poly, glowAt, facesCamera } from './creature25d.js';
import { renderMonster25D } from './monster25d.js';
import { meleePose, meleeState } from './melee25d.js';

// --- MONSTROS COM CORPO DE GENTE, MONTADOS POR DADOS ---
// Uma só rotina monta vários monstros no boneco 2.5D (Miliciano, Cavaleiro de placas, Lanceiro, Afogado, Demônio...): o que muda de um para o outro
// são as medidas e as cores no <id>25d_visual.js e as ESCOLHAS em S.look:
//   legs      'cloth' (calça de pano) | 'greaves' (grevas de aço)
//   torso     'tunic' (túnica) | 'gambeson' (gibão acolchoado, com costuras) | 'plate' (peitoral de placas) | 'bare' (peito nu)
//   pauldrons true = ombreiras de aço
//   tabard    cor do tabardo na frente do peito (ou null)
//   helmet    'none' | 'kettle' (chapéu de ferro de aba larga) | 'great' (elmo fechado com fenda e brilho) | 'horned' (chifres) | 'weeds' (cabelo de algas)
//   plume     true = pluma no elmo
//   weapon    'none' | 'sword' | 'spear' | 'axe' | 'pitchfork'
//   shield    true = escudo redondo na mão livre
//   tail / wings / cape   true = rabo, asas pequenas, capa
//   claws     true = garras nas mãos
//   boneArms / boneLegs / ribs / dragLeg  (zumbi) true = braços de osso / pernas de osso / costelas aparecendo no peito rasgado / uma perna que arrasta (S.dragSide: 1 direita, -1 esquerda)
//   armsForward true = braços esticados à frente (zumbi), balançando com a passada; armsBare true = braços sem manga (pele)
// Coordenadas locais: a = frente, b = direita, z = altura. Uso: registerHuman(id, S) e depois renderMonster25D(e, id, S).
export function registerHuman(id, S) {
    const L = S.look;
    const armored = L.torso === 'plate' || L.pauldrons;
    const sleeve = (C) => (L.armsBare ? C.skin : L.torso === 'plate' ? C.armor : L.torso === 'bare' ? C.skin : C.cloth);

    function drawLeg(rig, legIn) {
        const { C, ball } = rig;
        let { hip, knee, ankle, toe } = legIn;
        if (L.dragLeg && legIn.side === (S.dragSide ?? 1)) {
            // Perna que ARRASTA: fica esticada para trás, com o pé raspando no chão, balançando um pouco, em vez de dar o passo
            const sway = Math.sin(rig.anim.stride) * 0.5;
            ankle = [hip[0] - 3.6 - sway, ankle[1], 0.7];
            knee = [hip[0] - 1.3, ankle[1], hip[2] * 0.5];
            toe = [ankle[0] - 1.6, ankle[1] + 0.3, 0.45];
        }
        if (L.boneLegs) {
            // Perna de osso: ossos finos com joelho e pé comprido
            const w = S.legWidth * 0.42;
            olimb(rig, [hip, knee], w, C.bone);
            olimb(rig, [knee, ankle], w, C.bone);
            oball(rig, knee, w * 0.95, C.bone);
            olimb(rig, [ankle, [toe[0] + 0.8, toe[1], toe[2]]], w * 0.9, C.bone);
            return;
        }
        const greaves = L.legs === 'greaves';
        const color = greaves ? C.armor : L.torso === 'bare' ? C.skinShade : C.clothDark;
        olimb(rig, [hip, knee], S.legWidth, greaves ? C.armorDark : color);
        olimb(rig, [knee, ankle], S.legWidth + 0.2, color);
        if (greaves) oball(rig, knee, S.legWidth * 0.62, C.armorLight);
        olimb(rig, [ankle, [toe[0] + 0.6, toe[1], toe[2]]], S.legWidth + 0.5, greaves ? C.armorDark : C.boot);
        if (L.legs === 'cloth' && L.torso !== 'bare') ball([knee[0], knee[1], knee[2]], 0.2, color);
    }

    function drawTorso(rig, pose, bottom, top, wb, wt) {
        const { C, limb, ball } = rig;
        const body = L.torso === 'plate' ? C.armor : L.torso === 'gambeson' ? C.gambeson : L.torso === 'bare' ? C.skin : C.cloth;
        const shade = L.torso === 'plate' ? C.armorDark : L.torso === 'bare' ? C.skinShade : C.clothDark;
        trunk(rig, bottom, top, wb, wt, body, C.outline, S.chestWiden ?? 1, L.torso === 'plate' ? C.armorLight : L.torso === 'bare' ? C.skin : C.clothLight);
        const beltZ = bottom.z + 1.4;
        frontArc(rig, bottom.a, beltZ, bottom.A * 1.08, bottom.B * 1.08, 1.3, C.belt);
        if (rig.sinF < -0.25) return;
        ball([bottom.a + bottom.A * 1.1, 0, beltZ], 0.65, C.buckle);
        if (L.tabard) {
            const f = (z, w) => [bottom.a + bottom.A * 1.02, w, z];
            poly(rig, [f(top.z - 0.4, -wt * 0.72), f(top.z - 0.4, wt * 0.72), f(bottom.z - 2.6, wt * 0.6), f(bottom.z - 3.6, 0), f(bottom.z - 2.6, -wt * 0.6)], L.tabard, C.outline, 0.35);
            limb([[top.a + top.A * 1.0, 0, top.z - 2.2], [bottom.a + bottom.A * 1.04, 0, bottom.z + 1]], 0.55, C.tabardTrim);
            limb([[top.a + top.A * 1.0, -wt * 0.45, top.z - 3.4], [top.a + top.A * 1.0, wt * 0.45, top.z - 3.4]], 0.55, C.tabardTrim);
        } else if (L.torso === 'gambeson') {
            // Costuras do gibão: linhas na vertical, com os remendos
            for (const b of [-0.55, 0, 0.55]) limb([[top.a + top.A * 0.98, b * wt * 0.8, top.z - 0.6], [bottom.a + bottom.A * 1.04, b * wt * 0.7, bottom.z + 1.4]], 0.28, shade);
            ball([top.a + top.A * 0.9, wt * 0.45, top.z - 2], 0.55, C.patch);
        } else if (L.torso === 'plate') {
            limb([[top.a + top.A * 0.98, 0, top.z - 0.8], [bottom.a + bottom.A * 1.05, 0, beltZ + 0.8]], 0.5, C.armorLight);
            frontArc(rig, mix([bottom.a], [top.a], 0.5)[0], bottom.z + (top.z - bottom.z) * 0.5, bottom.A * 1.1, bottom.B * 1.12, 0.4, C.armorDark);
            if (C.rust) ball([bottom.a + bottom.A, -bottom.B * 0.5, bottom.z + 3.4], 0.7, C.rust);
        }
        if (L.ribs) {
            // Camisa rasgada no peito: buraco escuro com as costelas de osso aparecendo e o esterno
            const cx = top.a + top.A * 0.94;
            ball([cx, 0, top.z - 2.5], 2.3, C.ink);
            for (let i = 0; i < 3; i++) {
                const z = top.z - 1.4 - i * 1.15;
                const w = 1.9 - i * 0.2;
                limb([[cx - 0.2, -w, z + 0.4], [cx + 0.15, 0, z], [cx - 0.2, w, z + 0.4]], 0.55, C.boneDark);
                limb([[cx - 0.2, -w, z + 0.4], [cx + 0.15, 0, z], [cx - 0.2, w, z + 0.4]], 0.36, C.bone);
            }
            limb([[cx + 0.1, 0, top.z - 1], [cx + 0.1, 0, top.z - 4.2]], 0.34, C.bone);
        }
        else if (L.torso === 'bare' && S.wounds) {
            for (const [da, db, r] of S.wounds) ball([top.a + top.A * 0.94 + da, db, top.z - 2.4], r, C.wound);
        }
        if (S.chestGlow) {
            const pulse = 0.5 + 0.5 * Math.sin(pose.t * Math.PI * 2);
            glowAt(rig, [top.a + top.A * 0.9, 0, top.z - 2.4], C.glow, S.chestGlow * (1 + 0.3 * pulse), 0.35 + 0.25 * pulse);
        }
    }

    function drawArm(rig, shoulder, elbow, hand) {
        const { C, ball, limb } = rig;
        const side = Math.sign(shoulder[1]) || 1;
        const sh = [shoulder[0], shoulder[1] * (S.shoulderScale ?? 1), shoulder[2]];
        if (L.boneArms) {
            // Braço de osso: úmero e antebraço finos, cotovelo e mão em junta, dedos em garra
            const w = S.armWidth * 0.42;
            oball(rig, sh, w * 1.3, C.bone);
            olimb(rig, [sh, elbow, hand], w, C.bone);
            oball(rig, elbow, w * 0.95, C.bone);
            oball(rig, hand, w * 1.1, C.bone);
            const d = norm(sub(hand, elbow));
            const sd = norm([-d[1], d[0], 0]);
            for (const k of [-1, 0, 1]) limb([add(hand, sd, k * 0.3), add(add(hand, d, S.clawLength), sd, k * 0.65)], 0.28, C.bone);
            return;
        }
        olimb(rig, [sh, elbow], S.armWidth, sleeve(C));
        olimb(rig, [elbow, hand], S.armWidth * (L.torso === 'plate' ? 1.12 : 0.95), L.torso === 'plate' ? C.armorDark : sleeve(C));
        if (L.pauldrons) {
            const p = [sh[0], sh[1] + side * 0.5, sh[2] + 0.8];
            oball(rig, p, S.pauldronRadius ?? 2.4, C.armorDark);
            ball([p[0], p[1], p[2] + 0.5], (S.pauldronRadius ?? 2.4) * 0.84, C.armor);
            ball([p[0] + 0.2, p[1] - side * 0.2, p[2] + (S.pauldronRadius ?? 2.4) * 0.4], (S.pauldronRadius ?? 2.4) * 0.4, C.armorLight);
        }
        oball(rig, hand, S.handRadius, L.torso === 'plate' ? C.armorDark : C.skin);
        if (L.claws) {
            const d = norm(sub(hand, elbow));
            const sd = norm([-d[1], d[0], 0]);
            for (const k of [-1, 0, 1]) limb([add(hand, sd, k * 0.35), add(add(hand, d, S.clawLength), sd, k * 0.7)], 0.28, C.claw);
        }
        // Escudo redondo na mão livre (o braço esquerdo, de ombro negativo)
        if (L.shield && side < 0) {
            const R = S.shieldRadius;
            const c = [hand[0] + 1.3, hand[1] - 0.6, hand[2] + 0.4];
            ctx.lineJoin = 'round';
            rig.disk(c, [0, R, 0], [0, 0, R * 1.05]);
            ctx.fillStyle = C.shield;
            ctx.fill();
            ctx.strokeStyle = C.shieldRim;
            ctx.lineWidth = 0.9;
            ctx.stroke();
            rig.disk(c, [0.1, R * 0.62, 0], [0, 0, R * 0.65]);
            ctx.strokeStyle = C.shieldMark;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ball([c[0] + 0.5, c[1], c[2]], R * 0.26, C.shieldBoss);
        }
    }

    // --- ARMA: onde a mão a segura em repouso e como ela é desenhada ---
    const rests = {
        sword: (pose, k) => ({ hand: [pose.lean * 0.5 + 2.4, V.chest.B + 1.2, 7.2 - pose.crouch], dir: norm([0.9, 0.18, -0.28 * k]) }),
        spear: (pose) => ({ hand: [pose.lean + 2.8, V.chest.B + 1.4, 7.6 - pose.crouch], dir: norm([0.88, 0.04, 0.42]) }),
        axe: (pose) => ({ hand: [pose.lean * 0.5 + 2, V.chest.B + 1.3, 8 - pose.crouch], dir: norm([0.45, 0.1, 0.88]) }),
        pitchfork: (pose) => ({ hand: [pose.lean + 2.6, V.chest.B + 1.3, 7.4 - pose.crouch], dir: norm([0.8, 0.04, 0.55]) })
    };
    const at = (hand, dir, d) => [hand[0] + dir[0] * d, hand[1] + dir[1] * d, hand[2] + dir[2] * d];
    function drawWeapon(rig, hand, dir) {
        const { C, limb, ball } = rig;
        const flat = Math.hypot(dir[0], dir[1]);
        const side = flat > 0.05 ? [-dir[1] / flat, dir[0] / flat, 0] : [0, 1, 0];
        if (L.weapon === 'sword') {
            const len = S.weaponLength;
            limb([at(hand, dir, -1.6), at(hand, dir, 0.5)], 0.9, C.grip);
            limb([add(at(hand, dir, 0.8), side, -1.5), add(at(hand, dir, 0.8), side, 1.5)], 0.8, C.metalDark);
            limb([at(hand, dir, 1), at(hand, dir, len)], 1.5, C.metalDark);
            limb([at(hand, dir, 1), at(hand, dir, len)], 1.0, C.metal);
            limb([at(hand, dir, 1.4), at(hand, dir, len - 1)], 0.32, C.metalLight);
        } else if (L.weapon === 'spear' || L.weapon === 'pitchfork') {
            const len = S.weaponLength;
            limb([at(hand, dir, -6.5), at(hand, dir, len)], 0.95, C.woodDark);
            limb([at(hand, dir, -6.5), at(hand, dir, len)], 0.6, C.wood);
            if (L.weapon === 'spear') {
                const b = at(hand, dir, len);
                const tip = at(hand, dir, len + 4.2);
                poly(rig, [add(b, side, -0.95), add(at(hand, dir, len + 2.2), side, -1.15), tip, add(at(hand, dir, len + 2.2), side, 1.15), add(b, side, 0.95)], C.metal, C.metalDark, 0.4);
                limb([b, tip], 0.28, C.metalLight);
                if (C.pennant) {
                    const w = Math.sin(renderNow() / 160) * 0.5;
                    poly(rig, [at(hand, dir, len - 0.4), add(at(hand, dir, len - 3.8), side, 1.4 + w), add(at(hand, dir, len - 3.6), side, 0.2)], C.pennant, C.outline, 0.25);
                }
            } else {
                const b = at(hand, dir, len);
                limb([add(b, side, -1.3), add(b, side, 1.3)], 0.5, C.metalDark);
                for (const k of [-1.3, 0, 1.3]) limb([add(b, side, k), add(at(hand, dir, len + 3.6), side, k)], 0.34, C.metal);
            }
        } else if (L.weapon === 'axe') {
            const len = S.weaponLength;
            limb([at(hand, dir, -1.6), at(hand, dir, len)], 1.0, C.woodDark);
            limb([at(hand, dir, -1.6), at(hand, dir, len)], 0.65, C.wood);
            const top = at(hand, dir, len);
            const mid = at(hand, dir, len - 2.6);
            poly(rig, [add(top, side, 0.4), add(add(top, dir, 0.9), side, 2.8), add(add(mid, dir, 0.4), side, 2.5), add(mid, side, 0.4)], C.metal, C.metalDark, 0.4);
            ball(top, 0.5, C.metalDark);
        }
    }

    // --- CABEÇA ---
    function headParts(pose, rig) {
        const { C, project, ball, limb } = rig;
        const c = [pose.headA, 0, pose.headZ];
        const R = S.headRadius;
        const t = pose.t;
        const neck = [pose.lean, 0, pose.shoulderZ];
        return [{
            depth: project(...c).depth,
            draw() {
                limb([[neck[0], 0, neck[2]], [c[0] - 0.2, 0, c[2] - R * 0.7]], 1.6, C.skinShade);
                const covered = L.helmet === 'great';
                if (L.helmet === 'weeds') {
                    // Cabelo de algas: tiras compridas e pesadas que pingam
                    for (let i = 0; i < 6; i++) {
                        const k = i / 5 - 0.5;
                        const chain = flowChain([c[0] - R * 0.2, k * R * 1.5, c[2] + R * 0.5], pose, rig.anim, {
                            hang: [-0.2, k * 0.5, -1], stream: [-1, k * 0.3, -0.4], len: S.hairLength * (0.8 + 0.2 * Math.abs(Math.sin(i * 2.1))), segs: 4,
                            amp: 0.35, ampRun: 0.6, speed: 3, speedRun: 6, waveLength: 1.8, phase: i * 1.3, lag: 0.3
                        });
                        drawRibbon(rig, chain, 0.9, 0.2, i % 2 ? C.hair : C.hairLight, C.outline, false);
                    }
                }
                if (!covered) oball(rig, c, R, C.skin);
                if (L.helmet === 'weeds') ball([c[0] - R * 0.3, 0, c[2] + R * 0.5], R * 0.8, C.hair);
                if (L.helmet === 'horned') {
                    ball([c[0] - R * 0.5, 0, c[2] + R * 0.45], R * 0.8, C.hair);
                    for (const side of [-1, 1]) {
                        const base = [c[0] + R * 0.1, side * R * 0.7, c[2] + R * 0.7];
                        const mid = [base[0] - 0.8, side * (R + 1.4), base[2] + 2.2];
                        const tip = [base[0] + 0.6, side * (R + 1.0), base[2] + 4.4];
                        limb([base, mid, tip], 1.5, C.outline);
                        limb([base, mid, tip], 1.0, C.horn);
                    }
                }
                if (L.helmet === 'kettle') {
                    // Chapéu de ferro: cúpula e a aba larga em volta
                    rig.disk([c[0], 0, c[2] + R * 0.42], [R * 1.55, 0, 0], [0, R * 1.55, 0]);
                    ctx.fillStyle = C.armorDark;
                    ctx.fill();
                    ctx.strokeStyle = C.outline;
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                    ball([c[0], 0, c[2] + R * 0.62], R * 0.95, C.armorDark);
                    ball([c[0] - 0.1, 0, c[2] + R * 0.72], R * 0.84, C.armor);
                    ball([c[0] - 0.4, -R * 0.3, c[2] + R * 1.05], R * 0.3, C.armorLight);
                }
                if (covered) {
                    // Elmo fechado: cilindro de aço com a fenda dos olhos e o brilho por dentro
                    oball(rig, c, R * 1.12, C.armorDark);
                    ball([c[0], 0, c[2] + 0.2], R * 1.02, C.armor);
                    limb([[c[0] - R * 0.7, 0, c[2] + R * 0.8], [c[0] + R * 0.1, 0, c[2] + R * 1.12], [c[0] + R * 0.7, 0, c[2] + R * 0.7]], 0.5, C.armorLight);
                    if (L.plume) {
                        for (let i = 0; i < 3; i++) {
                            const chain = flowChain([c[0] - R * 0.2, (i - 1) * 0.4, c[2] + R * 1.1], pose, rig.anim, {
                                hang: [-0.7, 0, 0.5], stream: [-1, 0, 0.1], len: S.plumeLength * (1 - Math.abs(i - 1) * 0.2), segs: 4,
                                amp: 0.3, ampRun: 0.5, speed: 3, speedRun: 6, waveLength: 1.6, phase: i * 1.2, lag: 0.2
                            });
                            drawRibbon(rig, chain, 0.8, 0.15, C.plume, C.outline, true);
                        }
                    }
                    const visor = [c[0] + R * 1.0, 0, c[2] + 0.1];
                    if (!facesCamera(rig, visor, c)) return;
                    limb([[visor[0] - 0.2, -R * 0.66, visor[2]], visor, [visor[0] - 0.2, R * 0.66, visor[2]]], 0.95, C.outline);
                    for (const sd of [-1, 1]) {
                        const eye = [visor[0] - 0.05, sd * R * 0.34, visor[2]];
                        glowAt(rig, eye, C.glow, 1.5, 0.85);
                        ball(eye, 0.3, C.eye);
                    }
                    return;
                }
                // Rosto: olhos, nariz e boca
                const face = [c[0] + R * 0.88, 0, c[2]];
                if (!facesCamera(rig, face, c)) return;
                for (const sd of [-1, 1]) {
                    const eye = [c[0] + R * 0.86, sd * R * 0.36, c[2] + R * 0.1];
                    if (S.eyeGlow) glowAt(rig, eye, C.glow, S.eyeGlow * (0.85 + 0.25 * Math.sin(t * Math.PI * 2 + sd)), 0.8);
                    ball(eye, S.eyeGlow ? 0.34 : 0.26, S.eyeGlow ? C.eye : C.ink);
                    if (!S.eyeGlow) limb([[eye[0], sd * R * 0.6, eye[2] + 0.6], [eye[0] + 0.1, sd * R * 0.16, eye[2] + 0.38]], 0.2, C.hair ?? C.ink);
                }
                ball([c[0] + R * 0.98, 0, c[2] - R * 0.1], R * 0.14, C.skinShade);
                if (S.openMouth) {
                    ball([c[0] + R * 0.86, 0, c[2] - R * 0.46], R * 0.2, C.ink);
                } else {
                    limb([[c[0] + R * 0.9, -R * 0.22, c[2] - R * 0.5], [c[0] + R * 0.92, R * 0.22, c[2] - R * 0.5]], 0.18, C.skinShade);
                }
                if (S.fangs) for (const sd of [-1, 1]) limb([[c[0] + R * 0.88, sd * R * 0.14, c[2] - R * 0.5], [c[0] + R * 0.88, sd * R * 0.14, c[2] - R * 0.5 - 0.7]], 0.2, C.fang);
            }
        }];
    }

    // --- COSTAS: capa, rabo e asas ---
    function drawBack(rig, pose, anchors, hem) {
        const { C, limb } = rig;
        if (L.wings) {
            const flap = Math.sin(pose.t * Math.PI * 4) * 0.12;
            for (const sd of [-1, 1]) {
                const root = [pose.lean - 0.8, sd * 1.4, pose.shoulderZ - 0.4];
                const tip = [root[0] - 2.2, sd * (S.wingSpan + flap * 3), root[2] + S.wingHeight];
                const low = [root[0] - 1.4, sd * (S.wingSpan * 0.7), root[2] + S.wingHeight * 0.1];
                const mid = [root[0] - 1.6, sd * (S.wingSpan * 0.42), root[2] + S.wingHeight * 0.62];
                poly(rig, [root, mid, tip, low, [root[0], sd * 1.8, root[2] - 4]], C.wing, C.outline, 0.4);
                limb([root, mid, tip], 0.55, C.wingBone);
                limb([root, low], 0.4, C.wingBone);
            }
        }
        if (L.tail) {
            const root = [pose.lean * 0.3 - 1.4, 0, pose.hipZ - 0.3];
            const chain = flowChain(root, pose, rig.anim, {
                hang: [-0.7, 0, -0.5], stream: [-1, 0, -0.1], len: S.tailLength, segs: 6, amp: 0.7, ampRun: 0.9, speed: 4, speedRun: 7, waveLength: 2.2, phase: 0.6, lag: 0.3
            });
            for (let i = 0; i < chain.length - 1; i++) limb([chain[i], chain[i + 1]], 1.5 - 0.9 * (i / chain.length) + 0.5, C.outline);
            for (let i = 0; i < chain.length - 1; i++) limb([chain[i], chain[i + 1]], 1.5 - 0.9 * (i / chain.length), C.skin);
            const tip = chain[chain.length - 1];
            poly(rig, [[tip[0] - 0.4, tip[1] - 1.1, tip[2]], [tip[0] - 2.2, tip[1], tip[2] - 0.3], [tip[0] - 0.4, tip[1] + 1.1, tip[2]]], C.horn, C.outline, 0.3);
        }
        if (L.cape) {
            // Capa curta e estreita (S.capeSpread / S.capeHemSpread / S.capeLength): sem isso a padrão do boneco fica enorme e dentada
            const spread = S.capeSpread ?? 1;
            const hemSpread = S.capeHemSpread ?? 1.05;
            const len = S.capeLength ?? 0.7;
            rig.drawCapeShape(
                anchors.map(p => [p[0] - 0.3, p[1] * spread, p[2] + 0.5]),
                hem.map((p, i) => [anchors[i][0] + (p[0] - anchors[i][0]) * len, p[1] * hemSpread, anchors[i][2] + (p[2] - anchors[i][2]) * len]),
                { thickness: 0.35 }
            );
        }
    }

    // Braços esticados à frente (zumbi): a mão balança com a passada; mesma ideia do Esqueleto
    function armPose(rig, pose, sd) {
        const phase = rig.anim.stride + (sd > 0 ? Math.PI : 0);
        const swing = Math.sin(phase) * S.armSwing * (0.3 + pose.run);
        const shoulder = [pose.lean, sd * V.chest.B * 0.98, pose.shoulderZ - 0.4];
        let hand = [shoulder[0] + S.armReach + swing, shoulder[1] + sd * S.armSpread, shoulder[2] - S.armDrop];
        const held = sd > 0 ? pose.sword : pose.free;
        if (held) hand = mix(hand, held.hand, held.w);
        const elbow = [(shoulder[0] + hand[0]) / 2 - 0.3, (shoulder[1] + hand[1]) / 2 + sd * 0.9, (shoulder[2] + hand[2]) / 2 - 1.1];
        return { shoulder, elbow, hand };
    }

    const weapon = L.weapon && L.weapon !== 'none';
    registerBody(id, {
        vis: S,
        drawLeg,
        drawTorso,
        drawBack,
        backDepth: (rig, pose, depth) => (rig.sinF < 0 ? Math.max(depth, rig.project(pose.lean * 0.6, 0, 13.5).depth + 0.05) : depth),
        drawArm,
        ...(L.armsForward ? {
            freeArm: (rig, pose) => armPose(rig, pose, -1),
            swordArmPart: (rig, pose) => {
                const a = armPose(rig, pose, 1);
                return { depth: rig.project(...a.elbow).depth + 0.1, draw: () => drawArm(rig, a.shoulder, a.elbow, a.hand) };
            },
            poseTweak: (pose, anim) => {
                pose.lean += S.slouch;
                pose.headA += S.slouch * 0.8;
                pose.headZ -= S.slouch * 0.4;
                // Manquejando: o corpo desce um pouco a cada passo da perna boa (S.limp)
                if (S.limp) {
                    const dip = S.limp * (0.5 + 0.5 * Math.sin(anim.stride));
                    pose.hipZ -= dip;
                    pose.shoulderZ -= dip * 0.8;
                    pose.headZ -= dip * 0.8;
                }
            }
        } : {}),
        ...(weapon ? {
            swordRest(rig, pose, { hand, dir, blend }) {
                const rest = rests[L.weapon](pose, 1);
                // Golpe do monstro (o jogo manda meleeState.p): a mão e a arma saem do repouso para a varredura ou a estocada
                if (meleeState.p > 0) {
                    const m = meleePose(L.weapon === 'spear' || L.weapon === 'pitchfork' ? 'spear' : 'sword', meleeState.p);
                    return { hand: [rest.hand[0] + m.offset[0], rest.hand[1] + m.offset[1], rest.hand[2] + m.offset[2]], dir: m.dir ?? rest.dir };
                }
                const k = 1 - blend;
                return { hand: mix(hand, rest.hand, k), dir: norm(mix(dir, rest.dir, k)) };
            },
            drawBlade: (rig, hand, dir) => drawWeapon(rig, hand, dir),
            drawn: () => 1
        } : { drawn: () => 0 }),
        headParts
    });
    return id;
}

export function renderHuman25D(e, id, S) {
    meleeState.p = e.atk ?? 0;
    try { renderHuman25DNow(e, id, S); } finally { meleeState.p = 0; }
}

function renderHuman25DNow(e, id, S) {
    renderMonster25D(e, id, S, {
        colors: (P, hurtAge) => (hurtAge < (S.hurtFlashSeconds ?? 0.12) ? { ...P.colors, skin: '#ffffff', cloth: '#ffffff', armor: '#ffffff', gambeson: '#ffffff' } : P.colors)
    });
}
