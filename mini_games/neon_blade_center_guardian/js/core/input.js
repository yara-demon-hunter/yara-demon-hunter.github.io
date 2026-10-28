import { audio, canvas, keys, player, state } from './state.js';

// --- INPUTS CONTROLS ---
function setTarget(x, y) {
    player.targetX = x;
    player.targetY = y;
}

export function setupInput() {
    window.addEventListener('mousemove', (e) => {
        if (state.gameState === 'PLAYING') setTarget(e.clientX, e.clientY);
    });

    let activeTouchId = null;
    canvas.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch' || state.gameState !== 'PLAYING') return;
        activeTouchId = e.pointerId;
        canvas.setPointerCapture(e.pointerId);
        setTarget(e.clientX, e.clientY);
    });
    canvas.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch' && e.pointerId === activeTouchId && state.gameState === 'PLAYING') {
            setTarget(e.clientX, e.clientY);
        }
    });
    const endTouchMovement = (e) => {
        if (e.pointerId === activeTouchId) activeTouchId = null;
    };
    canvas.addEventListener('pointerup', endTouchMovement);
    canvas.addEventListener('pointercancel', endTouchMovement);

    window.addEventListener('keydown', (e) => {
        if (state.gameState === 'PLAYING' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
        keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
    window.addEventListener('blur', () => {
        Object.keys(keys).forEach((key) => { keys[key] = false; });
    });

    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) audio.init();
    }, { passive: true });
}
