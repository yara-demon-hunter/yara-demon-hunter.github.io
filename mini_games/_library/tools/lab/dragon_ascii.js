// --- LABORATÓRIO: Dragão em ASCII (metodologia_ascii.md) ---
// Recria a imagem dragon.png só com caracteres, por cima dela. Sem 3D: o alvo é a imagem. Técnicas:
//   A1  rampa de luminância medida na fonte (para as células lisas)
//   A2  célula 1:2 (a grade tem a proporção do caractere, então o dragão não deforma)
//   A5  dithering Bayer nas células lisas
//   A8  cor da célula (a cor do caractere vem da imagem, com saturação e brilho ajustáveis)
//   A9  brilho de texto (os trechos claros ganham halo)
//   A11 desempenho: desenha uma vez a cada mudança, não por quadro
//   A13 NOVA: casamento de forma. Cada célula é comparada (erro quadrático) com o desenho de cada caractere, num mini-quadro de 4x8 pixels, e
//       fica com o caractere que mais se parece com o pedaço da imagem. É o que faz asas, escamas e contorno ficarem "iguais".
// O papel de fundo é removido por inundação a partir das bordas (assim as partes claras de dentro do dragão são preservadas); manchas de papel grandes
// e presas (entre as pernas) também saem.
const $ = (id) => document.getElementById(id);
const FONT = '"DejaVu Sans Mono", ui-monospace, Menlo, Consolas, monospace';
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const PW = 4, PH = 8;                  // mini-quadro por célula (1:2)
const CW = 7, CH = 14;                 // célula no canvas final (px)
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);

// ---------- glifos: densidade (A1) e forma 4x8 (A13) ----------
const ALLCH = [...Array(94)].map((_, i) => String.fromCharCode(33 + i));
const SYM = ALLCH.filter((c) => !/[A-Za-z0-9]/.test(c));
function medirGlifos() {
    const W = 28, H = 56;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.font = `46px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'center';
    const out = {};
    [' ', ...ALLCH].forEach((ch) => {
        g.clearRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillText(ch, W / 2, H / 2 + 2);
        const d = g.getImageData(0, 0, W, H).data, t = new Float32Array(PW * PH);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) t[Math.floor(y / (H / PH)) * PW + Math.floor(x / (W / PW))] += d[(y * W + x) * 4 + 3] / 255;
        let s = 0;
        for (let k = 0; k < t.length; k++) { t[k] /= (W / PW) * (H / PH); s += t[k]; }
        out[ch] = { t, cov: s / t.length };
    });
    return out;
}
function rampaMedida(G, n = 14) {
    const max = Math.max(...ALLCH.map((c) => G[c].cov));
    const used = new Set(), r = [' '];
    for (let k = 1; k < n; k++) {
        const target = (k / (n - 1)) * max * 0.8;
        let best = null;
        ALLCH.forEach((c) => { if (!used.has(c) && (!best || Math.abs(G[c].cov - target) < Math.abs(G[best].cov - target))) best = c; });
        used.add(best); r.push(best);
    }
    return r;
}

// ---------- imagem ----------
const img = $('sizer');
const ascii = $('ascii'), glow = $('glow');
const actx = ascii.getContext('2d'), gctx = glow.getContext('2d');
let G, RAMP, A = 1, rowsTxt = [];
const srcC = document.createElement('canvas');
const sctx = srcC.getContext('2d', { willReadFrequently: true });

function lerp(a, b, t) { return a + (b - a) * t; }
let pendente = false;
function pedir() { if (!pendente) { pendente = true; requestAnimationFrame(() => { pendente = false; render(); }); } }

function render() {
    const t0 = performance.now();
    const cols = +$('cols').value, rows = Math.round(cols / (2 * A));
    const sw = cols * PW, sh = rows * PH;
    srcC.width = sw; srcC.height = sh;
    sctx.imageSmoothingEnabled = true; sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(img, 0, 0, sw, sh);
    const px = sctx.getImageData(0, 0, sw, sh).data;
    // luminância, saturação e papel (removido por inundação a partir das bordas)
    const N = sw * sh, lum = new Float32Array(N), cand = new Uint8Array(N), bg = new Uint8Array(N);
    const Lp = +$('paper').value;
    for (let i = 0; i < N; i++) {
        const r = px[i * 4] / 255, g = px[i * 4 + 1] / 255, b = px[i * 4 + 2] / 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        cand[i] = lum[i] > Lp && (mx - mn) / (mx || 1) < 0.2 ? 1 : 0;
    }
    const stack = [];
    const push = (i) => { if (cand[i] && !bg[i]) { bg[i] = 1; stack.push(i); } };
    for (let x = 0; x < sw; x++) { push(x); push((sh - 1) * sw + x); }
    for (let y = 0; y < sh; y++) { push(y * sw); push(y * sw + sw - 1); }
    while (stack.length) {
        const i = stack.pop(), x = i % sw, y = (i / sw) | 0;
        if (x > 0) push(i - 1); if (x < sw - 1) push(i + 1); if (y > 0) push(i - sw); if (y < sh - 1) push(i + sw);
    }
    // papel preso (entre as pernas, dentro das asas): regiões claras e grandes que a inundação das bordas não alcançou também saem
    if ($('holes').checked) {
        const seen = new Uint8Array(N), minSize = N * 0.004;
        for (let s = 0; s < N; s++) {
            if (!cand[s] || bg[s] || seen[s]) continue;
            const comp = [s]; seen[s] = 1;
            for (let h = 0; h < comp.length; h++) {
                const i = comp[h], x = i % sw, y = (i / sw) | 0;
                const nb = [x > 0 ? i - 1 : -1, x < sw - 1 ? i + 1 : -1, y > 0 ? i - sw : -1, y < sh - 1 ? i + sw : -1];
                for (const m of nb) if (m >= 0 && cand[m] && !bg[m] && !seen[m]) { seen[m] = 1; comp.push(m); }
            }
            if (comp.length > minSize) comp.forEach((i) => { bg[i] = 1; });
        }
    }
    // canvas final
    [ascii, glow].forEach((c) => { c.width = cols * CW; c.height = rows * CH; });
    actx.fillStyle = '#000'; actx.fillRect(0, 0, ascii.width, ascii.height);
    gctx.clearRect(0, 0, glow.width, glow.height);
    const fs = Math.round(CH * 0.88);
    actx.font = gctx.font = `${fs}px ${FONT}`;
    actx.textBaseline = gctx.textBaseline = 'middle'; actx.textAlign = gctx.textAlign = 'center';
    const set = $('set').value === 'sym' ? SYM : ALLCH, shape = $('a13').checked, thr = +$('thr').value;
    const sat = +$('sat').value, bri = +$('bri').value, cellbg = $('cellbg').checked, dith = $('a5').checked, glowOn = $('a9').checked;
    const v = new Float32Array(PW * PH), idx = new Int32Array(PW * PH);
    rowsTxt = [];
    const cellMean = new Float32Array(cols * rows * 3), cellMask = new Uint8Array(cols * rows);
    for (let cy = 0; cy < rows; cy++) {
        let line = '';
        for (let cx = 0; cx < cols; cx++) {
            let bgN = 0, n = 0, vmax = 0, vmin = 1, sr = 0, sg = 0, sb = 0, sl = 0;
            for (let py = 0; py < PH; py++) for (let qx = 0; qx < PW; qx++) {
                const i = (cy * PH + py) * sw + cx * PW + qx, k = py * PW + qx;
                idx[k] = i;
                if (bg[i]) { v[k] = 0; bgN++; continue; }
                v[k] = 0.2 + 0.8 * lum[i];
                vmax = Math.max(vmax, v[k]); vmin = Math.min(vmin, v[k]);
                sr += px[i * 4]; sg += px[i * 4 + 1]; sb += px[i * 4 + 2]; sl += lum[i]; n++;
            }
            if (bgN >= 26 || n === 0) { line += ' '; continue; }
            cellMask[cy * cols + cx] = 1;
            const mr = sr / n, mg = sg / n, mb = sb / n, ml = sl / n;
            const flat = bgN === 0 && (!shape || vmax - vmin < thr);
            let ch, fr = mr, fg = mg, fb = mb, bR = 0, bG = 0, bB = 0, cov;
            if (flat) {
                let t = Math.pow(ml, 0.8) * 1.15;
                if (dith) t += BAYER[(cy & 3) * 4 + (cx & 3)] * 0.14;
                const k = Math.max(0, Math.min(RAMP.length - 1, Math.round(clamp01(t) * (RAMP.length - 1))));
                ch = RAMP[k]; cov = G[ch].cov;
            } else {
                // A13: o caractere de menor erro contra o mini-quadro (normalizado pelo máximo)
                let best = ' ', be = 1e9;
                for (const c of set) {
                    const tt = G[c].t; let e = 0;
                    for (let k = 0; k < PW * PH; k++) { const d = v[k] / vmax - tt[k]; e += d * d; }
                    if (e < be) { be = e; best = c; }
                }
                ch = best; cov = G[ch].cov;
                // cor do caractere = pixels claros; fundo da célula = pixels escuros
                let ar = 0, ag = 0, ab = 0, an = 0, dr = 0, dg = 0, db = 0, dn = 0;
                for (let k = 0; k < PW * PH; k++) {
                    if (bg[idx[k]]) continue;
                    const i = idx[k];
                    if (v[k] / vmax >= 0.6) { ar += px[i * 4]; ag += px[i * 4 + 1]; ab += px[i * 4 + 2]; an++; } else { dr += px[i * 4]; dg += px[i * 4 + 1]; db += px[i * 4 + 2]; dn++; }
                }
                if (an) { fr = ar / an; fg = ag / an; fb = ab / an; }
                if (dn) { bR = dr / dn; bG = dg / dn; bB = db / dn; }
            }
            if (ch === ' ' && !cellbg) { line += ' '; continue; }
            // A8: saturação e brilho; células lisas compensam a cobertura do caractere
            const gain = flat ? bri / Math.max(cov, 0.4) : bri;
            const fix = (r, g, b) => {
                const l = 0.3 * r + 0.59 * g + 0.11 * b;
                return [Math.min(255, (l + (r - l) * sat) * gain), Math.min(255, (l + (g - l) * sat) * gain), Math.min(255, (l + (b - l) * sat) * gain)];
            };
            const [R, Gc, B] = fix(fr, fg, fb);
            if (cellbg) { const [r2, g2, b2] = fix(flat ? mr * 0.35 : bR, flat ? mg * 0.35 : bG, flat ? mb * 0.35 : bB); actx.fillStyle = `rgb(${r2 | 0},${g2 | 0},${b2 | 0})`; actx.fillRect(cx * CW, cy * CH, CW, CH); }
            line += ch;
            if (ch === ' ') continue;
            const col = `rgb(${R | 0},${Gc | 0},${B | 0})`;
            actx.fillStyle = col;
            actx.fillText(ch, cx * CW + CW / 2, cy * CH + CH / 2 + 1);
            if (glowOn && ml > 0.62) { gctx.fillStyle = col; gctx.fillText(ch, cx * CW + CW / 2, cy * CH + CH / 2 + 1); }
        }
        rowsTxt.push(line.replace(/\s+$/, ''));
    }
    // ---------- nota de semelhança: cor média por célula, só onde há dragão ----------
    const small = document.createElement('canvas'); small.width = cols; small.height = rows;
    const smx = small.getContext('2d', { willReadFrequently: true });
    smx.imageSmoothingEnabled = true; smx.imageSmoothingQuality = 'high';
    smx.drawImage(ascii, 0, 0, cols, rows);
    const a = smx.getImageData(0, 0, cols, rows).data;
    const o = document.createElement('canvas'); o.width = cols; o.height = rows;
    const omx = o.getContext('2d', { willReadFrequently: true });
    omx.imageSmoothingEnabled = true; omx.imageSmoothingQuality = 'high';
    omx.drawImage(img, 0, 0, cols, rows);
    const b = omx.getImageData(0, 0, cols, rows).data;
    let err = 0, cnt = 0;
    for (let i = 0; i < cols * rows; i++) {
        if (!cellMask[i]) continue;
        err += (Math.abs(a[i * 4] - b[i * 4]) + Math.abs(a[i * 4 + 1] - b[i * 4 + 1]) + Math.abs(a[i * 4 + 2] - b[i * 4 + 2])) / 3; cnt++;
    }
    const score = Math.round(100 * (1 - (err / cnt) / 255 * 1.6));
    $('read').innerHTML = `Grade <b>${cols} x ${rows}</b> (${cols * rows} células, ${cnt} com dragão)<br>Semelhança de cor por célula (só no dragão): <b>${score}%</b><br>Desenhado em <b>${(performance.now() - t0).toFixed(0)} ms</b> (uma vez a cada mudança)<br>Rampa (células lisas): <code>${RAMP.join('').replace(/ /g, '␣').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
    $('colsTxt').textContent = cols;
    $('thrTxt').textContent = (+$('thr').value).toFixed(2);
    $('paperTxt').textContent = (+$('paper').value).toFixed(2);
}

function camadas() {
    const u = +$('underR').value, w = +$('wipe').value;
    $('underTxt').textContent = u; $('wipeTxt').textContent = w;
    $('under').style.opacity = u / 100;
    const cut = w;
    ascii.style.clipPath = glow.style.clipPath = `inset(0 ${100 - cut}% 0 0)`;
    const r = $('right');
    r.style.display = w < 100 ? 'block' : 'none';
    r.style.clipPath = `inset(0 0 0 ${cut}%)`;
    const d = $('divider');
    d.style.display = w < 100 && w > 0 ? 'block' : 'none';
    d.style.left = `calc(${cut}% - 1px)`;
}

function ajustar() {
    const st = $('stage'), f = $('frame');
    const w = st.clientWidth - 22, h = st.clientHeight - 22;
    f.style.width = Math.floor(Math.min(w, h * A)) + 'px';
}
function iniciar() {
    A = img.naturalWidth / img.naturalHeight;
    ajustar();
    addEventListener('resize', ajustar);
    G = medirGlifos();
    RAMP = rampaMedida(G);
    ['cols', 'thr', 'paper', 'sat', 'bri'].forEach((id) => $(id).addEventListener('input', pedir));
    ['a13', 'set', 'cellbg', 'a5', 'a9', 'holes'].forEach((id) => $(id).addEventListener('change', pedir));
    ['underR', 'wipe'].forEach((id) => $(id).addEventListener('input', camadas));
    $('save').onclick = () => {
        const c = document.createElement('canvas'); c.width = ascii.width; c.height = ascii.height;
        const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(ascii, 0, 0);
        const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = 'dragao_ascii.png'; a.click();
    };
    $('txt').onclick = () => {
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rowsTxt.join('\n')], { type: 'text/plain' })); a.download = 'dragao_ascii.txt'; a.click();
    };
    // parâmetros de URL para teste: ?cols=170&under=40&wipe=50&cellbg=1&shape=0&set=all
    const q = new URLSearchParams(location.search);
    if (q.has('cols')) $('cols').value = q.get('cols');
    if (q.has('under')) $('underR').value = q.get('under');
    if (q.has('wipe')) $('wipe').value = q.get('wipe');
    if (q.get('cellbg') === '0') $('cellbg').checked = false;
    if (q.get('shape') === '0') $('a13').checked = false;
    if (q.has('set')) $('set').value = q.get('set');
    if (q.has('paper')) $('paper').value = q.get('paper');
    camadas();
    render();
    $('loading').remove();
}
if (img.complete && img.naturalWidth) iniciar(); else img.addEventListener('load', iniciar);
