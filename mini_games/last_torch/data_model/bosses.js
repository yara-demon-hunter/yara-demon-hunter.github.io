import { createEnemy } from './monsters.js';
import { CAMPAIGN, TOTAL_WAVES } from './campaign.js';
import { RIVAL_OF, bossModelOf } from './characters/index.js';

// --- BOSSES ---
// Separados dos monstros comuns: não entram no sorteio normal, aparecem nas ondas do
// cronograma (BOSS_SPAWNING.schedule), têm nome próprio (mostrado na barra de vida do HUD) e seguram a virada do turno até morrer.
// renderAs: arte reaproveitada (js/render/entities.js); palette: troca a paleta dessa arte.
// patterns: sequência de ataques, repetida em ciclo (js/systems/boss_ai.js). Abaixo de enrageRatio de
// vida o boss enfurece: pausas menores e mais velocidade.
// ============================================================================================================================
// AJUSTE DOS CHEFES: tudo o que se mexe com frequência fica aqui, no topo.
//   1. BOSS_STATS: a vida, o dano, a velocidade e as DEFESAS (física e mágica) FINAIS de cada chefe (Escuridão 1). O número escrito aqui é o que vale em jogo, sem curva por
//      onda nem multiplicador escondido. Cada chefe aparece numa onda fixa da campanha, então o número é de uma onda só.
//   2. BOSS_DARKNESS: quanto a Escuridão aumenta TODOS os chefes, por nível acima do 1 (vida, dano e velocidade). Um valor muda todos.
//   3. BOSS_GLOBAL: botões gerais (multiplicam todos os chefes, em qualquer Escuridão): ex.: vida 0.8 deixa todos 20% mais fracos.
// Os golpes de cada chefe (patterns, phases e os números de cada golpe) ficam logo abaixo, no BOSS_MODELS.
// ============================================================================================================================
export const BOSS_STATS = {
    // physicalDef: defesa contra golpes físicos (lâmina, adaga, tudo o que mostra número branco); magicDef: defesa contra magia (número azul e fogo da tocha).
    // As defesas são em fração do dano que NÃO passa: 0.25 = o chefe leva 25% menos dano desse tipo; 0 = leva tudo. (Número roxo, das sombras, conta como físico.)
    //                    vida    dano  velocidade  physicalDef  magicDef      (onda em que aparece)
    AZAEL:               { hp: 4000,  damage: 4.7, speed: 100, physicalDef: 0.25, magicDef: 0.10 },   // 3  · Dark Forest   (o rival de quem joga de Demon Hunter, Rowan, Brutos...)
    DEMON_HUNTER:        { hp: 4000,  damage: 4.7, speed: 70,  physicalDef: 0.20, magicDef: 0.15 },   // 3  · quando você joga de Azael, o rival é o Demon Hunter
    RIVER_SPIRIT:        { hp: 10000,  damage: 4, speed: 50,  physicalDef: 0.15, magicDef: 0.15 },   // 6  · River Crossing
    SLIZORK:             { hp: 17000,  damage: 10, speed: 23,  physicalDef: 0.3, magicDef: 0.00},   // 9  · Swamp
    GRAVE_KING:          { hp: 35000, damage: 45, speed: 60,  physicalDef: 0.25, magicDef: 0.10 },   // 12 · Graveyard
    BRUTOS:              { hp: 34000, damage: 53.4, speed: 37,  physicalDef: 0.25, magicDef: 0.00 },   // 15 · Village
    DEMON_LORD:          { hp: 34000, damage: 44.5, speed: 27,  physicalDef: 0.10, magicDef: 0.10 },   // 15 · Village, só para quem joga de Brutos (no lugar dele)
    BLOOD_COUNTESS:      { hp: 45000, damage: 40.3, speed: 75,  physicalDef: 0.2, magicDef: 0.2 },   // 16 · Castle
    LONG_NIGHT:          { hp: 65000, damage: 55.0, speed: 60,  physicalDef: 0.25, magicDef: 0.25 },   // 17 · Castle
    AZAEL_FINAL:         { hp: 80000, damage: 35, speed: 166, physicalDef: 0.25, magicDef: 0.2 },   // 18 · Castle (a revanche do Azael)
    DEMON_HUNTER_FINAL:  { hp: 80000, damage: 35, speed: 120,  physicalDef: 0.20, magicDef: 0.25 }    // 18 · Castle (a revanche, quando você joga de Azael)
};
// Escuridão: por nível acima de 1 (Escuridão 1 = valores de BOSS_STATS). Ex.: hpPerLevel 0.3 = +30% de vida a cada nível (nível 8 = +210%).
export const BOSS_DARKNESS = { hpPerLevel: 0.3, damagePerLevel: 0.12, speedPerLevel: 0.03 };
// Provocação das sombras (Shadow Clone): o chefe só vira para uma sombra quando ela está a menos de cloneProvokeRadius px dele E mais perto que o herói.
// O herói provoca de qualquer distância (os chefes sempre o caçam); a sombra provoca bem menos. 0 desliga (o chefe ignora as sombras como antes).
export const BOSS_TARGETING = { cloneProvokeRadius: 110, cloneDamageRatio: 1 };     // cloneDamageRatio: o dano dos golpes dele nas sombras, em fração do dano no herói
// Botões gerais: 1 = como está
export const BOSS_GLOBAL = { hp: 1, damage: 1, speed: 1 };

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
        portraitImage: 'images/characters/demon-lord-small.webp',      // retrato do diálogo (cópia de monsters/25d/demon_lord/art_reference/images/demon-lord.webp)
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
        renderAs: 'BLOOD_COUNTESS',
        portraitImage: 'images/characters/blood-countess-small.webp',      // retrato do diálogo (cópia de monsters/25d/blood_countess/art_reference/images/blood-countess.webp)
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
    RIVER_SPIRIT: {
        name: 'River Spirit',
        title: 'The Drowned Lady',
        renderAs: 'RIVER_SPIRIT',
        deathType: 'RIVER_SPIRIT',
        deathFx: 'water',            // a morte rebenta o chão molhado (js/systems/enemies.js, riverSpiritBurst)
        portraitImage: 'images/characters/river-spirit-small.webp',      // retrato do diálogo (cópia de monsters/25d/river_spirit/art_reference/images/river-spirit.webp)
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
        patterns: ['blink', 'volley', 'rainfall', 'spiral', 'summon'],
        phases: [
            { at: 1, patterns: ['blink', 'volley', 'rainfall', 'summon'] },
            { at: 0.6, label: 'RISING TIDE', patterns: ['blink', 'spiral', 'volley', 'rainfall', 'summon'] },
            { at: 0.3, label: 'THE RIVER REMEMBERS', patterns: ['spiral', 'blink', 'rainfall', 'volley', 'spiral', 'summon'] }
        ],
        // Chuva: quantas gotas, espalhadas até quantos px do herói, raio de cada uma e tempo de queda (s)
        dropCount: 10, dropSpread: 200, dropRadius: 36, dropFallSeconds: 1.0,
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
        portraitImage: 'images/characters/slizork-small.webp',      // retrato do diálogo (cópia de monsters/25d/slizork/art_reference/images/slizork.webp)
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
        // Cinco golpes: garras (3 riscos vermelhos), bolhas que perseguem e estouram, gosma que prende os pés, a fúria (corre mais depressa por uns segundos)
        // e a invocação: ele chama os Bog Slimes do pântano em volta de si
        patterns: ['claws', 'bubbles', 'summon', 'goo', 'frenzy'],
        phases: [
            { at: 1, patterns: ['claws', 'bubbles', 'summon', 'goo', 'frenzy'] },
            { at: 0.6, label: 'OOZING RAGE', patterns: ['claws', 'bubbles', 'summon', 'goo', 'frenzy', 'claws'] },
            { at: 0.3, label: 'THE BOG RISES', patterns: ['claws', 'summon', 'bubbles', 'frenzy', 'goo', 'summon', 'claws', 'frenzy'] }
        ],
        summonType: 'BOG_SLIME', summonCount: 3,                          // invocação: o que chama e quantos de uma vez
        clawRange: 340, clawGap: 44, clawWidth: 26, clawDelay: 0.85,       // garras: comprimento e distância dos riscos, largura de cada um, aviso (s)
        bubbleCount: 4, bubbleLife: 4.2, bubbleSpeed: 95, bubbleBurstRadius: 64,   // bolhas: quantas, vida (s), velocidade e raio do estouro
        gooRadius: 80, gooDelay: 1, gooRootSeconds: 2.6,                  // gosma: raio da poça, aviso (s) e tempo preso (s)
        frenzySeconds: 3.5, frenzySpeedMultiplier: 2.4,                   // fúria: quanto tempo corre e quantas vezes mais rápido
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
        portraitImage: 'images/characters/grave-king-small.webp',      // retrato do diálogo (cópia de monsters/25d/grave_king/art_reference/images/grave-king.webp)
        hpBase: 3200,
        hpPerTurn: 0,
        speedMin: 34,
        speedMax: 34,
        radius: 26,
        color: '#7f996a',
        damage: 32,
        burstCount: 5,
        burstIntervalSeconds: 0.3,
        initialShootCooldownSeconds: 1.5,
        patternGapSeconds: 2.1,
        // Sem tiros: ele vem andando e CORTA com o espadão quando o herói chega perto (melee); de longe só bate no chão (slam) e chama os mortos (summon)
        patterns: ['dash', 'skulls', 'bonerain', 'summon'],
        phases: [
            { at: 1, patterns: ['dash', 'skulls', 'bonerain', 'summon'] },
            { at: 0.6, label: 'THE DEAD RISE', patterns: ['summon', 'skulls', 'dash', 'bonerain', 'skulls'] },
            { at: 0.3, label: 'ROT AND RUIN', patterns: ['skulls', 'dash', 'bonerain', 'summon', 'dash', 'bonerain'] }
        ],
        // Chuva de ossos: quantos caem, espalhados até quantos px do herói, raio de cada um e tempo de queda (s)
        boneCount: 9, boneSpread: 190, boneRadius: 34, boneFallSeconds: 1.0,
        // Avanço (dash): até quantos px corre, aviso (s), duração da corrida (s), largura da área que acerta e dano de quem for atropelado
        dashLength: 300, lungeWindupSeconds: 0.35, lungeSeconds: 0.22, lungeHitRadius: 40, lungeDamageMultiplier: 0.8,
        // Caveiras que perseguem rindo e explodem: quantas, vida (s), velocidade e raio da explosão
        skullCount: 2, skullLife: 4.5, skullSpeed: 115, skullBurstRadius: 70,
        // Corte de espada de perto: alcance (px além do corpo), duração da animação (s), momento do corte (0 a 1), abertura do leque (rad), dano e intervalo
        melee: { range: 95, seconds: 0.95, strikeAt: 0.5, arc: 2.1, damageMultiplier: 1.25, cooldown: 1.4, firstDelay: 0.6 },
        slamCount: 4,
        slamRadius: 78,
        slamDelaySeconds: 0.95,
        slamDamageMultiplier: 0.9,
        slamTorchDamage: 9,
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
        portraitImage: 'images/characters/the-long-night-small.webp',      // retrato do diálogo (cópia de monsters/25d/demon_lord/art_reference/images/the-long-night.webp)
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
    patterns: ['lunge', 'combo', 'crescent', 'volley', 'blink'],
    phases: [
        { at: 1, patterns: ['lunge', 'combo', 'crescent', 'volley', 'blink'] },
        { at: 0.66, label: 'SHADOW LEGION', patterns: ['lunge', 'combo', 'crescent', 'shadows', 'blink', 'ring'] },
        { at: 0.33, label: 'FULL POWER', patterns: ['combo', 'crescent', 'shadows', 'blink', 'ring', 'crescent', 'combo', 'volley', 'lunge'] }
    ],
    crescentCount: 5,          // a revanche solta mais meias-luas por onda
    scoreReward: 1500, goldBase: 180, xpRewardBase: 500, xpRewardPerTurn: 0
});
rematch('DEMON_HUNTER', {
    hpBase: 6000, patternGapSeconds: 1.6, burstCount: 6, ringCount: 18, slamCount: 5, meleeCooldownSeconds: 0.8,
    patterns: ['volley', 'lunge', 'columns', 'slam'],
    phases: [
        { at: 1, patterns: ['volley', 'lunge', 'columns', 'slam'] },
        { at: 0.66, label: 'HOLY WRATH', patterns: ['volley', 'lunge', 'shackle', 'columns', 'shadows', 'slam', 'ring', 'crescent'] },
        { at: 0.33, label: 'FULL POWER', patterns: ['columns', 'shackle', 'shadows', 'lunge', 'slam', 'ring', 'crescent', 'volley'] }
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

// Os números finais de BOSS_STATS entram nos modelos (a revanche e as sombras já foram montadas acima)
for (const [type, stats] of Object.entries(BOSS_STATS)) Object.assign(BOSS_MODELS[type], stats);

export const BOSS_SPAWNING = {
    // Hora → boss da noite. RIVAL: o rival do herói (RIVAL_OF); RIVAL_FINAL: a revanche dele, que fecha a noite.
    // BRUTOS (hora 6): semi-boss do meio da noite
    // 6 telas x 3 ondas (data_model/campaign.js): o chefe fecha cada tela (ondas 3, 6, 9...). A 1ª tela (Dark Forest) termina com o rival (Azael, ou o Demon Hunter para quem joga de Azael).
    // Dark Forest: Azael (o rival) · River Crossing: River Spirit · Swamp: Slizork · Graveyard: Grave King · Village: Brutos
    // Castle: os TRÊS chefes, um por onda: Blood Countess, The Long Night e a revanche do Azael (o rival). O Demon Lord só vem para quem joga de Brutos, no lugar dele na Village
    schedule: {
        [3 * 1]: 'RIVAL', [3 * 2]: 'RIVER_SPIRIT', [3 * 3]: 'SLIZORK', [3 * 4]: 'GRAVE_KING', [3 * 5]: 'BRUTOS',
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

// Empurrão no chefe (js/systems/damage.js, pushMonster). resist: ele perde essa fração de cada empurrão (um monstro comum leva inteiro; quem tiver
// knockbackResist próprio usa o seu). maxSpeedRatio: o teto da velocidade de empurrão acumulada, em fração da velocidade de andar dele. Sem o teto, tiros
// seguidos somavam empurrões e o chefe andava para trás mais rápido do que avançava (nunca chegava no herói); com 0.5 ele sempre avança pelo menos metade da sua velocidade.
export const BOSS_KNOCKBACK = { resist: 0.85, maxSpeedRatio: 0.5 };

// Cria o chefe com os números de BOSS_STATS, BOSS_GLOBAL e a Escuridão (darkness: o nível escolhido, 1 = normal). Sem curva por onda.
export function createBoss(type, turn, x, y, random = Math.random, darkness = 1) {
    const model = BOSS_MODELS[type];
    if (!model) throw new Error(`Unknown boss type: ${type}`);
    const enemy = createEnemy(model, type, turn, x, y, random);          // posição, relógios e fase da animação
    const level = Math.max(0, darkness - 1);
    const hp = Math.round(model.hp * BOSS_GLOBAL.hp * (1 + BOSS_DARKNESS.hpPerLevel * level));
    return {
        ...enemy,
        hp,
        maxHp: hp,
        damage: model.damage * BOSS_GLOBAL.damage * (1 + BOSS_DARKNESS.damagePerLevel * level),
        speed: model.speed * BOSS_GLOBAL.speed * (1 + BOSS_DARKNESS.speedPerLevel * level),
        physicalDefense: model.physicalDef ?? 0,    // fração do dano físico / mágico que o chefe não leva (BOSS_STATS); js/systems/damage.js aplica
        magicDefense: model.magicDef ?? 0,
        knockbackResist: model.knockbackResist ?? BOSS_KNOCKBACK.resist,
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
    RIVER_SPIRIT: [],
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
