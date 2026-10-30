window.YaraRpgData = window.YaraRpgData || {};

// Alma do herói: vai de -100 (maligno) a +100 (divino) e as escolhas somam ou anulam esse valor.
// Lógica em ../systems/soul.js; o campo `soul` de escolhas e contatos diz quanto cada decisão desloca.
// Em `effects`, os valores são percentuais: atk/def alteram o atributo, heal as poções e o acampamento,
// gold/xp as recompensas de combate.
window.YaraRpgData.soul = Object.freeze({
    min: -100,
    max: 100,
    historySize: 6,
    shifts: {
        monsterFinalBlow: -4,
        monsterSpared: 6
    },
    tiers: Object.freeze([
        {
            id: "abyssal", side: "dark", level: 3, min: -100, max: -70, icon: "🌑",
            name: { pt: "Alma Abissal", en: "Abyssal Soul" },
            description: {
                pt: "A escuridão responde ao seu chamado. +15% de ataque e +25% de ouro em combate, mas curas rendem 30% menos.",
                en: "Darkness answers your call. +15% attack and +25% combat gold, but healing is 30% weaker."
            },
            effects: { atkPercent: 15, goldPercent: 25, healPercent: -30 }
        },
        {
            id: "corrupted", side: "dark", level: 2, min: -69, max: -40, icon: "🌘",
            name: { pt: "Alma Corrompida", en: "Corrupted Soul" },
            description: {
                pt: "A energia negra já não pede licença. +10% de ataque e +15% de ouro em combate, mas curas rendem 20% menos.",
                en: "The black energy no longer asks permission. +10% attack and +15% combat gold, but healing is 20% weaker."
            },
            effects: { atkPercent: 10, goldPercent: 15, healPercent: -20 }
        },
        {
            id: "tainted", side: "dark", level: 1, min: -39, max: -15, icon: "🌒",
            name: { pt: "Alma Maculada", en: "Tainted Soul" },
            description: {
                pt: "Uma sombra acompanha seus passos. +5% de ataque e +10% de ouro em combate, mas curas rendem 10% menos.",
                en: "A shadow follows your steps. +5% attack and +10% combat gold, but healing is 10% weaker."
            },
            effects: { atkPercent: 5, goldPercent: 10, healPercent: -10 }
        },
        {
            id: "balanced", side: "neutral", level: 0, min: -14, max: 14, icon: "⚖️",
            name: { pt: "Alma em Equilíbrio", en: "Balanced Soul" },
            description: {
                pt: "Luz e sombra se anulam, e nada turva seu julgamento. +10% de XP em combate.",
                en: "Light and shadow cancel out, and nothing clouds your judgement. +10% combat XP."
            },
            effects: { xpPercent: 10 }
        },
        {
            id: "pure", side: "light", level: 1, min: 15, max: 39, icon: "🕯️",
            name: { pt: "Alma Purificada", en: "Purified Soul" },
            description: {
                pt: "Uma luz tênue protege você. +8% de defesa e curas rendem 10% mais, mas o ouro de combate cai 10%.",
                en: "A faint light shields you. +8% defense and 10% stronger healing, but combat gold drops by 10%."
            },
            effects: { defPercent: 8, healPercent: 10, goldPercent: -10 }
        },
        {
            id: "blessed", side: "light", level: 2, min: 40, max: 69, icon: "🕊️",
            name: { pt: "Alma Abençoada", en: "Blessed Soul" },
            description: {
                pt: "A névoa recua diante de você. +15% de defesa e curas rendem 20% mais, mas o ouro de combate cai 15%.",
                en: "The mist recoils before you. +15% defense and 20% stronger healing, but combat gold drops by 15%."
            },
            effects: { defPercent: 15, healPercent: 20, goldPercent: -15 }
        },
        {
            id: "divine", side: "light", level: 3, min: 70, max: 100, icon: "☀️",
            name: { pt: "Alma Divina", en: "Divine Soul" },
            description: {
                pt: "Algo sagrado caminha com você. +25% de defesa e curas rendem 30% mais, mas o ouro de combate cai 25%.",
                en: "Something sacred walks with you. +25% defense and 30% stronger healing, but combat gold drops by 25%."
            },
            effects: { defPercent: 25, healPercent: 30, goldPercent: -25 }
        }
    ]),
    // Falas extras do herói, misturadas às do personagem quando a alma pende para um lado.
    dialogues: {
        dark: {
            exploration: {
                pt: ["A escuridão tem gosto de ferro.", "Por que parar agora? Está ficando fácil.", "Ouço algo me chamando pelo nome."],
                en: ["The darkness tastes of iron.", "Why stop now? It's getting easy.", "Something keeps calling my name."]
            },
            combat: {
                pt: ["Sinta o que eu me tornei!", "Sua dor me alimenta.", "Fique. Quero ver você cair."],
                en: ["Feel what I've become!", "Your pain feeds me.", "Stay. I want to watch you fall."]
            }
        },
        light: {
            exploration: {
                pt: ["Ainda há algo que vale proteger aqui.", "A névoa parece mais leve.", "Algo caminha comigo."],
                en: ["There's still something worth protecting here.", "The mist feels lighter.", "I'm not walking alone."]
            },
            combat: {
                pt: ["Esta luz não vai se apagar!", "Volte para a névoa, criatura!", "Eu aguento. Por todos eles."],
                en: ["This light won't go out!", "Back into the mist, creature!", "I can take it. For all of them."]
            }
        }
    },
    // Provocação do chefe, somada à apresentação do combate.
    bossTaunts: {
        dark: { pt: "A criatura fareja a escuridão em você e sorri.", en: "It smells the darkness in you and smiles." },
        light: { pt: "A criatura recua um passo diante da sua luz.", en: "It takes a step back from your light." }
    },
    // Fecho da história, somado ao texto de vitória.
    endings: {
        dark: {
            pt: "Mas quando a névoa se dissipa, a energia negra continua em você. O trono vazio chama, e você não tem certeza de que vai recusar.",
            en: "But when the mist fades, the black energy remains in you. The empty throne calls, and you are not sure you will refuse."
        },
        neutral: {
            pt: "Você não foi santo nem monstro. Sai do castelo como entrou: com o peso das próprias escolhas, e livre para decidir o que vem depois.",
            en: "You were neither saint nor monster. You leave the castle as you entered it: carrying your own choices, and free to decide what comes next."
        },
        light: {
            pt: "Quando a névoa se dissipa, as tochas azuis voltam a arder sozinhas. A aldeia dirá seu nome por gerações.",
            en: "When the mist fades, the blue torches burn again on their own. The village will speak your name for generations."
        }
    }
});
