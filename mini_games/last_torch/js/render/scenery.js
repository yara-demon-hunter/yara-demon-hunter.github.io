import { TORCH_VISUALS as T } from '../../data_model/visuals/scenery/torch_visual.js';
import { WORLD } from '../../data_model/world.js';
import { createScenery } from '../../library/scenery/index.js';
import { player, state } from '../core/state.js';

// --- CENÁRIO NO JOGO ---
// A arte do cenário (chão, grama, vaga-lumes, névoa, vinheta) vem da biblioteca: library/scenery/<id>/, escolhido em
// WORLD.scenery. Este arquivo é só a ponte: traduz o estado da partida para o que o cenário pede (env) e cuida do que
// é regra do Last Torch, a tocha: o raio da luz acompanha a vida do núcleo, e o herói também ilumina em volta.
// Manual: mini_games/_library/scenery/README.md.

const scenery = createScenery(WORLD.scenery);

const torch = { lightRadius: 0, lightTime: 0, currentLight: 0 };

// Brilho quente da tocha pintado no chão
const source = { glowColor: T.groundGlowColor, glowAlpha: T.groundGlowAlpha, radiusRatio: T.lightRadiusMaxRatio };

// Raio da luz da tocha: acompanha a vida do núcleo, com transição suave e leve tremida
function updateTorchLight(now) {
    const hpRatio = Math.max(0, Math.min(1, state.coreHp / state.coreHpMax));
    const minSide = Math.min(state.width, state.height);
    const target = minSide * (T.lightRadiusMinRatio
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
}

export function renderScenerySway() {
    scenery.renderSway(syncEnv());
}

export function renderSceneryAmbient() {
    scenery.renderAmbient(syncEnv());
}

export function renderSceneryOverlay() {
    scenery.renderOverlay(syncEnv());
}
