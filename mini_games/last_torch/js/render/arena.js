import { SHADOW_CLONE } from '../../data_model/passives.js';
import { HERO_HUD_VISUALS } from '../../data_model/visuals/characters/hero_hud_visual.js';
import { SHADOW_CLONE_VISUALS } from '../../data_model/visuals/characters/shadow_clone_visual.js';
import { TORCH_VISUALS as T } from '../../data_model/visuals/scenery/torch_visual.js';
import { ctx, maxUltEnergy, player, shadowClones, state } from '../core/state.js';
import { getAtkRadius } from '../systems/stats.js';
import { createTorch25D } from '../../library/objects/torch/torch25d.js';
import { TORCH25D_VISUALS } from '../../library/objects/torch/torch25d_visual.js';
import { drawHpBar } from './fx/hp_bar.js';
import { getDashedRing } from './fx/rings.js';

// --- ARENA: Núcleo e Raio de Alcance ---
// (o chão/fundo fica em scenery.js e na biblioteca de cenários)
// A tocha (Center Tower) é o objeto 2.5D da biblioteca (library/objects/torch): poste de madeira, copa com a cruz e a chama
// em atlas. Aqui fica só a regra do jogo: a chama encolhe conforme o núcleo perde vida, sem saltar de tamanho.
let shownHpRatio = 1;
let lastFlameTime = 0;
let torch = null;
let torchKey = '';

function getCoreHpRatio() {
    return Math.max(0, Math.min(1, state.coreHp / state.coreHpMax));
}

// A chama não salta de tamanho: desce suave até a vida atual
function updateShownHpRatio(now) {
    const dt = Math.min(0.1, lastFlameTime ? now - lastFlameTime : 0);
    lastFlameTime = now;
    shownHpRatio += (getCoreHpRatio() - shownHpRatio) * Math.min(1, dt * T.flameSmoothing);
    return shownHpRatio;
}

// Tamanho do fogo para a vida (0 a 1): interpola a tabela T.flameBySize
function flameSizeFor(hp) {
    const table = T.flameBySize;
    for (let i = 1; i < table.length; i++) {
        const [h0, s0] = table[i - 1];
        const [h1, s1] = table[i];
        if (hp <= h1) return s0 + (s1 - s0) * Math.max(0, (hp - h0) / (h1 - h0));
    }
    return table[table.length - 1][1];
}

// A tocha nasce na resolução da tela e no nível de detalhe atuais; recria só quando algum dos dois muda
export function prepareCore() {
    const res = state.view.scale * state.view.pixelRatio;
    const key = `${res.toFixed(3)}|${state.quality}`;
    if (key === torchKey) return;
    torchKey = key;
    torch = createTorch25D({ res, frames: TORCH25D_VISUALS.frames[state.quality] });
}

export function renderCore() {
    prepareCore();
    const t = performance.now() / 1000;
    const flame = flameSizeFor(updateShownHpRatio(t));
    torch.render(ctx, state.coreX, state.coreY, { flame, time: t });
}

function renderFuryBar() {
    const { ultEnergy, frenzyActiveTimer, frenzyDuration } = state;
    const active = frenzyActiveTimer > 0;
    const ratio = active ? frenzyActiveTimer / Math.max(0.01, frenzyDuration) : ultEnergy / maxUltEnergy;
    if (ratio <= 0) return;
    drawHpBar(ctx, active ? HERO_HUD_VISUALS.furyBarActive : HERO_HUD_VISUALS.furyBar, player.x, player.y, Math.min(1, ratio));
}

// Barrinhas da fogueira e do herói (vida e Fúria). Ficam acima da névoa para serem vistas mesmo com pouca luz
export function renderHpBars() {
    drawHpBar(ctx, T.hpBar, state.coreX, state.coreY, getCoreHpRatio());
    if (player.hidden) return;
    drawHpBar(ctx, HERO_HUD_VISUALS.hpBar, player.x, player.y, Math.max(0, Math.min(1, player.hp / player.maxHp)));
    renderFuryBar();
}

// Círculo vermelho tracejado de alcance em volta de (x, y); alpha < 1 deixa mais apagado
function drawRangeCircle(x, y, radius, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = state.frenzyActiveTimer > 0 ? 'rgba(236, 72, 153, 0.75)' : 'rgba(239, 68, 68, 0.65)';
    ctx.lineWidth = 2;
    ctx.translate(x, y);
    ctx.stroke(getDashedRing(radius, 8));
    ctx.translate(-x, -y);
    ctx.globalAlpha = 1;
}

// Raio de Alcance do herói e do Shadow Clone (o do clone um pouco mais apagado)
export function renderAttackRange() {
    for (const c of shadowClones) {
        if (!c.active) continue;
        const appear = Math.min(1, (performance.now() - c.spawnTime) / 1000 / SHADOW_CLONE_VISUALS.spawnSeconds);
        drawRangeCircle(c.x, c.y, getAtkRadius() * SHADOW_CLONE.radiusMultiplier, SHADOW_CLONE_VISUALS.rangeAlpha * appear);
    }
    if (!player.hidden) drawRangeCircle(player.x, player.y, getAtkRadius());
}
