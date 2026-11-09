import { audio, player, state } from '../core/state.js';
import { getAxeQuake, getBladeDamage } from './stats.js';
import { dealDamage } from './damage.js';
import { addShockwave, createExplosion, screenFlash, shakeScreen } from './effects.js';
import { mod } from './modifiers.js';
import { startMove } from './moves.js';

// --- AXE QUAKE (Captain Brutos) ---
// No lugar da adaga: clique esquerdo (ou o botão do canto, no celular) ergue o machado e desce no chão. No instante do
// impacto uma onda de curto alcance atinge quem está em volta: dano alto, empurrão forte e atordoamento. A recarga
// (cooldownSeconds) corre com o botão segurado repetindo o golpe. Os valores (força, cooldown, alcance...) são do próprio
// personagem: `abilities.axeQuake` em data_model/characters/brutos.js. O desenho é o movimento 'quake' (js/render/player25d.js).
export function resetQuake() {
    state.quake.timer = 0;
    state.quake.touch = false;
}

function quakeImpact() {
    const { x, y } = player;
    const AXE_QUAKE = getAxeQuake();
    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d > AXE_QUAKE.radius + e.radius) return;
        const a = Math.atan2(e.y - y, e.x - x);
        dealDamage(e, getBladeDamage() * AXE_QUAKE.damage, { kbX: Math.cos(a) * AXE_QUAKE.knockback, kbY: Math.sin(a) * AXE_QUAKE.knockback, noCrit: true });
        if (!e.isBoss) e.stunned = Math.max(e.stunned ?? 0, AXE_QUAKE.stunSeconds);
    });
    addShockwave(x, y, { radius: AXE_QUAKE.radius, color: '#cbd5e1', width: 9, seconds: 0.4 });
    addShockwave(x, y, { radius: AXE_QUAKE.radius * 0.6, color: '#f1f5f9', width: 5, seconds: 0.3 });
    createExplosion(x, y, '#94a3b8', 18);
    screenFlash('#e2e8f0', 0.12);
    shakeScreen(9);
    audio.playBlast();
}

export function updateQuake(dt) {
    const q = state.quake;
    q.timer = Math.max(0, q.timer - dt);
    if (mod('axeQuake') <= 0) return;
    const wants = state.knifeInput.held || q.touch;
    if (!wants || q.timer > 0 || player.move || player.dashTimer > 0 || state.phase !== 'HUNT') return;
    q.timer = getAxeQuake().cooldownSeconds;
    startMove('quake', quakeImpact);
}
