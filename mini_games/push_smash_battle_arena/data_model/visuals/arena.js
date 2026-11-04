// --- DADOS VISUAIS: arenas ---
// O fundo, a plataforma e as paredes de cada arena são desenhados uma vez (js/render/scenery.js) e carimbados.
// hills.shape: rolling (colinas) | dunes (dunas lisas) | peaks (montanhas)
// decor: silhuetas em cima da primeira camada de morros (cactus | pine | null)
// ambient: partículas vivas no ar (fireflies | sand | snow)
// platform.underside: o que pende embaixo da plataforma (crystals | rocks | icicles)
export const STAGE_VISUALS = {
    night: {
        sky: ['#161a33', '#0d1022', '#07080f'],
        celestial: { x: 640, y: 92, radius: 34, color: '#e8f0ff', glow: '#7c8cff', craters: true },
        stars: { count: 70, seed: 7, color: '#cfd8ff' },
        hills: [
            { color: '#10142b', base: 330, amplitude: 46, seed: 3, shape: 'rolling' },
            { color: '#0b0e20', base: 372, amplitude: 38, seed: 11, shape: 'rolling' }
        ],
        decor: null,
        fog: 'rgba(75, 91, 214, 0.22)',
        ambient: { type: 'fireflies', count: 14, color: '#9ff4e6', size: 7 },
        platform: {
            stone: '#2a3042', stoneDark: '#1a1f2e', stoneLight: '#3a4258', crack: '#141824',
            underside: 'crystals', undersideColors: ['#45f3df', '#7c8cff'], cap: null
        },
        wall: { stone: '#1f2833', stoneLight: '#2c3a4a' }
    },
    desert: {
        sky: ['#3b2a6b', '#d9576b', '#ffb36b'],
        celestial: { x: 600, y: 170, radius: 48, color: '#ffe08a', glow: '#ff9a3c', craters: false },
        stars: { count: 14, seed: 21, color: '#ffe6f0' },
        hills: [
            { color: '#c9824a', base: 336, amplitude: 40, seed: 5, shape: 'dunes' },
            { color: '#a3603a', base: 380, amplitude: 30, seed: 17, shape: 'dunes' }
        ],
        decor: { type: 'cactus', color: '#6b3826', count: 5, seed: 4 },
        fog: 'rgba(255, 170, 90, 0.18)',
        ambient: { type: 'sand', count: 26, color: '#ffd9a0', size: 4 },
        platform: {
            stone: '#c98c55', stoneDark: '#8a5530', stoneLight: '#e8b07a', crack: '#6b3d22',
            underside: 'rocks', undersideColors: ['#a8693e', '#8a5530'], cap: null
        },
        wall: { stone: '#7a4a2e', stoneLight: '#a8693e' }
    },
    snow: {
        sky: ['#1d3a6e', '#3f6fb0', '#a9c9f0'],
        celestial: { x: 170, y: 110, radius: 30, color: '#fffbe8', glow: '#cfe6ff', craters: false },
        stars: { count: 24, seed: 33, color: '#ffffff' },
        hills: [
            { color: '#d7e5f5', base: 330, amplitude: 90, seed: 9, shape: 'peaks' },
            { color: '#b2c8e2', base: 382, amplitude: 40, seed: 13, shape: 'rolling' }
        ],
        decor: { type: 'pine', color: '#284766', count: 9, seed: 8 },
        fog: 'rgba(255, 255, 255, 0.28)',
        ambient: { type: 'snow', count: 46, color: '#ffffff', size: 4 },
        platform: {
            stone: '#bfe3f7', stoneDark: '#7fb3d9', stoneLight: '#ffffff', crack: '#9cc9e8',
            underside: 'icicles', undersideColors: ['#e6f6ff', '#bfe3f7'], cap: '#ffffff'
        },
        wall: { stone: '#7fa6c7', stoneLight: '#cfe4f5' }
    }
};

// Medidas comuns a todas as arenas
export const SCENERY = {
    undersideDepth: 26,
    capWidth: 22,
    tileWidth: 48,
    edge: { safe: '#45f3df', warn: '#ffa502', danger: '#ff4757', warnAt: 0.3, dangerAt: 0.6 },
    wallGlowSize: 130,
    wallGlowAlpha: 0.18,
    preview: { width: 160, height: 90 }    // miniatura no menu
};
