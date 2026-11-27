import { ATMOSPHERE as A } from '../../data_model/atmosphere.js';
import { canvas, ctx, player, state } from '../core/state.js';

// --- ATMOSFERA (acabamento de luz sobre a arte, sem tocar em nenhum personagem) ---
// 1. Sombras longas que fogem da tocha (chão, antes dos personagens)   2. Luz quente da tocha (por cima, acende quem passa perto)
// 3. Vinheta fria nas bordas. Os desenhos de base são gerados UMA vez (canvas pequeno) e só carimbados: custo por quadro mínimo.
const ENABLED = new URLSearchParams(window.location.search).get('atmos') !== '0';
const TAU = Math.PI * 2;

function radialSprite(size, stops) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([at, color]) => grad.addColorStop(at, color));
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
}

let lightSprite = null;
let shadowSprite = null;
let emberSprite = null;
function sprites() {
    if (lightSprite) return;
    const [r, g, b] = A.torchLight.color;
    lightSprite = radialSprite(256, [[0, `rgba(${r},${g},${b},1)`], [0.35, `rgba(${r},${g},${b},0.45)`], [0.7, `rgba(${r},${g},${b},0.1)`], [1, `rgba(${r},${g},${b},0)`]]);
    const [er, eg, eb] = A.embers.color;
    emberSprite = radialSprite(32, [[0, `rgba(255,245,220,1)`], [0.3, `rgba(${er},${eg},${eb},0.9)`], [1, `rgba(${er},${eg},${eb},0)`]]);
    shadowSprite = radialSprite(64, [[0, 'rgba(0,0,0,1)'], [0.55, 'rgba(0,0,0,0.55)'], [1, 'rgba(0,0,0,0)']]);
}

// Sombras que fogem da tocha. Entram na camada do chão: os personagens são desenhados por cima.
const actors = [];
export function renderCastShadows() {
    if (!ENABLED || state.quality >= 2 || state.coreHp <= 0) return;
    sprites();
    const S = A.castShadows;
    const cx = state.coreX, cy = state.coreY;
    actors.length = 0;
    const consider = (x, y, radius) => {
        const dx = x - cx, dy = y - cy;
        const d = Math.hypot(dx, dy);
        if (d < 8 || d > S.reach) return;
        actors.push({ x, y, radius, dx: dx / d, dy: dy / d, d });
    };
    for (const e of state.enemies) if (!e.dead) consider(e.x, e.y, e.radius ?? 14);
    if (!player.hidden) consider(player.x, player.y, 16);
    if (actors.length > S.maxActors) {
        actors.sort((a, b) => a.d - b.d);
        actors.length = S.maxActors;
    }
    for (const a of actors) {
        const fall = 1 - a.d / S.reach;                        // 1 junto da tocha, 0 na borda
        const len = a.radius * S.length * (0.7 + 0.5 * fall);
        const wid = a.radius * S.width;
        // A sombra sai do pé, na direção oposta à tocha (achatada, como no chão visto de cima)
        ctx.save();
        ctx.globalAlpha = S.alpha * (0.25 + 0.75 * fall);
        ctx.translate(a.x + a.dx * len * 0.55, a.y + a.dy * len * 0.55 + a.radius * 0.35);
        ctx.rotate(Math.atan2(a.dy, a.dx));
        ctx.scale(len, wid * 0.6);
        ctx.drawImage(shadowSprite, -1, -1, 2, 2);
        ctx.restore();
    }
}

// Luz da tocha: clarão quente aditivo. A chama oscila com ruído leve (sem pular de uma vez)
export function renderTorchLight() {
    if (!ENABLED || state.quality >= 2 || state.coreHp <= 0) return;
    sprites();
    const L = A.torchLight;
    const t = performance.now() / 1000;
    const flick = 1 + L.flicker * (Math.sin(t * 11.3) * 0.5 + Math.sin(t * 17.9 + 1.7) * 0.3 + Math.sin(t * 5.1) * 0.2);
    const r = L.radius * (0.97 + 0.03 * flick);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = L.alpha * flick;
    ctx.drawImage(lightSprite, state.coreX - r, state.coreY - r, r * 2, r * 2);
    // Luz rebatida nos personagens perto da tocha (lista montada em renderCastShadows, no mesmo quadro)
    const R = A.rimLight;
    for (const a of actors) {
        const fall = 1 - a.d / A.castShadows.reach;
        if (fall <= 0.05) continue;
        const size = a.radius * R.size;
        ctx.globalAlpha = R.alpha * fall * fall * flick;
        const px = a.x - a.dx * a.radius * R.shift, py = a.y - a.dy * a.radius * R.shift - a.radius * 0.4;
        ctx.drawImage(lightSprite, px - size, py - size, size * 2, size * 2);
    }
    ctx.restore();
    renderEmbers(t);
}

// Brasas: posição calculada só pelo tempo (nenhum estado, nenhuma lista): cada uma sobe, se desloca com o vento e apaga
function renderEmbers(t) {
    if (state.quality >= 2 || A.embers.count <= 0) return;
    const E = A.embers;
    const n = state.quality >= 1 ? Math.ceil(E.count / 2) : E.count;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
        const phase = (t / E.life + i / n + ((i * 7919) % 100) / 100) % 1;      // 0 = nasce na chama, 1 = apagou
        const seed = (i * 2654435761 % 1000) / 1000;
        const x = state.coreX + (seed - 0.5) * 22 + Math.sin(t * 1.3 + i) * E.drift * phase;
        const y = state.coreY - 20 - E.rise * phase * (0.6 + 0.6 * seed);
        const size = 3 + 5 * (1 - phase) * (0.5 + seed);
        ctx.globalAlpha = Math.sin(Math.PI * Math.min(1, phase * 1.15)) * 0.9;
        ctx.drawImage(emberSprite, x - size, y - size, size * 2, size * 2);
    }
    ctx.restore();
}

// Vinheta: uma imagem do tamanho da tela, refeita só quando a tela muda de tamanho
let vignette = null;
let vignetteKey = '';
export function renderVignette() {
    if (!ENABLED) return;
    const w = canvas.width, h = canvas.height;
    const key = `${w}x${h}`;
    if (vignetteKey !== key) {
        vignetteKey = key;
        const V = A.vignette;
        vignette = document.createElement('canvas');
        vignette.width = Math.max(2, Math.round(w / 4));          // baixa resolução: é só um degradê suave
        vignette.height = Math.max(2, Math.round(h / 4));
        const g = vignette.getContext('2d');
        const [r, gg, b] = V.color;
        const grad = g.createRadialGradient(vignette.width / 2, vignette.height / 2, Math.min(vignette.width, vignette.height) * V.inner * 0.5, vignette.width / 2, vignette.height / 2, Math.hypot(vignette.width, vignette.height) / 2);
        grad.addColorStop(0, `rgba(${r},${gg},${b},0)`);
        grad.addColorStop(1, `rgba(${r},${gg},${b},${V.strength})`);
        g.fillStyle = grad;
        g.fillRect(0, 0, vignette.width, vignette.height);
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(vignette, 0, 0, w, h);
    ctx.restore();
}


// Névoa de Sangue e Escuridão (golpes de variação dos bosses, js/systems/boss_ai.js): um véu sobre o jogo, sem estado próprio
export function renderBossFx() {
    const fx = state.bossFx;
    if (!fx) return;
    const k = Math.max(0, Math.min(1, fx.age / 0.5, (fx.seconds - fx.age) / 0.5));       // entra e sai devagar
    // Em coordenadas do mundo (a câmera do jogo está ativa neste ponto do quadro); o retângulo é maior que qualquer tela
    const big = 6000;
    ctx.save();
    if (fx.kind === 'fog') {
        ctx.globalAlpha = 0.32 * k;
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(-big, -big, big * 2, big * 2);
        ctx.restore();
        return;
    }
    // Escuridão: só um círculo em volta da tocha continua claro (a luz encolhida)
    const grad = ctx.createRadialGradient(state.coreX, state.coreY, fx.r0 ?? 70, state.coreX, state.coreY, fx.r1 ?? 210);
    grad.addColorStop(0, 'rgba(3, 0, 12, 0)');
    grad.addColorStop(1, `rgba(3, 0, 12, ${0.88 * (fx.strength ?? 1) * k})`);
    ctx.fillStyle = grad;
    ctx.fillRect(-big, -big, big * 2, big * 2);
    ctx.restore();
}
