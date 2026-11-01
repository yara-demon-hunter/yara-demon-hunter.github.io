import { TREE_NODES } from './tree.js';

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
    chargedThrow: img('charged-dagger-throw'),
    corpseBurst: img('corpse-burst'),
    orbitBlades: img('spectral-blades'),
    orbitEvolve: img('balde-tempest')
};

// Imagem da skill pela chave do poder, passiva ou atributo (evolved: a evolução tem a própria arte)
export function treeImageFor(key, evolved = false) {
    const node = TREE_NODES.find(n => n.key === key && (n.kind === 'evolve') === evolved);
    return node ? TREE_IMAGES[node.id] ?? null : null;
}

// Mostra a imagem no elemento, ou o emoji se não houver. A URL é absoluta porque o CSS a resolveria a partir da própria pasta
export function paintIcon(target, image, emoji) {
    target.classList.toggle('has-image', Boolean(image));
    target.style.setProperty('--icon-image', image ? `url("${new URL(image, document.baseURI).href}")` : 'none');
    target.textContent = image ? '' : emoji;
}
