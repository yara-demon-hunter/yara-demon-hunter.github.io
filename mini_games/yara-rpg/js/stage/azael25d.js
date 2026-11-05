// --- AZAEL (herói 2.5D do palco) ---
// Cópia de last_torch/js/render/azael25d.js. Peças do Azael montadas na mesma câmera e com a mesma animação do
// boneco de js/stage/hero25d.js: cabeça sem capuz (rosto, orelhas pontudas, olhos vermelhos, pintura de guerra),
// cabelo branco esvoaçante, bandana, katana curva, bainha na cintura, braços nus enfaixados e pés descalços de 3 dedos.
// rig: { project, projectVec, limb, ball, disk, anim, C, sinF, cosF, heightScale, sphereY }.
// Coordenadas locais: a = frente, b = direita, z = altura. Medidas e cores: js/data/visuals/hero25d.js (azael).
// Script clássico: expõe window.YaraStage25D.azael; hero25d.js liga o contexto (bind) antes de desenhar.
(() => {
const NS = window.YaraStage25D = window.YaraStage25D || {};
const A = window.YaraRpgData.visuals.hero25d.azael;
const { drawGlow } = NS.fx;
let ctx = null;

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
// Atrás da cabeça: a massa do cabelo branco, a parte de trás da bandana com o nó e as duas pontas soltas.
// Tudo ondula e fica para trás na corrida; parado, balança devagar.
function azaelHairPart(pose, rig) {
    const { project, ball, anim, C } = rig;
    const { run } = pose;
    const R = A.headRadius;
    const n = A.hairStrands;
    const bandZ = pose.headZ + 0.8;
    const strands = [];
    for (let i = 0; i < n; i++) {
        const k = i / (n - 1);
        const psi = Math.PI * (0.6 + 0.8 * k);         // arco das costas da cabeça
        const side = Math.sin(psi);
        const jag = 0.82 + 0.22 * Math.sin(i * 2.3 + 0.7);
        const root = [pose.headA + R * 0.9 * Math.cos(psi), R * 0.92 * side, bandZ - 0.2];
        strands.push(flowChain(root, pose, anim, {
            len: (A.hairLength + A.hairRunLength * run) * jag,
            segs: 5,
            hang: [-0.42, side * 0.32, -1],
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
    const knot = [pose.headA - R, 0, bandZ];
    const tails = [-1, 1].map(side => flowChain([knot[0], side * 0.3, bandZ], pose, anim, {
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
        depth: project(pose.headA - R - 1.5, 0, pose.headZ - 1).depth,
        draw() {
            // Massa do cabelo: borda pelas mechas de fora, pontas soltas com entalhes entre elas
            const P = strands.map(ch => ch.map(p => project(...p)));
            ctx.fillStyle = C.hair;
            ctx.strokeStyle = C.hairShade;
            ctx.lineWidth = 0.45;
            ctx.lineJoin = 'round';
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
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Fios e sombra entre as mechas
            for (let i = 1; i < n - 1; i++) strokeSmooth(rig, strands[i], 0.3, C.hairShade);

            // Parte de trás da bandana (por cima do cabelo) e o nó
            const back = [];
            for (let j = 0; j <= 10; j++) {
                const psi = Math.PI / 2 + (j / 10) * Math.PI;
                back.push([pose.headA + R * 0.98 * Math.cos(psi), R * 0.98 * Math.sin(psi), bandZ]);
            }
            strokeSmooth(rig, back, 1, C.bandana);
            for (const tail of tails) drawRibbon(rig, tail, 0.62, 0.32, C.bandana, C.bandanaShade);
            ball(knot, 0.85, C.bandanaShade);
            ball([knot[0] + 0.1, 0, knot[2] + 0.15], 0.55, C.bandana);
        }
    };
}

// Rosto branco-prateado, orelhas pontudas, cabelo no alto, bandana na testa e olhos vermelhos
function azaelHeadPart(pose, rig) {
    const { project, projectVec, limb, ball, disk, anim, C, sinF, cosF } = rig;
    const R = A.headRadius;
    const center = [pose.headA, 0, pose.headZ];
    // Mechas da frente: caem dos dois lados do rosto e vão para trás na corrida
    const locks = [-1, 1].map(side => flowChain([pose.headA + 0.6, side * 2.6, pose.headZ + 1.3], pose, anim, {
        len: 3.8,
        segs: 4,
        hang: [0.1, side * 0.22, -1],
        stream: [-1, side * 0.12, -0.5],
        lag: 0.08,
        amp: 0.12,
        ampRun: 0.45,
        speed: 2.6,
        speedRun: 9,
        waveLength: 3,
        phase: side
    }));
    return {
        depth: project(...center).depth,
        draw() {
            const t = pose.t;
            const c = project(...center);
            const ry = R * rig.sphereY;

            // Orelhas: pontas para os lados, para trás e um pouco para cima
            for (const side of [-1, 1]) {
                const base = [pose.headA - 0.2, side * R * 0.9, pose.headZ + 0.1];
                const tip = [pose.headA - 1.3, side * (R + A.earLength), pose.headZ + 1.5];
                const p0 = project(base[0] + 0.6, base[1], base[2] + 0.7);
                const p1 = project(...tip);
                const p2 = project(base[0] - 0.6, base[1], base[2] - 0.8);
                ctx.fillStyle = C.skinShade;
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.closePath();
                ctx.fill();
            }

            // Cabeça
            ctx.fillStyle = C.skin;
            ctx.strokeStyle = C.outline;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.ellipse(c.x, c.y, R, ry, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Cabelo cobrindo o alto e a parte de trás da cabeça (o rosto fica à mostra)
            ball([pose.headA - 1.5, 0, pose.headZ + 1.2], R * 0.94, C.hairShade);
            ball([pose.headA - 1.3, 0, pose.headZ + 1.6], R * 0.84, C.hair);
            // Risca no meio e uns poucos fios penteados para trás (traço fino, mais claro que a sombra)
            ctx.save();
            ctx.globalAlpha *= 0.55;
            for (const b of [-1.5, 0, 1.1]) {
                limb([
                    [pose.headA + 0.7, b * 0.5, pose.headZ + 2.3],
                    [pose.headA - 1.2, b * 0.9, pose.headZ + 2.75],
                    [pose.headA - 2.9, b * 1.1, pose.headZ + 1.5]
                ], 0.2, C.hairShade);
            }
            ctx.restore();

            // Rosto: um "ovo" na frente da cabeça, como a máscara do Caçador (de frente fica largo; de perfil,
            // estreito), para ler de cima. Some quando ele está de costas para a câmera.
            const vis = Math.max(0, Math.min(1, (sinF + 0.45) / 0.5));
            const baseAlpha = ctx.globalAlpha;
            const fc = [pose.headA + A.faceForward, 0, pose.headZ + A.faceHeightOffset];
            const f = project(...fc);
            if (vis > 0) {
                ctx.globalAlpha = baseAlpha * vis;
                const fw = Math.hypot(A.faceDepth * cosF, A.faceWidth * sinF);
                const fh = A.faceHeight * rig.heightScale + 0.5;
                // Contorno suave (o preto fazia o rosto parecer um visor)
                ctx.fillStyle = C.skin;
                ctx.strokeStyle = C.skinShade;
                ctx.lineWidth = 0.3;
                ctx.beginPath();
                ctx.ellipse(f.x, f.y, fw, fh, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Maçãs do rosto pegando luz e o queixo um pouco mais escuro
                const down = projectVec(0, 0, -1);
                ctx.fillStyle = C.skinLight;
                ctx.globalAlpha = baseAlpha * vis * 0.6;
                ctx.beginPath();
                ctx.ellipse(f.x - down.x * 0.4, f.y - down.y * 0.4, fw * 0.6, fh * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = baseAlpha;
            }

            // Bandana na testa: só a metade da frente do anel aparece
            const bandC = [pose.headA + 0.5, 0, pose.headZ + 0.8];
            const band = project(...bandC);
            ctx.save();
            ctx.beginPath();
            ctx.rect(band.x - 20, band.y - 0.3, 40, 20);
            ctx.clip();
            disk(bandC, [A.faceForward + A.faceDepth - 0.4, 0, 0], [0, R * 1.04, 0]);
            ctx.strokeStyle = C.bandana;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();

            if (vis > 0) {
                ctx.globalAlpha = baseAlpha * vis;
                for (const side of [-1, 1]) {
                    const eye = [fc[0] + A.faceDepth * 0.75, side * 0.95, fc[2] + 0.3];
                    const e = project(...eye);
                    if (e.depth < f.depth - 0.3) continue;
                    // Pintura de guerra: traço preto descendo do olho até o queixo
                    limb([[eye[0], eye[1], eye[2] - 0.5], [eye[0] - 0.4, eye[1] * 1.08, eye[2] - 2.4]], side < 0 ? 0.5 : 0.38, C.warPaint);
                    // Sobrancelha franzida: desce para o meio da testa
                    limb([[eye[0] + 0.05, side * 0.35, eye[2] + 0.45], [eye[0] - 0.15, side * 1.5, eye[2] + 0.9]], 0.3, C.outline);
                    // Boca: traço curto e sério
                    limb([[eye[0] + 0.05, 0, eye[2] - 1.9], [eye[0] - 0.05, side * 0.55, eye[2] - 1.85]], 0.2, C.skinShade);
                    ctx.fillStyle = C.eye;
                    ctx.beginPath();
                    ctx.ellipse(e.x, e.y, 0.25 + 0.4 * Math.abs(sinF), 0.38, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.save();
                    ctx.globalCompositeOperation = 'lighter';
                    drawGlow(ctx, C.eyeGlow, e.x, e.y, 1.6, (0.55 + 0.25 * Math.sin(t * 3 + side)) * vis);
                    ctx.restore();
                }
                ctx.globalAlpha = baseAlpha;
            }

            // Mechas da frente caindo dos dois lados do rosto
            for (const lock of locks) drawRibbon(rig, lock, 0.5, 0.05, C.hair, C.hairShade, false);
        }
    };
}

// --- CAPA ---
// A mesma capa do herói (âncoras nos ombros e barra rasgada com a física de player.js), mas de pano: cada tira
// vira uma curva que ondula da raiz até a barra, e no meio ela cede um pouco com o peso quando ele corre.
function drawAzaelCape(rig, pose, anchors, hem) {
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
    ctx.fillStyle = C.cape;
    ctx.fill();
    ctx.strokeStyle = C.capeEdge;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Dobras: curvas escuras entre as tiras e um brilho fraco ao lado de cada uma
    for (let i = 1; i < n; i += 2) {
        strokeSmooth(rig, strips[i], 0.9, C.capeFold);
        strokeSmooth(rig, strips[i].map(p => [p[0], p[1] + 0.45, p[2] + 0.1]), 0.35, C.capeEdge);
    }
}

// --- KATANA ---
// Lâmina curva e fina, com cabo trançado e guarda redonda; hand = mão no cabo, dir = direção da lâmina
function drawKatana(rig, hand, dir, alpha, color = null) {
    const { project, limb, ball, C } = rig;
    const at = (d) => add(hand, dir, d);
    const flat = Math.hypot(dir[0], dir[1]) || 1;
    const w = [-dir[1] / flat, dir[0] / flat, 0];
    const L = A.bladeLength;
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    if (!color) {
        limb([at(-3.2), at(0.3)], 1.1, C.hilt);
        ball(at(0.7), 0.85, C.tsuba);
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
function scabbardFrame(pose) {
    const m = A.scabbardMouth;
    const mouth = [m[0] + pose.lean * 0.3, m[1], m[2] - pose.crouch];
    return { mouth, grip: add(mouth, A.scabbardDir, -A.hiltLength * 0.55), dir: A.scabbardDir };
}

// Bainha preta na cintura; com a katana guardada (sheathed = 1), o cabo e a guarda saem da boca.
// Enquanto ela sai ou volta, o cabo da bainha some no mesmo ritmo em que a lâmina aparece.
function azaelScabbardPart(pose, rig, sheathed) {
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
                ball(add(mouth, dir, -0.3), 0.85, C.tsuba);
                limb([add(mouth, dir, -0.7), add(mouth, dir, -A.hiltLength)], 1.1, C.hilt);
                ctx.restore();
            }
        }
    };
}

// --- BRAÇOS E PERNAS ---
// Braço nu, com faixas no bíceps e no antebraço e garras na mão
function drawAzaelArm(rig, shoulder, elbow, hand, armWidth, handRadius) {
    const { limb, ball, C } = rig;
    ball(shoulder, 1.7, C.skin);
    limb([shoulder, elbow, hand], armWidth, C.skin);
    limb([mix(shoulder, elbow, 0.45), mix(shoulder, elbow, 0.68)], armWidth + 0.25, C.bandage);
    limb([mix(elbow, hand, 0.2), mix(elbow, hand, 0.92)], armWidth + 0.2, C.bandage);
    limb([mix(elbow, hand, 0.45), mix(elbow, hand, 0.5)], armWidth + 0.25, C.bandageLine);
    ball(hand, handRadius, C.skin);
    const d = [hand[0] - elbow[0], hand[1] - elbow[1], hand[2] - elbow[2]];
    const len = Math.hypot(...d) || 1;
    limb([add(hand, d, 0.8 / len), add(hand, d, 1.7 / len)], 0.5, C.claw);
    // O pano do cachecol cai sobre o ombro (sem ele, o ombro nu parecia uma ombreira branca)
    ball([shoulder[0] - 0.2, shoulder[1], shoulder[2] + 0.3], 2.1, C.capeFold);
    ball([shoulder[0], shoulder[1] * 0.96, shoulder[2] + 0.65], 1.7, C.cape);
}

// Perna: calça larga, faixas na canela e pé descalço de 3 dedos (2 para a frente, 1 para trás) com garras
function drawAzaelLeg(rig, hip, knee, ankle, footBase) {
    const { limb, ball, C } = rig;
    limb([hip, knee, ankle], A.legWidth, C.body);
    limb([[ankle[0], ankle[1], ankle[2] + 2.6], ankle], A.legWidth * 0.78, C.bandage);
    limb([[ankle[0], ankle[1], ankle[2] + 1.2], [ankle[0], ankle[1], ankle[2] + 1.5]], A.legWidth * 0.8, C.bandageLine);
    const [a, b, z] = footBase;
    limb([ankle, footBase], 1.6, C.skin);
    ball(footBase, 1.1, C.skin);
    for (const s of [-1, 1]) {
        const tip = [a + A.toeLength, b + s * A.toeSpread, z - 0.45];
        limb([[a + 0.3, b + s * 0.35, z], tip], 0.9, C.skin);
        limb([tip, [tip[0] + A.clawLength, tip[1], tip[2] - 0.2]], 0.55, C.claw);
    }
    const heel = [a - A.heelToeLength, b, z - 0.4];
    limb([[a - 0.2, b, z + 0.1], heel], 0.8, C.skin);
    limb([heel, [heel[0] - A.clawLength * 0.8, b, heel[2] - 0.2]], 0.5, C.claw);
}

// --- TRONCO ---
// Peito nu, calça e faixa (obi) na cintura, cachecol volumoso no pescoço e uma faixa de pano cruzando o peito
function drawAzaelTorso(rig, pose, bottom, top, wb, wt) {
    const { project, limb, disk, C, sinF } = rig;
    const pb = project(bottom.a, 0, bottom.z);
    const pt = project(top.a, 0, top.z);

    ctx.fillStyle = C.body;
    disk([bottom.a, 0, bottom.z], [bottom.A * 1.1, 0, 0], [0, bottom.B * 1.1, 0]);
    ctx.fill();

    ctx.fillStyle = C.skin;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(pb.x - wb, pb.y);
    ctx.lineTo(pt.x - wt, pt.y);
    ctx.lineTo(pt.x + wt, pt.y);
    ctx.lineTo(pb.x + wb, pb.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Músculos do abdômen: só de frente para a câmera
    const front = Math.max(0, Math.min(1, sinF * 1.5 + 0.4));
    if (front > 0) {
        const baseAlpha = ctx.globalAlpha;
        ctx.globalAlpha = baseAlpha * front * 0.7;
        const fa = (z) => bottom.a + (top.a - bottom.a) * ((z - bottom.z) / (top.z - bottom.z)) + 2.6;
        limb([[fa(bottom.z + 1.5), 0, bottom.z + 1.5], [fa(top.z - 2), 0, top.z - 2]], 0.3, C.skinShade);
        for (const z of [bottom.z + 2.2, bottom.z + 3.6]) limb([[fa(z), -1.4, z], [fa(z), 1.4, z]], 0.3, C.skinShade);
        ctx.globalAlpha = baseAlpha;
    }

    // Faixa (obi): só a metade da frente do anel aparece
    const sash = project(bottom.a, 0, pose.sashZ);
    ctx.save();
    ctx.beginPath();
    ctx.rect(sash.x - 20, sash.y, 40, 20);
    ctx.clip();
    disk([bottom.a, 0, pose.sashZ], [bottom.A * 1.1, 0, 0], [0, bottom.B * 1.1, 0]);
    ctx.strokeStyle = C.sash;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = C.skinLight;
    disk([top.a, 0, top.z], [top.A * 0.95, 0, 0], [0, top.B * 0.95, 0]);
    ctx.fill();

    // Pano cruzando o peito (do ombro direito ao lado esquerdo da cintura)
    if (front > 0) {
        const baseAlpha = ctx.globalAlpha;
        ctx.globalAlpha = baseAlpha * front;
        limb([[top.a + top.A * 0.8, top.B * 0.6, top.z - 0.3], [bottom.a + bottom.A * 0.9, -bottom.B * 0.7, pose.sashZ + 1]], 1.6, C.cape);
        ctx.globalAlpha = baseAlpha;
    }

    // Cachecol volumoso no pescoço
    ctx.fillStyle = C.capeFold;
    disk([top.a, 0, top.z + 0.5], [top.A * 0.95, 0, 0], [0, top.B * 0.72, 0]);
    ctx.fill();
    ctx.fillStyle = C.cape;
    disk([top.a + 0.2, 0, top.z + 1.1], [top.A * 0.8, 0, 0], [0, top.B * 0.6, 0]);
    ctx.fill();
}

NS.azael = {
    bind(context) { ctx = context; },
    azaelHairPart, azaelHeadPart, drawAzaelCape, drawKatana, scabbardFrame, azaelScabbardPart,
    drawAzaelArm, drawAzaelLeg, drawAzaelTorso
};
})();
