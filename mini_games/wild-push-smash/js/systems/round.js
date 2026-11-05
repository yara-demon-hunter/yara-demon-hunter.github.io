import { MATCH } from '../../data_model/match.js';
import { TEXTS } from '../../data_model/texts.js';
import { shrinkPlatform } from '../core/arena.js';
import { state } from '../core/state.js';
import { players } from '../entities/player.js';
import { showBanner } from './effects.js';
import { showGameOverMenu, startRound } from './match.js';
import { updateWinsHUD } from '../ui/hud.js';
import { recordBotMatch } from '../core/progress.js';

// --- RODADAS ---
export function updateRoundTimer() {
    state.roundFrames++;
    // um segundo de verdade = 60 * gameSpeed passos
    if (state.roundFrames % Math.round(60 * MATCH.gameSpeed) !== 0) return;
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
    if (p1.hearts > p2.hearts) winner = p1;
    else if (p2.hearts > p1.hearts) winner = p2;
    endRound(winner, 'hearts');
}


export function endRound(winner, reason) {
    state.gameState = 'ROUND_END';
    if (winner) winner.roundWins++;
    updateWinsHUD();

    const text = !winner ? TEXTS.draw
        : reason === 'ko' ? TEXTS.winRoundKo(winner.name)
        : TEXTS.winRoundHearts(winner.name);
    showBanner(text, winner ? winner.color : '#c5c6c7', 1800);
    state.roundResult = winner;
    state.stateFrames = MATCH.roundEndFrames;
}

// Entre rounds não há pausa nem loja: o próximo começa direto. A partida acaba quando alguém vence 2.
export function afterRoundEnd() {
    const winner = state.roundResult;
    if (winner && winner.roundWins >= MATCH.roundsToWin) {
        const [p1, p2] = players;
        const lines = [TEXTS.score(p1.roundWins, p2.roundWins)];
        // Contra o bot: estrela nova para o bicho do P1 e sequência de vitórias
        if (state.isBotMatch) {
            const won = winner === p1;
            const { newStar, streak } = recordBotMatch(won, p1.character.id, state.botLevel);
            if (newStar) lines.push(TEXTS.newStar(p1.character.name, TEXTS.botLevels[state.botLevel]));
            if (won && streak > 1) lines.push(TEXTS.winStreak(streak));
            if (!won && p1.roundWins === MATCH.roundsToWin - 1) lines.push(TEXTS.tryAgain);
        }
        showGameOverMenu(TEXTS.winMatch(winner.name), lines.join('  ·  '));
    } else {
        state.roundNumber++;
        startRound();
    }
}
