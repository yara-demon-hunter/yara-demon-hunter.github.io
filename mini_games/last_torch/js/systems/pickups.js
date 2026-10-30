import { CHARACTER_MODEL } from '../../data_model/character.js';
import { PICKUP_DROP as D, PICKUP_MODELS, rollChestPoints, rollPickupType } from '../../data_model/pickups.js';
import { audio, player, state } from '../core/state.js';
import { showToast } from '../ui/banner.js';
import { updateHUD } from '../ui/hud.js';
import { blast } from './damage.js';
import { addFloater, addNumber, addShockwave, screenFlash, shakeScreen } from './effects.js';
import { mod } from './modifiers.js';
import { getAtkDamage } from './stats.js';
import { feedTorch } from './torch.js';

// --- ITENS NO CHÃO ---
function addPickup(type, x, y) {
    // Nasce dentro do mundo, longe da borda, para dar para pegar
    state.pickups.push({
        type,
        x: Math.max(30, Math.min(state.width - 30, x)),
        y: Math.max(60, Math.min(state.height - 30, y)),
        age: 0,
        phase: Math.random() * Math.PI * 2
    });
}

export function maybeDropPickup(x, y) {
    state.pickupPity++;
    if (state.pickups.length >= D.maxOnGround) return;
    const chance = D.chancePerKill * (1 + mod('pickupRate'));
    if (Math.random() >= chance && state.pickupPity < D.pityKills) return;
    state.pickupPity = 0;
    addPickup(rollPickupType(), x, y);
}

export function dropChest(x, y) {
    addPickup('CHEST', x, y);
}

function collect(p) {
    const model = PICKUP_MODELS[p.type];
    if (p.type === 'MEAT') {
        const heal = player.maxHp * model.healRatio;
        player.hp = Math.min(player.maxHp, player.hp + heal);
        addNumber(player.x, player.y - 40, heal, 1, 'heal');
    } else if (p.type === 'OIL') {
        feedTorch(model.torchHeal);
        addNumber(state.coreX, state.coreY - 72, model.torchHeal, 1, 'torch');
        addShockwave(state.coreX, state.coreY, { radius: 70, color: '#fdba74', width: 4, seconds: 0.4 });
    } else if (p.type === 'MAGNET') {
        state.magnetTimer = 1.6;
        addFloater(player.x, player.y - 40, 'MAGNET', model.color);
    } else if (p.type === 'NOVA') {
        state.blastBudget++;
        blast(player.x, player.y, Math.max(state.width, state.height), getAtkDamage() * model.damageRatio, model.knockback, '#fef08a');
        screenFlash('#fef9c3', 0.55);
        shakeScreen(12);
    } else if (p.type === 'CHEST') {
        const points = rollChestPoints() + mod('chestPoints');
        state.skillPoints += points;
        showToast('⚡', `+${points} skill points`, 'Spend them in the skill tree');
        audio.playChest();
        addShockwave(p.x, p.y, { radius: 120, color: '#fbbf24', width: 6, seconds: 0.5 });
        screenFlash('#fde68a', 0.3);
    }
    audio.playPickup(p.type);
    updateHUD();
}

export function updatePickups(dt) {
    const reach = D.radius + CHARACTER_MODEL.collisionRadius;
    for (let i = state.pickups.length - 1; i >= 0; i--) {
        const p = state.pickups[i];
        p.age += dt;
        if (Math.hypot(player.x - p.x, player.y - p.y) < reach) {
            state.pickups.splice(i, 1);
            collect(p);
        } else if (p.age >= D.lifeSeconds && p.type !== 'CHEST') {
            state.pickups.splice(i, 1);
        }
    }
}

// Fim da hora: o que sobrou no chão vem para o herói
export function collectAllPickups() {
    const list = state.pickups;
    state.pickups = [];
    list.forEach(collect);
}
