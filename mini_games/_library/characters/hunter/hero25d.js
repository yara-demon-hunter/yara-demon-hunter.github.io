import { HERO_VISUALS as H } from './hero_visual.js';
import { HERO_25D_VISUALS as V } from './hero25d_visual.js';
import { BODIES } from './body_registry.js';
import { capeJag, swingAngleAt } from './hero_anim.js';
import { heroHooks as hooks } from './hero_hooks.js';
import { ctx } from '../../core/canvas.js';
import { easeOutCubic, easeOutQuad, lerpAngle } from '../../core/easing.js';
import { drawGlow } from '../../core/glow.js';
import { drawHand } from './kit25d.js';

export { setHeroHooks } from './hero_hooks.js';

// --- BONECO 2.5D (Demon Hunter e os heróis que partem dele) ---
// O herói montado como um boneco 3D simples: pernas, tronco, braços, capuz, capa e espada. A câmera olha quase de
// cima: o chão segue igual ao resto do jogo e a altura do corpo "sobe" na tela, mostrando o corpo e o rosto de
// frente/perfil conforme a direção. Coordenadas locais: a = frente, b = direita, z = altura.
// O desenho padrão é o Demon Hunter. Outros heróis (Azael, Brutos...) se registram em body_registry.js e trocam as
// peças que quiserem. A animação (velocidade, passada, capa, golpe) vem de hero_anim.js; as regras do jogo que
// mudam o desenho (arremesso, efeitos na lâmina, equipamento) entram pelos ganchos de hero_hooks.js.

// Paleta e estado de animação do boneco sendo desenhado: o herói, ou o Shadow Clone
// (renderPlayer25D troca os dois antes de montar as partes)
let C = V.colors;
let anim = null;
// Equipamento extra (chave do jogo, ou null; a forma vem de hooks.gearShape) e medidas da espada
let gear = null;
let bladeLength = V.bladeLength;
let bladeWidth = V.bladeWidth;
// Boneco registrado do herói atual (body_registry.js; Azael, ...). null = Demon Hunter
let B = null;

// Escolhe o boneco do modelo ('hunter' não tem registro) e as medidas da lâmina dele
function selectBody(model) {
    B = BODIES[model] || null;
    const shape = gear ? hooks.gearShape(gear) : null;
    bladeLength = (B ? B.vis.bladeLength : V.bladeLength) * (shape ? shape.bladeLength : 1);
    bladeWidth = (B ? B.vis.bladeWidth : V.bladeWidth) * (shape ? shape.bladeWidth : 1);
}

// Direção do herói no quadro atual (atualizada em renderHero25D)
let cosF = 1;
let sinF = 0;

// Câmera do quadro: quanto 1 unidade de altura sobe na tela (HS), o achatamento do chão (GS) e o peso da altura na
// ordem de desenho (DW). Padrão: a de hero25d_visual.js (Last Torch); um jogo com outra câmera passa a sua em view.camera
let HS = V.heightScale;
let GS = V.groundSquash;
let DW = V.depthHeightWeight;
// Golpes especiais: os de hero25d_visual.js, ou os de view.moves (um jogo pode ajustar altura e tempos à sua câmera)
let MOVES = V.moves;

// Ponto local (a, b, z) → tela, e a profundidade (maior = mais perto da câmera, desenha por cima)
function project(a, b, z) {
    const gx = a * cosF - b * sinF;
    const gy = a * sinF + b * cosF;
    return { x: gx, y: gy * GS - z * HS, depth: gy + z * DW };
}

// Mesmo que project, para direções (sem posição)
function projectVec(a, b, z) {
    return { x: a * cosF - b * sinF, y: (a * sinF + b * cosF) * GS - z * HS };
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
    ctx.ellipse(s.x, s.y, radius, radius * Math.hypot(GS, HS), 0, 0, Math.PI * 2);
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
const add3 = (p, q) => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
const norm3 = (v) => {
    const l = Math.hypot(...v) || 1;
    return v.map(x => x / l);
};
const clamp01 = (v) => Math.max(0, Math.min(1, v));
// Entra em [0, inEnd], segura e sai a partir de outStart
const hold = (k, inEnd, outStart) => (k < inEnd ? easeOutQuad(k / inEnd) : k > outStart ? 1 - easeOutQuad((k - outStart) / (1 - outStart)) : 1);

// Espada nas duas mãos. phi: 0 = apontada para cima, PI/2 = para a frente, acima disso = para o chão
function twoHanded(stance, phi, w, height = 19) {
    const dir = [Math.sin(phi), 0, Math.cos(phi)];
    const hand = [dir[0] * 6.5 + 1, 0.8, height + dir[2] * 5.2];
    stance.sword = { hand, dir, w };
    stance.free = { hand: [hand[0] - dir[0] * 1.6, hand[1] - 1.4, hand[2] - dir[2] * 1.6], w };
}

function slamStance(stance, k) {
    const M = MOVES.slam;
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

// Axe Quake (Captain Brutos): ergue o machado acima da cabeça com as duas mãos, o corpo se inclina para trás, e desce no
// chão. Sem salto: ele é pesado e fica plantado.
function quakeStance(stance, k) {
    const M = MOVES.quake;
    if (k < M.raiseEnd) {
        const p = easeOutQuad(k / M.raiseEnd);
        stance.lean -= 1.6 * p;
        stance.crouch += M.crouch * 0.3 * p;
        twoHanded(stance, -0.25 * p, p, 19 + 3 * p);
    } else if (k < M.impactAt) {
        const p = (k - M.raiseEnd) / (M.impactAt - M.raiseEnd);
        const fall = p * p;
        stance.lean += -1.6 + 4.6 * fall;
        stance.crouch += M.crouch * (0.3 + 0.7 * fall);
        twoHanded(stance, -0.25 + 2.65 * fall, 1, 22 - 8 * fall);
    } else {
        const p = (k - M.impactAt) / (1 - M.impactAt);
        stance.lean += 3 * (1 - p);
        stance.crouch += M.crouch * (1 - easeOutQuad(p));
        twoHanded(stance, 2.4, k < M.recoverAt ? 1 : 1 - (k - M.recoverAt) / (1 - M.recoverAt), 14);
    }
}

function roarStance(stance, k) {
    const M = MOVES.roar;
    const w = k < 0.18 ? easeOutQuad(k / 0.18) : k > 0.74 ? 1 - easeOutQuad((k - 0.74) / 0.26) : 1;
    stance.lean -= M.leanBack * w;
    stance.rise = 1.3 * w;
    stance.headBack = 1.7 * w;
    stance.sword = { hand: [1.5, M.armReach, 17.5], dir: [0.2, 0.68, 0.7], w };
    stance.free = { hand: [1.5, -M.armReach, 17.5], w };
}

function oathStance(stance, k) {
    const M = MOVES.oath;
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

// Aparo: espada atravessada na frente do corpo, inclinada para cima, com a mão livre apoiando a lâmina
const GUARD_DIR = norm3([0.25, -0.75, 0.62]);
function guardStance(stance, k) {
    const M = MOVES.guard;
    const w = hold(k, 0.15, 0.8);
    stance.crouch += M.crouch * w;
    stance.lean -= 0.8 * w;
    stance.sword = { hand: [4.2, 2.6, 13.2], dir: GUARD_DIR, w };
    stance.free = { hand: [5.4, -1.2, 16.4], w: w * 0.9 };
}

// Poção: a mão livre leva o frasco à boca e a cabeça vai para trás
function drinkStance(stance, k) {
    const lift = hold(k, 0.25, 0.75);
    const sip = k > 0.25 && k < 0.75 ? 1 : 0;
    stance.flask = Math.min(1, k * 8, (1 - k) * 8);
    stance.headBack = 1.1 * lift * (0.6 + 0.4 * sip);
    stance.lean -= 0.8 * lift;
    stance.free = { hand: [3.4, -0.9, 18.6], w: lift };
}

// Derrota: ajoelha, tomba para trás e fica
function fallStance(stance, k) {
    const M = MOVES.fall;
    const p = easeOutQuad(Math.min(1, k / 0.45));
    const sag = easeOutCubic(clamp01((k - 0.35) / 0.65));
    stance.crouch += M.crouch * p;
    stance.kneel = p;
    stance.lean -= 2.5 * p + 1.5 * sag;
    stance.headBack = 1.2 * p + 1.4 * sag;
    if (!B?.sheathed) stance.sword = { hand: [5, 0.8, 8.8 - sag * 2], dir: [0.06, 0, -1], w: p };
    stance.free = { hand: [2, -4.6, 5 - sag * 2], w: p };
}

const STANCES = { slam: slamStance, quake: quakeStance, roar: roarStance, oath: oathStance, guard: guardStance, drink: drinkStance, fall: fallStance };

function applyStance(stance, body, blend) {
    if (anim.dash > 0.01) {
        const w = anim.dash;
        stance.lean += V.dashLean * w;
        stance.crouch += V.dashCrouch * w;
        // Quem guarda a arma (sheathed, ex.: Azael) avança com ela na bainha e a mão no cabo
        if (!B?.sheathed) stance.sword = { hand: [-3.5, 6, 11], dir: [-0.92, 0.3, -0.24], w: w * 0.9 };
        stance.free = { hand: [-3.5, -5.5, 11.5], w: w * 0.9 };
    }
    if (anim.vigil > 0.01) {
        const w = anim.vigil * (1 - blend);
        stance.crouch += V.vigilCrouch * w;
        stance.kneel = w;
        // Quem guarda a arma descansa com a mão livre onde o boneco manda (vigilFreeHand); o Caçador finca a espada à frente
        if (B?.vigilFreeHand) stance.free = { hand: B.vigilFreeHand, w };
        else if (w > (stance.sword?.w ?? 0)) {
            stance.sword = { hand: [5, 0.8, 8.8], dir: [0.06, 0, -1], w };
            stance.free = { hand: [4.5, -0.7, 9.4], w };
        }
    }
    const move = body.move;
    if (move && STANCES[move.kind]) STANCES[move.kind](stance, Math.min(1, move.age / move.seconds));
}

// --- POSE DO QUADRO ---
function buildPose(t, body) {
    const run = anim.run;
    // No arremesso o tronco se inclina para a frente, junto com o braço
    const throwK = throwProgress();
    const blend = anim.swingBlend;
    const stance = { crouch: 0, lift: 0, lean: 0, rise: 0, headBack: 0, kneel: 0, flask: 0, sword: null, free: null };
    applyStance(stance, body, blend);
    const lean = V.runLean * run + (throwK >= 0 ? hooks.throwVisual.throwLean * Math.sin(Math.PI * throwK) : 0) + stance.lean;
    const breath = Math.sin((t / H.breathPeriodSeconds) * Math.PI * 2) * V.breathAmount * (1 - run);
    // Alguns bonecos sobem e descem no ritmo da corrida (runBob)
    const bob = B?.runBob ? B.runBob(anim, run) : 0;
    const pose = {
        ...stance,
        t,
        run,
        lean,
        hipZ: V.hipHeight - stance.crouch + bob,
        sashZ: V.sashHeight - stance.crouch + bob,
        shoulderZ: V.shoulderHeight + breath - run * 0.8 - stance.crouch + stance.rise + bob,
        headA: 0.8 + lean - stance.headBack,
        headZ: V.headHeight + breath - run * 1.4 - stance.crouch + stance.rise * 1.3 + bob,
        blend
    };
    // Bonecos com outra postura (ex.: o esqueleto que rasteja) ajustam a pose pronta
    if (B?.poseTweak) B.poseTweak(pose, anim);
    return pose;
}

// --- PARTES (cada uma desenhada na ordem da profundidade) ---
function drawShadow(lift) {
    const size = 1 - lift / (MOVES.slam.height * 1.8);
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
            if (B?.drawLeg) {
                B.drawLeg(rig, { hip, knee, ankle, toe, reach, side, lift });
                return;
            }
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
            if (B?.drawTorso) {
                B.drawTorso(rig, pose, bottom, top, wb, wt);
                return;
            }

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

// Pontas da faixa da cintura: penduradas paradas, esvoaçam para trás na corrida.
// Desenhadas antes da capa, que as cobre quando o herói está de costas.
function sashEnds(pose) {
    const run = pose.run;
    for (const side of [-1, 1]) {
        const flutter = Math.sin(pose.t * 7 + side) * (1 + run * 1.5);
        limb([
            [pose.lean * 0.3 - V.waist.A, side * 1.2, pose.sashZ],
            [pose.lean * 0.3 - V.waist.A - 1 - 3 * run + anim.capeX * 0.2, side * 2 + anim.capeY * 0.3, pose.sashZ - 4 + run * 3 + flutter * 0.5]
        ], 1.3, C.sash);
    }
}

// Capa padrão: presa nos ombros, barra rasgada e dobras (cores C.cape*). Bonecos com drawBack podem chamá-la por rig.drawCapeShape.
// thickness (opcional): espessura do pano, uma borda escura (C.capeInner) em volta da capa inteira; 0 = pano fino
function drawCapeShape(anchors, hem, { thickness = 0 } = {}) {
    const n = H.capeStrips;
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
    if (thickness > 0) {
        ctx.strokeStyle = C.capeInner ?? C.capeEdge;
        ctx.lineWidth = 0.6 + thickness * 2;
        ctx.lineJoin = 'round';
        ctx.stroke();
    }
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

function capePart(pose) {
    const t = pose.t;
    const run = pose.run;
    const n = H.capeStrips;
    const lengthBack = V.capeLength + V.capeRunLength * run + Math.max(0, -anim.capeX) * 0.25;
    const hemZ = V.capeHemHeight + V.capeRunLift * run;
    const wave = H.capeWaveIdle + (H.capeWaveRun - H.capeWaveIdle) * run;
    const tailHalf = V.capeTailWidth * (1 - run * 0.2);

    // Presa num arco nas costas dos ombros; a barra rasgada segue o atraso da capa (física de hero_anim.js)
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

    const depth = project(pose.lean - 3.5, 0, 9).depth;
    return {
        // backDepth: o boneco pode mudar a ordem de desenho das costas (ex.: capa por cima do tronco, vista de costas)
        depth: B?.backDepth ? B.backDepth(rig, pose, depth) : depth,
        draw() {
            // Quem tem as costas próprias (drawBack) desenha no lugar da capa
            if (B?.drawBack) {
                B.drawBack(rig, pose, anchors, hem);
                return;
            }
            sashEnds(pose);
            drawCapeShape(anchors, hem);
        }
    };
}

// --- ARREMESSO (mão esquerda) ---
// Progresso da animação: 0 a 1 durante o arremesso, -1 fora dele (o jogo informa: hooks.throwProgress)
let throwsKnives = true;

function throwProgress() {
    if (!throwsKnives) return -1;
    return hooks.throwProgress();
}

// Mão puxada para trás e acima do ombro: início do arremesso e pose da carga
function throwBack(pose) {
    return [pose.lean * 0.5 - 2.6, -V.chest.B - 1.6, pose.shoulderZ + 2.2];
}

// Mão esquerda no arremesso: puxa a adaga para trás e acima do ombro, lança para a frente
// (braço estendido na direção do alvo) e volta ao repouso
function throwHand(start, pose, k) {
    const back = throwBack(pose);
    const front = [pose.lean + 6.5, -V.chest.B * 0.35, pose.shoulderZ - 2.5];
    const { windupFraction: w, releaseFraction: r } = hooks.throwVisual;
    if (k < w) return mix(start, back, easeOutQuad(k / w));
    if (k < r) return mix(back, front, easeOutCubic((k - w) / (r - w)));
    return mix(front, start, easeOutQuad((k - r) / (1 - r)));
}

// Arco brilhante do movimento da mão logo antes e depois de soltar a adaga
function drawThrowArc(start, pose, k) {
    const { windupFraction: w, releaseFraction: r } = hooks.throwVisual;
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
    limb(points, 1.6, hooks.throwVisual.colors.trail);
    ctx.restore();
}

// Braços parados de quem tem idleArms (Yara, Zeph): não ficam travados. Respiram junto com o corpo, balançam devagar
// (cada um no seu ritmo) e ficam um pouco abertos e dobrados. Some ao correr e durante golpes e posturas.
const NO_IDLE = { hand: [0, 0, 0], elbow: [0, 0, 0], shoulder: [0, 0, 0], angle: 0 };
function idleArms(pose, side) {
    if (!B?.idleArms) return NO_IDLE;
    const idle = (1 - pose.run) * (1 - pose.blend) * (1 - (pose.sword?.w ?? 0));
    const t = pose.t;
    const ph = side > 0 ? 0 : 2.1;
    return {
        hand: [
            (Math.sin(t * 1.7 + ph) * 0.6 + (side > 0 ? 1.6 : 0.8)) * idle,
            side * (1.3 + Math.sin(t * 1.1 + ph) * 0.35) * idle,
            (Math.sin(t * 2.1 + ph + 0.8) * 0.5 + (side > 0 ? 2.4 : 1.6)) * idle
        ],
        elbow: [-1 * idle, side * (1.5 + Math.sin(t * 1.1 + ph) * 0.25) * idle, 0.2 * idle],
        // Ombro: o direito (da espada) rola para a frente e para trás e sobe e desce com a respiração; o esquerdo mexe menos
        shoulder: [
            Math.sin(t * 1.7 + ph) * (side > 0 ? 0.55 : 0.2) * idle,
            side * Math.sin(t * 1.7 + ph + 1.2) * (side > 0 ? 0.25 : 0.1) * idle,
            Math.sin(t * 1.7 + ph + 0.6) * (side > 0 ? 0.6 : 0.2) * idle
        ],
        angle: (Math.sin(t * 1.3) * 0.2 - 0.55) * idle
    };
}

// Frasco de poção vermelho na mão (postura drink)
function drawFlask(hand, alpha) {
    const p = project(hand[0] + 0.3, hand[1], hand[2] + 1.2);
    const base = ctx.globalAlpha;
    ctx.globalAlpha = base * alpha;
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 1.25, 1.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(p.x - 0.2, p.y + 0.15, 0.95, 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fecaca';
    ctx.fillRect(p.x - 0.65, p.y - 0.55, 0.35, 0.5);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(p.x - 0.4, p.y - 2.3, 0.8, 0.9);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, 'rgba(248, 113, 113, 0.7)', p.x, p.y, 3.2, 0.5);
    ctx.restore();
    ctx.globalAlpha = base;
}

// Braço livre (esquerdo): balança contra a passada; recolhe durante o golpe e faz o gesto de arremesso.
// armTweak (Oskar): o boneco ajusta ombro, cotovelo e mão sem montar o braço inteiro
function freeArmPart(pose, body) {
    const tw = B?.armTweak?.(rig, -1, pose) ?? {};
    const ia = idleArms(pose, -1);
    const swing = Math.sin(anim.stride) * V.armSwing * pose.run;
    let shoulder = add3([pose.lean, -V.chest.B, pose.shoulderZ - 0.5], ia.shoulder);
    if (tw.shoulderOffset) shoulder = add3(shoulder, tw.shoulderOffset);
    const restHand = add3([pose.lean * 0.5 + 0.6 + swing * (1 - pose.blend) - pose.blend * 1.2, -V.chest.B - 0.6 + pose.blend * 1.5, V.handHeight - pose.crouch + pose.blend * 2], ia.hand);
    const throwK = throwProgress();
    // Carga (no Last Torch, Charged Dagger Throw): a mão fica para trás brilhando enquanto carrega
    const charge = throwsKnives && throwK < 0 ? hooks.chargeRatio() : 0;
    // Feitiço: a mão sobe à frente do corpo por um instante
    const cast = body.castAge >= 0 && throwK < 0 && charge <= 0 ? Math.sin(Math.PI * body.castAge / V.moves.cast.seconds) : 0;
    // Bola de fogo crescendo na mão (no Last Torch, Fireballs): a mão recua, como na do Lorde Demônio
    const fireHold = throwsKnives && throwK < 0 ? hooks.fireHoldRatio() : 0;
    let hand = throwK >= 0 ? throwHand(restHand, pose, throwK) : restHand;
    if (charge > 0 || fireHold > 0) hand = mix(hand, throwBack(pose), Math.min(1, Math.max(charge, fireHold) * 4));
    if (cast > 0) hand = mix(hand, [pose.lean + 5.5, -V.chest.B - 0.5, pose.shoulderZ + 3], cast);
    if (pose.free) hand = mix(hand, pose.free.hand, pose.free.w);
    if (tw.hand) hand = tw.hand(hand);
    // Bonecos com braço livre próprio (freeArm, ex.: Azael, que ataca com a mão esquerda e deixa este braço na bainha)
    // recebem a mão que o jogo quer (arremesso, feitiço, poção) e devolvem ombro, mão e cotovelo
    let elbow;
    if (B?.freeArm) {
        ({ shoulder, hand, elbow } = B.freeArm(rig, pose, { hand, throwK, charge, fireHold, cast }));
    } else {
        elbow = add3([(shoulder[0] + hand[0]) / 2 - 0.4, -V.chest.B - 1, (shoulder[2] + hand[2]) / 2 + (throwK >= 0 ? 0.8 : 0)], ia.elbow);
        if (tw.elbowOffset) elbow = add3(elbow, tw.elbowOffset);
    }
    const armDepth = project(...elbow).depth + 0.1;
    return {
        depth: armDepth,
        draw() {
            if (throwK >= 0 && !B?.drawArm) drawThrowArc(restHand, pose, throwK);
            if (B?.drawArm) B.drawArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
            else {
                ball(shoulder, V.shoulderRadius, C.sleeve);
                limb([shoulder, elbow, hand], V.armWidth, C.sleeve);
            }
            // O que a mão segura até soltar (o jogo desenha: adaga, bola de fogo...)
            if (hooks.drawHeldItem && ((throwK >= 0 && throwK < hooks.throwVisual.letGoFraction) || charge > 0 || fireHold > 0)) {
                hooks.drawHeldItem(rig, { shoulder, hand, pose, charge, fireHold });
            }
            // Mão livre: bola com o risco dos dedos (mais marcado ao segurar a adaga, carregar ou lançar)
            if (!B?.drawArm) drawHand(rig, elbow, hand, -1, { color: C.glove, shade: C.sleeve, outline: null, size: V.handRadius * V.handScale, grip: throwK >= 0 || charge > 0 || fireHold > 0 ? 1 : 0 });
            if (charge > 0 || cast > 0) {
                const glow = project(...hand);
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                drawGlow(ctx, charge > 0 ? hooks.throwVisual.colors.trail : C.bladeGlowSoft, glow.x, glow.y, charge > 0 ? V.chargeGlow * charge : 8 * cast, 0.85);
                ctx.restore();
            }
            if (pose.flask > 0) drawFlask(hand, pose.flask);
        }
    };
}

// Braço da espada (direito): mistura a pose de repouso com a pose do golpe (swingBlend)
function swordArmPose(pose) {
    const ia = idleArms(pose, 1);
    const restAngle = H.restBladeAngle + Math.sin(anim.stride) * 0.12 * pose.run + ia.angle;
    let swingAngle = restAngle;
    if (anim.swingActive || pose.blend > 0) swingAngle = swingAngleAt(Math.min(anim.swingElapsed, anim.swingSeconds), anim);
    const blend = pose.blend;
    const restHand = add3([pose.lean * 0.5 + 1.6 + Math.sin(anim.stride + Math.PI) * V.armSwing * 0.4 * pose.run, V.chest.B + 0.8, V.handHeight - pose.crouch], ia.hand);
    const swingHand = [Math.cos(swingAngle) * V.swingRadius, Math.sin(swingAngle) * V.swingRadius, V.swingHeight];
    const hand = restHand.map((v, i) => v + (swingHand[i] - v) * blend);
    const angle = lerpAngle(restAngle, swingAngle, blend);
    const drop = V.restBladeDrop * (1 - blend);
    const len = Math.hypot(1, drop);
    const dir = [Math.cos(angle) / len, Math.sin(angle) / len, -drop / len];
    // Bonecos com a arma própria em repouso (swordRest: Azael, Brutos) mudam mão e direção a partir da pose normal;
    // no golpe (blend = 1) voltam à varredura. armHand: a mão que segura a arma, se não for a padrão
    if (B?.swordRest) {
        const rest = B.swordRest(rig, pose, { hand, dir, swingAngle, blend });
        const held = holdSword(pose, rest);
        if (rest.armHand) held.armHand = rest.armHand;
        return held;
    }
    return holdSword(pose, { hand, dir });
}

// Postura segurando a espada num lugar (golpes especiais, dash, Vigil)
function holdSword(pose, { hand, dir }) {
    if (!pose.sword) return { hand, dir };
    const { w } = pose.sword;
    const held = mix(dir, pose.sword.dir, w);
    const size = Math.hypot(...held) || 1;
    return { hand: mix(hand, pose.sword.hand, w), dir: held.map(v => v / size) };
}

function swordArmPart(pose) {
    if (B?.swordArmPart) return B.swordArmPart(rig, pose);
    const tw = B?.armTweak?.(rig, 1, pose) ?? {};
    const ia = idleArms(pose, 1);
    const { hand } = swordArmPose(pose);
    let shoulder = add3([pose.lean, V.chest.B, pose.shoulderZ - 0.5], ia.shoulder);
    if (tw.shoulderOffset) shoulder = add3(shoulder, tw.shoulderOffset);
    let elbow = add3([(shoulder[0] + hand[0]) / 2 + 0.6, (shoulder[1] + hand[1]) / 2 + 1, (shoulder[2] + hand[2]) / 2], ia.elbow);
    if (tw.elbowOffset) elbow = add3(elbow, tw.elbowOffset);
    return {
        depth: project(...elbow).depth + 0.1,
        draw() {
            // Quem desenha o braço livre (drawArm) desenha este também, se não tiver o braço da espada próprio
            if (B?.drawArm) {
                B.drawArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
                return;
            }
            ball(shoulder, V.shoulderRadius, C.sleeve);
            limb([shoulder, elbow, hand], V.armWidth, C.sleeve);
            // Mão da espada: bola com o risco dos dedos
            drawHand(rig, elbow, hand, 1, { color: C.glove, shade: C.sleeve, outline: null, size: V.handRadius * V.handScale, grip: 1 });
        }
    };
}

// Lâmina 3D: plana na horizontal, com cabo, guarda, fio brilhante e runas
function bladeShape(hand, dir, t, alpha) {
    if (B?.drawBlade) {
        B.drawBlade(rig, hand, dir, alpha);
        return;
    }
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
    const drawn = B?.drawn ? B.drawn(pose) : 1;
    return {
        depth: project(...mid).depth,
        draw() {
            if (drawn <= 0) return;
            ctx.save();
            ctx.globalAlpha *= drawn;
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
                (H.bladeGlowMin + (H.bladeGlowMax - H.bladeGlowMin) * pulse) * 0.8 * (1 + pose.blend * 0.7 + (pose.sword?.w ?? 0) * 0.6) * (B ? B.vis.glowScale : bladeLength / V.bladeLength) * (frenzy ? frenzyGlow : 1),
                0.32 + 0.2 * pulse);
            // Brilho a mais do jogo (no Last Torch, a fome do Bloodlust)
            if (hooks.drawBladeAura) hooks.drawBladeAura(rig, body, glow.x, glow.y);
            ctx.restore();

            bladeShape(hand, dir, t, 1);
            // Por cima da lâmina (no Last Torch, o fogo da Flaming Sword)
            if (hooks.drawBladeExtras) hooks.drawBladeExtras(rig, body, hand, dir, t);
            ctx.restore();
        }
    };
}

// Espada de perfil, com a mão na origem e a ponta em +x (prévias de arma). Desenha com a mesma bladeShape do boneco;
// quem chama posiciona e amplia com ctx.translate e ctx.scale. extras(rig, hand, dir, t): desenha por cima (fogo...)
export function renderSwordDetail({ colors = V.colors, oathGear = null, frenzy = false, extras = null }) {
    C = colors;
    gear = oathGear;
    applyView(null);
    const shape = gear ? hooks.gearShape(gear) : null;
    bladeLength = V.bladeLength * (shape ? shape.bladeLength : 1);
    bladeWidth = V.bladeWidth * (shape ? shape.bladeWidth : 1);
    cosF = 1;
    sinF = 0;
    const t = performance.now() / 1000;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, frenzy ? C.bladeGlowSoftFrenzy : C.bladeGlowSoft, bladeLength / 2, 0, bladeLength * 0.7, 0.5);
    ctx.restore();
    bladeShape([0, 0, 0], [1, 0, 0], t, 1);
    if (extras) extras(rig, [0, 0, 0], [1, 0, 0], t);
}

// Capuz (esfera + ponta caindo para trás) e máscara de osso na frente
function headPart(pose) {
    const center = [pose.headA, 0, pose.headZ];
    const R = V.hoodRadius;
    const shape = gear ? hooks.gearShape(gear) : null;
    const hoodTip = V.hoodTipLength * (shape ? shape.hoodTip : 1);
    const hoodRise = shape ? shape.hoodRise : 0;
    const tipPos = [pose.headA - R - hoodTip + anim.capeX * 0.15, anim.capeY * 0.1, pose.headZ - 0.9 + hoodRise];
    return {
        depth: project(...center).depth,
        draw() {
            const t = pose.t;
            const c = project(...center);
            const ry = R * Math.hypot(GS, HS);
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
            const mh = V.maskHeight * HS + 0.5;
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

// Ferramentas do boneco para os heróis registrados (body_registry.js) e para os ganchos do jogo (hero_hooks.js)
const rig = {
    project, projectVec, limb, ball, disk,
    // Pose e vetores, para bonecos com braços ou espada próprios
    V, mix, add3, norm3, holdSword, swordArmPose, sashEnds, drawCapeShape, drawFlask,
    get anim() { return anim; },
    get C() { return C; },
    get sinF() { return sinF; },
    get cosF() { return cosF; },
    get bladeLength() { return bladeLength; },
    // Câmera do quadro (para quem desenha esferas e alturas por conta própria)
    get heightScale() { return HS; },
    get sphereY() { return Math.hypot(GS, HS); }
};

// Brilho a mais da lâmina acesa (view.frenzyGlow; 1 = só muda a cor)
let frenzyGlow = 1;

// Câmera, golpes e escala do quadro: os do boneco (Last Torch), ou os que o jogo passa em view
function applyView(view) {
    HS = view?.camera?.heightScale ?? V.heightScale;
    GS = view?.camera?.groundSquash ?? V.groundSquash;
    DW = view?.camera?.depthHeightWeight ?? V.depthHeightWeight;
    MOVES = view?.moves ?? V.moves;
    frenzyGlow = view?.frenzyGlow ?? 1;
}

// body: quem é desenhado ({ x, y, hitTime, hitDirX, hitDirY, iFrames, move, castAge; isBoss, enraged }), com o seu estado
// de animação (hero_anim.js) e a sua paleta. oathGear: equipamento extra (chave do jogo; colors já vem com a paleta dele).
// model: 'hunter' (padrão) ou o id de um boneco registrado em body_registry.js.
// view (opcional, para jogos com outra câmera; sem ele vale a do Last Torch, em hero25d_visual.js):
//   camera { heightScale, groundSquash, depthHeightWeight }  câmera do jogo
//   scale       px por unidade (padrão V.scale)          time  relógio do desenho em ms (padrão performance.now())
//   moves       golpes especiais (padrão V.moves)        knockback  empurrão e anel ao levar dano (padrão H.knockback);
//               com view, o anel é desenhado deitado no chão, na escala do boneco
//   frenzyGlow  quanto a lâmina acesa brilha a mais
//   body        medidas de hero25d_visual.js trocadas só neste desenho (ex.: sombra e capa ajustadas à câmera)
// Devolve a pose do quadro.
export function renderHero25D(body, bodyAnim, colors = V.colors, oathGear = null, model = 'hunter', view = null) {
    anim = bodyAnim;
    bodyAnim.model = model;
    throwsKnives = bodyAnim.throwsKnives !== false;
    C = colors;
    gear = oathGear;
    selectBody(model);
    applyView(view);
    if (view) return withBodyOverrides(view.body, () => renderInView(body, view));
    const t = performance.now() / 1000;
    // Lâmina acesa: o jogo decide (no Last Torch, a Fúria do herói ou o boss enfurecido)
    const frenzy = hooks.frenzy(body);
    cosF = Math.cos(anim.facing);
    sinF = Math.sin(anim.facing);

    // Dano: mesmo empurrão do herói top-down (hero_visual.js)
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
    const bodyScale = V.scale * (B?.vis.bodyScale ?? 1);
    ctx.scale(bodyScale, bodyScale);

    const pose = buildPose(t, body);
    drawParts(pose, frenzy, body);
    ctx.restore();
    return pose;
}

// As peças do boneco, já com a câmera e a escala no ctx
function drawParts(pose, frenzy, body) {
    if (hooks.gearGround) hooks.gearGround(gear, pose, rig);
    drawShadow(pose.lift);
    ctx.translate(0, -pose.lift * HS);
    const parts = [
        capePart(pose),
        legPart(pose, -1),
        legPart(pose, 1),
        torsoPart(pose),
        freeArmPart(pose, body),
        swordArmPart(pose),
        swordPart(pose, frenzy, body),
        ...(B?.headParts ? B.headParts(pose, rig) : [headPart(pose)]),
        ...(hooks.gearParts ? hooks.gearParts(gear, pose, rig) : [])
    ];
    parts.sort((p, q) => p.depth - q.depth).forEach(p => p.draw());
}

// Troca medidas do corpo (view.body) só durante fn e devolve as originais
function withBodyOverrides(values, fn) {
    if (!values) return fn();
    const before = {};
    Object.keys(values).forEach(k => { before[k] = V[k]; V[k] = values[k]; });
    try {
        return fn();
    } finally {
        Object.assign(V, before);
    }
}

// Desenho com a câmera de outro jogo (view): pés em body.x, body.y, view.scale px por unidade, relógio view.time
function renderInView(body, view) {
    const now = view.time ?? performance.now();
    const t = now / 1000;
    const frenzy = hooks.frenzy(body);
    cosF = Math.cos(anim.facing);
    sinF = Math.sin(anim.facing);
    const scale = (view.scale ?? V.scale) * (B?.vis.bodyScale ?? 1);

    // Dano: empurrão para longe do golpe e anel deitado no chão
    const K = view.knockback ?? H.knockback;
    const hitAge = (now - (body.hitTime ?? -Infinity)) / 1000;
    const hitP = hitAge / K.seconds;
    let push = 0;
    if (hitP >= 0 && hitP < 1) {
        push = hitP < K.peakAt
            ? easeOutCubic(hitP / K.peakAt)
            : 1 - easeOutQuad((hitP - K.peakAt) / (1 - K.peakAt));
    }
    ctx.save();
    ctx.translate(body.x, body.y);
    ctx.scale(scale, scale);
    const ringP = hitAge / K.ringSeconds;
    if (ringP >= 0 && ringP < 1) {
        const r = K.ringStartRadius + (K.ringEndRadius - K.ringStartRadius) * easeOutCubic(ringP);
        ctx.save();
        ctx.globalAlpha *= (1 - ringP) * 0.7;
        ctx.strokeStyle = C.hurtRing;
        ctx.lineWidth = (2.5 * (1 - ringP) + 0.5) / scale * 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * GS, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    ctx.translate((body.hitDirX || 0) * K.distance * push, (body.hitDirY || 0) * K.distance * push * GS);
    const pose = buildPose(t, body);
    drawParts(pose, frenzy, body);
    ctx.restore();
    return pose;
}

// Ponta da lâmina e mão da espada na tela, no mesmo referencial do desenho com view (para rastros e faíscas)
export function heroBladeTip(body, bodyAnim, model = 'hunter', view = null) {
    const prevAnim = anim;
    anim = bodyAnim;
    selectBody(model);
    applyView(view);
    cosF = Math.cos(bodyAnim.facing);
    sinF = Math.sin(bodyAnim.facing);
    const pose = withBodyOverrides(view?.body, () => buildPose((view?.time ?? performance.now()) / 1000, body));
    const { hand, dir } = swordArmPose(pose);
    const tip = project(hand[0] + dir[0] * bladeLength, hand[1] + dir[1] * bladeLength, hand[2] + dir[2] * bladeLength - pose.lift);
    const grip = project(hand[0], hand[1], hand[2] - pose.lift);
    anim = prevAnim;
    const s = (view?.scale ?? V.scale) * (B?.vis.bodyScale ?? 1);
    return { tip: { x: body.x + tip.x * s, y: body.y + tip.y * s }, hand: { x: body.x + grip.x * s, y: body.y + grip.y * s } };
}
