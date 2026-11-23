import { createEnemy } from './monsters.js';
import { CAMPAIGN, TOTAL_WAVES } from './campaign.js';
import { RIVAL_OF, bossModelOf } from './characters/index.js';

// --- BOSSES ---
// Separados dos monstros comuns: não entram no sorteio normal, aparecem nas ondas do
// cronograma (BOSS_SPAWNING.schedule), têm nome próprio (mostrado na barra de vida do HUD) e seguram a virada do turno até morrer.
// renderAs: arte reaproveitada (js/render/entities.js); palette: troca a paleta dessa arte.
// patterns: sequência de ataques, repetida em ciclo (js/systems/boss_ai.js). Abaixo de enrageRatio de
// vida o boss enfurece: pausas menores e mais velocidade.
// Vida: o boss já sobe com o multiplicador de dificuldade da hora (0.65 + 0.17 por hora), então hpPerTurn fica em 0
// e o hpBase é a vida da primeira aparição dividida por esse multiplicador. Duração alvo da luta com o dano que o
// herói faz de fato (já descontando o tempo desviando): Demon Lord ~1 min (35/s), Blood Countess ~2 min (70/s),
// The Long Night ~5 min (100/s). Mudou o ritmo do herói? Ajuste o hpBase na mesma proporção.

// Golpes tirados de campo (ajuste de nov/2026): bloom (Condessa, Long Night), mark (Azael) e traps (Demon Hunter) saíram das listas de
// patterns. O código deles continua em js/systems/boss_ai.js; para devolver, é só pôr o nome de volta na lista.
// --- RIVAL (primeiro boss da noite) ---
// Na primeira hora da noite (BOSS_SPAWNING.schedule) o herói enfrenta o outro herói jogável: quem joga
// com o Demon Hunter luta com o Azael, e quem joga com o Azael luta com o Demon Hunter (ver chooseBossType).
// renderAs 'RIVAL' desenha o mesmo boneco 2.5D do herói (js/render/rival.js); heroModel escolhe qual e heroKey a
// paleta (data_model/heroes.js). renderScale: o tamanho do boneco em relação ao herói (1 = igual ao jogável).
// lunge: mira uma linha no chão por lungeWindupSeconds, depois atravessa ela com a espada em lungeSeconds.
const RIVAL_BASE = {
    renderAs: 'RIVAL',
    renderScale: 1,               // mesmo tamanho do boneco jogável
    // Luta de abertura: o herói ainda está no nível 1, então a vida é bem menor que a do Demon Lord
    hpBase: 700,
    hpPerTurn: 0,
    radius: 20,                   // área de contato do boneco em tamanho normal (era 26 com o boneco 30% maior)
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
    lungeWindupSeconds: 0.55,
    // A investida é rápida e a área de contato é mais grossa que a linha de aviso (que não mostra a folga extra)
    lungeHitRadius: 40,
    lungeDamageMultiplier: 1.1,
    // Os rivais atiram adagas (mais rápidas que as bolas de fogo dos outros bosses)
    projectileStyle: 'dagger',
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
    // Ataque 'shadows': invoca shadowCount sombras dele, cada uma com shadowHpRatio da vida máxima do rival.
    // Só invoca de novo quando as anteriores caírem. O modelo da sombra é a chave do rival + '_SHADOW'.
    shadowCount: 3,
    shadowHpRatio: 0.1,
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
        phases: [
            { at: 1, patterns: ['volley', 'ring', 'volley', 'slam', 'summon'] },
            { at: 0.66, label: 'FIRE RAIN', patterns: ['volley', 'meteors', 'claw', 'slam', 'summon'] },
            { at: 0.33, label: 'INFERNO', patterns: ['meteors', 'claw', 'ring', 'meteors', 'slam', 'summon', 'volley'] }
        ],
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
        phases: [
            { at: 1, patterns: ['blink', 'volley', 'spiral', 'summon'] },
            { at: 0.66, label: 'BLOOD BLOOM', patterns: ['blink', 'volley', 'spiral', 'summon'] },
            { at: 0.33, label: 'CRIMSON TIDE', patterns: ['blink', 'spiral', 'ring', 'summon', 'volley'] }
        ],
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
    // Rival de quem joga com o Demon Hunter (e com o Brutos): rápido, ataca de perto e some na sombra. Os números e o jeito de
    // lutar dele estão em data_model/characters/azael.js (boss proporcional ao personagem).
    AZAEL: { ...RIVAL_BASE, ...bossModelOf('azael') },
    // Rival de quem joga com o Azael: mais lento, lança adagas e crava círculos no chão (data_model/characters/hunter.js)
    DEMON_HUNTER: { ...RIVAL_BASE, ...bossModelOf('hunter') },
    // Semi-boss do meio da noite (hora 6): o rival do herói o chama (BOSS_INTROS em dialogues.js) e ele entra falando uma
    // frase curta. Corpo de herói (renderAs 'RIVAL'), mas sem duelo (noDuel). Tanque imparável: números e jeito de lutar em
    // data_model/characters/brutos.js (boss proporcional ao personagem). Boneco: library/characters/brutos/brutos25d.js.
    BRUTOS: { ...RIVAL_BASE, ...bossModelOf('brutos') },
    // --- Chefes das telas do mapa (nov/2026): arte em library/monsters/25d/<id>. Os golpes são os de sempre (js/systems/boss_ai.js); a vida é um primeiro palpite, sem balancear ---
    // River Crossing: dama d'água que some e reaparece, chove esferas e chama os afogados
    LAKE_SPIRIT: {
        name: 'Lake Spirit',
        title: 'The Drowned Lady',
        renderAs: 'LAKE_SPIRIT',
        hpBase: 1500,
        hpPerTurn: 0,
        speedMin: 40,
        speedMax: 40,
        radius: 30,
        color: '#38bdf8',
        damage: 24,
        burstCount: 4,
        burstIntervalSeconds: 0.32,
        initialShootCooldownSeconds: 1.5,
        patternGapSeconds: 2.3,
        patterns: ['blink', 'volley', 'ring', 'spiral', 'summon'],
        phases: [
            { at: 1, patterns: ['blink', 'volley', 'ring', 'summon'] },
            { at: 0.6, label: 'RISING TIDE', patterns: ['blink', 'spiral', 'volley', 'ring', 'summon'] },
            { at: 0.3, label: 'THE LAKE REMEMBERS', patterns: ['spiral', 'blink', 'ring', 'volley', 'spiral', 'summon'] }
        ],
        ringCount: 14,
        spiralShots: 16,
        spiralIntervalSeconds: 0.13,
        summonType: 'DROWNED',
        summonCount: 3,
        projectileSpeed: 170,
        projectileRadius: 7,
        projectileDamageMultiplier: 0.75,
        projectileTorchDamage: 6,
        enrageRatio: 0.45,
        enrageGapMultiplier: 0.7,
        enrageSpeedMultiplier: 1.3,
        walkShakeIntensity: 0,
        walkShakeIntervalSeconds: 99,
        scoreReward: 400,
        goldBase: 80,
        goldVariance: 0,
        xpRewardBase: 260,
        xpRewardPerTurn: 25,
    },
    // Swamp: gosma gigante; pesada, bate no chão e solta lodos
    SLIZORK: {
        name: 'Slizork',
        title: 'Tyrant of the Mire',
        renderAs: 'SLIZORK',
        deathType: 'SLIZORK',
        hpBase: 2400,
        hpPerTurn: 0,
        speedMin: 26,
        speedMax: 26,
        radius: 34,
        color: '#4a9a2e',
        damage: 30,
        burstCount: 3,
        burstIntervalSeconds: 0.5,
        initialShootCooldownSeconds: 1.5,
        patternGapSeconds: 2.4,
        patterns: ['slam', 'rake', 'volley', 'ring', 'summon'],
        phases: [
            { at: 1, patterns: ['rake', 'slam', 'volley', 'ring', 'summon'] },
            { at: 0.6, label: 'OOZING RAGE', patterns: ['rake', 'slam', 'rake', 'volley', 'ring', 'summon'] },
            { at: 0.3, label: 'THE BOG RISES', patterns: ['rake', 'slam', 'ring', 'rake', 'volley', 'summon', 'slam'] }
        ],
        ringCount: 14,
        slamCount: 4,
        slamRadius: 80,
        slamDelaySeconds: 1,
        slamDamageMultiplier: 0.9,
        slamTorchDamage: 8,
        summonType: 'BOG_SLIME',
        summonCount: 3,
        projectileSpeed: 150,
        projectileRadius: 8,
        projectileDamageMultiplier: 0.8,
        projectileTorchDamage: 6,
        enrageRatio: 0.45,
        enrageGapMultiplier: 0.7,
        enrageSpeedMultiplier: 1.35,
        walkShakeIntensity: 7,
        walkShakeIntervalSeconds: 4.5,
        scoreReward: 600,
        goldBase: 100,
        goldVariance: 0,
        xpRewardBase: 340,
        xpRewardPerTurn: 30,
    },
    // Graveyard: esqueleto zumbi de guerra; chama os mortos, golpeia o chão e lança ossos
    GRAVE_KING: {
        name: 'Grave King',
        title: 'The Rotting Warlord',
        renderAs: 'GRAVE_KING',
        hpBase: 3200,
        hpPerTurn: 0,
        speedMin: 34,
        speedMax: 34,
        radius: 30,
        color: '#7f996a',
        damage: 32,
        burstCount: 5,
        burstIntervalSeconds: 0.3,
        initialShootCooldownSeconds: 1.5,
        patternGapSeconds: 2.1,
        patterns: ['slam', 'volley', 'summon', 'ring', 'slam'],
        phases: [
            { at: 1, patterns: ['slam', 'volley', 'summon', 'ring'] },
            { at: 0.6, label: 'THE DEAD RISE', patterns: ['summon', 'slam', 'volley', 'ring', 'summon'] },
            { at: 0.3, label: 'ROT AND RUIN', patterns: ['slam', 'summon', 'ring', 'slam', 'volley', 'summon', 'spiral'] }
        ],
        ringCount: 16,
        slamCount: 4,
        slamRadius: 78,
        slamDelaySeconds: 0.95,
        slamDamageMultiplier: 0.9,
        slamTorchDamage: 9,
        spiralShots: 18,
        spiralIntervalSeconds: 0.12,
        summonType: 'ZOMBIE',
        summonCount: 4,
        projectileSpeed: 175,
        projectileRadius: 7,
        projectileDamageMultiplier: 0.75,
        projectileTorchDamage: 6,
        enrageRatio: 0.45,
        enrageGapMultiplier: 0.65,
        enrageSpeedMultiplier: 1.35,
        walkShakeIntensity: 6,
        walkShakeIntervalSeconds: 4,
        scoreReward: 800,
        goldBase: 120,
        goldVariance: 0,
        xpRewardBase: 400,
        xpRewardPerTurn: 35,
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
        phases: [
            { at: 1, patterns: ['ring', 'slam', 'spiral', 'volley', 'summon', 'blink'] },
            { at: 0.66, label: 'ECLIPSE', patterns: ['eclipse', 'slam', 'spiral', 'summon', 'blink', 'ring'] },
            { at: 0.33, label: 'THE DARK ITSELF', patterns: ['eclipse', 'spiral', 'eclipse', 'slam', 'summon', 'ring', 'blink'] }
        ],
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
    // Revanche: já começa com o kit completo e ainda ganha fases
    patterns: ['lunge', 'combo', 'volley', 'blink'],
    phases: [
        { at: 1, patterns: ['lunge', 'combo', 'volley', 'blink'] },
        { at: 0.66, label: 'SHADOW LEGION', patterns: ['lunge', 'combo', 'shadows', 'blink', 'ring'] },
        { at: 0.33, label: 'FULL POWER', patterns: ['combo', 'shadows', 'blink', 'ring', 'combo', 'volley', 'lunge'] }
    ],
    scoreReward: 1500, goldBase: 180, xpRewardBase: 500, xpRewardPerTurn: 0
});
rematch('DEMON_HUNTER', {
    hpBase: 6000, patternGapSeconds: 1.6, burstCount: 6, ringCount: 18, slamCount: 5, meleeCooldownSeconds: 0.8,
    patterns: ['volley', 'lunge', 'columns', 'slam'],
    phases: [
        { at: 1, patterns: ['volley', 'lunge', 'columns', 'slam'] },
        { at: 0.66, label: 'HOLY WRATH', patterns: ['volley', 'lunge', 'shackle', 'columns', 'shadows', 'slam', 'ring'] },
        { at: 0.33, label: 'FULL POWER', patterns: ['columns', 'shackle', 'shadows', 'lunge', 'slam', 'ring', 'volley'] }
    ],
    scoreReward: 1500, goldBase: 180, xpRewardBase: 500, xpRewardPerTurn: 0
});

// --- SOMBRAS DO RIVAL ---
// Cópias menores e escuras do rival (mesmo boneco, paleta de sombra): andam em volta do herói e golpeiam de perto,
// sem tiros nem investidas. A vida vem do rival na hora da invocação (shadowHpRatio); o dano, de shadowDamageRatio.
// Não são bosses: não seguram a hora e caem todas junto com o rival. hidden: fora do bestiário.
function shadowOf(key) {
    const base = BOSS_MODELS[key];
    BOSS_MODELS[`${key}_SHADOW`] = {
        ...base,
        name: `Shadow of ${base.name}`,
        hidden: true,
        isShadow: true,
        renderScale: 1,
        radius: 18,
        // Sombra de quem mantém distância (Demon Hunter) também fica longe e joga adagas em você a cada
        // shadowThrowSeconds; a do Azael vai em cima do herói e só golpeia. Adaga de sombra não fere a tocha
        shadowThrowSeconds: base.keepRange ? 2.6 : 0,
        projectileTorchDamage: 0,
        shadowDamageRatio: 0.5,
        meleeCooldownSeconds: base.meleeCooldownSeconds * 1.4,
        knockbackResist: 0,
        scoreReward: 25,
        goldBase: 2,
        xpRewardBase: 12,
        xpRewardPerTurn: 0
    };
}
shadowOf('AZAEL');
shadowOf('DEMON_HUNTER');

export const BOSS_SPAWNING = {
    // Hora → boss da noite. RIVAL: o rival do herói (RIVAL_OF); RIVAL_FINAL: a revanche dele, que fecha a noite.
    // BRUTOS (hora 6): semi-boss do meio da noite
    // 6 telas x 3 ondas (data_model/campaign.js): o chefe fecha cada tela (ondas 3, 6, 9...). A 1ª tela (Dark Forest) termina com o rival (Azael, ou o Demon Hunter para quem joga de Azael).
    // Dark Forest: Azael (o rival) · River Crossing: Lake Spirit · Swamp: Slizork · Graveyard: Grave King · Village: Brutos
    // Castle: os TRÊS chefes, um por onda: Blood Countess, The Long Night e a revanche do Azael (o rival). O Demon Lord só vem para quem joga de Brutos, no lugar dele na Village
    schedule: {
        [3 * 1]: 'RIVAL', [3 * 2]: 'LAKE_SPIRIT', [3 * 3]: 'SLIZORK', [3 * 4]: 'GRAVE_KING', [3 * 5]: 'BRUTOS',
        [3 * 5 + 1]: 'BLOOD_COUNTESS', [3 * 5 + 2]: 'LONG_NIGHT', [3 * 5 + 3]: 'RIVAL_FINAL'
    },
    spawnScreenRatio: 0.5
};

// Boss com a conversa de duelo (rival da hora 1 e a revanche). Os que têm corpo de herói mas noDuel (Brutos) entram
// pela provocação dos outros bosses.
export function hasDuel(model) {
    return model.renderAs === 'RIVAL' && !model.noDuel;
}

// heroModel: o boneco do herói escolhido; há horas que ficam sem boss para certos heróis (o Brutos não luta contra si mesmo)
export function isBossTurn(turn, heroModel = 'hunter') {
    return !!chooseBossType(turn, heroModel);
}

// Rival de cada boneco de herói: o Demon Hunter (e as variações dele) e o Brutos enfrentam o Azael, e o Azael o Demon Hunter
// (vem do campo `rival` de cada personagem, em data_model/characters/)
export { RIVAL_OF };

// Boss da hora (heroModel: o boneco do herói escolhido, getHero().model, que decide o rival)
export function chooseBossType(turn, heroModel = 'hunter') {
    const { schedule } = BOSS_SPAWNING;
    const rival = RIVAL_OF[heroModel] ?? RIVAL_OF.hunter;
    const slot = schedule[turn];
    // O Captain Brutos não luta contra si mesmo: quem joga com ele enfrenta o Demon Lord na Village (o Demon Lord só aparece assim)
    if (slot === 'BRUTOS' && heroModel === 'brutos') return 'DEMON_LORD';
    if (slot === 'RIVAL') return rival;
    if (slot === 'RIVAL_FINAL') return `${rival}_FINAL`;
    return slot ?? null;
}

// Boss segura o empurrão: perde 85% dele (um monstro comum leva o empurrão inteiro). Quem tiver knockbackResist próprio usa o seu
const BOSS_KNOCKBACK_RESIST = 0.85;

// Bosses vivem mais (2026-11-18): medido com o piloto do sandbox (Fast Run, herói que só ataca), as lutas duravam 15 a 35 s
// (The Long Night ~80 s): o boss morria antes de mostrar os ataques. A vida de cada um é multiplicada por isto. Alvo com o piloto:
// rival da 1ª hora ~30 s, Demon Lord ~45 s, Brutos ~50 s, Blood Countess ~65 s, The Long Night ~2 min, revanche final ~75 s
// (um jogador que desvia leva cerca do dobro). O rival da 1ª hora sobe menos: é onde o jogador novo ainda aprende.
// +15% em todos (2026-11-18): sem monstros comuns durante o boss, a luta é o foco e pode durar mais.
const BOSS_FOCUS_BONUS = 1.15;
export const BOSS_HP_SCALE = { LAKE_SPIRIT: 2.2 * BOSS_FOCUS_BONUS, SLIZORK: 2.2 * BOSS_FOCUS_BONUS, GRAVE_KING: 2.2 * BOSS_FOCUS_BONUS, DEMON_LORD: 2.4 * BOSS_FOCUS_BONUS, BRUTOS: 2.2 * BOSS_FOCUS_BONUS, BLOOD_COUNTESS: 1.8 * BOSS_FOCUS_BONUS, LONG_NIGHT: 1.8 * BOSS_FOCUS_BONUS };
const FIRST_HOUR_BOSS_HP_SCALE = 1.7 * BOSS_FOCUS_BONUS;
const FINAL_BOSS_HP_SCALE = 2 * BOSS_FOCUS_BONUS;
const OTHER_BOSS_HP_SCALE = 2 * BOSS_FOCUS_BONUS;
function bossHpScale(type, turn) {
    if (BOSS_HP_SCALE[type]) return BOSS_HP_SCALE[type];
    if (type.endsWith('_FINAL')) return FINAL_BOSS_HP_SCALE;
    return turn <= 1 ? FIRST_HOUR_BOSS_HP_SCALE : OTHER_BOSS_HP_SCALE;
}

export function createBoss(type, turn, x, y, random = Math.random) {
    const model = BOSS_MODELS[type];
    if (!model) throw new Error(`Unknown boss type: ${type}`);
    const enemy = createEnemy(model, type, turn, x, y, random);
    const scale = bossHpScale(type, turn);
    enemy.hp = Math.round(enemy.hp * scale);
    enemy.maxHp = Math.round(enemy.maxHp * scale);
    return {
        ...enemy,
        knockbackResist: model.knockbackResist ?? BOSS_KNOCKBACK_RESIST,
        unstoppable: !!model.unstoppable,     // não é atrasado, preso nem empurrado (Captain Brutos)
        isBoss: true,
        name: model.name
    };
}


// --- GOLPES DE VARIAÇÃO (nov/2026) ---
// Golpes que não deixam a luta mais difícil, só mais variada: pausas em que o boss fica aberto, golpes que mudam o espaço e golpes
// que respondem às skills do herói (o código de cada um está em js/systems/boss_ai.js). Entram nas fases depois da primeira (e na
// lista simples dos bosses sem fases). O Cansaço ('rest') entra em todas as listas de todos os bosses.
const VARIATION_MOVES = {
    // 'fireshield' (Escudo de Fogo do Demon Lord) saiu das listas; o código continua em boss_ai.js
    DEMON_LORD: [],
    BRUTOS: ['anchor'],
    BLOOD_COUNTESS: ['bloodfog', 'mirror'],
    LAKE_SPIRIT: [],
    SLIZORK: [],
    GRAVE_KING: [],
    LONG_NIGHT: ['darkness'],
    DEMON_HUNTER: ['mirror'],               // 'holyground' (Chão Sagrado) saiu das listas; o código continua em boss_ai.js
    DEMON_HUNTER_FINAL: ['mirror'],
    // 'echo' (Espelho do Azael) saiu das listas; o código continua em boss_ai.js
};
// O Cansaço ('rest') saiu de todos os bosses (nov/2026); o código continua em boss_ai.js. Para devolver: trocar por new Set() e
// reativar a linha que o adiciona abaixo
const NO_REST = new Set(Object.keys(BOSS_MODELS));
for (const [type, model] of Object.entries(BOSS_MODELS)) {
    if (model.isShadow) continue;
    const special = VARIATION_MOVES[type] ?? [];
    const lists = model.phases
        ? model.phases.map(ph => ({ list: ph.patterns, first: ph.at >= 1 }))
        : [{ list: model.patterns, first: false }];
    for (const { list, first } of lists) {
        if (!NO_REST.has(type) && !list.includes('rest')) list.push('rest');
        if (!first) special.forEach(m => { if (!list.includes(m)) list.push(m); });
    }
}
