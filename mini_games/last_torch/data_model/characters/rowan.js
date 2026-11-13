// --- ROWAN, O DRUIDA ---
// Tudo do personagem num lugar só (ver data_model/characters/index.js). Cores e medidas do desenho, o boneco e a ficha
// de como foi criado: library/characters/rowan/ (a fonte é mini_games/_library/characters/rowan).
// O jeito de jogar dele é outro: bate pouco com o cajado e usa raízes para controlar o campo. No lugar da adaga, faz
// raízes brotarem onde o jogador aponta; sua Fúria o envolve num escudo de folhas que reduz dano.
import { ROWAN_VISUALS } from '../../library/characters/rowan/rowan_visual.js';

export const ROWAN = {
    id: 'rowan',
    model: 'rowan',                 // boneco 2.5D (js/render/bodies.js)
    order: 1.5,                     // posição na tela de escolha: logo depois do Demon Hunter (é o primeiro a ser liberado)

    // --- QUEM É ---
    name: 'Rowan',
    tagline: 'Druid. He never fights alone: the forest walks with him.',
    trait: 'No daggers: Root Snare pins monsters where you point. His Fury surrounds him with a leaf shield, reducing damage taken by 25% while nearby enemies take damage and slow down.',
    perk: { name: 'FOREST GUARDIAN', text: 'Instead of daggers, roots burst where you aim and pin monsters down. His Fury surrounds him with a leaf shield, reducing damage taken by 25% while nearby enemies take damage and slow down.' },
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

        // ADAGA
        knifeRange: 300,            // alcance da adaga, px (sem efeito: ele não lança adaga)
        knifeDamage: 0,             // dano da adaga, bônus em %

        // HABILIDADES (true = liga)
        noKnives: true              // não lança adaga; as skills de adaga ficam seladas na árvore
    },

    // --- HABILIDADES ---
    abilities: {
        // ROOT SNARE (no lugar da adaga): clique esquerdo (ou o botão do canto, no celular) e raízes brotam num círculo onde
        // o jogador aponta (no celular, no monstro mais perto), prendendo e ferindo quem está ali. js/systems/druid.js
        rootSnare: {
            damage: 1.1,                // dano = dano de feitiço x este número
            cooldownSeconds: 4.5,       // tempo de espera entre um uso e o próximo
            radius: 80,                 // raio do círculo de raízes, px
            rootSeconds: 2.4,           // quanto tempo os monstros ficam presos (boss: uma fração, como toda raiz)
            range: 320                  // até onde ele alcança, a partir do herói, px
        },
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
