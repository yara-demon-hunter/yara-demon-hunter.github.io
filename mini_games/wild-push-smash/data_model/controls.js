// --- TECLAS, JOYSTICK E PADRÕES DE CONFIGURAÇÃO ---
export const KEYS = [
    { up: 'KeyW', left: 'KeyA', right: 'KeyD', down: 'KeyS', dash: 'KeyE', taunt: 'KeyQ' },
    { up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight', down: 'ArrowDown', dash: 'Slash', taunt: 'ShiftRight' }
];

// Dica de teclas no rodapé (só no computador): cada jogador vê um bloco de teclas desenhadas
// na posição real do teclado (QWE/ASD e / ↑ ⇧ / ← ↓ →). Os nomes são as ações de KEYS.
export const HINT_LAYOUT = [
    [['taunt', 'up', 'dash'], ['left', 'down', 'right']],
    [['dash', 'up', 'taunt'], ['left', 'down', 'right']]
];

export const JOYSTICK = {
    sideThreshold: 0.3,        // fração do raio para contar esquerda/direita
    verticalThreshold: 0.5     // ... e para cima/baixo
};

// 2 jogadores no mesmo celular: cada um usa a sua metade da tela com um dedo só.
// Arrastar = joystick que nasce embaixo do dedo; dois toques rápidos = DASH (sai no segundo toque).
export const TOUCH_ZONE = {
    doubleTapMs: 300,          // tempo máximo entre soltar o 1º toque e encostar o 2º
    tapMaxMs: 220,             // o 1º toque precisa ser curto...
    tapSlop: 14,               // ... e quase sem arrastar (px)
    dashHoldMs: 150,           // o DASH fica apertado no mínimo isso (não some durante o hit-stop)
    hintMs: 6000               // a dica de cada metade some sozinha depois disso (ou no primeiro toque)
};

export const SETTINGS_DEFAULTS = { size: 1, offX: 14, offY: 14, swap: false, music: true, sfx: true };
export const SETTINGS_STORAGE_KEY = 'pushsmash_settings';
