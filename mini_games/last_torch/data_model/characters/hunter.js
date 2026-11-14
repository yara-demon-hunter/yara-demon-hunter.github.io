// --- DEMON HUNTER ---
// Tudo do personagem num lugar só: quem ele é, os números dele, o boss em que ele vira e o rival. Cores e medidas do
// desenho ficam em library/characters/hunter/ (o Demon Hunter usa a paleta padrão do jogo).
// Como os números funcionam e como criar um personagem: data_model/characters/index.js.
export const HUNTER = {
    id: 'hunter',
    order: 1,                       // posição na tela de escolha

    // --- QUEM É ---
    name: 'Demon Hunter',
    tagline: 'Patient and strategic. He waits, aims, and lets the torch work.',
    trait: '+15% health, +20% dagger damage, +25% dagger range, +10% blade reach, +15% attack speed while standing still, +20% torch warmth, but -5% blade damage.',
    perk: { name: 'STEADY HAND', text: 'Attacks faster standing still. The torch warms and heals him more.' },
    colors: null,                   // null = paleta padrão do herói
    portrait: '',                   // filtro CSS do retrato antigo; com portraitImage, a arte própria

    // --- NÚMEROS: todos os parâmetros do personagem, nenhum escondido (0 / false = não tem) ---
    // Agrupados como as barras da tela de seleção: HP, DAMAGE, DEFENSE, FURY (bloco `fury`, mais abaixo), REGEN, SPEED, RANGE, DAGGER, MAGIC.
    stats: {
        // ===== HP: a vida =====
        maxHp: 100,                 // vida máxima

        // ===== DAMAGE: o dano da lâmina por segundo (golpe, ritmo, combo e crítico) =====
        attackDamage: 25,           // dano de cada golpe da lâmina (a adaga parte dele; a magia tem o próprio: magicDamage)
        attackCooldown: 0.7,        // segundos entre golpes: MENOR = ataca mais rápido
        bladeDamage: 0,             // dano só da lâmina (soma ao attackDamage)
        stillAttack: 15,            // velocidade de ataque parado
        baseKnockback: 50,          // empurrão do golpe, px/s
        comboDamage: 1.5,           // o 3º golpe do combo bate x vezes mais forte
        comboKnockback: 1.25,       // e empurra x vezes mais
        baseCritChance: 0.06,       // chance de crítico (0.06 = 6 por cento)
        critMultiplier: 2,          // quanto um crítico multiplica o golpe

        // ===== DEFENSE: quanto menos dano ele recebe (bônus em %: -10 = recebe 10% menos) =====
        damageTaken: -10,           // dano recebido (-10 = recebe 10% menos)

        // ===== REGEN: a cura base (calor da tocha: quanto cura e até onde alcança; roubo de vida) =====
        warmthHeal: 1.0,            // CURA: vida por segundo que o calor da tocha cura quem está dentro dele
        warmthRadius: 120,          // ALCANCE: raio do calor da tocha em volta dela, px
        lifeSteal: 0,               // parte do dano causado que volta como vida

        // ===== SPEED: velocidade de movimento junto com o dash =====
        speed: 130,                 // velocidade de movimento, px/s
        dashDistance: 150,          // distância do dash, px
        dashSeconds: 0.17,          // duração do dash, s
        dashCharges: 1,             // dashes guardados ao mesmo tempo
        dashCooldown: 2.6,          // segundos para recuperar um dash
        dashInvulnerable: 0.3,      // segundos invulnerável durante o dash

        // ===== RANGE: o alcance da lâmina =====
        bladeRange: 55,             // alcance da lâmina, px

        // ===== DAGGER: a adaga (dano x alcance) =====
        knifeRange: 400,            // alcance da adaga, px (valor absoluto)
        knifeDamage: 20,            // dano da adaga, bônus em % (soma ao attackDamage)
        knifeCooldown: 0.9,         // segundos entre adagas
        knifeSpeed: 520,            // velocidade da adaga em voo, px/s
        knifeDamageRatio: 0.8,      // dano da adaga = dano de cada golpe x este número
        knifeKnockbackRatio: 0.8,   // empurrão da adaga = empurrão do golpe x este número
        noKnives: false,            // não lança adaga; as skills de adaga ficam seladas na árvore
        magicKnife: false,          // o arremesso usa o dano de MAGIA (número azul) em vez do dano de lâmina: a rosa e a adaga benta são magia

        // ===== MAGIC: o dano da magia (feitiços, tocha, fênix, bolas de fogo, luz...); 0 = não usa magia =====
        magicDamage: 20             // dano base da MAGIA (feitiços, tocha, fênix, bolas de fogo, luz...): independente do dano da lâmina. 0 = não usa magia
    },

    // ===== FURY: a FÚRIA (o especial que dispara sozinho quando a barra enche; cada personagem tem a sua) =====
    // kind: 'swordRain' (chuva de espadas, a do Demon Hunter), 'bloodWaltz' (saltos de sombra, a do Azael), 'stomp' (pisadas, a do
    // Brutos) ou 'forestGuardian' (escudo de folhas, a do Rowan). js/systems/fury.js; a duração vem da árvore (skill Fury).
    // SWORD RAIN: durante a Fúria, uma espada cai do céu em cima de um monstro por perto a cada `stepSeconds`; no fim, uma espada
    // gigante cai onde há mais monstros juntos. O dano de cada uma é o dano da lâmina x o multiplicador.
    fury: {
        kind: 'swordRain',
        name: 'Sword Rain',
        // --- CARGA E DURAÇÃO (toda Fúria tem; é o que cada personagem ajusta no seu jeito de carregar) ---
        chargePerHit: 3,            // carga da barra por monstro atingido pela lâmina (a barra tem 100)
        chargePerKill: 1.5,         // carga por morte na sequência
        durationSeconds: 3.5,        // quanto dura com a skill Fury no nível 1
        durationPerLevel: 0.5,      // segundos a mais por nível da skill Fury
        damageBonusPerLevel: 0.12,  // dano da lâmina durante a Fúria: +12% por nível da skill Fury
        stepSeconds: 0.15,          // tempo entre uma espada e a próxima
        fallSeconds: 0.22,          // a queda de cada espada (o aviso no chão dura isso)
        radius: 38,                 // alcance do impacto de cada espada, px
        damage: 0.30,               // dano de cada espada = dano da lâmina x este número
        range: 340,                 // até onde ele escolhe os alvos, a partir do herói, px
        giantFallSeconds: 0.5,      // a espada gigante cai nos últimos instantes da Fúria
        giantRadius: 125,           // alcance do impacto dela, px
        giantDamage: 2.5,           // dano da gigante = dano da lâmina x este número
        giantKnockback: 380         // empurrão da gigante
    },

    // --- COMO BOSS (quando outro herói o enfrenta como rival; BOSS_MODELS.DEMON_HUNTER) ---
    // O boss é PROPORCIONAL ao personagem: cada valor = o stat do personagem x a razão abaixo. Equilibrou o personagem?
    // O boss acompanha. As razões ficam aqui, só deste personagem. O resto é o jeito de lutar dele.
    boss: {
        name: 'Demon Hunter',
        title: 'He Hunts Your Kind',
        color: '#38bdf8',
        ratios: {
            hp: 13.1,              // vida do boss = maxHp x razão (a vida ainda sobe com a hora da noite),
            speed: 0.57,          // velocidade = speed x razão,
            damage: 0.91,         // dano = attackDamage x razão,
            meleeRange: 1,        // alcance do golpe de perto = bladeRange x razão,
            meleeCooldown: 1.57,  // segundos entre golpes = attackCooldown x razão,
            lungeLength: 2,       // distância do dash = dashDistance x razão,
            lungeSeconds: 0.71    // duração do dash = dashSeconds x razão
        },
        // Jeito de lutar: mantém distância, joga adagas, cria sombras e bate no chão
        keepRange: 170,
        strafeSpeed: 70,
        burstCount: 4,
        patternGapSeconds: 2.1,
        patterns: ['volley', 'lunge', 'shadows', 'slam', 'lunge', 'volley', 'ring'],
        ringCount: 14,
        slamCount: 3,
        slamRadius: 70,
        slamDelaySeconds: 1,
        slamDamageMultiplier: 0.9,
        slamTorchDamage: 6,
        projectileSpeed: 270,
        enrageSpeedMultiplier: 1.3
    },
    rival: 'AZAEL'                  // quem o enfrenta quando o jogador é ele
};
