import { screenToWorld } from './resize.js';
import { audio, canvas, joystick, keys, player, state } from './state.js';

// --- INPUTS CONTROLS ---
// Recebe coordenadas da janela e converte para o mundo
function setTarget(clientX, clientY) {
    const { x, y } = screenToWorld(clientX, clientY);
    player.targetX = x;
    player.targetY = y;
}

// --- JOYSTICK VIRTUAL (telas de toque) ---
function setupJoystick() {
    const base = document.getElementById('joystick');
    const knob = document.getElementById('joystickKnob');
    if (!base || !knob) return;

    let pointerId = null;
    const release = (e) => {
        if (e && e.pointerId !== pointerId) return;
        pointerId = null;
        joystick.x = 0;
        joystick.y = 0;
        knob.style.transform = 'translate(-50%, -50%)';
    };
    const drag = (e) => {
        const rect = base.getBoundingClientRect();
        const radius = rect.width / 2;
        let dx = e.clientX - (rect.left + radius);
        let dy = e.clientY - (rect.top + radius);
        const dist = Math.hypot(dx, dy);
        if (dist > radius) { dx = dx / dist * radius; dy = dy / dist * radius; }
        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        // Zona morta pequena para o dedo parado não escorregar o herói
        const mag = Math.hypot(dx, dy) / radius;
        joystick.x = mag < 0.12 ? 0 : dx / radius;
        joystick.y = mag < 0.12 ? 0 : dy / radius;
    };
    base.addEventListener('pointerdown', (e) => {
        if (pointerId !== null) return;
        pointerId = e.pointerId;
        base.setPointerCapture(e.pointerId);
        audio.init();
        drag(e);
        e.preventDefault();
    });
    base.addEventListener('pointermove', (e) => { if (e.pointerId === pointerId) drag(e); });
    base.addEventListener('pointerup', release);
    base.addEventListener('pointercancel', release);
    // Abrir a loja ou perder o jogo não pode deixar o joystick preso
    window.addEventListener('blur', () => release());
}

export function setupInput() {
    window.addEventListener('mousemove', (e) => {
        if (state.gameState === 'PLAYING') setTarget(e.clientX, e.clientY);
    });

    setupJoystick();

    // Em telas de toque o joystick move o herói; arrastar no canvas só vale sem ele
    const hasJoystick = window.matchMedia('(pointer: coarse)').matches;
    let activeTouchId = null;
    canvas.addEventListener('pointerdown', (e) => {
        if (hasJoystick || e.pointerType !== 'touch' || state.gameState !== 'PLAYING') return;
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
