import { persist, save } from '../core/save.js';

// --- LAYOUT DOS CONTROLES DE TOQUE ---
// Em Settings o jogador arrasta o joystick, a adaga e o dash e escolhe o tamanho deles.
// Guardado em save.settings.touch: scale e, para cada controle movido, o centro em fração da tela
// (assim sobrevive a girar o aparelho ou trocar de tamanho). Sem posição = lugar padrão do CSS.
const CONTROLS = ['joystick', 'knifeButton', 'dashButton'];
const EDGE = 8;     // nenhum controle encosta na borda: sempre sobra onde tocar
const defaults = () => ({ scale: 1, positions: {} });

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function placeControl(id) {
    const el = document.getElementById(id);
    const spot = save.settings.touch.positions[id];
    if (!spot) {
        ['left', 'top', 'right', 'bottom'].forEach(side => el.style.removeProperty(side));
        return;
    }
    const halfW = el.offsetWidth / 2;
    const halfH = el.offsetHeight / 2;
    el.style.left = `${clamp(spot.x * window.innerWidth, halfW + EDGE, window.innerWidth - halfW - EDGE) - halfW}px`;
    el.style.top = `${clamp(spot.y * window.innerHeight, halfH + EDGE, window.innerHeight - halfH - EDGE) - halfH}px`;
    el.style.right = 'auto';
    el.style.bottom = 'auto';
}

export function applyTouchLayout() {
    document.documentElement.style.setProperty('--touch-scale', save.settings.touch.scale);
    CONTROLS.forEach(placeControl);
}

// Durante a edição o arraste é pego na janela, antes de chegar aos controles: nada de andar ou arremessar
let dragging = null;

function onDown(e) {
    const control = e.target.closest?.(CONTROLS.map(id => `#${id}`).join());
    if (!control) return;
    e.stopPropagation();
    e.preventDefault();
    dragging = { id: control.id, pointerId: e.pointerId };
}

function onMove(e) {
    if (e.pointerId !== dragging?.pointerId) return;
    e.stopPropagation();
    save.settings.touch.positions[dragging.id] = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    placeControl(dragging.id);
}

function onUp(e) {
    if (e.pointerId !== dragging?.pointerId) return;
    e.stopPropagation();
    dragging = null;
}

const DRAG_EVENTS = { pointerdown: onDown, pointermove: onMove, pointerup: onUp, pointercancel: onUp };

function renderSize() {
    const { scale } = save.settings.touch;
    document.getElementById('touchSize').value = scale;
    document.getElementById('touchSizeValue').textContent = `${Math.round(scale * 100)}%`;
}

export function openTouchEditor() {
    document.getElementById('settingsScreen').classList.add('hidden');
    document.getElementById('touchEditor').classList.remove('hidden');
    document.body.classList.add('is-editing-touch');
    Object.entries(DRAG_EVENTS).forEach(([name, handler]) => window.addEventListener(name, handler, true));
    renderSize();
}

function closeTouchEditor() {
    dragging = null;
    Object.entries(DRAG_EVENTS).forEach(([name, handler]) => window.removeEventListener(name, handler, true));
    document.body.classList.remove('is-editing-touch');
    document.getElementById('touchEditor').classList.add('hidden');
    document.getElementById('settingsScreen').classList.remove('hidden');
    persist();
}

export function setupTouchLayout() {
    document.getElementById('touchSize').addEventListener('input', (e) => {
        save.settings.touch.scale = Number(e.target.value);
        applyTouchLayout();
        renderSize();
    });
    document.getElementById('btnTouchReset').addEventListener('click', () => {
        save.settings.touch = defaults();
        applyTouchLayout();
        renderSize();
    });
    document.getElementById('btnTouchDone').addEventListener('click', closeTouchEditor);
    document.getElementById('btnTouchEdit').addEventListener('click', openTouchEditor);
    window.addEventListener('resize', applyTouchLayout);
    applyTouchLayout();
}
