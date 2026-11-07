import { DIALOGUE_TYPE_SECONDS, DUEL_DIALOGUES } from '../../data_model/dialogues.js';
import { BOSS_MODELS } from '../../data_model/bosses.js';
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

function build(rivalHero, playerHero) {
    root = el('div', 'dlg');
    root.id = 'dialogue';
    const box = el('div', 'dlg-box');
    box.append(el('p', 'dlg-speaker'), el('p', 'dlg-text'), el('span', 'dlg-next', '▼'));
    root.append(portrait(playerHero, 'hero'), portrait(rivalHero, 'rival'), box);
    root.addEventListener('pointerdown', e => {
        e.preventDefault();
        advance();
    });
    document.body.appendChild(root);
    requestAnimationFrame(() => root.classList.add('is-open'));
}

function showLine() {
    const line = lines[index];
    root.dataset.who = line.who;
    root.querySelector('.dlg-speaker').textContent = root.querySelector(`.dlg-${line.who} .dlg-name`).textContent;
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
    setTimeout(() => node.remove(), 250);
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
    const script = DUEL_DIALOGUES[key]?.[final ? 'final' : 'first']?.[moment];
    if (!script || root) {
        onDone();
        return;
    }
    lines = script;
    index = 0;
    finish = onDone;
    state.gameState = 'DIALOGUE';
    releaseTouchControls();
    build(HEROES[BOSS_MODELS[bossType].heroKey], getHero());
    document.addEventListener('keydown', onKey, true);
    showLine();
}
