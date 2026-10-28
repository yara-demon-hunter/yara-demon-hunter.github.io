import { POWERUP_MODELS } from '../../data_model/skills.js';
import { ctx, state } from '../core/state.js';

// --- ENTIDADES: Powerups, Golpes, Projéteis, Inimigos e Partículas ---
export function renderPowerups() {
    state.powerups.forEach(pw => {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = POWERUP_MODELS[pw.type].color;
        ctx.fillStyle = ctx.shadowColor;
        ctx.beginPath();
        ctx.arc(pw.x, pw.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// Slashes de Espada (Golpes de Arco Direcional em Estilo Neon Cyan/Purple)
export function renderBladeSlashes() {
    const frenzyActive = state.frenzyActiveTimer > 0;

    state.bladeSlashes.forEach(s => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        const progress = 1 - (s.life / s.maxLife);
        const currentArc = s.arcWidth;
        const startAngle = -currentArc / 2;
        const endAngle = currentArc / 2;

        // Arco Neon distintivo
        ctx.shadowBlur = frenzyActive ? 30 : 22;
        ctx.shadowColor = frenzyActive ? '#f0abfc' : s.comboStep === 3 ? '#a855f7' : '#06b6d4';
        ctx.strokeStyle = ctx.shadowColor;
        ctx.lineWidth = frenzyActive ? 12 : s.comboStep === 3 ? 9 : 7;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(0, 0, s.radius * (0.85 + progress * 0.15), startAngle, endAngle);
        ctx.stroke();

        // Rastro interno brilhante (Branco Neon)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, s.radius * (0.85 + progress * 0.15), startAngle, endAngle);
        ctx.stroke();

        ctx.restore();
    });
}

export function renderEnemyProjectiles() {
    state.enemyProjectiles.forEach(p => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f59e0b';
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

export function renderEnemies() {
    state.enemies.forEach(e => {
        ctx.save();
        ctx.shadowBlur = e.type === 'BOSS' ? 25 : 12;
        ctx.shadowColor = e.color;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();

        // Barra de vida simples acima do inimigo
        if (e.hp < e.maxHp) {
            const bw = e.radius * 2;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.fillRect(e.x - bw / 2, e.y - e.radius - 8, bw, 4);
            ctx.fillStyle = e.color;
            ctx.fillRect(e.x - bw / 2, e.y - e.radius - 8, bw * (e.hp / e.maxHp), 4);
        }

        ctx.restore();
    });
}

export function renderParticles() {
    state.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}
