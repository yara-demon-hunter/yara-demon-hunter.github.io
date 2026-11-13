// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/characters/zeph/zeph25d.js e rode o sync.
import { ZEPH_VISUALS as Z } from './zeph_visual.js';
import { registerBody } from '../hunter/body_registry.js';
import * as KIT from '../hunter/kit25d.js';
import { drawEar as azaelEar, wrap as azaelWrap } from '../azael/azael25d.js';
import { ctx } from '../../core/canvas.js';
import { drawDagger } from '../../weapons/dagger/dagger.js';

// Geometria compartilhada (hunter/kit25d.js) e a orelha e a bandagem do Azael
const K = { ...KIT, drawEar: azaelEar, wrap: azaelWrap };

// --- ZEPH (herói 2.5D do palco) ---
// Peças do Zeph montadas na mesma câmera e com a mesma animação do boneco de ../hunter/hero25d.js: cabeça com rosto
// (sobrancelhas grossas, olhos verde-acastanhados), cabelo castanho bagunçado com franja em pontas, jaqueta verde de
// gola alta com remendos, alça de couro cruzando o peito com a bolsa no quadril esquerdo, cinto, calça verde enfiada
// em botas marrons curtas e uma adaga na mão direita. Corpo de rapaz jovem e magro.
// Lados sempre do ponto de vista dele: direita = +b (mão da adaga, bainha), esquerda = -b (bolsa).
// A cabeça usa a mesma geometria do Azael (hunter/kit25d.js), com as medidas do Zeph. Referência: art_reference/ (nesta pasta).
// rig: { project, projectVec, limb, ball, disk, anim, C, sinF, cosF }. Medidas e cores: zeph_visual.js.
const { mix, add, norm, dot, cross, sub } = K;

// Orelha humana: pequena e arredondada, rente à cabeça
// Orelha humana: oval, um pouco saliente, no lado da cabeça, da altura da sobrancelha até a base do nariz,
// com a dobra de dentro mais escura
function drawRoundEar(rig, H, side, C) {
    const k = H.R / 3;
    const p = H.at(Z.earX * k, side * H.R * 1.02, Z.earY * k);
    const top = H.at((Z.earX - 0.1) * k, side * H.R * 1.04, (Z.earY + Z.earSize) * k);
    const low = H.at((Z.earX + 0.1) * k, side * H.R * 1.0, (Z.earY - Z.earSize) * k);
    K.olimb(rig, [top, p, low], Z.earWidth, C.skin);
    rig.limb([mix(top, p, 0.4), mix(p, low, 0.5)].map(q => add(q, H.s, side * 0.08)), 0.3, C.skinShade);
}

// --- CABEÇA ---
// Cabeça de pele com o cabelo como uma massa só por cima (sem peças soltas): a linha do cabelo desce em pontas na
// testa (a franja), forma costeletas na frente das orelhas e vai até a nuca; o topo tem volume irregular (bagunçado).
// Desenhada em pedaços da superfície, só os virados para a câmera.

// Linha do cabelo (latitude, em radianos) para cada longitude: lon 0 = testa, ±PI/2 = orelhas, PI = nuca
function hairLatAt(lon, latLine) {
    const back = Math.pow((1 - Math.cos(lon)) / 2, 1.6);
    let lat = latLine + (-1.0 - latLine) * back;
    // Franja: pontas que descem até perto das sobrancelhas (onda triangular), só na frente
    const front = Math.max(0, Math.cos(lon));
    const tri = Math.abs(((lon * Z.bangSpikes / Math.PI) % 2 + 2) % 2 - 1);
    lat -= Z.bangDepth * Math.pow(front, 1.5) * (1 - tri);
    // Costeletas: a linha desce na frente de cada orelha
    lat -= Z.sideburn * Math.exp(-Math.pow((Math.abs(lon) - 1.25) / 0.18, 2));
    return lat;
}

// Volume irregular do cabelo: o raio varia um pouco com a direção (tufos arredondados, não espetos)
function hairRadius(R, lon, lat) {
    return R * Z.hairPuff * (1 + Z.hairBumps * Math.sin(lon * 5 + 1.3) * Math.cos(lat * 2) * Math.max(0, Math.sin(lat + 0.4)));
}

function zephHeadParts(pose, rig) {
    const { project, C } = rig;
    const H = K.headFrame(pose, rig, Z);
    const R = H.R;
    const latLine = Math.asin(Z.hairline / 3);
    const head = {
        depth: project(...H.c).depth,
        draw() {
            const t = pose.t;
            const baseAlpha = ctx.globalAlpha;
            const vis = Math.max(0, Math.min(1, (H.frontVis + 0.05) / 0.3));
            const ears = [-1, 1].map(side => ({ side, near: dot([0, side, 0], H.d) > 0 }));
            ears.filter(e => !e.near).forEach(e => drawRoundEar(rig, H, e.side, C));

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

            // Malha do cabelo: da linha do cabelo até o alto
            const NL = 72;
            const NV = 8;
            const cap = [];
            for (let i = 0; i <= NL; i++) {
                const lon = -Math.PI + (i / NL) * Math.PI * 2;
                const lh = hairLatAt(lon, latLine);
                const row = [];
                for (let j = 0; j <= NV; j++) {
                    const lat = lh + (Math.PI / 2 - lh) * (j / NV);
                    row.push(H.sphere(lon, lat, hairRadius(R, lon, lat) * (j === 0 ? 0.985 : 1)));
                }
                cap.push(row);
            }
            const quads = [];
            for (let i = 0; i < NL; i++) {
                for (let j = 0; j < NV; j++) {
                    const q = [cap[i][j], cap[i + 1][j], cap[i + 1][j + 1], cap[i][j + 1]];
                    const mid = mix(mix(q[0], q[1], 0.5), mix(q[2], q[3], 0.5), 0.5);
                    const f = H.facing(mid);
                    if (f < -0.05) continue;
                    // Luz de cima: os pedaços do alto e virados para a câmera ficam mais claros
                    const up = dot(norm(sub(mid, H.c)), H.u);
                    quads.push({ q, depth: project(...mid).depth, light: up > 0.75 ? 2 : up > 0.35 ? 1 : 0 });
                }
            }
            quads.sort((a, b) => a.depth - b.depth);
            const tones = [C.hairShade, C.hair, C.hairLight];
            ctx.lineJoin = 'round';
            ctx.lineWidth = 0.16;
            for (const { q, light } of quads) {
                const pq = q.map(p => project(...p));
                ctx.fillStyle = tones[light === 2 ? 1 : light === 1 ? 1 : 0];
                ctx.strokeStyle = ctx.fillStyle;
                ctx.beginPath();
                pq.forEach((p, k) => (k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            // Mechas: fios mais escuros do alto até as pontas da franja e um brilho no topo
            for (let i = 0; i < NL; i += 6) {
                K.strokeVisible(rig, H, cap[i].slice(0, -2).reverse(), 0.16, C.hairShade);
            }
            const shine = [];
            for (let k = 0; k <= 8; k++) shine.push(H.sphere(-0.9 + k * 0.22, 1.0 + 0.12 * Math.sin(k), hairRadius(R, -0.9 + k * 0.22, 1.0) * 1.01));
            K.strokeVisible(rig, H, shine, 0.35, C.hairLight);

            // Orelha do lado de cá, por cima do cabelo dos lados (a do lado de lá fica atrás da cabeça)
            ears.filter(e => e.near).forEach(e => drawRoundEar(rig, H, e.side, C));

            // Contorno: a linha do cabelo (franja em pontas) e a borda de fora do cabelo
            K.strokeVisible(rig, H, cap.map(row => row[0]), 0.3, C.outline);
            const g1 = norm(cross([0, 0, 1], H.d));
            const g2 = cross(H.d, g1);
            let arc = [];
            const flush = () => {
                if (arc.length > 1) K.strokeSmooth(rig, arc, 0.45, C.outline);
                arc = [];
            };
            for (let i = 0; i <= 60; i++) {
                const a = (i / 60) * Math.PI * 2;
                const dir = add(g1.map(v => v * Math.cos(a)), g2, Math.sin(a));
                const lat = Math.asin(Math.max(-1, Math.min(1, dot(dir, H.u))));
                const lon = Math.atan2(dot(dir, H.s), dot(dir, H.f));
                if (lat < hairLatAt(lon, latLine) + 0.02) {
                    flush();
                    continue;
                }
                arc.push(add(H.c, dir, hairRadius(R, lon, lat)));
            }
            flush();
        }
    };
    return [head];
}

// Rosto: jovem, oval e sério. Sobrancelhas grossas e retas, olhos verde-acastanhados com pálpebra, nariz reto
// discreto, boca fechada. Pisca de tempos em tempos (como na animação de referência).
function drawFace(rig, H, C, t) {
    const { project } = rig;
    // As medidas do rosto são para uma cabeça de raio 3: escalam junto com a cabeça
    const fk = H.R / 3;
    const F = (sv, uv) => H.face(sv * fk, uv * fk);
    const P = (sv, uv) => project(...F(sv, uv));
    const shown = (sv, uv) => H.facing(F(sv, uv)) > 0.05;

    const outline = [...Z.face.map(([sv, uv]) => [-sv, uv]), ...[...Z.face].reverse().slice(1)];
    const pts = outline.map(([sv, uv]) => project(...H.clampVisible(F(sv, uv))));
    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.closePath();
    ctx.fill();
    // Contorno só do queixo e da mandíbula
    // (só os pontos bem virados para a câmera: o lado de lá do queixo fica sem linha, senão vira um risco na bochecha)
    const jaw = outline.slice(3, outline.length - 3).map(([sv, uv]) => F(sv, uv)).filter(p => H.facing(p) > 0.3);
    if (jaw.length > 1) K.strokeSmooth(rig, jaw, 0.24, C.outline);

    // Posições do rosto (dados em zeph_visual.js; ajuste ao vivo em mini_games/_library/tools/tuner.html)
    const ex = Z.eyeX;
    const ey = Z.eyeY;
    const ew = Z.eyeWidth;
    const eo = Z.eyeOpen;
    const ny = Z.noseY;
    // Nariz reto e discreto (só a sombra de um lado e a ponta)
    if (shown(0, ny)) {
        K.strokeSmooth(rig, [F(-0.12, ny + Z.noseLength / 2), F(-0.2, ny - 0.25)], 0.14, C.skinShade);
        K.strokeSmooth(rig, [F(-0.28, ny - 0.35), F(0.05, ny - 0.43), F(0.25, ny - 0.35)], 0.14, C.skinShade);
    }
    // Boca fechada, séria
    if (shown(0, Z.mouthY)) K.strokeSmooth(rig, [F(-Z.mouthWidth, Z.mouthY + 0.02), F(0, Z.mouthY - 0.03), F(Z.mouthWidth, Z.mouthY + 0.02)], 0.16, C.mouth);

    const blink = (t % 3.6) > 3.45;
    for (const side of [-1, 1]) {
        if (!shown(side * ex, ey)) continue;
        if (blink) {
            K.strokeSmooth(rig, [F(side * (ex - ew + 0.05), ey - 0.04), F(side * ex, ey - 0.11), F(side * (ex + ew - 0.05), ey - 0.02)], 0.2, C.outline);
        } else {
            const inner = P(side * (ex - ew), ey - 0.04);
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
            const er = P(side * (ex + 0.22), ey);
            const rx = Math.max(0.08, Math.min(Z.irisSize, Math.hypot(er.x - e.x, er.y - e.y)));
            ctx.fillStyle = C.eye;
            ctx.beginPath();
            ctx.ellipse(e.x, e.y, rx, Z.irisSize, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#16100c';
            ctx.beginPath();
            ctx.ellipse(e.x, e.y, rx * 0.45, Z.irisSize * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(e.x - rx * 0.5, e.y - Z.irisSize * 0.6, 0.09, 0.09);
            // Pálpebra de cima
            K.strokeSmooth(rig, [F(side * (ex - ew), ey - 0.02), F(side * ex, ey + eo * 0.95), F(side * (ex + ew + 0.02), ey + 0.03)], 0.17, C.outline);
        }
        // Sobrancelha grossa, quase reta, levemente franzida (desce um pouco para o meio: browTilt)
        const by = ey + Z.browY;
        K.strokeSmooth(rig, [F(side * (ex - Z.browWidth), by - Z.browTilt), F(side * (ex - 0.03), by + 0.02), F(side * (ex + Z.browWidth), by - 0.01)], Z.browThickness, C.hairShade);
    }
}

// --- BRAÇOS E PERNAS ---
// Braço com a manga verde até o pulso (remendo redondo no ombro), mão nua
function drawZephArm(rig, shoulder, elbow, hand, armWidth, handRadius) {
    const { limb, ball, C } = rig;
    const right = shoulder[1] > 0;
    const sh = [shoulder[0], shoulder[1] * Z.shoulderScale, shoulder[2]];
    const w = armWidth * Z.armScale;
    // Braço afina do ombro ao pulso: braço mais grosso, antebraço mais fino, cotovelo marcado
    K.oball(rig, sh, w * 0.62, C.jacket);
    K.olimb(rig, [sh, elbow], w * 1.08, C.jacket);
    K.olimb(rig, [elbow, mix(elbow, hand, 0.86)], w * 0.88, C.jacket);
    ball(elbow, w * 0.5, C.jacket);
    limb([mix(sh, elbow, 0.1), mix(sh, elbow, 0.6)].map(p => [p[0], p[1], p[2] + 0.35]), w * 0.28, C.jacketLight);
    limb([mix(elbow, hand, 0.15), mix(elbow, hand, 0.7)].map(p => [p[0], p[1], p[2] - 0.3]), w * 0.25, C.jacketShade);
    // Punho da manga e remendo no ombro
    limb([mix(elbow, hand, 0.8), mix(elbow, hand, 0.88)], w * 0.95, C.jacketShade);
    ball([sh[0] + 0.2, sh[1] * 1.02, sh[2] + 0.3], 0.5, C.patch);
    if (!right) ball(mix(elbow, hand, 0.4), 0.38, C.patch);
    // Mão redonda com o risco dos dedos e do polegar (kit25d.js, drawHand)
    K.drawHand(rig, elbow, hand, right ? 1 : -1, { color: C.skin, shade: C.skinShade, size: handRadius * Z.handScale, grip: right ? 1 : 0 });
}

// Perna: calça verde larga enfiada na bota marrom curta (dobrada no alto); pé chato no chão
function drawZephLeg(rig, hip, knee, ankle, toe) {
    const { limb, C } = rig;
    const shin = mix(knee, ankle, 0.5);
    // Calça: coxa larga afinando para o joelho e a canela, com dobras
    K.olimb(rig, [hip, knee], Z.legWidth, C.pants);
    K.olimb(rig, [knee, shin], Z.legWidth * 0.82, C.pants);
    limb([mix(hip, knee, 0.2), mix(hip, knee, 0.85)].map(p => [p[0] + 0.35, p[1], p[2]]), 0.24, C.pantsShade);
    limb([mix(knee, shin, 0.1), mix(knee, shin, 0.5)].map(p => [p[0] + 0.25, p[1], p[2] + 0.2]), 0.2, C.pantsShade);
    // Bota curta: cano dobrado no alto (faixa mais clara) e pé chato
    K.olimb(rig, [shin, ankle], Z.legWidth * 0.75, C.leather);
    limb([mix(shin, ankle, 0), mix(shin, ankle, 0.15)], Z.legWidth * 0.82, C.leatherLight);
    const heel = [ankle[0] - 0.5, ankle[1], toe[2] + 0.35];
    const tip = [toe[0] - 0.3, toe[1], toe[2] + 0.35];
    K.olimb(rig, [ankle, heel], Z.legWidth * 0.66, C.leather);
    K.olimb(rig, [heel, tip], 1.55, C.leather);
    limb([[heel[0] - 0.2, heel[1], heel[2] - 0.5], [tip[0] + 0.2, tip[1], tip[2] - 0.5]], 0.45, C.leatherShade);
}

// --- TRONCO ---
// Jaqueta verde de gola alta, fechada com botões, remendos; alça de couro cruzando o peito (ombro direito → quadril
// esquerdo) com a bolsa no quadril esquerdo; cinto marrom com fivela e a bainha da adaga no quadril direito
function drawZephTorso(rig, pose, bottom, top, wb, wt) {
    const { project, limb, disk, C, sinF } = rig;
    const front = Math.max(0, Math.min(1, sinF * 1.5 + 0.4));
    const baseAlpha = ctx.globalAlpha;
    const at = (z) => bottom.a + (top.a - bottom.a) * ((z - bottom.z) / (top.z - bottom.z));
    const fa = (z) => at(z) + 2.5;

    // Quadril (calça)
    ctx.fillStyle = C.pants;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.4;
    disk([bottom.a, 0, bottom.z], [bottom.A * 1.1, 0, 0], [0, bottom.B * 1.05, 0]);
    ctx.fill();
    ctx.stroke();

    // Jaqueta: do quadril (barra um pouco abaixo do cinto) aos ombros
    const zb = bottom.z - 0.8;
    const pb = project(at(zb), 0, zb);
    const pt = project(top.a, 0, top.z);
    const hb = wb * Z.waistScale * 1.05;
    const ht = wt * Z.shoulderScale;
    ctx.fillStyle = C.jacket;
    ctx.beginPath();
    ctx.moveTo(pb.x - hb, pb.y);
    ctx.lineTo(pt.x - ht, pt.y);
    ctx.lineTo(pt.x + ht, pt.y);
    ctx.lineTo(pb.x + hb, pb.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Volume: o lado de lá da jaqueta mais escuro
    ctx.save();
    ctx.globalAlpha *= 0.45;
    ctx.fillStyle = C.jacketShade;
    ctx.beginPath();
    ctx.moveTo(pb.x + hb * 0.35, pb.y);
    ctx.lineTo(pt.x + ht * 0.4, pt.y);
    ctx.lineTo(pt.x + ht, pt.y);
    ctx.lineTo(pb.x + hb, pb.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        // Fecho da jaqueta com botões e luz no peito
        limb([[fa(top.z - 1), 0.15, top.z - 1], [fa(zb + 0.6), 0.15, zb + 0.6]], 0.22, C.jacketShade);
        for (const z of [top.z - 2.2, top.z - 4.2]) limb([[fa(z), 0.15, z], [fa(z) + 0.01, 0.15, z]], 0.45, C.leatherShade);
        limb([[fa(top.z - 1.5), -2, top.z - 1.5], [fa(top.z - 1.5), -0.6, top.z - 1.5]], 0.6, C.jacketLight);
        ctx.globalAlpha = baseAlpha;
    }

    // Cinto: só a metade da frente do anel aparece
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
    ringFront(bottom.z + 0.6, bottom.A * 1.1, bottom.B * 1.02, 0.6, C.leather);

    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        const buckle = project(bottom.a + bottom.A * 1.1, 0.4, bottom.z + 0.6);
        ctx.fillStyle = C.buckle;
        ctx.fillRect(buckle.x - 0.4, buckle.y - 0.3, 0.8, 0.6);
        ctx.globalAlpha = baseAlpha;
    }
    // Alça da bolsa: do ombro direito, cruzando o peito (ou as costas), até o quadril esquerdo
    const strapFront = sinF > -0.2;
    const sgn = strapFront ? 1 : -1;
    const strap = [
        [top.a + sgn * top.A * 0.75, top.B * 0.62, top.z - 0.2],
        [at(top.z - 3) + sgn * 2.4, -0.4, top.z - 3],
        [bottom.a + sgn * bottom.A * 0.5, -bottom.B * 0.95, bottom.z + 0.2]
    ];
    K.olimb(rig, strap, 0.55, C.leather);
    // Bolsa de couro no quadril esquerdo, com aba e fivela
    // (só quando esse lado está virado para a câmera; do outro lado o corpo a esconde, em vez de ela aparecer
    // por cima do peito)
    const bag = [bottom.a - 0.6, -bottom.B * 1.12, bottom.z - 0.6];
    const hipDepth = project(bottom.a, 0, bottom.z).depth;
    if (project(...bag).depth > hipDepth - 0.5) {
        K.oball(rig, bag, 1.25, C.leather);
        rig.ball([bag[0] + 0.15, bag[1], bag[2] + 0.55], 0.9, C.leatherLight);
        rig.ball([bag[0] + 0.5, bag[1] - 0.1, bag[2] + 0.2], 0.22, C.buckle);
    }
    // Bainha da adaga no quadril direito
    const sheath = [bottom.a + 0.6, bottom.B * 1.1, bottom.z + 0.2];
    if (project(...sheath).depth > hipDepth - 0.5) K.olimb(rig, [sheath, add(sheath, [-0.6, 0.1, -2.6], 1)], 0.6, C.leatherShade);

    // Pescoço (a gola cobre a base; a cabeça, desenhada depois, cobre o alto)
    K.olimb(rig, [[top.a + 0.2, 0, top.z], [top.a + 0.6, 0, top.z + 2.4]], 1.7, C.skin);
    limb([[top.a + 0.25, 0.5, top.z + 0.4], [top.a + 0.55, 0.5, top.z + 2]], 0.4, C.skinShade);
    // Gola alta da jaqueta
    const collar = [top.a + 0.1, 0, top.z + 0.5];
    ctx.fillStyle = C.jacket;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.35;
    disk(collar, [top.A * 0.7, 0, 0], [0, top.B * 0.42, 0]);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.jacketShade;
    disk([collar[0] + 0.1, 0, collar[2] + 0.6], [top.A * 0.5, 0, 0], [0, top.B * 0.3, 0]);
    ctx.fill();
}

// --- REGISTRO DO BONECO (lido por ../hunter/hero25d.js; interface em ../hunter/body_registry.js) ---
registerBody('zeph', {
    vis: Z,
    idleArms: true,
    drawLeg: (rig, { hip, knee, ankle, toe }) => drawZephLeg(rig, hip, knee, ankle, toe),
    drawTorso: (rig, pose, bottom, top, wb, wt) => drawZephTorso(rig, pose, bottom, top, wb, wt),
    // Sem capa (a bolsa e a alça ficam no tronco)
    drawBack() {},
    // Em repouso: adaga baixa à frente do quadril, ponta para a frente (guarda de faca)
    swordRest(rig, pose, { hand, dir, blend }) {
        const m = rig.mix(dir, [0.95, 0.12 + Math.sin(pose.t * 1.3) * 0.06, 0.12], 1 - blend);
        const size = Math.hypot(...m) || 1;
        return { hand, dir: m.map(v => v / size) };
    },
    drawArm: (rig, shoulder, elbow, hand, armWidth, handRadius) => drawZephArm(rig, shoulder, elbow, hand, armWidth, handRadius),
    drawBlade: (rig, hand, dir, alpha) => drawDagger(rig, hand, dir, alpha, Z),
    headParts: (pose, rig) => zephHeadParts(pose, rig)
});
