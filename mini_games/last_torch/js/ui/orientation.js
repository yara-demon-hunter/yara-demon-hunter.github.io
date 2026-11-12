// --- CELULAR: EM PÉ OU DE LADO ---
// O jogo roda nas duas orientações. O mundo tem o lado menor fixo (data_model/world.js), então herói e
// monstros ficam do mesmo tamanho na tela em pé e deitado; em pé a arena fica mais alta que larga.
// Em portais (CrazyGames) quem cuida da tela cheia é o próprio portal.

// iPhone (Safari) não tem a API de tela cheia: o jeito é abrir pela Tela de Início
const isIphone = /iPhone|iPod/.test(navigator.userAgent);
const isStandalone = () => window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

// Dentro do iframe de um portal não dá para salvar na Tela de Início nem compartilhar o próprio endereço
export const inPortal = window.self !== window.top;

export function showIosHint() {
    document.getElementById('iosHint')?.classList.toggle('hidden', !isIphone || isStandalone() || inPortal);
}

// No site, no celular: tela cheia ao começar (precisa de um toque do jogador). Não trava a orientação.
export async function enterFullscreen() {
    if (inPortal || !window.matchMedia('(pointer: coarse)').matches) return;
    try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        }
    } catch {
        // Sem suporte (iPhone): segue na página normal
    }
}
