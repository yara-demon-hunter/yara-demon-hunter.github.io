// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/buddies/guardian_angel/angel25d.js e rode o sync.
import { GUARDIAN_ANGEL_VISUALS as O } from './guardian_angel_visual.js';
import { registerBody } from '../../characters/hunter/body_registry.js';
import { drawHand, mix, norm, olimb, oball } from '../../characters/hunter/kit25d.js';
import { ctx } from '../../core/canvas.js';
import { drawGlow } from '../../core/glow.js';

const TAU = Math.PI * 2;
const C = O.colors;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// --- ANJO GUARDIÃO (buddy 2.5D, boneco do motor do herói) ---
// Montado na mesma câmera e com a mesma animação do boneco de ../../characters/hunter/hero25d.js, como as sombras do Shadow Clone:
// o jogo cria um corpo com a própria animação (createHeroAnim + updateHeroAnim) e o desenha com model 'angel'. O motor dá a passada das
// pernas, o giro para onde ele voa (de frente mostra o rosto; de costas, o cabelo, a capa e as asas), a inclinação do voo e a capa.
// Aqui ficam as peças dele: armadura branca e dourada, elmo, cabelo, auréola, asas em camadas, saia, capa e o cajado de energia
// (a "lâmina" do motor). Voa: sobe do chão (pose.lift), as asas batem e as pernas continuam mexendo.
// Lançar: o jogo liga o golpe 'staffCast' (o mesmo cajado erguido do Gudran): o cajado sobe e aponta, o cristal acende.
// Referência: art_reference/images/guardian-angel.jpeg. Lados sempre do ponto de vista dele: direita = +b.
// Medidas e cores: guardian_angel_visual.js. rig: { project, limb, ball, disk, anim, C, sinF, cosF, holdSword, V }.

const poly = (rig, pts, fill, stroke = true) => {
    ctx.beginPath();
    pts.forEach((p, i) => {
        const s = rig.project(...p);
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = C.outline;
        ctx.lineWidth = 0.34;
        ctx.lineJoin = 'round';
        ctx.stroke();
    }
};

// --- POSE ---
// Voo: o corpo sobe do chão, balança de leve e se inclina um pouco mais para a frente ao voar. As asas batem num relógio próprio
// (mais rápido ao voar e ao lançar). anim.glow: o quanto o cajado está erguido (acende o cristal).
function poseTweak(pose, anim) {
    const dt = Math.min(0.05, Math.max(0, pose.t - (anim.flapT ?? pose.t)));
    anim.flapT = pose.t;
    const cast = pose.sword?.w ?? 0;
    anim.flap = (anim.flap ?? 0) + dt * (O.flapSpeed + pose.run * 3 + cast * 3);
    anim.glow = cast;
    pose.lift = O.hover + Math.sin(pose.t * 2.3) * O.bobAmount * (1 - pose.run * 0.6);
    pose.lean += pose.run * 1.6;
    pose.headA += pose.run * 0.6;
}

// --- PERNAS ---
// Caneleira branca com joelheira dourada e bota dourada clara com punho
function drawLeg(rig, { hip, knee, ankle, toe }) {
    olimb(rig, [hip, knee, ankle], 2.5, C.armor);
    oball(rig, [knee[0] + 0.35, knee[1], knee[2]], 1.35, C.gold);
    rig.ball([knee[0] + 0.7, knee[1], knee[2] + 0.5], 0.55, C.goldLight);
    olimb(rig, [[ankle[0], ankle[1], ankle[2] + 1.8], ankle], 3.1, C.gold);
    olimb(rig, [ankle, toe], 2.8, C.goldLight);
}

// --- TRONCO ---
function drawTorso(rig, pose, bottom, top, wb, wt) {
    const { project, limb, disk, sinF } = rig;
    const pb = project(bottom.a, 0, bottom.z);
    const pt = project(top.a, 0, top.z);
    ctx.fillStyle = C.armor;
    disk([bottom.a, 0, bottom.z], [bottom.A, 0, 0], [0, bottom.B, 0]);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pb.x - wb, pb.y);
    ctx.lineTo(pt.x - wt, pt.y);
    ctx.lineTo(pt.x + wt, pt.y);
    ctx.lineTo(pb.x + wb, pb.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.34;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.fillStyle = C.armorShade;
    disk([top.a, 0, top.z], [top.A, 0, 0], [0, top.B, 0]);
    ctx.fill();
    // Cinto: só a metade da frente do anel aparece
    const beltZ = bottom.z + 0.8;
    const bz = project(bottom.a, 0, beltZ);
    ctx.save();
    ctx.beginPath();
    ctx.rect(bz.x - 20, bz.y, 40, 20);
    ctx.clip();
    disk([bottom.a, 0, beltZ], [bottom.A * 1.06, 0, 0], [0, bottom.B * 1.06, 0]);
    ctx.strokeStyle = C.belt;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    // Peito virado para a câmera: emblema de asas dourado, divisão das placas e fivela; de costas, a placa das costas
    const front = clamp01(sinF * 1.5 + 0.4);
    const back = clamp01(-sinF * 1.5 + 0.4);
    const base = ctx.globalAlpha;
    if (front > 0) {
        ctx.globalAlpha = base * front;
        const fa = top.a + top.A * 0.95;
        for (const s of [-1, 1]) limb([[fa, s * 0.3, top.z - 2.2], [fa + 0.1, s * 2.2, top.z - 3.0], [fa, s * 3.5, top.z - 2.1]], 0.85, C.gold);
        limb([[fa, 0, top.z - 1.4], [bottom.a + bottom.A * 1.02, 0, beltZ + 0.6]], 0.3, C.armorShade);
        olimb(rig, [[bottom.a + bottom.A * 1.02, -0.9, beltZ], [bottom.a + bottom.A * 1.02, 0.9, beltZ]], 1.3, C.goldLight);
        ctx.globalAlpha = base;
    }
    if (back > 0) {
        ctx.globalAlpha = base * back;
        limb([[top.a - top.A * 0.95, 0, top.z - 1.1], [bottom.a - bottom.A, 0, beltZ + 0.7]], 0.35, C.armorShade);
        ctx.globalAlpha = base;
    }
}

// --- CAPA (atrás de tudo) ---
function drawBack(rig, pose) {
    const { project, limb } = rig;
    const run = pose.run;
    const lag = rig.anim.capeX;
    const top = [[-1.4 + pose.lean * 0.6, -4.2, pose.shoulderZ - 0.5], [-1.4 + pose.lean * 0.6, 4.2, pose.shoulderZ - 0.5]];
    const hem = [];
    const N = 5;
    for (let i = 0; i < N; i++) {
        const b = -5.4 + (10.8 * i) / (N - 1);
        const wave = Math.sin(pose.t * 3.6 + b * 0.7) * (0.45 + run * 1.1);
        hem.push([-3 - run * 3.6 + lag * 0.5 + wave - Math.abs(b) * 0.1, b, pose.hipZ - 4.6 + (i % 2 ? 1.1 : 0) + wave * 0.3]);
    }
    poly(rig, [...top, ...hem.slice().reverse()], C.cape);
    limb([[top[0][0], -2, top[0][2] - 1], [hem[1][0], hem[1][1] * 0.6, hem[1][2] + 1]], 0.38, C.capeShade);
    limb([[top[1][0], 2, top[1][2] - 1], [hem[3][0], hem[3][1] * 0.6, hem[3][2] + 1]], 0.38, C.capeShade);
    void project;
}

// --- CAJADO (a "lâmina" do motor) E BRAÇOS ---
// Em repouso cruza o corpo na diagonal com o cristal no alto, as duas mãos nele (a de cima é a da arma, +b; a de baixo é a livre).
// No golpe 'staffCast' o motor ergue a mão de cima e aponta o cajado para a frente; a mão livre acompanha.
function restStaff(rig, pose) {
    const B = rig.V.chest.B;
    const hand = [pose.lean * 0.9 + 2.9, B * 0.78, pose.shoulderZ - 3.1];
    const dir = norm([0.14 + Math.sin(pose.t * 1.1) * 0.03, 0.42, 0.9]);
    return { hand, dir };
}

function freeArm(rig, pose) {
    const held = rig.holdSword(pose, restStaff(rig, pose));
    const hand = [held.hand[0] - held.dir[0] * 4.6, held.hand[1] - held.dir[1] * 4.6, held.hand[2] - held.dir[2] * 4.6];
    const shoulder = [pose.lean, -rig.V.chest.B, pose.shoulderZ - 0.5];
    const elbow = [(shoulder[0] + hand[0]) / 2 - 0.3, (shoulder[1] + hand[1]) / 2 - 1.3, (shoulder[2] + hand[2]) / 2 - 1.2];
    return { shoulder, hand, elbow };
}

// Braço: ombreira dourada, manga branca, braçadeira dourada e luva
function drawArm(rig, shoulder, elbow, hand, armWidth, handRadius) {
    const side = Math.sign(shoulder[1]) || 1;
    olimb(rig, [shoulder, elbow, hand], armWidth + 0.2, C.armor);
    olimb(rig, [mix(elbow, hand, 0.62), mix(elbow, hand, 0.86)], armWidth + 0.9, C.gold);
    drawHand(rig, elbow, hand, side, { color: C.glove, shade: C.armorShade, size: handRadius * 1.15, grip: 1 });
    oball(rig, [shoulder[0], shoulder[1] * 1.08, shoulder[2] + 0.2], 1.85, C.gold);
    rig.ball([shoulder[0] + 0.4, shoulder[1] * 1.08, shoulder[2] + 0.9], 0.9, C.goldLight);
}

// Cajado de energia: fuste azul e branco com duas fitas em espiral correndo para o cristal, que pulsa em dourado e branco
function drawBlade(rig, hand, dir, alpha) {
    const { project, limb } = rig;
    const glow = rig.anim.glow ?? 0;
    const t = performance.now() / 1000;
    const foot = [hand[0] - dir[0] * O.staffBelow, hand[1] - dir[1] * O.staffBelow, hand[2] - dir[2] * O.staffBelow];
    const tip = [hand[0] + dir[0] * O.bladeLength, hand[1] + dir[1] * O.bladeLength, hand[2] + dir[2] * O.bladeLength];
    const base = ctx.globalAlpha;
    ctx.globalAlpha = base * alpha;
    // Dois eixos perpendiculares ao cajado, para a espiral
    let n1 = [dir[1] * 1, -dir[0], 0];
    if (Math.hypot(...n1) < 0.1) n1 = [0, 1, 0];
    n1 = norm(n1);
    const n2 = [dir[1] * n1[2] - dir[2] * n1[1], dir[2] * n1[0] - dir[0] * n1[2], dir[0] * n1[1] - dir[1] * n1[0]];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    limb([foot, tip], 2.5, C.staffGlow);
    ctx.restore();
    limb([foot, tip], 1.2, C.staffCore);
    limb([foot, tip], 0.5, '#f4faff');
    ctx.lineCap = 'round';
    for (let strand = 0; strand < 2; strand++) {
        ctx.strokeStyle = strand ? C.staffWhite : C.staffBlue;
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        const N = 18;
        for (let i = 0; i <= N; i++) {
            const k = i / N;
            const r = 0.95 * (0.55 + 0.45 * Math.sin(k * Math.PI));
            const phi = k * 16 - t * 5 + strand * Math.PI;
            const p = project(
                foot[0] + (tip[0] - foot[0]) * k + (n1[0] * Math.cos(phi) + n2[0] * Math.sin(phi)) * r,
                foot[1] + (tip[1] - foot[1]) * k + (n1[1] * Math.cos(phi) + n2[1] * Math.sin(phi)) * r,
                foot[2] + (tip[2] - foot[2]) * k + (n1[2] * Math.cos(phi) + n2[2] * Math.sin(phi)) * r
            );
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
    }
    // Cristal no alto: brilho dourado e branco que pulsa e o losango de quatro pontas
    const c = project(...tip);
    const pulse = 0.5 + 0.5 * Math.sin(t * 4);
    drawGlow(ctx, C.orbGlow, c.x, c.y, 4.2 + pulse + 3 * glow, clamp01(0.5 + 0.15 * pulse + 0.3 * glow));
    drawGlow(ctx, C.orbCore, c.x, c.y, 2 + 0.5 * pulse + 1.4 * glow, 0.85);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(t * 0.8);
    const r = 2.5 + 0.5 * glow;
    ctx.fillStyle = C.crystal;
    ctx.strokeStyle = C.crystalEdge;
    ctx.lineWidth = 0.32;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.42, -r * 0.42);
    ctx.lineTo(r, 0);
    ctx.lineTo(r * 0.42, r * 0.42);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.42, r * 0.42);
    ctx.lineTo(-r, 0);
    ctx.lineTo(-r * 0.42, -r * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = base;
}

// --- ASAS ---
// Em 3D: cada pena é um segmento do ombro até a ponta, num leque no plano das costas (de frente as asas abrem para os lados; de lado
// ficam de topo e afinam). Três camadas (penas longas atrás, cobertas no meio, pequenas junto ao corpo). O ângulo da batida vem de anim.flap.
function wingPart(rig, pose, side) {
    const { project, sinF } = rig;
    const flapUp = 0.4 + O.flapOpen * Math.sin(rig.anim.flap ?? 0) + (pose.sword?.w ?? 0) * 0.3;
    const root = [-2.4 + pose.lean * 0.7, side * 1.9, pose.shoulderZ - 1.3];
    const sweep = -0.28 - pose.run * 0.25;
    const out = norm([sweep, side * Math.cos(flapUp), Math.sin(flapUp)]);
    const up = [0, -side * Math.sin(flapUp), Math.cos(flapUp)];
    const widen = 0.3 + 0.7 * Math.abs(sinF);
    const layers = [
        { n: 7, from: 1.0, to: -0.8, len0: 13.5, len1: 9, w: 1.4, fill: () => C.wingBack },
        { n: 6, from: 0.9, to: -0.6, len0: 9.5, len1: 6.5, w: 1.2, fill: (k) => (k < 0.34 ? C.wingGold : C.wing) },
        { n: 5, from: 0.75, to: -0.35, len0: 5.6, len1: 3.6, w: 1.0, fill: () => C.wing }
    ];
    return {
        depth: project(root[0] - 1.6, side * 5, root[2]).depth,
        draw() {
            const p0 = project(...root);
            ctx.lineJoin = 'round';
            ctx.strokeStyle = C.outline;
            ctx.lineWidth = 0.3;
            for (const L of layers) {
                for (let i = 0; i < L.n; i++) {
                    const k = L.n === 1 ? 0 : i / (L.n - 1);
                    const a = L.from + (L.to - L.from) * k;
                    const len = L.len0 + (L.len1 - L.len0) * k;
                    const d = [out[0] * Math.cos(a) + up[0] * Math.sin(a), out[1] * Math.cos(a) + up[1] * Math.sin(a), out[2] * Math.cos(a) + up[2] * Math.sin(a)];
                    const p1 = project(root[0] + d[0] * len, root[1] + d[1] * len, root[2] + d[2] * len);
                    const dx = p1.x - p0.x;
                    const dy = p1.y - p0.y;
                    const l = Math.hypot(dx, dy);
                    if (l < 0.2) continue;
                    const w = L.w * widen;
                    const nx = (-dy / l) * w;
                    const ny = (dx / l) * w;
                    ctx.beginPath();
                    ctx.moveTo(p0.x, p0.y);
                    ctx.bezierCurveTo(p0.x + dx * 0.3 + nx, p0.y + dy * 0.3 + ny, p0.x + dx * 0.95 + nx * 0.9, p0.y + dy * 0.95 + ny * 0.9, p1.x, p1.y);
                    ctx.bezierCurveTo(p0.x + dx * 0.95 - nx * 0.9, p0.y + dy * 0.95 - ny * 0.9, p0.x + dx * 0.3 - nx, p0.y + dy * 0.3 - ny, p0.x, p0.y);
                    ctx.closePath();
                    ctx.fillStyle = L.fill(k);
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }
    };
}

// --- SAIA (tabardo): painel da frente com a barra dourada e painel de trás; voam para trás com o voo ---
function skirtPart(rig, pose, front) {
    const { project, limb } = rig;
    const k = front ? 1 : -1;
    const run = pose.run;
    const swing = Math.sin(rig.anim.stride) * 0.5 * (0.4 + run);
    const topA = k * 2.3 + pose.lean * 0.3;
    const hemA = k * 3.2 + pose.lean * 0.2 + (front ? swing - run * 2.2 : -swing * 0.4 - run * 1.4);
    const topZ = pose.hipZ + 0.6;
    const hemZ = pose.hipZ - 5.6 + Math.sin(pose.t * 3 + k) * 0.25;
    const w = 2.5;
    const pts = [[topA, -w, topZ], [topA, w, topZ], [hemA, w * 1.12, hemZ], [hemA, -w * 1.12, hemZ]];
    return {
        depth: project(front ? 2.6 : -2.6, 0, pose.hipZ - 2).depth + (front ? 0.2 : -0.2),
        draw() {
            poly(rig, pts, front ? C.robe : C.robeShade);
            if (front) {
                limb([[topA + 0.1, -w + 0.4, topZ - 0.2], [hemA + 0.1, -w * 1.12 + 0.5, hemZ + 0.3], [hemA + 0.1, w * 1.12 - 0.5, hemZ + 0.3], [topA + 0.1, w - 0.4, topZ - 0.2]], 0.55, C.gold);
            }
        }
    };
}

// --- CABEÇA ---
// Elmo de prata com crista central, faixa e protetor de nariz; cabelo claro e comprido em massa única caindo atrás; rosto sereno de pele
// (o mesmo truque da máscara do herói: um oval na frente da cabeça que some quando ele está de costas); auréola dourada flutuando
function headParts(pose, rig) {
    const { project, limb, ball, sinF } = rig;
    const R = O.headRadius;
    const ha = pose.headA;
    const hz = pose.headZ;
    const run = pose.run;
    const hairHem = (side) => [ha - 1.7 + Math.sin(pose.t * 3 + side) * 0.3 - run * 1.8 + rig.anim.capeX * 0.15, side * 1.5, hz - 4.8 + Math.sin(pose.t * 2.6 + side * 2) * 0.25];
    const hair = {
        depth: project(ha - 1.4, 0, hz - 1.4).depth,
        draw() {
            poly(rig, [[ha - 0.3, -R * 0.95, hz + 0.6], [ha - 1.2, 0, hz + 0.9], [ha - 0.3, R * 0.95, hz + 0.6], hairHem(1), [ha - 2.2 - run * 1.6, 0, hz - 5.5], hairHem(-1)], C.hair);
            limb([[ha - 1.4, 0, hz + 0.2], [ha - 2.2 - run * 1.4, 0, hz - 4.6]], 0.35, C.hairShade);
        }
    };
    const neck = {
        depth: project(pose.lean, 0, pose.shoulderZ + 1).depth - 0.1,
        draw() {
            limb([[pose.lean, 0, pose.shoulderZ], [ha - 0.2, 0, hz - R * 0.7]], 1.6, C.skinShade);
        }
    };
    const head = {
        depth: project(ha, 0, hz).depth + 0.2,
        draw() {
            const c = project(ha, 0, hz);
            const ry = R * rig.sphereY;
            ctx.fillStyle = C.helmet;
            ctx.beginPath();
            ctx.ellipse(c.x, c.y, R * 1.12, ry * 1.1, 0, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = C.outline;
            ctx.lineWidth = 0.34;
            ctx.stroke();
            ctx.fillStyle = C.helmetLight;
            ctx.beginPath();
            ctx.ellipse(c.x, c.y - ry * 0.35, R * 0.6, ry * 0.4, 0, 0, TAU);
            ctx.fill();
            limb([[ha + R * 1.0, 0, hz + R * 0.85], [ha - R * 1.0, 0, hz + R * 0.95]], 0.7, C.goldLight);
            const vis = clamp01((sinF + 0.45) / 0.5);
            if (vis <= 0) return;
            const base = ctx.globalAlpha;
            ctx.globalAlpha = base * vis;
            const f = project(ha + R * 0.72, 0, hz - 0.5);
            const fw = Math.hypot(0.9 * rig.cosF, 1.65 * sinF);
            ctx.fillStyle = C.skin;
            ctx.beginPath();
            ctx.ellipse(f.x, f.y + 0.2, fw, 1.75 * rig.heightScale + 0.55, 0, 0, TAU);
            ctx.fill();
            const band = project(ha + R * 0.78, 0, hz + 0.75);
            ctx.fillStyle = C.helmetLight;
            ctx.beginPath();
            ctx.ellipse(band.x, band.y, Math.hypot(0.9 * rig.cosF, 1.95 * sinF), 0.65, 0, 0, TAU);
            ctx.fill();
            ctx.stroke();
            limb([[ha + R * 0.98, 0, hz + 0.5], [ha + R * 0.98, 0, hz - 1.1]], 0.55, C.helmetLight);
            for (const s of [-1, 1]) {
                const e = project(ha + R * 0.95, s * 0.95, hz - 0.1);
                if (e.depth < f.depth - 0.5) continue;
                ctx.fillStyle = C.eye;
                ctx.beginPath();
                ctx.ellipse(e.x, e.y, 0.18 + 0.22 * Math.abs(sinF), 0.4, 0, 0, TAU);
                ctx.fill();
                limb([[ha + R * 0.92, s * 0.5, hz + 0.55], [ha + R * 0.95, s * 1.6, hz + 0.6]], 0.24, C.brow);
            }
            limb([[ha + R * 0.92, -0.45, hz - 1.5], [ha + R * 0.92, 0.45, hz - 1.5]], 0.26, C.mouth);
            ball([ha + R * 0.8, 0, hz - 2.05], 0.55, C.hair);
            ctx.globalAlpha = base;
        }
    };
    const halo = {
        depth: 1e6 - 1,
        draw() {
            const z = hz + R + 2.5 + Math.sin(pose.t * 2.2) * 0.25;
            const center = [ha, 0, z];
            const c = project(...center);
            drawGlow(ctx, C.aura, c.x, c.y, 4.6, 0.5);
            ctx.lineJoin = 'round';
            ctx.strokeStyle = C.halo;
            ctx.lineWidth = 0.8;
            rig.disk(center, [2.6, 0, 0], [0, 2.6, 0]);
            ctx.stroke();
            ctx.strokeStyle = C.haloLight;
            ctx.lineWidth = 0.32;
            rig.disk(center, [2.15, 0, 0], [0, 2.15, 0]);
            ctx.stroke();
        }
    };
    // Aura de luz atrás do corpo (desenhada primeiro)
    const aura = {
        depth: -1e6,
        draw() {
            const c = project(pose.lean * 0.6, 0, pose.shoulderZ - 3);
            drawGlow(ctx, C.aura, c.x, c.y, 15, 0.2 + 0.12 * (pose.sword?.w ?? 0));
        }
    };
    return [aura, hair, neck, head, halo, wingPart(rig, pose, -1), wingPart(rig, pose, 1), skirtPart(rig, pose, true), skirtPart(rig, pose, false)];
}

// --- REGISTRO DO BONECO (lido por ../../characters/hunter/hero25d.js; interface em ../../characters/hunter/body_registry.js) ---
registerBody('angel', {
    vis: O,
    poseTweak,
    drawLeg,
    drawTorso,
    drawBack,
    freeArm,
    drawArm,
    swordRest: (rig, pose) => restStaff(rig, pose),
    drawBlade,
    headParts
});
