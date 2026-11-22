import { registerProp } from '../props.js';
import { SKULL_VISUALS } from './skull_visual.js';

const TAU = Math.PI * 2;

// Caveira: um crânio humano visto de frente e um pouco de cima, caído no chão (cemitério, pântano, castelo em ruínas). O pé fica no ponto (x, y).
// Cada uma sai diferente: inclinação, com ou sem mandíbula, dente faltando, rachadura, musgo, uma órbita maior que a outra. R no editor sorteia outra;
// o tamanho se ajusta por objeto em 📏 Medidas. Estática: pintada no chão uma vez.
registerProp({
    id: 'skull', name: 'Caveira', kind: 'static', previewSize: 34, visual: SKULL_VISUALS,
    ranges: { size: [8, 120, 1, 'Largura'] },
    extent: (p) => p.size * 1.5 + 8,
    roll(r) {
        return {
            tilt: (r() - 0.5) * 0.7,
            jaw: r() < 0.65,
            missing: r() < 0.5 ? Math.floor(r() * 6) : -1,       // qual dente falta (-1 = nenhum)
            crack: r() < 0.55,
            crackSide: r() < 0.5 ? -1 : 1,
            moss: r() < 0.4,
            socket: r() < 0.5 ? -1 : 1,                          // qual órbita é maior
            flip: r() < 0.5 ? -1 : 1
        };
    },
    draw(g, x, y, a, p) {
        const k = p.size / 22;
        g.save();
        g.translate(x, y);
        g.scale(k * a.flip, k);
        g.rotate(a.tilt);
        // sombra no chão
        g.fillStyle = 'rgba(0, 0, 0, 0.32)';
        g.beginPath(); g.ellipse(1, 11, 12.5, 3.6, 0, 0, TAU); g.fill();
        // mandíbula (atrás do crânio, um pouco abaixo)
        if (a.jaw) {
            g.fillStyle = p.shade;
            g.beginPath();
            g.moveTo(-7.5, 6); g.quadraticCurveTo(-8, 12.5, -3.5, 13); g.lineTo(3.5, 13); g.quadraticCurveTo(8, 12.5, 7.5, 6);
            g.closePath(); g.fill();
            g.strokeStyle = p.dark; g.lineWidth = 0.6; g.globalAlpha = 0.7;
            for (let i = 0; i < 6; i++) { const tx = -5 + i * 2; g.beginPath(); g.moveTo(tx, 7.5); g.lineTo(tx, 11.5); g.stroke(); }
            g.globalAlpha = 1;
        }
        // o crânio
        const cranium = new Path2D();
        cranium.moveTo(-9.5, 5);
        cranium.bezierCurveTo(-12.5, 0, -12, -9, -5, -12.5);
        cranium.bezierCurveTo(-1, -14, 1, -14, 5, -12.5);
        cranium.bezierCurveTo(12, -9, 12.5, 0, 9.5, 5);
        cranium.quadraticCurveTo(9, 8.5, 6, 9);
        cranium.lineTo(-6, 9);
        cranium.quadraticCurveTo(-9, 8.5, -9.5, 5);
        cranium.closePath();
        const fill = g.createLinearGradient(-10, -12, 10, 10);
        fill.addColorStop(0, p.bone);
        fill.addColorStop(0.55, p.bone);
        fill.addColorStop(1, p.shade);
        g.fillStyle = fill;
        g.fill(cranium);
        g.strokeStyle = p.shade; g.lineWidth = 0.7; g.stroke(cranium);
        // brilho no alto da testa
        g.strokeStyle = 'rgba(255, 255, 245, 0.5)'; g.lineWidth = 1.1; g.lineCap = 'round';
        g.beginPath(); g.ellipse(-2, -8, 6, 3.4, -0.25, Math.PI * 1.1, Math.PI * 1.65); g.stroke();
        // órbitas e nariz
        g.fillStyle = p.dark;
        [[-4.4, -1.2, -1], [4.4, -1.2, 1]].forEach(([ox, oy, side]) => {
            const big = side === a.socket ? 1.12 : 1;
            g.beginPath(); g.ellipse(ox, oy, 3.3 * big, 3.9 * big, side * 0.15, 0, TAU); g.fill();
        });
        g.beginPath(); g.moveTo(0, 2.2); g.lineTo(-1.9, 6); g.lineTo(0, 5.1); g.lineTo(1.9, 6); g.closePath(); g.fill();
        // dentes
        g.fillStyle = p.bone;
        g.beginPath(); g.rect(-6.2, 6.4, 12.4, 2.7); g.fill();
        g.strokeStyle = p.dark; g.lineWidth = 0.6;
        for (let i = 0; i < 6; i++) {
            const tx = -6.2 + (i + 0.5) * (12.4 / 6);
            if (i === a.missing) { g.fillStyle = p.dark; g.fillRect(tx - 1, 6.4, 2, 2.7); continue; }
            g.beginPath(); g.moveTo(tx - 1, 6.4); g.lineTo(tx - 1, 9.1); g.stroke();
        }
        // rachadura da testa até a órbita
        if (a.crack) {
            g.strokeStyle = p.dark; g.lineWidth = 0.8; g.lineJoin = 'round';
            const s = a.crackSide;
            g.beginPath(); g.moveTo(s * 6.5, -11); g.lineTo(s * 4.5, -7); g.lineTo(s * 6, -4.5); g.lineTo(s * 4.4, -3);
            g.moveTo(s * 4.5, -7); g.lineTo(s * 2, -6.2);
            g.stroke();
        }
        // musgo no alto
        if (a.moss) {
            g.save();
            g.clip(cranium);
            g.fillStyle = p.moss;
            g.beginPath(); g.ellipse(-4, -10, 6.5, 3.4, -0.3, 0, TAU); g.fill();
            g.beginPath(); g.ellipse(3.5, -11.5, 3.5, 2, 0.2, 0, TAU); g.fill();
            g.restore();
        }
        g.restore();
    }
});
