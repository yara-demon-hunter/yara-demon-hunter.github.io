import { HERO_25D_VISUALS as V } from '../../library/characters/hunter/hero25d_visual.js';
import { OATH_VISUALS as O } from '../../data_model/visuals/characters/oath_visual.js';
import { PASSIVE_SKILL_MODELS } from '../../data_model/passives.js';
import { ctx, state } from '../core/state.js';
import { drawGlow } from '../../library/core/glow.js';

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
    // Forma desconhecida (ex.: arquivo de dados antigo no cache do navegador): fica com a paleta do herói em vez de quebrar
    if (!gear || !O[gear]) return base;
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

// Uma chama 2.5D: língua de fogo que sobe de `base`, balança de lado e muda de altura sem parar (três camadas: borda
// vermelho-laranja, meio laranja, miolo amarelo). Desenhada com 'lighter' para brilhar
function flame(rig, base, height, width, t, seed, side = 0) {
    const G = O.hearth.gear;
    const h = height * (0.75 + 0.25 * Math.sin(t * 9 + seed) + 0.1 * Math.sin(t * 23 + seed * 2));
    const sway = Math.sin(t * 6 + seed) * width * 0.6 + side * height * 0.15;
    const mid = [base[0] - 0.3, base[1] + sway * 0.5, base[2] + h * 0.5];
    const tip = [base[0] - 0.6, base[1] + sway, base[2] + h];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    rig.limb([base, mid, tip], width, G.flameOuter);
    rig.limb([base, mid, [tip[0], tip[1], tip[2] - h * 0.2]], width * 0.62, G.flameMid);
    rig.limb([base, [mid[0], mid[1], mid[2] - h * 0.15]], width * 0.34, G.flameCore);
    ctx.restore();
}

// --- CHAMA (Oath of the Hearth): armadura de fogo ---
function hearthParts(pose, rig) {
    const { project, limb, ball } = rig;
    const G = O.hearth.gear;
    const t = pose.t;
    const parts = [];
    // Ombreiras de ferro escuro em placas, com a borda em lava, e chamas saindo do alto delas
    for (const side of [-1, 1]) {
        const s = [pose.lean, side * (V.chest.B + 0.5), pose.shoulderZ];
        parts.push({
            depth: project(...s).depth + 0.4,
            draw() {
                for (let k = 2; k >= 0; k--) {
                    const z = s[2] + 0.8 - k * 1.5;
                    const out = side * (0.6 + k * 0.5);
                    const arc = [
                        [s[0] - 2.4, s[1] + out * 0.4, z - 0.6],
                        [s[0], s[1] + out, z + 0.4],
                        [s[0] + 2.4, s[1] + out * 0.4, z - 0.6]
                    ];
                    limb(arc, 2.4 - k * 0.25, G.outline);
                    limb(arc, 1.8 - k * 0.25, k === 0 ? G.ironLight : G.iron);
                    // Borda de lava em cada placa, pulsando
                    ctx.save();
                    ctx.globalAlpha *= 0.75 + 0.25 * Math.sin(t * 5 + k + side);
                    limb(arc.map(p => [p[0], p[1], p[2] - 0.75]), 0.35, k === 0 ? G.lavaHot : G.lava);
                    ctx.restore();
                }
                // Chamas saindo da ombreira
                flame(rig, [s[0] - 0.8, s[1] + side * 0.4, s[2] + 1.2], 4.2, 1.7, t, side * 3.1, side);
                flame(rig, [s[0] + 1.2, s[1] + side * 1.0, s[2] + 0.8], 3.2, 1.3, t, side * 5.7 + 1, side);
            }
        });
    }
    // Peitoral de ferro com rachaduras de lava e um núcleo de fogo no centro
    const chest = [pose.lean + V.chest.A * 0.9, 0, pose.shoulderZ - 3.4];
    parts.push({
        depth: project(...chest).depth + 0.3,
        draw() {
            const p = project(...chest);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            drawGlow(ctx, G.lavaGlow, p.x, p.y, 7 + Math.sin(t * 4) * 0.8, 0.6);
            ctx.restore();
            // Rachaduras saindo do núcleo, em zigue-zague
            const cracks = [[[0, 0.4], [-1.6, 1.8], [-2.4, 1.2]], [[0, 0.4], [1.4, 2.0], [2.6, 1.6]], [[0, -0.5], [-1.2, -1.8], [-0.6, -3]], [[0, -0.5], [1.5, -1.6], [2.2, -2.8]]];
            for (const c of cracks) {
                const pts = c.map(([b, z]) => [chest[0] + 0.1, b, chest[2] + z]);
                limb(pts, 0.42, G.lava);
                limb(pts, 0.18, G.lavaHot);
            }
            ball(chest, 1.5, G.outline);
            ball(chest, 1.2, G.lava);
            ball([chest[0] + 0.2, 0, chest[2] + 0.2], 0.65, G.lavaHot);
        }
    });
    // Coroa de fogo sobre a cabeça (ou o chapéu): três línguas de chama
    const crown = [pose.headA - 0.6, 0, pose.headZ + 3.4];
    parts.push({
        depth: project(...crown).depth + 1.5,
        draw() {
            flame(rig, [crown[0], -1.3, crown[2]], 3.4, 1.4, t, 11);
            flame(rig, [crown[0] - 0.4, 0, crown[2] + 0.4], 5, 1.8, t, 13.5);
            flame(rig, [crown[0], 1.3, crown[2]], 3.4, 1.4, t, 17);
        }
    });
    // Brasas subindo em volta do corpo
    for (let i = 0; i < 7; i++) {
        const k = (t * 0.55 + i * 0.15) % 1;
        const a = i * 2.4 + t * 0.4;
        const ember = [pose.lean * 0.5 + Math.cos(a) * 6.5, Math.sin(a) * 6.5, 4 + k * 22];
        parts.push({
            depth: project(...ember).depth,
            draw() {
                ctx.save();
                ctx.globalAlpha *= Math.sin(k * Math.PI);
                ball(ember, 0.45, k < 0.5 ? G.emberHot : G.ember);
                ctx.restore();
            }
        });
    }
    return parts;
}

// --- FÉ (Oath of Faith) ---
// Auréola dourada flutuando sobre a cabeça, estola branca e brilhante com acabamento dourado caindo dos ombros pela frente
// (com uma cruz em cada ponta) e pontos de luz subindo. Os três escudos que giram em volta são do jogo (js/render/light.js).
function faithParts(pose, rig) {
    const { project, limb, ball } = rig;
    const G = O.faith.gear;
    const parts = [];
    const t = pose.t;
    // Auréola: anel no plano do chão, acima da cabeça (ou do chapéu), girando devagar e pulsando
    const top = [pose.headA - 0.4, 0, pose.headZ + 7.4 + Math.sin(t * 2) * 0.3];
    parts.push({
        depth: project(...top).depth + 2,
        draw() {
            const p = project(...top);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            drawGlow(ctx, G.haloGlow, p.x, p.y, 4.5, 0.4);       // brilho pequeno: não tinge o chapéu de amarelo
            ctx.restore();
            const ring = [];
            for (let i = 0; i <= 24; i++) {
                const a = (i / 24) * TAU + t * 0.5;
                ring.push([top[0] + Math.cos(a) * 3.2, Math.sin(a) * 3.2, top[2]]);
            }
            limb(ring, 0.75, G.halo);
        }
    });
    // Estola: duas faixas que descem dos ombros pela frente do peito até a cintura, com a cruz na ponta
    for (const side of [-1, 1]) {
        const shoulder = [pose.lean + V.chest.A * 0.6, side * 1.9, pose.shoulderZ + 0.2];
        const mid = [pose.lean * 0.7 + V.chest.A * 0.95, side * 1.6, pose.shoulderZ - 4];
        const end = [pose.lean * 0.35 + V.waist.A * 1.05 + 0.4, side * 1.5, pose.hipZ - 1.2];
        parts.push({
            depth: project(...mid).depth + 0.5,
            draw() {
                // A estola brilha (luz suave em volta do pescoço e da faixa)
                const pm = project(...shoulder);
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                drawGlow(ctx, G.haloGlow, pm.x, pm.y, 6 + Math.sin(t * 3 + side) * 0.6, 0.35);
                ctx.restore();
                limb([shoulder, mid, end], 2.1, G.stoleTrim);
                limb([shoulder, mid, end], 1.6, G.stole);
                limb([mid, end].map(q => [q[0], q[1] + side * 0.4, q[2]]), 0.35, G.stoleShade);
                const c = [end[0] + 0.1, end[1], end[2] + 1.1];
                limb([[c[0], c[1], c[2] + 0.9], [c[0], c[1], c[2] - 0.9]], 0.4, G.stoleCross);
                limb([[c[0], c[1] - 0.6, c[2] + 0.3], [c[0], c[1] + 0.6, c[2] + 0.3]], 0.4, G.stoleCross);
            }
        });
    }
    // Pontos de luz subindo em volta
    for (let i = 0; i < 5; i++) {
        const k = (t * 0.4 + i * 0.2) % 1;
        const a = i * 2.4 + t * 0.25;
        const mote = [pose.lean * 0.5 + Math.cos(a) * 6.5, Math.sin(a) * 6.5, 3 + k * 22];
        parts.push({
            depth: project(...mote).depth,
            draw() {
                ctx.save();
                ctx.globalAlpha *= Math.sin(k * Math.PI);
                ball(mote, 0.4, G.mote);
                ctx.restore();
            }
        });
    }
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

// Folhas que giram em volta do corpo (Oath of the Wild)
function wildParts(pose, rig) {
    const { project, limb } = rig;
    const G = O.wild.gear;
    const parts = [];
    for (let i = 0; i < G.leaves; i++) {
        const a = pose.t * 1.6 + (i / G.leaves) * TAU;
        const z = pose.shoulderZ - 4 + Math.sin(pose.t * 2 + i * 1.7) * 2.2;
        const base = [pose.lean + Math.cos(a) * G.orbit, Math.sin(a) * G.orbit, z];
        const tip = [base[0] + Math.cos(a + 1.5) * 1.5, base[1] + Math.sin(a + 1.5) * 1.5, z + 1.3];
        parts.push({
            depth: project(...base).depth,
            draw() {
                limb([base, tip], 1.1, i % 2 ? G.leaf : G.leafShade);
                limb([base, tip], 0.3, G.leafLight);
            }
        });
    }
    return parts;
}

const PARTS = { slaughter: slaughterParts, whispers: whispersParts, hearth: hearthParts, faith: faithParts, ruin: ruinParts, wild: wildParts };

export function gearParts(gear, pose, rig) {
    return gear && PARTS[gear] ? PARTS[gear](pose, rig) : [];
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
    if (!gear || !O[gear]) return;
    if (gear === 'ruin') drawRuneCircle(pose, rig);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, O[gear].aura, 0, 0, 15 + Math.sin(pose.t * 3) * 1.2, 0.2);
    ctx.restore();
}
