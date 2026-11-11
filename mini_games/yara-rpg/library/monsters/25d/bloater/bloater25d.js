// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/bloater/bloater25d.js e rode o sync.
import { BLOATER_25D_VISUALS as S } from './bloater25d_visual.js';
import { registerBody } from '../../../characters/hunter/body_registry.js';
import { add, mix } from '../../../characters/hunter/kit25d.js';
import { renderMonster25D } from '../monster25d.js';
import { ctx } from '../../../core/canvas.js';
import { drawGlow } from '../../../core/glow.js';

// --- INCHADO (BLOATER) 2.5D ---
// O Inchado de topdown/bloater/bloater.js montado no boneco 2.5D: uma esfera enorme e esverdeada sobre perninhas
// curtas, com bracinhos dos lados, bolsas de gás brilhando na pele e a cara (olhos miúdos e boca costurada) na frente
// do próprio corpo. Incha e desincha, cada vez mais rápido conforme perde vida: dá para ler de longe que vai estourar.
// Medidas: bloater25d_visual.js (as cores vêm do desenho de cima). Coordenadas locais: a = frente, b = direita, z = altura.
// Uso: renderBloater25D(e) (mesmo monstro de renderBloater: { x, y, angle, hp, maxHp, radius, phase }), ou o modelo
// 'bloater' em renderHero25D para quem anima o boneco por conta própria (o palco do yara-rpg, o tuner).

// Quanto falta para estourar (0 = vida cheia, 1 = quase morto): o jogo informa por renderBloater25D; sem ele, previewHurt
let hurt = null;

function pulseOf(pose) {
    const h = hurt ?? S.previewHurt;
    const hz = S.pulseHz + (S.pulseHzLowHp - S.pulseHz) * h;
    return { h, k: 1 + Math.sin(pose.t * hz * Math.PI * 2) * S.pulseAmount * (1 + h), hz };
}

// Centro da esfera: balança de um lado para o outro a cada passo
function bodyCenter(rig, pose) {
    const sway = Math.sin(rig.anim.stride) * S.waddle * (0.3 + pose.run);
    return [pose.lean * 0.3, sway, S.bodyHeight];
}

// Ponto na superfície da esfera: lon 0 = frente, + = direita; lat 0 = meio, + = para cima (fração do raio)
function onSphere(c, R, lon, lat) {
    const cl = Math.cos(lat);
    return [c[0] + R * cl * Math.cos(lon), c[1] + R * cl * Math.sin(lon), c[2] + R * Math.sin(lat) * S.bodySquash];
}

// --- CORPO: esfera com sombra, brilho, bolsas de gás e a cara na frente ---
function drawBody(rig, pose) {
    const { C, project, limb } = rig;
    const { h, k, hz } = pulseOf(pose);
    const c = bodyCenter(rig, pose);
    const R = S.bodyRadius * k;
    const pc = project(...c);
    const ry = R * rig.sphereY * S.bodySquash;

    // Esfera: contorno escuro, pele, e o lado de cima pegando luz
    ctx.fillStyle = C.skinDark;
    ctx.beginPath();
    ctx.ellipse(pc.x, pc.y, R + 0.35, ry + 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.ellipse(pc.x - R * 0.04, pc.y - ry * 0.05, R * 0.94, ry * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.skinLight;
    ctx.beginPath();
    ctx.ellipse(pc.x - R * 0.25, pc.y - ry * 0.42, R * 0.42, ry * 0.24, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Bolsas de gás espalhadas pela pele (ângulo de ouro): só as viradas para a câmera aparecem
    for (let i = 0; i < S.sacCount; i++) {
        const lat = Math.asin(-0.55 + 1.35 * ((i + 0.5) / S.sacCount));
        const lon = i * 2.39996 + 0.7;
        const p = onSphere(c, R * 1.01, lon, lat);
        const pp = project(...p);
        const facing = (pp.depth - pc.depth) / R;
        if (facing < 0.15) continue;
        const size = S.sacRadius * (0.75 + (i % 3) * 0.25) * (1 + Math.sin(pose.t * hz * 3 + i) * 0.14) * Math.min(1, facing * 1.4);
        drawGlow(ctx, C.sacGlow, pp.x, pp.y, size * S.sacGlow, 0.55 + h * 0.4);
        ctx.fillStyle = C.sac;
        ctx.beginPath();
        ctx.ellipse(pp.x, pp.y, size, size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Cara na frente do corpo: só quando a frente está virada para a câmera
    const front = project(...onSphere(c, R, 0, 0));
    if (front.depth <= pc.depth) return;
    // Olhos miúdos e amarelos
    ctx.fillStyle = C.eye;
    for (const side of [-1, 1]) {
        const e = onSphere(c, R * 1.01, side * S.eyeSpread, S.eyeHeight);
        if (project(...e).depth <= pc.depth) continue;
        const pe = project(...e);
        ctx.beginPath();
        ctx.arc(pe.x, pe.y, S.eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    // Boca costurada: um corte curvo com pontos atravessados
    const mouth = [];
    for (let j = 0; j <= 8; j++) {
        const lon = -S.mouthWidth + (j / 8) * S.mouthWidth * 2;
        mouth.push(onSphere(c, R * 1.01, lon, S.mouthHeight - 0.08 * Math.cos((j / 8 - 0.5) * Math.PI)));
    }
    limb(mouth, 0.45, C.stitch);
    for (let j = 0; j < S.stitches; j++) {
        const lon = -S.mouthWidth * 0.85 + (j / (S.stitches - 1)) * S.mouthWidth * 1.7;
        const base = S.mouthHeight - 0.08 * Math.cos((lon / (S.mouthWidth * 2)) * Math.PI);
        limb([onSphere(c, R * 1.01, lon, base + 0.1), onSphere(c, R * 1.01, lon, base - 0.1)], 0.3, C.stitch);
    }
}

// --- PERNAS: curtas e grossas, quase escondidas embaixo da barriga ---
function drawLeg(rig, { hip, knee, ankle, toe }) {
    const { C, limb, ball } = rig;
    limb([hip, knee, ankle], S.legWidth + 0.5, C.stitch);
    limb([hip, knee, ankle], S.legWidth, C.skinDark);
    const foot = [ankle[0] + S.footLength, toe[1], Math.max(0.5, toe[2] - 0.3)];
    limb([ankle, foot], S.legWidth * 1.05 + 0.5, C.stitch);
    limb([ankle, foot], S.legWidth * 1.05, C.skinDark);
    ball(knee, S.legWidth * 0.45, C.skin);
}

// --- BRACINHOS: saem dos lados da esfera e balançam com o pulso ---
function armPose(rig, pose, side) {
    const c = bodyCenter(rig, pose);
    const { k, hz } = pulseOf(pose);
    const R = S.bodyRadius * k;
    const swing = Math.sin(pose.t * hz * Math.PI * 2 + side) * 0.6 + Math.sin(rig.anim.stride + (side > 0 ? Math.PI : 0)) * 0.8 * pose.run;
    const shoulder = [c[0] + 0.5, c[1] + side * R * 0.95, S.armHeight];
    const hand = [shoulder[0] + S.armReach + swing, shoulder[1] + side * S.armOut, shoulder[2] - 1.2];
    const held = side > 0 ? pose.sword : pose.free;
    const h2 = held ? mix(hand, held.hand, held.w) : hand;
    return { shoulder, elbow: mix(shoulder, h2, 0.5).map((v, i) => (i === 1 ? v + side * 0.5 : v)), hand: h2 };
}

function drawArm(rig, shoulder, elbow, hand) {
    const { C, limb, ball } = rig;
    limb([shoulder, elbow, hand], S.armWidth + 0.5, C.stitch);
    limb([shoulder, elbow, hand], S.armWidth, C.skinDark);
    ball(hand, S.handRadius + 0.25, C.stitch);
    ball(hand, S.handRadius, C.skin);
}

registerBody('bloater', {
    vis: S,
    // Bacia baixa: as pernas ficam curtas embaixo da barriga
    poseTweak: (pose) => {
        pose.hipZ = S.hipHeight;
        pose.sashZ = S.hipHeight;
        pose.lean *= 0.3;
    },
    drawLeg: (rig, legs) => drawLeg(rig, legs),
    drawTorso: (rig, pose) => drawBody(rig, pose),
    drawBack: () => {},
    freeArm: (rig, pose) => armPose(rig, pose, -1),
    drawArm: (rig, shoulder, elbow, hand) => drawArm(rig, shoulder, elbow, hand),
    swordArmPart: (rig, pose) => {
        const { shoulder, elbow, hand } = armPose(rig, pose, 1);
        return { depth: rig.project(...elbow).depth + 0.1, draw: () => drawArm(rig, shoulder, elbow, hand) };
    },
    drawn: () => 0,
    // Sem cabeça: a cara está no corpo
    headParts: () => []
});

// --- NO JOGO (câmera do Last Torch) ---
export function renderBloater25D(e) {
    renderMonster25D(e, 'bloater', S, {
        before: () => { hurt = 1 - Math.max(0, e.hp / (e.maxHp || e.hp || 1)); }
    });
    hurt = null;
}
