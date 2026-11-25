// --- LABORATÓRIO: Cavaleiro Ossário (técnicas de distância) ---
// Personagem novo, 100% procedural (nenhuma imagem, nenhum modelo baixado): esqueleto de armadura enferrujada, elmo com chifres, capa rasgada, espada
// com runas e uma alma azul na caixa torácica. Feito para testar as técnicas 8 a 17 de metodologia_fotorrealismo.md ("Personagens de longe"):
//   8  LOD de malha        3 níveis (0 perto, 1 médio, 2 longe), escolhidos pela distância da câmera até o personagem
//   10 Mipmap + anisotrópico  caixa para ligar/desligar e ver a cintilação
//   11 Cor atmosférica     a névoa da cena aplicada no próprio personagem (caixa liga/desliga o `fog` dos materiais)
//   12 Specular AA         o relevo (normal map) some e a rugosidade sobe com a distância
//   15 Luz de borda        rim light que cresce com a distância e segura a silhueta contra a névoa
//   16 Sombra de contato   elipse escura sob os pés, mais forte de longe
// Fora dos jogos; usa o Three.js de vendor/three. Texturas PBR (albedo, relevo, rugosidade e metalicidade) geradas por ruído Simplex tileável.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const TAU = Math.PI * 2;
let seed = 20261125;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const simplex = new SimplexNoise({ random: rnd });
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// ======================= RENDERIZADOR E CENA =======================
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
const MAX_ANISO = renderer.capabilities.getMaxAnisotropy();

const FOG_COLOR = '#0c1624';
const scene = new THREE.Scene();
scene.background = new THREE.Color(FOG_COLOR);
scene.fog = new THREE.FogExp2(FOG_COLOR, 0.014);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.25;
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 400);
camera.position.set(0, 2.7, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.7, -14);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 2;
controls.maxDistance = 60;

scene.add(new THREE.HemisphereLight('#7f9fd8', '#1a1612', 0.55));
const moon = new THREE.DirectionalLight('#bcd0ff', 2.2);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { left: -4, right: 4, top: 5, bottom: -2, near: 1, far: 40 });
moon.shadow.bias = -0.0004;
moon.shadow.normalBias = 0.02;
scene.add(moon, moon.target);
const soulLight = new THREE.PointLight('#5fd8ff', 3, 6, 1.8);
scene.add(soulLight);

// ======================= TEXTURAS PBR (ruído tileável) =======================
// Ruído em torno de um toro (4D) para a textura emendar sem costura.
function tn(u, v, f) { const a = u * TAU, b = v * TAU, r = f / TAU; return simplex.noise4d(Math.cos(a) * r, Math.sin(a) * r, Math.cos(b) * r, Math.sin(b) * r); }
function fbm(u, v, f, oct = 4, gain = 0.5) { let s = 0, a = 1, n = 0; for (let i = 0; i < oct; i++) { s += a * tn(u + i * 0.137, v - i * 0.211, f * (1 << i)); n += a; a *= gain; } return s / n; }

function asTexture(canvas, srgb) {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    return t;
}
// fn(u, v) → { c:[r,g,b], h, rough, metal, a }. Gera albedo, normal (do relevo h) e ORM (G = rugosidade, B = metalicidade).
function bake(N, fn, strength) {
    const mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'); return { c, g, img: g.createImageData(N, N) }; };
    const col = mk(), orm = mk(), nor = mk();
    const H = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const s = fn(x / N, 1 - y / N), i = (y * N + x) * 4;
        H[y * N + x] = s.h;
        col.img.data[i] = s.c[0] * 255; col.img.data[i + 1] = s.c[1] * 255; col.img.data[i + 2] = s.c[2] * 255; col.img.data[i + 3] = (s.a ?? 1) * 255;
        orm.img.data[i] = 255; orm.img.data[i + 1] = clamp01(s.rough) * 255; orm.img.data[i + 2] = clamp01(s.metal) * 255; orm.img.data[i + 3] = 255;
    }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const xl = H[y * N + ((x + N - 1) % N)], xr = H[y * N + ((x + 1) % N)], yu = H[((y + N - 1) % N) * N + x], yd = H[((y + 1) % N) * N + x];
        let nx = -(xr - xl) * strength, ny = (yd - yu) * strength, nz = 1;
        const l = Math.hypot(nx, ny, nz);
        const i = (y * N + x) * 4;
        nor.img.data[i] = (nx / l * 0.5 + 0.5) * 255; nor.img.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; nor.img.data[i + 2] = (nz / l * 0.5 + 0.5) * 255; nor.img.data[i + 3] = 255;
    }
    [col, orm, nor].forEach((o) => o.g.putImageData(o.img, 0, 0));
    return { map: asTexture(col.c, true), orm: asTexture(orm.c, false), normal: asTexture(nor.c, false) };
}

function construirTexturas() {
    // Osso: marfim sujo, rachaduras finas, manchas de terra e um verde de musgo nas frestas
    const bone = bake(512, (u, v) => {
        const base = fbm(u, v, 6, 4) * 0.5 + 0.5, fine = fbm(u, v, 40, 3);
        const crack = smooth(0.93, 0.992, 1 - Math.abs(fbm(u + 0.3, v + 0.1, 9, 2)));
        const stain = smooth(0.4, 0.85, fbm(u + 0.5, v, 3, 4) * 0.5 + 0.5);
        let c = mix3([0.86, 0.82, 0.7], [0.36, 0.28, 0.18], stain * 0.8);
        c = mix3(c, [0.2, 0.24, 0.1], crack * 0.7);
        const sh = 0.88 + fine * 0.12;
        return { c: [c[0] * sh, c[1] * sh, c[2] * sh], h: base * 0.5 + fine * 0.12 - crack * 0.7, rough: 0.5 + base * 0.25 + crack * 0.2, metal: 0 };
    }, 2.6);
    // Armadura: aço escuro riscado com ferrugem em manchas
    const metal = bake(512, (u, v) => {
        const rust = smooth(0.38, 0.72, (fbm(u, v, 4, 5) * 0.5 + 0.5) + 0.22 * fbm(u + 0.2, v, 22, 3));
        const pits = smooth(0.62, 1, fbm(u, v + 0.4, 60, 2) * 0.5 + 0.5);
        const fine = fbm(u, v, 90, 2);
        const streak = tn(u * 0.1, v, 120) * 0.5;
        const steel = mix3([0.3, 0.32, 0.36], [0.5, 0.52, 0.56], clamp01(0.5 + streak));
        const rustC = mix3([0.5, 0.22, 0.08], [0.24, 0.11, 0.05], smooth(0, 1, fbm(u, v, 14, 3) * 0.5 + 0.5));
        const c = mix3(steel, rustC, rust);
        return { c: [c[0] * (1 - pits * 0.35), c[1] * (1 - pits * 0.35), c[2] * (1 - pits * 0.35)], h: -rust * 0.45 + fine * 0.15 - pits * 0.25, rough: lerp(0.36, 0.9, rust) + fine * 0.05, metal: lerp(0.92, 0.12, rust) };
    }, 3.2);
    // Capa: tecido carmim tecido, sujo, com borda de baixo e das laterais rasgada (canal alfa)
    const cloth = bake(256, (u, v) => {
        const thread = 0.5 + 0.5 * Math.sin(u * TAU * 70) * Math.sin(v * TAU * 70);
        const dirt = smooth(0.35, 0.85, fbm(u, v, 4, 4) * 0.5 + 0.5);
        const c = mix3([0.4, 0.07, 0.1], [0.12, 0.04, 0.05], dirt);
        const edge = v + 0.26 * fbm(u, v, 5, 4) + 0.07 * fbm(u, v, 30, 3);
        const side = Math.min(u, 1 - u) * 2.4 + 0.12 * fbm(u, v, 9, 3);
        const k = 0.65 + 0.35 * thread;
        return { c: [c[0] * k, c[1] * k, c[2] * k], h: thread * 0.25 + fbm(u, v, 24, 2) * 0.1, rough: 0.92, metal: 0, a: edge > 0.2 && side > 0.1 ? 1 : 0 };
    }, 1.6);
    [bone, metal].forEach((s) => Object.values(s).forEach((t) => t.repeat.set(2, 2)));
    return { bone, metal, cloth };
}

// ======================= MATERIAIS (com rim, specular AA por uniforme) =======================
// u = { rim, rimCol, far } compartilhado pelos materiais de um cavaleiro: o JS ajusta por quadro conforme a distância.
function patch(mat, u) {
    mat.onBeforeCompile = (sh) => {
        sh.uniforms.uRim = u.rim; sh.uniforms.uRimCol = u.rimCol; sh.uniforms.uFar = u.far;
        sh.fragmentShader = sh.fragmentShader
            .replace('#include <common>', '#include <common>\nuniform float uRim; uniform vec3 uRimCol; uniform float uFar;')
            .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = min(1.0, roughnessFactor + uFar * 0.45);')
            .replace('#include <opaque_fragment>', 'float rimK = pow(1.0 - saturate(dot(normalize(normal), normalize(vViewPosition))), 3.0);\noutgoingLight += uRimCol * uRim * rimK;\n#include <opaque_fragment>');
    };
    mat.customProgramCacheKey = () => 'cavaleiro-rim';
    return mat;
}
function criarMateriais(T, u) {
    const pbr = (set, extra = {}) => patch(new THREE.MeshStandardMaterial({ map: set.map, normalMap: set.normal, normalScale: new THREE.Vector2(1.2, 1.2), roughnessMap: set.orm, metalnessMap: set.orm, roughness: 1, metalness: 1, ...extra }), u);
    const lite = (color, rough, metal, extra = {}) => patch(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }), u);
    const glow = (color) => new THREE.MeshStandardMaterial({ color: '#000', emissive: color, emissiveIntensity: 3.2, roughness: 1 });
    return {
        bone: pbr(T.bone), metal: pbr(T.metal, { side: THREE.DoubleSide }), cloth: pbr(T.cloth, { side: THREE.DoubleSide, alphaTest: 0.5 }),
        dark: lite('#0a0806', 0.95, 0), glow: glow('#6fe6ff'), rune: glow('#38b8ff'), soul: Object.assign(glow('#58d0ff'), { emissiveIntensity: 1.3 }),
        // Nível 2 (longe): sem texturas, cor média: poupa memória e evita cintilação
        boneL: lite('#a89c80', 0.62, 0), metalL: lite('#4c4944', 0.6, 0.55, { side: THREE.DoubleSide }), clothL: lite('#32090e', 0.95, 0, { side: THREE.DoubleSide })
    };
}

// ======================= CAVALEIRO (3 níveis de detalhe) =======================
const Q = [{ c: 5, r: 12 }, { c: 3, r: 8 }, { c: 2, r: 6 }];
function add(parent, geo, mat, x = 0, y = 0, z = 0, shadow = true) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    parent.add(m);
    return m;
}
const cap = (r, L, q) => new THREE.CapsuleGeometry(r, Math.max(0.01, L - 2 * r), q.c, q.r);
const ball = (r, q) => new THREE.SphereGeometry(r, q.r, Math.max(4, q.c * 2));

function construir(level, M) {
    const q = Q[level], L0 = level === 0, L1 = level <= 1;
    const B = level === 2 ? M.boneL : M.bone, S = level === 2 ? M.metalL : M.metal, C = level === 2 ? M.clothL : M.cloth;
    const root = new THREE.Group();
    const J = {};
    const hips = J.hips = new THREE.Group();
    hips.position.y = 1.66;
    root.add(hips);
    add(hips, ball(0.27, q), B).scale.set(1.15, 0.7, 0.8);
    if (L1) { const belt = add(hips, new THREE.TorusGeometry(0.3, 0.035, 6, q.r * 2), S, 0, 0.1, 0); belt.rotation.x = Math.PI / 2; belt.scale.set(1, 0.8, 1); }
    if (L0) { // tanga de pano rasgado na frente
        const t = add(hips, new THREE.PlaneGeometry(0.36, 0.55, 3, 4), C, 0, -0.25, 0.2); t.rotation.x = -0.08;
    }

    // pernas
    J.legs = [-1, 1].map((sd) => {
        const hip = new THREE.Group(); hip.position.set(sd * 0.2, -0.08, 0); hips.add(hip);
        add(hip, ball(0.075, q), B);
        add(hip, cap(0.058, 0.78, q), B, 0, -0.39, 0);
        const knee = new THREE.Group(); knee.position.y = -0.78; hip.add(knee);
        add(knee, ball(0.072, q), B);
        if (L1) add(knee, ball(0.085, q), S, 0, 0.0, 0.05).scale.set(1, 1, 0.7);
        add(knee, cap(0.05, 0.78, q), B, 0, -0.39, 0);
        if (L1) add(knee, new THREE.CylinderGeometry(0.075, 0.062, 0.44, q.r, 1, true), S, 0, -0.34, 0.015);
        const foot = new THREE.Group(); foot.position.y = -0.78; knee.add(foot);
        add(foot, new THREE.BoxGeometry(0.15, 0.08, 0.36), S, 0, -0.02, 0.1);
        return { hip, knee, sd };
    });

    // tronco
    const torso = J.torso = new THREE.Group();
    torso.position.y = 0.18;
    hips.add(torso);
    if (L0) {
        for (let i = 0; i < 8; i++) { const v = add(torso, new THREE.CylinderGeometry(0.036, 0.04, 0.062, 8), B, 0, 0.04 + i * 0.09, -0.19); v.scale.z = 1.1; }
        const ribs = new THREE.Group(); ribs.scale.set(1, 1, 0.74); torso.add(ribs);
        for (let i = 0; i < 6; i++) {
            const R = 0.3 + 0.075 * Math.sin((i / 5) * Math.PI * 0.9);
            const rib = add(ribs, new THREE.TorusGeometry(R, 0.02, 6, 24, TAU * 0.8), B, 0, 0.14 + i * 0.1, 0);
            rib.rotation.set(Math.PI / 2, 0, 1.3 * Math.PI);
        }
        add(torso, cap(0.028, 0.5, q), B, 0, 0.42, 0.21);
    } else {
        add(torso, ball(0.3, q), M.dark || B, 0, 0.38, 0).scale.set(1, 1.35, 0.7);
    }
    // alma azul dentro das costelas
    add(torso, ball(0.08, q), M.soul, 0, 0.32, 0.02, false);
    // peitoral quebrado (cobre só o alto do peito: as costelas aparecem embaixo)
    const plate = add(torso, new THREE.CylinderGeometry(0.4, 0.31, 0.42, q.r * 2, 1, true, -1.05, 2.1), S, 0, 0.66, 0.02);
    plate.scale.z = 0.76;
    if (L0) { [-0.2, 0, 0.2].forEach((x) => add(torso, ball(0.02, q), S, x, 0.8, 0.28 - Math.abs(x) * 0.25, false)); }
    // clavícula e pescoço
    if (L1) { const cl = add(torso, cap(0.03, 0.9, q), B, 0, 0.8, 0); cl.rotation.z = Math.PI / 2; }
    add(torso, new THREE.CylinderGeometry(0.04, 0.045, 0.16, 8), B, 0, 0.9, 0);

    // capa
    const cw = 0.95, ch = 1.9, seg = L0 ? [10, 16] : L1 ? [4, 6] : [1, 2];
    const capeGeo = new THREE.PlaneGeometry(cw, ch, seg[0], seg[1]);
    const cape = add(torso, capeGeo, C, 0, 0.8 - ch / 2, -0.25);
    J.cape = { mesh: cape, base: capeGeo.attributes.position.array.slice(), w: cw, h: ch, live: level < 2 };

    // braços
    J.arms = [-1, 1].map((sd) => {
        const sh = new THREE.Group(); sh.position.set(sd * 0.48, 0.8, 0); torso.add(sh);
        add(sh, ball(0.065, q), B);
        const pd = add(sh, new THREE.SphereGeometry(0.27, q.r, q.c * 2 + 2, 0, TAU, 0, Math.PI * 0.55), S, sd * 0.05, 0.02, 0);
        pd.scale.set(0.78, 0.7, 0.85); pd.rotation.z = -sd * 0.35;
        if (L0) for (let k = 0; k < 3; k++) { const sp = add(sh, new THREE.ConeGeometry(0.035, 0.2, 6), S, sd * (0.12 + k * 0.09), 0.2 - k * 0.04, (k - 1) * 0.1); sp.rotation.z = -sd * (0.5 + k * 0.45); }
        add(sh, cap(0.05, 0.56, q), B, 0, -0.28, 0);
        const el = new THREE.Group(); el.position.y = -0.56; sh.add(el);
        add(el, ball(0.058, q), B);
        add(el, cap(0.042, 0.56, q), B, 0, -0.28, 0);
        if (L1) add(el, new THREE.CylinderGeometry(0.062, 0.05, 0.3, q.r, 1, true), S, 0, -0.26, 0);
        const hand = new THREE.Group(); hand.position.y = -0.58; el.add(hand);
        if (L0) {
            add(hand, new THREE.BoxGeometry(0.07, 0.09, 0.03), B, 0, -0.04, 0);
            for (let k = -1; k <= 1; k++) add(hand, cap(0.01, 0.1, q), B, k * 0.022, -0.12, 0.012).rotation.x = -0.25;
        } else add(hand, ball(0.045, q), B, 0, -0.04, 0);
        return { sh, el, hand, sd };
    });

    // espada na mão direita (sd = +1): lâmina serrilhada e enferrujada com runa brilhando no meio
    const sword = new THREE.Group();
    sword.scale.setScalar(0.72);
    J.arms[1].hand.add(sword);
    sword.position.set(0, -0.06, 0.01);
    sword.rotation.x = 1.45;
    add(sword, new THREE.CylinderGeometry(0.022, 0.022, 0.26, 8), M.dark, 0, 0, 0, false);
    add(sword, ball(0.035, q), S, 0, -0.15, 0);
    add(sword, new THREE.BoxGeometry(0.34, 0.04, 0.06), S, 0, 0.14, 0);
    const bs = new THREE.Shape();
    bs.moveTo(-0.07, 0); bs.lineTo(0.07, 0); bs.lineTo(0.075, 1.3); bs.lineTo(0.05, 1.5); bs.lineTo(0, 1.78); bs.lineTo(-0.05, 1.45); bs.lineTo(-0.075, 1.0); bs.lineTo(-0.065, 0.5);
    const blade = add(sword, new THREE.ExtrudeGeometry(bs, { depth: 0.03, bevelEnabled: L0, bevelSize: 0.012, bevelThickness: 0.008, bevelSegments: 1 }), S, 0, 0.16, -0.015);
    if (L1) add(sword, new THREE.BoxGeometry(0.018, 1.25, 0.05), M.rune, 0, 0.82, 0, false);
    J.sword = sword;

    // cabeça
    const head = J.head = new THREE.Group();
    head.position.y = 1.02;
    torso.add(head);
    add(head, ball(0.21, q), B, 0, 0.04, 0).scale.set(0.92, 1.05, 1.12);
    [-1, 1].forEach((sd) => {
        add(head, ball(0.06, q), M.dark, sd * 0.085, 0.05, 0.17, false).scale.set(1, 1.1, 0.6);
        add(head, ball(0.028, q), M.glow, sd * 0.085, 0.05, 0.19, false);
        if (L1) add(head, ball(0.04, q), B, sd * 0.125, -0.04, 0.15);
    });
    add(head, new THREE.ConeGeometry(0.03, 0.06, 4), M.dark, 0, -0.03, 0.21, false).rotation.x = Math.PI;
    const jaw = J.jaw = new THREE.Group();
    jaw.position.set(0, -0.06, 0.0);
    head.add(jaw);
    add(jaw, ball(0.085, q), B, 0, -0.04, 0.1).scale.set(1.05, 0.5, 1.1);
    if (L0) for (let k = -3; k <= 3; k++) {
        add(jaw, new THREE.BoxGeometry(0.016, 0.03, 0.012), B, k * 0.024, -0.005, 0.18 - Math.abs(k) * 0.012, false);
        add(head, new THREE.BoxGeometry(0.016, 0.03, 0.012), B, k * 0.024, -0.075, 0.2 - Math.abs(k) * 0.012, false);
    }
    // elmo aberto com viseira, crista e chifres (a silhueta que se lê de longe)
    const helm = add(head, new THREE.SphereGeometry(0.245, q.r * 2, q.c * 2 + 2, 0, TAU, 0, Math.PI * 0.47), S, 0, 0.045, 0);
    helm.scale.set(0.97, 1.05, 1.12);
    add(head, new THREE.BoxGeometry(0.03, 0.2, 0.02), S, 0, -0.01, 0.255);
    add(head, new THREE.BoxGeometry(0.03, 0.13, 0.34), S, 0, 0.3, -0.02);
    [-1, 1].forEach((sd) => {
        const h = add(head, new THREE.ConeGeometry(0.045, 0.34, q.r), S, sd * 0.22, 0.2, -0.02);
        h.rotation.z = -sd * 0.95;
    });
    return { root, J, tris: contarTriangulos(root) };
}
function contarTriangulos(obj) {
    let n = 0;
    obj.traverse((o) => { if (o.isMesh) { const g = o.geometry; n += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
    return Math.round(n);
}

// ======================= POSES =======================
const ease = (x) => x * x * (3 - 2 * x);
function poser(J, t, mode, soul) {
    const ph = t * 3.4;
    const walk = mode === 'walk', slash = mode === 'slash';
    const breathe = Math.sin(t * 1.6);
    let f = 0, wind = 0.15;
    if (slash) {
        const k = (t % 2.4) / 2.4;
        f = k < 0.42 ? ease(k / 0.42) : k < 0.52 ? lerp(1, -0.25, Math.pow((k - 0.42) / 0.1, 2)) : lerp(-0.25, 0, smooth(0.52, 0.95, k));
        wind = 0.5;
    } else if (walk) wind = 1;
    J.hips.position.y = 1.66 + breathe * 0.01 - (walk ? Math.abs(Math.sin(ph)) * 0.05 : 0) - (slash ? f * 0.05 : 0);
    J.legs.forEach((lg, i) => {
        const a = ph + (i ? Math.PI : 0);
        lg.hip.rotation.x = walk ? Math.sin(a) * 0.5 : (slash ? (i ? 0.2 : -0.25) : (i ? 0.03 : -0.03));
        lg.knee.rotation.x = walk ? Math.max(0, -Math.cos(a)) * 0.9 : (slash ? 0.12 : 0.05);
    });
    J.torso.rotation.set(slash ? -0.18 * f : breathe * 0.012, walk ? Math.sin(ph) * 0.12 : (slash ? 0.25 * f : 0), 0);
    J.head.rotation.set(0.03, walk ? -Math.sin(ph) * 0.08 : Math.sin(t * 0.7) * 0.25 * (slash ? 0.1 : 1), 0);
    J.jaw.rotation.x = slash ? 0.45 * smooth(0.2, 0.9, f) : 0.04 + Math.max(0, Math.sin(t * 0.9)) * 0.03;
    const [L, R] = J.arms;
    L.sh.rotation.set(walk ? Math.sin(ph) * 0.5 : slash ? -0.4 * f : breathe * 0.03, 0, -0.09);
    L.el.rotation.x = walk ? -0.35 - Math.max(0, Math.sin(ph)) * 0.4 : -0.3;
    R.sh.rotation.set(slash ? lerp(-0.35, -2.9, f) : -0.35 + (walk ? -Math.sin(ph) * 0.1 : breathe * 0.02), 0, 0.09);
    R.el.rotation.x = slash ? lerp(-1.1, -0.45, f) : -1.1;
    J.sword.rotation.x = slash ? lerp(1.45, 1.9, f) : 1.45;
    // capa ao vento
    if (J.cape.live) {
        const g = J.cape.mesh.geometry, pos = g.attributes.position, b = J.cape.base;
        for (let i = 0; i < pos.count; i++) {
            const x = b[i * 3], y = b[i * 3 + 1];
            const hang = clamp01((J.cape.h / 2 - y) / J.cape.h);
            pos.setZ(i, -hang * (0.05 + wind * 0.28) - 0.02 + Math.sin(y * 4.2 - t * 3.2 + x * 2.6) * 0.045 * hang * (0.4 + wind) * hang);
            pos.setX(i, x * (1 + hang * 0.1));
        }
        pos.needsUpdate = true;
        g.computeVertexNormals();
    }
    if (soul) soul.intensity = 2.8 + Math.sin(t * 2.4) * 0.8;
}

// ======================= SOMBRA DE CONTATO =======================
function texturaSombra() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(0.5, 'rgba(0,0,0,.55)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
}

// ======================= PERSONAGEM COMPLETO =======================
let texturas;
const cavaleiros = [];
function criarCavaleiro(isHero) {
    const u = { rim: { value: 0 }, rimCol: { value: new THREE.Color('#9fd4ff') }, far: { value: 0 } };
    const M = criarMateriais(texturas, u);
    const levels = [0, 1, 2].map((l) => construir(l, M));
    const group = new THREE.Group();
    levels.forEach((l, i) => { l.root.visible = i === 0; group.add(l.root); });
    const sombra = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: sombraTex, transparent: true, depthWrite: false, opacity: 0.6, fog: true }));
    sombra.rotation.x = -Math.PI / 2;
    sombra.position.y = 0.025;
    sombra.scale.set(1.9, 1.5, 1);
    group.add(sombra);
    scene.add(group);
    const label = document.createElement('div');
    $('labels').appendChild(label);
    const k = { group, levels, M, u, sombra, label, level: 0, isHero, dist: 0, tint: rnd() * 6 };
    cavaleiros.push(k);
    return k;
}
const sombraTex = texturaSombra();

function todosMateriais(k) { return Object.values(k.M); }
function aplicarFog(on) { cavaleiros.forEach((k) => todosMateriais(k).forEach((m) => { if (m.fog !== on) { m.fog = on; m.needsUpdate = true; } })); }
function aplicarMip(on) {
    const ts = [].concat(...['bone', 'metal', 'cloth'].map((n) => Object.values(texturas[n])));
    ts.forEach((t) => { t.minFilter = on ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter; t.anisotropy = on ? MAX_ANISO : 1; t.needsUpdate = true; });
}

// ======================= CHÃO E CENÁRIO =======================
function chao() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d'), img = g.createImageData(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
        const n = fbm(x / 256, 1 - y / 256, 8, 4) * 0.5 + 0.5, i = (y * 256 + x) * 4;
        img.data[i] = 20 + n * 26; img.data[i + 1] = 26 + n * 28; img.data[i + 2] = 22 + n * 18; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const t = asTexture(c, true);
    t.repeat.set(60, 60);
    t.anisotropy = MAX_ANISO;
    const m = new THREE.Mesh(new THREE.CircleGeometry(200, 64), new THREE.MeshStandardMaterial({ map: t, roughness: 0.92, metalness: 0 }));
    m.rotation.x = -Math.PI / 2;
    m.receiveShadow = true;
    scene.add(m);
    // lápides espalhadas, para dar escala e profundidade
    const stones = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 1.1, 0.18), new THREE.MeshStandardMaterial({ color: '#3a4350', roughness: 0.9 }), 70);
    const d = new THREE.Object3D();
    for (let i = 0; i < 70; i++) {
        const z = 14 - rnd() * 110, side = rnd() < 0.5 ? -1 : 1;
        d.position.set(side * (6 + rnd() * 30) * (1 + (14 - z) * 0.01), 0.45, z);
        d.rotation.set((rnd() - 0.5) * 0.2, (rnd() - 0.5) * 0.7, (rnd() - 0.5) * 0.25);
        d.scale.setScalar(0.8 + rnd() * 0.9);
        d.updateMatrix();
        stones.setMatrixAt(i, d.matrix);
    }
    scene.add(stones);
}

// ======================= PÓS-PROCESSAMENTO =======================
let composer, bloomPass;
function compor() {
    composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 }));
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.4, 0.5, 0.9);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
}
function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

// ======================= LOOP =======================
const DIST_FILA = [14, 24, 36, 52, 72];
const OFFS = [-0.3, 0.3, -0.17, 0.17, -0.07];
const clock = new THREE.Clock();
const v3 = new THREE.Vector3();
let hero, fila = [];
function posicionar() {
    const d = +$('dist').value;
    $('distTxt').textContent = d.toFixed(1).replace('.0', '');
    hero.group.position.set(0, 0, 10 - d);
    fila.forEach((k, i) => {
        const D = DIST_FILA[i];
        k.group.position.set(OFFS[i] * D, 0, 10 - D);
        k.group.rotation.y = (i % 2 ? -1 : 1) * 0.35;
        k.group.visible = $('line').checked;
    });
}
function tick() {
    const t = clock.getElapsedTime();
    const mode = $('mode').value;
    const on = { fog: $('t_fog').checked, rim: $('t_rim').checked, contact: $('t_contact').checked, spec: $('t_spec').checked };
    scene.fog.density = +$('fogd').value;
    if (cavaleiros[0].M.bone.fog !== on.fog) aplicarFog(on.fog);
    const forced = $('lod').value;
    let tris = 0, vis = 0;
    cavaleiros.forEach((k) => {
        if (!k.group.visible) { k.label.style.display = 'none'; return; }
        const dist = k.dist = camera.position.distanceTo(k.group.position);
        const lvl = forced === 'auto' ? (dist < 12 ? 0 : dist < 30 ? 1 : 2) : +forced;
        if (lvl !== k.level) { k.levels[k.level].root.visible = false; k.levels[lvl].root.visible = true; k.level = lvl; }
        const lv = k.levels[lvl];
        // sombras de verdade só no cavaleiro da frente e só nos níveis detalhados
        lv.root.traverse((o) => { if (o.isMesh) o.castShadow = k.isHero && lvl < 2; });
        poser(lv.J, t + k.tint, mode, k.isHero && lvl === 0 ? soulLight : null);
        const far = smooth(10, 60, dist);
        k.u.rim.value = on.rim ? lerp(0.1, 1.4, smooth(6, 42, dist)) : 0;
        k.u.far.value = on.spec ? far : 0;
        const ns = on.spec ? 1.2 * (1 - 0.85 * far) : 1.2;
        [k.M.bone, k.M.metal, k.M.cloth].forEach((m) => m.normalScale.set(ns, ns));
        k.sombra.material.opacity = on.contact ? 0.5 + 0.35 * far : 0;
        k.sombra.scale.set(1.9 + far * 0.6, 1.5 + far * 0.5, 1);
        tris += lv.tris; vis++;
        // rótulo
        if ($('labs').checked) {
            v3.copy(k.group.position); v3.y = 3.5;
            v3.project(camera);
            const ok = v3.z < 1 && Math.abs(v3.x) < 1.05;
            k.label.style.display = ok ? 'block' : 'none';
            k.label.style.left = ((v3.x * 0.5 + 0.5) * stage.clientWidth) + 'px';
            k.label.style.top = ((-v3.y * 0.5 + 0.5) * stage.clientHeight) + 'px';
            k.label.innerHTML = `<b>${dist.toFixed(0)} m</b> · LOD ${lvl}<br>${lv.tris} tri`;
        } else k.label.style.display = 'none';
    });
    soulLight.position.set(hero.group.position.x, 2.35, hero.group.position.z + 0.3);
    moon.position.set(hero.group.position.x - 5, 9, hero.group.position.z + 6);
    moon.target.position.set(hero.group.position.x, 1.5, hero.group.position.z);
    moon.target.updateMatrixWorld();
    bloomPass.enabled = $('bloom').checked;
    controls.autoRotate = $('spin').checked;
    controls.autoRotateSpeed = 0.8;
    controls.update();
    composer.render();
    $('read').innerHTML = `Cavaleiro da frente: <b>${hero.dist.toFixed(1)} m</b>, LOD <b>${hero.level}</b> (${hero.levels[hero.level].tris} triângulos)<br>Na cena agora: ${vis} cavaleiros, <b>${tris}</b> triângulos<br><small>Os 3 níveis: ${hero.levels.map((l) => l.tris).join(' · ')} triângulos</small>`;
    requestAnimationFrame(tick);
}

// ======================= INÍCIO =======================
function iniciar() {
    texturas = construirTexturas();
    aplicarMip(true);
    chao();
    hero = criarCavaleiro(true);
    fila = DIST_FILA.map(() => criarCavaleiro(false));
    compor();
    resize();
    posicionar();
    addEventListener('resize', resize);
    ['dist', 'line'].forEach((id) => $(id).addEventListener('input', posicionar));
    $('t_mip').addEventListener('change', () => aplicarMip($('t_mip').checked));
    const tecnicas = ['t_fog', 't_rim', 't_contact', 't_spec', 't_mip'];
    const todas = (v) => { tecnicas.forEach((id) => { $(id).checked = v; }); aplicarMip(v); };
    $('alloff').onclick = () => todas(false);
    $('allon').onclick = () => todas(true);
    $('shot').onclick = () => {
        composer.render();
        const a = document.createElement('a');
        a.href = renderer.domElement.toDataURL('image/png');
        a.download = 'cavaleiro_ossario.png';
        a.click();
    };
    // parâmetros de URL para teste/captura: ?dist=7&mode=walk&lod=1&off=1&nolabels=1
    const q = new URLSearchParams(location.search);
    if (q.has('dist')) { $('dist').value = q.get('dist'); posicionar(); }
    if (q.has('mode')) $('mode').value = q.get('mode');
    if (q.has('lod')) $('lod').value = q.get('lod');
    if (q.get('off') === '1') todas(false);
    if (q.get('line') === '0') { $('line').checked = false; posicionar(); }
    $('loading').remove();
    tick();
}
setTimeout(iniciar, 30);
