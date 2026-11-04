import { MATCH } from '../../data_model/match.js';
import { players } from '../entities/player.js';

// --- HUD: corações do round (♥ cheio, ♡ perdido) e rounds vencidos, na cor de cada jogador ---
export function updateHeartsHUD() {
    const hearts = p => '♥'.repeat(p.hearts) + '♡'.repeat(Math.max(0, MATCH.hearts - p.hearts));
    document.getElementById('heartsP1').innerText = hearts(players[0]);
    document.getElementById('heartsP2').innerText = hearts(players[1]);
}

export function updateWinsHUD() {
    const pips = w => '●'.repeat(w) + '○'.repeat(Math.max(0, MATCH.roundsToWin - w));
    document.getElementById('winsP1').innerText = pips(players[0].roundWins);
    document.getElementById('winsP2').innerText = pips(players[1].roundWins);
}
