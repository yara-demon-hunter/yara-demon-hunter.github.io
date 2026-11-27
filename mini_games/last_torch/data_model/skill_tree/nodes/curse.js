// --- MALDIÇÃO: o feiticeiro. Magia, área e distância ---
// Cada nó leva o próprio `cost` (pontos de skill por nível). Para mudar um preço, edite o número aqui, no nó.
// Campos e regras dos nós: skill_tree/README.md.
import { formatPercent, req } from '../helpers.js';

export const CURSE_NODES = [

    { id: 'arcaneStudy', cost: 1, branch: 'curse', kind: 'mod', x: 0, y: 1.5, requires: [],
      name: 'Arcane Study', icon: '🧿', desc: 'Curse Path spells hit harder.',
      levelText: (mods) => `+${formatPercent(mods.curseDamage)} damage on Curse Path spells`, mods: { curseDamage: 0.01 } },
    // Linha do gelo e da força
    { id: 'chillAura', cost: 2, branch: 'curse', kind: 'power', key: 'chillAura', x: 1, y: 0, requires: [req('arcaneStudy')] },
    // Soul Nova (e a evolução que congela) DESLIGADA em 19/11/2026. No lugar dela entra o Absolute Zero, skill própria que congela. Para voltar a Soul Nova, tire os //
    { id: 'absoluteZero', cost: 2, branch: 'curse', kind: 'power', key: 'absoluteZero', x: 2, y: 0, requires: [req('chillAura', 2)] },
    // A Runa Soberana, só do Gudran (selada para os outros, com passe livre), vem depois do Absolute Zero: dá furo e explosão aos raios do cajado
    { id: 'sovereignRune', cost: 4, hero: 'gudran', branch: 'curse', kind: 'passive', key: 'sovereignRune', x: 3, y: 0, requires: [req('absoluteZero')] },
    // O Escudo de Runas, só do Gudran (selado para os outros, com passe livre): era o clique dele, agora uma skill
    { id: 'runeShield', cost: 3, hero: 'gudran', branch: 'curse', kind: 'power', key: 'runeShield', x: 0, y: 3, requires: [req('arcaneStudy')] },
    // { id: 'soulNova', branch: 'curse', kind: 'power', key: 'soulNova', x: 2, y: 0, requires: [req('chillAura', 2)] },
    // { id: 'novaEvolve', branch: 'curse', kind: 'evolve', key: 'soulNova', x: 3, y: 0, requires: [req('soulNova', 5)] },
    { id: 'starfall', cost: 4, branch: 'curse', kind: 'power', key: 'starfall', x: 4, y: 0, requires: [req('chainLightning', 2)] },
    // Linha da tempestade: à distância
    { id: 'graveWisp', cost: 4, branch: 'curse', kind: 'power', key: 'graveWisp', x: 1, y: 1, requires: [req('arcaneStudy')] },
    { id: 'occultFocus', cost: 1, branch: 'curse', kind: 'mod', x: 2, y: 1, requires: [req('graveWisp')],
      name: 'Occult Focus', icon: '🔮', desc: 'Your spells return to your hand faster.',
      levelText: (mods) => `${formatPercent(mods.spellHaste)} shorter spell recharge`, mods: { spellHaste: 0.06 } },
    { id: 'chainLightning', cost: 4, branch: 'curse', kind: 'power', key: 'chainLightning', x: 3, y: 1, requires: [req('occultFocus', 2)] },
    { id: 'wrathEvolve', cost: 4, branch: 'curse', kind: 'evolve', key: 'chainLightning', x: 4, y: 1, requires: [req('chainLightning', 5)] },
    // Linha do vazio: em área
    { id: 'creepingHex', cost: 4, branch: 'curse', kind: 'power', key: 'creepingHex', x: 1, y: 2, requires: [req('arcaneStudy')] },
    { id: 'darkKnowledge', cost: 1, branch: 'curse', kind: 'mod', x: 2, y: 2, requires: [req('creepingHex')],
      name: 'Dark Knowledge', icon: '📚', desc: 'Forbidden words hit harder.',
      levelText: (mods) => `+${formatPercent(mods.spellDamage)} spell damage`, mods: { spellDamage: 0.1 } },
    { id: 'voidRift', cost: 4, branch: 'curse', kind: 'power', key: 'voidRift', x: 3, y: 2, requires: [req('darkKnowledge', 2)] },
    { id: 'voidRiftEvolve', cost: 5, branch: 'curse', kind: 'evolve', key: 'voidRift', x: 4, y: 2, requires: [req('voidRift', 5)], },
    // Linha da morte. 27/11/2026: Corpse Burst, Red Harvest, Spectral Blades e Blade Tempest saíram do Curse Path (a Spectral Blade foi para o Blade Path). Fica o Golden Tornado, uma skill de mago
    { id: 'goldenTornado', cost: 4, branch: 'curse', kind: 'power', key: 'goldenTornado', x: 1, y: 3, requires: [req('arcaneStudy')] },
    { id: 'oathRuin', cost: 4, branch: 'curse', kind: 'passive', key: 'oathRuin', oath: true, x: 5, y: 1.5, requires: [req('wrathEvolve'), req('voidRiftEvolve')] }
];
