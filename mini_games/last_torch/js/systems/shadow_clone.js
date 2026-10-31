import { SHADOW_CLONE } from '../../data_model/passives.js';
import { EVOLUTIONS } from '../../data_model/powers.js';
import { BLADE_SKILL, FRENZY_NOVA_SKILL } from '../../data_model/skills.js';
import { SHADOW_CLONE_VISUALS } from '../../data_model/visuals/characters/shadow_clone_visual.js';
import { createHeroAnim } from '../render/player.js';
import { audio, passives, shadowClones as clones, state } from '../core/state.js';
import { executeBladeSlash, findNearestEnemy, hitEnemiesInArc } from './combat.js';
import { createExplosion } from './effects.js';
import { getAtkCooldown, getAtkDamage, getAtkRadius, getKnockback, getMaxPlayerHp, getSlashArcRadian } from './stats.js';

// --- SHADOW CLONE (passiva) ---
// Sombras que guardam a tocha. Elas se movem dentro de uma área em volta da chama (SHADOW_CLONE.areaRadius) e não
// saem dela. Cada uma espera parada no posto, a SHADOW_CLONE.postRadius da chama. Quando um monstro chega perto da
// área, a sombra mais livre anda em linha reta até ele (à velocidade dela, sem atalhos), golpeia com o combo do herói
// (js/systems/combat.js) e volta ao posto. Cada monstro chama uma sombra só, então as três da evolução
// espalham o serviço. Os monstros não correm atrás delas, mas quem esbarra nelas ou acerta um tiro nelas as machuca
// (js/systems/enemies.js chama damageShadowClone); caída, a sombra volta ao posto depois de SHADOW_CLONE.respawnSeconds.
const TAU = Math.PI * 2;

export function getCloneCount() {
    if (passives.shadowClone.lvl <= 0) return 0;
    return passives.shadowClone.evolved ? EVOLUTIONS.shadowClone.levels.count : 1;
}

// Posto de cada sombra: espalhadas em volta da tocha, a primeira acima dela
function setPost(c, index, count) {
    const angle = -Math.PI / 2 + (index / count) * TAU;
    c.postX = state.coreX + Math.cos(angle) * SHADOW_CLONE.postRadius;
    c.postY = state.coreY + Math.sin(angle) * SHADOW_CLONE.postRadius;
}

function getCloneMaxHp() {
    return Math.round(getMaxPlayerHp() * SHADOW_CLONE.hpRatio);
}

function reviveClone(c) {
    c.active = true;
    c.respawnTimer = 0;
    c.maxHp = getCloneMaxHp();
    c.hp = c.maxHp;
    c.iFrames = 0;
    c.spawnTime = performance.now();
    c.comboStep = 1;
    c.attackTimer = 0;
    c.frenzy = state.frenzyActiveTimer > 0;
    c.x = c.postX;
    c.y = c.postY;
    createExplosion(c.x, c.y, SHADOW_CLONE_VISUALS.spawnBurstColor, 18);
}

function spawnClone(index, count) {
    const c = {
        x: 0, y: 0, postX: 0, postY: 0,
        hp: 0, maxHp: 0,
        active: false,
        respawnTimer: 0,
        spawnTime: 0,
        angle: 0,
        attackTimer: 0,
        comboStep: 1,
        frenzy: false,
        iFrames: 0,
        hitDirX: 0, hitDirY: 0, hitTime: -100000,
        anim: createHeroAnim(false)
    };
    setPost(c, index, count);
    reviveClone(c);
    return c;
}

// Golpe recebido (contato com monstro ou tiro): mesmo empurrão visual e invulnerabilidade do herói
export function damageShadowClone(c, amount, fromX, fromY, invulnerableSeconds) {
    if (!c.active || c.iFrames > 0) return;
    c.hp -= amount;
    c.iFrames = invulnerableSeconds;
    const dx = c.x - fromX;
    const dy = c.y - fromY;
    const len = Math.hypot(dx, dy) || 1;
    c.hitDirX = dx / len;
    c.hitDirY = dy / len;
    c.hitTime = performance.now();

    if (c.hp <= 0) {
        c.hp = 0;
        c.active = false;
        c.respawnTimer = SHADOW_CLONE.respawnSeconds;
        createExplosion(c.x, c.y, SHADOW_CLONE_VISUALS.deathBurstColor, 26);
        audio.playExplode();
    } else {
        createExplosion(c.x, c.y, SHADOW_CLONE_VISUALS.deathBurstColor, 8);
    }
}

// Golpe próprio: mira o monstro mais perto dentro do círculo da sombra, com o combo dela
// (o 3º golpe vira giro com o Whirlwind, como no herói). O avanço do 3º golpe não vale: ela só anda pelo caminho.
function updateCloneAttack(c, dt) {
    c.attackTimer -= dt;
    if (c.attackTimer > 0) return;

    const radius = getAtkRadius() * SHADOW_CLONE.radiusMultiplier;
    const target = findNearestEnemy(c.x, c.y, radius);
    if (!target) return;

    c.attackTimer = getAtkCooldown() * SHADOW_CLONE.cooldownMultiplier;
    const angle = Math.atan2(target.y - c.y, target.x - c.x);
    c.angle = angle;

    const step = c.comboStep;
    const whirl = step === 3 && passives.shadowWhirl.lvl > 0;
    const { x, y } = c;
    executeBladeSlash(x, y, angle, radius, step, whirl, c);
    c.x = x;
    c.y = y;

    const combo = step === 3;
    const dmg = getAtkDamage() * SHADOW_CLONE.damageMultiplier * (combo ? BLADE_SKILL.comboDamageMultiplier : 1);
    const kbForce = getKnockback() * SHADOW_CLONE.knockbackMultiplier * (combo ? BLADE_SKILL.comboKnockbackMultiplier : 1);
    // Não carrega a Fúria (sem onHit)
    hitEnemiesInArc(x, y, angle, radius, getSlashArcRadian() / 2, dmg, kbForce, whirl);

    c.comboStep = step >= 3 ? 1 : step + 1;
}

// Lâminas em todas as direções quando a Fúria do herói começa (só visual, como as do herói)
function mirrorFrenzyNova(c) {
    const radius = getAtkRadius() * SHADOW_CLONE.radiusMultiplier * FRENZY_NOVA_SKILL.slashRadiusMultiplier;
    for (let i = 0; i < FRENZY_NOVA_SKILL.slashCount; i++) {
        const angle = (TAU / FRENZY_NOVA_SKILL.slashCount) * i;
        executeBladeSlash(c.x, c.y, angle, radius, 3, false, c);
    }
}

// Anda em linha reta até (x, y) sem passar de speed; para a stop de distância. Nunca sai da área da tocha.
function walkTo(c, x, y, speed, stop, dt) {
    const dx = x - c.x;
    const dy = y - c.y;
    const dist = Math.hypot(dx, dy);
    if (dist > stop) {
        const step = Math.min(dist - stop, speed * dt);
        c.x += (dx / dist) * step;
        c.y += (dy / dist) * step;
    }
    const fromTorchX = c.x - state.coreX;
    const fromTorchY = c.y - state.coreY;
    const out = Math.hypot(fromTorchX, fromTorchY);
    if (out > SHADOW_CLONE.areaRadius) {
        c.x = state.coreX + (fromTorchX / out) * SHADOW_CLONE.areaRadius;
        c.y = state.coreY + (fromTorchY / out) * SHADOW_CLONE.areaRadius;
    }
}

// Chamado depois do ataque do herói no mesmo quadro (js/game.js)
export function updateShadowClone(dt) {
    const count = getCloneCount();
    if (count === 0) {
        clones.length = 0;
        return;
    }
    // Aprendeu ou evoluiu: as sombras que faltam surgem nos postos livres
    while (clones.length < count) clones.push(spawnClone(clones.length, count));
    clones.length = count;
    const reach = getAtkRadius() * SHADOW_CLONE.radiusMultiplier;
    const claimed = new Set();
    const frenzy = state.frenzyActiveTimer > 0;

    clones.forEach((c, i) => {
        setPost(c, i, count);
        // Caída: o posto continua no lugar, e o anel de volta mostra quanto falta (js/render/shadow_clone.js)
        if (c.respawnTimer > 0) {
            c.respawnTimer -= dt;
            if (c.respawnTimer <= 0) reviveClone(c);
            return;
        }
        if (c.iFrames > 0) c.iFrames -= dt;
        // A vida máxima do herói também sobe a da sombra
        c.maxHp = getCloneMaxHp();
        c.hp = Math.min(c.hp, c.maxHp);

        // O monstro mais perto da tocha que ainda não tem sombra e que a lâmina alcança a partir da área
        let target = null;
        let best = SHADOW_CLONE.areaRadius + reach * 0.8;
        for (const e of state.enemies) {
            if (e.hp <= 0 || claimed.has(e)) continue;
            const d = Math.hypot(e.x - state.coreX, e.y - state.coreY);
            if (d < best) {
                best = d;
                target = e;
            }
        }
        if (target) {
            claimed.add(target);
            // Chega perto o bastante para a lâmina alcançar, sem encostar
            walkTo(c, target.x, target.y, SHADOW_CLONE.moveSpeed, reach * 0.6 + target.radius, dt);
        } else {
            walkTo(c, c.postX, c.postY, SHADOW_CLONE.returnSpeed, 2, dt);
        }

        updateCloneAttack(c, dt);
        if (frenzy && !c.frenzy) mirrorFrenzyNova(c);
        c.frenzy = frenzy;
    });
}
