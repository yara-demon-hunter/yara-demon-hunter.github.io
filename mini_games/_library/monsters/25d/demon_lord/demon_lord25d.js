import { DEMON_LORD_25D_VISUALS as S } from './demon_lord25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { mix, add, norm, sub, olimb, oball, flowChain } from '../../../characters/hunter/kit25d.js';
import { trunk, poly, glowAt, facesCamera, taper } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';
import { renderNow } from '../../../core/clock.js';

// --- DEMON LORD 2.5D (boss) ---
// O Demon Lord de topdown/demon_lord/demon_lord.js no boneco 2.5D: demônio vermelho musculoso de peito largo, cabeça
// com chifres de carneiro (abrem para o lado, curvam para trás e a ponta volta à frente), orelhas pontudas, testa
// franzida, olhos laranja em brasa e os dentes à mostra; asas de morcego enormes batendo devagar (membrana recortada
// entre os ossos, garra preta na ponta de cima); cauda longa ondulando, com a ponta de lança; mãos e pés de garras.
// O braço direito estica e a bola de fogo cresce na mão antes do disparo. Medidas: demon_lord25d_visual.js.
// Uso: renderDemonLord25D(e) (carrega pelo e.shootTimer), ou o modelo 'demon_lord' em renderHero25D.

// Quanto o fogo está carregado (0 a 1): o jogo informa por renderDemonLord25D; sem ele, previewCharge
let charge = null;
const chargeNow = () => charge ?? S.previewCharge;

function drawLeg(rig, { hip, knee, ankle, toe }) {
    const { C, limb } = rig;
    olimb(rig, [hip, knee], S.legWidth, C.skin);
    olimb(rig, [knee, ankle], S.legWidth * 0.82, C.skinShade);
    oball(rig, knee, S.legWidth * 0.5, C.skin);
    const foot = [toe[0] + 0.8, toe[1], toe[2]];
    olimb(rig, [ankle, foot], S.legWidth * 0.9, C.skinShade);
    for (const k of [-1, 0, 1]) limb([[foot[0], foot[1] + k * 0.8, foot[2]], [foot[0] + 1.2, foot[1] + k * 1.1, foot[2] - 0.3]], 0.45, C.claw);
}

function drawTorso(rig, pose, bottom, top, wb, wt) {
    const { C, limb, ball } = rig;
    trunk(rig, bottom, top, wb * 1.15, wt, C.skin, C.outline, S.chestWiden, C.skinShade);
    if (rig.sinF < -0.25) {
        // Costas: a coluna
        limb([[top.a - top.A, 0, top.z - 0.5], [bottom.a - bottom.A, 0, bottom.z + 1]], 0.6, C.skinShade);
        return;
    }
    // Peitorais (luz), o sulco do meio e o abdômen
    for (const side of [-1, 1]) ball([top.a + top.A * 0.75, side * top.B * 0.55 * S.chestWiden, top.z - 2.4], 2.3, C.skinLight);
    limb([[top.a + top.A, 0, top.z - 1], [bottom.a + bottom.A, 0, bottom.z + 1]], 0.4, C.skinShade);
    for (const z of [0.3, 0.5]) {
        const zz = bottom.z + (top.z - bottom.z) * z;
        limb([[bottom.a + bottom.A, -1.6, zz], [bottom.a + bottom.A * 1.05, 0, zz - 0.2], [bottom.a + bottom.A, 1.6, zz]], 0.3, C.skinShade);
    }
}

// Asas e cauda (as "costas" do boneco)
function wing(rig, pose, side) {
    const { C, limb } = rig;
    const flap = Math.sin(pose.t * S.flapHz * Math.PI * 2);
    const root = [pose.lean - 1.8, side * 2.4, pose.shoulderZ - 0.6];
    const n = S.wingBones.length;
    const tips = S.wingBones.map((b, i) => {
        const th = (b.angle * Math.PI) / 180;
        const elev = S.wingRise * (1 - (i / (n - 1)) * 1.5) + flap * S.flapAmount * (1 - i * 0.15);
        const L = b.length * S.wingUnit * (1 - Math.max(0, flap) * 0.08);
        return [root[0] + Math.cos(th) * L * Math.cos(elev), root[1] + side * Math.sin(th) * L * Math.cos(elev), root[2] + L * Math.sin(elev)];
    });
    const low = [pose.lean - 2.2, side * 1.6, pose.hipZ + 2.5];
    // Membrana com recortes entre as pontas dos ossos
    const outline = [root, tips[0]];
    for (let i = 0; i < n - 1; i++) outline.push(mix(mix(tips[i], tips[i + 1], 0.5), root, S.wingScallop), tips[i + 1]);
    outline.push(mix(mix(tips[n - 1], low, 0.5), root, S.wingScallop * 0.6), low);
    poly(rig, outline, C.membrane, C.membraneEdge, 0.5);
    // Painéis mais escuros alternados
    for (let i = 1; i < n - 1; i += 2) poly(rig, [root, tips[i], mix(mix(tips[i], tips[i + 1], 0.5), root, S.wingScallop), tips[i + 1]], C.membraneShade);
    // Ossos (o da frente é mais grosso) e a garra preta na ponta do primeiro
    tips.forEach((tip, i) => limb([root, tip], i === 0 ? 1.1 : 0.6, C.bone));
    limb([tips[0], [tips[0][0] + 0.8, tips[0][1], tips[0][2] + 1.8]], 0.6, C.wingClaw);
}

function drawBack(rig, pose) {
    const { C } = rig;
    // Cauda ondulando, afinando até a ponta de lança
    const chain = flowChain([pose.lean * 0.3 - 2, 0, pose.hipZ], pose, rig.anim, {
        hang: [-1, 0, -0.45], stream: [-1, 0, -0.1], len: S.tailLength, segs: 9,
        amp: 1.6, ampRun: 0.8, speed: 2.4, speedRun: 3, waveLength: 3.2, phase: 0, lag: 0.3
    });
    taper(rig, chain, S.tailWidth, S.tailWidth * 0.3, C.skinShade, C.outline);
    const end = chain[chain.length - 1];
    const d = norm(sub(end, chain[chain.length - 2]));
    const w = norm([-d[1], d[0], 0]);
    poly(rig, [end, add(add(end, d, S.spearLength * 0.4), w, S.spearWidth), add(end, d, S.spearLength), add(add(end, d, S.spearLength * 0.4), w, -S.spearWidth)], C.spear, C.spearEdge, 0.4);
    // A asa mais longe da câmera primeiro
    const order = rig.project(0, 1, 0).depth > rig.project(0, -1, 0).depth ? [-1, 1] : [1, -1];
    order.forEach(side => wing(rig, pose, side));
}

// Braços musculosos; o direito estica para lançar o fogo
function armPose(rig, pose, side) {
    const k = side > 0 ? chargeNow() : 0;
    const swing = Math.sin(rig.anim.stride + (side > 0 ? Math.PI : 0)) * 1.6 * pose.run;
    const shoulder = [pose.lean, side * S.shoulderWidth, pose.shoulderZ - 0.4];
    let hand = mix([pose.lean + 1.5 + swing, side * (S.shoulderWidth + 1.2), pose.shoulderZ - 8.5], [pose.lean + 9, side * (S.shoulderWidth - 2.2), pose.shoulderZ - 1.5], k);
    const held = side > 0 ? pose.sword : pose.free;
    if (held) hand = mix(hand, held.hand, held.w);
    const elbow = [(shoulder[0] + hand[0]) / 2 - 0.8, (shoulder[1] + hand[1]) / 2 + side * 1.2, (shoulder[2] + hand[2]) / 2 - 0.8 * (1 - k)];
    return { shoulder, elbow, hand };
}

function drawArm(rig, shoulder, elbow, hand) {
    const { C, limb } = rig;
    oball(rig, shoulder, S.armWidth * 0.78, C.skin);
    olimb(rig, [shoulder, elbow], S.armWidth, C.skin);
    olimb(rig, [elbow, hand], S.armWidth * 0.85, C.skin);
    limb([mix(shoulder, elbow, 0.2), mix(shoulder, elbow, 0.7)].map(p => [p[0] + 0.3, p[1], p[2] + 0.5]), S.armWidth * 0.3, C.skinLight);
    oball(rig, hand, S.handRadius, C.skinShade);
    const d = norm(sub(hand, elbow));
    const side = norm([-d[1], d[0], 0]);
    for (const k of [-1, -0.33, 0.33, 1]) limb([add(add(hand, d, S.handRadius * 0.7), side, k * 0.8), add(add(hand, d, S.handRadius * 0.7 + S.clawLength), side, k * 1.2)], 0.4, C.claw);
}

// Bola de fogo em camadas (vermelho → laranja → amarelo → núcleo claro), tremulando
function fireball(rig, pose, hand) {
    const { C, ball } = rig;
    const k = chargeNow();
    if (k <= 0.02) return;
    const flick = 1 + Math.sin(pose.t * 28) * 0.06;
    const r = S.fireballRadius * k * flick;
    const p = [hand[0] + 1.6, hand[1], hand[2] + 1.6 + r * 0.3];
    glowAt(rig, p, C.fireGlow, r * 3.4, 0.7);
    ball(p, r, C.fire.outer);
    ball([p[0], p[1], p[2] - r * 0.1], r * 0.76, C.fire.mid);
    ball([p[0], p[1], p[2] - r * 0.18], r * 0.5, C.fire.inner);
    ball([p[0], p[1], p[2] - r * 0.22], r * 0.25, C.fire.core);
}

function headParts(pose, rig) {
    const { C, project, ball, limb } = rig;
    const R = S.headRadius;
    const c = [pose.headA + 0.8, 0, pose.headZ - 0.8];
    const k = chargeNow();
    return [{
        depth: project(...c).depth,
        draw() {
            // Orelhas pontudas
            for (const side of [-1, 1]) {
                poly(rig, [[c[0] - 0.3, side * R * 0.85, c[2] - 0.4], [c[0] - 1.2, side * (R + S.earLength), c[2] + 1.2], [c[0] + 0.5, side * R * 0.9, c[2] + 0.8]], C.skin, C.outline, 0.35);
            }
            // Cabeça e focinho
            oball(rig, c, R, C.skin);
            const jaw = [c[0] + R * 0.42, 0, c[2] - R * 0.5];
            oball(rig, jaw, R * 0.66, C.skin);
            ball([c[0] - R * 0.3, 0, c[2] + R * 0.25], R * 0.7, C.skinShade);
            ball([c[0] + R * 0.1, 0, c[2] + R * 0.35], R * 0.62, C.skin);
            if (facesCamera(rig, [c[0] + R, 0, c[2]], c)) {
                // Dentes à mostra, testa franzida e olhos em brasa (mais fortes enquanto carrega o fogo)
                const tz = jaw[2] - R * 0.12;
                limb([[jaw[0] + R * 0.5, -R * 0.42, tz + 0.15], [jaw[0] + R * 0.64, 0, tz], [jaw[0] + R * 0.5, R * 0.42, tz + 0.15]], 0.75, C.outline);
                limb([[jaw[0] + R * 0.52, -R * 0.36, tz + 0.15], [jaw[0] + R * 0.66, 0, tz], [jaw[0] + R * 0.52, R * 0.36, tz + 0.15]], 0.45, C.teeth);
                for (const side of [-1, 1]) {
                    const eye = [c[0] + R * 0.82, side * R * 0.4, c[2] + R * 0.12];
                    glowAt(rig, eye, C.eyeGlow, S.eyeGlow * (1 + 0.6 * k), 0.9);
                    ball(eye, 0.4, C.eye);
                    limb([[eye[0] - 0.1, side * R * 0.75, eye[2] + 1.0], [eye[0] + 0.25, side * R * 0.1, eye[2] + 0.5]], 0.55, C.skinShade);
                }
            }
            // Chifres de carneiro por cima de tudo, com os anéis
            for (const side of [-1, 1]) {
                const h = S.hornSpread;
                // Sai do alto da cabeça para o lado, desce por trás da orelha e a ponta volta para a frente
                const chain = [
                    [c[0] - 0.2, side * R * 0.55, c[2] + R * 0.7],
                    [c[0] - 0.9, side * (R * 0.6 + h * 0.55), c[2] + R * 0.95],
                    [c[0] - 2.2, side * (R * 0.6 + h * 0.95), c[2] + R * 0.45],
                    [c[0] - 2.8, side * (R * 0.6 + h), c[2] - S.hornCurl * 0.25],
                    [c[0] - 1.8, side * (R * 0.6 + h * 0.9), c[2] - S.hornCurl * 0.8],
                    [c[0] + 0.2, side * (R * 0.6 + h * 0.75), c[2] - S.hornCurl * 0.85]
                ];
                taper(rig, chain, S.hornWidth, S.hornWidth * 0.3, C.horn, C.hornDark);
                for (let i = 1; i < chain.length - 1; i++) ball(mix(chain[i], chain[i + 1], 0.5), S.hornWidth * 0.18, C.hornRidge);
            }
        }
    }];
}

registerBody('demon_lord', {
    vis: S,
    poseTweak: (pose) => {
        pose.lean += S.hunch;
        pose.headA += S.hunch;
    },
    drawLeg,
    drawTorso,
    drawBack: (rig, pose) => drawBack(rig, pose),
    // As asas ficam por cima do tronco quando ele está de costas
    backDepth: (rig, pose, depth) => (rig.sinF < 0 ? Math.max(depth, rig.project(pose.lean * 0.6, 0, 13.5).depth + 0.05) : depth),
    freeArm: (rig, pose) => armPose(rig, pose, -1),
    drawArm: (rig, shoulder, elbow, hand) => drawArm(rig, shoulder, elbow, hand),
    swordArmPart: (rig, pose) => {
        const { shoulder, elbow, hand } = armPose(rig, pose, 1);
        return {
            depth: rig.project(...elbow).depth + 0.1,
            draw: () => {
                drawArm(rig, shoulder, elbow, hand);
                fireball(rig, pose, hand);
            }
        };
    },
    drawn: () => 0,
    headParts
});

// --- NO JOGO (câmera do Last Torch) ---
// O fogo carrega quando falta menos que chargeSeconds para o tiro (e.shootTimer, em segundos).
// Nas rajadas o jogo reinicia esse relógio a cada disparo, e a mão subia e descia a cada tiro (parecia tremer). Por isso a
// carga que se desenha é suavizada por boss (e.chargeVis): sobe depressa, desce devagar, e durante a rajada (e.ai.shots > 0)
// o braço fica esticado com o fogo aceso, até o último tiro.
const CHARGE_RISE = 6;      // por segundo
const CHARGE_FALL = 2.2;
export function renderDemonLord25D(e) {
    const wanted = e.ai?.shots > 0 ? 1 : Math.max(0, Math.min(1, 1 - (e.shootTimer ?? 99) / S.chargeSeconds));
    const now = renderNow() / 1000;
    if (e.baking || e.chargeVis === undefined) e.chargeVis = wanted;
    else {
        const dt = Math.min(0.1, Math.max(0, now - (e.chargeAt ?? now)));
        const rate = wanted > e.chargeVis ? CHARGE_RISE : CHARGE_FALL;
        e.chargeVis = wanted > e.chargeVis ? Math.min(wanted, e.chargeVis + rate * dt) : Math.max(wanted, e.chargeVis - rate * dt);
    }
    e.chargeAt = now;
    charge = e.chargeVis;
    renderMonster25D(e, 'demon_lord', S);
    charge = null;
}
