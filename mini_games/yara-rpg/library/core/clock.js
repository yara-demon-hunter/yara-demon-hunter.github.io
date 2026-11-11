// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/core/clock.js e rode o sync.
// --- RELÓGIO DO DESENHO ---
// Tempo das animações procedurais. Ao gerar sprites ele é fixado quadro a quadro (no Last Torch, js/render/monster_sprites.js).
let fixed = null;

export function renderNow() {
    return fixed ?? performance.now();
}

// ms = tempo fixo; null = volta ao relógio real
export function setRenderClock(ms) {
    fixed = ms;
}
