import { WORLD } from '../../data_model/world.js';
import { canvas, ctx, state } from '../core/state.js';
import { renderAttackRange, renderCore, renderHpBars } from './arena.js';
import {
    renderBladeSlashes,
    renderEnemies,
    renderEnemyProjectiles,
    renderKnifeAim,
    renderKnives,
    renderParticles,
    renderGoldDrops
} from './entities.js';
import { renderFireflies, renderFogAndVignette, renderForestGrass, renderForestGround } from './forest.js';
import { renderLevelUpBack, renderLevelUpFront } from './level_up.js';
import { renderPlayer, renderPlayerTrail } from './player.js';
import { renderPlayer25D } from './player25d.js';
import { HERO_25D_VISUALS } from '../../data_model/visuals/characters/hero25d_visual.js';
import { player } from '../core/state.js';
import { getHero } from '../systems/modifiers.js';
import {
    renderClearWave, renderDawn, renderFloaters, renderGibs, renderScreenFlash,
    renderShockwaves, renderStains, renderTelegraphs, renderTorchAlarm, renderWarmth
} from './effects.js';
import { setWorldView } from './fx/stamp.js';
import { renderPickups } from './pickups.js';
import { heroAnim } from './player.js';
import {
    renderBolts, renderChillAura, renderDashGhosts, renderGroundFires, renderLightning,
    renderOrbitBlades, renderStars
} from './powers.js';
import { renderReflectWard } from './reflect.js';
import { renderShadowClone } from './shadow_clone.js';

// O herói padrão é o 2.5D (js/render/player25d.js). O top-down antigo (js/render/player.js) continua
// no projeto: abra a página com ?hero=topdown para usá-lo.
const HERO_25D = new URLSearchParams(window.location.search).get('hero') !== 'topdown';

// Funde a borda do mundo com as faixas laterais/superiores (se existirem) para não haver corte seco.
// Os degradês são criados uma vez por tamanho de tela.
const fades = { key: '', edges: [] };

function buildFades() {
    const { width: w, height: h } = state;
    const fade = WORLD.letterboxFadeWidth;
    const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, WORLD.letterboxColor);
        g.addColorStop(1, 'rgba(1, 4, 10, 0)');
        return { g, rx, ry, rw, rh };
    };
    fades.edges = [];
    if (state.view.offsetX > 0.5) {
        fades.edges.push(edge(0, 0, fade, 0, 0, 0, fade, h), edge(w, 0, w - fade, 0, w - fade, 0, fade, h));
    }
    if (state.view.offsetY > 0.5) {
        fades.edges.push(edge(0, 0, 0, fade, 0, 0, w, fade), edge(0, h, 0, h - fade, 0, h - fade, w, fade));
    }
}

function renderLetterboxFade() {
    const key = `${state.width}x${state.height}|${state.view.offsetX}|${state.view.offsetY}`;
    if (fades.key !== key) {
        fades.key = key;
        buildFades();
    }
    for (const e of fades.edges) {
        ctx.fillStyle = e.g;
        ctx.fillRect(e.rx, e.ry, e.rw, e.rh);
    }
}

// --- RENDER LOOP ---
// A ordem das chamadas define as camadas (do fundo para a frente).
export function render() {
    const { scale, pixelRatio, offsetX, offsetY } = state.view;
    const letterbox = offsetX > 0.5 || offsetY > 0.5;
    const shaking = state.shakeIntensity > 0;

    // Faixas fora do mundo (quando a proporção da tela passa do limite) ou expostas pelo tremor
    if (letterbox || shaking) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = WORLD.letterboxColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let unit = pixelRatio * scale;
    let originX = pixelRatio * offsetX;
    let originY = pixelRatio * offsetY;

    ctx.save();
    // Nada é desenhado fora do mundo (tremor de tela, brilhos etc.)
    if (letterbox) {
        ctx.setTransform(unit, 0, 0, unit, originX, originY);
        ctx.beginPath();
        ctx.rect(0, 0, state.width, state.height);
        ctx.clip();
    }

    // Soco de zoom: aproxima um instante nos momentos grandes
    if (state.zoomPunch > 0) {
        const zoom = 1 + state.zoomPunch;
        originX -= (state.width / 2) * unit * state.zoomPunch;
        originY -= (state.height / 2) * unit * state.zoomPunch;
        unit *= zoom;
    }

    // Screen Shake offset
    if (shaking) {
        originX += (Math.random() - 0.5) * state.shakeIntensity * unit;
        originY += (Math.random() - 0.5) * state.shakeIntensity * unit;
    }
    setWorldView(unit, originX, originY);

    renderForestGround();
    renderForestGrass();
    if (state.quality < 2) renderStains();
    renderWarmth();
    renderGroundFires();
    renderCore();
    renderTorchAlarm();
    renderAttackRange();
    renderChillAura();
    renderTelegraphs();
    renderGoldDrops();
    renderPickups();
    renderBladeSlashes();
    renderEnemyProjectiles();
    renderEnemies();
    renderGibs();
    renderKnifeAim();
    renderKnives();
    renderBolts();
    renderPlayerTrail();
    renderDashGhosts();
    renderShadowClone();
    renderLevelUpBack();
    if (!player.hidden) {
        if (HERO_25D) renderPlayer25D(player, heroAnim, getHero().colors ?? HERO_25D_VISUALS.colors);
        else renderPlayer();
        renderOrbitBlades();
    }
    renderReflectWard();
    renderParticles();
    renderLightning();
    renderStars();
    renderShockwaves();
    renderFireflies();
    renderFogAndVignette();
    renderDawn();
    renderClearWave();
    renderHpBars();
    renderFloaters();
    renderLevelUpFront();
    if (letterbox) renderLetterboxFade();
    renderScreenFlash();

    ctx.restore();
}
