// --- DEMON HUNTER ---
// Tudo do personagem num lugar só: quem ele é, os números dele, o boss em que ele vira e o rival. Cores e medidas do
// desenho ficam em data_model/visuals/characters/ (o Demon Hunter usa a paleta padrão do jogo).
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
    stats: {
        // VIDA E MOVIMENTO (valores absolutos)
        maxHp: 100,                 // vida máxima
        speed: 130,                 // velocidade de movimento, px/s
        dashDistance: 150,          // distância do dash, px
        dashSeconds: 0.17,          // duração do dash, s

        // DEFESA (bônus em %: +10 = 10% mais, -10 = 10% menos)
        damageTaken: 0,             // dano recebido (-10 = recebe 10% menos)
        warmth: 20,                 // calor da tocha: cura perto dela
        lifeSteal: 0,               // parte do dano causado que volta como vida

        // LÂMINA (valores absolutos, só deste personagem)
        attackDamage: 25,         // dano de cada golpe, vale para lâmina, adaga e feitiços
        attackCooldown: 0.7,        // segundos entre golpes: MENOR = ataca mais rápido
        bladeRange: 55,           // alcance da lâmina, px

        // LÂMINA (bônus em %)
        bladeDamage: 0,             // dano só da lâmina (soma ao attackDamage)
        stillAttack: 15,            // velocidade de ataque parado

        // ADAGA
        knifeRange: 525,            // alcance da adaga, px (valor absoluto)
        knifeDamage: 20,            // dano da adaga, bônus em % (soma ao attackDamage)

        // HABILIDADES (true = liga)
        noKnives: false             // não lança adaga; as skills de adaga ficam seladas na árvore
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
