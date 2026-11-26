// --- SOMBRA: o ladrão. Técnica, combos, esquiva e ouro ---
// Cada nó leva o próprio `cost` (pontos de skill por nível). Para mudar um preço, edite o número aqui, no nó.
// Campos e regras dos nós: skill_tree/README.md.
import { formatPercent, req } from '../helpers.js';

export const SHADOW_NODES = [

    { id: 'moveSpeed', cost: 1, branch: 'shadow', kind: 'stat', key: 'moveSpeed', x: 0, y: 1.5, requires: [] },
    // Linha de cima, só do corvo: Move Speed -> Shadow Raven -> Feather Dodge (o golpe erra, penas de corvo e um instante intocável) -> Feather Rain (uma chuva de penas cai de cima nos marcados pelo corvo) -> Raven Decoy (o Feather Dodge deixa uma pena-isca que atrai e explode)
        { id: 'shadowRaven', cost: 2, branch: 'shadow', kind: 'passive', key: 'shadowRaven', x: 1, y: 0, requires: [req('moveSpeed')] },
    { id: 'featherDodge', cost: 2, branch: 'shadow', kind: 'passive', key: 'featherDodge', x: 2, y: 0, requires: [req('shadowRaven', 2)] },
    { id: 'featherRain', cost: 2, branch: 'shadow', kind: 'passive', key: 'featherRain', x: 3, y: 0, requires: [req('featherDodge', 2)] },
    { id: 'ravenDecoy', cost: 2, branch: 'shadow', kind: 'passive', key: 'ravenDecoy', x: 4, y: 0, requires: [req('featherRain', 3)] },
    // Linha das adagas, tudo numa linha só: Ricochet -> Death Mark -> Dagger Mastery -> Fan of Knives
    { id: 'ricochet', cost: 2, needs: 'knives', branch: 'shadow', kind: 'power', key: 'ricochet', x: 1, y: 1, requires: [req('moveSpeed')] },
    { id: 'deathMark', cost: 2, needs: 'knives', branch: 'shadow', kind: 'power', key: 'deathMark', x: 2, y: 1, requires: [req('ricochet', 2)] },
    { id: 'daggerMastery', cost: 2, needs: 'knives', branch: 'shadow', kind: 'mod', x: 3, y: 1, requires: [req('deathMark', 2)],
      name: 'Dagger Mastery', icon: '🔪', desc: 'Your daggers cut deeper, fly farther and faster, and recharge sooner.',
      levelText: (mods) => `+${formatPercent(mods.knifeDamage)} dagger damage, +${formatPercent(mods.knifeRange)} range, +${formatPercent(mods.knifeSpeed)} speed, ${formatPercent(mods.knifeCooldown)} shorter recharge`,
      mods: { knifeDamage: 0.15, knifeRange: 0.12, knifeSpeed: 0.05, knifeCooldown: 0.06 } },
    { id: 'fanOfKnives', cost: 5, needs: 'knives', branch: 'shadow', kind: 'passive', key: 'fanOfKnives', x: 4, y: 1, requires: [req('daggerMastery', 2)] },
    // Caminho das sombras: Move Speed -> Return Fire -> Shadow Clone -> Umbral Bond (5/5) -> Shadow Legion -> Juramento
    { id: 'mirrorWard', cost: 1, branch: 'shadow', kind: 'passive', key: 'mirrorWard', x: 1, y: 2, requires: [req('moveSpeed')] },
    { id: 'shadowClone', cost: 1, branch: 'shadow', kind: 'passive', key: 'shadowClone', x: 2, y: 2, requires: [req('mirrorWard')] },
    { id: 'shadowBond', cost: 1, branch: 'shadow', kind: 'power', key: 'shadowBond', x: 3, y: 2, requires: [req('shadowClone')] },
    { id: 'shadowCloneEvolve', cost: 3, branch: 'shadow', kind: 'evolve', key: 'shadowClone', x: 4, y: 2, requires: [req('shadowBond', 5)] },
    // Caminho da esquiva: Move Speed -> Phantom Rush -> Night Reaper -> Shadow Shackle -> Smoke Bomb -> Juramento
    { id: 'phantomDash', cost: 1, branch: 'shadow', kind: 'power', key: 'phantomDash', x: 1, y: 3, requires: [req('moveSpeed')] },
    { id: 'phantomEvolve', cost: 1, branch: 'shadow', kind: 'evolve', key: 'phantomDash', x: 2, y: 3, requires: [req('phantomDash', 5)] },
    { id: 'shadowShackle', cost: 3, branch: 'shadow', kind: 'passive', key: 'shadowShackle', x: 3, y: 3, requires: [req('phantomEvolve')] },
    { id: 'smokeBomb', cost: 4, branch: 'shadow', kind: 'passive', key: 'smokeBomb', x: 4, y: 3, requires: [req('shadowShackle')] },
    { id: 'oathWhispers', cost: 5, branch: 'shadow', kind: 'passive', key: 'oathWhispers', oath: true, x: 5, y: 1.5, requires: [req('shadowCloneEvolve'), req('smokeBomb')] }
];
