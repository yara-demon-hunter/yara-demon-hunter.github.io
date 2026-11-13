import { TREE_POINTS } from '../../data_model/tree.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { save } from '../core/save.js';
import { state } from '../core/state.js';
import { getKnifeRange } from '../systems/knives.js';
import { mod } from '../systems/modifiers.js';
import {
    getCritChance, getCritMultiplier, getDamageTakenRatio, getDashCharges, getDashCooldown, getKillHeal, getKnifeCooldown,
    getKnifeDamage, getMagnetRadius, getSpellCooldown, getSpellDamage, getWarmthDamage, getWarmthHeal, getWarmthRadius
} from '../systems/stats.js';

// --- FICHA DE STATS ---
// Tudo o que se acumula na noite, já somado (herói, árvore, relíquias, poderes e presságio), na aba Build.
// Os valores são os de agora: Fúria ou Bloodlust ativos entram na conta, como no combate.
// { attr: chave }: atributo da árvore, com nível e arte própria (js/ui/status.js).
// As demais: amount() é o número (zero = ainda não tem) e format() é como ele aparece.
const whole = (n) => `${Math.round(n)}`;
const plain = (n) => `${Math.round(n * 100)}%`;
const bonus = (n) => `${n > 0 ? '+' : ''}${Math.round(n * 100)}%`;
const reduction = (n) => `-${Math.round(n * 100)}%`;
const seconds = (n) => `${n.toFixed(2)}s`;
const perSecond = (n) => `${n.toFixed(1)}/s`;
const pixels = (n) => `${Math.round(n)}px`;
const extra = (n) => `+${n}`;

// Atalho para as linhas que só mostram um modificador
const modRow = (key, icon, name, note, format = bonus) => ({ icon, name, note, amount: () => mod(key), format });

export const STAT_GROUPS = [
    {
        title: 'ATTACK',
        rows: [
            { attr: 'damage' },
            { icon: '🔮', name: 'Magic Damage', note: 'What each spell starts from, before the power that casts it. Its numbers show in blue.', amount: getSpellDamage, format: whole, tone: 'spell' },
            { icon: '🔪', name: 'Dagger Damage', note: 'One dagger, before any charge.', amount: getKnifeDamage, format: whole },
            { attr: 'atkSpeed' },
            { icon: '⏳', name: 'Spell Recharge', note: 'How much faster spells return.', amount: () => 1 - getSpellCooldown(1), format: reduction },
            { icon: '🗡️', name: 'Dagger Recharge', note: 'Time between daggers.', amount: getKnifeCooldown, format: seconds },
            { icon: '🎲', name: 'Crit Chance', note: 'How often a hit lands as a critical.', amount: getCritChance, format: plain },
            { icon: '💥', name: 'Crit Damage', note: 'How much a critical multiplies the hit.', amount: getCritMultiplier, format: (n) => `x${n.toFixed(2)}` },
            { attr: 'radius' },
            { attr: 'slashArc' },
            { attr: 'knockback' },
            { icon: '📏', name: 'Dagger Range', note: 'How far a dagger flies.', amount: getKnifeRange, format: pixels },
            modRow('knifeSpeed', '💨', 'Dagger Speed', 'Daggers fly faster.'),
            { attr: 'frenzyNova' },
            modRow('furyCharge', '🔋', 'Fury Charge', 'The Fury bar fills faster.'),
            modRow('lowHpDamage', '🩸', 'Low HP Damage', 'Extra damage while under 35% health.'),
            { icon: '♨️', name: 'Warmth Damage', note: 'Extra damage inside the warmth of the torch.', amount: getWarmthDamage, format: bonus },
            modRow('stillAttack', '⛰️', 'Still Attack', 'Faster blade while you stand still.'),
            modRow('thorns', '🌵', 'Thorns', 'Monsters that touch you take this share of your damage.', plain)
        ]
    },
    {
        title: 'DEFENSE',
        rows: [
            { attr: 'playerHp' },
            { icon: '🛡️', name: 'Damage Taken', note: 'Every hit on you lands this much softer.', amount: () => 1 - getDamageTakenRatio(), format: reduction },
            { icon: '🍖', name: 'Heal per Kill', note: 'Health you recover with every kill.', amount: getKillHeal, format: (n) => `+${n.toFixed(1)}` },
            { icon: '📿', name: 'Revives Left', note: 'Times you can still rise when you fall.', amount: () => state.revives + (state.secondWind && save.darkness <= CORE_MODEL.secondWind.maxDarkness ? 1 : 0), format: whole },
            { attr: 'moveSpeed' },
            { icon: '💨', name: 'Dash Charges', note: 'Dashes you can hold at once.', amount: getDashCharges, format: whole },
            { icon: '⏱️', name: 'Dash Recharge', note: 'Time to get a dash back.', amount: getDashCooldown, format: seconds },
            modRow('provoke', '📣', 'Monster Lure', 'Monsters leave the torch to chase you from farther away.')
        ]
    },
    {
        title: 'TORCH',
        rows: [
            { icon: '🔥', name: 'Torch Health', note: 'How much the torch can take before it goes out.', amount: () => state.coreHpMax, format: whole },
            modRow('torchRegen', '🕯️', 'Torch Regen', 'Health the torch recovers on its own.', perSecond),
            modRow('torchGuard', '🧱', 'Torch Guard', 'Every hit on the torch lands this much softer.', reduction),
            { icon: '🌡️', name: 'Warmth Reach', note: 'How far the warmth of the torch reaches.', amount: getWarmthRadius, format: pixels },
            { icon: '❤️‍🔥', name: 'Warmth Heal', note: 'Health you recover inside the warmth.', amount: getWarmthHeal, format: perSecond },
            modRow('warmthBurn', '🌋', 'Warmth Burn', 'Monsters inside the warmth burn for this share of your magic damage.', (n) => `${Math.round(n * 100)}%/s`)
        ]
    },
    {
        title: 'FORTUNE',
        rows: [
            modRow('gold', '🪙', 'Gold Bonus', 'More gold from every kill.'),
            modRow('killGold', '💰', 'Gold per Kill', 'Extra gold from every kill, before the bonus.', extra),
            modRow('xp', '📖', 'XP Bonus', 'More XP from every kill.'),
            modRow('pickupRate', '🎁', 'Item Drops', 'Monsters drop items more often.'),
            { icon: '🧲', name: 'Pickup Range', note: 'How close coins must be to fly to you.', amount: getMagnetRadius, format: pixels },
            modRow('chestPoints', '🗝️', 'Chest Points', 'Extra skill points from every chest.', extra),
            { icon: '⚡', name: 'Points per Level', note: 'Skill points per level, on average.', amount: () => TREE_POINTS.perLevel + mod('levelPoints'), format: (n) => n.toFixed(1) },
            modRow('coinHaste', '🏃', 'Coin Rush', 'Every coin shaves this off your dagger and dash recharge.', (n) => `-${n.toFixed(2)}s`)
        ]
    }
];
