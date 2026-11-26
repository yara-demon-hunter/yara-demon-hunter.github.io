// --- STATS DO HERÓI ---
// Melhorados na árvore de skills (data_model/skill_tree): cada ponto gasto sobe um nível.
const SLASH_ARC_MAX_LEVEL = 6;

export const UPGRADE_MODELS = {
    damage: { name: 'Blade Damage', icon: '⚔️', lvl: 1, maxLvl: 99, desc: 'Increases the base damage of each hit.' },
    // Heavy Reach: cada ponto sobe o alcance E o empurrão (o nó da árvore tem `also: ['knockback']`; o atributo knockback segue existindo para as contas e a ficha de status)
    radius: { name: 'Heavy Reach', icon: '🎯', lvl: 1, maxLvl: 99, desc: 'Increases the attack range and the push when hitting targets.' },
    slashArc: {
        name: 'Slash Width', icon: '🌙', lvl: 1, maxLvl: SLASH_ARC_MAX_LEVEL,
        get desc() {
            return `Widens the slash (${BLADE_SKILL.minimumSlashArcDegrees}° at level 1 up to ${BLADE_SKILL.maximumSlashArcDegrees}° at max level).`;
        }
    },
    // Blade Rhythm: cada ponto encurta o tempo entre golpes E alarga o golpe (o nó da árvore tem `also: ['slashArc']`; a largura para nos 6 níveis)
    atkSpeed: { name: 'Blade Rhythm', icon: '⏱️', lvl: 1, maxLvl: 99, desc: 'Shortens the time between hits and widens the slash.' },
    moveSpeed: { name: 'Move Speed', icon: '🥾', lvl: 1, maxLvl: 99, desc: 'Makes the character move faster.' },
    furySkill: { name: 'Fury (Skill)', icon: '😡', lvl: 1, maxLvl: 99, desc: 'Improves Fury duration and damage, and increases Fury charge.' },
    playerHp: { name: 'Hero Health', icon: '❤️', lvl: 1, maxLvl: 99, desc: 'Increases max health and heals the character. Blows land softer, and monsters leave the torch to come for you from farther away.' },
    knockback: { name: 'Knockback', icon: '👊', lvl: 1, maxLvl: 99, desc: 'Increases the push when hitting targets.' }
};

// Dano de cada golpe, tempo entre golpes e alcance da lâmina e da adaga NÃO ficam aqui: são de cada personagem
// (data_model/characters/). Aqui só o que sobe por nível de skill e as regras gerais.
// Slash Width, do nível 2 em diante: cada golpe também solta uma ONDA DE AR curta à frente, que atravessa os inimigos (dano = dano da lâmina x damagePerLevel x níveis acima do 1)

export const BLADE_SKILL = {
    damagePerUpgrade: 10,           // 2026-11-26: era 5 (cada ponto em Blade Damage soma 10 ao dano de cada golpe)
    radiusPerUpgrade: 7,
    maxRadiusScreenRatio: 0.38,
    minimumSlashArcDegrees: 40,
    maximumSlashArcDegrees: 180,
    cooldownReductionPerUpgrade: 0.03,
    // A Fúria não acelera mais o golpe (antes 0.25 = 4x mais rápido): com Bloodlust e Knockback ela virava uma
    // metralhadora de empurrões que jogava até boss para longe. Agora ela dá dano (fury.damageBonusPerLevel)
    frenzyCooldownMultiplier: 1,
    minimumCooldownSeconds: 0.2,    // teto de 5 golpes por segundo, somando tudo (antes 0.15 = ~6,7; antes ainda 0.07 = ~14)
    knockbackPerUpgrade: 45,        // por nível de Knockback: nível 5 = 230 (antes 70 = 360)
    comboDashDistance: 35
};

// A barra de Fúria é igual para todos (100). Carga, duração e bônus de cada personagem estão no `fury` dele (data_model/characters/).
export const FURY_BAR = {
    maximumEnergy: 100
};

// Feitiços (Flame e Curse): o dano base é o `magicDamage` de cada personagem (data_model/characters/); quem tem 0 não usa magia.

// Faca de arremesso: golpe separado da lâmina, com recarga própria. Anda enquanto arremessa.
// A rosa do druida (Rowan) deixa o monstro atingido mais lento (as outras armas de arremesso não)
export const ROSE_SKILL = {
    slowSeconds: 4,
    slow: 0.35              // 35% mais lento
};

// Adaga: velocidade, recarga, dano e empurrão são de cada personagem (`stats` em data_model/characters/). Só o tamanho é geral.
export const KNIFE_SKILL = {
    radius: 7
};

// Dash: esquiva rápida com invulnerabilidade. Espaço, Shift ou botão direito; botão próprio no celular.
// Dash: cargas, recarga e invulnerabilidade são de cada personagem. Só o rastro é geral.
export const DASH_SKILL = {
    ghosts: 6                   // imagens deixadas pelo caminho
};

export function createAttributes() {
    return Object.fromEntries(
        Object.entries(UPGRADE_MODELS).map(([key, attribute]) => [key, { ...attribute }])
    );
}
