// GamePix (SDK v3, https://docs.gamepix.com). O <script> do SDK entra no index.html pelo build (platforms.yml).
// Tudo passa pelo objeto global `GamePix`. Os métodos devolvem Promise; se o SDK não carregou, o jogo segue sem anúncio.
const sdk = () => window.GamePix;
// Chama um método do SDK só se ele existir (o portal muda a lista; nunca pode quebrar o jogo)
const call = (name, ...args) => { try { const fn = sdk()?.[name]; if (typeof fn === 'function') return fn.apply(sdk(), args); } catch { } };

export default {
    // pause/resume/soundOn/soundOff são declarados no <head> pelo build (platforms.yml) e chegam aqui como "platform:event".
    // Calar e pausar a caçada / religar o som: o mesmo caminho do anúncio
    init({ pause, resume }) {
        window.addEventListener('platform:event', (e) => {
            if (e.detail === 'pause' || e.detail === 'soundOff') pause();
            else if (e.detail === 'resume' || e.detail === 'soundOn') resume();
        });
    },
    // Avisa o portal que o jogo terminou de carregar (ele esconde a tela de carregamento dele)
    loadingDone() {
        try { sdk()?.loading?.(100); } catch { }
        try { sdk()?.loaded?.(); } catch { }
    },
    gameplayStart() { call('levelStart'); },
    gameplayStop() {},
    // Fim da noite: placar, nível e o momento (vitória = feliz, derrota = triste)
    gameResult({ victory, score, night }) {
        call('updateScore', Math.max(0, Math.floor(score || 0)));
        if (night) call('updateLevel', night);
        if (victory) { call('levelEnd'); call('happyMoment'); }
        else { call('levelFail'); call('sadMoment'); }
        call('gameOver');
    },
    // Devolve true se um anúncio rodou. A pausa e o som são tratados por platform.js (pausa antes, retoma depois)
    showInterstitial() {
        const s = sdk();
        if (!s?.interstitialAd) return Promise.resolve(false);
        return new Promise((resolve) => {
            const tooLong = setTimeout(() => resolve(false), 90000);        // trava de segurança
            const done = (res) => { clearTimeout(tooLong); resolve(!!res?.success); };
            try { s.interstitialAd().then(done, () => done(false)); } catch { done(false); }
        });
    }
};
