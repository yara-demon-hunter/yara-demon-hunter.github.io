import { tryDash } from '../systems/dash.js';
import { screenToWorld } from './resize.js';
import { mod } from '../systems/modifiers.js';
import { save } from './save.js';
import { audio, canvas, joystick, keys, player, state } from './state.js';

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];

// --- INPUTS CONTROLS ---
// Recebe coordenadas da janela e converte para o mundo
function setTarget(clientX, clientY) {
    if (!player.mouseFollow) return;
    const { x, y } = screenToWorld(clientX, clientY);
    player.targetX = x;
    player.targetY = y;
}

// Posição do dedo em relação a um ponto (por padrão o centro de um botão circular): move o "knob" junto
// e devolve x, y de -1 a 1 (0, 0 dentro da zona morta)
function readStick(base, knob, e, deadZone, origin = null) {
    const rect = base.getBoundingClientRect();
    const radius = rect.width / 2;
    const fromX = origin ? origin.x : rect.left + radius;
    const fromY = origin ? origin.y : rect.top + radius;
    let dx = e.clientX - fromX;
    let dy = e.clientY - fromY;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) { dx = dx / dist * radius; dy = dy / dist * radius; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    const mag = Math.hypot(dx, dy) / radius;
    return mag < deadZone ? { x: 0, y: 0 } : { x: dx / radius, y: dy / radius };
}

// Soltam os controles de toque quando a caçada para (cartas, inventário, pausa): ao voltar o herói
// fica parado, e o dedo que ainda estava na tela só volta a valer depois de ser levantado
const touchReleases = [];
export function releaseTouchControls() {
    touchReleases.forEach(release => release());
    player.targetX = player.x;
    player.targetY = player.y;
}

// --- BOTÃO DA ADAGA (telas de toque, canto oposto ao joystick) ---
// Toque rápido: mira automática (monstro mais perto ou direção do movimento, js/systems/knives.js).
// Arrastando, mira na direção do arraste, contada a partir de onde o dedo encostou (não do centro do
// botão: tocar um pouco fora do centro não vira mira torta). Ao soltar o dedo a adaga é arremessada.
function setupKnifeButton() {
    const base = document.getElementById('knifeButton');
    const knob = document.getElementById('knifeButtonKnob');
    if (!base || !knob) return;

    const { stick } = state.knifeInput;
    let pointerId = null;
    let origin = null;
    // fire = true só quando o dedo é solto sobre a tela; cancelar (ou sair da janela) não arremessa
    const release = (e, fire) => {
        if (e && e.pointerId !== pointerId) return;
        if (pointerId === null) return;
        pointerId = null;
        stick.active = false;
        if (fire && state.gameState === 'PLAYING') {
            stick.fire = true;
        } else {
            stick.x = 0;
            stick.y = 0;
            stick.fire = false;
            state.knifeCharge = 0;
        }
        knob.style.transform = 'translate(-50%, -50%)';
    };
    const drag = (e) => {
        if (state.gameState !== 'PLAYING') return release(null, false);
        // Zona morta grande: um toque com o dedo tremendo um pouco fica na mira automática
        const v = readStick(base, knob, e, 0.35, origin);
        stick.x = v.x;
        stick.y = v.y;
    };
    // Axe Quake (Captain Brutos): no lugar da mira, segurar o botão repete o golpe quando a recarga acaba
    const quake = state.quake;
    base.addEventListener('pointerdown', (e) => {
        if (state.gameState !== 'PLAYING' || mod('axeQuake') <= 0) return;
        quake.touch = true;
        base.setPointerCapture(e.pointerId);
        audio.init();
        e.preventDefault();
    });
    const releaseQuake = () => { quake.touch = false; };
    base.addEventListener('pointerup', releaseQuake);
    base.addEventListener('pointercancel', releaseQuake);
    base.addEventListener('lostpointercapture', releaseQuake);
    touchReleases.push(releaseQuake);
    base.addEventListener('pointerdown', (e) => {
        if (state.gameState !== 'PLAYING' || mod('noKnives') > 0) return;
        // Um dedo novo sempre assume o botão: se o anterior se perdeu sem "soltar", o botão não trava
        pointerId = e.pointerId;
        origin = { x: e.clientX, y: e.clientY };
        base.setPointerCapture(e.pointerId);
        audio.init();
        stick.active = true;
        stick.fire = false;
        drag(e);
        e.preventDefault();
    });
    base.addEventListener('pointermove', (e) => { if (e.pointerId === pointerId) drag(e); });
    base.addEventListener('pointerup', (e) => release(e, true));
    base.addEventListener('pointercancel', (e) => release(e, false));
    base.addEventListener('lostpointercapture', (e) => release(e, false));
    window.addEventListener('blur', () => release(null, false));
    touchReleases.push(() => release(null, false));
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
        // Fora da caçada o dedo não guarda direção: senão o herói sai andando sozinho ao voltar
        if (state.gameState !== 'PLAYING') return release();
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
        if (state.gameState !== 'PLAYING') return;
        // Um dedo novo sempre assume o joystick: se o anterior se perdeu sem "soltar"
        // (menu abrindo por cima, gesto do sistema), o joystick não fica travado
        pointerId = e.pointerId;
        base.setPointerCapture(e.pointerId);
        audio.init();
        drag(e);
        e.preventDefault();
    });
    base.addEventListener('pointermove', (e) => { if (e.pointerId === pointerId) drag(e); });
    base.addEventListener('pointerup', release);
    base.addEventListener('pointercancel', release);
    base.addEventListener('lostpointercapture', release);
    // Abrir a loja ou perder o jogo não pode deixar o joystick preso
    window.addEventListener('blur', () => release());
    touchReleases.push(() => release());
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
    window.addEventListener('contextmenu', (e) => e.preventDefault());
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
        // Dentro do iframe de um portal, setas e Espaço rolariam a página em volta do jogo.
        // Num botão focado o Espaço segue valendo, menos na caçada, onde ele é o dash.
        if (SCROLL_KEYS.includes(e.code) && (state.gameState === 'PLAYING' || !e.target.closest?.('button'))) {
            e.preventDefault();
        }
        keys[e.code] = true;
        // Quem escolheu andar pelo teclado usa o mouse só para mirar: o herói para de seguir o cursor
        if (save.settings.moveKeys && MOVE_KEYS.includes(e.code)) player.mouseFollow = false;
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

    // Mesmo motivo para a roda do mouse na caçada; as listas das telas de pausa continuam rolando
    window.addEventListener('wheel', (e) => {
        if (state.gameState === 'PLAYING') e.preventDefault();
    }, { passive: false });
}
