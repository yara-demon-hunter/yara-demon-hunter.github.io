import { save } from '../core/save.js';
import { audio, state } from '../core/state.js';
import { buyFuel, buyOffer, buyRest, leaveCamp, rerollOffers } from './camp.js';
import { chooseCard, rerollCards } from './cards.js';
import { buyMetaUpgrade, chooseHero, closeHearth, openHearth, setHearthTab } from './hearth.js';
import { beginDeath } from '../systems/night.js';
import { lockLandscape } from './orientation.js';
import { changeDarkness, keepHunting, returnToMenu, shareResult, startGame } from './screens.js';
import { openStatus, resumeGame, toggleSetting } from './status.js';

// --- EVENTOS DA INTERFACE (BOTOES) ---
export function setupButtons() {
    const on = (id, handler) => document.getElementById(id).addEventListener('click', handler);

    const updateSoundIcon = () => { document.getElementById('btnSound').innerText = save.settings.muted ? '🔇' : '🔊'; };
    updateSoundIcon();
    on('btnSound', (e) => {
        audio.toggleMute();
        updateSoundIcon();
        e.currentTarget.blur();     // Espaço é o dash: não pode reacionar o botão focado
    });

    // No celular: tela cheia travada de lado, em paisagem (precisa de um toque do jogador para ser permitido).
    // Também ao voltar da pausa, caso o jogador tenha saído da tela cheia (a trava se perde junto).
    const start = () => {
        lockLandscape();
        startGame();
    };
    const resume = () => {
        lockLandscape();
        resumeGame();
    };
    on('btnStart', start);
    on('btnRestart', start);
    on('btnPause', (e) => {
        e.currentTarget.blur();
        openStatus();
    });
    on('btnCloseShop', resume);
    on('btnResume', resume);
    on('btnEndless', () => {
        lockLandscape();
        keepHunting();
    });
    on('btnAbandon', () => {
        resumeGame();
        beginDeath('PLAYER');
    });

    // Cartas
    document.getElementById('cardRow').addEventListener('click', (e) => {
        const card = e.target.closest('button[data-card]');
        if (card) chooseCard(Number(card.dataset.card));
    });
    on('btnReroll', rerollCards);

    // Acampamento
    document.getElementById('campOffers').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-offer]');
        if (button && !button.disabled) buyOffer(Number(button.dataset.offer));
    });
    on('btnFuel', buyFuel);
    on('btnRest', buyRest);
    on('btnCampReroll', rerollOffers);
    on('btnCampLeave', () => {
        lockLandscape();
        leaveCamp();
    });

    // Hearth
    on('btnHearth', openHearth);
    on('btnHearthSummary', () => {
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
        state.gameState = 'START';
        openHearth();
    });
    on('btnCloseHearth', closeHearth);
    on('btnMenu', returnToMenu);
    on('btnShare', shareResult);
    document.getElementById('hearthTabs').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-tab]');
        if (button) setHearthTab(button.dataset.tab);
    });
    document.getElementById('hearthList').addEventListener('click', (e) => {
        const upgrade = e.target.closest('button[data-upgrade]');
        if (upgrade && !upgrade.disabled) buyMetaUpgrade(upgrade.dataset.upgrade);
        const hero = e.target.closest('button[data-hero]');
        if (hero) chooseHero(hero.dataset.hero);
    });

    on('btnDarkDown', () => changeDarkness(-1));
    on('btnDarkUp', () => changeDarkness(1));

    document.querySelectorAll('[data-setting]').forEach(button => {
        button.addEventListener('click', () => toggleSetting(button.dataset.setting));
    });

    // Teclado: 1-4 escolhem carta, Esc/P pausam, Enter recomeça
    window.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        if (state.gameState === 'CARDS' && /^Digit[1-4]$/.test(e.code)) chooseCard(Number(e.code.slice(5)) - 1);
        else if (state.gameState === 'CARDS' && e.code === 'KeyR') rerollCards();
        else if (e.code === 'Escape' || e.code === 'KeyP') {
            if (state.gameState === 'PLAYING') openStatus();
            else if (state.gameState === 'PAUSED') resumeGame();
        } else if (e.code === 'Enter') {
            if (state.gameState === 'GAMEOVER') start();
            else if (state.gameState === 'CAMP') leaveCamp();
            else if (state.gameState === 'START' && document.getElementById('hearthScreen').classList.contains('hidden')) start();
        }
    });

    // Saiu da aba no meio da caçada: pausa sozinho
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && state.gameState === 'PLAYING' && state.phase === 'HUNT') openStatus();
    });
}
