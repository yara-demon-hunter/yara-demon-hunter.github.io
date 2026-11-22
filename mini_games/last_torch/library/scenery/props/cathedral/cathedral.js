// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/props/cathedral/cathedral.js e rode o sync.
import { randomRange } from '../../../core/random.js';
import { registerProp } from '../props.js';
import { CATHEDRAL_VISUALS } from './cathedral_visual.js';

const TAU = Math.PI * 2;

// Catedral gótica em 2,5D (de cima e de frente): a fachada com portal em arco e rosácea, as duas torres com flechas, e atrás dela o
// telhado comprido da nave com o transepto em cruz. A base (o "pé") fica no meio da fachada. Estática, grande (~170 de largura, ~270 de altura).
registerProp({
    occludes: true,        // esconde quem passa atrás (o jogo redesenha o prédio por cima do herói); no editor dá para desligar por objeto
    id: 'cathedral', name: 'Catedral', kind: 'static', previewSize: 300, visual: CATHEDRAL_VISUALS,
    roll(r, p) {
        return { w: randomRange(r, p.width[0], p.width[1]), towerUp: Math.floor(r() * 12), cross: r() < 0.7 };
    },
    draw(g, x, y, a, p) {
        const W = a.w;
        const H = 46;                         // altura da parede da fachada
        const T = 13;                         // meia largura de cada torre
        const tx = W / 2 + 4;                 // eixo das torres
        const towerTop = -H - 38 - a.towerUp;
        g.save();
        g.translate(x, y);

        // sombra no chão
        g.fillStyle = 'rgba(0, 0, 0, 0.42)';
        g.beginPath(); g.ellipse(10, 6, W * 0.98, 15, 0, 0, TAU); g.fill();

        // nave: telhado comprido que sobe atrás da fachada, com contrafortes dos lados
        const naveTop = -H - 150;
        g.fillStyle = p.stoneDark;
        for (let k = 0; k < 5; k++) { const yy = -H - 20 - k * 26; g.fillRect(-W * 0.4, yy, 6, 14); g.fillRect(W * 0.4 - 6, yy, 6, 14); }
        g.fillStyle = p.roof;
        g.beginPath(); g.moveTo(-W * 0.36, -H + 2); g.lineTo(W * 0.36, -H + 2); g.lineTo(W * 0.27, naveTop); g.lineTo(-W * 0.27, naveTop); g.closePath(); g.fill();
        g.strokeStyle = p.roofDark; g.lineWidth = 1;
        for (let yy = -H - 8; yy > naveTop; yy -= 7) { g.beginPath(); g.moveTo(-W * 0.35, yy); g.lineTo(W * 0.35, yy); g.stroke(); }
        g.fillStyle = p.stoneLight;
        g.fillRect(-1, naveTop, 2, -naveTop - H);                              // a cumeeira
        g.fillStyle = p.roofDark;
        g.beginPath(); g.moveTo(W * 0.36, -H + 2); g.lineTo(W * 0.27, naveTop); g.lineTo(W * 0.05, naveTop); g.lineTo(W * 0.05, -H + 2); g.closePath(); g.fill();   // lado na sombra

        // transepto (os braços da cruz), no meio da nave
        const ty = -H - 78;
        g.fillStyle = p.roof;
        g.fillRect(-W * 0.62, ty - 15, W * 1.24, 30);
        g.fillStyle = p.roofDark;
        g.fillRect(-W * 0.62, ty + 8, W * 1.24, 7);
        g.strokeStyle = p.roofDark;
        for (let yy = ty - 12; yy < ty + 12; yy += 6) { g.beginPath(); g.moveTo(-W * 0.62, yy); g.lineTo(W * 0.62, yy); g.stroke(); }
        g.fillStyle = p.stoneDark;
        g.fillRect(-W * 0.64, ty - 17, 5, 34); g.fillRect(W * 0.64 - 5, ty - 17, 5, 34);

        // fachada: parede de pedra com fiadas e friso
        g.fillStyle = p.stone;
        g.fillRect(-W / 2, -H, W, H);
        g.strokeStyle = p.stoneDark; g.lineWidth = 0.8;
        for (let yy = -H + 9; yy < 0; yy += 9) { g.beginPath(); g.moveTo(-W / 2, yy); g.lineTo(W / 2, yy); g.stroke(); }
        g.fillStyle = p.stoneLight;
        g.fillRect(-W / 2, -H, W, 2.4); g.fillRect(-W / 2, -H, 2.4, H);
        g.fillStyle = p.stoneDark;
        g.fillRect(-W / 2, -2, W, 3);

        // empena central (o triângulo da fachada) com a cruz
        g.fillStyle = p.stone;
        g.beginPath(); g.moveTo(-W * 0.34, -H); g.lineTo(0, -H - 34); g.lineTo(W * 0.34, -H); g.closePath(); g.fill();
        g.fillStyle = p.stoneLight;
        g.beginPath(); g.moveTo(-W * 0.34, -H); g.lineTo(0, -H - 34); g.lineTo(-W * 0.3, -H); g.closePath(); g.fill();
        if (a.cross) {
            g.fillStyle = p.spire;
            g.fillRect(-1.2, -H - 50, 2.4, 17); g.fillRect(-5, -H - 46, 10, 2.4);
        }

        // rosácea: círculo com raios e luz de vitral
        const rx = 0;
        const ry = -H * 0.58;
        g.fillStyle = p.stoneDark;
        g.beginPath(); g.arc(rx, ry, 13, 0, TAU); g.fill();
        const glow = g.createRadialGradient(rx, ry, 0, rx, ry, 11);
        glow.addColorStop(0, `rgba(${p.glass}, 0.95)`);
        glow.addColorStop(1, `rgba(${p.glass}, 0.55)`);
        g.fillStyle = glow;
        g.beginPath(); g.arc(rx, ry, 10.5, 0, TAU); g.fill();
        g.strokeStyle = p.stoneDark; g.lineWidth = 1.1;
        for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx + Math.cos(ang) * 10.5, ry + Math.sin(ang) * 10.5); g.stroke(); }
        g.beginPath(); g.arc(rx, ry, 5, 0, TAU); g.stroke();

        // portal em arco ogival
        g.fillStyle = p.stoneDark;
        g.beginPath(); g.moveTo(-11, 0); g.lineTo(-11, -16); g.quadraticCurveTo(-11, -30, 0, -34); g.quadraticCurveTo(11, -30, 11, -16); g.lineTo(11, 0); g.closePath(); g.fill();
        g.fillStyle = p.door;
        g.beginPath(); g.moveTo(-8, 0); g.lineTo(-8, -16); g.quadraticCurveTo(-8, -27, 0, -30); g.quadraticCurveTo(8, -27, 8, -16); g.lineTo(8, 0); g.closePath(); g.fill();
        g.fillStyle = `rgba(${p.glass}, 0.35)`;
        g.fillRect(-0.7, -28, 1.4, 28);

        // torres: corpo de pedra, abertura do sino, vitrais, e a flecha pontuda
        [-1, 1].forEach(side => {
            const cx = side * tx;
            g.fillStyle = 'rgba(0, 0, 0, 0.25)';
            g.fillRect(cx - T + (side > 0 ? 3 : 0), towerTop, T * 2 - 3, -towerTop);
            g.fillStyle = p.stone;
            g.fillRect(cx - T, towerTop, T * 2, -towerTop);
            g.strokeStyle = p.stoneDark; g.lineWidth = 0.8;
            for (let yy = towerTop + 9; yy < 0; yy += 9) { g.beginPath(); g.moveTo(cx - T, yy); g.lineTo(cx + T, yy); g.stroke(); }
            g.fillStyle = p.stoneLight;
            g.fillRect(cx - T, towerTop, 2.4, -towerTop);
            // abertura do sino (escura) no alto e vitrais embaixo
            g.fillStyle = p.door;
            g.beginPath(); g.moveTo(cx - 4, towerTop + 22); g.lineTo(cx - 4, towerTop + 10); g.quadraticCurveTo(cx, towerTop + 3, cx + 4, towerTop + 10); g.lineTo(cx + 4, towerTop + 22); g.closePath(); g.fill();
            g.fillStyle = `rgba(${p.glass}, 0.8)`;
            g.fillRect(cx - 2, -H + 6, 4, 11); g.fillRect(cx - 2, -H - 14, 4, 9);
            // flecha
            g.fillStyle = p.spire;
            g.beginPath(); g.moveTo(cx - T - 3, towerTop); g.lineTo(cx, towerTop - 52); g.lineTo(cx + T + 3, towerTop); g.closePath(); g.fill();
            g.fillStyle = p.stoneLight;
            g.beginPath(); g.moveTo(cx - T - 3, towerTop); g.lineTo(cx, towerTop - 52); g.lineTo(cx - T + 2, towerTop); g.closePath(); g.fill();
            g.fillStyle = p.spire;
            g.fillRect(cx - 0.8, towerTop - 62, 1.6, 12);
        });
        g.restore();
    }
});
