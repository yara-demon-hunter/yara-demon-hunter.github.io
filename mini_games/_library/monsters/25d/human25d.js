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
//   (Rei do Cemitério) helmet 'skull' = elmo aberto de espinhos com a CAVEIRA à mostra e rabo de crina no topo; spikes = espinhos nas ombreiras;
//   boneHands = mãos de esqueleto saindo da manga de placas; mail = saia de cota de malha; sabatons = botas de metal em placas; skullBuckle = fivela de caveira; weapon 'greatsword' = espadão que ARRASTA
//   boneArms / boneLegs / ribs / dragLeg  (zumbi) true = braços de osso / pernas de osso / costelas aparecendo no peito rasgado / uma perna que arrasta (S.dragSide: 1 direita, -1 esquerda)
//   (Goblin do Baú) helmet 'cap' = chapeuzinho de cone caído para trás (C.hat); ears = orelhas grandes e pontudas; grin = sorrisão largo com dentes; backChest = o BAÚ do jogo (o mesmo do item Treasure) amarrado nas costas, com correias nos ombros
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
        if (L.sabatons) {
            // Bota medieval de metal (sabatão): punho do tornozelo com friso de bronze, pé em placas sobrepostas que afinam até a ponta, sola escura
            const { limb } = rig;
            const toeTip = [toe[0] + 1.6, toe[1], Math.max(0.35, toe[2] - 0.15)];
            oball(rig, [ankle[0], ankle[1], ankle[2] + 0.5], S.legWidth * 0.72, C.armorDark);
            limb([[ankle[0] - S.legWidth * 0.55, ankle[1], ankle[2] + 0.9], [ankle[0] + S.legWidth * 0.6, ankle[1], ankle[2] + 0.9]], 0.5, C.trim ?? C.armorLight);
            for (let q = 0; q < 3; q++) {                                                                       // placas do pé
                const k = q / 3;
                const p0 = mix([ankle[0] + 0.2, ankle[1], ankle[2] * 0.9 + 0.3], toeTip, k);
                const p1 = mix([ankle[0] + 0.2, ankle[1], ankle[2] * 0.9 + 0.3], toeTip, k + 0.4);
                const w = S.legWidth * (1.05 - k * 0.55);
                olimb(rig, [p0, p1], w, q % 2 ? C.armor : C.armorDark);
            }
            ball([toeTip[0] - 0.1, toeTip[1], toeTip[2] + 0.1], 0.35, C.armorLight);
            // Joelheira com um espinho curto
            limb([[knee[0] + 0.4, knee[1], knee[2] + 0.2], [knee[0] + 1.5, knee[1], knee[2] + 0.5]], 0.5, C.armorLight);
            return;
        }
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
        if (L.mail) {
            // Saia de cota de malha: faixas de anéis do cinto para baixo, na frente e dos lados
            for (let i = 0; i < 4; i++) frontArc(rig, bottom.a, beltZ - 1.1 - i * 1.05, bottom.A * (1.06 - i * 0.02), bottom.B * (1.12 - i * 0.03), 1.05, i % 2 ? C.mailDark : C.mail);
        }
        if (rig.sinF < -0.25) return;
        if (L.skullBuckle) {
            // Fivela redonda de bronze com uma caveira
            const bk = [bottom.a + bottom.A * 1.12, 0, beltZ];
            ball(bk, 1.15, C.trimDark);
            ball(bk, 0.95, C.trim);
            ball([bk[0] + 0.2, 0, bk[2] + 0.12], 0.55, C.bone);
            for (const sd of [-1, 1]) ball([bk[0] + 0.45, sd * 0.2, bk[2] + 0.18], 0.13, C.ink);
        } else ball([bottom.a + bottom.A * 1.1, 0, beltZ], 0.65, C.buckle);
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
            if (C.trim) {
                // Frisos de bronze escuro: a gola do peitoral e uma faixa diagonal com rebites
                frontArc(rig, top.a, top.z - 0.5, top.A * 1.02, top.B * 0.62, 0.55, C.trim);
                limb([[top.a + top.A * 0.95, -wt * 0.7, top.z - 1.2], [bottom.a + bottom.A * 1.04, wb * 0.55, beltZ + 0.9]], 0.6, C.trimDark);
                limb([[top.a + top.A * 0.97, -wt * 0.7, top.z - 1.2], [bottom.a + bottom.A * 1.06, wb * 0.55, beltZ + 0.9]], 0.38, C.trim);
            }
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
            const PR = S.pauldronRadius ?? 2.4;
            if (C.trim) {
                // Borda de bronze e o medalhão de caveira na ombreira
                const ring = [];
                for (let q = 0; q <= 6; q++) { const a = -0.3 + (q / 6) * Math.PI * 1.2; ring.push([p[0] + Math.cos(a) * PR * 0.95, p[1] + side * Math.sin(a) * PR * 0.35, p[2] + 0.2 - Math.sin(a) * PR * 0.15]); }
                limb(ring, 0.42, C.trim);
                ball([p[0] + PR * 0.75, p[1] + side * 0.1, p[2] - 0.2], 0.75, C.trim);
                ball([p[0] + PR * 0.85, p[1] + side * 0.1, p[2] - 0.15], 0.45, C.bone);
            }
            if (L.spikes) {
                // Espinhos: três cones saindo do alto da ombreira, para cima e para fora
                for (const [da, db, h] of [[-0.9, 0.35, 3.0], [0.4, 0.75, 3.6], [1.4, 0.4, 2.6]]) {
                    const base = [p[0] + da, p[1] + side * db * PR * 0.6, p[2] + PR * 0.55];
                    const tip = [base[0] - 0.2, base[1] + side * h * 0.35, base[2] + h];
                    const mid = mix(base, tip, 0.5);
                    limb([base, mid], 1.25, C.outline);
                    limb([base, mid], 0.95, C.armorLight);
                    limb([mid, tip], 0.6, C.outline);
                    limb([mid, tip], 0.38, C.armorLight);
                }
            }
        }
        if (L.boneHands) {
            // Mão de esqueleto saindo da manopla: palma de osso e quatro dedos finos dobrados
            oball(rig, mix(elbow, hand, 0.86), S.armWidth * 0.75, C.trim ?? C.armorDark);
            const d = norm(sub(hand, elbow));
            const sd = norm([-d[1], d[0], 0]);
            oball(rig, hand, S.handRadius * 0.7, C.bone);
            for (const k of (L.weapon === 'greatsword' && side > 0 ? [] : [-1.1, -0.4, 0.35, 1.05])) {        // a mão da espada já fecha os dedos no cabo
                const knuckle = add(add(hand, d, 0.6), sd, k * 0.45);
                const tip = add(add(add(knuckle, d, 1.1), sd, k * 0.15), [0, 0, 1], -0.7);
                limb([knuckle, tip], 0.42, C.boneDark);
                limb([knuckle, tip], 0.28, C.bone);
            }
        } else oball(rig, hand, S.handRadius, L.torso === 'plate' ? C.armorDark : C.skin);
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
        // Espadão que ARRASTA: a mão baixa ao lado do corpo e a lâmina vai para trás e para baixo até a ponta raspar o chão
        greatsword: (pose) => ({ hand: [pose.lean * 0.4 + 1.2, V.chest.B + 1.6, 6.4 - pose.crouch], dir: norm([-0.72, 0.22, -0.48]) }),
        pitchfork: (pose) => ({ hand: [pose.lean + 2.6, V.chest.B + 1.3, 7.4 - pose.crouch], dir: norm([0.8, 0.04, 0.55]) })
    };
    const at = (hand, dir, d) => [hand[0] + dir[0] * d, hand[1] + dir[1] * d, hand[2] + dir[2] * d];
    function drawWeapon(rig, hand, dir) {
        const { C, limb, ball } = rig;
        const flat = Math.hypot(dir[0], dir[1]);
        const side = flat > 0.05 ? [-dir[1] / flat, dir[0] / flat, 0] : [0, 1, 0];
        if (L.weapon === 'greatsword') {
            // Espadão largo e gasto: a MÃO fica no meio do cabo (pomo acima dela, guarda logo abaixo), guarda comprida de pontas curvas, lâmina larga com sulco
            const len = S.weaponLength;
            const bw = S.bladeHalfWidth ?? 1.3;
            limb([at(hand, dir, -1.3), at(hand, dir, 1.3)], 1.1, C.grip);
            ball(at(hand, dir, -1.6), 0.8, C.metalDark);
            const g = at(hand, dir, 1.6);
            limb([add(add(g, side, -2.8), dir, 0.7), add(g, side, -1.3), add(g, side, 1.3), add(add(g, side, 2.8), dir, 0.7)], 1.15, C.outline);
            limb([add(add(g, side, -2.8), dir, 0.7), add(g, side, -1.3), add(g, side, 1.3), add(add(g, side, 2.8), dir, 0.7)], 0.8, C.metalDark);
            poly(rig, [add(at(hand, dir, 1.8), side, -bw), add(at(hand, dir, len - 2), side, -bw * 0.85), at(hand, dir, len), add(at(hand, dir, len - 2), side, bw * 0.85), add(at(hand, dir, 1.8), side, bw)], C.metal, C.outline, 0.45);
            limb([at(hand, dir, 2.3), at(hand, dir, len - 2.6)], 0.45, C.metalDark);
            limb([add(at(hand, dir, 2.2), side, bw * 0.55), add(at(hand, dir, len - 2.2), side, bw * 0.45)], 0.2, C.metalLight);
            if (L.boneHands) {
                // Dedos de osso FECHADOS em volta do cabo (desenhados por cima dele): é o que mostra que ele segura a espada
                for (const k of [-0.7, -0.15, 0.4, 0.95]) {
                    const f = add(at(hand, dir, k), [0, 0, 1], 0.45);
                    ball(f, 0.5, C.boneDark);
                    ball(f, 0.38, C.bone);
                }
                ball(add(at(hand, dir, -0.2), side, -0.7), 0.45, C.bone);       // polegar
            }
        } else if (L.weapon === 'sword') {
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
                if (L.helmet === 'skull') {
                    // Elmo de espinhos aberto na frente, com a CAVEIRA à mostra, olhos vermelhos, faixa de bronze com caveira e o rabo de crina vermelha no topo
                    const back = !facesCamera(rig, [c[0] + R, 0, c[2]], c);
                    const tail = () => {
                        for (let i = 0; i < 4; i++) {
                            const chain = flowChain([c[0] - R * 0.15, (i - 1.5) * 0.3, c[2] + R * 1.25], pose, rig.anim, {
                                hang: [-0.8, 0, 0.2], stream: [-1, 0, -0.2], len: S.plumeLength * (1 - Math.abs(i - 1.5) * 0.12), segs: 5,
                                amp: 0.35, ampRun: 0.6, speed: 3, speedRun: 6, waveLength: 1.6, phase: i * 1.1, lag: 0.25
                            });
                            drawRibbon(rig, chain, 0.8, 0.15, i % 2 ? C.plume : C.plumeLight ?? C.plume, C.outline, true);
                        }
                    };
                    if (back) tail();
                    // Caveira: crânio, maçãs, nariz e a fileira de dentes
                    oball(rig, c, R * 0.92, C.bone);
                    ball([c[0] + R * 0.45, 0, c[2] - R * 0.5], R * 0.55, C.bone);
                    // Elmo: cúpula escura por cima e atrás, com faixa de bronze na testa
                    ball([c[0] - R * 0.25, 0, c[2] + R * 0.35], R * 1.02, C.armorDark);
                    ball([c[0] - R * 0.3, -R * 0.2, c[2] + R * 0.62], R * 0.72, C.armor);
                    const band = [];
                    for (let q = 0; q <= 8; q++) { const a = -Math.PI * 0.55 + (q / 8) * Math.PI * 1.1; band.push([c[0] + Math.cos(a) * R * 0.98, Math.sin(a) * R * 1.0, c[2] + R * 0.42]); }
                    limb(band, 0.55, C.trimDark);
                    limb(band, 0.38, C.trim);
                    // Espinhos em volta da cúpula e o pino do topo
                    for (let q = 0; q < 7; q++) {
                        const a = (q / 7) * Math.PI * 2;
                        const base = [c[0] - R * 0.25 + Math.cos(a) * R * 0.75, Math.sin(a) * R * 0.75, c[2] + R * 0.9];
                        const tip = [base[0] + Math.cos(a) * 0.5, base[1] + Math.sin(a) * 0.5, base[2] + 2.0 + (q % 2) * 0.6];
                        limb([base, tip], 0.75, C.outline);
                        limb([base, tip], 0.5, C.armorLight);
                    }
                    limb([[c[0] - R * 0.2, 0, c[2] + R * 1.1], [c[0] - R * 0.2, 0, c[2] + R * 1.45]], 0.55, C.armorLight);
                    ball([c[0] - R * 0.2, 0, c[2] + R * 1.5], 0.45, C.armorLight);
                    if (back) return;
                    tail();
                    // Rosto da caveira: órbitas escuras com brilho vermelho, nariz triangular e dentes
                    for (const sd of [-1, 1]) {
                        const eye = [c[0] + R * 0.8, sd * R * 0.36, c[2] + R * 0.02];
                        ball(eye, R * 0.26, C.ink);
                        glowAt(rig, eye, C.glow, 1.6 * (0.85 + 0.2 * Math.sin(t * Math.PI * 2 + sd)), 0.9);
                        ball([eye[0] + 0.1, eye[1], eye[2]], 0.26, C.eye);
                    }
                    ball([c[0] + R * 0.92, 0, c[2] - R * 0.25], R * 0.12, C.ink);
                    limb([[c[0] + R * 0.88, -R * 0.36, c[2] - R * 0.56], [c[0] + R * 0.94, R * 0.36, c[2] - R * 0.56]], 0.5, C.boneDark);
                    for (let q = -3; q <= 3; q++) limb([[c[0] + R * 0.94, q * R * 0.1, c[2] - R * 0.46], [c[0] + R * 0.95, q * R * 0.1, c[2] - R * 0.66]], 0.14, C.ink);
                    // Caveirinha de bronze no meio da faixa
                    ball([c[0] + R * 0.98, 0, c[2] + R * 0.44], 0.5, C.trim);
                    return;
                }
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
                if (L.ears) {
                    // Orelhas de goblin: grandes, pontudas, para trás e para cima, com o miolo mais escuro
                    for (const side of [-1, 1]) {
                        const base = [c[0] - R * 0.1, side * R * 0.9, c[2] + R * 0.1];
                        const tip = [c[0] - R * 0.9, side * (R + S.earLength), c[2] + R * 0.9 + S.earLength * 0.25];
                        limb([base, tip], 1.5, C.outline);
                        limb([base, tip], 1.1, C.skin);
                        limb([mix(base, tip, 0.18), mix(base, tip, 0.78)], 0.45, C.skinShade);
                    }
                }
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
                if (L.helmet === 'cap') {
                    // Chapeuzinho de goblin: aba redonda, copa em cone que cai para trás e uma pena na faixa (cores C.hat, C.hatDark, C.hatLight)
                    rig.disk([c[0], 0, c[2] + R * 0.5], [R * 1.15, 0, 0], [0, R * 1.15, 0]);
                    ctx.fillStyle = C.hatDark;
                    ctx.fill();
                    ctx.strokeStyle = C.outline;
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                    ball([c[0], 0, c[2] + R * 0.78], R * 0.82, C.hat);
                    const tip = [c[0] - R * 1.5, 0, c[2] + R * 1.35];
                    limb([[c[0] - R * 0.1, 0, c[2] + R * 1.0], [c[0] - R * 0.7, 0, c[2] + R * 1.5], tip], R * 1.05, C.outline);
                    limb([[c[0] - R * 0.1, 0, c[2] + R * 1.0], [c[0] - R * 0.7, 0, c[2] + R * 1.5], tip], R * 0.85, C.hat);
                    ball([tip[0] - 0.2, 0, tip[2] - 0.2], R * 0.28, C.hatLight);
                    ball([c[0] - R * 0.1, -R * 0.3, c[2] + R * 1.15], R * 0.28, C.hatLight);
                    limb([[c[0] + R * 0.3, R * 0.55, c[2] + R * 0.62], [c[0] - R * 0.3, R * 0.95, c[2] + R * 0.5]], 0.55, C.hatBand ?? C.chestBand ?? C.hatLight);
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
                if (L.grin) {
                    // Sorrisão: boca larga e curva até quase as orelhas, com a fileira de dentes de cima
                    const mouth = [];
                    for (let q = 0; q <= 8; q++) {
                        const u = q / 4 - 1;
                        mouth.push([c[0] + R * 0.86, u * R * 0.62, c[2] - R * 0.66 + u * u * R * 0.3]);
                    }
                    limb(mouth, 0.55, C.ink);
                    for (let q = 1; q <= 7; q += 2) limb([[mouth[q][0] + 0.03, mouth[q][1], mouth[q][2] + 0.05], [mouth[q][0] + 0.03, mouth[q][1], mouth[q][2] - 0.42]], 0.34, C.fang);
                } else if (S.openMouth) {
                    ball([c[0] + R * 0.86, 0, c[2] - R * 0.46], R * 0.2, C.ink);
                } else {
                    limb([[c[0] + R * 0.9, -R * 0.22, c[2] - R * 0.5], [c[0] + R * 0.92, R * 0.22, c[2] - R * 0.5]], 0.18, C.skinShade);
                }
                if (S.fangs) for (const sd of [-1, 1]) limb([[c[0] + R * 0.88, sd * R * 0.14, c[2] - R * 0.5], [c[0] + R * 0.88, sd * R * 0.14, c[2] - R * 0.5 - 0.7]], 0.2, C.fang);
            }
        }];
    }

    // --- O BAÚ NAS COSTAS ---
    // É o baú do item Treasure do Last Torch (caixa de madeira, tampa arredondada mais clara, cintas e fecho dourados): as cores vêm de S.colors (chest*),
    // copiadas de powers_visual.js do jogo. Só as faces voltadas para a câmera são desenhadas; duas correias passam pelos ombros.
    function drawBackChest(rig, pose) {
        const { C, limb, ball } = rig;
        const K = S.chest;
        const ca = pose.lean * 0.4 - K.behind, cz = pose.shoulderZ - K.drop;
        const hw = K.halfWidth, hd = K.halfDepth, hh = K.halfHeight;
        const center = [ca, 0, cz];
        // Correias (por trás do baú, até os ombros)
        for (const sd of [-1, 1]) {
            limb([[ca + hd * 0.3, sd * hw * 0.62, cz + hh * 0.7], [pose.lean + 0.2, sd * V.chest.B * 0.9, pose.shoulderZ - 0.2]], 0.55, C.outline);
            limb([[ca + hd * 0.3, sd * hw * 0.62, cz + hh * 0.7], [pose.lean + 0.2, sd * V.chest.B * 0.9, pose.shoulderZ - 0.2]], 0.36, C.belt);
        }
        const P = (da, db, dz) => [ca + da, db, cz + dz];
        const faces = [
            { n: [-1, 0, 0], pts: [P(-hd, -hw, -hh), P(-hd, hw, -hh), P(-hd, hw, hh), P(-hd, -hw, hh)], color: C.chest },       // de trás (a que se vê quando ele foge)
            { n: [1, 0, 0], pts: [P(hd, -hw, -hh), P(hd, hw, -hh), P(hd, hw, hh), P(hd, -hw, hh)], color: C.chest },
            { n: [0, -1, 0], pts: [P(-hd, -hw, -hh), P(hd, -hw, -hh), P(hd, -hw, hh), P(-hd, -hw, hh)], color: C.chestDark },
            { n: [0, 1, 0], pts: [P(-hd, hw, -hh), P(hd, hw, -hh), P(hd, hw, hh), P(-hd, hw, hh)], color: C.chestDark }
        ];
        for (const f of faces) {
            const mid = [ca + f.n[0] * hd, f.n[1] * hw, cz + f.n[2] * hh];
            if (!facesCamera(rig, mid, center)) continue;
            poly(rig, f.pts, f.color, C.outline, 0.4);
            if (f.n[0] === -1) {
                // Cintas douradas verticais e o fecho, na face de trás
                for (const k of [-0.62, 0.62]) limb([P(-hd - 0.05, k * hw, -hh), P(-hd - 0.05, k * hw, hh)], 0.55, C.chestBand);
                poly(rig, [P(-hd - 0.08, -0.22 * hw, hh * 0.45), P(-hd - 0.08, 0.22 * hw, hh * 0.45), P(-hd - 0.08, 0.22 * hw, -hh * 0.3), P(-hd - 0.08, -0.22 * hw, -hh * 0.3)], C.chestLock, C.outline, 0.25);
            }
        }
        // Tampa arredondada, mais clara, com a cinta de ouro na beirada
        limb([P(0, -hw, hh), P(0, hw, hh)], hd * 2 + 0.25, C.chestLight);
        limb([P(-hd * 0.9, -hw, hh + 0.05), P(-hd * 0.9, hw, hh + 0.05)], 0.5, C.chestBand);
        limb([P(hd * 0.9, -hw, hh + 0.05), P(hd * 0.9, hw, hh + 0.05)], 0.5, C.chestBand);
        for (const k of [-0.62, 0.62]) limb([P(-hd, k * hw, hh + 0.1), P(hd, k * hw, hh + 0.1)], 0.5, C.chestBand);
        // Um brilho de ouro escapando pela tampa
        glowAt(rig, P(0, 0, hh + 0.9), C.chestBand, 2.2, 0.45);
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
        if (L.backChest) drawBackChest(rig, pose);
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
