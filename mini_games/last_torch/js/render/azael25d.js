import { AZAEL_VISUALS as A } from '../../data_model/visuals/characters/azael_visual.js';
import { HERO_25D_VISUALS as V } from '../../data_model/visuals/characters/hero25d_visual.js';
import { ctx } from '../core/state.js';
import { registerBody } from './body_registry.js';
import { drawGlow } from './fx/glow.js';

// --- AZAEL (herói 2.5D) ---
// Peças do Azael montadas na mesma câmera e com a mesma animação do boneco de js/render/player25d.js:
// cabeça sem capuz (rosto, orelhas pontudas, olhos vermelhos, pintura de guerra), cabelo branco esvoaçante,
// bandana, katana curva, bainha na cintura, braços nus enfaixados e pés descalços de 3 dedos.
// rig: { project, projectVec, limb, ball, disk, anim, C, sinF, cosF }. Coordenadas locais: a = frente, b = direita, z = altura.

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const add = (p, d, k) => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];

// --- PANO E CABELO QUE ONDULAM ---
// Corrente de pontos que sai de root: parada cai na direção hang, correndo vai na direção stream (para trás),
// atrasa com a capa (anim.capeX/capeY, física de player.js) e ondula com uma onda que corre da raiz até a ponta.
const norm = (v) => {
    const l = Math.hypot(...v) || 1;
    return v.map(x => x / l);
};

function flowChain(root, pose, anim, o) {
    const { t, run } = pose;
    const dir = norm(mix(o.hang, o.stream, run));
    const amp = o.amp + o.ampRun * run;
    const speed = o.speed + o.speedRun * run;
    const bounce = Math.sin(anim.stride * 2) * 0.35 * run;
    const pts = [];
    for (let j = 0; j <= o.segs; j++) {
        const k = j / o.segs;
        const w = t * speed - k * o.waveLength + o.phase;
        const p = add(root, dir, o.len * k);
        // Atraso cresce para a ponta (k²): a raiz segue o corpo, a ponta fica para trás
        p[0] += anim.capeX * o.lag * k * k;
        p[1] += anim.capeY * o.lag * k * k + Math.sin(w) * amp * k;
        p[2] += (Math.cos(w * 0.9) * amp * 0.55 + bounce) * k + (o.droop ?? 0) * Math.sin(Math.PI * k) * run;
        if (o.bow) for (let x = 0; x < 3; x++) p[x] += o.bow[x] * Math.sin(Math.PI * k);
        pts.push(p);
    }
    return pts;
}

// Caminho suave pelos pontos já projetados (curvas pelos pontos médios)
function smoothThrough(pts, moveFirst = true) {
    if (moveFirst) ctx.moveTo(pts[0].x, pts[0].y);
    else ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
}

function strokeSmooth(rig, chain, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    smoothThrough(chain.map(p => rig.project(...p)));
    ctx.stroke();
}

// Fita (pontas da bandana, mechas): larga na raiz, fina na ponta; forked = ponta rasgada em V
function drawRibbon(rig, chain, w0, w1, fill, edge, forked = true) {
    const pts = chain.map(p => rig.project(...p));
    const left = [];
    const right = [];
    pts.forEach((p, i) => {
        const a = pts[Math.max(0, i - 1)];
        const b = pts[Math.min(pts.length - 1, i + 1)];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const l = Math.hypot(dx, dy) || 1;
        const w = w0 + (w1 - w0) * (i / (pts.length - 1));
        left.push({ x: p.x - (dy / l) * w, y: p.y + (dx / l) * w });
        right.push({ x: p.x + (dy / l) * w, y: p.y - (dx / l) * w });
    });
    const tip = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const notch = forked ? { x: tip.x + (prev.x - tip.x) * 0.45, y: tip.y + (prev.y - tip.y) * 0.45 } : tip;
    ctx.fillStyle = fill;
    ctx.strokeStyle = edge;
    ctx.lineWidth = 0.25;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    smoothThrough(left);
    ctx.lineTo(notch.x, notch.y);
    smoothThrough([...right].reverse(), false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// --- CABEÇA ---
// A cabeça é uma esfera de cabelo; o rosto é uma região da superfície da frente (da bandana até o queixo), sem
// contorno nos lados, então não vira uma máscara colada. A câmera vê quase de cima: a cabeça "olha" um pouco para
// cima (faceTilt) para o rosto aparecer. Tudo é calculado no 3D e só a parte virada para a câmera é desenhada.
const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];

// Direção local que aponta para a câmera (tirada da própria projeção, vale para qualquer câmera)
function viewDir(rig) {
    const ex = rig.projectVec(1, 0, 0);
    const ey = rig.projectVec(0, 1, 0);
    const ez = rig.projectVec(0, 0, 1);
    let d = norm(cross([ex.x, ey.x, ez.x], [ex.y, ey.y, ez.y]));
    const o = rig.project(0, 0, 0).depth;
    const g = [rig.project(1, 0, 0).depth - o, rig.project(0, 1, 0).depth - o, rig.project(0, 0, 1).depth - o];
    if (dot(d, g) < 0) d = d.map(v => -v);
    return d;
}

// P: medidas da cabeça (as do Azael por padrão; outro boneco pode passar as suas)
// Eixos da cabeça: f = para onde o rosto olha, s = direita, u = alto da cabeça
function headFrame(pose, rig, P = A) {
    const R = P.headRadius;
    const d = viewDir(rig);
    // De costas a cabeça não precisa levantar o rosto (senão a bandana vira uma auréola)
    const tilt = (P.faceTilt + P.faceTiltFront * Math.max(0, rig.sinF)) * Math.max(0, Math.min(1, (rig.sinF + 1) / 0.8));
    const yaw = P.faceTurn * Math.sin(Math.atan2(d[1], d[0]));
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);
    const f = [ct * Math.cos(yaw), ct * Math.sin(yaw), st];
    const s = [-Math.sin(yaw), Math.cos(yaw), 0];
    const u = [-st * Math.cos(yaw), -st * Math.sin(yaw), ct];
    const c = [pose.headA, 0, pose.headZ];
    const at = (fv, sv, uv) => add(add(add(c, f, fv), s, sv), u, uv);
    // Ponto na esfera por longitude (lon: 0 = frente, + = direita) e latitude (lat: 0 = altura da bandana... do equador)
    const sphere = (lon, lat, r = R) => at(r * Math.cos(lat) * Math.cos(lon), r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat));
    // Ponto do rosto (s, u): na superfície da esfera; abaixo dela, o queixo continua um pouco para a frente
    const face = (sv, uv) => at(Math.max(Math.sqrt(Math.max(0, R * R - sv * sv - uv * uv)), P.jawForward - 0.25 * Math.abs(sv)) + P.faceOut, sv, uv);
    // Quanto um ponto da superfície está virado para a câmera (< 0 = escondido atrás da cabeça)
    const facing = (p) => dot(norm(sub(p, c)), d);
    // Ponto escondido vai para a borda da silhueta (o rosto de perfil se espreme na borda em vez de atravessar)
    const clampVisible = (p) => {
        const v = sub(p, c);
        const r = Math.hypot(...v);
        const n = v.map(x => x / r);
        const k = dot(n, d);
        if (k >= 0) return p;
        return add(c, norm(sub(n, d.map(x => x * k))), r);
    };
    return { R, c, f, s, u, d, at, sphere, face, facing, clampVisible, frontVis: dot(f, d) };
}

// Linhas na superfície da cabeça: só os trechos virados para a câmera
function strokeVisible(rig, H, pts, width, color) {
    let run = [];
    const flush = () => {
        if (run.length > 1) strokeSmooth(rig, run, width, color);
        run = [];
    };
    for (const p of pts) {
        if (H.facing(p) > 0.02) run.push(p);
        else flush();
    }
    flush();
}

// Contorno da esfera na tela (círculo da silhueta, perpendicular à câmera)
function silhouettePath(rig, H, r) {
    const g1 = norm(cross([0, 0, 1], H.d));
    const g2 = cross(H.d, g1);
    ctx.beginPath();
    for (let i = 0; i <= 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const p = rig.project(...add(add(H.c, g1, r * Math.cos(a)), g2, r * Math.sin(a)));
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
}

// Orelha pontuda (side = -1 esquerda, 1 direita): folha que sai do lado da cabeça para trás e para cima
function drawEar(rig, H, side, C, P = A) {
    const R = H.R;
    const up = rig.project(...H.at(0.4, side * R * 0.93, 0.3));
    const low = rig.project(...H.at(-0.5, side * R * 0.93, -1.1));
    const tip = rig.project(...H.at(-1.3, side * (R + P.earLength), 1.2));
    const mid = rig.project(...H.at(-0.2, side * (R + P.earLength * 0.45), 0.25));
    ctx.fillStyle = C.skin;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(up.x, up.y);
    ctx.quadraticCurveTo(mid.x + (tip.x - mid.x) * 0.2, mid.y - 0.5, tip.x, tip.y);
    ctx.quadraticCurveTo(mid.x, mid.y + 0.7, low.x, low.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Dobra de dentro da orelha
    ctx.strokeStyle = C.skinShade;
    ctx.lineWidth = 0.25;
    ctx.beginPath();
    ctx.moveTo((up.x + low.x) / 2, (up.y + low.y) / 2);
    ctx.quadraticCurveTo(mid.x, mid.y, tip.x + (mid.x - tip.x) * 0.25, tip.y + (mid.y - tip.y) * 0.25);
    ctx.stroke();
}

// Atrás da cabeça: a massa do cabelo branco, a parte de trás da bandana com o nó e as duas pontas soltas.
// Tudo ondula e fica para trás na corrida; parado, balança devagar.
export function azaelHairPart(pose, rig) {
    const { project, ball, anim, C } = rig;
    const { run } = pose;
    const H = headFrame(pose, rig);
    const R = H.R;
    const n = A.hairStrands;
    const lat0 = Math.asin(A.bandHeight / R);
    const strands = [];
    for (let i = 0; i < n; i++) {
        const k = i / (n - 1);
        const lon = Math.PI * (0.55 + 0.9 * k);         // arco das costas da cabeça
        const side = Math.sin(lon);
        const jag = 0.82 + 0.22 * Math.sin(i * 2.3 + 0.7);
        const root = H.sphere(lon, lat0 * 0.4, R * 0.92);
        strands.push(flowChain(root, pose, anim, {
            len: (A.hairLength + A.hairRunLength * run) * jag,
            segs: 5,
            hang: [-0.42, side * 0.4, -1],
            stream: [-1, side * 0.35, -0.3],
            lag: 0.14,
            amp: A.hairWave * 0.35,
            ampRun: A.hairWave,
            speed: A.hairWaveSpeed * 0.5,
            speedRun: A.hairWaveSpeed,
            waveLength: 3.6,
            phase: i * 1.1,
            droop: -0.6
        }));
    }
    // Pontas da bandana: saem do nó, uma mais longa que a outra, e esvoaçam mais rápido que o cabelo
    const rb = Math.sqrt(R * R - A.bandHeight * A.bandHeight) * 1.03;
    const knot = H.at(-rb, 0, A.bandHeight);
    const tails = [-1, 1].map(side => flowChain([knot[0], side * 0.3, knot[2]], pose, anim, {
        len: A.bandanaTailLength * (side > 0 ? 1 : 0.78) * (1 + 0.35 * run),
        segs: 6,
        hang: [-0.55, side * 0.16, -1],
        stream: [-1, side * 0.22, 0.12],
        lag: 0.2,
        amp: 0.45,
        ampRun: 1.35,
        speed: 4.5,
        speedRun: 11,
        waveLength: 4.8,
        phase: side * 1.4
    }));
    return {
        depth: project(...H.at(-R - 1.5, 0, -1)).depth,
        draw() {
            // Massa do cabelo: borda pelas mechas de fora, pontas soltas com entalhes entre elas
            const P = strands.map(ch => ch.map(p => project(...p)));
            // Contorno só por fora (mechas e pontas); por cima, o cabelo continua na cabeça sem emenda
            const massPath = (closed) => {
                ctx.beginPath();
                smoothThrough(P[0]);
                for (let i = 1; i < n; i++) {
                    const a = strands[i - 1];
                    const b = strands[i];
                    const last = a.length - 1;
                    const notch = project(...mix(mix(a[last - 1], b[last - 1], 0.5), mix(a[last], b[last], 0.5), 0.35));
                    ctx.lineTo(notch.x, notch.y);
                    ctx.lineTo(P[i][last].x, P[i][last].y);
                }
                smoothThrough([...P[n - 1]].reverse(), false);
                if (!closed) return;
                for (let i = n - 2; i > 0; i--) ctx.lineTo(P[i][0].x, P[i][0].y);
                ctx.closePath();
            };
            ctx.lineJoin = 'round';
            massPath(false);
            ctx.strokeStyle = C.outline;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            massPath(true);
            ctx.fillStyle = C.hair;
            ctx.fill();
            // Fios e sombra entre as mechas
            for (let i = 1; i < n - 1; i++) strokeSmooth(rig, strands[i], 0.3, C.hairShade);

            // Parte de trás da bandana (por cima do cabelo) e o nó
            const back = [];
            for (let j = 0; j <= 12; j++) back.push(H.sphere(Math.PI / 2 + (j / 12) * Math.PI, lat0, R * 1.03));
            strokeVisible(rig, H, back, A.bandWidth + 0.5, C.outline);
            strokeVisible(rig, H, back, A.bandWidth, C.bandana);
            for (const tail of tails) drawRibbon(rig, tail, 0.62, 0.32, C.bandana, C.outline);
            ball(knot, 0.9, C.bandanaShade);
            ball(add(knot, H.u, 0.15), 0.6, C.bandana);
        }
    };
}

// Cabeça vista de qualquer lado: cabelo com risca no meio, rosto cinza-azulado com queixo, olhos vermelhos,
// sobrancelhas franzidas, pintura de guerra, bandana na testa, orelhas pontudas e mechas caindo dos lados do rosto
export function azaelHeadPart(pose, rig) {
    const { project, anim, C } = rig;
    const H = headFrame(pose, rig);
    const R = H.R;
    const lat0 = Math.asin(A.bandHeight / R);
    // Mechas da frente: saem das têmporas (por fora do rosto) e caem sobre os ombros; vão para trás na corrida
    const locks = [-1, 1].map(side => flowChain(H.sphere(side * 1.4, lat0 - 0.1, R * 1.02), pose, anim, {
        len: 5,
        segs: 6,
        hang: [-0.1, side * 0.35, -1],
        bow: [0.2, side * 0.7, 0],
        stream: [-1, side * 0.2, -0.45],
        lag: 0.08,
        amp: 0.15,
        ampRun: 0.5,
        speed: 2.6,
        speedRun: 9,
        waveLength: 3,
        phase: side
    }));
    // Franja: mechas curtas que saem da risca e caem por cima da bandana dos dois lados da testa
    const bangs = [[-1, 0.3, 2.6], [-1, 0.75, 2], [1, 0.4, 2.4]].map(([side, lon, len], i) => {
        const root = H.sphere(side * lon, lat0 + 0.55, R * 1.02);
        const dir = norm(add(add(H.u.map(v => -v), H.s, side * 0.55), H.f, 0.55));
        return flowChain(root, pose, anim, {
            len, segs: 3, hang: dir, stream: add(dir, [-1, 0, 0], 0.2), lag: 0.02,
            amp: 0.08, ampRun: 0.25, speed: 2, speedRun: 8, waveLength: 2, phase: i,
            bow: add(H.f, H.s, side * 0.4).map(v => v * 0.35)
        });
    });
    return {
        depth: project(...H.c).depth,
        draw() {
            const t = pose.t;
            const baseAlpha = ctx.globalAlpha;
            const vis = Math.max(0, Math.min(1, (H.frontVis + 0.05) / 0.3));
            const ears = [-1, 1].map(side => ({ side, near: dot([0, side, 0], H.d) > 0 }));

            // Orelha do lado de lá: fica atrás da cabeça
            ears.filter(e => !e.near).forEach(e => drawEar(rig, H, e.side, C));

            // Cabelo: a cabeça inteira (o rosto é pintado por cima)
            silhouettePath(rig, H, R);
            ctx.fillStyle = C.hair;
            ctx.fill();
            const rim = [];
            const g1 = norm(cross([0, 0, 1], H.d));
            const g2 = cross(H.d, g1);
            for (let i = 0; i <= 36; i++) {
                const a = (i / 36) * Math.PI * 2;
                rim.push(add(add(H.c, g1, R * Math.cos(a)), g2, R * Math.sin(a)));
            }
            const low = (p) => dot(sub(p, H.c), H.u) < -R * 0.35 && dot(sub(p, H.c), H.f) > -R * 0.2;
            let arc = [];
            const flushArc = () => {
                if (arc.length > 1) strokeSmooth(rig, arc, 0.55, C.outline);
                arc = [];
            };
            for (const p of rim) {
                if (low(p)) flushArc();
                else arc.push(p);
            }
            flushArc();

            // Risca no meio e fios penteados da risca para os lados e para trás
            const parting = [];
            for (let j = 0; j <= 10; j++) parting.push(H.sphere(0, lat0 + (j / 10) * (Math.PI - lat0 * 0.5)));
            strokeVisible(rig, H, parting, 0.32, C.hairShade);
            for (const side of [-1, 1]) {
                const pts = [];
                for (let j = 0; j <= 8; j++) {
                    const q = j / 8;
                    pts.push(H.sphere(side * (0.12 + q * 1.9), lat0 + 0.45 + q * 0.25, R * 1.01));
                }
                ctx.globalAlpha = baseAlpha * 0.6;
                strokeVisible(rig, H, pts, 0.2, C.hairShade);
                ctx.globalAlpha = baseAlpha;
            }

            if (vis > 0) {
                ctx.globalAlpha = baseAlpha * vis;
                // Rosto: da bandana até o queixo, espremido na borda quando ele está de perfil
                const outline = [...A.face.map(([sv, uv]) => [-sv, uv]), ...[...A.face].reverse().slice(1).map(([sv, uv]) => [sv, uv])];
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
                // Contorno só no queixo e na mandíbula (dos lados o cabelo emoldura o rosto)
                const jaw = outline.slice(3, outline.length - 3).map(([sv, uv]) => H.clampVisible(H.face(sv, uv)));
                strokeSmooth(rig, jaw, 0.32, C.outline);

                const F = (sv, uv) => H.face(sv, uv);
                const shown = (sv, uv) => H.facing(F(sv, uv)) > 0.05;
                // Sombra das maçãs do rosto e do lado do nariz
                for (const side of [-1, 1]) {
                    if (shown(side * 1.9, -1.4)) strokeSmooth(rig, [F(side * 2.15, -0.7), F(side * 1.75, -1.6), F(side * 1.3, -2.3)], 0.3, C.skinShade);
                }
                if (shown(-0.25, -1)) strokeSmooth(rig, [F(-0.18, -0.55), F(-0.3, -1.45), F(0.12, -1.6)], 0.28, C.skinShade);
                // Boca: traço curto e sério
                if (shown(0, -2.3)) strokeSmooth(rig, [F(-0.6, -2.25), F(0, -2.32), F(0.6, -2.25)], 0.26, C.mouth);

                for (const side of [-1, 1]) {
                    if (!shown(side * 1.05, -0.35)) continue;
                    // Pintura de guerra: faixa preta descendo do olho até a mandíbula
                    strokeSmooth(rig, [F(side * 1.1, -0.55), F(side * 1.18, -1.7), F(side * 1.25, -2.85)], 0.42, C.warPaint);
                    // Olho amendoado e inclinado (canto de dentro mais baixo: cara fechada)
                    const inner = project(...F(side * 0.5, -0.5));
                    const outer = project(...F(side * 1.65, -0.18));
                    const top = project(...F(side * 1.05, -0.08));
                    const bottom = project(...F(side * 1.05, -0.58));
                    ctx.fillStyle = C.eye;
                    ctx.beginPath();
                    ctx.moveTo(inner.x, inner.y);
                    ctx.quadraticCurveTo(top.x, top.y, outer.x, outer.y);
                    ctx.quadraticCurveTo(bottom.x, bottom.y, inner.x, inner.y);
                    ctx.fill();
                    const e = project(...F(side * 1.05, -0.33));
                    ctx.save();
                    ctx.globalCompositeOperation = 'lighter';
                    drawGlow(ctx, C.eyeGlow, e.x, e.y, 1.7, (0.55 + 0.25 * Math.sin(t * 3 + side)) * vis);
                    ctx.restore();
                    // Sobrancelha franzida: grossa, desce para o meio da testa
                    strokeSmooth(rig, [F(side * 0.3, -0.12), F(side * 1.0, 0.18), F(side * 1.85, 0.32)], 0.38, C.outline);
                }
                ctx.globalAlpha = baseAlpha;
            }

            // Bandana na testa: faixa em volta da cabeça (só a parte virada para a câmera), com sombra embaixo
            const band = [];
            for (let j = 0; j <= 24; j++) band.push(H.sphere((j / 24) * Math.PI * 2 - Math.PI, lat0, R * 1.03));
            strokeVisible(rig, H, band, A.bandWidth + 0.5, C.outline);
            strokeVisible(rig, H, band, A.bandWidth, C.bandana);
            strokeVisible(rig, H, band.map(p => add(p, H.u, -A.bandWidth * 0.32)), 0.3, C.bandanaShade);

            // Orelha do lado de cá, por cima do cabelo
            ears.filter(e => e.near).forEach(e => drawEar(rig, H, e.side, C));

            // Franja por cima da bandana e mechas dos lados do rosto, que caem sobre os ombros
            if (vis > 0) {
                ctx.globalAlpha = baseAlpha * vis;
                for (const bang of bangs) drawRibbon(rig, bang, 0.55, 0.05, C.hair, C.hairShade, false);
                ctx.globalAlpha = baseAlpha;
            }
            for (const lock of locks) {
                if (H.facing(lock[0]) < -0.1) continue;
                drawRibbon(rig, lock, 0.5, 0.12, C.hair, C.hairShade, true);
            }
        }
    };
}

// --- CAPA ---
// A mesma capa do herói (âncoras nos ombros e barra rasgada com a física de player.js), mas de pano: cada tira
// vira uma curva que ondula da raiz até a barra, e no meio ela cede um pouco com o peso quando ele corre.
export function drawAzaelCape(rig, pose, anchors, hem) {
    const { project, C } = rig;
    const { t, run } = pose;
    const n = anchors.length - 1;
    const segs = 5;
    const amp = A.capeRipple + A.capeRippleRun * run;
    const speed = A.capeRippleSpeed * (0.5 + run);
    const strips = anchors.map((root, i) => {
        const pts = [];
        for (let j = 0; j <= segs; j++) {
            const k = j / segs;
            const w = t * speed - k * 3.6 + i * 0.85;
            const p = mix(root, hem[i], k);
            p[1] += Math.sin(w) * amp * k;
            p[2] += Math.cos(w * 0.8) * amp * 0.7 * k - Math.sin(Math.PI * k) * A.capeSag * run;
            pts.push(p);
        }
        return pts;
    });
    const P = strips.map(ch => ch.map(p => project(...p)));

    ctx.beginPath();
    smoothThrough(P[0]);
    for (let i = 1; i <= n; i++) {
        const a = strips[i - 1][segs];
        const b = strips[i][segs];
        const before = mix(strips[i - 1][segs - 1], strips[i][segs - 1], 0.5);
        const notch = project(...mix(before, mix(a, b, 0.5), 0.55));
        ctx.lineTo(notch.x, notch.y);
        ctx.lineTo(P[i][segs].x, P[i][segs].y);
    }
    smoothThrough([...P[n]].reverse(), false);
    for (let i = n - 1; i > 0; i--) ctx.lineTo(P[i][0].x, P[i][0].y);
    ctx.closePath();
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.9;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.fillStyle = C.cape;
    ctx.fill();
    ctx.strokeStyle = C.capeEdge;
    ctx.lineWidth = 0.35;
    ctx.stroke();

    // Dobras: curvas escuras entre as tiras e um brilho fraco ao lado de cada uma
    for (let i = 1; i < n; i += 2) {
        strokeSmooth(rig, strips[i], 0.9, C.capeFold);
        strokeSmooth(rig, strips[i].map(p => [p[0], p[1] + 0.45, p[2] + 0.1]), 0.35, C.capeEdge);
    }
}

// --- KATANA ---
// Guarda (tsuba): disco perpendicular à espada, no ponto p, com o eixo da espada em dir. A posição ao longo da
// espada vem de guardOffset (+ para o lado da lâmina) e o tamanho de guardSize; a cor é colors.tsuba.
function drawGuard(rig, p, dir) {
    const { disk, C } = rig;
    const flat = Math.hypot(dir[0], dir[1]) || 1;
    const w = [-dir[1] / flat, dir[0] / flat, 0];
    const v = norm(cross(dir, w));
    const r = A.guardSize;
    ctx.fillStyle = C.tsuba;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.3;
    disk(p, w.map(x => x * r), v.map(x => x * r));
    ctx.fill();
    ctx.stroke();
}

// Lâmina curva e fina, com cabo trançado e guarda redonda; hand = mão no cabo, dir = direção da lâmina
export function drawKatana(rig, hand, dir, alpha, color = null) {
    const { project, limb, ball, C } = rig;
    const at = (d) => add(hand, dir, d);
    const flat = Math.hypot(dir[0], dir[1]) || 1;
    const w = [-dir[1] / flat, dir[0] / flat, 0];
    const L = A.bladeLength;
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    if (!color) {
        limb([at(-3.2), at(0.3)], 1.1, C.hilt);
        drawGuard(rig, at(0.7 + A.guardOffset), dir);
    }

    // Costas e fio: a lâmina curva para o lado das costas e afina na ponta
    const spine = [];
    const edge = [];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
        const k = i / steps;
        const p = at(1 + (L - 1) * k);
        const bend = A.bladeCurve * k * k;
        const half = A.bladeWidth / 2 * (1 - 0.45 * k);
        spine.push(project(p[0] - w[0] * (bend + half), p[1] - w[1] * (bend + half), p[2]));
        edge.push(project(p[0] - w[0] * (bend - half), p[1] - w[1] * (bend - half), p[2]));
    }
    const tipPt = add(at(L + 0.8), w, -A.bladeCurve * 1.3);
    const tip = project(...tipPt);
    ctx.fillStyle = color ?? C.blade;
    ctx.beginPath();
    spine.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.lineTo(tip.x, tip.y);
    for (let i = steps; i >= 0; i--) ctx.lineTo(edge[i].x, edge[i].y);
    ctx.closePath();
    ctx.fill();

    if (!color) {
        ctx.strokeStyle = C.bladeCore;
        ctx.lineWidth = 0.35;
        ctx.beginPath();
        edge.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();
    }
    ctx.globalAlpha = baseAlpha;
}

// Boca da bainha e mão no cabo (com a katana guardada), acompanhando o quadril
export function scabbardFrame(pose) {
    const m = A.scabbardMouth;
    const mouth = [m[0] + pose.lean * 0.3, m[1], m[2] - pose.crouch];
    return { mouth, grip: add(mouth, A.scabbardDir, -A.hiltLength * 0.55), dir: A.scabbardDir };
}

// Bainha preta na cintura; com a katana guardada (sheathed = 1), o cabo e a guarda saem da boca.
// Enquanto ela sai ou volta, o cabo da bainha some no mesmo ritmo em que a lâmina aparece.
export function azaelScabbardPart(pose, rig, sheathed) {
    const { project, limb, ball, C } = rig;
    const { mouth, dir } = scabbardFrame(pose);
    const end = add(mouth, dir, A.scabbardLength);
    return {
        depth: project(...add(mouth, dir, A.scabbardLength * 0.4)).depth - 0.2,
        draw() {
            limb([mouth, end], 1.3, C.scabbard);
            // Brilho fraco no lacado da bainha e a amarração perto da boca
            limb([add(mouth, dir, 2), add(mouth, dir, A.scabbardLength - 1)].map(p => [p[0], p[1], p[2] + 0.35]), 0.25, C.scabbardShine);
            limb([add(mouth, dir, 0.4), add(mouth, dir, 1.4)], 1.5, C.bandageLine);
            if (sheathed > 0) {
                ctx.save();
                ctx.globalAlpha *= sheathed;
                drawGuard(rig, add(mouth, dir, -0.3 + A.guardOffset), dir);
                limb([add(mouth, dir, -0.7), add(mouth, dir, -A.hiltLength)], 1.1, C.hilt);
                ctx.restore();
            }
        }
    };
}

// --- BRAÇOS E PERNAS ---
// Membro e bola com contorno escuro: sem ele a pele clara se mistura com o chão e com o pano
function olimb(rig, pts, width, color) {
    rig.limb(pts, width + 0.6, rig.C.outline);
    rig.limb(pts, width, color);
}

function oball(rig, p, r, color) {
    rig.ball(p, r + 0.3, rig.C.outline);
    rig.ball(p, r, color);
}

// Faixa de pano enrolada num trecho do membro (de q0 a q1), com as voltas marcadas
function wrap(rig, from, to, q0, q1, width, turns) {
    const { limb, C } = rig;
    limb([mix(from, to, q0), mix(from, to, q1)], width + 0.6, C.outline);
    limb([mix(from, to, q0), mix(from, to, q1)], width, C.bandage);
    for (let i = 1; i <= turns; i++) {
        const q = q0 + ((q1 - q0) * i) / (turns + 1);
        limb([mix(from, to, q - 0.015), mix(from, to, q + 0.015)], width + 0.05, C.bandageLine);
    }
}

// Braço nu e magro: faixa no antebraço, garras pretas na mão. O braço da espada (lado direito) tem o ombro à
// mostra com uma faixa no bíceps; o outro fica coberto pelo pano do cachecol, como nas imagens.
export function drawAzaelArm(rig, shoulder, elbow, hand, armWidth, handRadius) {
    const { limb, C } = rig;
    const bare = shoulder[1] > 0;
    const w = armWidth * 0.85;
    oball(rig, shoulder, 1.5, C.skin);
    olimb(rig, [shoulder, elbow, hand], w, C.skin);
    // Luz no ombro e no bíceps
    limb([mix(shoulder, elbow, 0.05), mix(shoulder, elbow, 0.4)].map(p => [p[0], p[1], p[2] + 0.35]), w * 0.35, C.skinLight);
    if (bare) wrap(rig, shoulder, elbow, 0.5, 0.7, w + 0.15, 1);
    wrap(rig, elbow, hand, 0.18, 0.86, w + 0.2, 3);
    oball(rig, hand, handRadius, C.skin);
    // Garras: três, abrindo em leque à frente da mão
    const d = norm([hand[0] - elbow[0], hand[1] - elbow[1], hand[2] - elbow[2]]);
    const side = norm([-d[1], d[0], 0]);
    for (const k of [-1, 0, 1]) limb([add(add(hand, d, 0.8), side, k * 0.45), add(add(hand, d, 1.9), side, k * 0.75)], 0.38, C.claw);
    if (!bare) {
        // Pano do cachecol caindo sobre o ombro
        const top = [shoulder[0] - 0.2, shoulder[1] * 0.85, shoulder[2] + 0.9];
        olimb(rig, [top, mix(shoulder, elbow, 0.45)], 2.7, C.cape);
        limb([add(top, [1, 0, 0], 0.5), mix(shoulder, elbow, 0.4)], 0.35, C.capeFold);
    }
}

// Perna: calça larga escura até a canela, faixas da canela ao tornozelo e pé descalço de 3 dedos
// (2 para a frente, 1 para trás) com garras pretas
export function drawAzaelLeg(rig, hip, knee, ankle, footBase) {
    const { limb, C } = rig;
    const shin = mix(knee, ankle, 0.35);
    // Calça: mais larga no joelho, como uma hakama
    olimb(rig, [hip, knee, shin], A.legWidth, C.body);
    rig.ball(knee, A.legWidth * 0.62, C.body);
    limb([mix(hip, knee, 0.2), mix(hip, knee, 0.85)].map(p => [p[0] + 0.4, p[1], p[2]]), 0.3, C.capeFold);
    wrap(rig, shin, ankle, 0, 1, A.legWidth * 0.68, 3);
    const [a, b, z] = footBase;
    // Dedos e garras primeiro (o contorno do pé fica por cima da raiz)
    for (const s of [-1, 1]) {
        const tip = [a + A.toeLength, b + s * A.toeSpread, z - 0.45];
        olimb(rig, [[a + 0.3, b + s * 0.3, z], tip], 0.65, C.skin);
        limb([tip, [tip[0] + A.clawLength, tip[1] + s * 0.1, tip[2] - 0.3]], 0.55, C.claw);
    }
    const heel = [a - A.heelToeLength, b, z - 0.4];
    olimb(rig, [[a - 0.2, b, z + 0.1], heel], 0.7, C.skin);
    limb([heel, [heel[0] - A.clawLength * 0.8, b, heel[2] - 0.25]], 0.5, C.claw);
    olimb(rig, [ankle, footBase], 1.05, C.skin);
    rig.ball(footBase, 0.75, C.skin);
}

// --- TRONCO ---
// Peito nu e magro com músculos marcados, calça (sem cinto), faixa de pano cruzando o peito e o cachecol volumoso enrolado no pescoço
export function drawAzaelTorso(rig, pose, bottom, top, wb, wt) {
    const { project, limb, disk, C, sinF } = rig;
    const pb = project(bottom.a, 0, bottom.z);
    const pt = project(top.a, 0, top.z);
    const front = Math.max(0, Math.min(1, sinF * 1.5 + 0.4));
    const baseAlpha = ctx.globalAlpha;

    // Quadril (calça)
    ctx.fillStyle = C.body;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.4;
    disk([bottom.a, 0, bottom.z], [bottom.A * 1.1, 0, 0], [0, bottom.B * 1.1, 0]);
    ctx.fill();
    ctx.stroke();

    // Peito: mais estreito na cintura, largo nos ombros
    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.moveTo(pb.x - wb * 0.9, pb.y);
    ctx.quadraticCurveTo(pb.x - wb * 0.95, (pb.y + pt.y) / 2, pt.x - wt, pt.y);
    ctx.lineTo(pt.x + wt, pt.y);
    ctx.quadraticCurveTo(pb.x + wb * 0.95, (pb.y + pt.y) / 2, pb.x + wb * 0.9, pb.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Peitoral e abdômen: só de frente para a câmera
    const fa = (z) => bottom.a + (top.a - bottom.a) * ((z - bottom.z) / (top.z - bottom.z)) + 2.6;
    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        const chestZ = top.z - 2.2;
        for (const s of [-1, 1]) limb([[fa(chestZ), s * 0.3, chestZ], [fa(chestZ), s * 2.6, chestZ + 0.5]], 0.32, C.skinShade);
        limb([[fa(bottom.z + 1.5), 0, bottom.z + 1.5], [fa(chestZ - 0.3), 0, chestZ - 0.3]], 0.28, C.skinShade);
        for (const z of [bottom.z + 1.9, bottom.z + 3.1, bottom.z + 4.3]) {
            for (const s of [-1, 1]) limb([[fa(z), s * 0.35, z], [fa(z), s * 1.35, z + 0.15]], 0.26, C.skinShade);
        }
        // Luz no peito
        limb([[fa(chestZ + 0.6), -1.4, chestZ + 0.6], [fa(chestZ + 0.6), 1.4, chestZ + 0.6]], 0.6, C.skinLight);
        ctx.globalAlpha = baseAlpha;
    }

    if (front > 0) {
        ctx.globalAlpha = baseAlpha * front;
        // Pano cruzando o peito (do ombro direito ao lado esquerdo da cintura)
        olimb(rig, [[top.a + top.A * 0.8, top.B * 0.6, top.z - 0.3], [fa(bottom.z + 3), -1, bottom.z + 3], [bottom.a + bottom.A * 0.9, -bottom.B * 0.75, pose.sashZ + 0.8]], 1.3, C.cape);
        ctx.globalAlpha = baseAlpha;
    }

    // Cachecol volumoso no pescoço: dobras enroladas, com contorno
    const scarf = [top.a + 0.1, 0, top.z + 0.6];
    ctx.fillStyle = C.cape;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.35;
    disk(scarf, [top.A * 1.0, 0, 0], [0, top.B * 0.78, 0]);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.capeFold;
    disk([scarf[0] - 0.2, 0, scarf[2] + 0.5], [top.A * 0.7, 0, 0], [0, top.B * 0.5, 0]);
    ctx.fill();
    ctx.fillStyle = C.capeEdge;
    disk([scarf[0] + 0.2, 0, scarf[2] + 0.9], [top.A * 0.6, 0, 0], [0, top.B * 0.45, 0]);
    ctx.fill();
    // Volta do pano em volta do pescoço
    ctx.strokeStyle = C.capeFold;
    ctx.lineWidth = 0.35;
    disk([scarf[0], 0, scarf[2] + 0.2], [top.A * 0.85, 0, 0], [0, top.B * 0.64, 0]);
    ctx.stroke();
}

// --- REGISTRO DO BONECO (lido por js/render/player25d.js; interface em js/render/body_registry.js) ---
// Azael ataca com a mão ESQUERDA e guarda a katana na bainha: o braço livre (o direito) fica sempre na bainha, e a
// lâmina só aparece quando sai dela (drawn).
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Quanto a katana está fora da bainha (0 = guardada, 1 = na mão). Sobe e desce junto com a mão indo do cabo para o
// golpe, então a lâmina desliza para fora e para dentro da bainha em vez de piscar.
const drawnOf = (pose) => clamp01((Math.max(pose.blend, pose.sword?.w ?? 0) - 0.02) / A.drawBlend);

// Em repouso a mão fica no cabo da katana guardada; no golpe ela sai da bainha e varre.
// armHand: a mão esquerda (a da espada): no cabo (boca da bainha + sheathHand ao longo dela + leftHandOffset) ou na varredura.
function swordRest(rig, pose, { swingAngle, blend }) {
    const sheath = scabbardFrame(pose);
    const swingHand = [Math.cos(swingAngle) * V.swingRadius, Math.sin(swingAngle) * V.swingRadius, V.swingHeight];
    const d = mix(sheath.dir, [Math.cos(swingAngle), Math.sin(swingAngle), 0], blend);
    const size = Math.hypot(...d) || 1;
    const restHand = sheath.mouth.map((v, i) => v + sheath.dir[i] * A.sheathHand + A.leftHandOffset[i]);
    let armHand = mix(restHand, swingHand, blend);
    if (pose.sword) armHand = mix(armHand, pose.sword.hand, pose.sword.w);
    return { hand: mix(sheath.grip, swingHand, blend), dir: d.map(v => v / size), armHand };
}

// Braço livre (o direito): lançar adaga, feitiço, bola de fogo e poção usam posições do lado esquerdo; aqui elas são
// espelhadas para o lado direito, e sem ação a mão fica na bainha.
function freeArm(rig, pose, { hand, throwK, charge, fireHold, cast }) {
    const shoulder = [pose.lean, V.chest.B, pose.shoulderZ - 0.5];
    const sheath = scabbardFrame(pose);
    const rest = sheath.grip.map((v, i) => v + A.rightHandOffset[i]);
    const act = Math.max(
        throwK >= 0 ? Math.min(1, Math.sin(Math.PI * throwK) * 4) : 0,
        charge > 0 || fireHold > 0 ? Math.min(1, Math.max(charge, fireHold) * 4) : 0,
        cast,
        pose.free ? pose.free.w : 0
    );
    const mirrored = mix(rest, [hand[0], -hand[1], hand[2]], act);
    const eo = A.rightElbowOffset.map(v => v * (1 - act));
    const elbow = [(shoulder[0] + mirrored[0]) / 2 + 0.6 + eo[0], (shoulder[1] + mirrored[1]) / 2 + 1 + eo[1], (shoulder[2] + mirrored[2]) / 2 + (throwK >= 0 ? 0.8 : 0) + eo[2]];
    return { shoulder, hand: mirrored, elbow };
}

// Braço ESQUERDO (o da espada): em repouso a mão fica no cabo; no golpe sai da bainha e o cotovelo volta ao movimento normal.
function swordArmPart(rig, pose) {
    const { armHand: hand } = rig.swordArmPose(pose);
    const shoulder = [pose.lean, -V.chest.B, pose.shoulderZ - 0.5];
    const hold = 1 - drawnOf(pose);
    const leo = A.leftElbowOffset.map(v => v * hold);
    // Segurando o cabo, o braço cruza na frente da barriga (cotovelo à frente) e é desenhado na frente do corpo
    const elbow = [(shoulder[0] + hand[0]) / 2 - 0.4 + hold * 2.2 + leo[0], -V.chest.B - 1 + hold * 2.6 + leo[1], (shoulder[2] + hand[2]) / 2 + leo[2]];
    const armDepth = rig.project(...elbow).depth + 0.1;
    return {
        // (na frente do corpo, mas sempre atrás da cabeça: senão o pano do ombro cobre o rosto)
        depth: hold > 0.5 ? Math.min(Math.max(armDepth, rig.project(...hand).depth + 0.2), rig.project(pose.headA, 0, pose.headZ).depth - 0.05) : armDepth,
        draw() {
            drawAzaelArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
        }
    };
}

registerBody('azael', {
    vis: A,
    sheathed: true,
    // O corpo sobe e desce duas vezes por passada (um pé de cada vez) e anda mais agachado
    runBob: (anim, run) => (0.5 - 0.5 * Math.cos(anim.stride * 2)) * A.runBob * run - A.runCrouch * run,
    drawLeg: (rig, { hip, knee, ankle, side, reach, lift }) => drawAzaelLeg(rig, hip, knee, ankle, [reach + 0.4, side * V.footSpread, 0.9 + lift]),
    drawTorso: (rig, pose, bottom, top, wb, wt) => drawAzaelTorso(rig, pose, bottom, top, wb, wt),
    drawBack(rig, pose, anchors, hem) {
        rig.sashEnds(pose);
        drawAzaelCape(rig, pose, anchors, hem);
    },
    freeArm,
    drawArm: (rig, shoulder, elbow, hand, armWidth, handRadius) => drawAzaelArm(rig, shoulder, elbow, hand, armWidth, handRadius),
    swordArmPart,
    swordRest,
    drawBlade: (rig, hand, dir, alpha) => drawKatana(rig, hand, dir, alpha),
    drawn: drawnOf,
    headParts: (pose, rig) => [azaelHeadPart(pose, rig), azaelHairPart(pose, rig), azaelScabbardPart(pose, rig, 1 - drawnOf(pose))]
});
