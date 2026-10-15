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
            },
            {
                id: "animal-by-the-portal",
                title: { pt: "Ruído perto do portal", en: "A sound near the portal" },
                description: { pt: "Um ruído vem de trás de uma pedra coberta de cinzas. Um animal pequeno parece preso entre as raízes, perto do portal.", en: "A sound comes from behind an ash-covered stone. A small animal seems trapped among the roots near the portal." },
                choices: [
                    { label: { pt: "Atacar o esconderijo (+ouro)", en: "Strike the hiding place (+gold)" }, effect: "animal-event-gold" },
                    { label: { pt: "Verificar e ajudar (pet)", en: "Investigate and help (pet)" }, effect: "animal-event-pet" }
                ]
            },
            {
                id: "abyssal-challenge-portal",
                title: { pt: "O desafio da fenda", en: "The Rift Challenge" },
                description: { pt: "Uma ruptura pulsa ao lado do portal. O Arauto do Abismo atravessa a fenda e desafia você. Só caçadores preparados devem aceitar; a criatura guarda equipamentos Épicos ou Lendários.", en: "A rupture pulses beside the portal. The Abyssal Herald steps through and challenges you. Only prepared hunters should accept; the creature guards Epic or Legendary gear." },
                choices: [
                    { label: { pt: "Enfrentar o Arauto (alto risco)", en: "Face the Herald (high risk)" }, effect: "abyssal-challenge" },
                    { label: { pt: "Recuar e se preparar", en: "Withdraw and prepare" }, effect: "abyssal-challenge-retreat" }
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
                id: "abyssal-challenge-village",
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
        title: { pt: "Castelo de Gudran", en: "Gudran Castle" },
        description: {
            pt: "🏰 As muralhas de Gudran guardam criaturas antigas e cavaleiros que não aceitam intrusos.",
            en: "🏰 Gudran's walls conceal ancient creatures and knights who suffer no intruders."
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
    }
]);
