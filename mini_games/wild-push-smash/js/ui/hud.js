import { COMBAT } from '../../data_model/combat.js';
import { MATCH } from '../../data_model/match.js';
import { players } from '../entities/player.js';
import { setTurboHint } from './controls_hint.js';

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

// Medidor de especial: barra sob os corações; cheia, fica roxa e pulsa (o próximo DASH é o TURBO),
// e a tecla de DASH desenhada no rodapé acende junto
const specialBars = [0, 1].map(i => document.getElementById(`specialP${i + 1}`));
export function updateSpecialHUD() {
    specialBars.forEach((bar, i) => {
        const pct = Math.min(100, players[i].special / COMBAT.special.max * 100);
        bar.firstElementChild.style.width = `${pct}%`;
        bar.classList.toggle('ready', pct >= 100);
        setTurboHint(i, pct >= 100);
    });
}
