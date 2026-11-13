import { DAGGER_VISUALS } from '../../../library/weapons/dagger/dagger_visual.js';

// --- DADOS VISUAIS: Adaga de arremesso (golpe separado, lançado pela mão esquerda). ---
// Cores, medidas e ritmos lidos por library/weapons/thrown.js, js/render/entities.js e js/render/player25d.js.
export const KNIFE_VISUALS = {
    // O desenho da adaga (cores e formato) é da arma: mini_games/_library/weapons/dagger/. As outras armas de arremesso
    // (a rosa do Rowan) estão em ../../../library/weapons/thrown.js.
    colors: DAGGER_VISUALS.colors,
    shape: DAGGER_VISUALS.shape,

    // Em voo: tamanho, altura acima do chão (na altura da mão), sombra e rastro
    flightScale: 1.25,
    flightHeight: 18,
    shadowLength: 9,
    shadowWidth: 2.2,
    glowRadius: 18,
    ghostCount: 3,
    ghostGap: 7,
    trailLength: 26,

    // Na mão do herói 2.5D (multiplica as unidades da adaga)
    handScale: 0.6,

    // Ponto de onde a adaga sai, relativo ao herói (unidades do mundo; lado negativo = esquerda)
    spawnForward: 16,
    spawnSide: -4,

    // Animação da mão esquerda: recua (até windupFraction), lança (até releaseFraction) e volta.
    // A adaga é solta em letGoFraction; o herói se inclina para o arremesso (throwLean).
    throwSeconds: 0.4,
    windupFraction: 0.3,
    releaseFraction: 0.5,
    letGoFraction: 0.42,
    throwLean: 1.6
};
