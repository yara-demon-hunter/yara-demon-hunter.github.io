import { ctx } from '../../core/canvas.js';

// --- FERRAMENTAS DOS BONECOS 2.5D ---
// Geometria (vetores, cadeias que ondulam, fitas, curvas suaves) e a cabeça com rosto (headFrame: uma esfera com eixos
// próprios, que sabe o que está virado para a câmera). Usadas pelos bonecos com cabeça e membros próprios
// (azael/azael25d.js, brutos/brutos25d.js), cada um com as suas medidas. rig: as ferramentas do boneco (hero25d.js).
// Coordenadas locais: a = frente, b = direita, z = altura.

export const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
export const add = (p, d, k) => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];

// --- PANO E CABELO QUE ONDULAM ---
// Corrente de pontos que sai de root: parada cai na direção hang, correndo vai na direção stream (para trás),
// atrasa com a capa (anim.capeX/capeY, física de hero_anim.js) e ondula com uma onda que corre da raiz até a ponta.
export const norm = (v) => {
    const l = Math.hypot(...v) || 1;
    return v.map(x => x / l);
};

export function flowChain(root, pose, anim, o) {
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
export function smoothThrough(pts, moveFirst = true) {
    if (moveFirst) ctx.moveTo(pts[0].x, pts[0].y);
    else ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
}

export function strokeSmooth(rig, chain, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    smoothThrough(chain.map(p => rig.project(...p)));
    ctx.stroke();
}

// Fita (pontas da bandana, mechas): larga na raiz, fina na ponta; forked = ponta rasgada em V
export function drawRibbon(rig, chain, w0, w1, fill, edge, forked = true) {
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
export const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
export const cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
export const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];

// Direção local que aponta para a câmera (tirada da própria projeção, vale para qualquer câmera)
export function viewDir(rig) {
    const ex = rig.projectVec(1, 0, 0);
    const ey = rig.projectVec(0, 1, 0);
    const ez = rig.projectVec(0, 0, 1);
    let d = norm(cross([ex.x, ey.x, ez.x], [ex.y, ey.y, ez.y]));
    const o = rig.project(0, 0, 0).depth;
    const g = [rig.project(1, 0, 0).depth - o, rig.project(0, 1, 0).depth - o, rig.project(0, 0, 1).depth - o];
    if (dot(d, g) < 0) d = d.map(v => -v);
    return d;
}

// P: medidas da cabeça do boneco (headRadius, faceTilt, faceTiltFront, faceTurn, jawForward, faceOut: ver azael_visual.js)
// Eixos da cabeça: f = para onde o rosto olha, s = direita, u = alto da cabeça
export function headFrame(pose, rig, P) {
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
export function strokeVisible(rig, H, pts, width, color) {
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
export function silhouettePath(rig, H, r) {
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

// Membro e bola com contorno escuro: sem ele a pele clara se mistura com o chão e com o pano
export function olimb(rig, pts, width, color) {
    rig.limb(pts, width + 0.6, rig.C.outline);
    rig.limb(pts, width, color);
}

export function oball(rig, p, r, color) {
    rig.ball(p, r + 0.3, rig.C.outline);
    rig.ball(p, r, color);
}


// --- MÃO ---
// Mão redonda (uma bola) com dois riscos que dizem "mão": a dobra dos dedos atravessando a frente e um risquinho do
// polegar do lado de dentro. elbow → hand dá a direção do antebraço; side: +1 mão direita, -1 esquerda.
// o: { color (pele ou luva), shade (cor dos riscos; padrão o contorno), outline (cor do contorno; null = sem
//      contorno), size (raio da bola; padrão 1), grip (0 = relaxada, 1 = fechada: a dobra dos dedos fica mais marcada) }
export function drawHand(rig, elbow, hand, side, o) {
    const { limb, ball } = rig;
    const r = o.size ?? 1;
    const grip = o.grip ?? 0;
    const line = o.outline === undefined ? rig.C.outline : o.outline;
    const crease = o.shade ?? line ?? 'rgba(0, 0, 0, 0.45)';
    const d = norm(sub(hand, elbow));
    let inward = norm([-d[1], d[0], 0]).map(v => v * (side > 0 ? -1 : 1));
    if (!Number.isFinite(inward[0])) inward = [0, -side, 0];
    if (line) ball(hand, r + 0.3, line);
    ball(hand, r, o.color);
    // Dobra dos dedos: arco na frente da bola, de um lado ao outro
    const front = add(hand, d, r * 0.35);
    limb([add(add(front, inward, -r * 0.7), d, -r * 0.15), add(front, d, r * 0.12), add(add(front, inward, r * 0.7), d, -r * 0.15)],
        r * (0.16 + 0.06 * grip), crease);
    // Polegar: risquinho do lado de dentro, da base para a frente
    limb([add(add(hand, inward, r * 0.55), d, -r * 0.2), add(add(hand, inward, r * 0.45), d, r * 0.3)], r * 0.14, crease);
}
