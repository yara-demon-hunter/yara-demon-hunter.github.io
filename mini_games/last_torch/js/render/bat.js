import { BAT_VISUALS as V } from '../../data_model/visuals/monsters/bat_visual.js';
import { ctx } from '../core/state.js';
import { lerpAngle } from './fx/easing.js';
import { renderNow } from './fx/clock.js';
import { drawGlow } from './fx/glow.js';

// --- MORCEGO (desenho procedural, sem imagens) ---
// Referência: art_reference/bat. Vista de cima; no sistema local +x é a frente do morcego
// e +y é o lado direito. Os dados visuais ficam em BAT_VISUALS (data_model/visuals/monsters/bat_visual.js).

// Estado visual por monstro (não afeta a lógica do jogo); some junto com o objeto do monstro
const facingByBat = new WeakMap();

// Uma asa: lado = 1 (direita) ou -1 (esquerda); open = 0 (fechada) a 1 (aberta)
function drawWing(r, side, open) {
    const c = V.colors;
    const span = r * V.wingSpan * (V.flapMinSpan + (1 - V.flapMinSpan) * open);
    const chord = r * V.wingChord;
    const tipX = -r * V.wingSweep + (open - 0.5) * r * V.flapSweepShift * 2;
    const tipY = side * span;
    const rootFront = -chord * 0.1;
    const rootBack = -chord;

    // Membrana: borda de ataque reta e borda de trás recortada em "dentes"
    ctx.beginPath();
    ctx.moveTo(rootFront, side * r * V.bodyWidth * 0.5);
    ctx.lineTo(tipX, tipY);
    const steps = V.wingScallops;
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const x = tipX + (rootBack - tipX) * t;
        const y = tipY * (1 - t) + side * r * V.bodyWidth * 0.5 * t;
        // Ponto do "dente" entre os ossos, puxado para dentro da asa
        const midT = (i - 0.5) / steps;
        const mx = tipX + (rootBack - tipX) * midT + chord * 0.18;
        const my = (tipY * (1 - midT) + side * r * V.bodyWidth * 0.5 * midT) * 0.82;
        ctx.lineTo(mx, my);
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = c.wing;
    ctx.fill();
    ctx.strokeStyle = c.wingEdge;
    ctx.lineWidth = Math.max(0.6, r * 0.09);
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Ossos que sustentam a membrana
    ctx.strokeStyle = c.wingBone;
    ctx.lineWidth = Math.max(0.5, r * 0.07);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= V.wingBoneCount; i++) {
        const t = i / V.wingBoneCount;
        ctx.moveTo(rootFront, side * r * V.bodyWidth * 0.5);
        ctx.lineTo(tipX + (rootBack - tipX) * t, tipY * (1 - t) + side * r * V.bodyWidth * 0.5 * t);
    }
    ctx.stroke();
}

export function renderBat(e, dt = 1 / 60) {
    const c = V.colors;
    const t = renderNow() / 1000;
    const r = e.radius * V.scale;

    // Direção suavizada + zigue-zague de voo
    let facing = facingByBat.get(e);
    if (facing === undefined) facing = e.angle;
    facing = lerpAngle(facing, e.angle, Math.min(1, V.turnSmoothing * dt));
    facingByBat.set(e, facing);
    const wobble = e.baking ? 0 : Math.sin(t * V.wobbleHz * Math.PI * 2 + e.phase) * V.wobbleAmount;

    // Batida: 0 = asas fechadas, 1 = abertas
    const flap = Math.sin(t * V.flapHz * Math.PI * 2 + e.phase);
    const open = 0.5 + 0.5 * flap;
    const bob = 1 + flap * V.bobAmount;

    // Aura e sombra (a sombra fica mais afastada quando o morcego "sobe")
    if (!e.baking) {
        drawGlow(ctx, c.aura, e.x, e.y, r * V.auraRadius, V.auraAlpha);
        ctx.fillStyle = `rgba(0, 0, 0, ${V.shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(e.x + r * 0.2, e.y + r * V.shadowOffset * 0.5, r * 0.8, r * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(facing + wobble);
    ctx.scale(bob, bob);

    // Asas atrás do corpo
    drawWing(r, 1, open);
    drawWing(r, -1, open);

    // Corpo
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, 0, r * V.bodyLength * 0.5, r * V.bodyWidth * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.bodyShade;
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, 0, r * V.bodyLength * 0.3, r * V.bodyWidth * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas
    const headX = r * V.headOffset * 0.5;
    [1, -1].forEach(side => {
        ctx.fillStyle = c.ear;
        ctx.beginPath();
        ctx.moveTo(headX - r * 0.05, side * r * V.earSpread * 0.4);
        ctx.lineTo(headX + r * V.earLength * 0.55, side * r * V.earSpread * 1.15);
        ctx.lineTo(headX + r * 0.18, side * r * V.earSpread * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = c.earInner;
        ctx.beginPath();
        ctx.moveTo(headX + r * 0.05, side * r * V.earSpread * 0.55);
        ctx.lineTo(headX + r * V.earLength * 0.4, side * r * V.earSpread * 1.0);
        ctx.lineTo(headX + r * 0.17, side * r * V.earSpread * 0.3);
        ctx.closePath();
        ctx.fill();
    });

    // Cabeça
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.arc(headX, 0, r * V.headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Olhos brilhantes e presinhas
    [1, -1].forEach(side => {
        drawGlow(ctx, c.eyeGlow, headX + r * 0.18, side * r * 0.14, r * 0.3, 0.8);
        ctx.fillStyle = c.eye;
        ctx.beginPath();
        ctx.arc(headX + r * 0.18, side * r * 0.14, r * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.fang;
        ctx.beginPath();
        ctx.moveTo(headX + r * 0.32, side * r * 0.07);
        ctx.lineTo(headX + r * 0.42, side * r * 0.09);
        ctx.lineTo(headX + r * 0.32, side * r * 0.12);
        ctx.closePath();
        ctx.fill();
    });

    ctx.restore();
}
