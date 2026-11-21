// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/tombstone/tombstone.js e rode o sync.
import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { TOMBSTONE_VISUALS } from './tombstone_visual.js';

const TAU = Math.PI * 2;

// Lápide vista de cima e um pouco de frente (2,5D): sombra no chão, montinho de terra, corpo com topo arredondado, cruz ou obelisco.
// Estática: três formatos (arredondada, cruz, obelisco), inclinadas de leve, com musgo e rachadura.
registerProp({
    id: 'tombstone', name: 'Lápide', kind: 'static', previewSize: 56, visual: TOMBSTONE_VISUALS,
    roll(r, p) {
        return {
            shape: Math.floor(r() * 3), h: randomRange(r, p.height[0], p.height[1]), w: randomRange(r, p.width[0], p.width[1]),
            tilt: (r() - 0.5) * 0.3, shade: 0.75 + r() * 0.25, mound: r() < p.mound, moss: r() < 0.5, mossX: r() - 0.5, crack: r() < 0.4
        };
    },
    draw(g, x, y, a, p) {
        g.fillStyle = 'rgba(0, 0, 0, 0.4)';
        g.beginPath();
        g.ellipse(x + 3, y + 1, a.w * 0.75, a.w * 0.3, 0, 0, TAU);
        g.fill();
        if (a.mound) {
            g.fillStyle = p.dirt;
            g.beginPath();
            g.ellipse(x, y + a.w * 0.55, a.w * 0.9, a.w * 0.38, 0, 0, TAU);
            g.fill();
        }
        g.save();
        g.translate(x, y);
        g.rotate(a.tilt);
        g.fillStyle = p.stone;
        g.globalAlpha = a.shade;
        if (a.shape === 0) {
            g.beginPath();
            g.moveTo(-a.w / 2, 0);
            g.lineTo(-a.w / 2, -a.h + a.w / 2);
            g.arc(0, -a.h + a.w / 2, a.w / 2, Math.PI, 0);
            g.lineTo(a.w / 2, 0);
            g.closePath();
            g.fill();
        } else if (a.shape === 1) {
            g.fillRect(-a.w * 0.14, -a.h, a.w * 0.28, a.h);
            g.fillRect(-a.w * 0.5, -a.h * 0.72, a.w, a.w * 0.26);
        } else {
            g.beginPath();
            g.moveTo(-a.w * 0.4, 0);
            g.lineTo(-a.w * 0.26, -a.h);
            g.lineTo(a.w * 0.26, -a.h);
            g.lineTo(a.w * 0.4, 0);
            g.closePath();
            g.fill();
        }
        g.globalAlpha = 1;
        g.fillStyle = p.light;
        g.fillRect(-a.w * 0.5 + 1, -a.h * 0.85, 1.6, a.h * 0.7);
        if (a.crack) {
            g.strokeStyle = 'rgba(6, 8, 12, 0.7)';
            g.lineWidth = 0.8;
            g.beginPath();
            g.moveTo(-a.w * 0.1, -a.h * 0.8);
            g.lineTo(a.w * 0.05, -a.h * 0.55);
            g.lineTo(-a.w * 0.08, -a.h * 0.3);
            g.stroke();
        }
        if (a.moss) {
            g.fillStyle = p.moss;
            g.beginPath();
            g.ellipse(a.mossX * a.w, -1, a.w * 0.32, 2.4, 0, 0, TAU);
            g.fill();
        }
        g.restore();
    }
});
