import { SHADOW_RAVEN, SMOKE_BOMB } from '../../data_model/passives.js';
import { EVOLUTIONS } from '../../data_model/powers.js';
import { JUICE_VISUALS as J } from '../../data_model/visuals/effects/juice_visual.js';
import { audio, player, powers, state } from '../core/state.js';
import { syncBossBar } from '../ui/hud.js';
import { addDamageNumber, addShockwave, createExplosion, shakeScreen } from './effects.js';
import { onCritical } from './powers.js';
import { mod } from './modifiers.js';
import { getCritChance, getCritMultiplier } from './stats.js';

// --- DANO NOS MONSTROS ---
// Todo golpe do herói passa por aqui: crítico, clarão, número na tela, recuo e estatísticas.
// A morte em si é tratada em js/systems/enemies.js, no mesmo quadro ou no próximo.
// o: { kbX, kbY } empurrão; noCrit; crit = crítico certo; quiet = sem número (dano contínuo);
// style = cor do número pelo tipo de dano (spell, torch, shadow; sem style = lâmina e adaga, branco)
// Smoke Bomb: quem está dentro de uma nuvem leva cada golpe com uma chance extra de ser crítico
// (sorteada à parte da chance normal do herói)
// Strangling Grove: o monstro preso por raízes leva mais de tudo
function rootedBonus() {
    return (powers.graspingRoots.evolved ? EVOLUTIONS.graspingRoots.rootedDamage : 0) + mod('rootedDamage');
}

function inSmoke(e) {
    for (const s of state.smokes) {
        if (Math.hypot(e.x - s.x, e.y - s.y) < s.radius + e.radius) return true;
    }
    return false;
}

export function dealDamage(e, amount, o = {}) {
    if (e.hp <= 0 || e.invulnerable) return 0;
    // Golpe sem dano (a Fúria sob o Oath of the Wild): só empurra, sem piscar nem número
    if (amount <= 0) {
        if (o.kbX || o.kbY) {
            const resist = 1 - (e.knockbackResist ?? 0);
            e.vx += (o.kbX ?? 0) * resist;
            e.vy += (o.kbY ?? 0) * resist;
        }
        return 0;
    }
    const crit = o.crit || (!o.noCrit && (Math.random() < getCritChance() || (inSmoke(e) && Math.random() < SMOKE_BOMB.critChance)));
    const dmg = amount * (crit ? getCritMultiplier() : 1) * (e.ravenMark > 0 ? 1 + SHADOW_RAVEN.markDamage : 1)
        * (e.rooted > 0 ? 1 + rootedBonus() : 1);     // Strangling Grove: preso por raízes leva mais de tudo

    e.hp -= dmg;
    // Dano contínuo (quiet: veneno, videira, espinhos, queimadura...) não pisca nem faz o monstro "levar um golpe": a cada tique
    // isso reiniciaria o tranco sem parar (o rival, com corpo de herói, ficava se contorcendo)
    if (!o.quiet) e.hitFlash = J.hitFlashSeconds;
    state.run.damage += dmg;
    // Vampirismo do herói (Azael): parte do dano causado volta como vida. Dano contínuo (quiet) não conta
    if (!o.quiet && player.hp > 0 && mod('lifeSteal') > 0) player.hp = Math.min(player.maxHp, player.hp + dmg * mod('lifeSteal'));

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

// Queimadura: dano por segundo até o tempo acabar. Vale a mais forte, sem somar (js/systems/skills_flame.js)
export function ignite(e, dps, seconds) {
    e.burnDps = e.burnTimer > 0 ? Math.max(e.burnDps, dps) : dps;
    e.burnTimer = Math.max(e.burnTimer ?? 0, seconds);
}

// Explosão a favor do herói: fere e empurra todos os monstros no raio. Tem um limite por quadro para
// reações em cadeia não travarem o jogo.
export function blast(x, y, radius, damage, knockback, color = '#fb923c', style = null) {
    if (state.blastBudget <= 0) return;
    state.blastBudget--;

    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d > radius + e.radius) return;
        const a = Math.atan2(e.y - y, e.x - x);
        dealDamage(e, damage, { kbX: Math.cos(a) * knockback, kbY: Math.sin(a) * knockback, noCrit: true, style });
    });
    addShockwave(x, y, { radius, color, width: 5, seconds: 0.3 });
    createExplosion(x, y, color, 10);
    shakeScreen(3);
    audio.playBlast();
}
