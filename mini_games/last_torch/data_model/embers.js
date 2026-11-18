// --- BRASAS E ALTAR ---
// Uma moeda só, que FICA entre as noites (save.embers): toda noite rende Brasas, vencendo ou morrendo, e o Altar do menu as
// troca por melhorias permanentes pequenas (save.altar = { chave: nível }). É o que dá ao jogador um motivo para voltar:
// "amanhã começo mais forte". Foi pensado enxuto de propósito (4 melhorias, 1 tela): o Hearth antigo, com 11 melhorias,
// foi tirado em 30/10/2026 por ser informação demais; ver report/improvement_2026_11_16.

// Brasas de uma noite. A base garante que até quem morre na onda 1 compra a primeira melhoria depois de UMA noite.
export const EMBER_REWARD = {
    base: 8,                // só por ter jogado a noite
    perWaveCleared: 6,      // por onda fechada (morrer na onda 3 = 2 ondas fechadas)
    perKills: 1 / 20,       // 1 Brasa a cada 20 mortes (era 10: com ondas de 3 min há muito mais mortes por noite)
    perBoss: 15,            // por boss abatido
    perStar: 1,             // por estrela tirada no resultado das ondas (até 5 por onda)
    victory: 120            // amanhecer
};

// Preços (2026-11-18): o 1º nível de cada uma sai com 1 noite curta (15), os de cima ficam caros; o Altar inteiro custa ~4.900
// Brasas (era 1.892), e uma noite rende ~40 (morte cedo) a ~520 (amanhecer): completar leva dezenas de noites.
// Melhorias (moderadas de propósito: no nível máximo cada uma dá de +10% a +30%, nunca um salto). costs[n] = preço do nível n + 1 (o comprimento é o nível máximo).
// mods: somados por nível em js/systems/modifiers.js (mesmas chaves dos heróis e relíquias).
// startPoints não é um mod: soma aos pontos de skill do começo da noite (startingSkillPoints).
export const ALTAR = {
    // Corpo
    vitality: { name: 'Vitality', icon: '❤️', desc: '+2% hero health per level', costs: [15, 40, 80, 140, 220], mods: { maxHp: 0.02 } },
    swiftness: { name: 'Swiftness', icon: '👟', desc: '+1% move speed per level', costs: [20, 50, 95, 160, 250], mods: { moveSpeed: 0.01 } },
    // Ataque
    might: { name: 'Might', icon: '⚔️', desc: '+2% damage per level', costs: [15, 40, 80, 140, 220], mods: { damage: 0.02 } },
    arcane: { name: 'Arcane', icon: '🔮', desc: '+2% magic damage per level', costs: [15, 40, 80, 140, 220], mods: { spellDamage: 0.02 } },
    reach: { name: 'Reach', icon: '📏', desc: '+5% dagger range per level', costs: [15, 40, 80, 140, 220], mods: { knifeRange: 0.05 } },
    furyPower: { name: 'Fury Power', icon: '🌋', desc: '+2% damage during Fury per level', costs: [20, 50, 95, 160, 250], mods: { furyPower: 0.02 } },
    // Dash
    longDash: { name: 'Long Dash', icon: '💨', desc: '+6% dash distance per level', costs: [15, 40, 80, 140, 220], mods: { dashDistance: 0.06 } },
    // Começo da noite e tocha
    insight: { name: 'Insight', icon: '✨', desc: '+1 skill point at the start of the night', costs: [25, 70, 140, 230, 350], startPoints: 1 },
    torch: { name: 'Hearth Flame', icon: '🔥', desc: '+10 torch health per level', costs: [15, 40, 80, 140, 220], mods: { torchHp: 10 } },
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
    return emberBreakdown(run, turn, victory).reduce((sum, row) => sum + row.embers, 0);
}

// A mesma conta, linha por linha (a tela final conta cada uma subindo). Linhas que deram 0 ficam de fora (menos a da noite).
export function emberBreakdown(run, turn, victory) {
    const R = EMBER_REWARD;
    const waves = Math.max(0, turn - 1);
    const stars = run.stars ?? 0;
    return [
        { key: 'night', label: 'Night', detail: '', embers: R.base },
        { key: 'waves', label: 'Waves cleared', detail: `${waves} × ${R.perWaveCleared}`, embers: waves * R.perWaveCleared },
        { key: 'kills', label: 'Kills', detail: `${run.kills} ÷ ${Math.round(1 / R.perKills)}`, embers: Math.floor(run.kills * R.perKills) },
        { key: 'bosses', label: 'Bosses', detail: `${run.bosses} × ${R.perBoss}`, embers: run.bosses * R.perBoss },
        { key: 'stars', label: 'Stars', detail: `${stars} ★ × ${R.perStar}`, embers: stars * R.perStar },
        { key: 'dawn', label: 'Dawn', detail: '', embers: victory ? R.victory : 0 }
    ].filter(row => row.key === 'night' || row.embers > 0);
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
