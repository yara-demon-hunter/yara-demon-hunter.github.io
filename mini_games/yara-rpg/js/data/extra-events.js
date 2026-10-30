// Eventos extras de escolha com risco/recompensa. Acrescentados aos eventos de cada região.
// effect "gamble" usa choice.gamble = { winChance, gold, goldRange, hpLoss } (ver resolveStoryEvent).
// Efeitos já existentes (loot, heal, potion...) servem como a opção segura.
// effect "deal" aplica choice.deal = { gold, hp, foco, potions, skillPoints, atk, def, maxHp, chest, log } (ver YaraSoul.applyDeal).
// `soul` em uma escolha desloca a alma; `requires` esconde o evento ou tranca a escolha ({ soulMin, soulMax, potions, gold }).
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
            },
            {
                id: "wounded-trapper",
                image: "images/mist_contacts/lost-scout.webp",
                title: { pt: "O caçador ferido", en: "The wounded trapper" },
                description: { pt: "Um caçador se arrasta pela trilha, agarrado a uma bolsa de moedas. Ele implora por uma poção.", en: "A trapper crawls along the trail, clutching a purse of coins. He begs for a potion." },
                choices: [
                    { label: { pt: "Dar sua poção", en: "Give your potion" }, effect: "deal", soul: 10, requires: { potions: 1 }, deal: { potions: -1, skillPoints: 1, log: { pt: "O caçador sobrevive e ensina um truque que só quem viveu na névoa conhece. +1 Ponto de Habilidade.", en: "The trapper survives and teaches you a trick only mist-dwellers know. +1 Skill Point." } } },
                    { label: { pt: "Tomar a bolsa", en: "Take the purse" }, effect: "deal", soul: -10, deal: { gold: 90, tone: "loot", log: { pt: "Você arranca a bolsa das mãos dele e segue sem olhar para trás. +🪙90.", en: "You tear the purse from his hands and walk on without looking back. +🪙90." } } },
                    { label: { pt: "Seguir adiante", en: "Walk on" }, effect: "deal", deal: { log: { pt: "Você passa por ele e tenta não ouvir.", en: "You walk past him and try not to listen." }, tone: "normal" } }
                ]
            },
            {
                id: "bone-altar",
                title: { pt: "O altar de ossos", en: "The bone altar" },
                description: { pt: "Um altar de ossos pulsa no meio da clareira, e as árvores ao redor apodrecem. Ele parece estar com sede.", en: "A bone altar pulses in the middle of the clearing, and the trees around it rot. It seems thirsty." },
                choices: [
                    { label: { pt: "Destruir o altar", en: "Destroy the altar" }, effect: "deal", soul: 8, deal: { hp: -12, foco: 25, log: { pt: "Os ossos estilhaçam e cortam sua pele, mas o ar volta a ser limpo. +25 de Foco.", en: "The bones shatter and cut your skin, but the air clears. +25 Focus." } } },
                    { label: { pt: "Alimentar com seu sangue", en: "Feed it your blood" }, effect: "deal", soul: -9, deal: { hp: -20, atk: 2, tone: "combat-monster", log: { pt: "O altar bebe, e algo bebe de volta em você. +2 de ataque.", en: "The altar drinks, and something drinks back from you. +2 attack." } } }
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
                    { label: { pt: "Aceitar o trato (arriscado)", en: "Accept the deal (risky)" }, effect: "gamble", soul: -3, gamble: { winChance: 45, gold: 110, goldRange: 41, hpLoss: 25 } },
                    { label: { pt: "Recusar com educação", en: "Politely decline" }, effect: "village-scout" }
                ]
            },
            {
                id: "drowning-child",
                title: { pt: "A criança na correnteza", en: "The child in the current" },
                description: { pt: "Uma criança se agarra a um tronco no meio do rio. Da margem, a família grita por socorro e sacode uma bolsa de moedas.", en: "A child clings to a log in the middle of the river. From the bank, the family screams for help and shakes a purse of coins." },
                choices: [
                    { label: { pt: "Mergulhar sem pensar", en: "Dive in without thinking" }, effect: "deal", soul: 12, deal: { hp: -25, skillPoints: 1, log: { pt: "As pedras machucam, mas a criança volta para os braços da mãe. +1 Ponto de Habilidade.", en: "The rocks hurt, but the child returns to its mother's arms. +1 Skill Point." } } },
                    { label: { pt: "Exigir o pagamento antes", en: "Demand payment first" }, effect: "deal", soul: -8, deal: { gold: 120, tone: "loot", log: { pt: "Você salva a criança só depois de contar as moedas. Ninguém agradece. +🪙120.", en: "You save the child only after counting the coins. No one thanks you. +🪙120." } } }
                ]
            },
            {
                id: "drowned-offerings",
                title: { pt: "As moedas dos afogados", en: "The coins of the drowned" },
                description: { pt: "Moedas brilham em um pequeno santuário na margem, deixadas pelas famílias dos afogados.", en: "Coins glint on a small riverside shrine, left by the families of the drowned." },
                choices: [
                    { label: { pt: "Deixar uma prece", en: "Leave a prayer" }, effect: "deal", soul: 6, deal: { hp: 35, log: { pt: "Algo no rio parece suspirar, e suas feridas doem menos. +35 de HP.", en: "Something in the river seems to sigh, and your wounds ache less. +35 HP." } } },
                    { label: { pt: "Recolher as oferendas", en: "Take the offerings" }, effect: "deal", soul: -7, deal: { gold: 100, tone: "loot", log: { pt: "As moedas estão geladas e pesam mais do que deveriam. +🪙100.", en: "The coins are ice-cold and weigh more than they should. +🪙100." } } }
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
                    { label: { pt: "Oferecer sangue (arriscado)", en: "Offer blood (risky)" }, effect: "gamble", soul: -7, gamble: { winChance: 60, gold: 130, goldRange: 51, hpLoss: 30 } },
                    { label: { pt: "Beber da fonte", en: "Drink from the well" }, effect: "heal" }
                ]
            },
            {
                id: "chained-traitor",
                title: { pt: "O traidor acorrentado", en: "The chained traitor" },
                description: { pt: "Os aldeões acorrentaram o homem que abriu os portões aos invasores. Ele jura que foi forçado, e eles pedem que você decida.", en: "The villagers chained the man who opened the gates to the invaders. He swears he was forced, and they ask you to decide." },
                choices: [
                    { label: { pt: "Ouvir e libertar", en: "Listen and free him" }, effect: "deal", soul: 9, deal: { chest: true, foco: 20, log: { pt: "Ele conta onde os invasores esconderam o saque. Chance de baú aumentada e +20 de Foco.", en: "He reveals where the invaders hid their loot. Chest chance increased and +20 Focus." } } },
                    { label: { pt: "Dar a sentença", en: "Pass the sentence" }, effect: "deal", soul: -9, deal: { gold: 130, tone: "loot", log: { pt: "A lâmina cai. A aldeia paga, e ninguém olha nos seus olhos. +🪙130.", en: "The blade falls. The village pays, and no one meets your eye. +🪙130." } } }
                ]
            },
            {
                id: "grateful-villagers",
                requires: { soulMin: 15 },
                title: { pt: "A aldeia se lembra", en: "The village remembers" },
                description: { pt: "A notícia da sua bondade correu pelas ruas. Uma anciã espera na porta com o pouco que a aldeia ainda tem.", en: "Word of your kindness has spread. An elder waits at the door with what little the village has left." },
                choices: [
                    { label: { pt: "Aceitar os presentes", en: "Accept the gifts" }, effect: "deal", soul: 2, deal: { potions: 1, hp: 40, log: { pt: "A anciã cuida das suas feridas e coloca uma poção em suas mãos.", en: "The elder tends your wounds and places a potion in your hands." } } },
                    { label: { pt: "Pedir que guardem para si", en: "Ask them to keep it" }, effect: "deal", soul: 7, deal: { skillPoints: 1, log: { pt: "Ela sorri e sussurra uma velha bênção da aldeia. +1 Ponto de Habilidade.", en: "She smiles and whispers an old village blessing. +1 Skill Point." } } }
                ]
            },
            {
                id: "fearful-villagers",
                requires: { soulMax: -15 },
                title: { pt: "As portas se trancam", en: "The doors lock" },
                description: { pt: "As crianças correm quando veem a sombra ao seu redor. Um aldeão treme e oferece tudo o que tem para você ir embora.", en: "Children run from the shadow around you. A trembling villager offers everything he owns if you will just leave." },
                choices: [
                    { label: { pt: "Pegar tudo", en: "Take everything" }, effect: "deal", soul: -6, deal: { gold: 160, tone: "loot", log: { pt: "Medo paga melhor do que trabalho. +🪙160.", en: "Fear pays better than work. +🪙160." } } },
                    { label: { pt: "Devolver e partir", en: "Hand it back and leave" }, effect: "deal", soul: 8, deal: { foco: 30, log: { pt: "Você devolve a bolsa. A sombra ao seu redor recua um pouco. +30 de Foco.", en: "You hand back the purse. The shadow around you recoils a little. +30 Focus." } } }
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
            },
            {
                id: "dungeon-prisoner",
                title: { pt: "O prisioneiro do calabouço", en: "The dungeon prisoner" },
                description: { pt: "Um prisioneiro magro estende a mão entre as grades. Os guardas mortos ainda carregam as chaves, e também uma bolsa de recompensa por ele.", en: "A gaunt prisoner reaches through the bars. The dead guards still carry the keys, along with a bounty purse for him." },
                choices: [
                    { label: { pt: "Abrir a cela", en: "Open the cell" }, effect: "deal", soul: 9, deal: { maxHp: 30, hp: 30, log: { pt: "Ele mostra uma passagem que evita a pior parte do castelo. +30 de HP máximo.", en: "He shows you a passage around the worst of the castle. +30 max HP." } } },
                    { label: { pt: "Ficar com a recompensa", en: "Keep the bounty" }, effect: "deal", soul: -9, deal: { gold: 180, tone: "loot", log: { pt: "Você pega a bolsa e deixa as chaves onde estão. +🪙180.", en: "You take the purse and leave the keys where they are. +🪙180." } } }
                ]
            },
            {
                id: "desecrated-chapel",
                requires: { soulMin: 40 },
                title: { pt: "A capela profanada", en: "The desecrated chapel" },
                description: { pt: "Atrás de uma parede caída, uma capela esquecida reage à sua presença. As velas se acendem sozinhas.", en: "Behind a fallen wall, a forgotten chapel stirs at your presence. The candles light themselves." },
                choices: [
                    { label: { pt: "Reconsagrar o altar", en: "Reconsecrate the altar" }, effect: "deal", soul: 6, deal: { def: 4, log: { pt: "Uma luz antiga se prende à sua armadura. +4 de defesa.", en: "An ancient light clings to your armor. +4 defense." } } },
                    { label: { pt: "Rezar pelos caídos", en: "Pray for the fallen" }, effect: "deal", soul: 3, deal: { hp: 80, foco: 40, log: { pt: "Por um momento, nada dói. +80 de HP e +40 de Foco.", en: "For a moment, nothing hurts. +80 HP and +40 Focus." } } }
                ]
            },
            {
                id: "throne-whisper",
                requires: { soulMax: -40 },
                title: { pt: "O sussurro do trono", en: "The whisper of the throne" },
                description: { pt: "A sombra de Gudran se destaca da parede e fala com a sua: “Você já é mais meu do que deles. Aceite o que é seu.”", en: "Gudran's shadow peels from the wall and speaks to yours: “You are already more mine than theirs. Take what is yours.”" },
                choices: [
                    { label: { pt: "Aceitar a oferta", en: "Accept the offer" }, effect: "deal", soul: -8, deal: { atk: 6, hp: -30, tone: "combat-monster", log: { pt: "A sombra entra pela sua boca. Dói, e é maravilhoso. +6 de ataque.", en: "The shadow enters through your mouth. It hurts, and it is wonderful. +6 attack." } } },
                    { label: { pt: "Cuspir na sombra", en: "Spit at the shadow" }, effect: "deal", soul: 12, deal: { foco: 30, log: { pt: "Ela ri, mas recua. Ainda existe alguém aí dentro. +30 de Foco.", en: "It laughs, but recoils. Someone is still in there. +30 Focus." } } }
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
