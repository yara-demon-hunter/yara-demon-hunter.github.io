import { HERO_VISUALS } from './visuals/characters/hero_visual.js';
import { AZAEL_VISUALS } from './visuals/characters/azael_visual.js';
import { CHARACTER_BASES } from './character_bases.js';

// --- HERÓIS ---
// Liberados por conquistas do Santuário (data_model/sanctuary.js). mods: mesmas chaves de js/systems/modifiers.js.
// colors: troca só o que muda na paleta do herói 2.5D; portrait: filtro CSS aplicado no retrato.
// model: boneco 2.5D ('hunter' se ausente; 'azael' usa js/render/azael25d.js); portraitImage: arte própria do retrato.
// free: já vem liberado, sem conquista.
// shelved: guardado por enquanto. Some da tela inicial e das conquistas, mas os dados ficam para voltar depois.
export const HEROES = {
    hunter: {
        name: 'Demon Hunter',
        tagline: 'Patient and strategic. He waits, aims, and lets the torch work.',
        trait: '+15% health, +20% dagger damage, +25% dagger range, +15% attack speed while standing still, +20% torch warmth, but -5% blade damage.',
        mods: CHARACTER_BASES.hunter.player.mods,
        startPower: null,
        colors: null,
        portrait: ''
    },
    reaver: {
        name: 'Ash Reaver',
        shelved: true,
        tagline: 'Burns twice as bright.',
        trait: '+30% damage, Fury charges 60% faster, but -35% health.',
        mods: { damage: 0.3, furyCharge: 0.6, maxHp: -0.35 },
        startPower: null,
        colors: {
            cape: '#2a0a06', capeFold: '#431208', capeEdge: '#6b1d0c', capeInner: '#1c0704',
            body: '#1a0a06', sleeve: '#2b100a', sash: '#7f1d1d', hood: '#1f0a06', hoodFold: '#3b1208',
            maskEyes: '#fb923c', blade: '#f97316', bladeCore: '#fed7aa', runes: '#ffedd5', bladeGlow: '#ea580c',
            bladeGlowSoft: 'rgba(234, 88, 12, 0.8)'
        },
        portrait: 'hue-rotate(165deg) saturate(1.6) brightness(0.95)'
    },
    warden: {
        name: 'Torch Warden',
        shelved: true,
        tagline: 'The flame answers to you.',
        trait: 'The torch starts with +60 health and fights beside you, but you move 8% slower.',
        mods: { torchHp: 60, moveSpeed: -0.08 },
        startPower: 'torchBolts',
        colors: {
            cape: '#2b2106', capeFold: '#433309', capeEdge: '#6b520f', capeInner: '#1c1604',
            body: '#17120a', sleeve: '#2b2110', sash: '#a16207', hood: '#231a07', hoodFold: '#3a2c0b',
            maskEyes: '#fde047', blade: '#facc15', bladeCore: '#fef9c3', runes: '#fefce8', bladeGlow: '#ca8a04',
            bladeGlowSoft: 'rgba(202, 138, 4, 0.8)'
        },
        portrait: 'hue-rotate(205deg) saturate(1.4) brightness(1.05)'
    },
    shade: {
        name: 'The Shade',
        shelved: true,
        tagline: 'Never where they strike.',
        trait: '+1 dash charge, 25% shorter dash cooldown, +12% crit chance, but -20% blade damage.',
        mods: { dashCharges: 1, dashCooldown: 0.25, critChance: 0.12, damage: -0.2 },
        startPower: null,
        colors: {
            cape: '#120a24', capeFold: '#1e1138', capeEdge: '#34205e', capeInner: '#0c0618',
            body: '#0c0816', sleeve: '#160e29', sash: '#4c1d95', hood: '#110a20', hoodFold: '#231543',
            maskEyes: '#c084fc', blade: '#a855f7', bladeCore: '#e9d5ff', runes: '#f3e8ff', bladeGlow: '#7c3aed',
            bladeGlowSoft: 'rgba(124, 58, 237, 0.8)'
        },
        portrait: 'hue-rotate(70deg) saturate(1.3)'
    },
    azael: {
        name: 'Azael',
        tagline: 'Aggressive. A demon who hunts his own kind, up close.',
        trait: '+25% damage and heals 5% of the damage he deals, but -25% health and -35% dagger range.',
        mods: CHARACTER_BASES.azael.player.mods,
        startPower: null,
        model: 'azael',
        colors: AZAEL_VISUALS.colors,
        portrait: '',
        portraitImage: 'images/characters/azael-small.webp',
        // Liberado pela conquista Dawn (vencer a noite). unlockHint: aviso no cartão bloqueado
        unlockHint: 'Beat the game'
    }
};

// Heróis que aparecem na escolha da tela inicial, na ordem
export const ACTIVE_HEROES = Object.keys(HEROES).filter(key => !HEROES[key].shelved);

// colors em cada herói traz só o que muda; aqui vira a paleta completa
Object.values(HEROES).forEach(hero => {
    if (hero.colors) hero.colors = { ...HERO_VISUALS.colors, ...hero.colors };
});
