// --- MALDIÇÃO: o feiticeiro. Magia, área e distância ---
// Cada nó leva o próprio `cost` (pontos de skill por nível). Para mudar um preço, edite o número aqui, no nó.
// Campos e regras dos nós: skill_tree/README.md.
import { formatPercent, req } from '../helpers.js';
import { ICE_POWERS, POWER_MODELS } from '../../powers.js';

// Os nomes das skills de gelo, para a descrição do Blizzard (lidos dos poderes: mudou o nome lá, muda aqui)
const ICE_NAMES = ICE_POWERS.map(key => POWER_MODELS[key].name).join(' and ');

export const CURSE_NODES = [

    { id: 'arcaneStudy', cost: 1, branch: 'curse', kind: 'mod', x: 0, y: 1.5, requires: [],
      name: 'Arcane Study', icon: '🧿', desc: 'Curse Path spells hit harder.',
      levelText: (mods) => `+${formatPercent(mods.curseDamage)} damage on Curse Path spells`, mods: { curseDamage: 0.01 } },
    // Linha do gelo e da força
    { id: 'chillAura', cost: 2, branch: 'curse', kind: 'power', key: 'chillAura', x: 1, y: 0, requires: [req('arcaneStudy')] },
    // Soul Nova (e a evolução que congela) DESLIGADA em 19/11/2026. No lugar dela entra o Absolute Zero, skill própria que congela. Para voltar a Soul Nova, tire os //
    { id: 'absoluteZero', cost: 2, branch: 'curse', kind: 'power', key: 'absoluteZero', x: 2, y: 0, requires: [req('chillAura', 2)] },
    // Depois do Freezing Breath (a chave interna continua absoluteZero): Permafrost (a evolução dele: camada de gelo no chão) e Ice Ring (o anel de gelo que prende o monstro com mais vida). 27/11/2026
    { id: 'permafrost', cost: 4, branch: 'curse', kind: 'evolve', key: 'absoluteZero', x: 3, y: 0, requires: [req('absoluteZero', 5)] },
    // 27/11/2026: skill de nível (como o Arcane Study): cada nível soma dano nas skills de GELO. Nível 5 = 5x o dano (+400%)
    { id: 'blizzard', cost: 3, branch: 'curse', kind: 'mod', x: 4, y: 0, requires: [req('permafrost')],
      name: 'Blizzard', icon: '🌨️', desc: `Your ice skills (${ICE_NAMES}) hit much harder: five times the damage at max level.`,
      levelText: (mods) => `+${formatPercent(mods.iceDamage)} damage on ice skills (${ICE_NAMES})`, mods: { iceDamage: 0.8 } },
    // { id: 'soulNova', branch: 'curse', kind: 'power', key: 'soulNova', x: 2, y: 0, requires: [req('chillAura', 2)] },
    // { id: 'novaEvolve', branch: 'curse', kind: 'evolve', key: 'soulNova', x: 3, y: 0, requires: [req('soulNova', 5)] },
    // Linha da tempestade: à distância (o Grave Wisp saiu daqui em 27/11/2026: foi para a linha de baixo, depois do Summon Skeletons)
    // 28/11/2026 (reorganização): Rune Shield e Sovereign Rune vieram para a linha da tempestade (Arcane Study > Rune Shield > Sovereign Rune > Storm Sigil); o Laughing Skull foi para o lugar do
    // Rune Shield e o Occult Focus para o do Sovereign Rune (no fim da linha de baixo)
    { id: 'runeShield', cost: 3, branch: 'curse', kind: 'power', key: 'runeShield', x: 1, y: 1, requires: [req('arcaneStudy')] },
    { id: 'sovereignRune', cost: 4, branch: 'curse', kind: 'evolve', key: 'runeShield', x: 2, y: 1, requires: [req('runeShield', 5)] },
    { id: 'chainLightning', cost: 4, branch: 'curse', kind: 'power', key: 'chainLightning', x: 3, y: 1, requires: [req('sovereignRune')] },
    { id: 'wrathEvolve', cost: 4, branch: 'curse', kind: 'evolve', key: 'chainLightning', x: 4, y: 1, requires: [req('chainLightning', 5)] },
    // Linha do vazio: em área
    { id: 'creepingHex', cost: 4, branch: 'curse', kind: 'power', key: 'creepingHex', x: 1, y: 2, requires: [req('arcaneStudy')] },
    { id: 'darkKnowledge', cost: 1, branch: 'curse', kind: 'mod', x: 2, y: 2, requires: [req('creepingHex')],
      name: 'Dark Knowledge', icon: '📚', desc: 'Forbidden words hit harder.',
      levelText: (mods) => `+${formatPercent(mods.spellDamage)} spell damage`, mods: { spellDamage: 0.1 } },
    { id: 'voidRift', cost: 4, branch: 'curse', kind: 'power', key: 'voidRift', x: 3, y: 2, requires: [req('darkKnowledge', 2)] },
    // 27/11/2026 (nerf do Void Rift): o Event Horizon (a evolução dele) saiu e o Starfall entrou no lugar, no fim da linha do vazio
    { id: 'starfall', cost: 4, branch: 'curse', kind: 'power', key: 'starfall', x: 4, y: 2, requires: [req('voidRift', 5)] },
    // Linha de baixo (28/11/2026): Summon Skeletons > Grave Wisp > Laughing Skull > Occult Focus. (O Rune Shield e o Sovereign Rune foram para a linha da tempestade, ali em cima.)
    { id: 'summonSkeletons', cost: 4, branch: 'curse', kind: 'power', key: 'summonSkeletons', x: 1, y: 3, requires: [req('arcaneStudy')] },
    { id: 'graveWisp', cost: 4, branch: 'curse', kind: 'power', key: 'graveWisp', x: 2, y: 3, requires: [req('summonSkeletons')] },
    { id: 'laughingSkull', cost: 4, branch: 'curse', kind: 'power', key: 'laughingSkull', x: 3, y: 3, requires: [req('graveWisp')] },
    { id: 'occultFocus', cost: 1, branch: 'curse', kind: 'mod', x: 4, y: 3, requires: [req('laughingSkull')],
      name: 'Occult Focus', icon: '🔮', desc: 'Your spells return to your hand faster.',
      levelText: (mods) => `${formatPercent(mods.spellHaste)} shorter spell recharge`, mods: { spellHaste: 0.06 } },
    { id: 'oathRuin', cost: 4, branch: 'curse', kind: 'passive', key: 'oathRuin', oath: true, x: 5, y: 1.5, requires: [req('wrathEvolve'), req('starfall')] }
];
