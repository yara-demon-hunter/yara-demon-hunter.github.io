import { SHACKLE_VISUALS as V } from '../../data_model/visuals/effects/shackle_visual.js';
import { SHADOW_SHACKLE } from '../../data_model/passives.js';
import { ctx, player, state } from '../core/state.js';
import { renderNow } from '../../library/core/clock.js';
import { drawGlow } from '../../library/core/glow.js';
import { makeCanvas } from './fx/sprites.js';

// --- CORRENTE ---
// Shadow Shackle: a corrente sai do herói, voa até o monstro e o prende a estacas no chão. Cada elo é um drawImage
// de um sprite pronto (de frente e de lado, alternados), como as outras artes que aparecem em campo.
const TAU = Math.PI * 2;
let sprites = null;

function metalRamp(g, height) {
    const M = V.metal;
    const grad = g.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, M.light);
    grad.addColorStop(0.45, M.mid);
    grad.addColorStop(1, M.dark);
    return grad;
}

function buildSprites() {
    const { length, width } = V.link;
    const p = V.pixels;
    const w = (length + 2) * p;
    const h = (width + 2) * p;
    // Elo de frente: argola aberta
    const face = makeCanvas(w, h, (g) => {
        g.scale(p, p);
        g.translate(1, 1);
        g.lineWidth = 3.4;
        g.strokeStyle = V.metal.edge;
        const ring = () => {
            g.beginPath();
            g.ellipse(length / 2, width / 2, length / 2 - 1, width / 2 - 1, 0, 0, TAU);
            g.stroke();
        };
        ring();
        g.lineWidth = 2;
        g.strokeStyle = metalRamp(g, width);
        ring();
    });
    // Elo de lado: barra grossa
    const side = makeCanvas(w, h, (g) => {
        g.scale(p, p);
        g.translate(1, 1);
        g.fillStyle = V.metal.edge;
        g.beginPath();
        g.roundRect(0, width / 2 - 2, length, 4, 2);
        g.fill();
        g.fillStyle = metalRamp(g, width);
        g.beginPath();
        g.roundRect(0.7, width / 2 - 1.3, length - 1.4, 2.6, 1.3);
        g.fill();
    });
    // Estaca cravada no chão, com a argola no topo. Origem: ponta enterrada
    const stake = makeCanvas(12 * p, 22 * p, (g) => {
        g.scale(p, p);
        g.fillStyle = V.metal.edge;
        g.beginPath();
        g.moveTo(6, 22);
        g.lineTo(2.2, 7);
        g.lineTo(9.8, 7);
        g.closePath();
        g.fill();
        g.fillStyle = metalRamp(g, 22);
        g.beginPath();
        g.moveTo(6, 20.5);
        g.lineTo(3.4, 7.5);
        g.lineTo(8.6, 7.5);
        g.closePath();
        g.fill();
        g.lineWidth = 2;
        g.strokeStyle = V.metal.light;
        g.beginPath();
        g.arc(6, 4.4, 2.8, 0, TAU);
        g.stroke();
    });
    sprites = { face, side, stake, w: w / p, h: h / p };
    return sprites;
}

// Monta os sprites e os desenha uma vez fora da tela, com a tela de skills aberta, para não pesar no meio da luta
export function prepareShackle() {
    if (sprites) return sprites;
    buildSprites();
    const g = makeCanvas(1, 1).getContext('2d');
    [sprites.face, sprites.side, sprites.stake].forEach(canvas => g.drawImage(canvas, 0, 0, 1, 1));
    return sprites;
}

// Corrente de (ax, ay) a (bx, by), barrigando `sag` no meio
function drawChain(ax, ay, bx, by, sag, size) {
    const S = prepareShackle();
    const dist = Math.hypot(bx - ax, by - ay);
    const spacing = V.link.spacing * size;
    const count = Math.max(1, Math.floor(dist / spacing));
    const midX = (ax + bx) / 2;
    const midY = (ay + by) / 2 + sag;
    const w = S.w * size;
    const h = S.h * size;
    for (let i = 0; i < count; i++) {
        const u = (i + 0.5) / count;
        const v = 1 - u;
        const x = v * v * ax + 2 * v * u * midX + u * u * bx;
        const y = v * v * ay + 2 * v * u * midY + u * u * by;
        const tangentX = v * (midX - ax) + u * (bx - midX);
        const tangentY = v * (midY - ay) + u * (by - midY);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.atan2(tangentY, tangentX));
        ctx.drawImage(i % 2 ? S.side : S.face, -w / 2, -h / 2, w, h);
        ctx.restore();
    }
}

function stakePoint(e, i) {
    const a = (i + 0.5) / V.stakes * TAU;
    const r = e.radius + V.stakeGap;
    return { x: e.x + Math.cos(a) * r, y: e.y + Math.sin(a) * r * V.groundSquash + e.radius * 0.35 };
}

// Monstro preso: estacas no chão e uma corrente de cada estaca até ele
function drawHold(e, age) {
    const S = prepareShackle();
    const left = SHADOW_SHACKLE.holdSeconds - age;
    // Crava de uma vez ao prender; no fim pisca, avisando que vai soltar
    const grow = Math.min(1, age / 0.14);
    const blink = left < V.fadeSeconds ? 0.55 + 0.45 * Math.sin(age * 22) : 1;
    const size = Math.max(0.8, Math.min(1.5, e.radius / 18));
    const pull = Math.sin(renderNow() / 90 + e.radius) * 1.4;
    const stakes = [];
    for (let i = 0; i < V.stakes; i++) stakes.push(stakePoint(e, i));
    ctx.save();
    ctx.globalAlpha = blink;
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, V.glow, e.x, e.y + e.radius * 0.35, (e.radius + V.stakeGap) * 1.25, 0.55 * grow);
    ctx.globalCompositeOperation = 'source-over';
    for (const p of stakes) {
        const x = p.x + (e.x - p.x) * (1 - grow);
        const y = p.y + (e.y - p.y) * (1 - grow);
        drawChain(x, y - 16 * size, e.x + pull * 0.4, e.y + pull * 0.3, 3 * size, size);
        const w = 12 * size;
        const h = 22 * size;
        ctx.drawImage(S.stake, x - w / 2, y - h, w, h);
    }
    ctx.restore();
}

export function renderShackle() {
    const s = state.shackle;
    if (!s) return;
    const e = s.target;
    if (s.held) {
        drawHold(e, s.age);
        return;
    }
    // Em voo: a corrente sai da mão do herói e a ponta brilha
    const fromX = player.x;
    const fromY = player.y - 14;
    const dist = Math.hypot(e.x - fromX, e.y - fromY) || 1;
    const k = Math.min(1, s.reach / dist);
    const tipX = fromX + (e.x - fromX) * k;
    const tipY = fromY + (e.y - fromY) * k;
    drawChain(fromX, fromY, tipX, tipY, s.reach * V.sag * (1 - k), 1);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, V.glowHot, tipX, tipY, 13, 0.9);
    ctx.restore();
}
