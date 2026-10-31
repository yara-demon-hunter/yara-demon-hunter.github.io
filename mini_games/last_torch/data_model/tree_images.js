// Arte das skills na árvore (nó -> imagem pequena de 128px em images/buttons). Nó sem imagem usa o emoji da skill.
// A versão grande (1024px) fica ao lado, sem o -small, para páginas e prévias.
const dir = 'images/buttons';
const img = (name) => `${dir}/${name}-small.webp`;

export const TREE_IMAGES = {
    damage: img('blade'),
    frenzyNova: img('fury'),
    keenEye: img('keen-eye'),
    shadowWhirl: img('shadow-whirl'),
    moveSpeed: img('move-speed'),
    ricochet: img('ricochet'),
    daggerMastery: img('dagger-mastery'),
    fanOfKnives: img('fan-of-knives'),
    deathMark: img('death-mark'),
    shadowClone: img('shadow-clone'),
    shadowCloneEvolve: img('shadow-legion'),
    phantomDash: img('phantom-rush'),
    smokeBomb: img('smoke-bomb'),
    oathWhispers: img('oath-of-whispers'),
    emberTrail: img('ember-steps'),
    corpseBurst: img('corpse-burst'),
    orbitBlades: img('spectral-blades'),
    orbitEvolve: img('balde-tempest')
};
