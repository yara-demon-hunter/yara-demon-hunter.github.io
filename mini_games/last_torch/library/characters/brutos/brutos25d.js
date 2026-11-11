// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/characters/brutos/brutos25d.js e rode o sync.
import { BRUTOS_VISUALS as O } from './brutos_visual.js';
import { HERO_25D_VISUALS as V } from '../hunter/hero25d_visual.js';
import { registerBody } from '../hunter/body_registry.js';
import * as K from '../hunter/kit25d.js';
import { ctx } from '../../core/canvas.js';

// --- CAPTAIN BRUTOS (semi-boss 2.5D) ---
// Peças do Capitão montadas na mesma câmera e com a mesma animação do boneco de ../hunter/hero25d.js: cabeça com
// rosto (cabelo curto preto, barba densa, cicatriz na parte de cima do rosto), armadura negra (ombreiras, peitoral de
// placas, cota de malha aparecendo no colar e na saia), braços grossos com braçadeiras, calça de couro, joelheiras e
// grevas de ferro, capa preta longa (a padrão, com as cores dele) e o machado de duas lâminas sempre nas duas mãos.
// Lados sempre do ponto de vista dele: direita = +b, esquerda = -b.
// A cabeça usa a mesma geometria do Azael (../hunter/kit25d.js). Referência: art_reference/ (nesta pasta).
// rig: { project, projectVec, limb, ball, disk, anim, C, sinF, cosF, ... }. Medidas e cores: brutos_visual.js.
const { mix, add, norm, dot, sub } = K;

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
// Linha do cabelo (latitude): baixa na testa, costeletas que viram barba, até a nuca
function hairLatAt(lon, latLine) {
    const back = Math.pow((1 - Math.cos(lon)) / 2, 1.6);
    let lat = latLine + (O.hairNape - latLine) * back;
    lat += O.recede * Math.exp(-Math.pow((Math.abs(lon) - 0.65) / 0.3, 2));
    lat -= O.sideburn * Math.exp(-Math.pow((Math.abs(lon) - 1.25) / 0.18, 2));
    return lat;
}

function hairRadius(R, lon, lat) {
    return R * O.hairPuff * (1 + O.hairBumps * Math.sin(lon * 5 + 1.3) * Math.cos(lat * 2));
}

function brutosHeadParts(pose, rig) {
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

            // Cabelo curto preto: malha colada na cabeça
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

            // Linha do cabelo, fina
            ctx.save();
            ctx.globalAlpha = baseAlpha * 0.6;
            K.strokeVisible(rig, H, cap.map(row => row[0]), 0.18, C.hairShade);
            ctx.restore();
        }
    };
    return [head];
}

// Rosto: mandíbula larga coberta pela barba densa, sobrancelhas grossas e baixas, olhos pequenos, nariz largo, boca
// séria no meio da barba e a cicatriz cortando a parte de cima
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

    // Barba densa: das costeletas, pela mandíbula, até abaixo do queixo; a parte de cima desce pelas bochechas até o
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
    // Volume da barba: um lado um pouco mais escuro
    ctx.save();
    ctx.globalAlpha *= 0.5;
    const bs = [[bw * 0.2, -1.9], [bw * 0.95, -1.4], [bw * 0.82, -2.3], [bw * 0.5, -3.05], [bw * 0.15, -3.2]].map(([sv, uv]) => visPt(sv, uv));
    ctx.fillStyle = C.beardShade;
    ctx.beginPath();
    bs.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Boca: traço escuro no meio da barba
    if (shown(0, O.mouthY)) {
        K.strokeSmooth(rig, [F(-O.mouthWidth, O.mouthY + 0.02), F(0, O.mouthY - 0.02), F(O.mouthWidth, O.mouthY + 0.02)], 0.2, C.mouth);
    }

    const ex = O.eyeX;
    const ey = O.eyeY;
    const ew = O.eyeWidth;
    const eo = O.eyeOpen;
    const blink = (t % 5) > 4.88;
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
            ctx.fillStyle = '#0c0907';
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

    // Cicatriz profunda: do alto da testa, atravessando a sobrancelha e o olho direito, até a bochecha
    const scar = O.scar.map(([sv, uv]) => F(sv, uv)).filter(p => H.facing(p) > 0.05);
    if (scar.length > 1) {
        K.strokeSmooth(rig, scar, O.scarWidth, C.scar);
        ctx.save();
        ctx.globalAlpha *= 0.7;
        K.strokeSmooth(rig, scar.map(p => add(p, H.s, 0.1)), O.scarWidth * 0.3, C.scarLight);
        ctx.restore();
    }
}

// --- BRAÇOS E PERNAS ---
// Braço grosso: ombreira de ferro no ombro, bíceps de pele, braçadeira de armadura no antebraço e mão grande
function drawBrutosArm(rig, shoulder, elbow, hand, armWidth, handRadius) {
    const { limb, ball, C } = rig;
    const sh = [shoulder[0], shoulder[1] * O.shoulderScale, shoulder[2]];
    const w = armWidth * O.armScale;
    // Bíceps e antebraço de pele
    K.olimb(rig, [sh, elbow], w * 0.95, C.skin);
    K.olimb(rig, [elbow, mix(elbow, hand, 0.9)], w * 0.78, C.skin);
    ball(elbow, w * 0.4, C.skin);
    limb([mix(sh, elbow, 0.35), mix(sh, elbow, 0.75)].map(p => [p[0] + 0.25, p[1], p[2] + 0.3]), w * 0.22, C.skinLight);
    // Braçadeira de armadura (do meio do antebraço até o pulso), com uma linha de luz
    K.olimb(rig, [mix(elbow, hand, 0.2), mix(elbow, hand, 0.88)], w * 0.95, C.armor);
    limb([mix(elbow, hand, 0.25), mix(elbow, hand, 0.82)].map(p => [p[0], p[1], p[2] + 0.35]), w * 0.2, C.armorLight);
    limb([mix(elbow, hand, 0.62), mix(elbow, hand, 0.66)], w * 1.0, C.armorEdge);
    // Ombreira: cúpula de placas sobre o ombro, com frisos e luz em cima
    const pr = w * O.pauldronScale;
    K.oball(rig, [sh[0], sh[1], sh[2] + 0.2], pr, C.armor);
    for (const k of [0.3, 0.6]) {
        const a = [sh[0] + 0.1, sh[1] + Math.sign(sh[1] || 1) * pr * 0.2, sh[2] + 0.2 + pr * (0.7 - k)];
        limb([[a[0] - pr * 0.6, a[1], a[2]], [a[0] + pr * 0.6, a[1], a[2]]], 0.3, C.armorShade);
    }
    ball([sh[0] + 0.2, sh[1], sh[2] + pr * 0.55], pr * 0.32, C.armorLight);
    // Mão: palma e dedos fechados no cabo
    const d = norm(sub(hand, elbow));
    K.oball(rig, hand, handRadius * 0.62, C.skin);
    K.olimb(rig, [add(hand, d, 0.3), add(hand, d, 0.75)], handRadius * 0.82, C.skin);
    limb([add(hand, d, 0.52), add(hand, d, 0.54)], handRadius * 0.86, C.skinShade);
}

// Perna: calça de couro na coxa, joelheira de ferro, greva escura até o tornozelo e bota reforçada
function drawBrutosLeg(rig, hip, knee, ankle, toe) {
    const { limb, ball, C } = rig;
    K.olimb(rig, [hip, knee], O.legWidth, C.body);
    limb([mix(hip, knee, 0.2), mix(hip, knee, 0.85)].map(p => [p[0] + 0.4, p[1], p[2]]), 0.28, C.pantsShade);
    // Joelheira
    K.oball(rig, [knee[0] + 0.5, knee[1], knee[2]], O.legWidth * 0.62, C.iron);
    ball([knee[0] + 0.9, knee[1], knee[2] + 0.5], O.legWidth * 0.26, C.ironLight);
    // Greva: do joelho até o tornozelo, com tiras de couro
    const top = mix(knee, ankle, 0.22);
    K.olimb(rig, [top, ankle], O.legWidth * 0.9, C.armor);
    limb([mix(top, ankle, 0.1), mix(top, ankle, 0.85)].map(p => [p[0] + 0.5, p[1], p[2]]), 0.3, C.ironLight);
    for (const q of [0.3, 0.62]) limb([mix(top, ankle, q - 0.04), mix(top, ankle, q + 0.04)], O.legWidth * 0.95, C.leather);
    // Bota reforçada, pé chato no chão
    const heel = [ankle[0] - 0.45, ankle[1], toe[2] + 0.35];
    const tip = [toe[0] - 0.2, toe[1], toe[2] + 0.35];
    K.olimb(rig, [ankle, heel], O.legWidth * 0.7, C.boots);
    K.olimb(rig, [heel, tip], 1.7, C.boots);
    limb([[heel[0] - 0.2, heel[1], heel[2] - 0.55], [tip[0] + 0.2, tip[1], tip[2] - 0.55]], 0.5, C.armorShade);
}

// --- TRONCO ---
// Peito e costas largos com o contorno arredondado, peitoral de placas escuras, colar de cota de malha, cinto de couro
// com fivela, saia de cota de malha na frente e pescoço grosso
function drawBrutosTorso(rig, pose, bottom, top, wb, wt) {
    const { project, limb, disk, C, sinF } = rig;
    const front = Math.max(0, Math.min(1, sinF * 1.5 + 0.4));
    const baseAlpha = ctx.globalAlpha;
    const at = (z) => bottom.a + (top.a - bottom.a) * ((z - bottom.z) / (top.z - bottom.z));
    const fa = (z) => at(z) + 2.8;

    // Quadril (calça de couro)
    ctx.fillStyle = C.body;
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
    // Corpo de armadura: sobe da cintura, abre no peito, arredonda nos ombros e desce pelo trapézio até o pescoço
    const bodyPath = () => {
        ctx.beginPath();
        ctx.moveTo(pb.x - hb, pb.y);
        ctx.quadraticCurveTo(pb.x - hb * 1.06, (pb.y + pc.y) / 2, pc.x - hc, pc.y);
        ctx.quadraticCurveTo(pt.x - ht * 1.04, pt.y + 0.3, pt.x - ht * 0.66, pt.y - 0.8);
        ctx.quadraticCurveTo(pt.x, pt.y - 1.5, pt.x + ht * 0.66, pt.y - 0.8);
        ctx.quadraticCurveTo(pt.x + ht * 1.04, pt.y + 0.3, pc.x + hc, pc.y);
        ctx.quadraticCurveTo(pb.x + hb * 1.06, (pb.y + pc.y) / 2, pb.x + hb, pb.y);
        ctx.closePath();
    };
    bodyPath();
    ctx.fillStyle = C.armor;
    ctx.fill();
    ctx.stroke();
    // Volume: o lado de lá mais escuro (só dentro do corpo)
    ctx.save();
    bodyPath();
    ctx.clip();
    ctx.globalAlpha *= 0.55;
    ctx.fillStyle = C.armorShade;
    ctx.fillRect(pt.x + ht * 0.2, pt.y - 3, ht * 2, pb.y - pt.y + 6);
    ctx.restore();

    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        // Peitoral articulado: costura no meio, placas inclinadas, luz no alto
        limb([[fa(top.z - 2.2), 0, top.z - 2.2], [fa(zb + 1.2), 0, zb + 1.2]], 0.26, C.armorShade);
        for (const s of [-1, 1]) {
            limb([[fa(top.z - 2.6), s * 0.4, top.z - 2.6], [fa(top.z - 4.4), s * 2.6, top.z - 4.0]], 0.26, C.armorShade);
            limb([[fa(top.z - 4.6), s * 0.4, top.z - 4.6], [fa(top.z - 6.4), s * 2.4, top.z - 6.0]], 0.26, C.armorShade);
            limb([[fa(top.z - 2.2), s * 0.8, top.z - 2.4], [fa(top.z - 2.5), s * 2.6, top.z - 2.5]], 0.34, C.armorLight);
        }
        // Rebites
        for (const s of [-1, 1]) rig.ball([fa(top.z - 3.2), s * 3.1, top.z - 3.2], 0.24, C.armorEdge);
        ctx.globalAlpha = baseAlpha;
    }

    // Colar de cota de malha em volta do pescoço (aparece entre as ombreiras)
    ctx.fillStyle = C.mail;
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y - 0.7, ht * 0.5, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = C.mailShade;
    ctx.lineWidth = 0.22;
    ctx.stroke();

    // Cinto de couro: só a metade da frente do anel aparece
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
    ringFront(bottom.z + 0.5, bottom.A * 1.15, bottom.B * O.waistScale, 0.9, C.leather);
    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        const buckle = project(bottom.a + bottom.A * 1.15, 0.2, bottom.z + 0.5);
        ctx.fillStyle = C.buckle;
        ctx.fillRect(buckle.x - 0.6, buckle.y - 0.45, 1.2, 0.9);
        // Saia de cota de malha pendurada do cinto, na frente (trama de pontinhos)
        const zl = bottom.z - 3.4;
        const sA = bottom.a + bottom.A * 1.1;
        const s1 = project(sA, -bottom.B * 0.8, bottom.z + 0.2);
        const s2 = project(sA, bottom.B * 0.8, bottom.z + 0.2);
        const s3 = project(sA + 0.3, bottom.B * 0.35, zl);
        const s4 = project(sA + 0.3, -bottom.B * 0.35, zl);
        ctx.fillStyle = C.mail;
        ctx.strokeStyle = C.outline;
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.lineTo(s3.x, s3.y);
        ctx.lineTo(s4.x, s4.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = C.mailShade;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 5; c++) {
                const u = (c + (r % 2) * 0.5 + 0.5) / 5.5;
                const v = (r + 0.7) / 3.4;
                const px = s1.x + (s2.x - s1.x) * u + (s4.x - s1.x) * v * 0.5 + (s3.x - s2.x) * v * 0.5 * u;
                const py = s1.y + (s4.y - s1.y) * v;
                ctx.fillRect(px - 0.2, py - 0.2, 0.4, 0.4);
            }
        }
        ctx.globalAlpha = baseAlpha;
    }

    // Pescoço grosso (a cabeça, desenhada depois, cobre o alto)
    K.olimb(rig, [[top.a + 0.2, 0, top.z - 0.2], [top.a + 0.6, 0, top.z + 2.3]], 2.2, C.skin);
    limb([[top.a + 0.3, 0.6, top.z + 0.2], [top.a + 0.55, 0.6, top.z + 1.9]], 0.4, C.skinShade);
}

// --- MACHADO DE DUAS LÂMINAS ---
// Cabo longo de madeira reforçada e cabeça de aço dupla (em forma de borboleta) na ponta, presa por uma amarração.
// hand = mão de baixo no cabo, dir = direção do cabo (do cabo para a cabeça). As lâminas ficam no plano que contém o
// cabo e uma direção entre a vertical e o lado (mostram largura de qualquer ângulo).
function drawAxe(rig, hand, dir, alpha) {
    const { project, limb, C } = rig;
    const at = (d) => add(hand, dir, d);
    const L = O.bladeLength;
    const S = O.axeHeadSize;
    const side = norm([-dir[1], dir[0], 0]);
    const up = sub([0, 0, 1], dir.map(v => v * dir[2]));
    const perp = Math.hypot(...up) < 0.45 ? side : norm(up);
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    // Cabo, com a ponteira de ferro na ponta de baixo
    K.olimb(rig, [at(-2.6), at(L + 0.3)], 0.8, C.haft);
    limb([at(-2.4), at(L - 2)].map(p => add(p, perp, 0.15)), 0.22, C.haftShade);
    limb([at(-2.8), at(-2.2)], 1.1, C.binding);
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
    // Colar de aço e amarração no encaixe
    limb([at(hc - 0.85), at(hc + 0.7)], 1.1, C.axeEdge);
    limb([at(hc - 0.1), at(hc + 0.1)], 1.1, C.binding);
    ctx.globalAlpha = baseAlpha;
}

// --- REGISTRO DO BONECO (lido por ../hunter/hero25d.js; interface em ../hunter/body_registry.js) ---
const add3 = (p, q) => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];

// Em repouso segura o machado com as duas mãos, cabo deitado na frente da cintura e a cabeça para a frente e a
// esquerda; sobe e desce devagar com a respiração. Andando balança com a passada. No golpe vai para a varredura normal.
function swordRest(rig, pose, { hand, dir, blend }) {
    const k = 1 - blend;
    const st = rig.anim.stride;
    const restO = [
        pose.lean * 0.5 + 2.8 + Math.sin(st) * 0.35 * pose.run,
        2.6,
        V.handHeight + 1.2 - pose.crouch + Math.sin(pose.t * 1.4) * 0.25 * (1 - pose.run) + Math.abs(Math.sin(st)) * 0.6 * pose.run
    ];
    const dirO = [0.75 + Math.sin(pose.t * 1.1) * 0.04 + Math.cos(st) * 0.12 * pose.run, -0.65, 0.12 + Math.sin(st) * 0.18 * pose.run];
    const h2 = add3(mix(hand, restO, k), O.rightHandOffset.map(v => v * k));
    const m = mix(dir, norm(dirO), k);
    const size = Math.hypot(...m) || 1;
    return { hand: h2, dir: m.map(v => v / size) };
}

// Braço livre (esquerdo): a mão fica no cabo do machado, acima da outra (duas mãos). Só sai dele quando o jogo manda
// a mão fazer outra coisa (arremesso, feitiço), o que o Brutos não faz.
function freeArm(rig, pose, { hand, throwK, charge, fireHold, cast }) {
    const sw = rig.swordArmPose(pose);
    const grip = add3(add3(sw.hand, sw.dir.map(v => v * O.gripSpread)), O.leftHandOffset.map(v => v * (1 - pose.blend)));
    const act = Math.max(
        throwK >= 0 ? Math.min(1, Math.sin(Math.PI * throwK) * 4) : 0,
        charge > 0 || fireHold > 0 ? Math.min(1, Math.max(charge, fireHold) * 4) : 0,
        cast
    );
    const shoulder = add3([pose.lean, -V.chest.B, pose.shoulderZ - 0.5], O.leftShoulderOffset);
    const h = mix(grip, hand, act);
    const elbow = add3([(shoulder[0] + h[0]) / 2 - 0.4, -V.chest.B - 1, (shoulder[2] + h[2]) / 2 + (throwK >= 0 ? 0.8 : 0)], O.leftElbowOffset.map(v => v * (1 - pose.blend)));
    return { shoulder, hand: h, elbow };
}

// Braço da espada (direito): leva o machado; no golpe vai com a varredura
function swordArmPart(rig, pose) {
    const { hand } = rig.swordArmPose(pose);
    const shoulder = add3([pose.lean, V.chest.B, pose.shoulderZ - 0.5], O.rightShoulderOffset);
    const elbow = add3([(shoulder[0] + hand[0]) / 2 + 0.6, (shoulder[1] + hand[1]) / 2 + 1, (shoulder[2] + hand[2]) / 2], O.rightElbowOffset.map(v => v * (1 - pose.blend)));
    return {
        depth: rig.project(...elbow).depth + 0.1,
        draw() {
            drawBrutosArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
        }
    };
}

registerBody('brutos', {
    vis: O,
    drawLeg: (rig, { hip, knee, ankle, toe }) => drawBrutosLeg(rig, hip, knee, ankle, toe),
    drawTorso: (rig, pose, bottom, top, wb, wt) => drawBrutosTorso(rig, pose, bottom, top, wb, wt),
    // A capa padrão (preta, com as cores dele), sem as pontas da faixa da cintura
    drawBack: (rig, pose, anchors, hem) => rig.drawCapeShape(anchors, hem),
    freeArm,
    drawArm: (rig, shoulder, elbow, hand, armWidth, handRadius) => drawBrutosArm(rig, shoulder, elbow, hand, armWidth, handRadius),
    swordArmPart,
    swordRest,
    drawBlade: (rig, hand, dir, alpha) => drawAxe(rig, hand, dir, alpha),
    headParts: (pose, rig) => brutosHeadParts(pose, rig)
});
