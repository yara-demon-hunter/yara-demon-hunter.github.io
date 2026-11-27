// --- DADOS VISUAIS: Sensação de impacto. ---
// Tudo que responde a um golpe: clarão no monstro, números de dano, pedaços, manchas no chão, ondas
// de choque. Lidos por js/systems/effects.js e js/render/effects.js. Só afeta o desenho.
import { DEATH_PHYSICS, MONSTER_DEATH } from '../../../library/monsters/25d/death.js';

// Tipo de monstro do jogo → pasta da biblioteca (library/monsters/25d/<id>). O Necromante tem cores próprias (abaixo).
const DEATH_OF_TYPE = {
    SKELETON: 'skeleton', SKELETON_CRAWLER: 'skeleton_crawler', BAT: 'bat', VAMPIRE: 'vampire', WITCH: 'witch', MOTH: 'moth',
    BLOATER: 'bloater', WRAITH: 'wraith', SHADOW_WOLF: 'shadow_wolf', ZOMBIE_WOLF: 'zombie_wolf', HEADLESS_KNIGHT: 'headless_knight',
    BONE_COLOSSUS: 'bone_colossus', TREANT: 'treant', GOLEM: 'golem',
    // Telas novas
    SLIZORK: 'slizork', RIVER_SPIRIT: 'river_spirit', RIVER_SPIRIT_SPLASH: 'river_spirit_splash', ZOMBIE: 'zombie', ZOMBIE_CRAWLER: 'zombie_crawler', ARMORED_ZOMBIE: 'armored_zombie', RIVER_EEL: 'river_eel', DROWNED: 'drowned', BOG_TOAD: 'bog_toad', BOG_SLIME: 'bog_slime',
    SKELETON_WARRIOR: 'skeleton_warrior', SKELETON_ARCHER: 'skeleton_archer', CHEST_GOBLIN: 'chest_goblin', MILITIA: 'militia', PLATE_KNIGHT: 'plate_knight', LANCER: 'lancer', DEMON: 'demon'
};
const MONSTER_DEATH_BY_TYPE = Object.fromEntries(Object.entries(DEATH_OF_TYPE).map(([type, id]) => [type, MONSTER_DEATH[id]]));

export const JUICE_VISUALS = {
    hitFlashSeconds: 0.09,
    hitRecoil: 3,               // quanto o monstro treme ao ser atingido
    hitStopCooldownSeconds: 0.22,

    // Números de dano
    number: {
        seconds: 0.62,
        rise: 34,
        outline: '#0b0f19',
        outlineWidth: 3,
        popSeconds: 0.09,
        popScale: 1.6,
        maxActive: [22, 14, 8]      // por nível de detalhe
    },

    // Estilos dos números (cada um vira um atlas em js/render/fx/numbers.js)
    numberStyles: {
        normal: { font: '800 15px Inter, sans-serif', size: 15, color: '#f1f5f9' },
        crit: { font: '900 22px Cinzel, serif', size: 22, color: '#fde047' },
        // Uma cor por tipo de dano: branco = lâmina e adaga, azul = tudo o que usa o dano mágico (Curse, fênix, Vigil),
        // amarelo = o que a tocha dispara, roxo = sombras. O crítico ganha a cor dourada de crit, qualquer que seja o tipo
        spell: { font: '800 15px Inter, sans-serif', size: 15, color: '#60a5fa' },
        shadow: { font: '800 15px Inter, sans-serif', size: 15, color: '#c4b5fd' },
        hurt: { font: '800 14px Inter, sans-serif', size: 14, color: '#fb7185' },
        heal: { font: '800 14px Inter, sans-serif', size: 14, color: '#86efac' },
        torch: { font: '800 14px Inter, sans-serif', size: 14, color: '#facc15' }
    },

    // Textos que sobem (ouro, cura, avisos)
    floater: { seconds: 1, rise: 40, font: "800 14px Inter, sans-serif", outline: '#0b0f19', outlineWidth: 3 },

    // Pedaços que voam ao morrer
    gibs: {
        maxActive: [64, 40, 14],    // por nível de detalhe (pedaços são retângulos simples; o Treant sozinho solta ~40)
        ...DEATH_PHYSICS            // gravidade, quique e velocidades: library/monsters/25d/death.js
    },
    // Quantidade e cores dos pedaços por monstro
    deathBits: {
        ...MONSTER_DEATH_BY_TYPE,      // os monstros: library/monsters/25d/death.js (inclui a queda do Treant)
        NECROMANCER: { count: 6, colors: ['#86efac', '#14532d', '#e7e0cf'], shape: 'bone', stain: 'rgba(6, 30, 16, 0.55)' },
        ROCK: { count: 9, colors: ['#78716c', '#57534e', '#a8a29e'], shape: 'shard', stain: 'rgba(12, 10, 8, 0.4)' },
        HERO: { count: 20, colors: ['#07222d', '#0b2f3c', '#38bdf8', '#e8eef2'], shape: 'shard', stain: 'rgba(4, 14, 20, 0.6)' },
        BOSS: { count: 28, colors: ['#fde047', '#f97316', '#dc2626', '#f1f5f9'], shape: 'shard', stain: 'rgba(44, 6, 8, 0.7)' }
    },

    // Manchas no chão, para o campo de batalha contar o que aconteceu
    stains: { maxActive: 18, lifeSeconds: 12, fadeSeconds: 3, splatters: 3 },

    // Soco de zoom e clarão
    zoomPunchDecay: 7,
    flashDecay: 4.5,

    // Avisos no chão
    telegraph: {
        color: 'rgba(248, 113, 113, 0.95)',
        fill: 'rgba(220, 38, 38, 0.26)',
        lineCore: 'rgba(165, 243, 252, 0.95)',
        lineGlow: 'rgba(34, 211, 238, 0.25)'
    },

    // Fim de hora: onda de fogo saindo da tocha
    clearWave: { width: 46, color: '253, 186, 116', coreColor: '255, 247, 237' },

    // Amanhecer
    dawn: {
        sunX: 0.86,
        sunY: -0.08,
        sunColor: '255, 196, 120',
        skyColor: '255, 138, 92',
        horizonColor: '190, 110, 150',
        rays: [
            { angle: 1.75, width: 0.07, alpha: 0.3 },
            { angle: 2.05, width: 0.05, alpha: 0.24 },
            { angle: 2.32, width: 0.09, alpha: 0.28 },
            { angle: 2.62, width: 0.05, alpha: 0.22 },
            { angle: 2.9, width: 0.06, alpha: 0.2 }
        ]
    },

    // Tocha pedindo socorro e calor em volta dela
    torchAlarm: { color: 'rgba(248, 113, 113, 0.75)', pulseHz: 1.6 },
    // Área de calor da tocha (onde ela cura o herói): o círculo tracejado fica sempre visível (js/render/effects.js)
    // ringColor: o círculo laranja (calor que só queima, sem cura: Juramento); healRing: o círculo verde do calor que CURA, igual ao anel de cura do carvalho (js/render/nature.js: mesma cor, espessura e traço; parado, sem girar)
    warmth: { color: 'rgba(251, 146, 60, 0.12)', ringColor: 'rgba(253, 186, 116, 0.28)', healRing: { color: '#4ade80', alpha: 0.8, width: 1.8, dash: 5.7 } }
};
