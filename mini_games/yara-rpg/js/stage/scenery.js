// --- PALCO 2.5D: câmera e cenário ---
// Câmera de diorama (olha a trilha de cima, inclinada, com perspectiva) e o cenário de cada região:
// fundo, fileiras de adereços (árvores, samambaias, pedras...), trilha, névoa em camadas, luz, esporos e vinheta.
// O mundo é infinito ao longo da trilha (x): cada fileira é dividida em células, e cada célula sorteia o seu adereço
// com uma semente fixa, então o mesmo lugar sempre tem a mesma árvore. Cada adereço é desenhado uma vez numa
// imagem em cache (por tipo, variação e tamanho) e depois só copiado: andar pela floresta custa só drawImage.
// Dados (cores, fileiras, câmera): js/data/visuals/stage.js. Script clássico: window.YaraStage25D.scenery.
(() => {
    const NS = window.YaraStage25D = window.YaraStage25D || {};
    const { hash, clamp, glowSprite } = NS.fx;
    const DATA = window.YaraRpgData.visuals.stage;

    // --- CÂMERA ---
    // Mundo: x ao longo da trilha, dr = profundidade em relação aos personagens (+ = mais longe), z = altura.
    function createCamera(cfg) {
        const th = cfg.pitchDeg * Math.PI / 180;
        const sin = Math.sin(th);
        const cos = Math.cos(th);
        // heightScale/groundSquash: a mesma inclinação para o boneco 2.5D (ele é desenhado sem perspectiva)
        const cam = { x: 0, W: 1, H: 1, heightScale: cos, groundSquash: sin, F: 1, h: 1, r0: 1, cy: 0, sa: 1 };
        cam.resize = (W, H) => {
            cam.W = W;
            cam.H = H;
            // px por unidade na profundidade dos personagens: o herói ocupa heroHeight do palco
            cam.sa = cfg.heroHeight * H / (cfg.heroTop * cos);
            cam.cy = cfg.center * H;
            const up0 = -(cfg.actorLine * H - cam.cy) / cam.sa;
            cam.h = cfg.distance * sin - up0 * cos;
            cam.r0 = cfg.distance * cos + up0 * sin;
            cam.F = cam.sa * cfg.distance;
        };
        cam.scaleAt = (dr, z = 0) => cam.F / ((cam.r0 + dr) * cos + (cam.h - z) * sin);
        cam.project = (x, dr, z = 0) => {
            const r = cam.r0 + dr;
            const s = cam.F / (r * cos + (cam.h - z) * sin);
            const up = r * sin + (z - cam.h) * cos;
            return { x: cam.W / 2 + (x - cam.x) * s, y: cam.cy - up * s, s };
        };
        // Profundidade do chão que aparece na altura sy da tela (inversa de project com z = 0)
        cam.drAtY = (sy) => {
            const rho = (cam.cy - sy) / cam.F;
            const den = sin - rho * cos;
            if (den <= 1e-4) return 1e4;
            return cam.h * (cos + rho * sin) / den - cam.r0;
        };
        // x do mundo que aparece na coluna sx da tela, numa profundidade
        cam.xAt = (sx, dr) => cam.x + (sx - cam.W / 2) / cam.scaleAt(dr);
        return cam;
    }

    // Aleatório com semente (o mesmo desenho sai sempre igual)
    function rng(seed) {
        let a = seed >>> 0;
        return () => {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // Ruído suave (para as bordas da trilha)
    function noise(x, seed) {
        const i = Math.floor(x);
        const f = x - i;
        const a = hash(i, seed, 91);
        const b = hash(i + 1, seed, 91);
        return a + (b - a) * f * f * (3 - 2 * f);
    }

    // Traço que afina: curva de (x0, y0) a (x1, y1) puxada por (cx, cy), largura w0 → w1
    function taper(g, x0, y0, cx, cy, x1, y1, w0, w1, color) {
        const n = 8;
        g.strokeStyle = color;
        g.lineCap = 'round';
        let px = x0;
        let py = y0;
        for (let i = 1; i <= n; i++) {
            const t = i / n;
            const u = 1 - t;
            const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
            const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
            g.lineWidth = w0 + (w1 - w0) * (t - 0.5 / n);
            g.beginPath();
            g.moveTo(px, py);
            g.lineTo(x, y);
            g.stroke();
            px = x;
            py = y;
        }
    }

    // Galho retorcido com galhinhos
    function branch(g, r, x, y, ang, len, w, depth, color) {
        const bend = (r() - 0.5) * 1.1;
        const ex = x + Math.cos(ang + bend * 0.6) * len;
        const ey = y + Math.sin(ang + bend * 0.6) * len;
        const cx = x + Math.cos(ang - bend * 0.4) * len * 0.55;
        const cy = y + Math.sin(ang - bend * 0.4) * len * 0.55;
        taper(g, x, y, cx, cy, ex, ey, w, Math.max(0.22, w * 0.25), color);
        if (depth <= 0) return;
        const n = 1 + Math.floor(r() * 2);
        for (let k = 0; k < n; k++) {
            const t = 0.45 + r() * 0.4;
            const u = 1 - t;
            const sx = u * u * x + 2 * u * t * cx + t * t * ex;
            const sy = u * u * y + 2 * u * t * cy + t * t * ey;
            branch(g, r, sx, sy, ang + (r() < 0.5 ? -1 : 1) * (0.4 + r() * 0.6), len * (0.4 + r() * 0.3), w * 0.5, depth - 1, color);
        }
    }

    // --- ADEREÇOS ---
    // Cada tipo: bounds (w = meia largura, up = altura acima da base, down = abaixo, em unidades), variants e paint.
    // paint(g, r, T, o): g já está em unidades com a origem na base (y para cima é negativo); o.squash achata o
    // que fica deitado no chão. blur: desfoque (unidades), para o primeiro plano parecer fora de foco.
    const PROPS = {
        // Árvore retorcida da Floresta da Névoa: tronco curvo, galhos tortos, raízes, musgo e luz fria de um lado
        tree: {
            bounds: { w: 34, up: 108, down: 7 },
            variants: 4,
            paint(g, r, T, o) {
                const H = 72 + r() * 30;
                const lean = (r() - 0.5) * 12;
                const w0 = 2.5 + r() * 1.3;
                const ph = r() * 6.28;
                const pt = (t) => [lean * t * t + Math.sin(t * 5 + ph) * 1.6 * t, -H * t];
                const wt = (t) => w0 * (1 - 0.72 * t) + 0.3;
                for (let i = 0; i < 5; i++) {
                    const side = i % 2 ? 1 : -1;
                    const len = 4 + r() * 7;
                    const ey = (r() - 0.3) * 3 * o.squash;
                    taper(g, side * w0 * 0.5, -1.4, side * (w0 + len * 0.4), -0.5 + ey * 0.3, side * (w0 * 0.6 + len), ey, w0 * 0.9, 0.3, T.trunk);
                }
                const N = 16;
                g.fillStyle = T.trunk;
                g.beginPath();
                for (let i = 0; i <= N; i++) {
                    const t = i / N;
                    const [x, y] = pt(t);
                    if (i) g.lineTo(x - wt(t), y);
                    else g.moveTo(x - wt(t), y);
                }
                for (let i = N; i >= 0; i--) {
                    const t = i / N;
                    const [x, y] = pt(t);
                    g.lineTo(x + wt(t), y);
                }
                g.closePath();
                g.fill();
                // Galhos tortos desde baixo (é o que aparece no quadro) e um galho grosso que se abre no meio
                const nb = 5 + Math.floor(r() * 3);
                for (let i = 0; i < nb; i++) {
                    const t = 0.14 + (i / nb) * 0.7 + r() * 0.05;
                    const [bx, by] = pt(t);
                    const side = i % 2 ? 1 : -1;
                    branch(g, r, bx + side * wt(t) * 0.4, by, -Math.PI / 2 + side * (0.75 + r() * 0.75), 8 + r() * 13, wt(t) * 0.7, 2, T.trunk);
                }
                const [lx, ly] = pt(0.4);
                const limbSide = r() < 0.5 ? -1 : 1;
                branch(g, r, lx, ly, -Math.PI / 2 + limbSide * (0.35 + r() * 0.3), 26 + r() * 12, wt(0.4) * 1.1, 3, T.trunk);
                // Luz fria do portal escorrendo pelo lado direito do tronco
                g.globalAlpha = 0.55;
                g.strokeStyle = T.trunkLight;
                g.lineWidth = 0.55;
                g.beginPath();
                for (let i = 1; i <= N - 3; i++) {
                    const t = i / N;
                    const [x, y] = pt(t);
                    if (i === 1) g.moveTo(x + wt(t) - 0.35, y);
                    else g.lineTo(x + wt(t) - 0.35, y);
                }
                g.stroke();
                // Musgo na base
                g.globalAlpha = 0.5;
                g.fillStyle = T.moss;
                for (let i = 0; i < 4; i++) {
                    const t = r() * 0.22;
                    const [x, y] = pt(t);
                    g.beginPath();
                    g.ellipse(x + (r() - 0.3) * wt(t), y, 0.9 + r(), 0.5 + r() * 0.5, 0, 0, Math.PI * 2);
                    g.fill();
                }
                g.globalAlpha = 1;
            }
        },
        // Pinheiro escuro (camadas serrilhadas)
        pine: {
            bounds: { w: 14, up: 92, down: 3 },
            variants: 3,
            paint(g, r, T) {
                const H = 62 + r() * 25;
                const W = 8 + r() * 4;
                g.fillStyle = T.trunk;
                g.fillRect(-0.9, -H * 0.3, 1.8, H * 0.3);
                const tiers = 7;
                for (let k = 0; k < tiers; k++) {
                    const t0 = 0.16 + (k / tiers) * 0.78;
                    const tw = W * (1 - (k / tiers) * 0.85);
                    const bot = -H * t0;
                    const top = -H * Math.min(1, t0 + 0.26);
                    // Borda serrilhada: desce pela direita, atravessa embaixo e sobe pela esquerda
                    const right = [];
                    for (let j = 1; j <= 4; j++) {
                        const f = j / 4;
                        right.push([tw * f * (0.92 + r() * 0.16), top + (bot - top) * f + 0.9]);
                        if (j < 4) right.push([tw * f * 0.66, top + (bot - top) * f - 0.3]);
                    }
                    const left = right.map(([x, y]) => [-x * (0.95 + r() * 0.1), y]).reverse();
                    g.fillStyle = T.leaf;
                    g.beginPath();
                    g.moveTo(0, top);
                    right.forEach(([x, y]) => g.lineTo(x, y));
                    left.forEach(([x, y]) => g.lineTo(x, y));
                    g.closePath();
                    g.fill();
                    g.globalAlpha = 0.32;
                    g.strokeStyle = T.trunkLight;
                    g.lineWidth = 0.5;
                    g.beginPath();
                    g.moveTo(0.3, top + 0.5);
                    g.lineTo(tw * 0.9, bot + 0.4);
                    g.stroke();
                    g.globalAlpha = 1;
                }
            }
        },
        // Samambaia: folhas arqueadas com folíolos
        fern: {
            bounds: { w: 13, up: 13, down: 2 },
            variants: 3,
            paint(g, r, T) {
                const n = 7 + Math.floor(r() * 4);
                for (let i = 0; i < n; i++) {
                    const side = (i / (n - 1)) * 2 - 1;
                    const len = 8 + r() * 4 - Math.abs(side) * 2;
                    const ang = -Math.PI / 2 + side * 1.2 + (r() - 0.5) * 0.25;
                    const cx = Math.cos(ang) * len * 0.5;
                    const cy = Math.sin(ang) * len * 0.95;
                    const ex = Math.cos(ang) * len;
                    const ey = Math.sin(ang) * len * 0.55 + Math.abs(side) * len * 0.35;
                    const color = i % 2 ? T.fern : T.fernLight;
                    taper(g, 0, 0, cx, cy, ex, ey, 0.45, 0.12, color);
                    for (let k = 1; k < 10; k++) {
                        const t = k / 10;
                        const u = 1 - t;
                        const x = 2 * u * t * cx + t * t * ex;
                        const y = 2 * u * t * cy + t * t * ey;
                        const tx = 2 * u * cx + 2 * t * (ex - cx);
                        const ty = 2 * u * cy + 2 * t * (ey - cy);
                        const tl = Math.hypot(tx, ty) || 1;
                        const nx = -ty / tl;
                        const ny = tx / tl;
                        const l = (1 - t) * 1.7 + 0.35;
                        g.strokeStyle = color;
                        g.lineWidth = 0.35;
                        g.beginPath();
                        g.moveTo(x + nx * l + tx / tl * l * 0.5, y + ny * l + ty / tl * l * 0.5);
                        g.lineTo(x, y);
                        g.lineTo(x - nx * l + tx / tl * l * 0.5, y - ny * l + ty / tl * l * 0.5);
                        g.stroke();
                    }
                }
            }
        },
        // Pedra com o topo pegando luz e um pouco de musgo
        rock: {
            bounds: { w: 9, up: 8, down: 3 },
            variants: 3,
            paint(g, r, T, o) {
                const W = 4 + r() * 3.5;
                const Hh = 2.5 + r() * 3.5;
                const base = W * 0.3 * o.squash;
                g.fillStyle = 'rgba(0, 0, 0, 0.4)';
                g.beginPath();
                g.ellipse(0.6, base * 0.5, W * 1.15, W * 0.5 * o.squash + 0.3, 0, 0, Math.PI * 2);
                g.fill();
                const pts = [];
                const n = 7;
                for (let i = 0; i <= n; i++) {
                    const a = Math.PI + (i / n) * Math.PI;
                    const rr = 0.8 + r() * 0.35;
                    pts.push([Math.cos(a) * W * rr, Math.sin(a) * Hh * rr]);
                }
                g.fillStyle = T.rock;
                g.beginPath();
                g.moveTo(-W, base);
                pts.forEach(([x, y]) => g.lineTo(x, y));
                g.lineTo(W, base);
                g.closePath();
                g.fill();
                g.fillStyle = T.rockLight;
                g.globalAlpha = 0.55;
                g.beginPath();
                g.moveTo(pts[1][0] * 0.8, pts[1][1] * 0.8);
                for (let i = 2; i < n; i++) g.lineTo(pts[i][0] * 0.88 + 0.3, pts[i][1] * 0.95);
                g.lineTo(pts[n - 1][0] * 0.5, pts[n - 1][1] * 0.35);
                g.lineTo(pts[2][0] * 0.4, pts[2][1] * 0.4);
                g.closePath();
                g.fill();
                g.fillStyle = T.moss;
                g.globalAlpha = 0.6;
                for (let i = 0; i < 3; i++) {
                    const p = pts[1 + Math.floor(r() * (n - 1))];
                    g.beginPath();
                    g.ellipse(p[0] * 0.8, p[1] * 0.85, 0.8 + r() * 0.9, 0.35 + r() * 0.3, 0, 0, Math.PI * 2);
                    g.fill();
                }
                g.globalAlpha = 1;
            }
        },
        // Cogumelos que brilham azulados
        mushrooms: {
            bounds: { w: 5, up: 6, down: 1.5 },
            variants: 2,
            paint(g, r, T) {
                const n = 2 + Math.floor(r() * 3);
                for (let i = 0; i < n; i++) {
                    const x = (r() - 0.5) * 5;
                    const h = 1.3 + r() * 2.2;
                    const cw = 0.75 + r() * 0.7;
                    const glow = g.createRadialGradient(x, -h, 0, x, -h, 3.2);
                    glow.addColorStop(0, 'rgba(142, 240, 255, 0.35)');
                    glow.addColorStop(1, 'rgba(142, 240, 255, 0)');
                    g.fillStyle = glow;
                    g.fillRect(x - 3.2, -h - 3.2, 6.4, 6.4);
                    g.strokeStyle = '#b9dfe6';
                    g.lineWidth = 0.32;
                    g.beginPath();
                    g.moveTo(x, 0);
                    g.quadraticCurveTo(x + (r() - 0.5) * 0.8, -h * 0.5, x, -h);
                    g.stroke();
                    g.fillStyle = T.mushroom;
                    g.beginPath();
                    g.ellipse(x, -h, cw, cw * 0.62, 0, Math.PI, Math.PI * 2);
                    g.fill();
                    g.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    g.fillRect(x - cw * 0.35, -h - cw * 0.42, cw * 0.25, cw * 0.14);
                }
            }
        },
        // Toco de árvore cortada
        stump: {
            bounds: { w: 7, up: 7, down: 3 },
            variants: 2,
            paint(g, r, T, o) {
                const W = 2.4 + r() * 1.2;
                const Hh = 2.8 + r() * 2.4;
                for (const side of [-1, 1]) taper(g, side * W * 0.6, -0.6, side * (W + 1.5), 0, side * (W + 3), 0.6 * o.squash, W * 0.7, 0.3, T.trunk);
                g.fillStyle = T.trunk;
                g.fillRect(-W, -Hh, W * 2, Hh);
                g.fillStyle = T.trunkLight;
                g.beginPath();
                g.ellipse(0, -Hh, W, W * o.squash, 0, 0, Math.PI * 2);
                g.fill();
                g.strokeStyle = T.trunk;
                g.lineWidth = 0.25;
                for (const k of [0.65, 0.35]) {
                    g.beginPath();
                    g.ellipse(0, -Hh, W * k, W * k * o.squash, 0, 0, Math.PI * 2);
                    g.stroke();
                }
                g.globalAlpha = 0.6;
                g.fillStyle = T.moss;
                g.beginPath();
                g.ellipse(-W * 0.3, -Hh * 0.3, W * 0.6, Hh * 0.25, 0, 0, Math.PI * 2);
                g.fill();
                g.globalAlpha = 1;
            }
        },
        // Tufo de capim
        grass: {
            bounds: { w: 4, up: 5, down: 0.6 },
            variants: 3,
            paint(g, r, T) {
                const n = 6 + Math.floor(r() * 5);
                for (let i = 0; i < n; i++) {
                    const x0 = (r() - 0.5) * 2.6;
                    const h = 1.6 + r() * 2.6;
                    const lean = (r() - 0.5) * 2.4;
                    taper(g, x0, 0, x0 + lean * 0.3, -h * 0.6, x0 + lean, -h, 0.42, 0.08, i % 3 ? T.grass : T.fernLight);
                }
            }
        },
        // Pedrinhas no chão
        pebbles: {
            bounds: { w: 3.5, up: 1.6, down: 1.6 },
            variants: 3,
            paint(g, r, T, o) {
                const n = 2 + Math.floor(r() * 3);
                for (let i = 0; i < n; i++) {
                    const x = (r() - 0.5) * 5;
                    const y = (r() - 0.5) * 2 * o.squash;
                    const w = 0.35 + r() * 0.6;
                    g.fillStyle = T.rock;
                    g.beginPath();
                    g.ellipse(x, y, w, w * 0.7, 0, 0, Math.PI * 2);
                    g.fill();
                    g.fillStyle = T.rockLight;
                    g.globalAlpha = 0.6;
                    g.beginPath();
                    g.ellipse(x - w * 0.2, y - w * 0.25, w * 0.5, w * 0.3, 0, 0, Math.PI * 2);
                    g.fill();
                    g.globalAlpha = 1;
                }
            }
        },
        // Raiz atravessando o chão
        root: {
            bounds: { w: 10, up: 2.5, down: 3 },
            variants: 2,
            paint(g, r, T, o) {
                const y0 = (r() - 0.5) * 2 * o.squash;
                taper(g, -9, y0 + 0.6, -2, y0 - 2.2, 3, y0 - 0.2, 0.5, 1.1, T.trunk);
                taper(g, 3, y0 - 0.2, 6, y0 + 0.8, 9, y0 + 0.4, 1.1, 0.3, T.trunk);
                g.globalAlpha = 0.45;
                taper(g, -6, y0 - 0.3, -2, y0 - 2.5, 2.5, y0 - 0.75, 0.2, 0.25, T.trunkLight);
                g.globalAlpha = 1;
            }
        },
        // Copa: um galho grosso que atravessa no alto, com galhos caindo, folhagem escura e musgo pendurado.
        // A origem é o ponto de onde pende (a fileira diz a altura z): o desenho fica abaixo dela.
        canopy: {
            bounds: { w: 32, up: 8, down: 30 },
            variants: 3,
            blur: 0.1,
            paint(g, r, T) {
                const len = 22 + r() * 8;
                const y0 = -3 + r() * 3;
                const y1 = y0 + 5 + r() * 3;
                const y2 = y0 - 3 + r() * 3;
                taper(g, -len - 4, y0, 0, y1, len + 4, y2, 3.4, 1.4, T.trunk);
                const on = (t) => {
                    const u = 1 - t;
                    return [u * u * (-len - 4) + t * t * (len + 4), u * u * y0 + 2 * u * t * y1 + t * t * y2];
                };
                // Folhagem: tufos escuros em cima do galho
                g.fillStyle = T.leaf;
                for (let i = 0; i < 9; i++) {
                    const [x, y] = on(0.08 + (i / 8) * 0.84);
                    g.beginPath();
                    g.ellipse(x + (r() - 0.5) * 3, y - 1 - r() * 2.5, 3 + r() * 3, 1.6 + r() * 1.6, (r() - 0.5) * 0.6, 0, Math.PI * 2);
                    g.fill();
                }
                // Galhos caindo
                for (let i = 0; i < 5; i++) {
                    const [x, y] = on(0.12 + (i / 4) * 0.76 + (r() - 0.5) * 0.06);
                    branch(g, r, x, y + 0.5, Math.PI / 2 + (r() - 0.5) * 1.3, 6 + r() * 10, 1.1, 1, T.trunk);
                }
                // Musgo pendurado
                g.strokeStyle = T.moss;
                g.lineWidth = 0.35;
                g.globalAlpha = 0.7;
                for (let i = 0; i < 9; i++) {
                    const [x, y] = on(r());
                    const l = 4 + r() * 10;
                    g.beginPath();
                    g.moveTo(x, y + 0.8);
                    g.quadraticCurveTo(x + (r() - 0.5) * 2.5, y + l * 0.6, x + (r() - 0.5) * 1.5, y + l);
                    g.stroke();
                }
                // Luz fria por cima do galho
                g.globalAlpha = 0.4;
                g.strokeStyle = T.trunkLight;
                g.lineWidth = 0.5;
                g.beginPath();
                for (let i = 0; i <= 12; i++) {
                    const [x, y] = on(0.05 + (i / 12) * 0.9);
                    if (i) g.lineTo(x, y - 1.2);
                    else g.moveTo(x, y - 1.2);
                }
                g.stroke();
                g.globalAlpha = 1;
            }
        },
        // Tronco enorme em primeiro plano (quase preto, desfocado): moldura da cena
        frontTrunk: {
            bounds: { w: 16, up: 150, down: 4 },
            variants: 2,
            blur: 0.35,
            paint(g, r, T) {
                const w0 = 3.6 + r() * 2.2;
                const lean = (r() - 0.5) * 10;
                const N = 12;
                g.fillStyle = '#030a0c';
                g.beginPath();
                for (let i = 0; i <= N; i++) {
                    const t = i / N;
                    const x = lean * t * t - w0 * (1 - 0.35 * t) - (i === 0 ? 3 : 0);
                    if (i) g.lineTo(x, -140 * t);
                    else g.moveTo(x, 0);
                }
                for (let i = N; i >= 0; i--) {
                    const t = i / N;
                    g.lineTo(lean * t * t + w0 * (1 - 0.35 * t) + (i === 0 ? 3 : 0), -140 * t);
                }
                g.closePath();
                g.fill();
                g.globalAlpha = 0.22;
                g.strokeStyle = T.trunkLight;
                g.lineWidth = 0.6;
                g.beginPath();
                for (let i = 1; i < N; i++) {
                    const t = i / N;
                    const x = lean * t * t + w0 * (1 - 0.35 * t) - 0.6;
                    if (i === 1) g.moveTo(x, -140 * t);
                    else g.lineTo(x, -140 * t);
                }
                g.stroke();
                g.globalAlpha = 1;
            }
        },
        // Folhas grandes de samambaia em primeiro plano (silhueta desfocada)
        frontFern: {
            bounds: { w: 24, up: 34, down: 4 },
            variants: 2,
            blur: 0.3,
            paint(g, r) {
                const n = 6 + Math.floor(r() * 3);
                for (let i = 0; i < n; i++) {
                    const side = (i / (n - 1)) * 2 - 1;
                    const len = 20 + r() * 10 - Math.abs(side) * 4;
                    const ang = -Math.PI / 2 + side * 1.05;
                    const ex = Math.cos(ang) * len;
                    const ey = Math.sin(ang) * len * 0.6 + Math.abs(side) * len * 0.3;
                    const cx = Math.cos(ang) * len * 0.45;
                    const cy = Math.sin(ang) * len;
                    taper(g, 0, 0, cx, cy, ex, ey, 1.2, 0.3, '#040c0e');
                    for (let k = 1; k < 9; k++) {
                        const t = k / 9;
                        const u = 1 - t;
                        const x = 2 * u * t * cx + t * t * ex;
                        const y = 2 * u * t * cy + t * t * ey;
                        const l = (1 - t) * 4 + 1;
                        g.fillStyle = '#040c0e';
                        g.beginPath();
                        g.ellipse(x, y, l, l * 0.35, ang + 1.2, 0, Math.PI * 2);
                        g.ellipse(x, y, l, l * 0.35, ang - 1.2, 0, Math.PI * 2);
                        g.fill();
                    }
                }
            }
        }
    };

    // --- CENA ---
    // Uma cena por palco. setTheme troca a região; resize recalcula a câmera, as fileiras e as camadas fixas.
    function createScene() {
        const cam = createCamera(DATA.camera);
        let T = null;           // cenário atual (DATA.scenes[...])
        let themeId = null;
        let seed = 1;
        let W = 1;
        let H = 1;
        let dpr = 1;
        let rows = [];          // fileiras com a faixa de profundidade já calculada
        let layers = null;      // gradientes fixos (fundo, névoa, luz, vinheta)
        const sprites = new Map();
        let spritesThisFrame = 0;

        function resolveTheme(regionId) {
            const id = DATA.scenes[regionId] ? regionId : DATA.fallbackScene;
            return { id, theme: DATA.scenes[id] };
        }

        function setTheme(regionId) {
            const { id, theme } = resolveTheme(regionId);
            if (id === themeId) return false;
            themeId = id;
            T = theme;
            seed = [...id].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) | 0, 7);
            sprites.clear();
            build();
            return true;
        }

        function resize(width, height, ratio) {
            if (width === W && height === H && ratio === dpr) return;
            W = width;
            H = height;
            dpr = ratio;
            cam.resize(W, H);
            sprites.clear();
            build();
        }

        // Fileiras (profundidade de cada uma) e gradientes fixos para o tamanho e o cenário atuais
        function build() {
            if (!T || W < 2) return;
            rows = T.rows.map((row, index) => {
                const drFar = row.dr ? row.dr[1] : cam.drAtY(row.y[0] * H);
                const drNear = row.dr ? row.dr[0] : cam.drAtY(row.y[1] * H);
                const z = row.z || [0, 0];
                const reach = Math.max(...row.kinds.map(([kind]) => PROPS[kind].bounds.w)) * row.scale * 1.3;
                // Onde termina na tela (fração da altura): até lá vai a névoa por cima da fileira
                const down = Math.max(...row.kinds.map(([kind]) => PROPS[kind].bounds.down)) * row.scale;
                const bottom = row.y ? row.y[1] : cam.project(cam.x, drNear, z[0] - down).y / H;
                return { ...row, index, drFar, drNear, z, reach, bottom };
            });
            const g = document.createElement('canvas').getContext('2d');
            const sky = g.createLinearGradient(0, 0, 0, H);
            sky.addColorStop(0, T.sky[0]);
            sky.addColorStop(0.18, T.sky[1]);
            sky.addColorStop(0.4, T.sky[2]);
            sky.addColorStop(0.62, T.ground[0]);
            sky.addColorStop(0.85, T.ground[1]);
            sky.addColorStop(1, T.ground[2]);
            const veils = rows.map((row) => {
                if (!row.fog) return null;
                const end = Math.min(1, row.bottom + 0.14) * H;
                const veil = g.createLinearGradient(0, 0, 0, end);
                veil.addColorStop(0, fogColor(row.fog));
                veil.addColorStop(Math.min(1, row.bottom * H / end), fogColor(row.fog * 0.8));
                veil.addColorStop(1, fogColor(0));
                return { gradient: veil, end };
            });
            const vignette = g.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.35, W / 2, H * 0.55, Math.max(W, H) * 0.75);
            vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
            const lx = T.light.x * W;
            const shaft = g.createLinearGradient(lx, 0, lx - W * 0.12, H * 0.8);
            shaft.addColorStop(0, T.light.color);
            shaft.addColorStop(1, 'rgba(200, 240, 245, 0)');
            const halo = g.createRadialGradient(lx, 0, 0, lx, 0, W * 0.45);
            halo.addColorStop(0, T.light.color);
            halo.addColorStop(1, 'rgba(200, 240, 245, 0)');
            layers = { sky, veils, vignette, shaft, halo, lx };
        }

        // Cor da névoa com opacidade
        function fogColor(alpha) {
            const hex = T.fog.replace('#', '');
            const n = parseInt(hex, 16);
            return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
        }

        // Adereço em cache no tamanho em que aparece (ppu: px do aparelho por unidade, arredondado em degraus)
        function sprite(kind, variant, ppuWanted) {
            const step = Math.pow(1.22, Math.round(Math.log(Math.max(0.5, ppuWanted)) / Math.log(1.22)));
            const key = `${kind}:${variant}:${step.toFixed(3)}`;
            let s = sprites.get(key);
            if (s) return s;
            // Poucos por quadro: o resto aparece nos próximos (evita travar ao abrir o palco)
            if (spritesThisFrame >= 10) return null;
            spritesThisFrame++;
            const P = PROPS[kind];
            const b = P.bounds;
            const ppu = Math.min(step, 900 / (b.up + b.down), 900 / (b.w * 2));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.ceil(b.w * 2 * ppu));
            canvas.height = Math.max(1, Math.ceil((b.up + b.down) * ppu));
            const g = canvas.getContext('2d');
            if (P.blur) g.filter = `blur(${(P.blur * ppu).toFixed(1)}px)`;
            g.translate(b.w * ppu, b.up * ppu);
            g.scale(ppu, ppu);
            P.paint(g, rng(seed * 977 + variant * 131 + kind.length * 17), T, { squash: cam.groundSquash });
            s = { canvas, ppu, ox: b.w * ppu, oy: b.up * ppu };
            sprites.set(key, s);
            return s;
        }

        // Adereço no mundo: base em (x, dr). alpha < 1 para clarear o que fica na frente da ação.
        function drawProp(g, item, quality, alpha = 1) {
            const p = cam.project(item.x, item.dr, item.z);
            const ppu = p.s * item.size;
            const s = sprite(item.kind, item.variant, ppu * dpr * quality);
            if (!s) return;
            const k = ppu / s.ppu;
            const w = s.canvas.width * k;
            const h = s.canvas.height * k;
            if (p.x + w < 0 || p.x - w > W) return;
            if (alpha < 1) g.globalAlpha = alpha;
            if (item.flip) {
                g.setTransform(-dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);
                g.drawImage(s.canvas, -s.ox * k, -s.oy * k, w, h);
                g.setTransform(dpr, 0, 0, dpr, 0, 0);
            } else {
                g.drawImage(s.canvas, p.x - s.ox * k, p.y - s.oy * k, w, h);
            }
            if (alpha < 1) g.globalAlpha = 1;
        }

        // Adereços visíveis de uma fileira, do mais longe para o mais perto
        function rowItems(row) {
            const x0 = cam.xAt(0, row.drFar) - row.reach;
            const x1 = cam.xAt(W, row.drFar) + row.reach;
            const items = [];
            const total = row.kinds.reduce((sum, [, weight]) => sum + weight, 0);
            for (let i = Math.floor(x0 / row.cell); i <= Math.ceil(x1 / row.cell); i++) {
                const j = row.index * 7;
                if (hash(i, j, seed) > row.chance) continue;
                let pick = hash(i, j + 1, seed) * total;
                let kind = row.kinds[0][0];
                for (const [name, weight] of row.kinds) {
                    if ((pick -= weight) < 0) {
                        kind = name;
                        break;
                    }
                }
                items.push({
                    kind,
                    variant: Math.floor(hash(i, j + 2, seed) * PROPS[kind].variants),
                    x: (i + 0.15 + 0.7 * hash(i, j + 3, seed)) * row.cell,
                    dr: row.drNear + (row.drFar - row.drNear) * hash(i, j + 4, seed),
                    z: row.z[0] + (row.z[1] - row.z[0]) * hash(i, j + 7, seed),
                    flip: hash(i, j + 5, seed) < 0.5,
                    size: row.scale * (0.85 + 0.3 * hash(i, j + 6, seed))
                });
            }
            return items.sort((a, b) => b.dr - a.dr);
        }

        // Trilha de terra batida na profundidade dos personagens, com bordas irregulares
        function drawPath(g) {
            const P = T.path;
            const N = 30;
            const back = [];
            const front = [];
            const mid = [];
            for (let i = 0; i <= N; i++) {
                const x = cam.xAt(-30 + (W + 60) * i / N, 0);
                back.push(cam.project(x, P.halfWidth + (noise(x * 0.08, 1) - 0.5) * 3.5));
                front.push(cam.project(x, -P.halfWidth + (noise(x * 0.08, 2) - 0.5) * 3.5));
                mid.push(cam.project(x, (noise(x * 0.05, 3) - 0.5) * 3));
            }
            const fill = (a, b) => {
                g.beginPath();
                a.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
                for (let i = b.length - 1; i >= 0; i--) g.lineTo(b[i].x, b[i].y);
                g.closePath();
                g.fill();
            };
            g.fillStyle = P.color;
            fill(back, front);
            // Faixa gasta no meio (mais clara) e a borda de trás escurecida
            g.globalAlpha = 0.45;
            g.fillStyle = P.light;
            fill(mid.map((p, i) => ({ x: p.x, y: (p.y * 2 + back[i].y) / 3 })), mid.map((p, i) => ({ x: p.x, y: (p.y * 2 + front[i].y) / 3 })));
            g.globalAlpha = 0.6;
            g.strokeStyle = P.edge;
            g.lineWidth = 2;
            g.beginPath();
            back.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
            g.stroke();
            g.globalAlpha = 1;
        }

        // Névoa baixa que passa devagar e esporos de luz flutuando (presos ao mundo: têm paralaxe)
        function drawWisps(g, t, near) {
            const sprite = glowSprite(fogColor(1));
            const cell = 34;
            const drA = near ? 6 : 26;
            const drB = near ? 20 : 70;
            const drift = t * 1.6;
            const x0 = cam.xAt(0, drB) - 40;
            const x1 = cam.xAt(W, drB) + 40;
            for (let i = Math.floor((x0 - drift) / cell); i <= Math.ceil((x1 - drift) / cell); i++) {
                const hs = hash(i, near ? 301 : 302, seed);
                if (hs > 0.75) continue;
                const dr = drA + (drB - drA) * hash(i, 303, seed);
                const p = cam.project(i * cell + drift + hash(i, 304, seed) * cell, dr, 1.5);
                const rx = (16 + 12 * hash(i, 305, seed)) * p.s;
                const ry = rx * 0.32;
                const a = (near ? 0.1 : 0.16) * (0.6 + 0.4 * Math.sin(t * 0.5 + i));
                g.globalAlpha = a;
                g.drawImage(sprite, p.x - rx, p.y - ry, rx * 2, ry * 2);
            }
            g.globalAlpha = 1;
        }

        function drawMotes(g, t) {
            const sprite = glowSprite(T.motes);
            const cell = 9;
            const x0 = cam.xAt(0, 60) - 10;
            const x1 = cam.xAt(W, 60) + 10;
            g.globalCompositeOperation = 'lighter';
            for (let i = Math.floor(x0 / cell); i <= Math.ceil(x1 / cell); i++) {
                if (hash(i, 401, seed) > 0.55) continue;
                const ph = hash(i, 402, seed) * 6.28;
                const dr = -4 + 60 * hash(i, 403, seed);
                const z = 4 + 22 * hash(i, 404, seed) + Math.sin(t * 0.7 + ph) * 3;
                const p = cam.project(i * cell + Math.sin(t * 0.4 + ph) * 2.5, dr, z);
                const twinkle = 0.45 + 0.55 * Math.max(0, Math.sin(t * 1.7 + ph * 3));
                const r = (0.9 + hash(i, 405, seed) * 0.7) * p.s;
                g.globalAlpha = twinkle * 0.8;
                g.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
            }
            g.globalAlpha = 1;
            g.globalCompositeOperation = 'source-over';
        }

        // Tudo o que fica atrás dos personagens
        function drawBack(g, t) {
            spritesThisFrame = 0;
            g.fillStyle = layers.sky;
            g.fillRect(0, 0, W, H);
            // Brilho frio do portal no alto
            g.globalCompositeOperation = 'lighter';
            g.globalAlpha = 0.35;
            g.fillStyle = layers.halo;
            g.fillRect(0, 0, W, H * 0.6);
            g.globalAlpha = 1;
            g.globalCompositeOperation = 'source-over';
            // A luz, a névoa baixa e a trilha entram antes da primeira fileira sem névoa (a de perto)
            const nearRow = rows.findIndex(row => row.layer === 'back' && !row.fog);
            rows.forEach((row, index) => {
                if (row.layer !== 'back') return;
                if (index === nearRow) {
                    drawLight(g, t);
                    drawWisps(g, t, false);
                }
                rowItems(row).forEach(item => drawProp(g, item, row.fog > 0.5 ? 0.6 : 1));
                const veil = layers.veils[index];
                if (veil) {
                    g.fillStyle = veil.gradient;
                    g.fillRect(0, 0, W, veil.end);
                }
                if (index === nearRow) drawPath(g);
            });
        }

        // Feixe de luz descendo do portal (somado à cena)
        function drawLight(g, t) {
            const lx = layers.lx;
            const sway = Math.sin(t * 0.25) * W * 0.01;
            g.globalCompositeOperation = 'lighter';
            g.globalAlpha = 0.14;
            g.fillStyle = layers.shaft;
            g.beginPath();
            g.moveTo(lx - W * 0.04, 0);
            g.lineTo(lx + W * 0.05, 0);
            g.lineTo(lx - W * 0.02 + sway, H * 0.85);
            g.lineTo(lx - W * 0.26 + sway, H * 0.85);
            g.closePath();
            g.fill();
            g.globalAlpha = 1;
            g.globalCompositeOperation = 'source-over';
        }

        // Tudo o que fica na frente dos personagens. focus: [x0, x1] da tela onde está a ação (o primeiro plano
        // que passar por ali fica transparente para não esconder o herói nem o monstro)
        function drawFront(g, t, focus) {
            rows.forEach((row) => {
                if (row.layer !== 'front') return;
                rowItems(row).forEach((item) => {
                    let alpha = 1;
                    if (item.kind === 'frontTrunk' || item.kind === 'frontFern') {
                        const p = cam.project(item.x, item.dr, 0);
                        const half = PROPS[item.kind].bounds.w * 0.6 * p.s * item.size;
                        const overlap = Math.min(p.x + half, focus[1]) - Math.max(p.x - half, focus[0]);
                        if (overlap > 0) alpha = 0.28;
                    }
                    drawProp(g, item, 0.7, alpha);
                });
            });
            drawWisps(g, t, true);
            drawMotes(g, t);
            g.fillStyle = layers.vignette;
            g.fillRect(0, 0, W, H);
        }

        return {
            cam,
            get theme() { return T; },
            get themeId() { return themeId; },
            setTheme,
            resize,
            drawBack,
            drawFront,
            fogColor: (a) => fogColor(a)
        };
    }

    NS.scenery = { createCamera, createScene, PROPS };
})();
