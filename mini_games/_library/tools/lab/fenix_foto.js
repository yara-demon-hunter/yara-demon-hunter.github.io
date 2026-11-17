// --- LABORATÓRIO: Fênix de fogo (a Hearth Phoenix em 3D) ---
// Mesma metodologia do golem e do treant (metodologia_fotorrealismo.md): tudo por código, nada de imagem nem modelo baixado. A fênix tem as asas
// abertas, bate-as e arde inteira. Fora dos jogos; usa o Three.js copiado em vendor/three. O sprite do jogo sai daqui (?bake=1, bake_fenix.py).
//
// Mapa das técnicas neste arquivo:
//   1 PBR + ruído ......... texturaPena (albedo, normal e recortes das barbas por ruído) e o material das penas (emissivo por vértice)
//   2 Triplanar ........... não se aplica (as penas têm UV próprio); o chão usa a textura repetida
//   3 GI e AO ............. luz do fogo no entorno (PointLight que pulsa, tinge o chão) e GTAOPass
//   4 Instancing + SSS .... chamas e fagulhas: ~300 partículas sem estado (a posição é função do tempo), emitidas das pontas das penas.
//                           Contraluz falso: o brilho emissivo cresce da raiz à ponta
//   5 Gaussian Splatting .. fora
//   6 Atmosfera ........... névoa escura de noite; o ar em volta é o brilho do próprio fogo (bloom)
//   7 Pós ................. ACES, bloom forte
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const TAU = Math.PI * 2;
function mulberry32(a) {
    return () => {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const rng = mulberry32(20261120);
const simplex = new SimplexNoise({ random: rng });
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const frac = (x) => x - Math.floor(x);
// Altura da fênix em relação ao chão (só na página; no ?bake=1 fica 0 para o sprite não mudar).
const ALTURA = new URLSearchParams(location.search).has("bake") ? 0 : 0.9;

// Ciclo: uma batida de asa dura CICLO segundos. O atlas do jogo dá a volta nesse tempo e a chama também (sem emenda).
const CICLO = 1.6;

// ======================= PALETAS =======================
const PALETAS = {
    fogo: {
        raiz: [0.32, 0.025, 0.015], meio: [1.0, 0.32, 0.04], ponta: [1.0, 0.82, 0.3],
        chama: [[1.0, 0.7, 0.22], [1.0, 0.36, 0.04], [0.7, 0.08, 0.02]], luz: 0xff7a1a, olho: [1, 0.95, 0.7], bico: 0xffd27a
    },
    azul: {
        raiz: [0.02, 0.05, 0.3], meio: [0.12, 0.42, 1.0], ponta: [0.72, 0.9, 1.0],
        chama: [[0.6, 0.85, 1.0], [0.18, 0.5, 1.0], [0.05, 0.18, 0.8]], luz: 0x3b82f6, olho: [0.85, 0.95, 1], bico: 0xbfdbfe
    }
};
let paleta = PALETAS.fogo, paletaNome = 'fogo';

// ======================= 1 · TEXTURA DA PENA (PBR + RUÍDO) =======================
// Uma pena: nervura no meio e barbas em diagonal; o ruído abre falhas na borda (a pena fica "rasgada" e viva) e varia o brilho.
// Linha 0 da imagem = raiz da pena. Devolve albedo cinza (a cor vem do vértice), normal e recorte (alfa).
function texturaPena(W = 128, H = 512) {
    const alb = new Uint8Array(W * H * 4), alt = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const u = x / W, t = y / H, s = Math.abs(u - 0.5) * 2, i = y * W + x;
        const q = t * 70 - s * 16 + simplex.noise(u * 4, t * 9) * 1.6;
        const barba = 0.5 + 0.5 * Math.sin(q * TAU);
        const gap = simplex.noise(u * 7 + 3, t * 55) * 0.5 + 0.5;
        const rachis = 1 - smooth(0.02, 0.07, s);
        let a = 1;
        if (s > 0.55) a = gap > 0.55 + (1 - s) * 0.9 ? 0 : 1;      // falhas nas barbas, só perto da borda
        if (rachis > 0.5) a = 1;
        const luz = 0.55 + 0.4 * barba + 0.15 * (simplex.noise(u * 3, t * 14) * 0.5 + 0.5) + rachis * 0.35;
        const v = Math.min(255, luz * 215);
        alb[i * 4] = alb[i * 4 + 1] = alb[i * 4 + 2] = v; alb[i * 4 + 3] = a * 255;
        alt[i] = barba * 0.8 + rachis * 1.2;
    }
    const nor = new Uint8Array(W * H * 4);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, dx = alt[y * W + Math.min(W - 1, x + 1)] - alt[y * W + Math.max(0, x - 1)], dy = alt[Math.min(H - 1, y + 1) * W + x] - alt[Math.max(0, y - 1) * W + x];
        const n = new THREE.Vector3(-dx * 1.1, -dy * 1.1, 1).normalize();
        nor[i * 4] = (n.x * 0.5 + 0.5) * 255; nor[i * 4 + 1] = (n.y * 0.5 + 0.5) * 255; nor[i * 4 + 2] = (n.z * 0.5 + 0.5) * 255; nor[i * 4 + 3] = 255;
    }
    const mk = (data) => { const t = new THREE.DataTexture(data, W, H, THREE.RGBAFormat); t.needsUpdate = true; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 4; return t; };
    const map = mk(alb), normalMap = mk(nor);
    normalMap.colorSpace = THREE.NoColorSpace;
    return { map, normalMap };
}

// Textura da chama (partícula): gota esticada com bordas rasgadas por ruído; branca, a cor vem do material
function texturaChama(N = 128) {
    const d = new Uint8Array(N * N * 4);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const u = x / N - 0.5, v = y / N - 0.62, i = (y * N + x) * 4;
        const r = Math.hypot(u * 1.5, v * (v < 0 ? 0.8 : 1.5)) * 2;
        const n = simplex.noise(u * 5 + 7, v * 6) * 0.5 + 0.5, n2 = simplex.noise(u * 12, v * 12 + 3) * 0.5 + 0.5;
        const a = clamp01(1 - r - (n - 0.45) * 0.4 - (n2 - 0.5) * 0.08);
        const k = smooth(0, 0.55, a);
        d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = k * 255;
    }
    const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat); t.needsUpdate = true; t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ======================= CENA =======================
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x03050a, 1);
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const cenaFogo = new THREE.Scene();      // chamas e fagulhas: ficam fora do AO (o passe de profundidade as veria como quadrados)
scene.fog = new THREE.FogExp2(0x03050a, 0.03);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
camera.position.set(3.6, 1.3 + ALTURA, 4.4);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(-0.3, 0.2 + ALTURA, 0); controls.enableDamping = true; controls.autoRotate = false; controls.autoRotateSpeed = 0.7;
controls.minDistance = 2.5; controls.maxDistance = 14;

const hemi = new THREE.HemisphereLight(0x1a2438, 0x0a0806, 0.35); scene.add(hemi);
const luzFogo = new THREE.PointLight(0xff7a1a, 7, 9, 1.6); scene.add(luzFogo);
const luzFogo2 = new THREE.PointLight(0xff7a1a, 3, 7, 1.6); scene.add(luzFogo2);

// ======================= PENAS =======================
let penas = [];            // { geo, t } para recolorir
let matPena, matCorpo;
function criarMateriais(tex) {
    const glow = { value: 0.75 };
    matPena = new THREE.MeshStandardMaterial({ map: tex.map, normalMap: tex.normalMap, normalScale: new THREE.Vector2(0.8, 0.8), vertexColors: true, roughness: 0.55, metalness: 0, side: THREE.DoubleSide, alphaTest: 0.5, emissive: 0xffffff, emissiveMap: tex.map });
    matPena.onBeforeCompile = (sh) => {
        sh.uniforms.uGlow = glow;
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uGlow;')
            .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance *= vColor * uGlow;');
    };
    matPena.userData.glow = glow;
    matCorpo = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex.map, roughness: 0.6, emissive: 0xff5a10, emissiveMap: tex.map, emissiveIntensity: 0.55 });
}

// Geometria de uma pena no plano XZ, comprimento ao longo de +X, largura em Z, empenada para baixo (droop). t = 0 na raiz, 1 na ponta.
function geoPena(len, wid, droop, seg = 14, wseg = 4) {
    const pos = [], uv = [], idx = [], tt = [];
    for (let i = 0; i <= seg; i++) {
        const t = i / seg;
        const perfil = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 0.65) * (1 - 0.35 * t) * (t < 0.08 ? t / 0.08 * 0.6 + 0.4 : 1);
        for (let j = 0; j <= wseg; j++) {
            const w = j / wseg - 0.5;
            pos.push(t * len, -droop * len * t * t + Math.abs(w) * wid * 0.15 * -1, w * wid * Math.max(perfil, 0.02));
            uv.push(j / wseg, t);
            tt.push(t);
        }
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < wseg; j++) {
        const a = i * (wseg + 1) + j, b = a + 1, c = a + wseg + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(tt.length * 3), 3));
    g.setIndex(idx); g.computeVertexNormals();
    penas.push({ geo: g, t: tt, quente: 1 });
    return g;
}
function pintarPena(p, pal) {
    const col = p.geo.getAttribute('color');
    for (let i = 0; i < p.t.length; i++) {
        const t = p.t[i], k = clamp01(t * 1.15);
        const a = k < 0.55 ? pal.raiz : pal.meio, b = k < 0.55 ? pal.meio : pal.ponta, f = k < 0.55 ? k / 0.55 : (k - 0.55) / 0.45;
        for (let c = 0; c < 3; c++) col.setXYZ(i, ...[0, 1, 2].map((c2) => lerp(a[c2], b[c2], f) * (0.55 + 0.9 * t * p.quente)));
    }
    col.needsUpdate = true;
}

const ave = new THREE.Group(); scene.add(ave);
const emissores = [];       // { obj, tipo } objetos cujo mundo é de onde saem as chamas
let asas = [], plumas = [];
const ombro = [], cotovelo = [], punho = [];

function marcador(pai, x, y, z, peso = 1) { const o = new THREE.Object3D(); o.position.set(x, y, z); pai.add(o); emissores.push({ obj: o, peso }); return o; }

function pena(pai, len, wid, droop, x, z, phi, extra = {}) {
    const m = new THREE.Mesh(geoPena(len, wid, droop), matPena);
    m.position.set(x, extra.y ?? 0, z);
    const lado = extra.lado ?? 1;          // -1 = asa do lado oposto: a pena aponta para -z (espelhada de verdade, sem escala negativa)
    m.rotation.y = -lado * (phi + Math.PI / 2);
    m.rotation.x = (extra.rolo ?? 0) * lado;
    penas[penas.length - 1].quente = extra.quente ?? 1;
    pai.add(m);
    if (extra.emite) { const o = new THREE.Object3D(); o.position.set(len, 0, 0); m.add(o); emissores.push({ obj: o, peso: extra.emite }); }
    return m;
}

function construirAsa(lado) {
    const raiz = new THREE.Group(); raiz.position.set(0.08, 0.16, 0.17 * lado); ave.add(raiz);
    const braco = new THREE.Group(); raiz.add(braco);
    const P = (pai, len, wid, droop, x, z, phi, ex = {}) => pena(pai, len, wid, droop, x, z * lado, phi, { ...ex, lado });
    const La = 0.52, Lf = 0.58;
    const cot = new THREE.Group(); cot.position.set(0, 0, La * lado); braco.add(cot);
    const pun = new THREE.Group(); pun.position.set(0, 0, Lf * lado); cot.add(pun);
    // Primárias: leque a partir do punho, as mais longas ao centro
    for (let i = 0; i < 9; i++) {
        const k = i / 8, phi = lerp(-0.2, 0.7, k), len = 1.02 - Math.abs(k - 0.3) * 0.55;
        P(pun, len, 0.17, 0.08 + k * 0.05, 0, 0.0, phi, { emite: i % 2 === 0 ? 1 : 0.5, rolo: (k - 0.5) * 0.12 });
    }
    // Secundárias: ao longo do antebraço, para trás
    for (let i = 0; i < 9; i++) {
        const k = i / 8, z = lerp(Lf * 0.92, 0.04, k), phi = lerp(0.62, 0.95, k), len = lerp(0.72, 0.52, k);
        P(cot, len, 0.19, 0.1, 0, z, phi, { emite: i % 2 === 0 ? 1 : 0.5 });
    }
    // Terciárias, junto ao corpo
    for (let i = 0; i < 5; i++) { const k = i / 4; P(braco, lerp(0.5, 0.4, k), 0.2, 0.12, 0, lerp(La * 0.9, 0.04, k), lerp(1.0, 1.25, k), { emite: 0.5 }); }
    // Coberteiras: duas fileiras curtas e largas, mais claras
    for (let r = 0; r < 2; r++) {
        for (let i = 0; i < 9; i++) { const k = i / 8; P(cot, 0.3 - r * 0.06, 0.2, 0.05, 0.02 + r * 0.04, lerp(Lf * 0.95, 0.03, k), lerp(0.5, 0.9, k) + r * 0.1, { y: 0.012 * (r + 1), quente: 1.4 }); }
        for (let i = 0; i < 6; i++) { const k = i / 5; P(braco, 0.3 - r * 0.06, 0.2, 0.05, 0.02 + r * 0.04, lerp(La * 0.95, 0.03, k), lerp(0.7, 1.1, k) + r * 0.1, { y: 0.012 * (r + 1), quente: 1.4 }); }
    }
    ombro.push(raiz); cotovelo.push(cot); punho.push(pun);
    return { raiz, braco, cot, pun };
}

// Pluma da cauda ou da crista: fita que ondula (recalculada a cada pose). base e dir no espaço da ave.
function pluma(base, dir, len, wid, fase, amp, cair) {
    const seg = 22, pos = new Float32Array((seg + 1) * 2 * 3), uv = [], idx = [], tt = [], g = new THREE.BufferGeometry();
    for (let i = 0; i <= seg; i++) { uv.push(0, i / seg, 1, i / seg); tt.push(i / seg, i / seg); }
    for (let i = 0; i < seg; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(tt.length * 3), 3));
    g.setIndex(idx);
    penas.push({ geo: g, t: tt, quente: 1.1 });
    const m = new THREE.Mesh(g, matPena); m.frustumCulled = false; ave.add(m);
    const o = new THREE.Object3D(); ave.add(o); emissores.push({ obj: o, peso: 1.4 });
    const P = { m, g, base, dir, len, wid, fase, amp, cair, seg, tip: o, atualizar(p) {
        const a = g.getAttribute('position');
        for (let i = 0; i <= seg; i++) {
            const t = i / seg, s = t * len;
            const ond = Math.sin(TAU * (p - t * 0.5 + fase)) * amp * 1.4 * t * t;
            // Cauda pesada: sai para trás, mas logo cede e cai, curvando em S (o avanço para trás diminui e a queda cresce); nada de fita reta
            const x = base.x + dir.x * s * (1 - 0.5 * t) + Math.sin(TAU * (p - t * 0.35 + fase)) * amp * 0.45 * t;
            const y = base.y + dir.y * s - cair * 1.15 * t * t + Math.sin(TAU * (p - t * 0.4 + fase)) * amp * 0.7 * t, z = base.z + dir.z * s + ond;
            const w = wid * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.6) * (t > 0.82 ? 1 + (t - 0.82) * 5 : 1) * (t < 0.05 ? 0.5 : 1) * 0.5;
            a.setXYZ(i * 2, x, y + w * 0.35, z - w); a.setXYZ(i * 2 + 1, x, y - w * 0.35, z + w);
            if (i === seg) o.position.set(x, y, z);
        }
        a.needsUpdate = true; g.computeVertexNormals();
    } };
    plumas.push(P);
    return P;
}

function construirAve() {
    const alva = new THREE.Group(); ave.add(alva);
    // Corpo: elipsoide inclinado, pescoço, cabeça e bico
    const corpo = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 24), matCorpo); corpo.scale.set(0.56, 0.2, 0.19); corpo.rotation.z = 0.16; ave.add(corpo);
    const peito = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), matCorpo); peito.scale.set(0.28, 0.19, 0.18); peito.position.set(0.32, 0.08, 0); ave.add(peito);
    const pescoco = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.46, 16), matCorpo); pescoco.position.set(0.55, 0.33, 0); pescoco.rotation.z = -0.5; ave.add(pescoco);
    const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.115, 24, 18), matCorpo); cabeca.position.set(0.72, 0.56, 0); cabeca.scale.set(1.1, 0.95, 0.9); ave.add(cabeca);
    const bico = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 14), new THREE.MeshStandardMaterial({ color: 0xffd27a, roughness: 0.35, emissive: 0xff9a2a, emissiveIntensity: 0.5 })); bico.rotation.z = -Math.PI / 2 - 0.18; bico.position.set(0.88, 0.53, 0); ave.add(bico);
    matBico = bico.material;
    for (const s of [-1, 1]) { const olho = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c0 })); olho.position.set(0.76, 0.6, 0.075 * s); ave.add(olho); olhos.push(olho); }
    ombro.length = 0; cotovelo.length = 0; punho.length = 0;
    asas = [construirAsa(1), construirAsa(-1)];
    // Cauda: sete plumas longas, largas e pesadas que caem para baixo, em leque, e ondulam devagar; crista: três plumas curtas para cima e para trás
    [[-0.45, 0.02, 0, 3.0, 0.0, 0.4, 1.5], [-0.42, 0.0, 0.07, 2.6, 0.9, 0.42, 1.3], [-0.42, 0.0, -0.07, 2.6, 1.7, 0.42, 1.3], [-0.4, -0.02, 0.14, 2.1, 2.4, 0.38, 1.05], [-0.4, -0.02, -0.14, 2.1, 3.1, 0.38, 1.05], [-0.38, -0.03, 0.22, 1.6, 3.8, 0.34, 0.8], [-0.38, -0.03, -0.22, 1.6, 4.5, 0.34, 0.8]]
        .forEach(([x, y, z, len, fase, amp, cair], i) => {
            const d = new THREE.Vector3(-1, -0.42, (z === 0 ? 0 : Math.sign(z) * 0.2)).normalize();
            pluma(new THREE.Vector3(x, y, z), d, len, 0.3, fase / TAU, amp, cair);
        });
    [[0.68, 0.64, 0.0, 0.5], [0.66, 0.63, 0.05, 0.4], [0.66, 0.63, -0.05, 0.4]].forEach(([x, y, z, len], i) => {
        const d = new THREE.Vector3(-0.8, 0.9, z * 2.5).normalize();
        pluma(new THREE.Vector3(x, y, z), d, len, 0.09, i * 0.3, 0.06, 0.1);
    });
    // Emissores de fogo no corpo, no pescoço e na cabeça
    [[0.1, 0.2, 0.12], [0.1, 0.2, -0.12], [-0.2, 0.15, 0], [0.35, 0.22, 0.1], [0.35, 0.22, -0.1], [0.55, 0.45, 0], [0.7, 0.66, 0],
     // o corpo todo em chamas: ao longo do dorso, do peito, da barriga, do pescoço, da cabeça e da base das asas
     [-0.35, 0.12, 0.1], [-0.35, 0.12, -0.1], [-0.1, 0.22, 0.1], [-0.1, 0.22, -0.1], [0.1, 0.0, 0.16], [0.1, 0.0, -0.16], [-0.25, -0.02, 0.08], [-0.25, -0.02, -0.08],
     [0.25, 0.05, 0.12], [0.25, 0.05, -0.12], [0.2, 0.28, 0], [0.45, 0.32, 0.08], [0.45, 0.32, -0.08], [0.6, 0.55, 0.06], [0.6, 0.55, -0.06], [0.78, 0.62, 0.05], [0.78, 0.62, -0.05],
     [0.1, 0.3, 0.2], [0.1, 0.3, -0.2], [0.0, 0.1, 0.3], [0.0, 0.1, -0.3], [-0.45, 0.0, 0.05], [-0.45, 0.0, -0.05]]
        .forEach(([x, y, z]) => marcador(ave, x, y, z, 2.4));
}
let matBico; const olhos = [];

// Pose na fase p (0 a 1 = uma batida). Asas em cadeia (ombro, cotovelo, punho) cada uma atrasada em relação à anterior.
function pose(p, bate = true) {
    const f = bate ? p : 0.22;
    const subida = Math.sin(TAU * f);
    // As DUAS asas sobem e descem juntas, no mesmo instante. A asa do lado -z aponta para -z, então os giros em x e y trocam de sinal (espelho)
    for (let i = 0; i < 2; i++) {
        const s = i === 0 ? 1 : -1;
        ombro[i].rotation.x = s * -(subida * 0.78 + 0.12);
        ombro[i].rotation.y = s * (-0.1 + 0.16 * Math.cos(TAU * f));
        cotovelo[i].rotation.x = s * -(Math.sin(TAU * (f - 0.08)) * 0.42);
        cotovelo[i].rotation.y = s * (0.05 - 0.12 * Math.cos(TAU * (f - 0.08)));
        punho[i].rotation.x = s * -(Math.sin(TAU * (f - 0.17)) * 0.62);
        punho[i].rotation.y = s * 0.08 * Math.cos(TAU * (f - 0.17));
    }
    ave.position.y = ALTURA + Math.cos(TAU * f) * 0.075;
    ave.rotation.z = Math.sin(TAU * (f - 0.1)) * 0.035;
    for (const P of plumas) P.atualizar(f);
    ave.updateMatrixWorld(true);
}

// ======================= 4 · CHAMAS E FAGULHAS (sem estado) =======================
const NP = 560;
let tabela = null;       // posições dos emissores em G fases do ciclo
const G = 40;
function amostrarEmissores() {
    const E = emissores.length; tabela = new Float32Array(G * E * 3);
    const v = new THREE.Vector3();
    for (let g = 0; g < G; g++) {
        pose(g / G, true);
        emissores.forEach((e, k) => { e.obj.getWorldPosition(v); tabela.set([v.x, v.y, v.z], (g * E + k) * 3); });
    }
}
function emissor(k, fase, out) {
    const E = emissores.length, x = fase * G, g0 = Math.floor(x) % G, g1 = (g0 + 1) % G, f = x - Math.floor(x);
    for (let c = 0; c < 3; c++) out[c] = lerp(tabela[(g0 * E + k) * 3 + c], tabela[(g1 * E + k) * 3 + c], f);
}
const particulas = [];
function criarFogo() {
    const tex = texturaChama();
    const E = emissores.length, pesoTotal = emissores.reduce((s, e) => s + e.peso, 0);
    for (let i = 0; i < NP; i++) {
        let r = rng() * pesoTotal, k = 0; while (k < E - 1 && r > emissores[k].peso) { r -= emissores[k].peso; k++; }
        const fagulha = i % 5 === 0;
        const mat = new THREE.SpriteMaterial({ map: tex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
        const s = new THREE.Sprite(mat); s.frustumCulled = false; cenaFogo.add(s);
        particulas.push({ s, k, fase: rng(), fagulha, vy: 0.55 + rng() * 0.7, vx: -(0.1 + rng() * 0.35), tam: fagulha ? 0.035 + rng() * 0.03 : 0.12 + rng() * 0.16, f1: rng(), f2: rng(), vz: (rng() - 0.5) * 0.25 });
    }
}
const tmp = [0, 0, 0];
function atualizarFogo(t) {
    const L = CICLO / 2;
    for (const P of particulas) {
        const vida = P.fagulha ? CICLO : L, a = frac(t / vida + P.fase), nasceu = t - a * vida;
        emissor(P.k, frac(nasceu / CICLO), tmp);
        const seg = a * vida, turb = Math.sin(TAU * (a * 1.4 + P.f1)) * 0.07 * a;
        const sobe = P.fagulha ? P.vy * 1.4 : P.vy;
        P.s.position.set(tmp[0] + P.vx * seg + turb, tmp[1] + sobe * seg - (P.fagulha ? 0.15 * seg * seg : 0), tmp[2] + P.vz * seg + Math.sin(TAU * (a + P.f2)) * 0.05 * a);
        const tam = P.tam * (P.fagulha ? 1 - a * 0.6 : 0.5 + 1.1 * Math.sin(Math.PI * Math.pow(a, 0.7)));
        P.s.scale.set(tam, tam * (P.fagulha ? 1 : 2.1), 1);
        const m = P.s.material, c = a < 0.35 ? lerpC(paleta.chama[0], paleta.chama[1], a / 0.35) : lerpC(paleta.chama[1], paleta.chama[2], (a - 0.35) / 0.65);
        m.color.setRGB(c[0], c[1] * 0.92, c[2] * 0.85);
        m.opacity = P.fagulha ? (1 - a) * 0.9 : Math.pow(1 - a, 1.3) * 0.42;
        m.rotation = Math.sin(TAU * (a + P.f1)) * 0.3;
    }
}
const lerpC = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// ======================= CHÃO (só no visualizador) =======================
let chao;
function criarChao() {
    const N = 256, d = new Uint8Array(N * N * 4);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const u = x / N, v = y / N, i = (y * N + x) * 4;
        const n = simplex.noise(u * 12, v * 12) * 0.5 + 0.5, n2 = simplex.noise(u * 40, v * 40) * 0.5 + 0.5;
        const k = 28 + n * 40 + n2 * 22; d[i] = k * 1.1; d[i + 1] = k * 0.9; d[i + 2] = k * 0.75; d[i + 3] = 255;
    }
    const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat); t.needsUpdate = true; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6);
    chao = new THREE.Mesh(new THREE.CircleGeometry(14, 48), new THREE.MeshStandardMaterial({ map: t, roughness: 0.92, metalness: 0 }));
    chao.rotation.x = -Math.PI / 2; chao.position.y = -1.5; scene.add(chao);
}

// ======================= PALETA, PAINEL, LOOP =======================
function aplicarPaleta(nome) {
    paletaNome = nome; paleta = PALETAS[nome];
    penas.forEach(p => pintarPena(p, paleta));
    matCorpo.emissive.setRGB(paleta.meio[0] * 0.6, paleta.meio[1] * 0.55, paleta.meio[2] * 0.5);
    matCorpo.color.setRGB(Math.min(1, paleta.meio[0] * 0.9 + 0.2), Math.min(1, paleta.meio[1] * 1.3 + 0.2), Math.min(1, paleta.meio[2] * 1.2 + 0.2));
    matBico.color.setHex(paleta.bico); olhos.forEach(o => o.material.color.setRGB(...paleta.olho));
    luzFogo.color.setHex(paleta.luz); luzFogo2.color.setHex(paleta.luz);
}

let composer, passAO, passBloom, passFogo;
function compositor(w, h) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    passAO = new GTAOPass(scene, camera, w, h);
    passAO.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.4, thickness: 1, scale: 1, samples: 10, distanceFallOff: 1, screenSpaceRadius: false });
    passAO.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, radiusExponent: 1, rings: 2, samples: 10 });
    composer.addPass(passAO);
    passFogo = new RenderPass(cenaFogo, camera); passFogo.clear = false; passFogo.clearDepth = true;
    composer.addPass(passFogo);
    passBloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.8, 0.6, 0.55);
    composer.addPass(passBloom);
    composer.addPass(new OutputPass());
}

function ligar() {
    const on = (id) => $(id).checked;
    const apply = () => {
        aplicarPaleta(on('corAzul') ? 'azul' : 'fogo');
        cenaFogo.visible = on('fogo');
        luzFogo.visible = luzFogo2.visible = on('luz');
        passAO.enabled = on('ao'); passBloom.enabled = on('bloom');
        renderer.toneMapping = on('aces') ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
        controls.autoRotate = on('spin');
        matPena.map = on('pbr') ? tex.map : null; matPena.normalMap = on('pbr') ? tex.normalMap : null; matPena.emissiveMap = on('pbr') ? tex.map : null; matPena.alphaTest = on('pbr') ? 0.5 : 0; matPena.needsUpdate = true;
    };
    document.querySelectorAll('#panel input').forEach(el => el.addEventListener('change', apply));
    apply();
    const setQuality = () => {
        const q = +$('quality').value, pr = Math.min(window.devicePixelRatio || 1, 2) * q;
        renderer.setPixelRatio(pr); composer.setPixelRatio(pr);
        const w = stage.clientWidth, h = stage.clientHeight;
        renderer.setSize(w, h); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    $('quality').addEventListener('change', setQuality); window.addEventListener('resize', setQuality); setQuality();
    $('shot').addEventListener('click', () => { composer.render(); const a = document.createElement('a'); a.download = `fenix-${paletaNome}.png`; a.href = renderer.domElement.toDataURL('image/png'); a.click(); });
}

let tex, ultimo = 0, quadros = 0, tFps = 0;
function loop(ms) {
    const t = ms / 1000, dt = Math.min(0.1, t - ultimo); ultimo = t;
    controls.update(); camera.updateMatrixWorld();
    pose(window.__fase ?? frac(t / CICLO), $("bate").checked);
    atualizarFogo(t);
    const pulso = 0.85 + 0.15 * Math.sin(t * 7.3) + 0.07 * Math.sin(t * 17);
    luzFogo.intensity = 7 * pulso; luzFogo2.intensity = 3 * pulso;
    luzFogo.position.set(0.0, 0.5 + ave.position.y, 0.9); luzFogo2.position.set(-0.3, -0.1 + ave.position.y, -1.0);
    composer.render();
    quadros++; tFps += dt;
    if (tFps > 0.5) { $('fps').textContent = `${Math.round(quadros / tFps)} quadros/s`; quadros = 0; tFps = 0; }
    requestAnimationFrame(loop);
}

// ======================= SPRITES (?bake=1) =======================
// Fundo preto, câmera quase ortográfica de três quartos. window.__bake(cor, quadros, tam) devolve o atlas: uma linha de quadros com fundo transparente.
// No fim o preto vira transparência (alfa = luz do pixel), para o jogo desenhar a chama normalmente por cima do chão claro.
function bake() {
    document.getElementById('panel')?.remove(); document.getElementById('home')?.remove();
    scene.fog = null; chao && (chao.visible = false);
    passAO.enabled = false; hemi.intensity = 0.3; hemi.color.setHex(0x222222); hemi.groundColor.setHex(0x000000);
    const alvo = new THREE.Vector3(-0.5, 0.05, 0);
    renderer.setClearColor(0x000000, 1);
    const cam = new THREE.PerspectiveCamera(11.2, 1, 1, 80);
    const az = 50 * Math.PI / 180, el = 26 * Math.PI / 180, d = 28;
    cam.position.set(alvo.x + Math.cos(az) * Math.cos(el) * d, alvo.y + Math.sin(el) * d, alvo.z + Math.sin(az) * Math.cos(el) * d);
    cam.lookAt(alvo); cam.updateMatrixWorld();
    composer.passes[0].camera = cam; passAO.camera = cam; passFogo.camera = cam;
    luzFogo.position.set(0.3, 0.6, 1.6); luzFogo2.position.set(-0.6, -0.2, -1.2);
    window.__bake = (cor, quadros, tam) => {
        aplicarPaleta(cor);
        const grande = tam * 2;
        renderer.setPixelRatio(1); renderer.setSize(grande, grande); composer.setPixelRatio(1); composer.setSize(grande, grande);
        const cv = document.createElement('canvas'); cv.width = tam * quadros; cv.height = tam;
        const c = cv.getContext('2d'); 
        for (let f = 0; f < quadros; f++) {
            pose(f / quadros, true); atualizarFogo(f / quadros * CICLO);
            luzFogo.intensity = 7; luzFogo2.intensity = 3;
            composer.render();
            c.drawImage(renderer.domElement, f * tam, 0, tam, tam);
            // O preto do fundo tem um resto de névoa e ruído: tira o piso e apaga as bordas do quadro, para o jogo (que soma luz) não mostrar um quadrado
            const img = c.getImageData(f * tam, 0, tam, tam), d = img.data;
            for (let y = 0; y < tam; y++) for (let x = 0; x < tam; x++) {
                const i = (y * tam + x) * 4, e = Math.min(smooth(0, 0.2, x / tam), smooth(0, 0.2, 1 - x / tam), smooth(0, 0.2, y / tam), smooth(0, 0.2, 1 - y / tam));
                for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, (d[i + k] - 26) * 1.12) * e;
                // Preto vira transparência: alfa = a luz do pixel, e a cor é a luz dividida pelo alfa. Assim o jogo desenha por cima do chão claro sem a chama sumir
                const luz = Math.max(d[i], d[i + 1], d[i + 2]), alfa = Math.min(1, luz / 255 * 1.7);
                if (alfa > 0) { for (let k = 0; k < 3; k++) d[i + k] = Math.min(255, d[i + k] / alfa); d[i + 3] = alfa * 255; } else d[i + 3] = 0;
            }
            c.putImageData(img, f * tam, 0);
        }
        return cv.toDataURL('image/webp', 0.86);
    };
    window.__lab = { bake: true, ok: true };
}

async function iniciar() {
    const t0 = performance.now();
    const bakeModo = new URLSearchParams(location.search).has('bake');
    tex = texturaPena();
    criarMateriais(tex);
    construirAve();
    aplicarPaleta('fogo');
    amostrarEmissores();
    pose(0, true);
    criarFogo();
    if (!bakeModo) criarChao();
    renderer.setSize(stage.clientWidth || 256, stage.clientHeight || 256);
    compositor(stage.clientWidth || 256, stage.clientHeight || 256);
    if (bakeModo) { bake(); $('loading').remove(); return; }
    ligar();
    window.__lab = { scene, camera, renderer, composer, emissores: emissores.length, penas: penas.length, tempoMs: Math.round(performance.now() - t0) };
    $('loading').remove();
    requestAnimationFrame(loop);
}
requestAnimationFrame(() => setTimeout(() => { iniciar().catch((e) => { console.error(e); $('loading').textContent = 'Erro: ' + e.message + '\n(veja o console, F12)'; }); }, 30));
