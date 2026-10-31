import { HERO_25D_VISUALS as V } from '../../data_model/visuals/characters/hero25d_visual.js';
import { player } from '../core/state.js';

// --- GOLPES ESPECIAIS DO HERÓI ---
// Salto, rugido e juramento: animações longas que têm um instante de impacto. O tempo anda com a lógica
// (hit stop e câmera lenta valem), e o desenho (js/render/player25d.js) só lê player.move.
// onImpact roda uma vez, no instante impactAt da animação (data_model/visuals/characters/hero25d_visual.js).
export function startMove(kind, onImpact = null) {
    const { seconds, impactAt } = V.moves[kind];
    player.move = { kind, age: 0, seconds, impactAt, onImpact };
}

export function updateMove(dt) {
    const move = player.move;
    if (!move) return;
    move.age += dt;
    if (move.onImpact && move.age >= move.seconds * move.impactAt) {
        const hit = move.onImpact;
        move.onImpact = null;
        hit();
    }
    if (player.move === move && move.age >= move.seconds) player.move = null;
}

// Feitiço saindo: a mão livre sobe por um instante (só visual)
export function startCast() {
    player.castAge = 0;
}

export function updateCast(dt) {
    if (player.castAge >= 0) player.castAge = player.castAge + dt >= V.moves.cast.seconds ? -1 : player.castAge + dt;
}
