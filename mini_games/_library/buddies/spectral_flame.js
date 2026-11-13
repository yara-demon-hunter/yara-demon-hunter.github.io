import { withAlpha } from '../monsters/25d/creature25d.js';

// --- CHAMA ESPECTRAL (peça compartilhada dos lobos buddies) ---
// Uma língua de chama que nasce em `root`, sobe afinando e some (a transparência cresce com a altura), balançando para os
// lados e para trás quando o lobo corre. Cada lobo escolhe as cores (C.flameDark, C.flame, C.flameLight) e a velocidade/altura
// (S.flameRise, S.flameHeight). i: o número da língua (defasa as fases); size: a grossura na base; f: o esqueleto do quadro.
export function flameWisp(rig, f, S, root, i, size) {
    const { C, limb } = rig;
    const p = (f.t * S.flameRise + i * 0.618) % 1;
    const sway = Math.sin(f.t * 3 + i * 2.1) * (0.6 + p * 1.6);
    const back = f.run * p * 3;
    const at = (k) => [root[0] - back * k + Math.sin(f.t * 2 + i + k * 3) * 0.5 * k, root[1] + sway * k, root[2] + p * S.flameHeight * k + k * size * 1.6];
    const alpha = Math.max(0, 1 - p) ** 1.1;
    const width = size * (1 - p * 0.6);
    withAlpha(alpha * 0.9, () => limb([root, at(0.5), at(1)], width, C.flameDark));
    withAlpha(alpha * 0.85, () => limb([root, at(0.45), at(0.85)], width * 0.62, C.flame));
    withAlpha(alpha * 0.8, () => limb([root, at(0.35)], width * 0.3, C.flameLight));
}
