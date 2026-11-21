// --- DEMON HUNTER PINTADO E ANIMADO (Laboratório, caminho 1: partes pintadas, movimento em código) ---
// O retrato pintado (demon-hunter.webp) vira camadas: a imagem inteira (base) e o capuz com a máscara (head, borda suave) por cima.
//   capa      a base é desenhada em faixas finas de cima para baixo; cada faixa se desloca por uma onda que cresce para a barra rasgada
//   capuz     gira e sobe/desce de leve em volta do pescoço, defasado da respiração (o corpo e a cabeça não param juntos)
//   respirar  o busto estica de leve a partir da base
//   luz       um clarão quente (a tocha) acende só o desenho, por cima, com a direção que você escolher
// Tudo em Canvas 2D, sem biblioteca. Os dois arquivos de imagem saem de bake_demon_hunter_partes.py.
const $ = (id) => document.getElementById(id);
const canvas = $('stage');
const ctx = canvas.getContext('2d');

const load = (src) => new Promise((resolve, reject) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = reject; im.src = src; });
const [base, head, parts] = await Promise.all([load('demon_hunter/base.webp'), load('demon_hunter/head.webp'), fetch('demon_hunter/parts.json').then(r => r.json())]);
const [W, H] = parts.size;

// Camadas de trabalho do tamanho da imagem (o desenho todo é montado aqui e depois colocado na tela)
const make = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const body = make(), bodyCtx = body.getContext('2d');
// A luz é um degradê suave: meia resolução basta e custa um quarto
const lit = document.createElement('canvas');
lit.width = W / 2; lit.height = H / 2;
const litCtx = lit.getContext('2d');

const ui = {
    wind: $('wind'), breath: $('breath'), hood: $('hood'), lightAngle: $('lightAngle'), lightPower: $('lightPower'),
    eyes: $('eyes'), mist: $('mist'), still: $('still'), layers: $('layers')
};
let mode = 'idle';
const setMode = (m) => { mode = m; $('modeIdle').classList.toggle('on', m === 'idle'); $('modeRun').classList.toggle('on', m === 'run'); };
$('modeIdle').onclick = () => setMode('idle');
$('modeRun').onclick = () => setMode('run');
let wantShot = false;
$('shot').onclick = () => { wantShot = true; };

const smooth = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const STRIP = 6;                              // altura de cada faixa da capa (px da imagem)
const CX0 = 190, CX1 = 920;                   // só esta largura tem capa (o resto é fundo transparente): não adianta desenhar mais
let run = 0;                                  // 0 parado, 1 correndo: entra e sai suave

function drawBody(t) {
    const wind = +ui.wind.value, breath = +ui.breath.value;
    const r = run;
    const cloak = parts.clothTop, bottom = parts.clothBottom;
    bodyCtx.clearRect(0, 0, W, H);
    bodyCtx.save();
    // Respiração: o busto estica a partir da base. Correndo, inclina para a frente e balança no ritmo da passada
    const b = Math.sin(t * 1.9) * 0.0065 * breath + r * Math.sin(t * 9.5) * 0.006;
    const [hx, hy] = parts.hips;
    bodyCtx.translate(hx, hy);
    bodyCtx.rotate(r * -0.045 + Math.sin(t * 0.7) * 0.004 * breath);
    bodyCtx.scale(1 - b * 0.35, 1 + b);
    bodyCtx.translate(-hx, -hy);
    // Parte de cima (ombros e capuz da base): inteira, sem ondular
    bodyCtx.drawImage(base, 0, 0, W, cloak, 0, 0, W, cloak);
    // (a base abaixo dos ombros só aparece pelas faixas)
    // Capa: faixas horizontais; o deslocamento cresce da altura dos ombros até a barra (como pano preso em cima e solto embaixo)
    const amp = (7 + 16 * r) * wind;
    const speed = 1.35 + 3.4 * r;
    const drag = 6 * r * wind;                // correndo, a capa fica para trás (lado direito da imagem)
    for (let y = cloak; y < H; y += STRIP) {
        const k = smooth((y - cloak) / (bottom - cloak));
        const wave = Math.sin(t * speed - y * 0.011) + 0.55 * Math.sin(t * speed * 1.7 - y * 0.023 + 1.3) + 0.25 * Math.sin(t * speed * 2.9 - y * 0.041);
        const dx = k * (amp * wave * 0.55 + drag * 2.2) + k * k * amp * 0.35 * Math.sin(t * speed * 0.6 + 2);
        const h = Math.min(STRIP, H - y);
        bodyCtx.drawImage(base, CX0, y, CX1 - CX0, h + 0.8, CX0 + dx, y, CX1 - CX0, h + 0.8);     // +0,8 px: as faixas se sobrepõem e não deixam fresta
    }
    // Capuz: gira em volta do pescoço, defasado da respiração
    const sway = +ui.hood.value;
    const [nx, ny] = parts.neck;
    const tilt = (Math.sin(t * 0.9 + 0.8) * 0.010 + r * Math.sin(t * 9.5 + 1.2) * 0.012 - r * 0.02) * sway;
    const lift = Math.sin(t * 1.9 - 0.7) * 1.6 * breath * sway;
    bodyCtx.translate(nx, ny);
    bodyCtx.rotate(tilt);
    bodyCtx.translate(-nx + Math.sin(t * 0.6) * 1.2 * sway, -ny + lift);
    bodyCtx.drawImage(head, parts.head.x, parts.head.y);
    if (ui.layers.checked) {
        bodyCtx.globalCompositeOperation = 'source-atop';
        bodyCtx.fillStyle = 'rgba(255, 40, 40, .35)';
        bodyCtx.fillRect(parts.head.x, parts.head.y, parts.head.w, parts.head.h);
        bodyCtx.globalCompositeOperation = 'source-over';
    }
    // Olhos: um ponto azul-gelo pulsa dentro de cada buraco da máscara
    if (ui.eyes.checked) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.3);
        bodyCtx.globalCompositeOperation = 'lighter';
        parts.eyes.forEach(([ex, ey, rx, ry], i) => {
            const g = bodyCtx.createRadialGradient(ex, ey, 0, ex, ey, Math.max(rx, ry));
            const a = (0.20 + 0.28 * pulse) * (i ? 0.7 : 1);
            g.addColorStop(0, `rgba(190, 235, 255, ${a})`);
            g.addColorStop(1, 'rgba(56, 189, 248, 0)');
            bodyCtx.fillStyle = g;
            bodyCtx.fillRect(ex - rx, ey - ry, rx * 2, ry * 2);
        });
        bodyCtx.globalCompositeOperation = 'source-over';
    }
    bodyCtx.restore();
}

// A luz da tocha: um clarão quente só onde há desenho. Montado numa camada à parte e somado por cima
function drawLight(t) {
    const power = +ui.lightPower.value;
    const LW = lit.width, LH = lit.height;
    litCtx.clearRect(0, 0, LW, LH);
    if (power <= 0) return;
    const a = (+ui.lightAngle.value) * Math.PI / 180;
    const flick = 1 + 0.06 * (Math.sin(t * 11.3) * 0.5 + Math.sin(t * 17.9 + 1.7) * 0.3);
    const lx = LW / 2 + Math.cos(a) * LW * 0.62, ly = LH * 0.52 + Math.sin(a) * LH * 0.5;
    const g = litCtx.createRadialGradient(lx, ly, 0, lx, ly, LW * 0.8);
    g.addColorStop(0, `rgba(255, 150, 60, ${power * flick})`);
    g.addColorStop(0.45, `rgba(255, 110, 40, ${power * 0.3 * flick})`);
    g.addColorStop(1, 'rgba(255, 90, 30, 0)');
    litCtx.fillStyle = g;
    litCtx.fillRect(0, 0, LW, LH);
    // Luz fria do outro lado (luar), bem leve
    const cx = LW / 2 - Math.cos(a) * LW * 0.7, cy = LH * 0.4 - Math.sin(a) * LH * 0.4;
    const c = litCtx.createRadialGradient(cx, cy, 0, cx, cy, LW * 0.7);
    c.addColorStop(0, `rgba(110, 170, 255, ${power * 0.3})`);
    c.addColorStop(1, 'rgba(110, 170, 255, 0)');
    litCtx.fillStyle = c;
    litCtx.fillRect(0, 0, LW, LH);
    litCtx.globalCompositeOperation = 'destination-in';
    litCtx.drawImage(body, 0, 0, LW, LH);       // a luz só fica onde o personagem tem desenho
    litCtx.globalCompositeOperation = 'source-over';
}

function drawBackground(w, h, t) {
    const g = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.5, Math.hypot(w, h) * 0.6);
    g.addColorStop(0, '#16222a');
    g.addColorStop(0.55, '#0a1015');
    g.addColorStop(1, '#05070a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    if (ui.mist.checked) {
        // Três bancos de névoa que passam devagar (círculos suaves, sem imagem)
        for (let i = 0; i < 3; i++) {
            const x = ((t * (14 + i * 7) + i * 400) % (w + 600)) - 300;
            const y = h * (0.62 + 0.1 * i);
            const m = ctx.createRadialGradient(x, y, 0, x, y, 340);
            m.addColorStop(0, 'rgba(140, 170, 190, 0.07)');
            m.addColorStop(1, 'rgba(140, 170, 190, 0)');
            ctx.fillStyle = m;
            ctx.fillRect(x - 340, y - 340, 680, 680);
        }
    }
}

let last = performance.now();
function frame(now) {
    const t = now / 1000;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    run += ((mode === 'run' ? 1 : 0) - run) * Math.min(1, dt * 4);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawBackground(w, h, t);

    if (ui.still.checked) {
        bodyCtx.clearRect(0, 0, W, H);
        bodyCtx.drawImage(base, 0, 0);
    } else drawBody(t);
    drawLight(t);

    // O desenho ocupa ~92% da altura, centralizado; o painel à direita fica por cima, então o personagem fica um pouco à esquerda em telas largas
    const s = Math.min(h * 0.92 / H, w * 0.96 / W);
    const shift = w > h * 1.2 ? -w * 0.06 : 0;
    const ox = (w - W * s) / 2 + shift, oy = (h - H * s) / 2;
    // Sombra de contato no chão
    const sh = ctx.createRadialGradient(ox + W * s / 2, oy + H * s * 0.975, 0, ox + W * s / 2, oy + H * s * 0.975, W * s * 0.4);
    sh.addColorStop(0, 'rgba(0,0,0,0.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.translate(ox + W * s / 2, oy + H * s * 0.975); ctx.scale(1, 0.18); ctx.translate(-(ox + W * s / 2), -(oy + H * s * 0.975));
    ctx.fillStyle = sh; ctx.fillRect(ox, oy + H * s * 0.975 - W * s * 0.4, W * s, W * s * 0.8);
    ctx.restore();
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(body, ox, oy, W * s, H * s);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(lit, ox, oy, W * s, H * s);
    ctx.globalCompositeOperation = 'source-over';

    if (wantShot) { wantShot = false; const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'demon_hunter_pintado.png'; a.click(); }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
