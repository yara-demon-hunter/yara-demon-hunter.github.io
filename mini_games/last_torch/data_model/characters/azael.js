// --- AZAEL ---
// Tudo do personagem num lugar só (ver data_model/characters/index.js). Cores e medidas do desenho:
// data_model/visuals/characters/azael_visual.js; o boneco: js/render/azael25d.js.
import { AZAEL_VISUALS } from '../visuals/characters/azael_visual.js';

export const AZAEL = {
    id: 'azael',
    model: 'azael',                 // boneco 2.5D (js/render/bodies.js)
    order: 3,                       // posição na tela de escolha

    // --- QUEM É ---
    name: 'Azael',
    tagline: 'Aggressive. A demon who hunts his own kind, up close.',
    trait: '+25% damage and heals 5% of the damage he deals, but -25% health and -35% dagger range.',
    perk: { name: 'BLOOD DRINKER', text: 'Heals a part of the damage he deals. Hits hard, but breaks easily.' },
    colors: AZAEL_VISUALS.colors,
    portrait: '',
    portraitImage: 'images/characters/azael-small.webp',
    // Liberado pela conquista Dawn (vencer a noite; data_model/sanctuary.js). unlockHint: aviso no cartão bloqueado
    unlockHint: 'Beat the game',

    // --- NÚMEROS: todos os parâmetros do personagem, nenhum escondido (0 / false = não tem) ---
    stats: {
        // VIDA E MOVIMENTO (valores absolutos)
        maxHp: 75,                  // vida máxima
        speed: 180,                 // velocidade de movimento, px/s
        dashDistance: 220,          // distância do dash, px
        dashSeconds: 0.17,          // duração do dash, s

        // DEFESA (bônus em %: +10 = 10% mais, -10 = 10% menos)
        damageTaken: 0,             // dano recebido (-10 = recebe 10% menos)
        warmth: 0,                  // calor da tocha: cura perto dela
        lifeSteal: 5,               // parte do dano causado que volta como vida

        // LÂMINA (valores absolutos, só deste personagem)
        attackDamage: 32,         // dano de cada golpe, vale para lâmina, adaga e feitiços
        attackCooldown: 0.7,        // segundos entre golpes: MENOR = ataca mais rápido
        bladeRange: 40,             // alcance da lâmina, px

        // LÂMINA (bônus em %)
        bladeDamage: 0,             // dano só da lâmina (soma ao attackDamage)
        stillAttack: 0,             // velocidade de ataque parado

        // ADAGA
        knifeRange: 273,            // alcance da adaga, px (valor absoluto)
        knifeDamage: 0,             // dano da adaga, bônus em % (soma ao attackDamage)

        // HABILIDADES (true = liga)
        noKnives: false             // não lança adaga; as skills de adaga ficam seladas na árvore
    },

    // --- COMO BOSS (quando outro herói o enfrenta como rival; BOSS_MODELS.AZAEL) ---
    // O boss é PROPORCIONAL ao personagem: cada valor = o stat do personagem x a razão abaixo. Equilibrou o personagem?
    // O boss acompanha. As razões ficam aqui, só deste personagem. O resto é o jeito de lutar dele.
    boss: {
        name: 'Azael',
        title: 'The Demon Who Hunts His Kind',
        color: '#ef4444',
        ratios: {
            hp: 10.3,              // vida do boss = maxHp x razão (a vida ainda sobe com a hora da noite),
            speed: 0.78,          // velocidade = speed x razão,
            damage: 0.83,         // dano = attackDamage x razão,
            meleeRange: 1,        // alcance do golpe de perto = bladeRange x razão,
            meleeCooldown: 1.2,   // segundos entre golpes = attackCooldown x razão,
            lungeLength: 1.8,     // distância do dash = dashDistance x razão,
            lungeSeconds: 0.53    // duração do dash = dashSeconds x razão
        },
        // Jeito de lutar: rápido e de perto, com dash, rajada de adagas, sombras e teleporte
        keepRange: 0,
        burstCount: 3,
        patternGapSeconds: 1.9,
        patterns: ['lunge', 'volley', 'shadows', 'lunge', 'blink', 'lunge', 'ring'],
        ringCount: 12,
        projectileSpeed: 300,
        enrageSpeedMultiplier: 1.35
    },
    rival: 'DEMON_HUNTER'           // quem o enfrenta quando o jogador é ele
};
