// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/core/random.js e rode o sync.
// --- ALEATÓRIO COM SEMENTE ---
// Mesmo seed => mesmo cenário (as árvores não "pulam" ao redimensionar).
export function createRandom(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function randomRange(rand, min, max) {
    return min + rand() * (max - min);
}

export function pick(rand, list) {
    return list[Math.floor(rand() * list.length)];
}
