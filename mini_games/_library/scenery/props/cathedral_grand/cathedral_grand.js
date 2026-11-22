import { registerProp } from '../props.js';
import { CATHEDRAL_GRAND_VISUALS } from './cathedral_grand_visual.js';

const TAU = Math.PI * 2;

// Catedral grande em 2,5D, com a torre do sino no centro: dentro da abertura em arco o SINO balança como um pêndulo e, a cada batida (nos
// dois extremos do balanço), ondas de som se abrem em volta da torre. As duas torres menores têm flechas; atrás vem a nave comprida com o
// transepto em cruz. Animada (atlas, 1 variante): phase de 0 a 1 é UM ciclo de balanço (duas batidas). ~ 240 de largura, ~ 330 de altura.
registerProp({
    occludes: true,        // esconde quem passa atrás (o jogo redesenha o prédio por cima do herói); no editor dá para desligar por objeto
    id: 'cathedral_grand', name: 'Catedral grande (sino)', kind: 'animated',
    anim: { frames: [10, 8, 6], size: 1.2, cycleSeconds: 2.6 }, visual: CATHEDRAL_GRAND_VISUALS,
    cell: [250, 380], anchor: [0.5, 0.87], variants: 1,
    paint(g, r, phase, p) {
        const W = 108;                         // largura da fachada
        const H = 58;                          // altura da parede da fachada
        const T = 13;                          // meia largura das torres laterais
        const tx = W / 2 + 4;
        const sideTop = -H - 52;
        const s = Math.sin(phase * TAU);       // -1 .. 1 : posição do balanço
        const strike = Math.pow(Math.abs(s), 10);   // 1 nos extremos: é quando o sino bate

        // sombra no chão: só um pouco maior que a base (fachada + torres), suave nas pontas, com uma faixa de contato mais escura colada na parede
        const half = tx + T + 6;
        g.save();
        g.translate(5, 4);
        g.scale(1, 0.15);
        const soft = g.createRadialGradient(0, 0, half * 0.35, 0, 0, half);
        soft.addColorStop(0, 'rgba(0, 0, 0, 0.36)');
        soft.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = soft;
        g.beginPath(); g.arc(0, 0, half, 0, TAU); g.fill();
        g.restore();
        g.fillStyle = 'rgba(0, 0, 0, 0.3)';
        g.beginPath(); g.roundRect(-(tx + T), 0, (tx + T) * 2, 4, 2); g.fill();

        // nave (atrás) com contrafortes
        const naveTop = -H - 190;
        g.fillStyle = p.stoneDark;
        for (let k = 0; k < 6; k++) { const yy = -H - 22 - k * 28; g.fillRect(-W * 0.4, yy, 6, 15); g.fillRect(W * 0.4 - 6, yy, 6, 15); }
        g.fillStyle = p.roof;
        g.beginPath(); g.moveTo(-W * 0.36, -H + 2); g.lineTo(W * 0.36, -H + 2); g.lineTo(W * 0.27, naveTop); g.lineTo(-W * 0.27, naveTop); g.closePath(); g.fill();
        g.strokeStyle = p.roofDark; g.lineWidth = 1;
        for (let yy = -H - 8; yy > naveTop; yy -= 7) { g.beginPath(); g.moveTo(-W * 0.35, yy); g.lineTo(W * 0.35, yy); g.stroke(); }
        g.fillStyle = p.stoneLight; g.fillRect(-1, naveTop, 2, -naveTop - H);
        g.fillStyle = p.roofDark;
        g.beginPath(); g.moveTo(W * 0.36, -H + 2); g.lineTo(W * 0.27, naveTop); g.lineTo(W * 0.05, naveTop); g.lineTo(W * 0.05, -H + 2); g.closePath(); g.fill();

        // transepto
        const ty = -H - 100;
        g.fillStyle = p.roof; g.fillRect(-W * 0.66, ty - 17, W * 1.32, 34);
        g.fillStyle = p.roofDark; g.fillRect(-W * 0.66, ty + 9, W * 1.32, 8);
        g.strokeStyle = p.roofDark;
        for (let yy = ty - 14; yy < ty + 14; yy += 6) { g.beginPath(); g.moveTo(-W * 0.66, yy); g.lineTo(W * 0.66, yy); g.stroke(); }
        g.fillStyle = p.stoneDark; g.fillRect(-W * 0.68, ty - 19, 5, 38); g.fillRect(W * 0.68 - 5, ty - 19, 5, 38);

        // fachada
        g.fillStyle = p.stone; g.fillRect(-W / 2, -H, W, H);
        g.strokeStyle = p.stoneDark; g.lineWidth = 0.8;
        for (let yy = -H + 10; yy < 0; yy += 10) { g.beginPath(); g.moveTo(-W / 2, yy); g.lineTo(W / 2, yy); g.stroke(); }
        g.fillStyle = p.stoneLight; g.fillRect(-W / 2, -H, W, 2.6); g.fillRect(-W / 2, -H, 2.6, H);
        g.fillStyle = p.stoneDark; g.fillRect(-W / 2, -2, W, 3);

        // empena central
        g.fillStyle = p.stone;
        g.beginPath(); g.moveTo(-W * 0.34, -H); g.lineTo(0, -H - 32); g.lineTo(W * 0.34, -H); g.closePath(); g.fill();
        g.fillStyle = p.stoneLight;
        g.beginPath(); g.moveTo(-W * 0.34, -H); g.lineTo(0, -H - 32); g.lineTo(-W * 0.3, -H); g.closePath(); g.fill();

        // TORRE DO SINO (central): corpo de pedra, abertura em arco com o sino, e a flecha
        const bt = -H - 138;                    // topo do corpo da torre
        g.fillStyle = 'rgba(0, 0, 0, 0.25)'; g.fillRect(-14, bt, 30, -bt - H + 20);
        g.fillStyle = p.stone; g.fillRect(-17, bt, 34, -bt - H + 26);
        g.strokeStyle = p.stoneDark; g.lineWidth = 0.8;
        for (let yy = bt + 10; yy < -H + 20; yy += 10) { g.beginPath(); g.moveTo(-17, yy); g.lineTo(17, yy); g.stroke(); }
        g.fillStyle = p.stoneLight; g.fillRect(-17, bt, 2.6, -bt - H + 26);
        g.fillStyle = p.stoneDark; g.fillRect(-19, bt - 3, 38, 5);                     // friso do topo
        // abertura do sino
        const ax0 = -10, ax1 = 10, ay1 = bt + 62, ay0 = bt + 22;
        g.fillStyle = p.door;
        g.beginPath(); g.moveTo(ax0, ay1); g.lineTo(ax0, ay0 + 8); g.quadraticCurveTo(ax0, ay0 - 6, 0, ay0 - 8); g.quadraticCurveTo(ax1, ay0 - 6, ax1, ay0 + 8); g.lineTo(ax1, ay1); g.closePath(); g.fill();
        // o sino: pêndulo preso no alto da abertura
        g.save();
        g.translate(0, ay0 - 5);
        g.rotate(s * p.swing);
        g.fillStyle = p.bellDark; g.fillRect(-1, 0, 2, 6);                              // a haste
        g.fillStyle = p.bell;
        g.beginPath(); g.moveTo(-3.6, 6); g.quadraticCurveTo(-4.4, 16, -7.6, 25); g.lineTo(7.6, 25); g.quadraticCurveTo(4.4, 16, 3.6, 6); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255, 240, 190, 0.45)'; g.fillRect(-3, 8, 1.6, 14);           // reflexo
        g.fillStyle = p.bellDark; g.fillRect(-7.6, 23.5, 15.2, 2.2);                    // o lábio
        g.beginPath(); g.arc(s * 1.6, 27.5, 2.2, 0, TAU); g.fill();                     // o badalo
        g.restore();
        // ondas de som: duas a cada batida, abrindo dos lados da torre
        if (strike > 0.02) {
            g.strokeStyle = p.sound;
            g.lineWidth = 1.6;
            const cx = 0, cy = ay0 + 16;
            for (let k = 0; k < 2; k++) {
                const rad = 20 + k * 12 + (1 - strike) * 10;
                g.globalAlpha = strike * (k ? 0.5 : 0.85);
                g.beginPath(); g.arc(cx, cy, rad, -0.9, 0.9); g.stroke();
                g.beginPath(); g.arc(cx, cy, rad, Math.PI - 0.9, Math.PI + 0.9); g.stroke();
            }
            g.globalAlpha = 1;
        }
        // flecha da torre central e cruz
        g.fillStyle = p.spire;
        g.beginPath(); g.moveTo(-22, bt - 3); g.lineTo(0, bt - 66); g.lineTo(22, bt - 3); g.closePath(); g.fill();
        g.fillStyle = p.stoneLight;
        g.beginPath(); g.moveTo(-22, bt - 3); g.lineTo(0, bt - 66); g.lineTo(-17, bt - 3); g.closePath(); g.fill();
        g.fillStyle = p.spire; g.fillRect(-1, bt - 82, 2, 17); g.fillRect(-5, bt - 77, 10, 2.2);

        // rosácea
        const ry = -H * 0.55;
        g.fillStyle = p.stoneDark; g.beginPath(); g.arc(0, ry, 15, 0, TAU); g.fill();
        const glow = g.createRadialGradient(0, ry, 0, 0, ry, 12.5);
        glow.addColorStop(0, `rgba(${p.glass}, 0.95)`); glow.addColorStop(1, `rgba(${p.glass}, 0.55)`);
        g.fillStyle = glow; g.beginPath(); g.arc(0, ry, 12.5, 0, TAU); g.fill();
        g.strokeStyle = p.stoneDark; g.lineWidth = 1.2;
        for (let k = 0; k < 8; k++) { const ang = (k / 8) * TAU; g.beginPath(); g.moveTo(0, ry); g.lineTo(Math.cos(ang) * 12.5, ry + Math.sin(ang) * 12.5); g.stroke(); }
        g.beginPath(); g.arc(0, ry, 6, 0, TAU); g.stroke();

        // portal
        g.fillStyle = p.stoneDark;
        g.beginPath(); g.moveTo(-13, 0); g.lineTo(-13, -19); g.quadraticCurveTo(-13, -35, 0, -40); g.quadraticCurveTo(13, -35, 13, -19); g.lineTo(13, 0); g.closePath(); g.fill();
        g.fillStyle = p.door;
        g.beginPath(); g.moveTo(-10, 0); g.lineTo(-10, -19); g.quadraticCurveTo(-10, -32, 0, -36); g.quadraticCurveTo(10, -32, 10, -19); g.lineTo(10, 0); g.closePath(); g.fill();
        g.fillStyle = `rgba(${p.glass}, 0.35)`; g.fillRect(-0.8, -34, 1.6, 34);

        // torres laterais com flecha
        [-1, 1].forEach(side => {
            const cx = side * tx;
            g.fillStyle = 'rgba(0, 0, 0, 0.25)'; g.fillRect(cx - T + (side > 0 ? 3 : 0), sideTop, T * 2 - 3, -sideTop);
            g.fillStyle = p.stone; g.fillRect(cx - T, sideTop, T * 2, -sideTop);
            g.strokeStyle = p.stoneDark; g.lineWidth = 0.8;
            for (let yy = sideTop + 10; yy < 0; yy += 10) { g.beginPath(); g.moveTo(cx - T, yy); g.lineTo(cx + T, yy); g.stroke(); }
            g.fillStyle = p.stoneLight; g.fillRect(cx - T, sideTop, 2.6, -sideTop);
            g.fillStyle = p.door;
            g.beginPath(); g.moveTo(cx - 4, sideTop + 24); g.lineTo(cx - 4, sideTop + 11); g.quadraticCurveTo(cx, sideTop + 4, cx + 4, sideTop + 11); g.lineTo(cx + 4, sideTop + 24); g.closePath(); g.fill();
            g.fillStyle = `rgba(${p.glass}, 0.8)`; g.fillRect(cx - 2, -H + 8, 4, 12); g.fillRect(cx - 2, -H - 14, 4, 10);
            g.fillStyle = p.spire;
            g.beginPath(); g.moveTo(cx - T - 3, sideTop); g.lineTo(cx, sideTop - 54); g.lineTo(cx + T + 3, sideTop); g.closePath(); g.fill();
            g.fillStyle = p.stoneLight;
            g.beginPath(); g.moveTo(cx - T - 3, sideTop); g.lineTo(cx, sideTop - 54); g.lineTo(cx - T + 2, sideTop); g.closePath(); g.fill();
            g.fillStyle = p.spire; g.fillRect(cx - 0.8, sideTop - 64, 1.6, 12);
        });
    }
});
