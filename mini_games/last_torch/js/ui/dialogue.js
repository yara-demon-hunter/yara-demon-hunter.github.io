import { BOSS_INTROS, DIALOGUE_TYPE_SECONDS, DUEL_DIALOGUES } from '../../data_model/dialogues.js';
import { BOSS_MODELS, RIVAL_OF } from '../../data_model/bosses.js';
import { HEROES } from '../../data_model/heroes.js';
import { releaseTouchControls } from '../core/input.js';
import { state } from '../core/state.js';
import { getHero } from '../systems/modifiers.js';

// --- DIÁLOGO DO DUELO ---
// Quando o rival cai, a caçada para: os dois retratos sobem nos cantos, o de quem fala acende, e a fala aparece
// letra a letra numa caixa embaixo. Toque, clique, Espaço ou Enter: completa a fala ou passa para a próxima.
// Na última, a caçada continua de onde parou (onDone). Falas em data_model/dialogues.js; estilo em
// css/components/dialogue.css.
const HUNTER_IMAGE = 'images/characters/demon-hunter-small.webp';

let root = null;
let lines = [];
let index = 0;
let typed = 0;
let typeTimer = null;
let finish = null;
// Quem aparece no lugar do rival quando fala um 'boss' (Captain Brutos): { name, portraitImage }. null = não há
let bossHero = null;
let rivalHero = null;

// Espera a caçada estar rodando (o jogador pode ter pausado nesse meio tempo); se a partida acabou, desiste
export function whenHunting(run) {
    if (state.gameState === 'GAMEOVER' || state.gameState === 'START') return;
    if (state.gameState === 'PLAYING') run();
    else setTimeout(() => whenHunting(run), 200);
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

// Retrato: arte própria do herói, ou a do Caçador com o filtro de cor da variação dele
function portrait(hero, side) {
    const box = el('div', `dlg-portrait dlg-${side}`);
    const img = el('img');
    img.src = hero.portraitImage ?? HUNTER_IMAGE;
    img.alt = hero.name;
    if (!hero.portraitImage && hero.portrait) img.style.filter = hero.portrait;
    box.append(img, el('span', 'dlg-name', hero.name));
    return box;
}

// intro: provocação antes do boss (tom vermelho de ameaça; ver css/components/dialogue.css)
function build(rivalHero, playerHero, intro) {
    root = el('div', intro ? 'dlg dlg-intro' : 'dlg');
    root.id = 'dialogue';
    const box = el('div', 'dlg-box');
    box.append(el('p', 'dlg-speaker'), el('p', 'dlg-text'), el('span', 'dlg-next', '▼'));
    // Faixas de cinema: entram por cima e por baixo e marcam que a caçada parou para a cena
    root.append(el('div', 'dlg-bar dlg-bar-top'), el('div', 'dlg-bar dlg-bar-bottom'),
        portrait(playerHero, 'hero'), portrait(rivalHero, 'rival'), box);
    root.addEventListener('pointerdown', e => {
        e.preventDefault();
        advance();
    });
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('is-open'));
}

// Troca o retrato do lado do rival: o do rival, ou o do boss que chegou quando ele fala
function showRivalSide(hero) {
    const box = root.querySelector('.dlg-rival');
    box.querySelector('img').src = hero.portraitImage ?? HUNTER_IMAGE;
    box.querySelector('img').alt = hero.name;
    box.querySelector('.dlg-name').textContent = hero.name;
}

function showLine() {
    const line = lines[index];
    // 'boss' fala do lado do rival, com o retrato dele
    const side = line.who === 'boss' ? 'rival' : line.who;
    if (bossHero && side === 'rival') showRivalSide(line.who === 'boss' ? bossHero : rivalHero);
    root.dataset.who = side;
    root.querySelector('.dlg-speaker').textContent = root.querySelector(`.dlg-${side} .dlg-name`).textContent;
    const text = root.querySelector('.dlg-text');
    typed = 0;
    text.textContent = '';
    root.classList.remove('is-done');
    clearInterval(typeTimer);
    typeTimer = setInterval(() => {
        typed++;
        text.textContent = line.text.slice(0, typed);
        if (typed >= line.text.length) completeLine();
    }, DIALOGUE_TYPE_SECONDS * 1000);
}

function completeLine() {
    clearInterval(typeTimer);
    typeTimer = null;
    root.querySelector('.dlg-text').textContent = lines[index].text;
    root.classList.add('is-done');
}

function advance() {
    if (!root) return;
    if (typeTimer) {
        completeLine();
        return;
    }
    index++;
    if (index < lines.length) showLine();
    else close();
}

function close() {
    document.removeEventListener('keydown', onKey, true);
    const node = root;
    root = null;
    node.classList.remove('is-open');
    setTimeout(() => node.remove(), 450);   // espera as faixas de cinema saírem
    state.gameState = 'PLAYING';
    const done = finish;
    finish = null;
    done?.();
}

function onKey(e) {
    if (e.code !== 'Space' && e.code !== 'Enter' && e.code !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    advance();
}

// bossType: o rival (AZAEL, DEMON_HUNTER ou a revanche, *_FINAL). moment: 'before' (ele surgiu) ou 'after' (caiu).
// Sem falas para ele, segue direto.
export function playDuelDialogue(bossType, moment, onDone) {
    const final = bossType.endsWith('_FINAL');
    const key = final ? bossType.slice(0, -'_FINAL'.length) : bossType;
    const set = DUEL_DIALOGUES[key];
    const script = (set?.byHero?.[getHero().model] ?? set)?.[final ? 'final' : 'first']?.[moment];
    play(script, key, false, onDone);
}

// Provocação antes de um boss que não é o rival: quem fala é o rival do herói (RIVAL_OF). Sem falas, segue direto.
export function hasBossIntro(bossType) {
    const rival = RIVAL_OF[getHero().model] ?? RIVAL_OF.hunter;
    return !!(BOSS_INTROS[rival]?.[bossType] ?? BOSS_INTROS[rival]?.default);
}

export function playBossIntro(bossType, onDone) {
    const rival = RIVAL_OF[getHero().model] ?? RIVAL_OF.hunter;
    const boss = BOSS_MODELS[bossType];
    play(BOSS_INTROS[rival]?.[bossType] ?? BOSS_INTROS[rival]?.default, rival, true, onDone, { name: boss.name, portraitImage: boss.portraitImage });
}

// rivalType: o boss do rival (AZAEL ou DEMON_HUNTER), de onde vem o retrato dele
// arriving: o boss que chega e fala nas falas 'boss' ({ name, portraitImage }), se houver
function play(script, rivalType, intro, onDone, arriving = null) {
    if (!script || root) {
        onDone();
        return;
    }
    lines = script;
    index = 0;
    finish = onDone;
    state.gameState = 'DIALOGUE';
    releaseTouchControls();
    rivalHero = HEROES[BOSS_MODELS[rivalType].heroKey];
    bossHero = script.some(l => l.who === 'boss') ? arriving : null;
    build(rivalHero, getHero(), intro);
    document.addEventListener('keydown', onKey, true);
    showLine();
}
