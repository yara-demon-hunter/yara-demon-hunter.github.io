import { ACHIEVEMENTS, achievementEmbers, getBestiary } from '../../data_model/sanctuary.js';
import { ACTIVE_HEROES, HEROES } from '../../data_model/heroes.js';
import { TOP_RUNS } from '../systems/sanctuary.js';
import { save, persist } from '../core/save.js';
import { audio } from '../core/state.js';
import { getBossPortrait, getMonsterSprite } from '../render/monster_sprites.js';
import { renderStartScreen } from './screens.js';
import { ICON_IMAGES } from '../../data_model/icon_images.js';
import { paintIcon } from '../../data_model/tree_images.js';

// --- SANTUÁRIO (tela) ---
// Duas abas: as conquistas (a jornada e as façanhas de habilidade, numa lista só, em duas seções) e o bestiário. Os RANKS (números e
// top 10) têm entrada própria no menu e reusam esta mesma tela, sem as abas (openRanks).
// O registro fica em js/systems/sanctuary.js; aqui só se lê o save e se desenha.
let tab = 'achievements';
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
            el('span', '', a.hero && !HEROES[a.hero].shelved ? `${a.desc} Unlocks ${HEROES[a.hero].name}.` : a.desc)
        );
        // Brasas que o troféu paga (apagadas quando já foram recebidas)
        const reward = achievementEmbers(a, HEROES);
        if (reward > 0) text.append(el('em', `sanc-reward${done ? ' is-paid' : ''}`, `🔥 ${done ? '' : '+'}${reward}${done ? ' received' : ''}`));
        if (!done) {
            const bar = el('i', 'sanc-bar');
            const fill = el('u');
            fill.style.width = `${Math.round(value / a.target * 100)}%`;
            bar.append(fill);
            text.append(bar);
        }
        const icon = el('span', 'sanc-icon');
        paintIcon(icon, ICON_IMAGES[a.id], a.icon);
        item.append(icon, text, el('span', 'sanc-tag', done ? 'DONE' : `${number(value)}/${number(a.target)}`));
        list.appendChild(item);
    });
}


// Estrelas de cada onda: o melhor resultado já tirado em cada uma das 12 (save.waveBests, gravado em js/ui/camp.js), com o recorde de
// pontos. Fica na aba Ranks, no fim: é o que o jogador volta para completar.
const WAVES = 12;
function renderWaveStars(list) {
    const bests = save.waveBests ?? {};
    const total = Object.values(bests).reduce((sum, b) => sum + Math.min(5, b.stars ?? 0), 0);
    const box = el('div', 'sanc-waves');
    box.append(el('p', 'sanc-waves-title', `WAVE STARS · ${total}/${WAVES * 5} ★`));
    const grid = el('div', 'sanc-waves-grid');
    for (let w = 1; w <= WAVES; w++) {
        const best = bests[w];
        const stars = Math.min(5, best?.stars ?? 0);
        const cell = el('div', `sanc-wave${best ? '' : ' is-unknown'}${stars === 5 ? ' is-perfect' : ''}`);
        const row = el('span', 'sanc-wave-stars');
        row.innerHTML = `<b>${'★'.repeat(stars)}</b>${'★'.repeat(5 - stars)}`;
        cell.append(el('i', '', `Wave ${w}`), row, el('em', '', best ? number(best.score) : '—'));
        grid.appendChild(cell);
    }
    box.appendChild(grid);
    list.appendChild(box);
}

// Sprite pronto da partida (primeiro quadro); sem ele, o ícone
function beastArt(info) {
    const box = el('span', 'beast-art');
    const sprite = info.kind === 'boss' ? getBossPortrait(info.key) : getMonsterSprite(info.key);
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
            el('span', '', seen ? `${number(kills)} slain` : `${info.kind === 'boss' ? 'Boss · ' : ''}Wave ${info.hour}+`)
        );
        if (seen && info.subtitle) card.title = info.subtitle;
        list.appendChild(card);
    });
}

function renderTabCounts() {
    const beasts = getBestiary();
    const counts = {
        achievements: `${ACHIEVEMENTS.filter(isDone).length}/${ACHIEVEMENTS.length}`,
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
    list.classList.toggle('is-ranks', tab === 'ranks');
    list.scrollTop = 0;
    if (tab === 'bestiary') renderBestiary(list);
    else if (tab === 'ranks') renderRanks(list);
    else {
        // Uma lista só, em duas seções: a jornada (marcos que se acumulam entre noites) e as façanhas (habilidade dentro da noite)
        section(list, 'JOURNEY · milestones across your nights');
        renderAchievements(list, 'trophy');
        section(list, 'SKILL · feats inside a single night');
        renderAchievements(list, 'feat');
    }
}

// --- RANKS: só números e progresso ---
// Estatísticas da conta, as 10 melhores noites (com o retrato do herói), o recorde de cada herói (o que nunca jogou fica em
// branco, para dar vontade) e as estrelas de cada onda. Dados: save.topRuns e save.heroBests (js/systems/sanctuary.js > recordNight).
const HUNTER_ART = 'images/characters/demon-hunter-small.webp';
const artOf = (key) => HEROES[key]?.portraitImage ?? HUNTER_ART;
function section(list, title) {
    list.appendChild(el('p', 'rank-title', title));
}
function renderRanks(list) {
    const { stats } = save;
    section(list, 'YOUR NUMBERS');
    const grid = el('div', 'rank-stats');
    [['Best wave', stats.bestHour], ['Best score', stats.bestScore], ['Best streak', stats.bestStreak], ['Most at once', stats.bestMultiKill],
        ['Monsters slain', stats.kills], ['Nights', stats.runs], ['Dawns', stats.victories], ['Bosses', stats.bosses]].forEach(([label, value]) => {
        const chip = el('div', 'rank-stat');
        chip.append(el('b', '', value > 0 ? number(value) : '-'), el('span', '', label));
        grid.appendChild(chip);
    });
    list.appendChild(grid);

    section(list, `BEST NIGHTS · TOP ${TOP_RUNS}`);
    const runs = save.topRuns ?? [];
    if (!runs.length) list.appendChild(el('p', 'rank-empty', 'Hunt a night to write your first record here.'));
    runs.forEach((r, i) => {
        const row = el('div', `rank-row${i < 3 ? ` is-top${i + 1}` : ''}`);
        const pic = el('img', 'rank-pic');
        pic.src = artOf(r.hero);
        pic.alt = HEROES[r.hero]?.name ?? '';
        const info = el('div', 'rank-info');
        info.append(el('b', '', HEROES[r.hero]?.name ?? '?'), el('span', '', `${r.victory ? 'Dawn' : `Wave ${r.wave}`}${r.darkness > 1 ? ` · Darkness ${r.darkness}` : ''} · ${number(r.kills ?? 0)} kills`));
        row.append(el('span', 'rank-pos', ['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`), pic, info, el('strong', 'rank-score', number(r.score)));
        list.appendChild(row);
    });

    section(list, 'HEROES');
    ACTIVE_HEROES.forEach(key => {
        const hero = HEROES[key];
        const owned = hero.free === true || save.unlockedHeroes.includes(key);
        const best = save.heroBests?.[key];
        const row = el('div', `rank-row is-hero${owned ? '' : ' is-locked'}`);
        const pic = el('img', 'rank-pic');
        pic.src = artOf(key);
        pic.alt = hero.name;
        const info = el('div', 'rank-info');
        info.append(el('b', '', hero.name), el('span', '', !owned ? 'Locked' : best ? `Best wave ${best.wave} · ${number(best.nights)} night${best.nights === 1 ? '' : 's'}` : 'Never hunted with him yet'));
        row.append(pic, info, el('strong', 'rank-score', owned && best ? number(best.score) : owned ? '—' : '🔒'));
        list.appendChild(row);
    });

    renderWaveStars(list);
}

function openScreen(mode) {
    const screen = document.getElementById('sanctuaryScreen');
    screen.classList.toggle('is-ranks-mode', mode === 'ranks');
    document.getElementById('sanctuaryTitle').textContent = mode === 'ranks' ? 'RANKS' : 'SANCTUARY';
    tab = mode === 'ranks' ? 'ranks' : tab === 'ranks' ? 'achievements' : tab;
    screen.classList.remove('hidden');
    renderSanctuary();
    audio.init();
    audio.setMood('camp');
}

export function openSanctuary() {
    save.sanctuarySeen = ACHIEVEMENTS.filter(a => save.achievements[a.id]).length;      // a bolinha do menu some
    persist();
    openScreen('sanctuary');
}

// Ranks: a mesma tela, sem as abas (entrada própria no menu)
export function openRanks() {
    openScreen('ranks');
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
