import { HERO_25D_VISUALS as V } from '../../data_model/visuals/characters/hero25d_visual.js';
import { OATH_VISUALS as O } from '../../data_model/visuals/characters/oath_visual.js';
import { PASSIVE_SKILL_MODELS } from '../../data_model/passives.js';
import { ctx, state } from '../core/state.js';
import { drawGlow } from './fx/glow.js';

// --- EQUIPAMENTO DOS JURAMENTOS ---
// Peças extras do boneco 2.5D (js/render/player25d.js), na mesma câmera e na mesma ordem de profundidade.
// rig: as ferramentas do boneco { project, limb, ball, disk, anim }. Cada peça é { depth, draw }.
const TAU = Math.PI * 2;

// Forma do herói nesta noite: chave em OATH_VISUALS, ou null sem Juramento
export function getHeroGear() {
    return state.oath ? PASSIVE_SKILL_MODELS[state.oath].gear : null;
}

// Paleta do herói com a do Juramento por cima (montada uma vez por combinação)
const palettes = new Map();
export function getOathPalette(gear, base) {
    if (!gear) return base;
    let byBase = palettes.get(base);
    if (!byBase) palettes.set(base, byBase = {});
    return byBase[gear] ??= { ...base, ...O[gear].colors };
}

function slaughterParts(pose, rig) {
    const { project, limb, ball } = rig;
    const G = O.slaughter.gear;
    const parts = [];
    for (const side of [-1, 1]) {
        // Ombreira com dois espinhos
        const s = [pose.lean, side * (V.chest.B + 0.3), pose.shoulderZ];
        parts.push({
            depth: project(...s).depth + 0.4,
            draw() {
                limb([[s[0] + 0.5, s[1], s[2] + 0.8], [s[0] + 1.4, s[1] + side * 3.8, s[2] + 2.8]], 1.1, G.boneShade);
                ball(s, 2.9, G.metal);
                ball([s[0], s[1], s[2] + 0.8], 1.9, G.metalLight);
                limb([[s[0] - 0.3, s[1] + side * 0.6, s[2] + 1.6], [s[0] - 1.2, s[1] + side * 2.4, s[2] + 6.2]], 1.3, G.bone);
            }
        });
        // Chifre saindo do capuz
        const root = [pose.headA, side * 2.2, pose.headZ + 2.2];
        const bend = [pose.headA - 0.8, side * 4.4, pose.headZ + 4];
        const tip = [pose.headA - 2, side * 4.2, pose.headZ + 7.4];
        parts.push({
            depth: project(...root).depth + 0.2,
            draw() {
                limb([root, bend], 1.7, G.bone);
                limb([bend, tip], 1.1, G.bone);
            }
        });
    }
    return parts;
}

// Cachecol: duas pontas que acompanham a capa e ondulam
function scarfTail(pose, rig, side) {
    const { anim } = rig;
    const { t, run } = pose;
    const anchor = [pose.lean - 0.8, side * 0.8, pose.shoulderZ + 1.4];
    const steps = 7;
    const points = [anchor];
    for (let i = 1; i <= steps; i++) {
        const k = i / steps;
        const length = (side > 0 ? 8 : 6) + run * 20;
        const wave = Math.sin(t * 8.5 + i * 0.95 + side) * k * (1.1 + run * 1.6);
        points.push([
            anchor[0] - length * k + anim.capeX * 0.4 * k,
            anchor[1] + side * k * 2 + anim.capeY * 0.45 * k + wave,
            anchor[2] - (7 - run * 5.5) * k + Math.sin(t * 6.5 + i) * k * 0.8
        ]);
    }
    return points;
}

function whispersParts(pose, rig) {
    const { project, limb, ball } = rig;
    const G = O.whispers.gear;
    const parts = [];
    for (const side of [-1, 1]) {
        const tail = scarfTail(pose, rig, side);
        parts.push({
            depth: project(...tail[3]).depth,
            draw() {
                limb(tail.slice(0, 5), 2.3, side > 0 ? G.scarf : G.scarfShade);
                limb(tail.slice(4), 1.5, side > 0 ? G.scarf : G.scarfShade);
            }
        });
    }
    // Duas adagas cruzadas nas costas
    const backA = pose.lean - V.chest.A - 0.4;
    const z = pose.shoulderZ - 2;
    parts.push({
        depth: project(backA, 0, z).depth,
        draw() {
            for (const side of [-1, 1]) {
                const hilt = [backA, side * 3.4, z + 4.6];
                const tip = [backA - 0.4, -side * 3.4, z - 4.6];
                limb([hilt, tip], 1.3, G.sheath);
                limb([hilt, [hilt[0], hilt[1] - side * 0.8, hilt[2] - 1]], 1.6, G.hilt);
            }
        }
    });
    // Gola do cachecol
    const neck = [pose.lean + 0.6, 0, pose.shoulderZ + 1.2];
    parts.push({ depth: project(...neck).depth + 0.5, draw: () => ball(neck, 2.9, G.scarf) });
    return parts;
}

function hearthParts(pose, rig) {
    const { project, limb, ball, anim } = rig;
    const G = O.hearth.gear;
    const parts = [];
    for (const side of [-1, 1]) {
        const s = [pose.lean, side * (V.chest.B + 0.4), pose.shoulderZ - 0.1];
        parts.push({
            depth: project(...s).depth + 0.4,
            draw() {
                ball([s[0], s[1], s[2] - 0.6], 3.3, G.goldShade);
                ball(s, 3, G.gold);
                ball([s[0] + 0.3, s[1], s[2] + 1], 1.5, G.goldLight);
            }
        });
    }
    // Peitoral com o sol da tocha no centro
    const chest = [pose.lean + V.chest.A * 0.85, 0, pose.shoulderZ - 3.2];
    parts.push({
        depth: project(...chest).depth + 0.3,
        draw() {
            ball(chest, 2.6, G.gold);
            ball([chest[0] + 0.2, 0, chest[2]], 1.4, G.goldLight);
        }
    });
    // Lanterna na cintura: balança com a passada
    const swing = Math.sin(anim.stride) * 1.6 * pose.run + Math.sin(pose.t * 2) * 0.3;
    const hook = [pose.lean * 0.3 + 0.8, -V.waist.B - 0.8, pose.hipZ + 0.6];
    const lamp = [hook[0] + swing - pose.run * 1.5, hook[1] - 0.4, hook[2] - 4.4];
    parts.push({
        depth: project(...lamp).depth + 0.2,
        draw() {
            limb([hook, lamp], 0.6, G.chain);
            const p = project(...lamp);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            drawGlow(ctx, G.flame, p.x, p.y, 8 + Math.sin(pose.t * 9) * 0.8, 0.8);
            ctx.restore();
            ball([lamp[0], lamp[1], lamp[2] + 1.4], 1.1, G.goldShade);
            ball(lamp, 1.6, G.lantern);
            ball([lamp[0], lamp[1], lamp[2] - 1.4], 1, G.goldShade);
        }
    });
    return parts;
}

// Grimório aberto flutuando ao lado do ombro esquerdo
function grimoire(pose, rig) {
    const { project, limb, ball } = rig;
    const G = O.ruin.gear;
    const { t } = pose;
    const c = [Math.sin(t * 1.3) * 1, -9.5 + Math.cos(t * 1.1) * 0.7, 21 + Math.sin(t * 2.1) * 1.3];
    const flap = 0.5 + Math.sin(t * 3) * 0.12;
    const page = (side, inset, lift) => [
        [c[0] - 3 + inset, c[1], c[2] - 0.2 + lift],
        [c[0] + 3 - inset, c[1], c[2] - 0.2 + lift],
        [c[0] + 3 - inset, c[1] + side * (3.8 - inset), c[2] + flap * 2 + lift],
        [c[0] - 3 + inset, c[1] + side * (3.8 - inset), c[2] + flap * 2 + lift]
    ];
    const fill = (points, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        points.forEach((p, i) => {
            const s = project(...p);
            if (i === 0) ctx.moveTo(s.x, s.y);
            else ctx.lineTo(s.x, s.y);
        });
        ctx.closePath();
        ctx.fill();
    };
    return {
        depth: project(...c).depth,
        draw() {
            const glow = project(c[0], c[1], c[2] + 1);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            drawGlow(ctx, G.rune, glow.x, glow.y, 11, 0.5);
            ctx.restore();
            for (const side of [-1, 1]) {
                fill(page(side, 0, 0), G.cover);
                fill(page(side, 0.4, 0.3), G.page);
                limb([[c[0] - 1.8, c[1] + side * 1.1, c[2] + flap + 0.5], [c[0] + 1.8, c[1] + side * 1.1, c[2] + flap + 0.5]], 0.4, G.ink);
                limb([[c[0] - 1.8, c[1] + side * 2.2, c[2] + flap * 1.5 + 0.5], [c[0] + 1.2, c[1] + side * 2.2, c[2] + flap * 1.5 + 0.5]], 0.4, G.ink);
            }
            limb([[c[0] - 3, c[1], c[2]], [c[0] + 3, c[1], c[2]]], 0.7, G.coverEdge);
            ball([c[0] + 3.1, c[1], c[2]], 0.5, G.page);
        }
    };
}

function ruinParts(pose, rig) {
    const { project } = rig;
    const G = O.ruin.gear;
    const parts = [grimoire(pose, rig)];
    // Fagulhas girando em volta da cabeça
    for (let i = 0; i < 3; i++) {
        const a = pose.t * 2.2 + (i / 3) * TAU;
        const p = [pose.headA + Math.cos(a) * 6.5, Math.sin(a) * 6.5, pose.headZ + 2 + Math.sin(a * 2) * 1];
        parts.push({
            depth: project(...p).depth,
            draw() {
                const s = project(...p);
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                drawGlow(ctx, G.spark, s.x, s.y, 2.4, 0.9);
                ctx.restore();
            }
        });
    }
    return parts;
}

const PARTS = { slaughter: slaughterParts, whispers: whispersParts, hearth: hearthParts, ruin: ruinParts };

export function gearParts(gear, pose, rig) {
    return gear ? PARTS[gear](pose, rig) : [];
}

// Círculo de runas girando no chão (Oath of Ruin)
function drawRuneCircle(pose, rig) {
    const { disk, project } = rig;
    const G = O.ruin.gear;
    const spin = pose.t * 0.9;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = G.rune;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha *= 0.6;
    disk([0, 0, 0], [15, 0, 0], [0, 15, 0]);
    ctx.stroke();
    disk([0, 0, 0], [11.5, 0, 0], [0, 11.5, 0]);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
        const a = spin + (i / 6) * TAU;
        const b = a + TAU / 3;
        const p = project(Math.cos(a) * 11.5, Math.sin(a) * 11.5, 0);
        const q = project(Math.cos(b) * 11.5, Math.sin(b) * 11.5, 0);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
    }
    ctx.restore();
}

// O que o Juramento desenha no chão, antes do corpo
export function drawGearGround(gear, pose, rig) {
    if (!gear) return;
    if (gear === 'ruin') drawRuneCircle(pose, rig);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, O[gear].aura, 0, 0, 15 + Math.sin(pose.t * 3) * 1.2, 0.2);
    ctx.restore();
}
