import { WORLD } from '../../data_model/world.js';

// --- ORIENTAÇÃO NO CELULAR ---
// No celular o jogo é jogado DE LADO (paisagem), com os dois polegares: joystick à esquerda
// e botão da adaga à direita. Ao começar a partida tenta travar a tela em paisagem (tela cheia;
// funciona no Android). Onde não dá para travar (iOS), o aviso #rotateNotice pede para virar o
// aparelho de lado e o jogo fica parado enquanto ele estiver em pé.
// A mesma condição está em css/components/orientation.css.
const phonePortrait = window.matchMedia(
    `(pointer: coarse) and (orientation: portrait) and (max-width: ${WORLD.mobileMaxShortSide - 1}px)`
);

export function isPhonePortrait() {
    return phonePortrait.matches;
}

export async function lockLandscape() {
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        }
        await screen.orientation.lock('landscape');
    } catch {
        // Sem suporte (iOS, alguns navegadores): fica o aviso para virar o aparelho de lado
    }
}
