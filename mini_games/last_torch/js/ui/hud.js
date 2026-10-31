import { mod } from '../systems/modifiers.js';
import { EVOLUTIONS } from '../../data_model/powers.js';
import { NIGHT, getHourName } from '../../data_model/night.js';
import { STREAK } from '../../data_model/streak.js';
import { isBossTurn } from '../../data_model/bosses.js';
import { CORE_MODEL } from '../../data_model/core.js';
import { passives, player, powers, state } from '../core/state.js';
import { getDashCooldown, getKnifeCooldown } from '../systems/stats.js';
import { hasBuyableNode } from '../systems/tree.js';

// --- HUD ---
// Escrever no DOM é caro: força o navegador a recalcular estilo e layout. Por isso os sistemas só
// marcam o HUD como sujo (updateHUD) e flushHud escreve no máximo ~10 vezes por segundo, e só o que
// mudou. As barras usam transform, que não refaz o layout.
const HUD_INTERVAL_MS = 100;
const el = (id) => document.getElementById(id);
const ui = {
    level: el('levelText'), xpText: el('xpText'), xpBar: el('xpBar'),
    kills: el('killsHud'), coins: el('coinsText'), score: el('hudScore'),
    turn: el('turnLabel'), hourName: el('hourName'), scoreBar: el('scoreBar'), pips: el('nightPips'),
    bossBox: el('bossHpContainer'), bossName: el('bossNameText'), bossHp: el('bossHpText'), bossBar: el('bossHpBar'),
    heroCard: el('heroCard'), screenFx: el('screenFx'), statusButton: el('btnPause'), statusBadge: el('statusBadge'),
    streakBox: el('hudStreak'), streakCount: el('streakCount'), streakBar: el('streakBar'),
    knifeButton: el('knifeButton'), dashButton: el('dashButton'), dashCharges: el('dashCharges')
};
const hasTouchButtons = window.matchMedia('(pointer: coarse)').matches;

let dirty = true;
let lastFlush = 0;
let pipsHour = -1;

function setText(node, value) {
    if (node.$text === value) return;
    node.$text = value;
    node.textContent = value;
}

function setBar(node, ratio) {
    const rounded = Math.round(Math.max(0, Math.min(1, ratio)) * 200) / 200;
    if (node.$bar === rounded) return;
    node.$bar = rounded;
    node.style.transform = `scaleX(${rounded})`;
}

function setFlag(node, name, on) {
    const key = `$${name}`;
    if (node[key] === on) return;
    node[key] = on;
    node.classList.toggle(name, on);
}

// --- FÚRIA NO CARTÃO DO HERÓI ---
// A carga fica no filete embaixo da vida do herói (js/render/arena.js); aqui só o cartão muda enquanto ela dura.
export function updateFuryCard() {
    const active = state.frenzyActiveTimer > 0;
    setFlag(ui.heroCard, 'fury-active', active);
    setFlag(ui.screenFx, 'fx-fury', active);
}

// --- BOTÕES DE TOQUE ---
// Anel de recarga (--cd: 1 logo após o uso, 0 = pronto) em poucos degraus: cada mudança repinta o botão.
const CD_STEPS = 12;
const knifeShown = { cd: -1, ready: null, sealed: null };

export function updateKnifeButton() {
    if (!hasTouchButtons) return;
    const ratio = Math.min(1, state.knifeTimer / getKnifeCooldown());
    const cd = Math.ceil(ratio * CD_STEPS) / CD_STEPS;
    if (knifeShown.cd !== cd) {
        knifeShown.cd = cd;
        ui.knifeButton.style.setProperty('--cd', cd);
    }
    const sealed = mod('noKnives') > 0;
    if (knifeShown.sealed !== sealed) {
        knifeShown.sealed = sealed;
        ui.knifeButton.classList.toggle('is-sealed', sealed);
    }
    const ready = ratio <= 0 && !sealed;
    if (knifeShown.ready !== ready) {
        knifeShown.ready = ready;
        ui.knifeButton.classList.toggle('is-ready', ready);
    }
}

const dashShown = { cd: -1, charges: -1 };

export function updateDashButton() {
    if (!hasTouchButtons) return;
    const ratio = player.dashCharges > 0 ? 0 : Math.min(1, Math.max(0, player.dashRecharge) / getDashCooldown());
    const cd = Math.ceil(ratio * CD_STEPS) / CD_STEPS;
    if (dashShown.cd !== cd) {
        dashShown.cd = cd;
        ui.dashButton.style.setProperty('--cd', cd);
    }
    if (dashShown.charges !== player.dashCharges) {
        dashShown.charges = player.dashCharges;
        ui.dashButton.classList.toggle('is-ready', player.dashCharges > 0);
        ui.dashCharges.textContent = player.dashCharges > 1 ? player.dashCharges : '';
    }
}

// Pulso curto feito pelo próprio navegador, sem forçar layout
function pulse(node, scale, ms) {
    node.animate?.([{ transform: `scale(${scale})` }, { transform: 'scale(1)' }], { duration: ms, easing: 'ease-out' });
}

// Level up: o nível no cartão do herói pulsa
export function pulseLevel() {
    pulse(ui.level, 1.35, 450);
}

// --- SEQUÊNCIA DE MORTES ---
const streakShown = { count: -1, visible: false };

function updateStreakHud() {
    const visible = state.streak >= STREAK.showFrom;
    if (streakShown.visible !== visible) {
        streakShown.visible = visible;
        ui.streakBox.classList.toggle('is-visible', visible);
    }
    if (!visible) {
        streakShown.count = -1;
        return;
    }
    if (streakShown.count !== state.streak) {
        streakShown.count = state.streak;
        setText(ui.streakCount, state.streak);
        pulse(ui.streakCount, 1.3, 160);
        const tier = [...STREAK.tiers].reverse().find(t => state.streak >= t.at);
        ui.streakBox.style.setProperty('--tone', tier ? tier.color : '#e2e8f0');
    }
    setBar(ui.streakBar, state.streakTimer / STREAK.windowSeconds);
}

// --- VIDA BAIXA ---
function updateDangerFx() {
    setFlag(ui.screenFx, 'fx-danger', player.hp > 0 && player.hp < player.maxHp * 0.3);
    setFlag(ui.screenFx, 'fx-torch', state.coreHp > 0 && state.coreHp < state.coreHpMax * CORE_MODEL.lowHpRatio);
}

// --- PROGRESSO DA NOITE ---
// Uma marca por hora: passadas, a atual e as com boss. Só muda quando a hora vira.
function updateNightPips() {
    if (pipsHour === state.turn) return;
    pipsHour = state.turn;
    const total = Math.max(NIGHT.hours, state.endless ? state.turn : 0);
    if (ui.pips.childElementCount !== total) {
        ui.pips.textContent = '';
        for (let h = 1; h <= total; h++) {
            const pip = document.createElement('i');
            if (isBossTurn(h)) pip.className = 'is-boss';
            ui.pips.appendChild(pip);
        }
    }
    [...ui.pips.children].forEach((pip, i) => {
        const hour = i + 1;
        pip.classList.toggle('is-done', hour < state.turn);
        pip.classList.toggle('is-now', hour === state.turn);
    });
}

// Barra de vida do boss: acompanha cada golpe (js/systems/damage.js), no ritmo do HUD
export function syncBossBar() {
    dirty = true;
}

// --- BARRA DE PODERES E RELÍQUIAS ---
// Faixa de ícones abaixo do cartão do herói: a build crescendo durante a partida.
export function updateBuildStrip() {
    const strip = el('buildStrip');
    strip.textContent = '';
    const add = (icon, level, evolved) => {
        const item = document.createElement('span');
        item.className = evolved ? 'build-item is-evolved' : 'build-item';
        item.textContent = icon;
        if (level) {
            const lv = document.createElement('i');
            lv.textContent = level;
            item.appendChild(lv);
        }
        strip.appendChild(item);
    };
    Object.values(powers).forEach(p => { if (p.lvl > 0) add(p.evolved ? EVOLUTIONS[p.key].icon : p.icon, p.lvl, p.evolved); });
    Object.values(passives).forEach(p => { if (p.lvl > 0) add(p.evolved ? EVOLUTIONS[p.key].icon : p.icon, 0, p.evolved); });
}

export function updateHUD() {
    dirty = true;
}

function writeHud() {
    const { playerLevel, playerXp, playerMaxXp, currentBoss } = state;

    setText(ui.level, `LV ${playerLevel}`);
    setText(ui.xpText, `${Math.floor(playerXp)}/${playerMaxXp} XP`);
    setBar(ui.xpBar, playerXp / playerMaxXp);

    updateDangerFx();
    // Medalhão: pulsa em vermelho e mostra os pontos quando há algo para aprender na árvore
    const canSpend = hasBuyableNode();
    setFlag(ui.statusButton, 'can-upgrade', canSpend);
    setText(ui.statusBadge, canSpend ? `+${state.skillPoints}` : '');
    setText(ui.kills, state.run.kills);
    setText(ui.coins, state.coins);
    setText(ui.score, state.totalScore.toLocaleString('en-US'));

    const hour = state.turn;
    setText(ui.turn, `HOUR ${hour}`);
    setText(ui.hourName, state.lastStand ? `${state.enemies.length} LEFT` : getHourName(hour));
    setBar(ui.scoreBar, state.hourPlan?.boss ? 1 : state.scoreTurn / Math.max(1, state.targetScore));
    updateNightPips();

    // Boss HUD
    setFlag(ui.bossBox, 'hidden', !currentBoss);
    if (currentBoss) {
        setText(ui.bossName, `☠️ ${currentBoss.name.toUpperCase()}`);
        setText(ui.bossHp, `${Math.max(0, Math.ceil(currentBoss.hp))}`);
        setBar(ui.bossBar, currentBoss.hp / currentBoss.maxHp);
    }
}

// Chamado a cada quadro pelo loop do jogo
export function flushHud(now) {
    if (now - lastFlush < HUD_INTERVAL_MS) return;
    lastFlush = now;
    updateStreakHud();
    updateFuryCard();
    if (!dirty) return;
    dirty = false;
    writeHud();
}
