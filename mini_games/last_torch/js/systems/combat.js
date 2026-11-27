import { BLESSED_BLADE, FLAME_BLADE, WHIRLWIND } from '../../data_model/passives.js';
import { BLADE_SKILL } from '../../data_model/skills.js';
import { SLASH_VISUALS } from '../../data_model/visuals/effects/slash_visual.js';
import { audio, maxUltEnergy, passives, player, state } from '../core/state.js';
import { updateHUD } from '../ui/hud.js';
import { dealDamage, ignite } from './damage.js';
import { createExplosion, hitStop, shakeScreen } from './effects.js';
import { isFireCasting } from './knives.js';
import { fireArcaneBolt } from './arcane.js';
import { feedBloodlust, getFinalBlowMultiplier, launchCrescent, launchShatter } from './skills_blade.js';
import { detonateMark } from './skills_shadow.js';
import { beamActive, startFury } from './fury.js';
import { startMove } from './moves.js';
import { getHero, mod } from './modifiers.js';
import { showFuryCutIn } from '../ui/fury_cutin.js';
import {
    getAtkCooldown,
    getAtkRadius,
    getBladeDamage,
    characterStat,
    getFrenzyDuration,
    getFuryChargePerHit,
    getFury,
    getKnockback,
    getSlashArcRadian,
    getSpellDamage
} from './stats.js';

// --- SISTEMA DE CORTE COM A LÂMINA ---
// Amplitude configurável via upgrade (getSlashArcRadian). attacker: herói (padrão) ou Shadow Clone,
// que golpeia em silêncio e tem o efeito pintado de sombra (shadow: true).
export function executeBladeSlash(x, y, angle, radius, comboStep, spin = false, attacker = player) {
    const currentArc = getSlashArcRadian();
    const visualLife = (spin ? SLASH_VISUALS.whirl : SLASH_VISUALS[comboStep]).lifeSeconds;
    const shadow = attacker !== player;

    state.bladeSlashes.push({
        x, y, angle, radius, comboStep, spin, shadow,
        arcWidth: currentArc,
        life: visualLife, maxLife: visualLife
    });

    if (!shadow) audio.playSwordSlash(comboStep);

    // Pequeno avanço (dash) direcional no 3º ataque
    if (comboStep === 3) {
        const dashDist = BLADE_SKILL.comboDashDistance;
        attacker.x += Math.cos(angle) * dashDist;
        attacker.y += Math.sin(angle) * dashDist;
        createExplosion(attacker.x, attacker.y, '#c084fc', 12);
    }
}

// Monstro mais perto de (x, y) a menos de maxDist (ou null)
// Mede até a borda do monstro, como o dano (hitEnemiesInArc): um monstro grande entra no alcance pela ponta,
// e não só quando o centro dele chega perto
export function findNearestEnemy(x, y, maxDist) {
    let target = null;
    let minDist = maxDist;
    state.enemies.forEach(e => {
        if (e.untargetable) return;           // o Goblin do Baú invisível (blink)
        const d = Math.hypot(e.x - x, e.y - y) - e.radius;
        if (d < minDist) {
            minDist = d;
            target = e;
        }
    });
    return target;
}

// Dano e empurrão em todo monstro dentro do alcance e da abertura do corte (ou em volta toda:
// giro e Fúria ativa). onHit é chamado a cada monstro atingido.
// magic: dano de magia somado a cada golpe (Blessed Blade). O golpe sai num número só, em azul, com a soma dos dois
export function hitEnemiesInArc(x, y, atkAngle, radius, arcHalf, dmg, kbForce, allAround, onHit, magic = 0) {
    let hits = 0;
    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d <= radius + e.radius) {
            const enemyAngle = Math.atan2(e.y - y, e.x - x);
            let diffAngle = Math.abs(atkAngle - enemyAngle);
            while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
            diffAngle = Math.abs(diffAngle);

            // Aplica dano se o inimigo está dentro da abertura angular atual do corte
            if (diffAngle <= arcHalf + 0.1 || state.frenzyActiveTimer > 0 || allAround) {
                dealDamage(e, dmg + magic, { kbX: Math.cos(enemyAngle) * kbForce, kbY: Math.sin(enemyAngle) * kbForce, style: magic > 0 ? 'spell' : null });
                if (passives.flameBlade.lvl > 0) {
                    const oath = state.oath === 'oathHearth' ? FLAME_BLADE.oathMultiplier : 1;
                    ignite(e, dmg * FLAME_BLADE.burnRatio * oath, FLAME_BLADE.burnSeconds);
                }
                if (onHit) onHit(e);
                createExplosion(e.x, e.y, passives.flameBlade.lvl > 0 ? '#fb923c' : e.color, passives.flameBlade.lvl > 0 ? 7 : 4);
                hits++;
            }
        }
    });
    return hits;
}

export function chargeUlt(amount) {
    // Com a Fúria ativa a barra mostra o tempo restante e não carrega: a próxima se ganha depois que esta acabar
    if (state.frenzyActiveTimer > 0) return;
    // Oath of the Wild: a floresta dá vida, não fúria

    state.ultEnergy = Math.min(maxUltEnergy, state.ultEnergy + amount);
    updateHUD();

    // Ativação Automática do Especial ao Carregar
    if (state.ultEnergy >= maxUltEnergy) triggerFrenzyUlt();
}

// Ativação automática da Fúria. A barra e a duração são iguais para todos; o especial é de cada personagem (js/systems/fury.js).
// O especial de cada herói (inclusive a Chuva de Espadas do Demon Hunter) roda em fury.js; aqui só o disparo e o anúncio.
const FURY_COLORS = { swordRain: '#f0abfc', bloodWaltz: '#f87171', groundRend: '#dc2626', stomp: '#cbd5e1', forestGuardian: '#4ade80', consecration: '#fde68a', beam: '#93c5fd' };
export function triggerFrenzyUlt() {
    if (state.phase !== 'HUNT') return;          // a Fúria só dispara com a onda rolando (nunca no fim dela, no acampamento ou na limpeza)
    state.ultEnergy = 0;
    const fury = getFury();
    // Cada personagem pode durar um pouco mais (o Brutos: as pisadas são o show dele)
    state.frenzyDuration = getFrenzyDuration() + (fury.extraSeconds ?? 0);
    state.frenzyActiveTimer = state.frenzyDuration;
    audio.playUltSound();
    const startedAt = state.runTime;      // se uma partida nova começar durante o anúncio, o golpe não sai nela
    const turn = state.turn;
    // Anúncio: a faixa com a foto do herói aparece e some com a caçada parada; só então o golpe sai (a tela livre).
    // Se a onda acabou durante o anúncio (o último monstro caiu), a Fúria NÃO começa: antes ela saía no acampamento ou na onda seguinte
    showFuryCutIn(getHero(), fury.name, fury.color ?? FURY_COLORS[fury.kind] ?? '#f0abfc', () => {
        if (state.runTime >= startedAt && state.turn === turn && state.phase === 'HUNT') releaseFury(fury);
        else state.frenzyActiveTimer = 0;
    });
}

function releaseFury(fury) {
    startFury(fury);
    updateHUD();
}

// Ataque Direcional Direto
export function updateAutoAttack(dt) {
    if (state.frenzyActiveTimer > 0) state.frenzyActiveTimer -= dt;

    player.attackTimer -= dt;
    const attackRad = getAtkRadius();
    const currentArcHalf = getSlashArcRadian() / 2;

    if (player.attackTimer > 0 || isFireCasting() || beamActive()) return;

    const targetEnemy = findNearestEnemy(player.x, player.y, attackRad);
    if (!targetEnemy) return;

    player.attackTimer = getAtkCooldown();
    const atkAngle = Math.atan2(targetEnemy.y - player.y, targetEnemy.x - player.x);
    player.angle = atkAngle;

    // Herói sem lâmina (Gudran): não golpeia. Ergue o cajado devagar (movimento staffCast do boneco) e, quando a esfera chega ao
    // alto, o raio de energia azul sai da ponta (js/systems/arcane.js). Sem arco de corte nem varredura
    if (getHero().basicAttack === 'arcane') {
        if (player.move) return;
        // Contador próprio do combo (o comboStep do herói, se mudasse, dispararia a varredura de espada do boneco)
        const step = player.arcaneStep = ((player.arcaneStep ?? 0) % 3) + 1;
        startMove('staffCast', () => {
            const target = state.enemies.includes(targetEnemy) && targetEnemy.hp > 0 ? targetEnemy : findNearestEnemy(player.x, player.y, attackRad + 40);
            if (target) fireArcaneBolt(target, step);
        });
        return;
    }

    // Skill passiva Giro Sombrio: o 3º golpe vira um giro de 360°
    const whirl = player.comboStep === 3 && passives.shadowWhirl.lvl > 0;
    const slashRad = whirl ? attackRad * WHIRLWIND.radiusRatio : attackRad;   // Whirlwind: mini-furacão roxo, bem mais longo que o golpe normal
    executeBladeSlash(player.x, player.y, atkAngle, slashRad, player.comboStep, whirl);

    // Final Blow: o 3º golpe causa o dobro de dano (e o Whirlwind já faz esse 3º golpe acertar todos em volta)
    const dmg = getBladeDamage() * (player.comboStep === 3 ? characterStat('comboDamage') * getFinalBlowMultiplier() : 1.0);
    const kbForce = getKnockback() * (player.comboStep === 3 ? characterStat('comboKnockback') : 1.0);

    // Colisão de dano no arco do golpe
    let thrown = false;                                    // Shatter Strike: no máximo um monstro lançado por golpe
    const hits = hitEnemiesInArc(player.x, player.y, atkAngle, slashRad, currentArcHalf, dmg, kbForce, whirl,
        (e) => {
            chargeUlt(getFuryChargePerHit());
            if (!thrown) thrown = launchShatter(e, atkAngle);      // Shatter Strike (recarga de 15 s): lança este monstro, que bate no que encontrar
            // Em pleno dash a marca espera: é o dash que vai detoná-la, com o bônus
            if (e.marked > 0 && player.dashTimer <= 0) detonateMark(e, false);
        },
        // Blessed Blade (Avgustino): a lâmina benta soma uma parte pequena da magia a cada golpe (um número só, azul)
        passives.blessedBlade.lvl > 0 ? getSpellDamage() * BLESSED_BLADE.magicRatio : 0);
    if (hits > 0) feedBloodlust();         // Bloodlust: cada golpe que acerta alguém soma um stack (não precisa matar: com só um chefe em campo ela também sobe)
    launchCrescent(atkAngle);
    if (hits > 0) {
        audio.playHit(hits);
        if (player.comboStep === 3) {
            hitStop(0.04);
            shakeScreen(3);
        }
    }

    player.comboStep = player.comboStep >= 3 ? 1 : player.comboStep + 1;
}
