import { WORLD } from '../../data_model/world.js';
import { HEARTH_PHOENIX } from '../../data_model/passives.js';
import { drawGlow } from '../../library/core/glow.js';
import { renderNow } from '../../library/core/clock.js';
import { ctx, passives, state } from '../core/state.js';
import {
    drawPhoenixSprite as drawSprite, phoenixBeak, preparePhoenix as prepare, renderPhoenixBuddy
} from '../../library/buddies/phoenix/phoenix.js';
import { hearthPhoenixBeak, hearthPhoenixView, prepareHearthPhoenix, renderHearthPhoenix } from '../../library/buddies/hearth_phoenix/hearth_phoenix.js';

// --- FÊNIX (Phoenix Pact) ---
// O desenho da ave é um buddy da biblioteca (library/buddies/phoenix). Aqui fica só o que é do jogo: decidir o tamanho do
// sprite pela tela e mostrar a ave quando o poder existe e ela está em campo (state.phoenix, js/systems/skills_flame.js).
const smallScreen = () => Math.min(window.innerWidth, window.innerHeight) < WORLD.mobileMaxShortSide;

// Com a Blue Torch a fênix do Phoenix Pact é azul
const phoenixKind = () => (passives.blueTorch.lvl > 0 ? 'blue' : 'fire');

export { phoenixBeak, hearthPhoenixBeak, hearthPhoenixView };

// Monta o atlas antes de a ave aparecer (o navegador sobe a imagem para a placa de vídeo no primeiro desenho)
export function preparePhoenix() {
    return prepare(smallScreen(), phoenixKind());
}

export function drawPhoenixSprite(x, y, size, facing, tilt, alpha = 1) {
    prepare(smallScreen(), phoenixKind());
    drawSprite(ctx, x, y, size, facing, tilt, alpha, phoenixKind());
}

// A fênix da tocha (Flaming Phoenix): o mesmo desenho, rodeando a chama
export function renderHearthBird() {
    const bird = state.hearthBird;
    if (passives.hearthPhoenix.lvl <= 0 || !bird.placed) return;
    const kind = passives.blueTorch.lvl > 0 ? 'blue' : 'fire';
    prepareHearthPhoenix(kind, smallScreen());
    renderHearthPhoenix(ctx, bird, kind, state.quality);
    if (bird.breath > 0 && state.phase === 'HUNT') renderBreath(bird, kind);
}

// O sopro de fogo: um jato de brilhos que sai do bico, abre em cone e some na ponta. Sem estado: a posição de cada chama é função do tempo.
const BREATH_COLORS = {
    fire: { core: 'rgba(254, 240, 138, 0.95)', mid: 'rgba(251, 146, 60, 0.8)', edge: 'rgba(220, 38, 38, 0.6)' },
    blue: { core: 'rgba(219, 234, 254, 0.95)', mid: 'rgba(96, 165, 250, 0.8)', edge: 'rgba(37, 99, 235, 0.6)' }
};
function renderBreath(bird, kind) {
    const H = HEARTH_PHOENIX, C = BREATH_COLORS[kind];
    const from = { x: bird.beakX ?? bird.x, y: bird.beakY ?? bird.y };
    const dx = Math.cos(bird.breathAng), dy = Math.sin(bird.breathAng);
    const t = renderNow() / 1000;
    const fade = Math.min(1, bird.breath / 0.25, (H.breathSeconds - bird.breath) / 0.12 + 0.2);
    const count = state.quality >= 2 ? 26 : 44;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i++) {
        const u = (t * 2.4 + i / count) % 1;
        const h = (i * 0.6180339) % 1;                       // posição fixa dentro do cone (cada chama tem a sua faixa)
        const side = ((h - 0.5) * 2 * 0.85 + Math.sin(t * 5 + i * 2.7) * 0.12) * Math.tan(H.breathArc / 2) * (0.35 + u);
        const dist = u * H.breathRange;
        const x = from.x + dx * dist - dy * side * dist;
        const y = from.y + dy * dist + dx * side * dist;
        const r = 11 + u * 36;
        drawGlow(ctx, u < 0.25 ? C.core : u < 0.6 ? C.mid : C.edge, x, y, r, Math.min(1, (1.25 - u * 0.7) * fade));
    }
    drawGlow(ctx, C.core, from.x + dx * 12, from.y + dy * 12, 22, fade);
    ctx.restore();
}

export function renderPhoenixBird() {
    const bird = state.phoenix;
    if (passives.phoenixPact.lvl <= 0 || !bird.placed) return;
    prepare(smallScreen(), phoenixKind());
    renderPhoenixBuddy(ctx, bird, state.quality, phoenixKind());
}
