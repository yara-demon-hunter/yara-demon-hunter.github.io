import { HEROES } from '../../data_model/heroes.js';
import { META_UPGRADES } from '../../data_model/meta.js';
import { TREE_BY_ID } from '../../data_model/tree.js';
import { DARKNESS } from '../../data_model/night.js';
import { getPowerLevel } from '../../data_model/powers.js';
import { save } from '../core/save.js';
import { passives, powers, state } from '../core/state.js';

// --- MODIFICADORES ---
// Herói, Hearth, relíquias, poderes, presságios e Escuridão mudam o jogo pelo mesmo caminho: cada um
// declara `mods` em data_model e tudo é somado aqui. As fórmulas leem o total com mod('chave').
// Chaves (0.1 = +10%, exceto onde indicado):
//   herói: damage, maxHp, maxHpFlat (pontos), moveSpeed, attackSpeed, critChance, critDamage, damageTaken,
//          gold, xp, embers, magnet, luck, knifeDamage, knifeCooldown, furyCharge, furyDuration (segundos),
//          dashCharges (cargas), dashCooldown, lowHpDamage, thorns (x dano da lâmina), warmth
//   tocha: torchHp (pontos), torchRegen (pontos por segundo)
//   pontos de skill: startPoints (no início da noite), levelPoints (por nível, fração acumula), chestPoints (por baú)
//   vida extra: revives
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
    return HEROES[save.hero] ?? HEROES.hunter;
}

// Recalcula tudo. Chamar sempre que algo que dá modificadores mudar.
export function refreshModifiers() {
    for (const key in totals) delete totals[key];

    addAll(getHero().mods);
    Object.entries(save.upgrades).forEach(([key, lvl]) => addAll(META_UPGRADES[key]?.mods, lvl));
    Object.values(passives).forEach(p => { if (p.lvl > 0) addAll(p.mods); });
    Object.entries(state.tree).forEach(([id, lvl]) => addAll(TREE_BY_ID[id]?.mods, lvl));
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
        enemySpeed: DARKNESS.enemySpeedPerLevel,
        embers: DARKNESS.embersPerLevel
    }, dark);
}
