// --- PADRE AVGUSTINO ---
// Tudo do personagem num lugar só (ver data_model/characters/index.js). Cores e medidas do desenho, o boneco e a ficha
// de como foi criado: library/characters/avgustino/ (a fonte é mini_games/_library/characters/avgustino).
// Padre misterioso de óculos escuros: cauteloso, de poucas palavras. Luta com uma lâmina de prata benta e a adaga, e a
// tocha o aquece mais (a fé como abrigo), mas ele é frágil. Sua Fúria é a Terra Consagrada: um círculo de luz que cura e queima.
import { AVGUSTINO_VISUALS } from '../../library/characters/avgustino/avgustino_visual.js';

export const AVGUSTINO = {
    id: 'avgustino',
    model: 'avgustino',             // boneco 2.5D (js/render/bodies.js)
    thrown: 'cross',                // o que lança com a mão livre: um crucifixo de prata no lugar da adaga (_library/weapons/cross)
    order: 2.5,                     // posição na tela de escolha: depois do Rowan, antes do Azael

    // --- QUEM É ---
    name: 'Father Avgustino',
    tagline: 'A priest of few words. Does he guard the survivors, or the secret of the dark?',
    trait: '+30% torch warmth and +25% dagger damage, but -10% health and slower steps.',
    perk: { name: 'SILENT VIGIL', text: 'The torch warms and heals him more. Silver bites harder.' },
    colors: AVGUSTINO_VISUALS.colors,
    portrait: '',
    portraitImage: 'images/characters/avgustino-small.webp',
    // Liberado pela conquista Blood Moon (chegar à onda 4; data_model/sanctuary.js). unlockHint: aviso no cartão bloqueado
    unlockHint: 'Reach Wave 4',

    // --- NÚMEROS: todos os parâmetros do personagem, nenhum escondido (0 / false = não tem) ---
    // Agrupados como as barras da tela de seleção: HP, DAMAGE, DEFENSE, FURY (bloco `fury`, mais abaixo), REGEN, SPEED, RANGE, DAGGER, MAGIC.
    stats: {
        // ===== HP: a vida =====
        maxHp: 90,                  // vida máxima

        // ===== DAMAGE: o dano da lâmina por segundo (golpe, ritmo, combo e crítico) =====
        attackDamage: 24,           // dano de cada golpe da lâmina (a adaga parte dele; a magia tem o próprio: magicDamage)
        attackCooldown: 0.75,       // segundos entre golpes: MENOR = ataca mais rápido
        bladeDamage: 0,             // dano só da lâmina (soma ao attackDamage)
        stillAttack: 10,            // velocidade de ataque parado (ele observa antes de agir)
        baseKnockback: 50,          // empurrão do golpe, px/s
        comboDamage: 1.5,           // o 3º golpe do combo bate x vezes mais forte
        comboKnockback: 1.25,       // e empurra x vezes mais
        baseCritChance: 0.06,       // chance de crítico (0.06 = 6 por cento)
        critMultiplier: 2,          // quanto um crítico multiplica o golpe

        // ===== DEFENSE: quanto menos dano ele recebe (bônus em %: -10 = recebe 10% menos) =====
        damageTaken: 0,             // dano recebido (-10 = recebe 10% menos)

        // ===== REGEN: a cura base (calor da tocha: quanto cura e até onde alcança; roubo de vida) =====
        warmthHeal: 3,           // CURA: vida por segundo que o calor da tocha cura quem está dentro dele
        warmthRadius: 200,          // ALCANCE: raio do calor da tocha em volta dela, px
        lifeSteal: 0,               // parte do dano causado que volta como vida

        // ===== SPEED: velocidade de movimento junto com o dash =====
        speed: 125,                 // velocidade de movimento, px/s
        dashDistance: 150,          // distância do dash, px
        dashSeconds: 0.17,          // duração do dash, s
        dashCharges: 1,             // dashes guardados ao mesmo tempo
        dashCooldown: 2.6,          // segundos para recuperar um dash
        dashInvulnerable: 0.3,      // segundos invulnerável durante o dash

        // ===== RANGE: o alcance da lâmina =====
        bladeRange: 50,             // alcance da lâmina, px

        // ===== DAGGER: a adaga (dano x alcance) =====
        knifeRange: 360,            // alcance da adaga, px (valor absoluto)
        knifeDamage: 25,            // dano da adaga, bônus em % (soma ao attackDamage)
        knifeCooldown: 0.9,         // segundos entre adagas
        knifeSpeed: 520,            // velocidade da adaga em voo, px/s
        knifeDamageRatio: 0.8,      // dano da adaga = dano de cada golpe x este número
        knifeKnockbackRatio: 0.8,   // empurrão da adaga = empurrão do golpe x este número
        noKnives: false,            // não lança adaga; as skills de adaga ficam seladas na árvore
        magicKnife: true,           // o arremesso usa o dano de MAGIA (número azul) em vez do dano de lâmina: a rosa e a adaga benta são magia

        // ===== MAGIC: o dano da magia (feitiços, tocha, fênix, bolas de fogo, luz...); 0 = não usa magia =====
        magicDamage: 30             // dano base da MAGIA (feitiços, tocha, fênix, bolas de fogo, luz...): independente do dano da lâmina. 0 = não usa magia
    },

    // ===== FURY: a FÚRIA (o especial que dispara sozinho quando a barra enche; cada personagem tem a sua) =====
    // TERRA CONSAGRADA: ele crava o crucifixo no chão e abre um círculo de luz onde está. Dentro dele os monstros queimam em
    // pulsos e andam mais devagar (demônios, mais ainda), ele e a tocha se curam e levam menos dano. No fim do tempo, uma cruz
    // de luz estoura em cima do círculo.
    fury: {
        kind: 'consecration',
        name: 'Sacred Ground',
        // --- CARGA E DURAÇÃO (toda Fúria tem; é o que cada personagem ajusta no seu jeito de carregar) ---
        chargePerHit: 3,            // carga da barra por monstro atingido pela lâmina (a barra tem 100)
        chargePerKill: 1.5,         // carga por morte na sequência
        durationSeconds: 7,        // quanto dura com a skill Fury no nível 1
        durationPerLevel: 0.5,      // segundos a mais por nível da skill Fury
        damageBonusPerLevel: 0.12,  // dano da lâmina durante a Fúria: +12% por nível da skill Fury
        color: '#fde68a',           // cor do corte de cena
        damageReduction: 0.3,       // quem está dentro do círculo leva menos dano
        radius: 150,                // tamanho do círculo, px
        damage: 0.45,               // dano de cada pulso = dano da lâmina x este número
        tickSeconds: 0.5,           // tempo entre pulsos
        slow: 0.4,                  // monstros no círculo andam 40% mais devagar
        healPerSecond: 3,           // vida dele por segundo dentro do círculo
        torchHealPerSecond: 3,      // vida da tocha por segundo, se ela estiver dentro
        demonBonus: 0.5,            // elites e bosses levam 50% mais
        finaleDamage: 3,            // dano da cruz do fim = dano da lâmina x este número
        finaleRadius: 1.15          // alcance da cruz = raio do círculo x este número
    },

    rival: 'AZAEL'                  // quem o enfrenta quando o jogador é ele
};
