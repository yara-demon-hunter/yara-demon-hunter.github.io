import { PASSIVE_SKILL_MODELS } from '../../data_model/passives.js';
import { state } from '../core/state.js';

// --- EQUIPAMENTO DOS JURAMENTOS ---
// O desenho mora na biblioteca (library/characters/hunter/hero_gear.js: o Ateliê também o mostra); aqui fica só o que depende do jogo:
// qual Juramento está jurado nesta noite.
export { drawGearGround, gearParts, getOathPalette } from '../../library/characters/hunter/hero_gear.js';

// Forma do herói nesta noite: chave em OATH_VISUALS, ou null sem Juramento
export function getHeroGear() {
    return state.oath ? PASSIVE_SKILL_MODELS[state.oath].gear : null;
}
