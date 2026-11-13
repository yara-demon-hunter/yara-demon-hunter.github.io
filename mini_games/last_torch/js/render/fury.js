import { ctx } from '../core/state.js';
import { furyTrails } from '../systems/fury.js';

// --- RISCOS DA VALSA DE SANGUE (Azael) ---
// Cada corte deixa um risco vermelho do ponto de onde ele saiu até onde reapareceu, atravessando o monstro, que some aos
// poucos. Três traços por risco (sombra larga, vermelho, miolo claro): poucos riscos, nenhum objeto criado por quadro.
export function renderFuryTrails() {
    let any = false;
    for (const t of furyTrails) {
        if (t.life <= 0) continue;
        if (!any) {
            ctx.lineCap = 'round';
            any = true;
        }
        const k = t.life / t.max;
        for (const [color, width] of TRAIL_STROKES) {
            ctx.strokeStyle = color;
            ctx.globalAlpha = k;
            ctx.lineWidth = width * (0.5 + 0.5 * k);
            ctx.beginPath();
            ctx.moveTo(t.x0, t.y0);
            ctx.lineTo(t.x1, t.y1);
            ctx.stroke();
        }
    }
    if (any) ctx.globalAlpha = 1;
}

const TRAIL_STROKES = [['rgba(127, 29, 29, 0.5)', 16], ['#dc2626', 7], ['#fca5a5', 3], ['#fff1f2', 1.2]];
