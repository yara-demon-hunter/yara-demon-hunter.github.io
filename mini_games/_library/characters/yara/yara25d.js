import { YARA_VISUALS as Y } from './yara_visual.js';
import { registerBody } from '../hunter/body_registry.js';
import * as KIT from '../hunter/kit25d.js';
import { drawEar as azaelEar, wrap as azaelWrap } from '../azael/azael25d.js';
import { ctx } from '../../core/canvas.js';
import { drawShortSword } from '../../weapons/short_sword/short_sword.js';
import { drawGlow } from '../../core/glow.js';

// Geometria compartilhada (hunter/kit25d.js) e a orelha e a bandagem do Azael
const K = { ...KIT, drawEar: azaelEar, wrap: azaelWrap };

// --- YARA (heroína 2.5D do palco) ---
// Peças da Yara montadas na mesma câmera e com a mesma animação do boneco de ../hunter/hero25d.js: cabeça com rosto
// (olhos vermelho e azul, pintura de guerra, sorriso), cabelo metade preto e metade branco em duas maria-chiquinhas,
// bandana e cachecol vermelhos, top curto com a barriga à mostra, ombreira com pelo, calça larga, botas altas e uma
// espada curta. Corpo feminino: ombros estreitos, cintura fina, quadril largo, braços finos.
// Lados sempre do ponto de vista dela: direita = +b (cabelo preto, olho vermelho, bandagem, mão da espada);
// esquerda = -b (cabelo branco, olho azul, ombreira, ponta do cachecol).
// A cabeça usa a mesma geometria do Azael (hunter/kit25d.js), com as medidas da Yara. Referência: art_reference/ (nesta pasta).
// rig: { project, projectVec, limb, ball, disk, anim, C, sinF, cosF }. Medidas e cores: yara_visual.js.
const { mix, add, norm, dot, cross, sub } = K;

// --- CABELO EM DUAS CORES ---
// Caminho da metade esquerda (branca) da cabeça visível: o arco visível da risca (círculo s = 0) e a borda da
// silhueta do lado de s < 0. Devolve false se a metade branca não aparece.
function leftHalfPath(rig, H, R) {
    const g1 = norm(cross([0, 0, 1], H.d));
    const g2 = cross(H.d, g1);
    const N = 48;
    const ring = [];
    for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const p = add(add(H.c, H.f, R * Math.cos(a)), H.u, R * Math.sin(a));
        ring.push({ p, vis: dot(norm(sub(p, H.c)), H.d) >= 0 });
    }
    let start = -1;
    for (let i = 0; i < N; i++) if (!ring[i].vis && ring[(i + 1) % N].vis) start = (i + 1) % N;
    ctx.beginPath();
    if (start < 0) {
        // A risca não cruza a parte visível: a cabeça visível é toda de uma cor
        if (dot(H.s, H.d) >= 0) return false;
        K.silhouettePath(rig, H, R);
        return true;
    }
    const arc = [];
    for (let k = 0; k < N && ring[(start + k) % N].vis; k++) arc.push(ring[(start + k) % N].p);
    const ang = (p) => {
        const v = sub(p, H.c);
        return Math.atan2(dot(v, g2), dot(v, g1));
    };
    const a1 = ang(arc[arc.length - 1]);
    const a0 = ang(arc[0]);
    const silAt = (a) => add(add(H.c, g1, R * Math.cos(a)), g2, R * Math.sin(a));
    let dir = 1;
    let span = ((a0 - a1) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    if (dot(sub(silAt(a1 + span / 2), H.c), H.s) > 0) {
        dir = -1;
        span = Math.PI * 2 - span;
    }
    arc.forEach((p, i) => {
        const q = rig.project(...p);
        if (i === 0) ctx.moveTo(q.x, q.y);
        else ctx.lineTo(q.x, q.y);
    });
    for (let j = 1; j <= 16; j++) {
        const q = rig.project(...silAt(a1 + dir * span * (j / 16)));
        ctx.lineTo(q.x, q.y);
    }
    ctx.closePath();
    return true;
}

// Cor do cabelo de cada lado: direita (+) preto, esquerda (-) branco
const hairOf = (C, side) => (side > 0 ? [C.hairDark, C.hairDarkShade] : [C.hairLight, C.hairLightShade]);

// Mecha grossa (maria-chiquinha): fita larga com ponta rasgada e fios
function drawTail(rig, chain, side, C) {
    const [fill, shade] = hairOf(C, side);
    K.drawRibbon(rig, chain, Y.tailWidth, 0.3, fill, C.outline, true);
    K.strokeSmooth(rig, chain.slice(1, -1).map(p => [p[0], p[1] + 0.25 * side, p[2] + 0.15]), 0.25, shade);
}

// --- CABEÇA ---
// Partes da cabeça: a cabeça (com rosto, bandana, franja e mechas) e cada maria-chiquinha (com a sua profundidade,
// para ficar na frente ou atrás da cabeça conforme o lado)
function yaraHeadParts(pose, rig) {
    const { project, anim, C } = rig;
    const { run } = pose;
    const H = K.headFrame(pose, rig, Y);
    const R = H.R;
    const lat0 = Math.asin(Y.bandHeight / R);

    const tails = [1, -1].map(side => {
        const root = H.sphere(side * Math.PI * 0.55, lat0 + 0.4, R * 0.98);
        const chain = K.flowChain(root, pose, anim, {
            len: Y.tailLength + Y.tailRunLength * run,
            segs: 6,
            hang: [-0.12, side * 0.4, -1],
            stream: [-0.7, side * 0.75, -0.8],
            lag: 0.16,
            amp: Y.tailWave * 0.35,
            ampRun: Y.tailWave,
            speed: 3,
            speedRun: 7.5,
            waveLength: 3.4,
            phase: side * 1.3,
            droop: -0.5,
            bow: [0, side * 1.6, 0.6]
        });
        return {
            depth: project(...chain[2]).depth,
            draw() {
                drawTail(rig, chain, side, C);
                // Elástico: vermelho no lado preto, azul-escuro no lado branco
                K.oball(rig, root, 0.6, side > 0 ? C.tieRight : C.tieLeft);
            }
        };
    });

    // Franja: mechas curtas da risca por cima da bandana (pretas à direita, brancas à esquerda)
    const bangs = [[0.55, 2.4], [0.2, 2.8], [-0.2, 2.7], [-0.55, 2.3]].map(([lon, len], i) => {
        const side = Math.sign(lon);
        const root = H.sphere(lon, lat0 + 0.6, R * 1.02);
        const dir = norm(add(add(H.u.map(v => -v), H.s, side * 0.45), H.f, 0.55));
        return {
            side,
            chain: K.flowChain(root, pose, anim, {
                len, segs: 3, hang: dir, stream: add(dir, [-1, 0, 0], 0.2), lag: 0.02,
                amp: 0.08, ampRun: 0.25, speed: 2, speedRun: 8, waveLength: 2, phase: i,
                bow: add(H.f, H.s, side * 0.4).map(v => v * 0.35)
            })
        };
    });
    // Mechas dos lados do rosto, até o peito
    const locks = [-1, 1].map(side => ({
        side,
        chain: K.flowChain(H.sphere(side * 1.15, lat0 - 0.1, R * 1.02), pose, anim, {
            len: 4.8, segs: 5, hang: [0.05, side * 0.3, -1], stream: [-1, side * 0.2, -0.45],
            bow: [0.25, side * 0.5, 0], lag: 0.08, amp: 0.15, ampRun: 0.5, speed: 2.6, speedRun: 9, waveLength: 3, phase: side
        })
    }));

    const head = {
        depth: project(...H.c).depth,
        draw() {
            const t = pose.t;
            const baseAlpha = ctx.globalAlpha;
            const vis = Math.max(0, Math.min(1, (H.frontVis + 0.05) / 0.3));
            const ears = [-1, 1].map(side => ({ side, near: dot([0, side, 0], H.d) > 0 }));
            ears.filter(e => !e.near).forEach(e => K.drawEar(rig, H, e.side, C, Y));

            // Cabelo: preto inteiro e a metade esquerda pintada de branco por cima
            K.silhouettePath(rig, H, R);
            ctx.fillStyle = C.hairDark;
            ctx.fill();
            if (leftHalfPath(rig, H, R)) {
                ctx.fillStyle = C.hairLight;
                ctx.fill();
            }
            // Contorno por cima (embaixo o cabelo continua no rosto e no cachecol)
            const g1 = norm(cross([0, 0, 1], H.d));
            const g2 = cross(H.d, g1);
            let arc = [];
            const flush = () => {
                if (arc.length > 1) K.strokeSmooth(rig, arc, 0.5, C.outline);
                arc = [];
            };
            for (let i = 0; i <= 36; i++) {
                const a = (i / 36) * Math.PI * 2;
                const p = add(add(H.c, g1, R * Math.cos(a)), g2, R * Math.sin(a));
                if (dot(sub(p, H.c), H.u) < -R * 0.35 && dot(sub(p, H.c), H.f) > -R * 0.2) flush();
                else arc.push(p);
            }
            flush();
            // Fios penteados da risca para os lados, cada um na cor do seu lado
            for (const side of [-1, 1]) {
                const shade = hairOf(C, side)[1];
                for (const k of [0, 1]) {
                    const pts = [];
                    for (let j = 0; j <= 8; j++) {
                        const q = j / 8;
                        pts.push(H.sphere(side * (0.12 + q * (1.4 + k * 0.6)), lat0 + 0.5 + q * 0.3 - k * 0.15, R * 1.01));
                    }
                    ctx.globalAlpha = baseAlpha * 0.7;
                    K.strokeVisible(rig, H, pts, 0.18, shade);
                    ctx.globalAlpha = baseAlpha;
                }
            }

            if (vis > 0) {
                ctx.globalAlpha = baseAlpha * vis;
                drawFace(rig, H, C, t, vis);
                ctx.globalAlpha = baseAlpha;
            }

            // Bandana vermelha na testa (só a parte virada para a câmera)
            const band = [];
            for (let j = 0; j <= 24; j++) band.push(H.sphere((j / 24) * Math.PI * 2 - Math.PI, lat0, R * 1.03));
            K.strokeVisible(rig, H, band, Y.bandWidth + 0.45, C.outline);
            K.strokeVisible(rig, H, band, Y.bandWidth, C.bandana);
            K.strokeVisible(rig, H, band.map(p => add(p, H.u, -Y.bandWidth * 0.3)), 0.25, C.bandanaShade);

            ears.filter(e => e.near).forEach(e => K.drawEar(rig, H, e.side, C, Y));

            if (vis > 0) {
                ctx.globalAlpha = baseAlpha * vis;
                for (const b of bangs) K.drawRibbon(rig, b.chain, 0.6, 0.05, hairOf(C, b.side)[0], b.side > 0 ? C.outline : C.hairLightShade, false);
                ctx.globalAlpha = baseAlpha;
            }
            for (const l of locks) {
                if (H.facing(l.chain[0]) < -0.1) continue;
                K.drawRibbon(rig, l.chain, 0.55, 0.12, hairOf(C, l.side)[0], C.outline, true);
            }
        }
    };
    return [head, ...tails];
}

// Rosto: pele morena, olhos grandes (direito vermelho, esquerdo azul) com cílios, sobrancelhas finas, bochechas
// rosadas, pintura de guerra fina e um sorriso aberto
function drawFace(rig, H, C, t, vis) {
    const { project } = rig;
    const F = (sv, uv) => H.face(sv, uv);
    const P = (sv, uv) => project(...F(sv, uv));
    const shown = (sv, uv) => H.facing(F(sv, uv)) > 0.05;

    const outline = [...Y.face.map(([sv, uv]) => [-sv, uv]), ...[...Y.face].reverse().slice(1)];
    const pts = outline.map(([sv, uv]) => project(...H.clampVisible(H.face(sv, uv))));
    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.closePath();
    ctx.fill();
    // Queixo: contorno fino e arredondado
    K.strokeSmooth(rig, outline.slice(3, outline.length - 3).map(([sv, uv]) => H.clampVisible(H.face(sv, uv))), 0.26, C.outline);

    // Bochechas rosadas
    for (const side of [-1, 1]) {
        if (!shown(side * 1.45, -1.35)) continue;
        const b = P(side * 1.45, -1.35);
        ctx.fillStyle = C.blush;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 0.6, 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    // Nariz pequeno
    if (shown(0, -1.2)) K.strokeSmooth(rig, [F(0.08, -1.05), F(-0.12, -1.35)], 0.16, C.skinShade);

    // Boca: sorriso aberto (lábio de cima quase reto, de baixo curvo), dentinhos e caninos
    if (shown(0, -2)) {
        const l = P(-0.5, -1.95);
        const r = P(0.5, -1.95);
        const top = P(0, -2.02);
        const bottom = P(0, -2.38);
        ctx.fillStyle = C.mouth;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.quadraticCurveTo(top.x, top.y, r.x, r.y);
        ctx.quadraticCurveTo(bottom.x, bottom.y + 0.15, l.x, l.y);
        ctx.fill();
        const tongue = P(0, -2.25);
        ctx.fillStyle = C.mouthInner;
        ctx.beginPath();
        ctx.ellipse(tongue.x, tongue.y, 0.22, 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        for (const side of [-1, 1]) {
            const a = P(side * 0.36, -1.98);
            const b = P(side * 0.3, -2.1);
            const c = P(side * 0.24, -1.99);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(c.x, c.y);
            ctx.fill();
        }
    }

    for (const side of [-1, 1]) {
        if (!shown(side * 1.0, -0.35)) continue;
        // Pintura de guerra: traço fino descendo do olho até a mandíbula
        K.strokeSmooth(rig, [F(side * 1.0, -0.85), F(side * 1.08, -1.7), F(side * 1.12, -2.45)], 0.24, C.warPaint);
        // Olho grande e amendoado
        const inner = P(side * 0.42, -0.42);
        const outer = P(side * 1.62, -0.22);
        const top = P(side * 1.0, 0.18);
        const bottom = P(side * 1.0, -0.82);
        ctx.fillStyle = C.eyeWhite;
        ctx.beginPath();
        ctx.moveTo(inner.x, inner.y);
        ctx.quadraticCurveTo(top.x, top.y, outer.x, outer.y);
        ctx.quadraticCurveTo(bottom.x, bottom.y, inner.x, inner.y);
        ctx.fill();
        // Íris (achata quando o olho vira de lado), pupila e brilho
        const e = P(side * 1.0, -0.33);
        const ex = P(side * 1.32, -0.33);
        const rx = Math.max(0.12, Math.min(0.42, Math.hypot(ex.x - e.x, ex.y - e.y)));
        ctx.fillStyle = side > 0 ? C.eyeRight : C.eyeLeft;
        ctx.beginPath();
        ctx.ellipse(e.x, e.y, rx, 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#120a0a';
        ctx.beginPath();
        ctx.ellipse(e.x, e.y + 0.03, rx * 0.4, 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(e.x - rx * 0.55, e.y - 0.28, 0.16, 0.16);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, side > 0 ? C.eyeGlowRight : C.eyeGlowLeft, e.x, e.y, 1.3, (0.35 + 0.15 * Math.sin(t * 3 + side)) * vis);
        ctx.restore();
        // Cílios: traço grosso por cima, com uma pontinha para fora
        K.strokeSmooth(rig, [F(side * 0.45, -0.36), F(side * 1.0, 0.1), F(side * 1.6, -0.2), F(side * 1.78, -0.12)], 0.26, C.outline);
        // Sobrancelha fina, arqueada (cara alegre e confiante)
        K.strokeSmooth(rig, [F(side * 0.5, 0.62), F(side * 1.05, 0.78), F(side * 1.6, 0.68)], 0.14, C.hairDarkShade);
    }
}

// --- CACHECOL ---
// Ponta longa do cachecol: sai do ombro esquerdo e voa para trás (fica no lugar da capa, atrás do corpo)
function drawYaraScarfTail(rig, pose) {
    const { anim, C } = rig;
    const root = [pose.lean - 1.4, -2.2, pose.shoulderZ + 0.6];
    const main = K.flowChain(root, pose, anim, {
        len: Y.scarfTailLength * (1 + 0.3 * pose.run),
        segs: 6,
        hang: [-0.45, -0.45, -1],
        stream: [-1, -0.2, 0.1],
        lag: 0.22,
        amp: 0.45,
        ampRun: 1.4,
        speed: 3.5,
        speedRun: 10,
        waveLength: 4.5,
        phase: 0.6
    });
    const short = K.flowChain(add(root, [0, 0.9, 0], 1), pose, anim, {
        len: Y.scarfTailLength * 0.55 * (1 + 0.3 * pose.run),
        segs: 5,
        hang: [-0.6, -0.2, -1],
        stream: [-1, 0.05, 0.05],
        lag: 0.2,
        amp: 0.4,
        ampRun: 1.2,
        speed: 4,
        speedRun: 11,
        waveLength: 4,
        phase: 2
    });
    K.drawRibbon(rig, short, 0.85, 0.4, C.capeFold, C.outline, true);
    K.drawRibbon(rig, main, 1.15, 0.5, C.cape, C.outline, true);
    K.strokeSmooth(rig, main.slice(1, -1).map(p => [p[0], p[1] + 0.3, p[2] + 0.1]), 0.3, C.capeFold);
}

// --- BRAÇOS E PERNAS ---
// Braço fino: o direito (+b, da espada) tem bandagem branca no bíceps; o esquerdo, a ombreira de metal com pelo
// branco. Os dois têm luva de couro sem dedos com braçadeira.
function drawYaraArm(rig, shoulder, elbow, hand, armWidth, handRadius) {
    const { limb, ball, C } = rig;
    const right = shoulder[1] > 0;
    const sh = [shoulder[0], shoulder[1] * Y.shoulderScale, shoulder[2]];
    const el = [elbow[0], elbow[1] * 0.95, elbow[2]];
    const w = armWidth * Y.armScale;
    K.oball(rig, sh, 1.15, C.skin);
    K.olimb(rig, [sh, el, hand], w, C.skin);
    limb([mix(sh, el, 0.1), mix(sh, el, 0.45)].map(p => [p[0], p[1], p[2] + 0.3]), w * 0.3, C.skinLight);
    if (right) K.wrap(rig, sh, el, 0.42, 0.62, w - 0.1, 1);
    // Braçadeira e luva
    limb([mix(el, hand, 0.4), hand], w + 0.85, C.outline);
    limb([mix(el, hand, 0.4), hand], w + 0.25, C.leather);
    limb([mix(el, hand, 0.68), mix(el, hand, 0.72)], w + 0.3, C.leatherShade);
    // Mão de luva de couro: redonda, com o risco dos dedos e do polegar (kit25d.js, drawHand)
    K.drawHand(rig, el, hand, right ? 1 : -1, { color: C.leather, shade: C.leatherShade, size: handRadius * Y.handScale, grip: right ? 1 : 0 });
    if (!right) {
        // Ombreira de metal com gola de pelo branco por cima e uma tira de couro no braço
        const top = [sh[0] - 0.1, sh[1] * 1.05, sh[2] + 0.5];
        K.oball(rig, top, 1.4, C.metal);
        ball([top[0] + 0.3, top[1] * 0.97, top[2] + 0.45], 0.6, C.metalLight);
        limb([mix(sh, el, 0.38), mix(sh, el, 0.48)], w + 0.6, C.leather);
        const fur = [sh[0] - 0.2, sh[1] * 0.82, sh[2] + 1.4];
        K.oball(rig, fur, 0.95, C.fur);
        for (const k of [-1, 1]) limb([add(fur, [0.3 * k, 0.3, 0], 1), add(fur, [0.6 * k, 0.9, -0.2], 1)], 0.28, C.furShade);
    }
}

// Perna: calça larga escura até a canela e bota de couro alta, com tiras
function drawYaraLeg(rig, hip, knee, ankle, toe) {
    const { limb, ball, C } = rig;
    const shin = mix(knee, ankle, 0.3);
    K.olimb(rig, [hip, knee, shin], Y.legWidth, C.pants);
    ball(knee, Y.legWidth * 0.6, C.pants);
    limb([mix(hip, knee, 0.25), mix(hip, knee, 0.9)].map(p => [p[0] + 0.4, p[1], p[2]]), 0.3, C.pantsShade);
    // Bota alta
    K.olimb(rig, [mix(knee, ankle, 0.22), ankle], Y.legWidth * 0.72, C.leather);
    for (const q of [0.45, 0.7]) limb([mix(knee, ankle, q - 0.02), mix(knee, ankle, q + 0.02)], Y.legWidth * 0.75, C.leatherShade);
    // Pé chato no chão: o cano desce até o calcanhar e a sola vai reta até a ponta, na altura do chão (sem ficar na
    // ponta dos pés). Os dedos recuam um pouco para o pé não ficar comprido.
    const heel = [ankle[0] - 0.5, ankle[1], toe[2] + 0.35];
    const tip = [toe[0] - 0.3, toe[1], toe[2] + 0.35];
    K.olimb(rig, [ankle, heel], Y.legWidth * 0.68, C.leather);
    K.olimb(rig, [heel, tip], 1.75, C.leather);
    limb([[heel[0] - 0.2, heel[1], heel[2] - 0.55], [tip[0] + 0.2, tip[1], tip[2] - 0.55]], 0.5, C.leatherShade);
}

// --- TRONCO ---
// Corpo feminino: ombros estreitos, cintura fina, quadril largo. Top curto escuro (com faixa de couro embaixo do
// peito e pingente), barriga à mostra com umbigo, cinto de couro no quadril com a aba de pano branco e símbolo
// vermelho na frente, e o cachecol vermelho volumoso no pescoço.
function drawYaraTorso(rig, pose, bottom, top, wb, wt) {
    const { project, limb, disk, C, sinF } = rig;
    const front = Math.max(0, Math.min(1, sinF * 1.5 + 0.4));
    const baseAlpha = ctx.globalAlpha;
    const at = (z) => {
        const k = (z - bottom.z) / (top.z - bottom.z);
        return bottom.a + (top.a - bottom.a) * k;
    };
    const fa = (z) => at(z) + 2.4;

    // Quadril (calça)
    ctx.fillStyle = C.pants;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.4;
    disk([bottom.a, 0, bottom.z], [bottom.A * 1.1, 0, 0], [0, bottom.B * Y.hipScale, 0]);
    ctx.fill();
    ctx.stroke();

    // Pele: do quadril largo à cintura fina e aos ombros estreitos
    const zw = bottom.z + (top.z - bottom.z) * 0.45;
    const pb = project(bottom.a, 0, bottom.z);
    const pw = project(at(zw), 0, zw);
    const pt = project(top.a, 0, top.z);
    const hb = wb * Y.hipScale * 0.92;
    const hw = wb * Y.waistScale;
    const ht = wt * Y.shoulderScale;
    const sidePath = (h0, h1, h2, p0, p1, p2) => {
        ctx.beginPath();
        ctx.moveTo(p0.x - h0, p0.y);
        ctx.quadraticCurveTo(p1.x - h1, p1.y, p2.x - h2, p2.y);
        ctx.lineTo(p2.x + h2, p2.y);
        ctx.quadraticCurveTo(p1.x + h1, p1.y, p0.x + h0, p0.y);
        ctx.closePath();
    };
    ctx.fillStyle = C.skin;
    sidePath(hb, hw, ht, pb, pw, pt);
    ctx.fill();
    ctx.stroke();

    // Barriga: umbigo e linha suave do abdômen (de frente)
    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        limb([[fa(bottom.z + 1.6), 0, bottom.z + 1.6], [fa(bottom.z + 1.75), 0, bottom.z + 1.75]], 0.35, C.skinShade);
        limb([[fa(bottom.z + 2.4), 0, bottom.z + 2.4], [fa(zw + 1.2), 0, zw + 1.2]], 0.2, C.skinShade);
        ctx.globalAlpha = baseAlpha;
    }

    // Top curto: cobre o peito, da faixa de couro até os ombros
    const zc = top.z - 3.9;
    const kc = (zc - zw) / (top.z - zw);
    const pc = project(at(zc), 0, zc);
    const hc = hw + (ht - hw) * Math.min(1, kc + 0.25);
    ctx.fillStyle = C.top;
    ctx.beginPath();
    ctx.moveTo(pc.x - hc, pc.y);
    ctx.lineTo(pt.x - ht, pt.y);
    ctx.lineTo(pt.x + ht, pt.y);
    ctx.lineTo(pc.x + hc, pc.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        // Volume do peito: duas curvas suaves e um pouco de luz
        const zb = top.z - 2.2;
        for (const s of [-1, 1]) limb([[fa(zb) + 0.1, s * 0.9, zb + 0.1], [fa(zb) + 0.1, s * 1.3, zb + 0.15]], 0.4, '#4a524b');
        // Pingente triangular no decote
        const pd = project(fa(top.z - 1.4), 0, top.z - 1.4);
        ctx.fillStyle = C.pendant;
        ctx.beginPath();
        ctx.moveTo(pd.x - 0.45, pd.y - 0.25);
        ctx.lineTo(pd.x + 0.45, pd.y - 0.25);
        ctx.lineTo(pd.x, pd.y + 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = baseAlpha;
    }
    // Faixa de couro embaixo do peito e cinto no quadril: só a metade da frente do anel aparece
    const ringFront = (z, A, B, width, color) => {
        const c = project(at(z), 0, z);
        ctx.save();
        ctx.beginPath();
        ctx.rect(c.x - 20, c.y, 40, 20);
        ctx.clip();
        disk([at(z), 0, z], [A, 0, 0], [0, B, 0]);
        ctx.strokeStyle = C.outline;
        ctx.lineWidth = width + 0.45;
        ctx.stroke();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.restore();
    };
    ringFront(zc + 0.25, top.A * 0.8, top.B * Y.waistScale * 0.95, 0.4, C.leather);
    ringFront(bottom.z + 0.4, bottom.A * 1.1, bottom.B * Y.hipScale, 0.55, C.leather);

    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        // Fivela do cinto e a aba de pano branco com o símbolo vermelho
        const a0 = bottom.a + bottom.A * 1.12;
        const buckle = project(a0, 0.8, bottom.z + 0.4);
        ctx.fillStyle = C.buckle;
        ctx.fillRect(buckle.x - 0.45, buckle.y - 0.35, 0.9, 0.7);
        const fl = [[a0, -1.1, bottom.z], [a0, 1.1, bottom.z], [a0 + 0.2, 0.9, bottom.z - 2.6], [a0 + 0.25, 0, bottom.z - 3.4], [a0 + 0.2, -0.9, bottom.z - 2.6]].map(p => project(...p));
        ctx.fillStyle = C.flap;
        ctx.beginPath();
        fl.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 0.3;
        ctx.strokeStyle = C.flapMark;
        ctx.stroke();
        limb([[a0 + 0.2, -0.5, bottom.z - 1.1], [a0 + 0.25, 0, bottom.z - 2], [a0 + 0.2, 0.5, bottom.z - 1.1]], 0.3, C.flapMark);
        // Bolsinha de couro no quadril direito
        K.oball(rig, [bottom.a + bottom.A * 0.6, bottom.B * Y.hipScale * 0.95, bottom.z - 0.4], 0.8, C.leather);
        ctx.globalAlpha = baseAlpha;
    }

    // Cachecol vermelho volumoso no pescoço
    const scarf = [top.a + 0.1, 0, top.z + 0.6];
    ctx.fillStyle = C.cape;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.35;
    disk(scarf, [top.A * 0.9, 0, 0], [0, top.B * 0.62, 0]);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.capeFold;
    disk([scarf[0] - 0.2, 0, scarf[2] + 0.45], [top.A * 0.62, 0, 0], [0, top.B * 0.42, 0]);
    ctx.fill();
    ctx.fillStyle = C.capeEdge;
    disk([scarf[0] + 0.2, 0, scarf[2] + 0.85], [top.A * 0.5, 0, 0], [0, top.B * 0.36, 0]);
    ctx.fill();
}

// --- REGISTRO DO BONECO (lido por ../hunter/hero25d.js; interface em ../hunter/body_registry.js) ---
registerBody('yara', {
    vis: Y,
    idleArms: true,
    drawLeg: (rig, { hip, knee, ankle, toe }) => drawYaraLeg(rig, hip, knee, ankle, toe),
    drawTorso: (rig, pose, bottom, top, wb, wt) => drawYaraTorso(rig, pose, bottom, top, wb, wt),
    // Sem capa: no lugar dela, a ponta do cachecol voando
    drawBack: (rig, pose) => drawYaraScarfTail(rig, pose),
    // Em repouso segura a espada curta em pé, ponta para cima e um pouco para a frente (guarda), balançando de leve
    swordRest(rig, pose, { hand, dir, blend }) {
        const m = rig.mix(dir, [0.35 + Math.sin(pose.t * 1.3) * 0.08, 0.15, 0.92], 1 - blend);
        const size = Math.hypot(...m) || 1;
        return { hand, dir: m.map(v => v / size) };
    },
    drawArm: (rig, shoulder, elbow, hand, armWidth, handRadius) => drawYaraArm(rig, shoulder, elbow, hand, armWidth, handRadius),
    drawBlade: (rig, hand, dir, alpha) => drawShortSword(rig, hand, dir, alpha, Y),
    headParts: (pose, rig) => yaraHeadParts(pose, rig)
});
