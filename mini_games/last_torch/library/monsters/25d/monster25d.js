// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/monster25d.js e rode o sync.
import { renderHero25D } from '../../characters/hunter/hero25d.js';
import { createHeroAnim, updateHeroAnim } from '../../characters/hunter/hero_anim.js';
import { ctx } from '../../core/canvas.js';
import { host } from '../../core/host.js';
import { lerpAngle } from '../../core/easing.js';
import { drawGlow } from '../../core/glow.js';

// --- MONSTRO 2.5D NO JOGO ---
// Desenha um monstro 2.5D (um boneco registrado em characters/hunter/body_registry.js) a partir do monstro do jogo,
// { x, y, angle, hp, maxHp, radius, phase }, na câmera de cima do Last Torch. Cada monstro tem o seu estado de animação
// (passada, giro); o tamanho sai do raio (radius × P.scalePerRadius) e a aura verde/da cor dele de P.colors.aura.
// o (opcional): { colors(P, hurtAge) → paleta do quadro (ex.: piscar ao levar dano), before(e, st) → antes de desenhar }
const anims = new WeakMap();

export function renderMonster25D(e, model, P, o = {}) {
    let st = anims.get(e);
    if (!st) {
        const anim = createHeroAnim(false);
        anim.facing = e.angle;
        anim.lastX = e.x;
        anim.lastY = e.y;
        st = { anim, lastHp: e.hp, hurtAt: -Infinity, body: { comboStep: 1, dashTimer: 0, hitTime: -Infinity, hitDirX: 0, hitDirY: 0, iFrames: 0, move: null } };
        anims.set(e, st);
    }
    const now = performance.now();
    if (e.hp < st.lastHp) st.hurtAt = now;
    st.lastHp = e.hp;
    const body = Object.assign(st.body, { x: e.x, y: e.y, angle: e.angle });
    updateHeroAnim(st.anim, body);
    // Parado ele ainda vira para o alvo (o motor só vira para onde anda)
    if (host.animating()) st.anim.facing = lerpAngle(st.anim.facing, e.angle, 0.15);

    const scale = e.radius * P.scalePerRadius;
    const colors = o.colors ? o.colors(P, (now - st.hurtAt) / 1000) : P.colors;
    o.before?.(e, st);
    if (!e.baking && P.colors.aura) drawGlow(ctx, P.colors.aura, e.x, e.y, P.auraRadius * scale, P.auraAlpha);
    renderHero25D(body, st.anim, colors, null, model, { scale, time: now });
}
