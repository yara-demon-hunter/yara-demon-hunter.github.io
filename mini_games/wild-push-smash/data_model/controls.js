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

export const SETTINGS_DEFAULTS = { size: 1, offX: 14, offY: 14, swap: false, music: true, sfx: true };
export const SETTINGS_STORAGE_KEY = 'pushsmash_settings';
