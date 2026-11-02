import { audio, state } from '../core/state.js';
import { buyFuel, buyRest, leaveCamp, setupCamp } from './camp.js';
import { chooseHero, closeHeroes, openHeroes } from './heroes.js';
import { inPortal, lockLandscape, showIosHint } from './orientation.js';
import { choosePick, isPicking, setupQuickPick } from './quick_pick.js';
import { closeSanctuary, openSanctuary, setSanctuaryTab } from './sanctuary.js';
import { changeDarkness, keepHunting, quitToMenu, returnToMenu, shareResult, startGame } from './screens.js';
import { openSettings, toggleSetting } from './settings.js';
import { setupTouchLayout } from './touch_layout.js';
import { openStatus, resumeGame, setStatusTab, showBuildNote } from './status.js';
import { skillTree } from './tree.js';

// --- EVENTOS DA INTERFACE (BOTOES) ---
export function setupButtons() {
    const on = (id, handler) => document.getElementById(id).addEventListener('click', handler);

    on('btnSettings', (e) => {
        e.currentTarget.blur();     // Espaço é o dash: não pode reacionar o botão focado
        openSettings();
    });

    setupTouchLayout();
    showIosHint();
    document.getElementById('btnShare').classList.toggle('hidden', inPortal);

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
    on('btnCloseSettings', resume);
    on('btnResumeSettings', resume);
    on('btnResume', resume);
    on('btnEndless', () => {
        lockLandscape();
        keepHunting();
    });
    // Sair para o menu pede confirmação: um toque sem querer não pode jogar a noite fora
    const confirmBox = document.getElementById('confirmScreen');
    const closeConfirm = () => confirmBox.classList.add('hidden');
    on('btnQuit', () => confirmBox.classList.remove('hidden'));
    on('btnConfirmStay', closeConfirm);
    on('btnConfirmQuit', () => {
        closeConfirm();
        quitToMenu();
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
    setupQuickPick();
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
        const pickKey = ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code);
        if (pickKey >= 0 && isPicking()) choosePick(pickKey);
        if (!confirmBox.classList.contains('hidden')) {
            if (e.code === 'Escape' || e.code === 'KeyP') closeConfirm();
            return;
        }
        if (e.code === 'Escape' || e.code === 'KeyP') {
            if (state.gameState === 'START' && menuScreenOpen()) {
                closeSanctuary();
                closeHeroes();
            } else if (state.gameState === 'PLAYING') openStatus();
            else if (state.gameState === 'PAUSED') resumeGame();
        } else if (e.code === 'Enter' && !e.target.closest?.('button')) {
            if (state.gameState === 'GAMEOVER') start();
            else if (state.gameState === 'CAMP') leaveCamp();
            else if (state.gameState === 'START' && !menuScreenOpen()) start();
        }
    });

    // Saiu da aba no meio da caçada: pausa sozinho
    const pauseHunt = () => {
        if (state.gameState === 'PLAYING' && state.phase === 'HUNT') openStatus();
    };
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) pauseHunt();
        audio.setHidden(document.hidden);
    });
    // Clicou fora do jogo (iframe do portal, outra janela): a aba continua visível, mas o jogador saiu
    window.addEventListener('blur', pauseHunt);
}
