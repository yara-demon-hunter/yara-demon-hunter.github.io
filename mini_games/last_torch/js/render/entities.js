import { BAT_VISUALS } from '../../data_model/visuals/monsters/bat_visual.js';
import { WITCH_VISUALS } from '../../data_model/visuals/monsters/witch_visual.js';
import { GOLD_VISUALS as G } from '../../data_model/visuals/items/gold_visual.js';
import { SLASH_VISUALS } from '../../data_model/visuals/effects/slash_visual.js';
import { ctx, state } from '../core/state.js';
import { renderBat } from './bat.js';
import { renderReflectedBolt } from './reflect.js';
import { renderWitch, renderWitchBolt } from './witch.js';
import { easeOutCubic } from './fx/easing.js';
import { drawGlow } from './fx/glow.js';

// --- ENTIDADES: Ouro, Golpes, Projéteis, Inimigos e Partículas ---
// Moedas de ouro dropadas pelos monstros (girando, com brilho)
export function renderGoldDrops() {
    const t = performance.now() / 1000;
    state.goldDrops.forEach(c => {
        const spin = Math.abs(Math.cos(t * 7 + c.phase));        // moeda girando (achata e abre)
        const r = G.radius;
        drawGlow(ctx, G.glowColor, c.x, c.y, r * 2.8, 0.55);
        ctx.fillStyle = G.edgeColor;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, Math.max(1, r * spin), r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = G.faceColor;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, Math.max(0.6, r * spin * 0.7), r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Slashes de Espada: cada passo do combo tem um visual próprio (data_model/visuals/effects/slash_visual.js)
// 1: corte que varre da direita para a esquerda
// 2: corte de volta, duplo e mais largo
// 3: corte pesado roxo
// whirl (skill passiva Giro Sombrio): giro de 360° com onda de choque
function strokeSweep(radius, from, to, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(0, 0, radius, from, to, to < from);
    ctx.stroke();
}

export function renderBladeSlashes() {
    const frenzyActive = state.frenzyActiveTimer > 0;

    state.bladeSlashes.forEach(s => {
        const look = s.spin ? SLASH_VISUALS.whirl : (SLASH_VISUALS[s.comboStep] || SLASH_VISUALS[1]);
        const progress = easeOutCubic(1 - (s.life / s.maxLife));
        const fadeOut = Math.min(1, (s.life / s.maxLife) * 3);

        // Ângulo inicial/final do varrido
        const half = s.arcWidth / 2;
        const start = look.spin ? -Math.PI : look.from * half;
        const end = look.spin ? Math.PI : look.to * half;
        const head = start + (end - start) * progress;
        const tail = start + (end - start) * Math.max(0, progress - look.tail);

        const color = frenzyActive ? SLASH_VISUALS.frenzyColor : look.color;
        const width = look.lineWidth + (frenzyActive ? SLASH_VISUALS.frenzyExtraWidth : 0);

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.globalAlpha = fadeOut;
        ctx.lineCap = 'round';
        ctx.shadowBlur = look.glow;
        ctx.shadowColor = color;

        for (let l = 0; l < look.lines; l++) {
            const r = s.radius * (0.88 + progress * 0.12) - l * SLASH_VISUALS.doubleLineGap;
            strokeSweep(r, tail, head, color, width - l * 2);
            // Rastro interno brilhante (Branco Neon)
            strokeSweep(r, tail, head, SLASH_VISUALS.coreColor, SLASH_VISUALS.coreWidth);
        }

        // Finalizador: onda de choque expandindo
        if (look.shockwave) {
            ctx.shadowBlur = 0;
            ctx.globalAlpha = fadeOut * (1 - progress) * 0.7;
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, s.radius * (0.3 + progress * 0.9), 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    });
}

export function renderEnemyProjectiles() {
    state.enemyProjectiles.forEach(p => {
        if (p.reflected) {
            renderReflectedBolt(p);
            return;
        }
        if (p.owner === 'WITCH') {
            renderWitchBolt(p);
            return;
        }
        drawGlow(ctx, 'rgba(245, 158, 11, 0.55)', p.x, p.y, p.radius * 3);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

export function renderEnemies() {
    state.enemies.forEach(e => {
        if (e.type === 'BAT') {
            renderBat(e);
        } else if (e.type === 'WITCH') {
            renderWitch(e);
        } else {
            // Brilho em cache (em vez de shadowBlur)
            drawGlow(ctx, e.color, e.x, e.y, e.radius * (e.type === 'BOSS' ? 2.6 : 2.1), 0.45);
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Barra de vida simples acima do inimigo
        if (e.hp < e.maxHp) {
            const bw = e.radius * 2;
            const barY = e.type === 'BAT' ? e.radius + BAT_VISUALS.healthBarOffset
                : e.type === 'WITCH' ? e.radius + WITCH_VISUALS.healthBarOffset
                : e.radius + 8;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.fillRect(e.x - bw / 2, e.y - barY, bw, 4);
            ctx.fillStyle = e.color;
            ctx.fillRect(e.x - bw / 2, e.y - barY, bw * (e.hp / e.maxHp), 4);
        }
    });
}

export function renderParticles() {
    ctx.save();
    state.particles.forEach(p => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}
