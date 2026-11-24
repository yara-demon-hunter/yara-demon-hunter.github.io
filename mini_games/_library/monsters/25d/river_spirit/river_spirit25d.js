import { RIVER_SPIRIT_25D_VISUALS as S } from './river_spirit25d_visual.js';
import { registerCreature, glowAt } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';

const TAU = Math.PI * 2;

// --- ESPÍRITO DO RIO 2.5D (chefe) ---
// Dama d'água: redemoinho no chão com anéis de ondas, vestido de bolas de água em camadas que balançam, tronco e cabeça claros, cabelo que flui para trás,
// coroa de juncos com lírios, braços abertos com esferas d'água em órbita. Medidas e cores: river_spirit25d_visual.js.
function parts(pose, rig) {
    const { C, project, ball, limb } = rig;
    const t = pose.t;
    const sway = (k, ph = 0) => Math.sin(t * S.swayHz * TAU + k * 1.3 + ph) * S.swayAmp;
    const items = [];
    const topZ = S.floatZ + S.dressBands * 1.5;

    // Redemoinho no chão: anéis de onda que se abrem e somem (cada um defasado)
    items.push({
        depth: project(0, 0, 0).depth - 1,
        draw() {
            glowAt(rig, [0, 0, 0.3], C.glow, S.dressR * 2.4, 0.5);
            for (let i = 0; i < 3; i++) {
                const k = (t * S.swayHz + i / 3) % 1;
                const r = S.dressR * (0.9 + k * 1.1);
                const pts = [];
                for (let j = 0; j <= 16; j++) pts.push([Math.cos((j / 16) * TAU) * r, Math.sin((j / 16) * TAU) * r, 0.2]);
                limb(pts, 0.5 * (1 - k) + 0.1, C.ripple);
            }
        }
    });

    // Vestido: faixas de baixo para cima, cada vez mais estreitas, ondulando
    for (let i = 0; i < S.dressBands; i++) {
        const k = i / (S.dressBands - 1);
        const r = S.dressR * (1 - k * 0.78);
        const z = S.floatZ + i * 1.5;
        const p = [sway(i) * (0.4 + k * 0.4), sway(i, 1.7) * 0.5, z];
        items.push({
            depth: project(...p).depth - 0.3,
            draw() {
                ball(p, r + 0.3, C.outline);
                ball(p, r, i % 2 ? C.waterDark : C.water);
                ball([p[0] + r * 0.2, p[1], p[2] + r * 0.3], r * 0.6, C.waterLight);
                if (i % 2 === 0) for (let b = 0; b < 3; b++) ball([p[0] + Math.cos(i + b * 2.1) * r * 0.7, p[1] + Math.sin(i + b * 2.1) * r * 0.7, p[2] + 0.4], 0.3, C.foam);
            }
        });
    }

    // Tronco, ombros e cabeça
    const sh = [0.2 + sway(8) * 0.3, 0, topZ + 0.4];
    const head = [0.5 + sway(9) * 0.3, sway(9, 1) * 0.3, topZ + 3.4];
    items.push({
        depth: project(...sh).depth,
        draw() {
            ball(sh, 2.5 + 0.3, C.outline);
            ball(sh, 2.5, C.skinShade);
            ball([sh[0] + 0.3, sh[1], sh[2] + 0.5], 1.9, C.skin);
            // Braços abertos, com esferas d'água nas mãos
            for (const sd of [-1, 1]) {
                const elbow = [sh[0] + 1.6, sd * 4.2, sh[2] - 0.8 + sway(sd * 3) * 0.3];
                const hand = [sh[0] + 3.4, sd * 6.4, sh[2] + 0.8 + sway(sd * 4, 1) * 0.6];
                limb([[sh[0], sd * 1.8, sh[2] + 0.3], elbow, hand], 1.3, C.outline);
                limb([[sh[0], sd * 1.8, sh[2] + 0.3], elbow, hand], 0.95, C.skin);
                glowAt(rig, hand, C.glow, 3.2, 0.7);
                ball(hand, 1.5, C.waterLight);
                ball([hand[0] + 0.3, hand[1], hand[2] + 0.4], 0.8, C.foam);
            }
        }
    });
    items.push({
        depth: project(...head).depth + 0.2,
        draw() {
            // Cabelo: fitas de água que descem e fluem para trás
            for (let i = 0; i < S.hairStrands; i++) {
                const a = (i / (S.hairStrands - 1) - 0.5) * 3.2;
                const pts = [];
                for (let j = 0; j <= 5; j++) {
                    const k = j / 5;
                    pts.push([head[0] - 0.8 - k * 3.2, head[1] + a * (1.6 + k * 3.4) + Math.sin(t * S.swayHz * TAU - k * 3 + i) * 1.2 * k, head[2] + 0.4 - k * 4.8]);
                }
                limb(pts, 1.5, C.outline);
                limb(pts, 1.1, i % 2 ? C.hair : C.hairLight);
            }
            ball(head, 2.1 + 0.3, C.outline);
            ball(head, 2.1, C.skin);
            // Cabelo loiro na cabeça toda: calota no alto e atrás, madeixas caindo dos dois lados do rosto e franja na testa (o rosto fica à mostra)
            ball([head[0] - 0.35, head[1], head[2] + 0.55], 2.35 + 0.3, C.outline);
            ball([head[0] - 0.35, head[1], head[2] + 0.55], 2.35, C.hair);
            ball([head[0] - 0.1, head[1], head[2] + 1.15], 1.7, C.hairLight);
            for (const sd of [-1, 1]) {
                ball([head[0] - 0.3, head[1] + sd * 1.75, head[2] - 0.1], 1.1, C.hair);
                limb([[head[0] - 0.1, head[1] + sd * 1.7, head[2] + 0.4], [head[0] + 0.3, head[1] + sd * 1.95, head[2] - 1.4], [head[0] - 0.4, head[1] + sd * 2.1, head[2] - 3.2 + Math.sin(t * S.swayHz * TAU + sd) * 0.4]], 0.9, C.hair);
            }
            for (let b = -2; b <= 2; b++) limb([[head[0] + 0.1, head[1] + b * 0.55, head[2] + 1.75], [head[0] + 1.55, head[1] + b * 0.8, head[2] + 1.05 - Math.abs(b) * 0.15]], 0.6, b % 2 ? C.hairLight : C.hair);
            // Rosto: olhos brancos brilhantes e uma boca fina
            for (const sd of [-1, 1]) {
                const e = [head[0] + 1.75, head[1] + sd * 0.8, head[2] + 0.25];
                glowAt(rig, e, C.eyeGlow, 1.6, 0.9);
                ball(e, 0.45, C.eye);
            }
            limb([[head[0] + 1.95, head[1] - 0.45, head[2] - 0.75], [head[0] + 2.0, head[1] + 0.45, head[2] - 0.75]], 0.18, C.outline);
            // Coroa de juncos com lírios
            for (let i = 0; i < 5; i++) {
                const a = (i / 4 - 0.5) * 2.6;
                const base = [head[0] - 0.2, head[1] + Math.sin(a) * 1.7, head[2] + 1.7];
                const tip = [head[0] - 0.4 + Math.cos(a) * 0.3, head[1] + Math.sin(a) * 2.7, head[2] + 4.2 + (i % 2) * 1.0];
                limb([base, tip], 0.45, C.reed);
                ball(tip, 0.45, C.reedLight);
            }
            for (const sd of [-1, 1]) {
                const l = [head[0] + 0.4, head[1] + sd * 2.0, head[2] + 1.5];
                for (let p = 0; p < 5; p++) ball([l[0] + Math.cos(p * 1.26) * 0.7, l[1] + Math.sin(p * 1.26) * 0.7, l[2]], 0.5, C.lily);
                ball(l, 0.45, C.lilyCore);
            }
        }
    });

    // Esferas d'água em órbita à altura do peito
    for (let i = 0; i < S.orbs; i++) {
        const a = t * S.swayHz * TAU + (i / S.orbs) * TAU;
        const p = [Math.cos(a) * 8.5, Math.sin(a) * 8.5, topZ - 2 + Math.sin(a * 2) * 1.2];
        items.push({
            depth: project(...p).depth,
            draw() {
                glowAt(rig, p, C.glow, 3, 0.6);
                ball(p, 1.25 + 0.25, C.outline);
                ball(p, 1.25, C.water);
                ball([p[0] + 0.3, p[1], p[2] + 0.4], 0.5, C.foam);
            }
        });
    }
    return items;
}

registerCreature('river_spirit', S, parts);

export function renderRiverSpirit25D(e) {
    renderMonster25D(e, 'river_spirit', S);
}
