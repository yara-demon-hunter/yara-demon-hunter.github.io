// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/characters/avgustino/avgustino25d.js e rode o sync.
import { AVGUSTINO_VISUALS as O } from './avgustino_visual.js';
import { registerBody } from '../hunter/body_registry.js';
import * as KIT from '../hunter/kit25d.js';
import { drawEar as azaelEar, wrap as azaelWrap } from '../azael/azael25d.js';
import { HERO_25D_VISUALS as V } from '../hunter/hero25d_visual.js';
import { ctx } from '../../core/canvas.js';
import { drawShortSword } from '../../weapons/short_sword/short_sword.js';

// Geometria compartilhada (hunter/kit25d.js) e a orelha e a bandagem do Azael
const K = { ...KIT, drawEar: azaelEar, wrap: azaelWrap };

// --- PADRE AVGUSTINO (herói 2.5D) ---
// Peças do Avgustino montadas na mesma câmera e com a mesma animação do boneco de ../hunter/hero25d.js: cabeça pálida e
// magra com óculos redondos escuros, bigode fino e cavanhaque grisalhos, chapéu preto de abas largas; sobretudo/batina longo, preso na cintura, que cai até a canela em três peças (costas e duas abas na frente que abrem
// ao andar; não é capa), camisa preta abotoada com o crucifixo prateado, calça e botas pretas, e uma
// lâmina de prata benta (espada curta). Lados sempre do ponto de vista dele: direita = +b.
// A cabeça usa a mesma geometria do Oskar e do Rowan (cabeça de pele, rosto virando para a câmera).
// Referência: art_reference/ (nesta pasta). rig: { project, projectVec, limb, ball, disk, anim, C, sinF, cosF }.
// Medidas e cores: avgustino_visual.js.
const { mix, add, norm, dot, cross, sub } = K;

// Orelha humana pequena, rente à cabeça
function drawRoundEar(rig, H, side, C) {
    const k = H.R / 3;
    const p = H.at(O.earX * k, side * H.R * 1.02, O.earY * k);
    const top = H.at((O.earX - 0.1) * k, side * H.R * 1.04, (O.earY + O.earSize) * k);
    const low = H.at((O.earX + 0.1) * k, side * H.R * 1.0, (O.earY - O.earSize) * k);
    K.olimb(rig, [top, p, low], O.earWidth, C.skin);
    rig.limb([mix(top, p, 0.4), mix(p, low, 0.5)].map(q => add(q, H.s, side * 0.08)), 0.3, C.skinShade);
}

// --- CABEÇA ---
// Cabelo grisalho curto: só as têmporas e a nuca aparecem (o resto fica sob o chapéu)
function hairLatAt(lon, latLine) {
    const back = Math.pow((1 - Math.cos(lon)) / 2, 1.4);
    let lat = latLine + (-0.9 - latLine) * back;
    lat -= O.sideburn * Math.exp(-Math.pow((Math.abs(lon) - 1.25) / 0.18, 2));
    return lat;
}

function avgustinoHeadParts(pose, rig) {
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
            ears.filter(e => !e.near).forEach(e => drawRoundEar(rig, H, e.side, C));

            // Pescoço fino (a gola do sobretudo cobre a base) e a cabeça de pele com contorno
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

            // Cabelo grisalho: malha colada na cabeça, abaixo da linha do chapéu
            const NL = 48;
            const NV = 5;
            const cap = [];
            for (let i = 0; i <= NL; i++) {
                const lon = -Math.PI + (i / NL) * Math.PI * 2;
                const lh = hairLatAt(lon, latLine);
                const row = [];
                for (let j = 0; j <= NV; j++) {
                    const lat = lh + (Math.PI / 2 - lh) * (j / NV);
                    row.push(H.sphere(lon, lat, R * O.hairPuff * (1 + O.hairBumps * Math.sin(lon * 5 + 1.3))));
                }
                cap.push(row);
            }
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
            ctx.save();
            ctx.fillStyle = C.hair;
            ctx.strokeStyle = C.hair;
            ctx.lineWidth = 0.16;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            for (const { q } of quads) {
                const pq = q.map(p => project(...p));
                pq.forEach((p, k) => (k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
                ctx.closePath();
            }
            ctx.fill('nonzero');
            ctx.restore();
            ears.filter(e => e.near).forEach(e => drawRoundEar(rig, H, e.side, C));

            drawHat(rig, H, C);
        }
    };
    return [head];
}

// Chapéu preto de abas largas (fedora): aba que desce um pouco na frente, copa alta com a fita escura
function drawHat(rig, H, C) {
    const { project } = rig;
    const R = H.R;
    const ring = (radius, z, droop = 0, n = 28) => {
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            pts.push(project(...H.at(Math.cos(a) * radius * R, Math.sin(a) * radius * R, (z - droop * Math.cos(a)) * R)));
        }
        return pts;
    };
    const fillRing = (pts, color, edge = C.outline, w = 0.3) => {
        ctx.beginPath();
        pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        if (edge) {
            ctx.strokeStyle = edge;
            ctx.lineWidth = w;
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
    };
    const z0 = O.hatBrimZ;
    // Aba (sombra por baixo, depois a face de cima)
    fillRing(ring(O.hatBrim, z0 - 0.06, O.hatBrimDroop), C.hatShade);
    fillRing(ring(O.hatBrim * 0.985, z0, O.hatBrimDroop), C.hat);
    // Copa: anéis do pé ao topo, cada um por cima do anterior
    const h = O.hatCrownHeight;
    const steps = 7;
    for (let i = 0; i <= steps; i++) {
        const k = i / steps;
        const r = O.hatCrownRadius * (1.02 - 0.1 * k);
        fillRing(ring(r, z0 + h * k * 0.97), i % 2 ? C.hat : C.hatShade, null);
    }
    // Fita escura na base da copa
    const bandTop = z0 + O.hatBandHeight;
    for (let i = 0; i <= 3; i++) fillRing(ring(O.hatCrownRadius * 1.02, z0 + (bandTop - z0) * (i / 3)), C.hatBand, null);
    // Topo da copa, com o vinco do meio
    fillRing(ring(O.hatCrownRadius * 0.8, z0 + h), C.hatLight);
    const crease = [project(...H.at(-0.7 * R, 0, (z0 + h + 0.01) * R)), project(...H.at(0.7 * R, 0, (z0 + h + 0.01) * R))];
    ctx.strokeStyle = C.hatShade;
    ctx.lineWidth = 0.28;
    ctx.beginPath();
    ctx.moveTo(crease[0].x, crease[0].y);
    ctx.lineTo(crease[1].x, crease[1].y);
    ctx.stroke();
}

// Rosto: pálido e magro, óculos redondos escuros, bigode fino e cavanhaque grisalhos, boca séria
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

    // Bochechas fundas (sombra leve) e nariz fino
    ctx.save();
    ctx.globalAlpha *= 0.5;
    for (const s of [-1, 1]) {
        if (shown(s * 1.3, -1.7)) K.strokeSmooth(rig, [F(s * 1.45, -1.0), F(s * 1.2, -1.9), F(s * 0.9, -2.5)], 0.35, C.skinShade);
    }
    ctx.restore();
    const ny = O.noseY;
    if (shown(0, ny)) {
        K.strokeSmooth(rig, [F(-0.1, ny + O.noseLength / 2), F(-0.18, ny - 0.25)], 0.16, C.skinShade);
        K.strokeSmooth(rig, [F(-0.28, ny - 0.36), F(0.04, ny - 0.44), F(0.26, ny - 0.36)], 0.16, C.skinShade);
    }

    // Boca séria
    if (shown(0, O.mouthY)) {
        K.strokeSmooth(rig, [F(-O.mouthWidth, O.mouthY), F(0, O.mouthY - 0.04), F(O.mouthWidth, O.mouthY)], 0.18, C.mouth);
    }
    // Cavanhaque: pequeno tufo no queixo
    const gy = O.mouthY - 0.4;
    const gl = O.goateeLength;
    const gw = O.goateeWidth;
    const goatee = [[-gw, gy], [-gw * 0.8, gy - gl * 0.7], [0, gy - gl], [gw * 0.8, gy - gl * 0.7], [gw, gy], [0, gy + 0.2]].map(([sv, uv]) => visPt(sv, uv));
    ctx.fillStyle = C.beard;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(goatee[0].x, goatee[0].y);
    for (let i = 1; i < goatee.length; i++) {
        const prev = goatee[i - 1];
        const p = goatee[i];
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + p.x) / 2, (prev.y + p.y) / 2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Bigode fino, caído nos cantos da boca
    const my = O.mustacheY;
    const mw = O.mustacheWidth;
    if (shown(0, my)) {
        for (const s of [-1, 1]) K.strokeSmooth(rig, [F(0, my + 0.05), F(s * mw * 0.5, my + 0.12), F(s * mw, my - 0.2), F(s * mw * 1.05, my - 0.55)], 0.3, C.beard);
        K.strokeSmooth(rig, [F(-mw * 0.9, my - 0.3), F(0, my - 0.12), F(mw * 0.9, my - 0.3)], 0.12, C.beardShade);
    }

    // Óculos redondos escuros: lentes pretas com aro fino e uma ponte no nariz; hastes até as orelhas
    const lx = O.lensX;
    const ly = O.lensY;
    const lr = O.lensSize;
    for (const side of [-1, 1]) {
        if (!shown(side * lx, ly)) continue;
        const c = P(side * lx, ly);
        const e = P(side * (lx + lr), ly);
        const u = P(side * lx, ly + lr);
        const rx = Math.max(0.15, Math.hypot(e.x - c.x, e.y - c.y));
        const ry = Math.max(0.15, Math.hypot(u.x - c.x, u.y - c.y));
        const ang = Math.atan2(e.y - c.y, e.x - c.x);
        ctx.fillStyle = C.lens;
        ctx.strokeStyle = C.frame;
        ctx.lineWidth = 0.28;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, rx, ry, ang, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Reflexo no canto da lente
        const g = P(side * (lx - lr * 0.35), ly + lr * 0.4);
        ctx.fillStyle = C.lensGlint;
        ctx.beginPath();
        ctx.ellipse(g.x, g.y, rx * 0.2, ry * 0.12, ang, 0, Math.PI * 2);
        ctx.fill();
        // Haste
        if (shown(side * (lx + lr), ly)) K.strokeSmooth(rig, [F(side * (lx + lr), ly + 0.1), F(side * (lx + lr + 0.55), ly + 0.1)], 0.14, C.frame);
    }
    if (shown(0, ly)) K.strokeSmooth(rig, [F(-(lx - lr), ly + 0.05), F(0, ly + 0.12), F(lx - lr, ly + 0.05)], 0.16, C.frame);
}

// --- BRAÇOS E PERNAS ---
// Manga do sobretudo até o pulso, punho mais escuro e mão pálida
function drawAvgustinoArm(rig, shoulder, elbow, hand, armWidth, handRadius) {
    const { limb, ball, C } = rig;
    const sh = [shoulder[0], shoulder[1] * O.shoulderScale, shoulder[2]];
    const w = armWidth * O.armScale;
    // Ombro estruturado (ombreira do sobretudo), manga reta e cotovelo marcado
    K.oball(rig, sh, w * 0.62, C.coat);
    K.olimb(rig, [sh, elbow], w * 1.0, C.coat);
    K.olimb(rig, [elbow, mix(elbow, hand, 0.86)], w * 0.9, C.coat);
    ball(elbow, w * 0.45, C.coat);
    // Luz no ombro e dobra do pano no cotovelo
    ball([sh[0] + 0.15, sh[1], sh[2] + 0.35], w * 0.2, C.coatLight);
    limb([mix(sh, elbow, 0.25), mix(sh, elbow, 0.75)].map(p => [p[0] + 0.25, p[1], p[2] + 0.25]), w * 0.18, C.coatLight);
    limb([mix(elbow, hand, 0.1), mix(elbow, hand, 0.6)].map(p => [p[0], p[1], p[2] - 0.25]), w * 0.16, C.coatShade);
    // Punho
    K.olimb(rig, [mix(elbow, hand, 0.8), mix(elbow, hand, 0.92)], w * 0.95, C.coatShade);
    K.drawHand(rig, elbow, hand, Math.sign(shoulder[1]) || 1, { color: C.skin, shade: C.skinShade, size: handRadius * O.handScale, grip: 1 });
}

// Perna: calça preta reta e bota preta resistente, de cano alto, aparecendo por baixo do sobretudo
function drawAvgustinoLeg(rig, hip, knee, ankle, toe) {
    const { limb, C } = rig;
    const shin = mix(knee, ankle, 0.4);
    K.olimb(rig, [hip, knee], O.legWidth, C.pants);
    K.olimb(rig, [knee, shin], O.legWidth * 0.92, C.pants);
    limb([mix(hip, knee, 0.2), mix(hip, knee, 0.85)].map(p => [p[0] + 0.35, p[1], p[2]]), 0.24, C.pantsShade);
    // Bota: cano até a canela, com o couro um pouco mais claro na frente
    K.olimb(rig, [shin, ankle], O.legWidth * 0.86, C.boot);
    limb([mix(shin, ankle, 0.1), mix(shin, ankle, 0.8)].map(p => [p[0] + 0.45, p[1], p[2]]), 0.24, C.bootLight);
    const heel = [ankle[0] - 0.45, ankle[1], toe[2] + 0.35];
    const tip = [toe[0] - 0.2, toe[1], toe[2] + 0.35];
    K.olimb(rig, [ankle, heel], O.legWidth * 0.72, C.boot);
    K.olimb(rig, [heel, tip], 1.5, C.boot);
    limb([[heel[0] - 0.2, heel[1], heel[2] - 0.55], [tip[0] + 0.2, tip[1], tip[2] - 0.55]], 0.5, C.bootShade);
}

// --- TRONCO ---
// Sobretudo fechado nos ombros e aberto na frente: camisa preta abotoada no meio com a gola clerical, o crucifixo
// prateado pendurado numa corrente, cinto preto e pescoço fino
function drawAvgustinoTorso(rig, pose, bottom, top, wb, wt) {
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
    disk([bottom.a, 0, bottom.z], [bottom.A * 1.1, 0, 0], [0, bottom.B * O.waistScale, 0]);
    ctx.fill();
    ctx.stroke();

    const zb = bottom.z - 0.6;
    const zc = top.z - 2.4;
    const pb = project(at(zb), 0, zb);
    const pc = project(at(zc), 0, zc);
    const pt = project(top.a, 0, top.z);
    const hb = wb * O.waistScale;
    const ht = wt * O.shoulderScale;
    const hc = ht * 0.96;

    // Camisa preta (o miolo que aparece entre as abas do sobretudo)
    const bodyPath = (k = 1) => {
        ctx.beginPath();
        ctx.moveTo(pb.x - hb * k, pb.y);
        ctx.quadraticCurveTo(pb.x - hb * 1.04 * k, (pb.y + pc.y) / 2, pc.x - hc * k, pc.y);
        ctx.quadraticCurveTo(pt.x - ht * 1.03 * k, pt.y + 0.3, pt.x - ht * 0.62 * k, pt.y - 0.8);
        ctx.quadraticCurveTo(pt.x, pt.y - 1.4, pt.x + ht * 0.62 * k, pt.y - 0.8);
        ctx.quadraticCurveTo(pt.x + ht * 1.03 * k, pt.y + 0.3, pc.x + hc * k, pc.y);
        ctx.quadraticCurveTo(pb.x + hb * 1.04 * k, (pb.y + pc.y) / 2, pb.x + hb * k, pb.y);
        ctx.closePath();
    };
    bodyPath();
    ctx.fillStyle = C.coat;
    ctx.fill();
    ctx.stroke();
    // Volume: o lado de lá do sobretudo mais escuro
    ctx.save();
    bodyPath();
    ctx.clip();
    ctx.globalAlpha *= 0.45;
    ctx.fillStyle = C.coatShade;
    ctx.fillRect(pt.x + ht * 0.25, pt.y - 3, ht * 2, pb.y - pt.y + 6);
    ctx.restore();

    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        // Abertura em V: a camisa preta aparece no meio do peito, até a cintura
        const topC = project(fa(top.z - 0.4), 0, top.z - 0.4);
        const botC = project(fa(bottom.z + 0.6), 0, bottom.z + 0.6);
        const half = ht * 0.34;
        ctx.beginPath();
        ctx.moveTo(topC.x - half, topC.y);
        ctx.lineTo(botC.x - half * 0.55, botC.y);
        ctx.lineTo(botC.x + half * 0.55, botC.y);
        ctx.lineTo(topC.x + half, topC.y);
        ctx.closePath();
        ctx.fillStyle = C.shirt;
        ctx.fill();
        ctx.lineWidth = 0.28;
        ctx.stroke();
        // Lapelas do sobretudo (linhas claras) e abotoamento da camisa
        for (const s of [-1, 1]) {
            limb([[fa(top.z - 0.4), s * half / 1.2, top.z - 0.4], [fa(bottom.z + 0.6), s * half * 0.6 / 1.2, bottom.z + 0.6]], 0.2, C.coatLight);
        }
        for (let k = 0; k < 4; k++) {
            const z = top.z - 3.2 - k * ((top.z - bottom.z - 4.4) / 3);
            limb([[fa(z), 0, z], [fa(z) + 0.01, 0, z]], 0.45, C.shirtLight);
        }
        // Gola clerical: faixa baixa e fechada em volta do pescoço
        limb([[fa(top.z + 0.15) - 0.1, -1.0, top.z + 0.15], [fa(top.z + 0.15), 0, top.z + 0.05], [fa(top.z + 0.15) - 0.1, 1.0, top.z + 0.15]], 1.1, C.shirtShade);
        // Crucifixo: corrente em V e a cruz prateada no peito
        const cz = top.z - 4.2;
        limb([[fa(top.z + 0.1), -1.0, top.z + 0.1], [fa(cz + 0.6), 0, cz + 0.6], [fa(top.z + 0.1), 1.0, top.z + 0.1]], 0.16, C.chain);
        limb([[fa(cz + 0.6) + 0.05, 0, cz + 0.6], [fa(cz - 1.5) + 0.05, 0, cz - 1.5]], 0.36, C.cross);
        limb([[fa(cz) + 0.05, -0.75, cz], [fa(cz) + 0.05, 0.75, cz]], 0.36, C.cross);
        limb([[fa(cz - 0.3) + 0.05, 0.1, cz - 0.3], [fa(cz - 1.4) + 0.05, 0.1, cz - 1.4]], 0.1, C.crossShade);
        ctx.globalAlpha = baseAlpha;
    }

    // Cinto preto: só a metade da frente do anel aparece
    const c = project(at(bottom.z + 0.5), 0, bottom.z + 0.5);
    ctx.save();
    ctx.beginPath();
    ctx.rect(c.x - 30, c.y, 60, 30);
    ctx.clip();
    disk([at(bottom.z + 0.5), 0, bottom.z + 0.5], [bottom.A * 1.1, 0, 0], [0, bottom.B * O.waistScale, 0]);
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 1.15;
    ctx.stroke();
    ctx.strokeStyle = C.shirtShade;
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();

    // Pescoço fino, de pele (a gola e a cabeça cobrem as pontas)
    K.olimb(rig, [[top.a + 0.2, 0, top.z - 0.4], [top.a + 0.6, 0, top.z + 2.1]], 1.45, C.skin);
    limb([[top.a + 0.3, 0.4, top.z + 0.2], [top.a + 0.55, 0.4, top.z + 1.8]], 0.3, C.skinShade);
    // Gola alta do sobretudo atrás do pescoço
    for (const s of [-1, 1]) K.olimb(rig, [[top.a - 0.2, s * 1.0, top.z - 0.2], [top.a - 0.1, s * 1.3, top.z + 0.9]], 0.9, C.coat);
}

// --- SOBRETUDO ---
// Não é capa: é o sobretudo/batina de padre, preso na cintura e caindo até a canela. Três peças em volta das pernas:
// as costas (drawBack) e duas abas na frente, uma por perna. Parado, as abas ficam quase fechadas (só uma fresta mostra a
// calça); andando, cada aba abre e vai para a frente junto com a perna do mesmo lado.
const HEM_Z = 4.4;       // altura da barra (meio da canela)

function coatLeg(rig, pose, side) {
    const phase = rig.anim.stride + (side > 0 ? 0 : Math.PI);
    const reach = Math.sin(phase) * V.strideLength * (0.2 + pose.run * 0.9);
    const lift = Math.max(0, Math.cos(phase)) * V.footLift * pose.run;
    return { reach, lift };
}

function fillCoat(rig, pts, C) {
    const { project } = rig;
    ctx.beginPath();
    pts.forEach((p, i) => {
        const s = project(...p);
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
    });
    ctx.closePath();
    ctx.fillStyle = C.coat;
    ctx.fill();
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.4;
    ctx.lineJoin = 'round';
    ctx.stroke();
}

// Costas: do cinto, em arco por trás das pernas, até a barra reta; balança para trás na corrida
function drawAvgustinoCoat(rig, pose) {
    const { C, project } = rig;
    const n = 10;
    const a0 = pose.lean * 0.3;
    const sway = Math.sin(pose.t * 1.3) * 0.15 * (1 - pose.run);
    const top = [];
    const hem = [];
    for (let i = 0; i <= n; i++) {
        const psi = Math.PI / 2 + (i / n) * Math.PI;
        const edge = Math.abs(i / n - 0.5) * 2;
        top.push([a0 + 3.0 * Math.cos(psi), 4.2 * Math.sin(psi), pose.hipZ + 0.4]);
        hem.push([a0 + 4.3 * Math.cos(psi) - pose.run * (1.8 - edge * 0.8) + sway, 5.5 * Math.sin(psi), HEM_Z + Math.sin(pose.t * 5 + i) * 0.12 * pose.run]);
    }
    fillCoat(rig, [...top, ...hem.reverse()], C);
    // Dobras e a fenda do meio das costas
    ctx.save();
    ctx.globalAlpha *= 0.6;
    hem.reverse();
    for (const k of [3, 5, 7]) {
        const pa = project(...top[k]);
        const ph = project(...hem[k]);
        ctx.strokeStyle = k === 5 ? C.outline : C.coatShade;
        ctx.lineWidth = k === 5 ? 0.3 : 0.5;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(ph.x, ph.y);
        ctx.stroke();
    }
    ctx.restore();
}

// Abas da frente: uma por perna. A barra da frente de cada aba vai com o pé do mesmo lado e abre para o lado
function coatFlapParts(pose, rig) {
    const { project, C } = rig;
    const a0 = pose.lean * 0.3;
    return [-1, 1].map(side => {
        const { reach, lift } = coatLeg(rig, pose, side);
        const fwd = Math.max(0, reach);
        const open = 0.9 + pose.run * 1.6 + fwd * 0.28;
        const tops = [[a0 + 2.7, side * 0.8, pose.hipZ + 0.4], [a0 + 1.6, side * 3.4, pose.hipZ + 0.4], [a0 + 0.2, side * 4.3, pose.hipZ + 0.4]];
        const hems = [
            [a0 - 0.6 - pose.run * 0.6, side * 5.5, HEM_Z],
            [a0 + 1.6 + fwd * 0.2, side * (4.6 + open * 0.15), HEM_Z + lift * 0.3],
            [a0 + 4.3 + fwd * 0.55 + pose.run * 0.6, side * (1.0 + open * 0.55), HEM_Z + lift * 0.7]
        ];
        return {
            depth: project(a0 + 3.4, side * 3, 5.5).depth + 0.02,
            draw() {
                fillCoat(rig, [...tops, ...hems], C);
                // Borda aberta (mais clara) e uma dobra no meio da aba
                rig.limb([tops[0], hems[2]], 0.28, C.coatLight);
                ctx.save();
                ctx.globalAlpha *= 0.6;
                rig.limb([tops[1], hems[1]], 0.45, C.coatShade);
                ctx.restore();
            }
        };
    });
}

// --- MÃO LIVRE ATRÁS DAS COSTAS ---
// A mão esquerda fica nas costas, na altura da cintura (postura contida de quem observa). Só sai de lá quando o jogo a
// quer: arremesso da adaga, carga, feitiço ou poção; aí o braço vai para onde o jogo pede.
function freeArm(rig, pose, s) {
    const B = V.chest.B;
    const shoulder = [pose.lean, -B * O.shoulderScale, pose.shoulderZ - 0.5];
    const active = s.throwK >= 0 || s.charge > 0 || s.fireHold > 0 || s.cast > 0 || pose.flask > 0 || pose.free;
    const back = [pose.lean * 0.3 - 3.4, -2.0, pose.hipZ + 1.4 - pose.crouch];
    const hand = active ? s.hand : back;
    const elbow = active
        ? [(shoulder[0] + hand[0]) / 2 - 0.4, -B - 1, (shoulder[2] + hand[2]) / 2 + (s.throwK >= 0 ? 0.8 : 0)]
        : [pose.lean * 0.5 - 2.0, -B - 1.2, (shoulder[2] + back[2]) / 2];
    return { shoulder, hand, elbow };
}

// --- REGISTRO DO BONECO (lido por ../hunter/hero25d.js; interface em ../hunter/body_registry.js) ---
registerBody('avgustino', {
    vis: O,
    drawLeg: (rig, { hip, knee, ankle, toe }) => drawAvgustinoLeg(rig, hip, knee, ankle, toe),
    drawTorso: (rig, pose, bottom, top, wb, wt) => drawAvgustinoTorso(rig, pose, bottom, top, wb, wt),
    drawBack: (rig, pose) => drawAvgustinoCoat(rig, pose),
    freeArm,
    drawArm: (rig, shoulder, elbow, hand, armWidth, handRadius) => drawAvgustinoArm(rig, shoulder, elbow, hand, armWidth, handRadius),
    drawBlade: (rig, hand, dir, alpha) => drawShortSword(rig, hand, dir, alpha, O),
    headParts: (pose, rig) => [...avgustinoHeadParts(pose, rig), ...coatFlapParts(pose, rig)]
});
