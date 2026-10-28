window.YaraRpgData = window.YaraRpgData || {};

// Conquistas do Santuário. A avaliação fica em ../systems/meta.js (CONDITIONS); cada conquista aponta para um tipo
// de condição e um valor. Tipos: totalKills, totalBosses, totalInterrupts, totalSpared, totalChests, wins,
// bestLevel, bestRegion, monsterDefeated (id/nome EN do monstro), runFlawless, distinctItems,
// itemRarityIndex (posição em equipmentRarities), gold, runMinutes, totalMinutes e spiritEye.
window.YaraRpgData.achievements = Object.freeze([
    { id: "first-blood", icon: "🩸", name: { pt: "Primeiro sangue", en: "First blood" }, description: { pt: "Derrote seu primeiro monstro.", en: "Defeat your first monster." }, condition: { type: "totalKills", value: 1 } },
    { id: "slayer-50", icon: "🗡️", name: { pt: "Caçador veterano", en: "Veteran hunter" }, description: { pt: "Derrote 50 monstros no total.", en: "Defeat 50 monsters in total." }, condition: { type: "totalKills", value: 50 } },
    { id: "slayer-200", icon: "☠️", name: { pt: "Ceifador da névoa", en: "Mist reaper" }, description: { pt: "Derrote 200 monstros no total.", en: "Defeat 200 monsters in total." }, condition: { type: "totalKills", value: 200 } },
    { id: "boss-slayer", icon: "👹", name: { pt: "Quebra-chefes", en: "Boss breaker" }, description: { pt: "Derrote um chefe.", en: "Defeat a boss." }, condition: { type: "totalBosses", value: 1 } },
    { id: "dragon", icon: "🐉", name: { pt: "Matador de dragões", en: "Dragon slayer" }, description: { pt: "Derrote o Dragão da Névoa.", en: "Defeat the Mist Dragon." }, condition: { type: "monsterDefeated", value: "mist-dragon" } },
    { id: "flawless-5", icon: "🛡️", name: { pt: "Intocável", en: "Untouchable" }, description: { pt: "Vença 5 lutas seguidas sem perder HP.", en: "Win 5 fights in a row without losing HP." }, condition: { type: "runFlawless", value: 5 } },
    { id: "interrupt-10", icon: "⚡", name: { pt: "Leitor de golpes", en: "Strike reader" }, description: { pt: "Interrompa 10 golpes devastadores no total.", en: "Interrupt 10 devastating strikes in total." }, condition: { type: "totalInterrupts", value: 10 } },
    { id: "merciful-5", icon: "🕊️", name: { pt: "Coração piedoso", en: "Merciful heart" }, description: { pt: "Poupe 5 monstros no total.", en: "Spare 5 monsters in total." }, condition: { type: "totalSpared", value: 5 } },
    { id: "chests-10", icon: "🧰", name: { pt: "Saqueador de baús", en: "Chest looter" }, description: { pt: "Abra 10 baús no total.", en: "Open 10 chests in total." }, condition: { type: "totalChests", value: 10 } },
    { id: "collector-15", icon: "🎒", name: { pt: "Colecionador", en: "Collector" }, description: { pt: "Encontre 15 equipamentos diferentes.", en: "Find 15 different pieces of gear." }, condition: { type: "distinctItems", value: 15 } },
    { id: "legendary", icon: "🔥", name: { pt: "Brilho lendário", en: "Legendary glow" }, description: { pt: "Encontre um equipamento Lendário ou superior.", en: "Find a Legendary or better item." }, condition: { type: "itemRarityIndex", value: 5 } },
    { id: "divine", icon: "👑", name: { pt: "Toque divino", en: "Divine touch" }, description: { pt: "Encontre um equipamento Divino.", en: "Find a Divine item." }, condition: { type: "itemRarityIndex", value: 7 } },
    { id: "level-10", icon: "📈", name: { pt: "Veterano", en: "Veteran" }, description: { pt: "Chegue ao nível 10.", en: "Reach level 10." }, condition: { type: "bestLevel", value: 10 } },
    { id: "region-3", icon: "🏘️", name: { pt: "Além do rio", en: "Beyond the river" }, description: { pt: "Alcance a terceira região.", en: "Reach the third region." }, condition: { type: "bestRegion", value: 3 } },
    { id: "region-5", icon: "🏰", name: { pt: "Às portas do trono", en: "At the throne's gate" }, description: { pt: "Alcance a quinta região.", en: "Reach the fifth region." }, condition: { type: "bestRegion", value: 5 } },
    { id: "rich", icon: "💰", name: { pt: "Mão de ouro", en: "Golden hand" }, description: { pt: "Tenha 500 de ouro ao mesmo tempo.", en: "Hold 500 gold at once." }, condition: { type: "gold", value: 500 } },
    { id: "survive-15", icon: "⏳", name: { pt: "Sobrevivente", en: "Survivor" }, description: { pt: "Sobreviva 15 minutos em uma única jornada.", en: "Survive 15 minutes in a single journey." }, condition: { type: "runMinutes", value: 15 } },
    { id: "survive-30", icon: "⌛", name: { pt: "Inabalável", en: "Unshakable" }, description: { pt: "Sobreviva 30 minutos em uma única jornada.", en: "Survive 30 minutes in a single journey." }, condition: { type: "runMinutes", value: 30 } },
    { id: "playtime-1h", icon: "🕐", name: { pt: "Preso na névoa", en: "Lost in the mist" }, description: { pt: "Jogue 1 hora no total.", en: "Play for 1 hour in total." }, condition: { type: "totalMinutes", value: 60 } },
    { id: "playtime-5h", icon: "🕰️", name: { pt: "Alma da floresta", en: "Soul of the forest" }, description: { pt: "Jogue 5 horas no total.", en: "Play for 5 hours in total." }, condition: { type: "totalMinutes", value: 300 } },
    { id: "spirit-eye", icon: "👁️", name: { pt: "Olho que tudo vê", en: "The all-seeing eye" }, description: { pt: "Tenha o Olho Espiritual implantado.", en: "Have the Spirit Eye implanted." }, condition: { type: "spiritEye" } },
    { id: "victory", icon: "🔔", name: { pt: "O sino toca", en: "The bell tolls" }, description: { pt: "Vença a campanha.", en: "Win the campaign." }, condition: { type: "wins", value: 1 } },
]);
