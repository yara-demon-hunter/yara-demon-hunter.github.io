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
    // Não tem lâmina: o ataque básico é um raio de energia azul do cajado (js/systems/arcane.js). No lugar da adaga, o clique (ou o
    // botão do canto) ergue o Escudo de Runas (abilities.runeShield). A esfera azul (thrown) só aparece na mão livre. Árvore: o ramo Blade e a Flaming Sword ficam selados (como no Rowan); o dele é o Curse Path.
    basicAttack: 'arcane',
    thrown: 'arcane',
    sealedSkills: ['flameBlade'],
    order: 3.5,                     // posição na tela de escolha: depois do Avgustino, antes do Azael

    // --- QUEM É ---
    name: 'Gudran',
    tagline: 'Lord of the Castle. He ruled a kingdom; now his staff guards the last flame.',
    trait: 'The strongest magic of all heroes, a long reach and a Rune Shield instead of daggers, but little health and slow steps.',
    perk: { name: 'LORD OF THE CASTLE', text: 'His staff fires bolts of blue energy, and a click raises a shield of spinning runes.' },
    colors: GUDRAN_VISUALS.colors,
    portrait: '',
    portraitImage: 'images/characters/gudran-small.webp',
    // Liberado só com Brasas: o cartão bloqueado mostra "🔥 x/500" e, com Brasas suficientes, o painel de requisitos tem o botão de comprar (js/ui/heroes.js)
    emberPrice: 500,
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
        bladeRange: 230,            // ALCANCE do raio do cajado, px (é o círculo vermelho em volta dele)

        // ===== DAGGER: a adaga (dano x alcance) =====
        knifeRange: 340,            // alcance da adaga, px (valor absoluto)
        knifeDamage: 25,            // dano da adaga, bônus em % (soma ao attackDamage)
        knifeCooldown: 2.0,         // segundos entre adagas
        knifeSpeed: 520,            // velocidade da adaga em voo, px/s
        knifeDamageRatio: 0.8,      // dano da adaga = dano de cada golpe x este número
        knifeKnockbackRatio: 0.8,   // empurrão da adaga = empurrão do golpe x este número
        noKnives: true,             // não lança adaga (o clique é o Escudo de Runas); as skills de adaga ficam seladas na árvore
        magicKnife: true,           // o arremesso usa o dano de MAGIA (número azul) em vez do dano de lâmina: a rosa e a adaga benta são magia

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

    // ===== HABILIDADE: o clique (ou o botão do canto, no celular) no lugar da adaga =====
    // ESCUDO DE RUNAS: runas azuis giram em volta dele por alguns segundos; quem encosta numa runa leva dano de magia e é jogado longe.
    // Lógica em js/systems/arcane.js (updateRuneShield), desenho em js/render/arcane.js.
    abilities: {
        runeShield: {
            cooldownSeconds: 8,     // recarga, s
            seconds: 4,             // quanto tempo as runas giram
            runes: 6,               // quantas runas
            radius: 62,             // distância das runas ao corpo, px
            runeRadius: 9,          // tamanho de cada runa (para acertar), px
            spin: 3.2,              // giro, rad/s
            damage: 0.6,            // dano de cada toque = dano de magia x isto
            hitSeconds: 0.45,       // o mesmo monstro só leva outro toque depois disto
            knockback: 280          // empurrão para fora, px/s
        }
    },

    rival: 'AZAEL'                  // quem o enfrenta quando o jogador é ele
};
