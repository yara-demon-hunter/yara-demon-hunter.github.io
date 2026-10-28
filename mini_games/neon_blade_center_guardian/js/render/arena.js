import { CORE_MODEL } from '../../data_model/core.js';
import { ctx, player, state } from '../core/state.js';
import { getAtkRadius } from '../systems/stats.js';

// --- ARENA: Fundo, Núcleo e Raio de Alcance ---
export function renderBackground() {
    const { width, height } = state;

    // Fundo com Grade Neon
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
}

export function renderCore() {
    const { coreX, coreY } = state;

    // Núcleo (Center Tower)
    ctx.save();
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#f43f5e';
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(coreX, coreY, CORE_MODEL.visualRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Anéis de energia no núcleo
    const pulse = Math.sin(performance.now() * CORE_MODEL.pulseFrequency) * CORE_MODEL.pulseAmplitude;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(coreX, coreY, CORE_MODEL.pulseRadius + pulse, 0, Math.PI * 2);
    ctx.stroke();
}

// Raio de Alcance do herói: Círculo Vermelho com Linhas Tracejadas
export function renderAttackRange() {
    ctx.save();
    ctx.strokeStyle = state.frenzyActiveTimer > 0 ? 'rgba(236, 72, 153, 0.7)' : 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]); // Linha tracejada
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(player.x, player.y, getAtkRadius(), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
