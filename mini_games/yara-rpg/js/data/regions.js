window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.regions = Object.freeze([
    {
        id: "dark-forest",
        title: { pt: "Floresta Sombria", en: "Dark Forest" },
        description: {
            pt: "🌲 O sino tocou tarde demais. A névoa esconde feras famintas e segredos antigos.",
            en: "🌲 The bell rang too late. The mist hides hungry beasts and ancient secrets."
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
            }
        ]
    },
    {
        id: "ashen-portal",
        title: { pt: "O Portal das Cinzas", en: "The Ashen Portal" },
        description: {
            pt: "🌀 Um portal pulsa entre as árvores. Do outro lado, algo respira junto com a névoa.",
            en: "🌀 A portal pulses between the trees. Something on the other side breathes with the mist."
        },
        event: [
            {
                title: { pt: "O portal enfraquecido", en: "The faltering portal" },
                description: { pt: "As cinzas formam runas ao redor do portal. Você pode selar uma fenda ou arrancar um fragmento de poder.", en: "Ash forms runes around the portal. You can seal a crack or take a shard of power." },
                choices: [
                    { label: { pt: "Selar a fenda (+HP)", en: "Seal the crack (+HP)" }, effect: "heal" },
                    { label: { pt: "Tomar o fragmento (+ATQ)", en: "Take the shard (+ATK)" }, effect: "power" }
                ]
            },
            {
                title: { pt: "A ponte de cinzas", en: "The ash bridge" },
                description: { pt: "Uma ponte instável atravessa o abismo do portal. Uma passagem rápida promete tesouros, mas as pedras estão cedendo.", en: "A crumbling bridge spans the portal's abyss. A shortcut promises treasure, but the stones are giving way." },
                choices: [
                    { label: { pt: "Correr pela ponte", en: "Rush across the bridge" }, effect: "portal-treasure" },
                    { label: { pt: "Descer com cuidado", en: "Climb down carefully" }, effect: "heal" }
                ]
            },
            {
                title: { pt: "Ecos do outro lado", en: "Echoes from beyond" },
                description: { pt: "Uma voz familiar chama do portal. Você pode responder ao chamado ou cobrir as runas com cinzas.", en: "A familiar voice calls from the portal. You can answer it or smother the runes with ash." },
                choices: [
                    { label: { pt: "Responder ao chamado", en: "Answer the call" }, effect: "combat" },
                    { label: { pt: "Apagar as runas (+ouro)", en: "Erase the runes (+gold)" }, effect: "gold" }
                ]
            }
        ]
    },
    {
        id: "ruined-village",
        title: { pt: "Vilarejo em Ruínas", en: "The Ruined Village" },
        description: {
            pt: "🔥 O vilarejo foi invadido. Portas quebradas e marcas de batalha anunciam que os invasores ainda estão por perto.",
            en: "🔥 The village has been invaded. Broken doors and battle scars warn that the invaders are still nearby."
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
            }
        ]
    },
    {
        id: "gudran-castle",
        title: { pt: "Castelo de Gudran", en: "Gudran Castle" },
        description: {
            pt: "🏰 As muralhas de Gudran guardam criaturas antigas e cavaleiros que não aceitam intrusos.",
            en: "🏰 Gudran's walls conceal ancient creatures and knights who suffer no intruders."
        },
        event: [
            {
                title: { pt: "O sino sob as muralhas", en: "The bell beneath the walls" },
                description: { pt: "O sino está preso às raízes de uma criatura de pedra. O último confronto se aproxima.", en: "The bell is bound to the roots of a stone creature. The final clash is near." },
                choices: [
                    { label: { pt: "Preparar-se (+HP e foco)", en: "Prepare (+HP and focus)" }, effect: "heal" },
                    { label: { pt: "Desafiar o Guardião", en: "Challenge the Keeper" }, effect: "boss" }
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
            }
        ]
    }
]);
