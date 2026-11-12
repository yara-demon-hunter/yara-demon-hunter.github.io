import { pick, randomRange } from '../../core/random.js';
import { windAt } from '../scenery_kit.js';
import { registerScenery } from '../scenery.js';
import { DARK_FOREST_VISUALS as F } from './dark_forest_visual.js';

// --- CENÁRIO: FLORESTA SOMBRIA (desenho procedural, sem imagens) ---
// Só o que torna este cenário único mora aqui: o chão (clareira, luar, musgo, folhas, pedras, mato) e a grama que
// balança. Névoa, vinheta, vaga-lumes, vento e luzes vêm do kit (scenery_kit.js) e do motor (scenery.js).
// Ficha de como foi criado: art_reference/scenery.md.

function buildGrass(w, h, rand) {
    const count = Math.floor(F.grassClumpsPer100kPx * (w * h) / 100000);
    return Array.from({ length: count }, () => ({
        x: rand() * w,
        y: rand() * h,
        height: randomRange(rand, F.grassMinHeight, F.grassMaxHeight),
        phase: rand() * Math.PI * 2,
        color: Math.floor(rand() * F.grassColors.length),
        blades: Array.from({ length: F.grassBladesPerClump }, () => ({
            offset: randomRange(rand, -2.5, 2.5),
            lean: randomRange(rand, -0.35, 0.35),
            length: randomRange(rand, 0.65, 1),
            stiffness: randomRange(rand, 0.6, 1.2)
        }))
    }));
}

// Grama: quase toda parada, já pintada no chão; só alguns tufos balançam a cada quadro (drawSway)
function bakeGrass(g, w, h, rand) {
    const clumps = buildGrass(w, h, rand);
    g.lineWidth = 1.1;
    F.grassColors.forEach((color, ci) => {
        g.strokeStyle = color;
        g.beginPath();
        clumps.forEach(clump => {
            if (clump.color !== ci) return;
            clump.blades.forEach(blade => {
                const tipX = clump.x + blade.lean * clump.height;
                const tipY = clump.y - clump.height * blade.length;
                g.moveTo(clump.x + blade.offset, clump.y);
                g.quadraticCurveTo(clump.x + blade.offset, clump.y - clump.height * 0.55, tipX, tipY);
            });
        });
        g.stroke();
    });
}

// O chão, pintado uma vez. `g` já vem com a escala da resolução aplicada: desenhe em unidades do mundo.
function paintGround(g, w, h, rand) {
    const density = (w * h) / 100000;

    g.fillStyle = F.groundColor;
    g.fillRect(0, 0, w, h);

    // Clareira e luz da lua no centro
    const maxR = Math.max(w, h) * F.clearingRadiusRatio;
    const clearing = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, maxR);
    clearing.addColorStop(0, F.clearingColor);
    clearing.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = clearing;
    g.fillRect(0, 0, w, h);

    const moon = g.createRadialGradient(w * 0.45, h * 0.42, 0, w * 0.45, h * 0.42, maxR * 0.6);
    moon.addColorStop(0, F.moonlightColor);
    moon.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = moon;
    g.fillRect(0, 0, w, h);

    // Manchas de musgo
    for (let i = 0; i < F.mossPatchesPer100kPx * density; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const r = randomRange(rand, 30, 110);
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, pick(rand, F.mossColors));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = grad;
        g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Folhas caídas
    for (let i = 0; i < F.leavesPer100kPx * density; i++) {
        g.save();
        g.translate(rand() * w, rand() * h);
        g.rotate(rand() * Math.PI);
        g.fillStyle = pick(rand, F.leafColors);
        g.beginPath();
        g.ellipse(0, 0, randomRange(rand, 1.5, 3), randomRange(rand, 0.8, 1.4), 0, 0, Math.PI * 2);
        g.fill();
        g.restore();
    }

    // Pedras
    g.fillStyle = F.stoneColor;
    for (let i = 0; i < F.stonesPer100kPx * density; i++) {
        g.beginPath();
        g.ellipse(rand() * w, rand() * h, randomRange(rand, 2, 6), randomRange(rand, 1.5, 4), rand() * Math.PI, 0, Math.PI * 2);
        g.fill();
    }

    // Tufos de grama (traços curtos em leque)
    g.strokeStyle = F.grassColor;
    g.lineWidth = 1;
    for (let i = 0; i < F.grassTuftsPer100kPx * density; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const blades = 2 + Math.floor(rand() * 3);
        for (let b = 0; b < blades; b++) {
            const a = -Math.PI / 2 + randomRange(rand, -0.7, 0.7);
            const len = randomRange(rand, 2, 5);
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
            g.stroke();
        }
    }

    bakeGrass(g, w, h, rand);
}

// Os tufos que balançam a cada quadro: os primeiros da lista, na quantidade do nível de detalhe
function buildSway(w, h, rand, quality) {
    return buildGrass(w, h, rand).slice(0, F.swayingClumps[quality]);
}

// Tufos que se curvam com o vento (um único traçado)
function drawSway(ctx, t, clumps) {
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = F.grassColors[0];
    ctx.beginPath();
    for (const clump of clumps) {
        const wind = windAt(F, t, clump.x, clump.y);
        const sway = (wind * F.grassBend + Math.sin(t * 2.4 + clump.phase) * 0.8) * clump.height / F.grassMaxHeight;
        for (const blade of clump.blades) {
            const tipX = clump.x + blade.lean * clump.height + sway * blade.stiffness;
            const tipY = clump.y - clump.height * blade.length;
            ctx.moveTo(clump.x + blade.offset, clump.y);
            ctx.quadraticCurveTo(clump.x + blade.offset + sway * 0.2, clump.y - clump.height * 0.55, tipX, tipY);
        }
    }
    ctx.stroke();
}

registerScenery({ id: 'dark_forest', name: 'Floresta Sombria', visual: F, paintGround, buildSway, drawSway });
