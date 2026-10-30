import { SHADOW_CLONE } from '../../data_model/passives.js';
import { SHADOW_CLONE_VISUALS as V } from '../../data_model/visuals/characters/shadow_clone_visual.js';
import { ctx, passives, shadowClone as clone } from '../core/state.js';
import { drawGlow } from './fx/glow.js';
import { createHeroAnim, updateHeroAnim } from './player.js';
import { renderPlayer25D } from './player25d.js';

// --- SHADOW CLONE (passiva) ---
// O mesmo boneco 2.5D do herói, com animação própria (anda, vira e golpeia por conta) e a paleta
// de sombra de SHADOW_CLONE_VISUALS, semitransparente sobre uma aura violeta no chão.
// Vivo: barra de vida em cima da cabeça. Morto: anel no lugar dele que enche até ele voltar.
const cloneAnim = createHeroAnim();

function renderHpBar() {
    const B = V.hpBar;
    const x = clone.x - B.width / 2;
    const y = clone.y - B.offsetY;
    const ratio = Math.max(0, Math.min(1, clone.hp / Math.max(1, clone.maxHp)));
    ctx.fillStyle = B.back;
    ctx.fillRect(x, y, B.width, B.height);
    ctx.fillStyle = B.fill;
    ctx.fillRect(x, y, B.width * ratio, B.height);
    ctx.strokeStyle = B.border;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x, y, B.width, B.height);
}

function renderRespawnRing() {
    const R = V.respawnRing;
    const progress = 1 - clone.respawnTimer / SHADOW_CLONE.respawnSeconds;
    ctx.save();
    ctx.lineWidth = R.width;
    ctx.strokeStyle = R.back;
    ctx.beginPath();
    ctx.arc(clone.x, clone.y, R.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = R.color;
    ctx.beginPath();
    ctx.arc(clone.x, clone.y, R.radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

export function renderShadowClone() {
    if (passives.shadowClone.lvl <= 0) return;
    if (clone.respawnTimer > 0) {
        renderRespawnRing();
        return;
    }
    if (!clone.active) return;
    updateHeroAnim(cloneAnim, clone);

    // Surge aos poucos ao ser comprado (e ao voltar)
    const appear = Math.min(1, (performance.now() - clone.spawnTime) / 1000 / V.spawnSeconds);

    ctx.save();
    drawGlow(ctx, V.auraColor, clone.x, clone.y, V.auraRadius, appear);
    ctx.globalAlpha = V.alpha * appear;
    renderPlayer25D(clone, cloneAnim, V.colors);
    ctx.globalAlpha = appear;
    renderHpBar();
    ctx.restore();
}
