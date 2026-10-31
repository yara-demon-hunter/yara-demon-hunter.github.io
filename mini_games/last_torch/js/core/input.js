import { tryDash } from '../systems/dash.js';
import { screenToWorld } from './resize.js';
import { mod } from '../systems/modifiers.js';
import { save } from './save.js';
import { audio, canvas, joystick, keys, player, state } from './state.js';

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

// --- INPUTS CONTROLS ---
// Recebe coordenadas da janela e converte para o mundo
function setTarget(clientX, clientY) {
    if (!player.mouseFollow) return;
    const { x, y } = screenToWorld(clientX, clientY);
    player.targetX = x;
    player.targetY = y;
}

// Posição do dedo em relação ao centro de um botão circular: move o "knob" junto e devolve
// x, y de -1 a 1 (0, 0 dentro da zona morta)
function readStick(base, knob, e, deadZone) {
    const rect = base.getBoundingClientRect();
    const radius = rect.width / 2;
    let dx = e.clientX - (rect.left + radius);
    let dy = e.clientY - (rect.top + radius);
    const dist = Math.hypot(dx, dy);
    if (dist > radius) { dx = dx / dist * radius; dy = dy / dist * radius; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    const mag = Math.hypot(dx, dy) / radius;
    return mag < deadZone ? { x: 0, y: 0 } : { x: dx / radius, y: dy / radius };
}

// --- BOTÃO DA ADAGA (telas de toque, canto oposto ao joystick) ---
// Segurando, só mira: sem arrastar, no monstro mais perto; arrastando, na direção do arraste,
// como um segundo joystick. Ao soltar o dedo a adaga é arremessada na direção mirada (js/systems/knives.js).
function setupKnifeButton() {
    const base = document.getElementById('knifeButton');
    const knob = document.getElementById('knifeButtonKnob');
    if (!base || !knob) return;

    const { stick } = state.knifeInput;
    let pointerId = null;
    // fire = true só quando o dedo é solto sobre a tela; cancelar (ou sair da janela) não arremessa
    const release = (e, fire) => {
        if (e && e.pointerId !== pointerId) return;
        if (pointerId === null) return;
        pointerId = null;
        stick.active = false;
        if (fire) {
            stick.fire = true;
        } else {
            stick.x = 0;
            stick.y = 0;
            state.knifeCharge = 0;
        }
        knob.style.transform = 'translate(-50%, -50%)';
    };
    const drag = (e) => {
        // Zona morta maior: um toque rápido sem arrastar fica na mira automática
        const v = readStick(base, knob, e, 0.3);
        stick.x = v.x;
        stick.y = v.y;
    };
    base.addEventListener('pointerdown', (e) => {
        if (pointerId !== null || state.gameState !== 'PLAYING' || mod('noKnives') > 0) return;
        pointerId = e.pointerId;
        base.setPointerCapture(e.pointerId);
        audio.init();
        stick.active = true;
        drag(e);
        e.preventDefault();
    });
    base.addEventListener('pointermove', (e) => { if (e.pointerId === pointerId) drag(e); });
    base.addEventListener('pointerup', (e) => release(e, true));
    base.addEventListener('pointercancel', (e) => release(e, false));
    window.addEventListener('blur', () => release(null, false));
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
        // Zona morta pequena para o dedo parado não escorregar o herói
        const v = readStick(base, knob, e, 0.12);
        joystick.x = v.x;
        joystick.y = v.y;
        if (v.x || v.y) {
            joystick.lastX = v.x;
            joystick.lastY = v.y;
        }
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

// --- BOTÃO DO DASH (telas de toque) ---
function setupDashButton() {
    const base = document.getElementById('dashButton');
    if (!base) return;
    base.addEventListener('pointerdown', (e) => {
        audio.init();
        tryDash();
        e.preventDefault();
    });
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

    // Botão direito: dash na direção do cursor
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('mousedown', (e) => {
        if (e.button !== 2 || state.gameState !== 'PLAYING') return;
        aimKnife(e.clientX, e.clientY);
        tryDash();
    });

    setupJoystick();
    setupKnifeButton();
    setupDashButton();

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

    // Faca no toque (só sem o botão da adaga): o toque mira e segurar dispara repetido na direção do dedo.
    // Com o botão da adaga (telas coarse), tocar na tela não arremessa: só o botão, ao soltar.
    let knifePointerId = null;
    canvas.addEventListener('pointerdown', (e) => {
        if (hasJoystick || e.pointerType !== 'touch' || state.gameState !== 'PLAYING') return;
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
        // Quem escolheu andar pelo teclado usa o mouse só para mirar: o herói para de seguir o cursor
        if (save.settings.keyboard && MOVE_KEYS.includes(e.code)) player.mouseFollow = false;
        if (!e.repeat && (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight')) tryDash();
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
