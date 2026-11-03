import { ctx } from '../core/canvas.js';
import { state } from '../core/state.js';

// --- DESENHO ---
export function snap(p) {
    return {
        x: p.x, y: p.y, r: p.radius, sx: p.sx, sy: p.sy, vx: p.vx, vy: p.vy,
        alive: p.isAlive, stun: p.stunTimer, taunt: p.tauntTimer, shield: p.hasShield,
        facing: p.facing, pound: p.isPounding, bomb: state.bombHolder === p, color: p.color,
        speed: p.speedTimer > 0, knock: p.knockTimer > 0
    };
}

export function drawBlob(s) {
    if (!s.alive) return;
    const r = s.r;
    ctx.save();
    ctx.translate(s.x, s.y + r * (1 - s.sy)); // mantém os "pés" no chão ao achatar
    ctx.scale(s.sx, s.sy);

    // Escudo
    if (s.shield) {
        ctx.beginPath();
        ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#26de81';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    // Corpo Principal
    if (s.knock) { ctx.shadowColor = '#a55eea'; ctx.shadowBlur = 20; }
    else if (s.speed) { ctx.shadowColor = '#ffd32a'; ctx.shadowBlur = 16; }
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Olhos Expressivos
    const ex = r * 0.32;
    const ey = -r * 0.2;
    const shift = s.facing * r * 0.1;
    if (s.stun > 0) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        [-1, 1].forEach(side => {
            const cx = side * ex + shift;
            ctx.beginPath();
            ctx.moveTo(cx - r * 0.12, ey - r * 0.12);
            ctx.lineTo(cx + r * 0.12, ey + r * 0.12);
            ctx.moveTo(cx + r * 0.12, ey - r * 0.12);
            ctx.lineTo(cx - r * 0.12, ey + r * 0.12);
            ctx.stroke();
        });
    } else {
        const lookX = Math.max(-r * 0.12, Math.min(r * 0.12, s.vx * 0.2)) + s.facing * r * 0.04;
        const lookY = Math.max(-r * 0.1, Math.min(r * 0.1, s.vy * 0.1));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-ex + shift, ey, r * 0.25, 0, Math.PI * 2);
        ctx.arc(ex + shift, ey, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-ex + shift + lookX, ey + lookY, r * 0.12, 0, Math.PI * 2);
        ctx.arc(ex + shift + lookX, ey + lookY, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
    }

    // Boca
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#2d0a0a';
    ctx.lineWidth = 2;
    const my = r * 0.35;
    ctx.beginPath();
    if (s.taunt > 0) {
        ctx.arc(shift, my - r * 0.05, r * 0.28, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
    } else if (s.stun > 0) {
        ctx.moveTo(shift - r * 0.25, my);
        ctx.quadraticCurveTo(shift - r * 0.12, my - r * 0.12, shift, my);
        ctx.quadraticCurveTo(shift + r * 0.12, my + r * 0.12, shift + r * 0.25, my);
        ctx.stroke();
    } else if (s.pound) {
        ctx.arc(shift, my, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.arc(shift, my - r * 0.12, r * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
    }
    ctx.restore();

    // Estrelinhas de tontura
    if (s.stun > 0) {
        ctx.fillStyle = '#ffd32a';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        for (let i = 0; i < 3; i++) {
            const a = state.frameCount * 0.15 + i * 2.09;
            ctx.fillText('✦', s.x + Math.cos(a) * r * 0.9, s.y + r * 0.2 + Math.sin(a) * 5);
        }
    }

    // Bomba na cabeça
    if (s.bomb) {
        const bx = s.x;
        const by = s.y - r * s.sy - 16;
        ctx.beginPath();
        ctx.arc(bx, by, 10, 0, Math.PI * 2);
        ctx.fillStyle = state.bombTimer < 90 && state.frameCount % 10 < 5 ? '#ff4757' : '#2f3542';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = Math.random() < 0.5 ? '#ffd32a' : '#ff7f50';
        ctx.beginPath();
        ctx.arc(bx + 6, by - 11, 3 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(state.bombTimer / 60), bx, by + 4);
    }
}


