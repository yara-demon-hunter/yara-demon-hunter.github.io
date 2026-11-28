import { evolutionStatRows, passiveStatRows } from '../../data_model/skill_stats.js';
import { CAMP } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS } from '../../data_model/powers.js';
import { RELIC_BY_ID, RELIC_NODES } from '../../data_model/relics.js';
import { TREE_BRANCHES, TREE_BY_ID, TREE_NODES } from '../../data_model/skill_tree/index.js';
import { save, persist } from '../core/save.js';
import { attributes, audio, passives, powers, state } from '../core/state.js';
import { prepareRaven } from '../render/raven.js';
import { preparePhoenix } from '../render/phoenix.js';
import { prepareShackle } from '../render/shackle.js';
import { showToast } from '../ui/banner.js';
import { updateHUD } from '../ui/hud.js';
import { getStatText } from '../ui/status.js';
import { getHero, mod, refreshModifiers } from './modifiers.js';
import { characterStat } from './stats.js';
import { celebrateEvolution } from './powers.js';
import { syncMaxHp, syncTorchMax } from './torch.js';

// --- ÁRVORES (regras) ---
// Duas árvores com as mesmas regras: skills (pontos, tela de status, data_model/skill_tree) e relíquias
// (ouro, acampamento, data_model/relics.js). O desenho fica em js/ui/tree.js. Um nó guarda o nível no
// próprio sistema que ele muda (atributo, poder, passiva) ou em state.tree (efeitos simples), então o
// resto do jogo continua lendo `attributes`, `powers` e `passives` como antes.
const NODE_BY_ID = { ...TREE_BY_ID, ...RELIC_BY_ID };
const DEFAULT_MAX = 5;

// Quem evolui: um poder, ou uma passiva (Shadow Clone). Os dois guardam `evolved`
function evolvable(node) {
    return powers[node.key] ?? passives[node.key];
}

export function getOwnedPowers() {
    return Object.values(powers).filter(p => p.lvl > 0);
}

export function getNodeLevel(node) {
    if (node.kind === 'passive' || node.kind === 'relic') return passives[node.key].lvl;
    if (node.kind === 'stat') return attributes[node.key].lvl - 1;
    if (node.kind === 'power') return powers[node.key].lvl;
    if (node.kind === 'evolve') return evolvable(node).evolved ? 1 : 0;
    return state.tree[node.id] ?? 0;
}

export function getNodeMax(node) {
    if (node.kind === 'passive' || node.kind === 'relic') return passives[node.key].maxLvl;
    if (node.kind === 'evolve') return 1;
    if (node.kind === 'stat') return Math.min(node.maxLvl ?? DEFAULT_MAX, attributes[node.key].maxLvl - 1);
    if (node.kind === 'power') return Math.min(node.maxLvl ?? DEFAULT_MAX, powers[node.key].maxLvl);
    return node.maxLvl ?? DEFAULT_MAX;
}

// Relíquias se pagam com ouro; o resto, com pontos de skill
export function getNodeCurrency(node) {
    return node.kind === 'relic' ? 'gold' : 'points';
}

// Relíquia: preço fixo (igual em todas as ondas, em múltiplos de CAMP.priceStep) para o jogador ter um número para mirar.
// CAMP.costGrowthPerHour só encarece se alguém voltar a ligá-lo (hoje 0).
export function getRelicPrice(node) {
    const raw = passives[node.key].cost * CAMP.costMultiplier * (1 + CAMP.costGrowthPerHour * (state.turn - 1));
    return Math.max(CAMP.priceStep, Math.round(raw / CAMP.priceStep) * CAMP.priceStep);
}

export function getNodeCost(node) {
    if (node.kind === 'relic') return getRelicPrice(node);
    return node.cost;       // o preço mora no próprio nó (data_model/skill_tree/nodes/<ramo>.js)
}

// Nome, ícone e descrição de um nó, vindos de onde ele mora
export function getNodeInfo(node) {
    if (node.kind === 'passive' || node.kind === 'relic') {
        const p = passives[node.key];
        return { name: p.name, icon: p.icon, desc: p.desc, warning: p.warning };
    }
    if (node.kind === 'stat') {
        const a = attributes[node.key];
        return { name: a.name, icon: a.icon, desc: a.desc };
    }
    if (node.kind === 'power') {
        const p = POWER_MODELS[node.key];
        return { name: p.name, icon: p.icon, desc: p.desc };
    }
    if (node.kind === 'evolve') {
        const evo = EVOLUTIONS[node.key];
        return { name: evo.name, icon: evo.icon, desc: evo.desc };
    }
    return { name: node.name, icon: node.icon, desc: node.desc };
}

// Texto do que o próximo nível faz
export function getNextText(node) {
    if (node.kind === 'passive' || node.kind === 'relic') return '';
    if (node.kind === 'power') return POWER_MODELS[node.key].upgrades[powers[node.key].lvl] ?? '';
    if (node.kind === 'evolve') return `${evolvable(node).name} evolves`;
    // levelText(mods, nível depois da compra): quem quiser mostra o total acumulado (1 nível +10%, 2 níveis +20%) em vez do valor de um nível
    if (node.kind === 'mod') return typeof node.levelText === 'function' ? node.levelText(node.mods, getNodeLevel(node) + 1) : node.levelText;
    const attr = attributes[node.key];
    const before = getStatText(node.key);
    attr.lvl++;
    const after = getStatText(node.key);
    attr.lvl--;
    const levelText = typeof node.levelText === 'function' ? node.levelText(node.mods) : node.levelText;
    const beforeLines = typeof before === 'string' ? before.split('\n') : [];
    const afterLines = typeof after === 'string' ? after.split('\n') : [];
    const change = beforeLines.length > 1 && afterLines.length === beforeLines.length
        ? beforeLines.map((line, index) => `${line} → ${afterLines[index]}`).join('\n')
        : `${before} → ${after}`;
    // Os outros atributos que o mesmo ponto sobe (`also`): "Slash Width: 52° → 75°"
    const also = (node.also ?? []).filter(k => attributes[k].lvl < attributes[k].maxLvl).map(k => {
        const a = attributes[k];
        const was = getStatText(k);
        a.lvl++;
        const now = getStatText(k);
        a.lvl--;
        return `${a.name}: ${was} → ${now}`;
    });
    const withAlso = [change, ...also].join('; ');
    return levelText ? `${withAlso}; ${levelText}` : withAlso;
}

// Linhas da prévia verde da árvore. Poderes guardam os números de cada nível em
// `levels`, então a tela mostra apenas os parâmetros que mudam no próximo nível.
const POWER_UPGRADE_FIELDS = {
    count: ['✨', 'Projectiles', n => String(n)],
    stacks: ['🧱', 'Stacks', n => String(n)],
    bounces: ['🔁', 'Bounces', n => String(n)],
    targets: ['🎯', 'Targets', n => String(n)],
    jumps: ['⚡', 'Targets', n => String(n)],
    spread: ['🕸️', 'Spreads', n => String(n)],
    max: ['🍄', 'Maximum', n => String(n)],
    pierces: ['🗡️', 'Pierces', n => n >= 99 ? 'All targets' : String(n)],
    damage: ['💥', 'Damage', n => `${Number(n.toFixed(2))}×`],
    dps: ['💥', 'Damage per Second', n => `${Number(n.toFixed(2))}×`],
    cooldown: ['⏳', 'Recharge', n => `${Number(n.toFixed(2))}s`],
    seconds: ['⌛', 'Duration', n => `${Number(n.toFixed(2))}s`],
    life: ['⌛', 'Duration', n => `${Number(n.toFixed(2))}s`],
    puddleSeconds: ['💧', 'Puddle Duration', n => `${Number(n.toFixed(2))}s`],
    lashSeconds: ['⚔️', 'Attack Interval', n => `${Number(n.toFixed(2))}s`],
    burnDps: ['🔥', 'Burn Damage per Second', n => `${Number(n.toFixed(2))}×`],
    burnSeconds: ['🔥', 'Burns For', n => `${Number(n.toFixed(2))}s`],
    biteSeconds: ['🐺', 'Bite Interval', n => `${Number(n.toFixed(2))}s`],
    stun: ['💫', 'Stun', n => `${Number(n.toFixed(2))}s`],
    radius: ['📏', 'Range', n => `${Math.round(n)}px`],
    reach: ['📏', 'Reach', n => `${Math.round(n)}px`],
    hp: ['❤️', 'Health', n => String(Math.round(n))],
    slow: ['🐌', 'Slow', n => `${Math.round(n * 100)}%`],
    chance: ['🎲', 'Chance', n => `${Math.round(n * 100)}%`],
    heal: ['❤️', 'Healing', n => n <= 1 ? `${Math.round(n * 100)}%` : String(Number(n.toFixed(1)))],
    pull: ['🌀', 'Pull', n => String(Math.round(n))],
    knockback: ['💨', 'Knockback', n => String(Math.round(n))],
    charges: ['🛡️', 'Charges', n => String(n)],
    range: ['📏', 'Range', n => `${Math.round(n)}px`],
    halfAngle: ['📐', 'Cone Width', n => `${Math.round(n * 2 * 180 / Math.PI)}°`],
    freeze: ['🧊', 'Freeze', n => `${Number(n.toFixed(2))}s`],
    runes: ['🔷', 'Runes', n => String(n)],
    duration: ['⌛', 'Duration', n => `${Number(n.toFixed(2))}s`],
    hpPerMagic: ['❤️', 'Health per Magic', n => String(Number(n.toFixed(1)))],
    burst: ['💥', 'Burst Radius', n => `${Math.round(n)}px`],
    hpRatio: ['❤️', 'Health', n => `${Math.round(n * 100)}% of yours`],
    grow: ['🌱', 'Growth', n => `${n.sapling}s sapling · ${n.adult}s grown`]
};

const POWER_FIELD_OVERRIDES = {
    bloodlust: {
        damage: ['⚔️', 'Blade Damage per Stack', n => `+${Math.round(n * 100)}%`],
        speed: ['⚡', 'Attack Speed per Stack', n => `+${Math.round(n * 100)}%`],
        seconds: ['⌛', 'Stack Duration', n => `${Number(n.toFixed(2))}s`]
    },
    emberTrail: {
        warmthDamage: ['♨️', 'Blade Damage in Warmth', n => `+${Math.round(n * 100)}%`]
    },
    deathMark: {
        splash: ['💥', 'Blast Radius', n => `${Math.round(n)}px`]
    },
    shadowBond: {
        area: ['🛡️', 'Guard Area', n => `${Math.round(n)}px`]
    },
    holyWater: {
        puddleDps: ['💧', 'Puddle Damage per Second', n => `${Number(n.toFixed(2))}×`]
    }
};

const POWER_MOD_FIELDS = {
    critChance: ['🎲', 'Crit Chance', n => `+${Math.round(n * 100)}%`],
    critDamage: ['💥', 'Crit Damage', n => `+${Math.round(n * 100)}%`],
    dashCooldown: ['⏱️', 'Dash Recharge', n => `-${Math.round(n * 100)}%`],
    dashCharges: ['💨', 'Dash Charges', n => `+${n}`]
};

const TREE_MOD_FIELDS = {
    furyCharge: ['⚡', 'Fury Charge', n => `+${Math.round(n * 100)}%`],
    damageTaken: ['🛡️', 'Damage Taken', n => `${Math.round(n * 100)}%`],
    provoke: ['📣', 'Monster Lure', n => `+${Math.round(n * 100)}%`],
    knifeDamage: ['🔪', 'Dagger Damage', n => `+${Math.round(n * 100)}%`],
    knifeRange: ['📏', 'Dagger Range', n => `+${Math.round(n * 100)}%`],
    knifeSpeed: ['💨', 'Dagger Speed', n => `+${Math.round(n * 100)}%`],
    knifeCooldown: ['🗡️', 'Dagger Recharge', n => `-${Math.round(n * 100)}%`],
    torchHp: ['🔥', 'Torch Health', n => `+${n}`],
    torchGuard: ['🪨', 'Torch Guard', n => `-${Math.round(n * 100)}%`],
    warmth: ['🌡️', 'Warmth Reach', n => `+${Math.round(n * 100)}%`],
    torchRegen: ['🕯️', 'Torch Regen', n => `+${Number(n.toFixed(2))}/s`],
    stillAttack: ['⛰️', 'Still Attack', n => `+${Math.round(n * 100)}%`],
    xp: ['📖', 'XP Bonus', n => `+${Math.round(n * 100)}%`],
    spellHaste: ['⏳', 'Spell Recharge', n => `-${Math.round(n * 100)}%`],
    spellDamage: ['🔮', 'Magic Damage', n => `+${Math.round(n * 100)}%`],
    demonDamage: ['⚖️', 'Light Damage vs Elites & Bosses', n => `+${Math.round(n * 100)}%`],
    hpRegen: ['❤️', 'Heal per Second', n => `+${Number(n.toFixed(2))}/s`],
    blessedKillHeal: ['💛', 'Heal per Blessed Kill', n => `+${Number(n.toFixed(1))}`],
    curseDamage: ['🔮', 'Curse Path Damage', n => `+${Math.round(n * 100)}%`],
    iceDamage: ['🧊', 'Ice Skill Damage', n => `+${Math.round(n * 100)}%`],
    oakGrowth: ['🌳', 'Oak Growth Speed', n => `+${Math.round(n * 100)}%`]
};

// times: quantos níveis somar (nós com showTotal mostram o TOTAL que o jogador terá depois da compra: 10%, 20%, 30%...)
function modifierRows(mods = {}, times = 1) {
    return Object.entries(mods).map(([field, value]) => {
        const [icon, name, format] = TREE_MOD_FIELDS[field] ?? ['⬆️', field, String];
        return { icon, name, value: format(value * times), up: true };
    });
}

// `up`: este número SOBE com a próxima compra (a tela o pinta de verde); os que ficam iguais aparecem em cor neutra. Sem nada comprado, tudo sobe.
export function getPowerUpgradeRows(key) {
    const model = POWER_MODELS[key];
    const level = powers[key]?.lvl ?? 0;
    const target = model?.levels?.[level];
    if (!model || !target) return [];
    const previous = level > 0 ? model.levels[level - 1] : {};
    // Keen Eye não tem valores por nível: cada compra soma estes dois bônus fixos (o total depois da compra).
    if (key === 'keenEye') {
        return Object.entries(model.mods).map(([field, value]) => {
            const [icon, name, format] = POWER_MOD_FIELDS[field];
            return { icon, name, value: format(value * (level + 1)), up: true };
        });
    }
    // Todos os números que a skill vai dar até o último nível (a união dos níveis). Verde (`up`): sobe com a próxima compra. Neutro: já tem e não muda agora.
    // Apagado (`later`): só aparece num nível mais à frente (ex.: +10% de vida no nível 1 e +5% de ataque só no nível 2): mostra o valor e em que nível chega.
    const fields = [...new Set(model.levels.flatMap(l => Object.keys(l)))].filter(f => f !== 'mods');
    const rows = [];
    for (const field of fields) {
        const [icon, name, format] = POWER_FIELD_OVERRIDES[key]?.[field] ?? POWER_UPGRADE_FIELDS[field] ?? ['⬆️', field, String];
        const has = (v) => v !== undefined && !(typeof v === 'number' && v === 0);
        if (has(target[field])) {
            rows.push({ icon, name, value: format(target[field]), up: JSON.stringify(target[field]) !== JSON.stringify(previous[field]) });
            continue;
        }
        const at = model.levels.findIndex((l, i) => i > level && has(l[field]));
        if (at >= 0) rows.push({ icon, name, value: format(model.levels[at][field]), later: at + 1 });
    }
    const modFields = [...new Set(model.levels.flatMap(l => Object.keys(l.mods ?? {})))];
    const previousMods = previous.mods ?? {};
    for (const field of modFields) {
        const [icon, name, format] = POWER_MOD_FIELDS[field] ?? ['⬆️', field, String];
        const now = target.mods?.[field];
        if (now !== undefined && now !== 0) { rows.push({ icon, name, value: format(now), up: now !== previousMods[field] }); continue; }
        const at = model.levels.findIndex((l, i) => i > level && l.mods?.[field]);
        if (at >= 0) rows.push({ icon, name, value: format(model.levels[at].mods[field]), later: at + 1 });
    }
    return rows;
}

// Os atributos que o mesmo ponto também sobe (`also` no nó): o valor que terão com o próximo nível
function alsoRows(node) {
    return (node.also ?? []).filter(k => attributes[k].lvl < attributes[k].maxLvl).map(k => {
        const a = attributes[k];
        a.lvl++;
        const value = getStatText(k);
        a.lvl--;
        return { icon: a.icon, name: a.name, value, up: true };
    });
}

// O que a skill dá NO TOTAL com o nível que o jogador tem agora (a referência de quem já completou a skill: sem isso as linhas verdes sumiam no nível máximo).
// Poder: os valores do nível atual; Keen Eye: o bônus fixo x níveis; nó de bônus: o total acumulado; atributo: o valor de agora. Passivas e evoluções não têm números (valem a descrição)
// DE QUE o dano em "×" é feito: a linha 4.2× sozinha não diz se é dano de feitiço (Magic), de lâmina, de adaga ou do fogo da tocha. O valor ganha a base: "4.2× spell".
// Padrão pelo ramo (Maldição, Natureza e Luz = feitiço; Lâmina e Sombra = lâmina); as exceções ficam aqui, por skill, e por linha onde a skill mistura (a fênix da tocha).
const DAMAGE_BASE_BY_BRANCH = { curse: 'spell', nature: 'spell', light: 'spell', blade: 'blade', shadow: 'blade', flame: 'spell' };
const DAMAGE_BASE_BY_SKILL = { emberTrail: 'blade', fireTornado: 'torch fire', shadowClone: 'blade' };
const DAMAGE_BASE_BY_ROW = { hearthPhoenix: { 'Breath Damage': 'torch fire' } };
const DAMAGE_ROW = /damage|per second|dps/i;
function tagDamage(node, rows) {
    return rows.map(r => {
        if (!r.value?.endsWith?.('×') || !DAMAGE_ROW.test(r.name) || /blade|spell|dagger|torch fire/i.test(r.name)) return r;
        const base = DAMAGE_BASE_BY_ROW[node.key]?.[r.name] ?? DAMAGE_BASE_BY_SKILL[node.key] ?? DAMAGE_BASE_BY_BRANCH[node.branch];
        return base ? { ...r, value: `${r.value} ${base}` } : r;
    });
}

export function getNodeTotalRows(node) {
    return tagDamage(node, totalRowsOf(node));
}
function totalRowsOf(node) {
    const level = getNodeLevel(node);
    if (level <= 0) return [];
    if (node.kind === 'passive') return passiveStatRows(node.key, level).map(r => ({ ...r, up: false }));       // passivas e evoluções: data_model/skill_stats.js
    if (node.kind === 'evolve') return evolutionStatRows(node.key, true).map(r => ({ ...r, up: false }));
    if (node.kind === 'power') {
        const model = POWER_MODELS[node.key];
        const key = node.key;
        if (key === 'keenEye') {
            return Object.entries(model.mods).map(([field, value]) => {
                const [icon, name, format] = POWER_MOD_FIELDS[field];
                return { icon, name, value: format(value * level) };
            });
        }
        const current = model?.levels?.[level - 1];
        if (!current) return [];
        const rows = Object.entries(current)
            .filter(([field, value]) => field !== 'mods' && !(typeof value === 'number' && value === 0))
            .map(([field, value]) => {
                const [icon, name, format] = POWER_FIELD_OVERRIDES[key]?.[field] ?? POWER_UPGRADE_FIELDS[field] ?? ['⬆️', field, String];
                return { icon, name, value: format(value) };
            });
        Object.entries(current.mods ?? {}).forEach(([field, value]) => {
            const [icon, name, format] = POWER_MOD_FIELDS[field] ?? ['⬆️', field, String];
            rows.push({ icon, name, value: format(value) });
        });
        return rows;
    }
    if (node.kind === 'mod') return modifierRows(node.mods, level);
    if (node.kind === 'stat') {
        const attr = attributes[node.key];
        return [{ icon: attr.icon, name: attr.name, value: getStatText(node.key), image: true }, ...modifierRows(node.mods, level)];
    }
    return [];
}

export function getNodeUpgradeRows(node) {
    return tagDamage(node, upgradeRowsOf(node));
}
function upgradeRowsOf(node) {
    if (node.kind === 'passive') return passiveStatRows(node.key, getNodeLevel(node));
    if (node.kind === 'evolve') return evolutionStatRows(node.key, getNodeLevel(node) > 0);
    if (node.kind === 'power') return getPowerUpgradeRows(node.key);
    if (node.kind === 'mod') return modifierRows(node.mods, node.showTotal ? getNodeLevel(node) + 1 : 1);
    if (node.kind !== 'stat') return [];
    const attr = attributes[node.key];
    attr.lvl++;
    const value = getStatText(node.key);
    attr.lvl--;
    return [
        { icon: attr.icon, name: attr.name, value, image: true, up: true },
        ...alsoRows(node),
        ...modifierRows(node.mods)
    ];
}

const isSingle = (node) => (node.kind === 'passive' && passives[node.key].maxLvl === 1) || node.kind === 'relic' || node.kind === 'evolve';

// Skill que só funciona com adaga (needs: 'knives') e o jogador não lança adaga (mod noKnives): o nó fica selado.
// Não se compra, e conta como cumprido para quem o pede (passe livre). Vale para o herói que não tem adaga (Captain
// Brutos) e para quem jurou o Oath of Slaughter; níveis já comprados ficam, só não sobem mais.
// Grupo exclusivo (exclusive em data_model/skill_tree): quem já aprendeu uma skill do grupo não pode aprender as outras
export function excludedBy(node) {
    if (!node.exclusive || getNodeLevel(node) > 0) return null;
    return TREE_NODES.find(other => other !== node && other.exclusive === node.exclusive && getNodeLevel(other) > 0) ?? null;
}

export function isRestricted(node) {
    if (excludedBy(node)) return true;
    // hero: skill de um herói só (Dark Roses): fica selada para os outros
    if (node.hero && getHero().id !== node.hero) return true;
    // notFor: skill que um herói não pode usar (o druida não usa Fireballs: as rosas dele não queimam)
    if (node.notFor?.includes(getHero().id)) return true;
    if (isSealedForHero(node)) return true;
    if (isMagicNode(node) && characterMagic() <= 0) return true;
    return node.needs === 'knives' && mod('noKnives') > 0;
}

// Ramos e skills que o personagem não pode seguir (sealedBranches / sealedSkills no arquivo dele: o Rowan não tem lâmina).
// A skill Fury (furySkill) fica fora do selo: é a Fúria, de todos, mesmo morando no ramo Blade.
function isSealedForHero(node) {
    const hero = getHero();
    if (hero.sealedSkills?.includes(node.id)) return true;
    return !!hero.sealedBranches?.includes(node.branch) && node.id !== 'furySkill';
}

// Skills que causam dano de MAGIA (dependem do `magicDamage` do personagem): os poderes, passivas e evoluções dos ramos de
// feitiço (Maldição, Natureza, Luz) e as da Chama que usam magia. Quem tem magicDamage 0 (Captain Brutos) as tem seladas.
const MAGIC_FLAME_KEYS = new Set(['torchBolts', 'chiliBreath', 'fireRing', 'emberTrail', 'phoenixPact', 'phoenixReborn', 'hearthPhoenix', 'fireTornado', 'fireballs']);
function isMagicNode(node) {
    if (node.kind === 'mod' || node.kind === 'stat' || node.oath) return false;
    if (node.branch === 'curse' || node.branch === 'nature' || node.branch === 'light') return true;
    return node.branch === 'flame' && MAGIC_FLAME_KEYS.has(node.key);
}
function characterMagic() {
    return characterStat('magicDamage');
}

// Por que está selado, para a tela: de quem é a escolha (o herói ou o Juramento)
export function getRestrictionText(node) {
    const rival = excludedBy(node);
    if (rival) return `Your blade is already enchanted with ${getNodeInfo(rival).name}: it holds only one enchantment.`;
    if (node?.hero && getHero().id !== node.hero) return `Only ${node.hero[0].toUpperCase()}${node.hero.slice(1)} can learn this skill.`;
    if (node?.notFor?.includes(getHero().id)) return `${getHero().name} cannot use this skill: his roses do not burn.`;
    const hero = getHero();
    if (hero.sealedBranches?.includes(node.branch) && node.branch !== 'blade' && node.id !== 'furySkill') return `${hero.name} cannot walk the ${TREE_BRANCHES[node.branch].path.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase())}.`;
    if (isSealedForHero(node)) return node.branch === 'blade' ? `${hero.name} carries no blade: the Blade Path is not for him.` : `${hero.name} cannot use this skill: his weapon does not cut.`;
    if (isMagicNode(node) && characterMagic() <= 0) return `${hero.name} has no magic: this skill is not for him.`;
    return (hero.mods?.noKnives ?? 0) > 0
        ? `${hero.name} fights without daggers: this skill is not for him.`
        : 'The Oath of Slaughter sealed your daggers: this skill can no longer be used.';
}

// Lista completa do que um nó pede, com o que o jogador já tem: { label, have, need, met }.
// Fica toda visível de uma vez: quem cumpriu os pedidos do nó anterior nunca esbarra num pedido novo escondido.
export function getRequirementChecks(node) {
    const checks = node.requires.map(({ id, lvl }) => {
        const parent = NODE_BY_ID[id];
        const name = getNodeInfo(parent).name;
        const have = getNodeLevel(parent);
        // Passe livre: pedir um nó selado (sem adaga) não segura ninguém
        // noFreePass (Fireballs): o pedido NÃO é dispensado quando o pai é selado para o herói (o Gudran não tem o Flaming Sword: sem ele, nada de Fireballs de graça)
        if (isRestricted(parent) && node.noFreePass) return { label: `${name} (sealed for this hero)`, have: 0, need: lvl, met: false, showCount: false };
        if (isRestricted(parent)) return { label: `${name} (sealed: free pass)`, have: lvl, need: lvl, met: true, showCount: false, skipped: true };
        return { label: isSingle(parent) ? name : `${name} Lv. ${lvl}`, have: Math.min(have, lvl), need: lvl, met: have >= lvl, showCount: lvl > 1 && !isSingle(parent) };
    });
    if (node.oath) {
        const free = !state.oath || state.oath === node.key;
        checks.push({ label: 'One oath per night', have: free ? 1 : 0, need: 1, met: free, showCount: false });
    }
    return checks;
}

// Estado de um nó, para desenho e compra
export function getNodeState(node) {
    const level = getNodeLevel(node);
    const max = getNodeMax(node);
    const cost = getNodeCost(node);
    const checks = getRequirementChecks(node);
    // O herói que já começa com o poder abre o nó sem passar pelos requisitos
    const reached = level > 0 || checks.every(c => c.met);
    const restricted = isRestricted(node);
    const maxed = level >= max;
    const open = reached && !maxed && !restricted;
    const currency = getNodeCurrency(node);
    const balance = currency === 'gold' ? state.coins : state.skillPoints;
    // Relíquias só se compram no acampamento
    const atCamp = node.kind !== 'relic' || state.gameState === 'CAMP';
    return { level, max, cost, currency, checks, reached: reached || restricted, maxed, open, restricted, canBuy: open && atCamp && balance >= cost };
}

// Um Juramento acabou de abrir: é a decisão da noite, não pode passar despercebida
function announceOath() {
    if (state.oath || state.oathAnnounced) return;
    const open = TREE_NODES.find(node => node.oath && getNodeState(node).reached);
    if (!open) return;
    state.oathAnnounced = true;
    showToast('⬢', 'An oath can be sworn', `${getNodeInfo(open).name}. Only one per night.`);
}

// Nós que dá para comprar agora
export function getBuyableNodes() {
    return TREE_NODES.filter(node => getNodeState(node).canBuy);
}

// Algum nó que o jogador pode comprar agora? Faz o medalhão pulsar
export function hasBuyableNode() {
    if (state.skillPoints <= 0) return false;
    return TREE_NODES.some(node => getNodeState(node).canBuy);
}

export function buyNode(id) {
    const node = NODE_BY_ID[id];
    const st = node ? getNodeState(node) : null;
    if (!st?.canBuy) return false;
    if (document.body.classList.contains('is-map-open')) return false;       // enquanto o mapa está na tela (animação ou aberto) não se compra skill

    if (st.currency === 'gold') state.coins -= st.cost;
    else state.skillPoints -= st.cost;

    if (node.kind === 'passive' || node.kind === 'relic') {
        passives[node.key].lvl++;
        // O sprite da fênix leva um instante para montar: melhor agora, com a tela de skills aberta, do que no meio da luta
        if (node.key === 'phoenixPact') preparePhoenix();
        if (node.key === 'shadowRaven') prepareRaven();
        if (node.key === 'shadowShackle') prepareShackle();
        state.revives += passives[node.key].mods?.revives ?? 0;
        state.skillPoints += passives[node.key].grantPoints ?? 0;
        if (node.oath) {
            state.oath = node.key;
            state.oathCeremony = node.key;
        }
    } else if (node.kind === 'stat') {
        attributes[node.key].lvl++;
        for (const k of node.also ?? []) if (attributes[k].lvl < attributes[k].maxLvl) attributes[k].lvl++;       // `also`: o mesmo ponto sobe outros atributos (Blade Rhythm: largura; Heavy Reach: empurrão)
    } else if (node.kind === 'power') powers[node.key].lvl++;
    else if (node.kind === 'mod') state.tree[node.id] = st.level + 1;
    else {
        evolvable(node).evolved = true;
        state.run.evolutions++;
        save.stats.evolutions++;
        persist();
        celebrateEvolution();
    }

    refreshModifiers();
    syncMaxHp();
    syncTorchMax();
    announceOath();
    updateHUD();
    if (st.currency === 'gold') audio.playPurchase();
    else audio.playCardPick(node.kind === 'evolve' ? 'evolution' : node.kind === 'power' || node.kind === 'passive' ? 'rare' : 'common');
    return true;
}

// Zera a árvore de skills e devolve os pontos gastos (usado ao CONTINUAR uma noite para montar outra build). Só a árvore de skills:
// relíquias (ouro) e o que o herói já traz de graça (startPower) ficam como estão. Devolve quantos pontos voltaram.
// Pontos de skill já gastos na árvore (o que o respec devolve): nível x preço de cada nó, menos o poder de graça do herói e os pontos que as próprias skills deram
export function getSpentSkillPoints() {
    const hero = getHero();
    let spent = 0;
    for (const node of TREE_NODES) {
        let lvl = getNodeLevel(node);
        if (node.kind === 'power' && node.key === hero.startPower) lvl = Math.max(0, lvl - 1);      // o poder de graça do herói não custou nada
        if (lvl <= 0) continue;
        spent += lvl * getNodeCost(node);
        if (node.kind === 'passive') spent -= lvl * (passives[node.key].grantPoints ?? 0);          // pontos que a própria skill deu voltam a não existir
    }
    return Math.max(0, spent);
}

export function respecSkills() {
    const hero = getHero();
    const refund = getSpentSkillPoints();
    let goldRefund = 0;
    // Relíquias (árvore do acampamento, comprada com ouro): o ouro volta e elas somem, para montar outra build
    for (const node of RELIC_NODES) {
        const lvl = passives[node.key].lvl;
        if (lvl <= 0) continue;
        goldRefund += lvl * getNodeCost(node);
        state.revives -= (passives[node.key].mods?.revives ?? 0) * lvl;
        passives[node.key].lvl = 0;
    }
    for (const node of TREE_NODES) {
        if (node.kind === 'passive') {
            state.revives -= (passives[node.key].mods?.revives ?? 0) * passives[node.key].lvl;
            passives[node.key].lvl = 0;
            passives[node.key].evolved = false;
        } else if (node.kind === 'stat') {
            attributes[node.key].lvl = 1;
            for (const k of node.also ?? []) attributes[k].lvl = 1;
        }
        else if (node.kind === 'power') {
            powers[node.key].lvl = node.key === hero.startPower ? 1 : 0;
            powers[node.key].evolved = false;
        } else if (node.kind === 'evolve') evolvable(node).evolved = false;
        else if (node.kind === 'mod') state.tree[node.id] = 0;
    }
    state.tree = {};
    state.oath = null;
    state.oathAnnounced = false;
    state.oathCeremony = null;
    state.revives = Math.max(0, state.revives);
    state.skillPoints += Math.max(0, refund);
    state.coins += goldRefund;
    refreshModifiers();
    syncMaxHp();
    syncTorchMax();
    return Math.max(0, refund);
}
