// --- LABORATÓRIO: Treant (a árvore andante), numa floresta de NOITE ---
// Mesma metodologia do golem (monstro_foto.js), com outro monstro e um ambiente noturno escuro para combinar com o jogo. Tudo por código:
// nenhuma imagem, nenhum modelo 3D. Fora dos jogos; usa o Three.js copiado em vendor/three.
//
// Mapa das 7 técnicas neste arquivo:
//   1 PBR + ruído ......... construirTexturas (albedo, rugosidade, normal, altura, emissivo) e os materiais
//   2 Triplanar ........... aplicarTriplanar (shader próprio; musgo por inclinação)
//   3 GI e AO ............. GTAOPass (AO), luzes() (GI aproximado: hemisfério, ambiente e rebote do núcleo)
//   4 Instancing + SSS .... poisson() e espalhar() (InstancedMesh); SSS falso no shader (luz de contraluz)
//   5 Gaussian Splatting .. fora (precisa de captura real); fundo() imita profundidade com silhuetas
//   6 Atmosfera ........... atmosfera() (névoa, céu, feixes de luz, poeira)
//   7 Pós ................. compositor() (ACES, bloom, profundidade de campo, grão, vinheta, FXAA)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');

// Aleatório com semente: o mesmo monstro toda vez
function mulberry32(a) {
    return () => {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const rng = mulberry32(20261118);
const simplex = new SimplexNoise({ random: rng });
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// ======================= 1 · TEXTURAS PROCEDURAIS (PBR) =======================
// Ruído Simplex tileável (4D numa "rosca": u e v dão a volta) e Worley/Voronoi para rachaduras e pedras.
function fbm(u, v, freq, oct, gain = 0.5, ridged = false) {
    const cu = Math.cos(2 * Math.PI * u), su = Math.sin(2 * Math.PI * u), cv = Math.cos(2 * Math.PI * v), sv = Math.sin(2 * Math.PI * v);
    let r = freq / (2 * Math.PI), a = 1, s = 0, n = 0;
    for (let o = 0; o < oct; o++) {
        let val = simplex.noise4d(cu * r, su * r, cv * r, sv * r);
        val = ridged ? 1 - Math.abs(val) * 1.15 : val * 0.5 + 0.5;
        s += val * a; n += a; a *= gain; r *= 2;
    }
    return s / n;
}
// Como fbm, mas com frequências diferentes em u e v (fu, fv inteiros): dá riscos compridos, como os sulcos de uma casca
function fbmA(u, v, fu, fv, oct, gain = 0.5, ridged = false) {
    const cu = Math.cos(2 * Math.PI * u), su = Math.sin(2 * Math.PI * u), cv = Math.cos(2 * Math.PI * v), sv = Math.sin(2 * Math.PI * v);
    let ru = fu / (2 * Math.PI), rv = fv / (2 * Math.PI), a = 1, s = 0, n = 0;
    for (let o = 0; o < oct; o++) {
        let val = simplex.noise4d(cu * ru, su * ru, cv * rv, sv * rv);
        val = ridged ? 1 - Math.abs(val) * 1.15 : val * 0.5 + 0.5;
        s += val * a; n += a; a *= gain; ru *= 2; rv *= 1.7;
    }
    return s / n;
}
function worleyGrid(n) {
    const pts = new Float32Array(n * n * 2);
    for (let i = 0; i < pts.length; i++) pts[i] = rng();
    return (u, v) => {
        const x = u * n, y = v * n, ix = Math.floor(x), iy = Math.floor(y);
        let f1 = 9, f2 = 9, id = 0;
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
            const cx = ix + i, cy = iy + j, wx = ((cx % n) + n) % n, wy = ((cy % n) + n) % n, k = (wy * n + wx) * 2;
            const d = Math.hypot(cx + pts[k] - x, cy + pts[k + 1] - y);
            if (d < f1) { f2 = f1; f1 = d; id = wy * n + wx; } else if (d < f2) f2 = d;
        }
        return [f1, f2, id];
    };
}
const hex = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

function construirTexturas(tipo, N = 512) {
    const albedo = new Uint8Array(N * N * 4), normal = new Uint8Array(N * N * 4), emis = new Uint8Array(N * N * 4);
    const H = new Float32Array(N * N);
    const cracks = worleyGrid(5), stones = worleyGrid(15), cellRnd = new Float32Array(15 * 15).map(() => rng());
    const barkDark = hex(0x2d1b0e), barkLight = hex(0x87623b), barkAsh = hex(0x5c5d49), barkDeep = hex(0x120a05);
    const rockDark = hex(0x24201c), rockLight = hex(0x6d6358), rust = hex(0x5c3a26), char = hex(0x0b0807);
    const soilDark = hex(0x241a12), soilLight = hex(0x5a4733), stoneA = hex(0x6b655d), stoneB = hex(0x8a7f6e);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const u = x / N, v = y / N, i = y * N + x, k = i * 4;
        let col, rough, h, lava = 0, cavity = 1;
        if (tipo === 'casca') {
            // Casca de madeira: sulcos verticais compridos (a textura é projetada com o v para cima), cristas escuras e liquens
            const g1 = fbmA(u, v, 12, 2, 5, 0.55, true), g2 = fbmA(u + 0.3, v + 0.1, 26, 4, 3, 0.5), fine = fbm(u + 0.2, v + 0.6, 24, 3), vari = fbm(u + 0.5, v + 0.3, 2, 3), vari2 = fbm(u + 0.1, v + 0.9, 5, 3);
            h = g1 * 0.7 + g2 * 0.2 + fine * 0.1;
            const groove = 1 - smooth(0.25, 0.62, g1);
            col = mix3(barkDark, barkLight, smooth(0.2, 0.9, h + (vari - 0.5) * 0.3));
            col = mix3(col, barkAsh, smooth(0.6, 0.9, vari2) * 0.35);
            col = mix3(col, barkDeep, groove * 0.75);
            rough = 0.88 + (vari - 0.5) * 0.1;
            lava = 0;
            cavity = 1 - groove * 0.55;
        } else if (tipo === 'pedra') {
            const strata = fbm(u, v, 3, 5, 0.52, true), fine = fbm(u + 0.37, v + 0.11, 22, 3), vari = fbm(u + 0.6, v + 0.2, 2, 3), vari2 = fbm(u + 0.15, v + 0.8, 5, 3);
            const [f1, f2] = cracks(u, v);
            const edge = f2 - f1 + (fine - 0.5) * 0.12;
            const crack = 1 - smooth(0.0, 0.06, edge);
            h = strata * 0.72 + fine * 0.28 - crack * 0.45;
            col = mix3(rockDark, rockLight, smooth(0.15, 0.85, h + (vari - 0.5) * 0.3));
            col = mix3(col, rust, smooth(0.55, 0.85, vari2) * 0.65);
            col = mix3(col, char, crack * 0.9);
            rough = 0.58 + (vari - 0.5) * 0.35 + (1 - h) * 0.12;
            lava = crack * smooth(0.5, 0.68, vari) * (0.7 + 0.3 * fine);
            cavity = 1 - crack * 0.6 - (1 - h) * 0.25;
        } else {
            const soil = fbm(u, v, 5, 5, 0.55), fine = fbm(u + 0.3, v + 0.5, 28, 3), vari = fbm(u + 0.7, v + 0.1, 3, 3);
            const [f1, , id] = stones(u, v);
            const stone = 1 - smooth(0.2, 0.34, f1), cr = cellRnd[id % cellRnd.length];
            h = soil * 0.45 + fine * 0.2 + stone * (0.55 + cr * 0.2);
            col = mix3(soilDark, soilLight, smooth(0.2, 0.8, soil + (vari - 0.5) * 0.4));
            col = mix3(col, mix3(stoneA, stoneB, cr), stone * 0.92);
            rough = lerp(0.92, 0.7, stone) - (vari - 0.5) * 0.1;
            cavity = 1 - (1 - h) * 0.4;
        }
        H[i] = h;
        albedo[k] = col[0] * 255; albedo[k + 1] = col[1] * 255; albedo[k + 2] = col[2] * 255; albedo[k + 3] = clamp01(rough) * 255;
        emis[k] = clamp01(lava) * 255; emis[k + 1] = clamp01(cavity) * 255; emis[k + 2] = 0; emis[k + 3] = 255;
    }
    const strength = tipo === 'casca' ? 7 : tipo === 'pedra' ? 5 : 4;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const l = H[y * N + ((x + N - 1) % N)], r = H[y * N + ((x + 1) % N)], t = H[((y + N - 1) % N) * N + x], b = H[((y + 1) % N) * N + x];
        let nx = (l - r) * strength, ny = (t - b) * strength, nz = 1;
        const len = Math.hypot(nx, ny, nz); nx /= len; ny /= len; nz /= len;
        const k = (y * N + x) * 4;
        normal[k] = (nx * 0.5 + 0.5) * 255; normal[k + 1] = (ny * 0.5 + 0.5) * 255; normal[k + 2] = (nz * 0.5 + 0.5) * 255; normal[k + 3] = H[y * N + x] * 255;
    }
    const mk = (data, srgb) => {
        const t = new THREE.DataTexture(data, N, N, THREE.RGBAFormat, THREE.UnsignedByteType);
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
        t.generateMipmaps = true; t.anisotropy = 8; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.needsUpdate = true;
        return t;
    };
    return { albedo: mk(albedo, true), normal: mk(normal, false), emis: mk(emis, false) };
}

// ======================= 2 · TRIPLANAR + MUSGO (shader) =======================
// Uniformes compartilhados: cada caixa do painel mexe aqui, em todos os materiais de uma vez.
const U = {
    uTime: { value: 0 }, uSunView: { value: new THREE.Vector3(0, 1, 0) },
    uPBR: { value: 1 }, uTri: { value: 1 }, uMoss: { value: 1 }, uSSS: { value: 1 }, uLava: { value: 1 }
};
const MOSS = 'vec3(0.075, 0.17, 0.04)', LAVA = 'vec3(1.0, 0.34, 0.05)';

function aplicarTriplanar(material, tex, { mossMode = 0, lava = true, bark = false } = {}) {
    material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, U, { tAlbedo: { value: tex.albedo }, tNormal: { value: tex.normal }, tEmis: { value: tex.emis }, uMossMode: { value: mossMode }, uHasLava: { value: lava ? 1 : 0 }, uBark: { value: bark ? 1 : 0 } });
        shader.vertexShader = shader.vertexShader
            .replace('#include <common>', `#include <common>
                attribute float aTexScale;
                varying vec3 vObjPos; varying vec3 vObjN; varying vec3 vWorldN; varying float vTexScale; varying vec3 vToView0; varying vec3 vToView1; varying vec3 vToView2;`)
            .replace('#include <begin_vertex>', `#include <begin_vertex>
                vObjPos = position; vObjN = normal; vTexScale = aTexScale;
                vWorldN = normalize(mat3(modelMatrix) * normal);
                mat3 mv3 = mat3(modelViewMatrix); vToView0 = mv3[0]; vToView1 = mv3[1]; vToView2 = mv3[2];`);
        shader.fragmentShader = shader.fragmentShader
            .replace('#include <common>', `#include <common>
                uniform sampler2D tAlbedo; uniform sampler2D tNormal; uniform sampler2D tEmis;
                uniform float uTime; uniform vec3 uSunView; uniform float uPBR; uniform float uTri; uniform float uMoss; uniform float uSSS; uniform float uLava; uniform float uMossMode; uniform float uHasLava; uniform float uBark;
                varying vec3 vObjPos; varying vec3 vObjN; varying vec3 vWorldN; varying float vTexScale; varying vec3 vToView0; varying vec3 vToView1; varying vec3 vToView2;
                vec4 triSample(sampler2D t, vec3 p, vec3 w) { return texture2D(t, mix(p.yz, p.zy, uBark)) * w.x + texture2D(t, mix(p.zx, p.xz, uBark)) * w.y + texture2D(t, p.xy) * w.z; }`)
            .replace('#include <map_fragment>', `
                vec3 tw = pow(abs(vObjN), vec3(5.0)); tw /= (tw.x + tw.y + tw.z);
                tw = mix(vec3(0.0, 1.0, 0.0), tw, uTri);              // sem triplanar: só projeta de cima (estica nas paredes)
                vec3 tp = vObjPos * vTexScale;
                vec4 tAr = triSample(tAlbedo, tp, tw);
                vec4 tEm = triSample(tEmis, tp, tw);
                float tVar = triSample(tNormal, tp * 0.31 + 0.17, tw).a;
                float tUp = vWorldN.y + (tVar - 0.5) * 0.5;
                float mossMask = mix(smoothstep(0.55, 0.86, tUp + (tVar - 0.5) * 0.35) * smoothstep(0.3, 0.55, tVar + 0.25), smoothstep(0.52, 0.72, tVar) * 0.85, uMossMode) * uMoss;
                vec3 mossCol = ${MOSS} * (0.65 + 0.7 * tVar);
                vec3 baseCol = mix(vec3(0.42), tAr.rgb, uPBR);
                diffuseColor.rgb = mix(baseCol, mossCol, mossMask);`)
            .replace('#include <roughnessmap_fragment>', `
                float roughnessFactor = mix(0.5, mix(tAr.a, 0.93, mossMask), uPBR);`)
            .replace('#include <normal_fragment_maps>', `
                {
                    vec3 nn = normalize(vObjN);
                    vec3 tnx = texture2D(tNormal, mix(tp.yz, tp.zy, uBark)).xyz * 2.0 - 1.0; tnx.xy = mix(tnx.xy, tnx.yx, uBark);
                    vec3 tny = texture2D(tNormal, mix(tp.zx, tp.xz, uBark)).xyz * 2.0 - 1.0; tny.xy = mix(tny.xy, tny.yx, uBark);
                    vec3 tnz = texture2D(tNormal, tp.xy).xyz * 2.0 - 1.0;
                    tnx = vec3(tnx.xy + nn.zy, abs(tnx.z) * nn.x);
                    tny = vec3(tny.xy + nn.xz, abs(tny.z) * nn.y);
                    tnz = vec3(tnz.xy + nn.xy, abs(tnz.z) * nn.z);
                    vec3 nObj = normalize(tnx.zyx * tw.x + tny.xzy * tw.y + tnz.xyz * tw.z);
                    nObj = normalize(mix(nn, nObj, uPBR * (1.0 - 0.45 * mossMask)));
                    normal = normalize(vToView0 * nObj.x + vToView1 * nObj.y + vToView2 * nObj.z);
                }`)
            .replace('#include <emissivemap_fragment>', `
                float flick = 0.82 + 0.18 * sin(uTime * 2.3 + tp.x * 3.0 + tp.y * 2.0);
                totalEmissiveRadiance += ${LAVA} * tEm.r * (1.0 - mossMask) * uLava * uHasLava * uPBR * 1.5 * flick;
                // SSS falso: a luz do sol que passa por trás do musgo acende a folha de dentro
                vec3 Vd = normalize(vViewPosition);
                float back = pow(clamp(-dot(Vd, uSunView), 0.0, 1.0), 3.0);
                totalEmissiveRadiance += mossCol * mossMask * back * uSSS * 1.3;`);
    };
    material.customProgramCacheKey = () => 'triplanar-v2';
    return material;
}

// ======================= GEOMETRIA PROCEDURAL =======================
// Uma "pedra" amassada: esfera de triângulos regulares deslocada por ruído de arestas (ridged), escalada e com normais suaves.
function pedra(raio, { amp = 0.22, freq = 1.4, sx = 1, sy = 1, sz = 1, semente = 0, detalhe = 5, texRepeat = 0.55 } = {}) {
    let g = new THREE.IcosahedronGeometry(raio, detalhe);
    g.deleteAttribute('normal'); g.deleteAttribute('uv');
    g = mergeVertices(g, 1e-4);
    const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const d = v.clone().normalize(), q = d.clone().multiplyScalar(freq).addScalar(semente);
        const ridge = 1 - Math.abs(simplex.noise3d(q.x, q.y, q.z)), big = simplex.noise3d(q.x * 0.5 + 9, q.y * 0.5, q.z * 0.5);
        const fine = simplex.noise3d(q.x * 4, q.y * 4, q.z * 4) * 0.25;
        const disp = 1 + amp * (ridge * 0.9 + big * 0.6 + fine - 0.5);
        p.setXYZ(i, d.x * raio * disp * sx, d.y * raio * disp * sy, d.z * raio * disp * sz);
    }
    g.computeVertexNormals();
    g.setAttribute('aTexScale', new THREE.BufferAttribute(new Float32Array(p.count).fill(texRepeat / Math.max(0.5, raio)), 1));
    return g;
}

// ======================= 4 · POISSON DISK (Bridson) =======================
function poisson(w, h, r, exclui = () => false, k = 20) {
    const cell = r / Math.SQRT2, gw = Math.ceil(w / cell), gh = Math.ceil(h / cell), grid = new Int32Array(gw * gh).fill(-1), pts = [], active = [];
    const add = (x, y) => { pts.push([x, y]); const i = pts.length - 1; grid[Math.floor(y / cell) * gw + Math.floor(x / cell)] = i; active.push(i); };
    add(rng() * w, rng() * h);
    while (active.length) {
        const ai = Math.floor(rng() * active.length), [px, py] = pts[active[ai]];
        let found = false;
        for (let n = 0; n < k; n++) {
            const a = rng() * Math.PI * 2, d = r * (1 + rng()), x = px + Math.cos(a) * d, y = py + Math.sin(a) * d;
            if (x < 0 || y < 0 || x >= w || y >= h) continue;
            const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
            let ok = true;
            for (let j = Math.max(0, gy - 2); j <= Math.min(gh - 1, gy + 2) && ok; j++) for (let i = Math.max(0, gx - 2); i <= Math.min(gw - 1, gx + 2); i++) {
                const id = grid[j * gw + i];
                if (id >= 0 && Math.hypot(pts[id][0] - x, pts[id][1] - y) < r) { ok = false; break; }
            }
            if (ok) { add(x, y); found = true; break; }
        }
        if (!found) active.splice(ai, 1);
    }
    return pts.filter(([x, y]) => !exclui(x, y));
}

// ======================= CENA =======================
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 160);
camera.position.set(9.5, 4.6, 15.5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 4.0, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 4;
controls.maxDistance = 26;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;

const grupoMonstro = new THREE.Group();
const parts = {};            // partes que se mexem
const groundH = (x, z) => 0.32 * simplex.noise(x * 0.11, z * 0.11) + 0.1 * simplex.noise(x * 0.43 + 5, z * 0.43) - 0.22 * Math.exp(-(x * x + z * z) / 14);

// Material de folha: cor por vértice + SSS falso (a luz da lua que passa por trás acende a folha)
function sssMat(m) {
    m.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, { uSunView: U.uSunView, uSSS: U.uSSS });
        shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunView; uniform float uSSS;')
            .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
                float backL = pow(clamp(-dot(normalize(vViewPosition), uSunView), 0.0, 1.0), 2.2);
                totalEmissiveRadiance += diffuseColor.rgb * vec3(0.55, 1.0, 0.7) * backL * uSSS * 1.6;`);
    };
    m.customProgramCacheKey = () => 'folha-sss-v1';
    return m;
}
function folhaGeo(raio, semente) {
    const g = pedra(raio, { amp: 0.3, freq: 2.0, detalhe: 4, semente, sx: 1.2, sy: 0.82, sz: 1.2 });
    const p = g.attributes.position, c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
        const t = clamp01((p.getY(i) / raio + 1) / 2), n = simplex.noise3d(p.getX(i) * 1.5 + semente, p.getY(i) * 1.5, p.getZ(i) * 1.5) * 0.5 + 0.5, k = clamp01(t * 0.7 + n * 0.4);
        c.set([lerp(0.008, 0.045, k), lerp(0.03, 0.115, k), lerp(0.02, 0.035, k)], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    return g;
}

const copa = new THREE.Group();     // a copa de folhas (balança com o vento)
function monstro(texCasca) {
    const mat = aplicarTriplanar(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0, envMapIntensity: 0.2 }), texCasca, { lava: false, bark: true });
    const folhaM = sssMat(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, envMapIntensity: 0.2, side: THREE.DoubleSide }));
    const escuro = new THREE.MeshStandardMaterial({ color: 0x0a0604, roughness: 1, envMapIntensity: 0 });
    const parte = (raio, pos, opt, rot = [0, 0, 0], nome, material = mat) => {
        const m = new THREE.Mesh(pedra(raio, opt), material);
        m.position.set(...pos); m.rotation.set(...rot); m.castShadow = true; m.receiveShadow = true;
        grupoMonstro.add(m); if (nome) parts[nome] = m; return m;
    };
    let s = 0;
    const o = (extra) => ({ semente: (s += 3.7), amp: 0.12, ...extra });
    // Pernas de raiz: coxa, canela e três dedos de raiz abertos para a frente
    for (const side of [-1, 1]) {
        parte(0.8, [side * 0.85, 1.45, 0], o({ sx: 0.95, sy: 1.45, sz: 0.95 }));
        parte(0.62, [side * 0.95, 0.62, 0.12], o({}));
        for (const k of [-1, 0, 1]) parte(0.3, [side * 0.95 + k * 0.34, 0.2, 0.8 - Math.abs(k) * 0.12], o({ sx: 0.8, sy: 0.55, sz: 2.4, amp: 0.2 }), [0, k * -0.25, 0]);
    }
    // Tronco: três blocos de casca empilhados (o de cima leva o rosto)
    parte(1.35, [0, 2.1, 0], o({ sx: 1.1, sy: 0.95, amp: 0.14 }), [0, 0, 0], 'pelvis');
    parte(1.34, [0, 3.2, 0], o({ sx: 1.0, sy: 1.4, amp: 0.14 }), [0, 0, 0], 'torso');
    parte(1.26, [0, 4.3, 0], o({ sx: 1.02, sy: 1.15, amp: 0.14 }), [0, 0, 0], 'cabeca');
    // Rosto entalhado: oco escuro, sobrancelhas pesadas, olhos âmbar, nariz de nó, boca com dentes de lasca
    parte(0.85, [0, 4.15, 1.15], o({ sx: 1.15, sz: 0.3, amp: 0.06 }), [0, 0, 0], undefined, escuro);
    for (const side of [-1, 1]) parte(0.34, [side * 0.55, 4.58, 1.4], o({ sx: 1.5, sy: 0.3, sz: 0.5, amp: 0.1 }), [0, 0, side * 0.2]);
    parte(0.22, [0, 3.95, 1.52], o({ sy: 1.2, amp: 0.15 }));
    // Sorriso suave: pequenas pedras escuras em arco, com os cantos levantados (rosto simpático)
    for (let k = -2; k <= 2; k++) parte(0.15, [k * 0.26, 3.5 + k * k * 0.05, 1.42 - Math.abs(k) * 0.03], o({ sx: 1.3, sy: 0.7, sz: 0.6, amp: 0.05 }), [0, 0, k * -0.08], undefined, escuro);
    const olhoMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.25, 0.85, 0.25) });
    parts.olhoMat = olhoMat;
    for (const side of [-1, 1]) {
        const olho = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), olhoMat);
        olho.position.set(side * 0.42, 4.2, 1.5); olho.scale.set(1.1, 1.0, 0.7); grupoMonstro.add(olho); parts['olho' + side] = olho;
    }
    // Braços de galho: ombro, braço, antebraço, mão e quatro dedos de graveto com folha na ponta
    for (const side of [-1, 1]) {
        parte(0.72, [side * 1.7, 4.55, 0], o({ sy: 0.85 }));
        parte(0.5, [side * 2.15, 3.7, 0.1], o({ sx: 0.8, sy: 1.7, sz: 0.8 }), [0, 0, side * 0.28]);
        parte(0.46, [side * 2.5, 2.7, 0.3], o({ sx: 0.8, sy: 1.6, sz: 0.8 }), [0, 0, side * 0.12]);
        parte(0.4, [side * 2.6, 1.95, 0.4], o({ sy: 0.9 }));
        for (let k = -1.5; k <= 1.5; k += 1) {
            parte(0.14, [side * 2.6 + k * 0.14, 1.45, 0.42 + k * 0.06], o({ sx: 0.8, sy: 3, sz: 0.8, amp: 0.15 }), [0, 0, k * 0.1]);
            const f = new THREE.Mesh(folhaGeo(0.17, s += 1.3), folhaM); f.position.set(side * 2.6 + k * 0.2, 0.95, 0.44 + k * 0.06); f.castShadow = true; grupoMonstro.add(f);
        }
    }
    // Galhos grossos que sustentam a copa
    for (const side of [-1, 1]) parte(0.4, [side * 0.95, 5.6, 0], o({ sx: 0.7, sy: 1.6, sz: 0.7 }), [0, 0, side * -0.45]);
    // A copa: anéis de nuvens de folhas, as de baixo escuras e as de cima mais claras
    const leaf = (r, x, y, z) => {
        const m = new THREE.Mesh(folhaGeo(r, s += 2.1), folhaM); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; grupoMonstro.add(m); return m;
    };
    const folhas = [];
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + 0.3; folhas.push(leaf(0.78 + (i % 3) * 0.08, Math.cos(a) * 1.7, 6.35 + (i % 2) * 0.3, Math.sin(a) * 1.7)); }
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 1; folhas.push(leaf(0.8, Math.cos(a) * 0.9, 7.1 + (i % 2) * 0.2, Math.sin(a) * 0.9)); }
    folhas.push(leaf(0.9, 0, 7.75, 0));
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.8; folhas.push(leaf(0.55, Math.cos(a) * 2.2, 5.95, Math.sin(a) * 2.2)); }
    folhas.forEach(m => { copa.position.y = 0; copa.attach(m); });
    grupoMonstro.add(copa);
    scene.add(grupoMonstro);
    articular();
    return mat;
}

// Braços e pernas viram grupos com pivô no ombro e no quadril (para a passada e o soco da versão em sprites)
const membros = {};
function articular() {
    const pivos = { armL: [-1.7, 4.55, 0], armR: [1.7, 4.55, 0], legL: [-0.85, 2.0, 0], legR: [0.85, 2.0, 0] };
    for (const [nome, pos] of Object.entries(pivos)) { const g = new THREE.Group(); g.position.set(...pos); grupoMonstro.add(g); membros[nome] = g; }
    for (const m of [...grupoMonstro.children]) {
        if (!m.isMesh) continue;
        const { x, y } = m.position, lado = x < 0 ? 'L' : 'R', ax = Math.abs(x);
        if (ax > 1.5 && y > 0.8 && y < 5.2) membros['arm' + lado].attach(m);
        else if (ax > 0.5 && ax < 1.45 && y < 2.1 && m.geometry.type !== 'ConeGeometry') membros['leg' + lado].attach(m);
    }
}

let luzNucleo, luzSol, sky, shafts, poeira, instGrupo, fundoGrupo, bounceLuzes = [];

function luzes() {
    scene.add(new THREE.HemisphereLight(0x2c3f66, 0x0b0907, 0.5));                                   // GI aproximado: céu noturno azul em cima, chão escuro embaixo
    luzSol = new THREE.DirectionalLight(0x9db8ff, 2.2);                                                // a lua
    luzSol.position.set(-8, 10, 6); luzSol.target.position.set(0, 3, 0);
    luzSol.castShadow = true; luzSol.shadow.mapSize.set(2048, 2048);
    Object.assign(luzSol.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 });
    luzSol.shadow.bias = -0.0004; luzSol.shadow.normalBias = 0.04;
    scene.add(luzSol, luzSol.target);
    luzNucleo = new THREE.PointLight(0xff9a2a, 0.0, 1, 2);                                              // (não usado; mantém a lista de luzes de rebote igual ao golem)
    const olhos = [-1, 1].map(side => { const l = new THREE.PointLight(0xffb040, 0.35, 4, 2); l.position.set(side * 0.4, 4.25, 2.2); scene.add(l); return l; });
    bounceLuzes = [...olhos];
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
}

// Chão: malha deslocada por ruído, com o material de terra (triplanar + musgo em manchas)
function chao(texSolo) {
    const g = new THREE.PlaneGeometry(90, 90, 220, 220); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, groundH(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    g.setAttribute('aTexScale', new THREE.BufferAttribute(new Float32Array(p.count).fill(0.32), 1));
    const m = new THREE.Mesh(g, aplicarTriplanar(new THREE.MeshStandardMaterial({ roughness: 0.9, envMapIntensity: 0.4 }), texSolo, { mossMode: 1, lava: false }));
    m.receiveShadow = true; scene.add(m);
}

// ======================= 4 · INSTANCING =======================
function espalhar() {
    instGrupo = new THREE.Group();
    const R = 38, centro = R, fora = (x, y) => Math.hypot(x - centro, y - centro) < 2.6 || Math.hypot(x - centro, y - centro) > R;
    const dummy = new THREE.Object3D(), cor = new THREE.Color();
    const onde = (x, y) => [x - centro, groundH(x - centro, y - centro), y - centro];

    // Pedrinhas
    const pedras = poisson(R * 2, R * 2, 0.95, fora);
    const pedraGeo = new THREE.IcosahedronGeometry(1, 1);
    const pMesh = new THREE.InstancedMesh(pedraGeo, new THREE.MeshStandardMaterial({ roughness: 0.85, envMapIntensity: 0.4 }), pedras.length);
    pedras.forEach(([x, y], i) => {
        const [wx, wy, wz] = onde(x, y), s = 0.05 + Math.pow(rng(), 2.2) * 0.3;
        dummy.position.set(wx, wy + s * 0.25, wz); dummy.rotation.set(rng() * 6, rng() * 6, rng() * 6); dummy.scale.set(s * (0.8 + rng() * 0.6), s * 0.65, s * (0.8 + rng() * 0.6)); dummy.updateMatrix();
        pMesh.setMatrixAt(i, dummy.matrix); pMesh.setColorAt(i, cor.setHSL(0.08 + rng() * 0.04, 0.1 + rng() * 0.12, 0.09 + rng() * 0.13));
    });
    pMesh.castShadow = true; pMesh.receiveShadow = true; instGrupo.add(pMesh);

    // Folhas secas
    const folhas = poisson(R * 2, R * 2, 0.8, fora);
    const fMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.2, 0.13), new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide }), folhas.length);
    folhas.forEach(([x, y], i) => {
        const [wx, wy, wz] = onde(x, y);
        dummy.position.set(wx, wy + 0.012, wz); dummy.rotation.set(-Math.PI / 2 + (rng() - 0.5) * 0.5, rng() * 6.28, (rng() - 0.5) * 0.5); dummy.scale.setScalar(0.7 + rng() * 0.9); dummy.updateMatrix();
        fMesh.setMatrixAt(i, dummy.matrix); fMesh.setColorAt(i, cor.setHSL(0.05 + rng() * 0.07, 0.55 + rng() * 0.2, 0.18 + rng() * 0.18));
    });
    fMesh.receiveShadow = true; instGrupo.add(fMesh);

    // Capim: lâminas finas que balançam, com SSS falso
    const lamina = new THREE.BufferGeometry();
    lamina.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.025, 0, 0, 0.025, 0, 0, -0.018, 0.28, 0, 0.018, 0.28, 0, 0, 0.5, 0]), 3));
    lamina.setAttribute('color', new THREE.BufferAttribute(new Float32Array([0.03, 0.07, 0.02, 0.03, 0.07, 0.02, 0.11, 0.22, 0.06, 0.11, 0.22, 0.06, 0.26, 0.36, 0.1]), 3));
    lamina.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]); lamina.computeVertexNormals();
    const capimMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, side: THREE.DoubleSide });
    capimMat.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, { uTime: U.uTime, uSunView: U.uSunView, uSSS: U.uSSS });
        shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;')
            .replace('#include <begin_vertex>', `#include <begin_vertex>
                float sway = sin(uTime * 1.6 + instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 0.5) * 0.09 * position.y * position.y * 4.0;
                transformed.x += sway; transformed.z += sway * 0.5;`);
        shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunView; uniform float uSSS;')
            .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
                float backG = pow(clamp(-dot(normalize(vViewPosition), uSunView), 0.0, 1.0), 2.5);
                totalEmissiveRadiance += diffuseColor.rgb * backG * uSSS * 1.1;`);
    };
    const capim = poisson(R * 2, R * 2, 0.23, (x, y) => fora(x, y) || Math.hypot(x - centro, y - centro) > 26, 12);
    const gMesh = new THREE.InstancedMesh(lamina, capimMat, capim.length);
    capim.forEach(([x, y], i) => {
        const [wx, wy, wz] = onde(x, y);
        dummy.position.set(wx, wy, wz); dummy.rotation.set((rng() - 0.5) * 0.3, rng() * 6.28, (rng() - 0.5) * 0.3); dummy.scale.set(1, 0.3 + rng() * 0.6, 1); dummy.updateMatrix();
        gMesh.setMatrixAt(i, dummy.matrix);
    });
    gMesh.receiveShadow = true; instGrupo.add(gMesh);
    scene.add(instGrupo);
    return { pedras: pedras.length, folhas: folhas.length, capim: capim.length };
}

// ======================= 5 · FUNDO (silhuetas no lugar do Gaussian Splatting) =======================
function fundo() {
    fundoGrupo = new THREE.Group();
    const cone = new THREE.ConeGeometry(1, 1, 7), mat = new THREE.MeshStandardMaterial({ color: 0x03070a, roughness: 1, envMapIntensity: 0 });
    const arvores = new THREE.InstancedMesh(cone, mat, 520), d = new THREE.Object3D();
    for (let i = 0; i < 520; i++) {
        const a = rng() * Math.PI * 2, r = 30 + rng() * 22, h = 4 + rng() * 9;
        d.position.set(Math.cos(a) * r, h * 0.5 - 0.4, Math.sin(a) * r); d.scale.set(0.9 + rng() * 1.3, h, 0.9 + rng() * 1.3); d.rotation.y = rng() * 6; d.updateMatrix();
        arvores.setMatrixAt(i, d.matrix);
    }
    fundoGrupo.add(arvores);
    // Cordilheira distante
    const mg = new THREE.CylinderGeometry(92, 92, 26, 160, 1, true), mp = mg.attributes.position;
    for (let i = 0; i < mp.count; i++) {
        const a = Math.atan2(mp.getZ(i), mp.getX(i)), top = mp.getY(i) > 0;
        mp.setY(i, top ? 6 + 12 * (0.5 + 0.5 * simplex.noise(Math.cos(a) * 2.2, Math.sin(a) * 2.2)) + 5 * simplex.noise(a * 9, 3) : -4);
    }
    mg.computeVertexNormals();
    fundoGrupo.add(new THREE.Mesh(mg, new THREE.MeshBasicMaterial({ color: 0x0b1320, side: THREE.BackSide })));
    scene.add(fundoGrupo);
}

// ======================= 6 · ATMOSFERA =======================
function atmosfera() {
    scene.fog = new THREE.FogExp2(0x060b14, 0.032);
    scene.background = new THREE.Color(0x060b14);
    // Céu: gradiente azul-noite, brilho da lua e estrelas
    const skyMat = new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false, fog: false,
        uniforms: { sunDir: { value: luzSol.position.clone().normalize() } },
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `varying vec3 vP; uniform vec3 sunDir;
            float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }
            void main(){
                float h = clamp(vP.y * 0.5 + 0.5, 0.0, 1.0);
                vec3 c = mix(vec3(0.035, 0.06, 0.1), vec3(0.01, 0.02, 0.05), smoothstep(0.5, 0.95, h));
                float m = dot(normalize(vP), sunDir);
                c += vec3(0.55, 0.65, 0.95) * pow(max(m, 0.0), 220.0) * 1.4 + vec3(0.2, 0.28, 0.5) * pow(max(m, 0.0), 12.0) * 0.35;
                vec3 q = floor(normalize(vP) * 140.0);
                float star = step(0.9965, hash(q)) * smoothstep(0.5, 0.7, h);
                gl_FragColor = vec4(c + vec3(star) * 0.8, 1.0);
            }`
    });
    sky = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16), skyMat); scene.add(sky);

    // Feixes de luar (god rays falsos): faixas altas, aditivas, azuladas
    shafts = new THREE.Group();
    const dir = luzSol.position.clone().sub(luzSol.target.position).normalize();
    const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
        uniforms: { uTime: U.uTime, uAlpha: { value: 1 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uAlpha;
            void main(){
                float edge = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x);
                float along = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
                float flow = 0.65 + 0.35 * sin(vUv.y * 9.0 - uTime * 0.5 + vUv.x * 4.0);
                gl_FragColor = vec4(vec3(0.45, 0.6, 1.0), edge * along * flow * 0.032 * uAlpha);
            }`
    });
    for (let i = 0; i < 9; i++) {
        const w = 1.4 + rng() * 2.6, plane = new THREE.PlaneGeometry(w, 34);
        for (let k = 0; k < 2; k++) {
            const m = new THREE.Mesh(plane, mat);
            const off = new THREE.Vector3((rng() - 0.5) * 26, 0, (rng() - 0.5) * 22);
            m.position.copy(off).addScaledVector(dir, 10);
            m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().multiplyScalar(-1));
            m.rotateY(k * Math.PI / 2 + rng());
            shafts.add(m);
        }
    }
    scene.add(shafts);
    // Vagalumes: pontos verde-amarelados que sobem devagar e piscam (puxam o bloom)
    const n = 240, pos = new Float32Array(n * 3), vel = [];
    for (let i = 0; i < n; i++) { pos.set([(rng() - 0.5) * 22, rng() * 8, (rng() - 0.5) * 22], i * 3); vel.push([(rng() - 0.5) * 0.25, 0.03 + rng() * 0.12, (rng() - 0.5) * 0.25]); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    poeira = new THREE.Points(pg, new THREE.PointsMaterial({ color: new THREE.Color(1.6, 2.2, 0.5), size: 0.09, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
    poeira.userData.vel = vel; scene.add(poeira);
}

// ======================= 7 · PÓS-PROCESSAMENTO =======================
let composer, passes = {};
const GradeShader = {
    uniforms: { tDiffuse: { value: null }, uTime: U.uTime, uOn: { value: 1 }, uAspect: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uTime; uniform float uOn;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){
            vec4 c = texture2D(tDiffuse, vUv);
            if (uOn > 0.5) {
                float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
                vec3 shadow = vec3(0.78, 0.95, 1.12), light = vec3(1.0, 1.0, 0.95);            // sombras frias, luzes quentes
                c.rgb *= mix(shadow, light, smoothstep(0.1, 0.8, l));
                c.rgb = mix(vec3(l), c.rgb, 1.12);                                              // um pouco mais de cor
                c.rgb = (c.rgb - 0.5) * 1.06 + 0.5;
                vec2 q = vUv - 0.5; float vig = 1.0 - smoothstep(0.25, 0.95, dot(q, q) * 1.9);
                c.rgb *= mix(0.45, 1.0, vig);
                c.rgb += (hash(vUv * 1400.0 + uTime) - 0.5) * 0.035;                            // grão de filme
            }
            gl_FragColor = c;
        }`
};
function compositor(w, h) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    passes.ao = new GTAOPass(scene, camera, w, h);
    passes.ao.updateGtaoMaterial({ radius: 0.7, distanceExponent: 1.4, thickness: 1.2, scale: 1.1, samples: 12, distanceFallOff: 1, screenSpaceRadius: false });
    passes.ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, radiusExponent: 1, rings: 2, samples: 12 });
    passes.ao.blendIntensity = 1.0;
    composer.addPass(passes.ao);
    passes.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.75, 0.7, 0.8);
    composer.addPass(passes.bloom);
    passes.dof = new BokehPass(scene, camera, { focus: 14, aperture: 0.00006, maxblur: 0.006 });
    composer.addPass(passes.dof);
    composer.addPass(new OutputPass());
    passes.grade = new ShaderPass(GradeShader);
    composer.addPass(passes.grade);
    passes.fxaa = new ShaderPass(FXAAShader);
    composer.addPass(passes.fxaa);
}

// ======================= PAINEL =======================
function ligar() {
    const on = (id) => $(id).checked;
    const apply = () => {
        U.uPBR.value = on('pbr') ? 1 : 0; U.uLava.value = on('lava') ? 1 : 0; parts.olhoMat.visible = parts['olho-1'].visible = parts['olho1'].visible = on('lava'); U.uTri.value = on('tri') ? 1 : 0; U.uMoss.value = on('moss') ? 0.5 : 0; U.uSSS.value = on('sss') ? 1 : 0;
        passes.ao.enabled = on('ao');
        bounceLuzes.forEach((l, i) => { l.userData.base ??= l.intensity; l.visible = on('bounce'); });
        instGrupo.visible = on('inst');
        scene.fog.density = on('fog') ? 0.032 : 0; shafts.visible = on('fog'); poeira.visible = on('fog');
        passes.bloom.enabled = on('bloom'); passes.dof.enabled = on('dof');
        renderer.toneMapping = on('aces') ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
        passes.grade.uniforms.uOn.value = on('grade') ? 1 : 0;
        controls.autoRotate = on('spin');
    };
    document.querySelectorAll('#panel input[type=checkbox]').forEach(el => el.addEventListener('change', apply));
    apply();
    const setQuality = () => {
        const q = +$('quality').value, pr = Math.min(window.devicePixelRatio || 1, 2) * q;
        renderer.setPixelRatio(pr); composer.setPixelRatio(pr);
        const w = stage.clientWidth, h = stage.clientHeight;
        renderer.setSize(w, h); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
        passes.fxaa.material.uniforms.resolution.value.set(1 / (w * pr), 1 / (h * pr));
        passes.grade.uniforms.uAspect.value = w / h;
    };
    $('quality').addEventListener('change', setQuality);
    window.addEventListener('resize', setQuality);
    setQuality();
    $('shot').addEventListener('click', () => {
        composer.render();
        const a = document.createElement('a'); a.download = 'treant-noite.png'; a.href = renderer.domElement.toDataURL('image/png'); a.click();
    });
}

// ======================= INÍCIO =======================
const v3 = new THREE.Vector3();
function animar(t, dt) {
    U.uTime.value = t;
    const respira = Math.sin(t * 1.0);
    parts.torso.scale.set(1 + respira * 0.01, 1 + respira * 0.016, 1 + respira * 0.01);
    copa.rotation.z = Math.sin(t * 0.6) * 0.025; copa.rotation.x = Math.sin(t * 0.45) * 0.02;
    const pulso = 0.85 + 0.15 * Math.sin(t * 1.8) + 0.06 * Math.sin(t * 6.1);
    parts.olhoMat.color.setRGB(1.25 * pulso, 0.85 * pulso, 0.25 * pulso);
    bounceLuzes.forEach(l => { l.userData.base ??= l.intensity; if (l.visible) l.intensity = l.userData.base * pulso; });
    const pa = poeira.geometry.attributes.position, vel = poeira.userData.vel;
    for (let i = 0; i < pa.count; i++) {
        pa.setXYZ(i, pa.getX(i) + (vel[i][0] + Math.sin(t * 0.8 + i) * 0.1) * dt, pa.getY(i) + vel[i][1] * dt, pa.getZ(i) + (vel[i][2] + Math.cos(t * 0.7 + i) * 0.1) * dt);
        if (pa.getY(i) > 8) pa.setY(i, 0);
    }
    pa.needsUpdate = true;
    poeira.material.opacity = 0.65 + 0.25 * Math.sin(t * 3);
    v3.copy(luzSol.position).sub(luzSol.target.position).normalize().transformDirection(camera.matrixWorldInverse);
    U.uSunView.value.copy(v3);
}

let ultimo = 0, quadros = 0, tFps = 0;
function loop(ms) {
    const t = ms / 1000, dt = Math.min(0.1, t - ultimo); ultimo = t;
    controls.update();
    camera.updateMatrixWorld();
    animar(t, dt);
    composer.render();
    quadros++; tFps += dt;
    if (tFps > 0.5) { $('fps').textContent = `${Math.round(quadros / tFps)} quadros/s`; quadros = 0; tFps = 0; }
    requestAnimationFrame(loop);
}

// ======================= MODO SPRITES (?bake=1) =======================
// Só o golem, fundo transparente, câmera ortográfica parecida com a do jogo. window.__bake(frames, direcoes, tam) devolve o atlas.
function bake() {
    document.getElementById('panel')?.remove();
    scene.fog = null; scene.background = null;
    renderer.setClearColor(0x000000, 0);
    U.uMoss.value = 0.5; luzSol.intensity = 2.8; if (typeof poeira !== 'undefined' && poeira) poeira.visible = false;
    const ELEV = 40 * Math.PI / 180, VIEW = 10.6, alvo = new THREE.Vector3(0, 3.7, 0);
    const cam = new THREE.OrthographicCamera(-VIEW / 2, VIEW / 2, VIEW / 2, -VIEW / 2, 0.1, 80);
    cam.position.set(0, alvo.y + Math.sin(ELEV) * 30, Math.cos(ELEV) * 30); cam.lookAt(alvo); cam.updateMatrixWorld();
    // Pose com peso: passo longo com o pé que sobe, corpo que sobe e desce, tronco que gira contra o quadril, braços que balançam contra as pernas,
    // copa que atrasa (pêndulo) e, no soco, recuo, golpe e volta. swing 0 = andando; 0..1 = andamento do soco
    const suave = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const pose = (walkPhase, swing) => {
        const w = Math.sin(walkPhase), c = Math.cos(walkPhase);
        const kw = suave(0, 0.45, swing), ks = suave(0.45, 0.7, swing), kr = suave(0.78, 1, swing);
        const punch = swing > 0;
        const lean = punch ? -0.12 * kw + 0.32 * ks - 0.2 * kr : 0.02 * Math.abs(c);
        // Pernas: a que vai para frente sobe (alt)
        membros.legL.rotation.x = punch ? 0.18 * ks * (1 - kr) : w * 0.22; membros.legR.rotation.x = punch ? -0.2 * ks * (1 - kr) : -w * 0.22;
        membros.legL.position.y = 2.0 + (punch ? 0 : Math.max(0, -c) * 0.14); membros.legR.position.y = 2.0 + (punch ? 0 : Math.max(0, c) * 0.14);
        // Braços: contra as pernas; no soco recuam, batem e voltam
        const a = 0.9 * kw - 3.2 * ks + 2.3 * kr;
        membros.armL.rotation.x = punch ? a : -w * 0.2; membros.armR.rotation.x = punch ? a : w * 0.2;
        membros.armL.rotation.z = punch ? -0.25 * ks * (1 - kr) : -0.04 - Math.abs(w) * 0.02; membros.armR.rotation.z = punch ? 0.25 * ks * (1 - kr) : 0.04 + Math.abs(w) * 0.02;
        // Corpo: sobe no meio do passo, desce quando o pé pousa; tronco gira contra o quadril e balança de lado
        const bob = punch ? -0.07 * ks * (1 - kr) : Math.abs(c) * 0.04;
        grupoMonstro.position.y = bob;
        parts.pelvis.rotation.set(0, punch ? 0 : -w * 0.025, punch ? 0 : w * 0.012);
        parts.torso.rotation.set(lean, punch ? 0 : w * 0.03, punch ? 0 : -w * 0.014);
        parts.cabeca.rotation.set(lean * 0.6, punch ? 0 : -w * 0.012, punch ? 0 : -w * 0.008);
        // Copa: pêndulo com atraso (balança contra o tronco, sobe e desce ao contrário do corpo)
        copa.rotation.set(punch ? -lean * 0.9 : -0.01 * Math.sin(walkPhase * 2 + 1), 0, punch ? Math.sin(swing * 28) * 0.035 * ks : -w * 0.02);
        copa.position.y = -bob * 0.6;
    };
    window.__bake = (andar, soco, dirs, tam) => {
        const quadros = andar + soco, cv = document.createElement('canvas');
        cv.width = tam * quadros; cv.height = tam * dirs;
        const c = cv.getContext('2d'), grande = tam * 2, rt = renderer;
        rt.setPixelRatio(1); rt.setSize(grande, grande);
        const tmp = document.createElement('canvas'); tmp.width = tmp.height = tam;
        const tc = tmp.getContext('2d');
        for (let d = 0; d < dirs; d++) {
            grupoMonstro.rotation.y = Math.PI / 2 - (d / dirs) * Math.PI * 2;
            for (let f = 0; f < quadros; f++) {
                if (f < andar) pose((f / andar) * Math.PI * 2, 0); else pose(0, (f - andar + 1) / soco);
                U.uTime.value = 0; rt.render(scene, cam);
                tc.clearRect(0, 0, tam, tam); tc.drawImage(rt.domElement, 0, 0, tam, tam);
                // Bloom barato do núcleo e das brasas: cópia só das partes claras, borrada, somada por cima
                if (window.__bloom) { tc.globalCompositeOperation = 'lighter'; tc.filter = `blur(${tam / 40}px) brightness(1.1) contrast(2.2)`; tc.globalAlpha = 0.4;
                tc.drawImage(tmp, 0, 0); tc.filter = 'none'; tc.globalAlpha = 1; tc.globalCompositeOperation = 'source-over'; }
                c.drawImage(tmp, f * tam, d * tam);
            }
        }
        return cv.toDataURL('image/webp', 0.88);
    };
    window.__lab = { bake: true, ok: true };
}

async function iniciar() {
    const t0 = performance.now();
    if (new URLSearchParams(location.search).has('bake')) {
        renderer.setSize(256, 256);
        const t = construirTexturas('casca'); luzes(); monstro(t); bake(); $('loading').remove(); return;
    }
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    const texPedra = construirTexturas('casca'), texSolo = construirTexturas('solo');
    luzes();
    monstro(texPedra);
    chao(texSolo);
    const n = espalhar();
    fundo();
    atmosfera();
    compositor(stage.clientWidth, stage.clientHeight);
    ligar();
    window.__lab = { scene, camera, renderer, composer, passes, n, tempoMs: Math.round(performance.now() - t0) };
    $('loading').remove();
    requestAnimationFrame(loop);
}

// Primeiro quadro na tela, depois o trabalho pesado (senão a página parece travada)
requestAnimationFrame(() => setTimeout(() => {
    iniciar().catch((e) => { console.error(e); $('loading').textContent = 'Erro: ' + e.message + '\n(veja o console, F12)'; });
}, 30));
