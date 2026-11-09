import { CHARACTER_MODEL } from '../../data_model/character.js';
import { getCharacterBase } from '../../data_model/character_bases.js';
import { ACTIVE_HEROES, HEROES } from '../../data_model/heroes.js';
import { BLADE_SKILL, KNIFE_SKILL } from '../../data_model/skills.js';
import { save } from '../core/save.js';

// --- BARRAS DE ATRIBUTO DO HERÓI (tela inicial) ---
// Como no Wild Push Smash: cada barra é o valor do herói em proporção ao melhor dos heróis ativos (a barra cheia é
// quem lidera naquele atributo; a diferença entre as barras é a diferença real). Os valores vêm dos mesmos dados do jogo (character_bases.js e mods).
const STATS = [
    // HEALTH é a vida efetiva: a vida dividida pelo dano que passa (damageTaken: o Brutos recebe menos)
    { label: 'HEALTH', value: (h, b) => CHARACTER_MODEL.baseHp * (1 + (h.mods.maxHp ?? 0)) / Math.max(0.1, 1 + (h.mods.damageTaken ?? 0)) },
    // DAMAGE é o dano da lâmina por segundo: o dano de cada golpe vezes quantos golpes por segundo (a velocidade parado conta pela metade)
    { label: 'DAMAGE', value: (h, b) => (1 + (h.mods.damage ?? 0)) * (1 + (h.mods.bladeDamage ?? 0)) / Math.max(0.2, 1 - (h.mods.attackSpeed ?? 0) - 0.5 * (h.mods.stillAttack ?? 0)) },
    { label: 'SPEED', value: (h, b) => b.player.moveSpeed },
    { label: 'DASH', value: (h, b) => b.player.dash.distance },
    // DAGGER junta o dano e o alcance da adaga num valor só (dano x alcance). noKnives (Brutos): sem adaga, fica no mínimo
    { label: 'DAGGER', value: (h, b) => (h.mods.noKnives ? 0 : (1 + (h.mods.knifeDamage ?? 0)) * KNIFE_SKILL.damageMultiplier * KNIFE_SKILL.maxRange * (1 + (h.mods.knifeRange ?? 0))) },
    // RANGE é o alcance da lâmina (a espada ou o machado), não o da adaga
    { label: 'RANGE', value: (h, b) => BLADE_SKILL.baseRadius * (1 + (h.mods.bladeRadius ?? 0)) }
];
const MIN_BAR = 12;                 // % mínimo, para a barra nunca sumir

const values = (key) => {
    const hero = HEROES[key];
    return STATS.map(stat => stat.value({ ...hero, mods: hero.mods ?? {} }, getCharacterBase(hero.model ?? 'hunter')));
};

export function renderHeroStats() {
    const panel = document.getElementById('heroAttrs');
    if (!panel) return;
    const key = ACTIVE_HEROES.includes(save.hero) ? save.hero : 'hunter';
    const hero = HEROES[key];
    const all = ACTIVE_HEROES.map(values);
    const mine = values(key);
    const rows = STATS.map((stat, i) => {
        const best = Math.max(...all.map(v => v[i]));
        const t = best > 0 ? mine[i] / best : 1;
        const percent = Math.max(MIN_BAR, Math.round(t * 100));
        return `<div class="hs-row"><span>${stat.label}</span><div class="hs-bar"><i style="width:${percent}%"></i></div></div>`;
    }).join('');
    panel.innerHTML = `<div class="hs-bars">${rows}</div>`
        + (hero.perk ? `<div class="hs-perk"><strong>${hero.perk.name}</strong><span>${hero.perk.text}</span></div>` : '');
}
