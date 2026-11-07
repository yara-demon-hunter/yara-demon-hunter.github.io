import { createEnemy } from './monsters.js';

// --- BOSSES ---
// Separados dos monstros comuns: não entram no sorteio normal, aparecem a cada `everyTurns`
// turnos, têm nome próprio (mostrado na barra de vida do HUD) e seguram a virada do turno até morrer.
// renderAs: arte reaproveitada (js/render/entities.js); palette: troca a paleta dessa arte.
// patterns: sequência de ataques, repetida em ciclo (js/systems/boss_ai.js). Abaixo de enrageRatio de
// vida o boss enfurece: pausas menores e mais velocidade.
// Vida: o boss já sobe com o multiplicador de dificuldade da hora (0.65 + 0.17 por hora), então hpPerTurn fica em 0
// e o hpBase é a vida da primeira aparição dividida por esse multiplicador. Duração alvo da luta com o dano que o
// herói faz de fato (já descontando o tempo desviando): Demon Lord ~1 min (35/s), Blood Countess ~2 min (70/s),
// The Long Night ~5 min (100/s). Mudou o ritmo do herói? Ajuste o hpBase na mesma proporção.

// --- RIVAL (primeiro boss da noite) ---
// Na primeira hora da noite (BOSS_SPAWNING.schedule) o herói enfrenta o outro herói jogável: quem joga
// com o Demon Hunter luta com o Azael, e quem joga com o Azael luta com o Demon Hunter (ver chooseBossType).
// renderAs 'RIVAL' desenha o mesmo boneco 2.5D do herói (js/render/rival.js); heroModel escolhe qual e heroKey a
// paleta (data_model/heroes.js). renderScale: o tamanho do boneco em relação ao herói.
// lunge: mira uma linha no chão por lungeWindupSeconds, depois atravessa ela com a espada em lungeSeconds.
const RIVAL_BASE = {
    renderAs: 'RIVAL',
    renderScale: 1.3,
    // Luta de abertura: o herói ainda está no nível 1, então a vida é bem menor que a do Demon Lord
    hpBase: 700,
    hpPerTurn: 0,
    radius: 26,
    initialShootCooldownSeconds: 1.5,
    burstIntervalSeconds: 0.3,
    // Golpe automático de espada, como o do herói: quando o herói entra em meleeRange, golpeia a cada
    // meleeCooldownSeconds; o corte acerta meleeHitDelaySeconds depois (o tempo da preparação do boneco)
    meleeRange: 62,
    meleeArc: 2.2,                // abertura do corte, em radianos, para a frente
    meleeHitDelaySeconds: 0.12,
    meleeDamageMultiplier: 0.8,
    // Movimento: anda de lado em volta do herói (troca de sentido a cada strafeSwitchSeconds) e, mais perto que
    // keepRange, recua. castSeconds: o gesto da mão a cada tiro
    strafeSpeed: 55,
    strafeSwitchSeconds: 1.6,
    castSeconds: 0.34,
    lungeLength: 330,
    lungeWindupSeconds: 0.75,
    lungeSeconds: 0.22,
    lungeHitRadius: 22,
    lungeDamageMultiplier: 1.1,
    projectileRadius: 6,
    projectileDamageMultiplier: 0.7,
    projectileTorchDamage: 5,
    enrageRatio: 0.5,
    enrageGapMultiplier: 0.65,
    walkShakeIntensity: 0,
    walkShakeIntervalSeconds: 99,
    scoreReward: 150,
    goldBase: 35,
    goldVariance: 0,
    xpRewardBase: 110,
    xpRewardPerTurn: 0,
};

export const BOSS_MODELS = {
    DEMON_LORD: {
        name: 'Demon Lord',
        title: 'Lord of the First Fire',
        renderAs: 'DEMON_LORD',
        hpBase: 1810,
        hpPerTurn: 0,
        speedMin: 28,
        speedMax: 28,
        radius: 32,
        color: '#dc2626',
        damage: 30,
        // Ataque em rajada: burstCount bolas de fogo seguidas (burstIntervalSeconds entre elas) e depois
        // uma pausa de patternGapSeconds
        burstCount: 3,
        burstIntervalSeconds: 0.55,
        initialShootCooldownSeconds: 1.5,
        patternGapSeconds: 2.6,
        patterns: ['volley', 'ring', 'volley', 'slam', 'summon'],
        ringCount: 14,
        slamCount: 3,
        slamRadius: 74,
        slamDelaySeconds: 1,
        slamDamageMultiplier: 0.9,
        slamTorchDamage: 8,           // círculo que estoura em cima da tocha
        summonType: 'BAT',
        summonCount: 4,
        projectileSpeed: 160,
        projectileRadius: 7,          // bola de fogo (raio de acerto)
        projectileDamageMultiplier: 0.8,
        projectileTorchDamage: 6,
        enrageRatio: 0.5,
        enrageGapMultiplier: 0.7,
        enrageSpeedMultiplier: 1.35,
        // Tremor de tela enquanto anda: um a cada walkShakeIntervalSeconds, não o tempo todo
        walkShakeIntensity: 8,
        walkShakeIntervalSeconds: 4.5,
        scoreReward: 250,
        goldBase: 55,
        goldVariance: 0,
        xpRewardBase: 180,
        xpRewardPerTurn: 20,
    },
    BLOOD_COUNTESS: {
        name: 'Blood Countess',
        title: 'She Who Drinks the Light',
        renderAs: 'VAMPIRE',
        palette: 'countess',
        hpBase: 4565,
        hpPerTurn: 0,
        speedMin: 46,
        speedMax: 46,
        radius: 30,
        color: '#e11d48',
        damage: 26,
        burstCount: 5,
        burstIntervalSeconds: 0.28,
        initialShootCooldownSeconds: 1.5,
        patternGapSeconds: 2.2,
        patterns: ['blink', 'volley', 'spiral', 'blink', 'ring', 'summon'],
        ringCount: 18,
        spiralShots: 18,
        spiralIntervalSeconds: 0.12,
        summonType: 'BAT',
        summonCount: 6,
        projectileSpeed: 185,
        projectileRadius: 6,
        projectileDamageMultiplier: 0.7,
        projectileTorchDamage: 6,
        enrageRatio: 0.5,
        enrageGapMultiplier: 0.65,
        enrageSpeedMultiplier: 1.3,
        walkShakeIntensity: 0,
        walkShakeIntervalSeconds: 99,
        scoreReward: 500,
        goldBase: 95,
        goldVariance: 0,
        xpRewardBase: 320,
        xpRewardPerTurn: 30,
    },
    // Rival de quem joga com o Demon Hunter: rápido, ataca de perto e some na sombra
    AZAEL: {
        ...RIVAL_BASE,
        name: 'Azael',
        title: 'The Demon Who Hunts His Kind',
        heroModel: 'azael',
        heroKey: 'azael',
        speedMin: 62,
        speedMax: 62,
        color: '#ef4444',
        damage: 28,
        meleeCooldownSeconds: 0.85,
        keepRange: 0,
        burstCount: 3,
        patternGapSeconds: 1.9,
        patterns: ['lunge', 'volley', 'lunge', 'blink', 'lunge', 'ring'],
        ringCount: 12,
        projectileSpeed: 190,
        enrageSpeedMultiplier: 1.35,
    },
    // Rival de quem joga com o Azael: mais lento, lança adagas e crava círculos no chão
    DEMON_HUNTER: {
        ...RIVAL_BASE,
        name: 'Demon Hunter',
        title: 'He Hunts Your Kind',
        heroModel: 'hunter',
        heroKey: 'hunter',
        speedMin: 50,
        speedMax: 50,
        color: '#38bdf8',
        damage: 26,
        meleeCooldownSeconds: 1.1,
        keepRange: 170,
        strafeSpeed: 70,
        burstCount: 4,
        patternGapSeconds: 2.1,
        patterns: ['volley', 'lunge', 'slam', 'lunge', 'volley', 'ring'],
        ringCount: 14,
        slamCount: 3,
        slamRadius: 70,
        slamDelaySeconds: 1,
        slamDamageMultiplier: 0.9,
        slamTorchDamage: 6,
        projectileSpeed: 210,
        enrageSpeedMultiplier: 1.3,
    },
    LONG_NIGHT: {
        name: 'The Long Night',
        title: 'The Dark Itself',
        renderAs: 'DEMON_LORD',
        palette: 'longNight',
        hpBase: 11900,
        hpPerTurn: 0,
        speedMin: 32,
        speedMax: 32,
        radius: 42,
        color: '#7c3aed',
        damage: 34,
        burstCount: 7,
        burstIntervalSeconds: 0.24,
        initialShootCooldownSeconds: 1.5,
        patternGapSeconds: 1.9,
        patterns: ['ring', 'slam', 'spiral', 'volley', 'summon', 'slam', 'ring', 'blink'],
        ringCount: 18,
        slamCount: 5,
        slamRadius: 84,
        slamDelaySeconds: 0.95,
        slamDamageMultiplier: 0.8,
        slamTorchDamage: 10,
        spiralShots: 24,
        spiralIntervalSeconds: 0.1,
        summonType: 'WRAITH',
        summonCount: 4,
        projectileSpeed: 175,
        projectileRadius: 8,
        projectileDamageMultiplier: 0.7,
        projectileTorchDamage: 6,
        enrageRatio: 0.4,
        enrageGapMultiplier: 0.6,
        enrageSpeedMultiplier: 1.4,
        walkShakeIntensity: 10,
        walkShakeIntervalSeconds: 3.5,
        scoreReward: 1500,
        goldBase: 180,
        goldVariance: 0,
        xpRewardBase: 500,
        xpRewardPerTurn: 40,
    }
};

// Revanche na última hora: o mesmo rival, bem mais forte (vida de luta final, pausas menores, mais tiros).
// Mesma chave + '_FINAL'; hidden tira a revanche do bestiário (o rival já está lá).
function rematch(key, changes) {
    const base = BOSS_MODELS[key];
    BOSS_MODELS[`${key}_FINAL`] = { ...base, title: 'Stronger Than Before', hidden: true, ...changes };
}
rematch('AZAEL', {
    hpBase: 6000, patternGapSeconds: 1.4, burstCount: 5, ringCount: 16, meleeCooldownSeconds: 0.6,
    patterns: ['lunge', 'volley', 'lunge', 'blink', 'lunge', 'ring', 'lunge', 'blink'],
    scoreReward: 1500, goldBase: 180, xpRewardBase: 500, xpRewardPerTurn: 0
});
rematch('DEMON_HUNTER', {
    hpBase: 6000, patternGapSeconds: 1.6, burstCount: 6, ringCount: 18, slamCount: 5, meleeCooldownSeconds: 0.8,
    patterns: ['volley', 'lunge', 'slam', 'ring', 'lunge', 'volley', 'slam'],
    scoreReward: 1500, goldBase: 180, xpRewardBase: 500, xpRewardPerTurn: 0
});

export const BOSS_SPAWNING = {
    // Hora → boss da noite. RIVAL: o rival do herói (RIVAL_OF); RIVAL_FINAL: a revanche dele, que fecha a noite
    schedule: { 1: 'RIVAL', 4: 'DEMON_LORD', 8: 'BLOOD_COUNTESS', 11: 'LONG_NIGHT', 12: 'RIVAL_FINAL' },
    lastScheduledHour: 12,
    // Modo sem fim (depois da hora 12): um boss a cada everyTurns horas, nesta ordem
    everyTurns: 4,
    spawnScreenRatio: 0.5,
    rotation: ['DEMON_LORD', 'BLOOD_COUNTESS', 'LONG_NIGHT']
};

export function isBossTurn(turn) {
    const { schedule, lastScheduledHour, everyTurns } = BOSS_SPAWNING;
    return turn <= lastScheduledHour ? !!schedule[turn] : turn % everyTurns === 0;
}

// Rival de cada boneco de herói: o Demon Hunter (e as variações dele) enfrenta o Azael, e o Azael o Demon Hunter
export const RIVAL_OF = { hunter: 'AZAEL', azael: 'DEMON_HUNTER' };

// Boss da hora (heroModel: o boneco do herói escolhido, getHero().model, que decide o rival)
export function chooseBossType(turn, heroModel = 'hunter') {
    const { schedule, lastScheduledHour, rotation, everyTurns } = BOSS_SPAWNING;
    const rival = RIVAL_OF[heroModel] ?? RIVAL_OF.hunter;
    if (turn <= lastScheduledHour) {
        const slot = schedule[turn];
        if (slot === 'RIVAL') return rival;
        if (slot === 'RIVAL_FINAL') return `${rival}_FINAL`;
        return slot ?? null;
    }
    return rotation[(Math.floor(turn / everyTurns) - 1) % rotation.length];
}

// Boss segura o empurrão: perde 85% dele (um monstro comum leva o empurrão inteiro). Quem tiver knockbackResist próprio usa o seu
const BOSS_KNOCKBACK_RESIST = 0.85;

export function createBoss(type, turn, x, y, random = Math.random) {
    const model = BOSS_MODELS[type];
    if (!model) throw new Error(`Unknown boss type: ${type}`);
    return {
        ...createEnemy(model, type, turn, x, y, random),
        knockbackResist: model.knockbackResist ?? BOSS_KNOCKBACK_RESIST,
        isBoss: true,
        name: model.name
    };
}
