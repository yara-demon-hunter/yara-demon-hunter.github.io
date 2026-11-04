import { ROSTER } from '../../data_model/characters.js';
import { PHYSICS } from '../../data_model/physics.js';
import { CHARACTER_ART } from '../../data_model/visuals/characters.js';
import { CHARACTER_ATLAS as A } from '../../data_model/visuals/sprites.js';
import { drawCharacter } from './character_art.js';
import { makeCanvas } from './fx/sprites.js';

// --- ATLAS DOS LUTADORES ---
// A arte procedural roda uma vez por quadro de animação e vai para um atlas por personagem.
// Em campo, o lutador é um único drawImage (esticado e achatado por escala, sem redesenhar nada).
// Só os dois personagens da partida ficam na memória.
const TAU = Math.PI * 2;

// Pose de cada quadro: i = quadro, n = quantos quadros tem a animação
export const POSES = {
    idle: (i, n) => {
        const t = (i / n) * TAU;
        return { bob: Math.sin(t) * 0.035, footA: 0, footB: 0, tuck: 0, armSwing: Math.sin(t) * 0.25, armUp: 0,
            ear: 0, tail: Math.sin(t) * 0.55, eye: i === 4 ? 'blink' : 'open', mouth: 'smile' };
    },
    run: (i, n) => {
        const t = (i / n) * TAU;
        return { bob: -Math.abs(Math.sin(t)) * 0.08, footA: Math.sin(t) * 1.4, footB: Math.sin(t + Math.PI) * 1.4, tuck: 0,
            armSwing: Math.sin(t + Math.PI) * 1.2, armUp: 0.1,
            ear: 0.7, tail: 0.5 + Math.sin(t * 2) * 0.4, eye: 'open', mouth: i % 2 ? 'open' : 'smile' };
    },
    jump: (i) => (i === 0
        ? { bob: -0.04, footA: 0, footB: 0, tuck: 1, armSwing: 0, armUp: 0.9, ear: 0, tail: -0.2, eye: 'open', mouth: 'o' }
        : { bob: 0.02, footA: 0.6, footB: -0.6, tuck: 0.4, armSwing: 0.4, armUp: 0.5, ear: 1, tail: 0.7, eye: 'wide', mouth: 'open' }),
    pound: () => ({ bob: 0, footA: 0, footB: 0, tuck: 1, armSwing: 0, armUp: 1.1, ear: 1, tail: 0.9, eye: 'angry', mouth: 'open' }),
    dash: () => ({ bob: 0, footA: -1.4, footB: -1.4, tuck: 0, armSwing: 1.2, armUp: 0.2, ear: 1, tail: 0.8, eye: 'angry', mouth: 'flat' }),
    stun: (i, n) => ({ bob: 0, footA: 0, footB: 0, tuck: 0, armSwing: 0, armUp: -0.2, ear: 0.6, tail: -0.4,
        eye: 'x', mouth: 'tongue', stars: (i / n) * TAU }),
    taunt: (i) => ({ bob: i % 2 ? -0.05 : 0, footA: 0, footB: 0, tuck: 0, armSwing: i % 2 ? -0.6 : 0.6, armUp: 1.2,
        ear: 0, tail: i % 2 ? 1.0 : -0.6, eye: i % 2 ? 'blink' : 'open', mouth: 'tongue' }),
    scared: (i) => ({ bob: i ? 0.03 : -0.03, footA: 0, footB: 0, tuck: 0.2, armSwing: i ? 0.3 : -0.3, armUp: 1.0,
        ear: 0.9, tail: i ? 0.5 : 0.2, eye: 'wide', mouth: 'frown', sweat: true })
};
// Animações cujos olhos ficam abertos: a pupila é desenhada ao vivo para acompanhar o movimento
const LIVE_PUPILS = new Set(['idle', 'run', 'jump', 'pound', 'dash', 'scared']);

const frames = Object.entries(A.anims).flatMap(([anim, count]) =>
    Array.from({ length: count }, (_, i) => ({ anim, i, count })));
export const ANIM_START = {};
let index = 0;
Object.entries(A.anims).forEach(([anim, count]) => { ANIM_START[anim] = index; index += count; });

// Lado do quadro em unidades de "raio do corpo"
export const CELL_UNITS = A.extent * 2;

export function artFor(rosterIndex) {
    return CHARACTER_ART[ROSTER[rosterIndex].id];
}

// Cada personagem é gerado no próprio tamanho (o elefante é maior), para não esticar o sprite em campo
function bake(rosterIndex) {
    const spec = artFor(rosterIndex);
    const radius = PHYSICS.baseRadius * Math.sqrt(ROSTER[rosterIndex].mass);
    const cell = Math.ceil(CELL_UNITS * radius * A.pixelsPerUnit);
    const unit = cell / CELL_UNITS;
    const rows = Math.ceil(frames.length / A.columns);
    const canvas = makeCanvas(cell * A.columns, cell * rows, (g) => {
        frames.forEach((f, k) => {
            g.save();
            g.translate(((k % A.columns) + 0.5) * cell, (Math.floor(k / A.columns) + 0.5) * cell);
            g.scale(unit, unit);
            drawCharacter(g, spec, POSES[f.anim](f.i, f.count));
            g.restore();
        });
    });
    return { canvas, cell };
}

const atlases = new Map();

export function getCharacterAtlas(rosterIndex) {
    if (!atlases.has(rosterIndex)) atlases.set(rosterIndex, bake(rosterIndex));
    return atlases.get(rosterIndex);
}

// Antes da partida: gera os dois escolhidos e solta os outros
export function keepCharacterAtlases(indices) {
    [...atlases.keys()].forEach((k) => { if (!indices.includes(k)) atlases.delete(k); });
    indices.forEach(getCharacterAtlas);
}

// Quadro k do atlas -> retângulo de origem
export function frameRect(atlas, k) {
    return { sx: (k % A.columns) * atlas.cell, sy: Math.floor(k / A.columns) * atlas.cell, size: atlas.cell };
}

export function hasLivePupils(anim, i) {
    return LIVE_PUPILS.has(anim) && !(anim === 'idle' && i === 4);
}
