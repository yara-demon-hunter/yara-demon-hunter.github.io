- Test Spiritual World
```js

// Olho no Banner
hero.spiritWorldUnlocked = true;
updateUI();

// Pegar skills do olho
hero.spiritWorldUnlocked = true;
updateUI();
showPassiveReward('skill', SPIRIT_EYE_PASSIVE);
```
- Beat the game one time
```js
localStorage.setItem("yara-rpg-campaign-complete-v1", "true");
location.reload();
```
- Test the wandering vendor (start a journey first)
```js
// Evento completo (Ver as mercadorias / Seguir viagem)
pendingStoryEvent = YaraVendor.createEvent();
updateUI();

// Só a loja
hero.gold = 1000;
YaraVendor.open();

// Forçar o vendedor na próxima exploração (ignora uma vez a chance e o intervalo)
const r = Math.random; Math.random = () => 0.05;
for (let i = 0; i < 5; i++) { if (pendingStoryEvent) break; exploreForest(); }
Math.random = r;
```
- Test the Sanctuary / achievements
```js
YaraMeta.openSanctuary('achievements');   // achievements | bestiary | collection | powers | records
performSpiritEyeSurgery();                // conquista do Olho Espiritual
```
- Test the soul and pets (start a journey first)
```js
YaraSoul.shift(-40, { pt: 'Teste', en: 'Test' });   // positivo purifica, negativo escurece
hero.soul = 80; updateUI();                         // pula direto para um nível

// Equipa um pet
hero.equipment.pet = createEquipmentInstance(
    ITEM_DATA.equipment.find((item) => item.id === 'forest-wolf'),
    GAME_RULES.loot.equipmentRarities[4]
);
updateUI();
```
