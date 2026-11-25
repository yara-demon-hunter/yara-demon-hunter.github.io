import { HEROES } from '../../data_model/heroes.js';
import { AFFINITY_BONUS, TREE_BY_ID, TREE_NODES } from '../../data_model/skill_tree/index.js';
import { DARKNESS } from '../../data_model/night.js';
import { POWER_BOOST, getPowerLevel } from '../../data_model/powers.js';
import { altarMods } from '../../data_model/embers.js';
import { save } from '../core/save.js';
import { attributes, passives, powers, state } from '../core/state.js';

// --- MODIFICADORES ---
// Herói, relíquias, poderes, presságios e Escuridão mudam o jogo pelo mesmo caminho: cada um
// declara `mods` em data_model e tudo é somado aqui. As fórmulas leem o total com mod('chave').
// Chaves (0.1 = +10%, exceto onde indicado):
//   herói: damage, maxHp, maxHpFlat (pontos), moveSpeed, attackSpeed, critChance, critDamage, damageTaken,
//          gold, xp, magnet, luck, knifeDamage, knifeCooldown, furyCharge, furyDuration (segundos),
//          dashCharges (cargas), dashCooldown, lowHpDamage, thorns (x dano da lâmina), warmth, warmthDamage (também vem do Ember Steps),
//          bladeDamage, spellDamage, spellHaste, stillAttack (parado), coinHaste (segundos por moeda), killHeal (pontos), lifeSteal (fração do dano causado que volta como vida),
//          provoke (distância em que os monstros largam a tocha), noWarmthHeal e noKnives (travas),
//          killGold (ouro extra por morte), knifeRange e knifeSpeed (bônus de alcance e velocidade da adaga; o alcance base é do personagem),
//          axeQuake (liga o Axe Quake no lugar da adaga: js/systems/quake.js)
//          dashDistance (alcance do dash), furyPower (dano extra enquanto a Fúria dura; vem do Altar)
//          oakGrowth (o carvalho cresce mais rápido), wolfPower (dano e vida dos lobos do Nature)
//   tocha: torchHp (pontos), torchRegen (pontos por segundo), torchGuard, warmthBurn (x dano de feitiço por segundo)
//   pontos de skill: levelPoints (por nível, fração acumula), chestPoints (por baú)
//   vida extra: revives
//   natureDamage (dano extra de todas as skills do Nature Path, state.dmgSource === 'nature' em damage.js: Dark Roses, do Rowan)
//   demonDamage (dano extra contra elites e chefes, SÓ das skills do Light Path: Judgment; state.dmgSource === 'light' em damage.js)
//   monstros: enemyHp, enemyDamage, enemySpeed, spawnRate; itens: pickupRate
const totals = {};

function addAll(mods, times = 1) {
    if (!mods) return;
    for (const key in mods) totals[key] = (totals[key] || 0) + mods[key] * times;
}

export function mod(key) {
    return totals[key] || 0;
}

export function getHero() {
    const key = save.hero;
    const hero = HEROES[key];
    // Herói guardado (shelved) ou ainda bloqueado volta para o Demon Hunter
    const owned = hero && (hero.free || save.unlockedHeroes.includes(key));
    return owned && !hero.shelved ? hero : HEROES.hunter;
}

// Recalcula tudo. Chamar sempre que algo que dá modificadores mudar.
export function refreshModifiers() {
    for (const key in totals) delete totals[key];

    addAll(getHero().mods);
    addAll(altarMods(save));
    // Afinidade do herói com um ramo (affinity no arquivo dele): os poderes desse ramo batem AFFINITY_BONUS mais forte
    // (data_model/powers.js > POWER_BOOST); no Blade Path, que é o da lâmina, o golpe da lâmina também
    for (const key in POWER_BOOST) delete POWER_BOOST[key];
    const affinity = getHero().affinity;
    if (affinity && getHero().affinityMods) addAll(getHero().affinityMods);
    else if (affinity) {
        TREE_NODES.forEach(n => { if (n.branch === affinity && (n.kind === 'power' || n.kind === 'evolve')) POWER_BOOST[n.key] = AFFINITY_BONUS; });
        if (affinity === 'blade') addAll({ bladeDamage: AFFINITY_BONUS });
    }
    // Ramos extras com o mesmo +5% (extraAffinities no arquivo do herói; o Kuro: Shadow e Blade)
    for (const branch of getHero().extraAffinities ?? []) {
        TREE_NODES.forEach(n => { if (n.branch === branch && (n.kind === 'power' || n.kind === 'evolve')) POWER_BOOST[n.key] = AFFINITY_BONUS; });
        if (branch === 'blade') addAll({ bladeDamage: AFFINITY_BONUS });
    }
    Object.values(passives).forEach(p => { if (p.lvl > 0) addAll(p.mods); });
    Object.entries(state.tree).forEach(([id, lvl]) => addAll(TREE_BY_ID[id]?.mods, lvl));
    TREE_NODES.forEach(n => { if (n.kind === 'stat' && n.mods) addAll(n.mods, attributes[n.key].lvl - 1); });
    Object.values(powers).forEach(p => {
        if (p.lvl <= 0) return;
        addAll(p.mods, p.lvl);
        addAll(getPowerLevel(p)?.mods);
    });
    addAll(state.omen?.mods);

    const dark = save.darkness - 1;
    addAll({
        enemyHp: DARKNESS.enemyHpPerLevel,
        enemyDamage: DARKNESS.enemyDamagePerLevel,
        enemySpeed: DARKNESS.enemySpeedPerLevel
    }, dark);
}
