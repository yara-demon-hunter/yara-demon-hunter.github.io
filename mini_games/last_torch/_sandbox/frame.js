// Quadro do tuner: o jogo de verdade rodando dentro do iframe do _sandbox/tuner.js, em qualquer tamanho de tela.
// Liga o modo deus (nada mata o herói nem a tocha), começa a caçada e expõe window.tunerApi para o tuner mostrar o boss, a
// sequência de mortes e os pontos de skill, ou congelar o jogo para mexer com calma. Não altera nenhum arquivo do jogo.
// Os módulos vêm por document.baseURI (o servidor entrega esta página sob /__touch/ ou /__desk/), para serem os MESMOS
// módulos que o jogo carregou: outro caminho criaria uma segunda cópia do estado.
const load = (path) => import(new URL(path, document.baseURI).href);

const [{ state, player }, { save }, { startGame }, { HEROES }, { createBoss }, { updateHUD, flushHud }, { getFluid }] = await Promise.all([
    load('js/core/state.js'), load('js/core/save.js'), load('js/ui/screens.js'),
    load('data_model/heroes.js'), load('data_model/bosses.js'), load('js/ui/hud.js'), load('js/ui/fluid_layout.js')
]);

// O PLAY nasce desligado até os módulos chegarem; a primeira visita já começa sozinha
await new Promise((resolve) => {
    const tick = () => (document.getElementById('btnStart')?.disabled === false ? resolve() : setTimeout(tick, 60));
    tick();
});
if (state.gameState !== 'PLAYING') startGame();

const hero = HEROES[save.hero] ?? HEROES.hunter;
hero.mods = { ...hero.mods, damageTaken: -0.9 };

let frozen = false;
function godLoop() {
    if (state.gameState === 'PLAYING') {
        if (player.hp > 0) player.hp = player.maxHp;
        if (state.coreHp > 0) state.coreHp = state.coreHpMax;
    }
    requestAnimationFrame(godLoop);
}
requestAnimationFrame(godLoop);

const refresh = () => { updateHUD(); flushHud(performance.now() + 100000); };

window.tunerApi = {
    ready: true,
    // Boss em campo (a barra de vida do HUD aparece). Sem o duelo: nasce direto, como se a conversa já tivesse acabado
    boss(on, type = 'AZAEL') {
        if (on && !state.currentBoss) {
            const boss = createBoss(type, state.turn, state.coreX + 220, state.coreY - 160);
            state.enemies.push(boss);
            state.currentBoss = boss;
        } else if (!on && state.currentBoss) {
            const at = state.enemies.indexOf(state.currentBoss);
            if (at >= 0) state.enemies.splice(at, 1);
            state.currentBoss = null;
        }
        refresh();
    },
    // Sequência de mortes que fica na tela (o relógio é esticado para não zerar)
    streak(count) {
        state.streak = count;
        state.streakTimer = count > 0 ? 9999 : 0;
        refresh();
        // Com o jogo pausado o laço que mostra a sequência não roda: liga direto, para a peça ficar onde fica no jogo
        document.getElementById('hudStreak')?.classList.toggle('is-visible', count > 0);
        const label = document.getElementById('streakCount');
        if (label && count > 0) label.textContent = count;
    },
    points(count) { state.skillPoints = count; refresh(); },
    freeze(on) {
        frozen = on;
        state.gameState = on ? 'PAUSED' : 'PLAYING';
        refresh();
    },
    isFrozen: () => frozen,
    // [dx, dy, escala] que o layout fluido aplicou a uma peça do HUD (os controles de toque usam variáveis, não translate/scale)
    fluid: (id) => (['joystick', 'knifeButton', 'dashButton'].includes(id) ? null : getFluid(id)),
    refresh
};
