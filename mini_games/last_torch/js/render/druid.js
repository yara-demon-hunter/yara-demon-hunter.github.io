import { ctx, player, state } from '../core/state.js';
import { drawGlow } from '../../library/core/glow.js';
import { forestGuardianActive } from '../systems/fury.js';
const TAU = Math.PI * 2;
export function renderGuardianWard() {
    if (!forestGuardianActive() || player.hidden) return;
    const t = performance.now() / 1000;
    const x = player.x;
    const y = player.y - 12;
    const radius = 37;
    const leaves = [];
    for (let i = 0; i < 18; i++) {
        const z = 1 - 2 * (i + 0.5) / 18;
        const ring = Math.sqrt(1 - z * z);
        const angle = i * 2.4 + t * 2.6;
        leaves.push({
            x: Math.cos(angle) * ring * radius,
            y: z * radius * 0.72,
            depth: Math.sin(angle) * ring,
            angle: angle + Math.PI / 2,
            scale: 0.65 + (Math.sin(angle) * 0.35 + 0.65) * 0.35
        });
    }
    drawGlow(ctx, 'rgba(20, 83, 45, 0.6)', x, y, 48, 0.28);
    leaves.sort((a, b) => a.depth - b.depth);
    for (const leaf of leaves) {
        ctx.save();
        ctx.translate(x + leaf.x, y + leaf.y);
        ctx.rotate(leaf.angle);
        ctx.globalAlpha = 0.52 + (leaf.depth + 1) * 0.2;
        ctx.scale(leaf.scale, leaf.scale);
        ctx.fillStyle = leaf.depth > 0 ? '#4ade80' : '#166534';
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.quadraticCurveTo(6, -2, 0, 7);
        ctx.quadraticCurveTo(-6, -2, 0, -7);
        ctx.fill();
        ctx.strokeStyle = 'rgba(187, 247, 208, 0.65)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.stroke();
        ctx.restore();
    }
}

// Círculo de raízes do Root Snare
export function renderSnares() {
    for (const s of state.druid.snares) {
        const k = s.age / s.seconds;
        ctx.globalAlpha = (1 - k) * 0.75;
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * (0.55 + 0.45 * Math.min(1, k * 3)), 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = (1 - k) * 0.12;
        ctx.fillStyle = '#14532d';
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
