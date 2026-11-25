import { HERO_VISUALS } from '../library/characters/hunter/hero_visual.js';
import { HERO_ENTRIES, HERO_ORDER } from './characters/index.js';

// --- HERÓIS ---
// Os personagens com identidade própria (Demon Hunter, Brutos, Azael) NÃO são escritos aqui: cada um tem o seu arquivo em
// data_model/characters/ (nome, textos, vida, velocidade, bônus...), e este arquivo só os junta. Aqui ficam os heróis
// guardados (shelved), que ainda usam o formato antigo (hoje não há nenhum).
// Liberados por conquistas do Santuário (data_model/sanctuary.js). mods: mesmas chaves de js/systems/modifiers.js.
// colors: troca só o que muda na paleta do herói 2.5D; portrait: filtro CSS aplicado no retrato.
// model: boneco 2.5D ('hunter' se ausente; os outros se registram em js/render/bodies.js, ex.: 'azael' em library/characters/azael/azael25d.js);
// portraitImage: arte própria do retrato.
// free: já vem liberado, sem conquista.
// shelved: guardado por enquanto. Some da tela inicial e das conquistas, mas os dados ficam para voltar depois.
export const HEROES = {
    hunter: HERO_ENTRIES.hunter,
    rowan: HERO_ENTRIES.rowan,
    avgustino: HERO_ENTRIES.avgustino,
    gudran: HERO_ENTRIES.gudran,
    ninja: HERO_ENTRIES.ninja,
    azael: HERO_ENTRIES.azael,
    brutos: HERO_ENTRIES.brutos
};

// Ordem dos heróis nas telas de escolha: o campo `order` de cada personagem (data_model/characters/). Quem não tem
// vem depois, na ordem em que foi declarado em HEROES.
export { HERO_ORDER };
const rank = (key) => (HERO_ORDER.includes(key) ? HERO_ORDER.indexOf(key) : HERO_ORDER.length);
export const ORDERED_HEROES = Object.keys(HEROES).sort((a, b) => rank(a) - rank(b));

// Heróis que aparecem na escolha da tela inicial, na ordem de HERO_ORDER
export const ACTIVE_HEROES = ORDERED_HEROES.filter(key => !HEROES[key].shelved);

// colors em cada herói traz só o que muda; aqui vira a paleta completa
Object.values(HEROES).forEach(hero => {
    if (hero.colors) hero.colors = { ...HERO_VISUALS.colors, ...hero.colors };
});
