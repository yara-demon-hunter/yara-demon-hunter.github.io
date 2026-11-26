// --- LUZ: o padre. Fé e luz sagrada: chão consagrado, água benta, ira divina, repulsão e o anjo da guarda ---
// Cada nó leva o próprio `cost` (pontos de skill por nível). Para mudar um preço, edite o número aqui, no nó.
// Campos e regras dos nós: skill_tree/README.md.
import { formatPercent, num, req, stacked } from '../helpers.js';

export const LIGHT_NODES = [

    { id: 'silentVigil', cost: 1, branch: 'light', kind: 'mod', x: 0, y: 1.5, requires: [],
      name: 'Silent Vigil', icon: '🕯️', desc: 'Every blessed monster that falls restores your faith, and your spells grow stronger.',
      levelText: (mods) => `Killing a blessed monster heals ${mods.blessedKillHeal} · +${formatPercent(mods.spellDamage)} spell damage`, mods: { blessedKillHeal: 0.8, spellDamage: 0.04 } },
    // Quatro linhas ao lado do Silent Vigil (e uma quinta, Conversão -> Blessed Blade, só do Avgustino). Cada linha de poder termina numa skill
    // de defesa da tocha que vem DEPOIS da evolução: chão -> anjo, água benta -> sino, ira -> colar. O Oath of Faith liga ao Archangel e à Divine Grace
    // Linha 1, o chão e o anjo: Sacred Ground -> Consecrated Earth -> Guardian Angel -> Archangel (que liga ao Oath of Faith)
    { id: 'holyGround', cost: 3, branch: 'light', kind: 'power', key: 'holyGround', x: 1, y: 0, requires: [req('silentVigil')] },
    { id: 'groundEvolve', cost: 3, branch: 'light', kind: 'evolve', key: 'holyGround', x: 2, y: 0, requires: [req('holyGround', 5)] },
    { id: 'guardianAngel', cost: 3, branch: 'light', kind: 'power', key: 'guardianAngel', x: 3, y: 0, requires: [req('groundEvolve')] },
    { id: 'angelEvolve', cost: 4, branch: 'light', kind: 'evolve', key: 'guardianAngel', x: 4, y: 0, requires: [req('guardianAngel', 5)] },
    { id: 'sanctifiedMantle', showTotal: true, cost: 1, branch: 'light', kind: 'mod', x: 2, y: 3, requires: [req('judgment')],
      name: 'Sanctified Mantle', icon: '🛡️', desc: 'A holy mantle turns blows aside (3% less damage taken per level), strengthens your spells (+3% spell damage per level) and keeps the torch burning (+10 torch health per level). Levels stack.',
      levelText: (mods, lvl = 1) => `${stacked(lvl, -mods.damageTaken)} less damage taken · ${stacked(lvl, mods.spellDamage)} spell damage · ${stacked(lvl, mods.torchHp, num)} torch health`, mods: { damageTaken: -0.03, spellDamage: 0.03, torchHp: 10 } },
    // Linha 2, a água benta e o sino: Holy Water -> Blessed Rain -> Church Bell -> Cathedral Toll
    { id: 'holyWater', cost: 3, branch: 'light', kind: 'power', key: 'holyWater', x: 1, y: 1, requires: [req('silentVigil')] },
    { id: 'waterEvolve', cost: 3, branch: 'light', kind: 'evolve', key: 'holyWater', x: 2, y: 1, requires: [req('holyWater', 5)] },
    { id: 'churchBell', cost: 3, branch: 'light', kind: 'power', key: 'churchBell', x: 3, y: 1, requires: [req('waterEvolve')] },
    { id: 'bellEvolve', cost: 4, branch: 'light', kind: 'evolve', key: 'churchBell', x: 4, y: 1, requires: [req('churchBell', 5)], },
    // Linha 3, a ira e o colar: Smite -> Divine Wrath -> Sacred Pendant -> Divine Grace
    { id: 'smite', cost: 3, branch: 'light', kind: 'power', key: 'smite', x: 1, y: 2, requires: [req('silentVigil')] },
    { id: 'smiteEvolve', cost: 3, branch: 'light', kind: 'evolve', key: 'smite', x: 2, y: 2, requires: [req('smite', 5)] },
    { id: 'sacredPendant', cost: 3, branch: 'light', kind: 'power', key: 'sacredPendant', x: 3, y: 2, requires: [req('smiteEvolve')] },
    { id: 'divineGrace', showTotal: true, cost: 1, branch: 'light', kind: 'mod', x: 4, y: 2, requires: [req('sacredPendant', 2)],
      name: 'Divine Grace', icon: '✨', desc: 'Grace speeds your spells (4% shorter recharge per level) and mends your wounds over time (+0.25 health per second per level). Levels stack.',
      levelText: (mods, lvl = 1) => `${stacked(lvl, mods.spellHaste)} shorter spell recharge · ${stacked(lvl, mods.hpRegen, num)} health per second`, mods: { spellHaste: 0.04, hpRegen: 0.25 } },
    // Linha 4, o julgamento e a Conversão: Judgment -> Sanctified Mantle -> Conversão -> Blessed Blade. A Conversão e a lâmina benta são só do Avgustino (seladas
    // para os outros, com passe livre); o Judgment é de todos
    { id: 'judgment', cost: 2, showTotal: true, branch: 'light', kind: 'mod', x: 1, y: 3, requires: [req('silentVigil')],
      name: 'Judgment', icon: '⚖️', desc: 'The light judges the mighty: every level adds 10% damage to elites and bosses, but ONLY from your Light Path skills (holy ground, holy water, smite, bell, pendant, angel...). Damage from other paths is not affected. Levels stack.',
      levelText: (mods, lvl = 1) => `${stacked(lvl, mods.demonDamage)} Light Path damage against elites and bosses`, mods: { demonDamage: 0.1 } },
    { id: 'conversion', cost: 4, hero: 'avgustino', branch: 'light', kind: 'passive', key: 'conversion', x: 3, y: 3, requires: [req('sanctifiedMantle')], },
    { id: 'blessedBlade', cost: 3, exclusive: 'bladeEnchant', hero: 'avgustino', branch: 'light', kind: 'passive', key: 'blessedBlade', x: 4, y: 3, requires: [req('conversion')] },
    { id: 'oathFaith', cost: 3, branch: 'light', kind: 'passive', key: 'oathFaith', oath: true, x: 5, y: 1.5, requires: [req('angelEvolve'), req('divineGrace')] }
];
