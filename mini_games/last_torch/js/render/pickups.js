import { PICKUP_DROP, PICKUP_MODELS } from '../../data_model/pickups.js';
import { POWERS_VISUALS } from '../../data_model/visuals/effects/powers_visual.js';
import { ctx, state } from '../core/state.js';
import { drawGlow } from './fx/glow.js';

// --- ITENS NO CHÃO (desenho procedural) ---
const P = POWERS_VISUALS.pickup;

function drawMeat() {
    ctx.fillStyle = P.bone;
    ctx.fillRect(4, -1.5, 8, 3);
    ctx.beginPath();
    ctx.arc(12, -2, 2, 0, Math.PI * 2);
    ctx.arc(12, 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = P.meat;
    ctx.beginPath();
    ctx.ellipse(-2, 0, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = P.meatLight;
    ctx.beginPath();
    ctx.ellipse(-4, -2, 4.5, 2.8, 0.4, 0, Math.PI * 2);
    ctx.fill();
}

function drawOil() {
    ctx.fillStyle = P.oil;
    ctx.beginPath();
    ctx.moveTo(-3, -9);
    ctx.lineTo(3, -9);
    ctx.lineTo(3.5, -5);
    ctx.quadraticCurveTo(10, 1, 6, 9);
    ctx.lineTo(-6, 9);
    ctx.quadraticCurveTo(-10, 1, -3.5, -5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = P.oilLight;
    ctx.beginPath();
    ctx.ellipse(0, 3, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = P.oilGlass;
    ctx.fillRect(-3, -11, 6, 2.6);
}

function drawMagnet() {
    ctx.lineWidth = 5;
    ctx.lineCap = 'butt';
    ctx.strokeStyle = P.magnet;
    ctx.beginPath();
    ctx.arc(0, -1, 7, Math.PI, 0);
    ctx.lineTo(7, 5);
    ctx.moveTo(-7, -1);
    ctx.lineTo(-7, 5);
    ctx.stroke();
    ctx.strokeStyle = P.magnetTip;
    ctx.beginPath();
    ctx.moveTo(7, 5);
    ctx.lineTo(7, 9);
    ctx.moveTo(-7, 5);
    ctx.lineTo(-7, 9);
    ctx.stroke();
}

function drawNova(t) {
    ctx.fillStyle = P.nova;
    ctx.save();
    ctx.rotate(t * 1.4);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 11 : 4.5;
        const a = (i / 10) * Math.PI * 2;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = P.novaCore;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawChest() {
    ctx.fillStyle = P.chest;
    ctx.fillRect(-13, -4, 26, 14);
    ctx.fillStyle = P.chestLight;
    ctx.beginPath();
    ctx.moveTo(-13, -4);
    ctx.quadraticCurveTo(0, -15, 13, -4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = P.chestBand;
    ctx.fillRect(-13, -5, 26, 2.4);
    ctx.fillRect(-9, -9, 2.4, 19);
    ctx.fillRect(6.6, -9, 2.4, 19);
    ctx.fillStyle = P.chestLock;
    ctx.fillRect(-2.6, -3, 5.2, 6);
}

const DRAW = { MEAT: drawMeat, OIL: drawOil, MAGNET: drawMagnet, NOVA: drawNova, CHEST: drawChest };

export function renderPickups() {
    const t = performance.now() / 1000;
    state.pickups.forEach(p => {
        const left = PICKUP_DROP.lifeSeconds - p.age;
        // Pisca nos últimos segundos
        if (p.type !== 'CHEST' && left < PICKUP_DROP.blinkSeconds && Math.floor(t * 8) % 2 === 0) return;
        const bob = Math.sin(t * 3 + p.phase) * PICKUP_DROP.bobHeight;
        const chest = p.type === 'CHEST';
        const pulse = 0.5 + 0.5 * Math.sin(t * 4 + p.phase);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 11, chest ? 15 : 9, chest ? 5 : 3.2, 0, 0, Math.PI * 2);
        ctx.fill();

        drawGlow(ctx, PICKUP_MODELS[p.type].color, p.x, p.y + bob, P.glowRadius * (chest ? 1.8 : 1), 0.3 + pulse * 0.3);
        ctx.save();
        ctx.translate(p.x, p.y + bob);
        ctx.scale(P.scale, P.scale);
        DRAW[p.type](t);
        ctx.restore();
    });
}
