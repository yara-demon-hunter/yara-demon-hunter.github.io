import {
    BLUE_TORCH, CONVERSION, EXECUTIONER, FAN_OF_KNIVES, FINAL_BLOW, FIREBALLS, FIRE_TORNADO, FLAME_BLADE, HEARTH_PHOENIX, LEVELS, MIRROR_WARD, PARRY,
    PASSIVE_SKILL_MODELS, PHOENIX_PACT, PHOENIX_REBORN, RAVEN_DECOY, ROSE_PETALS, ROSE_WHIP, SHADOW_CLONE, SHADOW_SHACKLE, SHATTER_STRIKE, SMOKE_BOMB, THORN_BURST,
    THORN_ROSES, WAR_CRY, WHIRLWIND
} from './passives.js';
import { EVOLUTIONS } from './powers.js';

// --- OS NÚMEROS DE CADA SKILL (a prévia da árvore: js/ui/tree.js, js/systems/tree.js) ---
// Os poderes (data_model/powers.js) têm tabelas por nível e a árvore as lê direto. As PASSIVAS e as EVOLUÇÕES não: os números delas estavam só dentro do texto
// da descrição. Aqui eles viram linhas { icon, name, value } para a mesma lista (verde: o que sobe agora; neutro: o que já se tem; apagado: só chega em outro nível).
const n2 = (v) => String(Number(v.toFixed(2)));
const sec = (v) => `${n2(v)}s`;
const mult = (v) => `${n2(v)}×`;
const pct = (v) => `${v < 0 ? '−' : ''}${Number((Math.abs(v) * 100).toFixed(1))}%`;
const plus = (v) => `${v < 0 ? '−' : '+'}${Number((Math.abs(v) * 100).toFixed(1))}%`;
const px = (v) => `${Math.round(v)}px`;
const row = (icon, name, value) => ({ icon, name, value });

// --- PASSIVAS COM NÍVEIS (LEVELS em passives.js: três valores por campo) ---
const LEVEL_FIELDS = {
    cooldownSeconds: ['⏳', 'Recharge', sec],
    range: ['📏', 'Range', px],
    damage: ['💥', 'Damage', mult],
    markSeconds: ['🎯', 'Mark Duration', sec],
    markDamage: ['🎯', 'Marked Monsters Take', plus],
    immuneSeconds: ['🛡️', 'Untouchable For', sec],
    feathers: ['🪶', 'Feathers', String],
    targets: ['🎯', 'Targets', String],
    quills: ['🪶', 'Quills per Target', String],
    holdSeconds: ['⛓️', 'Holds For', sec],
    lashDamage: ['💥', 'Lash Damage', mult],
    thornDps: ['🌹', 'Thorn Damage per Second', mult],
    durationSeconds: ['⌛', 'Duration', sec],
    radius: ['📏', 'Range', px]
};
// O que não muda de nível para nível (valor fixo da skill)
const LEVEL_EXTRAS = {
    roseWhip: () => [row('📏', 'Reach', px(ROSE_WHIP.range)), row('👑', 'Hold on Bosses', pct(ROSE_WHIP.bossRatio))],
    rosePetals: () => [row('🐌', 'Slow', pct(ROSE_PETALS.slow))]
};

// level: nível ATUAL da skill (0 = ainda não tem). Devolve as linhas do PRÓXIMO nível (up: o que muda) ou, no máximo, as do último (sem up)
function leveledRows(key, level) {
    const table = LEVELS[key];
    const max = PASSIVE_SKILL_MODELS[key].maxLvl;
    const idx = Math.min(level, max - 1);
    const rows = Object.entries(table).map(([field, values]) => {
        const [icon, name, format] = LEVEL_FIELDS[field] ?? ['⬆️', field, String];
        return { ...row(icon, name, format(values[idx])), up: level < max && (level === 0 || values[idx] !== values[idx - 1]) };
    });
    for (const extra of LEVEL_EXTRAS[key]?.() ?? []) rows.push({ ...extra, up: level === 0 });
    return rows;
}

// --- BÔNUS (mods) dos juramentos e afins ---
const MOD_LABELS = {
    spellDamage: ['🔮', 'Magic Damage', plus], spellHaste: ['⏳', 'Spell Recharge', (v) => `−${pct(v)}`], bladeDamage: ['⚔️', 'Blade Damage', plus],
    attackSpeed: ['⚡', 'Attack Speed', plus], furyCharge: ['⚡', 'Fury Charge', plus], killHeal: ['💛', 'Heal per Kill', (v) => `+${n2(v)}`],
    provoke: ['📣', 'Monster Lure', plus], hpRegen: ['❤️', 'Heal per Second', (v) => `+${n2(v)}/s`], maxHp: ['❤️', 'Max Health', plus],
    rootSeconds: ['🌿', 'Root Time', plus], torchHp: ['🔥', 'Torch Health', (v) => `+${v}`], torchGuard: ['🪨', 'Torch Damage Taken', (v) => `−${pct(v)}`],
    dashCharges: ['💨', 'Dash Charges', (v) => `+${v}`], dashCooldown: ['⏱️', 'Dash Recharge', (v) => `−${pct(v)}`], moveSpeed: ['👟', 'Move Speed', plus],
    critChance: ['🎲', 'Crit Chance', plus], knifeDamage: ['🔪', 'Dagger Damage', plus], warmth: ['🌡️', 'Warmth Reach', plus],
    warmthBurn: ['♨️', 'Warmth Burn', pct], natureDamage: ['🌿', 'Nature Skill Damage', plus],
    furyNoDamage: ['⚡', 'Fury Damage', () => 'None'], noDash: ['💨', 'Dash', () => 'Disabled'], noWarmthHeal: ['🔥', 'Warmth Healing', () => 'Disabled'], noKnives: ['🔪', 'Daggers', () => 'Disabled']
};
const BAD_MODS = new Set(['furyNoDamage', 'noDash', 'noWarmthHeal', 'noKnives']);      // o que o juramento TIRA (Disabled / None): a linha aparece em vermelho
const modRows = (mods) => Object.entries(mods).map(([field, v]) => {
    const [icon, name, format] = MOD_LABELS[field] ?? ['⬆️', field, String];
    return { ...row(icon, name, format(v)), bad: BAD_MODS.has(field) || v < 0 };       // o preço do juramento (tirar algo, ou um número negativo: −30% de velocidade) aparece em vermelho
});

// --- PASSIVAS DE NÍVEL ÚNICO ---
const PASSIVE_ROWS = {
    shadowWhirl: () => [row('🌀', 'Whirl Radius', `${mult(WHIRLWIND.radiusRatio)} reach`)],
    finalBlow: () => [row('☄️', '3rd Strike Damage', mult(FINAL_BLOW.damageMultiplier))],
    executioner: () => [row('🌙', 'Blood Crescents', String(EXECUTIONER.crescents))],
    shatterStrike: () => [row('⏳', 'Recharge', sec(SHATTER_STRIKE.cooldownSeconds)), row('💥', 'Hit Monster Takes', mult(SHATTER_STRIKE.hitDamage)),
        row('💥', 'Thrown Monster Takes', mult(SHATTER_STRIKE.selfDamage)), row('🧱', 'Wall Crash Damage', mult(SHATTER_STRIKE.wallDamage)), row('💫', 'Daze', sec(SHATTER_STRIKE.dazeSeconds))],
    parry: () => [row('⏳', 'Recharge', sec(PARRY.cooldown)), row('💫', 'Stun', sec(PARRY.stun)), row('💥', 'Riposte Damage', mult(PARRY.damage)), row('📏', 'Neighbour Stun Range', px(PARRY.radius)),
        row('🛡️', 'Untouchable For', sec(PARRY.invulnerableSeconds))],
    warCry: () => [row('👥', 'Monsters Needed', String(WAR_CRY.monsters)), row('⏳', 'Recharge', sec(WAR_CRY.cooldownSeconds)), row('📏', 'Range', px(WAR_CRY.radius)),
        row('💫', 'Stun', sec(WAR_CRY.stunSeconds)), row('💥', 'Roar Damage', mult(WAR_CRY.damage)), row('⚔️', 'Blade Damage After', `${plus(WAR_CRY.bladeBonus)} for ${sec(WAR_CRY.bonusSeconds)}`)],
    ravenDecoy: () => [row('⌛', 'Lasts', sec(RAVEN_DECOY.seconds)), row('📣', 'Lure Range', px(RAVEN_DECOY.lures)), row('📏', 'Blast Range', px(RAVEN_DECOY.radius)),
        row('💥', 'Blast Damage', mult(RAVEN_DECOY.damage)), row('🪶', 'Feathers', String(RAVEN_DECOY.feathers))],
    fanOfKnives: () => [row('🔱', 'Daggers', String(FAN_OF_KNIVES.count)), row('📐', 'Spread', `${FAN_OF_KNIVES.spreadDegrees}°`)],
    mirrorWard: () => [row('⏳', 'Recharge', sec(MIRROR_WARD.cooldownSeconds)), row('💥', 'Returned Damage', mult(MIRROR_WARD.damageMultiplier)), row('📏', 'Catch Range', px(MIRROR_WARD.catchRadius))],
    shadowClone: () => [row('⏳', 'Returns After', sec(SHADOW_CLONE.respawnSeconds)), row('❤️', 'Health', `${pct(SHADOW_CLONE.hpRatio)} of yours`),
        row('⚔️', 'Damage', `${pct(SHADOW_CLONE.damageMultiplier)} of your blade`), row('📏', 'Guard Area', px(SHADOW_CLONE.areaRadius))],
    shadowShackle: () => [row('⏳', 'Recharge', sec(SHADOW_SHACKLE.cooldownSeconds)), row('⛓️', 'Holds For', sec(SHADOW_SHACKLE.holdSeconds)),
        row('👑', 'Holds a Boss For', sec(SHADOW_SHACKLE.holdSeconds * SHADOW_SHACKLE.bossRatio))],
    smokeBomb: () => [row('⌛', 'Cloud Lasts', sec(SMOKE_BOMB.seconds)), row('📏', 'Cloud Range', px(SMOKE_BOMB.radius)), row('🐌', 'Slow', pct(SMOKE_BOMB.slow)),
        row('🎲', 'Crit Chance Inside', plus(SMOKE_BOMB.critChance))],
    flameBlade: () => [row('🔥', 'Burn per Second', `${pct(FLAME_BLADE.burnRatio)} of the hit`), row('⌛', 'Burns For', sec(FLAME_BLADE.burnSeconds)), row('📏', 'Fire Spreads', px(FLAME_BLADE.spreadRadius))],
    fireballs: () => [row('📏', 'Burst Range', px(FIREBALLS.splashRadius)), row('💥', 'Burst Damage', `${pct(FIREBALLS.splashRatio)} of dagger`), row('🔥', 'Burn per Second', `${pct(FIREBALLS.burnRatio)} of dagger`),
        row('⌛', 'Burns For', sec(FIREBALLS.burnSeconds)), row('🌋', 'Ground Fire', sec(FIREBALLS.patchSeconds)), row('🔥', 'Full Charge', sec(FIREBALLS.charge.seconds))],
    fireTornado: () => [row('⏳', 'Recharge', sec(FIRE_TORNADO.cooldownSeconds)), row('⌛', 'Lasts', sec(FIRE_TORNADO.durationSeconds)), row('📏', 'Range', px(FIRE_TORNADO.radius)),
        row('💥', 'Damage per Pulse', mult(FIRE_TORNADO.damage)), row('🔥', 'Burns For', sec(FIRE_TORNADO.burnSeconds))],
    hearthPhoenix: () => [row('⏳', 'Fireball Every', sec(HEARTH_PHOENIX.cooldownSeconds)), row('💥', 'Fireball Damage', mult(HEARTH_PHOENIX.boltDamage)), row('📏', 'Range', px(HEARTH_PHOENIX.range)),
        row('🔥', 'Breath Every', sec(HEARTH_PHOENIX.breathCooldown)), row('⌛', 'Breath Lasts', sec(HEARTH_PHOENIX.breathSeconds)), row('💥', 'Breath Damage', mult(HEARTH_PHOENIX.breathDamage))],
    blueTorch: () => [row('💡', 'Light Reach', plus(BLUE_TORCH.light)), row('🌡️', 'Warmth Reach', plus(BLUE_TORCH.warmth)), row('🔥', 'Torch Fire Damage', plus(BLUE_TORCH.fireDamage)),
        row('🐌', 'Slow Inside Warmth', pct(BLUE_TORCH.chill)), row('🧊', 'Slowed Take (fire hits)', plus(BLUE_TORCH.brittle))],
    phoenixPact: () => [row('⏳', 'Fireball Every', sec(PHOENIX_PACT.cooldownSeconds)), row('💥', 'Fireball Damage', mult(PHOENIX_PACT.boltDamage)), row('📏', 'Range', px(PHOENIX_PACT.range)),
        row('💥', 'Burst Range', px(PHOENIX_PACT.splashRadius)), row('🔥', 'Burn per Second', `${pct(PHOENIX_PACT.burnRatio)} of the hit`)],
    phoenixReborn: () => [row('❤️', 'Rise With', pct(PHOENIX_REBORN.healRatio)), row('🛡️', 'Untouchable For', sec(PHOENIX_REBORN.invulnerableSeconds)),
        row('📏', 'Fire Pulse Range', px(PHOENIX_REBORN.radius)), row('💥', 'Fire Pulse Damage', mult(PHOENIX_REBORN.damage))],
    thornBurst: () => [row('🌵', 'Cactlings at Once', String(THORN_BURST.maxCacti)), row('✨', 'Thorns', String(THORN_BURST.needles)), row('💥', 'Thorn Damage', mult(THORN_BURST.needleDamage)),
        row('🎯', 'Max Thorns per Monster', String(THORN_BURST.maxPerMonster))],
    darkRoses: () => [...modRows(PASSIVE_SKILL_MODELS.darkRoses.mods), row('🖤', 'Black Rose Mark', sec(THORN_ROSES.markSeconds)), row('🌹', 'Thorn Roses Last', sec(THORN_ROSES.patchSeconds)),
        row('💥', 'Thorn Roses Damage', `${pct(THORN_ROSES.damage)} of dagger`)],
    blessedBlade: () => [row('✨', 'Magic Added to Each Hit', pct(PASSIVE_SKILL_MODELS.blessedBlade.magicRatio))],
    conversion: () => [row('⏳', 'Recharge', sec(CONVERSION.cooldownSeconds)), row('📏', 'Range', px(CONVERSION.range)), row('👥', 'Converts at Once', String(CONVERSION.maxAllies))],
    oathSlaughter: () => modRows(PASSIVE_SKILL_MODELS.oathSlaughter.mods),
    oathWhispers: () => [...modRows(PASSIVE_SKILL_MODELS.oathWhispers.mods), row('👥', 'A Shadow Every', `${SHADOW_CLONE.whispers.killsPerShadow} kills (max ${SHADOW_CLONE.whispers.maxShadows})`)],
    oathHearth: () => modRows(PASSIVE_SKILL_MODELS.oathHearth.mods),
    oathRuin: () => modRows(PASSIVE_SKILL_MODELS.oathRuin.mods),
    oathWild: () => modRows(PASSIVE_SKILL_MODELS.oathWild.mods),
    oathFaith: () => {
        const S = PASSIVE_SKILL_MODELS.oathFaith.shields;
        return [row('🛡️', 'Shields of Light', String(S.count)), row('💥', 'Shield Damage', `${pct(S.damage)} of magic`), ...modRows(PASSIVE_SKILL_MODELS.oathFaith.mods)];
    }
};

// Linhas de uma passiva: key e o nível atual. Devolve [] se não há números para mostrar. `up` = verde (o que sobe com a próxima compra)
export function passiveStatRows(key, level) {
    if (LEVELS[key]) return leveledRows(key, level);
    const make = PASSIVE_ROWS[key];
    return make ? make().map(r => ({ ...r, up: level === 0 })) : [];
}

// --- EVOLUÇÕES ---
// Os números de EVOLUTIONS[key].levels (os que a evolução TROCA) e os outros campos numéricos soltos dela (ex.: iceDamage do Permafrost). O texto do nome e o formato vêm do nome do campo.
const LABEL_FIX = { Dps: 'Damage per Second', Hp: 'Health', Seconds: 'Time', Every: 'Interval' };
const EXACT_LABELS = {
    seconds: 'Duration', life: 'Duration', cooldown: 'Recharge', max: 'Maximum', hp: 'Health', dps: 'Damage per Second', maxCacti: 'Cactlings at Once', needles: 'Thorns',
    needleDamage: 'Thorn Damage', slowSeconds: 'Slow Duration', lashSeconds: 'Lash Interval', biteSeconds: 'Bite Interval', budSeconds: 'Bud Ripens In', hpRatio: 'Health (of yours)',
    healPerSecond: 'Heal per Second', pulseSeconds: 'Pulse Every', travelSeconds: 'Energy Travel Time', holdSeconds: 'Whip Holds For', beamEvery: 'Beam Every',
    beamPulseSeconds: 'Beam Pulse Interval', beamCastSeconds: 'Beam Charge Time', boltEvery: 'Orb Every', boltDamage: 'Orb Damage', boltRange: 'Orb Range', boltSpeed: 'Orb Speed',
    tolls: 'Tolls', torchHeal: 'Torch Heal (of max)', iceSlow: 'Slow on Ice', iceDamage: 'Ice Skill Damage'
};
function humanize(field) {
    if (EXACT_LABELS[field]) return EXACT_LABELS[field];
    const words = field.replace(/([A-Z])/g, ' $1').split(' ').map(w => (w[0] ?? '').toUpperCase() + w.slice(1));
    return words.map(w => LABEL_FIX[w] ?? w).join(' ');
}
function formatByName(field, v) {
    const f = field.toLowerCase();
    if (/slow$|chance|ratio|bonus|multiplier|icedamage|heal$|heroheal/.test(f) && Math.abs(v) <= 5) return /bonus|icedamage|multiplier/.test(f) ? plus(v) : pct(v);
    if (/seconds|every|duration|cooldown|life|stun/.test(f)) return sec(v);
    if (/damage|dps/.test(f)) return mult(v);
    if (/speed/.test(f) && Math.abs(v) < 5) return plus(v);
    if (/radius|range|reach|length|width|pull|speed/.test(f)) return /speed/.test(f) ? `${Math.round(v)}` : px(v);
    return n2(v);
}
// Evoluções com campos que o nome sozinho não explica
const EVO_OVERRIDES = {
    bloodlust: { stacks: ['Stacks', String], damage: ['Blade Damage per Stack', plus], speed: ['Attack Speed per Stack', plus], seconds: ['Stack Duration', sec] },
    holyGround: { healPerSecond: ['Heal per Second', n2], demonBonus: ['Damage vs Elites & Bosses', plus] },
    churchBell: { blessedMultiplier: ['Blessed Monsters Take', mult], torchHeal: ['Torch Heal per Toll', (v) => `+${n2(v)}`] },
    smite: { judgment: ['Banishes Monsters Below', (v) => `${pct(v)} health`] },
    guardianAngel: { bossStunRatio: ['Boss Stun (of normal)', pct] }
};
const NOT_STATS = new Set(['name', 'icon', 'desc', 'levels']);
export function evolutionStatRows(key, owned) {
    const evo = EVOLUTIONS[key];
    if (!evo) return [];
    const rows = [];
    const add = (field, v) => {
        if (typeof v !== 'number' || v === 0) return;
        const over = EVO_OVERRIDES[key]?.[field];
        rows.push({ icon: '✨', name: over ? over[0] : humanize(field), value: over ? over[1](v) : formatByName(field, v), up: !owned });
    };
    for (const [field, v] of Object.entries(evo.levels ?? {})) add(field, v);
    for (const field of Object.keys(evo)) if (!NOT_STATS.has(field)) add(field, evo[field]);
    return rows;
}
