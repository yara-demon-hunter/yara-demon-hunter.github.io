// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/skeleton/skeleton25d.js e rode o sync.
import { SKELETON_25D_VISUALS as S } from './skeleton25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { HERO_25D_VISUALS as V } from '../../../characters/hunter/hero25d_visual.js';
import { mix, add, norm, sub, cross, flowChain, drawRibbon } from '../../../characters/hunter/kit25d.js';
import { ctx } from '../../../core/canvas.js';
import { renderMonster25D } from '../monster25d.js';
import { drawGlow } from '../../../core/glow.js';
import { poly } from '../creature25d.js';
import { meleePose, meleeState } from '../melee25d.js';

// --- ESQUELETO 2.5D ---
// O Esqueleto de topdown/skeleton/skeleton.js montado no boneco 2.5D dos heróis (characters/hunter/hero25d.js): as mesmas peças (crânio
// rachado com órbitas de chama verde e mandíbula que bate, alma verde dentro das costelas, trapo podre na bacia, braços
// esticados à frente com três garras), mas em 3D simples, então serve para qualquer câmera. O motor cuida da passada,
// da pose e da ordem de desenho; aqui ficam só as peças de osso. Medidas e cores: skeleton25d_visual.js.
// Coordenadas locais: a = frente, b = direita, z = altura.
//
// As peças (skeletonBody) também montam o Esqueleto Rastejante (../skeleton_crawler/), um monstro à parte.
// Uso: renderSkeleton25D(e) no lugar de renderSkeleton(e) (mesmo monstro: { x, y, angle, hp, radius, phase }), ou o
// modelo 'skeleton' em renderHero25D para quem já anima o boneco por conta própria (o palco do yara-rpg, o tuner).

// Monta o boneco do esqueleto com as medidas S; com S.crawl, a postura rastejante (medidas S.crawl*)
// Esqueleto Arqueiro: o jogo informa o quanto ele já puxou a corda (aim, 0 a 1) e, por um instante depois do tiro, release (> 0 = soltou).
// Sem informação (tuner, sprite do bestiário): arco armado, corda meio puxada. renderSkeletonModel preenche; fora do jogo vale previewAim.
let bowNow = null;
const aimNow = (S) => (bowNow ? bowNow.aim : S.previewAim ?? 0.5);
const releaseNow = () => (bowNow ? bowNow.release : 0);

export function skeletonBody(S) {
    const crawl = !!S.crawl;
    // Osso: contorno escuro e o osso por cima, passando pelos pontos
    function bone(rig, pts, width, color) {
        rig.limb(pts, width + 0.5, rig.C.boneDark);
        rig.limb(pts, width, color);
    }

    function joint(rig, p, r, color) {
        rig.ball(p, r + 0.25, rig.C.boneDark);
        rig.ball(p, r, color);
    }

    // --- PERNAS ---
    function drawSkeletonLeg(rig, { hip, knee, ankle, toe }) {
        if (S.noLegs) return;                 // Zumbi Rastejante: a metade de baixo não existe
        const { C } = rig;
        bone(rig, [hip, knee, ankle], S.boneWidth, C.bone);
        joint(rig, knee, S.jointRadius, C.bone);
        // Pé: osso comprido apontando para a frente
        const foot = [ankle[0] + S.footLength, toe[1], Math.max(0.4, toe[2] - 0.2)];
        bone(rig, [ankle, foot], S.boneWidth * 1.15, C.bone);
    }

    // --- TRONCO: bacia, coluna, alma, costelas e clavículas ---
    // Tudo segue o eixo da coluna (da bacia aos ombros): de pé ele é vertical; rastejando, quase deitado
    function drawSkeletonTorso(rig, pose, bottom, top) {
        const { C, disk, project } = rig;
        const base = [bottom.a, 0, bottom.z];
        const neck = [top.a, 0, top.z];
        const u = norm(sub(neck, base));
        const side = [0, 1, 0];
        const fwd = norm(cross(side, u));
        const along = (k) => mix(base, neck, k);
        const spineLen = Math.hypot(...sub(neck, base));

        // Bacia com dois furos na frente
        ctx.fillStyle = C.bone;
        ctx.strokeStyle = C.boneDark;
        ctx.lineWidth = 0.4;
        disk(base, fwd.map(v => v * S.pelvisDepth), [0, S.pelvisWidth, 0]);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = C.socket;
        for (const sd of [-1, 1]) {
            const p = add(add(base, fwd, S.pelvisDepth * 0.55), u, -0.1).map((v, i) => (i === 1 ? sd * S.pelvisWidth * 0.45 : v));
            if (project(...p).depth < project(...base).depth) continue;
            disk(p, fwd.map(v => v * 0.35), [0, 0.45, 0]);
            ctx.fill();
        }

        // Zumbi Rastejante (S.noLegs): o corpo termina na bacia. Carne rasgada e tripa no corte, e a COLUNA segue solta para trás,
        // arrastando no chão e balançando, até uma ponta quebrada
        if (S.noLegs) {
            rig.ball(add(base, u, -0.2), S.pelvisWidth * 0.62, C.wound);
            rig.ball(add(add(base, u, -0.5), fwd, -0.4), S.pelvisWidth * 0.42, C.skinShade);
            const gut = Math.sin(pose.t * 5) * 0.4;
            rig.limb([add(base, u, -0.4), add(add(base, u, -1.6), side, 0.8 + gut), add(add(base, u, -2.4), side, 0.5 + gut * 1.4)], 0.7, C.wound);
            for (let i = 1; i <= S.tailBones; i++) {
                const k = -(i * S.tailGap) / spineLen;
                const wob = Math.sin(pose.t * 6 - i * 0.8) * 0.5 * Math.min(1.6, i * 0.35);
                const p = along(k).map((v, a) => (a === 1 ? v + wob : a === 2 ? Math.max(0.9, v) : v));
                joint(rig, p, S.vertebraRadius * Math.max(0.7, 1.5 - i * 0.07), C.bone);
                if (i % 2 === 0 && i < S.tailBones) for (const sd of [-1, 1]) bone(rig, [p, add(p, side, sd * 0.9)], 0.22, C.boneShade);
            }
        }

        // Coluna de vértebras, um pouco para trás (costas), da bacia até o pescoço
        for (let i = 0; i <= S.vertebrae; i++) {
            const k = (i / S.vertebrae) * (1 + 1.2 / spineLen);
            joint(rig, add(along(k), fwd, -0.6), S.vertebraRadius, C.boneShade);
        }

        // Alma: chama verde dentro do peito, pulsando
        const pulse = 0.5 + 0.5 * Math.sin(pose.t * S.soulPulseHz * Math.PI * 2);
        const soul = project(...add(along(S.soulAt), fwd, -0.2));
        if (!S.noSoul) {
            drawGlow(ctx, C.soulGlow, soul.x, soul.y, S.soulGlowRadius * (0.8 + 0.3 * pulse), 0.55 + 0.3 * pulse);
            const size = S.soulRadius * (0.85 + 0.3 * pulse);
            ctx.fillStyle = C.soul;
            ctx.beginPath();
            ctx.ellipse(soul.x, soul.y, size, size * 1.35, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = C.soulCore;
            ctx.beginPath();
            ctx.arc(soul.x, soul.y + size * 0.2, size * 0.45, 0, Math.PI * 2);
            ctx.fill();
        }

        // Carne podre grudada nas costas e nas laterais das costelas (S.fleshTorso): o zumbi ainda tem o que apodrecer
        if (S.fleshTorso) {
            rig.ball(add(along(0.55), fwd, -1.1), S.ribWidth * 0.62, C.skinShade);
            rig.ball(add(add(along(0.8), fwd, -0.8), side, S.ribWidth * 0.5), S.ribWidth * 0.34, C.skin);
            rig.ball(add(add(along(0.35), fwd, -0.6), side, -S.ribWidth * 0.45), S.ribWidth * 0.3, C.skin);
            rig.ball(add(along(0.7), fwd, -1.7), S.ribWidth * 0.2, C.wound);
        }
        // Costelas: arcos saindo da coluna (costas) e dando a volta até o esterno (frente), descendo um pouco
        for (let i = 0; i < S.ribPairs; i++) {
            const c = along(1 - (S.ribTop + i * S.ribGap) / spineLen);
            const k = 1 - i * 0.12;
            for (const sd of [-1, 1]) {
                const pts = [];
                for (let j = 0; j <= 6; j++) {
                    const th = Math.PI * 0.92 - (j / 6) * Math.PI * 0.8;
                    pts.push(add(add(add(c, fwd, S.ribDepth * k * Math.cos(th)), side, sd * S.ribWidth * k * Math.sin(th)), u, -0.7 * (j / 6)));
                }
                bone(rig, pts, S.ribThickness, C.bone);
            }
        }
        // Peitoral enferrujado preso nas costelas (S.armor): placa rachada na frente do peito
        if (S.armor && rig.sinF > -0.25) {
            const top2 = add(add(along(0.97), fwd, S.ribDepth * 1.05), u, 0);
            const mid2 = add(add(along(0.62), fwd, S.ribDepth * 1.1), u, 0);
            const low2 = add(add(along(0.3), fwd, S.ribDepth * 0.95), u, 0);
            const w = S.ribWidth * 0.62;
            poly(rig, [add(top2, side, -w), add(top2, side, w), add(mid2, side, w * 1.05), add(low2, side, w * 0.7), add(low2, side, -w * 0.8), add(mid2, side, -w * 1.05)], C.rust, C.boneDark, 0.45);
            rig.limb([add(top2, u, -0.6), add(low2, u, 0.6)], 0.5, C.steelDark);
            rig.limb([add(mid2, side, -w * 0.9), add(mid2, side, w * 0.9)], 0.45, C.steelDark);
            rig.ball(add(mid2, side, w * 0.5), 0.45, C.steel);
        }
        // Esterno e clavículas
        const sternumTop = add(add(along(1 - S.ribTop / spineLen), fwd, S.ribDepth * 0.9), u, 0.3);
        bone(rig, [sternumTop, add(add(sternumTop, u, -S.ribGap * 2.2), fwd, -0.2)], 0.8, C.boneShade);
        for (const sd of [-1, 1]) {
            bone(rig, [add(add(neck, fwd, 0.4), u, -0.2).map((v, i) => (i === 1 ? sd * V.chest.B * 0.98 : v)), add(sternumTop, side, sd * 0.4)], 0.6, C.bone);
        }
    }

    // --- BRAÇOS: esticados à frente, balançando com a passada; três garras.
    // Rastejando (crawl), as mãos vão ao chão à frente, uma de cada vez, puxando o corpo ---
    function holdHand(pose, sd, swing) {
        const L = pose.lean;
        // Arqueiro: a mão da corda vai do peito (arco relaxado) até o rosto (corda puxada); ao soltar volta de um golpe
        if (S.hold === 'bow') return sd > 0 ? [L + 3.4 - aimNow(S) * 2.3 + releaseNow() * 1.2, 0.5, 8.5] : [L + 5.6, -1.0, 8.6];
        if (sd > 0 && meleeState.p > 0) {
            // Golpe de espada: a mão sai do repouso para a varredura (o jogo manda meleeState.p)
            const m = meleePose('sword', meleeState.p);
            return [L + 3.4 + m.offset[0], 3.0 + m.offset[1], 7.0 + m.offset[2]];
        }
        return sd > 0 ? [L + 3.4 + swing * 0.5, 3.0, 7.0] : [L + 3.2, -3.2, 7.6];
    }

    // O que a mão segura: espada e escudo (S.hold 'sword') ou arco e flecha (S.hold 'bow')
    function holdItem(rig, side, hand) {
        const { C, limb, ball } = rig;
        if (S.hold === 'sword' && side > 0) {
            const d = meleeState.p > 0 ? meleePose('sword', meleeState.p).dir : norm([0.9, 0.1, 0.38]);
            const at = (k) => [hand[0] + d[0] * k, hand[1] + d[1] * k, hand[2] + d[2] * k];
            limb([at(-1.6), at(0.4)], 0.9, C.grip);
            limb([[hand[0] + d[0] * 0.6, hand[1] - 1.4, hand[2] + d[2] * 0.6], [hand[0] + d[0] * 0.6, hand[1] + 1.4, hand[2] + d[2] * 0.6]], 0.8, C.steelDark);
            limb([at(0.8), at(S.weaponLength)], 1.6, C.steelDark);
            limb([at(0.8), at(S.weaponLength)], 1.05, C.steel);
            limb([at(0.9), at(S.weaponLength * 0.55)], 0.5, C.rust);
            ball(at(S.weaponLength * 0.8), 0.45, C.rust);
        } else if (S.hold === 'sword') {
            const R = S.shieldRadius;
            const c = [hand[0] + 1.2, hand[1] - 0.5, hand[2] + 0.3];
            rig.disk(c, [0, R, 0], [0, 0, R * 1.05]);
            ctx.fillStyle = C.shield;
            ctx.fill();
            ctx.strokeStyle = C.steelDark;
            ctx.lineWidth = 0.9;
            ctx.stroke();
            limb([[c[0] + 0.4, c[1] - R * 0.7, c[2] + R * 0.5], [c[0] + 0.4, c[1] + R * 0.5, c[2] - R * 0.7]], 0.5, C.boneDark);
            ball([c[0] + 0.6, c[1], c[2]], R * 0.24, C.steel);
        } else if (S.hold === 'bow' && side < 0) {
            const top = [hand[0] - 0.6, hand[1], hand[2] + 5.6];
            const mid = [hand[0] + 1.5, hand[1], hand[2]];
            const bot = [hand[0] - 0.6, hand[1], hand[2] - 5.6];
            // O arco curva mais quando a corda está puxada
            const pull = aimNow(S);
            const bend = 0.4 * pull;
            const bowTop = [top[0] + bend, top[1], top[2] - bend * 1.2];
            const bowBot = [bot[0] + bend, bot[1], bot[2] + bend * 1.2];
            limb([bowTop, mid, bowBot], 1.1, C.boneDark);
            limb([bowTop, mid, bowBot], 0.7, C.wood);
            const rel = releaseNow();
            // Corda: em V até a mão que puxa; ao soltar ela vibra reta e a flecha já foi
            const stringPoint = [hand[0] - 2.6 - pull * 2.3 + (rel > 0 ? 2.3 * pull + Math.sin(rel * 90) * 0.4 : 0), hand[1], hand[2]];
            limb([bowTop, stringPoint, bowBot], 0.18, C.string);
            // Flecha encaixada (some quando solta): da corda até um pouco à frente do arco
            if (rel <= 0) {
                limb([stringPoint, [hand[0] + 3.6, hand[1], hand[2]]], 0.4, C.wood);
                poly(rig, [[hand[0] + 3.4, hand[1] - 0.5, hand[2]], [hand[0] + 4.9, hand[1], hand[2]], [hand[0] + 3.4, hand[1] + 0.5, hand[2]]], C.steel, C.boneDark, 0.2);
                limb([[stringPoint[0], stringPoint[1], stringPoint[2]], [stringPoint[0] + 1.1, stringPoint[1], stringPoint[2]]], 0.9, C.feather);
            }
        }
    }

    function armPose(rig, pose, sd) {
        const phase = rig.anim.stride + (sd > 0 ? Math.PI : 0);
        const swing = Math.sin(phase) * S.armSwing * (0.3 + pose.run);
        const shoulder = [pose.lean, sd * V.chest.B * 0.98, pose.shoulderZ - 0.4];
        let hand;
        if (crawl) {
            const lift = Math.max(0, Math.cos(phase)) * S.crawlHandLift * (0.3 + pose.run);
            hand = [shoulder[0] + S.crawlHandReach + swing, sd * S.crawlHandSpread, 0.7 + lift];
        } else if (S.hold) {
            // Esqueleto armado (S.hold): a espada na direita e o escudo na esquerda, ou o arco na esquerda com a corda puxada pela direita
            hand = holdHand(pose, sd, swing);
        } else {
            hand = [shoulder[0] + S.armReach + swing, shoulder[1] + sd * S.armSpread, shoulder[2] - S.armDrop];
        }
        // Posturas (golpe pesado, grito...) mandam nas mãos como nos heróis
        const held = sd > 0 ? pose.sword : pose.free;
        if (held) hand = mix(hand, held.hand, held.w);
        const elbow = crawl
            ? [(shoulder[0] + hand[0]) / 2 - 0.8, (shoulder[1] + hand[1]) / 2 + sd * 1.6, Math.max(shoulder[2], hand[2]) + 1.2]
            : [(shoulder[0] + hand[0]) / 2 - 0.3, (shoulder[1] + hand[1]) / 2 + sd * 0.9, (shoulder[2] + hand[2]) / 2 - 1.2];
        return { shoulder, elbow, hand };
    }

    function drawBoneArm(rig, shoulder, elbow, hand) {
        const { C } = rig;
        joint(rig, shoulder, S.jointRadius * 1.25, C.bone);
        bone(rig, [shoulder, elbow, hand], S.boneWidth, C.bone);
        joint(rig, elbow, S.jointRadius, C.bone);
        // Garras: três, abrindo em leque à frente da mão
        const d = norm(sub(hand, elbow));
        const side = norm([-d[1], d[0], 0]);
        if (!S.hold) for (const k of [-1, 0, 1]) {
            bone(rig, [add(hand, side, k * 0.3), add(add(hand, d, S.clawLength), side, k * 0.6)], 0.3, C.bone);
        }
        joint(rig, hand, S.jointRadius * 0.85, C.bone);
        if (S.hold) holdItem(rig, Math.sign(shoulder[1]) || 1, hand);
    }

    // --- CRÂNIO: rachado, órbitas de chama verde, mandíbula que bate e tranco de cabeça de vez em quando ---
    function skullPart(pose, rig) {
        const { C, project, ball, limb } = rig;
        const t = pose.t;
        const wave = Math.sin(t * S.twitchHz * Math.PI * 2);
        const twitch = wave > 0.97 ? ((wave - 0.97) / 0.03) * S.twitchAmount : 0;
        const jawOpen = Math.max(0, Math.sin(t * S.chatterHz * Math.PI * 2)) * S.jawOpenMax;
        const R = S.skullRadius;
        const SKULL = S.fleshHead ? C.skin : C.bone;           // Zumbi Rastejante: cabeça de pele
        const SKULL_SHADE = S.fleshHead ? C.skinShade : C.boneShade;
        const c = [pose.headA, twitch, pose.headZ];
        const front = project(c[0] + R, c[1], c[2]);
        const center = project(...c);
        const facing = front.depth > center.depth;
        const pulse = 0.5 + 0.5 * Math.sin(t * S.soulPulseHz * Math.PI * 2);

        // Mandíbula: arco estreito embaixo da frente do crânio, com a fileira de dentes de baixo; bate (jawOpen)
        const jaw = () => {
            const z = c[2] - R * 0.78 - jawOpen;
            const pts = [];
            for (let i = 0; i <= 8; i++) {
                const th = -Math.PI * 0.42 + (i / 8) * Math.PI * 0.84;
                pts.push([c[0] + R * 0.25 + R * 0.5 * Math.cos(th), c[1] + R * 0.52 * Math.sin(th), z]);
            }
            bone(rig, pts, R * 0.3, C.boneShade);
            for (let i = 1; i < 8; i += 2) ball([pts[i][0] + 0.05, pts[i][1], z + R * 0.16], R * 0.08, C.bone);
        };
        const hood = S.hood ? [{
            // Capuz rasgado: cobre as costas e o topo da cabeça (atrás do crânio quando de frente, por cima quando de costas)
            depth: center.depth + (facing ? -0.6 : 0.6),
            draw() {
                ball([c[0] - R * 0.45, c[1], c[2] + R * 0.3], R * 1.12, C.hood);
                ball([c[0] - R * 0.7, c[1], c[2] - R * 0.5], R * 0.95, C.hoodDark);
                if (!facing) return;
                limb([[c[0] + R * 0.1, c[1] - R * 0.95, c[2] + R * 0.75], [c[0] + R * 0.55, c[1], c[2] + R * 1.0], [c[0] + R * 0.1, c[1] + R * 0.95, c[2] + R * 0.75]], R * 0.3, C.hood);
            }
        }] : [];
        return [...hood, {
            depth: center.depth,
            draw() {
                if (!facing) jaw();
                // Pescoço
                bone(rig, [[pose.lean - 0.4, 0, pose.shoulderZ], [c[0] - 0.3, c[1], c[2] - R * 0.8]], 0.7, C.boneShade);
                ball(c, R + 0.3, C.boneDark);
                ball(c, R, SKULL);
                ball([c[0] - R * 0.35, c[1], c[2] + R * 0.1], R * 0.62, SKULL_SHADE);
                ball([c[0] + R * 0.1, c[1], c[2] + R * 0.25], R * 0.7, SKULL);
                // Maxilar: a frente do crânio desce um pouco mais estreita, com os dentes de cima
                if (facing) {
                    const mx = [c[0] + R * 0.55, c[1], c[2] - R * 0.5];
                    ball(mx, R * 0.48 + 0.2, C.boneDark);
                    ball(mx, R * 0.48, SKULL);
                    for (const b of [-0.27, -0.09, 0.09, 0.27]) {
                        limb([[mx[0] + R * 0.38, c[1] + b * R, mx[2] - R * 0.12], [mx[0] + R * 0.4, c[1] + b * R, mx[2] - R * 0.32]], R * 0.07, C.boneDark);
                    }
                }
                // Capacete enferrujado (S.helmet): calota no alto da cabeça, aro na testa e a proteção do nariz
                if (S.helmet) {
                    ball([c[0] - R * 0.05, c[1], c[2] + R * 0.78], R * 0.86 + 0.3, C.boneDark);
                    ball([c[0] - R * 0.05, c[1], c[2] + R * 0.78], R * 0.86, C.rust);
                    limb([[c[0] + R * 0.1, c[1] - R * 0.95, c[2] + R * 0.42], [c[0] + R * 0.9, c[1], c[2] + R * 0.48], [c[0] + R * 0.1, c[1] + R * 0.95, c[2] + R * 0.42]], R * 0.2, C.steelDark);
                    if (facing) limb([[c[0] + R * 0.9, c[1], c[2] + R * 0.48], [c[0] + R * 0.98, c[1], c[2] - R * 0.18]], R * 0.14, C.steelDark);
                }
                // Rachadura em zigue-zague no topo
                limb([[c[0] - R * 0.8, c[1] + R * 0.1, c[2] + R * 0.55], [c[0] - R * 0.45, c[1] - R * 0.18, c[2] + R * 0.8],
                    [c[0] - R * 0.15, c[1] + R * 0.12, c[2] + R * 0.95], [c[0] + R * 0.15, c[1] - R * 0.1, c[2] + R * 0.95]], 0.22, C.boneDark);
                if (!facing) return;
                jaw();
                // Órbitas fundas com chama verde e o furo do nariz
                for (const side of [-1, 1]) {
                    const e = [c[0] + R * 0.78, c[1] + side * R * 0.4, c[2] + R * 0.05];
                    const pe = project(...e);
                    if (pe.depth < center.depth) continue;
                    ctx.fillStyle = C.socket;
                    ctx.beginPath();
                    ctx.ellipse(pe.x, pe.y, R * 0.27, R * 0.32, 0, 0, Math.PI * 2);
                    ctx.fill();
                    drawGlow(ctx, C.soulGlow, pe.x, pe.y, S.eyeGlowRadius * (0.8 + 0.4 * pulse), 0.8);
                    ctx.fillStyle = C.soul;
                    ctx.beginPath();
                    ctx.arc(pe.x, pe.y, R * 0.11 * (0.8 + 0.4 * pulse), 0, Math.PI * 2);
                    ctx.fill();
                }
                const n = project(c[0] + R * 0.92, c[1], c[2] - R * 0.3);
                ctx.fillStyle = C.socket;
                ctx.beginPath();
                ctx.moveTo(n.x, n.y + 0.5);
                ctx.lineTo(n.x - 0.4, n.y - 0.3);
                ctx.lineTo(n.x + 0.4, n.y - 0.3);
                ctx.closePath();
                ctx.fill();
            }
        }];
    }

    // --- TRAPO: tiras podres presas atrás da bacia, arrastando com o movimento ---
    function drawRag(rig, pose) {
        const { C, anim } = rig;
        if (S.quiver) {
            // Aljava nas costas, com as flechas de penas para fora
            const a = [pose.lean - 1.9, 1.2, pose.shoulderZ - 4];
            const b = [pose.lean - 2.7, 2.0, pose.shoulderZ + 3.2];
            rig.limb([a, b], 2.4, C.boneDark);
            rig.limb([a, b], 1.8, C.leather);
            for (const k of [-0.5, 0.2, 0.8]) {
                rig.limb([[b[0] - 0.2, b[1] + k, b[2]], [b[0] - 0.5, b[1] + k * 1.2, b[2] + 2.2]], 0.28, C.wood);
                rig.limb([[b[0] - 0.5, b[1] + k * 1.2, b[2] + 1.6], [b[0] - 0.7, b[1] + k * 1.3, b[2] + 2.5]], 0.7, C.feather);
            }
        }
        for (let i = 0; i < S.ragStrips; i++) {
            const b = (i / (S.ragStrips - 1) - 0.5) * S.pelvisWidth * 1.3;
            const root = [pose.lean * 0.3 - S.pelvisDepth, b, pose.hipZ - 0.3];
            const chain = flowChain(root, pose, anim, {
                hang: [-0.25, b * 0.08, -1], stream: [-1, b * 0.1, -0.35], len: S.ragLength * (i % 2 === 0 ? 1 : 0.75),
                segs: 4, amp: 0.35, ampRun: 0.7, speed: 5, speedRun: 9, waveLength: 2.2, phase: i * 1.7, lag: 0.25
            });
            drawRibbon(rig, chain, S.ragWidth, S.ragWidth * 0.45, C.rag, C.ragEdge);
        }
    }

    return {
        vis: S,
        // Rastejando: bacia e ombros baixos, tronco quase deitado, cabeça baixa à frente
        poseTweak: crawl ? (pose, anim) => {
            // Sobe e desce um pouco a cada puxada dos braços
            const bob = Math.abs(Math.sin(anim.stride)) * S.crawlBob * pose.run;
            pose.hipZ = S.crawlHipZ - pose.crouch * 0.3 + bob;
            pose.sashZ = pose.hipZ;
            pose.lean = S.crawlLean + pose.lean * 0.2;
            pose.shoulderZ = S.crawlShoulderZ - pose.crouch * 0.3 + bob;
            pose.headA = pose.lean + S.crawlHeadForward;
            pose.headZ = S.crawlHeadZ + bob;
        } : undefined,
        drawLeg: (rig, legs) => drawSkeletonLeg(rig, legs),
        drawTorso: (rig, pose, bottom, top) => drawSkeletonTorso(rig, pose, bottom, top),
        drawBack: (rig, pose) => drawRag(rig, pose),
        freeArm: (rig, pose) => armPose(rig, pose, -1),
        drawArm: (rig, shoulder, elbow, hand) => drawBoneArm(rig, shoulder, elbow, hand),
        swordArmPart: (rig, pose) => {
            const { shoulder, elbow, hand } = armPose(rig, pose, 1);
            return { depth: rig.project(...elbow).depth + 0.1, draw: () => drawBoneArm(rig, shoulder, elbow, hand) };
        },
        // Sem arma
        drawn: () => 0,
        headParts: (pose, rig) => skullPart(pose, rig)
    };
}

registerBody('skeleton', skeletonBody(S));

// --- NO JOGO (câmera do Last Torch) ---
// Mesmo monstro de renderSkeleton ({ x, y, angle, hp, radius, phase }); ao levar dano os ossos piscam em branco.
export function renderSkeleton25D(e) {
    renderSkeletonModel(e, 'skeleton', S);
}

// Desenha um monstro de osso registrado (model) com as medidas P; usado também pelo Esqueleto Rastejante
export function renderSkeletonModel(e, model, P) {
    bowNow = { aim: e.aim ?? 0, release: e.release ?? 0 };          // o arqueiro lê isto (puxar a corda e soltar)
    meleeState.p = e.atk ?? 0;                                       // o guerreiro lê isto (golpe de espada)
    renderMonster25D(e, model, P, {
        colors: (P2, hurtAge) => (hurtAge < P2.hurtFlashSeconds ? { ...P2.colors, bone: P2.colors.hurtFlash } : P2.colors)
    });
    bowNow = null;
    meleeState.p = 0;
}
