import { audio, player, state } from '../core/state.js';
import { dealDamage } from './damage.js';
import { addShockwave, createExplosion, shakeScreen } from './effects.js';
import { findNearestEnemy } from './combat.js';
import { mod } from './modifiers.js';
import { startCast } from './moves.js';
import { rootEnemy } from './skills_nature.js';
import { getRootSnare, getSpellDamage } from './stats.js';

// --- O DRUIDA (Rowan) ---
// ROOT SNARE: no lugar da adaga, raízes brotam onde ele aponta, prendendo e ferindo os monstros.
// Desenho: js/render/druid.js. As raízes usam as regras da Natureza (js/systems/skills_nature.js: rootEnemy).
const D = state.druid;
const COLOR = '#4ade80';

export function resetDruid() {
    D.snares.length = 0;
}

// --- ROOT SNARE ---
function aimPoint() {
    const S = getRootSnare();
    const input = state.knifeInput;
    let x;
    let y;
    if (input.stick.active || input.stick.fire || state.quake.touch) {
        // Celular: sem arrastar mira no monstro mais perto; arrastando, na direção do arraste
        const dragged = Math.hypot(input.stick.x, input.stick.y) > 0.3;
        if (dragged) {
            x = player.x + Math.cos(input.stick.aimAngle) * S.range * 0.75;
            y = player.y + Math.sin(input.stick.aimAngle) * S.range * 0.75;
        } else {
            const near = findNearestEnemy(player.x, player.y, S.range);
            x = near ? near.x : player.x + Math.cos(player.angle) * 120;
            y = near ? near.y : player.y + Math.sin(player.angle) * 120;
        }
    } else {
        x = input.x;
        y = input.y;
    }
    // Não passa do alcance
    const d = Math.hypot(x - player.x, y - player.y);
    if (d > S.range) {
        x = player.x + ((x - player.x) / d) * S.range;
        y = player.y + ((y - player.y) / d) * S.range;
    }
    return { x, y };
}

function castSnare() {
    const S = getRootSnare();
    const { x, y } = aimPoint();
    const damage = getSpellDamage() * S.damage;
    for (const e of state.enemies) {
        if (Math.hypot(e.x - x, e.y - y) > S.radius + e.radius) continue;
        dealDamage(e, damage, { noCrit: true, style: 'spell' });
        rootEnemy(e, S.rootSeconds);
    }
    D.snares.push({ x, y, radius: S.radius, age: 0, seconds: 0.7, seed: Math.random() * 6.283 });
    if (D.snares.length > 4) D.snares.shift();
    addShockwave(x, y, { radius: S.radius, color: COLOR, width: 6, seconds: 0.4 });
    createExplosion(x, y, '#166534', 12);
    player.angle = Math.atan2(y - player.y, x - player.x);
    startCast();
    shakeScreen(3);
    audio.playShackle(true);
}

function updateSnare(dt) {
    for (let i = D.snares.length - 1; i >= 0; i--) {
        D.snares[i].age += dt;
        if (D.snares[i].age >= D.snares[i].seconds) D.snares.splice(i, 1);
    }
    if (mod('rootSnare') <= 0) return;
    const S = getRootSnare();
    const wants = state.knifeInput.held || state.quake.touch || state.knifeInput.stick.fire;
    if (!wants || state.quake.timer > 0 || player.move || player.dashTimer > 0 || state.phase !== 'HUNT') return;
    state.quake.timer = S.cooldownSeconds;
    state.knifeInput.stick.fire = false;
    castSnare();
}

export function updateDruid(dt) {
    updateSnare(dt);
}
