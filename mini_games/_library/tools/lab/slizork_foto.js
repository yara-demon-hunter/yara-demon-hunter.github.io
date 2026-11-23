// --- LABORATÓRIO: Slizork, o Tirano de Lodo (chefe do Swamp) ---
// Descrição e referência: monsters/25d/slizork/art_reference/. 100% procedural (sem imagens): corpo de gosma verde-ácida translúcida que se deforma por ruído,
// bolhas e detritos flutuando por dentro, coroa de ouro gasta meio afundada, muitos olhos vermelhos que surgem e somem, braços de gosma terminando em garras
// de espada enferrujadas e serrilhadas, e um rastro corrosivo no chão. Fora dos jogos; usa o Three.js de vendor/three.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const TAU = Math.PI * 2;
let seed = 20261123;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const simplex = new SimplexNoise({ random: rnd });

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#05100a');
scene.fog = new THREE.FogExp2('#06160c', 0.028);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.2;
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
camera.position.set(8, 6, 15);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.2, 0.8);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.49;

// Luzes: lua fria por cima, brilho ácido por baixo e uma luz vermelha dos olhos
scene.add(new THREE.HemisphereLight('#7bd88f', '#0b2410', 0.55));
const moon = new THREE.DirectionalLight('#bcd8ff', 1.6);
moon.position.set(-6, 12, 8);
scene.add(moon);
const acid = new THREE.PointLight('#8aff3c', 10, 16, 1.8);
acid.position.set(0, 0.8, 0);
scene.add(acid);
const eyeLight = new THREE.PointLight('#ff2a1a', 18, 14, 1.8);
eyeLight.position.set(0, 4.2, 3.8);
scene.add(eyeLight);

// Chão do pântano: lama escura com ruído e o rastro corrosivo brilhando
function mudTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const g = c.getContext('2d');
    const img = g.createImageData(512, 512);
    for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
        const n = simplex.noise(x / 60, y / 60) * 0.5 + simplex.noise(x / 14, y / 14) * 0.25 + 0.5;
        const i = (y * 512 + x) * 4;
        img.data[i] = 14 + n * 22; img.data[i + 1] = 24 + n * 30; img.data[i + 2] = 12 + n * 12; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 6);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}
const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ map: mudTexture(), roughness: 0.55, metalness: 0.1 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const trail = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshPhysicalMaterial({ color: '#7cf02c', emissive: '#2c7a0a', emissiveIntensity: 0.25, transparent: true, opacity: 0.34, roughness: 0.08, clearcoat: 1 }));
trail.rotation.x = -Math.PI / 2;
trail.position.y = 0.03;
trail.scale.set(6.5, 6.5, 1);
scene.add(trail);

// Corpo de gosma: esfera que se deforma por ruído a cada quadro
const slimeMat = new THREE.MeshPhysicalMaterial({
    color: '#2f9c2c', emissive: '#0c4410', emissiveIntensity: 0.3, roughness: 0.16, metalness: 0, transmission: 0.2, thickness: 1.5, ior: 1.35,
    attenuationColor: new THREE.Color('#2a8a1e'), attenuationDistance: 2, clearcoat: 1, clearcoatRoughness: 0.05
});
// Esfera de vértices compartilhados (senão a gosma fica facetada ao deformar)
const smoothSphere = (detail) => { const g = new THREE.IcosahedronGeometry(1, detail); g.deleteAttribute('normal'); g.deleteAttribute('uv'); return mergeVertices(g, 1e-4); };
const body = new THREE.Mesh(smoothSphere(5), slimeMat);
const baseBody = body.geometry.attributes.position.array.slice();
const bodyGroup = new THREE.Group();
bodyGroup.add(body);
scene.add(bodyGroup);
const head = new THREE.Mesh(smoothSphere(4), slimeMat);
const baseHead = head.geometry.attributes.position.array.slice();
bodyGroup.add(head);

function deform(mesh, base, radius, t, amp, freq, squashY, offset = 0) {
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
        const n = simplex.noise4d(x * freq, y * freq, z * freq, t * 0.6 + offset);
        const r = radius * (1 + amp * n);
        pos.setXYZ(i, x * r, y * r * squashY, z * r);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
}

// Dentro da gosma: bolhas de gás subindo e detritos (ossos, crânio, moedas, farpas de metal)
const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshPhysicalMaterial({ color: '#d6ffb0', emissive: '#7ad83a', emissiveIntensity: 0.6, transparent: true, opacity: 0.55, roughness: 0.05 }), 70);
const bubbleData = Array.from({ length: 70 }, () => ({ a: rnd() * TAU, d: Math.sqrt(rnd()) * 2.2, p: rnd(), s: 0.07 + rnd() * 0.2 }));
bodyGroup.add(bubbles);
const debrisMat = { bone: new THREE.MeshStandardMaterial({ color: '#e5dcc0', roughness: 0.7 }), gold: new THREE.MeshStandardMaterial({ color: '#e0b73a', metalness: 1, roughness: 0.3 }), metal: new THREE.MeshStandardMaterial({ color: '#8a8f96', metalness: 1, roughness: 0.5 }) };
const debris = [];
function addDebris(geo, mat, x, y, z, s) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.scale.setScalar(s);
    m.userData = { x, y, z, a: rnd() * TAU, sp: 0.3 + rnd() * 0.5 };
    bodyGroup.add(m); debris.push(m);
}
const boneGeo = new THREE.CapsuleGeometry(0.08, 0.7, 4, 8);
for (let i = 0; i < 7; i++) addDebris(boneGeo, debrisMat.bone, (rnd() - 0.5) * 3, 1.2 + rnd() * 2.2, (rnd() - 0.5) * 3, 1);
addDebris(new THREE.SphereGeometry(0.42, 14, 12), debrisMat.bone, -0.9, 2.3, 0.6, 1);                   // um crânio engolido
addDebris(new THREE.SphereGeometry(0.28, 12, 10), debrisMat.bone, 1.1, 1.7, -0.9, 1);
for (let i = 0; i < 6; i++) addDebris(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 14), debrisMat.gold, (rnd() - 0.5) * 3, 1 + rnd() * 2.5, (rnd() - 0.5) * 3, 1);
for (let i = 0; i < 4; i++) addDebris(new THREE.BoxGeometry(0.08, 0.9, 0.16), debrisMat.metal, (rnd() - 0.5) * 3, 1 + rnd() * 2, (rnd() - 0.5) * 3, 1);

// Coroa corrompida: ouro gasto, joias, torta e meio afundada no alto da cabeça
const crown = new THREE.Group();
const gold = new THREE.MeshStandardMaterial({ color: '#c79a2c', metalness: 1, roughness: 0.42 });
const band = new THREE.Mesh(new THREE.TorusGeometry(1, 0.17, 10, 36), gold);
band.rotation.x = Math.PI / 2;
crown.add(band);
for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55 + (i % 2) * 0.35, 6), gold);
    spike.position.set(Math.cos(a), 0.55 + (i % 2) * 0.2, Math.sin(a));
    crown.add(spike);
    if (i % 2 === 0) {
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), new THREE.MeshStandardMaterial({ color: i % 4 === 0 ? '#e11d2e' : '#2563eb', emissive: i % 4 === 0 ? '#a00a18' : '#1030a0', emissiveIntensity: 1.6, roughness: 0.15 }));
        gem.position.set(Math.cos(a) * 1.02, 0.02, Math.sin(a) * 1.02);
        crown.add(gem);
    }
}
crown.scale.setScalar(0.8);
crown.rotation.set(0.35, 0.5, 0.55);
bodyGroup.add(crown);

// Olhos: muitos, vermelhos, que acendem e apagam na superfície
const eyes = [];
const eyeGeo = new THREE.SphereGeometry(1, 14, 12);
const eyeRing = new THREE.MeshBasicMaterial({ color: '#10060a' });
// Como na referência: dois grandes no alto da cabeça e três menores em cacho no flanco esquerdo (posições relativas à cabeça)
const EYE_SPOTS = [[0.9, 1.05, 2.15, 0.3, 1.2], [-0.9, 1.1, 2.1, 0.27, 1.2], [-1.85, 0.7, 1.15, 0.26, 1.35], [-2.0, 0.2, 0.95, 0.16, 1.2], [-1.75, 1.15, 0.7, 0.14, 1.1]];
EYE_SPOTS.forEach(([x, y, z, r, st], i) => {
    const m = new THREE.Mesh(eyeGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, 0.0, 0.0) }));
    const ring = new THREE.Mesh(eyeGeo, eyeRing);
    ring.scale.set(1.22, 1.22, 0.9);
    ring.position.z = -0.45;
    m.add(ring);
    m.userData = { x, y, z, r, st, ph: i * 1.9, small: i > 1 };
    scene.add(m); eyes.push(m);
});

// Boca escancarada: garganta escura e fios de gosma esticados entre os lábios, como na referência
const maw = new THREE.Group();
const throat = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), new THREE.MeshStandardMaterial({ color: '#031008', roughness: 0.95, metalness: 0 }));
throat.scale.set(1.35, 1.1, 0.4);
maw.add(throat);
const inner = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), new THREE.MeshStandardMaterial({ color: '#0d3a16', roughness: 0.4 }));
inner.scale.set(0.8, 0.5, 0.3);
inner.position.set(0, -0.55, 0.2);
maw.add(inner);
[-0.7, -0.15, 0.45].forEach((x, i) => {
    const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.13, 1.7, 8), slimeMat);
    strand.position.set(x * 1.3, 0.1, 0.35);
    strand.rotation.z = (i - 1) * 0.07;
    maw.add(strand);
});
scene.add(maw);

// Braços de gosma terminando em garras de espada (lâminas serrilhadas e enferrujadas)
function bladeGeometry() {
    // Garra curva de espada: larga na base, afinando em ponta, com a curva para dentro como na referência
    const sh = new THREE.Shape();
    sh.moveTo(-0.12, 0); sh.lineTo(0.12, 0); sh.lineTo(0.08, 2.2); sh.lineTo(0, 4.2); sh.lineTo(-0.07, 2.2); sh.lineTo(-0.12, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1, curveSegments: 4, steps: 1 });
    const pos = g.attributes.position;
    for (let k = 0; k < pos.count; k++) { const y = pos.getY(k); pos.setX(k, pos.getX(k) + 0.075 * y * y); }
    g.computeVertexNormals();
    return g;
}
const bladeGeo = bladeGeometry();
const rustMat = new THREE.MeshStandardMaterial({ color: '#7a5a3c', metalness: 0.85, roughness: 0.6 });
const edgeMat = new THREE.MeshStandardMaterial({ color: '#c8cdd2', metalness: 1, roughness: 0.3 });
const arms = [-1, 1].map((sd) => {
    const group = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.BufferGeometry(), slimeMat);
    group.add(tube);
    const hand = new THREE.Group();
    const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.85, 14, 12), slimeMat);
    hand.add(knuckle);
    [-1.5, -0.5, 0.5, 1.5].forEach((k) => {
        const blade = new THREE.Mesh(bladeGeo, Math.abs(k) < 1 ? edgeMat : rustMat);
        blade.rotation.set(0, 0, 0);
        blade.position.set(k * 0.45, 0, 0);
        blade.rotation.z = -k * 0.18;
        blade.scale.set(1.25, Math.abs(k) < 1 ? 1.1 : 0.95, 1.3);
        hand.add(blade);
    });
    group.add(hand);
    scene.add(group);
    return { sd, tube, hand };
});
function buildArm(arm, t, mode) {
    const sd = arm.sd;
    const swing = mode === 'walk' ? Math.sin(t * 2.4 + (sd > 0 ? Math.PI : 0)) : mode === 'idle' ? Math.sin(t * 0.9 + sd) * 0.4 : 0;
    const slash = mode === 'slash' ? Math.max(0, Math.sin(t * 2.2 + (sd > 0 ? 0 : Math.PI))) : 0;
    const shoulder = new THREE.Vector3(sd * 3.4, 1.7, 0.2);
    const elbow = new THREE.Vector3(sd * (5.0 + slash * 0.4), 1.5 + swing * 0.3 + slash * 1.3, 1.2 + swing * 0.4);
    const handPos = new THREE.Vector3(sd * (5.6 - slash * 2.8), 1.0 + slash * 1.9 - slash * slash * 1.6, 3.3 + slash * 1.6 + swing * 0.9);
    const curve = new THREE.CatmullRomCurve3([shoulder, elbow, handPos]);
    const geo = new THREE.TubeGeometry(curve, 16, 0.95, 14, false);
    arm.tube.geometry.dispose();
    arm.tube.geometry = geo;
    arm.hand.position.copy(handPos);
    // As lâminas apontam para a frente e para baixo, na direção do braço
    const dir = handPos.clone().sub(elbow).normalize();
    arm.hand.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().add(new THREE.Vector3(0, -0.55, 0.5)).normalize());
}

// Pós-processamento
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.5, 0.5, 0.9);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const dummy = new THREE.Object3D();
const clock = new THREE.Clock();
let frame = 0;
function tick() {
    const t = clock.getElapsedTime();
    const mode = $('mode').value;
    const crawl = mode === 'walk' ? Math.sin(t * 2.4) * 0.25 : 0;
    // Corpo: sobe e desce, aperta e estica
    const breathe = 1 + Math.sin(t * 1.6) * 0.035;
    if (frame % 2 === 0) {
        deform(body, baseBody, 3.1 * breathe, t, 0.09, 0.5, 0.58);
        deform(head, baseHead, 1.7 * breathe, t, 0.07, 0.9, 0.95, 5);
    }
    body.position.set(0, 1.85 + crawl * 0.2, 0);
    body.scale.set(1.45, 1, 1.15);
    head.position.set(0.5, 3.45 + crawl * 0.2, 1.1);
    head.scale.set(1.15, 1, 1.55);
    head.rotation.set(-0.28, 0.25, -0.1);
    crown.position.set(-0.55, 4.9 + crawl * 0.2, 0.55);
    bodyGroup.position.z = mode === 'walk' ? Math.sin(t * 1.2) * 0.4 : 0;
    // Bolhas subindo
    bubbleData.forEach((b, i) => {
        const k = (t * 0.18 + b.p) % 1;
        dummy.position.set(Math.cos(b.a + t * 0.2) * b.d * (1 - k * 0.3), 0.9 + k * 4.6, Math.sin(b.a + t * 0.2) * b.d * (1 - k * 0.3));
        dummy.scale.setScalar(b.s * (0.6 + k * 0.6));
        dummy.updateMatrix();
        bubbles.setMatrixAt(i, dummy.matrix);
    });
    bubbles.instanceMatrix.needsUpdate = true;
    debris.forEach((m) => {
        const u = m.userData;
        m.position.set(u.x + Math.sin(t * u.sp + u.a) * 0.35, u.y + Math.sin(t * u.sp * 1.3 + u.a) * 0.4, u.z + Math.cos(t * u.sp + u.a) * 0.35);
        m.rotation.set(t * u.sp, u.a + t * u.sp * 0.7, 0);
    });
    // Olhos: grandes sempre acesos; os pequenos acendem e apagam na superfície
    const headWorld = head.position.clone();
    eyes.forEach((e) => {
        const u = e.userData;
        const on = u.small ? THREE.MathUtils.clamp(1.5 * Math.sin(t * 1.3 + u.ph) + 1.0, 0, 1) : 1;
        e.position.set(headWorld.x + u.x, headWorld.y + u.y - 0.2, headWorld.z + u.z);
        e.scale.set(u.r * 1.5 * on + 0.001, u.r * 1.5 * (u.st ?? 1.2) * on + 0.001, u.r * 0.9);
        e.visible = on > 0.04;
    });
    maw.position.set(headWorld.x, headWorld.y - 0.15, headWorld.z + 2.45);
    eyeLight.intensity = 14 + Math.sin(t * 3) * 3;
    // Braços
    if ($('swing').checked) arms.forEach((a) => buildArm(a, t, mode));
    // Rastro no chão: respira e pulsa
    trail.scale.set(8 + Math.sin(t * 1.6) * 0.3, 6.2 + Math.cos(t * 1.3) * 0.3, 1);
    acid.intensity = 9 + Math.sin(t * 2.2) * 1.5;
    bloomPass.enabled = $('bloom').checked;
    controls.autoRotate = $('spin').checked;
    controls.autoRotateSpeed = 0.9;
    controls.update();
    composer.render();
    frame++;
    requestAnimationFrame(tick);
}
$('shot').onclick = () => {
    composer.render();
    const a = document.createElement('a');
    a.href = renderer.domElement.toDataURL('image/png');
    a.download = 'slizork.png';
    a.click();
};
arms.forEach((a) => buildArm(a, 0, 'idle'));
$('loading').remove();
tick();
