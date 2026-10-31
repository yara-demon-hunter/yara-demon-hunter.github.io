import { SHADOW_CLONE_VISUALS as V } from '../../data_model/visuals/characters/shadow_clone_visual.js';
import { SHADOW_CLONE } from '../../data_model/passives.js';
import { ctx, passives, shadowClones, state } from '../core/state.js';
import { drawGlow } from './fx/glow.js';
import { getDashedRing } from './fx/rings.js';
import { updateHeroAnim } from './player.js';
import { renderPlayer25D } from './player25d.js';

// --- SHADOW CLONE (passiva) ---
// O mesmo boneco 2.5D do herói, com animação própria (anda, vira e golpeia por conta) e a paleta de sombra de
// SHADOW_CLONE_VISUALS, semitransparente sobre uma aura violeta no chão.
// Em pé: barra de vida em cima da cabeça. Caída: anel no posto dela que enche até ela voltar.
function renderHpBar(c) {
    const B = V.hpBar;
    const x = c.x - B.width / 2;
    const y = c.y - B.offsetY;
    const ratio = Math.max(0, Math.min(1, c.hp / Math.max(1, c.maxHp)));
    ctx.fillStyle = B.back;
    ctx.fillRect(x, y, B.width, B.height);
    ctx.fillStyle = B.fill;
    ctx.fillRect(x, y, B.width * ratio, B.height);
    ctx.strokeStyle = B.border;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x, y, B.width, B.height);
}

function renderRespawnRing(c) {
    const R = V.respawnRing;
    const progress = 1 - c.respawnTimer / SHADOW_CLONE.respawnSeconds;
    ctx.save();
    ctx.lineWidth = R.width;
    ctx.strokeStyle = R.back;
    ctx.beginPath();
    ctx.arc(c.postX, c.postY, R.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = R.color;
    ctx.beginPath();
    ctx.arc(c.postX, c.postY, R.radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

// A área da tocha onde as sombras se movem: um disco fraco com a borda tracejada
function renderArea() {
    ctx.fillStyle = V.area.fill;
    ctx.beginPath();
    ctx.arc(state.coreX, state.coreY, SHADOW_CLONE.areaRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = V.area.edge;
    ctx.lineWidth = V.area.width;
    ctx.translate(state.coreX, state.coreY);
    ctx.stroke(getDashedRing(SHADOW_CLONE.areaRadius, V.area.dash));
    ctx.translate(-state.coreX, -state.coreY);
}

export function renderShadowClone() {
    if (passives.shadowClone.lvl <= 0) return;
    renderArea();
    for (const c of shadowClones) {
        if (c.respawnTimer > 0) {
            renderRespawnRing(c);
            continue;
        }
        if (!c.active) continue;
        updateHeroAnim(c.anim, c);
        // Surge aos poucos (ao aprender, ao evoluir e ao voltar)
        const appear = Math.min(1, (performance.now() - c.spawnTime) / 1000 / V.spawnSeconds);
        ctx.save();
        drawGlow(ctx, V.auraColor, c.x, c.y, V.auraRadius, appear);
        ctx.globalAlpha = V.alpha * appear;
        renderPlayer25D(c, c.anim, V.colors);
        ctx.globalAlpha = appear;
        renderHpBar(c);
        ctx.restore();
    }
}
