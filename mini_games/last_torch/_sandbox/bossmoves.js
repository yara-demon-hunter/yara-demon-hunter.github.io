// Aba "Boss moves" do sandbox: clicar num boss abre uma demonstração na hora (só ele, todos os modos deus ligados) e uma barra
// sobre o jogo com os golpes dele pelo nome; clicar no golpe faz o boss executá-lo agora.
// Usa o mesmo código que o boss usa (js/systems/boss_ai.js), então o aviso e o dano são os de verdade.
import { BOSS_MODELS } from '/data_model/bosses.js';
import { state } from '/js/core/state.js';
import { forceBossAction } from '/js/systems/boss_ai.js';

function movesOf(model) {
    const list = new Set(model.patterns ?? []);
    (model.phases ?? []).forEach(ph => ph.patterns.forEach(a => list.add(a)));
    return [...list];
}

// bosses: [{ key, label }]; startDemo(key): começa a luta (o sandbox esconde o painel); showPanel(): volta para o painel
export function mountBossMoves(host, { bosses, startDemo, showPanel }) {
    host.innerHTML = '<p class="note">Click a boss: the demo starts right away, with only him in the arena. A bar with his moves appears over the game: click a move and he does it.</p><div class="sb-row" id="bmBosses"></div>';
    const bar = document.createElement('div');
    bar.id = 'sbMovesBar';
    bar.className = 'hidden';
    document.body.appendChild(bar);

    function showBar(key) {
        const model = BOSS_MODELS[key];
        bar.innerHTML = `<div class="sb-moves-head"><b>${model.name ?? key}</b><span id="bmMsg"></span>
            <button id="bmBack" title="Back to the boss list">☰ Bosses</button><button id="bmClose" title="Close the bar">✕</button></div>
            <div class="sb-row" id="bmMoves"></div>`;
        const msg = bar.querySelector('#bmMsg');
        const moves = bar.querySelector('#bmMoves');
        movesOf(model).forEach(action => {
            const b = document.createElement('button');
            b.textContent = action;
            b.onclick = () => {
                const live = state.currentBoss;
                try {
                    msg.textContent = live && live.hp > 0 && forceBossAction(live, BOSS_MODELS[live.type], action)
                        ? `▶ ${action}` : 'busy (lunging): try again';
                } catch (err) {
                    msg.textContent = `${action} failed: ${err.message}`;
                }
            };
            moves.appendChild(b);
        });
        bar.querySelector('#bmBack').onclick = () => { bar.classList.add('hidden'); showPanel(); };
        bar.querySelector('#bmClose').onclick = () => bar.classList.add('hidden');
        bar.classList.remove('hidden');
    }

    const list = host.querySelector('#bmBosses');
    bosses.forEach(boss => {
        const b = document.createElement('button');
        b.className = 'sb-opt';
        b.textContent = boss.label;
        b.onclick = () => { startDemo(boss.key); showBar(boss.key); };
        list.appendChild(b);
    });
    return { hideBar: () => bar.classList.add('hidden') };
}
