import { WORLD } from '../../data_model/world.js';
import { ctx, passives, state } from '../core/state.js';
import {
    drawPhoenixSprite as drawSprite, phoenixBeak, preparePhoenix as prepare, renderPhoenixBuddy
} from '../../library/buddies/phoenix/phoenix.js';

// --- FÊNIX (Phoenix Pact) ---
// O desenho da ave é um buddy da biblioteca (library/buddies/phoenix). Aqui fica só o que é do jogo: decidir o tamanho do
// sprite pela tela e mostrar a ave quando o poder existe e ela está em campo (state.phoenix, js/systems/skills_flame.js).
const smallScreen = () => Math.min(window.innerWidth, window.innerHeight) < WORLD.mobileMaxShortSide;

export { phoenixBeak };

// Monta o atlas antes de a ave aparecer (o navegador sobe a imagem para a placa de vídeo no primeiro desenho)
export function preparePhoenix() {
    return prepare(smallScreen());
}

export function drawPhoenixSprite(x, y, size, facing, tilt, alpha = 1) {
    prepare(smallScreen());
    drawSprite(ctx, x, y, size, facing, tilt, alpha);
}

export function renderPhoenixBird() {
    const bird = state.phoenix;
    if (passives.phoenixPact.lvl <= 0 || !bird.placed) return;
    prepare(smallScreen());
    renderPhoenixBuddy(ctx, bird, state.quality);
}
