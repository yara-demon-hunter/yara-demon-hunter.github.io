// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/cottage/cottage.js e rode o sync.
import { registerProp } from '../props.js';
import { COTTAGE_VISUALS } from './cottage_visual.js';

const TAU = Math.PI * 2;

// Chalé de camponês em 2,5D: telhado inclinado grande por cima, parede da frente com vigas, porta e uma janela acesa que tremula,
// chaminé de pedra soltando fumaça em ciclo. Animada (atlas): phase de 0 a 1 é um ciclo da fumaça e da chama da janela.
registerProp({
    id: 'cottage', name: 'Chalé de camponês', kind: 'animated', anim: { frames: [6, 4, 3], size: 1.5, cycleSeconds: 3.2 }, visual: COTTAGE_VISUALS,
    cell: [112, 104], anchor: [0.5, 0.86], variants: 3,
    paint(g, r, phase, p) {
        const roof = p.roofs[Math.floor(r() * p.roofs.length)];
        const wide = 44 + r() * 14;
        const left = r() < 0.5 ? -1 : 1;
        const f = 0.5 + 0.5 * Math.sin(phase * TAU * 2 + r() * TAU);
        // sombra e luz da janela no chão
        g.fillStyle = 'rgba(0, 0, 0, 0.4)';
        g.beginPath();
        g.ellipse(4, 3, wide * 0.62, 7, 0, 0, TAU);
        g.fill();
        const spill = g.createRadialGradient(left * 8, 6, 0, left * 8, 6, 26);
        spill.addColorStop(0, `rgba(${p.window}, ${0.12 + p.flicker * 0.3 * f})`);
        spill.addColorStop(1, `rgba(${p.window}, 0)`);
        g.save();
        g.translate(0, 0);
        g.scale(1, 0.45);
        g.fillStyle = spill;
        g.fillRect(left * 8 - 26, -20, 52, 52);
        g.restore();
        // parede da frente
        const hw = wide / 2;
        g.fillStyle = p.wall;
        g.fillRect(-hw, -20, wide, 20);
        g.fillStyle = p.timber;
        g.fillRect(-hw, -20, 2.4, 20);
        g.fillRect(hw - 2.4, -20, 2.4, 20);
        g.fillRect(-hw, -21, wide, 2.2);
        g.fillRect(-1.2, -20, 2.4, 20);
        // porta
        const dx = -left * hw * 0.42;
        g.fillStyle = p.door;
        g.beginPath();
        g.moveTo(dx - 4.5, 0);
        g.lineTo(dx - 4.5, -10);
        g.arc(dx, -10, 4.5, Math.PI, 0);
        g.lineTo(dx + 4.5, 0);
        g.closePath();
        g.fill();
        // janela acesa
        const wx = left * hw * 0.45;
        g.fillStyle = `rgba(${p.window}, ${0.65 + p.flicker * f})`;
        g.fillRect(wx - 5, -15, 10, 8);
        g.strokeStyle = p.timber;
        g.lineWidth = 1.2;
        g.strokeRect(wx - 5, -15, 10, 8);
        g.beginPath();
        g.moveTo(wx, -15); g.lineTo(wx, -7); g.moveTo(wx - 5, -11); g.lineTo(wx + 5, -11);
        g.stroke();
        // chaminé (atrás do telhado)
        const cx = -left * hw * 0.5;
        g.fillStyle = '#4a4a50';
        g.fillRect(cx - 4, -58, 8, 18);
        g.fillStyle = '#2c2c32';
        g.fillRect(cx - 4, -58, 8, 2.4);
        // telhado: trapézio inclinado com fileiras e sombra no beiral
        g.fillStyle = roof;
        g.beginPath();
        g.moveTo(-hw - 6, -19);
        g.lineTo(hw + 6, -19);
        g.lineTo(hw - 4, -47);
        g.lineTo(-hw + 4, -47);
        g.closePath();
        g.fill();
        g.strokeStyle = p.roofDark;
        g.lineWidth = 1;
        for (let k = 1; k < 5; k++) {
            const y = -19 - k * 5.6;
            const inset = k * 2;
            g.beginPath();
            g.moveTo(-hw - 6 + inset, y);
            g.lineTo(hw + 6 - inset, y);
            g.stroke();
        }
        g.fillStyle = p.roofDark;
        g.fillRect(-hw - 6, -19, wide + 12, 3);
        g.fillStyle = 'rgba(255, 245, 220, 0.18)';
        g.beginPath();
        g.moveTo(-hw + 4, -47);
        g.lineTo(hw - 4, -47);
        g.lineTo(hw - 5, -45);
        g.lineTo(-hw + 5, -45);
        g.closePath();
        g.fill();
        // fumaça: 4 baforadas subindo, crescendo e sumindo
        g.fillStyle = p.smoke;
        for (let i = 0; i < 4; i++) {
            const t = (phase + i / 4) % 1;
            g.globalAlpha = (1 - t) * 0.9;
            g.beginPath();
            g.arc(cx + Math.sin(t * 5 + i) * 3 + t * 5, -60 - t * 28, 2 + t * 4.5, 0, TAU);
            g.fill();
        }
        g.globalAlpha = 1;
    }
});
