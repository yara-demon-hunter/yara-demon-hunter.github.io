import { CHARACTER_BASES } from '../../data_model/characters/index.js';
import { TREE_POINTS } from '../../data_model/tree.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { save } from '../core/save.js';
import { state } from '../core/state.js';
import { getKnifeRange } from '../systems/knives.js';
import { getHero, mod } from '../systems/modifiers.js';
import {
    getCritChance, getCritMultiplier, getDamageTakenRatio, getDashCharges, getDashCooldown, getKillHeal, getKnifeCooldown,
    getFrenzyDamageBonus, getFrenzyDuration, getKnifeDamage, getMagnetRadius, getSpellCooldown, getSpellDamage, getWarmthDamage, getWarmthHeal, getWarmthRadius
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

// --- O ESPECIAL (A FÚRIA) DO PERSONAGEM ---
// No topo da aba Build: o nome do especial do herói e o que ele faz, com os números dele (tempo, dano, alcance...), lidos do
// `fury` do personagem (data_model/characters/<id>.js) e da skill Fury. Uma linha por número; passar o dedo/mouse mostra o que é.
const times = (n) => `x${Number(n.toFixed(2))}`;
const secondsShort = (n) => `${Number(n.toFixed(2))}s`;
const row = (icon, name, note, value) => ({ icon, name, note, amount: () => 1, format: () => value });

export function getFuryGroup() {
    const hero = getHero();
    // Oath of the Wild: a Fúria não machuca (js/systems/fury.js, furyDamage): os multiplicadores de dano viram x0
    const dmg = (n) => (mod('furyNoDamage') > 0 ? 0 : n);
    const fury = CHARACTER_BASES[hero.id]?.player.fury;
    if (!fury) return null;
    const duration = row('⏳', 'Duration', 'How long the Fury lasts. The Fury skill makes it longer.', secondsShort(getFrenzyDuration() + (fury.extraSeconds ?? 0)));
    const rows = {
        swordRain: () => [
            duration,
            row('🗡️', 'Swords', 'A sword falls on a monster near you every few moments while the Fury lasts.', secondsShort(fury.stepSeconds)),
            row('💥', 'Sword Damage', 'Damage of each sword = your blade damage times this.', times(dmg(fury.damage))),
            row('📏', 'Sword Reach', 'How wide each impact is.', `${fury.radius}px`),
            row('⚔️', 'Giant Sword', 'At the very end, a giant sword falls where the most monsters are. Damage = your blade damage times this; it also pushes them back.', times(dmg(fury.giantDamage))),
            row('🌀', 'Giant Reach', 'How wide the giant sword hits.', `${fury.giantRadius}px`)
        ],
        bloodWaltz: () => [
            row('🩸', 'Cuts', 'Fast cuts in a row, each leaping to the nearest monster that is not the last one.', `${fury.cuts}`),
            row('💥', 'Cut Damage', 'Damage of each cut = your blade damage times this.', times(dmg(fury.cutDamage))),
            row('❤️', 'Heal', 'Share of each cut that returns as health.', `${dmg(1) ? Math.round(fury.healRatio * 100) : 0}%`),
            row('📏', 'Reach', 'How far he looks for the next monster.', `${fury.cutRange}px`),
            row('⚡', 'Speed', 'Time between one cut and the next.', secondsShort(fury.cutSeconds))
        ],
        stomp: () => [
            duration,
            row('🦶', 'Stomp', 'Time between one stomp and the next.', secondsShort(fury.stepSeconds)),
            row('💥', 'Stomp Damage', 'Damage of each stomp around him = your blade damage times this.', times(dmg(fury.damage))),
            row('📏', 'Stomp Reach', 'How far each stomp reaches.', `${fury.radius}px`),
            row('💫', 'Stun', 'Common monsters are stunned (bosses are not).', secondsShort(fury.stunSeconds)),
            row('🛡️', 'Damage Taken', 'He takes less damage while the Fury lasts.', `-${Math.round(fury.damageTakenCut * 100)}%`)
        ],
        forestGuardian: () => [
            duration,
            row('🛡️', 'Damage Taken', 'The leaf shield makes every hit on him softer.', `-${Math.round(fury.damageReduction * 100)}%`),
            row('🍃', 'Leaf Damage', 'Damage dealt to every monster in reach, again and again = your blade damage times this.', times(dmg(fury.damage))),
            row('⏱️', 'Pulse', 'Time between leaf hits.', secondsShort(fury.tickSeconds)),
            row('📏', 'Reach', 'How far the leaves reach around him.', `${fury.radius}px`),
            row('🐌', 'Slow', 'Monsters in the leaves move slower.', `-${Math.round(fury.slow * 100)}%`)
        ]
    }[fury.kind];
    if (!rows) return null;
    const summary = {
        swordRain: 'swords fall from the sky on the monsters around him, and a giant one ends it',
        bloodWaltz: 'a chain of fast cuts, leaping from monster to monster',
        stomp: 'stomps the ground around him, stunning monsters',
        forestGuardian: 'a leaf shield that hurts and slows the monsters around him'
    }[fury.kind];
    return { title: `Special Attack (Fury): ${fury.name.toUpperCase()}`, summary, rows: rows() };
}
