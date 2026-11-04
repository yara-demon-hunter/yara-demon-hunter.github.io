import { MASS, PHYSICS } from '../../data_model/physics.js';
import { TEXTS } from '../../data_model/texts.js';
import { playSound } from '../audio/sound.js';
import { groundYAt } from '../core/arena.js';
import { H } from '../core/canvas.js';
import { state } from '../core/state.js';
import { players } from '../entities/player.js';
import { addPopup, createParticles } from './effects.js';

// --- MASSA NO CHÃO (dá pra comer e crescer) ---
export function spawnMassBlobs(p, amount) {
    const n = MASS.blobCount;
    for (let i = 0; i < n; i++) {
        state.massBlobs.push({
            x: p.x,
            y: p.y - p.radius * 0.5,
            vx: (Math.random() - 0.5) * 10,
            vy: -4 - Math.random() * 5,
            amount: amount / n,
            r: MASS.blobBaseRadius + (amount / n) * MASS.blobRadiusPerMass,
            color: p.bodyColor,
            life: MASS.blobLifeFrames,
            age: 0,
            grounded: false,
            wob: Math.random() * 6
        });
    }
}

export function updateMassBlobs() {
    for (let i = state.massBlobs.length - 1; i >= 0; i--) {
        const b = state.massBlobs[i];
        b.life--;
        b.age++;
        const ground = groundYAt(b.x);
        const overPlatform = ground !== null;
        if (b.grounded && !overPlatform) b.grounded = false;
        if (!b.grounded) {
            b.vy += PHYSICS.gravity;
            b.vx *= MASS.blobAirDrag;
            b.x += b.vx;
            b.y += b.vy;
            if (overPlatform && b.vy > 0 && b.y + b.r * 0.6 >= ground) {
                b.y = ground - b.r * 0.6;
                b.vx = 0;
                b.vy = 0;
                b.grounded = true;
            }
        }
        if (b.life <= 0 || b.y > H + 50) {
            state.massBlobs.splice(i, 1);
            continue;
        }
        if (b.age < MASS.blobEatDelayFrames) continue;
        const eater = players.find(p => p.isAlive && p.stunTimer === 0 && Math.hypot(p.x - b.x, p.y - b.y) < p.radius + b.r);
        if (eater) {
            eater.addMass(b.amount);
            eater.squash(1.25, 0.8);
            playSound('eat');
            addPopup(b.x, b.y - 14, TEXTS.nom, eater.color);
            createParticles(b.x, b.y, b.color, 8);
            state.massBlobs.splice(i, 1);
        }
    }
}


