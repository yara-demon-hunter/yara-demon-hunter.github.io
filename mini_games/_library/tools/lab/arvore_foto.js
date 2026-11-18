// --- LABORATÓRIO: Árvore Ancestral (a árvore da Ancient Grove, a skill do druida) em 3D ---
// Refaz em 3D o carvalho que o jogo hoje desenha em 2D (oak.js: copa ampla, tronco antigo com o rosto-runa verde, raízes brilhantes na base),
// mas agora com volume: dá para vê-la de vários lados, ela ANDA (duas raízes-pernas, tronco que balança, copa que atrasa o movimento, galhos que
// balançam) e ATACA (galhos erguem e chicoteiam). Tudo por código; nada de imagem nem modelo. Fora dos jogos; usa o Three.js de vendor/three.
// O sprite do jogo sai daqui (?bake=1, bake_arvore.py): uma linha de quadros por ângulo de visão, colunas = andar + atacar.
//
// Organização: texturas (casca, runa, folha) → construtor de tubos (tudo que é madeira: pernas, braços, galhos, raízes) → copa (blobs + folhas
// instanciadas) → pose(modo, fase) que move tudo → página (OrbitControls, esteira de chão) e bake.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

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
const rng = mulberry32(20261118);
const simplex = new SimplexNoise({ random: rng });
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const frac = (x) => x - Math.floor(x);
const BAKE = new URLSearchParams(location.search).has('bake');

// Tempos (segundos): o atlas dá a volta nesses ciclos, então a animação fecha sem emenda
const CICLO_ANDAR = 1.5, CICLO_ATAQUE = 1.0;
const PASSO = 0.95;           // quanto o pé anda para frente e para trás
const COR_RUNA = new THREE.Color(0x5dff7a);

// ======================= TEXTURAS =======================
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(c, repX = 1, repY = 1, cor = false) {
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repX, repY); t.anisotropy = 4;
    if (cor) t.colorSpace = THREE.SRGBColorSpace; return t;
}
// Casca: sulcos compridos e verticais, cristas claras, manchas de musgo e cinza; o mesmo desenho serve de relevo
function texturaCasca(N = 256) {
    const cc = canvas(N, N), cb = canvas(N, N), a = cc.getContext('2d'), b = cb.getContext('2d');
    const ia = a.createImageData(N, N), ib = b.createImageData(N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        // Ruído tileável: o x dá a volta (cilindro), o y também
        const u = x / N * TAU, v = y / N * TAU;
        const n = (f, ax, ay) => simplex.noise4d(Math.cos(u) * f * ax, Math.sin(u) * f * ax, Math.cos(v) * f * ay, Math.sin(v) * f * ay);
        const sulco = 1 - Math.abs(n(1, 5, 0.4)) * 1.2, fino = n(1, 14, 1.0) * 0.5 + 0.5, grande = n(1, 1.5, 1.2) * 0.5 + 0.5;
        const h = clamp01(sulco * 0.75 + fino * 0.25);
        const k = (y * N + x) * 4;
        const escuro = [38, 24, 14], claro = [128, 92, 58], cinza = [96, 92, 74];
        const m = smooth(0.25, 0.85, h);
        const c = [0, 1, 2].map((i) => lerp(escuro[i], claro[i], m) * (0.85 + 0.3 * grande) + (cinza[i] - claro[i]) * 0.25 * smooth(0.6, 0.9, grande));
        ia.data[k] = c[0]; ia.data[k + 1] = c[1]; ia.data[k + 2] = c[2]; ia.data[k + 3] = 255;
        const g = h * 255; ib.data[k] = ib.data[k + 1] = ib.data[k + 2] = g; ib.data[k + 3] = 255;
    }
    a.putImageData(ia, 0, 0); b.putImageData(ib, 0, 0);
    return { map: tex(cc, 1, 1, true), bump: tex(cb) };
}
// O rosto-runa do tronco (como na arte de referência): máscara em losango com olhos, nariz e boca em linhas verdes brilhantes
function texturaRuna() {
    const W = 1024, H = 512, c = canvas(W, H), g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H * 0.46, sx = 1.0, sy = 1.0;
    const P = (pts, fechar = true) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(cx + x * sx, cy + y * sy) : g.moveTo(cx + x * sx, cy + y * sy)); if (fechar) g.closePath(); };
    const riscar = (largura, cor, brilho) => { g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = largura; g.strokeStyle = cor; g.shadowColor = '#4ade80'; g.shadowBlur = brilho; g.stroke(); };
    const desenhar = (l, cor, b) => {
        P([[0, -118], [58, -70], [64, 0], [38, 76], [0, 118], [-38, 76], [-64, 0], [-58, -70]]); riscar(l * 1.3, cor, b);          // contorno do escudo
        P([[-46, -34], [-12, -22], [-8, -2], [-40, -10]]); riscar(l, cor, b);                                                         // olho esq.
        P([[46, -34], [12, -22], [8, -2], [40, -10]]); riscar(l, cor, b);                                                             // olho dir.
        P([[0, -58], [0, 12]], false); riscar(l, cor, b);                                                                             // risco da testa ao nariz
        P([[-18, 20], [0, 40], [18, 20]], false); riscar(l, cor, b);                                                                  // nariz
        P([[-34, 58], [-16, 52], [0, 62], [16, 52], [34, 58]], false); riscar(l, cor, b);                                              // boca
        P([[-18, 70], [-10, 84], [0, 70], [10, 84], [18, 70]], false); riscar(l * 0.8, cor, b);                                       // dentes
    };
    desenhar(10, '#16a34a', 34); desenhar(6, '#4ade80', 12); desenhar(2.6, '#e8ffe8', 3);
    return tex(c, 1, 1, true);
}
// Folha: formato de folha de carvalho com nervura, recorte (alfaTest) e cor com variação
function texturaFolha() {
    const N = 128, c = canvas(N, N), g = c.getContext('2d');
    g.clearRect(0, 0, N, N);
    g.translate(N / 2, N / 2);
    g.beginPath();
    const lobos = 5;
    for (let i = 0; i <= 64; i++) {
        const a = i / 64 * TAU, r = (0.42 + 0.1 * Math.cos(a * lobos * 0.5)) * N;
        const x = Math.cos(a) * r * 0.9, y = Math.sin(a) * r * 1.0;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath(); g.fillStyle = '#fff'; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -N * 0.42); g.lineTo(0, N * 0.42); g.stroke();
    for (let i = -3; i <= 3; i++) { if (!i) continue; g.beginPath(); g.moveTo(0, i * 12); g.lineTo(Math.sign(i) * 0 + 26, i * 12 - 16); g.moveTo(0, i * 12); g.lineTo(-26, i * 12 - 16); g.stroke(); }
    return tex(c, 1, 1, true);
}

// ======================= TUBOS (tudo que é madeira) =======================
// Um tubo é uma malha de (seg+1) anéis de `rad` vértices. atualizar(pontos, raios) refaz as posições (as pernas e os galhos mudam a cada quadro).
// Musgo nas faces viradas para cima (cor por vértice) e sulcos/nós por ruído fixo do vértice.
const MUSGO = new THREE.Color(0x4f7a2e), CASCA_TINTA = new THREE.Color(0xffffff);
function Tubo({ seg = 14, rad = 8, material, u0 = 0, comp = 1, nos = 0.1, musgo = 0.5, sem = 0 }) {
    const R1 = rad + 1, nv = (seg + 1) * R1;   // anel com um vértice a mais: a emenda do UV não estica a textura
    const pos = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), cor = new Float32Array(nv * 3), idx = [];
    const ruido = new Float32Array(nv);
    for (let i = 0; i <= seg; i++) for (let j = 0; j <= rad; j++) {
        const k = i * R1 + j;
        ruido[k] = simplex.noise3d(Math.cos(j / rad * TAU) * 1.3 + sem, Math.sin(j / rad * TAU) * 1.3, i * 0.45 + sem * 3);
        uv[k * 2] = j / rad + u0; uv[k * 2 + 1] = (i / seg) * comp;
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) {
        const a = i * R1 + j, b = a + 1, c = (i + 1) * R1 + j, d = c + 1;
        idx.push(a, b, c, b, d, c);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setAttribute('color', new THREE.BufferAttribute(cor, 3));
    geo.setIndex(idx);
    const mesh = new THREE.Mesh(geo, material); mesh.frustumCulled = false;
    const N = new THREE.Vector3(), T = new THREE.Vector3(), B = new THREE.Vector3(), tmp = new THREE.Vector3();
    // pontos: array de Vector3 (seg+1); raios: função (0..1) -> raio; frente: direção que o "ângulo 0" olha (+z para o tronco)
    mesh.userData.atualizar = (pontos, raio, frente = new THREE.Vector3(0, 0, 1)) => {
        N.copy(frente);
        for (let i = 0; i <= seg; i++) {
            const a = pontos[Math.max(0, i - 1)], b = pontos[Math.min(seg, i + 1)];
            T.subVectors(b, a).normalize();
            N.addScaledVector(T, -N.dot(T)); if (N.lengthSq() < 1e-6) N.set(1, 0, 0); N.normalize();   // transporte paralelo: o anel não gira à toa
            B.crossVectors(T, N);
            const r0 = raio(i / seg);
            for (let j = 0; j <= rad; j++) {
                const k = i * R1 + j, th = j / rad * TAU;
                const r = r0 * (1 + nos * ruido[k] + 0.05 * Math.sin(th * 3 + i * 0.7 + sem));
                tmp.copy(N).multiplyScalar(Math.cos(th) * r).addScaledVector(B, Math.sin(th) * r).add(pontos[i]);
                pos[k * 3] = tmp.x; pos[k * 3 + 1] = tmp.y; pos[k * 3 + 2] = tmp.z;
            }
        }
        geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
        const nn = geo.attributes.normal.array;
        for (let k = 0; k < nv; k++) {
            const m = musgo * smooth(0.25, 0.8, nn[k * 3 + 1]) * (0.6 + 0.4 * ruido[k]);
            const f = 0.72 + 0.28 * ruido[k];
            cor[k * 3] = lerp(CASCA_TINTA.r, MUSGO.r, m) * f; cor[k * 3 + 1] = lerp(CASCA_TINTA.g, MUSGO.g, m) * f; cor[k * 3 + 2] = lerp(CASCA_TINTA.b, MUSGO.b, m) * f;
        }
        geo.attributes.color.needsUpdate = true;
    };
    mesh.userData.seg = seg;
    return mesh;
}
// Pontos de uma curva Catmull-Rom por controles
function curva(ctrl, seg) { return new THREE.CatmullRomCurve3(ctrl, false, 'catmullrom', 0.5).getSpacedPoints(seg); }
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ======================= CENA =======================
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
camera.position.set(6.5, 5.2, 11);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.9, 0); controls.enableDamping = true; controls.autoRotate = false; controls.autoRotateSpeed = 1.6; controls.maxPolarAngle = Math.PI * 0.49; controls.minDistance = 4; controls.maxDistance = 24;

const raiz = new THREE.Group(); scene.add(raiz);          // gira nos ângulos do bake
const corpo = new THREE.Group(); raiz.add(corpo);         // tronco, copa e braços: balança e sobe e desce
const hemi = new THREE.HemisphereLight(0xb9d4ff, 0x3b2c1c, 0.8); scene.add(hemi);
const sol = new THREE.DirectionalLight(0xfff1d6, 2.6); sol.position.set(-4, 7, 6); scene.add(sol);
const contra = new THREE.DirectionalLight(0x6f9bff, 0.9); contra.position.set(5, 3, -6); scene.add(contra);
const luzRuna = new THREE.PointLight(0x4ade80, 2.2, 5, 1.6); raiz.add(luzRuna);

const casca = texturaCasca();
const matCasca = new THREE.MeshStandardMaterial({ map: casca.map, bumpMap: casca.bump, bumpScale: 1.6, roughness: 0.92, metalness: 0, vertexColors: true });
casca.map.repeat.set(2, 3);
const matRaizBrilho = new THREE.MeshStandardMaterial({ color: 0x0c240a, emissive: 0x16c04a, emissiveIntensity: 1.0, roughness: 0.6 });

// ---- Tronco ----
const matTronco = matCasca.clone(); matTronco.map = tex(casca.map.image, 3, 2, true); matTronco.bumpMap = tex(casca.bump.image, 3, 2);
matTronco.emissiveMap = texturaRuna(); matTronco.emissive = COR_RUNA; matTronco.emissiveIntensity = 1.4;
const TRONCO_Y0 = 1.55, TRONCO_Y1 = 4.0;
const tronco = Tubo({ seg: 22, rad: 28, material: matTronco, u0: 0.5, comp: 1, nos: 0.07, musgo: 0.55, sem: 1.3 });
corpo.add(tronco);
const raioTronco = (t) => 0.98 * (1 + 0.22 * Math.pow(1 - smooth(0, 0.25, t), 2)) * (1 - 0.1 * smooth(0.5, 1, t)) * (0.94 + 0.06 * Math.cos(t * 9));

// ---- Pernas: duas raízes grossas com três dedos de raiz cada ----
const pernas = [-1, 1].map((lado, i) => {
    const t = Tubo({ seg: 14, rad: 12, material: matCasca, nos: 0.12, musgo: 0.35, sem: 5 + i * 3, comp: 1.4 });
    const dedos = [-1, 0, 1].map((d, j) => Tubo({ seg: 6, rad: 7, material: matCasca, nos: 0.1, musgo: 0.2, sem: 11 + j + i * 4 }));
    raiz.add(t); dedos.forEach((d) => raiz.add(d));
    return { lado, t, dedos, pe: V(0, 0, 0) };
});

// ---- Braços (galhos grossos que se abrem em galhinhos) ----
function criarBraco(lado, sem) {
    const t = Tubo({ seg: 16, rad: 10, material: matCasca, nos: 0.14, musgo: 0.6, sem, comp: 1.6 });
    corpo.add(t);
    const gal = [0, 1, 2].map((k) => { const g = Tubo({ seg: 8, rad: 6, material: matCasca, nos: 0.12, musgo: 0.4, sem: sem + 3 + k, comp: 0.8 }); corpo.add(g); return g; });
    return { lado, t, gal };
}
const bracos = [criarBraco(-1, 20), criarBraco(1, 24)];

// ---- Galhos de sustentação da copa (fixos no tronco) ----
const suportes = [[-0.5, 0.4], [0.55, 0.3], [-0.2, -0.6], [0.35, -0.55], [0, 0.1]].map(([dx, dz], i) => {
    const t = Tubo({ seg: 8, rad: 7, material: matCasca, nos: 0.14, musgo: 0.5, sem: 40 + i, comp: 0.9 }); corpo.add(t);
    t.userData.atualizar(curva([V(dx * 0.25, 3.6, dz * 0.25), V(dx * 0.8, 4.2, dz * 0.8), V(dx * 1.4, 4.75, dz * 1.4)], 8), (u) => 0.19 * (1 - 0.65 * u));
    return t;
});

// ---- Raízes que arrastam atrás (de trás do tronco) e espirais brilhantes (como na arte) ----
const arrasto = [-0.5, 0.5].map((x, i) => { const t = Tubo({ seg: 12, rad: 8, material: matCasca, nos: 0.14, musgo: 0.5, sem: 60 + i, comp: 1 }); raiz.add(t); return { x, t }; });
const espirais = [0, 1, 2, 3, 4, 5].map((i) => {
    const t = Tubo({ seg: 26, rad: 6, material: matRaizBrilho, nos: 0.05, musgo: 0, sem: 70 + i }); raiz.add(t);
    const lado = i % 2 ? 1 : -1, ang = [0.15, 0.48, 0.88][i >> 1] * Math.PI;
    return { t, lado, ang: lado > 0 ? ang : Math.PI - ang, fase: i * 1.1, giro: i % 2 ? 1 : -1 };
});

// ======================= COPA =======================
// 24 blobs (ícosaedros deformados por ruído) em camadas, escuros por baixo e claros em cima, mais ~1000 folhas em cartões instanciados.
const blobs = [];
const COPA_Y = 5.0;
function blob(cx, cy, cz, r, sy, sem) {
    let geo = new THREE.IcosahedronGeometry(1, 3); geo.deleteAttribute('normal'); geo.deleteAttribute('uv'); geo = mergeVertices(geo); const p = geo.attributes.position, c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const n = 1 + 0.28 * simplex.noise3d(x * 1.6 + sem, y * 1.6, z * 1.6) + 0.1 * simplex.noise3d(x * 4 + sem, y * 4, z * 4);
        p.setXYZ(i, x * n, y * n * sy, z * n);
        const luz = smooth(-0.9, 0.9, y);
        const verde = [lerp(0.012, 0.13, luz), lerp(0.05, 0.3, luz), lerp(0.015, 0.05, luz)];
        c.set(verde, i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }));
    m.scale.setScalar(r); m.position.set(cx, cy, cz);
    corpo.add(m);
    const b = { m, base: V(cx, cy, cz), r, sy, sem, geo };
    blobs.push(b); return b;
}
// Camadas: borda larga e baixa, meio e topo (largura de carvalho, como a arte: mais larga que alta)
for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + 0.3; blob(Math.cos(a) * 1.75, COPA_Y - 0.3 + 0.18 * Math.sin(i * 2.3), Math.sin(a) * 1.55, 0.78 + 0.1 * Math.sin(i * 5), 0.72, i); }
for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.9; blob(Math.cos(a) * 0.95, COPA_Y + 0.35, Math.sin(a) * 0.9, 0.82 + 0.08 * Math.cos(i * 3), 0.74, 20 + i); }
for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; blob(Math.cos(a) * 0.35, COPA_Y + 0.85, Math.sin(a) * 0.35, 0.78, 0.7, 40 + i); }
for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.55; blob(Math.cos(a) * 2.3, COPA_Y - 0.5, Math.sin(a) * 1.95, 0.5, 0.7, 60 + i); }   // franja baixa, as pontas
// Punhos de folhas nas pontas dos galhos (seguem a mão; posição vinda de pose)
const punhos = [blob(0, 2.4, 0, 0.42, 0.85, 90), blob(0, 2.4, 0, 0.42, 0.85, 91)];
punhos.forEach((p) => { p.mao = new THREE.Vector3(); });
// Folhas: cartões com a textura de folha, espalhados sobre a superfície dos blobs, virados para fora
const NFOLHAS = 1700;
const folhaGeo = new THREE.PlaneGeometry(0.5, 0.5);
const folhas = new THREE.InstancedMesh(folhaGeo, new THREE.MeshStandardMaterial({ map: texturaFolha(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8, vertexColors: false }), NFOLHAS);
folhas.instanceMatrix.setUsage(THREE.DynamicDrawUsage); folhas.frustumCulled = false; corpo.add(folhas);
const folhaInfo = [];
{
    const cor = new THREE.Color(), q = new THREE.Quaternion();
    for (let i = 0; i < NFOLHAS; i++) {
        const b = blobs[Math.floor(rng() * blobs.length)];
        const d = V(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1); d.y = d.y * 0.75 + 0.15; d.normalize();
        const luz = clamp01(d.y * 0.5 + 0.5 + (rng() - 0.5) * 0.25);
        cor.setRGB(lerp(0.03, 0.25, luz), lerp(0.13, 0.52, luz), lerp(0.025, 0.08, luz));
        if (rng() < 0.08) cor.lerp(new THREE.Color(0xc8a02a), 0.5);     // uma ou outra folha amarelada
        folhas.setColorAt(i, cor);
        q.setFromUnitVectors(V(0, 0, 1), d).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), rng() * TAU));
        folhaInfo.push({ b, d, q: q.clone(), s: 0.7 + rng() * 0.7, fase: rng() * TAU });
    }
}
// Muda de lugar as folhas e os blobs a cada pose (a copa balança com atraso em relação ao tronco, e as folhas tremem)
const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
function moverCopa(atraso, tremor, tempo) {
    for (const b of blobs) {
        if (b.mao) { b.m.position.copy(b.mao); b.m.updateMatrix(); continue; }
        const h = (b.base.y - COPA_Y) * 0.3;
        b.m.position.set(b.base.x + atraso.x * (1 + h) + Math.sin(tempo * TAU + b.sem) * tremor * 0.05, b.base.y + atraso.y * (1 + h), b.base.z + atraso.z * (1 + h));
        b.m.updateMatrix();
    }
    for (let i = 0; i < NFOLHAS; i++) {
        const f = folhaInfo[i], b = f.b;
        _p.copy(f.d).multiplyScalar(b.r * 1.12).setY(f.d.y * b.r * 1.12 * b.sy).add(b.m.position);
        const e = 1 + 0.12 * Math.sin(tempo * TAU * 2 + f.fase) * tremor;
        _s.setScalar(f.s * e * (b.mao ? 0.6 : 1));
        _m.compose(_p, f.q, _s); folhas.setMatrixAt(i, _m);
    }
    folhas.instanceMatrix.needsUpdate = true;
}

// ======================= POSE =======================
// modo 'andar' (fase 0..1 = um ciclo de dois passos), 'ataque' (fase 0..1) ou 'parada' (respirando)
const bez = (a, b, t) => a + (b - a) * t;
function passo(q) {
    // q 0..1: apoio (0..0.55, o pé desliza para trás no chão) e balanço (0.55..1, o pé sobe e vai para frente)
    if (q < 0.55) return { z: PASSO * (1 - 2 * q / 0.55), alt: 0 };
    const u = (q - 0.55) / 0.45;
    return { z: PASSO * (-1 + 2 * smooth(0, 1, u)), alt: Math.sin(u * Math.PI) * 0.6 };
}
const estado = { modo: 'andar', runa: true };
function pose(modo, fase, tempo = 0) {
    const s = Math.sin, c = Math.cos;
    let bob = 0, balanco = 0, inclina = 0, avanco = 0, ataque = 0;
    const respira = s(fase * TAU) * 0.5 + 0.5;
    if (modo === 'andar') { bob = -0.09 * (0.5 + 0.5 * c(fase * TAU * 2)) ; balanco = 0.07 * s(fase * TAU); inclina = 0.045; }
    else if (modo === 'ataque') {
        // 0..0.35 ergue (corpo recua), 0.35..0.5 golpe rápido (corpo avança), 0.5..1 volta devagar
        const a = fase < 0.35 ? smooth(0, 1, fase / 0.35) * -1 : fase < 0.5 ? -1 + 2 * smooth(0, 1, (fase - 0.35) / 0.15) : 1 - smooth(0, 1, (fase - 0.5) / 0.5);
        ataque = a; avanco = Math.max(0, a) * 0.28; inclina = a * 0.08; bob = -0.05 * Math.max(0, a);
    } else { bob = -0.025 * respira; balanco = 0.02 * s(fase * TAU); }
    corpo.position.set(balanco, bob + (modo === 'parada' ? 0 : 0), avanco);
    corpo.rotation.set(inclina, 0, -balanco * 0.55);
    corpo.updateMatrixWorld(true);

    // Tronco: curva em S suave que acompanha o balanço
    const ptsT = []; for (let i = 0; i <= 22; i++) { const t = i / 22; ptsT.push(V(0.06 * s(t * 3 + 0.4) + 0.05 * t * s(fase * TAU), lerp(TRONCO_Y0 - 0.05, TRONCO_Y1, t), 0.04 * s(t * 5))); }
    tronco.userData.atualizar(ptsT, raioTronco, V(0, 0, 1));
    luzRuna.position.set(0, 2.7 + bob, 1.5); luzRuna.intensity = estado.runa ? 2.4 + 0.5 * s(tempo * 3.3) : 0;
    matTronco.emissiveIntensity = estado.runa ? 1.35 + 0.35 * s(tempo * 3.3) + (modo === 'ataque' ? 0.6 * Math.max(0, ataque) : 0) : 0;

    // Pernas: raízes grossas com passos pesados. Quadril no pé do tronco; pé no chão, com os três dedos de raiz
    pernas.forEach((p, i) => {
        const q = frac(fase * (modo === 'andar' ? 1 : 0) + (i ? 0.5 : 0));
        const st = modo === 'andar' ? passo(q) : { z: modo === 'ataque' ? (i ? 0.2 : -0.12) * 1 + avanco * 0.5 : 0, alt: 0 };
        const x = p.lado * 0.62 + p.lado * 0.04 * st.alt;
        const quadril = V(p.lado * 0.42 + corpo.position.x * 0.8, 1.75 + bob, corpo.position.z * 0.6 + 0.02);
        const pe = V(x, 0.14 + st.alt, st.z + (modo === 'ataque' ? 0 : 0.0));
        p.pe.copy(pe);
        const joelho = V(p.lado * 0.88, lerp(quadril.y, pe.y, 0.5) + 0.12 + st.alt * 0.35, lerp(quadril.z, pe.z, 0.5) + 0.12 + st.alt * 0.25);
        const ctrl = [quadril, V(lerp(quadril.x, joelho.x, 0.7), lerp(quadril.y, joelho.y, 0.7), lerp(quadril.z, joelho.z, 0.7)), joelho, V(lerp(pe.x, joelho.x, 0.3), lerp(pe.y, joelho.y, 0.3) + 0.04, lerp(pe.z, joelho.z, 0.3)), pe];
        p.t.userData.atualizar(curva(ctrl, 14), (u) => lerp(0.5, 0.28, u) * (1 + 0.1 * Math.cos(u * 6)), V(0, 0, 1));
        // Dedos: três raízes curtas abrindo-se do pé, inclinando com o pé que sobe
        p.dedos.forEach((d, j) => {
            const ang = (j - 1) * 0.62 + p.lado * 0.1, len = 0.5 - 0.08 * Math.abs(j - 1);
            const dir = V(Math.sin(ang), 0, Math.cos(ang));
            const base = pe.clone().add(V(0, 0.02, -0.05));
            const ponta = pe.clone().addScaledVector(dir, len).add(V(0, -0.1 + st.alt * 0.3 * (j === 1 ? 1 : 0.5), 0));
            const meio = base.clone().lerp(ponta, 0.5).add(V(0, 0.08, 0));
            d.userData.atualizar(curva([base, meio, ponta], 6), (u) => lerp(0.17, 0.05, u), V(0, 1, 0));
        });
    });

    // Braços: balançam contra as pernas; no ataque erguem e batem. Pontas se abrem em três galhinhos com folhas
    bracos.forEach((b, i) => {
        const l = b.lado, ombro = V(l * 0.8, 3.3, 0.0);
        let cotovelo, mao;
        if (modo === 'ataque') {
            // repouso → braço aberto para trás (0..0.35) → golpe para frente e para baixo (0.35..0.5) → segura → volta (0.62..1); o braço de trás atrasa um pouco
            const f = clamp01(fase - (i ? 0.04 : 0));
            const rc = V(l * 1.55, 3.4, 0.1), rm = V(l * 1.95, 2.35, 0.4), wc = V(l * 1.95, 3.75, -0.6), wm = V(l * 2.5, 3.7, -1.3), hc = V(l * 1.1, 3.1, 1.0), hm = V(l * 0.9, 1.0, 2.5);
            let u;
            if (f < 0.35) { u = smooth(0, 1, f / 0.35); cotovelo = rc.lerp(wc, u); mao = rm.lerp(wm, u); }
            else if (f < 0.5) { u = smooth(0, 1, (f - 0.35) / 0.15); cotovelo = wc.lerp(hc, u); mao = wm.lerp(hm, u); }
            else if (f < 0.62) { cotovelo = hc; mao = hm.add(V(0, 0.05 * Math.sin((f - 0.5) * 80), 0)); }
            else { u = smooth(0, 1, (f - 0.62) / 0.38); cotovelo = hc.lerp(rc, u); mao = hm.lerp(rm, u); }
        } else {
            const sw = modo === 'andar' ? s(fase * TAU + (i ? 0 : Math.PI)) : 0.25 * s(fase * TAU + i);
            const z = 0.45 * sw;
            cotovelo = V(l * 1.55, 3.4 + 0.05 * c(fase * TAU * 2), 0.1 + z * 0.6);
            mao = V(l * 1.95, 2.35 + 0.08 * c(fase * TAU * 2 + i), 0.4 + z);
        }
        const ctrl = [ombro, V(lerp(ombro.x, cotovelo.x, 0.6), lerp(ombro.y, cotovelo.y, 0.6) + 0.15, lerp(ombro.z, cotovelo.z, 0.6)), cotovelo, V(lerp(cotovelo.x, mao.x, 0.55), lerp(cotovelo.y, mao.y, 0.55) - 0.1, lerp(cotovelo.z, mao.z, 0.55)), mao];
        punhos[i].mao.copy(mao);
        b.t.userData.atualizar(curva(ctrl, 16), (u) => lerp(0.44, 0.14, u) * (1 + 0.12 * Math.cos(u * 7)), V(0, 0, 1));
        b.gal.forEach((g, k) => {
            const abre = (k - 1) * 0.55, base = mao.clone();
            const dir = V(l * 0.55 + abre * 0.4, -0.55 + (k === 1 ? 0.15 : 0), 0.4 + abre * 0.7).normalize();
            const ponta = base.clone().addScaledVector(dir, 0.62 - 0.08 * Math.abs(k - 1));
            const meio = base.clone().lerp(ponta, 0.5).add(V(0, 0.09, 0));
            g.userData.atualizar(curva([base, meio, ponta], 8), (u) => lerp(0.1, 0.02, u), V(0, 0, 1));
        });
    });

    // Raízes arrastando atrás e espirais brilhantes ao redor dos pés (ondulam com o tempo)
    arrasto.forEach((a, i) => {
        const w = s(fase * TAU + i * 2) * 0.12;
        a.t.userData.atualizar(curva([V(a.x * 0.8, 1.4 + bob, -0.5), V(a.x * 1.5 + w, 0.5, -1.0), V(a.x * 2.1 + w * 1.5, 0.16, -1.5), V(a.x * 2.4 + w, 0.1, -2.1)], 12), (u) => lerp(0.32, 0.07, u), V(0, 1, 0));
    });
    espirais.forEach((e) => {
        const cresce = 0.8 + 0.2 * s(fase * TAU + e.fase), pts = [];
        const ox = e.lado * (1.35 + 0.15 * s(e.fase)), oz = [0.45, 0.1, -0.5][Math.floor(espirais.indexOf(e) / 2)] + (modo === 'andar' ? 0 : 0);
        for (let i = 0; i <= 26; i++) {
            const u = i / 26, th = u * TAU * 1.15 * e.giro + e.fase, r = 0.5 * (1 - u * 0.78) * cresce;
            pts.push(V(ox + c(th) * r * e.lado * 0.7 * -1 * -1, 0.1 + 0.26 * smooth(0.1, 1, u) * (0.7 + 0.3 * cresce) + 0.02, oz + s(th) * r));
        }
        e.t.userData.atualizar(pts, (u) => lerp(0.11, 0.03, u), V(0, 1, 0));
    });

    // Copa: atrasa o balanço do tronco; no golpe sacode
    const atraso = V(-balanco * 1.6 - (modo === 'ataque' ? 0 : 0), (modo === 'andar' ? 0.05 * c(fase * TAU * 2 + 1) : 0) + (modo === 'ataque' ? 0.12 * Math.abs(ataque) : 0), -avanco * 0.5 - (modo === 'andar' ? 0.07 * s(fase * TAU) : 0));
    moverCopa(atraso, modo === 'ataque' ? 1.4 : modo === 'andar' ? 1 : 0.6, tempo);
}
function iniciarCena() {
    // Os blobs da copa seguem corpo; as posições vêm de moverCopa
    pose('andar', 0, 0);
}

// ======================= PÁGINA =======================
let chao, texChao;
function criarChao() {
    const c = canvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#16231a'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${40 + rng() * 40},${70 + rng() * 60},${30 + rng() * 30},${0.2 + rng() * 0.4})`; g.fillRect(rng() * 256, rng() * 256, 1 + rng() * 2, 2 + rng() * 5); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(70,64,56,${0.35 + rng() * 0.4})`; g.beginPath(); g.ellipse(rng() * 256, rng() * 256, 3 + rng() * 5, 2 + rng() * 3, rng() * 3, 0, TAU); g.fill(); }
    texChao = tex(c, 6, 6, true);
    chao = new THREE.Mesh(new THREE.CircleGeometry(11, 48), new THREE.MeshStandardMaterial({ map: texChao, roughness: 1 }));
    chao.rotation.x = -Math.PI / 2; scene.add(chao);
    scene.background = new THREE.Color(0x0a1220); scene.fog = new THREE.Fog(0x0a1220, 14, 30);
    renderer.setClearColor(0x0a1220, 1);
}
let ultimo = 0, quadros = 0, tFps = 0, tAnim = 0;
function loop(ms) {
    const t = ms / 1000, dt = Math.min(0.1, t - ultimo); ultimo = t;
    const modo = estado.modo, ciclo = modo === 'ataque' ? CICLO_ATAQUE : CICLO_ANDAR;
    tAnim += dt * (modo === 'parada' ? 0.6 : 1) * estado.velocidade;
    const fase = window.__fase ?? frac(tAnim / ciclo);
    pose(modo, fase, tAnim / ciclo);
    // Esteira: o chão anda para trás na mesma velocidade que o pé desliza, para o pé não patinar
    if (modo === 'andar') texChao.offset.y -= dt * estado.velocidade * (2 * PASSO / (0.55 * CICLO_ANDAR)) / 11 * 6 * -1;
    controls.update();
    renderer.render(scene, camera);
    quadros++; tFps += dt;
    if (tFps > 0.5) { $('fps').textContent = `${Math.round(quadros / tFps)} quadros/s`; quadros = 0; tFps = 0; }
    requestAnimationFrame(loop);
}
function ligar() {
    document.querySelectorAll('input[name=modo]').forEach((el) => el.addEventListener('change', () => { estado.modo = el.value; tAnim = 0; }));
    $('runa').addEventListener('change', () => { estado.runa = $('runa').checked; });
    $('spin').addEventListener('change', () => { controls.autoRotate = $('spin').checked; });
    $('vel').addEventListener('input', () => { estado.velocidade = +$('vel').value; });
    const setar = () => { const w = stage.clientWidth, h = stage.clientHeight; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * +$('quality').value); renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    $('quality').addEventListener('change', setar); window.addEventListener('resize', setar); setar();
    $('shot').addEventListener('click', () => { renderer.render(scene, camera); const a = document.createElement('a'); a.download = 'arvore-ancestral.png'; a.href = renderer.domElement.toDataURL('image/png'); a.click(); });
    estado.velocidade = 1;
}

// ======================= SPRITES (?bake=1) =======================
// Fundo transparente, câmera de três quartos parecida com a do jogo. window.__bake(andar, ataque, tam, yaws) devolve o atlas:
// uma linha por ângulo (yaws, em graus; 0 = de frente, 90 = de lado, 180 = de costas), colunas = quadros de andar e depois de ataque.
function bake() {
    document.getElementById('panel')?.remove(); document.getElementById('home')?.remove();
    scene.fog = null; chao && (chao.visible = false); scene.background = null;
    renderer.setClearColor(0x000000, 0);
    hemi.intensity = 0.8;
    const alvo = new THREE.Vector3(0, 3.0, 0);
    const cam = new THREE.PerspectiveCamera(11.2, 1, 1, 90);
    const az = 90 * Math.PI / 180, el = 22 * Math.PI / 180, d = 36;
    cam.position.set(alvo.x + Math.cos(az) * Math.cos(el) * d, alvo.y + Math.sin(el) * d, alvo.z + Math.sin(az) * Math.cos(el) * d);
    cam.lookAt(alvo); cam.updateMatrixWorld();
    window.__camBake = cam;
    window.__bake = (andar, ataque, tam, yaws = [0]) => {
        raiz.rotation.order = 'YXZ';
        const grande = tam * 2;
        renderer.setPixelRatio(1); renderer.setSize(grande, grande);
        const cols = andar + ataque;
        const cv = document.createElement('canvas'); cv.width = tam * cols; cv.height = tam * yaws.length;
        const c = cv.getContext('2d'); c.imageSmoothingQuality = 'high';
        for (let r = 0; r < yaws.length; r++) for (let f = 0; f < cols; f++) {
            raiz.rotation.y = yaws[r] * Math.PI / 180;
            const modo = f < andar ? 'andar' : 'ataque', fase = f < andar ? f / andar : (f - andar) / ataque;
            pose(modo, fase, fase);
            luzRuna.position.applyAxisAngle(V(0, 1, 0), 0);
            renderer.render(scene, cam);
            c.drawImage(renderer.domElement, f * tam, r * tam, tam, tam);
        }
        return cv.toDataURL('image/webp', 0.88);
    };
    // Uma foto solta (ângulo e modo qualquer), para conferir: devolve PNG
    window.__foto = (modo, fase, yaw, tam = 512) => {
        raiz.rotation.order = 'YXZ'; raiz.rotation.y = yaw * Math.PI / 180;
        renderer.setPixelRatio(1); renderer.setSize(tam, tam);
        pose(modo, fase, fase); renderer.render(scene, cam);
        return renderer.domElement.toDataURL('image/png');
    };
    window.__lab = { bake: true, ok: true, matTronco, tronco, pose };
}

function iniciar() {
    const t0 = performance.now();
    estado.velocidade = 1;
    if (!BAKE) criarChao();
    pose('andar', 0, 0);
    renderer.setSize(stage.clientWidth || 256, stage.clientHeight || 256);
    if (BAKE) { bake(); $('loading').remove(); return; }
    ligar();
    window.__lab = { scene, camera, renderer, pose, estado, tempoMs: Math.round(performance.now() - t0) };
    $('loading').remove();
    requestAnimationFrame(loop);
}
requestAnimationFrame(() => setTimeout(() => { try { iniciar(); } catch (e) { console.error(e); $('loading').textContent = 'Erro: ' + e.message + '\n(veja o console, F12)'; } }, 30));
