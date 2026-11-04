import { HINT_LAYOUT, KEYS } from '../../data_model/controls.js';
import { PLAYERS } from '../../data_model/players.js';
import { TEXTS } from '../../data_model/texts.js';

// --- DICA DE TECLAS NO RODAPÉ (computador) ---
// Em vez de uma linha de texto, cada jogador vê suas teclas desenhadas no lugar real do teclado.
// A tecla apertada acende na cor do jogador; com o TURBO carregado, a tecla de DASH fica roxa.
const hint = document.getElementById('controlsHint');
const keyEls = {};     // código da tecla -> tecla desenhada
const clusters = [];
const dashKeys = [];
// Contra o bot, o lugar das teclas do P2 mostra só quem está jogando
const botTag = document.createElement('div');
botTag.className = 'kc-bot hidden';
botTag.textContent = `🤖 ${TEXTS.botHint}`;

// Texto que aparece na tecla: KeyW -> W, ArrowUp -> ↑, Slash -> /, ShiftRight -> SHIFT
const ARROWS = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
const SYMBOLS = { Slash: '/', Period: '.', Comma: ',', Semicolon: ';', Space: 'SPACE' };
function glyph(code) {
    if (ARROWS[code]) return ARROWS[code];
    if (SYMBOLS[code]) return SYMBOLS[code];
    if (code.startsWith('Shift')) return 'SHIFT';
    if (code.startsWith('Control')) return 'CTRL';
    return code.replace(/^(Key|Digit|Numpad)/, '');
}

function makeKey(action, code) {
    const key = document.createElement('div');
    key.className = `kc kc-${action}`;
    const cap = document.createElement('b');
    cap.textContent = glyph(code);
    if (cap.textContent.length > 2) key.classList.add('kc-word');
    const label = document.createElement('small');
    label.textContent = TEXTS.keyLabels[action];
    key.append(cap, label);
    keyEls[code] = key;
    return key;
}

HINT_LAYOUT.forEach((rows, i) => {
    const cluster = document.createElement('div');
    cluster.className = `kc-cluster kc-p${i + 1}`;
    cluster.style.setProperty('--pc', PLAYERS[i].color);
    rows.flat().forEach(action => {
        const key = makeKey(action, KEYS[i][action]);
        if (action === 'dash') dashKeys[i] = key;
        cluster.appendChild(key);
    });
    hint.append(cluster);
    clusters[i] = cluster;
});
hint.append(botTag);

export function setBotHint(isBot) {
    clusters[1].classList.toggle('hidden', isBot);
    botTag.classList.toggle('hidden', !isBot);
}

export function setTurboHint(i, ready) {
    const key = dashKeys[i];
    if (!key || key.classList.contains('kc-turbo') === ready) return;
    key.classList.toggle('kc-turbo', ready);
    key.lastElementChild.textContent = TEXTS.keyLabels[ready ? 'turbo' : 'dash'];
}

const press = (e, down) => keyEls[e.code]?.classList.toggle('kc-pressed', down);
window.addEventListener('keydown', e => press(e, true));
window.addEventListener('keyup', e => press(e, false));
window.addEventListener('blur', () => Object.values(keyEls).forEach(k => k.classList.remove('kc-pressed')));
