// --- ORIENTAÇÃO NO CELULAR ---
// A arena é 16:9 e os dois joysticks ficam nas laterais: no celular só se joga DE LADO (paisagem).
// Ao começar a partida tenta travar a tela em paisagem e em tela cheia (funciona no Android).
// Onde não dá para travar (iOS), o aviso #rotateNotice pede para virar o aparelho e a partida
// fica parada enquanto ele estiver em pé. A mesma condição está em css/game.css.
const phonePortrait = window.matchMedia('(pointer: coarse) and (orientation: portrait) and (max-width: 599px)');

export function isPhonePortrait() {
    return phonePortrait.matches;
}

// Tela cheia: padrão e o prefixo do Safari (iPad). No iPhone o Safari não deixa nenhuma página
// ficar em tela cheia; lá só adicionando à tela de início (metas apple-mobile-web-app no HTML).
function requestFullscreen() {
    const el = document.documentElement;
    const request = el.requestFullscreen || el.webkitRequestFullscreen;
    if (document.fullscreenElement || document.webkitFullscreenElement || !request) return Promise.resolve();
    return Promise.resolve(request.call(el, { navigationUI: 'hide' }));
}

export async function lockLandscape() {
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    try {
        await requestFullscreen();
    } catch {
        // Sem permissão (ex.: dentro de um iframe sem allow="fullscreen")
    }
    try {
        await screen.orientation.lock('landscape');
    } catch {
        // Sem suporte (iOS, alguns navegadores): fica o aviso para virar o aparelho de lado
    }
}

// O navegador só deixa pedir tela cheia dentro de um toque: o primeiro toque no menu já
// esconde a barra de endereço (e de novo ao começar cada partida, se o jogador tiver saído)
document.getElementById('screenMenu').addEventListener('pointerup', e => {
    if (e.pointerType === 'touch') lockLandscape();
});
