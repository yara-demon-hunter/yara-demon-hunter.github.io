// --- TEXTOS DO JOGO (para traduzir, edite aqui) ---
export const TEXTS = {
    menuTitle: 'WILD PUSH & SMASH',
    // Faixa curta sob o logo (regras em uma linha, estilo jogo)
    menuIntro: 'BEST OF 5  ·  3 ♥ EACH  ·  SMASH FROM ABOVE  ·  STOMP TO SKY DROP',
    botHint: 'P2: CONTROLLED BY AI (BOT)',
    // Dica de cada metade da tela no modo 2 jogadores do celular
    zoneHint: 'DRAG = MOVE\nDOUBLE TAP = DASH',
    // Nome da ação embaixo de cada tecla desenhada no rodapé
    keyLabels: { up: 'JUMP', left: 'MOVE', right: 'MOVE', down: 'SMASH', dash: 'DASH', taunt: 'TAUNT', turbo: 'TURBO' },
    roundLabel: n => `ROUND ${n}`,
    botLevelLabel: 'BOT LEVEL',
    botLevels: { easy: 'EASY', normal: 'NORMAL', hard: 'HARD' },
    pickerTags: ['P1', 'P2 / BOT'],
    statLabels: { mass: 'MASS', speed: 'SPEED', jump: 'JUMP' },
    dashLabel: 'DASH',
    // Palavras de impacto no estilo quadrinho (uma sorteada por evento)
    comicWords: {
        hit: ['BAM!', 'POW!', 'BONK!'],
        dash: ['CRASH!', 'WHAM!', 'BAM!'],
        stomp: ['BOP!', 'BONK!'],
        smash: ['CRASH!', 'BOOM!'],
        land: ['THUD!'],
        turbo: ['KABOOM!', 'WALLOP!']
    },
    taunts: ['HAHA!', 'HEHE!', 'WEAK!', '😜'],
    go: 'SMASH!',
    smash: 'SMASH!',
    splat: 'SPLAT!',
    heartLost: '-♥',
    bop: 'BOP!',
    skyDrop: 'SKY DROP!',
    turboReady: 'TURBO READY!',
    turbo: 'TURBO!',
    last15: 'LAST 15s!',
    ko: 'K.O.!',
    draw: 'DRAW! NO ONE SCORES',
    winRoundKo: name => `${name} WINS THE ROUND BY K.O.!`,
    winRoundHearts: name => `TIME! ${name} WINS ON HEARTS!`,
    winMatch: name => `${name} WINS THE MATCH!`,
    score: (a, b) => `Score: ${a} x ${b}`,
    quitTitle: 'MATCH OVER',
    quitSub: 'You gave up. How about a rematch?',
    replaySkipTouch: 'tap to skip',
    replaySkipKey: 'press any key to skip',
    on: 'ON',
    off: 'OFF',
    left: 'LEFT',
    right: 'RIGHT'
};
