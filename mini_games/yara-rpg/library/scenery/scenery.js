// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/scenery.js e rode o sync.
import { ctx } from '../core/canvas.js';
import { createRandom } from '../core/random.js';
import {
    bakeSourceGlow, buildFireflies, buildFogBlobs, buildFogTile, buildVignette, cutLight, drawFireflies, drawFogLayer,
    ellipticDistance, fogDensity, makeCanvas
} from './scenery_kit.js';

// --- MOTOR DOS CENÁRIOS ---
// Um cenário é uma definição (`def`) registrada com registerScenery. O motor cuida do que é igual para todos:
// o cache, a ordem das camadas, a névoa, a vinheta e as luzes. A definição só pinta o que a faz única (o chão,
// e opcionalmente elementos que balançam). Manual: scenery/README.md.
//
// CAMADAS (de baixo para cima, na ordem em que o jogo as chama):
//   1. renderGround   chão pré-pintado num canvas fora da tela (cópia 1:1, o desenho mais barato que existe)
//   2. renderSway     elementos que se mexem a cada quadro (poucos: grama, folhas, mato)
//      ... o jogo desenha monstros, herói, efeitos ...
//   3. renderAmbient  pontos de luz que vagam (vaga-lumes, esporos, brasas)
//   4. renderOverlay  névoa rolando + tom da noite + vinheta, numa tela pequena, com as luzes abrindo buracos nela
//
// O QUE O JOGO PASSA (env, um objeto reaproveitado a cada quadro, nunca criado de novo):
//   width, height   tamanho do mundo em unidades do jogo
//   res             pixels do canvas por unidade do mundo (escala da tela x pixelRatio): o chão é pintado nessa resolução
//   quality         nível de detalhe, 0 (cheio) a 2 (mínimo); escolhe a quantidade nas listas [0, 1, 2] do visual
//   danger          0 a 1: o quanto a fonte de luz está ameaçada (a névoa engrossa)
//   dawn            0 a 1: amanhecer (a névoa e a vinheta somem)
//   scaled          true = desenha o chão esticado (durante um zoom); false = cópia 1:1
//   source          brilho da fonte de luz pintado no chão: { glowColor, glowAlpha, radiusRatio } ou null
//   lights(t)       função chamada a cada redesenho da névoa (t em segundos): devolve as luzes
//                   [{ x, y, radius, solid, strength, shape }] (ver cutLight em scenery_kit.js)
// A câmera do jogo (translação e zoom) é lida do próprio ctx: o motor não importa nada do jogo.

const registry = new Map();

// def: { id, name, visual, paintGround(g, w, h, rand, env),
//        buildSway?(w, h, rand, quality, env) -> o que drawSway precisa, drawSway?(ctx, t, built, env) }
// buildSway pode devolver qualquer coisa (uma lista, ou um objeto com atlas de animação, ver
// buildSpriteSheet no kit); o motor só guarda e devolve. env.res é a resolução em que montar atlas e sprites.
export function registerScenery(def) {
    registry.set(def.id, def);
}

export function sceneryIds() {
    return [...registry.keys()];
}

export function createScenery(id) {
    const def = registry.get(id);
    if (!def) throw new Error(`Cenário "${id}" não está registrado (sceneryIds(): ${sceneryIds().join(', ') || 'vazio'})`);
    const F = def.visual;
    const cache = {
        key: '', ground: null, vignette: null, fogSprite: null, fogTile: null, fog: [], fireflies: [], fireflyTime: 0,
        sway: [], fogCanvas: null, fogCtx: null, fogScaleX: 1, fogScaleY: 1, fogDrawnAt: 0
    };

    // Monta (ou remonta, se o tamanho, a resolução ou o detalhe mudaram) tudo o que é pré-desenhado.
    // A ORDEM DOS SORTEIOS não pode mudar: o mesmo seed dá o mesmo cenário.
    function prepare(env) {
        const { width: w, height: h, quality, res } = env;
        const key = `${w}x${h}|${res.toFixed(4)}|${quality}`;
        if (cache.key === key) return;
        cache.key = key;

        const rand = createRandom(F.seed);
        const ground = makeCanvas(w * res, h * res, { alpha: false });
        const g = ground.getContext('2d', { alpha: false });
        g.scale(res, res);
        def.paintGround(g, w, h, rand, env);
        bakeSourceGlow(g, w, h, env.source);
        cache.ground = ground;

        const { sprite, blobs } = buildFogBlobs(F, w, h, rand);
        cache.fogSprite = sprite;
        cache.fog = blobs;
        cache.fogTile = buildFogTile(F, rand);
        cache.fireflies = buildFireflies(F, w, h, rand, quality);
        cache.sway = def.buildSway ? def.buildSway(w, h, rand, quality, env) : [];
        cache.fogCanvas = makeCanvas(w * F.fogResolution, h * F.fogResolution);
        cache.fogScaleX = cache.fogCanvas.width / w;
        cache.fogScaleY = cache.fogCanvas.height / h;
        cache.fogCtx = cache.fogCanvas.getContext('2d');
        cache.vignette = buildVignette(F, w, h);
        cache.fogDrawnAt = 0;
    }

    // Camada 1. Sem zoom é uma cópia exata, pixel a pixel, no deslocamento da câmera (arredondado)
    function renderGround(env) {
        prepare(env);
        if (env.scaled) {
            ctx.drawImage(cache.ground, 0, 0, env.width, env.height);
            return;
        }
        const camera = ctx.getTransform();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(cache.ground, Math.round(camera.e), Math.round(camera.f));
        ctx.imageSmoothingEnabled = true;
        ctx.setTransform(camera);
    }

    // Camada 2
    function renderSway(env) {
        if (!def.drawSway || cache.sway.length === 0) return;
        def.drawSway(ctx, performance.now() / 1000, cache.sway, env);
    }

    // Camada 3
    function renderAmbient(env) {
        const t = performance.now() / 1000;
        const dt = Math.min(0.05, cache.fireflyTime ? t - cache.fireflyTime : 0);
        cache.fireflyTime = t;
        drawFireflies(F, ctx, cache.fireflies, t, dt, env.width, env.height);
    }

    // A "sombra" da noite: névoa rolando + tom frio + vinheta, numa tela pequena. As luzes apagam círculos dela.
    function drawShadow(env, now) {
        const { width: w, height: h } = env;
        const t = now / 1000;
        const g = cache.fogCtx;
        const res = cache.fogScaleX;
        const density = fogDensity(F, env.danger, env.dawn);

        g.setTransform(res, 0, 0, cache.fogScaleY, 0, 0);
        g.globalCompositeOperation = 'source-over';
        g.clearRect(0, 0, w, h);
        for (const layer of F.fogLayers) drawFogLayer(F, g, cache.fogTile, layer, t, w, h, density);
        for (const blob of cache.fog) {
            // Deriva lenta para a direita, dando a volta na tela, com ondulação
            const span = w + blob.radius * blob.stretch * 2;
            const x = ((blob.x + t * blob.speed) % span) - blob.radius * blob.stretch;
            const y = blob.y + Math.sin(t * 0.2 + blob.phase) * F.fogWobble;
            const edge = Math.min(1, ellipticDistance(x, y, w, h));
            const breathe = 0.75 + 0.25 * Math.sin(t * 0.3 + blob.phase);

            g.globalAlpha = Math.min(0.85, (F.fogAlphaCenter + (F.fogAlphaEdge - F.fogAlphaCenter) * edge) * breathe * density);
            const rw = blob.radius * blob.stretch;
            const rh = blob.radius;
            g.drawImage(cache.fogSprite, x - rw, y - rh, rw * 2, rh * 2);
        }

        // Tom da noite + vinheta por cima da névoa
        g.globalAlpha = 1 - Math.min(1, env.dawn * 1.4);
        g.drawImage(cache.vignette, 0, 0, w, h);
        g.globalAlpha = 1;

        // Luzes: cada uma apaga um círculo da sombra
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = 'destination-out';
        for (const light of env.lights(t)) cutLight(g, res, light);
        g.globalCompositeOperation = 'source-over';
    }

    // Camada 4
    function renderOverlay(env) {
        const now = performance.now();
        if (now - cache.fogDrawnAt >= F.fogFrameMs[env.quality]) {
            cache.fogDrawnAt = now;
            drawShadow(env, now);
        }
        ctx.drawImage(cache.fogCanvas, 0, 0, env.width, env.height);
    }

    // Descarta o que está pré-desenhado: a próxima chamada refaz tudo com os valores atuais do visual.
    // Só o tuner precisa (ele muda os números ao vivo); o jogo nunca chama.
    function invalidate() {
        cache.key = '';
    }

    return { id: def.id, name: def.name, visual: F, prepare, invalidate, renderGround, renderSway, renderAmbient, renderOverlay };
}
