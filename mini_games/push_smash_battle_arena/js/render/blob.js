import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { CHARACTER_ATLAS as A, FX } from '../../data_model/visuals/sprites.js';
import { platform, surfaceBelow } from '../core/arena.js';
import { ctx } from '../core/canvas.js';
import { state } from '../core/state.js';
import { ANIM_START, artFor, CELL_UNITS, frameRect, getCharacterAtlas, hasLivePupils } from './character_sprites.js';
import { getShadowSprite } from './fx/sprites.js';

// --- DESENHO DOS LUTADORES ---
// Guarda só o que o desenho precisa (o replay do K.O. repete esses instantâneos).
export function snap(p) {
    return {
        char: p.charIndex, x: p.x, y: p.y, r: p.radius, sx: p.sx, sy: p.sy, vx: p.vx, vy: p.vy,
        alive: p.isAlive, stun: p.stunTimer, taunt: p.tauntTimer,
        facing: p.facing, pound: p.isPounding, dashing: p.isDashing, grounded: p.isGrounded,
        runPhase: p.runPhase, color: p.color, t: state.frameCount,
        aim: p.skyDrop > 0 || p.skyFalling
    };
}

// Escolhe a animação e o quadro de acordo com o que o lutador está fazendo
function pickFrame(s) {
    const count = (anim) => A.anims[anim];
    let anim;
    let i = 0;
    if (s.stun > 0) { anim = 'stun'; i = Math.floor(s.t / 6) % count('stun'); }
    else if (s.pound) anim = 'pound';
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
    const ground = surfaceBelow(s.x, s.y);
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

    ctx.save();
    ctx.translate(s.x, s.y + r * (1 - s.sy)); // mantém os "pés" no chão ao achatar
    ctx.scale(s.sx, s.sy);

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

}

// Mira do SKY DROP: no chão, logo abaixo de quem está lá no alto. Acende quando o rival está embaixo;
// fica vermelha quando não há chão embaixo (cair ali é cair da arena).
export function drawReticle(s, rival) {
    if (!s.aim) return;
    const R = FX.reticle;
    const ground = surfaceBelow(s.x, s.y + s.r);
    const gy = ground ?? platform.y;
    const locked = ground !== null && rival && rival.alive && Math.abs(rival.x - s.x) < rival.r + s.r * 0.5;
    const color = ground === null ? R.voidColor : locked ? R.lockColor : s.color;
    const pulse = 1 + 0.12 * Math.sin(s.t * (locked ? R.pulse * 2 : R.pulse));
    const closing = s.pound ? 0.55 + 0.45 * Math.min(1, Math.max(0, gy - s.y) / 500) : 1; // fecha enquanto ele cai
    const rx = R.radius * pulse * closing;
    const ry = rx * R.flatten;

    ctx.fillStyle = color;
    ctx.globalAlpha = locked ? 0.35 : 0.18;
    ctx.beginPath();
    ctx.ellipse(s.x, gy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Anel + quatro marcas girando
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = R.width;
    ctx.beginPath();
    ctx.ellipse(s.x, gy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    const spin = s.t * R.spin;
    ctx.beginPath();
    for (let k = 0; k < 4; k++) {
        const a = spin + k * Math.PI / 2;
        const c = Math.cos(a);
        const n = Math.sin(a);
        ctx.moveTo(s.x + c * rx * 0.45, gy + n * ry * 0.45);
        ctx.lineTo(s.x + c * rx * 1.35, gy + n * ry * 1.35);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s.x, gy, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}
