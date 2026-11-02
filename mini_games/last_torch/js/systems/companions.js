import { COMPANIONS } from '../../data_model/passives.js';
import { player } from '../core/state.js';

// --- COMPANHEIROS (fênix, Grave Wisp, Shadow Raven) ---
// Em vez de parados num ponto, eles rodeiam devagar o lugar em que ficam: uma volta lenta mais um balanço que
// nunca se repete igual. E quando o herói dá o dash, demoram mais para alcançá-lo (ficam para trás e voltam).
const TAU = Math.PI * 2;

// seed: um número diferente por companheiro, para cada um rodear a seu modo
export function wander(t, seed) {
    const W = COMPANIONS.wander;
    const a = t * W.speed + seed * 2.7;
    return {
        x: Math.cos(a) * W.radius + Math.sin(t * 0.53 + seed * 2.1) * W.sway,
        y: Math.sin(a) * W.radius * 0.6 + Math.cos(t * 0.71 + seed * 1.3) * W.sway * 0.75
    };
}

// Fração da velocidade de acompanhar: cai durante o dash e um instante depois, e sobe de volta aos poucos
let follow = 1;
let afterDash = 0;

export function updateCompanions(dt) {
    const C = COMPANIONS.dashLag;
    if (player.dashTimer > 0) afterDash = C.afterSeconds;
    else afterDash = Math.max(0, afterDash - dt);
    const goal = afterDash > 0 ? C.follow : 1;
    follow += (goal - follow) * Math.min(1, dt * (goal < follow ? 12 : C.recover));
}

// A velocidade de acompanhar já com o atraso do dash
export function followRate(rate) {
    return rate * follow;
}
