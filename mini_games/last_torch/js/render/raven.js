import { WORLD } from '../../data_model/world.js';
import { ctx, passives, state } from '../core/state.js';
import { drawRavenSprite as drawSprite, prepareRaven as prepare, renderRavenBuddy } from '../../library/buddies/raven/raven.js';

// --- CORVO (Shadow Raven) ---
// O desenho da ave é um buddy da biblioteca (library/buddies/raven). Aqui fica só o que é do jogo: o tamanho do sprite pela
// tela e mostrar o corvo quando o poder existe e ele está em campo (state.raven, js/systems/skills_shadow.js).
const smallScreen = () => Math.min(window.innerWidth, window.innerHeight) < WORLD.mobileMaxShortSide;

export function prepareRaven() {
    return prepare(smallScreen());
}

export function drawRavenSprite(x, y, size, facing, tilt, alpha = 1, speed = 1) {
    prepare(smallScreen());
    drawSprite(ctx, x, y, size, facing, tilt, alpha, speed);
}

export function renderRavenBird() {
    const bird = state.raven;
    if (passives.shadowRaven.lvl <= 0 || !bird.placed) return;
    prepare(smallScreen());
    renderRavenBuddy(ctx, bird);
}
