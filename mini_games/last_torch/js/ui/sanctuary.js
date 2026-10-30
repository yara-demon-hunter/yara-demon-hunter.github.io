import { ACHIEVEMENTS, getBestiary } from '../../data_model/sanctuary.js';
import { HEROES } from '../../data_model/heroes.js';
import { save } from '../core/save.js';
import { audio } from '../core/state.js';
import { getMonsterSprite } from '../render/monster_sprites.js';
import { renderStartScreen } from './screens.js';

// --- SANTUÁRIO (tela) ---
// Três abas sobre o que o jogador já fez: troféus (marcos), façanhas (habilidade dentro da noite) e o bestiário.
// O registro fica em js/systems/sanctuary.js; aqui só se lê o save e se desenha.
let tab = 'trophies';

const GROUPS = { trophies: 'trophy', feats: 'feat' };
const number = (n) => n.toLocaleString('en-US');

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

const isDone = (a) => Boolean(save.achievements[a.id]);

function renderAchievements(list, group) {
    ACHIEVEMENTS.filter(a => a.group === group).forEach(a => {
        const done = isDone(a);
        const value = Math.min(a.target, save.stats[a.stat] ?? 0);
        const item = el('div', `sanc-item${done ? ' is-done' : ''}`);
        const text = el('div', 'sanc-text');
        text.append(
            el('b', '', a.name),
            el('span', '', a.hero ? `${a.desc} Unlocks ${HEROES[a.hero].name}.` : a.desc)
        );
        if (!done) {
            const bar = el('i', 'sanc-bar');
            const fill = el('u');
            fill.style.width = `${Math.round(value / a.target * 100)}%`;
            bar.append(fill);
            text.append(bar);
        }
        item.append(el('span', 'sanc-icon', a.icon), text, el('span', 'sanc-tag', done ? 'DONE' : `${number(value)}/${number(a.target)}`));
        list.appendChild(item);
    });
}

// Recordes: o que o jogador tem para bater
function renderRecords(list) {
    const { stats } = save;
    const box = el('div', 'sanc-records');
    [['Most at once', stats.bestMultiKill], ['Best streak', stats.bestStreak], ['Best hour', stats.bestHour], ['Best score', stats.bestScore]].forEach(([label, value]) => {
        const chip = el('div', 'sanc-record');
        chip.append(el('span', '', label), el('b', '', number(value ?? 0)));
        box.appendChild(chip);
    });
    list.appendChild(box);
}

// Sprite pronto da partida (primeiro quadro); sem ele, o ícone
function beastArt(info) {
    const box = el('span', 'beast-art');
    const sprite = getMonsterSprite(info.key);
    if (!sprite) {
        box.textContent = info.icon;
        return box;
    }
    const canvas = el('canvas');
    canvas.width = canvas.height = 112;
    canvas.getContext('2d').drawImage(sprite.atlas, 0, 0, sprite.cell, sprite.cell, 0, 0, 112, 112);
    box.appendChild(canvas);
    return box;
}

function renderBestiary(list) {
    getBestiary().forEach(info => {
        const kills = save.bestiary[info.key]?.kills ?? 0;
        const seen = kills > 0;
        const card = el('div', `beast${seen ? '' : ' is-unknown'}${info.kind === 'boss' ? ' is-boss' : ''}`);
        card.append(
            beastArt(info),
            el('b', '', seen ? info.name : '???'),
            el('span', '', seen ? `${number(kills)} slain` : `${info.kind === 'boss' ? 'Boss · ' : ''}Hour ${info.hour}+`)
        );
        if (seen && info.subtitle) card.title = info.subtitle;
        list.appendChild(card);
    });
}

function renderTabCounts() {
    const count = (group) => {
        const items = ACHIEVEMENTS.filter(a => a.group === group);
        return `${items.filter(isDone).length}/${items.length}`;
    };
    const beasts = getBestiary();
    const counts = {
        trophies: count('trophy'),
        feats: count('feat'),
        bestiary: `${beasts.filter(b => save.bestiary[b.key]?.kills > 0).length}/${beasts.length}`
    };
    document.querySelectorAll('#sanctuaryTabs button').forEach(button => {
        button.classList.toggle('is-on', button.dataset.tab === tab);
        button.querySelector('i').textContent = counts[button.dataset.tab];
    });
}

function renderSanctuary() {
    renderTabCounts();
    const list = document.getElementById('sanctuaryList');
    list.replaceChildren();
    list.classList.toggle('is-beasts', tab === 'bestiary');
    list.scrollTop = 0;
    if (tab === 'bestiary') renderBestiary(list);
    else {
        if (tab === 'feats') renderRecords(list);
        renderAchievements(list, GROUPS[tab]);
    }
}

export function openSanctuary() {
    document.getElementById('sanctuaryScreen').classList.remove('hidden');
    renderSanctuary();
    audio.init();
    audio.setMood('camp');
}

export function closeSanctuary() {
    document.getElementById('sanctuaryScreen').classList.add('hidden');
    renderStartScreen();
    audio.setMood('menu');
}

export function setSanctuaryTab(name) {
    tab = name;
    renderSanctuary();
}
