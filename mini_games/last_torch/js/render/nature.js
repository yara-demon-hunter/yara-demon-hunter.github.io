import { POWER_MODELS } from '../../data_model/powers.js';
import { ctx, player, state } from '../core/state.js';
import { drawGlow } from '../../library/core/glow.js';
import { makeCanvas } from './fx/sprites.js';
import { resetWorldView, stamp } from './fx/stamp.js';
import { getMonsterSprite, spriteFrame } from './monster_sprites.js';

// --- DESENHO DAS SKILLS DA NATUREZA (js/systems/skills_nature.js) ---
// Raízes, carvalho e cogumelo são sprites montados uma vez (na primeira vez que aparecem) e depois só copiados:
// em campo cada um custa um drawImage. Nuvens são poucos brilhos prontos; as videiras, uma curva por alvo (no máximo 4).
// Nada disto esconde a ação: a copa do carvalho fica translúcida quando o herói está debaixo dela.
const PX = 2;                       // pixels do sprite por unidade do mundo
const N = state.nature;
const TAU = Math.PI * 2;
const OAK_TRANSITION_SECONDS = 0.45;

function oakScale(oak) {
    const base = oak.stage === 'adult'
        ? Math.min(1, oak.age / POWER_MODELS.shelterOak.growSeconds)
        : oak.stage === 'young' ? 0.48 : 0.2;
    const pop = oak.transition > 0 ? 0.8 + 0.35 * (1 - oak.transition / OAK_TRANSITION_SECONDS) : 1;
    return base * pop;
}

function renderHealingRing(oak, t) {
    if (oak.stage === 'adult') return;
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1.8;
    const segments = 32;
    for (let i = 0; i < segments; i += 2) {
        const start = (i / segments) * TAU + t * 0.04;
        const end = ((i + 1) / segments) * TAU + t * 0.04;
        ctx.beginPath();
        ctx.arc(oak.x, oak.y, oak.healRadius, start, end);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

// --- SPRITES ---
let rootSprite = null;
const ROOT_W = 44;
const ROOT_H = 30;
function getRoots() {
    if (rootSprite) return rootSprite;
    rootSprite = makeCanvas(ROOT_W * PX, ROOT_H * PX, (g) => {
        g.scale(PX, PX);
        g.translate(ROOT_W / 2, ROOT_H * 0.62);
        g.lineCap = 'round';
        // Laços de raiz subindo do chão e fechando em volta dos pés
        const tendrils = [[-17, 0.9, 13], [-9, 1.25, 17], [0, 1.57, 14], [9, 1.9, 17], [17, 2.25, 13], [-13, 1.1, 9], [13, 2.05, 9]];
        for (const [x, lean, h] of tendrils) {
            const tx = x - Math.cos(lean) * h * 0.55;
            const ty = -Math.sin(lean) * h;
            for (const [color, width] of [['#1c1208', 4.2], ['#5b3a1a', 2.8], ['#8a5a2b', 1.1]]) {
                g.strokeStyle = color;
                g.lineWidth = width;
                g.beginPath();
                g.moveTo(x, 4);
                g.quadraticCurveTo(x * 1.25, ty * 0.5, tx * 0.45, ty);
                g.stroke();
            }
            // Folha na ponta
            g.fillStyle = '#4ade80';
            g.beginPath();
            g.ellipse(tx * 0.45, ty - 1, 2.1, 1.2, lean, 0, TAU);
            g.fill();
        }
        g.fillStyle = 'rgba(8, 20, 10, 0.5)';
        g.beginPath();
        g.ellipse(0, 5, 19, 5, 0, 0, TAU);
        g.fill();
    });
    return rootSprite;
}

// Carvalho: tronco e copa em sprites separados (a copa muda de transparência)
const TRUNK_W = 34;
const TRUNK_H = 58;
const CROWN_W = 104;
const CROWN_H = 80;
let trunkSprite = null;
let crownSprite = null;
function getTrunk() {
    if (trunkSprite) return trunkSprite;
    trunkSprite = makeCanvas(TRUNK_W * PX, TRUNK_H * PX, (g) => {
        g.scale(PX, PX);
        g.translate(TRUNK_W / 2, TRUNK_H - 5);
        // Raízes na base
        g.fillStyle = '#2f1d0e';
        g.beginPath();
        g.moveTo(-15, 3);
        g.quadraticCurveTo(-8, -3, -6, -9);
        g.lineTo(6, -9);
        g.quadraticCurveTo(8, -3, 15, 3);
        g.quadraticCurveTo(0, 6, -15, 3);
        g.fill();
        // Tronco afinando para cima
        g.fillStyle = '#4a2f17';
        g.beginPath();
        g.moveTo(-7, 0);
        g.quadraticCurveTo(-5, -26, -6, -50);
        g.lineTo(6, -50);
        g.quadraticCurveTo(5, -26, 7, 0);
        g.closePath();
        g.fill();
        // Luz de um lado, sombra do outro, veios da casca
        g.fillStyle = '#6b4423';
        g.beginPath();
        g.moveTo(-6, -2);
        g.quadraticCurveTo(-4.4, -26, -5.2, -50);
        g.lineTo(-1.5, -50);
        g.quadraticCurveTo(-1, -26, -2, -2);
        g.closePath();
        g.fill();
        g.strokeStyle = '#2f1d0e';
        g.lineWidth = 0.9;
        for (const x of [-2.5, 1.2, 3.8]) {
            g.beginPath();
            g.moveTo(x, -4);
            g.quadraticCurveTo(x + 1.2, -24, x - 0.4, -46);
            g.stroke();
        }
        // Galhos abrindo para a copa
        g.strokeStyle = '#4a2f17';
        g.lineWidth = 3.2;
        g.lineCap = 'round';
        for (const [dx, dy] of [[-13, -9], [12, -8]]) {
            g.beginPath();
            g.moveTo(dx * 0.2, -40);
            g.lineTo(dx, -42 + dy);
            g.stroke();
        }
    });
    return trunkSprite;
}
function getCrown() {
    if (crownSprite) return crownSprite;
    crownSprite = makeCanvas(CROWN_W * PX, CROWN_H * PX, (g) => {
        g.scale(PX, PX);
        g.translate(CROWN_W / 2, CROWN_H / 2);
        // Massas de folha: escuras embaixo, claras em cima (posições fixas: a árvore é sempre a mesma)
        const blobs = [
            [-28, 10, 20, '#14532d'], [26, 12, 19, '#14532d'], [0, 16, 22, '#14532d'], [-14, -2, 23, '#166534'], [16, -1, 22, '#166534'],
            [-30, -6, 15, '#166534'], [32, -4, 14, '#15803d'], [0, -12, 24, '#15803d'], [-16, -18, 16, '#16a34a'], [14, -19, 15, '#16a34a'],
            [0, -24, 13, '#22c55e']
        ];
        for (const [x, y, r, color] of blobs) {
            g.fillStyle = color;
            g.beginPath();
            g.ellipse(x, y, r, r * 0.82, 0, 0, TAU);
            g.fill();
        }
        // Pontos de luz nas folhas
        g.fillStyle = 'rgba(187, 247, 208, 0.5)';
        for (const [x, y] of [[-20, -22], [-6, -30], [10, -26], [22, -14], [-32, -10], [2, -14], [-12, -8]]) {
            g.beginPath();
            g.ellipse(x, y, 2.6, 1.5, -0.5, 0, TAU);
            g.fill();
        }
    });
    return crownSprite;
}

// Carvalho acordado: a mesma silhueta, escura e roxa, com rosto no tronco e garras nos galhos
let evilTrunkSprite = null;
let evilCrownSprite = null;
function getEvilTrunk() {
    if (evilTrunkSprite) return evilTrunkSprite;
    evilTrunkSprite = makeCanvas(TRUNK_W * PX, TRUNK_H * PX, (g) => {
        g.scale(PX, PX);
        g.drawImage(getTrunk(), 0, 0, TRUNK_W, TRUNK_H);
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = 'rgba(30, 6, 40, 0.55)';
        g.fillRect(0, 0, TRUNK_W, TRUNK_H);
        g.globalCompositeOperation = 'source-over';
        g.translate(TRUNK_W / 2, TRUNK_H - 5);
        // Rosto: olhos vermelhos tortos e uma boca de dentes
        g.fillStyle = '#0a0410';
        g.beginPath();
        g.ellipse(-2.4, -32, 2.1, 1.3, -0.45, 0, TAU);
        g.ellipse(2.4, -32, 2.1, 1.3, 0.45, 0, TAU);
        g.fill();
        g.fillStyle = '#ef4444';
        g.beginPath();
        g.ellipse(-2.4, -32, 1.2, 0.7, -0.45, 0, TAU);
        g.ellipse(2.4, -32, 1.2, 0.7, 0.45, 0, TAU);
        g.fill();
        g.fillStyle = '#0a0410';
        g.beginPath();
        g.moveTo(-3.4, -27.6);
        g.quadraticCurveTo(0, -23.4, 3.4, -27.6);
        g.quadraticCurveTo(0, -26.2, -3.4, -27.6);
        g.fill();
        g.fillStyle = '#fef3c7';
        for (const x of [-2, -0.6, 0.8, 2.2]) {
            g.beginPath();
            g.moveTo(x - 0.45, -27);
            g.lineTo(x, -25.4);
            g.lineTo(x + 0.45, -27);
            g.fill();
        }
        // Galhos em garra
        g.strokeStyle = '#1b0f26';
        g.lineWidth = 1.4;
        g.lineCap = 'round';
        for (const side of [-1, 1]) {
            g.beginPath();
            g.moveTo(side * 5, -34);
            g.quadraticCurveTo(side * 12, -30, side * 14, -22);
            g.stroke();
            for (const d of [-0.5, 0.1, 0.7]) {
                g.beginPath();
                g.moveTo(side * 14, -22);
                g.lineTo(side * (14 + Math.cos(d + (side < 0 ? 2.4 : 0.1)) * 3.2), -22 + Math.sin(d + 0.9) * 3.2);
                g.stroke();
            }
        }
    });
    return evilTrunkSprite;
}
function getEvilCrown() {
    if (evilCrownSprite) return evilCrownSprite;
    evilCrownSprite = makeCanvas(CROWN_W * PX, CROWN_H * PX, (g) => {
        g.scale(PX, PX);
        g.drawImage(getCrown(), 0, 0, CROWN_W, CROWN_H);
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = 'rgba(46, 16, 70, 0.62)';
        g.fillRect(0, 0, CROWN_W, CROWN_H);
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = 'rgba(239, 68, 68, 0.55)';
        for (const [x, y] of [[-22, -6], [18, -10], [-4, -22], [30, 4], [-32, 8]]) {
            g.beginPath();
            g.arc(CROWN_W / 2 + x, CROWN_H / 2 + y, 1.2, 0, TAU);
            g.fill();
        }
    });
    return evilCrownSprite;
}

// Arbusto: massa de folhas baixa e redonda, com frutinhas
const BUSH_W = 64;
const BUSH_H = 44;
let bushSprite = null;
function getBush() {
    if (bushSprite) return bushSprite;
    bushSprite = makeCanvas(BUSH_W * PX, BUSH_H * PX, (g) => {
        g.scale(PX, PX);
        g.translate(BUSH_W / 2, BUSH_H * 0.62);
        g.fillStyle = 'rgba(8, 20, 10, 0.4)';
        g.beginPath();
        g.ellipse(0, 7, 27, 6, 0, 0, TAU);
        g.fill();
        const blobs = [
            [-17, 0, 11, '#14532d'], [17, 1, 11, '#14532d'], [0, 3, 13, '#14532d'], [-9, -7, 12, '#166534'], [10, -7, 12, '#166534'],
            [0, -12, 12, '#15803d'], [-18, -6, 8, '#16a34a'], [19, -5, 8, '#16a34a'], [-5, -16, 7, '#22c55e'], [7, -15, 6, '#4ade80']
        ];
        for (const [x, y, r, color] of blobs) {
            g.fillStyle = color;
            g.beginPath();
            g.ellipse(x, y, r, r * 0.8, 0, 0, TAU);
            g.fill();
        }
        g.fillStyle = 'rgba(187, 247, 208, 0.45)';
        for (const [x, y] of [[-14, -12], [4, -20], [-4, -6], [14, -10], [-20, -2]]) {
            g.beginPath();
            g.ellipse(x, y, 2.6, 1.4, -0.5, 0, TAU);
            g.fill();
        }
        g.fillStyle = '#ef4444';
        for (const [x, y] of [[-10, -4], [8, -3], [-1, -11], [15, 0]]) {
            g.beginPath();
            g.arc(x, y, 1.15, 0, TAU);
            g.fill();
        }
    });
    return bushSprite;
}

// Cogumelo de esporos: chapéu verde-limão com pintas
const POD = 22;
let podSprite = null;
function getPod() {
    if (podSprite) return podSprite;
    podSprite = makeCanvas(POD * PX, POD * PX, (g) => {
        g.scale(PX, PX);
        g.translate(POD / 2, POD * 0.78);
        g.fillStyle = 'rgba(8, 20, 10, 0.45)';
        g.beginPath();
        g.ellipse(0, 1.5, 7, 2.4, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#e7e5c4';
        g.beginPath();
        g.moveTo(-2.4, 1);
        g.quadraticCurveTo(-1.6, -5, -2, -8);
        g.lineTo(2, -8);
        g.quadraticCurveTo(1.6, -5, 2.4, 1);
        g.closePath();
        g.fill();
        g.fillStyle = '#4d7c0f';
        g.beginPath();
        g.ellipse(0, -8, 8.2, 3, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#84cc16';
        g.beginPath();
        g.moveTo(-8.2, -8);
        g.quadraticCurveTo(-7, -17, 0, -17.5);
        g.quadraticCurveTo(7, -17, 8.2, -8);
        g.closePath();
        g.fill();
        g.fillStyle = '#ecfccb';
        for (const [x, y, r] of [[-3.5, -12, 1.5], [2.6, -13.6, 1.2], [4.4, -10, 0.9], [-0.4, -15.4, 0.8]]) {
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.fill();
        }
    });
    return podSprite;
}

// --- CHÃO: sombra do carvalho, cogumelos e nuvens (antes dos monstros) ---
export function renderNatureGround() {
    if (N.oaks.length === 0 && N.pods.length === 0 && N.clouds.length === 0) return;
    const t = performance.now() / 1000;
    for (const oak of N.oaks) {
        const grow = oakScale(oak);
        const fade = oak.stage === 'adult' ? Math.min(1, (oak.seconds - oak.age) / 0.8) : 1;
        renderHealingRing(oak, t);
        // Dormindo: só uma sombra. Acordada: o alcance dos galhos, em vermelho
        ctx.globalAlpha = (0.14 + 0.1 * oak.awake) * grow * fade;
        ctx.fillStyle = oak.awake > 0.5 ? '#3b0764' : '#052e16';
        ctx.beginPath();
        ctx.ellipse(oak.x, oak.y, oak.reach * (0.3 + 0.7 * oak.awake) * grow, oak.reach * (0.3 + 0.7 * oak.awake) * 0.75 * grow, 0, 0, TAU);
        ctx.fill();
        if (oak.awake > 0.3) {
            ctx.globalAlpha = 0.55 * oak.awake * fade;
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.ellipse(oak.x, oak.y, oak.reach, oak.reach * 0.75, 0, 0, TAU);
            ctx.stroke();
        }
    }
    ctx.globalAlpha = 1;
    if (N.pods.length > 0) {
        const pod = getPod();
        const arm = POWER_MODELS.sporePods.armSeconds;
        for (const p of N.pods) {
            const k = Math.min(1, p.age / arm);
            const size = POD * (0.35 + 0.65 * k) * (1 + 0.05 * Math.sin(t * 3 + p.seed));
            if (k >= 1) drawGlow(ctx, 'rgba(163, 230, 53, 0.55)', p.x, p.y - 8, 15, 0.4 + 0.2 * Math.sin(t * 2.4 + p.seed));
            ctx.drawImage(pod, p.x - size / 2, p.y - size * 0.78, size, size);
        }
    }
    for (const c of N.clouds) {
        const p = c.age / c.seconds;
        const fade = Math.min(1, c.age / 0.2) * (1 - p * p) * 0.55;
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * TAU + c.seed + t * 0.3;
            const d = c.radius * 0.38;
            drawGlow(ctx, i % 2 ? 'rgba(132, 204, 22, 0.8)' : 'rgba(54, 83, 20, 0.85)', c.x + Math.cos(a) * d, c.y + Math.sin(a) * d * 0.8, c.radius * (0.7 + 0.1 * Math.sin(t * 1.3 + i)), fade);
        }
    }
}

// --- RAÍZES NOS PÉS DOS MONSTROS PRESOS (depois dos monstros) ---
export function renderRoots() {
    let sprite = null;
    for (const e of state.enemies) {
        if (!(e.rooted > 0)) continue;
        sprite ??= getRoots();
        const grow = Math.min(1, ((e.rootMax ?? e.rooted) - e.rooted) / 0.15 + 0.35) * Math.min(1, e.rooted / 0.2);
        const w = Math.max(26, e.radius * 2.7) * grow;
        const h = w * (ROOT_H / ROOT_W);
        ctx.drawImage(sprite, e.x - w / 2, e.y + e.radius * 0.55 - h * 0.62, w, h);
    }
}

// --- LOBOS ESPIRITUAIS ---
// O mesmo sprite do Shadow Wolf (já montado para a partida), com brilho verde de aliado. Na corrida ele alonga, sobe um
// pouco e deixa um rastro; na mordida dá um tranco para a frente; ferido, pisca em vermelho e mostra a barra de vida.
const WOLF_RADIUS = 12;
export function renderSpiritWolves() {
    if (N.wolves.length === 0) return;
    const sprite = getMonsterSprite('SHADOW_WOLF');
    if (!sprite?.atlas) return;
    const t = performance.now() / 1000;
    const base = sprite.worldSize * (WOLF_RADIUS / sprite.radius);
    const live = N.wolves.filter(w => !w.dead);
    // Sombras no chão e brilhos
    for (const w of live) {
        ctx.fillStyle = 'rgba(2, 10, 6, 0.35)';
        ctx.beginPath();
        ctx.ellipse(w.x, w.y + 6, 9 - w.lift * 0.3, 3.4, 0, 0, TAU);
        ctx.fill();
        drawGlow(ctx, 'rgba(74, 222, 128, 0.85)', w.x, w.y - w.lift, w.mode === 'hunt' ? 28 : 22, (w.mode === 'hunt' ? 0.6 : 0.4) * Math.min(1, w.age * 2));
    }
    // Rastro da corrida: imagens que vão sumindo
    for (const w of live) {
        if (w.mode !== 'hunt' || !w.moving || w.lift <= 0) continue;
        const f = spriteFrame(sprite, w.angle, 0.3);
        for (let k = w.trail.length - 1; k >= 1; k--) {
            const p = w.trail[k];
            ctx.globalAlpha = 0.3 * (1 - k / w.trail.length);
            stamp(sprite.atlas, f.sx, f.sy, sprite.cell, sprite.cell, p.x, p.y - w.lift * 0.6, f.rotation, base * 1.1, base * 1.1);
        }
    }
    for (const w of live) {
        const running = w.mode === 'hunt' && w.moving && w.lift > 0;
        const cycle = w.moving ? (t / (sprite.spec.playSeconds ?? 0.4) / (w.mode === 'hunt' ? 0.7 : 1) + w.seed) % 1 : 0;
        const f = spriteFrame(sprite, w.angle, cycle);
        const bump = w.bit > 0 ? 6 * (w.bit / 0.2) : 0;
        const size = base * ((running ? 1.18 : 1) + 0.04 * Math.sin(t * 5 + w.seed));
        ctx.globalAlpha = 0.92;
        stamp(sprite.atlas, f.sx, f.sy, sprite.cell, sprite.cell, w.x + Math.cos(w.angle) * bump, w.y - w.lift + Math.sin(w.angle) * bump, f.rotation, size * (running ? 1.15 : 1), size);
        // Ferido: um clarão vermelho por cima
        if (w.hurt > 0) {
            ctx.globalAlpha = Math.min(0.6, w.hurt * 3);
            drawGlow(ctx, 'rgba(248, 113, 113, 0.9)', w.x, w.y, 18, 1);
        }
    }
    resetWorldView();
    ctx.globalAlpha = 1;
    // Barra de vida (só do lobo machucado)
    for (const w of live) {
        if (w.hp >= w.maxHp - 0.5) continue;
        const ratio = Math.max(0, w.hp / w.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(w.x - 11, w.y - 17, 22, 3);
        ctx.fillStyle = ratio > 0.35 ? '#4ade80' : '#f87171';
        ctx.fillRect(w.x - 11, w.y - 17, 22 * ratio, 3);
    }
    // Marcas de garra das mordidas: três riscos que somem
    if (N.claws.length > 0) {
        ctx.lineCap = 'round';
        for (const c of N.claws) {
            const k = 1 - c.age / 0.3;
            ctx.globalAlpha = k;
            for (const off of [-5, 0, 5]) {
                const px = c.x - Math.sin(c.angle) * off;
                const py = c.y + Math.cos(c.angle) * off;
                ctx.strokeStyle = '#f0fdf4';
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(px - Math.cos(c.angle - 0.9) * 9, py - Math.sin(c.angle - 0.9) * 9);
                ctx.lineTo(px + Math.cos(c.angle - 0.9) * 9, py + Math.sin(c.angle - 0.9) * 9);
                ctx.stroke();
                ctx.strokeStyle = 'rgba(74, 222, 128, 0.7)';
                ctx.lineWidth = 3.4;
                ctx.globalAlpha = k * 0.4;
                ctx.stroke();
                ctx.globalAlpha = k;
            }
        }
        ctx.globalAlpha = 1;
    }
}

// --- VIDEIRAS E CARVALHO (depois do herói) ---
export function renderNatureFront() {
    if (N.vines.length > 0 && !player.hidden) {
        const t = performance.now() / 1000;
        ctx.lineCap = 'round';
        for (const [color, width] of VINE_STROKES) {
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.beginPath();
            N.vines.forEach((e, i) => {
                const mx = (player.x + e.x) / 2 + Math.sin(t * 3 + i * 2.1) * 12;
                const my = (player.y - 16 + e.y) / 2 - 14 + Math.cos(t * 2.3 + i) * 6;
                ctx.moveTo(player.x, player.y - 16);
                ctx.quadraticCurveTo(mx, my, e.x, e.y);
            });
            ctx.stroke();
        }
        for (const e of N.vines) drawGlow(ctx, 'rgba(74, 222, 128, 0.7)', e.x, e.y, 10, 0.6);
    }
    if (N.seed?.target?.hp > 0) {
        const seed = N.seed;
        const target = seed.target;
        let x;
        let y;
        if (seed.attached) {
            x = target.x;
            y = target.y - target.radius - 6 + Math.sin(performance.now() / 170) * 2;
        } else {
            const progress = seed.flightAge / seed.flightSeconds;
            const targetX = target.x;
            const targetY = target.y - target.radius - 6;
            x = seed.startX + (targetX - seed.startX) * progress;
            y = seed.startY + (targetY - seed.startY) * progress - Math.sin(Math.PI * progress) * 18;
            const angle = Math.atan2(targetY - seed.startY, targetX - seed.startX);
            ctx.strokeStyle = 'rgba(134, 239, 172, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - Math.cos(angle) * 9, y - Math.sin(angle) * 9);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        drawGlow(ctx, 'rgba(74, 222, 128, 0.8)', x, y, seed.attached ? 10 : 8, 0.55);
        ctx.save();
        ctx.translate(x, y);
        if (!seed.attached) ctx.rotate(Math.atan2(target.y - seed.startY, target.x - seed.startX));
        ctx.fillStyle = '#86efac';
        ctx.beginPath();
        ctx.ellipse(0, 0, 3.2, 5, -0.5, 0, TAU);
        ctx.fill();
        ctx.restore();
    }
    for (const oak of N.oaks) {
        const grow = oakScale(oak);
        const fade = oak.stage === 'adult' ? Math.min(1, (oak.seconds - oak.age) / 0.8) : 1;
        const t = performance.now() / 1000;
        // Acordada, balança sem parar; levando pancada, treme
        const sway = (oak.shake > 0 ? Math.sin(oak.shake * 70) * 1.6 : 0) + oak.awake * Math.sin(t * 4) * 0.9;
        const k = grow * (2 - grow);
        const tw = TRUNK_W * k;
        const th = TRUNK_H * k;
        const cw = CROWN_W * k;
        const ch = CROWN_H * k;
        ctx.globalAlpha = fade;
        if (oak.stage === 'sapling') {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(oak.x - 1.2, oak.y - 8 * k, 2.4, 9 * k);
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.ellipse(oak.x - 3 * k, oak.y - 8 * k, 4 * k, 2 * k, -0.5, 0, TAU);
            ctx.ellipse(oak.x + 3 * k, oak.y - 10 * k, 4 * k, 2 * k, 0.5, 0, TAU);
            ctx.fill();
        } else {
            ctx.drawImage(getTrunk(), oak.x - tw / 2 + sway, oak.y - th + 5 * k, tw, th);
        }
        if (oak.awake > 0.02) {
            ctx.globalAlpha = fade * oak.awake;
            ctx.drawImage(getEvilTrunk(), oak.x - tw / 2 + sway, oak.y - th + 5 * k, tw, th);
        }
        if (oak.stage !== 'sapling') {
            ctx.globalAlpha = fade * 0.9;
            ctx.drawImage(getCrown(), oak.x - cw / 2 + sway * 1.6, oak.y - 56 * k - ch / 2, cw, ch);
        }
        if (oak.awake > 0.02) {
            ctx.globalAlpha = fade * 0.9 * oak.awake;
            ctx.drawImage(getEvilCrown(), oak.x - cw / 2 + sway * 1.6, oak.y - 56 * k - ch / 2, cw, ch);
            drawGlow(ctx, 'rgba(239, 68, 68, 0.8)', oak.x, oak.y - 36 * k, 12, 0.35 * oak.awake);
        }
        ctx.globalAlpha = 1;
        // Chicotadas: um galho grosso que sai da copa e vai até cada monstro atingido
        if (oak.swipes.length > 0) {
            ctx.lineCap = 'round';
            for (const sw of oak.swipes) {
                if (sw.age > 0.22) continue;
                const p = Math.min(1, sw.age / 0.1);
                const fadeOut = 1 - Math.max(0, (sw.age - 0.1) / 0.12);
                const sx = oak.x + sway;
                const sy = oak.y - 30 * k;
                const ex = sx + (sw.x - sx) * p;
                const ey = sy + (sw.y - sy) * p;
                const mx = (sx + ex) / 2 + sw.side * 14;
                const my = (sy + ey) / 2 - 16;
                ctx.globalAlpha = fadeOut;
                for (const [color, width] of [['#1b0f26', 5.4], ['#5b3a1a', 3.4], ['#a16207', 1.2]]) {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = width;
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.quadraticCurveTo(mx, my, ex, ey);
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;
        }
        // Vida da árvore
        const ratio = Math.max(0, oak.hp / oak.maxHp);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(oak.x - 16, oak.y + 9, 32, 3.5);
        ctx.fillStyle = oak.awake > 0.5 ? '#f87171' : '#4ade80';
        ctx.fillRect(oak.x - 16, oak.y + 9, 32 * ratio, 3.5);
    }
    // Arbusto: o herói escondido fica visível por dentro (a folhagem fica translúcida)
    for (const b of N.bushes) {
        const grow = Math.min(1, b.age / POWER_MODELS.hidingBush.growSeconds);
        const fade = Math.min(1, (b.seconds - b.age) / 0.6);
        const k = grow * (2 - grow);
        const rustle = b.rustle > 0 ? Math.sin(b.rustle * 60) * 2.2 : 0;
        const w = BUSH_W * (b.radius / 36) * 0.9 * k;
        const h = BUSH_H * (b.radius / 36) * 0.9 * k;
        ctx.globalAlpha = fade * (N.hideIn === b ? 0.5 : 0.95);
        ctx.drawImage(getBush(), b.x - w / 2 + rustle, b.y - h * 0.8, w, h);
        ctx.globalAlpha = 1;
    }
}
const VINE_STROKES = [['rgba(5, 46, 22, 0.85)', 4.5], ['#16a34a', 2.4], ['#86efac', 0.9]];
