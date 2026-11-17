// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/buddies/hearth_phoenix/hearth_phoenix_visual.js e rode o sync.
// --- DADOS VISUAIS: a Fênix da Tocha (buddy) ---
// Lidos por hearth_phoenix.js. Os quadros foram gravados da fênix 3D do Laboratório (tools/lab/fenix_foto.js, `bake_fenix.py`):
// asas abertas batendo, a ave inteira em chamas. Duas paletas: 'fire' (laranja) e 'blue' (para quem tem a Blue Torch).
export const HEARTH_PHOENIX_VISUALS = {
    frames: 20,                 // quadros do ciclo (uma batida de asa; as chamas dão a volta junto)
    framesPerSecond: 12.5,      // 20 quadros em 1,6 s: o mesmo ciclo do Laboratório
    cell: 160,                  // lado de cada quadro no atlas (pixels)
    size: 150,                  // lado de um quadro no mundo (unidades do jogo)
    embers: 8,
    beak: { x: 30, y: 6 },      // de onde sai a bola de fogo, a partir do centro, olhando para a direita (no tamanho `size`)
    atlas: { fire: 'fenix_fogo_atlas.webp', blue: 'fenix_azul_atlas.webp' },
    palettes: {
        fire: { glow: 'rgba(249, 115, 22, 0.55)', glowHot: 'rgba(253, 224, 71, 0.85)' },
        blue: { glow: 'rgba(37, 99, 235, 0.55)', glowHot: 'rgba(147, 197, 253, 0.9)' }
    }
};
