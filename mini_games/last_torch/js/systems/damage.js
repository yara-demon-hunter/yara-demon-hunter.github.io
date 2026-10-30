import { JUICE_VISUALS as J } from '../../data_model/visuals/effects/juice_visual.js';
import { audio, state } from '../core/state.js';
import { syncBossBar } from '../ui/hud.js';
import { addDamageNumber, addShockwave, createExplosion, shakeScreen } from './effects.js';
import { onCritical } from './powers.js';
import { getCritChance, getCritMultiplier } from './stats.js';

// --- DANO NOS MONSTROS ---
// Todo golpe do herói passa por aqui: crítico, clarão, número na tela, recuo e estatísticas.
// A morte em si é tratada em js/systems/enemies.js, no mesmo quadro ou no próximo.
// o: { kbX, kbY } empurrão; noCrit; quiet = sem número (dano contínuo); style = estilo do número
export function dealDamage(e, amount, o = {}) {
    if (e.hp <= 0) return 0;
    const crit = !o.noCrit && Math.random() < getCritChance();
    const dmg = amount * (crit ? getCritMultiplier() : 1);

    e.hp -= dmg;
    e.hitFlash = J.hitFlashSeconds;
    state.run.damage += dmg;

    if (o.kbX || o.kbY) {
        const resist = 1 - (e.knockbackResist ?? 0);
        e.vx += (o.kbX ?? 0) * resist;
        e.vy += (o.kbY ?? 0) * resist;
        e.recoilX = Math.sign(o.kbX ?? 0);
        e.recoilY = Math.sign(o.kbY ?? 0);
    }
    if (!o.quiet) addDamageNumber(e.x, e.y - e.radius - 4, dmg, crit, crit ? null : o.style);
    if (crit) {
        audio.playCrit();
        createExplosion(e.x, e.y, '#fde047', 4);
        onCritical(e);
    }
    if (e === state.currentBoss) syncBossBar();
    return dmg;
}

// Explosão a favor do herói: fere e empurra todos os monstros no raio. Tem um limite por quadro para
// reações em cadeia não travarem o jogo.
export function blast(x, y, radius, damage, knockback, color = '#fb923c') {
    if (state.blastBudget <= 0) return;
    state.blastBudget--;

    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d > radius + e.radius) return;
        const a = Math.atan2(e.y - y, e.x - x);
        dealDamage(e, damage, { kbX: Math.cos(a) * knockback, kbY: Math.sin(a) * knockback, noCrit: true });
    });
    addShockwave(x, y, { radius, color, width: 5, seconds: 0.3 });
    createExplosion(x, y, color, 10);
    shakeScreen(3);
    audio.playBlast();
}
