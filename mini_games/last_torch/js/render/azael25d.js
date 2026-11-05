import { AZAEL_VISUALS as A } from '../../data_model/visuals/characters/azael_visual.js';
import { ctx } from '../core/state.js';
import { drawGlow } from './fx/glow.js';

// --- AZAEL (herói 2.5D) ---
// Peças do Azael montadas na mesma câmera e com a mesma animação do boneco de js/render/player25d.js:
// cabeça sem capuz (rosto, orelhas pontudas, olhos vermelhos, pintura de guerra), cabelo branco esvoaçante,
// bandana, katana curva, bainha na cintura, braços nus enfaixados e pés descalços de 3 dedos.
// rig: { project, projectVec, limb, ball, disk, anim, C, sinF, cosF }. Coordenadas locais: a = frente, b = direita, z = altura.

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const add = (p, d, k) => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];

// --- CABEÇA ---
// Mechas e pontas da bandana: atrás da cabeça, voam com a capa (mesma física de player.js)
export function azaelHairPart(pose, rig) {
    const { project, limb, anim, C } = rig;
    const { t, run } = pose;
    const R = A.headRadius;
    const n = A.hairStrands;
    const strands = [];
    for (let i = 0; i < n; i++) {
        const k = i / (n - 1);
        const psi = Math.PI * (0.62 + 0.76 * k);       // arco das costas da cabeça
        const jag = 0.8 + 0.25 * Math.sin(i * 2.3);
        const flutter = Math.sin(t * A.hairWaveSpeed + i * 1.7) * A.hairWave * (1 + run);
        const len = (A.hairLength + A.hairRunLength * run) * jag;
        const root = [pose.headA + R * 0.75 * Math.cos(psi), R * 0.85 * Math.sin(psi), pose.headZ + 1.1];
        const tip = [
            pose.headA - R - len * (0.3 + 0.45 * run) + anim.capeX * 0.12,
            Math.sin(psi) * (R * 1.05 + run * 0.6) + anim.capeY * 0.25 + flutter * 0.5,
            pose.headZ - len * (0.95 - 0.45 * run) + flutter * 0.4
        ];
        const mid = [(root[0] + tip[0]) / 2 - 0.4 * run, (root[1] + tip[1]) / 2 + flutter * 0.3, (root[2] + tip[2]) / 2 + 0.6];
        strands.push({ root, mid, tip });
    }
    const tails = [-1, 1].map(side => {
        const flutter = Math.sin(t * 8 + side * 1.4) * (0.8 + run * 1.4);
        const knot = [pose.headA - R * 0.95, side * 0.5, pose.headZ + 0.9];
        const tip = [
            knot[0] - A.bandanaTailLength * (0.5 + 0.6 * run) + anim.capeX * 0.2,
            side * (1.6 + run) + anim.capeY * 0.3 + flutter * 0.5,
            knot[2] - 2.6 + run * 2.2 + flutter * 0.4
        ];
        return { knot, tip, mid: [(knot[0] + tip[0]) / 2, (knot[1] + tip[1]) / 2 + flutter * 0.3, (knot[2] + tip[2]) / 2 + 0.3] };
    });
    return {
        depth: project(pose.headA - R - 1.5, 0, pose.headZ - 1).depth,
        draw() {
            for (const b of tails) limb([b.knot, b.mid, b.tip], 0.7, C.bandana);
            // Massa do cabelo: raízes no arco da cabeça, pontas soltas (de volta pelas pontas, com entalhes)
            const pts = strands.map(s => project(...s.root));
            for (let i = n - 1; i >= 0; i--) {
                pts.push(project(...strands[i].tip));
                if (i > 0) pts.push(project(...mix(mix(strands[i].mid, strands[i - 1].mid, 0.5), mix(strands[i].tip, strands[i - 1].tip, 0.5), 0.6)));
            }
            ctx.fillStyle = C.hair;
            ctx.strokeStyle = C.hairShade;
            ctx.lineWidth = 0.45;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Fios: linhas finas da raiz à ponta
            for (let i = 1; i < n - 1; i++) limb([strands[i].root, strands[i].mid, strands[i].tip], 0.3, C.hairShade);
        }
    };
}

// Rosto branco-prateado, orelhas pontudas, cabelo no alto, bandana na testa e olhos vermelhos
export function azaelHeadPart(pose, rig) {
    const { project, projectVec, limb, ball, disk, C, sinF, cosF } = rig;
    const R = A.headRadius;
    const center = [pose.headA, 0, pose.headZ];
    return {
        depth: project(...center).depth,
        draw() {
            const t = pose.t;
            const c = project(...center);
            const ry = R * 1.07;

            // Orelhas: pontas para os lados, para trás e um pouco para cima
            for (const side of [-1, 1]) {
                const base = [pose.headA - 0.2, side * R * 0.9, pose.headZ + 0.1];
                const tip = [pose.headA - 1.3, side * (R + A.earLength), pose.headZ + 1.5];
                const p0 = project(base[0] + 0.6, base[1], base[2] + 0.7);
                const p1 = project(...tip);
                const p2 = project(base[0] - 0.6, base[1], base[2] - 0.8);
                ctx.fillStyle = C.skinShade;
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.closePath();
                ctx.fill();
            }

            // Cabeça
            ctx.fillStyle = C.skin;
            ctx.strokeStyle = C.outline;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.ellipse(c.x, c.y, R, ry, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Cabelo cobrindo o alto e a parte de trás da cabeça (o rosto fica à mostra)
            ball([pose.headA - 1.5, 0, pose.headZ + 1.2], R * 0.94, C.hairShade);
            ball([pose.headA - 1.3, 0, pose.headZ + 1.6], R * 0.82, C.hair);

            // Rosto: um "ovo" na frente da cabeça, como a máscara do Caçador (de frente fica largo; de perfil,
            // estreito), para ler de cima. Some quando ele está de costas para a câmera.
            const vis = Math.max(0, Math.min(1, (sinF + 0.45) / 0.5));
            const baseAlpha = ctx.globalAlpha;
            const fc = [pose.headA + A.faceForward, 0, pose.headZ + A.faceHeightOffset];
            const f = project(...fc);
            if (vis > 0) {
                ctx.globalAlpha = baseAlpha * vis;
                const fw = Math.hypot(A.faceDepth * cosF, A.faceWidth * sinF);
                const fh = A.faceHeight * 0.62 + 0.5;
                ctx.fillStyle = C.skin;
                ctx.strokeStyle = C.outline;
                ctx.lineWidth = 0.4;
                ctx.beginPath();
                ctx.ellipse(f.x, f.y, fw, fh, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Lado do rosto na sombra do cabelo
                const back = projectVec(-1, 0, 0);
                ctx.fillStyle = C.skinShade;
                ctx.globalAlpha = baseAlpha * vis * 0.35;
                ctx.beginPath();
                ctx.ellipse(f.x + back.x * 0.6, f.y + back.y * 0.6, fw * 0.55, fh * 0.85, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = baseAlpha;
            }

            // Bandana na testa: só a metade da frente do anel aparece
            const bandC = [pose.headA + 0.5, 0, pose.headZ + 0.8];
            const band = project(...bandC);
            ctx.save();
            ctx.beginPath();
            ctx.rect(band.x - 20, band.y - 0.3, 40, 20);
            ctx.clip();
            disk(bandC, [A.faceForward + A.faceDepth - 0.4, 0, 0], [0, R * 1.04, 0]);
            ctx.strokeStyle = C.bandana;
            ctx.lineWidth = 1.3;
            ctx.stroke();
            ctx.restore();

            if (vis > 0) {
                ctx.globalAlpha = baseAlpha * vis;
                for (const side of [-1, 1]) {
                    const eye = [fc[0] + A.faceDepth * 0.75, side * 0.95, fc[2] + 0.3];
                    const e = project(...eye);
                    if (e.depth < f.depth - 0.3) continue;
                    // Pintura de guerra: traço preto descendo do olho até o queixo
                    limb([[eye[0], eye[1], eye[2] - 0.5], [eye[0] - 0.4, eye[1] * 1.08, eye[2] - 2.4]], side < 0 ? 0.5 : 0.38, C.warPaint);
                    ctx.fillStyle = C.eye;
                    ctx.beginPath();
                    ctx.ellipse(e.x, e.y, 0.25 + 0.4 * Math.abs(sinF), 0.38, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.save();
                    ctx.globalCompositeOperation = 'lighter';
                    drawGlow(ctx, C.eyeGlow, e.x, e.y, 1.6, (0.55 + 0.25 * Math.sin(t * 3 + side)) * vis);
                    ctx.restore();
                }
                ctx.globalAlpha = baseAlpha;
            }

            // Mechas da frente caindo dos dois lados do rosto
            for (const side of [-1, 1]) {
                const sway = Math.sin(t * 2.6 + side) * 0.3;
                limb([
                    [pose.headA + 0.8, side * 2.5, pose.headZ + 1.6],
                    [pose.headA + 1.3, side * 3.1, pose.headZ - 0.6],
                    [pose.headA + 0.7 + sway, side * 3.3, pose.headZ - 3.2]
                ], 0.55, C.hair);
            }
        }
    };
}

// --- KATANA ---
// Lâmina curva e fina, com cabo trançado e guarda redonda; hand = mão no cabo, dir = direção da lâmina
export function drawKatana(rig, hand, dir, alpha, color = null) {
    const { project, limb, ball, C } = rig;
    const at = (d) => add(hand, dir, d);
    const flat = Math.hypot(dir[0], dir[1]) || 1;
    const w = [-dir[1] / flat, dir[0] / flat, 0];
    const L = A.bladeLength;
    const baseAlpha = ctx.globalAlpha;
    ctx.globalAlpha = baseAlpha * alpha;

    if (!color) {
        limb([at(-3.2), at(0.3)], 1.1, C.hilt);
        ball(at(0.7), 0.85, C.tsuba);
    }

    // Costas e fio: a lâmina curva para o lado das costas e afina na ponta
    const spine = [];
    const edge = [];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
        const k = i / steps;
        const p = at(1 + (L - 1) * k);
        const bend = A.bladeCurve * k * k;
        const half = A.bladeWidth / 2 * (1 - 0.45 * k);
        spine.push(project(p[0] - w[0] * (bend + half), p[1] - w[1] * (bend + half), p[2]));
        edge.push(project(p[0] - w[0] * (bend - half), p[1] - w[1] * (bend - half), p[2]));
    }
    const tipPt = add(at(L + 0.8), w, -A.bladeCurve * 1.3);
    const tip = project(...tipPt);
    ctx.fillStyle = color ?? C.blade;
    ctx.beginPath();
    spine.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.lineTo(tip.x, tip.y);
    for (let i = steps; i >= 0; i--) ctx.lineTo(edge[i].x, edge[i].y);
    ctx.closePath();
    ctx.fill();

    if (!color) {
        ctx.strokeStyle = C.bladeCore;
        ctx.lineWidth = 0.35;
        ctx.beginPath();
        edge.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();
    }
    ctx.globalAlpha = baseAlpha;
}

// Boca da bainha e mão no cabo (com a katana guardada), acompanhando o quadril
export function scabbardFrame(pose) {
    const m = A.scabbardMouth;
    const mouth = [m[0] + pose.lean * 0.3, m[1], m[2] - pose.crouch];
    return { mouth, grip: add(mouth, A.scabbardDir, -A.hiltLength * 0.55), dir: A.scabbardDir };
}

// Bainha preta na cintura; com a katana guardada, o cabo e a guarda saem da boca
export function azaelScabbardPart(pose, rig, sheathed) {
    const { project, limb, ball, C } = rig;
    const { mouth, dir } = scabbardFrame(pose);
    const end = add(mouth, dir, A.scabbardLength);
    return {
        depth: project(...add(mouth, dir, A.scabbardLength * 0.4)).depth - 0.2,
        draw() {
            limb([mouth, end], 1.5, C.scabbard);
            limb([add(mouth, dir, 0.4), add(mouth, dir, 1.4)], 1.7, C.bandageLine);
            if (sheathed) {
                ball(add(mouth, dir, -0.3), 0.85, C.tsuba);
                limb([add(mouth, dir, -0.7), add(mouth, dir, -A.hiltLength)], 1.1, C.hilt);
            }
        }
    };
}

// --- BRAÇOS E PERNAS ---
// Braço nu, com faixas no bíceps e no antebraço e garras na mão
export function drawAzaelArm(rig, shoulder, elbow, hand, armWidth, handRadius) {
    const { limb, ball, C } = rig;
    ball(shoulder, 2, C.skin);
    limb([shoulder, elbow, hand], armWidth, C.skin);
    limb([mix(shoulder, elbow, 0.45), mix(shoulder, elbow, 0.68)], armWidth + 0.25, C.bandage);
    limb([mix(elbow, hand, 0.2), mix(elbow, hand, 0.92)], armWidth + 0.2, C.bandage);
    limb([mix(elbow, hand, 0.45), mix(elbow, hand, 0.5)], armWidth + 0.25, C.bandageLine);
    ball(hand, handRadius, C.skin);
    const d = [hand[0] - elbow[0], hand[1] - elbow[1], hand[2] - elbow[2]];
    const len = Math.hypot(...d) || 1;
    limb([add(hand, d, 0.8 / len), add(hand, d, 1.7 / len)], 0.5, C.claw);
}

// Perna: calça larga, faixas na canela e pé descalço de 3 dedos (2 para a frente, 1 para trás) com garras
export function drawAzaelLeg(rig, hip, knee, ankle, footBase) {
    const { limb, ball, C } = rig;
    limb([hip, knee, ankle], A.legWidth, C.body);
    limb([[ankle[0], ankle[1], ankle[2] + 2.6], ankle], A.legWidth * 0.78, C.bandage);
    limb([[ankle[0], ankle[1], ankle[2] + 1.2], [ankle[0], ankle[1], ankle[2] + 1.5]], A.legWidth * 0.8, C.bandageLine);
    const [a, b, z] = footBase;
    limb([ankle, footBase], 1.6, C.skin);
    ball(footBase, 1.1, C.skin);
    for (const s of [-1, 1]) {
        const tip = [a + A.toeLength, b + s * A.toeSpread, z - 0.45];
        limb([[a + 0.3, b + s * 0.35, z], tip], 0.9, C.skin);
        limb([tip, [tip[0] + A.clawLength, tip[1], tip[2] - 0.2]], 0.55, C.claw);
    }
    const heel = [a - A.heelToeLength, b, z - 0.4];
    limb([[a - 0.2, b, z + 0.1], heel], 0.8, C.skin);
    limb([heel, [heel[0] - A.clawLength * 0.8, b, heel[2] - 0.2]], 0.5, C.claw);
}

// --- TRONCO ---
// Peito nu, calça e faixa (obi) na cintura, cachecol volumoso no pescoço e uma faixa de pano cruzando o peito
export function drawAzaelTorso(rig, pose, bottom, top, wb, wt) {
    const { project, limb, disk, C, sinF } = rig;
    const pb = project(bottom.a, 0, bottom.z);
    const pt = project(top.a, 0, top.z);

    ctx.fillStyle = C.body;
    disk([bottom.a, 0, bottom.z], [bottom.A * 1.1, 0, 0], [0, bottom.B * 1.1, 0]);
    ctx.fill();

    ctx.fillStyle = C.skin;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(pb.x - wb, pb.y);
    ctx.lineTo(pt.x - wt, pt.y);
    ctx.lineTo(pt.x + wt, pt.y);
    ctx.lineTo(pb.x + wb, pb.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Músculos do abdômen: só de frente para a câmera
    const front = Math.max(0, Math.min(1, sinF * 1.5 + 0.4));
    if (front > 0) {
        const baseAlpha = ctx.globalAlpha;
        ctx.globalAlpha = baseAlpha * front * 0.7;
        const fa = (z) => bottom.a + (top.a - bottom.a) * ((z - bottom.z) / (top.z - bottom.z)) + 2.6;
        limb([[fa(bottom.z + 1.5), 0, bottom.z + 1.5], [fa(top.z - 2), 0, top.z - 2]], 0.3, C.skinShade);
        for (const z of [bottom.z + 2.2, bottom.z + 3.6]) limb([[fa(z), -1.4, z], [fa(z), 1.4, z]], 0.3, C.skinShade);
        ctx.globalAlpha = baseAlpha;
    }

    // Faixa (obi): só a metade da frente do anel aparece
    const sash = project(bottom.a, 0, pose.sashZ);
    ctx.save();
    ctx.beginPath();
    ctx.rect(sash.x - 20, sash.y, 40, 20);
    ctx.clip();
    disk([bottom.a, 0, pose.sashZ], [bottom.A * 1.1, 0, 0], [0, bottom.B * 1.1, 0]);
    ctx.strokeStyle = C.sash;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = C.skinLight;
    disk([top.a, 0, top.z], [top.A * 0.95, 0, 0], [0, top.B * 0.95, 0]);
    ctx.fill();

    // Pano cruzando o peito (do ombro direito ao lado esquerdo da cintura)
    if (front > 0) {
        const baseAlpha = ctx.globalAlpha;
        ctx.globalAlpha = baseAlpha * front;
        limb([[top.a + top.A * 0.8, top.B * 0.6, top.z - 0.3], [bottom.a + bottom.A * 0.9, -bottom.B * 0.7, pose.sashZ + 1]], 1.6, C.cape);
        ctx.globalAlpha = baseAlpha;
    }

    // Cachecol volumoso no pescoço
    ctx.fillStyle = C.capeFold;
    disk([top.a, 0, top.z + 0.5], [top.A * 0.95, 0, 0], [0, top.B * 0.72, 0]);
    ctx.fill();
    ctx.fillStyle = C.cape;
    disk([top.a + 0.2, 0, top.z + 1.1], [top.A * 0.8, 0, 0], [0, top.B * 0.6, 0]);
    ctx.fill();
}
