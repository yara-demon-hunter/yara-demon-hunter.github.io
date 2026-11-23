// --- ÍCONES (game-icons.net, CC BY 3.0) ---
// Troféus, façanhas, melhorias do Altar e relíquias usam ícones de uma biblioteca só, no lugar de emojis (que mudam de aparência em
// cada aparelho e se repetiam). Arquivos em images/icons (128 px, já coloridos por categoria); créditos em images/icons/CREDITS.txt.
// Chave: id da conquista, 'altar_<melhoria>' ou a chave da relíquia. Item sem ícone aqui usa o emoji.
const dir = 'images/icons';
export const ICON_IMAGES = Object.fromEntries([
    'stars3all', 'beast_SKELETON', 'beast_SKELETON_CRAWLER', 'beast_BAT', 'beast_SHADOW_WOLF', 'beast_VAMPIRE',
    'beast_WITCH', 'beast_MOTH', 'beast_BLOATER', 'beast_ZOMBIE_WOLF', 'beast_WRAITH', 'beast_HEADLESS_KNIGHT',
    'beast_BONE_COLOSSUS', 'beast_GOLEM', 'beast_TREANT', 'beast_NECROMANCER', 'firstNight', 'hour2',
    'hour3', 'hour4', 'kills300', 'kills1000', 'demon', 'evolve',
    'chests10', 'hour6', 'elites10', 'stars5x3', 'stars5all', 'kills2000',
    'countess', 'dawn', 'brutos', 'darkness3', 'sworn1', 'sworn2',
    'sworn3', 'sworn4', 'sworn5', 'darkness8', 'multi3',
    'dodge5', 'multi4', 'flawless1', 'streak30', 'multi6', 'streak40',
    'dodge25', 'flawless5', 'streak100', 'multi10', 'altar_vitality', 'altar_swiftness',
    'altar_might', 'altar_arcane', 'altar_reach', 'altar_furyPower', 'altar_longDash', 'altar_insight',
    'altar_torch', 'altar_torchCall', 'greedyIdol', 'luckyCoin', 'witchEye', 'huntersNotes',
    'merchantSeal', 'gildedSignet', 'coinPurse', 'hunterLore', 'treasureSense', 'lightFingers',
    'pickpocket', 'coinRush', 'thiefNose', 'masterThief', 'emberFlask', 'warmCloak',
    'ironHeart', 'secondPrayer', 'hearthstone', 'oldScars', 'lastPrayer', 'stoneHeart',
    'emberLantern', 'phantomVeil', 'berserkDraught', 'thornCrown', 'furyStone', 'smolderingRage',
    'whetstone', 'hunterMark', 'boneCharm', 'wornBoots', 'sharpenedEdge', 'shadeQuiver',
    'occultTome', 'wizardsWand', 'owlsWisdom', 'acornPouch', 'mossyStone', 'sporeJar',
    'wolfTotem', 'dewVial', 'sunpetal', 'lotusBloom', 'autumnCharm'
].map(key => [key, `${dir}/${key}.webp`]));
