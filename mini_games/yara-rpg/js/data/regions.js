window.YaraRpgData = window.YaraRpgData || {};

const spiritWorldRegion = {
    id: "spirit-world",
    sceneIcon: "👁️",
    sceneImage: "images/regions/spirit-world.webp",
    title: { pt: "Mundo Espiritual", en: "Spirit World" },
    description: {
        pt: "Por trás do olho espiritual, um lugar oculto se revela entre a névoa e as estrelas.",
        en: "Beyond the spiritual eye, a hidden place emerges between the mist and the stars."
    },
    objectives: {
        title: { pt: "Explore o Mundo Espiritual", en: "Explore the Spirit World" },
        description: { pt: "Encontre seu caminho por este lugar além do mundo físico.", en: "Find your way through this place beyond the physical world." },
        tasks: [
            { id: "exploration", required: 3, title: { pt: "Conclua explorações sem interrupção.", en: "Complete uninterrupted explorations." } },
            { id: "monsters", required: 3, title: { pt: "Derrote espíritos hostis.", en: "Defeat hostile spirits." } },
            { id: "story", title: { pt: "Investigue um encontro espiritual.", en: "Investigate a spiritual encounter." } },
            { id: "combat", title: { pt: "Vença uma luta ou escape.", en: "Win a fight or escape." } },
            { id: "chest", title: { pt: "Encontre e abra um baú.", en: "Find and open a chest." } }
        ]
    },
    event: [
        {
            id: "benevolent-spirit-placeholder",
            title: { pt: "Uma presença serena", en: "A Serene Presence" },
            description: { pt: "Uma luz branda se aproxima. Mais adiante, uma figura aguarda em silêncio.", en: "A gentle light draws near. Farther ahead, a figure waits in silence." },
            choices: [
                { label: { pt: "Aproximar-se", en: "Approach" }, effect: "heal" },
                { label: { pt: "Seguir em frente", en: "Move on" }, effect: "gold" }
            ]
        }
    ]
};

window.YaraRpgData.spiritWorld = Object.freeze(spiritWorldRegion);
window.YaraRpgData.regions = Object.freeze([
    {
        id: "dark-forest",
        sceneIcon: "",
        sceneImage: "images/regions/dark-forest.webp",
        title: { pt: "Floresta da Névoa", en: "Misty Forest" },
        description: {
            pt: "O sino tocou tarde demais. A névoa esconde feras famintas e segredos antigos.",
            en: "The bell rang too late. The mist hides hungry beasts and ancient secrets."
        },
        objectives: {
            title: { pt: "Abra caminho pela névoa", en: "Cut a path through the mist" },
            description: { pt: "Conclua as tarefas para encontrar uma saída da floresta.", en: "Complete the tasks to find a way out of the forest." },
            tasks: [
                { id: "exploration", required: 1, title: { pt: "Conclua explorações sem interrupção.", en: "Complete uninterrupted explorations." } },
                { id: "monsters", required: 10, title: { pt: "Derrote monstros.", en: "Defeat monsters." } },
                { id: "story", title: { pt: "Resolva um evento ou aceite um contato da névoa", en: "Resolve a story event or accept a mist contact" } },
                { id: "combat", title: { pt: "Vença uma luta ou escape", en: "Win a fight or escape" } },
                { id: "chest", title: { pt: "Encontre e abra um baú", en: "Find and open a chest" } }
            ]
        },
        event: [
            {
                title: { pt: "Pegadas sob a chuva", en: "Footprints in the rain" },
                description: { pt: "Pegadas recentes levam a uma mochila caída. Um uivo responde do outro lado da trilha.", en: "Fresh tracks lead to a fallen pack. A howl answers from beyond the trail." },
                choices: [
                    { label: { pt: "Vasculhar a mochila", en: "Search the pack" }, effect: "loot" },
                    { label: { pt: "Seguir as pegadas", en: "Follow the tracks" }, effect: "combat" }
                ]
            },
            {
                title: { pt: "A travessia do rio", en: "Crossing the river" },
                description: { pt: "A correnteza subiu com a chuva. Deseja atravessar o rio por uma ponte de troncos ou procurar um desvio seguro?", en: "The rain has swollen the current. Will you cross on a fallen-log bridge or look for a safer detour?" },
                choices: [
                    { label: { pt: "Atravessar o rio", en: "Cross the river" }, effect: "river-crossing" },
                    { label: { pt: "Seguir pela margem", en: "Follow the riverbank" }, effect: "riverbank" }
                ]
            },
            {
                title: { pt: "A cabana abandonada", en: "The abandoned cabin" },
                description: { pt: "Uma cabana quase engolida pelas raízes guarda sinais de uma fuga apressada. Ainda pode haver algo útil lá dentro.", en: "A cabin nearly swallowed by roots bears signs of a hasty escape. Something useful may remain inside." },
                choices: [
                    { label: { pt: "Procurar suprimentos", en: "Search for supplies" }, effect: "potion" },
                    { label: { pt: "Investigar o porão", en: "Investigate the cellar" }, effect: "combat" }
                ]
            },
            {
                id: "animal-in-the-brush",
                title: { pt: "Um ruído no mato", en: "A sound in the brush" },
                description: { pt: "Você ouve um farfalhar entre os arbustos. Parece haver um animal assustado escondido ali.", en: "You hear rustling in the brush. A frightened animal seems to be hiding there." },
                choices: [
                    { label: { pt: "Atacar o mato (+ouro)", en: "Strike the brush (+gold)" }, effect: "animal-event-gold" },
                    { label: { pt: "Verificar com cuidado (pet)", en: "Investigate carefully (pet)" }, effect: "animal-event-pet" }
                ]
            },
            {
                id: "abyssal-challenge-forest",
                title: { pt: "O desafio da fenda", en: "The Rift Challenge" },
                description: { pt: "Uma fenda se abre sob uma árvore antiga. O Arauto do Abismo surge e bloqueia a trilha. A presença dele é esmagadora; dizem que monstros assim guardam equipamentos Épicos ou Lendários.", en: "A rift opens beneath an ancient tree. The Abyssal Herald emerges and blocks the trail. Its presence is overwhelming; creatures like this are said to guard Epic or Legendary gear." },
                choices: [
                    { label: { pt: "Enfrentar o Arauto (alto risco)", en: "Face the Herald (high risk)" }, effect: "abyssal-challenge" },
                    { label: { pt: "Recuar e se preparar", en: "Withdraw and prepare" }, effect: "abyssal-challenge-retreat" }
                ]
            }
        ]
    },
    {
        id: "river-crossing",
        sceneIcon: "🌊",
        sceneImage: "images/regions/river-crossing.webp",
        title: { pt: "Travessia do Rio", en: "River Crossing" },
        description: {
            pt: "🌊 A correnteza corta a floresta. Atravesse o rio e encontre o caminho para o outro lado, onde a névoa ainda esconde perigos.",
            en: "🌊 The current cuts through the forest. Cross the river to reach the far side, where the mist still hides danger."
        },
        objectives: {
            title: { pt: "Encontre uma travessia segura", en: "Find a safe crossing" },
            description: { pt: "Conclua as tarefas para atravessar o rio e seguir viagem.", en: "Complete the tasks to cross the river and continue your journey." },
            tasks: [
                { id: "exploration", required: 4, title: { pt: "Conclua explorações sem interrupção.", en: "Complete uninterrupted explorations." } },
                { id: "monsters", required: 15, title: { pt: "Derrote monstros.", en: "Defeat monsters." } },
                { id: "story", title: { pt: "Resolva um evento ou aceite um contato da névoa", en: "Resolve a story event or accept a mist contact" } },
                { id: "combat", title: { pt: "Vença uma luta ou escape", en: "Win a fight or escape" } },
                { id: "chest", title: { pt: "Encontre e abra um baú", en: "Find and open a chest" } }
            ]
        },
        event: [
            {
                title: { pt: "A correnteza traiçoeira", en: "The treacherous current" },
                description: { pt: "A água sobe e a ponte improvisada range sob seus pés. Você pode se recuperar antes de seguir ou avançar em busca de uma passagem segura.", en: "The water rises and the makeshift bridge creaks beneath your feet. You can recover before continuing or press on to find a safe passage." },
                choices: [
                    { label: { pt: "Descansar à margem (+HP)", en: "Rest by the river (+HP)" }, effect: "heal" },
                    { label: { pt: "Procurar uma passagem (+ouro)", en: "Search for a crossing (+gold)" }, effect: "gold" }
                ]
            },
            {
                title: { pt: "A ponte de troncos", en: "The log bridge" },
                description: { pt: "Troncos caídos formam uma ponte estreita sobre a correnteza. Há algo preso entre as pedras do outro lado.", en: "Fallen logs form a narrow bridge over the current. Something is caught among the stones on the far bank." },
                choices: [
                    { label: { pt: "Atravessar e recolher (+ouro)", en: "Cross and collect (+gold)" }, effect: "gold" },
                    { label: { pt: "Atravessar com cuidado (+HP)", en: "Cross carefully (+HP)" }, effect: "heal" }
                ]
            },
            {
                title: { pt: "Sinais na outra margem", en: "Signs on the far bank" },
                description: { pt: "Pegadas recentes seguem pela margem oposta em direção a uma aldeia. Um vulto se move entre as árvores próximas.", en: "Fresh tracks lead along the far bank toward a village. A figure moves among the nearby trees." },
                choices: [
                    { label: { pt: "Seguir as pegadas", en: "Follow the tracks" }, effect: "combat" },
                    { label: { pt: "Vasculhar a margem (+ouro)", en: "Search the riverbank (+gold)" }, effect: "gold" }
                ]
            },
            {
                id: "animal-by-the-portal",
                title: { pt: "Um ruído entre as pedras", en: "A sound among the stones" },
                description: { pt: "Um animal pequeno está preso entre as pedras da margem e parece precisar de ajuda.", en: "A small animal is trapped among the riverbank stones and seems to need help." },
                choices: [
                    { label: { pt: "Atacar o esconderijo (+ouro)", en: "Strike the hiding place (+gold)" }, effect: "animal-event-gold" },
                    { label: { pt: "Verificar e ajudar (pet)", en: "Investigate and help (pet)" }, effect: "animal-event-pet" }
                ]
            },
            {
                id: "abyssal-challenge-river",
                title: { pt: "O desafio da fenda", en: "The Rift Challenge" },
                description: { pt: "Uma ruptura se abre sobre a correnteza. O Arauto do Abismo atravessa a fenda e desafia você. Só caçadores preparados devem aceitar; a criatura guarda equipamentos Épicos ou Lendários.", en: "A rupture opens above the current. The Abyssal Herald steps through and challenges you. Only prepared hunters should accept; the creature guards Epic or Legendary gear." },
                choices: [
                    { label: { pt: "Enfrentar o Arauto (alto risco)", en: "Face the Herald (high risk)" }, effect: "abyssal-challenge" },
                    { label: { pt: "Recuar e se preparar", en: "Withdraw and prepare" }, effect: "abyssal-challenge-retreat" }
                ]
            }
        ]
    },
    {
        id: "blue-torch-village",
        sceneIcon: "🕯️",
        sceneImage: "images/regions/blue-torch-village.webp",
        title: { pt: "Aldeia das Tochas Azuladas", en: "Village of Blue Torches" },
        description: {
            pt: "🕯️ Tochas de chama azulada iluminam as casas da aldeia. As ruas estão quietas demais, e sinais de invasores ainda marcam as paredes.",
            en: "🕯️ Blue-flamed torches light the village homes. The streets are too quiet, and signs of invaders still mark the walls."
        },
        objectives: {
            title: { pt: "Investigue a aldeia", en: "Investigate the village" },
            description: { pt: "Conclua as tarefas para descobrir o que aconteceu com a aldeia.", en: "Complete the tasks to uncover what happened to the village." },
            tasks: [
                { id: "exploration", required: 7, title: { pt: "Conclua explorações sem interrupção.", en: "Complete uninterrupted explorations." } },
                { id: "monsters", required: 20, title: { pt: "Derrote monstros.", en: "Defeat monsters." } },
                { id: "story", title: { pt: "Resolva um evento ou aceite um contato da névoa", en: "Resolve a story event or accept a mist contact" } },
                { id: "combat", title: { pt: "Vença uma luta ou escape", en: "Win a fight or escape" } },
                { id: "chest", title: { pt: "Encontre e abra um baú", en: "Find and open a chest" } }
            ]
        },
        event: [
            {
                title: { pt: "O abrigo dos sobreviventes", en: "The survivors' shelter" },
                description: { pt: "Uma família se esconde no porão de uma casa. O pouco que têm pode ajudar sua jornada.", en: "A family hides in a cellar. The little they have could help your journey." },
                choices: [
                    { label: { pt: "Dividir uma poção", en: "Share a potion" }, effect: "heal" },
                    { label: { pt: "Trocar provisões por ouro", en: "Trade supplies for gold" }, effect: "gold" }
                ]
            },
            {
                title: { pt: "A carroça tombada", en: "The overturned cart" },
                description: { pt: "Uma carroça de mercadores bloqueia a rua. Há moedas espalhadas, mas algo se move sob os destroços.", en: "A merchant cart blocks the street. Coins are scattered around, but something moves beneath the wreckage." },
                choices: [
                    { label: { pt: "Recolher as moedas", en: "Gather the coins" }, effect: "gold" },
                    { label: { pt: "Erguer os destroços", en: "Lift the wreckage" }, effect: "combat" }
                ]
            },
            {
                title: { pt: "A torre do vigia", en: "The watchtower" },
                description: { pt: "Do alto da torre, é possível enxergar a rota dos invasores. Um mapa rasgado ainda marca um esconderijo.", en: "From the tower, you can see the invaders' route. A torn map still marks a hidden cache." },
                choices: [
                    { label: { pt: "Seguir o mapa (+ouro)", en: "Follow the map (+gold)" }, effect: "loot" },
                    { label: { pt: "Observar os invasores", en: "Watch the invaders" }, effect: "village-scout" }
                ]
            },
            {
                id: "animal-under-the-rubble",
                title: { pt: "Ruído sob os escombros", en: "A sound beneath the rubble" },
                description: { pt: "Um ruído ecoa entre as casas destruídas. Um animal está escondido sob uma viga caída e parece precisar de ajuda.", en: "A sound echoes among the ruined houses. An animal is hiding beneath a fallen beam and seems to need help." },
                choices: [
                    { label: { pt: "Atacar os escombros (+ouro)", en: "Strike the rubble (+gold)" }, effect: "animal-event-gold" },
                    { label: { pt: "Afastar a viga e ajudar (pet)", en: "Move the beam and help (pet)" }, effect: "animal-event-pet" }
                ]
            },
            {
                id: "abyssal-challenge-blue-village",
                title: { pt: "O desafio da fenda", en: "The Rift Challenge" },
                description: { pt: "As ruínas tremem e uma fenda negra se abre na praça. O Arauto do Abismo aparece entre os escombros; sua armadura parece impenetrável. Dizem que ele carrega equipamentos Épicos ou Lendários.", en: "The ruins shake as a black rift opens in the square. The Abyssal Herald rises from the rubble, its armor nearly impenetrable. It is said to carry Epic or Legendary gear." },
                choices: [
                    { label: { pt: "Enfrentar o Arauto (alto risco)", en: "Face the Herald (high risk)" }, effect: "abyssal-challenge" },
                    { label: { pt: "Recuar e se preparar", en: "Withdraw and prepare" }, effect: "abyssal-challenge-retreat" }
                ]
            }
        ]
    },
    {
        id: "gudran-castle",
        sceneIcon: "🏰",
        sceneImage: "images/regions/gudran-castle.webp",
        title: { pt: "Castelo de Gudran", en: "Gudran Castle" },
        description: {
            pt: "🏰 As muralhas de Gudran guardam criaturas antigas e cavaleiros que não aceitam intrusos.",
            en: "🏰 Gudran's walls conceal ancient creatures and knights who suffer no intruders."
        },
        objectives: {
            title: { pt: "Conquiste o castelo", en: "Conquer the castle" },
            description: { pt: "Conclua as tarefas para abrir caminho até a câmara do trono.", en: "Complete the tasks to reach the throne chamber." },
            tasks: [
                { id: "exploration", required: 10, title: { pt: "Conclua explorações sem interrupção.", en: "Complete uninterrupted explorations." } },
                { id: "monsters", required: 25, title: { pt: "Derrote monstros.", en: "Defeat monsters." } },
                { id: "story", title: { pt: "Resolva um evento ou aceite um contato da névoa", en: "Resolve a story event or accept a mist contact" } },
                { id: "combat", title: { pt: "Vença uma luta ou escape", en: "Win a fight or escape" } },
                { id: "chest", title: { pt: "Encontre e abra um baú", en: "Find and open a chest" } }
            ]
        },
        event: [
            {
                title: { pt: "O guardião de pedra", en: "The stone guardian" },
                description: { pt: "Uma criatura de pedra protege a passagem. Você pode recuperar as forças antes de avançar ou enfrentá-la agora.", en: "A stone creature guards the passage. You can recover your strength before moving on or face it now." },
                choices: [
                    { label: { pt: "Preparar-se (+HP e foco)", en: "Prepare (+HP and focus)" }, effect: "heal" },
                    { label: { pt: "Enfrentar a criatura", en: "Face the creature" }, effect: "combat" }
                ]
            },
            {
                title: { pt: "O arsenal esquecido", en: "The forgotten armory" },
                description: { pt: "Uma porta de ferro leva ao arsenal dos antigos guardas. O chão está coberto de armadilhas enferrujadas.", en: "An iron door leads to the old guards' armory. The floor is covered in rusty traps." },
                choices: [
                    { label: { pt: "Desarmar as armadilhas", en: "Disarm the traps" }, effect: "castle-cache" },
                    { label: { pt: "Forçar a porta", en: "Force the door" }, effect: "combat" }
                ]
            },
            {
                title: { pt: "O juramento dos guardas", en: "The guards' oath" },
                description: { pt: "As estátuas dos guardas despertam e oferecem uma última bênção a quem jurar proteger a floresta.", en: "The guards' statues awaken and offer one last blessing to anyone who vows to protect the forest." },
                choices: [
                    { label: { pt: "Fazer o juramento (+ATQ)", en: "Take the oath (+ATK)" }, effect: "power" },
                    { label: { pt: "Recusar o pacto", en: "Refuse the pact" }, effect: "gold" }
                ]
            },
            {
                id: "brutos-challenge",
                title: { pt: "O campeão do castelo", en: "The castle champion" },
                description: { pt: "Passos pesados ecoam no salão. Brutos, o Capitão de Gudran, bloqueia o caminho até o coração do castelo. Você pode enfrentá-lo ou recuar para se preparar.", en: "Heavy footsteps echo through the hall. Brutos, Gudran's Captain, blocks the path to the heart of the castle. You can face him or retreat and prepare." },
                choices: [
                    { label: { pt: "Enfrentar Brutos", en: "Face Brutos" }, effect: "brutos-challenge" },
                    { label: { pt: "Recuar e se preparar", en: "Retreat and prepare" }, effect: "brutos-challenge-retreat" }
                ]
            },
            {
                id: "animal-in-the-tower",
                title: { pt: "Um ruído na torre", en: "A sound in the tower" },
                description: { pt: "Um ruído vem das vigas acima do salão. Um animal se debate preso entre os estandartes rasgados.", en: "A sound comes from the rafters above the hall. An animal is tangled in the torn banners." },
                choices: [
                    { label: { pt: "Atacar as vigas (+ouro)", en: "Strike the rafters (+gold)" }, effect: "animal-event-gold" },
                    { label: { pt: "Soltar o animal (pet)", en: "Free the animal (pet)" }, effect: "animal-event-pet" }
                ]
            },
            {
                id: "abyssal-challenge-castle",
                title: { pt: "O último desafio", en: "The Final Challenge" },
                description: { pt: "No coração do castelo, a fenda se escancara e o Arauto do Abismo revela sua forma completa. É uma luta quase suicida, mas sua recompensa pode ser um equipamento Demoníaco ou Divino.", en: "At the heart of the castle, the rift tears open and the Abyssal Herald reveals its true form. The fight may be nearly suicidal, but its reward could be Demon or Divine gear." },
                choices: [
                    { label: { pt: "Desafiar o Arauto (risco extremo)", en: "Challenge the Herald (extreme risk)" }, effect: "abyssal-challenge" },
                    { label: { pt: "Recuar do desafio", en: "Withdraw from the challenge" }, effect: "abyssal-challenge-retreat" }
                ]
            }
        ]
    },
    {
        id: "gudran-throne",
        sceneIcon: "👑",
        sceneImage: "images/regions/gudran-throne.webp",
        title: { pt: "Câmara do Trono", en: "Throne Chamber" },
        description: {
            pt: "Além das portas do castelo, Gudran aguarda no coração de seu domínio. A névoa parece prender a respiração.",
            en: "Beyond the castle doors, Gudran waits at the heart of his domain. Even the mist seems to hold its breath."
        },
        objectives: {
            title: { pt: "Enfrente Gudran", en: "Face Gudran" },
            description: { pt: "Você chegou à etapa final da jornada.", en: "You have reached the final stage of the journey." },
            tasks: []
        },
        event: []
    },
    spiritWorldRegion
]);
