// --- DADOS VISUAIS: Skills dos quatro ramos. ---
// Lidos por js/render/skills.js. Só afeta o desenho.
export const SKILLS_VISUALS = {
    // Blade
    bloodlust: { aura: 'rgba(220, 38, 38, 0.6)', arc: '#ef4444', arcRadius: 21, blade: 'rgba(239, 68, 68, 0.9)' },
    warCry: { aura: 'rgba(248, 113, 113, 0.55)', radius: 34 },
    crack: { color: 'rgba(10, 8, 6, 0.85)', edge: 'rgba(168, 162, 158, 0.3)', molten: '#fb923c', moltenCore: '#fef08a', width: 3.2 },
    crescent: { color: '#dc2626', core: '#fecaca', glow: 'rgba(239, 68, 68, 0.75)', radius: 30 },
    execution: { color: '#ef4444', core: '#fff1f2', glow: 'rgba(220, 38, 38, 0.85)', length: 34 },
    stun: { color: '#fde047', orbit: 11, dots: 3 },

    // Shadow
    mark: { color: '#c4b5fd', core: '#f5f3ff', glow: 'rgba(139, 92, 246, 0.5)', gap: 8 },
    markBurst: { color: '#a78bfa', core: '#ffffff', length: 26 },
    smoke: { color: 'rgba(203, 213, 225, 0.5)', dark: 'rgba(100, 116, 139, 0.62)', puffs: 4 },
    echo: { color: 'rgba(124, 58, 237, 0.55)', core: 'rgba(233, 213, 255, 0.5)' },

    // Flame
    fireRing: {
        tongues: [34, 22, 12],      // por nível de detalhe
        colors: ['rgba(234, 88, 12, 0.75)', 'rgba(251, 146, 60, 0.8)', 'rgba(253, 224, 71, 0.8)'],
        evolvedColors: ['rgba(254, 240, 138, 0.8)', 'rgba(255, 255, 255, 0.8)', 'rgba(253, 186, 116, 0.8)'],
        glow: 'rgba(249, 115, 22, 0.45)',
        evolvedGlow: 'rgba(254, 240, 138, 0.55)',
        line: 'rgba(253, 186, 116, 0.55)'
    },
    shield: { fill: 'rgba(251, 191, 36, 0.07)', ring: 'rgba(253, 230, 138, 0.8)', glow: 'rgba(245, 158, 11, 0.4)', tongue: 'rgba(251, 146, 60, 0.75)', radius: 32 },
    phoenix: { colors: ['rgba(249, 115, 22, 0.8)', 'rgba(253, 224, 71, 0.85)', 'rgba(220, 38, 38, 0.75)'], feathers: 8, span: 150 },

    // Curse
    rift: {
        core: 'rgba(3, 0, 10, 0.96)',
        rim: '#a855f7',
        rimLight: '#f0abfc',
        evolvedRim: '#6366f1',
        evolvedLight: '#c7d2fe',
        glow: 'rgba(124, 58, 237, 0.55)',
        spirals: 4,
        motes: 12
    },
    hex: { glow: 'rgba(168, 85, 247, 0.7)', spark: '#e9d5ff', beam: { color: '#d8b4fe', core: '#ffffff', glow: 'rgba(168, 85, 247, 0.4)' } },
    wisp: { bone: '#e7e0cf', boneShade: '#a8a08c', eye: '#d946ef', flame: 'rgba(192, 38, 211, 0.75)', flameCore: 'rgba(240, 171, 252, 0.85)', scale: 1 },
    soulBolt: { glow: 'rgba(168, 85, 247, 0.9)', mid: '#c084fc', core: '#faf5ff' }
};
