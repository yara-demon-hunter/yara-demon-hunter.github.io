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