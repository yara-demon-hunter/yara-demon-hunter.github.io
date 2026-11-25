// --- LABORATÓRIO: Espectro Encapuzado em ASCII (metodologia_ascii.md) ---
// Caminho "Canvas 2D" da metodologia: a cena 3D é renderizada numa grade minúscula (1 pixel = 1 célula de texto) em três passes (cor, profundidade e
// material), os pixels são lidos pelo JS e cada célula vira um caractere copiado de um atlas de glifos para um canvas 2D. Nada de shader de texto.
//   A1 rampa medida na fonte   A2 célula 1:2 (a grade tem a proporção do caractere)   A3 célula maior de longe   A4 bordas por Sobel
//   A5 dithering Bayer         A6 profundidade esvazia os glifos                      A7 glifos por material     A8 três modos de cor
//   A9 brilho de texto         A10 exposição e contraste antes da rampa               A11 atlas de glifos        A12 instabilidade, chuva e CRT
// 100% procedural, sem imagens; usa o Three.js de vendor/three. Fora dos jogos.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const hash = (a, b, c = 0) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const FONT = '"DejaVu Sans Mono", ui-monospace, Menlo, Consolas, monospace';

// ======================= MODELO 3D: ESPECTRO ENCAPUZADO =======================
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#000000');
const camera = new THREE.PerspectiveCamera(35, 1, 0.5, 120);
camera.position.set(3.4, 4.4, 12.5);
const view = $('stage');
const ascii = document.createElement('canvas'), glow = document.createElement('canvas');
glow.id = 'glow';
view.insertBefore(ascii, view.firstChild);
view.insertBefore(glow, ascii.nextSibling);
const controls = new OrbitControls(camera, glow.parentElement);
controls.target.set(0, 1.9, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 3;
controls.maxDistance = 60;

let seed = 20261125;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

// ids de material (passe de material, A7)
const ID = { cloak: 1, bone: 2, metal: 3, glow: 4, floor: 5, crystal: 6, rune: 7, void: 8 };
const mats = {
    cloak: new THREE.MeshStandardMaterial({ color: '#3a548a', roughness: 0.85, side: THREE.DoubleSide }),
    bone: new THREE.MeshStandardMaterial({ color: '#e5dcc2', roughness: 0.6 }),
    metal: new THREE.MeshStandardMaterial({ color: '#8a93a3', roughness: 0.45, metalness: 0.8 }),
    glow: new THREE.MeshBasicMaterial({ color: '#d8fbff' }),
    floor: new THREE.MeshStandardMaterial({ color: '#233b30', roughness: 0.95 }),
    crystal: new THREE.MeshStandardMaterial({ color: '#8d6fe0', roughness: 0.25, metalness: 0.2, emissive: '#3a2480', emissiveIntensity: 0.8, flatShading: true }),
    rune: new THREE.MeshBasicMaterial({ color: '#ffb347' }),
    void: new THREE.MeshBasicMaterial({ color: '#000000' })
};
const model = new THREE.Group();
scene.add(model);
function mesh(geo, key, x = 0, y = 0, z = 0, parent = model) {
    const m = new THREE.Mesh(geo, mats[key]);
    m.userData.mid = ID[key];
    m.position.set(x, y, z);
    parent.add(m);
    return m;
}
// manto: sólido de revolução que balança por ruído de seno
const profile = [[1.15, 0.04], [1.02, 0.5], [0.8, 1.0], [0.52, 1.6], [0.46, 1.95], [0.55, 2.3], [0.34, 2.55], [0.2, 2.62]].map(([r, y]) => new THREE.Vector2(r, y));
const cloakGeo = new THREE.LatheGeometry(profile, 44);
const cloakBase = cloakGeo.attributes.position.array.slice();
const cloak = mesh(cloakGeo, 'cloak');
// capuz, rosto vazio e olhos
const hood = mesh(new THREE.SphereGeometry(0.42, 20, 16), 'cloak', 0, 2.92, -0.02);
hood.scale.set(1, 1.12, 1.08);
const tail = mesh(new THREE.ConeGeometry(0.34, 0.9, 14), 'cloak', 0, 2.78, -0.38);
tail.rotation.x = -2.0;
const face = mesh(new THREE.SphereGeometry(0.29, 16, 12), 'void', 0, 2.9, 0.16);
face.scale.set(1, 1.1, 0.7);
[-1, 1].forEach((s) => mesh(new THREE.SphereGeometry(0.05, 8, 6), 'glow', s * 0.11, 2.95, 0.38));
// braços (mangas) e mãos de osso
function arm(side) {
    const g = new THREE.Group();
    g.position.set(side * 0.55, 2.2, 0.05);
    model.add(g);
    mesh(new THREE.CapsuleGeometry(0.15, 0.7, 4, 10), 'cloak', 0, -0.4, 0, g);
    const hand = mesh(new THREE.SphereGeometry(0.11, 10, 8), 'bone', 0, -0.95, 0, g);
    return { g, hand };
}
const armL = arm(-1), armR = arm(1);
// cajado com orbe, anel de runa e luz
const staff = new THREE.Group();
staff.position.set(1.0, 0, 0.45);
model.add(staff);
mesh(new THREE.CylinderGeometry(0.05, 0.065, 3.5, 8), 'metal', 0, 1.75, 0, staff);
const orb = mesh(new THREE.SphereGeometry(0.22, 16, 12), 'glow', 0, 3.7, 0, staff);
const ring = mesh(new THREE.TorusGeometry(0.4, 0.035, 6, 24), 'rune', 0, 3.7, 0, staff);
ring.rotation.x = Math.PI / 2.3;
// cristais em órbita
const shards = Array.from({ length: 7 }, (_, i) => {
    const m = mesh(new THREE.OctahedronGeometry(0.2 + rnd() * 0.1), 'crystal');
    m.userData.o = { a: (i / 7) * TAU, r: 1.7 + rnd() * 0.5, y: 1.2 + rnd() * 1.8, s: 0.5 + rnd() * 0.5 };
    return m;
});
// chão, anel de runas e pilares quebrados (referência de escala e profundidade)
const floor = mesh(new THREE.CircleGeometry(70, 48), 'floor');
floor.rotation.x = -Math.PI / 2;
const rune = mesh(new THREE.TorusGeometry(2.4, 0.04, 6, 56), 'rune', 0, 0.03, 0);
rune.rotation.x = Math.PI / 2;
for (let i = 0; i < 16; i++) {
    const a = rnd() * TAU, r = 5 + rnd() * 34, h = 1 + rnd() * 3;
    const p = mesh(new THREE.BoxGeometry(0.7, h, 0.7), 'metal', Math.cos(a) * r, h / 2, Math.sin(a) * r);
    p.rotation.set((rnd() - 0.5) * 0.25, rnd() * 3, (rnd() - 0.5) * 0.25);
}
scene.add(new THREE.HemisphereLight('#6f8fcf', '#101a14', 0.55));
const key = new THREE.DirectionalLight('#dbe8ff', 2.6);
key.position.set(5, 7, 6);
scene.add(key);
const back = new THREE.DirectionalLight('#7fb0ff', 2.2);
back.position.set(-6, 4, -6);
scene.add(back);
const orbLight = new THREE.PointLight('#8fe8ff', 9, 10, 1.6);
scene.add(orbLight);

// ======================= A1: RAMPA MEDIDA NA FONTE =======================
const CANDIDATES = ' .\'`,:;-~_^"!+=*?/|\\()[]<>ilIrtfjcvxzunoeaswkmhdbpqgyTLCJYFPSZEAKXVUGDNHBROQWM%&@#$0123456789';
const RAMP_TXT = ' .:-=+*#%@';
function medirRampa(n = 16) {
    const c = document.createElement('canvas'); c.width = c.height = 40;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.font = `34px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'center';
    const dens = [...CANDIDATES].map((ch) => {
        g.clearRect(0, 0, 40, 40); g.fillStyle = '#fff'; g.fillText(ch, 20, 21);
        const d = g.getImageData(0, 0, 40, 40).data; let s = 0;
        for (let i = 3; i < d.length; i += 4) s += d[i];
        return { ch, v: s };
    });
    const max = Math.max(...dens.map((d) => d.v));
    const used = new Set(), out = [];
    for (let k = 0; k < n; k++) {
        const target = (k / (n - 1)) * max * 0.78;      // as pretas totais (@) passam do ponto: limita ao alcance útil
        let best = null;
        dens.forEach((d) => { if (!used.has(d.ch) && (!best || Math.abs(d.v - target) < Math.abs(best.v - target))) best = d; });
        used.add(best.ch); out.push(best.ch);
    }
    return out.join('');
}
const RAMP_MED = medirRampa();

// glifos por material (A7): cada coisa tem o seu conjunto, do mais vazio ao mais denso
const SETS = { [ID.cloak]: null, [ID.bone]: 'oO0@', [ID.metal]: '=#%H@', [ID.glow]: '*@', [ID.floor]: ' .,:;', [ID.crystal]: '<>/\\^v', [ID.rune]: '=+*#', [ID.void]: ' ' };
const EDGE = ['-', '\\', '|', '/'];
const RAIN = 'ｱｲｳｴｵｶｷｸｹｺ0123456789'.replace(/[^\x20-\x7e]/g, '') + 'ZXCVBNM<>*+=:';
const ALL = [...new Set(RAMP_MED + RAMP_TXT + Object.values(SETS).filter(Boolean).join('') + EDGE.join('') + RAIN)];
const CHAR_IX = new Map(ALL.map((ch, i) => [ch, i]));

// ======================= A11: ATLAS DE GLIFOS (um por cor, em cache) =======================
let CW = 8, CH = 16, atlasCache = new Map();
function atlas(color) {
    let a = atlasCache.get(color);
    if (a) return a;
    if (atlasCache.size > 120) atlasCache.clear();
    a = document.createElement('canvas'); a.width = ALL.length * CW; a.height = CH;
    const g = a.getContext('2d');
    g.font = `${Math.round(CH * 0.86)}px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillStyle = color;
    ALL.forEach((ch, i) => g.fillText(ch, i * CW + CW / 2, CH / 2 + 1));
    atlasCache.set(color, a);
    return a;
}

// ======================= PASSES (cor, profundidade, material) =======================
let cols = 0, rows = 0, rtC, rtD, rtM, bufC, bufD, bufM, lum, dep, mid;
const matDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
const idMats = Object.values(ID).map((v) => new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(v / 255, 0, 0, THREE.LinearSRGBColorSpace) }));
function alocar(c, r) {
    cols = c; rows = r;
    [rtC, rtD, rtM].forEach((t) => t && t.dispose());
    const mk = (srgb) => { const t = new THREE.WebGLRenderTarget(c, r, { depthBuffer: true, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }); t.texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; return t; };
    rtC = mk(true); rtD = mk(false); rtM = mk(false);
    bufC = new Uint8Array(c * r * 4); bufD = new Uint8Array(c * r * 4); bufM = new Uint8Array(c * r * 4);
    lum = new Float32Array(c * r); dep = new Float32Array(c * r); mid = new Uint8Array(c * r);
}
const near = 0.5, far = 120;
function renderizarPassos() {
    renderer.setRenderTarget(rtC); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
    renderer.readRenderTargetPixels(rtC, 0, 0, cols, rows, bufC);
    // profundidade (empacotada em RGBA)
    scene.overrideMaterial = matDepth;
    renderer.setRenderTarget(rtD); renderer.setClearColor(0xffffff, 1); renderer.clear(); renderer.render(scene, camera);
    scene.overrideMaterial = null;
    renderer.readRenderTargetPixels(rtD, 0, 0, cols, rows, bufD);
    // material: cada malha troca para a cor-id e volta
    const back = [];
    scene.traverse((o) => { if (o.isMesh && o.userData.mid) { back.push([o, o.material]); o.material = idMats[o.userData.mid - 1]; } });
    renderer.setRenderTarget(rtM); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
    back.forEach(([o, m]) => { o.material = m; });
    renderer.readRenderTargetPixels(rtM, 0, 0, cols, rows, bufM);
    renderer.setRenderTarget(null);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const i = ((rows - 1 - y) * cols + x) * 4, j = y * cols + x;       // a leitura vem de baixo para cima
        const d = (bufD[i] * 65536 + bufD[i + 1] * 256 + bufD[i + 2]) / 16777216;
        dep[j] = d >= 0.99999 ? far : (2 * near * far) / (far + near - (2 * d - 1) * (far - near));
        mid[j] = bufM[i];
    }
}

// ======================= CONVERSÃO: A10, A5, A6, A4, A7, A8, A12 =======================
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);
const aces = (x) => clamp01((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14));
const PAL = { 1: [108, 147, 214], 2: [232, 220, 192], 3: [185, 194, 207], 4: [159, 243, 255], 5: [70, 115, 92], 6: [176, 140, 255], 7: [255, 179, 71], 8: [0, 0, 0] };
const hex = (r, g, b) => '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1);
const ctx = ascii.getContext('2d'), gctx = glow.getContext('2d');
let dissolve = 0, dissolveTarget = 0;

function converter(o, t) {
    const ramp = o.rampa === 'med' ? RAMP_MED : RAMP_TXT, R = ramp.length;
    const far01 = smooth(8, 45, o.dist);
    const nChars = o.a3 ? Math.max(5, Math.round(lerp(R, R * 0.45, far01))) : R;
    const exp = o.expo, gam = o.gam;
    // luminância final (A10) e cor
    for (let j = 0; j < cols * rows; j++) {
        const i = (((rows - 1 - ((j / cols) | 0)) * cols) + (j % cols)) * 4;
        const l = (0.2126 * bufC[i] + 0.7152 * bufC[i + 1] + 0.0722 * bufC[i + 2]) / 255;
        lum[j] = Math.pow(aces(Math.pow(l, 2.2) * exp), 1 / 2.2 * gam * 1.2);
    }
    ctx.fillStyle = '#020605'; ctx.fillRect(0, 0, ascii.width, ascii.height);
    gctx.clearRect(0, 0, glow.width, glow.height);
    const nowF = Math.floor(t * 12);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const j = y * cols + x, id = mid[j];
        let L = lum[j];
        if (id === 0 && L < 0.02) continue;
        const d = dep[j];
        if (o.a6) L *= 1 - 0.75 * smooth(14, 70, d);
        if (o.a5) L += BAYER[(y & 3) * 4 + (x & 3)] * 0.45 / nChars * 2.2;
        L = clamp01(L);
        let ch;
        // A4: bordas por Sobel em luminância, profundidade e troca de material
        let edge = false;
        if (o.a4 && x > 0 && y > 0 && x < cols - 1 && y < rows - 1) {
            const g = (a, b) => lum[(y + b) * cols + x + a];
            const gx = (g(1, -1) + 2 * g(1, 0) + g(1, 1)) - (g(-1, -1) + 2 * g(-1, 0) + g(-1, 1));
            const gy = (g(-1, 1) + 2 * g(0, 1) + g(1, 1)) - (g(-1, -1) + 2 * g(0, -1) + g(1, -1));
            const dp = (a, b) => Math.log(dep[(y + b) * cols + x + a]);
            const dx = dp(1, 0) - dp(-1, 0), dy = dp(0, 1) - dp(0, -1);
            const idc = mid[j] !== mid[j - 1] || mid[j] !== mid[j + 1] || mid[j] !== mid[j - cols] || mid[j] !== mid[j + cols];
            const mag = Math.hypot(gx, gy) * 0.3 + Math.hypot(dx, dy) * 1.2 + (idc ? 0.3 : 0);
            if (mag > o.edge && id !== ID.floor) {
                edge = true;
                const ex = gx + dx * 1.5, ey = gy + dy * 1.5;
                let a = Math.atan2(ex, -ey);                    // tangente da borda
                if (a < 0) a += Math.PI;
                const bin = a < Math.PI / 8 || a >= 7 * Math.PI / 8 ? 0 : a < 3 * Math.PI / 8 ? 1 : a < 5 * Math.PI / 8 ? 2 : 3;
                ch = EDGE[bin];
                L = Math.max(L, 0.8);
            }
        }
        if (!edge) {
            const set = o.a7 ? SETS[id] : null;
            if (set) ch = set[Math.min(set.length - 1, Math.floor(L * set.length))];
            else {
                let k = Math.floor(L * nChars);
                if (k >= nChars) k = nChars - 1;
                // A12: instabilidade: o glifo pula para o vizinho da rampa
                if (o.flick > 0 && k > 0 && hash(x, y, nowF) < o.flick * 0.5) k = Math.max(0, k + (hash(y, x, nowF) < 0.5 ? -1 : 1));
                ch = ramp[Math.min(R - 1, Math.round((k / Math.max(1, nChars - 1)) * (R - 1)))];
            }
        }
        if (ch === ' ') continue;
        // A8: cor
        const lv = L > 0.8 ? 1 : L > 0.55 ? 0.78 : L > 0.3 ? 0.56 : 0.38;
        let r, g, b;
        if (o.color === 'mono') { r = 77; g = 255; b = 136; }
        else if (o.color === 'cel') {
            const i = (((rows - 1 - y) * cols) + x) * 4;
            const m = Math.max(bufC[i], bufC[i + 1], bufC[i + 2], 1), s = 1.15 * 255 / m;
            r = (Math.min(255, bufC[i] * s) >> 6) * 85; g = (Math.min(255, bufC[i + 1] * s) >> 6) * 85; b = (Math.min(255, bufC[i + 2] * s) >> 6) * 85;
        } else [r, g, b] = PAL[id] || [200, 200, 200];
        if (edge) { r = Math.min(255, r * 1.25); g = Math.min(255, g * 1.25); b = Math.min(255, b * 1.25); }
        let col = hex(r * lv, g * lv, b * lv);
        // A12: chuva de código e dissolução (a imagem vira texto que escorre)
        const rainAmt = Math.max(o.rain, dissolve);
        if (rainAmt > 0) {
            const colSeed = hash(x, 7), speed = 6 + colSeed * 10, tail = 5 + colSeed * 18;
            const head = (t * speed + colSeed * rows * 3) % (rows + tail * 2);
            const dd = head - y;
            if (colSeed < rainAmt * 0.9 && dd >= 0 && dd < tail) { ch = RAIN[(hash(x, y, nowF) * RAIN.length) | 0]; const f = 1 - dd / tail; col = dd < 1 ? '#eafff0' : hex(30 * f, 255 * f, 90 * f); }
            else if (dissolve > 0 && hash(x, y, 3) < dissolve * 1.25 - (y / rows) * 0.25) continue;      // célula já virou chuva
        }
        const a = atlas(col), ix = CHAR_IX.get(ch) * CW;
        ctx.drawImage(a, ix, 0, CW, CH, x * CW, y * CH, CW, CH);
        if (o.a9 && (L > 0.82 || id === ID.glow || id === ID.rune || ch === '@' && id !== ID.cloak)) gctx.drawImage(a, ix, 0, CW, CH, x * CW, y * CH, CW, CH);
    }
}

// ======================= LOOP =======================
const clock = new THREE.Clock();
let fpsAcc = 0, fpsN = 0, msTxt = '…', lastDraw = 0;
function opts() {
    return {
        dist: camera.position.distanceTo(controls.target), rampa: $('ramp').value, expo: +$('expo').value, gam: +$('gam').value,
        a3: $('a3').checked, a4: $('a4').checked, edge: +$('edge').value, a5: $('a5').checked, a6: $('a6').checked, a7: $('a7').checked,
        color: $('color').value, a9: $('a9').checked, flick: +$('flick').value, rain: +$('rain').value
    };
}
function dimensionar(o) {
    const base = +$('cell').value;
    const cw = o.a3 ? Math.round(base * lerp(1, 1.9, smooth(8, 45, o.dist))) : base;
    const W = stage.clientWidth, H = stage.clientHeight;
    const c = Math.max(20, Math.floor(W / cw)), r = Math.max(10, Math.floor(H / (cw * 2)));
    if (cw !== CW || c !== cols || r !== rows) {
        if (cw !== CW) { CW = cw; CH = cw * 2; atlasCache = new Map(); }
        if (c !== cols || r !== rows) alocar(c, r);
        [ascii, glow].forEach((cv) => { cv.width = cols * CW; cv.height = rows * CH; cv.style.width = cv.width + 'px'; cv.style.height = cv.height + 'px'; });
    }
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(cols, rows, false);
}
function animar(t) {
    const cast = $('anim').value === 'cast';
    const sw = cast ? 1 : 0.35;
    model.position.y = 0.25 + Math.sin(t * 1.4) * 0.12;
    const p = cloakGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
        const x = cloakBase[i * 3], y = cloakBase[i * 3 + 1], z = cloakBase[i * 3 + 2];
        const ang = Math.atan2(z, x), k = 1 + (0.045 * Math.sin(ang * 5 + y * 3 - t * 2.2) + 0.025 * Math.sin(ang * 9 - t * 1.4)) * sw * (1.2 - y * 0.3);
        p.setXYZ(i, x * k, y, z * k);
    }
    p.needsUpdate = true;
    cloakGeo.computeVertexNormals();
    armL.g.rotation.set(-0.15 + Math.sin(t * 1.2) * 0.05, 0, 0.14);
    armR.g.rotation.set(cast ? -1.25 - Math.sin(t * 3) * 0.1 : -0.55, 0, -0.18);
    staff.position.y = cast ? 0.25 + Math.sin(t * 3) * 0.06 : 0;
    ring.rotation.z = t * 1.5;
    rune.rotation.z = t * 0.2;
    shards.forEach((m) => { const o = m.userData.o; const a = o.a + t * o.s * (cast ? 2.2 : 1); m.position.set(Math.cos(a) * o.r, o.y + Math.sin(t * o.s * 2 + o.a) * 0.15, Math.sin(a) * o.r); m.rotation.set(t * o.s, t * 0.7, 0); });
    const wp = new THREE.Vector3(); orb.getWorldPosition(wp);
    orbLight.position.copy(wp);
    orbLight.intensity = 8 + Math.sin(t * 3) * 2 + (cast ? 4 : 0);
}
function tick() {
    const t0 = performance.now();
    const t = clock.getElapsedTime();
    const o = opts();
    dimensionar(o);
    animar(t);
    dissolve += (dissolveTarget - dissolve) * 0.035;
    if (Math.abs(dissolve - dissolveTarget) < 0.01) dissolve = dissolveTarget;
    controls.update();
    renderizarPassos();
    converter(o, t);
    glow.style.display = o.a9 ? 'block' : 'none';
    $('scan').style.display = $('scanl').checked ? 'block' : 'none';
    // leituras
    fpsAcc += performance.now() - t0; fpsN++;
    if (fpsN >= 20) { msTxt = (fpsAcc / fpsN).toFixed(1); fpsAcc = fpsN = 0; }
    if (document.activeElement !== $('dist')) { $('dist').value = Math.min(55, Math.max(4, o.dist)); }
    $('distTxt').textContent = o.dist.toFixed(0);
    $('cellTxt').textContent = CW;
    $('read').innerHTML = `Grade: <b>${cols} x ${rows}</b> células (${cols * rows}), célula ${CW}x${CH} px<br>Quadro: <b>${msTxt} ms</b> (render + conversão, WebGL por software)<br>Rampa: <code>${(o.rampa === 'med' ? RAMP_MED : RAMP_TXT).replace(/ /g, '␣').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
    requestAnimationFrame(tick);
}

// ======================= INÍCIO =======================
function iniciar() {
    $('dist').addEventListener('input', () => {
        const dir = camera.position.clone().sub(controls.target).normalize();
        camera.position.copy(controls.target).addScaledVector(dir, +$('dist').value);
    });
    $('die').onclick = () => { dissolveTarget = dissolveTarget ? 0 : 1; $('die').textContent = dissolveTarget ? '✨ Renascer' : '☠ Dissolver em chuva'; };
    const set = (ids, v) => ids.forEach((id) => { $(id).checked = v; });
    $('raw').onclick = () => { set(['a3', 'a4', 'a5', 'a6', 'a7', 'a9'], false); $('flick').value = 0; $('rain').value = 0; $('color').value = 'mono'; };
    $('all').onclick = () => { set(['a3', 'a4', 'a5', 'a6', 'a7', 'a9'], true); $('flick').value = 0.15; $('color').value = 'pal'; };
    $('shot').onclick = () => { const a = document.createElement('a'); a.href = ascii.toDataURL('image/png'); a.download = 'espectro_ascii.png'; a.click(); };
    const q = new URLSearchParams(location.search);
    if (q.get('raw') === '1') $('raw').click();
    ['dist', 'anim', 'color', 'ramp', 'cell'].forEach((k) => { if (q.has(k)) $(k).value = q.get(k); });
    if (q.has('dist')) { const dir = camera.position.clone().sub(controls.target).normalize(); camera.position.copy(controls.target).addScaledVector(dir, +q.get('dist')); }
    if (q.get('die') === '1') { dissolve = dissolveTarget = 0.6; }
    if (q.get('rain')) $('rain').value = q.get('rain');
    $('loading').remove();
    tick();
}
setTimeout(iniciar, 30);
