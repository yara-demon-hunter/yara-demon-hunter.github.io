// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/skeleton/skeleton25d.js e rode o sync.
import { SKELETON_25D_VISUALS as S } from './skeleton25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { HERO_25D_VISUALS as V } from '../../../characters/hunter/hero25d_visual.js';
import { mix, add, norm, sub, cross, flowChain, drawRibbon } from '../../../characters/hunter/kit25d.js';
import { ctx } from '../../../core/canvas.js';
import { renderMonster25D } from '../monster25d.js';
import { drawGlow } from '../../../core/glow.js';

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

        // Coluna de vértebras, um pouco para trás (costas), da bacia até o pescoço
        for (let i = 0; i <= S.vertebrae; i++) {
            const k = (i / S.vertebrae) * (1 + 1.2 / spineLen);
            joint(rig, add(along(k), fwd, -0.6), S.vertebraRadius, C.boneShade);
        }

        // Alma: chama verde dentro do peito, pulsando
        const pulse = 0.5 + 0.5 * Math.sin(pose.t * S.soulPulseHz * Math.PI * 2);
        const soul = project(...add(along(S.soulAt), fwd, -0.2));
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
        // Esterno e clavículas
        const sternumTop = add(add(along(1 - S.ribTop / spineLen), fwd, S.ribDepth * 0.9), u, 0.3);
        bone(rig, [sternumTop, add(add(sternumTop, u, -S.ribGap * 2.2), fwd, -0.2)], 0.8, C.boneShade);
        for (const sd of [-1, 1]) {
            bone(rig, [add(add(neck, fwd, 0.4), u, -0.2).map((v, i) => (i === 1 ? sd * V.chest.B * 0.98 : v)), add(sternumTop, side, sd * 0.4)], 0.6, C.bone);
        }
    }

    // --- BRAÇOS: esticados à frente, balançando com a passada; três garras.
    // Rastejando (crawl), as mãos vão ao chão à frente, uma de cada vez, puxando o corpo ---
    function armPose(rig, pose, sd) {
        const phase = rig.anim.stride + (sd > 0 ? Math.PI : 0);
        const swing = Math.sin(phase) * S.armSwing * (0.3 + pose.run);
        const shoulder = [pose.lean, sd * V.chest.B * 0.98, pose.shoulderZ - 0.4];
        let hand;
        if (crawl) {
            const lift = Math.max(0, Math.cos(phase)) * S.crawlHandLift * (0.3 + pose.run);
            hand = [shoulder[0] + S.crawlHandReach + swing, sd * S.crawlHandSpread, 0.7 + lift];
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
        for (const k of [-1, 0, 1]) {
            bone(rig, [add(hand, side, k * 0.3), add(add(hand, d, S.clawLength), side, k * 0.6)], 0.3, C.bone);
        }
        joint(rig, hand, S.jointRadius * 0.85, C.bone);
    }

    // --- CRÂNIO: rachado, órbitas de chama verde, mandíbula que bate e tranco de cabeça de vez em quando ---
    function skullPart(pose, rig) {
        const { C, project, ball, limb } = rig;
        const t = pose.t;
        const wave = Math.sin(t * S.twitchHz * Math.PI * 2);
        const twitch = wave > 0.97 ? ((wave - 0.97) / 0.03) * S.twitchAmount : 0;
        const jawOpen = Math.max(0, Math.sin(t * S.chatterHz * Math.PI * 2)) * S.jawOpenMax;
        const R = S.skullRadius;
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
        return [{
            depth: center.depth,
            draw() {
                if (!facing) jaw();
                // Pescoço
                bone(rig, [[pose.lean - 0.4, 0, pose.shoulderZ], [c[0] - 0.3, c[1], c[2] - R * 0.8]], 0.7, C.boneShade);
                ball(c, R + 0.3, C.boneDark);
                ball(c, R, C.bone);
                ball([c[0] - R * 0.35, c[1], c[2] + R * 0.1], R * 0.62, C.boneShade);
                ball([c[0] + R * 0.1, c[1], c[2] + R * 0.25], R * 0.7, C.bone);
                // Maxilar: a frente do crânio desce um pouco mais estreita, com os dentes de cima
                if (facing) {
                    const mx = [c[0] + R * 0.55, c[1], c[2] - R * 0.5];
                    ball(mx, R * 0.48 + 0.2, C.boneDark);
                    ball(mx, R * 0.48, C.bone);
                    for (const b of [-0.27, -0.09, 0.09, 0.27]) {
                        limb([[mx[0] + R * 0.38, c[1] + b * R, mx[2] - R * 0.12], [mx[0] + R * 0.4, c[1] + b * R, mx[2] - R * 0.32]], R * 0.07, C.boneDark);
                    }
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
    renderMonster25D(e, model, P, {
        colors: (P2, hurtAge) => (hurtAge < P2.hurtFlashSeconds ? { ...P2.colors, bone: P2.colors.hurtFlash } : P2.colors)
    });
}
