window.YaraRpgData = window.YaraRpgData || {};

// Comandos dos companheiros. A chave é o id do item do slot "pet" em items.js; a lógica fica em ../systems/pets.js.
// `command` é a ação gratuita de combate, com recarga em turnos do inimigo. Efeitos aceitos:
//   damageMultiplier, pierce, bleedTurns, bleedMultiplier (fração do ataque do herói),
//   fury, stun, dodgeNext, healHpPercent, healFocoPercent, shredDefPercent, interrupt.
// `scout` é a ação de exploração, com recarga em explorações. Campos aceitos:
//   gold [mínimo, variação], hpPercent, focoPercent, chest.
// A raridade e o aprimoramento do pet aumentam a potência de quase tudo (rarityPowerStep, upgradePowerStep).
window.YaraRpgData.pets = Object.freeze({
    rarityPowerStep: 0.12,
    upgradePowerStep: 0.04,
    minimumDamage: 4,
    scoutGoldRegionStep: 0.5,
    abilities: {
        "forest-dog": {
            command: {
                icon: "🦷", cooldown: 4,
                name: { pt: "Mordida Leal", en: "Loyal Bite" },
                description: { pt: "Morde o inimigo e enche sua Fúria.", en: "Bites the enemy and fills your Fury." },
                effects: { damageMultiplier: 0.8, fury: 15 }
            },
            scout: {
                icon: "👃", cooldown: 7,
                name: { pt: "Farejar moedas", en: "Sniff out coins" },
                gold: [15, 16],
                log: { pt: "{pet} cava a terra e desenterra 🪙{gold}.", en: "{pet} digs up 🪙{gold}." }
            }
        },
        "shadow-cat": {
            command: {
                icon: "🌑", cooldown: 5,
                name: { pt: "Passo de Sombra", en: "Shadow Step" },
                description: { pt: "Distrai o inimigo: o próximo golpe dele erra.", en: "Distracts the enemy: its next attack misses." },
                effects: { dodgeNext: true, fury: 5 }
            },
            scout: {
                icon: "🐾", cooldown: 7,
                name: { pt: "Espreitar o caminho", en: "Prowl the path" },
                focoPercent: 30,
                log: { pt: "{pet} encontra um atalho seguro. Você recupera {foco} de Foco.", en: "{pet} finds a safe shortcut. You recover {foco} Focus." }
            }
        },
        "wild-horse": {
            command: {
                icon: "💨", cooldown: 6,
                name: { pt: "Fôlego Selvagem", en: "Wild Breath" },
                description: { pt: "Recupera HP e Foco no meio da luta.", en: "Restores HP and Focus mid-fight." },
                effects: { healHpPercent: 15, healFocoPercent: 20 }
            },
            scout: {
                icon: "🐎", cooldown: 8,
                name: { pt: "Galopar ao redor", en: "Gallop around" },
                hpPercent: 20,
                log: { pt: "{pet} leva você até uma nascente. Você recupera {hp} de HP.", en: "{pet} takes you to a spring. You recover {hp} HP." }
            }
        },
        "raven": {
            command: {
                icon: "👁️", cooldown: 5,
                name: { pt: "Bicada nos Olhos", en: "Eye Peck" },
                description: { pt: "Reduz a defesa do inimigo e interrompe o golpe carregado.", en: "Lowers enemy defense and interrupts a charged strike." },
                effects: { shredDefPercent: 25, interrupt: true }
            },
            scout: {
                icon: "🪶", cooldown: 9,
                name: { pt: "Sobrevoar tesouros", en: "Search for treasure" },
                chest: true,
                log: { pt: "{pet} volta com uma pista. Chance de baú aumentada.", en: "{pet} returns with a clue. Chest chance increased." }
            }
        },
        "forest-wolf": {
            command: {
                icon: "🩸", cooldown: 5,
                name: { pt: "Dilacerar", en: "Rend" },
                description: { pt: "Ignora parte da defesa e faz o inimigo sangrar por 3 turnos.", en: "Pierces some defense and makes the enemy bleed for 3 turns." },
                effects: { damageMultiplier: 0.6, pierce: 0.5, bleedTurns: 3, bleedMultiplier: 0.25 }
            },
            scout: {
                icon: "🐺", cooldown: 7,
                name: { pt: "Caçar", en: "Hunt" },
                gold: [10, 11],
                hpPercent: 10,
                log: { pt: "{pet} volta da caça. Você ganha 🪙{gold} e recupera {hp} de HP.", en: "{pet} returns from the hunt. You gain 🪙{gold} and recover {hp} HP." }
            }
        },
        "watchful-eagle": {
            command: {
                icon: "🦅", cooldown: 6,
                name: { pt: "Mergulho", en: "Dive" },
                description: { pt: "Atordoa o inimigo: ele perde o próximo turno.", en: "Stuns the enemy: it loses its next turn." },
                effects: { damageMultiplier: 0.4, stun: true }
            },
            scout: {
                icon: "🗺️", cooldown: 8,
                name: { pt: "Vigiar do alto", en: "Watch from above" },
                chest: true,
                focoPercent: 15,
                log: { pt: "{pet} avista algo escondido. Chance de baú aumentada e +{foco} de Foco.", en: "{pet} spots something hidden. Chest chance increased and +{foco} Focus." }
            }
        }
    }
});
