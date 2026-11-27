// --- GUDRAN, SENHOR DO CASTELO ---
// Tudo do personagem num lugar só (ver data_model/characters/index.js). Cores e medidas do desenho, o boneco e a ficha
// de como foi criado: library/characters/gudran/ (a fonte é mini_games/_library/characters/gudran).
// O velho feiticeiro do castelo (o chefe final do yara-rpg), aqui como herói: um canhão de vidro. Pouca vida e passos lentos,
// mas a magia dele é a mais forte do jogo e o cajado alcança mais longe. A Fúria é o Lord's Decree: ele crava o cajado e
// abre um círculo de luz azul que queima os monstros, cura a ele e à tocha e os segura.
import { GUDRAN_VISUALS } from '../../library/characters/gudran/gudran_visual.js';

export const GUDRAN = {
    id: 'gudran',
    // Caminhos (árvore): +5% de dano nas skills do Curse Path; o Light Path e o Shadow Path são proibidos (e o Blade, porque não tem lâmina)
    affinity: 'curse',
    sealedBranches: ['blade', 'light', 'shadow'],
    model: 'gudran',             // boneco 2.5D (js/render/bodies.js)
    // 27/11/2026: o ataque básico é uma CAJADADA (golpe físico com o cajado, o golpe normal do jogo, sem lâmina de verdade). O CLIQUE (ou o botão do canto) é o ARREMESSO de adaga do
    // jogo, só que a "adaga" é uma bola de energia azul (thrown: 'arcane') e o dano é de MAGIA (magicKnife): vale tudo da adaga (knifeRange, knifeSpeed, knifeCooldown, knifeDamage...
    // abaixo, os mods de adaga, a mira automática e o arrastar para mirar), com o gesto de erguer o cajado. O Escudo de Runas deixou de ser o clique e virou uma skill da árvore
    // (poder Rune Shield, no Curse Path; data_model/powers.js). Árvore: o ramo Blade e a Flaming Sword ficam selados (como no Rowan); o dele é o Curse Path
    thrown: 'arcane',
    sealedSkills: ['flameBlade'],
    order: 3.5,                     // posição na tela de escolha: depois do Avgustino, antes do Azael

    // --- QUEM É ---
    name: 'Gudran',
    tagline: 'Lord of the Castle. He ruled a kingdom; now his staff guards the last flame.',
    trait: 'The strongest magic of all heroes: a staff that strikes, and a click that hurls a ball of blue energy in place of a dagger. Little health and slow steps.',
    perk: { name: 'LORD OF THE CASTLE', text: 'His staff strikes with real weight, and a click raises it to hurl a ball of blue energy.' },
    colors: GUDRAN_VISUALS.colors,
    portrait: '',
    portraitImage: 'images/characters/gudran-small.webp',
    // Liberado só com Brasas: o cartão bloqueado mostra "🔥 x/2000" e, com Brasas suficientes, o painel de requisitos tem o botão de comprar (js/ui/heroes.js)
    emberPrice: 2000,                 // 27/11/2026: era 500
    unlockHint: 'Unlock with embers',

    // --- NÚMEROS: todos os parâmetros do personagem, nenhum escondido (0 / false = não tem) ---
    // Agrupados como as barras da tela de seleção: HP, DAMAGE, DEFENSE, FURY (bloco `fury`, mais abaixo), REGEN, SPEED, RANGE, DAGGER, MAGIC.
    stats: {
        // ===== HP: a vida =====
        maxHp: 65,                  // vida máxima

        // ===== DAMAGE: o dano da lâmina por segundo (golpe, ritmo, combo e crítico) =====
        attackDamage: 20,           // dano de cada golpe da lâmina (a adaga parte dele; a magia tem o próprio: magicDamage)
        attackCooldown: 1.0,        // segundos entre golpes: MENOR = ataca mais rápido
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
        speed: 110,                 // velocidade de movimento, px/s
        dashDistance: 100,          // distância do dash, px
        dashSeconds: 0.17,          // duração do dash, s
        dashCharges: 1,             // dashes guardados ao mesmo tempo
        dashCooldown: 2.6,          // segundos para recuperar um dash
        dashInvulnerable: 0.3,      // segundos invulnerável durante o dash

        // ===== RANGE: o alcance do ataque (aqui, o raio do cajado) =====
        bladeRange: 55,             // ALCANCE da cajadada, px (é o círculo vermelho em volta dele): um pouco mais que o cajado do Rowan (65) e o Demon Hunter (55). Era 230 quando o ataque básico era o raio; o raio arcano (clique) agora voa até ARCANE_BOLT.range

        // ===== DAGGER: a adaga (dano x alcance) =====
        // This is our "ireArcaneBolt"
        knifeRange: 450,            // alcance da adaga, px (valor absoluto)
        knifeDamage: 0,             // bônus em % no dano da bola (soma ao dano de magia x knifeDamageRatio)
        knifeCooldown: 1.0,         // segundos entre uma bola e a próxima
        knifeSpeed: 700,            // velocidade da bola em voo, px/s (a esfera arcana voa a 75% disto: ~525 na tela)
        knifeDamageRatio: 1.0,      // dano da bola = dano de MAGIA x este número (magicKnife)
        knifeKnockbackRatio: 0.8,   // empurrão da adaga = empurrão do golpe x este número
        noKnives: false,            // lança (a bola de energia): o clique é o arremesso de adaga do jogo
        magicKnife: true,           // o arremesso usa o dano de MAGIA (número azul) em vez do dano de lâmina: a bola de energia, a rosa e a adaga benta são magia

        // ===== MAGIC: o dano da magia (feitiços, tocha, fênix, bolas de fogo, luz...); 0 = não usa magia =====
        magicDamage: 52             // dano base da MAGIA (feitiços, tocha, fênix, bolas de fogo, luz...): independente do dano da lâmina. 0 = não usa magia
    },

    // ===== FURY: a FÚRIA (o especial que dispara sozinho quando a barra enche; cada personagem tem a sua) =====
    // LORD'S DECREE: ele aponta o cajado e solta um RAIO AZUL contínuo que atravessa a tela inteira (js/systems/fury.js, kind 'beam').
    // Enquanto dura ele fica plantado e só mira: o raio gira atrás do mouse (ou do joystick) e queima tudo no caminho, bosses
    // incluídos. Um escudo azul o deixa invulnerável enquanto atira.
    fury: {
        kind: 'beam',
        name: "Lord's Decree",
        // --- CARGA E DURAÇÃO (toda Fúria tem; é o que cada personagem ajusta no seu jeito de carregar) ---
        chargePerHit: 3,            // carga da barra por monstro atingido pela lâmina (a barra tem 100)
        durationSeconds: 7,        // quanto dura com a skill Fury no nível 1
        durationPerLevel: 0.5,      // segundos a mais por nível da skill Fury
        damageBonusPerLevel: 0.12,  // dano da lâmina durante a Fúria: +12% por nível da skill Fury
        color: '#93c5fd',           // cor do corte de cena
        damageReduction: 1,         // ele fica plantado atirando, dentro de um escudo azul: 1 = invulnerável (js/systems/fury.js)
        width: 30,                  // largura do raio, px (metade para cada lado da linha)
        damage: 0.32,               // dano de cada pulso em cada monstro do raio = dano de magia x este número
        tickSeconds: 0.15,          // tempo entre pulsos
        turnSpeed: 2.6,             // quão rápido o raio gira para onde você mira, rad/s
        demonBonus: 0.25,           // elites e bosses levam 25% mais
        knockback: 40               // empurrão de cada pulso, no sentido do raio
    },

    rival: 'AZAEL'                  // quem o enfrenta quando o jogador é ele
};
