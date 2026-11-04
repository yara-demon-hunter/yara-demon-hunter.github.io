import { MATCH } from '../../data_model/match.js';
import { players } from '../entities/player.js';

// --- HUD ---
export function updateScoreHUD() {
    document.getElementById('scoreP1').innerText = players[0].matchCoins;
    document.getElementById('scoreP2').innerText = players[1].matchCoins;
}

export function updateWinsHUD() {
    const pips = w => '●'.repeat(w) + '○'.repeat(Math.max(0, MATCH.roundsToWin - w));
    document.getElementById('winsP1').innerText = pips(players[0].roundWins);
    document.getElementById('winsP2').innerText = pips(players[1].roundWins);
}
