import { JOYSTICK, KEYS } from '../../data_model/controls.js';
import { keys } from '../core/input.js';
import { settings } from '../core/settings.js';
import { state } from '../core/state.js';
import { players } from '../entities/player.js';
import { finishReplay } from '../systems/replay.js';

// --- CONTROLES DE TOQUE ---
export const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
export const touchControls = document.getElementById('touchControls');
if (isTouch) document.body.classList.add('touch-device');

// Cada jogador tem um joystick: ◀▶ anda, ▲ pula (e wall jump), ▼ dash no chão / SMASH no ar
export function makeStick(codes) {
    const stick = document.createElement('div');
    stick.className = 'stick';
    const knob = document.createElement('div');
    knob.className = 'knob';
    stick.appendChild(knob);
    let pid = null;
    const set = (code, v) => { keys[code] = v; };
    const release = () => {
        pid = null;
        knob.style.transform = '';
        Object.values(codes).forEach(c => set(c, false));
    };
    const move = e => {
        const r = stick.getBoundingClientRect();
        const max = r.width / 2;
        let dx = e.clientX - (r.left + max);
        let dy = e.clientY - (r.top + max);
        const d = Math.hypot(dx, dy);
        if (d > max) { dx = dx / d * max; dy = dy / d * max; }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        set(codes.left, dx < -max * JOYSTICK.sideThreshold);
        set(codes.right, dx > max * JOYSTICK.sideThreshold);
        set(codes.up, dy < -max * JOYSTICK.verticalThreshold);
        set(codes.down, dy > max * JOYSTICK.verticalThreshold);
    };
    stick.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (pid !== null) return;
        pid = e.pointerId;
        stick.setPointerCapture(pid);
        move(e);
    });
    stick.addEventListener('pointermove', e => { if (e.pointerId === pid) move(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t =>
        stick.addEventListener(t, e => { if (e.pointerId === pid) release(); }));
    return stick;
}

export function makeActionButton(label, code, extraClass = '') {
    const b = document.createElement('button');
    b.className = `tbtn ${extraClass}`.trim();
    b.textContent = label;
    const press = down => e => { e.preventDefault(); keys[code] = down; b.classList.toggle('on', down); };
    b.addEventListener('pointerdown', press(true));
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => b.addEventListener(t, press(false)));
    return b;
}

export function buildTouchControls() {
    if (!isTouch) return;
    const stickCodes = k => ({ left: k.left, right: k.right, up: k.up, down: k.down });
    const c1 = stickCodes(KEYS[0]);
    const c2 = stickCodes(KEYS[1]);
    const padL = document.getElementById('padLeft');
    const padR = document.getElementById('padRight');
    [padL, padR].forEach(pad => { pad.innerHTML = ''; });
    // Botões de ação ao lado do joystick: DASH (grande) e provocar
    const actions = k => {
        const col = document.createElement('div');
        col.className = 'actions';
        col.append(makeActionButton('💨', k.dash, 'dash-btn'), makeActionButton('😜', k.taunt));
        return col;
    };
    padL.style.setProperty('--pc', players[0].color);
    if (state.isBotMatch) {
        const pad = settings.swap ? padR : padL;
        pad.style.setProperty('--pc', players[0].color);
        if (settings.swap) pad.append(actions(KEYS[0]), makeStick(c1));
        else pad.append(makeStick(c1), actions(KEYS[0]));
    } else {
        padL.append(makeStick(c1), actions(KEYS[0]));
        padR.style.setProperty('--pc', players[1].color);
        padR.append(actions(KEYS[1]), makeStick(c2));
    }
}

// Tocar na tela pula o replay
document.getElementById('game-container').addEventListener('pointerdown', () => {
    if (state.gameState === 'REPLAY') finishReplay();
});
document.addEventListener('contextmenu', e => { if (isTouch) e.preventDefault(); });


