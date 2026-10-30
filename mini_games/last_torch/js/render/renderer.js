import { WORLD } from '../../data_model/world.js';
import { canvas, ctx, state } from '../core/state.js';
import { renderAttackRange, renderCore } from './arena.js';
import {
    renderBladeSlashes,
    renderEnemies,
    renderEnemyProjectiles,
    renderKnifeAim,
    renderKnives,
    renderParticles,
    renderGoldDrops
} from './entities.js';
import { renderFireflies, renderFogAndVignette, renderForestGrass, renderForestGround, renderTorchLight } from './forest.js';
import { renderPlayer, renderPlayerTrail } from './player.js';
import { renderPlayer25D } from './player25d.js';
import { renderReflectWard } from './reflect.js';
import { renderShadowClone } from './shadow_clone.js';

// O herói padrão é o 2.5D (js/render/player25d.js). O top-down antigo (js/render/player.js) continua
// no projeto: abra a página com ?hero=topdown para usá-lo.
const HERO_25D = new URLSearchParams(window.location.search).get('hero') !== 'topdown';

// Funde a borda do mundo com as faixas laterais/superiores (se existirem) para não haver corte seco
function renderLetterboxFade() {
    const { offsetX, offsetY } = state.view;
    const { width: w, height: h } = state;
    const fade = WORLD.letterboxFadeWidth;
    const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, WORLD.letterboxColor);
        g.addColorStop(1, 'rgba(1, 4, 10, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(rx, ry, rw, rh);
    };
    if (offsetX > 0.5) {
        edge(0, 0, fade, 0, 0, 0, fade, h);
        edge(w, 0, w - fade, 0, w - fade, 0, fade, h);
    }
    if (offsetY > 0.5) {
        edge(0, 0, 0, fade, 0, 0, w, fade);
        edge(0, h, 0, h - fade, 0, h - fade, w, fade);
    }
}

// --- RENDER LOOP ---
// A ordem das chamadas define as camadas (do fundo para a frente).
export function render() {
    // Faixas fora do mundo (quando a proporção da tela passa do limite)
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = WORLD.letterboxColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    // Nada é desenhado fora do mundo (tremor de tela, brilhos etc.)
    ctx.beginPath();
    ctx.rect(0, 0, state.width, state.height);
    ctx.clip();

    // Screen Shake offset
    if (state.shakeIntensity > 0) {
        const rx = (Math.random() - 0.5) * state.shakeIntensity;
        const ry = (Math.random() - 0.5) * state.shakeIntensity;
        ctx.translate(rx, ry);
    }

    renderForestGround();
    renderForestGrass();
    renderTorchLight();
    renderCore();
    renderAttackRange();
    renderGoldDrops();
    renderBladeSlashes();
    renderEnemyProjectiles();
    renderEnemies();
    renderKnifeAim();
    renderKnives();
    renderPlayerTrail();
    renderShadowClone();
    if (HERO_25D) renderPlayer25D();
    else renderPlayer();
    renderReflectWard();
    renderParticles();
    renderFireflies();
    renderFogAndVignette();
    renderLetterboxFade();

    ctx.restore();
}
