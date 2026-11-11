import { renderHero25D } from '../../characters/hunter/hero25d.js';
import { createHeroAnim, steerHeroAnim } from '../../characters/hunter/hero_anim.js';
import { HERO_25D_VISUALS as V } from '../../characters/hunter/hero25d_visual.js';
import { ctx } from '../../core/canvas.js';
import { host } from '../../core/host.js';
import { renderNow } from '../../core/clock.js';
import { drawGlow } from '../../core/glow.js';

// --- MONSTRO 2.5D NO JOGO ---
// Desenha um monstro 2.5D (um boneco registrado em characters/hunter/body_registry.js) a partir do monstro do jogo,
// { x, y, angle, hp, maxHp, radius, phase }, na câmera de cima do Last Torch. Cada monstro tem o seu estado de animação
// (passada, giro); o tamanho sai do raio (radius × P.scalePerRadius) e a aura de P.colors.aura.
// (e.x, e.y) é o CENTRO do corpo, como no desenho de cima: o boneco é posto mais embaixo, para o ponto de altura
// P.center (do boneco) cair em cima do centro de colisão. Os efeitos do jogo (clarão do golpe, gelo, barra de vida)
// continuam centrados no monstro.
// Obedece ao relógio do desenho (core/clock.js): é o que permite gravar os quadros num atlas de sprites.
// Para gravar (e.baking): e.bakeFrame = 0..1 fixa a fase da passada (a perna fecha o ciclo sem salto).
// o (opcional): { colors(P, hurtSeconds) → paleta do quadro (ex.: piscar ao levar dano), before(e, st) → antes de desenhar }
const TAU = Math.PI * 2;
const anims = new WeakMap();

export function renderMonster25D(e, model, P, o = {}) {
    const now = renderNow();
    let st = anims.get(e);
    if (!st) {
        const anim = createHeroAnim(false);
        anim.facing = e.angle;
        st = {
            anim, lastTime: now, lastX: e.x, lastY: e.y, lastHp: e.hp, hurtAt: -Infinity,
            body: { comboStep: 1, dashTimer: 0, hitTime: -Infinity, hitDirX: 0, hitDirY: 0, iFrames: 0, move: null }
        };
        anims.set(e, st);
    }
    const real = (now - st.lastTime) / 1000;
    if (real > 0) {
        // Velocidade pelo deslocamento: o motor faz a passada e o atraso da capa a partir dela
        const vx = (e.x - st.lastX) / real;
        const vy = (e.y - st.lastY) / real;
        st.lastTime = now;
        st.lastX = e.x;
        st.lastY = e.y;
        if (host.animating()) steerHeroAnim(st.anim, { vx, vy, face: e.angle }, Math.min(real, 0.05));
    }
    if (e.hp < st.lastHp) st.hurtAt = now;
    st.lastHp = e.hp;
    if (e.bakeFrame !== undefined) {
        st.anim.stride = e.bakeFrame * TAU;
        st.anim.facing = e.angle;
    }

    const scale = e.radius * P.scalePerRadius;
    const lift = (P.center ?? 0) * V.heightScale * scale * (P.bodyScale ?? 1);
    const body = Object.assign(st.body, { x: e.x, y: e.y + lift, angle: e.angle, enraged: !!e.enraged });
    const colors = o.colors ? o.colors(P, (now - st.hurtAt) / 1000) : P.colors;
    o.before?.(e, st);
    if (!e.baking && P.colors.aura) drawGlow(ctx, P.colors.aura, e.x, e.y, P.auraRadius * scale, P.auraAlpha);
    renderHero25D(body, st.anim, colors, null, model, { scale, time: now });
}
