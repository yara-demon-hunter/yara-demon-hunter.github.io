import { effectiveTurn } from './campaign.js';
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
    // 2026-11-26: ondas de ~70 s (eram 2-3 min): cota a ~50% do que era (398 / 95 / 2.3); medido com o autopiloto: ondas comuns 70-90 s
    targetScoreFirstTurn: 200,
    targetScorePerTurn: 48,
    targetScorePerTurnSquared: 1.2,

    // Duração mínima da onda: ela só fecha (e chama o boss) depois deste tempo E de a cota de pontos ser atingida.
    // Dentro dela os monstros vão ficando mais frequentes: o intervalo entre eles encolhe até 1 / (1 + spawnGrowth) no fim do tempo mínimo.
    waveMinSeconds: 70,               // era 180 (3 min), 144, 122, 110; 2026-11-26: 70 s (ondas curtas, cada uma com mais variação)
    spawnGrowth: 0.9,                 // (só a função waveSpawnBoost antiga usa; o spawner agora segue waveTension)
    hordeLullSeconds: 3.5,            // depois que uma horda chega, nada comum nasce por este tempo (respiro depois do pico)

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
        TREANT: 3,
        GOLEM: 4,
        BONE_COLOSSUS: 8,
        // Telas novas (só nascem na tela deles)
        ZOMBIE: 1, ZOMBIE_CRAWLER: 1, ARMORED_ZOMBIE: 3, RIVER_EEL: 1, DROWNED: 2, BOG_TOAD: 1, BOG_SLIME: 2, SKELETON_WARRIOR: 1, SKELETON_ARCHER: 3, MILITIA: 1, PLATE_KNIGHT: 3, LANCER: 2, DEMON: 4
    }
};

// Quanto da onda já passou (0 a 1): o menor entre a cota de pontos e o tempo mínimo. Hordas, elites, a barra do HUD e o fim da onda usam isto.
export function waveProgress(score, target, waveTime) {
    return Math.min(score / Math.max(1, target), waveTime / TURN_DIFFICULTY.waveMinSeconds);
}

// CURVA DE TENSÃO DA ONDA: multiplica a taxa de nascimento conforme a onda avança (progresso 0 a 1). Calmo no começo (dá para respirar e
// juntar o que caiu), aperta no meio, alivia um instante depois do elite (0,6) e sobe até o pico no fim. Pontos [progresso, multiplicador].
export const TENSION_CURVE = [[0, 0.55], [0.15, 0.7], [0.45, 1.5], [0.62, 1.05], [0.82, 1.95], [1, 2.1]];
export function waveTension(progress) {
    const c = TENSION_CURVE;
    const p = Math.max(0, Math.min(1, progress));
    for (let i = 1; i < c.length; i++) {
        if (p <= c[i][0]) {
            const [x0, y0] = c[i - 1], [x1, y1] = c[i];
            return y0 + (y1 - y0) * ((p - x0) / (x1 - x0));
        }
    }
    return c[c.length - 1][1];
}

// Quanto mais a onda avança, mais depressa nascem monstros (multiplica a taxa de spawn)
export function waveSpawnBoost(waveTime) {
    return 1 + TURN_DIFFICULTY.spawnGrowth * Math.min(1, waveTime / TURN_DIFFICULTY.waveMinSeconds);
}

// Multiplicadores e intervalo de spawn de um turno (turno 1 = mais fácil)
export function getTurnDifficulty(turn) {
    const D = TURN_DIFFICULTY;
    // A curva foi feita para 12 ondas: com 30, a onda é convertida (campaign.js, effectiveTurn)
    const steps = Math.max(0, effectiveTurn(turn) - 1);
    return {
        hpMultiplier: D.hpMultiplierFirstTurn + steps * D.hpMultiplierPerTurn,
        speedMultiplier: Math.min(D.maxSpeedMultiplier, D.speedMultiplierFirstTurn + steps * D.speedMultiplierPerTurn),
        damageMultiplier: Math.min(D.maxDamageMultiplier, D.damageMultiplierFirstTurn + steps * D.damageMultiplierPerTurn)
            * (D.earlyDamageRelief[Math.floor(steps)] ?? 1),
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
    return effectiveTurn(turn) >= (TURN_DIFFICULTY.monsterUnlockTurn[type] ?? 1) - 1e-9;
}
