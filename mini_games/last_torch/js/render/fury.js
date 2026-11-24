import { ctx } from '../core/state.js';
import { furyRend, furySwords, furyTrails } from '../systems/fury.js';
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

// --- FENDA DO CORTE CARMESIM (Kuro) ---
// Antes do golpe: uma linha tênue no chão mostra o caminho. Depois: a fenda em zigue-zague cresce até a ponta e vai sumindo; no
// herói, um risco vermelho vertical (a espada descendo) acende e apaga rápido.
export function renderFuryRend() {
    const R = furyRend;
    if (!R.on) return;
    ctx.save();
    ctx.translate(R.x, R.y);
    ctx.rotate(R.angle);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (R.age < R.windup) {
        const k = R.age / R.windup;
        ctx.globalAlpha = 0.12 + 0.25 * k;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2 + 4 * k;
        ctx.setLineDash([14, 12]);
        ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(R.length, 0); ctx.stroke();
        ctx.setLineDash([]);
    } else {
        const t = R.age - R.windup;
        const fade = t < R.travel ? 1 : Math.max(0, 1 - (t - R.travel) / R.linger);
        const t2 = R.age - R.second;
        const fade2 = t2 < R.travel ? 1 : Math.max(0, 1 - (t2 - R.travel) / R.linger);
        // O chão cortado: uma rachadura fina em zigue-zague, escura com um fio vermelho por dentro, e pequenas fissuras saindo
        // dos lados; acompanha a lâmina e some aos poucos
        const crackAlpha = t2 >= 0 ? Math.max(fade, fade2) : fade;
        const reach = Math.max(R.front, R.front2);
        const crack = () => {
            ctx.beginPath();
            ctx.moveTo(20, 0);
            for (let i = 0; i < R.pts.length; i += 2) {
                if (R.pts[i] < 20) continue;
                if (R.pts[i] > reach) break;
                ctx.lineTo(R.pts[i], R.pts[i + 1]);
            }
        };
        ctx.globalAlpha = crackAlpha * 0.7;
        ctx.strokeStyle = '#1a0606';
        ctx.lineWidth = 4;
        crack(); ctx.stroke();
        ctx.globalAlpha = crackAlpha * 0.9;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        crack(); ctx.stroke();
        // Fissuras laterais: curtas, a cada poucos pontos, alternando o lado
        ctx.globalAlpha = crackAlpha * 0.6;
        ctx.strokeStyle = '#1a0606';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 6; i < R.pts.length; i += 10) {
            const x = R.pts[i], y = R.pts[i + 1];
            if (x > reach) break;
            const side = (i / 10) % 2 < 1 ? 1 : -1;
            ctx.moveTo(x, y);
            ctx.lineTo(x + 6, y + side * 7);
            ctx.lineTo(x + 9, y + side * 12);
        }
        ctx.stroke();
        // 2º corte: a meia-lua da Crimson Tide DEITADA (horizontal), larga, correndo pelo mesmo caminho
        if (t2 >= 0 && t2 < R.travel + 0.12) {
            const r2 = R.width * R.secondWidth * 0.55 * Math.min(1, 0.45 + t2 * 8);
            const a2 = t2 < R.travel ? 1 : 1 - (t2 - R.travel) / 0.12;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.translate(R.front2, 0);
            ctx.globalAlpha = a2 * 0.5;
            drawGlow(ctx, 'rgba(239, 68, 68, 0.75)', r2 * 0.2, 0, r2 * 1.1, 1);
            ctx.globalAlpha = a2;
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(-r2 * 0.3, 0, r2, -1.15, 1.15);
            ctx.arc(-r2 * 0.95, 0, r2 * 1.35, 0.8, -0.8, true);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fecaca';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(-r2 * 0.3, 0, r2, -1, 1);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
        // A lâmina de ar: a meia-lua vermelha da Crimson Tide, mas EM PÉ (o arco sobe do chão) e bem maior, correndo à frente
        if (t < R.travel + 0.12) {
            const k = Math.min(1, t / R.travel);
            const fx = R.x + Math.cos(R.angle) * R.front, fy = R.y + Math.sin(R.angle) * R.front;
            const r = R.width * 1.05 * Math.min(1, 0.45 + t * 8);
            const alpha = t < R.travel ? 1 : 1 - (t - R.travel) / 0.12;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = alpha * 0.5;
            drawGlow(ctx, 'rgba(239, 68, 68, 0.75)', fx, fy - r * 0.6, r * 1.1, 1);
            // Mesmo desenho da meia-lua da Crimson Tide, com x = direção do voo (vista de cima) e y = para cima na tela:
            // o arco fica de pé, com a base no chão e a barriga virada para onde ela corre
            ctx.translate(fx, fy - r * 0.9);
            ctx.transform(Math.cos(R.angle), Math.sin(R.angle) * 0.5, 0, 1, 0, 0);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(-r * 0.3, 0, r, -1.15, 1.15);
            ctx.arc(-r * 0.95, 0, r * 1.35, 0.8, -0.8, true);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fecaca';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(-r * 0.3, 0, r, -1, 1);
            ctx.stroke();
            ctx.restore();
            // Lascas de chão saltando na base da lâmina
            ctx.save();
            ctx.globalAlpha = alpha * 0.8 * (1 - k * 0.3);
            ctx.fillStyle = '#7f1d1d';
            for (let i = 0; i < 4; i++) {
                const ox = Math.sin(t * 40 + i * 2.1) * 10, oy = -Math.abs(Math.cos(t * 33 + i)) * 14;
                ctx.fillRect(fx + ox - 1.5, fy + oy - 1.5, 3, 3);
            }
            ctx.restore();
        }
        return;
    }
    ctx.restore();
}

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
