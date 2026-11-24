import { BONE_COLOSSUS_VISUALS } from '../library/monsters/topdown/bone_colossus/bone_colossus_visual.js';
import { getTurnDifficulty } from './difficulty.js';
import { screenOf } from './screens/index.js';
import { CAMPAIGN, CAMPAIGN_RUNTIME, TOTAL_WAVES, waveInScreen } from './campaign.js';
import { effectiveTurn } from './campaign.js';

export const MONSTER_MODELS = {
    SKELETON: {
        spawnWeight: 0.42,
        hpBase: 58,
        hpPerTurn: 11,
        speedMin: 45,
        speedMax: 75,
        radius: 14,
        color: '#d9d2bc',
        damage: 15,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 20,
        goldBase: 5,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
    },
    // Esqueleto Rastejante: o clássico "deitado". Mais lento e bem mais resistente que o Esqueleto, vem desde a primeira hora
    SKELETON_CRAWLER: {
        spawnWeight: 0.2,
        hpBase: 115,
        hpPerTurn: 20,
        speedMin: 24,
        speedMax: 40,
        radius: 15,
        color: '#c9c0a4',
        damage: 18,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 32,
        goldBase: 13,
        goldVariance: 0.5,
        xpRewardBase: 30,
        xpRewardPerTurn: 4,
    },
    BAT: {
        spawnWeight: 0.22,
        hpBase: 24,
        hpPerTurn: 6,
        speedMin: 100,
        speedMax: 130,
        radius: 10,
        color: '#38bdf8',
        damage: 10,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 20,
        goldBase: 5,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
    },
    VAMPIRE: {
        spawnWeight: 0.18,
        hpBase: 88,
        hpPerTurn: 17,
        speedMin: 35,
        speedMax: 35,
        radius: 18,
        color: '#b91c1c',
        damage: 20,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 40,
        goldBase: 13,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
        splitCount: 2
    },
    WITCH: {
        spawnWeight: 0.1,
        hpBase: 65,
        hpPerTurn: 8,
        speedMin: 30,
        speedMax: 30,
        radius: 13,
        color: '#f50bca',
        damage: 12,
        initialShootCooldownSeconds: 4,
        shootCooldownSeconds: 6.5,       // segundos entre um tiro e outro
        shootRange: 390,                 // só atira daqui para perto: não acerta a tocha de muito longe (tem que ser maior que keepDistance)
        projectileSpeed: 160,
        projectileRadius: 5,
        projectileDamageMultiplier: 0.8,
        projectileTorchDamage: 5,
        keepDistance: 215,               // para de andar a esta distância do alvo e atira
        scoreReward: 30,
        goldBase: 10,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3,
    },
    VAMPIRE_BAT: {
        hpBase: 15,
        hpPerTurn: 0,
        speedMin: 95,
        speedMax: 95,
        radius: 8,
        color: '#38bdf8',
        damage: 8,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 10,
        goldBase: 2,
        goldVariance: 0.5,
        xpRewardBase: 8,
        xpRewardPerTurn: 1,
        splitVelocity: 100,
        parentSplitOffset: 20
    },
    // Mariposa de cinzas: ignora o herói e voa direto para a chama. A adaga é a resposta.
    MOTH: {
        spawnWeight: 0.1,
        hpBase: 16,
        hpPerTurn: 4,
        speedMin: 88,
        speedMax: 112,
        radius: 10,
        color: '#d6b98a',
        damage: 8,
        torchDamage: 9,
        ignoresPlayer: true,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 25,
        goldBase: 5,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3
    },
    // Inchado: lento e cheio de gás. Explode ao morrer, ferindo herói e monstros em volta.
    BLOATER: {
        spawnWeight: 0.1,
        hpBase: 100,
        hpPerTurn: 16,
        speedMin: 20,
        speedMax: 25,
        radius: 19,
        color: '#a3e635',
        damage: 14,
        torchDamage: 20,
        explosion: { radius: 86, damage: 26, monsterDamageRatio: 0.9 },
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 50,
        goldBase: 20,
        goldVariance: 0.5,
        xpRewardBase: 24,
        xpRewardPerTurn: 3
    },
    // Espectro: mira e dispara em linha reta. O dash é a resposta.
    WRAITH: {
        spawnWeight: 0.18,
        hpBase: 60,
        hpPerTurn: 12,
        speedMin: 50,
        speedMax: 60,
        radius: 12,
        color: '#a5f3fc',
        damage: 22,
        lunge: { cooldownSeconds: 2.6, aimSeconds: 0.3, seconds: 0.5, speed: 640, triggerDistance: 360 },
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 35,
        goldBase: 12,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3
    },
    // Lobo Sombriço (o mesmo do Yara RPG): rápido e fraco, só corre atrás. Aparece desde a hora 1.
    SHADOW_WOLF: {
        spawnWeight: 0.16,
        hpBase: 30,
        hpPerTurn: 7,
        speedMin: 92,
        speedMax: 112,
        radius: 12,
        color: '#8ea3bf',
        damage: 12,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 20,
        goldBase: 10,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3
    },
    // Lobo Zumbi: caça em matilha. Circula, mira (aviso curto no chão) e se lança em linha reta.
    ZOMBIE_WOLF: {
        spawnWeight: 0.16,
        hpBase: 48,
        hpPerTurn: 10,
        speedMin: 78,
        speedMax: 96,
        radius: 13,
        color: '#a78bfa',
        damage: 20,
        lunge: { cooldownSeconds: 2.8, aimSeconds: 0.25, seconds: 0.42, speed: 600, triggerDistance: 340 },
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 28,
        goldBase: 13,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3
    },
    // Cavaleiro Sem Cabeça: tanque lento que marcha para a tocha. A cabeça flutua de lado e atira.
    HEADLESS_KNIGHT: {
        spawnWeight: 0.05,
        maxAlive: 1,                     // no máximo um em campo
        hpBase: 190,
        hpPerTurn: 26,
        speedMin: 24,
        speedMax: 28,
        radius: 20,
        color: '#7c8aa5',
        damage: 24,
        knockbackResist: 0.85,
        initialShootCooldownSeconds: 2.5,
        shootCooldownSeconds: 3.5,
        shootRange: 320,                 // só atira com o alvo a esta distância ou menos
        projectileSpeed: 170,
        projectileRadius: 6,
        projectileDamageMultiplier: 0.45,
        projectileTorchDamage: 6,
        projectileColor: '#7dd3fc',
        scoreReward: 60,
        goldBase: 20,
        goldVariance: 0.5,
        xpRewardBase: 26,
        xpRewardPerTurn: 3
    },
    // Colosso de Ossos: esqueleto gigante com um montante pesado. Não liga para o herói (não dá para provocar),
    // marcha reto para a tocha e a golpeia com a espada: metade da vida máxima dela no primeiro golpe. Lento, enorme e muito resistente.
    BONE_COLOSSUS: {
        spawnWeight: 0.03,
        maxAlive: 1,                     // no máximo um em campo
        hpBase: 650,
        hpPerTurn: 180,
        speedMin: 14,
        speedMax: 14,
        radius: 54,
        color: '#c9bfa3',
        damage: 40,
        knockbackResist: 0.95,
        immovable: true,                 // os outros monstros não o empurram
        ignoresPlayer: true,
        // Para perto da tocha, levanta a espada (aviso) e desce: o 1º golpe arranca metade da vida máxima dela,
        // os seguintes uma fração menor. Segue em campo até morrer: dá tempo de matá-lo.
        // A espada vem da direita para a frente: quem estiver nesse leque (sweep) leva o dano de contato dele.
        // Ângulos em radianos a partir da direção da tocha; positivo é a direita dele.
        // A duração de cada fase (windupSeconds, strikeSeconds, recoverSeconds) é a da animação, na biblioteca
        // (library/monsters/topdown/bone_colossus/bone_colossus_visual.js, `slam`): assim o dano cai quando a espada encosta.
        torchSlam: { range: 125, ...BONE_COLOSSUS_VISUALS.slam, cooldownSeconds: 3.5, firstRatio: 0.5, repeatRatio: 0.2, sweep: { radius: 200, fromAngle: -0.4, toAngle: 1.35 } },
        stepShake: { intensity: 5, intervalSeconds: 0.9 },   // um tremor por passo (2 passos por ciclo da animação)
        arrival: { title: 'THE BONE COLOSSUS', sub: 'It marches for the torch' },
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 150,
        goldBase: 75,
        goldVariance: 0.5,
        xpRewardBase: 60,
        xpRewardPerTurn: 5
    },
    // Treant: criatura enorme, lenta e resistente; só aparece a partir da wave 3.
    TREANT: {
        spawnWeight: 0.04,
        maxAlive: 2,
        hpBase: 450,
        hpPerTurn: 90,
        speedMin: 12,
        speedMax: 20,
        radius: 27,
        color: '#5b3b22',
        damage: 24,
        knockbackResist: 1,
        immovable: true,                 // massa da criatura: não é empurrada por golpes nem pela separação da horda
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 65,
        goldBase: 50,
        goldVariance: 0.35,
        xpRewardBase: 32,
        xpRewardPerTurn: 5,
        // Raízes que prendem o herói (o mesmo efeito do Grasping Roots, do ramo Natureza): o Treant ergue os braços, raízes começam a brotar no ponto
        // onde o herói está (aviso no chão) e, se ele ainda estiver ali quando estouram, ficam `seconds` presas nele (não anda nem dá dash; ainda ataca).
        // Sem dano direto: o perigo é ficar parado enquanto a horda chega. A área é grande (raio 125): para escapar é preciso correr para fora dela durante a preparação, sem dar tempo de ficar só desviando.
        punch: { root: { seconds: 2.2, radius: 125 }, cooldownSeconds: 7, windupSeconds: 1.1, strikeSeconds: 0.25, recoverySeconds: 0.6, range: 320, halfAngle: 0.52, damageMultiplier: 0 }
    },
    // Golem de Brasa e Musgo: gigante de pedra, lento e muito resistente; o mesmo soco do Treant. Só a partir da wave 4.
    GOLEM: {
        spawnWeight: 0.04,
        maxAlive: 2,
        hpBase: 350,
        hpPerTurn: 110,
        speedMin: 10,
        speedMax: 15,
        radius: 28,
        color: '#6b625a',
        damage: 26,
        knockbackResist: 1,
        immovable: true,
        // Joga uma pedra (pequena) a meia distância: nem colado nele (aí ele soca) nem longe demais
        projectileSpeed: 130,
        projectileRadius: 10,
        projectileDamageMultiplier: 0.6,
        projectileColor: '#8a7f72',
        projectileTorchDamage: 3,
        shootMinRange: 160,
        shootRange: 400,
        throwWindup: 0.5,                // ergue os braços nesse tempo antes de jogar
        initialShootCooldownSeconds: 3,
        shootCooldownSeconds: 4.5,
        scoreReward: 80,
        goldBase: 60,
        goldVariance: 0.35,
        xpRewardBase: 40,
        xpRewardPerTurn: 6,
        // Golpe em área: bate as duas mãos no chão. Perto dele (range) ele ergue os braços (windupSeconds) enquanto um círculo no chão (areaRadius)
        // mostra onde vai pegar; as mãos batem quando o círculo estoura. Quem sair do círculo antes (dash) não leva dano.
        punch: { area: true, areaRadius: 125, torchDamage: 8, cooldownSeconds: 5, windupSeconds: 1.4, strikeSeconds: 0.25, recoverySeconds: 0.7, range: 115, damageMultiplier: 2.4 }
    },
    // Necromante: fica longe e levanta esqueletos até alguém ir buscá-lo.
    NECROMANCER: {
        spawnWeight: 0.06,
        hpBase: 80,
        hpPerTurn: 12,
        speedMin: 34,
        speedMax: 34,
        radius: 13,
        color: '#86efac',
        damage: 12,
        keepDistance: 335,
        shootRange: 430,                 // só levanta esqueletos daqui para perto (maior que keepDistance, senão ele para fora do alcance)
        summon: { type: 'SKELETON', count: 2, spread: 46 },
        projectileSpeed: 150,            // além de levantar mortos, atira uma alma
        projectileRadius: 5,
        projectileDamageMultiplier: 0.7,
        projectileTorchDamage: 4,
        initialShootCooldownSeconds: 3,
        shootCooldownSeconds: 6.5,
        scoreReward: 60,
        goldBase: 20,
        goldVariance: 0.5,
        xpRewardBase: 26,
        xpRewardPerTurn: 3
    }
};

// --- MONSTROS DAS TELAS NOVAS (22/11/2026): 2 por tela do mapa. `scenery` diz em que tela nascem (ver chooseMonsterType) ---
Object.assign(MONSTER_MODELS, {
    // Enguia do Rio (tela do rio): rápida, se lança em linha reta contra o herói. O dash é a resposta.
    RIVER_EEL: {
        spawnWeight: 0.4,
        hpBase: 48,
        hpPerTurn: 9,
        speedMin: 70,
        speedMax: 92,
        radius: 11,
        color: '#38bdf8',
        damage: 14,
        lunge: { cooldownSeconds: 3, aimSeconds: 0.3, seconds: 0.45, speed: 520, triggerDistance: 280 },
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 26,
        goldBase: 11,
        goldVariance: 0.5,
        xpRewardBase: 20,
        xpRewardPerTurn: 3
    },
    // Afogado (tela do rio): arrasta-se devagar e aguenta bastante.
    DROWNED: {
        spawnWeight: 0.4,
        hpBase: 95,
        hpPerTurn: 16,
        speedMin: 30,
        speedMax: 42,
        radius: 14,
        color: '#8fb4c4',
        damage: 17,
        knockbackResist: 0.25,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 34,
        goldBase: 13,
        goldVariance: 0.5,
        xpRewardBase: 22,
        xpRewardPerTurn: 3
    },
    // Sapo do Pântano (tela do pântano): salta de surpresa em cima do herói.
    BOG_TOAD: {
        spawnWeight: 0.25,
        hpBase: 85,
        hpPerTurn: 14,
        speedMin: 40,
        speedMax: 55,
        radius: 15,
        color: '#5d9438',
        damage: 16,
        // Língua: o sapo para, mira e solta a língua comprida (aviso no chão), que acerta quem estiver na linha
        tongue: { range: 150, windupSeconds: 0.5, strikeSeconds: 0.22, recoverySeconds: 0.5, cooldownSeconds: 3.4, width: 11, damageMultiplier: 1.1 },
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 30,
        goldBase: 12,
        goldVariance: 0.5,
        xpRewardBase: 22,
        xpRewardPerTurn: 3
    },
    // Lodo Vivo (tela do pântano): lento e mole, aguenta pancada.
    BOG_SLIME: {
        spawnWeight: 0.4,
        hpBase: 120,
        hpPerTurn: 18,
        speedMin: 22,
        speedMax: 30,
        radius: 13,
        color: '#3f7a2c',
        damage: 12,
        knockbackResist: 0.3,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 32,
        goldBase: 13,
        goldVariance: 0.5,
        xpRewardBase: 22,
        xpRewardPerTurn: 3
    },
    // Zumbi de Armadura (cemitério): soldado morto-vivo; maior, bem mais forte e duro que o zumbi comum, e lento.
    ARMORED_ZOMBIE: {
        spawnWeight: 0.25,
        hpBase: 270,
        hpPerTurn: 36,
        speedMin: 18,
        speedMax: 26,
        radius: 18,
        color: '#7c7468',
        damage: 28,
        knockbackResist: 0.6,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 55,
        goldBase: 20,
        goldVariance: 0.5,
        xpRewardBase: 30,
        xpRewardPerTurn: 4
    },
    // Zumbi (cemitério): lento, aguenta bastante e vem saindo da terra.
    // Zumbi Rastejante (cemitério): só a metade de cima, se arrasta devagar com a coluna solta no chão. Baixo, frágil e teimoso.
    ZOMBIE_CRAWLER: {
        spawnWeight: 0.35,
        hpBase: 80,
        hpPerTurn: 14,
        speedMin: 16,
        speedMax: 24,
        radius: 12,
        color: '#86a070',
        damage: 14,
        knockbackResist: 0.1,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 22,
        goldBase: 9,
        goldVariance: 0.5,
        xpRewardBase: 16,
        xpRewardPerTurn: 2
    },
    ZOMBIE: {
        spawnWeight: 0.4,
        hpBase: 130,
        hpPerTurn: 20,
        speedMin: 20,
        speedMax: 30,
        radius: 14,
        color: '#86a070',
        damage: 16,
        knockbackResist: 0.2,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 30,
        goldBase: 12,
        goldVariance: 0.5,
        xpRewardBase: 22,
        xpRewardPerTurn: 3
    },
    // Esqueleto Guerreiro (cemitério): com escudo e espada, mais duro que o esqueleto comum.
    SKELETON_WARRIOR: {
        melee: { kind: 'sword', range: 50, reach: 62, halfAngle: 0.8, windupSeconds: 0.42, strikeSeconds: 0.16, recoverySeconds: 0.4, cooldownSeconds: 1.5, damageMultiplier: 1.0 },
        spawnWeight: 0.4,
        hpBase: 115,
        hpPerTurn: 18,
        speedMin: 40,
        speedMax: 58,
        radius: 15,
        color: '#cfc7ae',
        damage: 19,
        knockbackResist: 0.3,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 34,
        goldBase: 14,
        goldVariance: 0.5,
        xpRewardBase: 24,
        xpRewardPerTurn: 3
    },
    // Esqueleto Arqueiro (cemitério): para a distância e atira flechas.
    SKELETON_ARCHER: {
        spawnWeight: 0.4,
        hpBase: 48,
        hpPerTurn: 8,
        speedMin: 32,
        speedMax: 32,
        radius: 13,
        color: '#d6cfba',
        damage: 12,
        shootRange: 330,                 // só atira daqui para perto
        keepDistance: 190,               // para de andar a esta distância do alvo e atira
        projectileSpeed: 380,            // a flecha sai rápido
        projectileRadius: 5,
        projectileDamageMultiplier: 0.7,
        projectileTorchDamage: 4,
        projectileColor: '#c9b27a',
        aimSeconds: 0.45,                 // para e puxa a corda por este tempo antes de soltar a flecha
        releaseSeconds: 0.22,            // a corda vibra um instante depois do tiro
        initialShootCooldownSeconds: 3,
        shootCooldownSeconds: 3.2,
        scoreReward: 30,
        goldBase: 12,
        goldVariance: 0.5,
        xpRewardBase: 22,
        xpRewardPerTurn: 3
    },
    // Miliciano da Vila (tela da vila): camponês armado, firme e curto de alcance.
    MILITIA: {
        melee: { kind: 'axe', range: 48, reach: 58, halfAngle: 0.8, windupSeconds: 0.45, strikeSeconds: 0.16, recoverySeconds: 0.45, cooldownSeconds: 1.6, damageMultiplier: 1.0 },
        spawnWeight: 0.4,
        hpBase: 80,
        hpPerTurn: 13,
        speedMin: 42,
        speedMax: 60,
        radius: 14,
        color: '#b8a06c',
        damage: 16,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 28,
        goldBase: 12,
        goldVariance: 0.5,
        xpRewardBase: 22,
        xpRewardPerTurn: 3
    },
    // Cavaleiro de Placas (tela da vila): lento, blindado e resistente a empurrão.
    PLATE_KNIGHT: {
        melee: { kind: 'sword', range: 56, reach: 68, halfAngle: 0.85, windupSeconds: 0.55, strikeSeconds: 0.18, recoverySeconds: 0.5, cooldownSeconds: 1.9, damageMultiplier: 1.3 },
        spawnWeight: 0.3,
        hpBase: 190,
        hpPerTurn: 28,
        speedMin: 24,
        speedMax: 30,
        radius: 17,
        color: '#a9b2c0',
        damage: 24,
        knockbackResist: 0.7,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 48,
        goldBase: 18,
        goldVariance: 0.5,
        xpRewardBase: 28,
        xpRewardPerTurn: 3
    },
    // Lanceiro do Castelo (tela do castelo): estoca com a lança num avanço em linha reta.
    LANCER: {
        melee: { kind: 'spear', range: 78, reach: 96, halfAngle: 0.3, windupSeconds: 0.45, strikeSeconds: 0.16, recoverySeconds: 0.45, cooldownSeconds: 1.8, damageMultiplier: 1.2 },
        spawnWeight: 0.4,
        hpBase: 105,
        hpPerTurn: 17,
        speedMin: 44,
        speedMax: 60,
        radius: 15,
        color: '#6d28d9',
        damage: 20,
        initialShootCooldownSeconds: 2,
        shootCooldownSeconds: 2,
        scoreReward: 38,
        goldBase: 15,
        goldVariance: 0.5,
        xpRewardBase: 26,
        xpRewardPerTurn: 3
    },
    // Demônio Soldado (tela do castelo): mantém distância e lança bolas de fogo.
    DEMON: {
        spawnWeight: 0.4,
        hpBase: 95,
        hpPerTurn: 15,
        speedMin: 55,
        speedMax: 70,
        radius: 14,
        color: '#b4332a',
        damage: 18,
        shootRange: 300,                 // só atira daqui para perto
        keepDistance: 150,
        projectileSpeed: 190,
        projectileRadius: 6,
        projectileDamageMultiplier: 0.6,
        projectileTorchDamage: 5,
        projectileColor: '#fb923c',
        initialShootCooldownSeconds: 3,
        shootCooldownSeconds: 4.5,
        scoreReward: 42,
        goldBase: 16,
        goldVariance: 0.5,
        xpRewardBase: 26,
        xpRewardPerTurn: 3
    },
});

// Os bosses ficam em ./bosses.js (BOSS_MODELS / BOSS_SPAWNING)
export const MONSTER_SPAWNING = {
    edgeMargin: 34,                  // nascem logo fora da tela (unidades do mundo)
    targetPlayerDistance: 240,
    movementDamping: 0.88,
    contactKnockback: 220,
    // Monstros se empurram de leve: uma horda ocupa espaço em vez de virar um ponto só
    separationStrength: 60
};

// Buddies que usam o sistema de sprites dos monstros (os lobos do Rowan; a arte mora em library/buddies). NÃO são monstros: não
// nascem, não entram no bestiário nem em MONSTER_MODELS. js/render/monster_sprites.js monta o sprite deles sob demanda.
//   BUDDY_SHADOW_WOLF: o Shadow Wolf (poder do Nature)   BUDDY_WHITE_WOLF: The White Wolf (a evolução dele)
export const BUDDY_MODELS = {
    BUDDY_SHADOW_WOLF: { radius: 12, color: '#3d3a55' },
    BUDDY_WHITE_WOLF: { radius: 12, color: '#e2e8f0' },
    BUDDY_TREANT: { radius: 18, color: '#5b3b22' }
};


export function createMonster(type, turn, x, y, random = Math.random) {
    const model = MONSTER_MODELS[type];
    if (!model) throw new Error(`Unknown monster type: ${type}`);
    return createEnemy(model, type, turn, x, y, random);
}

// Monta o inimigo a partir de um modelo (usado também pelos bosses)
export function createEnemy(model, type, turn, x, y, random = Math.random) {
    // Vida, velocidade e dano crescem com o turno (data_model/difficulty.js)
    const difficulty = getTurnDifficulty(turn);
    const baseSpeed = model.speedMin === model.speedMax
        ? model.speedMin
        : model.speedMin + random() * (model.speedMax - model.speedMin);
    const speed = baseSpeed * difficulty.speedMultiplier;
    const hp = Math.round((model.hpBase + effectiveTurn(turn) * model.hpPerTurn) * difficulty.hpMultiplier);       // a curva foi feita para 12 ondas (campaign.js)

    return {
        x, y, vx: 0, vy: 0,
        hp, maxHp: hp,
        speed, radius: model.radius, color: model.color, type, damage: model.damage * difficulty.damageMultiplier,
        knockbackResist: model.knockbackResist,
        immovable: model.immovable,
        shootTimer: model.initialShootCooldownSeconds,
        angle: 0,                        // direção do movimento (usada só no desenho)
        phase: random() * Math.PI * 2    // defasagem das animações (cada monstro bate asa/pulsa diferente)
    };
}

export function createVampireBat(x, y, turn = 1, random = Math.random) {
    const model = MONSTER_MODELS.VAMPIRE_BAT;
    const spread = model.parentSplitOffset;
    const velocity = model.splitVelocity;

    return {
        ...createMonster('VAMPIRE_BAT', turn, x + (random() - 0.5) * spread, y + (random() - 0.5) * spread, random),
        type: 'BAT',
        vx: (random() - 0.5) * velocity,
        vy: (random() - 0.5) * velocity
    };
}

// Sorteia entre os monstros já liberados no turno (os pesos são reescalados entre eles)
// sceneryId: a tela de agora. Monstros com `scenery` só nascem nas telas listadas; os sem `scenery` nascem em qualquer uma.
// Quem nasce na tela: os tipos listados nas zonas verdes do Ateliê (zoneTypes). data_model/screens/<tela>.js só ajusta `from` (onda da tela em que
// o monstro entra) e `weight`; tipo não listado lá entra na onda 1 (os pesados, na 3). Sem zonas com tipos, vale a lista do arquivo da tela.
// No sandbox (campanha desligada) entram todos desde o início.
const HEAVY_FROM = { TREANT: 3, GOLEM: 3, BONE_COLOSSUS: 3 };
export function screenRoster(turn, sceneryId, zoneTypes = []) {
    const screen = screenOf(sceneryId);
    const wave = !CAMPAIGN_RUNTIME.enabled ? Infinity : turn > TOTAL_WAVES ? CAMPAIGN.wavesPerScreen : waveInScreen(turn);
    const list = zoneTypes.length
        ? zoneTypes.filter(type => MONSTER_MODELS[type]).map(type => ({ from: HEAVY_FROM[type] ?? 1, ...screen.monsters.find(m => m.type === type), type }))
        : screen.monsters;
    return list.filter(m => (m.from ?? 1) <= wave);
}

export function chooseMonsterType(turn, random = Math.random, sceneryId = null, zoneTypes = []) {
    const roster = screenRoster(turn, sceneryId, zoneTypes);
    const w = m => m.weight ?? MONSTER_MODELS[m.type].spawnWeight;
    let roll = random() * roster.reduce((sum, m) => sum + w(m), 0);
    for (const m of roster) {
        if (roll < w(m)) return m.type;
        roll -= w(m);
    }
    return roster[0]?.type ?? 'SKELETON';
}

// Ouro de um monstro: o valor base sobe ou desce até goldVariance (0.5 = de metade ao dobro).
// Arredonda e nunca dá menos que 1 moeda.
export function rollMonsterGold(model, random = Math.random) {
    const { goldBase, goldVariance } = model;
    const factor = 1 + (random() * 2 - 1) * goldVariance;
    return Math.max(1, Math.round(goldBase * factor));
}
