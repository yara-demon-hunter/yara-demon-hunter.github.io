import { TREE_NODES } from './tree.js';

// Arte das skills na árvore (nó -> imagem pequena de 128px em images/buttons). Nó sem imagem usa o emoji da skill.
// A versão grande (1024px) fica ao lado, sem o -small, para páginas e prévias.
const dir = 'images/buttons';
const img = (name) => `${dir}/${name}-small.webp`;

export const TREE_IMAGES = {
    damage: img('blade'),
    frenzyNova: img('fury'),
    atkSpeed: img('attack-speed'),
    keenEye: img('keen-eye'),
    bloodlust: img('bloodlust'),
    bloodlustEvolve: img('crimson-tide'),
    executioner: img('executioner'),
    earthbreaker: img('earthbreaker'),
    radius: img('attack-range'),
    knockback: img('knockback'),
    slashArc: img('slash-width'),
    warCry: img('war-cry'),
    shadowWhirl: img('shadow-whirl'),
    moveSpeed: img('move-speed'),
    ricochet: img('ricochet'),
    daggerMastery: img('dagger-mastery'),
    fanOfKnives: img('fan-of-knives'),
    deathMark: img('death-mark'),
    shadowClone: img('shadow-clone'),
    shadowCloneEvolve: img('shadow-legion'),
    shadowBond: img('umbral-bond'),
    phantomDash: img('phantom-rush'),
    smokeBomb: img('smoke-bomb'),
    oathSlaughter: img('oath-of-slaughter'),
    oathWhispers: img('oath-of-whispers'),
    oathHearth: img('oath-of-the-hearth'),
    oathRuin: img('oath-of-ruin'),
    emberTrail: img('ember-steps'),
    chargedThrow: img('charged-dagger-throw'),
    corpseBurst: img('corpse-burst'),
    orbitBlades: img('spectral-blades'),
    orbitEvolve: img('balde-tempest'),
    warmHearth: img('warm-hearth'),
    undyingFlame: img('undying-flame'),
    phoenixPact: img('phoenix-pact'),
    shadowRaven: img('shadow-raven'),
    mirrorWard: img('return-fire'),
    shadowShackle: img('shadow-shackle'),
    vigil: img('vigil'),
    backdraft: img('backdraft'),
    fireRing: img('hearth-ring'),
    fireRingEvolve: img('solar-wall'),
    emberEvolve: img('hellwalker'),
    flameBlade: img('flaming-sword'),
    fireballs: img('fireballs'),
    graveWisp: img('grave-wisp'),
    wrathEvolve: img('wrath-of-heaven'),
    leechVine: img('leech-vine'),
    spiritWolves: img('shadow-wolf'),
    wolvesEvolve: img('the-white-wolf'),
    oakEvolve: img('ancient-grove'),
    oathWild: img('oath-of-the-wild'),
    darkRoses: img('dark-rose'),
    // Light Path
    silentVigil: img('silent-vigil'),
    holyGround: img('sacred-ground'),
    groundEvolve: img('consecrated-earth'),
    holyWater: img('holy-water'),
    waterEvolve: img('blessed-rain'),
    blessedBlade: img('blessed-sword'),
    smite: img('holy-smite'),
    smiteEvolve: img('divine-wrath'),
    oathFaith: img('oath-of-faith')
};

// Arte de cada ramo. Ramo sem imagem usa o emoji de TREE_BRANCHES.
export const BRANCH_IMAGES = {
    blade: img('blade-path'),
    shadow: img('shadow-path'),
    flame: img('flame-path'),
    curse: img('curse-path'),
    nature: img('nature-path'),
    light: img('light-path')
};

// Imagem da skill pela chave do poder, passiva ou atributo (evolved: a evolução tem a própria arte)
export function treeImageFor(key, evolved = false) {
    const node = TREE_NODES.find(n => n.key === key && (n.kind === 'evolve') === evolved);
    return node ? TREE_IMAGES[node.id] ?? null : null;
}

// Baixa a arte com antecedência: sem isso, em rede lenta, a árvore abre com os ícones chegando um a um
export function preloadTreeImages() {
    [...Object.values(TREE_IMAGES), ...Object.values(BRANCH_IMAGES)].forEach(src => { new Image().src = src; });
}

// Mostra a imagem no elemento, ou o emoji se não houver. A URL é absoluta porque o CSS a resolveria a partir da própria pasta
export function paintIcon(target, image, emoji) {
    target.classList.toggle('has-image', Boolean(image));
    target.style.setProperty('--icon-image', image ? `url("${new URL(image, document.baseURI).href}")` : 'none');
    target.textContent = image ? '' : emoji;
}
