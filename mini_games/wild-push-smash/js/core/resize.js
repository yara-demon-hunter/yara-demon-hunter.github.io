import { H, W } from './canvas.js';

// Ajusta o jogo ao tamanho da tela (celular e desktop)
export const container = document.getElementById('game-container');
export function fitToScreen() {
    const s = Math.min(window.innerWidth / (W + 4), window.innerHeight / (H + 4), 1.6);
    container.style.transform = `scale(${s})`;
}
window.addEventListener('resize', fitToScreen);
fitToScreen();

