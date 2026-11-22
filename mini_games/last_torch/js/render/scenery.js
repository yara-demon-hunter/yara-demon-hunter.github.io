import { TORCH_VISUALS as T } from '../../data_model/visuals/scenery/torch_visual.js';
import { WORLD } from '../../data_model/world.js';
import { createScenery } from '../../library/scenery/index.js';
import { BLUE_TORCH } from '../../data_model/passives.js';
import { ctx, passives, player, state } from '../core/state.js';
import { drawGlow } from '../../library/core/glow.js';

// --- CENÁRIO NO JOGO ---
// A arte do cenário (chão, grama, vaga-lumes, névoa, vinheta) vem da biblioteca: library/scenery/<id>/, escolhido em
// WORLD.scenery. Este arquivo é só a ponte: traduz o estado da partida para o que o cenário pede (env) e cuida do que
// é regra do Last Torch, a tocha: o raio da luz acompanha a vida do núcleo, e o herói também ilumina em volta.
// Manual: mini_games/_library/scenery/README.md.

let scenery = createScenery(WORLD.scenery);

// Áreas de contato do cenário (layout gravado pelo editor; js/systems/colliders.js as usa). Lista vazia = cenário sem áreas.
// Medidas de uma área no mundo ATUAL. Áreas com `fit: [largura, altura]` (a do mundo em que foram desenhadas) ESTICAM com o mundo, como o rio
// que o cenário pinta em frações da tela; as outras (um túmulo, uma casa) mantêm o tamanho, já que o objeto também não encolhe.
export function fittedSize(c, W, H) {
    const kx = Array.isArray(c.fit) && c.fit[0] > 0 ? W / c.fit[0] : 1;
    const ky = Array.isArray(c.fit) && c.fit[1] > 0 ? H / c.fit[1] : 1;
    const w = (c.w ?? 0) * kx;
    const h = (c.h ?? 0) * ky;
    const r = (c.r ?? 0) * kx;
    return { w, h, r, ry: (c.ry ?? c.r ?? 0) * ky, cr: Math.max(0, Math.min((c.cr ?? 0) * Math.min(kx, ky), w / 2, h / 2)), kx, ky };
}

// O tipo de tela do jogo agora: o mundo do desktop, do celular deitado ou do celular em pé (cada um tem seu layout; ver library/scenery/layouts.js)
export function currentProfile() {
    if (!state.view.mobile) return 'desktop';
    return state.width >= state.height ? 'landscape' : 'portrait';
}

export function getSceneryColliders() {
    scenery.setProfile(currentProfile());
    return scenery.visual.colliders;
}

// Mostra as áreas de contato em vermelho por cima da cena (sandbox: opção "Show contact areas")
let drawColliders = false;
export function showColliders(on) {
    drawColliders = Boolean(on);
}

// Troca o cenário em tempo de execução. O jogo não chama: é para o sandbox (aba Arena) testar cenários da biblioteca.
export function setScenery(id) {
    scenery = createScenery(id);
}

const torch = { lightRadius: 0, lightTime: 0, currentLight: 0 };

// Brilho quente da tocha pintado no chão
const source = { glowColor: T.groundGlowColor, glowAlpha: T.groundGlowAlpha, radiusRatio: T.lightRadiusMaxRatio };

// Raio da luz da tocha: acompanha a vida do núcleo, com transição suave e leve tremida
function updateTorchLight(now) {
    const hpRatio = Math.max(0, Math.min(1, state.coreHp / state.coreHpMax));
    const minSide = Math.min(state.width, state.height);
    // Blue Torch: a chama azul ilumina mais longe
    const reach = passives.blueTorch.lvl > 0 ? 1 + BLUE_TORCH.light : 1;
    const target = reach * minSide * (T.lightRadiusMinRatio
        + (T.lightRadiusMaxRatio - T.lightRadiusMinRatio) * Math.pow(hpRatio, T.lightShrinkCurve));

    const dt = Math.min(0.2, torch.lightTime ? now - torch.lightTime : 0);
    torch.lightTime = now;
    torch.lightRadius = torch.lightRadius
        ? torch.lightRadius + (target - torch.lightRadius) * Math.min(1, dt * T.lightSmoothing)
        : target;

    const flicker = 1 + Math.sin(now * 11) * T.lightFlicker * 0.5 + Math.sin(now * 23.7) * T.lightFlicker * 0.5;
    torch.currentLight = torch.lightRadius * flicker;
}

// As duas luzes da noite: a tocha e, menor, a do herói (para a luta nunca sumir na névoa)
const lights = [
    { x: 0, y: 0, radius: 0, solid: 1 - T.lightEdgeSoftness, strength: 1, shape: 'plateau' },
    { x: 0, y: 0, radius: T.heroLightRadius, solid: T.heroLightSolid, strength: T.heroLightStrength, shape: 'ring' }
];

function getLights(t) {
    updateTorchLight(t);
    lights[0].x = state.coreX;
    lights[0].y = state.coreY;
    lights[0].radius = torch.currentLight;
    lights[1].x = player.x;
    lights[1].y = player.y;
    return lights;
}

// Um objeto só, reaproveitado a cada quadro
const env = {
    width: 0, height: 0, res: 1, quality: 0, danger: 0, dawn: 0, scaled: false, source, lights: getLights
};

function syncEnv() {
    env.width = state.width;
    env.height = state.height;
    env.profile = currentProfile();
    env.res = state.view.scale * state.view.pixelRatio;
    env.quality = state.quality;
    env.danger = 1 - Math.max(0, Math.min(1, state.coreHp / state.coreHpMax));
    env.dawn = state.dawn;
    env.scaled = state.zoomPunch > 0;
    return env;
}

// Pré-monta o cenário antes da partida começar
export function prepareScenery() {
    scenery.prepare(syncEnv());
}

export function renderSceneryGround() {
    scenery.renderGround(syncEnv());
    // Blue Torch: o brilho no chão (pintado uma vez, laranja) ganha por cima um azul que acompanha a luz
    if (passives.blueTorch.lvl > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, 'rgba(59, 130, 246, 0.55)', state.coreX, state.coreY, torch.currentLight * 0.55, 0.3);
        ctx.restore();
    }
}

export function renderScenerySway() {
    scenery.renderSway(syncEnv());
}

export function renderSceneryAmbient() {
    scenery.renderAmbient(syncEnv());
}

// --- QUEM PASSA ATRÁS DE UM PRÉDIO ---
// Os objetos do cenário que escondem (casa, catedral) são desenhados na camada do cenário, ATRÁS do herói. Quando o herói está dentro de uma
// "área de trás" (azul) que o editor desenhou à mão (vale para o herói e para os monstros), os prédios que escondem são redesenhados POR CIMA
// dele e uma cópia dele aparece translúcida sobre eles. O jogo não adivinha nada: só as áreas azuis mandam. A cópia é um recorte da própria tela (o que já foi desenhado ali): onde o prédio
// não cobre nada, a cópia tem os mesmos pixels e não muda a imagem; onde cobre, vira a silhueta.
const ghost = { canvas: null, g: null };
const zones = { source: null, w: 0, h: 0, list: [] };

// As áreas de trás (kind 'behind' em colliders) em coordenadas do mundo atual
function behindZones() {
    scenery.setProfile(currentProfile());
    const raw = scenery.visual.colliders;
    if (!raw || raw.length === 0) return zones.list.length ? (zones.list = [], zones.list) : zones.list;
    if (zones.source === raw && zones.w === state.width && zones.h === state.height) return zones.list;
    zones.source = raw;
    zones.w = state.width;
    zones.h = state.height;
    zones.list = [];
    for (const c of raw) {
        if (c.kind !== 'behind') continue;
        const rot = (c.rot ?? 0) * Math.PI / 180;
        const f = fittedSize(c, state.width, state.height);
        zones.list.push({ rect: c.shape === 'rect', cx: c.x * state.width, cy: c.y * state.height, hw: f.w / 2, hh: f.h / 2, r: f.r, ry: f.ry, cr: f.cr, cos: Math.cos(rot), sin: Math.sin(rot) });
    }
    return zones.list;
}

export function inZone(z, x, y) {
    const dx = x - z.cx;
    const dy = y - z.cy;
    const lx = dx * z.cos + dy * z.sin;
    const ly = -dx * z.sin + dy * z.cos;
    if (z.rect) {
        const qx = Math.max(-(z.hw - z.cr), Math.min(z.hw - z.cr, lx));
        const qy = Math.max(-(z.hh - z.cr), Math.min(z.hh - z.cr, ly));
        return Math.hypot(lx - qx, ly - qy) <= z.cr;
    }
    return (lx / Math.max(1, z.r)) ** 2 + (ly / Math.max(1, z.ry)) ** 2 <= 1;
}

// Um ponto (os pés de alguém) dentro de alguma área azul?
function insideBehindZone(x, y) {
    const list = behindZones();
    for (let i = 0; i < list.length; i++) if (inZone(list[i], x, y)) return true;
    return false;
}

const actorBoxes = [];                      // os corpos (em unidades do mundo) de quem está dentro de uma área azul neste quadro
function addActorBox(x0, y0, x1, y1) {
    actorBoxes.push({ x0, y0, x1, y1 });
}

// Quem passa atrás de um prédio: o herói e também os monstros (e convertidos). A cópia translúcida é um recorte da tela, uma vez por prédio.
export function renderSceneryOccluders() {
    const list = scenery.occluders?.();
    if (!list || list.length === 0 || behindZones().length === 0) return;
    actorBoxes.length = 0;
    if (!player.hidden && insideBehindZone(player.x, player.y)) addActorBox(player.x - 30, player.y - 78, player.x + 30, player.y + 16);
    for (const e of state.enemies) {
        if (e.hp > 0 && insideBehindZone(e.x, e.y)) { const r = e.radius ?? 20; addActorBox(e.x - r * 1.4, e.y - r * 3, e.x + r * 1.4, e.y + r * 0.8); }
    }
    for (const a of state.converts) {
        if (a.hp > 0 && insideBehindZone(a.x, a.y)) { const r = a.radius ?? 20; addActorBox(a.x - r * 1.4, a.y - r * 3, a.x + r * 1.4, a.y + r * 0.8); }
    }
    if (actorBoxes.length === 0) return;
    const alpha = WORLD.occlusion?.ghostAlpha ?? 0.42;
    for (const o of list) {
        // junta o que cada ator deixa dentro do retângulo deste prédio
        const r = o.rect;
        let ix0 = Infinity;
        let iy0 = Infinity;
        let ix1 = -Infinity;
        let iy1 = -Infinity;
        for (const a of actorBoxes) {
            const x0 = Math.max(a.x0, r.x0);
            const x1 = Math.min(a.x1, r.x1);
            const y0 = Math.max(a.y0, r.y0);
            const y1 = Math.min(a.y1, r.y1);
            if (x1 <= x0 || y1 <= y0) continue;
            ix0 = Math.min(ix0, x0); ix1 = Math.max(ix1, x1); iy0 = Math.min(iy0, y0); iy1 = Math.max(iy1, y1);
        }
        if (ix1 <= ix0) continue;
        const m = ctx.getTransform();
        const sx = Math.max(0, Math.floor(ix0 * m.a + m.e) - 1);
        const sy = Math.max(0, Math.floor(iy0 * m.d + m.f) - 1);
        const sw = Math.min(ctx.canvas.width - sx, Math.ceil((ix1 - ix0) * m.a) + 3);
        const sh = Math.min(ctx.canvas.height - sy, Math.ceil((iy1 - iy0) * m.d) + 3);
        if (sw <= 0 || sh <= 0) continue;
        if (!ghost.canvas) { ghost.canvas = document.createElement('canvas'); ghost.g = ghost.canvas.getContext('2d'); }
        if (ghost.canvas.width < sw || ghost.canvas.height < sh) { ghost.canvas.width = Math.max(sw, ghost.canvas.width); ghost.canvas.height = Math.max(sh, ghost.canvas.height); }
        ghost.g.clearRect(0, 0, sw, sh);
        ghost.g.drawImage(ctx.canvas, sx, sy, sw, sh, 0, 0, sw, sh);      // o que já está desenhado ali (herói e monstros à frente do prédio)
        scenery.drawOccluder(o);                                           // o prédio por cima de tudo
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = alpha;
        ctx.drawImage(ghost.canvas, 0, 0, sw, sh, sx, sy, sw, sh);          // a silhueta translúcida sobre o prédio
        ctx.restore();
    }
}

export function renderSceneryOverlay() {
    scenery.renderOverlay(syncEnv());
    if (drawColliders) drawColliderOutlines();
}

// A cor de uma área de contato pelo que ela barra: parede (tudo) vermelha, só corpos âmbar, só tiros verde-água (escudo)
function contactTone(c) {
    const b = c.blocks ?? {};
    const bodies = b.hero !== false || b.monsters !== false;
    const shots = (b.heroShots ?? b.shots) !== false || (b.monsterShots ?? b.shots) !== false;
    if (bodies && !shots && b.hero !== false && b.monsters === false) return ['rgba(167, 139, 250, 0.24)', 'rgba(196, 181, 253, 0.95)'];     // só o herói
    if (bodies && shots) return ['rgba(239, 68, 68, 0.22)', 'rgba(248, 113, 113, 0.95)'];
    if (bodies) return ['rgba(245, 158, 11, 0.22)', 'rgba(251, 191, 36, 0.95)'];
    return ['rgba(20, 184, 166, 0.22)', 'rgba(94, 234, 212, 0.95)'];
}

function drawColliderOutlines() {
    const list = scenery.visual.colliders ?? [];
    ctx.save();
    ctx.lineWidth = 2;
    for (const c of list) {
        ctx.save();
        ctx.translate(c.x * state.width, c.y * state.height);
        ctx.rotate((c.rot ?? 0) * Math.PI / 180);
        ctx.beginPath();
        const f = fittedSize(c, state.width, state.height);
        if (c.shape === 'rect') {
            if (f.cr > 0) ctx.roundRect(-f.w / 2, -f.h / 2, f.w, f.h, f.cr); else ctx.rect(-f.w / 2, -f.h / 2, f.w, f.h);
        } else ctx.ellipse(0, 0, f.r, f.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = c.kind === 'behind' ? 'rgba(56, 189, 248, 0.20)' : c.kind === 'slow' ? 'rgba(163, 230, 53, 0.22)' : c.kind === 'spawn' ? (c.boss ? 'rgba(217, 70, 239, 0.22)' : 'rgba(34, 197, 94, 0.22)') : contactTone(c)[0];
        ctx.fill();
        ctx.strokeStyle = c.kind === 'behind' ? 'rgba(125, 211, 252, 0.95)' : c.kind === 'slow' ? 'rgba(190, 242, 100, 0.95)' : c.kind === 'spawn' ? (c.boss ? 'rgba(240, 171, 252, 0.95)' : 'rgba(134, 239, 172, 0.95)') : contactTone(c)[1];
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();
}
