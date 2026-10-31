import { HERO_VISUALS as H } from '../../data_model/visuals/characters/hero_visual.js';
import { HERO_25D_VISUALS as V } from '../../data_model/visuals/characters/hero25d_visual.js';
import { KNIFE_VISUALS } from '../../data_model/visuals/effects/knife_visual.js';
import { ctx, player, powers, state } from '../core/state.js';
import { easeOutCubic, easeOutQuad, lerpAngle } from './fx/easing.js';
import { drawGlow } from './fx/glow.js';
import { drawGearGround, gearParts } from './hero_gear.js';
import { drawDagger } from './knife.js';
import { heroAnim, heroCapeJag as capeJag, heroSwingAngleAt as swingAngleAt } from './player.js';
import { OATH_VISUALS } from '../../data_model/visuals/characters/oath_visual.js';
import { SKILLS_VISUALS } from '../../data_model/visuals/effects/skills_visual.js';
import { getPowerLevel } from '../../data_model/powers.js';
import { getKnifeChargeRatio } from '../systems/knives.js';

// --- HERÓI 2.5D ---
// O mesmo herói de player.js, montado como um boneco 3D simples: pernas, tronco, braços, capuz,
// capa e espada. A câmera olha quase de cima: o chão segue igual ao resto do jogo e a altura do
// corpo "sobe" na tela, mostrando o corpo e o rosto de frente/perfil conforme a direção.
// A animação (velocidade, passada, capa, golpe) vem do mesmo estado de player.js.
// É o herói padrão do jogo (?hero=topdown usa o antigo de player.js). Coordenadas locais: a = frente, b = direita, z = altura.

// Paleta e estado de animação do boneco sendo desenhado: o herói, ou o Shadow Clone
// (renderPlayer25D troca os dois antes de montar as partes)
let C = V.colors;
let anim = heroAnim;
// Forma do Juramento (chave em data_model/visuals/characters/oath_visual.js, ou null) e medidas da espada e do capuz
let gear = null;
let bladeLength = V.bladeLength;
let bladeWidth = V.bladeWidth;

// Direção do herói no quadro atual (atualizada em renderPlayer25D)
let cosF = 1;
let sinF = 0;

// Ponto local (a, b, z) → tela, e a profundidade (maior = mais perto da câmera, desenha por cima)
function project(a, b, z) {
    const gx = a * cosF - b * sinF;
    const gy = a * sinF + b * cosF;
    return { x: gx, y: gy * V.groundSquash - z * V.heightScale, depth: gy + z * V.depthHeightWeight };
}

// Mesmo que project, para direções (sem posição)
function projectVec(a, b, z) {
    return { x: a * cosF - b * sinF, y: (a * sinF + b * cosF) * V.groundSquash - z * V.heightScale };
}

// Disco plano no 3D (centro + dois eixos locais): cria o caminho da elipse projetada
function disk(center, u, v) {
    const c = project(...center);
    const pu = projectVec(...u);
    const pv = projectVec(...v);
    ctx.save();
    ctx.transform(pu.x, pu.y, pv.x, pv.y, c.x, c.y);
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.restore();
}

// Esfera: vira uma elipse um pouco mais alta que larga por causa da inclinação da câmera
function ball(p, radius, color) {
    const s = project(...p);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, radius, radius * Math.hypot(V.groundSquash, V.heightScale), 0, 0, Math.PI * 2);
    ctx.fill();
}

// Membro (perna, braço): linha grossa passando pelas juntas
function limb(points, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((p, i) => {
        const s = project(...p);
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
    });
    ctx.stroke();
}

// Meia-largura na tela de uma seção elíptica (A frente, B lados) virada para a direção atual
function sectionHalfWidth(A, B) {
    return Math.hypot(A * cosF, B * sinF);
}

// --- POSTURAS ---
// Uma postura muda o corpo (crouch, lift, lean...) e pode segurar as mãos num lugar: sword { hand, dir, w } e
// free { hand, w }, onde w é o quanto ela manda (0 a 1) sobre a pose normal.
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// Espada nas duas mãos. phi: 0 = apontada para cima, PI/2 = para a frente, acima disso = para o chão
function twoHanded(stance, phi, w, height = 19) {
    const dir = [Math.sin(phi), 0, Math.cos(phi)];
    const hand = [dir[0] * 6.5 + 1, 0.8, height + dir[2] * 5.2];
    stance.sword = { hand, dir, w };
    stance.free = { hand: [hand[0] - dir[0] * 1.6, hand[1] - 1.4, hand[2] - dir[2] * 1.6], w };
}

function slamStance(stance, k) {
    const M = V.moves.slam;
    if (k < M.crouchEnd) {
        const p = easeOutQuad(k / M.crouchEnd);
        stance.crouch += M.crouch * p;
        twoHanded(stance, -0.7 * p, p);
    } else if (k < M.riseEnd) {
        const p = (k - M.crouchEnd) / (M.riseEnd - M.crouchEnd);
        stance.crouch += M.crouch * (1 - p);
        stance.lift = M.height * easeOutCubic(p);
        twoHanded(stance, -0.7 + 0.2 * p, 1);
    } else if (k < M.impactAt) {
        const p = (k - M.riseEnd) / (M.impactAt - M.riseEnd);
        const fall = p * p;
        stance.lift = M.height * (1 - fall);
        stance.lean += 3 * fall;
        twoHanded(stance, -0.5 + 2.9 * fall, 1);
    } else {
        const p = (k - M.impactAt) / (1 - M.impactAt);
        stance.crouch += M.crouch * (1 - easeOutQuad(p));
        stance.lean += 3 * (1 - p);
        twoHanded(stance, 2.4, k < M.recoverAt ? 1 : 1 - (k - M.recoverAt) / (1 - M.recoverAt), 13);
    }
}

function roarStance(stance, k) {
    const M = V.moves.roar;
    const w = k < 0.18 ? easeOutQuad(k / 0.18) : k > 0.74 ? 1 - easeOutQuad((k - 0.74) / 0.26) : 1;
    stance.lean -= M.leanBack * w;
    stance.rise = 1.3 * w;
    stance.headBack = 1.7 * w;
    stance.sword = { hand: [1.5, M.armReach, 17.5], dir: [0.2, 0.68, 0.7], w };
    stance.free = { hand: [1.5, -M.armReach, 17.5], w };
}

function oathStance(stance, k) {
    const M = V.moves.oath;
    if (k < M.kneelEnd) {
        const p = easeOutQuad(k / M.kneelEnd);
        stance.crouch += M.crouch * p;
        stance.kneel = p;
        twoHanded(stance, 2.9, p, 13);
    } else if (k < M.raiseEnd) {
        const p = easeOutCubic((k - M.kneelEnd) / (M.raiseEnd - M.kneelEnd));
        stance.crouch += M.crouch * (1 - p);
        stance.kneel = 1 - p;
        twoHanded(stance, 2.9 * (1 - p), 1, 13 + 10 * p);
    } else {
        twoHanded(stance, 0, k > 0.86 ? 1 - (k - 0.86) / 0.14 : 1, 23);
    }
}

const STANCES = { slam: slamStance, roar: roarStance, oath: oathStance };

function applyStance(stance, body, blend) {
    if (anim.dash > 0.01) {
        const w = anim.dash;
        stance.lean += V.dashLean * w;
        stance.crouch += V.dashCrouch * w;
        stance.sword = { hand: [-3.5, 6, 11], dir: [-0.92, 0.3, -0.24], w: w * 0.9 };
        stance.free = { hand: [-3.5, -5.5, 11.5], w: w * 0.9 };
    }
    if (anim.vigil > 0.01) {
        const w = anim.vigil * (1 - blend);
        stance.crouch += V.vigilCrouch * w;
        stance.kneel = w;
        if (w > (stance.sword?.w ?? 0)) {
            stance.sword = { hand: [5, 0.8, 8.8], dir: [0.06, 0, -1], w };
            stance.free = { hand: [4.5, -0.7, 9.4], w };
        }
    }
    const move = body.move;
    if (move) STANCES[move.kind](stance, Math.min(1, move.age / move.seconds));
}

// --- POSE DO QUADRO ---
function buildPose(t, body) {
    const run = anim.run;
    // No arremesso o tronco se inclina para a frente, junto com o braço
    const throwK = throwProgress();
    const blend = anim.swingBlend;
    const stance = { crouch: 0, lift: 0, lean: 0, rise: 0, headBack: 0, kneel: 0, sword: null, free: null };
    applyStance(stance, body, blend);
    const lean = V.runLean * run + (throwK >= 0 ? KNIFE_VISUALS.throwLean * Math.sin(Math.PI * throwK) : 0) + stance.lean;
    const breath = Math.sin((t / H.breathPeriodSeconds) * Math.PI * 2) * V.breathAmount * (1 - run);
    return {
        ...stance,
        t,
        run,
        lean,
        hipZ: V.hipHeight - stance.crouch,
        sashZ: V.sashHeight - stance.crouch,
        shoulderZ: V.shoulderHeight + breath - run * 0.8 - stance.crouch + stance.rise,
        headA: 0.8 + lean - stance.headBack,
        headZ: V.headHeight + breath - run * 1.4 - stance.crouch + stance.rise * 1.3,
        blend
    };
}

// --- PARTES (cada uma desenhada na ordem da profundidade) ---
function drawShadow(lift) {
    const size = 1 - lift / (V.moves.slam.height * 1.8);
    ctx.fillStyle = V.shadowColor;
    disk([0, 0, 0], [V.shadowRadiusFront * size, 0, 0], [0, V.shadowRadiusSide * size, 0]);
    ctx.fill();
}

function legPart(pose, side) {
    // Pernas alternadas: a da direita usa a fase oposta da esquerda
    const phase = anim.stride + (side > 0 ? 0 : Math.PI);
    // Ajoelhado: o pé direito vai para a frente e o esquerdo para trás, com o joelho no chão
    const reach = Math.sin(phase) * V.strideLength * (0.2 + pose.run * 0.9) + pose.kneel * (side > 0 ? 3.4 : -5);
    const lift = Math.max(0, Math.cos(phase)) * V.footLift * pose.run;
    const hip = [pose.lean * 0.3, side * V.hipSpread, pose.hipZ];
    const ankle = [reach, side * V.footSpread, V.ankleHeight + lift];
    const kneeZ = (hip[2] + ankle[2]) / 2 + lift * 0.4 + (side > 0 ? pose.kneel * 1.6 : -pose.kneel * 3);
    const knee = [(hip[0] + ankle[0]) / 2 + V.kneeForward + pose.crouch * 0.7, side * (V.hipSpread + V.footSpread) / 2, kneeZ];
    const toe = [reach + V.bootLength, side * V.footSpread, 0.6 + lift];
    return {
        depth: project(...knee).depth,
        draw() {
            limb([hip, knee, ankle], V.legWidth, C.body);
            limb([ankle, toe], V.bootWidth, C.boots);
            // Faixa no cano da bota
            limb([[ankle[0], ankle[1], ankle[2] + 1.2], ankle], V.bootWidth + 0.2, C.sash);
        }
    };
}

function torsoPart(pose) {
    const bottom = { a: pose.lean * 0.3, z: pose.hipZ, ...V.waist };
    const top = { a: pose.lean, z: pose.shoulderZ, ...V.chest };
    return {
        depth: project(pose.lean * 0.6, 0, 13.5).depth,
        draw() {
            const pb = project(bottom.a, 0, bottom.z);
            const pt = project(top.a, 0, top.z);
            const wb = sectionHalfWidth(bottom.A, bottom.B);
            const wt = sectionHalfWidth(top.A, top.B);

            // Quadril, corpo entre quadril e ombros, e o topo dos ombros (mais claro, pega luz de cima)
            ctx.fillStyle = C.body;
            disk([bottom.a, 0, bottom.z], [bottom.A, 0, 0], [0, bottom.B, 0]);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(pb.x - wb, pb.y);
            ctx.lineTo(pt.x - wt, pt.y);
            ctx.lineTo(pt.x + wt, pt.y);
            ctx.lineTo(pb.x + wb, pb.y);
            ctx.closePath();
            ctx.fill();

            // Faixa da cintura: só a metade da frente do anel aparece
            const sash = project(bottom.a, 0, pose.sashZ);
            ctx.save();
            ctx.beginPath();
            ctx.rect(sash.x - 20, sash.y, 40, 20);
            ctx.clip();
            disk([bottom.a, 0, pose.sashZ], [bottom.A * 1.05, 0, 0], [0, bottom.B * 1.05, 0]);
            ctx.strokeStyle = C.sash;
            ctx.lineWidth = 1.3;
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = C.sleeve;
            disk([top.a, 0, top.z], [top.A, 0, 0], [0, top.B, 0]);
            ctx.fill();

            // Tira cruzando o peito e fivela: só quando o peito está virado para a câmera
            const front = Math.max(0, Math.min(1, sinF * 1.5 + 0.4));
            if (front > 0) {
                const base = ctx.globalAlpha;
                ctx.globalAlpha = base * front;
                limb([[top.a + top.A * 0.9, -top.B * 0.65, top.z - 0.6], [bottom.a + bottom.A, bottom.B * 0.6, pose.sashZ + 0.8]], 1.3, C.strap);
                const buckle = project(pose.lean * 0.65 + 2.7, 0, 14);
                ctx.fillStyle = C.buckle;
                ctx.fillRect(buckle.x - 0.6, buckle.y - 0.5, 1.2, 1);
                ctx.globalAlpha = base;
            }
        }
    };
}

function capePart(pose) {
    const t = pose.t;
    const run = pose.run;
    const n = H.capeStrips;
    const lengthBack = V.capeLength + V.capeRunLength * run + Math.max(0, -anim.capeX) * 0.25;
    const hemZ = V.capeHemHeight + V.capeRunLift * run;
    const wave = H.capeWaveIdle + (H.capeWaveRun - H.capeWaveIdle) * run;
    const tailHalf = V.capeTailWidth * (1 - run * 0.2);

    // Presa num arco nas costas dos ombros; a barra rasgada segue o atraso da capa (física de player.js)
    const anchors = [];
    const hem = [];
    for (let i = 0; i <= n; i++) {
        const k = i / n;
        const psi = Math.PI / 2 + k * Math.PI;
        anchors.push([pose.lean + V.chest.A * 1.05 * Math.cos(psi), V.chest.B * 1.08 * Math.sin(psi), V.capeAnchorHeight + (pose.shoulderZ - V.shoulderHeight)]);
        const edge = Math.abs(k - 0.5) * 2;
        const flutter = Math.sin(t * H.capeWaveSpeed + i * 1.3) * wave;
        hem.push([
            pose.lean * 0.3 - 1.5 - lengthBack * capeJag[i] - edge * run * 1.5 - Math.abs(flutter) * 0.5,
            (1 - 2 * k) * tailHalf + anim.capeY * (0.6 + edge * 0.5) + flutter * 0.4,
            Math.max(0.4, hemZ * (0.85 + 0.3 * capeJag[i] - 0.15) + flutter * 0.3)
        ]);
    }

    return {
        depth: project(pose.lean - 3.5, 0, 9).depth,
        draw() {
            // Pontas da faixa da cintura: penduradas paradas, esvoaçam para trás na corrida.
            // Desenhadas antes da capa, que as cobre quando o herói está de costas.
            for (const side of [-1, 1]) {
                const flutter = Math.sin(t * 7 + side) * (1 + run * 1.5);
                limb([
                    [pose.lean * 0.3 - V.waist.A, side * 1.2, pose.sashZ],
                    [pose.lean * 0.3 - V.waist.A - 1 - 3 * run + anim.capeX * 0.2, side * 2 + anim.capeY * 0.3, pose.sashZ - 4 + run * 3 + flutter * 0.5]
                ], 1.3, C.sash);
            }

            ctx.beginPath();
            anchors.forEach((p, i) => {
                const s = project(...p);
                if (i === 0) ctx.moveTo(s.x, s.y);
                else ctx.lineTo(s.x, s.y);
            });
            // Barra rasgada (de volta), com entalhes entre as pontas
            for (let i = n; i >= 0; i--) {
                const p = project(...hem[i]);
                ctx.lineTo(p.x, p.y);
                if (i > 0) {
                    const q = hem[i - 1];
                    const mid = [(hem[i][0] + q[0]) / 2 * 0.85, (hem[i][1] + q[1]) / 2, (hem[i][2] + q[2]) / 2 + 1.2];
                    const m = project(...mid);
                    ctx.lineTo(m.x, m.y);
                }
            }
            ctx.closePath();
            ctx.fillStyle = C.cape;
            ctx.fill();
            ctx.strokeStyle = C.capeEdge;
            ctx.lineWidth = 0.6;
            ctx.stroke();

            // Dobras do ombro até as pontas compridas
            for (let i = 1; i < n; i += 2) {
                limb([anchors[i], [(anchors[i][0] + hem[i][0]) / 2, (anchors[i][1] + hem[i][1]) / 2, (anchors[i][2] + hem[i][2]) / 2], hem[i]], 0.8, C.capeFold);
            }
        }
    };
}

// --- ARREMESSO DA ADAGA (mão esquerda) ---
// Progresso da animação: 0 a 1 durante o arremesso, -1 fora dele
let throwsKnives = true;

function throwProgress() {
    if (!throwsKnives) return -1;
    const k = (performance.now() - state.knifeThrowTime) / 1000 / KNIFE_VISUALS.throwSeconds;
    return k >= 0 && k < 1 ? k : -1;
}

// Mão puxada para trás e acima do ombro: início do arremesso e pose da adaga carregando
function throwBack(pose) {
    return [pose.lean * 0.5 - 2.6, -V.chest.B - 1.6, pose.shoulderZ + 2.2];
}

// Mão esquerda no arremesso: puxa a adaga para trás e acima do ombro, lança para a frente
// (braço estendido na direção do alvo) e volta ao repouso
function throwHand(start, pose, k) {
    const back = throwBack(pose);
    const front = [pose.lean + 6.5, -V.chest.B * 0.35, pose.shoulderZ - 2.5];
    const { windupFraction: w, releaseFraction: r } = KNIFE_VISUALS;
    if (k < w) return mix(start, back, easeOutQuad(k / w));
    if (k < r) return mix(back, front, easeOutCubic((k - w) / (r - w)));
    return mix(front, start, easeOutQuad((k - r) / (1 - r)));
}

// Adaga presa na mão, apontando na direção do antebraço (encurta quando aponta para a câmera)
function drawHeldDagger(shoulder, hand, t) {
    const d = [hand[0] - shoulder[0], hand[1] - shoulder[1], hand[2] - shoulder[2]];
    const len = Math.hypot(...d) || 1;
    const p0 = project(...hand);
    const p1 = project(hand[0] + d[0] / len, hand[1] + d[1] / len, hand[2] + d[2] / len);
    const fore = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    ctx.save();
    ctx.translate(p0.x, p0.y);
    ctx.rotate(Math.atan2(p1.y - p0.y, p1.x - p0.x));
    ctx.scale(KNIFE_VISUALS.handScale * Math.max(0.35, fore), KNIFE_VISUALS.handScale);
    drawDagger(ctx, t);
    ctx.restore();
}

// Arco brilhante do movimento da mão logo antes e depois de soltar a adaga
function drawThrowArc(start, pose, k) {
    const { windupFraction: w, releaseFraction: r } = KNIFE_VISUALS;
    const end = Math.min(k, r);
    const from = Math.max(w, end - 0.2);
    if (end <= from) return;
    const fade = k < r ? 1 : 1 - (k - r) / 0.15;
    if (fade <= 0) return;
    const points = [];
    for (let i = 0; i <= 8; i++) points.push(throwHand(start, pose, from + (end - from) * (i / 8)));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha *= 0.55 * fade;
    limb(points, 1.6, KNIFE_VISUALS.colors.trail);
    ctx.restore();
}

// Braço livre (esquerdo): balança contra a passada; recolhe durante o golpe e arremessa a adaga
function freeArmPart(pose, body) {
    const swing = Math.sin(anim.stride) * V.armSwing * pose.run;
    const shoulder = [pose.lean, -V.chest.B, pose.shoulderZ - 0.5];
    const restHand = [pose.lean * 0.5 + 0.6 + swing * (1 - pose.blend) - pose.blend * 1.2, -V.chest.B - 0.6 + pose.blend * 1.5, V.handHeight - pose.crouch + pose.blend * 2];
    const throwK = throwProgress();
    // Soul Lance: a mão fica para trás com a adaga brilhando enquanto carrega
    const charge = throwsKnives && throwK < 0 ? getKnifeChargeRatio() : 0;
    // Feitiço: a mão sobe à frente do corpo por um instante
    const cast = body.castAge >= 0 && throwK < 0 && charge <= 0 ? Math.sin(Math.PI * body.castAge / V.moves.cast.seconds) : 0;
    let hand = throwK >= 0 ? throwHand(restHand, pose, throwK) : restHand;
    if (charge > 0) hand = mix(hand, throwBack(pose), Math.min(1, charge * 4));
    if (cast > 0) hand = mix(hand, [pose.lean + 5.5, -V.chest.B - 0.5, pose.shoulderZ + 3], cast);
    if (pose.free) hand = mix(hand, pose.free.hand, pose.free.w);
    const elbow = [(shoulder[0] + hand[0]) / 2 - 0.4, -V.chest.B - 1, (shoulder[2] + hand[2]) / 2 + (throwK >= 0 ? 0.8 : 0)];
    return {
        depth: project(...elbow).depth + 0.1,
        draw() {
            if (throwK >= 0) drawThrowArc(restHand, pose, throwK);
            ball(shoulder, V.shoulderRadius, C.sleeve);
            limb([shoulder, elbow, hand], V.armWidth, C.sleeve);
            if ((throwK >= 0 && throwK < KNIFE_VISUALS.letGoFraction) || charge > 0) drawHeldDagger(shoulder, hand, pose.t);
            ball(hand, V.handRadius, C.glove);
            if (charge > 0 || cast > 0) {
                const glow = project(...hand);
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                drawGlow(ctx, charge > 0 ? KNIFE_VISUALS.colors.trail : C.bladeGlowSoft, glow.x, glow.y, charge > 0 ? V.chargeGlow * charge : 8 * cast, 0.85);
                ctx.restore();
            }
        }
    };
}

// Braço da espada (direito): mistura a pose de repouso com a pose do golpe (swingBlend)
function swordArmPose(pose) {
    const restAngle = H.restBladeAngle + Math.sin(anim.stride) * 0.12 * pose.run;
    let swingAngle = restAngle;
    if (anim.swingActive || pose.blend > 0) swingAngle = swingAngleAt(Math.min(anim.swingElapsed, anim.swingSeconds), anim);
    const blend = pose.blend;
    const restHand = [pose.lean * 0.5 + 1.6 + Math.sin(anim.stride + Math.PI) * V.armSwing * 0.4 * pose.run, V.chest.B + 0.8, V.handHeight - pose.crouch];
    const swingHand = [Math.cos(swingAngle) * V.swingRadius, Math.sin(swingAngle) * V.swingRadius, V.swingHeight];
    const hand = restHand.map((v, i) => v + (swingHand[i] - v) * blend);
    const angle = lerpAngle(restAngle, swingAngle, blend);
    const drop = V.restBladeDrop * (1 - blend);
    const len = Math.hypot(1, drop);
    const dir = [Math.cos(angle) / len, Math.sin(angle) / len, -drop / len];
    if (!pose.sword) return { hand, dir };
    const { w } = pose.sword;
    const held = mix(dir, pose.sword.dir, w);
    const size = Math.hypot(...held) || 1;
    return { hand: mix(hand, pose.sword.hand, w), dir: held.map(v => v / size) };
}

function swordArmPart(pose) {
    const { hand } = swordArmPose(pose);
    const shoulder = [pose.lean, V.chest.B, pose.shoulderZ - 0.5];
    const elbow = [(shoulder[0] + hand[0]) / 2 + 0.6, (shoulder[1] + hand[1]) / 2 + 1, (shoulder[2] + hand[2]) / 2];
    return {
        depth: project(...elbow).depth + 0.1,
        draw() {
            ball(shoulder, V.shoulderRadius, C.sleeve);
            limb([shoulder, elbow, hand], V.armWidth, C.sleeve);
            ball(hand, V.handRadius, C.glove);
        }
    };
}

// Lâmina 3D: plana na horizontal, com cabo, guarda, fio brilhante e runas
function bladeShape(hand, dir, t, alpha) {
    const at = (d) => [hand[0] + dir[0] * d, hand[1] + dir[1] * d, hand[2] + dir[2] * d];
    const flat = Math.hypot(dir[0], dir[1]) || 1;
    const w = [-dir[1] / flat * bladeWidth / 2, dir[0] / flat * bladeWidth / 2, 0];
    const side = (p, k) => project(p[0] + w[0] * k, p[1] + w[1] * k, p[2]);
    const base = at(0.8);
    const shoulderPt = at(bladeLength - 3);
    const tip = project(...at(bladeLength));

    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    limb([at(-3), hand], 1.8, C.glove);
    limb([[base[0] - w[0] * 1.8, base[1] - w[1] * 1.8, base[2]], [base[0] + w[0] * 1.8, base[1] + w[1] * 1.8, base[2]]], 1.1, C.buckle);

    const corners = [side(base, -1), side(shoulderPt, -1), tip, side(shoulderPt, 1), side(base, 1)];
    ctx.fillStyle = C.blade;
    ctx.beginPath();
    corners.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();

    limb([at(1.5), at(bladeLength - 2.5)], 0.7, C.bladeCore);

    // Runas que acendem em onda ao longo do gume
    ctx.fillStyle = C.runes;
    for (let i = 0; i < H.runeCount; i++) {
        const p = project(...at(3 + i * ((bladeLength - 7) / (H.runeCount - 1))));
        ctx.globalAlpha = baseAlpha * alpha * (0.35 + 0.65 * Math.max(0, Math.sin(t * 6 - i * 1.2)));
        ctx.fillRect(p.x - 0.6, p.y - 0.5, 1.2, 1);
    }
    ctx.globalAlpha = baseAlpha;
}

function swordPart(pose, frenzy, body) {
    const { hand, dir } = swordArmPose(pose);
    const mid = [hand[0] + dir[0] * bladeLength * 0.5, hand[1] + dir[1] * bladeLength * 0.5, hand[2] + dir[2] * bladeLength * 0.5];
    // Bloodlust: a lâmina fica mais vermelha conforme a fome sobe
    const hungerLevel = body === player ? getPowerLevel(powers.bloodlust) : null;
    const hunger = hungerLevel ? state.bloodlust.stacks / hungerLevel.stacks : 0;
    return {
        depth: project(...mid).depth,
        draw() {
            const t = pose.t;
            // Rastro fantasma do corte: lâminas em instantes anteriores
            if (anim.swingActive && anim.swingElapsed < anim.swingSeconds + 0.05) {
                for (let g = H.ghostCount; g >= 1; g--) {
                    const a = swingAngleAt(anim.swingElapsed - g * H.ghostGapSeconds, anim);
                    const ghostHand = [Math.cos(a) * V.swingRadius, Math.sin(a) * V.swingRadius, V.swingHeight];
                    bladeShape(ghostHand, [Math.cos(a), Math.sin(a), 0], t, 0.5 * (1 - g / (H.ghostCount + 1)) * pose.blend);
                }
            }

            // Brilho pulsante (somado à cena)
            const pulse = 0.5 + 0.5 * Math.sin((t / H.bladePulsePeriodSeconds) * Math.PI * 2);
            const glow = project(...mid);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            drawGlow(ctx, frenzy ? C.bladeGlowSoftFrenzy : C.bladeGlowSoft, glow.x, glow.y,
                (H.bladeGlowMin + (H.bladeGlowMax - H.bladeGlowMin) * pulse) * 0.8 * (1 + pose.blend * 0.7 + (pose.sword?.w ?? 0) * 0.6) * (bladeLength / V.bladeLength),
                0.32 + 0.2 * pulse);
            if (hunger > 0) drawGlow(ctx, SKILLS_VISUALS.bloodlust.blade, glow.x, glow.y, 8 + hunger * 13, 0.3 + hunger * 0.5);
            ctx.restore();

            bladeShape(hand, dir, t, 1);
        }
    };
}

// Capuz (esfera + ponta caindo para trás) e máscara de osso na frente
function headPart(pose) {
    const center = [pose.headA, 0, pose.headZ];
    const R = V.hoodRadius;
    const hoodTip = V.hoodTipLength * (gear ? OATH_VISUALS[gear].hoodTip : 1);
    const hoodRise = gear ? OATH_VISUALS[gear].hoodRise : 0;
    const tipPos = [pose.headA - R - hoodTip + anim.capeX * 0.15, anim.capeY * 0.1, pose.headZ - 0.9 + hoodRise];
    return {
        depth: project(...center).depth,
        draw() {
            const t = pose.t;
            const c = project(...center);
            const ry = R * Math.hypot(V.groundSquash, V.heightScale);
            const tip = project(...tipPos);

            const drawTip = () => {
                const back = Math.atan2(tip.y - c.y, tip.x - c.x);
                ctx.fillStyle = C.hood;
                ctx.beginPath();
                ctx.moveTo(c.x + Math.cos(back + Math.PI / 2) * R * 0.8, c.y + Math.sin(back + Math.PI / 2) * ry * 0.8);
                ctx.lineTo(tip.x, tip.y);
                ctx.lineTo(c.x + Math.cos(back - Math.PI / 2) * R * 0.8, c.y + Math.sin(back - Math.PI / 2) * ry * 0.8);
                ctx.closePath();
                ctx.fill();
            };
            const tipInFront = tip.depth > c.depth;
            if (!tipInFront) drawTip();

            ctx.fillStyle = C.hood;
            ctx.beginPath();
            ctx.ellipse(c.x, c.y, R, ry, 0, 0, Math.PI * 2);
            ctx.fill();
            // Topo do capuz pegando luz de cima
            ctx.fillStyle = C.hoodFold;
            ctx.beginPath();
            ctx.ellipse(c.x, c.y - ry * 0.3, R * 0.62, ry * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();

            if (tipInFront) drawTip();

            // Rosto: some quando o herói está de costas para a câmera
            const vis = Math.max(0, Math.min(1, (sinF + 0.45) / 0.5));
            if (vis <= 0) return;
            const baseAlpha = ctx.globalAlpha;
            ctx.globalAlpha = baseAlpha * vis;

            // Abertura escura do capuz (presa dentro da esfera)
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(c.x, c.y, R, ry, 0, 0, Math.PI * 2);
            ctx.clip();
            disk([pose.headA + R * 0.62, 0, pose.headZ - 0.4], [0, R * 0.62, 0], [0, 0, R * 0.72]);
            ctx.fillStyle = C.hoodInner;
            ctx.fill();
            ctx.restore();

            // Máscara: um "ovo" fino na frente do rosto (de frente fica larga; de perfil, estreita)
            const mc = [pose.headA + V.maskForward, 0, pose.headZ + V.maskHeightOffset];
            const m = project(...mc);
            const mw = sectionHalfWidth(V.maskDepth, V.maskWidth);
            const mh = V.maskHeight * V.heightScale + 0.5;
            ctx.fillStyle = C.mask;
            ctx.beginPath();
            ctx.ellipse(m.x, m.y, mw, mh, 0, 0, Math.PI * 2);
            ctx.fill();
            // Lado da máscara que fica na sombra do capuz
            const back = projectVec(-1, 0, 0);
            ctx.fillStyle = C.maskShade;
            ctx.beginPath();
            ctx.ellipse(m.x + back.x * 0.5, m.y + back.y * 0.5, mw * 0.55, mh * 0.85, 0, 0, Math.PI * 2);
            ctx.fill();

            // Olhos vazados (o do lado de lá some no perfil) e brilho frio pulsando
            for (const side of [-1, 1]) {
                const e = project(mc[0] + V.maskDepth * 0.7, side * 0.9, mc[2] + 0.5);
                if (e.depth < m.depth - 0.3) continue;
                const ex = 0.25 + 0.5 * Math.abs(sinF);
                ctx.fillStyle = C.maskEyes;
                ctx.beginPath();
                ctx.ellipse(e.x, e.y, ex, 0.55, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = baseAlpha * vis * (0.35 + 0.3 * Math.sin(t * 3));
                ctx.fillStyle = C.eyeGlint;
                ctx.fillRect(e.x - ex * 0.5, e.y - 0.35, ex, 0.4);
                ctx.globalAlpha = baseAlpha * vis;
            }
            ctx.globalAlpha = baseAlpha;
        }
    };
}

// Ferramentas do boneco para o equipamento dos Juramentos (js/render/hero_gear.js)
const rig = {
    project, limb, ball, disk,
    get anim() { return anim; }
};

// body: herói (padrão) ou Shadow Clone, com o seu estado de animação e a sua paleta.
// oathGear: forma do Juramento (colors já vem com a paleta dele)
export function renderPlayer25D(body = player, bodyAnim = heroAnim, colors = V.colors, oathGear = null) {
    anim = bodyAnim;
    throwsKnives = bodyAnim.throwsKnives !== false;
    C = colors;
    gear = oathGear;
    bladeLength = V.bladeLength * (gear ? OATH_VISUALS[gear].bladeLength : 1);
    bladeWidth = V.bladeWidth * (gear ? OATH_VISUALS[gear].bladeWidth : 1);
    const t = performance.now() / 1000;
    const frenzy = state.frenzyActiveTimer > 0;
    cosF = Math.cos(anim.facing);
    sinF = Math.sin(anim.facing);

    // Dano: mesmo empurrão do herói top-down (data_model/visuals/characters/hero_visual.js)
    const K = H.knockback;
    const hitP = (performance.now() - body.hitTime) / 1000 / K.seconds;
    let push = 0;
    if (hitP >= 0 && hitP < 1) {
        push = hitP < K.peakAt
            ? easeOutCubic(hitP / K.peakAt)
            : 1 - easeOutQuad((hitP - K.peakAt) / (1 - K.peakAt));
    }
    const ringP = (performance.now() - body.hitTime) / 1000 / K.ringSeconds;
    if (ringP >= 0 && ringP < 1) {
        ctx.save();
        ctx.globalAlpha = (1 - ringP) * 0.7;
        ctx.strokeStyle = C.hurtRing;
        ctx.lineWidth = 2.5 * (1 - ringP) + 0.5;
        ctx.beginPath();
        ctx.arc(body.x, body.y, K.ringStartRadius + (K.ringEndRadius - K.ringStartRadius) * easeOutCubic(ringP), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    // No ar e na transformação ele também é invulnerável, mas ali o golpe é que precisa aparecer
    const pulse = body.iFrames > 0 && !body.move
        ? H.invulnerableAlphaMin + (1 - H.invulnerableAlphaMin) * (0.5 + 0.5 * Math.sin(performance.now() / H.invulnerablePulseMs))
        : 1;

    ctx.save();
    ctx.globalAlpha *= pulse;
    ctx.translate(body.x + body.hitDirX * K.distance * push, body.y + body.hitDirY * K.distance * push);
    ctx.scale(V.scale, V.scale);

    const pose = buildPose(t, body);
    drawGearGround(gear, pose, rig);
    drawShadow(pose.lift);
    ctx.translate(0, -pose.lift * V.heightScale);
    const parts = [
        capePart(pose),
        legPart(pose, -1),
        legPart(pose, 1),
        torsoPart(pose),
        freeArmPart(pose, body),
        swordArmPart(pose),
        swordPart(pose, frenzy, body),
        headPart(pose),
        ...gearParts(gear, pose, rig)
    ];
    parts.sort((p, q) => p.depth - q.depth).forEach(p => p.draw());

    ctx.restore();
}
