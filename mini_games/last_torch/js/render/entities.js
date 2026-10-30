import { DEMON_LORD_VISUALS } from '../../data_model/visuals/bosses/demon_lord_visual.js';
import { BAT_VISUALS } from '../../data_model/visuals/monsters/bat_visual.js';
import { WITCH_VISUALS } from '../../data_model/visuals/monsters/witch_visual.js';
import { GOLD_VISUALS as G } from '../../data_model/visuals/items/gold_visual.js';
import { SLASH_VISUALS } from '../../data_model/visuals/effects/slash_visual.js';
import { KNIFE_VISUALS as K } from '../../data_model/visuals/effects/knife_visual.js';
import { SKELETON_VISUALS } from '../../data_model/visuals/monsters/skeleton_visual.js';
import { VAMPIRE_VISUALS } from '../../data_model/visuals/monsters/vampire_visual.js';
import { FAN_OF_KNIVES } from '../../data_model/passives.js';
import { ctx, passives, player, state } from '../core/state.js';
import { getKnifeRange } from '../systems/knives.js';
import { renderBat } from './bat.js';
import { renderDemonFireball, renderDemonLord } from './demon_lord.js';
import { drawDagger } from './knife.js';
import { renderReflectedBolt } from './reflect.js';
import { renderSkeleton } from './skeleton.js';
import { renderVampire } from './vampire.js';
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

// Onda de ar cortante: meia-lua afinando nas pontas, de startRatio até o raio de alcance
function fillAirWave(radius, half, thickness, color, alpha) {
    const W = SLASH_VISUALS.wave;
    const n = W.segments;
    const pointAt = (i, r) => {
        const a = -half + (2 * half * i) / n;
        return [Math.cos(a) * r, Math.sin(a) * r];
    };

    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
        const [x, y] = pointAt(i, radius);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (let i = n; i >= 0; i--) {
        const taper = Math.sin(Math.PI * i / n);
        const [x, y] = pointAt(i, Math.max(0, radius - thickness * taper));
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.globalAlpha = alpha * W.alpha;
    ctx.fillStyle = color;
    ctx.fill();

    // Fio brilhante na frente da onda
    ctx.globalAlpha = alpha * W.edgeAlpha;
    ctx.strokeStyle = SLASH_VISUALS.coreColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, -half * 0.85, half * 0.85);
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
        ctx.lineCap = 'round';

        // Onda de ar viajando da lâmina até o círculo (o giro já tem a onda de choque)
        if (!look.spin) {
            const W = SLASH_VISUALS.wave;
            const travel = s.radius * (W.startRatio + (1 - W.startRatio) * progress);
            fillAirWave(travel, half, width * W.thicknessScale, color, Math.sqrt(1 - progress));
        }

        for (let l = 0; l < look.lines; l++) {
            const r = s.radius * (0.88 + progress * 0.12) - l * SLASH_VISUALS.doubleLineGap;
            // Brilho: traços largos e translúcidos por baixo (bem mais barato que shadowBlur)
            ctx.globalAlpha = fadeOut * 0.12;
            strokeSweep(r, tail, head, color, width + look.glow);
            ctx.globalAlpha = fadeOut * 0.22;
            strokeSweep(r, tail, head, color, width + look.glow * 0.45);
            ctx.globalAlpha = fadeOut;
            strokeSweep(r, tail, head, color, width - l * 2);
            // Rastro interno brilhante (Branco Neon)
            strokeSweep(r, tail, head, SLASH_VISUALS.coreColor, SLASH_VISUALS.coreWidth);
        }

        // Finalizador: onda de choque expandindo
        if (look.shockwave) {
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
        if (p.owner === 'DEMON_LORD') {
            renderDemonFireball(p);
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
        } else if (e.type === 'SKELETON') {
            renderSkeleton(e);
        } else if (e.type === 'VAMPIRE') {
            renderVampire(e);
        } else if (e.type === 'DEMON_LORD') {
            renderDemonLord(e);
        } else {
            // Brilho em cache (em vez de shadowBlur)
            drawGlow(ctx, e.color, e.x, e.y, e.radius * (e.isBoss ? 2.6 : 2.1), 0.45);
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
                : e.type === 'SKELETON' ? e.radius + SKELETON_VISUALS.healthBarOffset
                : e.type === 'VAMPIRE' ? e.radius + VAMPIRE_VISUALS.healthBarOffset
                : e.type === 'DEMON_LORD' ? e.radius + DEMON_LORD_VISUALS.healthBarOffset
                : e.radius + 8;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.fillRect(e.x - bw / 2, e.y - barY, bw, 4);
            ctx.fillStyle = e.color;
            ctx.fillRect(e.x - bw / 2, e.y - barY, bw * (e.hp / e.maxHp), 4);
        }
    });
}

// Mira do botão da adaga (toque): linhas tracejadas saindo do herói, uma por adaga do leque.
// Mais apagada enquanto a adaga recarrega.
export function renderKnifeAim() {
    const { stick } = state.knifeInput;
    if (!stick.active || state.gameState !== 'PLAYING') return;
    const count = passives.fanOfKnives.lvl > 0 ? FAN_OF_KNIVES.count : 1;
    const spread = (FAN_OF_KNIVES.spreadDegrees * Math.PI) / 180;
    const length = getKnifeRange() * 0.45;

    ctx.save();
    ctx.strokeStyle = K.colors.trail;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.setLineDash([6, 8]);
    ctx.globalAlpha = state.knifeTimer > 0 ? 0.25 : 0.55;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
        const a = stick.aimAngle + (i - (count - 1) / 2) * spread;
        ctx.moveTo(player.x + Math.cos(a) * 18, player.y + Math.sin(a) * 18);
        ctx.lineTo(player.x + Math.cos(a) * length, player.y + Math.sin(a) * length);
    }
    ctx.stroke();
    ctx.restore();
}

// Adaga de arremesso: voa na altura da mão (sombra no chão marca a posição real), com brilho frio,
// riscos de velocidade e cópias apagadas atrás. Desenho da adaga em js/render/knife.js
export function renderKnives() {
    const t = performance.now() / 1000;
    state.knives.forEach(k => {
        const y = k.y - K.flightHeight;
        const trail = Math.min(1, k.travelled / 40);

        ctx.fillStyle = K.colors.shadow;
        ctx.beginPath();
        ctx.ellipse(k.x, k.y, K.shadowLength, K.shadowWidth, k.angle, 0, Math.PI * 2);
        ctx.fill();

        drawGlow(ctx, K.colors.glow, k.x, y, K.glowRadius, 0.55);

        ctx.save();
        ctx.translate(k.x, y);
        ctx.rotate(k.angle);

        // Riscos de velocidade
        ctx.strokeStyle = K.colors.trail;
        ctx.lineCap = 'round';
        ctx.lineWidth = 0.8;
        [-2.2, 0, 2.2].forEach((side, i) => {
            ctx.globalAlpha = 0.35 * trail;
            ctx.beginPath();
            ctx.moveTo(-6 - K.trailLength * (i === 1 ? 1 : 0.7) * trail, side);
            ctx.lineTo(-6, side);
            ctx.stroke();
        });

        // Cópias apagadas da adaga (rastro)
        for (let g = K.ghostCount; g >= 1; g--) {
            ctx.save();
            ctx.globalAlpha = 0.28 * (1 - g / (K.ghostCount + 1)) * trail;
            ctx.translate(-g * K.ghostGap * trail, 0);
            ctx.scale(K.flightScale, K.flightScale);
            ctx.translate(-K.shape.centerX, 0);
            drawDagger(ctx, t);
            ctx.restore();
        }

        ctx.globalAlpha = 1;
        ctx.scale(K.flightScale, K.flightScale);
        ctx.translate(-K.shape.centerX, 0);
        drawDagger(ctx, t);
        ctx.restore();
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
