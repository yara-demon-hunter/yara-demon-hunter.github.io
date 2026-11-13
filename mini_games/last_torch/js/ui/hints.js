import { save, persist } from '../core/save.js';
import { state } from '../core/state.js';
import { showToast } from './banner.js';
import { mod } from '../systems/modifiers.js';

// --- PRIMEIRA NOITE ---
// Dicas curtas e espaçadas, só na primeira partida do jogador.
const touch = () => window.matchMedia('(pointer: coarse)').matches;

// No computador os dois cliques ficam no lembrete do mouse: estas duas dicas são só do toque
const HINTS = [
    { at: 1.8, icon: '🕹️', title: () => (touch() ? 'Left thumb moves' : 'Move with the mouse'), sub: 'Your blade strikes on its own' },
    { at: 8, icon: '🗡️', title: () => 'Right button throws a dagger', sub: '', touchOnly: true },
    { at: 15, icon: '💨', title: () => 'Small button dashes', sub: '', touchOnly: true }
];

let timers = [];

// A tocha cura: a dica aparece em toda partida (uma vez por partida), na primeira vez que o herói se machuca ou aos 25 s,
// até o jogador se curar de verdade na tocha (save.learnedWarmth, marcado em js/systems/torch.js). Aí ele aprendeu e ela
// não volta. Nada se o Juramento tirou a cura da tocha.
let warmthShownThisRun = false;

export function warmthHint() {
    if (warmthShownThisRun || save.learnedWarmth || mod('noWarmthHeal') > 0 || state.gameState !== 'PLAYING') return;
    warmthShownThisRun = true;
    showTorchHint('🔥 Stay near the torch to heal', 'Inside the dashed circle');
}

// O balão fica em cima da tocha (acima do fogo e da barra de vida dela), na posição dela na tela
const TORCH_HINT_LIFT = 100;       // unidades do mundo acima da base da tocha
function showTorchHint(title, sub) {
    const box = document.getElementById('torchHint');
    if (!box) return;
    const { scale, offsetX, offsetY } = state.view;
    box.style.left = `${state.coreX * scale + offsetX}px`;
    box.style.top = `${(state.coreY - TORCH_HINT_LIFT) * scale + offsetY}px`;
    box.querySelector('b').textContent = title;
    box.querySelector('span').textContent = sub;
    box.classList.remove('is-showing');
    void box.offsetWidth;          // recomeça a animação
    box.classList.add('is-showing');
}

// Chamado quando a tocha cura o herói: depois de uma cura de verdade, o jogador aprendeu
export function learnedWarmth() {
    if (save.learnedWarmth) return;
    save.learnedWarmth = true;
    persist();
}

// Toda partida, no começo da hora 1. Reiniciar a partida recomeça a animação
function showMouseHint() {
    if (touch()) return;
    const hint = document.getElementById('mouseHint');
    hint.classList.remove('is-showing');
    void hint.offsetWidth;
    hint.classList.add('is-showing');
    hint.onanimationend = (e) => {
        if (e.target === hint) hint.classList.remove('is-showing');
    };
}

export function startHints() {
    showMouseHint();
    timers.forEach(clearTimeout);
    timers = [];
    warmthShownThisRun = false;
    timers.push(setTimeout(warmthHint, 25000));
    if (save.seenTutorial) return;
    HINTS.filter(hint => touch() || !hint.touchOnly).forEach(hint => {
        timers.push(setTimeout(() => {
            if (state.gameState === 'PLAYING') showToast(hint.icon, hint.title(), hint.sub);
        }, hint.at * 1000));
    });
    save.seenTutorial = true;
    persist();
}
