import { WORLD } from '../../data_model/world.js';

// --- ORIENTAÇÃO NO CELULAR ---
// No celular o jogo é jogado em retrato (joystick num canto, botão da adaga no outro).
// Ao começar a partida tenta travar a tela em retrato (tela cheia; funciona no Android).
// Onde não dá para travar (iOS), o aviso #rotateNotice pede para girar o aparelho e o jogo fica parado.
// A mesma condição está em css/components/orientation.css.
const phoneLandscape = window.matchMedia(
    `(pointer: coarse) and (orientation: landscape) and (max-height: ${WORLD.mobileMaxShortSide - 1}px)`
);

export function isPhoneLandscape() {
    return phoneLandscape.matches;
}

export async function lockPortrait() {
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        }
        await screen.orientation.lock('portrait');
    } catch {
        // Sem suporte (iOS, alguns navegadores): fica o aviso para girar o aparelho
    }
}
