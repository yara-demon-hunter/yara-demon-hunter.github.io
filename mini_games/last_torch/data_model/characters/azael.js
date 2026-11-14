// --- AZAEL ---
// Tudo do personagem num lugar só (ver data_model/characters/index.js). Cores e medidas do desenho:
// library/characters/azael/ (azael_visual.js e o boneco azael25d.js; a fonte é mini_games/_library).
import { AZAEL_VISUALS } from '../../library/characters/azael/azael_visual.js';

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
    // Agrupados como as barras da tela de seleção: HP, DAMAGE, DEFENSE, FURY (bloco `fury`, mais abaixo), REGEN, SPEED, RANGE, DAGGER, MAGIC.
    stats: {
        // ===== HP: a vida =====
        maxHp: 75,                  // vida máxima

        // ===== DAMAGE: o dano da lâmina por segundo (golpe, ritmo, combo e crítico) =====
        attackDamage: 32,           // dano de cada golpe da lâmina (a adaga parte dele; a magia tem o próprio: magicDamage)
        attackCooldown: 0.7,        // segundos entre golpes: MENOR = ataca mais rápido
        bladeDamage: 0,             // dano só da lâmina (soma ao attackDamage)
        stillAttack: 0,             // velocidade de ataque parado
        baseKnockback: 50,          // empurrão do golpe, px/s
        comboDamage: 1.5,           // o 3º golpe do combo bate x vezes mais forte
        comboKnockback: 1.25,       // e empurra x vezes mais
        baseCritChance: 0.06,       // chance de crítico (0.06 = 6 por cento)
        critMultiplier: 2,          // quanto um crítico multiplica o golpe

        // ===== DEFENSE: quanto menos dano ele recebe (bônus em %: -10 = recebe 10% menos) =====
        damageTaken: -5,            // dano recebido (-10 = recebe 10% menos)

        // ===== REGEN: a cura base (calor da tocha: quanto cura e até onde alcança; roubo de vida) =====
        warmthHeal: 0.5,              // CURA: vida por segundo que o calor da tocha cura quem está dentro dele
        warmthRadius: 90,           // ALCANCE: raio do calor da tocha em volta dela, px
        lifeSteal: 5,               // parte do dano causado que volta como vida (%)

        // ===== SPEED: velocidade de movimento junto com o dash =====
        speed: 180,                 // velocidade de movimento, px/s
        dashDistance: 220,          // distância do dash, px
        dashSeconds: 0.17,          // duração do dash, s
        dashCharges: 1,             // dashes guardados ao mesmo tempo
        dashCooldown: 2.6,          // segundos para recuperar um dash
        dashInvulnerable: 0.3,      // segundos invulnerável durante o dash

        // ===== RANGE: o alcance da lâmina =====
        bladeRange: 40,             // alcance da lâmina, px

        // ===== DAGGER: a adaga (dano x alcance) =====
        knifeRange: 273,            // alcance da adaga, px (valor absoluto)
        knifeDamage: 0,             // dano da adaga, bônus em % (soma ao attackDamage)
        knifeCooldown: 0.9,         // segundos entre adagas
        knifeSpeed: 520,            // velocidade da adaga em voo, px/s
        knifeDamageRatio: 0.8,      // dano da adaga = dano de cada golpe x este número
        knifeKnockbackRatio: 0.8,   // empurrão da adaga = empurrão do golpe x este número
        noKnives: false,            // não lança adaga; as skills de adaga ficam seladas na árvore
        magicKnife: false,          // o arremesso usa o dano de MAGIA (número azul) em vez do dano de lâmina: a rosa e a adaga benta são magia

        // ===== MAGIC: o dano da magia (feitiços, tocha, fênix, bolas de fogo, luz...); 0 = não usa magia =====
        magicDamage: 15             // dano base da MAGIA (feitiços, tocha, fênix, bolas de fogo, luz...): independente do dano da lâmina. 0 = não usa magia
    },

    // ===== FURY: a FÚRIA (o especial que dispara sozinho quando a barra enche; cada personagem tem a sua) =====
    // kind: 'swordRain' (chuva de espadas, a do Demon Hunter), 'bloodWaltz' (saltos de sombra, a do Azael) ou 'stomp' (pisadas,
    // a do Brutos). Os números de cada uma estão explicados ao lado. js/systems/fury.js; a duração vem da árvore (skill Fury).
    // VALSA DE SANGUE: até 6 cortes seguidos. A cada corte ele salta para o monstro mais perto que NÃO seja o do corte anterior,
    // atravessa o monstro e deixa um risco vermelho no caminho; com 2 monstros, vai e volta 3 vezes entre eles. Cada corte cura.
    fury: {
        kind: 'bloodWaltz',
        name: 'Blood Waltz',
        // --- CARGA E DURAÇÃO (toda Fúria tem; é o que cada personagem ajusta no seu jeito de carregar) ---
        chargePerHit: 3,            // carga da barra por monstro atingido pela lâmina (a barra tem 100)
        chargePerKill: 1.5,         // carga por morte na sequência
        durationSeconds: 3.5,        // quanto dura com a skill Fury no nível 1
        durationPerLevel: 0.5,      // segundos a mais por nível da skill Fury
        damageBonusPerLevel: 0.12,  // dano da lâmina durante a Fúria: +12% por nível da skill Fury
        cuts: 6,                    // quantos cortes (no máximo)
        cutSeconds: 0.12,           // tempo entre um corte e o próximo
        cutRange: 380,              // até onde ele procura o próximo monstro, px
        cutDamage: 2.2,             // dano de cada corte = dano da lâmina x este número
        healRatio: 0.3,             // parte do dano de cada corte que volta como vida (soma ao roubo de vida dele)
        trailSeconds: 0.4           // quanto tempo o risco vermelho leva para sumir
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
