import { ctx } from '../core/state.js';
import { furySwords, furyTrails } from '../systems/fury.js';
import { SWORD_RAIN_BOUNDS, drawFallingSword } from '../../library/weapons/sword/sword_rain.js';
import { SWORD_RAIN_VISUALS } from '../../library/weapons/sword/sword_rain_visual.js';
import { makeCanvas } from './fx/sprites.js';
import { drawGlow } from '../../library/core/glow.js';

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

// --- CHUVA DE ESPADAS (Demon Hunter) ---
// A espada é um sprite montado uma vez (o desenho é da biblioteca: library/weapons/sword/sword_rain.js). Cada espada em campo
// custa um drawImage: um aviso rosa no chão que cresce, a espada caindo de cima com um rastro de luz e, no impacto, ela fica
// fincada e some aos poucos. A gigante é a mesma espada em escala maior.
const SWORD_PX = 2;
let swordSprite = null;
function getRainSword() {
    return swordSprite ??= makeCanvas(SWORD_RAIN_BOUNDS.width * SWORD_PX, SWORD_RAIN_BOUNDS.height * SWORD_PX, (g) => {
        g.scale(SWORD_PX, SWORD_PX);
        g.translate(SWORD_RAIN_BOUNDS.width / 2, SWORD_RAIN_BOUNDS.height - 1);       // a ponta fica embaixo, no centro
        drawFallingSword(g);
    });
}

export function renderFurySwords() {
    let any = false;
    for (const s of furySwords) {
        if (!s.on) continue;
        if (!any) {
            any = true;
        }
        const F = s.F;
        const scale = s.big ? 2.6 : 1;
        const w = SWORD_RAIN_BOUNDS.width * scale;
        const h = SWORD_RAIN_BOUNDS.height * scale;
        const sprite = getRainSword();
        const C = SWORD_RAIN_VISUALS.colors;
        const radius = s.big ? F.giantRadius : F.radius;
        if (!s.hit) {
            // Aviso no chão e a espada caindo (rápida no fim) com o rastro de luz atrás
            const p = Math.min(1, s.age / s.fall);
            const ring = radius * (0.35 + 0.65 * p);
            ctx.globalAlpha = 0.18 + 0.3 * p;
            ctx.strokeStyle = C.impact;
            ctx.lineWidth = s.big ? 3 : 1.6;
            ctx.beginPath();
            ctx.ellipse(s.x, s.y, ring, ring * 0.72, 0, 0, Math.PI * 2);
            ctx.stroke();
            const rise = (1 - p) * (1 - p) * (s.big ? 560 : 330);
            ctx.globalAlpha = 0.4 * p;
            ctx.strokeStyle = C.trail;
            ctx.lineWidth = s.big ? 6 : 3;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y - rise - h * 0.5);
            ctx.lineTo(s.x, s.y - rise - h - 150 * (1 - p));
            ctx.stroke();
            ctx.globalAlpha = Math.min(1, 0.4 + p);
            ctx.drawImage(sprite, s.x - w / 2, s.y - rise - h, w, h);
        } else {
            // Fincada: brilho do impacto e a espada sumindo
            const t = s.age - s.fall;
            const fade = Math.max(0, 1 - t / s.stay);
            ctx.globalAlpha = 0.5 * fade;
            drawGlow(ctx, C.glow, s.x, s.y - 4, radius * (0.5 + 0.5 * Math.min(1, t * 5)), 1);
            ctx.globalAlpha = Math.min(1, fade * 1.6);
            ctx.drawImage(sprite, s.x - w / 2, s.y - h, w, h);
        }
    }
    if (any) ctx.globalAlpha = 1;
}
