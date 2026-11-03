import { ITEMS, SPAWN } from '../../data_model/match.js';
import { platform } from '../core/arena.js';
import { H } from '../core/canvas.js';
import { state } from '../core/state.js';

export function spawnAirDrop() {
    let types = Object.keys(ITEMS);
    if (state.bombHolder || state.airDrops.some(d => d.type === 'BOMB')) types = types.filter(t => t !== 'BOMB');
    const type = types[Math.floor(Math.random() * types.length)];
    state.airDrops.push({
        x: platform.x + 30 + Math.random() * (platform.width - 60),
        y: -30,
        vy: SPAWN.dropFallSpeed,
        radius: SPAWN.dropRadius,
        type,
        color: ITEMS[type].color,
        icon: ITEMS[type].icon
    });
}

export function spawnCoin() {
    if (state.spawnableCoins.length < SPAWN.maxCoins) {
        state.spawnableCoins.push({
            x: SPAWN.coinArea.x + Math.random() * SPAWN.coinArea.width,
            y: SPAWN.coinArea.y + Math.random() * SPAWN.coinArea.height,
            radius: SPAWN.coinRadius
        });
    }
}

export function updateItems() {
    state.airDrops.forEach(p => {
        const overPlatform = p.x > platform.x && p.x < platform.x + platform.width;
        if (!overPlatform) p.y += 3;
        else if (p.y < platform.y - 15) p.y += p.vy;
    });
    state.airDrops = state.airDrops.filter(p => p.y < H + 30);

    if (++state.coinSpawnTimer >= SPAWN.coinEveryFrames) { state.coinSpawnTimer = 0; spawnCoin(); }
    if (++state.dropSpawnTimer >= SPAWN.dropEveryFrames) { state.dropSpawnTimer = 0; spawnAirDrop(); }
}


