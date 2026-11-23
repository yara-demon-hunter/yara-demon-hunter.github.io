import { audio, state } from '../core/state.js';
import { buyFuel, buyRest, leaveCamp, setupCamp } from './camp.js';
import { buyHero, chooseHero, closeHeroes, pickHeroOnStart } from './heroes.js';
import { inPortal, enterFullscreen, showIosHint } from './orientation.js';
import { choosePick, isPicking, setupQuickPick } from './quick_pick.js';
import { closeSanctuary, openRanks, openSanctuary, setSanctuaryTab } from './sanctuary.js';
import { closeAltar, openAltar, setupAltar } from './altar.js';
import { changeDarkness, quitToMenu, returnToMenu, shareResult, startGame, continueRun } from './screens.js';
import { openSettings, toggleSetting } from './settings.js';
import { setupTouchLayout } from './touch_layout.js';
import { openStatus, resumeGame, setStatusTab, showBuildNote } from './status.js';
import { skillTree } from './tree.js';
import { platform } from '../platform/platform.js';

// --- EVENTOS DA INTERFACE (BOTOES) ---
export function setupButtons() {
    const on = (id, handler) => document.getElementById(id).addEventListener('click', handler);

    on('btnSettings', (e) => {
        e.currentTarget.blur();     // Espaço é o dash: não pode reacionar o botão focado
        openSettings();
    });

    setupTouchLayout();
    showIosHint();

    // No celular (fora de portal): tela cheia, que precisa de um toque do jogador para ser permitida.
    // Também ao voltar da pausa, caso o jogador tenha saído da tela cheia.
    const start = () => {
        enterFullscreen();
        startGame();
    };
    // HUNT AGAIN (depois de uma noite): o anúncio do portal entra aqui, por ação do jogador e respeitando o intervalo mínimo
    const startAfterNight = async () => {
        enterFullscreen();
        if (state.gameState === 'GAMEOVER') await platform.showInterstitial();
        startGame();
    };
    const resume = () => {
        enterFullscreen();
        resumeGame();
    };
    on('btnStart', start);
    on('btnContinue', () => {
        enterFullscreen();
        continueRun();
    });
    on('btnRestart', startAfterNight);
    on('btnPause', (e) => {
        e.currentTarget.blur();
        openStatus();
    });
    on('btnCloseShop', resume);
    on('btnCloseSettings', resume);
    on('btnResumeSettings', resume);
    on('btnResume', resume);
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
        enterFullscreen();
        leaveCamp();
    });

    // Santuário e escolha do herói
    on('btnSanctuary', openSanctuary);
    on('btnCloseSanctuary', closeSanctuary);
    on('btnAltar', openAltar);
    on('btnRanks', openRanks);
    on('btnCloseAltar', closeAltar);
    setupAltar();
    // MENU depois de uma noite: outro ponto de anúncio entre partidas (a trava de 2 min evita dois seguidos)
    on('btnMenu', async () => { await platform.showInterstitial(); returnToMenu(); });
    document.getElementById('sanctuaryTabs').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-tab]');
        if (button) setSanctuaryTab(button.dataset.tab);
    });
    // Painel de requisitos de um herói bloqueado: botão de comprar com Brasas
    document.getElementById('heroAttrs').addEventListener('click', (e) => {
        const button = e.target.closest('[data-buy-hero]');
        if (button) buyHero(button.dataset.buyHero);
    });
    document.getElementById('heroPicker').addEventListener('click', (e) => {
        const card = e.target.closest('.hero-pick');
        if (card) pickHeroOnStart(card.dataset.hero);
    });
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

    // Teclado: P abre e fecha o status; Esc só fecha as telas do menu, Enter recomeça
    const menuScreenOpen = () => ['sanctuaryScreen', 'heroScreen', 'altarScreen'].some(id => !document.getElementById(id).classList.contains('hidden'));
    window.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        const pickKey = ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code);
        if (pickKey >= 0 && isPicking()) choosePick(pickKey);
        if (!confirmBox.classList.contains('hidden')) {
            if (e.code === 'Escape' || e.code === 'KeyP') closeConfirm();
            return;
        }
        // Esc só fecha telas do menu: em tela cheia ele também sai da tela cheia, então não pausa nem retoma a caçada
        if (e.code === 'Escape' && state.gameState === 'START' && menuScreenOpen()) {
            closeSanctuary();
            closeAltar();
            closeHeroes();
        } else if (e.code === 'KeyP') {
            if (state.gameState === 'START' && menuScreenOpen()) {
                closeSanctuary();
                closeAltar();
                closeHeroes();
            } else if (state.gameState === 'PLAYING') openStatus();
            else if (state.gameState === 'PAUSED') resumeGame();
        } else if (e.code === 'Enter' && !e.target.closest?.('button')) {
            if (state.gameState === 'GAMEOVER') startAfterNight();
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
    // Pausa pedida pelo portal (anúncio abrindo): pausa a caçada e cala o som; a volta só religa o som, o jogador retoma sozinho
    platform.onPause(() => { pauseHunt(); audio.setHidden(true); });
    platform.onResume(() => audio.setHidden(document.hidden));
}
