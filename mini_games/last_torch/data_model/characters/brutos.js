// --- CAPTAIN BRUTOS ---
// Herói jogável e semi-boss da hora 6 (BOSS_MODELS.BRUTOS). Tudo do personagem num lugar só (ver
// data_model/characters/index.js). Cores e medidas do desenho, o boneco e a
// referência de arte: library/characters/brutos/ (a fonte é mini_games/_library/characters/brutos).
import { BRUTOS_VISUALS } from '../../library/characters/brutos/brutos_visual.js';

export const BRUTOS = {
    id: 'brutos',
    model: 'brutos',                // boneco 2.5D (js/render/bodies.js)
    order: 2,                       // posição na tela de escolha

    // --- QUEM É ---
    name: 'Captain Brutos',
    tagline: 'Slow and iron-clad. Every blow of the axe lands like a siege engine.',
    trait: 'Tough, heavy-hitting and slow. His axe reaches farther and he takes less damage, but he strikes slowly, moves slowly and dashes short. No daggers: the Axe Quake shakes the ground around him.',
    perk: { name: 'HEAVY HANDS', text: 'Slow, crushing axe blows and thick armor. Instead of daggers, he slams the ground and shakes everything around him.' },
    colors: BRUTOS_VISUALS.colors,
    portrait: '',
    portraitImage: 'images/characters/brutos-small.webp',
    // Liberado pela conquista Iron Captain (vencer o Captain Brutos na hora 6; data_model/sanctuary.js). unlockHint: aviso no cartão bloqueado
    unlockHint: 'Defeat Captain Brutos',

    // --- NÚMEROS: todos os parâmetros do personagem, nenhum escondido (0 / false = não tem) ---
    // Agrupados como as barras da tela de seleção: HP, DAMAGE, DEFENSE, FURY (bloco `fury`, mais abaixo), REGEN, SPEED, RANGE, DAGGER, MAGIC.
    stats: {
        // ===== HP: a vida =====
        maxHp: 135,                 // vida máxima

        // ===== DAMAGE: o dano da lâmina por segundo (golpe, ritmo, combo e crítico) =====
        attackDamage: 40,           // dano de cada golpe da lâmina (a adaga parte dele; a magia tem o próprio: magicDamage)
        attackCooldown: 0.91,       // segundos entre golpes: MENOR = mais rápido. Aqui lento: golpes fortes
        bladeDamage: 35,            // dano só da lâmina (soma ao attackDamage)
        stillAttack: 0,             // velocidade de ataque parado
        baseKnockback: 50,          // empurrão do golpe, px/s
        comboDamage: 1.5,           // o 3º golpe do combo bate x vezes mais forte
        comboKnockback: 1.25,       // e empurra x vezes mais
        baseCritChance: 0.06,       // chance de crítico (0.06 = 6 por cento)
        critMultiplier: 2,          // quanto um crítico multiplica o golpe

        // ===== DEFENSE: quanto menos dano ele recebe (bônus em %: -10 = recebe 10% menos) =====
        damageTaken: -20,           // dano recebido (-10 = recebe 10% menos)

        // ===== REGEN: a cura base (calor da tocha: quanto cura e até onde alcança; roubo de vida) =====
        warmthHeal: 0.75,              // CURA: vida por segundo que o calor da tocha cura quem está dentro dele
        warmthRadius: 80,           // ALCANCE: raio do calor da tocha em volta dela, px
        lifeSteal: 0,               // parte do dano causado que volta como vida

        // ===== SPEED: velocidade de movimento junto com o dash =====
        speed: 100,                 // velocidade de movimento, px/s: lento
        dashDistance: 95,           // distância do dash, px: curto
        dashSeconds: 0.2,           // duração do dash, s
        dashCharges: 1,             // dashes guardados ao mesmo tempo
        dashCooldown: 2.6,          // segundos para recuperar um dash
        dashInvulnerable: 0.3,      // segundos invulnerável durante o dash

        // ===== RANGE: o alcance da lâmina =====
        bladeRange: 70,             // alcance da lâmina, px: o machado alcança mais

        // ===== DAGGER: a adaga (dano x alcance) =====
        knifeRange: 420,            // alcance da adaga, px (sem efeito: ele não lança adaga)
        knifeDamage: 0,             // dano da adaga, bônus em % (soma ao attackDamage)
        knifeCooldown: 0.9,         // segundos entre adagas
        knifeSpeed: 520,            // velocidade da adaga em voo, px/s
        knifeDamageRatio: 0.8,      // dano da adaga = dano de cada golpe x este número
        knifeKnockbackRatio: 0.8,   // empurrão da adaga = empurrão do golpe x este número
        noKnives: true,             // não lança adaga; as skills de adaga ficam seladas na árvore
        magicKnife: false,          // o arremesso usa o dano de MAGIA (número azul) em vez do dano de lâmina: a rosa e a adaga benta são magia

        // ===== MAGIC: o dano da magia (feitiços, tocha, fênix, bolas de fogo, luz...); 0 = não usa magia =====
        magicDamage: 5              // dano base da MAGIA (feitiços, tocha, fênix, bolas de fogo, luz...): independente do dano da lâmina. 0 = não usa magia
    },

    // --- HABILIDADE: AXE QUAKE (no lugar da adaga) ---
    // Clique esquerdo (ou o botão do canto, no celular): ergue o machado e desce no chão; uma onda de curto alcance estoura
    // em volta dele. Segurar o botão repete o golpe quando o cooldown acaba. js/systems/quake.js
    abilities: {
        axeQuake: {
            damage: 1.2,                // força: dano da onda = dano da lâmina x este número
            cooldownSeconds: 4.5,       // tempo de espera entre um golpe e o próximo
            radius: 95,                // alcance da onda, px (um pouco além do machado)
            knockback: 420,             // empurrão nos monstros
            stunSeconds: 0.8,           // atordoamento nos monstros comuns (chefes não ficam atordoados)
            moveSpeed: 0.3              // anda a esta fração da velocidade durante o golpe (0.3 = 30%)
        }
    },

    // ===== FURY: a FÚRIA (o especial que dispara sozinho quando a barra enche; cada personagem tem a sua) =====
    // kind: 'swordRain' (chuva de espadas, a do Demon Hunter), 'bloodWaltz' (saltos de sombra, a do Azael) ou 'stomp' (pisadas,
    // a do Brutos). Os números de cada uma estão explicados ao lado. js/systems/fury.js; a duração vem da árvore (skill Fury).
    // PISADAS DO CAPITÃO: enquanto a Fúria dura, cada passo pesado bate no chão em volta dele: dano, empurrão, um atordoamento
    // curto e a tela tremendo. Sem crescer e sem golpe final (pedido do usuário). Ele também aguenta mais pancada.
    fury: {
        kind: 'stomp',
        name: "Captain's Tremor",
        // --- CARGA E DURAÇÃO (toda Fúria tem; é o que cada personagem ajusta no seu jeito de carregar) ---
        chargePerHit: 3,            // carga da barra por monstro atingido pela lâmina (a barra tem 100)
        chargePerKill: 1.5,         // carga por morte na sequência
        durationSeconds: 3.5,        // quanto dura com a skill Fury no nível 1
        durationPerLevel: 0.5,      // segundos a mais por nível da skill Fury
        damageBonusPerLevel: 0.12,  // dano da lâmina durante a Fúria: +12% por nível da skill Fury
        extraSeconds: 2.5,          // a Fúria dele dura este tanto a mais que a dos outros (a pedido: as pisadas são o show)
        stepSeconds: 0.36,          // tempo entre uma pisada e a próxima
        radius: 90,                 // alcance de cada pisada, px
        damage: 0.9,                // dano de cada pisada = dano da lâmina x este número
        knockback: 150,             // empurrão
        stunSeconds: 0.3,           // atordoamento nos monstros comuns (chefes não)
        shake: 5,                   // quanto a tela treme a cada pisada
        damageTakenCut: 0.3         // recebe 30% menos dano enquanto a Fúria dura
    },

    // --- COMO BOSS (semi-boss da hora 6; BOSS_MODELS.BRUTOS) ---
    // O boss é PROPORCIONAL ao personagem: cada valor = o stat do personagem x a razão abaixo. Equilibrou o personagem?
    // O boss acompanha. As razões ficam aqui, só deste personagem. O resto é o jeito de lutar dele.
    boss: {
        name: 'Captain Brutos',
        title: 'Captain of the Black Guard',
        color: '#94a3b8',
        ratios: {
            hp: 15.1,             // vida do boss = maxHp x razão (a vida ainda sobe com a hora da noite),
            speed: 0.38,          // velocidade = speed x razão,
            damage: 0.9,          // dano = attackDamage x razão,
            meleeRange: 1,        // alcance do golpe de perto = bladeRange x razão,
            meleeCooldown: 2.09,  // segundos entre golpes = attackCooldown x razão,
            lungeLength: 1.58,    // distância do dash = dashDistance x razão,
            lungeSeconds: 1.1     // duração do dash = dashSeconds x razão
        },
        // Jeito de lutar: tanque IMPARÁVEL. Avança sem parar, sem magia, sem tiros e sem adaga: golpes pesados de machado de
        // perto, o Axe Quake em volta dele (mesmo golpe do herói) e um dash curto. Nada o atrasa, prende ou empurra.
        noDuel: true,                // entra pela provocação do rival, sem a conversa de duelo
        portraitImage: 'images/characters/brutos-small.webp',
        renderScale: 1.1,
        radius: 26,
        unstoppable: true,
        knockbackResist: 1,
        keepRange: 0,                // vai reto ao herói, sem recuar
        strafeSpeed: 0,              // e sem andar de lado
        meleeArc: 2.8,
        meleeHitDelaySeconds: 0.4,   // preparação visível do golpe
        meleeDamageMultiplier: 1.5,
        lungeWindupSeconds: 0.8,     // aviso longo do dash
        lungeHitRadius: 34,
        lungeDamageMultiplier: 1.3,
        quakeRadius: 110,
        quakeDelaySeconds: 0.9,
        quakeDamageMultiplier: 1.4,
        quakeTorchDamage: 8,
        patternGapSeconds: 2.4,
        patterns: ['quake', 'lunge', 'quake', 'quake', 'lunge'],
        enrageRatio: 0.4,
        enrageGapMultiplier: 0.75,
        enrageSpeedMultiplier: 1.25,
        scoreReward: 400,
        goldBase: 70,
        xpRewardBase: 220
    },
    rival: 'AZAEL'                  // quem o enfrenta quando o jogador é ele
};
