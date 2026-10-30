import { CHARACTER_MODEL } from '../../data_model/character.js';
import { GOLD_DROP as D } from '../../data_model/gold.js';
import { audio, player, state } from '../core/state.js';
import { updateHUD } from '../ui/hud.js';
import { getMagnetRadius } from './stats.js';

// --- OURO DROPADO ---
// Moeda: pula para o lado (pop) e fica no chão. Perto do herói é atraída com aceleração crescente;
// com o ímã ou no fim da hora, todas vêm juntas.
export function dropGold(x, y, amount) {
    const coinCount = Math.max(1, Math.min(D.maxCoinsPerKill, amount));
    // Muitas moedas na tela: entra direto para não pesar
    if (state.goldDrops.length + coinCount > D.maxActiveCoins) {
        collectGold(amount);
        return;
    }
    // Divide o valor entre as moedas (o total é sempre exato)
    const base = Math.floor(amount / coinCount);
    let extra = amount - base * coinCount;
    for (let i = 0; i < coinCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = D.scatterSpeedMin + Math.random() * (D.scatterSpeedMax - D.scatterSpeedMin);
        state.goldDrops.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            value: base + (extra-- > 0 ? 1 : 0),
            age: 0,
            homingSpeed: 0,
            phase: Math.random() * Math.PI * 2
        });
    }
}

function collectGold(value) {
    state.coins += value;
    state.run.goldEarned += value;
    audio.playCoin();
    updateHUD();
}

// Ao abrir a loja, o ouro que ainda está voando entra de uma vez (nada se perde)
export function collectAllGold() {
    const total = state.goldDrops.reduce((sum, c) => sum + c.value, 0);
    state.goldDrops = [];
    if (total > 0) {
        state.coins += total;
        state.run.goldEarned += total;
    }
}

export function updateGold(dt) {
    const pickup = D.pickupRadius + CHARACTER_MODEL.collisionRadius;
    const magnet = getMagnetRadius();
    if (state.magnetTimer > 0) state.magnetTimer -= dt;
    const vacuum = state.goldVacuum || state.magnetTimer > 0;
    const acceleration = vacuum ? D.vacuumAcceleration : D.homingAcceleration;
    const maxSpeed = vacuum ? D.vacuumMaxSpeed : D.homingMaxSpeed;
    for (let i = state.goldDrops.length - 1; i >= 0; i--) {
        const c = state.goldDrops[i];
        c.age += dt;

        if (c.age < D.popSeconds) {
            // Pulo inicial freando
            c.x += c.vx * dt;
            c.y += c.vy * dt;
            c.vx *= D.scatterDamping;
            c.vy *= D.scatterDamping;
        } else {
            const dx = player.x - c.x;
            const dy = player.y - c.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (vacuum || dist < magnet) c.attracted = true;
            if (c.attracted) {
                // Atraída pelo herói, cada vez mais rápido
                c.homingSpeed = Math.min(maxSpeed, c.homingSpeed + acceleration * dt);
                const step = Math.min(dist, c.homingSpeed * dt);
                c.x += (dx / dist) * step;
                c.y += (dy / dist) * step;
            }
        }

        if (Math.hypot(player.x - c.x, player.y - c.y) < pickup && c.age >= D.popSeconds * 0.6) {
            collectGold(c.value);
            state.goldDrops.splice(i, 1);
        }
    }
}
