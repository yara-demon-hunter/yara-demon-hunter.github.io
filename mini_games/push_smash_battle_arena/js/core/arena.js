import { ARENA } from '../../data_model/match.js';
import { W } from './canvas.js';

// Paredes laterais (wall jump)
export const leftWall = { x: 0, y: ARENA.wall.y, width: ARENA.wall.width, height: ARENA.wall.height };
export const rightWall = { x: W - ARENA.wall.width, y: ARENA.wall.y, width: ARENA.wall.width, height: ARENA.wall.height };

// Plataforma central (encolhe com batidas e no fim do tempo)
export const platform = {
    x: (W - ARENA.platform.fullWidth) / 2,
    y: ARENA.platform.y,
    width: ARENA.platform.fullWidth,
    height: ARENA.platform.height
};

export function shrinkPlatform(px) {
    // Na rampa em U, sobra sempre um pedaço reto no meio entre os dois arcos
    const min = terrain.type === 'halfpipe' ? Math.max(ARENA.platform.minWidth, terrain.radius * 2 + MIN_HALFPIPE_FLAT) : ARENA.platform.minWidth;
    platform.width = Math.max(min, platform.width - px);
    platform.x = (W - platform.width) / 2;
}

// --- FORMATO DO CHÃO ---
// Plataforma reta (padrão) ou rampa em U (halfpipe). Na rampa, `platform` é a largura total do U: o meio é
// reto e cada ponta sobe num arco de raio `radius`, tangente ao chão (por isso não há quina).
export const terrain = { type: 'flat', radius: 0, thickness: 0, slopeDamping: 1 };
const MIN_HALFPIPE_FLAT = 120;     // px de chão reto que sempre sobra no meio do U

export function setTerrain(config) {
    terrain.type = config?.type ?? 'flat';
    terrain.radius = config?.radius ?? 0;
    terrain.thickness = config?.thickness ?? 0;
    terrain.slopeDamping = config?.slopeDamping ?? 1;
}

// Parte reta do chão (a plataforma inteira, ou só o meio do U)
export function flatRange() {
    if (terrain.type !== 'halfpipe') return { l: platform.x, r: platform.x + platform.width };
    return { l: platform.x + terrain.radius, r: platform.x + platform.width - terrain.radius };
}

// Arcos da rampa: o centro do círculo fica acima do chão; side -1 = esquerda, 1 = direita
export function arcs() {
    if (terrain.type !== 'halfpipe') return [];
    const f = flatRange();
    const cy = platform.y - terrain.radius;
    return [{ side: -1, cx: f.l, cy, r: terrain.radius }, { side: 1, cx: f.r, cy, r: terrain.radius }];
}

// Altura do chão em x (null = não há chão ali, é o vazio)
export function groundYAt(x) {
    if (x < platform.x || x > platform.x + platform.width) return null;
    for (const a of arcs()) {
        const dx = x - a.cx;
        if (dx * a.side > 0) return a.cy + Math.sqrt(Math.max(0, a.r * a.r - dx * dx));
    }
    return platform.y;
}
