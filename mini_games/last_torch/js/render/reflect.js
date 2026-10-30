import { MIRROR_WARD } from '../../data_model/passives.js';
import { REFLECT_VISUALS as V } from '../../data_model/visuals/effects/reflect_visual.js';
import { ctx, passives, player, state } from '../core/state.js';
import { easeOutCubic } from './fx/easing.js';
import { drawGlow } from './fx/glow.js';

// --- REBATE (Mirror Ward) ---
// Tiro rebatido azul com rastro de partículas e a animação de parry no herói: um escudo em arco
// surge na direção do tiro, empurra para fora e some, com anel de choque e clarão.
// Os dados visuais ficam em REFLECT_VISUALS (data_model/visuals/effects/reflect_visual.js).

// Tiro inimigo que foi rebatido (azul, em vez da cor de quem atirou)
export function renderReflectedBolt(p) {
    const B = V.bolt;
    const c = V.colors;
    const t = performance.now() / 1000;
    const spin = t * B.spinHz * Math.PI * 2;

    drawGlow(ctx, c.boltGlow, p.x, p.y, p.radius * B.glowRadius, 0.8);

    const len = Math.hypot(p.vx, p.vy) || 1;
    const backX = -p.vx / len;
    const backY = -p.vy / len;
    for (let i = 1; i <= B.trailParticles; i++) {
        const fade = 1 - i / (B.trailParticles + 1);
        const d = p.radius * (0.6 + i * B.trailSpacing);
        const jitter = Math.sin(t * 20 + i * 2.3) * p.radius * 0.35;
        const s = Math.max(0.6, p.radius * 0.5 * fade);
        ctx.globalAlpha = fade;
        ctx.fillStyle = i % 2 === 0 ? c.trailLight : c.trailDark;
        ctx.fillRect(p.x + backX * d - backY * jitter - s / 2, p.y + backY * d + backX * jitter - s / 2, s, s);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = c.boltCore;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.boltRim;
    ctx.lineWidth = Math.max(0.8, p.radius * 0.4);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, spin, spin + Math.PI * 1.5);
    ctx.stroke();
}

// Indicador (pronto / recarregando) e animação do rebate, desenhados ao redor do herói
export function renderReflectWard() {
    if (passives.mirrorWard.lvl <= 0) return;
    const c = V.colors;
    const t = performance.now() / 1000;

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.lineCap = 'round';
    ctx.lineWidth = V.indicatorLineWidth;

    if (player.reflectTimer <= 0) {
        // Pronto: anel fraco pulsando
        const pulse = 0.55 + 0.45 * Math.sin(t * V.readyPulseHz * Math.PI * 2);
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = c.ready;
        ctx.beginPath();
        ctx.arc(0, 0, V.readyRadius, 0, Math.PI * 2);
        ctx.stroke();
    } else if (state.gameState === 'PLAYING' || state.gameState === 'SHOP') {
        // Recarregando: arco fino que vai enchendo
        const progress = 1 - player.reflectTimer / MIRROR_WARD.cooldownSeconds;
        ctx.strokeStyle = c.recharge;
        ctx.beginPath();
        ctx.arc(0, 0, V.rechargeRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Parry: escudo em arco na direção do tiro + anel de choque + clarão
    const p = (performance.now() - player.reflectTime) / 1000 / V.parrySeconds;
    if (p >= 0 && p < 1) {
        const ease = easeOutCubic(p);
        const fade = 1 - p;

        ctx.globalAlpha = fade * 0.8;
        drawGlow(ctx, c.flash, Math.cos(player.reflectAngle) * V.shieldDistance, Math.sin(player.reflectAngle) * V.shieldDistance,
            V.flashRadius * (0.6 + ease * 0.6), 1);

        ctx.globalAlpha = fade;
        ctx.strokeStyle = c.ring;
        ctx.lineWidth = V.ringLineWidth * fade + 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, V.ringStartRadius + (V.ringEndRadius - V.ringStartRadius) * ease, 0, Math.PI * 2);
        ctx.stroke();

        const dist = V.shieldDistance + V.shieldPushOut * ease;
        const half = V.shieldHalfAngle * (0.7 + 0.3 * Math.min(1, p * 4));
        const shieldWidth = V.shieldLineWidth * (0.6 + 0.4 * fade);
        ctx.strokeStyle = c.shield;
        ctx.beginPath();
        ctx.arc(0, 0, dist, player.reflectAngle - half, player.reflectAngle + half);
        // Brilho: traço largo e translúcido por baixo (bem mais barato que shadowBlur)
        ctx.globalAlpha = fade * 0.25;
        ctx.lineWidth = shieldWidth + V.shieldGlow;
        ctx.stroke();
        ctx.globalAlpha = fade;
        ctx.lineWidth = shieldWidth;
        ctx.stroke();
        ctx.strokeStyle = c.shieldCore;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, dist, player.reflectAngle - half * 0.85, player.reflectAngle + half * 0.85);
        ctx.stroke();
    }
    ctx.restore();
}
