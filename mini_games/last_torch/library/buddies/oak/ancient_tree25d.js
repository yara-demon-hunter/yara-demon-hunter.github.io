// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/buddies/oak/ancient_tree25d.js e rode o sync.
import { ANCIENT_TREE_25D_VISUALS as S } from './ancient_tree25d_visual.js';
import { registerCreature } from '../../monsters/25d/creature25d.js';
import { ctx } from '../../core/canvas.js';
import { host } from '../../core/host.js';
import { drawGlow } from '../../core/glow.js';
import { ANCIENT3D, drawAncientTree, prepareAncientTree } from './oak.js';

const TAU = Math.PI * 2;

// --- ÁRVORE ANCESTRAL COMO BUDDY (Treant) ---
// Mesmo desenho da forma Ancient Grove do carvalho, agora no molde dos outros buddies 2.5D (id 'treant' em BUDDIES_25D): atlas 3D do Laboratório,
// 5 ângulos (espelhado à esquerda), andar e ataque. e.swing (0..1) dispara o ataque. Medidas: ancient_tree25d_visual.js.
const states = new WeakMap();
const SWING_FRAMES = ANCIENT3D.attackSeconds;

// Peça única para quem desenha pelo boneco (Ateliê): o sprite, com os pés no chão do boneco
registerCreature('buddy_treant', S, (pose, rig) => {
    const c0 = rig.project(0, 0, 0);
    const c1 = rig.project(0, 0, 1);
    const unit = Math.hypot(c1.x - c0.x, c1.y - c0.y);
    return [{
        depth: c0.depth,
        draw() {
            prepareAncientTree();
            const phase = (((rig.anim.stride % TAU) + TAU) % TAU) / TAU;
            const k = unit * S.spriteUnits / ANCIENT3D.size;
            drawAncientTree(ctx, c0.x, c0.y, k, { x: Math.cos(rig.anim.facing), y: Math.sin(rig.anim.facing) }, phase, 99);
        }
    }];
});

// Em campo: e = { x, y, radius, angle, swing }. Brilho verde, sombra e a árvore
export function renderAncientTreeBuddy25D(e) {
    prepareAncientTree();
    let st = states.get(e);
    if (!st) states.set(e, st = { x: e.x, y: e.y, phase: Math.random(), atk: 99, swing: 0 });
    const dist = Math.hypot(e.x - st.x, e.y - st.y);
    st.x = e.x; st.y = e.y;
    if (host.animating()) st.phase = (st.phase + dist / S.pixelsPerCycle / 2) % 1;
    if (e.bakeFrame !== undefined) st.phase = e.bakeFrame;
    const sw = e.swing ?? 0;
    if (sw > 0.02 && st.swing <= 0.02) st.atk = 0;           // começou um golpe
    else if (host.animating()) st.atk += 1 / 60;
    st.swing = sw;
    const k = e.radius * S.spriteScale;
    const feet = e.y + e.radius * S.spriteFeet;
    if (!e.baking) {
        drawGlow(ctx, S.colors.aura, e.x, e.y, e.radius * 3.4, S.auraAlpha);
        ctx.save();
        ctx.translate(e.x, feet);
        ctx.scale(1, 0.5);
        const r = e.radius * S.shadowRadius;
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
        g.addColorStop(0.6, 'rgba(0, 0, 0, 0.28)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fill();
        ctx.restore();
    }
    drawAncientTree(ctx, e.x, feet, k, { x: Math.cos(e.angle ?? Math.PI / 2), y: Math.sin(e.angle ?? Math.PI / 2) }, st.phase, st.atk);
}
