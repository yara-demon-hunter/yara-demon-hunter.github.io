import { DEFAULT_PICKS, effectiveSpeed, ROSTER } from '../../data_model/characters.js';
import { KEYS } from '../../data_model/controls.js';
import { PLAYERS } from '../../data_model/players.js';
import { DEFAULT_STAGE, SELECTION_STORAGE_KEY, STAGES } from '../../data_model/stages.js';
import { TEXTS } from '../../data_model/texts.js';
import { CHARACTER_ATLAS as A } from '../../data_model/visuals/sprites.js';
import { SCENERY } from '../../data_model/visuals/arena.js';
import { playSound } from '../audio/sound.js';
import { drawCharacter } from '../render/character_art.js';
import { artFor, CELL_UNITS, POSES } from '../render/character_sprites.js';
import { drawStagePreview } from '../render/scenery.js';

// --- MENU: CARROSSEL DE PERSONAGENS E ESCOLHA DA ARENA ---
// As setas (ou A/D e ←/→) trocam o bicho, que cai do alto no lugar do anterior.
// No menu o desenho é ao vivo (são só dois bonecos), sem atlas.
const selection = { chars: [...DEFAULT_PICKS], stage: DEFAULT_STAGE };
try {
    const saved = JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY) || '{}');
    if (Array.isArray(saved.chars)) saved.chars.forEach((c, i) => { if (ROSTER[c]) selection.chars[i] = c; });
    if (STAGES[saved.stage]) selection.stage = saved.stage;
} catch (e) {}

function save() {
    try { localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(selection)); } catch (e) {}
}

export function getSelection() {
    return selection;
}

// Barras de atributo: normalizadas pelo menor e maior valor do elenco (SPEED já desconta o peso)
const STAT = { mass: c => c.mass, speed: effectiveSpeed, jump: c => c.jump };
const range = (key) => {
    const values = ROSTER.map(STAT[key]);
    return [Math.min(...values), Math.max(...values)];
};
const RANGES = { mass: range('mass'), speed: range('speed'), jump: range('jump') };
const MAX_MASS = RANGES.mass[1];

const pickers = [0, 1].map((i) => {
    const root = document.getElementById(`picker${i}`);
    root.style.setProperty('--pc', PLAYERS[i].color);
    root.innerHTML = `
        <span class="picker-tag">${TEXTS.pickerTags[i]}</span>
        <button class="arrow" data-dir="-1" aria-label="Previous">◀</button>
        <div class="picker-view${i === 1 ? ' flip' : ''}"><canvas width="140" height="140"></canvas></div>
        <button class="arrow" data-dir="1" aria-label="Next">▶</button>
        <div class="picker-info">
            <div class="picker-name"></div>
            ${Object.keys(RANGES).map(k => `<div class="stat"><span>${TEXTS.statLabels[k]}</span><div class="bar"><i data-stat="${k}"></i></div></div>`).join('')}
            <div class="dash-skill"><strong class="dash-name"></strong><span class="dash-description"></span></div>
        </div>`;
    root.querySelectorAll('.arrow').forEach(b => b.addEventListener('click', () => cycle(i, +b.dataset.dir)));
    return {
        root,
        canvas: root.querySelector('canvas'),
        name: root.querySelector('.picker-name'),
        dashName: root.querySelector('.dash-name'),
        dashDescription: root.querySelector('.dash-description')
    };
});

function drawPicker(i, step) {
    const { canvas } = pickers[i];
    const g = canvas.getContext('2d');
    const char = ROSTER[selection.chars[i]];
    // Tamanho segue a massa: o elefante ocupa o quadro, o rato fica pequeno
    const unit = (canvas.width / CELL_UNITS) * 1.25 * Math.sqrt(char.mass / MAX_MASS);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.save();
    g.translate(canvas.width / 2, canvas.height * 0.88 - unit * 1.15);
    g.scale(unit, unit);
    drawCharacter(g, artFor(selection.chars[i]), POSES.idle((step + i * 2) % A.anims.idle, A.anims.idle));
    g.restore();
}

function renderPicker(i, drop) {
    const p = pickers[i];
    const char = ROSTER[selection.chars[i]];
    p.name.innerText = char.name;
    p.dashName.innerText = `${TEXTS.dashLabel}: ${char.dash.name}`;
    p.dashDescription.innerText = char.dash.description;
    Object.entries(RANGES).forEach(([k, [lo, hi]]) => {
        const t = hi > lo ? (STAT[k](char) - lo) / (hi - lo) : 1;
        p.root.querySelector(`[data-stat="${k}"]`).style.width = `${Math.round(15 + t * 85)}%`;
    });
    drawPicker(i, step);
    if (drop) {
        p.canvas.classList.remove('drop');
        void p.canvas.offsetWidth;          // reinicia a animação de queda
        p.canvas.classList.add('drop');
    }
}

function cycle(i, dir) {
    selection.chars[i] = (selection.chars[i] + dir + ROSTER.length) % ROSTER.length;
    save();
    renderPicker(i, true);
    playSound('jump');
}

// Arenas: miniaturas desenhadas uma vez a partir do mesmo cenário do jogo
const stageRow = document.getElementById('stageRow');
const stageCards = STAGES.map((stage, i) => {
    const card = document.createElement('button');
    card.className = 'stage-card';
    const canvas = document.createElement('canvas');
    canvas.width = SCENERY.preview.width;
    canvas.height = SCENERY.preview.height;
    drawStagePreview(canvas.getContext('2d'), i, canvas.width, canvas.height);
    card.append(canvas, document.createTextNode(stage.name));
    card.addEventListener('click', () => selectStage(i));
    stageRow.appendChild(card);
    return card;
});

function selectStage(i) {
    selection.stage = i;
    save();
    stageCards.forEach((c, k) => c.classList.toggle('sel', k === i));
    playSound('coin');
}

// No menu: A/D trocam o P1 e ←/→ o P2
export function handleSelectKey(code) {
    KEYS.forEach((k, i) => {
        if (code === k.left) cycle(i, -1);
        else if (code === k.right) cycle(i, 1);
    });
}

let step = 0;
renderPicker(0, false);
renderPicker(1, false);
stageCards.forEach((c, k) => c.classList.toggle('sel', k === selection.stage));
setInterval(() => {
    if (document.getElementById('screenMenu').classList.contains('hidden')) return;
    step++;
    drawPicker(0, step);
    drawPicker(1, step);
}, 140);
