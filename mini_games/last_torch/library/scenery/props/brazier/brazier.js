// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/brazier/brazier.js e rode o sync.
import { registerProp } from '../props.js';
import { BRAZIER_VISUALS } from './brazier_visual.js';

const TAU = Math.PI * 2;

registerProp({
    id: 'brazier', name: 'Braseiro', kind: 'animated', anim: { frames: [10, 8, 5], size: 1.9, cycleSeconds: 1.6 }, visual: BRAZIER_VISUALS,
    cell: [60, 66], anchor: [0.5, 0.86], variants: 2,
    paint(g, r, phase, p) {
        const off = r() * TAU;
        const f = 0.5 + 0.5 * Math.sin(phase * TAU * 2 + off);
        const ground = g.createRadialGradient(0, 3, 0, 0, 3, 26);
        ground.addColorStop(0, `rgba(${p.glow}, ${0.22 + p.flicker * f * 0.5})`);
        ground.addColorStop(1, `rgba(${p.glow}, 0)`);
        g.save();
        g.scale(1, 0.45);
        g.fillStyle = ground;
        g.fillRect(-26, -22, 52, 52);
        g.restore();
        g.fillStyle = p.bowl;
        g.beginPath();
        g.moveTo(-7, 2);
        g.lineTo(-10, -9);
        g.lineTo(10, -9);
        g.lineTo(7, 2);
        g.closePath();
        g.fill();
        g.fillStyle = p.bowlLight;
        g.beginPath();
        g.ellipse(0, -9, 10, 3.4, 0, 0, TAU);
        g.fill();
        g.fillStyle = `rgba(${p.glow}, 0.9)`;
        g.beginPath();
        g.ellipse(0, -9, 7.5, 2.3, 0, 0, TAU);
        g.fill();
        p.flame.forEach((color, k) => {
            const h = (15 - k * 4.5) * (1 + p.flicker * Math.sin(phase * TAU * 2 + off + k * 1.7));
            const sway = Math.sin(phase * TAU + off + k) * (2 - k * 0.5);
            const w = 6.2 - k * 1.7;
            g.fillStyle = color;
            g.beginPath();
            g.moveTo(-w, -9);
            g.quadraticCurveTo(-w * 0.9 + sway, -9 - h * 0.6, sway, -9 - h);
            g.quadraticCurveTo(w * 0.9 + sway, -9 - h * 0.6, w, -9);
            g.closePath();
            g.fill();
        });
    }
});
