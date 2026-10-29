window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.monsters = Object.freeze({
    minimumRolledAttribute: 1,
    variation: {
        minimum: 0.70,
        maximum: 1.60
    },
    byRegion: {
        "dark-forest": [
            { name: { pt: "Lobo Sombriço", en: "Shadow Wolf" }, icon: "🐺", image: "images/monsters/shadow-wolf.webp", dialogues: { pt: ["Auuuuuu!","Grrrr..."], en: ["Awooooo!","Grrrr..."] }, hp: 35, atk: 10, def: 2, parry: 15, evasion: 8, xpReward: 8, goldReward: 5 },
            { name: { pt: "Espectro Corrompido", en: "Corrupted Specter" }, icon: "👻", image: "images/monsters/corrupted-spirit.webp", dialogues: { pt: ["Sua luz vai se apagar...","A névoa me trouxe até você."], en: ["Your light will fade...","The mist brought me to you."] }, hp: 42, atk: 12, def: 3, parry: 18, evasion: 12, xpReward: 9, goldReward: 8 },
            { name: { pt: "Bruxa", en: "Witch" }, icon: "🧙‍♀️", image: "images/monsters/witch.webp", dialogues: { pt: ["Já preparei um feitiço para você.","A floresta guarda meus segredos."], en: ["I've prepared a spell just for you.","The forest keeps my secrets."] }, hp: 50, atk: 14, def: 4, parry: 22, evasion: 10, xpReward: 15, goldReward: 12 },
            { name: { pt: "Esqueleto", en: "Skeleton" }, icon: "💀", image: "images/monsters/squeleton.webp", dialogues: { pt: ["Meus ossos não descansam...","Logo você será como eu."], en: ["My bones find no rest...","Soon you will be like me."] }, hp: 38, atk: 11, def: 3, parry: 16, evasion: 6, xpReward: 9, goldReward: 7 },
        ],
        "river-crossing": [
            { name: { pt: "Demônio do Rio", en: "River Demon" }, icon: "👻", image: "images/monsters/river-demon.webp", dialogues: { pt: ["O rio vai levar você!","Afunde nas minhas águas!"], en: ["The river will take you!","Sink beneath my waters!"] }, hp: 90, atk: 19, def: 7, parry: 27, evasion: 18, xpReward: 23, goldReward: 20 },
            { name: { pt: "Golem do Rio", en: "River Golem" }, icon: "🗿", image: "images/monsters/river-golem.webp", dialogues: { pt: ["Pedra não sente dor.","Você não passará por mim."], en: ["Stone feels no pain.","You shall not pass me."] }, hp: 75, atk: 17, def: 6, parry: 24, evasion: 8, xpReward: 28, goldReward: 24 },
            { name: { pt: "Criatura das Sombras", en: "Shadow Creature" }, icon: "👤", image: "images/monsters/shadow-creature.webp", dialogues: { pt: ["Eu sou o medo que você esconde.","A escuridão sempre vence."], en: ["I am the fear you hide.","Darkness always wins."] }, hp: 110, atk: 18, def: 13, parry: 25, evasion: 15, xpReward: 35, goldReward: 30 },
            { name: { pt: "Vampiro", en: "Vampire" }, icon: "🧛", image: "images/monsters/vampire.webp", dialogues: { pt: ["Seu sangue tem cheiro de coragem...","A noite é minha aliada."], en: ["Your blood smells of courage...","The night is my ally."] }, hp: 100, atk: 21, def: 9, parry: 26, evasion: 20, xpReward: 32, goldReward: 28 }
        ],
        "blue-torch-village": [
            { name: { pt: "Saqueador da Névoa", en: "Mist Marauder" }, icon: "🪓", image: "images/monsters/mist-maruader.webp", dialogues: { pt: ["Entregue seu ouro e talvez eu poupe você.","A névoa esconde meu próximo golpe."], en: ["Hand over your gold and I may spare you.","The mist hides my next strike."] }, hp: 130, atk: 28, def: 20, parry: 30, evasion: 12, xpReward: 50, goldReward: 55 },
            { name: { pt: "Cavaleiro Possuído", en: "Possessed Knight" }, icon: "⚔️", image: "images/monsters/possessed-knight.webp", dialogues: { pt: ["Minha vontade já não me pertence.","A armadura exige sangue."], en: ["My will is no longer my own.","The armor demands blood."] }, hp: 150, atk: 28, def: 15, parry: 35, evasion: 10, xpReward: 55, goldReward: 75 },
            { name: { pt: "Cavaleiro sem Cabeça", en: "Headless Horseman" }, icon: "⚔️", image: "images/monsters/headless-horseman.webp", dialogues: { pt: ["O galope anuncia seu fim.","Minha caçada nunca termina."], en: ["The gallop heralds your end.","My hunt never ends."] }, hp: 180, atk: 32, def: 25, parry: 35, evasion: 10, xpReward: 70, goldReward: 90 }
            
        ],
        "gudran-castle": [
            { name: { pt: "Soldado de Gudran", en: "Gudran's Soldier" }, icon: "🛡️", image: "images/monsters/gudran-soldier.webp", dialogues: { pt: ["O castelo não cairá enquanto eu respirar.","Sirvo ao meu senhor até o fim."], en: ["The castle will not fall while I draw breath.","I serve my lord until the end."] }, hp: 220, atk: 30, def: 30, parry: 38, evasion: 12, xpReward: 110, goldReward: 100 },
            { name: { pt: "Criatura Corrompida", en: "Corrupted Creature" }, icon: "💀", image: "images/monsters/corrupted-creature.webp", dialogues: { pt: ["A corrupção me tornou mais forte.","Junte-se a mim na escuridão."], en: ["The corruption made me stronger.","Join me in the darkness."] }, hp: 250, atk: 35, def: 20, parry: 20, evasion: 30, xpReward: 120, goldReward: 90 },
            { name: { pt: "Golem", en: "Golem" }, icon: "🗿", image: "images/monsters/golem.webp", dialogues: { pt: ["O castelo é minha rocha.","Quebre-se contra minha defesa."], en: ["The castle is my stone.","Shatter against my defense."] }, hp: 270, atk: 40, def: 10, parry: 0, evasion: 0, xpReward: 160, goldReward: 120 }
        ]
    }
});
