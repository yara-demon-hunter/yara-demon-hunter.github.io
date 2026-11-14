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
import { renderFuryTrails, renderFurySwords } from './fury.js';
import { renderSceneryAmbient, renderSceneryGround, renderSceneryOverlay, renderScenerySway } from './scenery.js';
import { renderLevelUpBack, renderLevelUpFront } from './level_up.js';
import { renderPlayer, renderPlayerTrail } from './player.js';
import { renderPlayer25D } from './player25d.js';
import { HERO_25D_VISUALS } from '../../library/characters/hunter/hero25d_visual.js';
import { passives, player } from '../core/state.js';
import { getHero } from '../systems/modifiers.js';
import {
    renderClearWave, renderDawn, renderFloaters, renderGibs, renderScreenFlash,
    renderShockwaves, renderStains, renderTelegraphs, renderTorchAlarm, renderWarmth
} from './effects.js';
import { setWorldView } from './fx/stamp.js';
import { renderRavenBird } from './raven.js';
import { renderPhoenixBird } from './phoenix.js';
import { renderPickups } from './pickups.js';
import { renderShackle } from './shackle.js';
import { heroAnim } from './player.js';
import {
    renderBolts, renderChillAura, renderDashGhosts, renderGroundFires, renderLightning,
    renderOrbitBlades, renderStars
} from './powers.js';
import { renderReflectWard } from './reflect.js';
import { renderGuardianWard, renderSnares } from './druid.js';
import { renderLightFront, renderLightGround } from './light.js';
import { renderNatureFront, renderNatureGround, renderRoots, renderSpiritWolves } from './nature.js';
import { renderShadowClone } from './shadow_clone.js';
import { getHeroGear, getOathPalette } from './hero_gear.js';
import {
    renderCracks, renderCrescents, renderFireRing, renderMonsterCurses, renderPhoenix, renderRifts,
    renderShield, renderSkillAuras, renderSkillHits, renderSmokes, renderWisp
} from './skills.js';

// O herói padrão é o 2.5D (js/render/player25d.js). O top-down antigo (js/render/player.js, desenho em
// library/characters/hunter/hero_topdown.js) continua no projeto: abra a página com ?hero=topdown para usá-lo.
const HERO_25D = new URLSearchParams(window.location.search).get('hero') !== 'topdown';

// Herói com a forma do Juramento da noite, se houver
// O herói e o que anda com ele (auras, lâminas em órbita, escudo, fênix, corvo)
function renderHeroBlock() {
    if (player.hidden) return;
    renderSkillAuras();
    if (HERO_25D) renderHero();
    else renderPlayer();
    renderOrbitBlades();
    renderShield();
    renderWisp();
    renderPhoenixBird();
    renderRavenBird();
}

// Blessed Blade: a lâmina amarela, com brilho forte e faíscas de raio (js/render/player25d.js). Montada uma vez por paleta, sem criar objeto por quadro
const BLESSED_BLADE_COLORS = { blade: '#fde047', bladeCore: '#fffde7', runes: '#fef9c3', bladeGlow: '#facc15', bladeGlowSoft: 'rgba(250, 204, 21, 0.85)', bladeGlowSoftFrenzy: 'rgba(253, 224, 71, 0.95)' };
const blessedPalettes = new WeakMap();
function blessedPalette(colors) {
    let p = blessedPalettes.get(colors);
    if (!p) blessedPalettes.set(colors, p = { ...colors, ...BLESSED_BLADE_COLORS });
    return p;
}

function renderHero() {
    const gear = getHeroGear();
    const hero = getHero();
    const colors = getOathPalette(gear, hero.colors ?? HERO_25D_VISUALS.colors);
    renderPlayer25D(player, heroAnim, passives.blessedBlade.lvl > 0 ? blessedPalette(colors) : colors, gear, hero.model);
}

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

    renderSceneryGround();
    renderScenerySway();
    if (state.quality < 2) renderStains();
    renderCracks();
    renderWarmth();
    renderGroundFires();
    renderFireRing();
    renderTorchAlarm();
    renderAttackRange();
    renderChillAura();
    renderRifts();
    renderNatureGround();
    renderLightGround();
    renderSnares();
    renderTelegraphs();
    renderGoldDrops();
    renderPickups();
    renderBladeSlashes();
    renderEnemyProjectiles();
    // Profundidade 2.5D: quem está atrás da base da tocha (mais acima na tela) é desenhado antes dela, e ela o cobre;
    // quem está na frente vem depois e passa por cima dela
    const heroBehind = !player.hidden && player.y < state.coreY;
    renderEnemies('behind', state.coreY);
    if (heroBehind) renderHeroBlock();
    renderCore();
    renderEnemies('front', state.coreY);
    renderRoots();
    renderSpiritWolves();
    renderMonsterCurses();
    renderShackle();
    renderSmokes();
    renderGibs();
    renderKnifeAim();
    renderKnives();
    renderBolts();
    renderPlayerTrail();
    renderDashGhosts();
    renderShadowClone();
    renderLevelUpBack();
    if (!heroBehind) renderHeroBlock();
    renderFuryTrails();
    renderFurySwords();
    renderGuardianWard();
    renderNatureFront();
    renderLightFront();
    renderReflectWard();
    renderCrescents();
    renderSkillHits();
    renderPhoenix();
    renderParticles();
    renderLightning();
    renderStars();
    renderShockwaves();
    renderSceneryAmbient();
    renderSceneryOverlay();
    renderDawn();
    renderClearWave();
    renderHpBars();
    renderFloaters();
    renderLevelUpFront();
    if (letterbox) renderLetterboxFade();
    renderScreenFlash();

    ctx.restore();
}
