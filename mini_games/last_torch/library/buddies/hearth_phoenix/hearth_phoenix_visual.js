// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/buddies/hearth_phoenix/hearth_phoenix_visual.js e rode o sync.
// --- DADOS VISUAIS: a Fênix da Tocha (buddy) ---
// Lidos por hearth_phoenix.js. Os quadros foram gravados da fênix 3D do Laboratório (tools/lab/fenix_foto.js, `bake_fenix.py`):
// asas abertas batendo, a ave inteira em chamas. Duas paletas: 'fire' (laranja) e 'blue' (para quem tem a Blue Torch).
export const HEARTH_PHOENIX_VISUALS = {
    frames: 12,                 // quadros do ciclo (uma batida de asa; as chamas dão a volta junto)
    framesPerSecond: 10,        // 12 quadros em 1,2 s por batida
    cell: 144,                  // lado de cada quadro no atlas (pixels)
    // Linhas do atlas = de que lado se vê a ave (olhando para a direita; à esquerda o desenho é espelhado): 0 lado, 1 frente-lado (desce), 2 de frente (desce), 3 costas-lado (sobe), 4 de costas (sobe)
    size: 180,                  // lado de um quadro no mundo (unidades do jogo)
    embers: 8,
    beak: [{ x: 46, y: -11 }, { x: 37, y: -1 }, { x: 13, y: 4 }, { x: 35, y: -20 }, { x: 12, y: -24 }], // de onde sai o fogo (o bico), a partir do centro, por linha do atlas e olhando para a direita (no tamanho `size`) (medido no Laboratório com window.__beak)
    atlas: { fire: 'fenix_fogo_atlas.webp', blue: 'fenix_azul_atlas.webp' },
    palettes: {
        fire: { glow: 'rgba(249, 115, 22, 0.55)', glowHot: 'rgba(253, 224, 71, 0.85)' },
        blue: { glow: 'rgba(37, 99, 235, 0.55)', glowHot: 'rgba(147, 197, 253, 0.9)' }
    }
};
