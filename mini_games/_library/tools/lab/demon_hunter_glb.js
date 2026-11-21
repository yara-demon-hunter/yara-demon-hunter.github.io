// --- LABORATÓRIO: Demon Hunter 3D (visualizador do modelo .glb e gravador do atlas do jogo) ---
// O modelo vem de fora (gerado a partir do retrato pintado, ver README.md): aqui ele é carregado, enquadrado, iluminado como a noite do jogo e animado.
// Animação: usa as animações que o .glb trouxer (parado, correr, golpe...). Sem animação, usa uma procedural (respirar, balançar, correr).
// O sprite do jogo sai daqui (?bake=1, bake_demon_hunter_glb.py): uma linha por ângulo de visão, colunas = quadros do ciclo escolhido.
// Fora dos jogos; usa o Three.js de vendor/three. Nada do Last Torch é carregado ou modificado.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = (id) => document.getElementById(id);
const BAKE = new URLSearchParams(location.search).has('bake');
const GLB_URL = new URLSearchParams(location.search).get('glb') || 'demon_hunter/hunter.glb';
const HEIGHT = 3.0;                       // altura do herói no mundo do laboratório (o modelo é escalado para isso)
const stage = $('stage');

// ======================= CENA =======================
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b10);
scene.fog = new THREE.FogExp2(0x070b10, 0.035);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;     // reflexo suave (metal da máscara, lâmina)
scene.environmentIntensity = 0.18;

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(3.6, 2.4, 5.6);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, HEIGHT * 0.5, 0);
controls.enableDamping = true;
controls.minDistance = 2; controls.maxDistance = 14;
controls.maxPolarAngle = Math.PI * 0.52;

// Luzes: lua fria de cima/lado, tocha quente de baixo/frente (como a tocha do jogo), contraluz azul que recorta a silhueta
const hemi = new THREE.HemisphereLight(0x5a7aa0, 0x0b0f14, 0.35); scene.add(hemi);
const moon = new THREE.DirectionalLight(0xa9c8ff, 1.2);
moon.position.set(-3.5, 6, 3); moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048); moon.shadow.camera.left = -4; moon.shadow.camera.right = 4; moon.shadow.camera.top = 5; moon.shadow.camera.bottom = -2; moon.shadow.bias = -0.0004;
scene.add(moon);
const torch = new THREE.PointLight(0xff8a3c, 2.2, 9, 1.6); torch.position.set(2.2, 0.9, 2.4); scene.add(torch);
const rim = new THREE.DirectionalLight(0x4aa8ff, 1.6); rim.position.set(2.5, 3.5, -4.5); scene.add(rim);

// Chão: só recebe sombra e dá a mancha da tocha (o jogo tem o seu)
const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ color: 0x0d1318, roughness: 0.95, metalness: 0 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

// Pós-processamento: brilho nas partes mais claras (lâmina rúnica, olhos). Sem isso a lâmina vira só uma cor
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.6, 0.82);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// ======================= MODELO =======================
const holder = new THREE.Group(); scene.add(holder);          // gira nos ângulos do bake
const rigPivot = new THREE.Group(); holder.add(rigPivot);     // balança na animação procedural
let model = null, mixer = null, clips = [], activeAction = null;
const procedural = { idle: true, run: true };                  // nomes das animações procedurais (quando o .glb não traz animação)

function prepare(gltf) {
    if (model) { rigPivot.remove(model); }
    model = gltf.scene;
    // Enquadra: altura = HEIGHT, pés no chão, centro no meio
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const k = HEIGHT / Math.max(size.y, 1e-6);
    model.scale.multiplyScalar(k);
    model.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(model);
    const c = box2.getCenter(new THREE.Vector3());
    model.position.x -= c.x; model.position.z -= c.z; model.position.y -= box2.min.y;
    model.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true; o.receiveShadow = true;
        if (o.material) { o.material.envMapIntensity = 1; if (o.material.map) o.material.map.anisotropy = 8; }
    });
    rigPivot.add(model);
    clips = gltf.animations || [];
    const sel = $('clip'); sel.replaceChildren();
    const add = (v, t) => { const o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o); };
    clips.forEach((a, i) => add('glb:' + i, `${a.name || 'animação ' + (i + 1)} (${a.duration.toFixed(2)}s)`));
    add('proc:idle', 'Parado (procedural)'); add('proc:run', 'Correndo (procedural)'); add('proc:none', 'Sem animação (pose do modelo)');
    // O primeiro clipe cujo nome lembra "idle/parado" (ou o primeiro) começa tocando
    const first = Math.max(0, clips.findIndex(a => /idle|parad|stand|breath/i.test(a.name)));
    sel.value = clips.length ? 'glb:' + first : 'proc:idle';
    mixer = clips.length ? new THREE.AnimationMixer(model) : null;
    playSelected();
    let tris = 0, meshes = 0; model.traverse(o => { if (o.isMesh) { meshes++; tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; } });
    $('info').textContent = `Modelo carregado.\n${meshes} malhas, ${Math.round(tris).toLocaleString('en-US')} triângulos.\n${clips.length ? clips.length + ' animação(ões) no arquivo.' : 'Sem animação no arquivo: usando a procedural.'}`;
    $('drop').classList.add('hidden');
    applySize();
}

function playSelected() {
    const v = $('clip').value;
    if (activeAction) { activeAction.stop(); activeAction = null; }
    if (v.startsWith('glb:') && mixer) { activeAction = mixer.clipAction(clips[+v.slice(4)]); activeAction.reset().play(); }
}
$('clip').addEventListener('change', playSelected);

// Animação procedural (para modelos sem esqueleto/animação): o corpo todo respira e balança em volta dos pés
function poseProcedural(t, kind) {
    rigPivot.position.set(0, 0, 0); rigPivot.rotation.set(0, 0, 0); rigPivot.scale.set(1, 1, 1);
    if (kind === 'none') return;
    if (kind === 'idle') {
        const b = Math.sin(t * Math.PI * 2 / 3.2);
        rigPivot.scale.set(1 - b * 0.004, 1 + b * 0.009, 1 - b * 0.004);
        rigPivot.rotation.z = Math.sin(t * Math.PI * 2 / 5.1) * 0.012;
        rigPivot.rotation.y = Math.sin(t * Math.PI * 2 / 7) * 0.025;
    } else {
        const p = t * Math.PI * 2 / 0.62;
        rigPivot.position.y = Math.abs(Math.sin(p * 0.5)) * 0.07;
        rigPivot.rotation.x = 0.10; rigPivot.rotation.z = Math.sin(p * 0.5) * 0.035;
        rigPivot.scale.set(1, 1 + Math.sin(p) * 0.008, 1);
    }
}
function applyPose(t) {
    const v = $('clip').value;
    if (v.startsWith('glb:') && mixer) { mixer.setTime(t); poseProcedural(0, 'none'); }
    else poseProcedural(t, v.slice(5));
}
function clipLength() {
    const v = $('clip').value;
    if (v.startsWith('glb:')) return clips[+v.slice(4)].duration;
    return v === 'proc:run' ? 0.62 : 3.2;
}

// ======================= PÁGINA =======================
function applySize() { if (model) rigPivot.scale.setScalar(1); holder.scale.setScalar(+$('size').value); }
['size'].forEach(id => $(id).addEventListener('input', applySize));
$('wire').addEventListener('change', () => { model?.traverse(o => { if (o.isMesh && o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.wireframe = $('wire').checked; }); }); });
$('moon').addEventListener('input', () => { moon.intensity = +$('moon').value; });
$('torch').addEventListener('input', () => { torch.intensity = +$('torch').value; });
$('rim').addEventListener('input', () => { rim.intensity = +$('rim').value; });
$('shot').addEventListener('click', () => { composer.render(); const a = document.createElement('a'); a.download = 'demon-hunter-3d.png'; a.href = renderer.domElement.toDataURL('image/png'); a.click(); });

function resize() {
    const w = stage.clientWidth, h = stage.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr); renderer.setSize(w, h); composer.setPixelRatio(dpr); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize); resize();

// Carregar: do arquivo padrão, ou arrastado/escolhido pelo usuário
const loader = new GLTFLoader();
function parse(buffer, base = '') { loader.parse(buffer, base, prepare, (e) => { $('info').textContent = 'Erro ao ler o modelo: ' + (e?.message || e); }); }
async function loadUrl(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status);
    const buf = await r.arrayBuffer();
    return new Promise((res, rej) => loader.parse(buf, url.replace(/[^/]*$/, ''), (g) => { prepare(g); res(g); }, rej));
}
const readFile = (f) => { const fr = new FileReader(); fr.onload = () => parse(fr.result); fr.readAsArrayBuffer(f); };
$('file').addEventListener('change', (e) => e.target.files[0] && readFile(e.target.files[0]));
window.addEventListener('dragover', (e) => { e.preventDefault(); document.body.classList.add('dragging'); });
window.addEventListener('dragleave', () => document.body.classList.remove('dragging'));
window.addEventListener('drop', (e) => { e.preventDefault(); document.body.classList.remove('dragging'); const f = e.dataTransfer.files[0]; if (f) readFile(f); });
loadUrl(GLB_URL).catch(() => { /* sem arquivo padrão: a caixa "arraste aqui" fica à vista */ });

let last = performance.now(), clock = 0;
function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    clock += dt * +$('speed').value;
    if (model) applyPose(clock % Math.max(0.1, clipLength()));
    if ($('turn').checked) holder.rotation.y += dt * 0.5;
    torch.intensity = +$('torch').value * (1 + 0.07 * (Math.sin(now / 90) * 0.5 + Math.sin(now / 57 + 1.7) * 0.3));
    controls.update();
    ($('bloom').checked ? composer : { render: () => renderer.render(scene, camera) }).render();
    requestAnimationFrame(loop);
}
if (!BAKE) requestAnimationFrame(loop);

// ======================= SPRITES (?bake=1) =======================
// Fundo transparente, câmera de três quartos como a do jogo. window.__bake(quadros, tam, yaws) devolve o atlas da animação escolhida
// (window.__clip('glb:0' | 'proc:idle' | ...)): uma linha por ângulo (yaws em graus; 0 = de frente, 90 = de lado, 180 = de costas), uma coluna por quadro.
if (BAKE) {
    // Esconde (não remove): o código ainda lê o seletor de animação e a caixa de arrastar
    ['panel', 'home', 'drop'].forEach(id => { $(id).style.display = 'none'; });
    scene.fog = null; scene.background = null; floor.visible = false;
    renderer.setClearColor(0x000000, 0);
    const bakeCam = new THREE.PerspectiveCamera(11.2, 1, 1, 90);
    const alvo = new THREE.Vector3(0, HEIGHT * 0.5, 0);
    const el = 22 * Math.PI / 180, d = 24;
    bakeCam.position.set(0, alvo.y + Math.sin(el) * d, Math.cos(el) * d);
    bakeCam.lookAt(alvo); bakeCam.updateMatrixWorld();
    window.__ready = () => !!model;
    window.__clip = (v) => { $('clip').value = v; playSelected(); };
    window.__clips = () => [...$('clip').options].map(o => o.value + ' | ' + o.textContent);
    const render = (tam) => { renderer.setPixelRatio(1); renderer.setSize(tam, tam); renderer.render(scene, bakeCam); };
    window.__bake = (quadros, tam, yaws = [0]) => {
        holder.rotation.order = 'YXZ';
        const T = clipLength();
        const cv = document.createElement('canvas'); cv.width = tam * quadros; cv.height = tam * yaws.length;
        const c = cv.getContext('2d'); c.imageSmoothingQuality = 'high';
        for (let r = 0; r < yaws.length; r++) for (let f = 0; f < quadros; f++) {
            holder.rotation.y = yaws[r] * Math.PI / 180;
            applyPose(T * f / quadros);
            render(tam * 2);
            c.drawImage(renderer.domElement, f * tam, r * tam, tam, tam);
        }
        return cv.toDataURL('image/webp', 0.88);
    };
    window.__foto = (yaw = 0, fase = 0, tam = 512) => {
        holder.rotation.order = 'YXZ'; holder.rotation.y = yaw * Math.PI / 180;
        applyPose(clipLength() * fase); render(tam);
        return renderer.domElement.toDataURL('image/png');
    };
}
