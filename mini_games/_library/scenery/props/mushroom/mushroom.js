import { registerProp } from '../props.js';
import { MUSHROOM_VISUALS } from './mushroom_visual.js';

const TAU = Math.PI * 2;

// Cogumelos em 2,5D (vistos de cima e de frente ao mesmo tempo): caule, tampa em cúpula e sombra no chão, com o brilho
// pulsando no chão e na tampa. De cima puro viraria só uma bolinha: o caule e a cúpula é que dizem "cogumelo".
// Animada (atlas): phase de 0 a 1 é um ciclo de pulso.
registerProp({
    id: 'mushroom', name: 'Cogumelo que brilha', kind: 'animated', visual: MUSHROOM_VISUALS,
    cell: [44, 48], anchor: [0.5, 0.78], variants: 2,
    paint(g, r, phase, p) {
        const n = 2 + Math.floor(r() * 3);
        const pulse = 0.5 + 0.5 * Math.sin(phase * TAU);
        const shrooms = Array.from({ length: n }, () => ({ x: (r() - 0.5) * 11, y: (r() - 0.5) * 4, cap: 2.6 + r() * 1.7, stem: 3 + r() * 2.6, lean: (r() - 0.5) * 1.2 }));
        shrooms.sort((a, b) => a.y - b.y);          // os de trás primeiro
        // Luz no chão e em volta das tampas (por baixo de tudo)
        shrooms.forEach(m => {
            const top = m.y - m.stem;
            const halo = g.createRadialGradient(m.x, top, 0, m.x, top, m.cap * 3.4);
            halo.addColorStop(0, `rgba(${p.glow}, ${0.08 + p.pulse * 0.55 * pulse})`);
            halo.addColorStop(1, `rgba(${p.glow}, 0)`);
            g.fillStyle = halo;
            g.fillRect(m.x - m.cap * 3.4, top - m.cap * 3.4, m.cap * 6.8, m.cap * 6.8);
            const pool = g.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.cap * 2.6);
            pool.addColorStop(0, `rgba(${p.glow}, ${0.1 + p.pulse * 0.4 * pulse})`);
            pool.addColorStop(1, `rgba(${p.glow}, 0)`);
            g.save();
            g.translate(m.x, m.y);
            g.scale(1, 0.4);
            g.translate(-m.x, -m.y);
            g.fillStyle = pool;
            g.fillRect(m.x - m.cap * 2.6, m.y - m.cap * 2.6, m.cap * 5.2, m.cap * 5.2);
            g.restore();
        });
        shrooms.forEach(m => {
            const topX = m.x + m.lean;
            const topY = m.y - m.stem;
            // Caule claro, um pouco mais grosso embaixo
            g.fillStyle = p.stem;
            g.beginPath();
            g.moveTo(m.x - m.cap * 0.22, m.y);
            g.quadraticCurveTo(m.x - m.cap * 0.14 + m.lean * 0.4, m.y - m.stem * 0.5, topX - m.cap * 0.16, topY);
            g.lineTo(topX + m.cap * 0.16, topY);
            g.quadraticCurveTo(m.x + m.cap * 0.14 + m.lean * 0.4, m.y - m.stem * 0.5, m.x + m.cap * 0.22, m.y);
            g.closePath();
            g.fill();
            // Parte de baixo da tampa (as lâminas, escuras) e a cúpula por cima
            g.fillStyle = p.capUnder;
            g.beginPath();
            g.ellipse(topX, topY, m.cap, m.cap * 0.38, 0, 0, TAU);
            g.fill();
            g.fillStyle = p.capRim;
            g.beginPath();
            g.ellipse(topX, topY - m.cap * 0.1, m.cap, m.cap * 0.82, 0, Math.PI, TAU);
            g.closePath();
            g.fill();
            g.fillStyle = p.cap;
            g.beginPath();
            g.ellipse(topX - m.cap * 0.08, topY - m.cap * 0.18, m.cap * 0.82, m.cap * 0.62, 0, Math.PI, TAU);
            g.closePath();
            g.fill();
            // Brilho que pulsa no alto da cúpula, e o reflexo branco
            g.fillStyle = `rgba(255, 255, 255, ${0.25 + 0.5 * pulse})`;
            g.beginPath();
            g.ellipse(topX - m.cap * 0.18, topY - m.cap * 0.55, m.cap * 0.42, m.cap * 0.2, -0.3, 0, TAU);
            g.fill();
            g.fillStyle = p.spot;
            g.beginPath();
            g.arc(topX + m.cap * 0.35, topY - m.cap * 0.38, m.cap * 0.12, 0, TAU);
            g.arc(topX - m.cap * 0.45, topY - m.cap * 0.25, m.cap * 0.09, 0, TAU);
            g.fill();
        });
    }
});
