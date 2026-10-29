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

// Mira da faca em coordenadas do mundo (o arremesso sai do herói nessa direção)
function aimKnife(clientX, clientY) {
    const { x, y } = screenToWorld(clientX, clientY);
    state.knifeInput.x = x;
    state.knifeInput.y = y;
}

export function setupInput() {
    window.addEventListener('mousemove', (e) => {
        if (state.gameState !== 'PLAYING') return;
        setTarget(e.clientX, e.clientY);
        aimKnife(e.clientX, e.clientY);
    });

    // Faca: botão esquerdo no canvas arremessa na direção do cursor; segurar repete na recarga
    canvas.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || state.gameState !== 'PLAYING') return;
        aimKnife(e.clientX, e.clientY);
        state.knifeInput.held = true;
    });
    window.addEventListener('mouseup', (e) => {
        if (e.button === 0) state.knifeInput.held = false;
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

    // Faca no toque: o toque mira e segurar dispara repetido na direção do dedo (sem mover o herói por ele)
    let knifePointerId = null;
    canvas.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch' || state.gameState !== 'PLAYING') return;
        knifePointerId = e.pointerId;
        aimKnife(e.clientX, e.clientY);
        state.knifeInput.held = true;
    });
    canvas.addEventListener('pointermove', (e) => {
        if (e.pointerId === knifePointerId) aimKnife(e.clientX, e.clientY);
    });
    const releaseKnife = (e) => {
        if (e.pointerId !== knifePointerId) return;
        knifePointerId = null;
        state.knifeInput.held = false;
    };
    canvas.addEventListener('pointerup', releaseKnife);
    canvas.addEventListener('pointercancel', releaseKnife);

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
        state.knifeInput.held = false;
    });

    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) audio.init();
    }, { passive: true });
}
