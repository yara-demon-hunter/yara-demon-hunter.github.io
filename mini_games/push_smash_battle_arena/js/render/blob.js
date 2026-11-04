import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { CHARACTER_ATLAS as A, FX } from '../../data_model/visuals/sprites.js';
import { groundYAt } from '../core/arena.js';
import { ctx } from '../core/canvas.js';
import { state } from '../core/state.js';
import { ANIM_START, artFor, CELL_UNITS, frameRect, getCharacterAtlas, hasLivePupils } from './character_sprites.js';
import { drawGlow, getShadowSprite } from './fx/sprites.js';

// --- DESENHO DOS LUTADORES ---
// Guarda só o que o desenho precisa (o replay do K.O. repete esses instantâneos).
export function snap(p) {
    return {
        char: p.charIndex, x: p.x, y: p.y, r: p.radius, sx: p.sx, sy: p.sy, vx: p.vx, vy: p.vy,
        alive: p.isAlive, stun: p.stunTimer, taunt: p.tauntTimer, shield: p.hasShield,
        facing: p.facing, pound: p.isPounding, dashing: p.isDashing, grounded: p.isGrounded,
        runPhase: p.runPhase, bomb: state.bombHolder === p, color: p.color, t: state.frameCount,
        speed: p.speedTimer > 0, knock: p.knockTimer > 0
    };
}

// Escolhe a animação e o quadro de acordo com o que o lutador está fazendo
function pickFrame(s) {
    const count = (anim) => A.anims[anim];
    let anim;
    let i = 0;
    if (s.stun > 0) { anim = 'stun'; i = Math.floor(s.t / 6) % count('stun'); }
    else if (s.pound) anim = 'pound';
    else if (s.bomb) { anim = 'scared'; i = Math.floor(s.t / 6) % count('scared'); }
    else if (s.taunt > 0) { anim = 'taunt'; i = Math.floor(s.t / 5) % count('taunt'); }
    else if (s.dashing) anim = 'dash';
    else if (!s.grounded) { anim = 'jump'; i = s.vy < 0 ? 0 : 1; }
    else if (Math.abs(s.vx) > 1) { anim = 'run'; i = Math.floor(s.runPhase) % count('run'); }
    else { anim = 'idle'; i = Math.floor(s.t / A.idleFrameFrames) % count('idle'); }
    return { anim, i, k: ANIM_START[anim] + i };
}

const HALF = CELL_UNITS / 2;

function stampFrame(s, k, alpha = 1) {
    const atlas = getCharacterAtlas(s.char);
    const f = frameRect(atlas, k);
    ctx.globalAlpha = alpha;
    ctx.drawImage(atlas.canvas, f.sx, f.sy, f.size, f.size, -HALF, -HALF, CELL_UNITS, CELL_UNITS);
    ctx.globalAlpha = 1;
}

// Rastro do dash: o quadro de dash, esmaecido, nas posições anteriores
export function drawGhost(s, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(s.facing, 1);
    ctx.scale(s.r, s.r);
    stampFrame(s, ANIM_START.dash, t.alpha * S.ghostAlpha);
    ctx.restore();
}

function drawShadow(s) {
    const ground = groundYAt(s.x);
    if (ground === null) return;
    const height = ground - (s.y + s.r);
    if (height < -6) return;
    const alpha = FX.shadow.alpha * Math.max(0, 1 - height / FX.shadow.fadeHeight);
    const w = s.r * 2 * FX.shadow.widthRatio * (1 - Math.min(0.5, height / 500));
    ctx.globalAlpha = alpha;
    ctx.drawImage(getShadowSprite(), s.x - w / 2, ground - 2, w, w * FX.shadow.heightRatio * 2);
    ctx.globalAlpha = 1;
}

export function drawBlob(s) {
    if (!s.alive) return;
    const r = s.r;
    drawShadow(s);

    // Brilho dos buffs (sem shadowBlur)
    if (s.knock) drawGlow(ctx, '#a55eea', s.x, s.y, r * 2.3, 0.55 + 0.15 * Math.sin(s.t * 0.3));
    else if (s.speed) drawGlow(ctx, '#ffd32a', s.x, s.y, r * 2.1, 0.5 + 0.15 * Math.sin(s.t * 0.3));

    ctx.save();
    ctx.translate(s.x, s.y + r * (1 - s.sy)); // mantém os "pés" no chão ao achatar
    ctx.scale(s.sx, s.sy);

    // Escudo
    if (s.shield) {
        ctx.beginPath();
        ctx.arc(0, 0, r + 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(38, 222, 129, 0.12)';
        ctx.fill();
        ctx.strokeStyle = '#26de81';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Lutador: um drawImage do atlas, espelhado para o lado em que olha
    const { anim, i, k } = pickFrame(s);
    ctx.scale(s.facing, 1);
    ctx.scale(r, r);
    stampFrame(s, k);

    // Pupilas ao vivo: acompanham a velocidade
    const art = artFor(s.char);
    if (art.liveEyes !== false && hasLivePupils(anim, i)) {
        const eye = art.eye ?? S.eye;
        const lx = Math.max(-1, Math.min(1, (s.vx * s.facing) / 10)) * S.pupilReach;
        const ly = Math.max(-1, Math.min(1, s.vy / 10)) * S.pupilReach;
        ctx.fillStyle = S.pupil;
        eye.x.forEach((ex) => {
            ctx.beginPath();
            ctx.arc(ex + lx + 0.03, eye.y + ly, S.pupilRadius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.fillStyle = '#ffffff';
        eye.x.forEach((ex) => {
            ctx.beginPath();
            ctx.arc(ex + lx + 0.07, eye.y + ly - 0.05, S.pupilRadius * 0.35, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    ctx.restore();

    // Setinha com a cor do jogador (os dois podem escolher o mesmo bicho)
    const m = S.marker;
    const top = s.y - r * s.sy * 1.15 - m.gap;
    ctx.beginPath();
    ctx.moveTo(s.x - m.size, top - m.size);
    ctx.lineTo(s.x + m.size, top - m.size);
    ctx.lineTo(s.x, top);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(8, 10, 20, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bomba na cabeça
    if (s.bomb) {
        const bx = s.x;
        const by = top - m.size - 14;
        ctx.beginPath();
        ctx.arc(bx, by, 10, 0, Math.PI * 2);
        ctx.fillStyle = state.bombTimer < 90 && state.frameCount % 10 < 5 ? '#ff4757' : '#2f3542';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawGlow(ctx, '#ff7f50', bx + 6, by - 11, 6 + Math.random() * 3, 0.9);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(state.bombTimer / 60), bx, by + 4);
    }
}
