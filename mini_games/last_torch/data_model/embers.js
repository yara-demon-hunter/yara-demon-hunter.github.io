// --- BRASAS E ALTAR ---
// Uma moeda só, que FICA entre as noites (save.embers): toda noite rende Brasas, vencendo ou morrendo, e o Altar do menu as
// troca por melhorias permanentes pequenas (save.altar = { chave: nível }). É o que dá ao jogador um motivo para voltar:
// "amanhã começo mais forte". Foi pensado enxuto de propósito (4 melhorias, 1 tela): o Hearth antigo, com 11 melhorias,
// foi tirado em 30/10/2026 por ser informação demais; ver report/improvement_2026_11_16.

// Brasas de uma noite. A base garante que até quem morre na onda 1 compra a primeira melhoria depois de UMA noite.
export const EMBER_REWARD = {
    base: 8,                // só por ter jogado a noite
    perWaveCleared: 6,      // por onda fechada (morrer na onda 3 = 2 ondas fechadas)
    perKills: 1 / 10,       // 1 Brasa a cada 10 mortes
    perBoss: 15,            // por boss abatido
    victory: 120            // amanhecer
};

// Melhorias (moderadas de propósito: no nível máximo cada uma dá de +10% a +30%, nunca um salto). costs[n] = preço do nível n + 1 (o comprimento é o nível máximo).
// mods: somados por nível em js/systems/modifiers.js (mesmas chaves dos heróis e relíquias).
// startPoints não é um mod: soma aos pontos de skill do começo da noite (startingSkillPoints).
export const ALTAR = {
    // Corpo
    vitality: { name: 'Vitality', icon: '❤️', desc: '+2% hero health per level', costs: [10, 18, 30, 48, 75], mods: { maxHp: 0.02 } },
    swiftness: { name: 'Swiftness', icon: '👟', desc: '+2% move speed per level', costs: [12, 22, 36, 56, 85], mods: { moveSpeed: 0.02 } },
    // Ataque
    might: { name: 'Might', icon: '⚔️', desc: '+2% damage per level', costs: [10, 18, 30, 48, 75], mods: { damage: 0.02 } },
    arcane: { name: 'Arcane', icon: '🔮', desc: '+2% magic damage per level', costs: [10, 18, 30, 48, 75], mods: { spellDamage: 0.02 } },
    reach: { name: 'Reach', icon: '📏', desc: '+5% dagger range per level', costs: [10, 18, 30, 48, 75], mods: { knifeRange: 0.05 } },
    furyPower: { name: 'Fury Power', icon: '🌋', desc: '+2% damage during Fury per level', costs: [14, 26, 42, 64, 95], mods: { furyPower: 0.02 } },
    // Dash
    longDash: { name: 'Long Dash', icon: '💨', desc: '+6% dash distance per level', costs: [10, 18, 30, 48, 75], mods: { dashDistance: 0.06 } },
    extraDash: { name: 'Extra Dash', icon: '⚡', desc: '+1 dash charge', costs: [90], mods: { dashCharges: 1 } },
    // Começo da noite e tocha
    insight: { name: 'Insight', icon: '✨', desc: '+1 skill point at the start of the night', costs: [14, 30, 60, 100, 150], startPoints: 1 },
    torch: { name: 'Hearth Flame', icon: '🔥', desc: '+10 torch health per level', costs: [10, 18, 30, 48, 75], mods: { torchHp: 10 } },
    // A segunda chance da tocha: uma vez por noite, quando o herói cai, a tocha gasta parte da chama e o traz de volta
    // (js/systems/player.js, números em CORE_MODEL.secondWind). Sem esta melhoria, morreu morreu.
    torchCall: { name: "Torch's Call", icon: '🕯️', desc: 'Once per night, when you fall, the torch pays 25% of its flame to bring you back', costs: [160] }
};
export const ALTAR_KEYS = Object.keys(ALTAR);

export const altarLevel = (save, key) => save.altar?.[key] ?? 0;
export const altarMaxLevel = (key) => ALTAR[key].costs.length;
// Preço do próximo nível, ou null se já está no máximo
export const altarCost = (save, key) => ALTAR[key].costs[altarLevel(save, key)] ?? null;

// Total de Brasas de uma noite até agora (quem chama desconta o que já foi pago: sair no meio e continuar não paga duas vezes)
export function emberTotal(run, turn, victory) {
    const R = EMBER_REWARD;
    return Math.floor(R.base + Math.max(0, turn - 1) * R.perWaveCleared + run.kills * R.perKills + run.bosses * R.perBoss + (victory ? R.victory : 0));
}

// Bônus somados das melhorias compradas (mesmo formato dos `mods` de heróis)
export function altarMods(save) {
    const total = {};
    for (const key of ALTAR_KEYS) {
        const level = altarLevel(save, key);
        for (const stat in ALTAR[key].mods ?? {}) total[stat] = (total[stat] || 0) + ALTAR[key].mods[stat] * level;
    }
    return total;
}

export function altarStartPoints(save) {
    return ALTAR_KEYS.reduce((sum, key) => sum + (ALTAR[key].startPoints ?? 0) * altarLevel(save, key), 0);
}

// Quantas melhorias o jogador consegue comprar agora
export const affordableCount = (save) => ALTAR_KEYS.filter(key => {
    const cost = altarCost(save, key);
    return cost !== null && save.embers >= cost;
}).length;
