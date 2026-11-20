// CrazyGames (SDK v3). Ainda NÃO testado com o portal: confira com a documentação deles antes de publicar.
const sdk = () => window.CrazyGames?.SDK;
export default {
    async init() { try { await sdk()?.init(); } catch { /* sem SDK (fora do portal): o jogo segue */ } },
    loadingDone() { try { sdk()?.game.loadingStop(); } catch { } },
    gameplayStart() { try { sdk()?.game.gameplayStart(); } catch { } },
    gameplayStop() { try { sdk()?.game.gameplayStop(); } catch { } },
    showInterstitial() {
        const ad = sdk()?.ad;
        if (!ad) return Promise.resolve(false);
        return new Promise((resolve) => {
            try {
                ad.requestAd('midgame', { adStarted: () => {}, adFinished: () => resolve(true), adError: () => resolve(false) });
            } catch { resolve(false); }
        });
    }
};
