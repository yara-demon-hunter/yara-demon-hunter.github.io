import { attributes, passives, player, powers, state } from './state.js';
import { save } from './save.js';

// --- CONTINUAR A NOITE ---
// A partida em andamento é guardada nos momentos calmos: ao chegar ao acampamento e ao sair dele para a próxima hora.
// Quem fecha o jogo no meio volta pelo botão CONTINUE da tela inicial, no ponto mais recente (no acampamento ou no
// começo da hora, com tudo o que tinha: nível, skills, ouro, relíquias, Juramento, vida do herói e da tocha). Morrer,
// vencer a noite ou começar outra partida apaga o registro. Fica em outra chave do localStorage: o save do jogador
// (js/core/save.js) não muda de formato. O que se perde ao continuar: a hora em andamento recomeça do zero.
const RUN_KEY = 'last_torch_run_v1';
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
        endless: state.endless,
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
        localStorage.setItem(RUN_KEY, JSON.stringify(snapshot));
    } catch {
        // Sem espaço ou bloqueado: o jogo segue sem poder continuar depois
    }
}

export function loadRun() {
    try {
        const run = JSON.parse(localStorage.getItem(RUN_KEY));
        return run && run.version === VERSION && run.turn >= 1 ? run : null;
    } catch {
        return null;
    }
}

export function clearRun() {
    try {
        localStorage.removeItem(RUN_KEY);
    } catch {
        // Sem localStorage: nada a apagar
    }
}
