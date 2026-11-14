// --- ROWAN, O DRUIDA ---
// Tudo do personagem num lugar só (ver data_model/characters/index.js). Cores e medidas do desenho, o boneco e a ficha
// de como foi criado: library/characters/rowan/ (a fonte é mini_games/_library/characters/rowan).
// O jeito de jogar dele é outro: bate pouco com o cajado e deixa a floresta lutar. No lugar da adaga, lança ROSAS (a arma
// dele, em _library/weapons/rose); todas as skills de adaga valem para elas. Sua Fúria o envolve num escudo de folhas.
import { ROWAN_VISUALS } from '../../library/characters/rowan/rowan_visual.js';

export const ROWAN = {
    id: 'rowan',
    model: 'rowan',                 // boneco 2.5D (js/render/bodies.js)
    // Árvore de skills: o cajado não corta. O ramo Blade fica selado (menos a skill Fury, que é da Fúria de todos) e também a Flaming Sword
    sealedBranches: ['blade'],
    sealedSkills: ['flameBlade'],
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
    // Liberado pela conquista First Light (terminar a onda 1; data_model/sanctuary.js). unlockHint: aviso no cartão bloqueado
    unlockHint: 'Survive Wave 1',

    // --- NÚMEROS: todos os parâmetros do personagem, nenhum escondido (0 / false = não tem) ---
    // Agrupados como as barras da tela de seleção: HP, DAMAGE, DEFENSE, FURY (bloco `fury`, mais abaixo), REGEN, SPEED, RANGE, DAGGER, MAGIC.
    stats: {
        // ===== HP: a vida =====
        maxHp: 90,                  // vida máxima

        // ===== DAMAGE: o dano da lâmina por segundo (golpe, ritmo, combo e crítico) =====
        attackDamage: 24,           // dano de cada golpe do cajado (a rosa parte dele; a magia tem o próprio: magicDamage)
        attackCooldown: 0.82,       // segundos entre golpes: MENOR = ataca mais rápido
        bladeDamage: -15,           // dano só do cajado (soma ao attackDamage): ele bate fraco de perto
        stillAttack: 0,             // velocidade de ataque parado
        baseKnockback: 50,          // empurrão do golpe, px/s
        comboDamage: 1.5,           // o 3º golpe do combo bate x vezes mais forte
        comboKnockback: 1.25,       // e empurra x vezes mais
        baseCritChance: 0.06,       // chance de crítico (0.06 = 6 por cento)
        critMultiplier: 2,          // quanto um crítico multiplica o golpe

        // ===== DEFENSE: quanto menos dano ele recebe (bônus em %: -10 = recebe 10% menos) =====
        damageTaken: -15,           // dano recebido (-10 = recebe 10% menos)

        // ===== REGEN: a cura base (calor da tocha: quanto cura e até onde alcança; roubo de vida) =====
        warmthHeal: 1.5,            // CURA: vida por segundo que o calor da tocha cura quem está dentro dele
        warmthRadius: 130,          // ALCANCE: raio do calor da tocha em volta dela, px
        lifeSteal: 0,               // parte do dano causado que volta como vida

        // ===== SPEED: velocidade de movimento junto com o dash =====
        speed: 135,                 // velocidade de movimento, px/s
        dashDistance: 150,          // distância do dash, px
        dashSeconds: 0.17,          // duração do dash, s
        dashCharges: 1,             // dashes guardados ao mesmo tempo
        dashCooldown: 2.6,          // segundos para recuperar um dash
        dashInvulnerable: 0.3,      // segundos invulnerável durante o dash

        // ===== RANGE: o alcance da lâmina =====
        bladeRange: 65,             // alcance do cajado, px

        // ===== DAGGER: a adaga (dano x alcance) =====
        knifeRange: 250,            // alcance da rosa, px
        knifeDamage: 0,             // dano da rosa, bônus em %
        knifeCooldown: 0.9,         // segundos entre adagas
        knifeSpeed: 520,            // velocidade da adaga em voo, px/s
        knifeDamageRatio: 0.8,      // dano da adaga = dano de cada golpe x este número
        knifeKnockbackRatio: 0.8,   // empurrão da adaga = empurrão do golpe x este número
        noKnives: false,            // lança rosas: as skills de adaga valem para elas
        magicKnife: true,           // o arremesso usa o dano de MAGIA (número azul) em vez do dano de lâmina: a rosa e a adaga benta são magia

        // ===== MAGIC: o dano da magia (feitiços, tocha, fênix, bolas de fogo, luz...); 0 = não usa magia =====
        magicDamage: 40             // dano base da MAGIA (feitiços, tocha, fênix, bolas de fogo, luz...): independente do dano da lâmina. 0 = não usa magia
    },

    // ===== FURY: a FÚRIA (o especial que dispara sozinho quando a barra enche; cada personagem tem a sua) =====
    // FOREST GUARDIAN: folhas reduzem dano e ferem e desaceleram monstros próximos; Fury (Skill) aumenta a duração.
    fury: {
        kind: 'forestGuardian',
        name: 'Forest Guardian',
        // --- CARGA E DURAÇÃO (toda Fúria tem; é o que cada personagem ajusta no seu jeito de carregar) ---
        chargePerHit: 3,            // carga da barra por monstro atingido pela lâmina (a barra tem 100)
        chargePerKill: 1.5,         // carga por morte na sequência
        durationSeconds: 8,        // quanto dura com a skill Fury no nível 1
        durationPerLevel: 0.5,      // segundos a mais por nível da skill Fury
        damageBonusPerLevel: 0.12,  // dano da lâmina durante a Fúria: +12% por nível da skill Fury
        color: '#166534',           // cor do corte de cena
        damageReduction: 0.25,
        radius: 58,
        damage: 0.4,                // multiplicador do dano da lâmina por pulso
        tickSeconds: 0.5,
        slow: 0.35                  // inimigos afetados se movem 35% mais devagar
    },

    rival: 'AZAEL'                  // quem o enfrenta quando o jogador é ele
};
