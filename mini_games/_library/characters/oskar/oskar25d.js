import { OSKAR_VISUALS as O } from './oskar_visual.js';
import { registerBody } from '../hunter/body_registry.js';
import * as KIT from '../hunter/kit25d.js';
import { drawEar as azaelEar, wrap as azaelWrap } from '../azael/azael25d.js';
import { ctx } from '../../core/canvas.js';

// Geometria compartilhada (hunter/kit25d.js) e a orelha e a bandagem do Azael
const K = { ...KIT, drawEar: azaelEar, wrap: azaelWrap };

// --- OSKAR (herói 2.5D do palco) ---
// Peças do Oskar montadas na mesma câmera e com a mesma animação do boneco de ../hunter/hero25d.js: cabeça com rosto
// (barba cheia, sobrancelhas grossas, olhos claros), cabelo ralo e curto com entradas, regata verde-oliva com os
// ombros de fora, alça cruzando o peito, cinto, calça marrom-escura, botas com faixas e o machado de duas lâminas
// sempre nas duas mãos. Homem alto e massudo (o boneco inteiro é maior: bodyScale).
// Lados sempre do ponto de vista dele: direita = +b, esquerda = -b.
// A cabeça usa a mesma geometria do Azael (hunter/kit25d.js), no esquema do Zeph. Referência: art_reference/ (nesta pasta).
// rig: { project, projectVec, limb, ball, disk, anim, C, sinF, cosF }. Medidas e cores: oskar_visual.js.
const { mix, add, norm, dot, cross, sub } = K;

// Orelha humana: oval, no lado da cabeça, da sobrancelha até a base do nariz
function drawEar(rig, H, side, C) {
    const k = H.R / 3;
    const p = H.at(O.earX * k, side * H.R * 1.02, O.earY * k);
    const top = H.at((O.earX - 0.1) * k, side * H.R * 1.04, (O.earY + O.earSize) * k);
    const low = H.at((O.earX + 0.1) * k, side * H.R * 1.0, (O.earY - O.earSize) * k);
    K.olimb(rig, [top, p, low], O.earWidth, C.skin);
    rig.limb([mix(top, p, 0.4), mix(p, low, 0.5)].map(q => add(q, H.s, side * 0.08)), 0.3, C.skinShade);
}

// --- CABEÇA ---
// Linha do cabelo (latitude): alta na testa com entradas nos cantos, costeletas que viram barba, até a nuca
function hairLatAt(lon, latLine) {
    const back = Math.pow((1 - Math.cos(lon)) / 2, 1.6);
    let lat = latLine + (-1.0 - latLine) * back;
    // Entradas: a linha sobe nos cantos da testa
    lat += O.recede * Math.exp(-Math.pow((Math.abs(lon) - 0.65) / 0.3, 2));
    lat -= O.sideburn * Math.exp(-Math.pow((Math.abs(lon) - 1.25) / 0.18, 2));
    return lat;
}

function hairRadius(R, lon, lat) {
    return R * O.hairPuff * (1 + O.hairBumps * Math.sin(lon * 5 + 1.3) * Math.cos(lat * 2));
}

function oskarHeadParts(pose, rig) {
    const { project, C } = rig;
    const H = K.headFrame(pose, rig, O);
    const R = H.R;
    const latLine = Math.asin(O.hairline / 3);
    const head = {
        depth: project(...H.c).depth,
        draw() {
            const t = pose.t;
            const baseAlpha = ctx.globalAlpha;
            const vis = Math.max(0, Math.min(1, (H.frontVis + 0.05) / 0.3));
            const ears = [-1, 1].map(side => ({ side, near: dot([0, side, 0], H.d) > 0 }));
            ears.filter(e => !e.near).forEach(e => drawEar(rig, H, e.side, C));

            // Cabeça de pele com contorno
            K.silhouettePath(rig, H, R);
            ctx.fillStyle = C.skin;
            ctx.fill();
            ctx.strokeStyle = C.outline;
            ctx.lineWidth = 0.4;
            ctx.stroke();

            if (vis > 0) {
                ctx.globalAlpha = baseAlpha * vis;
                drawFace(rig, H, C, t);
                ctx.globalAlpha = baseAlpha;
            }

            // Cabelo ralo: malha colada na cabeça, um pouco transparente (a pele aparece por baixo)
            const NL = 56;
            const NV = 6;
            const cap = [];
            for (let i = 0; i <= NL; i++) {
                const lon = -Math.PI + (i / NL) * Math.PI * 2;
                const lh = hairLatAt(lon, latLine);
                const row = [];
                for (let j = 0; j <= NV; j++) {
                    const lat = lh + (Math.PI / 2 - lh) * (j / NV);
                    row.push(H.sphere(lon, lat, hairRadius(R, lon, lat)));
                }
                cap.push(row);
            }
            ctx.save();
            ctx.globalAlpha = baseAlpha * O.hairOpacity;
            ctx.fillStyle = C.hair;
            ctx.strokeStyle = C.hair;
            ctx.lineWidth = 0.16;
            ctx.lineJoin = 'round';
            const quads = [];
            for (let i = 0; i < NL; i++) {
                for (let j = 0; j < NV; j++) {
                    const q = [cap[i][j], cap[i + 1][j], cap[i + 1][j + 1], cap[i][j + 1]];
                    const mid = mix(mix(q[0], q[1], 0.5), mix(q[2], q[3], 0.5), 0.5);
                    if (H.facing(mid) < -0.05) continue;
                    quads.push({ q, depth: project(...mid).depth });
                }
            }
            quads.sort((a, b) => a.depth - b.depth);
            // Desenha a malha num caminho só (sem sobreposição de transparência entre os pedaços)
            ctx.beginPath();
            for (const { q } of quads) {
                const pq = q.map(p => project(...p));
                pq.forEach((p, k) => (k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
                ctx.closePath();
            }
            ctx.fill('nonzero');
            ctx.restore();
            ears.filter(e => e.near).forEach(e => drawEar(rig, H, e.side, C));

            // Contorno da cabeça por cima (o cabelo é rente, então a borda é a da cabeça) e a linha do cabelo, fina
            ctx.save();
            ctx.globalAlpha = baseAlpha * 0.6;
            K.strokeVisible(rig, H, cap.map(row => row[0]), 0.18, C.hairShade);
            ctx.restore();
        }
    };
    return [head];
}

// Rosto: mandíbula larga coberta pela barba cheia, sobrancelhas grossas e baixas, olhos claros e pequenos, nariz
// largo, boca séria no meio da barba
function drawFace(rig, H, C, t) {
    const { project } = rig;
    const fk = H.R / 3;
    const F = (sv, uv) => H.face(sv * fk, uv * fk);
    const P = (sv, uv) => project(...F(sv, uv));
    const shown = (sv, uv) => H.facing(F(sv, uv)) > 0.05;
    const visPt = (sv, uv) => project(...H.clampVisible(F(sv, uv)));

    const outline = [...O.face.map(([sv, uv]) => [-sv, uv]), ...[...O.face].reverse().slice(1)];
    const pts = outline.map(([sv, uv]) => visPt(sv, uv));
    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.closePath();
    ctx.fill();

    // Nariz largo
    const ny = O.noseY;
    if (shown(0, ny)) {
        K.strokeSmooth(rig, [F(-0.15, ny + O.noseLength / 2), F(-0.25, ny - 0.25)], 0.18, C.skinShade);
        K.strokeSmooth(rig, [F(-0.38, ny - 0.38), F(0.05, ny - 0.48), F(0.36, ny - 0.38)], 0.18, C.skinShade);
    }

    // Barba cheia: das costeletas, pela mandíbula, até abaixo do queixo; a parte de cima desce pelas bochechas até o
    // bigode. Fica à frente do rosto (o contorno de baixo é o da barba)
    const bw = O.beardWidth;
    const bt = O.beardTop;
    const my = O.mustacheY;
    const beard = [
        [-bw, bt], [-bw * 0.95, -1.4], [-bw * 0.82, -2.3], [-bw * 0.5, -3.05], [0, O.beardChin],
        [bw * 0.5, -3.05], [bw * 0.82, -2.3], [bw * 0.95, -1.4], [bw, bt],
        [bw * 0.78, -1.05], [bw * 0.45, -1.55], [0.7, my - 0.05], [0.3, my + 0.15], [0, my + 0.2], [-0.3, my + 0.15], [-0.7, my - 0.05], [-bw * 0.45, -1.55], [-bw * 0.78, -1.05]
    ].map(([sv, uv]) => visPt(sv, uv));
    ctx.fillStyle = C.beard;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.22;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(beard[0].x, beard[0].y);
    for (let i = 1; i < beard.length; i++) {
        const prev = beard[i - 1];
        const p = beard[i];
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + p.x) / 2, (prev.y + p.y) / 2);
    }
    ctx.closePath();
    ctx.fill();
    // Contorno só na parte de baixo da barba (do lado virado para a câmera)
    const low = [[-bw * 0.82, -2.3], [-bw * 0.5, -3.05], [0, O.beardChin], [bw * 0.5, -3.05], [bw * 0.82, -2.3]]
        .map(([sv, uv]) => F(sv, uv)).filter(p => H.facing(p) > 0.25);
    if (low.length > 1) K.strokeSmooth(rig, low, 0.24, C.outline);
    // Volume da barba: um lado um pouco mais escuro (luz de cima à esquerda)
    ctx.save();
    ctx.globalAlpha *= 0.4;
    const bs = [[bw * 0.2, -1.9], [bw * 0.95, -1.4], [bw * 0.82, -2.3], [bw * 0.5, -3.05], [bw * 0.15, -3.2]].map(([sv, uv]) => visPt(sv, uv));
    ctx.fillStyle = C.beardShade;
    ctx.beginPath();
    bs.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Boca: traço escuro e lábio de baixo no meio da barba
    if (shown(0, O.mouthY)) {
        K.strokeSmooth(rig, [F(-O.mouthWidth, O.mouthY + 0.02), F(0, O.mouthY - 0.02), F(O.mouthWidth, O.mouthY + 0.02)], 0.2, C.mouth);
    }

    const ex = O.eyeX;
    const ey = O.eyeY;
    const ew = O.eyeWidth;
    const eo = O.eyeOpen;
    const blink = (t % 4.2) > 4.05;
    for (const side of [-1, 1]) {
        if (!shown(side * ex, ey)) continue;
        if (blink) {
            K.strokeSmooth(rig, [F(side * (ex - ew), ey - 0.04), F(side * ex, ey - 0.09), F(side * (ex + ew), ey - 0.02)], 0.2, C.outline);
        } else {
            const inner = P(side * (ex - ew), ey - 0.03);
            const outer = P(side * (ex + ew), ey + 0.02);
            const top = P(side * ex, ey + eo);
            const bottom = P(side * ex, ey - eo);
            ctx.fillStyle = C.eyeWhite;
            ctx.beginPath();
            ctx.moveTo(inner.x, inner.y);
            ctx.quadraticCurveTo(top.x, top.y, outer.x, outer.y);
            ctx.quadraticCurveTo(bottom.x, bottom.y, inner.x, inner.y);
            ctx.fill();
            const e = P(side * ex, ey);
            const er = P(side * (ex + 0.2), ey);
            const rx = Math.max(0.07, Math.min(O.irisSize, Math.hypot(er.x - e.x, er.y - e.y)));
            ctx.fillStyle = C.eye;
            ctx.beginPath();
            ctx.ellipse(e.x, e.y, rx, O.irisSize, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#16100c';
            ctx.beginPath();
            ctx.ellipse(e.x, e.y, rx * 0.45, O.irisSize * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
            // Pálpebra pesada
            K.strokeSmooth(rig, [F(side * (ex - ew), ey - 0.02), F(side * ex, ey + eo * 0.9), F(side * (ex + ew + 0.02), ey + 0.03)], 0.2, C.outline);
        }
        // Sobrancelha grossa e baixa, franzida
        const by = ey + O.browY;
        K.strokeSmooth(rig, [F(side * (ex - O.browWidth), by - O.browTilt), F(side * (ex - 0.03), by + 0.02), F(side * (ex + O.browWidth), by)], O.browThickness, C.hairShade);
    }
    // Rugas da testa franzida (bem leves)
    if (shown(0, 0.6)) {
        ctx.save();
        ctx.globalAlpha *= 0.5;
        K.strokeSmooth(rig, [F(-0.25, ey + O.browY + 0.05), F(-0.1, ey + O.browY + 0.35)], 0.1, C.skinShade);
        K.strokeSmooth(rig, [F(0.25, ey + O.browY + 0.05), F(0.1, ey + O.browY + 0.35)], 0.1, C.skinShade);
        ctx.restore();
    }
}

// --- BRAÇOS E PERNAS ---
// Braço nu, grosso e musculoso (ombro e bíceps com luz), munhequeira de couro escuro e mão grande
function drawOskarArm(rig, shoulder, elbow, hand, armWidth, handRadius) {
    const { limb, ball, C } = rig;
    const sh = [shoulder[0], shoulder[1] * O.shoulderScale, shoulder[2]];
    const w = armWidth * O.armScale;
    // Ombro (deltoide) proporcional ao braço, braço grosso afinando até o pulso, cotovelo marcado
    K.oball(rig, sh, w * 0.55, C.skin);
    K.olimb(rig, [sh, elbow], w * 0.95, C.skin);
    K.olimb(rig, [elbow, mix(elbow, hand, 0.9)], w * 0.78, C.skin);
    ball(elbow, w * 0.4, C.skin);
    // Músculos: luz no ombro e no bíceps, sombra embaixo do antebraço (discretas)
    ball([sh[0] + 0.15, sh[1], sh[2] + 0.35], w * 0.24, C.skinLight);
    limb([mix(sh, elbow, 0.3), mix(sh, elbow, 0.7)].map(p => [p[0] + 0.25, p[1], p[2] + 0.3]), w * 0.24, C.skinLight);
    limb([mix(elbow, hand, 0.2), mix(elbow, hand, 0.7)].map(p => [p[0], p[1], p[2] - 0.3]), w * 0.2, C.skinShade);
    // Munhequeira
    K.olimb(rig, [mix(elbow, hand, 0.74), mix(elbow, hand, 0.9)], w * 0.84, C.wristband);
    // Mão redonda com o risco dos dedos e do polegar (kit25d.js, drawHand)
    K.drawHand(rig, elbow, hand, Math.sign(shoulder[1]) || 1, { color: C.skin, shade: C.skinShade, size: handRadius * O.handScale, grip: 1 });
}

// Perna: calça marrom-escura larga até a canela e bota de couro com faixas enroladas; pé chato no chão
function drawOskarLeg(rig, hip, knee, ankle, toe) {
    const { limb, C } = rig;
    const shin = mix(knee, ankle, 0.35);
    K.olimb(rig, [hip, knee], O.legWidth, C.pants);
    K.olimb(rig, [knee, shin], O.legWidth * 0.86, C.pants);
    limb([mix(hip, knee, 0.2), mix(hip, knee, 0.85)].map(p => [p[0] + 0.4, p[1], p[2]]), 0.28, C.pantsShade);
    // Bota com faixas: cano até abaixo do joelho, com voltas mais claras
    K.olimb(rig, [shin, ankle], O.legWidth * 0.78, C.boot);
    for (const q of [0.15, 0.4, 0.65]) limb([mix(shin, ankle, q - 0.05), mix(shin, ankle, q + 0.05)], O.legWidth * 0.8, C.wrap);
    const heel = [ankle[0] - 0.45, ankle[1], toe[2] + 0.35];
    const tip = [toe[0] - 0.45, toe[1], toe[2] + 0.35];
    K.olimb(rig, [ankle, heel], O.legWidth * 0.68, C.boot);
    K.olimb(rig, [heel, tip], 1.5, C.boot);
    limb([[heel[0] - 0.2, heel[1], heel[2] - 0.55], [tip[0] + 0.2, tip[1], tip[2] - 0.55]], 0.5, C.bootShade);
}

// --- TRONCO ---
// Peito e costas largos com o contorno arredondado (ombros e trapézio, sem cantos), regata verde-oliva com cavas e
// decote, alça de couro cruzando o peito do ombro esquerdo ao quadril direito, cinto com fivela e pescoço grosso
function drawOskarTorso(rig, pose, bottom, top, wb, wt) {
    const { project, limb, disk, C, sinF } = rig;
    const front = Math.max(0, Math.min(1, sinF * 1.5 + 0.4));
    const baseAlpha = ctx.globalAlpha;
    const at = (z) => bottom.a + (top.a - bottom.a) * ((z - bottom.z) / (top.z - bottom.z));
    const fa = (z) => at(z) + 2.7;

    // Quadril (calça)
    ctx.fillStyle = C.pants;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.4;
    ctx.lineJoin = 'round';
    disk([bottom.a, 0, bottom.z], [bottom.A * 1.15, 0, 0], [0, bottom.B * O.waistScale, 0]);
    ctx.fill();
    ctx.stroke();

    // Pontos do contorno na tela: cintura, peito (o mais largo), topo dos ombros
    const zb = bottom.z - 0.6;
    const zc = top.z - 2.4;
    const pb = project(at(zb), 0, zb);
    const pc = project(at(zc), 0, zc);
    const pt = project(top.a, 0, top.z);
    const hb = wb * O.waistScale;
    const ht = wt * O.shoulderScale;
    const hc = ht * 0.96;
    // Corpo de pele: sobe da cintura, abre no peito, arredonda nos ombros e desce pelo trapézio até o pescoço
    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.moveTo(pb.x - hb, pb.y);
    ctx.quadraticCurveTo(pb.x - hb * 1.06, (pb.y + pc.y) / 2, pc.x - hc, pc.y);
    ctx.quadraticCurveTo(pt.x - ht * 1.04, pt.y + 0.3, pt.x - ht * 0.66, pt.y - 0.8);
    ctx.quadraticCurveTo(pt.x, pt.y - 1.5, pt.x + ht * 0.66, pt.y - 0.8);
    ctx.quadraticCurveTo(pt.x + ht * 1.04, pt.y + 0.3, pc.x + hc, pc.y);
    ctx.quadraticCurveTo(pb.x + hb * 1.06, (pb.y + pc.y) / 2, pb.x + hb, pb.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Regata: cobre o tronco, com cavas fundas (ombros de fora), alças e decote em U
    const shirtPath = () => {
        ctx.beginPath();
        ctx.moveTo(pb.x - hb * 1.03, pb.y + 0.2);
        ctx.quadraticCurveTo(pb.x - hb * 1.07, (pb.y + pc.y) / 2, pc.x - hc * 0.9, pc.y + 0.2);
        ctx.quadraticCurveTo(pc.x - hc * 0.55, pc.y - 0.4, pt.x - ht * 0.5, pt.y - 0.95);
        ctx.lineTo(pt.x - ht * 0.28, pt.y - 1.1);
        ctx.quadraticCurveTo(pt.x, pt.y + 1.5, pt.x + ht * 0.28, pt.y - 1.1);
        ctx.lineTo(pt.x + ht * 0.5, pt.y - 0.95);
        ctx.quadraticCurveTo(pc.x + hc * 0.55, pc.y - 0.4, pc.x + hc * 0.9, pc.y + 0.2);
        ctx.quadraticCurveTo(pb.x + hb * 1.07, (pb.y + pc.y) / 2, pb.x + hb * 1.03, pb.y + 0.2);
        ctx.closePath();
    };
    shirtPath();
    ctx.fillStyle = C.shirt;
    ctx.fill();
    ctx.stroke();
    // Volume: o lado de lá da regata mais escuro (só dentro dela)
    ctx.save();
    shirtPath();
    ctx.clip();
    ctx.globalAlpha *= 0.4;
    ctx.fillStyle = C.shirtShade;
    ctx.fillRect(pt.x + ht * 0.25, pt.y - 3, ht * 2, pb.y - pt.y + 6);
    ctx.restore();
    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        // Peitoral marcado por baixo da regata e um remendo
        for (const s of [-1, 1]) limb([[fa(top.z - 2.6), s * 0.3, top.z - 2.6], [fa(top.z - 2.8), s * 2.2, top.z - 2.4]], 0.26, C.shirtShade);
        limb([[fa(top.z - 4.6), -1.3, top.z - 4.6], [fa(top.z - 4.6) + 0.01, -1.3, top.z - 4.6]], 0.8, C.patch);
        ctx.globalAlpha = baseAlpha;
    }

    // Cinto: só a metade da frente do anel aparece
    const ringFront = (z, A, B, width, color) => {
        const c = project(at(z), 0, z);
        ctx.save();
        ctx.beginPath();
        ctx.rect(c.x - 30, c.y, 60, 30);
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
    ringFront(bottom.z + 0.5, bottom.A * 1.15, bottom.B * O.waistScale, 0.7, C.leather);
    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        const buckle = project(bottom.a + bottom.A * 1.15, 0.2, bottom.z + 0.5);
        ctx.fillStyle = C.buckle;
        ctx.fillRect(buckle.x - 0.45, buckle.y - 0.35, 0.9, 0.7);
        ctx.globalAlpha = baseAlpha;
    }
    // Alça de couro: do ombro esquerdo, cruzando o peito (ou as costas), até o quadril direito
    const sgn = sinF > -0.2 ? 1 : -1;
    K.olimb(rig, [
        [top.a + sgn * top.A * 0.6, -top.B * O.shoulderScale * 0.45, top.z - 0.4],
        [at(top.z - 3) + sgn * 2.5, 0.3, top.z - 3],
        [bottom.a + sgn * bottom.A * 0.6, bottom.B * O.waistScale * 0.95, bottom.z + 0.3]
    ], 0.4, C.leather);

    // Pescoço grosso (a cabeça, desenhada depois, cobre o alto)
    K.olimb(rig, [[top.a + 0.2, 0, top.z - 0.4], [top.a + 0.6, 0, top.z + 2.3]], 2.0, C.skin);
    limb([[top.a + 0.3, 0.6, top.z + 0.2], [top.a + 0.55, 0.6, top.z + 1.9]], 0.4, C.skinShade);
}

// --- MACHADO DE DUAS LÂMINAS ---
// Cabo comprido de madeira e cabeça de ferro dupla (em forma de borboleta) na ponta, presa por uma amarração.
// hand = mão de baixo no cabo, dir = direção do cabo (do cabo para a cabeça). As lâminas ficam no plano que contém o
// cabo e uma direção entre a vertical e o lado (mostram largura de qualquer ângulo).
function drawOskarAxe(rig, hand, dir, alpha) {
    const { project, limb, C } = rig;
    const at = (d) => add(hand, dir, d);
    const L = O.bladeLength;
    const S = O.axeHeadSize;
    // Lâminas de pé (no plano do cabo com a vertical), como nas imagens; com o cabo em pé, ficam para os lados
    const side = norm([-dir[1], dir[0], 0]);
    let up = sub([0, 0, 1], dir.map(v => v * dir[2]));
    const perp = Math.hypot(...up) < 0.45 ? side : norm(up);
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    // Cabo
    K.olimb(rig, [at(-2.6), at(L + 0.3)], 0.75, C.haft);
    limb([at(-2.4), at(L - 2)].map(p => add(p, perp, 0.15)), 0.22, C.haftShade);
    // Cabeça dupla: uma lâmina para cada lado do cabo, mais larga no fio (curvo)
    const hc = L - 1.1;
    for (const s of [-1, 1]) {
        const q = (d, k) => project(...add(at(hc + d), perp, s * k));
        const shape = [q(-0.8, 0.35), q(-2.3, S * 0.95), q(-0.35, S * 1.1), q(1.6, S * 0.95), q(0.7, 0.35)];
        ctx.fillStyle = C.axeHead;
        ctx.strokeStyle = C.outline;
        ctx.lineWidth = 0.3;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(shape[0].x, shape[0].y);
        ctx.lineTo(shape[1].x, shape[1].y);
        ctx.quadraticCurveTo(shape[2].x, shape[2].y, shape[3].x, shape[3].y);
        ctx.lineTo(shape[4].x, shape[4].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Meio mais escuro e fio claro
        const m = [q(-0.6, 0.4), q(-1.45, S * 0.6), q(0.85, S * 0.6), q(0.5, 0.4)];
        ctx.fillStyle = C.axeDark;
        ctx.beginPath();
        m.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = C.axeEdge;
        ctx.lineWidth = 0.32;
        ctx.beginPath();
        const e1 = q(-2.1, S * 0.92);
        const e2 = q(-0.35, S * 1.05);
        const e3 = q(1.45, S * 0.92);
        ctx.moveTo(e1.x, e1.y);
        ctx.quadraticCurveTo(e2.x, e2.y, e3.x, e3.y);
        ctx.stroke();
    }
    // Amarração no encaixe
    limb([at(hc - 0.85), at(hc + 0.7)], 1.0, C.binding);
    limb([at(hc - 0.1), at(hc + 0.1)], 1.05, C.haftShade);
    ctx.globalAlpha = baseAlpha;
}

// --- REGISTRO DO BONECO (lido por ../hunter/hero25d.js; interface em ../hunter/body_registry.js) ---
registerBody('oskar', {
    vis: O,
    drawLeg: (rig, { hip, knee, ankle, toe }) => drawOskarLeg(rig, hip, knee, ankle, toe),
    drawTorso: (rig, pose, bottom, top, wb, wt) => drawOskarTorso(rig, pose, bottom, top, wb, wt),
    // Sem capa
    drawBack() {},
    // Em repouso segura o machado com as duas mãos, cabo deitado na frente da cintura e a cabeça para a frente e a
    // esquerda; sobe e desce devagar com a respiração. Correndo balança com a passada. No golpe vai para a varredura normal.
    swordRest(rig, pose, { hand, dir, blend }) {
        const k = 1 - blend;
        const st = rig.anim.stride;
        const restO = [
            pose.lean * 0.5 + 2.8 + Math.sin(st) * 0.35 * pose.run,
            2.6,
            rig.V.handHeight + 1.2 - pose.crouch + Math.sin(pose.t * 1.4) * 0.25 * (1 - pose.run) + Math.abs(Math.sin(st)) * 0.6 * pose.run
        ];
        const dirO = [0.75 + Math.sin(pose.t * 1.1) * 0.04 + Math.cos(st) * 0.12 * pose.run, -0.65, 0.12 + Math.sin(st) * 0.18 * pose.run];
        const h2 = rig.add3(rig.mix(hand, restO, k), O.rightHandOffset.map(v => v * k));
        const m = rig.mix(dir, rig.norm3(dirO), k);
        const size = Math.hypot(...m) || 1;
        return { hand: h2, dir: m.map(v => v / size) };
    },
    // Ombros e cotovelos têm ajustes próprios (some o do cotovelo no golpe); a mão livre fica no cabo do machado,
    // acima da outra (duas mãos), menos quando bebe a poção
    armTweak(rig, side, pose) {
        if (side > 0) return { shoulderOffset: O.rightShoulderOffset, elbowOffset: O.rightElbowOffset.map(v => v * (1 - pose.blend)) };
        return {
            shoulderOffset: O.leftShoulderOffset,
            elbowOffset: O.leftElbowOffset.map(v => v * (1 - pose.blend)),
            hand(hand) {
                if (pose.flask > 0) return hand;
                const grip = rig.swordArmPose(pose);
                return rig.add3(rig.add3(grip.hand, grip.dir.map(v => v * O.gripSpread)), O.leftHandOffset.map(v => v * (1 - pose.blend)));
            }
        };
    },
    drawArm: (rig, shoulder, elbow, hand, armWidth, handRadius) => drawOskarArm(rig, shoulder, elbow, hand, armWidth, handRadius),
    drawBlade: (rig, hand, dir, alpha) => drawOskarAxe(rig, hand, dir, alpha),
    headParts: (pose, rig) => oskarHeadParts(pose, rig)
});
