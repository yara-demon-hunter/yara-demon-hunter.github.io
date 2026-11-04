// --- ORIENTAÇÃO NO CELULAR ---
// A arena é 16:9 e os dois joysticks ficam nas laterais: no celular só se joga DE LADO (paisagem).
// Ao começar a partida tenta travar a tela em paisagem e em tela cheia (funciona no Android).
// Onde não dá para travar (iOS), o aviso #rotateNotice pede para virar o aparelho e a partida
// fica parada enquanto ele estiver em pé. A mesma condição está em css/game.css.
const phonePortrait = window.matchMedia('(pointer: coarse) and (orientation: portrait) and (max-width: 599px)');

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
