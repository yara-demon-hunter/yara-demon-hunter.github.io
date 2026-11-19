// --- RAIOS ARCANOS (Gudran, js/systems/arcane.js) ---
// Um raio de energia azul: brilho aditivo, corpo, miolo claro e um rastro afinando para trás. Poucas formas, sem sprite.
import { ctx, player, state } from '../core/state.js';
import { drawGlow } from '../../library/core/glow.js';
import { ARCANE_BOLT as B } from '../../data_model/passives.js';
import { BEAM_LENGTH, beamActive, furyBeam } from '../systems/fury.js';
import { getFury, getRuneShield } from '../systems/stats.js';

export function renderArcane() {
    const bolts = state.arcaneBolts;
    if (bolts.length === 0) return;
    ctx.save();
    for (const b of bolts) {
        const y = b.y - B.flightHeight;
        const r = b.radius;
        // Rastro: três pontos atrás, cada vez menores e mais fracos
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 3; i >= 1; i--) {
            ctx.globalAlpha = 0.16 * (4 - i);
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.arc(b.x - Math.cos(b.angle) * i * r * 1.1, y - Math.sin(b.angle) * i * r * 1.1, r * (1 - i * 0.16), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        drawGlow(ctx, '#60a5fa', b.x, y, r * 3.4, 0.7);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#eff6ff';
        ctx.beginPath();
        ctx.arc(b.x + Math.cos(b.angle) * r * 0.2, y + Math.sin(b.angle) * r * 0.2, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        // Sombra no chão
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, r * 0.9, r * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// --- RAIO DO GUDRAN (Fúria, js/systems/fury.js) ---
// Sai da ponta do cajado e cruza a tela toda na direção da mira. Camadas aditivas (largas e fracas por fora, fina e branca no
// meio), um pulso de largura a cada tique de dano, faíscas correndo pela linha e um clarão na ponta do cajado. Só traços e círculos.
export function renderFuryBeam() {
    if (!beamActive()) return;
    const F = getFury();
    const t = state.runTime;
    const a = furyBeam.angle;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    // Origem: a esfera do cajado, à frente e acima do herói
    const sx = player.x + dx * 22;
    const sy = player.y - 14 + dy * 22;
    const ex = sx + dx * BEAM_LENGTH;
    const ey = sy + dy * BEAM_LENGTH;
    const grow = Math.min(1, furyBeam.age / 0.18);                       // abre em 0,18 s
    const pulse = 1 + 0.12 * Math.sin(t * 38) + furyBeam.pulse * 0.25;
    furyBeam.pulse = Math.max(0, furyBeam.pulse - 0.1);
    const w = F.width * grow;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const [mul, color, alpha] of [[2.1, '#2563eb', 0.14], [1.5, '#3b82f6', 0.22], [1.0, '#60a5fa', 0.4], [0.5, '#bfdbfe', 0.75], [0.2, '#ffffff', 1]]) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = Math.max(1, w * mul * pulse);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
    }
    // Faíscas correndo pela linha
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#eff6ff';
    for (let i = 0; i < 16; i++) {
        const k = ((t * 1.6 + i / 16) % 1);
        const d = k * 900;
        const side = Math.sin(i * 12.9 + Math.floor(t * 8) * 1.7) * w * 0.6;
        ctx.beginPath();
        ctx.arc(sx + dx * d - dy * side, sy + dy * d + dx * side, 1.6 + (1 - k) * 1.8, 0, Math.PI * 2);
        ctx.fill();
    }
    // Escudo azul em volta do herói (ele está invulnerável): bolha com brilho, borda que pulsa e hexágonos girando
    const sr = 30 + Math.sin(t * 6) * 1.5;
    drawGlow(ctx, '#3b82f6', player.x, player.y - 8, sr * 1.7, 0.55 * grow);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.16 * grow;
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.ellipse(player.x, player.y - 8, sr, sr * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (0.75 + 0.2 * Math.sin(t * 9)) * grow;
    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(player.x, player.y - 8, sr, sr * 1.05, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.5 * grow;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#93c5fd';
    for (let i = 0; i < 6; i++) {
        const a0 = t * 1.2 + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y - 8, sr * 0.9, a0, a0 + 0.55);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Clarão na origem
    drawGlow(ctx, '#93c5fd', sx, sy, w * 1.6 * pulse, 0.9);
    drawGlow(ctx, '#ffffff', sx, sy, w * 0.7 * pulse, 0.9);
    ctx.restore();
}

// --- ESCUDO DE RUNAS (js/systems/arcane.js) ---
// Um anel fraco no chão e as runas girando: cada uma é um disco azul com brilho e um glifo claro (traços), sem sprite.
// Abre crescendo e, no último meio segundo, pisca e some.
export function renderRuneShield() {
    const R = state.runeShield;
    if (R.left <= 0) return;
    const S = getRuneShield();
    if (!S) return;
    const open = Math.min(1, R.age / 0.2);
    const fade = R.left < 0.5 ? (Math.sin(R.left * 40) > 0 ? 0.5 : 1) * (R.left / 0.5) : 1;
    const radius = S.radius * (0.6 + 0.4 * open);
    ctx.save();
    ctx.globalAlpha = 0.35 * fade;
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.ellipse(player.x, player.y, radius, radius * 0.9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let k = 0; k < S.runes; k++) {
        const a = R.angle + (k / S.runes) * Math.PI * 2;
        const x = player.x + Math.cos(a) * radius;
        const y = player.y + Math.sin(a) * radius * 0.9 - 8;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade;
        drawGlow(ctx, '#3b82f6', x, y, S.runeRadius * 2.2, 0.7);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#1d4ed8';
        ctx.strokeStyle = '#bfdbfe';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, S.runeRadius * 0.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Glifo: uma haste e dois traços, girando com a runa
        const g = S.runeRadius * 0.45;
        const c = Math.cos(a * 1.5), s2 = Math.sin(a * 1.5);
        ctx.strokeStyle = '#eff6ff';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(x - c * g, y - s2 * g);
        ctx.lineTo(x + c * g, y + s2 * g);
        ctx.moveTo(x + s2 * g * 0.7, y - c * g * 0.7);
        ctx.lineTo(x, y);
        ctx.lineTo(x - s2 * g * 0.7, y + c * g * 0.7);
        ctx.stroke();
    }
    ctx.restore();
}
