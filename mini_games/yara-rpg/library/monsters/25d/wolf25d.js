// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/wolf25d.js e rode o sync.
import { poly, glowAt, facesCamera } from './creature25d.js';
import { mix } from '../../characters/hunter/kit25d.js';

// --- LOBO 2.5D (corpo comum dos quadrúpedes) ---
// Monta um lobo em 3D simples: tronco da garupa ao peito, pescoço, cabeça de focinho comprido com a boca aberta e
// presas, orelhas, quatro patas em galope (o par da frente em oposição ao de trás) e a cauda. O corpo sobe e desce
// com o galope. Cada lobo (shadow_wolf, zombie_wolf) passa as suas medidas e acrescenta o que é só dele pelos ganchos.
// S: medidas (bodyLength, bodyWidth, hipHeight, shoulderHeight, neckLength, headHeight, headRadius, snoutLength,
//    snoutWidth, mouthOpen, earLength, legWidth, legSpread, stride, footLift, bounce, eyeGlow) e colors
//    (fur, furDark, ink, fang, eye, eyeGlow; mouth ou gum).
// hooks (todos opcionais): body(rig, f), neck(rig, f), head(rig, f), tail(rig, f) → desenham por cima daquela peça;
//    paw(rig, paw, front, side) → por cima de cada pata (garras, pelos); paw é o ponto do pé;
//    ears: false esconde as orelhas padrão. f é o esqueleto do quadro: { hip, sh, head, snout, g, run, t }.
export function wolfFrame(pose, rig, S) {
    const g = rig.anim.stride;
    const run = pose.run;
    const bounce = Math.sin(g * 2) * S.bounce * run;
    const hip = [-S.bodyLength / 2, 0, S.hipHeight + bounce];
    const sh = [S.bodyLength / 2, 0, S.shoulderHeight - bounce * 0.6];
    const head = [sh[0] + S.neckLength, 0, S.headHeight - bounce * 0.3 + Math.sin(pose.t * 1.3) * 0.2];
    const snout = [head[0] + S.snoutLength, 0, head[2] - S.snoutLength * 0.28];
    return { hip, sh, head, snout, g, run, t: pose.t };
}

function leg(rig, S, f, side, front, hooks) {
    const { C, limb, ball } = rig;
    const phase = f.g + (front ? 0 : Math.PI) + (side > 0 ? 0 : 0.6);
    const top = front ? [f.sh[0] - 0.4, side * S.legSpread, f.sh[2] - 0.8] : [f.hip[0] + 0.5, side * S.legSpread, f.hip[2] - 0.6];
    const reach = Math.sin(phase) * S.stride * (0.12 + f.run);
    const lift = Math.max(0, Math.cos(phase)) * S.footLift * (0.15 + f.run);
    const paw = [top[0] + reach + (front ? 0.3 : -0.6), side * S.legSpread * 1.05, 0.5 + lift];
    // Pata da frente: cotovelo para trás. Pata de trás: joelho à frente e jarrete para trás
    const pts = front
        ? [top, [(top[0] + paw[0]) / 2 - 0.7, top[1], (top[2] + paw[2]) / 2 + 0.3], paw]
        : [top, [top[0] + 1.3, top[1], top[2] * 0.62 + lift * 0.4], [paw[0] - 1.3, paw[1], paw[2] + top[2] * 0.3], paw];
    return {
        depth: rig.project(...pts[1]).depth,
        draw() {
            limb(pts, S.legWidth + 0.5, C.ink);
            limb(pts, S.legWidth, C.furDark);
            ball(paw, S.legWidth * 0.62, C.furDark);
            limb([paw, [paw[0] + S.legWidth * 0.7, paw[1], paw[2] - 0.1]], S.legWidth * 0.9, C.furDark);
            hooks.paw?.(rig, paw, front, side);
        }
    };
}

export function wolfParts(pose, rig, S, hooks = {}) {
    const { C, project, limb, ball } = rig;
    const f = wolfFrame(pose, rig, S);
    const mouth = C.mouth ?? C.gum;
    const parts = [];
    for (const front of [true, false]) for (const side of [-1, 1]) parts.push(leg(rig, S, f, side, front, hooks));

    // Cauda (atrás de tudo quando ele vem de frente)
    parts.push({
        depth: project(f.hip[0] - 3, 0, f.hip[2]).depth,
        draw() {
            if (hooks.tail) hooks.tail(rig, f);
            else limb([f.hip, [f.hip[0] - 3, 0, f.hip[2] + 0.5], [f.hip[0] - 6, 0, f.hip[2] - 1.5]], S.bodyWidth * 0.35, C.furDark);
        }
    });

    // Tronco: garupa, barriga e peito numa peça só
    parts.push({
        depth: project(0, 0, (f.hip[2] + f.sh[2]) / 2).depth,
        draw() {
            limb([f.hip, f.sh], S.bodyWidth + 0.6, C.ink);
            ball(f.sh, S.bodyWidth * 0.6 + 0.3, C.ink);
            limb([f.hip, f.sh], S.bodyWidth, C.fur);
            ball(f.sh, S.bodyWidth * 0.6, C.fur);
            ball([f.hip[0] - 0.2, 0, f.hip[2] - 0.2], S.bodyWidth * 0.5, C.furDark);
            hooks.body?.(rig, f);
        }
    });

    // Pescoço e cabeça
    parts.push({
        depth: project(...f.head).depth + 0.3,
        draw() {
            const R = S.headRadius;
            limb([[f.sh[0] + 0.5, 0, f.sh[2] + 0.6], f.head], S.bodyWidth * 0.72 + 0.6, C.ink);
            limb([[f.sh[0] + 0.5, 0, f.sh[2] + 0.6], f.head], S.bodyWidth * 0.72, C.fur);
            hooks.neck?.(rig, f);
            // Mandíbula aberta: o vermelho da boca entre o focinho e o queixo, com as presas
            const jawTip = [f.snout[0] - 0.6, 0, f.snout[2] - S.mouthOpen];
            const jawRoot = [f.head[0] + R * 0.3, 0, f.head[2] - R * 0.55];
            limb([jawRoot, jawTip], S.snoutWidth * 0.75 + 0.5, C.ink);
            limb([jawRoot, jawTip], S.snoutWidth * 0.75, C.furDark);
            limb([mix(jawRoot, jawTip, 0.35), mix(f.head, f.snout, 0.8).map((v, i) => (i === 2 ? v - S.mouthOpen * 0.5 : v))], S.snoutWidth * 0.5, mouth);
            // Orelhas em pé
            if (hooks.ears !== false) {
                for (const side of [-1, 1]) {
                    const base = [f.head[0] - R * 0.5, side * R * 0.35, f.head[2] + R * 0.6];
                    const tip = [f.head[0] - R * 0.9, side * R * 0.95, f.head[2] + R * 0.6 + S.earLength];
                    const front = [f.head[0] + R * 0.2, side * R * 0.8, f.head[2] + R * 0.55];
                    poly(rig, [base, tip, front], C.fur, C.ink, 0.35);
                }
            }
            // Crânio e focinho comprido, afinando
            ball(f.head, R + 0.3, C.ink);
            limb([f.head, f.snout], S.snoutWidth + 0.5, C.ink);
            ball(f.head, R, C.fur);
            limb([f.head, mix(f.head, f.snout, 0.6)], S.snoutWidth * 1.15, C.fur);
            limb([mix(f.head, f.snout, 0.5), f.snout], S.snoutWidth, C.fur);
            ball([f.snout[0] + 0.15, 0, f.snout[2] + 0.2], S.snoutWidth * 0.3, C.nose ?? C.ink);
            // Presas: as de cima descem do focinho, as de baixo sobem do queixo
            for (const side of [-1, 1]) {
                const up = [f.snout[0] - 0.7, side * S.snoutWidth * 0.36, f.snout[2] - S.snoutWidth * 0.4];
                limb([up, [up[0], up[1], up[2] - S.mouthOpen * 0.42]], 0.28, C.fang);
                const down = [jawTip[0] - 0.2, side * S.snoutWidth * 0.3, jawTip[2] + S.snoutWidth * 0.3];
                limb([down, [down[0], down[1], down[2] + S.mouthOpen * 0.4]], 0.26, C.fang);
            }
            // Olhos brilhando
            for (const side of [-1, 1]) {
                const eye = [f.head[0] + R * 0.55, side * R * 0.62, f.head[2] + R * 0.25];
                if (!facesCamera(rig, eye, f.head, R * 0.3)) continue;
                glowAt(rig, eye, C.eyeGlow, S.eyeGlow, 0.85);
                ball(eye, R * 0.16, C.eye);
            }
            hooks.head?.(rig, f);
        }
    });
    return parts;
}
