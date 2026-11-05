import { JOYSTICK, KEYS, TOUCH_ZONE } from '../../data_model/controls.js';
import { TEXTS } from '../../data_model/texts.js';
import { keys } from '../core/input.js';
import { settings } from '../core/settings.js';
import { state } from '../core/state.js';
import { players } from '../entities/player.js';
import { finishReplay } from '../systems/replay.js';

// --- CONTROLES DE TOQUE ---
export const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
export const touchControls = document.getElementById('touchControls');
if (isTouch) document.body.classList.add('touch-device');

// Direção do joystick -> teclas (mesma regra para o joystick fixo e o que nasce embaixo do dedo)
function setStickKeys(codes, dx, dy, max) {
    keys[codes.left] = dx < -max * JOYSTICK.sideThreshold;
    keys[codes.right] = dx > max * JOYSTICK.sideThreshold;
    keys[codes.up] = dy < -max * JOYSTICK.verticalThreshold;
    keys[codes.down] = dy > max * JOYSTICK.verticalThreshold;
}

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
        setStickKeys(codes, dx, dy, max);
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
    touchControls.querySelectorAll('.touch-zone').forEach(z => z.remove());
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
        // 2 jogadores no mesmo celular: metade da tela para cada um, com um dedo só
        touchControls.append(makeTouchZone('left', c1, KEYS[0].dash, players[0].color),
            makeTouchZone('right', c2, KEYS[1].dash, players[1].color));
    }
}

// --- METADE DA TELA POR JOGADOR (2 jogadores no celular) ---
// Encostar em qualquer lugar da sua metade faz o joystick nascer embaixo do dedo; arrastar anda,
// para cima pula, para baixo no ar é o SMASH. Dois toques rápidos = DASH (sai já no segundo toque,
// e quem segura e arrasta depois dele continua andando). Se o dedo passa da borda, o joystick vai junto.
const gearBtn = document.getElementById('btnGear');
function makeTouchZone(side, codes, dashCode, color) {
    const zone = document.createElement('div');
    zone.className = `touch-zone zone-${side}`;
    zone.style.setProperty('--pc', color);
    const stick = document.createElement('div');
    stick.className = 'stick float';
    const knob = document.createElement('div');
    knob.className = 'knob';
    stick.appendChild(knob);
    const hint = document.createElement('div');
    hint.className = 'zone-hint';
    hint.textContent = TEXTS.zoneHint;
    zone.append(stick, hint);
    const hideHint = () => hint.classList.add('gone');
    setTimeout(hideHint, TOUCH_ZONE.hintMs);

    let pid = null, ox = 0, oy = 0, downAt = 0, moved = false, isDash = false, lastTapAt = -Infinity, dashAt = 0;
    const clearStick = () => Object.values(codes).forEach(c => { keys[c] = false; });
    const releaseDash = () => {
        const wait = TOUCH_ZONE.dashHoldMs - (performance.now() - dashAt);
        if (wait > 0) setTimeout(() => { if (!isDash) keys[dashCode] = false; }, wait);
        else keys[dashCode] = false;
    };

    zone.addEventListener('pointerdown', e => {
        e.preventDefault();
        // A engrenagem fica embaixo da metade direita: o toque nela abre as configurações
        const g = gearBtn.getBoundingClientRect();
        if (e.clientX >= g.left && e.clientX <= g.right && e.clientY >= g.top && e.clientY <= g.bottom) {
            gearBtn.click();
            return;
        }
        if (pid !== null) return;
        pid = e.pointerId;
        zone.setPointerCapture(pid);
        hideHint();
        const r = zone.getBoundingClientRect();
        ox = e.clientX;
        oy = e.clientY;
        stick.style.left = `${ox - r.left}px`;
        stick.style.top = `${oy - r.top}px`;
        knob.style.transform = '';
        stick.classList.add('on');
        downAt = performance.now();
        moved = false;
        isDash = downAt - lastTapAt < TOUCH_ZONE.doubleTapMs;
        if (isDash) {
            lastTapAt = -Infinity;
            dashAt = downAt;
            keys[dashCode] = true;
            stick.classList.remove('dash');
            void stick.offsetWidth;
            stick.classList.add('dash');
        }
    });
    zone.addEventListener('pointermove', e => {
        if (e.pointerId !== pid) return;
        const max = stick.offsetWidth / 2;
        let dx = e.clientX - ox;
        let dy = e.clientY - oy;
        const d = Math.hypot(dx, dy);
        if (d > TOUCH_ZONE.tapSlop) moved = true;
        if (d > max) {
            // passou da borda: arrasta o centro junto, para virar de lado sem atraso
            ox += dx - dx / d * max;
            oy += dy - dy / d * max;
            dx = dx / d * max;
            dy = dy / d * max;
            const r = zone.getBoundingClientRect();
            stick.style.left = `${ox - r.left}px`;
            stick.style.top = `${oy - r.top}px`;
        }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        setStickKeys(codes, dx, dy, max);
    });
    const release = e => {
        if (e.pointerId !== pid) return;
        pid = null;
        const now = performance.now();
        // Toque curto e parado (que não foi o próprio DASH) arma o próximo toque como DASH
        if (!moved && !isDash && now - downAt < TOUCH_ZONE.tapMaxMs) lastTapAt = now;
        if (isDash) { isDash = false; releaseDash(); }
        stick.classList.remove('on');
        clearStick();
    };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => zone.addEventListener(t, release));
    return zone;
}

// Tocar na tela pula o replay
document.getElementById('game-container').addEventListener('pointerdown', () => {
    if (state.gameState === 'REPLAY') finishReplay();
});
document.addEventListener('contextmenu', e => { if (isTouch) e.preventDefault(); });


