import { EVOLUTIONS } from '../../data_model/powers.js';
import { attributes, audio, passives, state } from '../core/state.js';
import { getOwnedPowers } from '../systems/tree.js';
import { treeImageFor, paintIcon } from '../../data_model/tree_images.js';
import { skillTree } from './tree.js';
import {
    getAtkCooldown, getAtkRadius, getBladeDamage, getFrenzyDamageBonus, getFrenzyDuration, getKnockback,
    getMaxPlayerHp, getPlayerMaxSpeed, getSlashArcDegree
} from '../systems/stats.js';
import { getHero } from '../systems/modifiers.js';
import { getHourName } from '../../data_model/night.js';
import { STAT_GROUPS, getFuryGroup } from './stat_sheet.js';

// --- STATUS ---
// O medalhão pausa a partida e mostra a build: stats, poderes e relíquias. Som, efeitos e controles ficam em settings.js.
const STAT_VALUES = {
    damage: () => Math.round(getBladeDamage()),
    radius: () => `${Math.round(getAtkRadius())}px`,
    slashArc: () => `${getSlashArcDegree()}°`,
    atkSpeed: () => `${getAtkCooldown().toFixed(2)}s`,
    moveSpeed: () => Math.round(getPlayerMaxSpeed()),
    frenzyNova: () => `${getFrenzyDuration().toFixed(1)}s +${Math.round(getFrenzyDamageBonus() * 100)}%`,
    playerHp: () => getMaxPlayerHp(),
    knockback: () => Math.round(getKnockback())
};

export function getStatText(key) {
    return STAT_VALUES[key] ? STAT_VALUES[key]() : '';
}

function createStatRow({ name, note, level, value, empty, tone }) {
    const item = document.createElement('div');
    item.className = `shop-row${empty ? ' is-empty' : ''}`;
    item.title = note;
    item.dataset.note = `${name}: ${note}`;
    item.innerHTML = '<span class="shop-row-name"><span class="stat-icon"></span><span></span></span><b class="shop-row-value"></b>';
    item.querySelector('.stat-icon + span').textContent = name;
    if (level) item.querySelector('.shop-row-name').insertAdjacentHTML('beforeend', `<em>Lv. ${level}</em>`);
    item.querySelector('.shop-row-value').textContent = value;
    if (tone) item.querySelector('.shop-row-value').classList.add(`tone-${tone}`);
    return item;
}

function renderStats() {
    const list = document.getElementById('shopList');
    list.innerHTML = '';
    [getFuryGroup(), ...STAT_GROUPS].filter(Boolean).forEach(({ title, summary, rows }) => {
        const heading = document.createElement('h3');
        heading.className = 'stat-group';
        heading.textContent = title;
        if (summary) {
            const note = document.createElement('span');
            note.className = 'stat-group-note';
            note.textContent = ` - ${summary}`;
            heading.appendChild(note);
        }
        list.appendChild(heading);
        rows.forEach(row => {
            const attr = attributes[row.attr];
            const amount = attr ? null : row.amount();
            const item = createStatRow(attr
                ? { name: attr.name, note: attr.desc, level: attr.lvl, value: getStatText(row.attr) }
                : { name: row.name, note: row.note, value: amount === 0 ? '—' : row.format(amount), empty: amount === 0, tone: row.tone });
            paintIcon(item.querySelector('.stat-icon'), attr ? treeImageFor(row.attr) : null, attr?.icon ?? row.icon);
            list.appendChild(item);
        });
    });
}

function renderBuildList(id, items, emptyText) {
    const list = document.getElementById(id);
    list.innerHTML = '';
    if (items.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'build-empty';
        empty.textContent = emptyText;
        list.appendChild(empty);
    }
    items.forEach(({ icon, name, desc, level, key, evolved }) => {
        const item = document.createElement('div');
        item.className = 'build-row';
        item.dataset.note = `${name}: ${desc}`;
        item.innerHTML = '<span class="build-row-icon"></span><div><b></b><span></span></div><em></em>';
        paintIcon(item.querySelector('.build-row-icon'), key ? treeImageFor(key, evolved) : null, icon);
        item.querySelector('b').textContent = name;
        item.querySelector('b + span').textContent = desc;
        item.querySelector('em').textContent = level ? `Lv. ${level}` : '';
        list.appendChild(item);
    });
}

// Celular: as linhas mostram só o nome; a descrição aparece aqui ao tocar
const BUILD_NOTE_HINT = 'Tap anything to read what it does.';

export function showBuildNote(row) {
    document.querySelectorAll('#tabBuild .is-selected').forEach(r => r.classList.remove('is-selected'));
    row?.classList.add('is-selected');
    document.getElementById('buildNote').textContent = row?.dataset.note ?? BUILD_NOTE_HINT;
}

// Aba Build: stats, poderes e relíquias. Redesenhada ao abrir a tela e sempre que a árvore muda (pontos gastos)
function renderBuild() {
    renderStats();
    const skills = Object.values(passives).filter(p => p.type === 'skill' && p.lvl > 0)
        .map(p => (p.evolved
            ? { key: p.key, evolved: true, icon: EVOLUTIONS[p.key].icon, name: `${EVOLUTIONS[p.key].name} ✦`, desc: EVOLUTIONS[p.key].desc, level: 0 }
            : { key: p.key, icon: p.icon, name: p.name, desc: EVOLUTIONS[p.key] ? `${p.desc} Can evolve in the skill tree.` : p.desc, level: 0 }));
    renderBuildList('powerList', [...getOwnedPowers().map(p => ({
        key: p.key, evolved: p.evolved,
        icon: p.evolved ? EVOLUTIONS[p.key].icon : p.icon,
        name: p.evolved ? `${EVOLUTIONS[p.key].name} ✦` : p.name,
        desc: !p.evolved && EVOLUTIONS[p.key] ? `${p.desc} Can evolve in the skill tree at max level.` : p.desc,
        level: p.lvl
    })), ...skills], 'No powers yet. Learn them in the skill tree.');
    renderBuildList('passiveList', Object.values(passives).filter(p => p.type !== 'skill' && p.lvl > 0).map(p => ({
        icon: p.icon, name: p.name, desc: p.desc, level: 0
    })), 'No relics yet. Buy them at the camp, between waves.');
    showBuildNote(null);
}

const TABS = ['tree', 'build'];
let currentTab = 'tree';

function showTab(name) {
    currentTab = name;
    TABS.forEach(tab => {
        const id = `tab${tab[0].toUpperCase()}${tab.slice(1)}`;
        document.getElementById(id).classList.toggle('hidden', tab !== name);
    });
    document.querySelectorAll('[data-status-tab]').forEach(b => b.classList.toggle('is-on', b.dataset.statusTab === name));
    if (name === 'tree') skillTree.open();
    if (name === 'build') renderBuild();
}

export function setStatusTab(name) {
    showTab(name);
}

// Pontos e ouro no cabeçalho
function renderHeader() {
    document.getElementById('statusPoints').innerText = state.skillPoints;
    document.getElementById('shopCoinsText').innerText = state.coins;
}

skillTree.onChange = () => {
    renderHeader();
    renderBuild();
};

// De onde a tela foi aberta: a caçada ou o acampamento (from = 'CAMP', com onBack para redesenhar o acampamento)
let returnState = 'PLAYING';
let afterReturn = null;

export function openStatus(from = 'PLAYING', onBack = null) {
    if (state.gameState !== from) return;
    returnState = from;
    afterReturn = onBack;
    state.gameState = 'PAUSED';
    document.getElementById('statusLevel').innerText = `LEVEL ${state.playerLevel}`;
    document.getElementById('statusHour').innerText = `Wave ${state.turn} · ${getHourName(state.turn)}`;
    document.getElementById('statusHero').innerText = ` · ${getHero().name}`;
    document.getElementById('btnResume').innerText = from === 'CAMP' ? 'BACK TO THE CAMP ▶' : 'BACK TO THE HUNT ▶';
    renderHeader();
    renderBuild();
    showBuildNote(null);
    document.getElementById('shopScreen').classList.remove('hidden');
    showTab(currentTab);
    audio.setPaused(true);
}

export function resumeGame() {
    if (state.gameState !== 'PAUSED' || document.body.classList.contains('is-editing-touch')) return;
    document.getElementById('shopScreen').classList.add('hidden');
    document.getElementById('pickScreen').classList.add('hidden');
    document.getElementById('settingsScreen').classList.add('hidden');
    // Um dedo solto do botão da adaga enquanto a tela estava aberta não arremessa ao voltar
    state.knifeInput.stick.fire = false;
    state.gameState = returnState;
    returnState = 'PLAYING';
    audio.setPaused(false);
    afterReturn?.();
    afterReturn = null;
}
