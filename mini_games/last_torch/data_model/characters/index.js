// --- PERSONAGENS: um arquivo por personagem ---
// Cada personagem jogável vive num arquivo desta pasta (hunter.js, azael.js, brutos.js) com TUDO dele: nome e textos,
// vida, velocidade, dash, bônus, números como boss e rival. Este arquivo só lê esses arquivos e monta o que o resto do
// jogo consome (CHARACTER_BASES, HERO_ENTRIES, RIVAL_OF, HERO_ORDER): ninguém precisa editar aqui para mexer num número.
//
// COMO CRIAR UM PERSONAGEM NOVO
// 1. Copie brutos.js para <id>.js, troque o id e preencha. Coloque na lista CHARACTER_LIST abaixo.
// 2. Visual: na biblioteca de personagens, mini_games/_library/characters/<id>/ (<id>_visual.js com cores e medidas e o
//    boneco <id>25d.js), depois o sync (passos em "Como criar um herói novo" no README do Last Torch).
// 3. Conquista que o libera: uma linha com `hero: '<id>'` em data_model/sanctuary.js.
// 4. Se ele for rival de alguém: campo `rival` do outro personagem e, se ele virar boss, BOSS_MODELS em bosses.js.
//
// COMO LER OS NÚMEROS (`stats` de cada personagem)
// Todo personagem lista TODOS os stats abaixo, com valor explícito (0 ou false = não tem): nada fica escondido, e é só
// abrir o arquivo dele para ver e mudar qualquer um. Stat faltando ou com nome errado dá erro ao abrir o jogo.
// Quase tudo é um valor ABSOLUTO do próprio personagem (vida, velocidade, dano de cada golpe, segundos entre golpes,
// alcances em px); só os bônus que somam a outras fontes (dano da lâmina, da adaga, calor...) são % (+20 = 20% mais,
// -5 = 5% menos). NÃO existe valor base compartilhado: cada personagem traz o seu, e o jogo lê dele. O que a árvore de
// skills e as relíquias dão (mais vida por nível, mais alcance por nível...) soma por cima, igual para todos.
import { AZAEL } from './azael.js';
import { BRUTOS } from './brutos.js';
import { HUNTER } from './hunter.js';
import { ROWAN } from './rowan.js';

// Todos os personagens. A posição na tela de escolha vem do `order` de cada um, não desta lista.
export const CHARACTER_LIST = [HUNTER, ROWAN, AZAEL, BRUTOS];

// Os stats que todo personagem tem de declarar. kind: 'absolute' (valor do personagem, o jogo lê direto dele),
// 'percent' (bônus em %: 20 vira 0.2 no modificador `mod`) ou 'flag' (true/false vira modificador 1/0).
// Não existe valor base compartilhado: cada personagem traz o seu. Skills, relíquias e níveis da árvore somam por cima.
const STAT_SCHEMA = {
    maxHp: { kind: 'absolute' },
    speed: { kind: 'absolute' },
    dashDistance: { kind: 'absolute' },
    dashSeconds: { kind: 'absolute' },
    attackDamage: { kind: 'absolute' },
    attackCooldown: { kind: 'absolute' },
    bladeRange: { kind: 'absolute' },
    knifeRange: { kind: 'absolute' },
    damageTaken: { kind: 'percent', mod: 'damageTaken' },
    warmth: { kind: 'percent', mod: 'warmth' },
    lifeSteal: { kind: 'percent', mod: 'lifeSteal' },
    bladeDamage: { kind: 'percent', mod: 'bladeDamage' },
    stillAttack: { kind: 'percent', mod: 'stillAttack' },
    knifeDamage: { kind: 'percent', mod: 'knifeDamage' },
    noKnives: { kind: 'flag', mod: 'noKnives' }
};

const round = (n) => Math.round(n * 1e6) / 1e6;

// stats do personagem -> { mods, speed, dash } no formato que o jogo lê
function buildPlayer(character) {
    const { stats } = character;
    for (const key of Object.keys(stats)) {
        if (!(key in STAT_SCHEMA)) throw new Error(`Personagem ${character.id}: stat desconhecido "${key}" (veja data_model/characters/index.js)`);
    }
    const mods = {};
    for (const [key, { kind, mod }] of Object.entries(STAT_SCHEMA)) {
        const value = stats[key];
        if (kind === 'flag' ? typeof value !== 'boolean' : typeof value !== 'number') {
            throw new Error(`Personagem ${character.id}: falta o stat "${key}" (todo personagem lista todos; veja data_model/characters/index.js)`);
        }
        const bonus = kind === 'percent' ? round(value / 100) : kind === 'flag' ? (value ? 1 : 0) : 0;
        if (bonus !== 0) mods[mod] = bonus;
    }
    // Habilidades próprias (character.abilities): hoje o Axe Quake do Brutos. Com ela, o botão da adaga vira a habilidade
    const axeQuake = character.abilities?.axeQuake ?? null;
    if (axeQuake) {
        for (const key of ['damage', 'cooldownSeconds', 'radius', 'knockback', 'stunSeconds', 'moveSpeed']) {
            if (typeof axeQuake[key] !== 'number') throw new Error(`Personagem ${character.id}: falta "${key}" em abilities.axeQuake`);
        }
        mods.axeQuake = 1;
    }
    // Habilidade do druida (Rowan): Root Snare no botão da adaga (js/systems/druid.js)
    const rootSnare = character.abilities?.rootSnare ?? null;
    if (rootSnare) {
        for (const key of ['damage', 'cooldownSeconds', 'radius', 'rootSeconds', 'range']) {
            if (typeof rootSnare[key] !== 'number') throw new Error(`Personagem ${character.id}: falta "${key}" em abilities.rootSnare`);
        }
        mods.rootSnare = 1;
    }
    // Fúria do personagem (character.fury): o tipo e os números dela (js/systems/fury.js)
    const FURY_KEYS = {
        blades: ['name'],
        bloodWaltz: ['name', 'cuts', 'cutSeconds', 'cutRange', 'cutDamage', 'healRatio', 'trailSeconds'],
        stomp: ['name', 'extraSeconds', 'stepSeconds', 'radius', 'damage', 'knockback', 'stunSeconds', 'shake', 'damageTakenCut'],
        forestGuardian: ['name', 'durationSeconds', 'damageReduction', 'radius', 'damage', 'tickSeconds', 'slow']
    };
    const fury = character.fury;
    if (!fury || !FURY_KEYS[fury.kind]) throw new Error(`Personagem ${character.id}: falta a Fúria (fury.kind: ${Object.keys(FURY_KEYS).join(', ')})`);
    for (const key of FURY_KEYS[fury.kind]) {
        if (fury[key] === undefined) throw new Error(`Personagem ${character.id}: falta "${key}" em fury`);
    }
    // Os valores absolutos vão direto para o jogo (js/systems/stats.js lê do personagem escolhido)
    return {
        mods,
        maxHp: stats.maxHp,
        attackDamage: stats.attackDamage,
        attackCooldown: stats.attackCooldown,
        bladeRange: stats.bladeRange,
        knifeRange: stats.knifeRange,
        axeQuake,
        rootSnare,
        fury,
        moveSpeed: stats.speed,
        dash: { distance: stats.dashDistance, seconds: stats.dashSeconds }
    };
}

// Números por personagem, como o jogo lê (js/systems/stats.js, js/ui/hero_stats.js, data_model/bosses.js)
export const CHARACTER_BASES = Object.fromEntries(CHARACTER_LIST.map(character => [character.id, {
    player: buildPlayer(character)
}]));

// O boss de cada personagem, PROPORCIONAL a ele: stat do personagem x razão (`boss.ratios`), mais o jeito de lutar
// (o resto de `boss`). data_model/bosses.js junta isto à base dos rivais (RIVAL_BASE).
const BOSS_RATIO_KEYS = ['hp', 'speed', 'damage', 'meleeRange', 'meleeCooldown', 'lungeLength', 'lungeSeconds'];
export function bossModelOf(id) {
    const character = CHARACTER_LIST.find(c => c.id === id);
    const { stats, boss } = character;
    const { ratios, ...fight } = boss;
    for (const key of BOSS_RATIO_KEYS) {
        if (typeof ratios?.[key] !== 'number') throw new Error(`Personagem ${id}: falta a razão do boss "${key}" (veja data_model/characters/index.js)`);
    }
    const speed = Math.round(stats.speed * ratios.speed * 100) / 100;
    return {
        ...fight,
        heroModel: character.model ?? 'hunter',
        heroKey: id,
        hpBase: Math.round(stats.maxHp * ratios.hp),
        speedMin: speed,
        speedMax: speed,
        damage: Math.round(stats.attackDamage * ratios.damage * 100) / 100,
        meleeRange: Math.round(stats.bladeRange * ratios.meleeRange * 100) / 100,
        meleeCooldownSeconds: Math.round(stats.attackCooldown * ratios.meleeCooldown * 1000) / 1000,
        lungeLength: Math.round(stats.dashDistance * ratios.lungeLength),
        lungeSeconds: Math.round(stats.dashSeconds * ratios.lungeSeconds * 1000) / 1000
    };
}

export function getCharacterBase(model = 'hunter') {
    return CHARACTER_BASES[model] ?? CHARACTER_BASES.hunter;
}

// Entrada de cada personagem em HEROES (data_model/heroes.js): identidade e textos + os mods montados acima
export const HERO_ENTRIES = Object.fromEntries(CHARACTER_LIST.map(character => {
    const entry = {
        name: character.name,
        tagline: character.tagline,
        trait: character.trait,
        mods: CHARACTER_BASES[character.id].player.mods,
        startPower: character.startPower ?? null,
        colors: character.colors,
        portrait: character.portrait
    };
    for (const key of ['model', 'perk', 'portraitImage', 'unlockHint']) if (character[key] !== undefined) entry[key] = character[key];
    return [character.id, entry];
}));

// Rival de cada personagem (o boss que o enfrenta): lido por data_model/bosses.js
export const RIVAL_OF = Object.fromEntries(CHARACTER_LIST.map(character => [character.id, character.rival]));

// Ordem na tela de escolha
export const HERO_ORDER = [...CHARACTER_LIST].sort((a, b) => a.order - b.order).map(character => character.id);
