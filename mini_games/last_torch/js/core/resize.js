import { CHARACTER_MODEL } from '../../data_model/character.js';
import { WORLD } from '../../data_model/world.js';
import { canvas, ctx, player, shadowClone, state } from './state.js';

// Telas 2x/3x (retina) têm 4x/9x mais pixels para pintar; 1.5 é um bom equilíbrio
const MAX_PIXEL_RATIO = 1.5;

// Converte um ponto da janela (clientX/Y do mouse ou toque) para coordenadas do mundo
export function screenToWorld(clientX, clientY) {
    const { scale, offsetX, offsetY } = state.view;
    return { x: (clientX - offsetX) / scale, y: (clientY - offsetY) / scale };
}

// Calcula o tamanho do mundo para a janela atual: lado menor fixo por perfil, lado maior
// segue a proporção da tela dentro dos limites do perfil.
function computeWorldSize(cssWidth, cssHeight) {
    const shortSide = Math.min(cssWidth, cssHeight);
    const mobile = shortSide < WORLD.mobileMaxShortSide;
    const profile = mobile ? WORLD.mobile : WORLD.desktop;
    const aspect = Math.max(cssWidth, cssHeight) / Math.max(1, shortSide);
    const longRatio = Math.max(profile.minAspect, Math.min(profile.maxAspect, aspect));
    const baseShort = Math.round(profile.shortSide * (profile.areaScale || 1));
    const longSide = Math.round(baseShort * longRatio);
    const landscape = cssWidth >= cssHeight;
    return {
        mobile,
        width: landscape ? longSide : baseShort,
        height: landscape ? baseShort : longSide
    };
}

// --- RESIZE ---
// Usa o tamanho que o canvas ocupa de fato na página (o CSS o estica na tela toda). Ao girar o
// celular ou entrar em tela cheia, window.innerWidth/innerHeight às vezes ainda trazem o tamanho
// antigo no evento 'resize', e o jogo ficava desenhado deslocado até o próximo evento.
export function resize() {
    const cssWidth = canvas.clientWidth || window.innerWidth;
    const cssHeight = canvas.clientHeight || window.innerHeight;
    const pixelRatio = state.lowQuality ? 1 : Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const { view } = state;
    // Nada mudou (o ResizeObserver e o 'resize' da janela costumam avisar juntos)
    if (cssWidth === view.cssWidth && cssHeight === view.cssHeight && pixelRatio === view.pixelRatio) return;
    const world = computeWorldSize(cssWidth, cssHeight);

    // Guarda o centro antigo para manter tudo na mesma posição relativa à tocha
    const oldCoreX = state.coreX;
    const oldCoreY = state.coreY;

    state.width = world.width;
    state.height = world.height;

    // Mundo inteiro visível, centralizado (sobram faixas só se a proporção passar do limite)
    const scale = Math.min(cssWidth / world.width, cssHeight / world.height);
    state.view = {
        scale,
        offsetX: (cssWidth - world.width * scale) / 2,
        offsetY: (cssHeight - world.height * scale) / 2,
        cssWidth,
        cssHeight,
        pixelRatio,
        mobile: world.mobile
    };

    canvas.width = Math.round(cssWidth * pixelRatio);
    canvas.height = Math.round(cssHeight * pixelRatio);
    ctx.setTransform(
        pixelRatio * scale, 0, 0, pixelRatio * scale,
        pixelRatio * state.view.offsetX, pixelRatio * state.view.offsetY
    );

    state.coreX = state.width / 2;
    state.coreY = state.height / 2;

    if (state.gameState === 'START') {
        player.x = state.coreX;
        player.y = state.coreY + CHARACTER_MODEL.initialPositionOffsetY;
        player.targetX = player.x;
        player.targetY = player.y;
    } else if (oldCoreX || oldCoreY) {
        // Janela redimensionada no meio da partida: desloca tudo junto com o centro
        const dx = state.coreX - oldCoreX;
        const dy = state.coreY - oldCoreY;
        [player, shadowClone, ...state.enemies, ...state.enemyProjectiles, ...state.goldDrops, ...state.particles].forEach(o => {
            o.x += dx;
            o.y += dy;
        });
        player.targetX += dx;
        player.targetY += dy;
    }
}

// Recalcula sempre que o canvas muda de tamanho: girar o celular, tela cheia, barra do navegador.
// O ResizeObserver só avisa depois que a página terminou de se ajustar, já com o tamanho certo;
// o 'resize' da janela fica de reserva.
export function setupResize() {
    resize();
    if (window.ResizeObserver) new ResizeObserver(() => resize()).observe(canvas);
    window.addEventListener('resize', resize);
}
