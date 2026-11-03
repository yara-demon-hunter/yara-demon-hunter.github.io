import { ARENA } from '../../data_model/match.js';
import { leftWall, platform, rightWall } from '../core/arena.js';
import { ctx } from '../core/canvas.js';
import { state } from '../core/state.js';

export function drawArena() {
    // Paredes Laterais (Neon WallJump)
    ctx.fillStyle = '#1f2833';
    ctx.fillRect(leftWall.x, leftWall.y, leftWall.width, leftWall.height);
    ctx.fillRect(rightWall.x, rightWall.y, rightWall.width, rightWall.height);
    ctx.fillStyle = '#ff4757';
    ctx.fillRect(leftWall.x + leftWall.width - 3, leftWall.y, 3, leftWall.height);
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(rightWall.x, rightWall.y, 3, rightWall.height);

    // Plataforma Central (a borda fica vermelha quando está pequena)
    ctx.fillStyle = '#1f2833';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    const danger = 1 - (platform.width - ARENA.platform.minWidth) / (ARENA.platform.fullWidth - ARENA.platform.minWidth);
    ctx.fillStyle = danger > 0.6 ? '#ff4757' : danger > 0.3 ? '#ffa502' : '#45f3df';
    ctx.fillRect(platform.x, platform.y, platform.width, 4);
}

export function drawPickups() {
    // Moedas Coletáveis
    state.spawnableCoins.forEach(c => {
        const y = c.y + Math.sin(state.frameCount * 0.08 + c.x) * 3;
        ctx.fillStyle = '#ffd32a';
        ctx.beginPath();
        ctx.arc(c.x, y, c.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffa502';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Power-ups
    state.airDrops.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(p.icon, p.x, p.y + 4);
    });

    // Massa no chão (gelatina tremendo)
    state.massBlobs.forEach(b => {
        if (b.life < 120 && state.frameCount % 10 < 5) return;
        const w = Math.sin(state.frameCount * 0.2 + b.wob) * 0.12;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.r * (1 + w), b.r * (0.75 - w), 0, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}


