// --- CHAMA: o guardião. Paciência, a tocha, muralhas de fogo ---
// Cada nó leva o próprio `cost` (pontos de skill por nível). Para mudar um preço, edite o número aqui, no nó.
// Campos e regras dos nós: skill_tree/README.md.
import { formatPercent, req } from '../helpers.js';

export const FLAME_NODES = [

    { id: 'torchKeeper', cost: 1, branch: 'flame', kind: 'mod', x: 0, y: 1.5, requires: [],
      name: 'Torch Keeper', icon: '🏮', desc: 'The torch holds more flame and slowly mends itself.',
      levelText: (mods) => `+${mods.torchHp} torch health, heals ${mods.torchRegen} health/s`, mods: { torchHp: 15, torchRegen: 0.04 } },
    // Linha do calor: a tocha não morre
    { id: 'warmHearth', cost: 1, branch: 'flame', kind: 'mod', x: 1, y: 0, requires: [req('torchKeeper')],
      name: 'Warm Hearth', icon: '♨️', desc: 'The fire warms you and mends itself.',
      levelText: (mods) => `+${formatPercent(mods.warmth)} warmth, torch heals ${mods.torchRegen} health/s`,
      mods: { warmth: 0.15, torchRegen: 0.06 } },
    { id: 'undyingFlame', cost: 1, branch: 'flame', kind: 'mod', x: 2, y: 0, requires: [req('warmHearth', 2)],
      name: 'Undying Flame', icon: '🕯️', desc: 'The torch refuses to go out.',
      levelText: (mods) => `+${mods.torchHp} torch health, heals ${mods.torchRegen} health/s`,
      mods: { torchHp: 20, torchRegen: 0.09 } },
    { id: 'phoenixPact', cost: 3, branch: 'flame', kind: 'passive', key: 'phoenixPact', x: 3, y: 0, requires: [req('undyingFlame', 2)] },
    { id: 'phoenixReborn', cost: 4, branch: 'flame', kind: 'passive', key: 'phoenixReborn', x: 4, y: 0, requires: [req('phoenixPact')] },
    // Linha da guarda: a tocha protege a si mesma (escudo que se renova) e queima azul
    { id: 'torchWard', cost: 3, branch: 'flame', kind: 'power', key: 'torchWard', x: 1, y: 1, requires: [req('torchKeeper')] },
    { id: 'fireTornado', cost: 5, branch: 'flame', kind: 'passive', key: 'fireTornado', x: 2, y: 1, requires: [req('torchWard', 2)] },
    { id: 'hearthPhoenix', cost: 5, branch: 'flame', kind: 'passive', key: 'hearthPhoenix', x: 3, y: 1, requires: [req('fireTornado')] },
    { id: 'blueTorch', cost: 4, branch: 'flame', kind: 'passive', key: 'blueTorch', x: 4, y: 1, requires: [req('hearthPhoenix')] },
    // Linha da muralha
    // 28/11/2026: o Chili Breath vem ANTES do Flame Sentinel (torchKeeper > Chili Breath > Flame Sentinel > Hearth Ring)
    { id: 'chiliBreath', cost: 5, branch: 'flame', kind: 'power', key: 'chiliBreath', x: 1, y: 2, requires: [req('torchKeeper')] },
    // Chili Breath (27/11/2026) tomou o lugar do Sun Spire (a evolução do Flame Sentinel, removida): o sopro de fogo. Como na linha do gelo, o próximo poder (Hearth Ring) pede 2 níveis dele
    { id: 'torchBolts', cost: 3, branch: 'flame', kind: 'power', key: 'torchBolts', x: 2, y: 2, requires: [req('chiliBreath', 5)] },
    { id: 'fireRing', cost: 4, branch: 'flame', kind: 'power', key: 'fireRing', x: 3, y: 2, requires: [req('torchBolts', 2)] },
    { id: 'fireRingEvolve', cost: 5, branch: 'flame', kind: 'evolve', key: 'fireRing', x: 4, y: 2, requires: [req('fireRing', 5)], },
    // Linha da brasa
    { id: 'emberTrail', cost: 2, branch: 'flame', kind: 'power', key: 'emberTrail', x: 1, y: 3, requires: [req('torchKeeper')] },
    { id: 'emberEvolve', cost: 3, branch: 'flame', kind: 'evolve', key: 'emberTrail', x: 2, y: 3, requires: [req('emberTrail', 5)] },
    // As armas pegam fogo: saem do Hellwalker
    { id: 'flameBlade', cost: 4, exclusive: 'bladeEnchant', branch: 'flame', kind: 'passive', key: 'flameBlade', x: 3, y: 3, requires: [req('emberEvolve')] },
    // As bolas de fogo vêm depois da espada em chamas: nada mais depende delas (heróis sem adaga as têm seladas e a cadeia segue)
    { id: 'fireballs', cost: 4, needs: 'knives', notFor: ['rowan'], noFreePass: true, branch: 'flame', kind: 'passive', key: 'fireballs', x: 4, y: 3, requires: [req('flameBlade')] },
    { id: 'oathHearth', cost: 4, branch: 'flame', kind: 'passive', key: 'oathHearth', oath: true, x: 5, y: 1.5, requires: [req('phoenixReborn'), req('fireRingEvolve')] }
];
