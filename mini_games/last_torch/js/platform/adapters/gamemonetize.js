// GameMonetize. O <script> do SDK e o SDK_OPTIONS entram no index.html pelo build (platforms.yml); o onEvent de lá só repete cada
// evento do SDK como o evento da janela "platform:event", que este adaptador escuta.
//   SDK_GAME_PAUSE  o anúncio vai abrir: pausar e calar o jogo      SDK_GAME_START  o anúncio acabou: pode voltar
export default {
    init({ pause, resume }) {
        window.addEventListener('platform:event', (e) => {
            if (e.detail === 'SDK_GAME_PAUSE') pause();
            else if (e.detail === 'SDK_GAME_START') resume();
        });
    },
    loadingDone() {},
    gameplayStart() {},
    gameplayStop() {},
    // Devolve true se um anúncio rodou. sdk.showBanner() abre o anúncio: o SDK avisa com PAUSE quando abre e START quando acaba
    showInterstitial() {
        const sdk = window.sdk;
        if (!sdk || typeof sdk.showBanner !== 'function') return Promise.resolve(false);
        return new Promise((resolve) => {
            let opened = false;
            let noAd, tooLong;
            const finish = (ran) => {
                window.removeEventListener('platform:event', onEvent);
                clearTimeout(noAd);
                clearTimeout(tooLong);
                resolve(ran);
            };
            const onEvent = (e) => {
                if (e.detail === 'SDK_GAME_PAUSE') { opened = true; clearTimeout(noAd); }
                else if (e.detail === 'SDK_GAME_START' && opened) finish(true);
            };
            window.addEventListener('platform:event', onEvent);
            noAd = setTimeout(() => { if (!opened) finish(false); }, 4000);     // sem anúncio disponível: segue o jogo
            tooLong = setTimeout(() => finish(opened), 90000);                  // trava de segurança
            try { sdk.showBanner(); } catch { finish(false); }
        });
    }
};
