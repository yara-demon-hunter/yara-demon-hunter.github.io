import { WITCH_25D_VISUALS as S } from './witch25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { HERO_25D_VISUALS as V } from '../../../characters/hunter/hero25d_visual.js';
import { add, mix, norm, sub, flowChain, drawRibbon } from '../../../characters/hunter/kit25d.js';
import { renderMonster25D } from '../monster25d.js';
import { ctx } from '../../../core/canvas.js';
import { drawGlow } from '../../../core/glow.js';

// --- BRUXA 2.5D ---
// A Bruxa do Last Torch (topdown/witch/witch.js) misturada com a do palco do yara-rpg, num boneco 2.5D: velha corcunda
// num manto roxo-escuro até o chão (barra rasgada arrastando, cordão com nó na cintura), capuz com a ponta caindo para
// trás, rosto pálido de nariz comprido com um olho vermelho brilhando e o outro afundado, mechas grisalhas saindo do
// capuz, mangas largas e mãos ossudas de quatro garras. A mão da frente segura a bola de magia escura (redemoinho roxo,
// faíscas subindo), que cresce ao carregar o feitiço sugando partículas. Medidas: witch25d_visual.js (cores do topdown).
// Coordenadas locais: a = frente, b = direita, z = altura.
// Uso: renderWitch25D(e) (mesmo monstro de renderWitch: { x, y, angle, hp, radius, phase, shootTimer }), ou o modelo
// 'witch' em renderHero25D para quem anima o boneco por conta própria (o palco do yara-rpg, o tuner).

// Quanto o feitiço está carregado (0 a 1): o jogo informa por renderWitch25D; sem ele, previewCharge
let charge = null;
const chargeNow = () => charge ?? S.previewCharge;

// Envoltória convexa de pontos na tela (o manto é um cone: o contorno dele é a envoltória dos dois anéis)
function hull(pts) {
    const p = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
    const crossZ = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lower = [];
    for (const q of p) {
        while (lower.length >= 2 && crossZ(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
        lower.push(q);
    }
    const upper = [];
    for (const q of p.reverse()) {
        while (upper.length >= 2 && crossZ(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
        upper.push(q);
    }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// --- MANTO: cone do peito até o chão, barra rasgada que ondula e arrasta para trás ---
function robeRings(pose) {
    const t = pose.t;
    const n = S.robeStrips;
    const chestC = [pose.lean, 0, pose.shoulderZ - 1];
    const hemC = [pose.lean * 0.2, 0, S.robeHemHeight];
    const chest = [];
    const hem = [];
    for (let i = 0; i < n; i++) {
        const phi = (i / n) * Math.PI * 2;
        const c = Math.cos(phi);
        const s = Math.sin(phi);
        chest.push([chestC[0] + S.robeChest * c * 0.8, chestC[1] + S.robeChest * s, chestC[2]]);
        // Atrás (c < 0) a barra arrasta mais; cada ponta ondula e as pares ficam mais curtas (rasgos)
        const wave = Math.sin(t * S.robeWaveHz * Math.PI * 2 + i * 1.3) * S.robeWave * (0.5 + pose.run);
        const back = c < 0 ? -c * S.robeHemBack * (0.6 + pose.run) : 0;
        hem.push([hemC[0] + S.robeHem * c * 0.85 - back + wave * 0.5, hemC[1] + S.robeHem * s + wave * 0.3, hemC[2] + (i % 2 ? S.robeJag : 0)]);
    }
    return { chestC, hemC, chest, hem };
}

function drawRobe(rig, pose) {
    const { C, project, limb } = rig;
    const { chestC, chest, hem } = robeRings(pose);
    const outline = hull([...chest, ...hem].map(p => project(...p)));
    ctx.fillStyle = C.robe;
    ctx.strokeStyle = C.robeShade;
    ctx.lineWidth = 0.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    outline.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dobras do peito à barra e a barra rasgada, só do lado virado para a câmera
    const center = project(...chestC).depth;
    for (let i = 0; i < S.robeStrips; i++) {
        const mid = mix(chest[i], hem[i], 0.5);
        if (project(...mid).depth < center) continue;
        if (i % Math.max(1, Math.round(S.robeStrips / S.robeFolds)) === 0) limb([chest[i], mid, hem[i]], 0.45, C.robeFold);
        const next = hem[(i + 1) % S.robeStrips];
        if (project(...mix(hem[i], next, 0.5)).depth >= center) limb([hem[i], next], 0.5, C.robeEdge);
    }

    // Cordão na cintura (metade da frente) com nó e a ponta pendurada
    const z = S.ropeHeight;
    const r = mix([S.robeChest * 0.8, S.robeChest], [S.robeHem * 0.85, S.robeHem], 1 - (z - S.robeHemHeight) / (chestC[2] - S.robeHemHeight));
    const ropeC = [pose.lean * (0.2 + 0.8 * (z / chestC[2])), 0, z];
    const rope = [];
    for (let j = 0; j <= 12; j++) {
        const phi = -Math.PI / 2 + (j / 12) * Math.PI;
        rope.push([ropeC[0] + r[0] * Math.cos(phi), ropeC[1] + r[1] * Math.sin(phi), z]);
    }
    if (project(ropeC[0] + r[0], 0, z).depth >= center) {
        limb(rope, 0.6, C.rope);
        const knot = [ropeC[0] + r[0], r[1] * 0.25, z];
        rig.ball(knot, 0.55, C.rope);
        limb([knot, [knot[0] + 0.3, knot[1] + 0.2 + Math.sin(pose.t * 2.2) * 0.3, z - S.ropeEnd]], 0.45, C.rope);
    }
}

// --- CABEÇA: capuz com ponta caindo atrás, rosto pálido, olho vermelho e mechas grisalhas ---
function headParts(pose, rig) {
    const { C, project, ball, limb } = rig;
    const t = pose.t;
    const c = [pose.headA, 0, pose.headZ];
    const R = S.hoodRadius;
    const center = project(...c);
    const front = project(c[0] + R, 0, c[2]);
    const facing = front.depth > center.depth;
    const k = chargeNow();
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.3);
    // Ponta do capuz: cai para trás e balança
    const tip = flowChain([c[0] - R * 0.6, 0, c[2] + R * 0.3], pose, rig.anim, {
        hang: [-0.7, 0, -0.7], stream: [-1, 0, -0.2], len: S.hoodTipLength, segs: 4,
        amp: 0.25, ampRun: 0.5, speed: 2.2, speedRun: 4, waveLength: 1.6, phase: 0.5, lag: 0.2
    });
    const locks = [];
    for (const side of [-1, 1]) {
        for (let i = 0; i < S.hairLocks; i++) {
            const root = [c[0] + R * (0.35 - i * 0.18), side * R * (0.72 + i * 0.06), c[2] - R * 0.35];
            locks.push({ side, chain: flowChain(root, pose, rig.anim, {
                hang: [0.1, side * 0.15, -1], stream: [-0.8, side * 0.1, -0.6], len: S.hairLength * (1 - i * 0.15), segs: 4,
                amp: 0.15, ampRun: 0.4, speed: 1.7, speedRun: 3, waveLength: 1.4, phase: i + side, lag: 0.15
            }) });
        }
    }
    const drawFace = () => {
        // Abertura escura do capuz e o rosto dentro dela
        const open = [c[0] + R * 0.62, 0, c[2] - R * 0.1];
        ball(open, R * 0.68, C.hoodInner);
        const f = [c[0] + R * 0.62, 0, c[2] - R * 0.22];
        // Rosto comprido e magro: testa e maçãs do rosto, com a sombra do capuz por cima
        ball([f[0], 0, f[2] + 0.35], S.faceRadius * 0.9, C.skin);
        ball([f[0] + 0.15, 0, f[2] - 0.45], S.faceRadius * 0.8, C.skin);
        ball([f[0] - 0.2, 0, f[2] + S.faceRadius * 0.85], S.faceRadius * 0.85, C.hoodInner);
        // Rugas, nariz comprido apontando para baixo e queixo saliente
        limb([[f[0] + 0.6, -0.7, f[2] - 0.75], [f[0] + 0.85, 0, f[2] - 0.95], [f[0] + 0.6, 0.7, f[2] - 0.75]], 0.16, C.wrinkle);
        limb([[f[0] + S.faceRadius * 0.7, 0, f[2] + 0.2], [f[0] + S.faceRadius * 0.7 + S.noseLength, 0, f[2] - 0.6]], 0.55, C.skin);
        ball([f[0] + S.faceRadius * 0.55, 0, f[2] - S.faceRadius * 1.05], 0.5, C.skinShade);
        // Olho direito vermelho brilhando (mais forte ao carregar); o esquerdo, afundado e escuro
        for (const side of [-1, 1]) {
            const e = [f[0] + S.faceRadius * 0.7, side * 0.55, f[2] + 0.2];
            const pe = project(...e);
            if (pe.depth < project(...f).depth) continue;
            if (side > 0) {
                drawGlow(ctx, C.eyeGlow, pe.x, pe.y, S.eyeGlowRadius * (0.8 + 0.4 * pulse + k * 0.5), 0.9);
                ball(e, 0.3, C.eye);
            } else {
                ball(e, 0.3, C.eyeSocket);
            }
        }
    };
    return [{
        depth: center.depth,
        draw() {
            // Ponta do capuz e mechas de trás primeiro
            drawRibbon(rig, tip, R * 0.55, 0.3, C.hood, C.robeShade, false);
            const hair = (front) => locks.forEach(({ chain }) => {
                const isFront = project(...chain[chain.length - 1]).depth >= center.depth;
                if (isFront === front) rig.limb(chain, 0.3, front ? C.hair : C.hairShade);
            });
            hair(false);
            ball(c, R + 0.3, C.robeShade);
            ball(c, R, C.hood);
            ball([c[0] - R * 0.2, 0, c[2] + R * 0.35], R * 0.55, C.hoodFold);
            if (facing) drawFace();
            hair(true);
        }
    }];
}

// --- BRAÇOS: manga larga, mão ossuda de quatro garras; a da frente conjura ---
function armPose(rig, pose, side) {
    const k = chargeNow();
    const shoulder = [pose.lean, side * V.chest.B * 0.85, pose.shoulderZ - 0.6];
    const sway = Math.sin(pose.t * 1.6 + side) * 0.4;
    let hand = side > 0
        ? [shoulder[0] + S.castReach * (0.75 + 0.25 * k), shoulder[1] + 0.6, shoulder[2] - 2.5 + S.castLift * k + sway]
        : [shoulder[0] + 2.2, shoulder[1] - 0.6, shoulder[2] - 5.5 + sway];
    const held = side > 0 ? pose.sword : pose.free;
    if (held) hand = mix(hand, held.hand, held.w);
    const elbow = [(shoulder[0] + hand[0]) / 2 - 0.4, (shoulder[1] + hand[1]) / 2 + side * 0.8, (shoulder[2] + hand[2]) / 2 - 0.9];
    return { shoulder, elbow, hand };
}

function drawClawHand(rig, elbow, hand) {
    const { C, limb, ball } = rig;
    const d = norm(sub(hand, elbow));
    const side = norm([-d[1], d[0], 0]);
    ball(hand, S.handRadius + 0.2, C.skinShade);
    ball(hand, S.handRadius, C.hand);
    for (let i = 0; i < S.clawCount; i++) {
        const k = i / (S.clawCount - 1) - 0.5;
        const knuckle = add(add(hand, d, 0.5), side, k * 0.9);
        const tip = add(add(add(knuckle, d, S.clawLength * 0.6), side, k * 0.9), [0, 0, -0.5], 1);
        limb([hand, knuckle], 0.32, C.hand);
        limb([knuckle, tip], 0.2, C.claw);
    }
}

function drawSleeveArm(rig, shoulder, elbow, hand) {
    const { C, limb } = rig;
    const cuff = mix(elbow, hand, 0.78);
    limb([shoulder, elbow, cuff], S.sleeveWidth + 0.5, C.robeShade);
    limb([shoulder, elbow, cuff], S.sleeveWidth, C.robe);
    // A manga abre no punho, com a borda clara
    const flare = mix(elbow, hand, 0.6);
    limb([flare, cuff], S.sleeveWidth + S.sleeveFlare + 0.4, C.robeShade);
    limb([flare, cuff], S.sleeveWidth + S.sleeveFlare, C.robe);
    limb([mix(flare, cuff, 0.85), cuff], S.sleeveWidth + S.sleeveFlare + 0.1, C.robeEdge);
    drawClawHand(rig, elbow, hand);
}

// Bola de magia sobre a mão: núcleo escuro de borda roxa, redemoinho, faíscas subindo e, ao carregar, partículas sugadas
function drawOrb(rig, pose, hand) {
    const { C, project } = rig;
    const t = pose.t;
    const k = chargeNow();
    const r = S.orbMinRadius + (S.orbMaxRadius - S.orbMinRadius) * k;
    const p = project(hand[0] + 0.8, hand[1], hand[2] + S.orbHeight + r * 0.6);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.3);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, C.orbGlow, p.x, p.y, r * S.orbGlow, 0.55 + 0.25 * pulse + k * 0.3);
    ctx.restore();
    ctx.fillStyle = C.orbCore;
    ctx.strokeStyle = C.orbRim;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const spin = t * S.orbSpinHz * Math.PI * 2;
    ctx.strokeStyle = C.orbSwirl;
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 0.6, spin * 0.35, spin * 0.35 + 2.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 0.35, -spin * 0.5, -spin * 0.5 + 2);
    ctx.stroke();
    // Faíscas roxas subindo
    for (let i = 0; i < S.sparks; i++) {
        const u = (t * 0.8 + i / S.sparks) % 1;
        const a = i * 1.9 + t;
        drawGlow(ctx, i % 2 ? C.particleLight : C.particleDark, p.x + Math.cos(a) * r * 1.4, p.y - u * 4 + Math.sin(a) * r * 0.5, 0.6 + (1 - u) * 0.5, 1 - u);
    }
    // Carregando: partículas vindo de longe para dentro da bola
    if (k > 0.05) {
        for (let i = 0; i < S.particleCount; i++) {
            const u = (t * 0.7 + i / S.particleCount) % 1;
            const a = i * 2.4 + 0.5;
            const d = S.particleOrbit * (1 - u) + r;
            ctx.fillStyle = i % 2 ? C.particleLight : C.particleDark;
            ctx.globalAlpha *= 1;
            ctx.beginPath();
            ctx.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d * 0.7, 0.35 * (0.5 + u) * k + 0.1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

registerBody('witch', {
    vis: S,
    // Corcunda: tronco à frente, cabeça baixa e projetada; manca de lado a lado
    poseTweak: (pose, anim) => {
        const limp = Math.sin(anim.stride) * S.hobble * (0.4 + pose.run);
        pose.lean += S.hunch + limp * 0.3;
        pose.shoulderZ -= S.headDrop * 0.5;
        pose.headA = pose.lean + S.headForward;
        pose.headZ -= S.headDrop;
    },
    // O manto esconde as pernas
    drawLeg: () => {},
    drawTorso: (rig, pose) => drawRobe(rig, pose),
    drawBack: () => {},
    freeArm: (rig, pose) => armPose(rig, pose, -1),
    drawArm: (rig, shoulder, elbow, hand) => drawSleeveArm(rig, shoulder, elbow, hand),
    swordArmPart: (rig, pose) => {
        const { shoulder, elbow, hand } = armPose(rig, pose, 1);
        return {
            depth: rig.project(...elbow).depth + 0.1,
            draw: () => {
                drawSleeveArm(rig, shoulder, elbow, hand);
                drawOrb(rig, pose, hand);
            }
        };
    },
    drawn: () => 0,
    headParts: (pose, rig) => headParts(pose, rig)
});

// --- NO JOGO (câmera do Last Torch) ---
// O feitiço carrega quando falta menos que chargeSeconds para o tiro (e.shootTimer, em segundos)
export function renderWitch25D(e) {
    renderMonster25D(e, 'witch', S, {
        before: () => { charge = Math.max(0, Math.min(1, 1 - (e.shootTimer ?? 99) / S.chargeSeconds)); }
    });
    charge = null;
}
