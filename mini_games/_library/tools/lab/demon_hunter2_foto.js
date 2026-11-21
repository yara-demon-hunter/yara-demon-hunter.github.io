// --- LABORATÓRIO: Demon Hunter 2 (procedural, mesma técnica do Golem de Brasa e Musgo) ---
// O herói inteiro gerado por código: nenhuma imagem, nenhum modelo 3D. Fora dos jogos; usa o Three.js de vendor/three.
// Referência: _library/characters/hunter/art_reference (capuz fundo, máscara de metal/osso com buracos dos olhos, manto e capa rasgados azul-escuros,
// antebraços enfaixados, faixa na cintura, botas altas, espada curta com runas azuis).
//
// Técnicas (as do Golem, ver metodologia_fotorrealismo.md):  1 PBR + ruído: texturas de pano, ataduras, couro, osso e aço, geradas por ruído com
// relevo (mapa normal) · 3 AO (GTAO) e luz hemisférica · 6 névoa  · 7 pós: ACES, bloom, cor de cinema, vinheta, grão, FXAA.
// Organização: texturas → geometria (capuz, máscara, manto, capa, membros, espada) → montagem → poses (parado, andar, golpe) → página e bake.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const BAKE = new URLSearchParams(location.search).has('bake');
const TAU = Math.PI * 2;
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rng = mulberry32(20261121);
const simplex = new SimplexNoise({ random: rng });
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const hex = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// ======================= 1 · TEXTURAS PROCEDURAIS (PBR) =======================
// Ruído tileável em "rosca" (u e v dão a volta), com frequências diferentes nos dois eixos (fu, fv): dá as dobras compridas do pano.
function fbmA(u, v, fu, fv, oct, gain = 0.5, ridged = false) {
    const cu = Math.cos(TAU * u), su = Math.sin(TAU * u), cv = Math.cos(TAU * v), sv = Math.sin(TAU * v);
    let ru = fu / TAU, rv = fv / TAU, a = 1, s = 0, n = 0;
    for (let o = 0; o < oct; o++) {
        let val = simplex.noise4d(cu * ru, su * ru, cv * rv, sv * rv);
        val = ridged ? 1 - Math.abs(val) * 1.15 : val * 0.5 + 0.5;
        s += val * a; n += a; a *= gain; ru *= 2; rv *= 2;
    }
    return s / n;
}
function mkTex(data, N, srgb) {
    const t = new THREE.DataTexture(data, N, N, THREE.RGBAFormat, THREE.UnsignedByteType);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true; t.anisotropy = 8; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.needsUpdate = true;
    return t;
}
// Mapa normal a partir de um mapa de altura (diferenças vizinhas, com a volta nas bordas)
function normalDe(H, N, strength) {
    const out = new Uint8Array(N * N * 4);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const l = H[y * N + ((x + N - 1) % N)], r = H[y * N + ((x + 1) % N)], t = H[((y + N - 1) % N) * N + x], b = H[((y + 1) % N) * N + x];
        let nx = (l - r) * strength, ny = (t - b) * strength, nz = 1; const len = Math.hypot(nx, ny, nz); nx /= len; ny /= len; nz /= len;
        const k = (y * N + x) * 4;
        out[k] = (nx * 0.5 + 0.5) * 255; out[k + 1] = (ny * 0.5 + 0.5) * 255; out[k + 2] = (nz * 0.5 + 0.5) * 255; out[k + 3] = 255;
    }
    return mkTex(out, N, false);
}
// Cria as texturas de um material: `corpo(u, v)` devolve { col:[r,g,b], rough, h (altura 0..1), emis (0..1, opcional) }
function construir(corpo, N = 256, strength = 3) {
    const alb = new Uint8Array(N * N * 4), rgh = new Uint8Array(N * N * 4), emi = new Uint8Array(N * N * 4), H = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x, k = i * 4, o = corpo(x / N, y / N);
        H[i] = o.h;
        alb[k] = o.col[0] * 255; alb[k + 1] = o.col[1] * 255; alb[k + 2] = o.col[2] * 255; alb[k + 3] = 255;
        rgh[k] = 0; rgh[k + 1] = clamp01(o.rough) * 255; rgh[k + 2] = clamp01(o.metal ?? 0) * 255; rgh[k + 3] = 255;     // padrão glTF: G = rugosidade, B = metal
        const e = (o.emis ?? 0) * 255; emi[k] = (o.emisCol ?? [0.2, 0.7, 1])[0] * e; emi[k + 1] = (o.emisCol ?? [0.2, 0.7, 1])[1] * e; emi[k + 2] = (o.emisCol ?? [0.2, 0.7, 1])[2] * e; emi[k + 3] = 255;
    }
    return { map: mkTex(alb, N, true), rough: mkTex(rgh, N, false), normal: normalDe(H, N, strength), emis: mkTex(emi, N, true) };
}
// Alfa da barra rasgada: tudo acima de uma linha de dentes irregulares é pano, abaixo é buraco (alphaTest)
function texturaBarra(N = 512) {
    const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, N, N);
    const dentes = 11, r = mulberry32(77);
    const amp = Array.from({ length: dentes + 1 }, () => 0.35 + r() * 0.65);
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, 0); g.lineTo(N, 0);
    for (let x = N; x >= 0; x -= 2) {
        const p = x / N * dentes, i = Math.floor(p), f = p - i;
        const tri = Math.abs(f - 0.5) * 2;                                   // 0 no meio do dente, 1 no vale (ponta pra baixo no meio)
        const a = lerp(amp[i], amp[Math.min(dentes, i + 1)], f);
        const ruido = (simplex.noise(x * 0.05, 3) * 0.5) * N * 0.018;
        const yCorte = N * (0.97 - 0.15 * a * tri * tri) + ruido;
        g.lineTo(x, yCorte);
    }
    g.closePath(); g.fill();
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; t.colorSpace = THREE.NoColorSpace;
    return t;
}
// Runas da lâmina: traços azuis brilhantes ao longo do aço (vai no mapa emissivo)
function texturaRunas() {
    const W = 128, Hh = 512, c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, Hh);
    g.strokeStyle = '#5fd0ff'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(W / 2, 14); g.lineTo(W / 2, Hh - 70); g.stroke();                      // fio central aceso
    const r = mulberry32(5);
    for (let y = 40; y < Hh - 90; y += 34) {                                                       // runas: pequenos glifos de cada lado do fio
        const lado = r() < 0.5 ? -1 : 1, x = W / 2 + lado * 14;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + lado * 9, y + 8); g.lineTo(x, y + 16); if (r() < 0.5) g.lineTo(x + lado * 12, y + 24); g.stroke();
        if (r() < 0.6) { g.beginPath(); g.moveTo(W / 2 - lado * 14, y + 6); g.lineTo(W / 2 - lado * 6, y + 18); g.stroke(); }
    }
    g.strokeStyle = '#2aa7e6'; g.lineWidth = 2; g.strokeRect(10, 6, W - 20, Hh - 12);            // contorno fino
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

function materiais() {
    const dark = hex(0x0c1519), light = hex(0x354650), moss = hex(0x1b2a2f);
    // Pano: dobras compridas (ruído "ridged" esticado na vertical), fiapos finos, manchas de desgaste
    const pano = construir((u, v) => {
        const dobras = fbmA(u, v, 9, 1.4, 4, 0.5, true), fio = fbmA(u + 0.3, v + 0.2, 40, 40, 2), mancha = fbmA(u + 0.6, v + 0.1, 3, 3, 3);
        const h = dobras * 0.85 + fio * 0.15;
        let col = mix3(dark, light, smooth(0.25, 0.95, h + (mancha - 0.5) * 0.18));
        col = mix3(col, moss, smooth(0.6, 0.9, mancha) * 0.15);
        return { col: mix3(col, [col[0]*1.15, col[1]*1.15, col[2]*1.15], fio * 0.3), rough: 0.86 - fio * 0.1, h };
    }, 256, 2.2);
    // Ataduras: faixas diagonais que se sobrepõem, com bordas e sujeira
    const ataduras = construir((u, v) => {
        const d = (u * 5 + v * 9 + (simplex.noise(u * 3, v * 3) * 0.08)) % 1, faixa = smooth(0, 0.1, d) * (1 - smooth(0.9, 1, d)), suj = fbmA(u, v, 6, 6, 4), fio = fbmA(u, v, 90, 90, 1);
        const col = mix3(hex(0x1c1f22), hex(0x57584f), faixa * (0.45 + suj * 0.5));
        return { col, rough: 0.9, h: faixa * 0.7 + fio * 0.2 };
    }, 256, 4);
    // Couro das botas: grão, rugas e riscos claros de uso
    const couro = construir((u, v) => {
        const grao = fbmA(u, v, 30, 30, 3), ruga = fbmA(u + 0.4, v, 4, 14, 3, 0.5, true), risco = smooth(0.82, 0.95, fbmA(u + 0.2, v + 0.7, 5, 40, 3, 0.5, true));
        const col = mix3(hex(0x0d0b0a), hex(0x3c2e24), smooth(0.2, 0.9, grao * 0.6 + ruga * 0.4));
        return { col: mix3(col, hex(0x6b5b4a), risco * 0.5), rough: 0.55 + grao * 0.2, h: grao * 0.4 + ruga * 0.5 };
    }, 256, 3);
    // Máscara de osso/metal: arranhões, placas e os dois buracos dos olhos (o mapa vai na parte da frente da esfera: u e v em torno de 0,5)
    const osso = construir((u, v) => {
        const fino = fbmA(u, v, 24, 24, 3), manchado = fbmA(u + 0.3, v + 0.5, 4, 4, 3), risc = smooth(0.8, 0.95, fbmA(u + 0.7, v, 16, 3, 3, 0.5, true));
        let col = mix3(hex(0x9aa5ab), hex(0xeaf0f3), smooth(0.2, 0.85, manchado * 0.7 + fino * 0.3));
        col = mix3(col, hex(0x3a4147), risc * 0.5);
        let h = 0.5 + fino * 0.15 - risc * 0.2, emis = 0;
        const tracos = (a) => Math.abs(u - 0.5 - a);
        // Linha central e linhas das placas das bochechas
        const seam = (1 - smooth(0.0, 0.008, tracos(0))) + (1 - smooth(0.0, 0.007, Math.abs((u - 0.5) * 1.1 + (v - 0.55) * 0.9 - 0.0)) ) * 0.0;
        col = mix3(col, hex(0x1b2025), clamp01(seam) * 0.8); h -= clamp01(seam) * 0.3;
        for (const s of [-1, 1]) {                                                                     // olhos: ovais escuros fundos, o da direita maior (como na pintura)
            const ex = 0.5 + s * 0.2, ey = 0.36, rx = s > 0 ? 0.11 : 0.085, ry = s > 0 ? 0.085 : 0.07;
            const d = Math.hypot((u - ex) / rx, (v - ey) / ry);
            const buraco = 1 - smooth(0.82, 1.0, d);
            col = mix3(col, [0.01, 0.015, 0.02], buraco); h -= buraco * 0.55;
            emis = Math.max(emis, (1 - smooth(0, 0.28, d)) * 0.55);                                  // brilho frio no fundo do olho
        }
        return { col, rough: 0.34 + fino * 0.2, metal: 0.45, h, emis, emisCol: [0.45, 0.85, 1] };
    }, 256, 4);
    // Aço da lâmina com as runas acesas
    const runas = texturaRunas();
    const aco = construir((u, v) => { const f = fbmA(u, v, 4, 60, 3); return { col: mix3(hex(0x1c2830), hex(0x587386), f), rough: 0.3 + f * 0.2, metal: 0.8, h: f }; }, 128, 2);

    const std = (tex, extra = {}) => new THREE.MeshStandardMaterial({ map: tex.map, normalMap: tex.normal, roughnessMap: tex.rough, metalnessMap: tex.rough, roughness: 1, metalness: 1, ...extra });
    const M = {
        pano: std(pano, { metalness: 0, metalnessMap: null, side: THREE.DoubleSide }),
        ataduras: std(ataduras, { metalness: 0, metalnessMap: null }),
        couro: std(couro, { metalness: 0, metalnessMap: null }),
        osso: std(osso, { emissiveMap: osso.emis, emissive: 0xffffff, emissiveIntensity: 0.9 }),
        aco: std(aco, { emissiveMap: runas, emissive: 0xffffff, emissiveIntensity: 2.4 }),
        metal: new THREE.MeshStandardMaterial({ color: 0x4a5760, roughness: 0.4, metalness: 0.85 }),
        preto: new THREE.MeshStandardMaterial({ color: 0x020406, roughness: 1, metalness: 0, side: THREE.DoubleSide }),
        luva: new THREE.MeshStandardMaterial({ color: 0x0c1116, roughness: 0.6, metalness: 0.05 })
    };
    const barra = texturaBarra();
    // Cada peça de pano tem uma cópia do material com o seu tom e a barra rasgada
    const panoDe = (cor, comBarra, rep = [1, 1]) => {
        const m = M.pano.clone(); m.color.set(cor);
        for (const k of ['map', 'normalMap', 'roughnessMap']) { m[k] = M.pano[k].clone(); m[k].repeat.set(rep[0], rep[1]); m[k].needsUpdate = true; }
        if (comBarra) { m.alphaMap = barra; m.alphaTest = 0.5; m.transparent = false; }
        return m;
    };
    M.panoDe = panoDe;
    return M;
}

// ======================= CENA =======================
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3; renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b10);
scene.fog = new THREE.FogExp2(0x070b10, 0.03);
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.set(3.4, 2.5, 6.4);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.55, 0); controls.enableDamping = true; controls.minDistance = 2; controls.maxDistance = 14; controls.maxPolarAngle = Math.PI * 0.52;

const hemi = new THREE.HemisphereLight(0x7f9fc8, 0x1a2026, 1.1); scene.add(hemi);
const moon = new THREE.DirectionalLight(0xb4cfff, 1.6);
moon.position.set(-3.5, 6, 3.5); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { left: -4, right: 4, top: 5, bottom: -2, near: 1, far: 20 }); moon.shadow.bias = -0.0004; moon.shadow.normalBias = 0.03;
scene.add(moon);
const torch = new THREE.PointLight(0xff8a3c, 4, 10, 1.5); torch.position.set(2.1, 1.0, 2.2); scene.add(torch);
const rim = new THREE.DirectionalLight(0x4aa8ff, 2.2); rim.position.set(2.5, 3.5, -4.5); scene.add(rim);
const swordLight = new THREE.PointLight(0x38bdf8, 1.2, 3.2, 2); scene.add(swordLight);               // a espada ilumina a mão e o corpo
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.22;
const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ color: 0x0b1015, roughness: 0.95 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

// ======================= GEOMETRIA / MONTAGEM =======================
const M = materiais();
const root = new THREE.Group(); scene.add(root);
const P = {};                                    // peças que se mexem
const shadowOn = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
const mesh = (g, m) => shadowOn(new THREE.Mesh(g, m));
// Membro que pende do pivô (a geometria desce em -y a partir da origem)
function membro(raioTopo, raioBase, comp, mat, seg = 14) {
    const g = new THREE.CylinderGeometry(raioTopo, raioBase, comp, seg, 6); g.translate(0, -comp / 2, 0);
    return mesh(g, mat);
}
const ruido3 = (x, y, z) => simplex.noise3d(x, y, z);

// --- Capuz: esfera aberta na frente, com o pico para trás e dobras compridas ---
function capuz() {
    const abertura = 0.6;
    const g = new THREE.SphereGeometry(0.33, 56, 40, Math.PI / 2 + abertura, TAU - abertura * 2, 0, Math.PI * 0.86);
    const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const d = v.clone().normalize(), ang = Math.atan2(d.z, d.x);
        const dobra = 1 + 0.045 * (1 - Math.abs(simplex.noise(ang * 3.2, d.y * 1.6))) + 0.015 * simplex.noise3d(d.x * 5, d.y * 5, d.z * 5);
        v.multiplyScalar(dobra);
        // Pico: o alto das costas estica para trás e para baixo (a ponta do capuz caída)
        const atras = clamp01(-d.z * 1.2 + 0.1) * smooth(0.0, 0.95, d.y);
        v.z -= atras * 0.2; v.y += atras * 0.05 - smooth(0.55, 1, -d.y) * 0.0;
        v.y *= 1.12; v.z += d.z > 0 ? 0 : -0.02;
        // Frente: a borda do capuz se projeta um pouco, formando a "boca" sombreada
        if (d.z > 0.35 && Math.abs(d.x) < 0.9) v.z += 0.025 * smooth(0.35, 0.8, d.z);
        p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return mesh(g, M.panoDe(0xc4cfd4, false, [1.5, 1.2]));
}
// --- Máscara: pedaço da frente de uma esfera, afinado para baixo (queixo), crista no meio ---
function mascara() {
    const g = new THREE.SphereGeometry(0.255, 40, 30, Math.PI / 2 - 0.8, 1.6, Math.PI * 0.2, Math.PI * 0.56);
    const p = g.attributes.position; let yMin = 9, yMax = -9;
    for (let i = 0; i < p.count; i++) { yMin = Math.min(yMin, p.getY(i)); yMax = Math.max(yMax, p.getY(i)); }
    for (let i = 0; i < p.count; i++) {
        let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const t = (yMax - y) / (yMax - yMin);                              // 0 testa, 1 queixo
        x *= 1 - 0.5 * t * t; z *= 1 + 0.1 * t;
        z += 0.022 * Math.exp(-Math.pow(x / 0.028, 2));                    // crista do nariz
        y -= 0.05 * t * t;                                                 // queixo alongado
        p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return mesh(g, M.osso);
}
// --- Manto sobre os ombros e capa: tecido com barra rasgada ---
function manto() {
    const g = new THREE.CylinderGeometry(0.4, 0.6, 0.5, 56, 14, true), p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const ang = Math.atan2(v.z, v.x), baixo = clamp01((0.33 - v.y) / 0.66);
        const dobra = 1 + (0.05 + baixo * 0.07) * (1 - Math.abs(simplex.noise(ang * 4, baixo * 2))) - 0.02;
        v.x *= dobra; v.z *= dobra * 0.8;
        v.y -= Math.max(0, Math.sin(ang * 1 + Math.PI / 2)) * 0.0;
        p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return mesh(g, M.panoDe(0xcdd7dc, true, [2, 1]));
}
const CAPA = { nu: 26, nv: 38, largura: 2.6, altura: 2.05 };
function capa() {
    const g = new THREE.PlaneGeometry(1, 1, CAPA.nu, CAPA.nv);
    g.userData.base = g.attributes.position.array.slice();
    const m = mesh(g, M.panoDe(0xb4c2c9, true, [1.2, 1.4]));
    m.frustumCulled = false;
    return m;
}
// A capa: pano preso nos ombros que ondula embaixo. `ph` (0..1) é a fase do ciclo; só harmônicos inteiros, então o ciclo fecha sem emenda
function animarCapa(ph, modo, forca) {
    const g = P.capa.geometry, pos = g.attributes.position, base = g.userData.base;
    const arrasto = modo === 'andar' ? 0.34 * forca : modo === 'golpe' ? 0.12 : 0.02;
    const amp = (modo === 'andar' ? 0.09 : modo === 'golpe' ? 0.07 : 0.035) * forca;
    for (let j = 0; j <= CAPA.nv; j++) for (let i = 0; i <= CAPA.nu; i++) {
        const idx = j * (CAPA.nu + 1) + i, u = i / CAPA.nu, v = j / CAPA.nv;
        const ang = (u - 0.5) * CAPA.largura;
        const R = 0.27 + 0.26 * Math.pow(v, 1.1);
        const dobra = 1 + (0.05 + 0.08 * v) * (1 - Math.abs(simplex.noise(u * 9.5, v * 1.2)));                 // dobras verticais
        let x = Math.sin(ang) * R * dobra, z = -Math.cos(ang) * R * dobra, y = -v * CAPA.altura;
        const k = Math.pow(v, 1.4);                                                                               // preso em cima, solto embaixo
        const w1 = Math.sin(TAU * (ph - v * 1.15 + u * 0.7)), w2 = Math.sin(TAU * (2 * ph - v * 2.0 - u * 1.3));
        z -= k * (arrasto + amp * (w1 + 0.5 * w2)) * (1 + 0.4 * v);
        x += k * amp * 0.8 * Math.sin(TAU * (ph - v * 1.6 + u * 1.1));
        y += k * arrasto * 0.12 * Math.sin(TAU * (ph * 2 - v));
        pos.setXYZ(idx, x, y, z);
    }
    pos.needsUpdate = true; g.computeVertexNormals();
}

function montar() {
    // Pelve (origem do corpo, a 1,5 do chão): pernas, torso
    P.pelve = new THREE.Group(); P.pelve.position.y = 1.5; root.add(P.pelve);
    // Pernas: coxa de calça (pano), joelho, canela e bota de couro alta, pé
    for (const lado of [-1, 1]) {
        const coxa = new THREE.Group(); coxa.position.set(lado * 0.15, 0, 0); P.pelve.add(coxa);
        coxa.add(membro(0.15, 0.115, 0.76, M.panoDe(0xa4b6c0, false, [1.5, 1.5])));
        const joelho = new THREE.Group(); joelho.position.y = -0.74; coxa.add(joelho);
        joelho.add(mesh(new THREE.SphereGeometry(0.12, 16, 12), M.panoDe(0x55646d, false)));
        const bota = membro(0.125, 0.105, 0.74, M.couro); bota.scale.set(1, 1, 1.06); joelho.add(bota);
        const cano = mesh(new THREE.CylinderGeometry(0.135, 0.125, 0.14, 16, 1), M.couro); cano.position.y = -0.03; joelho.add(cano);          // topo da bota, dobrado
        for (const y of [-0.25, -0.43]) { const cinta = mesh(new THREE.TorusGeometry(0.118, 0.016, 8, 20), M.metal); cinta.rotation.x = Math.PI / 2; cinta.position.y = y; joelho.add(cinta); }
        const pe = new THREE.Group(); pe.position.set(0, -0.74, 0); joelho.add(pe);
        const peg = new THREE.CapsuleGeometry(0.1, 0.22, 6, 14); peg.rotateX(Math.PI / 2); peg.translate(0, 0.04, 0.1);
        pe.add(mesh(peg, M.couro));
        P[lado < 0 ? 'coxaL' : 'coxaR'] = coxa; P[lado < 0 ? 'joelhoL' : 'joelhoR'] = joelho;
    }
    // Quadril/saia curta
    const saia = mesh(new THREE.CylinderGeometry(0.27, 0.34, 0.3, 28, 4, true), M.panoDe(0xa0b2bc, true, [2, 1])); saia.position.y = -0.1; P.pelve.add(saia);
    // Torso: túnica afinando para a cintura, faixa, correias
    P.torso = new THREE.Group(); P.pelve.add(P.torso);
    const tg = new THREE.CylinderGeometry(0.31, 0.25, 1.0, 28, 8); tg.translate(0, 0.5, 0);
    const tp = tg.attributes.position, tv = new THREE.Vector3();
    for (let i = 0; i < tp.count; i++) { tv.fromBufferAttribute(tp, i); tv.z *= 0.68; tv.x *= 1 + 0.18 * smooth(0.6, 1, tv.y); tp.setXYZ(i, tv.x, tv.y, tv.z); }
    tg.computeVertexNormals();
    P.torso.add(mesh(tg, M.panoDe(0xb6c4cb, false, [1.5, 1.5])));
    const faixa = mesh(new THREE.TorusGeometry(0.265, 0.055, 10, 32), M.panoDe(0x3b4d56, false)); faixa.rotation.x = Math.PI / 2; faixa.scale.set(1, 0.68, 1); faixa.position.y = 0.08; P.torso.add(faixa);
    const ponta = mesh(new THREE.BoxGeometry(0.1, 0.34, 0.02), M.panoDe(0x3b4d56, false)); ponta.position.set(0.14, -0.1, 0.19); ponta.rotation.z = 0.12; P.torso.add(ponta);
    const fivela = mesh(new THREE.BoxGeometry(0.07, 0.07, 0.03), M.metal); fivela.position.set(0, 0.08, 0.205); P.torso.add(fivela);
    const correia = mesh(new THREE.BoxGeometry(0.07, 0.95, 0.018), M.couro); correia.position.set(0, 0.55, 0.17); correia.rotation.z = -0.5; correia.scale.set(1, 1, 1); P.torso.add(correia);
    // Pescoço, cabeça (crânio escuro sob o capuz), capuz e máscara
    P.cabeca = new THREE.Group(); P.cabeca.position.y = 1.02; P.torso.add(P.cabeca);
    const pescoco = mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.2, 14), M.luva); pescoco.position.y = -0.05; P.cabeca.add(pescoco);
    const craneo = mesh(new THREE.SphereGeometry(0.235, 24, 18), M.preto); craneo.position.set(0, 0.24, 0.0); craneo.scale.set(0.95, 1.1, 1.05); P.cabeca.add(craneo);
    P.capuz = capuz(); P.capuz.position.set(0, 0.25, -0.02); P.cabeca.add(P.capuz);
    P.mascara = mascara(); P.mascara.position.set(0, 0.26, 0.055); P.cabeca.add(P.mascara);
    // Manto sobre os ombros
    P.manto = manto(); P.manto.position.y = 0.8; P.torso.add(P.manto);
    // Capa pendurada nos ombros (a malha é recalculada a cada quadro em animarCapa)
    P.capa = capa(); P.capa.position.set(0, 0.98, 0); P.torso.add(P.capa);
    // Braços: ombro (manto cobre), braço de manga, cotovelo, antebraço enfaixado, mão com luva
    for (const lado of [-1, 1]) {
        const ombro = new THREE.Group(); ombro.position.set(lado * 0.37, 0.9, 0); P.torso.add(ombro);
        ombro.add(mesh(new THREE.SphereGeometry(0.09, 16, 12), M.panoDe(0x5e717b, false)));
        ombro.add(membro(0.105, 0.085, 0.5, M.panoDe(0xa4b6c0, false, [1.5, 1.5])));
        const cotovelo = new THREE.Group(); cotovelo.position.y = -0.5; ombro.add(cotovelo);
        cotovelo.add(mesh(new THREE.SphereGeometry(0.09, 14, 10), M.panoDe(0x55646d, false)));
        cotovelo.add(membro(0.09, 0.07, 0.5, M.ataduras));
        const mao = new THREE.Group(); mao.position.y = -0.52; cotovelo.add(mao);
        mao.add(mesh(new THREE.SphereGeometry(0.075, 14, 10), M.luva));
        P[lado < 0 ? 'ombroL' : 'ombroR'] = ombro; P[lado < 0 ? 'cotoveloL' : 'cotoveloR'] = cotovelo; P[lado < 0 ? 'maoL' : 'maoR'] = mao;
    }
    // Espada na mão direita: cabo, guarda, lâmina de aço com runas, pomo
    const espada = new THREE.Group(); P.espada = espada; P.maoR.add(espada);
    const cabo = mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.26, 10), M.couro); cabo.position.y = 0.02; espada.add(cabo);
    const guarda = mesh(new THREE.BoxGeometry(0.34, 0.045, 0.07), M.metal); guarda.position.y = 0.17; espada.add(guarda);
    const pomo = mesh(new THREE.SphereGeometry(0.045, 12, 10), M.metal); pomo.position.y = -0.12; espada.add(pomo);
    const L = 1.3, W = 0.12, sh = new THREE.Shape();
    sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, L * 0.9); sh.lineTo(0, L); sh.lineTo(-W / 2, L * 0.9); sh.lineTo(-W / 2, 0);
    const lg = new THREE.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 1 });
    lg.translate(0, 0, -0.011);
    const uv = lg.attributes.uv; const pp = lg.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pp.getX(i) + W / 2) / W, pp.getY(i) / L);                  // runas esticadas na lâmina toda
    const lamina = mesh(lg, M.aco); lamina.position.y = 0.19; espada.add(lamina);
    P.lamina = lamina;
    montarEstado();
}
function montarEstado() { P.espada.rotation.set(1.62, 0, 0); }
montar();

// ======================= POSES =======================
const CICLO = { parado: 3.2, andar: 0.8, golpe: 0.8 };
const S = (a) => Math.sin(TAU * a);
function pose(modo, ph, forca = 1) {
    const C = P;
    // Zera (cada pose define tudo o que usa)
    C.pelve.position.set(0, 1.5, 0); C.pelve.rotation.set(0, 0, 0); C.torso.rotation.set(0, 0, 0); C.torso.scale.set(1, 1, 1);
    C.cabeca.rotation.set(0, 0, 0); root.rotation.x = 0; root.position.y = 0;
    for (const s of ['L', 'R']) { C['coxa' + s].rotation.set(0, 0, 0); C['joelho' + s].rotation.set(0, 0, 0); C['ombro' + s].rotation.set(0, 0, 0); C['cotovelo' + s].rotation.set(0, 0, 0); }
    C.ombroL.rotation.z = 0.08; C.ombroR.rotation.z = -0.08;
    C.espada.rotation.set(1.62, 0, 0);
    if (modo === 'parado') {
        const r = S(ph);
        C.torso.scale.set(1 - r * 0.004, 1 + r * 0.012, 1 - r * 0.004);
        C.pelve.position.y = 1.5 - 0.004 * r;
        C.cabeca.rotation.set(0.05 + S(ph + 0.2) * 0.012, S(ph * 2) * 0.05, S(ph) * 0.012);
        C.ombroR.rotation.x = -0.18 + S(ph + 0.15) * 0.015; C.cotoveloR.rotation.x = -0.35;
        C.ombroL.rotation.x = 0.05 + S(ph + 0.4) * 0.02; C.cotoveloL.rotation.x = -0.28;
        C.coxaL.rotation.x = -0.02; C.coxaR.rotation.x = 0.03; C.joelhoL.rotation.x = 0.04; C.joelhoR.rotation.x = 0.02;
    } else if (modo === 'andar') {
        const c = S(ph), c2 = S(ph + 0.25), d = Math.cos(TAU * ph);
        C.coxaL.rotation.x = c * 0.78; C.coxaR.rotation.x = -c * 0.78;
        C.joelhoL.rotation.x = Math.max(0, -S(ph + 0.25)) * 1.2 + 0.1; C.joelhoR.rotation.x = Math.max(0, S(ph + 0.25)) * 1.2 + 0.1;
        C.pelve.position.y = 1.5 - 0.06 + Math.abs(d) * 0.07; C.pelve.rotation.y = c * 0.1;
        C.torso.rotation.set(0.16, -c * 0.16, 0);
        C.cabeca.rotation.set(-0.08, c * 0.08, 0);
        C.ombroL.rotation.x = c * 0.7; C.cotoveloL.rotation.x = -0.8;
        C.ombroR.rotation.x = -0.35 - c * 0.35; C.cotoveloR.rotation.x = -0.9;
        C.espada.rotation.set(1.4, 0, 0);
        root.rotation.x = 0.0;
    } else {
        // Golpe: prepara (espada para trás e acima), corta em arco largo, recupera
        const a = ph < 0.35 ? smooth(0, 0.35, ph) : 1 - smooth(0.62, 1, ph);          // 0..1: o quanto o braço está "armado"
        const corte = smooth(0.35, 0.58, ph) * (1 - smooth(0.58, 0.8, ph));            // pico do corte
        C.torso.rotation.set(0.1 * a, lerp(0.6, -0.9, smooth(0.35, 0.6, ph)) * Math.min(1, a + corte) + (1 - Math.min(1, a + corte)) * 0, 0);
        C.pelve.rotation.y = -C.torso.rotation.y * 0.35;
        C.ombroR.rotation.x = lerp(-0.5, -2.7, a) + corte * 1.7; C.ombroR.rotation.z = lerp(-0.08, -0.6, a) + corte * 0.7;
        C.cotoveloR.rotation.x = lerp(-0.6, -1.0, a);
        C.ombroL.rotation.x = 0.4 * a; C.cotoveloL.rotation.x = -0.6;
        C.coxaL.rotation.x = -0.35 * corte; C.coxaR.rotation.x = 0.4 * corte; C.joelhoL.rotation.x = 0.35 * a; C.joelhoR.rotation.x = 0.1;
        C.cabeca.rotation.y = -C.torso.rotation.y * 0.5;
        C.espada.rotation.set(lerp(1.62, 2.7, a) - corte * 2.2, 0, 0);
    }
    animarCapa(ph, modo, forca);
    // A espada ilumina: a luz acompanha a lâmina e pulsa
    P.lamina.getWorldPosition(wpos); swordLight.position.copy(wpos).add(new THREE.Vector3(0, 0.05, 0.15));
}
const wpos = new THREE.Vector3();

// ======================= 7 · PÓS-PROCESSAMENTO =======================
const U = { uTime: { value: 0 } };
const GradeShader = {
    uniforms: { tDiffuse: { value: null }, uTime: U.uTime, uOn: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uTime; uniform float uOn;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){ vec4 c = texture2D(tDiffuse, vUv);
            if (uOn > 0.5) { float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
                c.rgb *= mix(vec3(0.84, 0.96, 1.08), vec3(1.08, 1.0, 0.92), smoothstep(0.1, 0.8, l));
                c.rgb = mix(vec3(l), c.rgb, 1.1); c.rgb = (c.rgb - 0.5) * 1.05 + 0.5;
                vec2 q = vUv - 0.5; c.rgb *= mix(0.6, 1.0, 1.0 - smoothstep(0.25, 0.95, dot(q, q) * 1.9));
                c.rgb += (hash(vUv * 1400.0 + uTime) - 0.5) * 0.03; }
            gl_FragColor = c; }`
};
let composer; const passes = {};
function compositor(w, h) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    passes.ao = new GTAOPass(scene, camera, w, h);
    passes.ao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.3, thickness: 1.0, scale: 1.0, samples: 12, distanceFallOff: 1, screenSpaceRadius: false });
    passes.ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, radiusExponent: 1, rings: 2, samples: 12 });
    composer.addPass(passes.ao);
    passes.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.55, 0.6, 0.85);
    composer.addPass(passes.bloom);
    composer.addPass(new OutputPass());
    passes.grade = new ShaderPass(GradeShader); composer.addPass(passes.grade);
    passes.fxaa = new ShaderPass(FXAAShader); composer.addPass(passes.fxaa);
}

// ======================= PÁGINA =======================
const estado = { modo: 'parado', t: 0 };
function ligar() {
    document.querySelectorAll('input[name="modo"]').forEach(r => r.addEventListener('change', () => { estado.modo = r.value; }));
    $('moon').addEventListener('input', () => { moon.intensity = +$('moon').value; });
    $('rim').addEventListener('input', () => { rim.intensity = +$('rim').value; });
    $('ao').addEventListener('change', () => { passes.ao.enabled = $('ao').checked; });
    $('bloom').addEventListener('change', () => { passes.bloom.enabled = $('bloom').checked; });
    $('grade').addEventListener('change', () => { passes.grade.uniforms.uOn.value = $('grade').checked ? 1 : 0; });
    $('turn').addEventListener('change', () => { controls.autoRotate = $('turn').checked; });
    $('shot').addEventListener('click', () => { composer.render(); const a = document.createElement('a'); a.download = 'demon-hunter-2.png'; a.href = renderer.domElement.toDataURL('image/png'); a.click(); });
}
function resize() {
    const w = stage.clientWidth, h = stage.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr); renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (composer) { composer.setPixelRatio(dpr); composer.setSize(w, h); passes.fxaa.material.uniforms.resolution.value.set(1 / (w * dpr), 1 / (h * dpr)); }
}
let ultimo = performance.now(), quadros = 0, tFps = 0;
function loop(now) {
    const dt = Math.min(0.05, (now - ultimo) / 1000); ultimo = now;
    estado.t += dt * +$('speed').value;
    U.uTime.value = now / 1000;
    const ciclo = CICLO[estado.modo], ph = (estado.t % ciclo) / ciclo;
    pose(estado.modo, ph);
    P.lamina.material.emissiveIntensity = 2.4 * (0.85 + 0.15 * Math.sin(now / 420) + 0.05 * Math.sin(now / 97));
    swordLight.intensity = 1.2 * (0.9 + 0.1 * Math.sin(now / 420));
    torch.intensity = +$('torch').value * (1 + 0.07 * (Math.sin(now / 90) * 0.5 + Math.sin(now / 57 + 1.7) * 0.3));
    controls.update();
    composer.render();
    quadros++; tFps += dt; if (tFps > 0.5) { $('fps').textContent = `${Math.round(quadros / tFps)} quadros/s`; quadros = 0; tFps = 0; }
    requestAnimationFrame(loop);
}
function iniciar() {
    if (BAKE) { bake(); $('loading').remove(); return; }
    compositor(stage.clientWidth || 256, stage.clientHeight || 256);
    ligar(); resize(); window.addEventListener('resize', resize);
    window.__lab = { scene, camera, renderer, P, pose, estado, composer };
    $('loading').remove();
    requestAnimationFrame(loop);
}

// ======================= SPRITES (?bake=1) =======================
// Só o herói, fundo transparente, câmera de três quartos como a do jogo. window.__bake(parado, andar, golpe, dirs, tam) devolve o atlas:
// uma linha por direção (yaws igualmente espaçados), colunas = quadros de parado, depois andar, depois golpe.
function bake() {
    ['panel', 'home'].forEach(id => $(id).style.display = 'none');
    scene.fog = null; scene.background = null; floor.visible = false; renderer.setClearColor(0x000000, 0);
    moon.intensity = 1.6; torch.intensity = 1.4; hemi.intensity = 0.7;
    const ELEV = 40 * Math.PI / 180, VIEW = 3.9, alvo = new THREE.Vector3(0, 1.5, 0);
    const cam = new THREE.OrthographicCamera(-VIEW / 2, VIEW / 2, VIEW / 2, -VIEW / 2, 0.1, 40);
    cam.position.set(0, alvo.y + Math.sin(ELEV) * 14, Math.cos(ELEV) * 14); cam.lookAt(alvo); cam.updateMatrixWorld();
    window.__ready = () => true;
    const render = (tam) => { renderer.setPixelRatio(1); renderer.setSize(tam, tam); renderer.render(scene, cam); };
    window.__bake = (parado, andar, golpe, dirs, tam) => {
        const quadros = parado + andar + golpe, cv = document.createElement('canvas'); cv.width = tam * quadros; cv.height = tam * dirs;
        const c = cv.getContext('2d'); c.imageSmoothingQuality = 'high';
        const tmp = document.createElement('canvas'); tmp.width = tmp.height = tam; const tc = tmp.getContext('2d');
        for (let d = 0; d < dirs; d++) {
            root.rotation.order = 'YXZ'; root.rotation.y = -(d / dirs) * TAU;
            for (let f = 0; f < quadros; f++) {
                const modo = f < parado ? 'parado' : f < parado + andar ? 'andar' : 'golpe';
                const n = modo === 'parado' ? parado : modo === 'andar' ? andar : golpe, i = modo === 'parado' ? f : modo === 'andar' ? f - parado : f - parado - andar;
                pose(modo, i / n); render(tam * 2);
                tc.clearRect(0, 0, tam, tam); tc.drawImage(renderer.domElement, 0, 0, tam, tam);
                tc.globalCompositeOperation = 'lighter'; tc.filter = `blur(${tam / 45}px) brightness(1.1) contrast(2)`; tc.globalAlpha = 0.35;     // bloom barato da espada
                tc.drawImage(tmp, 0, 0); tc.filter = 'none'; tc.globalAlpha = 1; tc.globalCompositeOperation = 'source-over';
                c.drawImage(tmp, f * tam, d * tam);
            }
        }
        return cv.toDataURL('image/webp', 0.88);
    };
    window.__foto = (modo = 'parado', fase = 0, yaw = 30, tam = 640) => {
        root.rotation.order = 'YXZ'; root.rotation.y = yaw * Math.PI / 180; pose(modo, fase); render(tam);
        return renderer.domElement.toDataURL('image/png');
    };
}
requestAnimationFrame(() => setTimeout(() => { try { iniciar(); } catch (e) { console.error(e); $('loading').textContent = 'Erro: ' + e.message + '\n(veja o console, F12)'; } }, 30));
