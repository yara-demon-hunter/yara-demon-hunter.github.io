import { FLUID_LAYOUT } from '../../data_model/fluid_layout.js';
import { save } from '../core/save.js';

// --- LAYOUT FLUIDO DO HUD E DOS CONTROLES ---
// O dono ajusta algumas telas no HUD tuner; o jogo usa esses valores PROPORCIONALMENTE em qualquer outra (data_model/fluid_layout.js).
// Há três perfis para o dono ajustar, escolhidos pelo tamanho da janela: portrait (em pé; o eixo é a ALTURA), landscape (deitado
// até 520 px de altura; o eixo é a LARGURA) e desktop (deitado e mais alto que isso; eixo = LARGURA). Por dentro, o portrait
// tem um quarto balde para tablet em pé (largura a partir de 600 px; eixo = LARGURA). Entre dois pontos de referência os valores são
// INTERPOLADOS, e fora deles (uma tela menor ou maior que todas as ajustadas) escalam proporcionalmente à distância, entre 80% e
// 135%. Assim nenhuma tela "pula" de uma faixa para outra, e o aparelho que o dono não testou fica coerente com os que ele testou.
//
// Peças do HUD (cartão do herói, medalhão, barra do boss...): `translate` e `scale` em cima do layout do CSS.
// Controles de toque: variáveis CSS de tamanho e afastamento (o CSS de joystick.css as lê; o layout que o jogador arrastou em
// Settings continua mandando na posição). `?fluid=0` na URL desliga tudo (usado para medir o layout base) e `?fluid=debug`
// mostra no topo da tela qual perfil está valendo e se há um layout de controles salvo em Settings (que ganha do fluido).
const HUD_IDS = ['heroCard', 'btnPause', 'hudButtons', 'bossHpContainer', 'hudBottom', 'hudScore', 'hudStreak'];
const MIN_FACTOR = 0.8;
const MAX_FACTOR = 1.35;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const lerp = (a, b, t) => a + (b - a) * t;

// Em pé, o tablet (a partir de 600 px de largura) tem o próprio perfil: os valores de um celular alto não valem para ele e vice-versa
function profileOf(width, height) {
    if (height >= width) return width < 600 ? ['portrait', height] : ['tablet', width];
    return height <= 520 ? ['landscape', width] : ['desktop', width];
}

// Valores de uma peça (`kind` = 'hud' ou 'ctl') na posição `at` do eixo; null se nenhum ponto de referência a tem.
// factor: só vale fora do intervalo dos pontos de referência (escala proporcional, usada nos px)
function valuesAt(anchors, kind, id, at) {
    const seq = anchors.filter(a => a[kind][id]);
    if (!seq.length) return null;
    const first = seq[0];
    const last = seq[seq.length - 1];
    if (at <= first.at) return { v: first[kind][id], factor: clamp(at / first.at, MIN_FACTOR, MAX_FACTOR) };
    if (at >= last.at) return { v: last[kind][id], factor: clamp(at / last.at, MIN_FACTOR, MAX_FACTOR) };
    const upper = seq.findIndex(a => a.at >= at);
    const a = seq[upper - 1];
    const b = seq[upper];
    const t = (at - a.at) / (b.at - a.at);
    return { v: a[kind][id].map((n, i) => lerp(n, b[kind][id][i], t)), factor: 1 };
}

// Valores atuais por peça: hud -> [dx, dy, escala]; controles -> [tamanho, lateral, baixo]. O tuner lê daqui.
const current = {};
export const getFluid = (id) => current[id] ?? null;

// Selo de diagnóstico (?fluid=debug): prova que esta versão do jogo tem o layout fluido e diz o que está mandando nos controles
let badge = null;
function showBadge(name, at) {
    if (new URLSearchParams(location.search).get('fluid') !== 'debug') return;
    if (!badge) {
        badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;left:50%;top:2px;transform:translateX(-50%);z-index:9999;padding:2px 8px;border-radius:6px;'
            + 'background:rgba(0,0,0,.78);color:#7ff;font:11px/1.3 monospace;pointer-events:none;white-space:nowrap';
        document.body.appendChild(badge);
    }
    const touch = save.settings.touch ?? {};
    const custom = Object.keys(touch.positions ?? {}).length > 0 || (touch.scale ?? 1) !== 1;
    badge.textContent = `fluido ligado · perfil ${name} · eixo ${at}px · ${window.innerWidth}x${window.innerHeight} · controles: ${custom ? 'LAYOUT SALVO em Settings (manda no lugar)' : 'padrão do fluido'}`;
}

export function applyFluidLayout() {
    if (new URLSearchParams(location.search).get('fluid') === '0') return;
    const [name, at] = profileOf(window.innerWidth, window.innerHeight);
    const { anchors } = FLUID_LAYOUT[name];
    showBadge(name, at);

    for (const id of HUD_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const found = valuesAt(anchors, 'hud', id, at);
        const [dx, dy, scale] = found ? [found.v[0] * found.factor, found.v[1] * found.factor, found.v[2]] : [0, 0, 1];
        current[id] = [dx, dy, scale];
        el.style.translate = dx || dy ? `${dx.toFixed(2)}px ${dy.toFixed(2)}px` : '';
        el.style.scale = Math.abs(scale - 1) > 0.0005 ? scale.toFixed(4) : '';
    }

    const root = document.documentElement.style;
    const set = (key, found, side, bottomGap) => {
        if (!found) return false;
        const f = found.factor;
        const [size, lateral, bottom] = found.v;
        root.setProperty(key.size, `${(size * f).toFixed(2)}px`);
        root.setProperty(key.side, `max(${(lateral * f).toFixed(2)}px, calc(env(safe-area-inset-${side}) + 1.25rem))`);
        root.setProperty(key.bottom, `max(${(bottom * f).toFixed(2)}px, calc(env(safe-area-inset-bottom) + ${bottomGap}rem))`);
        return true;
    };
    const joystick = valuesAt(anchors, 'ctl', 'joystick', at);
    const knife = valuesAt(anchors, 'ctl', 'knifeButton', at);
    const dash = valuesAt(anchors, 'ctl', 'dashButton', at);
    set({ size: '--touch-base', side: '--touch-left', bottom: '--touch-bottom' }, joystick, 'left', 1);
    set({ size: '--knife-size', side: '--knife-right', bottom: '--knife-bottom' }, knife, 'right', 1.2);
    set({ size: '--dash-size', side: '--dash-right', bottom: '--dash-bottom' }, dash, 'right', 3);
    if (joystick) {
        // O miolo do joystick e o ícone da adaga acompanham o tamanho do controle
        root.setProperty('--touch-base-knob', 'calc(var(--touch-base) * 0.47)');
        root.setProperty('--touch-base-icon', 'calc(var(--touch-base) * 0.25)');
    }
    current.joystick = joystick ? joystick.v.map(n => n * joystick.factor) : null;
    current.knifeButton = knife ? knife.v.map(n => n * knife.factor) : null;
    current.dashButton = dash ? dash.v.map(n => n * dash.factor) : null;
}

let queued = 0;
function schedule() {
    cancelAnimationFrame(queued);
    queued = requestAnimationFrame(applyFluidLayout);
}

export function setupFluidLayout() {
    applyFluidLayout();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    // Redundância: o modo de dispositivo do navegador nem sempre avisa por 'resize' (rotação, troca de aparelho)
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(document.documentElement);
    window.matchMedia?.('(orientation: portrait)').addEventListener?.('change', schedule);
}
