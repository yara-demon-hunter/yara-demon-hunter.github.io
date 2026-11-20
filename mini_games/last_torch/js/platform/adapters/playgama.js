// Playgama Bridge (https://wiki.playgama.com/playgama/bridge-sdk). O <script> do SDK entra no index.html pelo build (platforms.yml) e o
// playgama-bridge-config.json fica ao lado dele. Tudo passa pelo objeto global `bridge`.
//   PAUSE_STATE_CHANGED  o portal pede pausa (anúncio, troca de aba): pausar e calar     AUDIO_STATE_CHANGED  o portal pede som desligado
const bridge = () => window.bridge;

export default {
    init({ pause, resume }) {
        const b = bridge();
        if (!b) return;
        b.initialize().then(() => {
            b.platform.on(b.EVENT_NAME.PAUSE_STATE_CHANGED, (isPaused) => (isPaused ? pause() : resume()));
            // O estado inicial não vira evento: aplica à mão
            if (b.platform.isAudioEnabled === false) pause();
            b.platform.sendMessage('game_ready');
        }).catch(() => { });
    },
    loadingDone() {},
    gameplayStart() { try { bridge()?.platform.sendMessage('level_started'); } catch { } },
    gameplayStop() { try { bridge()?.platform.sendMessage('level_failed'); } catch { } },
    // Devolve true se um anúncio rodou: abre (opened) e termina em closed ou failed
    showInterstitial() {
        const b = bridge();
        if (!b?.advertisement?.isInterstitialSupported) return Promise.resolve(false);
        return new Promise((resolve) => {
            let opened = false;
            let tooLong;
            const onState = (state) => {
                if (state === 'opened') opened = true;
                else if (state === 'closed') finish(true);
                else if (state === 'failed') finish(false);
            };
            const finish = (ran) => {
                clearTimeout(tooLong);
                try { b.advertisement.off?.(b.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, onState); } catch { }
                resolve(ran);
            };
            tooLong = setTimeout(() => finish(opened), 90000);          // trava de segurança
            try {
                b.advertisement.on(b.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, onState);
                b.advertisement.showInterstitial('game_over');
            } catch { finish(false); }
        });
    }
};
