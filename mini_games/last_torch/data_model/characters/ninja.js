// --- KURO, O NINJA ---
// Ninja de capuz e máscara: katana reta rápida e shurikens no lugar da adaga. Tudo do personagem num lugar só
// (ver data_model/characters/index.js). Cores e medidas do desenho: library/characters/kuro-ninja/ (ninja_visual.js e o boneco ninja25d.js; a fonte é mini_games/_library).
import { NINJA_VISUALS } from '../../library/characters/kuro-ninja/ninja_visual.js';

export const NINJA = {
    id: 'ninja',
    // Caminhos (árvore): +5% de dano nas skills do Shadow Path e do Blade Path (no Blade, também no golpe da lâmina);
    // os caminhos Light, Curse e Nature são proibidos para ele (só Blade, Shadow e Flame)
    affinity: 'shadow',
    extraAffinities: ['blade'],
    sealedBranches: ['light', 'curse', 'nature'],
    model: 'ninja',                 // boneco 2.5D (js/render/bodies.js)
    thrown: 'shuriken',             // lança shurikens no lugar da adaga (_library/weapons/thrown.js); as skills de adaga valem para elas
    order: 3.7,                     // posição na tela de escolha

    // --- QUEM É ---
    name: 'Kuro',
    tagline: 'Ninja. Nobody sees him coming; nobody sees him leave.',
    trait: 'Fast sword, two dashes and a stream of shurikens, but little health.',
    perk: { name: 'SILENT STEP', text: 'Two dashes and fast shurikens. Fragile if caught.' },
    colors: NINJA_VISUALS.colors,
    portrait: '',
    portraitImage: 'images/characters/ninja-small.webp',
    // À venda por Brasas na tela de escolha (emberPrice): sem conquista que o libere
    emberPrice: 1000,
    unlockHint: 'Unlock with embers',

    // --- NÚMEROS: todos os parâmetros do personagem, nenhum escondido (0 / false = não tem) ---
    // Agrupados como as barras da tela de seleção: HP, DAMAGE, DEFENSE, FURY (bloco `fury`, mais abaixo), REGEN, SPEED, RANGE, DAGGER, MAGIC.
    stats: {
        // ===== HP: a vida =====
        maxHp: 70,                  // vida máxima

        // ===== DAMAGE: o dano da lâmina por segundo (golpe, ritmo, combo e crítico) =====
        attackDamage: 24,           // dano de cada golpe da lâmina (a adaga parte dele; a magia tem o próprio: magicDamage)
        attackCooldown: 0.5,        // segundos entre golpes: MENOR = ataca mais rápido
        bladeDamage: 0,             // dano só da lâmina (soma ao attackDamage)
        stillAttack: 0,             // velocidade de ataque parado
        baseKnockback: 50,          // empurrão do golpe, px/s
        comboDamage: 1.4,           // o 3º golpe do combo bate x vezes mais forte
        comboKnockback: 1.25,       // e empurra x vezes mais
        baseCritChance: 0.06,       // chance de crítico (0.06 = 6 por cento)
        critMultiplier: 2,          // quanto um crítico multiplica o golpe

        // ===== DEFENSE: quanto menos dano ele recebe (bônus em %: -10 = recebe 10% menos) =====
        damageTaken: 0,            // dano recebido (-10 = recebe 10% menos)

        // ===== REGEN: a cura base (calor da tocha: quanto cura e até onde alcança; roubo de vida) =====
        warmthHeal: 0.5,              // CURA: vida por segundo que o calor da tocha cura quem está dentro dele
        warmthRadius: 100,           // ALCANCE: raio do calor da tocha em volta dela, px
        lifeSteal: 0,               // parte do dano causado que volta como vida (%)

        // ===== SPEED: velocidade de movimento junto com o dash =====
        speed: 175,                 // velocidade de movimento, px/s
        dashDistance: 230,          // distância do dash, px
        dashSeconds: 0.17,          // duração do dash, s
        dashCharges: 2,             // dashes guardados ao mesmo tempo
        dashCooldown: 2.4,          // segundos para recuperar um dash
        dashInvulnerable: 0.3,      // segundos invulnerável durante o dash

        // ===== RANGE: o alcance da lâmina =====
        bladeRange: 42,             // alcance da lâmina, px

        // ===== DAGGER: a adaga (dano x alcance) =====
        knifeRange: 310,            // alcance da adaga, px (valor absoluto)
        knifeDamage: 0,             // dano da adaga, bônus em % (soma ao attackDamage)
        knifeCooldown: 0.55,         // segundos entre adagas
        knifeSpeed: 640,            // velocidade da adaga em voo, px/s
        knifeDamageRatio: 0.7,      // dano da adaga = dano de cada golpe x este número
        knifeKnockbackRatio: 0.8,   // empurrão da adaga = empurrão do golpe x este número
        noKnives: false,            // não lança adaga; as skills de adaga ficam seladas na árvore
        magicKnife: false,          // o arremesso usa o dano de MAGIA (número azul) em vez do dano de lâmina: a rosa e a adaga benta são magia

        // ===== MAGIC: o dano da magia (feitiços, tocha, fênix, bolas de fogo, luz...); 0 = não usa magia =====
        magicDamage: 12             // dano base da MAGIA (feitiços, tocha, fênix, bolas de fogo, luz...): independente do dano da lâmina. 0 = não usa magia
    },

    // ===== FURY: a FÚRIA (o especial que dispara sozinho quando a barra enche; cada personagem tem a sua) =====
    // kind: 'swordRain' (chuva de espadas, a do Demon Hunter), 'bloodWaltz' (saltos de sombra, a do Azael) ou 'stomp' (pisadas,
    // a do Brutos). Os números de cada uma estão explicados ao lado. js/systems/fury.js; a duração vem da árvore (skill Fury).
    // CORTE CARMESIM: ergue a espada e desce na vertical; um corte vermelho corre à frente rasgando o chão (a fenda) e machuca tudo
    // no caminho com um golpe bem forte. kind: 'groundRend' (js/systems/fury.js; a fenda é desenhada em js/render/fury.js).
    fury: {
        kind: 'groundRend',
        name: 'Crimson Rend',
        color: '#dc2626',
        // --- CARGA E DURAÇÃO (toda Fúria tem; é o que cada personagem ajusta no seu jeito de carregar) ---
        chargePerHit: 3,            // carga da barra por monstro atingido pela lâmina (a barra tem 100)
        durationSeconds: 2.5,       // quanto dura com a skill Fury no nível 1 (o bônus de dano da lâmina)
        durationPerLevel: 0.5,      // segundos a mais por nível da skill Fury
        damageBonusPerLevel: 0.12,  // dano da lâmina durante a Fúria: +12% por nível da skill Fury
        length: 560,                // até onde a fenda chega, px
        width: 110,                 // largura da faixa que machuca, px (e o tamanho da lâmina de ar em pé)
        damage: 7,                  // dano = dano da lâmina x este número (um golpe só por monstro)
        windup: 0.47,               // segundos erguendo a espada nas duas mãos, invulnerável, até o golpe descer (a pose 'quake' tem 0,47 s até o impacto)
        travelSeconds: 0.45,        // quanto tempo a fenda leva para correr até a ponta
        lingerSeconds: 1.1,         // quanto tempo a fenda fica aberta antes de sumir
        knockback: 420,             // empurrão para os lados da fenda
        demonBonus: 0.5,            // demônios (elites e chefes) levam 50% a mais
        // 2º corte, logo depois do vertical: a mesma lâmina de ar, deitada (horizontal) e mais larga
        secondGap: 0.1,             // segundos entre o fim do 1º corte e a saída do 2º
        secondWidth: 1.6,           // largura do 2º corte = width x este número
        secondDamage: 5             // dano do 2º corte = dano da lâmina x este número
    },

    rival: 'AZAEL'           // quem o enfrenta quando o jogador é ele
};
