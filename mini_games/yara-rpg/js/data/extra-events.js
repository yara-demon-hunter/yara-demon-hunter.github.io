// Eventos extras de escolha com risco/recompensa. Acrescentados aos eventos de cada região.
// effect "gamble" usa choice.gamble = { winChance, gold, goldRange, hpLoss } (ver resolveStoryEvent).
// Efeitos já existentes (loot, heal, potion...) servem como a opção segura.
(() => {
    const extraEvents = {
        "dark-forest": [
            {
                id: "whispering-stone",
                title: { pt: "A pedra sussurrante", en: "The whispering stone" },
                description: { pt: "Uma pedra coberta de musgo sussurra o nome de Zeph. Algo brilha em uma fenda, mas a névoa ao redor parece faminta.", en: "A moss-covered stone whispers Zeph's name. Something glitters in a crack, but the mist around it looks hungry." },
                choices: [
                    { label: { pt: "Pegar o brilho (arriscado)", en: "Grab the glitter (risky)" }, effect: "gamble", gamble: { winChance: 50, gold: 70, goldRange: 31, hpLoss: 22 } },
                    { label: { pt: "Ignorar e descansar", en: "Ignore it and rest" }, effect: "heal" }
                ]
            },
            {
                id: "lantern-in-the-fog",
                title: { pt: "Lanterna na neblina", en: "Lantern in the fog" },
                description: { pt: "Uma lanterna azul balança sozinha entre as árvores. Seguir a luz pode levar a um tesouro, ou a uma armadilha.", en: "A blue lantern sways alone between the trees. Following the light may lead to treasure, or to a trap." },
                choices: [
                    { label: { pt: "Seguir a luz (arriscado)", en: "Follow the light (risky)" }, effect: "gamble", gamble: { winChance: 55, gold: 60, goldRange: 31, hpLoss: 18 } },
                    { label: { pt: "Procurar suprimentos", en: "Search for supplies" }, effect: "potion" }
                ]
            }
        ],
        "river-crossing": [
            {
                id: "drowned-chest",
                title: { pt: "O baú afogado", en: "The drowned chest" },
                description: { pt: "Um baú de ferro repousa no raso, preso por correntes. A correnteza está forte.", en: "An iron chest rests in the shallows, bound by chains. The current is strong." },
                choices: [
                    { label: { pt: "Mergulhar atrás do baú (arriscado)", en: "Dive for the chest (risky)" }, effect: "gamble", gamble: { winChance: 50, gold: 90, goldRange: 41, hpLoss: 28 } },
                    { label: { pt: "Seguir pela margem", en: "Follow the riverbank" }, effect: "riverbank" }
                ]
            },
            {
                id: "ferryman-bargain",
                title: { pt: "A barganha do balseiro", en: "The ferryman's bargain" },
                description: { pt: "Um balseiro sem rosto oferece dobrar suas moedas na outra margem. Ninguém sabe se ele cumpre o trato.", en: "A faceless ferryman offers to double your coins on the far bank. No one knows if he keeps his word." },
                choices: [
                    { label: { pt: "Aceitar o trato (arriscado)", en: "Accept the deal (risky)" }, effect: "gamble", gamble: { winChance: 45, gold: 110, goldRange: 41, hpLoss: 25 } },
                    { label: { pt: "Recusar com educação", en: "Politely decline" }, effect: "village-scout" }
                ]
            }
        ],
        "blue-torch-village": [
            {
                id: "locked-cellar",
                title: { pt: "O porão trancado", en: "The locked cellar" },
                description: { pt: "Arranhões vêm de um porão trancado. A porta cede com um bom chute, se você aguentar o que vier.", en: "Scratching comes from a locked cellar. The door gives way to a good kick, if you can handle what follows." },
                choices: [
                    { label: { pt: "Arrombar a porta (arriscado)", en: "Break the door (risky)" }, effect: "gamble", gamble: { winChance: 50, gold: 120, goldRange: 51, hpLoss: 35 } },
                    { label: { pt: "Vasculhar os arredores", en: "Search the surroundings" }, effect: "loot" }
                ]
            },
            {
                id: "blue-flame-offering",
                title: { pt: "Oferenda à chama azul", en: "Offering to the blue flame" },
                description: { pt: "Uma tocha azul aceita oferendas de sangue em troca de fortuna. O preço nunca é o mesmo.", en: "A blue torch accepts blood offerings in exchange for fortune. The price is never the same." },
                choices: [
                    { label: { pt: "Oferecer sangue (arriscado)", en: "Offer blood (risky)" }, effect: "gamble", gamble: { winChance: 60, gold: 130, goldRange: 51, hpLoss: 30 } },
                    { label: { pt: "Beber da fonte", en: "Drink from the well" }, effect: "heal" }
                ]
            }
        ],
        "gudran-castle": [
            {
                id: "armory-vault",
                title: { pt: "O cofre do arsenal", en: "The armory vault" },
                description: { pt: "Um cofre antigo guarda as moedas dos guardas. Está armado com lâminas ocultas.", en: "An old vault holds the guards' coins. It is rigged with hidden blades." },
                choices: [
                    { label: { pt: "Forçar o cofre (arriscado)", en: "Force the vault (risky)" }, effect: "gamble", gamble: { winChance: 50, gold: 170, goldRange: 61, hpLoss: 45 } },
                    { label: { pt: "Vasculhar o esconderijo", en: "Search the hideout" }, effect: "castle-cache" }
                ]
            }
        ]
    };
    const regions = window.YaraRpgData.regions;
    Object.entries(extraEvents).forEach(([regionId, events]) => {
        const region = regions.find((entry) => entry.id === regionId);
        if (region && Array.isArray(region.event)) region.event.push(...events);
    });
})();
