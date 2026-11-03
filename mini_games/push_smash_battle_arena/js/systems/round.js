import { COINS_STORAGE_KEY } from '../../data_model/controls.js';
import { MATCH } from '../../data_model/match.js';
import { TEXTS } from '../../data_model/texts.js';
import { shrinkPlatform } from '../core/arena.js';
import { state } from '../core/state.js';
import { players } from '../entities/player.js';
import { showBanner } from './effects.js';
import { showGameOverMenu, startRound } from './match.js';
import { updateWinsHUD } from '../ui/hud.js';

// --- RODADAS ---
export function updateRoundTimer() {
    state.roundFrames++;
    if (state.roundFrames % 60 !== 0) return;
    state.matchTimer--;
    document.getElementById('timerDisplay').innerText = state.matchTimer;
    // Arena fecha no fim do round
    if (state.matchTimer <= MATCH.shrinkStartSeconds) shrinkPlatform(state.matchTimer <= MATCH.shrinkLastSeconds ? MATCH.shrinkPerSecondLast : MATCH.shrinkPerSecond);
    if (state.matchTimer === MATCH.shrinkLastSeconds) showBanner(TEXTS.last15, '#ff4757', 1000);
    if (state.matchTimer <= 0) endRoundByTimer();
}

export function endRoundByTimer() {
    const [p1, p2] = players;
    let winner = null;
    if (p1.matchCoins > p2.matchCoins) winner = p1;
    else if (p2.matchCoins > p1.matchCoins) winner = p2;
    endRound(winner, 'coins');
}


export function endRound(winner, reason) {
    state.gameState = 'ROUND_END';
    if (winner) winner.roundWins++;
    updateWinsHUD();

    // Salvar Moedas Totais
    state.coins += players[0].matchCoins;
    localStorage.setItem(COINS_STORAGE_KEY, state.coins);
    document.getElementById('coinsCount').innerText = state.coins;

    const text = !winner ? TEXTS.draw
        : reason === 'ko' ? TEXTS.winRoundKo(winner.name)
        : TEXTS.winRoundCoins(winner.name);
    showBanner(text, winner ? winner.color : '#c5c6c7', 1800);
    state.roundResult = winner;
    state.stateFrames = MATCH.roundEndFrames;
}

// Entre rounds não há pausa nem loja: o próximo começa direto. A partida acaba quando alguém vence 2.
export function afterRoundEnd() {
    const winner = state.roundResult;
    if (winner && winner.roundWins >= MATCH.roundsToWin) {
        const [p1, p2] = players;
        showGameOverMenu(TEXTS.winMatch(winner.name), TEXTS.score(p1.roundWins, p2.roundWins));
    } else {
        state.roundNumber++;
        startRound();
    }
}
