import { DEMON_LORD_VISUALS } from '../../data_model/visuals/bosses/demon_lord_visual.js';
import { BOSS_PALETTES } from '../../data_model/visuals/bosses/palettes_visual.js';
import { JUICE_VISUALS as J } from '../../data_model/visuals/effects/juice_visual.js';
import { KNIFE_VISUALS as K } from '../../data_model/visuals/effects/knife_visual.js';
import { POWERS_VISUALS } from '../../data_model/visuals/effects/powers_visual.js';
import { SLASH_VISUALS } from '../../data_model/visuals/effects/slash_visual.js';
import { SHADOW_CLONE_VISUALS } from '../../data_model/visuals/characters/shadow_clone_visual.js';
import { BAT_VISUALS } from '../../data_model/visuals/monsters/bat_visual.js';
import { BLOATER_VISUALS } from '../../data_model/visuals/monsters/bloater_visual.js';
import { MOTH_VISUALS } from '../../data_model/visuals/monsters/moth_visual.js';
import { SKELETON_VISUALS } from '../../data_model/visuals/monsters/skeleton_visual.js';
import { SPRITE_FRAMES } from '../../data_model/visuals/monsters/sprites_visual.js';
import { VAMPIRE_VISUALS } from '../../data_model/visuals/monsters/vampire_visual.js';
import { WITCH_VISUALS } from '../../data_model/visuals/monsters/witch_visual.js';
import { ZOMBIE_WOLF_VISUALS } from '../../data_model/visuals/monsters/zombie_wolf_visual.js';
import { HEADLESS_KNIGHT_VISUALS } from '../../data_model/visuals/monsters/headless_knight_visual.js';
import { WRAITH_VISUALS } from '../../data_model/visuals/monsters/wraith_visual.js';
import { knightHeadPosition } from './headless_knight.js';
import { BOSS_MODELS } from '../../data_model/bosses.js';
import { FAN_OF_KNIVES } from '../../data_model/passives.js';
import { ctx, passives, player, state } from '../core/state.js';
import { getKnifeChargeRatio, getKnifeRange } from '../systems/knives.js';
import { renderDemonLord } from './demon_lord.js';
import { easeOutCubic } from './fx/easing.js';
import { drawGlow } from './fx/glow.js';
import { getDashedRing } from './fx/rings.js';
import { COIN_SIZE, DAGGER_LENGTH, DAGGER_WIDTH, getCoinAtlas, getDaggerSprite } from './fx/sprites.js';
import { resetWorldView, stamp } from './fx/stamp.js';
import { getBoltSprite, getMonsterSprite, withColors } from './monster_sprites.js';
import { renderReflectedBolt } from './reflect.js';
import { renderVampire } from './vampire.js';

const TAU = Math.PI * 2;

// --- ENTIDADES: Ouro, Golpes, Projéteis, Inimigos e Partículas ---
// Moedas de ouro dropadas pelos monstros (girando, com brilho): quadros de um atlas
export function renderGoldDrops() {
    if (state.goldDrops.length === 0) return;
    const { canvas, cell, frames } = getCoinAtlas();
    const t = performance.now() / 1000;
    const half = COIN_SIZE / 2;
    for (const c of state.goldDrops) {
        const frame = Math.floor(t * 12 + c.phase * 3) % frames;
        ctx.drawImage(canvas, frame * cell, 0, cell, cell, c.x - half, c.y - half, COIN_SIZE, COIN_SIZE);
    }
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

// Rastro de riscos entre a lâmina e a onda: um risco a cada trailSpacing px do caminho já
// percorrido, então alcances grandes ganham mais riscos e o corte parece contínuo
function strokeWaveTrail(startRadius, frontRadius, half, color, alpha) {
    const W = SLASH_VISUALS.wave;
    const count = Math.min(W.trailMaxLines, Math.floor((frontRadius - startRadius) / W.trailSpacing));
    ctx.strokeStyle = color;
    for (let i = 1; i <= count; i++) {
        const k = i / (count + 1);                 // 0 = colado na onda, 1 = perto da lâmina
        const r = frontRadius - (frontRadius - startRadius) * k;
        const span = half * (0.8 - k * 0.3);       // riscos mais curtos perto da lâmina
        ctx.globalAlpha = alpha * W.trailAlpha * (1 - k);
        ctx.lineWidth = Math.max(1, W.trailWidth * (1 - k * 0.5));
        ctx.beginPath();
        ctx.arc(0, 0, r, -span, span);
        ctx.stroke();
    }
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

        // Golpes do Shadow Clone em violeta escuro
        const color = s.shadow
            ? (frenzyActive ? SHADOW_CLONE_VISUALS.slashFrenzyColor : SHADOW_CLONE_VISUALS.slashColor)
            : (frenzyActive ? SLASH_VISUALS.frenzyColor : look.color);
        const width = look.lineWidth + (frenzyActive ? SLASH_VISUALS.frenzyExtraWidth : 0);

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.lineCap = 'round';

        // Onda de ar viajando da lâmina até o círculo (o giro já tem a onda de choque)
        if (!look.spin) {
            const W = SLASH_VISUALS.wave;
            const startRadius = s.radius * W.startRatio;
            const travel = startRadius + (s.radius - startRadius) * progress;
            const waveAlpha = Math.sqrt(1 - progress);
            strokeWaveTrail(startRadius, travel, half, color, waveAlpha);
            fillAirWave(travel, half, width * W.thicknessScale, color, waveAlpha);
        }

        for (let l = 0; l < look.lines; l++) {
            const r = s.radius * (0.88 + progress * 0.12) - l * SLASH_VISUALS.doubleLineGap;
            // Brilho: um traço largo e translúcido por baixo (bem mais barato que shadowBlur)
            ctx.globalAlpha = fadeOut * 0.26;
            strokeSweep(r, tail, head, color, width + look.glow * 0.6);
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
    if (state.enemyProjectiles.length === 0) return;
    for (const p of state.enemyProjectiles) {
        if (p.reflected) {
            resetWorldView();
            renderReflectedBolt(p);
            continue;
        }
        const sprite = getBoltSprite(p.owner, p.color, p.radius);
        const k = p.radius / sprite.radius;
        const rotation = Math.atan2(p.vy, p.vx);
        // O miolo do tiro fica à frente do centro do sprite: compensa para ele cair em (p.x, p.y)
        const shift = sprite.centerShift * k;
        stamp(sprite.canvas, 0, 0, sprite.canvas.width, sprite.canvas.height,
            p.x - Math.cos(rotation) * shift, p.y - Math.sin(rotation) * shift,
            rotation, sprite.width * k, sprite.height * k);
    }
    resetWorldView();
}

// Corpo procedural: só bosses, que são poucos e têm animações de ataque próprias
function drawBoss(e) {
    const model = BOSS_MODELS[e.type];
    if (model.renderAs === 'VAMPIRE') withColors(VAMPIRE_VISUALS, BOSS_PALETTES[model.palette], () => renderVampire(e));
    else withColors(DEMON_LORD_VISUALS, BOSS_PALETTES[model.palette], () => renderDemonLord(e));
}

// Aura e sombra no chão, sob todos os monstros
function renderUnderlays() {
    if (state.quality >= 2) return;
    for (const e of state.enemies) {
        if (e.isBoss) continue;
        const sprite = getMonsterSprite(e.type);
        const size = sprite.underlaySize * (e.radius / sprite.radius);
        ctx.drawImage(sprite.underlay, e.x - size / 2, e.y - size / 2, size, size);
    }
}

// Corpo do monstro: um carimbo do atlas. Balanço, flutuação e investida são aplicados aqui
function stampMonster(e, t) {
    const sprite = getMonsterSprite(e.type);
    const { spec, cell, atlas } = sprite;
    const k = e.radius / sprite.radius;
    let rotation = e.facing ?? e.angle;
    let width = sprite.worldSize * k;
    let height = width;
    let x = e.x;
    let y = e.y;

    if (e.hitFlash > 0) {
        const flash = e.hitFlash / J.hitFlashSeconds;
        x += (e.recoilX ?? 0) * J.hitRecoil * flash;
        y += (e.recoilY ?? 0) * J.hitRecoil * flash;
    }
    if (spec.wobbleAmount) rotation += Math.sin(t * spec.wobbleHz * TAU + e.phase) * spec.wobbleAmount;
    if (spec.floatAmount) y -= Math.sin(t * spec.floatHz * TAU + e.phase) * e.radius * spec.floatAmount * 1.5;
    if (e.lungeState === 2) {
        rotation = Math.atan2(e.lungeY, e.lungeX);
        width *= 1.4;
        height *= 0.85;
    }

    const cycle = (t / spec.playSeconds + e.phase / TAU) % 1;
    const frame = Math.floor(cycle * SPRITE_FRAMES);
    stamp(atlas, frame * cell, 0, cell, cell, x, y, rotation, width, height);
}

// Anel girando em volta do elite, para ser reconhecido de longe
function renderEliteMark(e) {
    const E = POWERS_VISUALS.elite;
    const r = e.radius * 1.5 + E.ringGap;
    drawGlow(ctx, e.elite.color, e.x, e.y, r * 1.5, 0.26);
    ctx.strokeStyle = e.elite.color;
    ctx.lineWidth = E.ringWidth;
    ctx.translate(e.x, e.y);
    ctx.stroke(getDashedRing(r, 8));
    ctx.translate(-e.x, -e.y);
}

// Bruxa e necromante carregando: a mão brilha antes do tiro
function renderCastGlow(e, charge) {
    const f = e.facing ?? e.angle;
    const reach = e.radius * WITCH_VISUALS.scale * 0.95;
    const hand = e.radius * WITCH_VISUALS.scale * 0.26;
    const x = e.x + Math.cos(f) * reach - Math.sin(f) * hand;
    const y = e.y + Math.sin(f) * reach + Math.cos(f) * hand;
    drawGlow(ctx, e.type === 'WITCH' ? WITCH_VISUALS.colors.orbGlow : 'rgba(34, 197, 94, 0.85)', x, y, e.radius * (0.4 + charge), 0.9);
}

// Altura da barra de vida acima do monstro
const HEALTH_BAR_OFFSETS = {
    BAT: BAT_VISUALS.healthBarOffset,
    WITCH: WITCH_VISUALS.healthBarOffset,
    NECROMANCER: WITCH_VISUALS.healthBarOffset,
    SKELETON: SKELETON_VISUALS.healthBarOffset,
    VAMPIRE: VAMPIRE_VISUALS.healthBarOffset,
    MOTH: MOTH_VISUALS.healthBarOffset,
    BLOATER: BLOATER_VISUALS.healthBarOffset,
    WRAITH: WRAITH_VISUALS.healthBarOffset,
    ZOMBIE_WOLF: ZOMBIE_WOLF_VISUALS.healthBarOffset,
    HEADLESS_KNIGHT: HEADLESS_KNIGHT_VISUALS.healthBarOffset
};

// Tudo que vem por cima do corpo: clarão do golpe, gelo, mira, aviso de estouro e vida
function renderEnemyOverlays(t) {
    for (const e of state.enemies) {
        if (e.hitFlash > 0) {
            ctx.globalCompositeOperation = 'lighter';
            drawGlow(ctx, '#ffffff', e.x, e.y, e.radius * 1.5, (e.hitFlash / J.hitFlashSeconds) * 0.75);
            ctx.globalCompositeOperation = 'source-over';
        }
        if (e.frozen > 0) {
            ctx.fillStyle = POWERS_VISUALS.frost.color;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius * 1.15, 0, TAU);
            ctx.fill();
        }
        if (!e.isBoss) {
            if (e.type === 'WITCH' || e.type === 'NECROMANCER') {
                const charge = 1 - e.shootTimer / WITCH_VISUALS.chargeSeconds;
                if (charge > 0) renderCastGlow(e, charge);
            } else if (e.type === 'WRAITH' && e.lungeState === 1) {
                drawGlow(ctx, WRAITH_VISUALS.colors.aimAura, e.x, e.y, e.radius * 2.6, 0.5);
            } else if (e.type === 'ZOMBIE_WOLF' && e.lungeState === 1) {
                drawGlow(ctx, ZOMBIE_WOLF_VISUALS.colors.aimAura, e.x, e.y, e.radius * 2.6, 0.55);
            } else if (e.type === 'HEADLESS_KNIGHT' && e.shootTimer > 0 && e.shootTimer < HEADLESS_KNIGHT_VISUALS.chargeSeconds) {
                // A cabeça acende os olhos antes do tiro
                const head = knightHeadPosition(e);
                const charge = 1 - e.shootTimer / HEADLESS_KNIGHT_VISUALS.chargeSeconds;
                drawGlow(ctx, HEADLESS_KNIGHT_VISUALS.colors.eyeGlow, head.x, head.y, e.radius * (0.7 + charge * 0.8), 0.9);
            } else if (e.type === 'BLOATER' && e.hp < e.maxHp) {
                const hurt = 1 - e.hp / e.maxHp;
                const pulse = 0.5 + 0.5 * Math.sin(t * (2 + hurt * 7) * TAU);
                drawGlow(ctx, BLOATER_VISUALS.colors.sacGlow, e.x, e.y, e.radius * 1.5, hurt * pulse * 0.6);
            }
        }

        // Barra de vida simples acima do inimigo (o boss tem a dele no HUD)
        if (e.hp < e.maxHp && !e.isBoss) {
            const bw = e.radius * 2;
            const barY = e.radius + (HEALTH_BAR_OFFSETS[e.type] ?? 8);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.fillRect(e.x - bw / 2, e.y - barY, bw, 4);
            ctx.fillStyle = e.elite ? e.elite.color : e.color;
            ctx.fillRect(e.x - bw / 2, e.y - barY, bw * Math.max(0, e.hp / e.maxHp), 4);
        }
    }
}

export function renderEnemies() {
    const t = performance.now() / 1000;
    renderUnderlays();

    for (const e of state.enemies) {
        if (e.elite) renderEliteMark(e);
    }
    for (const e of state.enemies) {
        if (!e.isBoss) stampMonster(e, t);
    }
    resetWorldView();

    for (const e of state.enemies) {
        if (e.isBoss) drawBoss(e);
    }
    renderEnemyOverlays(t);
}

// Soul Lance: anel que se fecha em volta do herói enquanto a adaga carrega
function renderKnifeCharge() {
    const ratio = getKnifeChargeRatio();
    if (ratio <= 0 || state.gameState !== 'PLAYING') return;
    if (ratio >= 1) drawGlow(ctx, K.colors.glow, player.x, player.y, 46, 0.8);
    ctx.save();
    ctx.strokeStyle = K.colors.edge;
    ctx.lineWidth = ratio >= 1 ? 4 : 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 30, -Math.PI / 2, -Math.PI / 2 + TAU * ratio);
    ctx.stroke();
    ctx.restore();
}

// Mira do botão da adaga (toque): linhas tracejadas saindo do herói, uma por adaga do leque.
// Mais apagada enquanto a adaga recarrega.
export function renderKnifeAim() {
    renderKnifeCharge();
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
// um risco de velocidade e cópias apagadas atrás. É um carimbo: o desenho fica em js/render/knife.js
export function renderKnives() {
    if (state.knives.length === 0) return;
    const dagger = getDaggerSprite();
    for (const k of state.knives) {
        const width = DAGGER_LENGTH * K.flightScale * k.scale;
        const height = DAGGER_WIDTH * K.flightScale * k.scale;
        const y = k.y - K.flightHeight;
        const trail = Math.min(1, k.travelled / 40);
        const dx = Math.cos(k.angle);
        const dy = Math.sin(k.angle);

        ctx.fillStyle = K.colors.shadow;
        ctx.beginPath();
        ctx.ellipse(k.x, k.y, K.shadowLength, K.shadowWidth, k.angle, 0, TAU);
        ctx.fill();
        drawGlow(ctx, K.colors.glow, k.x, y, K.glowRadius, 0.55);

        // Risco de velocidade
        ctx.strokeStyle = K.colors.trail;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.35 * trail;
        ctx.beginPath();
        ctx.moveTo(k.x - dx * 6, y - dy * 6);
        ctx.lineTo(k.x - dx * (6 + K.trailLength * trail), y - dy * (6 + K.trailLength * trail));
        ctx.stroke();

        // Cópias apagadas da adaga (rastro)
        for (let g = K.ghostCount; g >= 1; g--) {
            ctx.globalAlpha = 0.28 * (1 - g / (K.ghostCount + 1)) * trail;
            const back = g * K.ghostGap * trail;
            stamp(dagger, 0, 0, dagger.width, dagger.height, k.x - dx * back, y - dy * back, k.angle, width, height);
        }
        ctx.globalAlpha = 1;
        stamp(dagger, 0, 0, dagger.width, dagger.height, k.x, y, k.angle, width, height);
        resetWorldView();
    }
}

// Quadradinhos em vez de círculos: mesma leitura em movimento, bem menos trabalho
export function renderParticles() {
    let color = '';
    for (const p of state.particles) {
        ctx.globalAlpha = p.life / p.maxLife;
        if (p.color !== color) {
            color = p.color;
            ctx.fillStyle = color;
        }
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
}
