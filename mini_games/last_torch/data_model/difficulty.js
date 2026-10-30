// --- DIFICULDADE POR TURNO ---
// O turno 1 é o mais fácil e cada turno novo deixa o jogo mais duro: monstros com mais vida,
// mais rápidos e que batem mais forte, nascendo em intervalos menores, e tipos novos entram aos poucos.
// Os multiplicadores se somam ao crescimento próprio de cada monstro (hpPerTurn em MONSTER_MODELS).
export const TURN_DIFFICULTY = {
    // Vida: multiplicador do turno 1 e quanto sobe a cada turno seguinte
    hpMultiplierFirstTurn: 0.65,
    hpMultiplierPerTurn: 0.17,

    // Velocidade de movimento
    speedMultiplierFirstTurn: 0.75,
    speedMultiplierPerTurn: 0.025,
    maxSpeedMultiplier: 1.1,

    // Dano (contato e tiros)
    damageMultiplierFirstTurn: 0.8,
    damageMultiplierPerTurn: 0.08,
    maxDamageMultiplier: 2.6,

    // Tempo entre um monstro e o próximo
    spawnIntervalFirstTurnSeconds: 1.45,
    spawnIntervalReductionPerTurnSeconds: 0.085,
    minimumSpawnIntervalSeconds: 0.55,
    bossSpawnIntervalMultiplier: 3.6,   // com o boss em campo nascem menos monstros

    // Pontos para fechar a hora: base + porTurno x n + porTurnoQuadrado x n², com n = turno - 1
    targetScoreFirstTurn: 520,
    targetScorePerTurn: 125,
    targetScorePerTurnSquared: 3,

    // Limite de monstros vivos ao mesmo tempo (desempenho e leitura da tela)
    maxAliveEnemies: 42,

    // Pausa sem monstros logo depois de voltar da loja (a tela é limpa a cada novo turno)
    turnStartGraceSeconds: 1.5,

    // Primeiro turno em que cada monstro pode nascer
    monsterUnlockTurn: {
        SKELETON: 1,
        BAT: 1,
        VAMPIRE: 2,
        WITCH: 3,
        MOTH: 5,
        BLOATER: 6,
        WRAITH: 7,
        NECROMANCER: 9,
        ZOMBIE_WOLF: 4,
        HEADLESS_KNIGHT: 8
    }
};

// Multiplicadores e intervalo de spawn de um turno (turno 1 = mais fácil)
export function getTurnDifficulty(turn) {
    const D = TURN_DIFFICULTY;
    const steps = Math.max(0, turn - 1);
    return {
        hpMultiplier: D.hpMultiplierFirstTurn + steps * D.hpMultiplierPerTurn,
        speedMultiplier: Math.min(D.maxSpeedMultiplier, D.speedMultiplierFirstTurn + steps * D.speedMultiplierPerTurn),
        damageMultiplier: Math.min(D.maxDamageMultiplier, D.damageMultiplierFirstTurn + steps * D.damageMultiplierPerTurn),
        spawnIntervalSeconds: Math.max(
            D.minimumSpawnIntervalSeconds,
            D.spawnIntervalFirstTurnSeconds - steps * D.spawnIntervalReductionPerTurnSeconds
        ),
        targetScore: Math.round(
            D.targetScoreFirstTurn + steps * D.targetScorePerTurn + steps * steps * D.targetScorePerTurnSquared
        )
    };
}

export function isMonsterUnlocked(type, turn) {
    return turn >= (TURN_DIFFICULTY.monsterUnlockTurn[type] ?? 1);
}
