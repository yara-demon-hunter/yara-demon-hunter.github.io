import { registerProp } from '../props.js';
import { WISP_VISUALS } from './wisp_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'wisp', name: 'Fogo-fátuo', kind: 'animated', anim: { frames: [10, 6, 4], size: 1.5, cycleSeconds: 3.6 }, visual: WISP_VISUALS,
    cell: [44, 52], anchor: [0.5, 0.7], variants: 2,
    paint(g, r, phase, p) {
        const off = r() * TAU;
        const bob = Math.sin(phase * TAU + off) * p.bob;
        const pulse = 0.5 + 0.5 * Math.sin(phase * TAU * 2 + off);
        const y = -14 + bob;
        const halo = g.createRadialGradient(0, y, 0, 0, y, 15);
        halo.addColorStop(0, `rgba(${p.glow}, ${0.35 + p.pulse * pulse * 0.5})`);
        halo.addColorStop(1, `rgba(${p.glow}, 0)`);
        g.fillStyle = halo;
        g.fillRect(-16, y - 16, 32, 32);
        const pool = g.createRadialGradient(0, 2, 0, 0, 2, 12);
        pool.addColorStop(0, `rgba(${p.glow}, ${0.12 + p.pulse * 0.2 * pulse})`);
        pool.addColorStop(1, `rgba(${p.glow}, 0)`);
        g.save();
        g.scale(1, 0.4);
        g.fillStyle = pool;
        g.fillRect(-12, -10, 24, 24);
        g.restore();
        g.fillStyle = p.core;
        g.beginPath();
        g.arc(0, y, 2.1, 0, TAU);
        g.fill();
        g.fillStyle = `rgba(${p.glow}, 0.8)`;
        g.beginPath();
        g.ellipse(0.4, y + 3.6, 1.1, 2.6, 0, 0, TAU);
        g.fill();
    }
});
