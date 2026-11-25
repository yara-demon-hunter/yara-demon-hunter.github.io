import { attributes, passives, player, powers, state } from './state.js';
import { save } from './save.js';
import { screenOfTurn } from '../../data_model/campaign.js';

// --- CONTINUAR A NOITE (um slot por herói) ---
// A partida em andamento é guardada nos momentos calmos: ao chegar ao acampamento e ao sair dele para a próxima hora.
// Cada herói tem o SEU registro (last_torch_run_v2_<herói>): quem joga com o Kuro e depois com o Rowan continua os dois, cada
// um onde parou. O registro vale também depois de MORRER: o CONTINUE recomeça a onda em que o herói caiu (o ponto mais recente
// guardado, com nível, skills, ouro, relíquias, Juramento, vida do herói e da tocha). Só terminar a noite (amanhecer) ou
// começar outra partida com o mesmo herói apaga o registro dele. O save do jogador (js/core/save.js) não muda de formato.
// O que se perde ao continuar: a hora em andamento recomeça do zero.
const RUN_KEY = 'last_torch_run_v2_';
const LEGACY_KEY = 'last_torch_run_v1';            // um registro só, de antes dos slots por herói: migrado na primeira leitura
const VERSION = 1;

// kind: 'camp' (guardado no acampamento) ou 'hunt' (no começo da hora, depois do acampamento)
export function saveRun(kind) {
    const snapshot = {
        version: VERSION,
        kind,
        at: Date.now(),
        hero: save.hero,
        darkness: save.darkness,
        turn: state.turn,
        totalScore: state.totalScore,
        coins: state.coins,
        skillPoints: state.skillPoints,
        levelPointsCarry: state.levelPointsCarry,
        playerLevel: state.playerLevel,
        playerXp: state.playerXp,
        playerMaxXp: state.playerMaxXp,
        tree: { ...state.tree },
        attributes: Object.fromEntries(Object.entries(attributes).map(([k, a]) => [k, a.lvl])),
        passives: Object.fromEntries(Object.entries(passives).filter(([, p]) => p.lvl > 0).map(([k, p]) => [k, { lvl: p.lvl, evolved: p.evolved }])),
        powers: Object.fromEntries(Object.entries(powers).filter(([, p]) => p.lvl > 0).map(([k, p]) => [k, { lvl: p.lvl, evolved: p.evolved }])),
        oath: state.oath,
        oathAnnounced: state.oathAnnounced,
        revives: state.revives,
        secondWind: state.secondWind,
        omen: state.nextOmen?.name ?? null,
        hp: player.hp,
        coreHp: state.coreHp,
        run: { ...state.run }
    };
    try {
        localStorage.setItem(RUN_KEY + snapshot.hero, JSON.stringify(snapshot));
    } catch {
        // Sem espaço ou bloqueado: o jogo segue sem poder continuar depois
    }
}

// Move o registro antigo (um só) para o slot do herói dele
function migrateLegacy() {
    try {
        const raw = localStorage.getItem(LEGACY_KEY);
        if (!raw) return;
        const run = JSON.parse(raw);
        if (run?.hero && !localStorage.getItem(RUN_KEY + run.hero)) localStorage.setItem(RUN_KEY + run.hero, raw);
        localStorage.removeItem(LEGACY_KEY);
    } catch {
        // Registro ilegível: some junto com o formato antigo
    }
}

// O registro de um herói (o herói escolhido, se não disser qual) ou null
export function loadRun(hero = save.hero) {
    migrateLegacy();
    try {
        const run = JSON.parse(localStorage.getItem(RUN_KEY + hero));
        return run && run.version === VERSION && run.hero === hero && run.turn >= 1 ? run : null;
    } catch {
        return null;
    }
}

export function clearRun(hero = save.hero) {
    try {
        localStorage.removeItem(RUN_KEY + hero);
    } catch {
        // Sem localStorage: nada a apagar
    }
}

// Morreu: o registro fica (o CONTINUE recomeça a onda), mas o que já foi pago (brasas, kills, estatísticas) não pode ser pago
// de novo. Então os contadores da noite, já contabilizados, entram no registro.
export function syncRunAccounting() {
    try {
        const key = RUN_KEY + save.hero;
        const run = JSON.parse(localStorage.getItem(key));
        if (!run) return;
        run.run = { ...state.run };
        localStorage.setItem(key, JSON.stringify(run));
    } catch {
        // Sem localStorage: sem registro para acertar
    }
}

// Onde o registro parou, para mostrar no CONTINUE: a tela do mapa (Dark Forest, River Crossing...) e a onda
export function runPlace(run) {
    return `${screenOfTurn(run.turn).name} · Wave ${run.turn}${run.kind === 'camp' ? ' · camp' : ''}`;
}
