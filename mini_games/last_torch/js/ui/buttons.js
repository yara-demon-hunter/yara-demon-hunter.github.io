import { save } from '../core/save.js';
import { audio, state } from '../core/state.js';
import { buyFuel, buyRest, leaveCamp, setupCamp } from './camp.js';
import { chooseHero, closeHeroes, openHeroes } from './heroes.js';
import { beginDeath } from '../systems/night.js';
import { lockLandscape } from './orientation.js';
import { closeSanctuary, openSanctuary, setSanctuaryTab } from './sanctuary.js';
import { changeDarkness, keepHunting, returnToMenu, shareResult, startGame } from './screens.js';
import { openStatus, resumeGame, setStatusTab, showBuildNote, toggleSetting } from './status.js';
import { skillTree } from './tree.js';

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

    // Acampamento
    on('btnFuel', buyFuel);
    on('btnRest', buyRest);
    on('btnCampLeave', () => {
        lockLandscape();
        leaveCamp();
    });

    // Santuário e escolha do herói
    on('btnSanctuary', openSanctuary);
    on('btnSanctuarySummary', () => {
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
        state.gameState = 'START';
        openSanctuary();
    });
    on('btnCloseSanctuary', closeSanctuary);
    on('btnMenu', returnToMenu);
    on('btnShare', shareResult);
    document.getElementById('sanctuaryTabs').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-tab]');
        if (button) setSanctuaryTab(button.dataset.tab);
    });
    on('btnHeroes', openHeroes);
    on('btnCloseHeroes', closeHeroes);
    document.getElementById('heroRoster').addEventListener('click', (e) => {
        const card = e.target.closest('button[data-hero]');
        if (card && !card.disabled) chooseHero(card.dataset.hero);
    });

    on('btnDarkDown', () => changeDarkness(-1));
    on('btnDarkUp', () => changeDarkness(1));

    skillTree.setup();
    setupCamp();
    document.getElementById('statusTabs').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-status-tab]');
        if (button) setStatusTab(button.dataset.statusTab);
    });
    document.getElementById('tabBuild').addEventListener('click', (e) => {
        const row = e.target.closest('[data-note]');
        if (row) showBuildNote(row);
    });

    document.querySelectorAll('[data-setting]').forEach(button => {
        button.addEventListener('click', () => toggleSetting(button.dataset.setting));
    });

    // Teclado: Esc/P abrem e fecham o status (e as telas do menu), Enter recomeça
    const menuScreenOpen = () => ['sanctuaryScreen', 'heroScreen'].some(id => !document.getElementById(id).classList.contains('hidden'));
    window.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        if (e.code === 'Escape' || e.code === 'KeyP') {
            if (state.gameState === 'START' && menuScreenOpen()) {
                closeSanctuary();
                closeHeroes();
            } else if (state.gameState === 'PLAYING') openStatus();
            else if (state.gameState === 'PAUSED') resumeGame();
        } else if (e.code === 'Enter') {
            if (state.gameState === 'GAMEOVER') start();
            else if (state.gameState === 'CAMP') leaveCamp();
            else if (state.gameState === 'START' && !menuScreenOpen()) start();
        }
    });

    // Saiu da aba no meio da caçada: pausa sozinho
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && state.gameState === 'PLAYING' && state.phase === 'HUNT') openStatus();
        audio.setHidden(document.hidden);
    });
}
