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
    platform.width = Math.max(ARENA.platform.minWidth, platform.width - px);
    platform.x = (W - platform.width) / 2;
}
