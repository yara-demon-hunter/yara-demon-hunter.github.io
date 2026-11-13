// --- DIFICULDADE POR TURNO ---
// O turno 1 é o mais fácil e cada turno novo deixa o jogo mais duro: monstros com mais vida,
// mais rápidos e que batem mais forte, nascendo em intervalos menores, e tipos novos entram aos poucos.
// Os multiplicadores se somam ao crescimento próprio de cada monstro (hpPerTurn em MONSTER_MODELS).
export const TURN_DIFFICULTY = {
    // Vida: multiplicador do turno 1 e quanto sobe a cada turno seguinte
    hpMultiplierFirstTurn: 0.55,
    hpMultiplierPerTurn: 0.18,

    // Velocidade de movimento
    speedMultiplierFirstTurn: 0.75,
    speedMultiplierPerTurn: 0.025,
    maxSpeedMultiplier: 1.1,

    // Dano (contato e tiros)
    damageMultiplierFirstTurn: 0.55,
    damageMultiplierPerTurn: 0.103,
    maxDamageMultiplier: 2.6,
    // Alívio nas primeiras ondas (multiplica o dano acima): a onda 1 é onde o jogador novo aprende, e era onde ele morria
    // (medido com bots: quem "vai para cima" caía em ~26 s, quem anda sem rumo em ~70 s, todos na onda 1). Da onda 4 em
    // diante nada muda. Um valor por onda, a partir da 1; onda sem valor = 1.
    earlyDamageRelief: [0.5, 0.7, 0.86],

    // Tempo entre um monstro e o próximo
    spawnIntervalFirstTurnSeconds: 1.75,
    spawnIntervalReductionPerTurnSeconds: 0.112,
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
        SKELETON_CRAWLER: 1,
        BAT: 1,
        SHADOW_WOLF: 1,
        VAMPIRE: 2,
        WITCH: 3,
        MOTH: 4,
        ZOMBIE_WOLF: 4,
        BLOATER: 4,
        WRAITH: 5,
        NECROMANCER: 6,
        HEADLESS_KNIGHT: 6,
        BONE_COLOSSUS: 7
    }
};

// Multiplicadores e intervalo de spawn de um turno (turno 1 = mais fácil)
export function getTurnDifficulty(turn) {
    const D = TURN_DIFFICULTY;
    const steps = Math.max(0, turn - 1);
    return {
        hpMultiplier: D.hpMultiplierFirstTurn + steps * D.hpMultiplierPerTurn,
        speedMultiplier: Math.min(D.maxSpeedMultiplier, D.speedMultiplierFirstTurn + steps * D.speedMultiplierPerTurn),
        damageMultiplier: Math.min(D.maxDamageMultiplier, D.damageMultiplierFirstTurn + steps * D.damageMultiplierPerTurn)
            * (D.earlyDamageRelief[steps] ?? 1),
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
