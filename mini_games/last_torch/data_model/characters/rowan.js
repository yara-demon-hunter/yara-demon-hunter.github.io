// --- ROWAN, O DRUIDA ---
// Tudo do personagem num lugar só (ver data_model/characters/index.js). Cores e medidas do desenho, o boneco e a ficha
// de como foi criado: library/characters/rowan/ (a fonte é mini_games/_library/characters/rowan).
// O jeito de jogar dele é outro: bate pouco com o cajado e deixa a floresta lutar. No lugar da adaga, lança ROSAS (a arma
// dele, em _library/weapons/rose); todas as skills de adaga valem para elas. Sua Fúria o envolve num escudo de folhas.
import { ROWAN_VISUALS } from '../../library/characters/rowan/rowan_visual.js';

export const ROWAN = {
    id: 'rowan',
    model: 'rowan',                 // boneco 2.5D (js/render/bodies.js)
    thrown: 'rose',                 // o que lança com a mão livre: 'rose' no lugar da adaga (_library/weapons/thrown.js)
    order: 1.5,                     // posição na tela de escolha: logo depois do Demon Hunter (é o primeiro a ser liberado)

    // --- QUEM É ---
    name: 'Rowan',
    tagline: 'Druid. He never fights alone: the forest walks with him.',
    trait: 'Throws roses instead of daggers. The forest fights beside him.',
    perk: { name: 'FOREST GUARDIAN', text: 'Throws roses instead of daggers. The forest fights beside him.' },
    colors: ROWAN_VISUALS.colors,
    portrait: '',
    portraitImage: 'images/characters/rowan-small.webp',
    // Liberado pela conquista Into the Hush (chegar à onda 3; data_model/sanctuary.js). unlockHint: aviso no cartão bloqueado
    unlockHint: 'Reach Wave 3',

    // --- NÚMEROS: todos os parâmetros do personagem, nenhum escondido (0 / false = não tem) ---
    stats: {
        // VIDA E MOVIMENTO (valores absolutos)
        maxHp: 90,                  // vida máxima
        speed: 135,                 // velocidade de movimento, px/s
        dashDistance: 150,          // distância do dash, px
        dashSeconds: 0.17,          // duração do dash, s

        // DEFESA (bônus em %: +10 = 10% mais, -10 = 10% menos)
        damageTaken: 0,             // dano recebido (-10 = recebe 10% menos)
        warmth: 10,                 // calor da tocha: cura perto dela
        lifeSteal: 0,               // parte do dano causado que volta como vida

        // CAJADO (valores absolutos, só deste personagem)
        attackDamage: 24,           // dano de cada golpe do cajado e dos feitiços
        attackCooldown: 0.82,       // segundos entre golpes: MENOR = ataca mais rápido
        bladeRange: 60,             // alcance do cajado, px

        // CAJADO (bônus em %)
        bladeDamage: -15,           // dano só do cajado (soma ao attackDamage): ele bate fraco de perto
        stillAttack: 0,             // velocidade de ataque parado

        // ROSA (a arma de arremesso dele; usa os mesmos números e skills da adaga)
        knifeRange: 300,            // alcance da rosa, px
        knifeDamage: 0,             // dano da rosa, bônus em %

        // HABILIDADES (true = liga)
        noKnives: false             // lança rosas: as skills de adaga valem para elas
    },

    // --- FÚRIA (o especial que dispara sozinho quando a barra enche; cada personagem tem a sua) ---
    // FOREST GUARDIAN: folhas reduzem dano e ferem e desaceleram monstros próximos; Fury (Skill) aumenta a duração.
    fury: {
        kind: 'forestGuardian',
        name: 'Forest Guardian',
        color: '#166534',           // cor do corte de cena
        durationSeconds: 8,         // duração base; Fury (Skill) ainda aumenta este tempo
        damageReduction: 0.25,
        radius: 58,
        damage: 0.4,                // multiplicador do dano da lâmina por pulso
        tickSeconds: 0.5,
        slow: 0.35                  // inimigos afetados se movem 35% mais devagar
    },

    rival: 'AZAEL'                  // quem o enfrenta quando o jogador é ele
};
