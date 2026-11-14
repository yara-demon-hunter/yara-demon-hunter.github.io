import { EVOLUTIONS } from '../../data_model/powers.js';
import { ctx, player, powers, state } from '../core/state.js';
import { CONSECRATION_FINALE_SECONDS, consecration } from '../systems/fury.js';
import { PASSIVE_SKILL_MODELS } from '../../data_model/passives.js';
import { drawGlow } from '../../library/core/glow.js';

// --- DESENHO DAS SKILLS DA LUZ (js/systems/skills_light.js) e da Terra Consagrada (js/systems/fury.js) ---
// Só linhas e brilhos prontos: um círculo é um brilho, dois anéis, alguns traços e uma cruz. Nada cobre a ação: o
// círculo fica no chão (antes dos monstros) e os raios e frascos são finos e curtos.
const L = state.light;
const TAU = Math.PI * 2;
const SQUASH = 0.72;                // achatamento do chão (mesma perspectiva do resto do jogo)
const GOLD = '#fde68a';
const WHITE = '#fef9e7';

// Cruz plana no chão (centro x, y; tamanho s)
function groundCross(x, y, s, alpha) {
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - s * SQUASH * 1.1);
    ctx.lineTo(x, y + s * SQUASH * 0.9);
    ctx.moveTo(x - s * 0.55, y - s * SQUASH * 0.35);
    ctx.lineTo(x + s * 0.55, y - s * SQUASH * 0.35);
    ctx.stroke();
}

// --- HOLY SMITE e DIVINE WRATH: o raio que cai sobre o monstro mais forte ---
// Holy Smite: um feixe fino em forma de lente, do céu ao alvo, com um clarão no impacto. Divine Wrath (evoluída): bem mais forte:
// um raio em zigue-zague que pisca, uma coluna larga de luz em volta, o impacto com anel e raios no chão e uma cruz de luz que
// estoura no alvo. Só traços, gradientes e brilhos.
function renderBolt(b) {
    const k = 1 - b.age / b.seconds;               // 1 -> 0
    const sky = 440;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (!b.wrath) {
        lensBeam(b.x, b.y - sky / 2, sky, b.radius * 0.42 * (0.5 + 0.5 * k), true, 0.95 * k);
        ctx.globalAlpha = 0.6 * k;
        drawGlow(ctx, 'rgba(254, 249, 231, 0.85)', b.x, b.y, b.radius * 1.5, 1);
        ctx.restore();
        ctx.globalAlpha = 1;
        return;
    }
    const t = b.age;
    const flash = 1 - Math.min(1, t / 0.12);                      // o primeiro instante é um clarão
    // Coluna larga de luz em volta do raio
    lensBeam(b.x, b.y - sky / 2, sky, b.radius * (0.45 + 0.25 * k), true, 0.3 * k + 0.2 * flash);
    // O raio: zigue-zague que muda de forma a cada pouco (parece tremer)
    const frame = Math.floor(t * 22);
    const pts = [[b.x + Math.sin(b.seed + frame) * 6, b.y - sky]];
    for (let i = 1; i < 9; i++) {
        const q = i / 9;
        pts.push([b.x + Math.sin(b.seed * 3 + frame * 2.1 + i * 1.7) * 13 * (1 - q * 0.8), b.y - sky * (1 - q)]);
    }
    pts.push([b.x, b.y]);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const [color, width, a] of [['rgba(250, 204, 21, 0.45)', 7, 0.4], ['#fde68a', 3, 0.85], ['#fffbeb', 1.4, 0.95]]) {
        ctx.globalAlpha = a * (0.45 + 0.55 * k);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
    }
    // Ramais curtos saindo do raio perto do chão
    ctx.globalAlpha = 0.8 * k;
    ctx.strokeStyle = '#fffde7';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const p = pts[5 + (i % 3)];
        const side = i % 2 ? 1 : -1;
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(p[0] + side * (14 + (i * 5) % 9), p[1] + 14);
        ctx.lineTo(p[0] + side * (22 + (i * 7) % 8), p[1] + 30);
    }
    ctx.stroke();
    // Impacto: clarão, anel que abre e raios no chão
    ctx.globalAlpha = 0.34 * k;
    drawGlow(ctx, 'rgba(255, 244, 200, 0.9)', b.x, b.y, b.radius * (0.9 + 0.9 * (1 - k)), 1);
    const spread = 1 - k;
    ctx.globalAlpha = 0.6 * k;
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2.2 * k + 0.8;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.radius * (0.6 + 2.2 * spread), b.radius * (0.6 + 2.2 * spread) * SQUASH, 0, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + b.seed;
        const r0 = b.radius * (0.5 + 1.3 * spread);
        const r1 = r0 + b.radius * (0.6 + 0.8 * k);
        ctx.moveTo(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0 * SQUASH);
        ctx.lineTo(b.x + Math.cos(a) * r1, b.y + Math.sin(a) * r1 * SQUASH);
    }
    ctx.stroke();
    // Cruz de luz que estoura no alvo (só no começo)
    if (flash > 0) {
        lensBeam(b.x, b.y - 8, 70 * (0.6 + 0.6 * flash), 4 * flash + 1.5, true, 0.7 * flash);
        lensBeam(b.x, b.y - 18, 46 * (0.6 + 0.6 * flash), 3 * flash + 1.2, false, 0.7 * flash);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
}

// Luz que sobe do chão (a cruz do fim e os raios): um pilar fino com brilho
function pillar(x, y, width, height, alpha) {
    ctx.globalAlpha = alpha;
    const g = ctx.createLinearGradient(0, y - height, 0, y);
    g.addColorStop(0, 'rgba(254, 249, 231, 0)');
    g.addColorStop(0.6, 'rgba(254, 249, 231, 0.8)');
    g.addColorStop(1, 'rgba(253, 230, 138, 1)');
    ctx.fillStyle = g;
    ctx.fillRect(x - width / 2, y - height, width, height);
}

// Frasco de água benta girando no ar: frasco redondo de vidro com uma cruz dourada, gargalo longo e rolha. O líquido azul fica
// sempre "para baixo" (balança dentro do vidro enquanto o frasco gira) e brilha de leve
const VIAL_SCALE = 1.7;            // tamanho do frasco no ar (o desenho abaixo é em unidades de ~10px de altura)
function drawVial(x, y, angle, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(VIAL_SCALE, VIAL_SCALE);
    ctx.globalAlpha = 1;
    // Brilho azul atrás
    ctx.globalAlpha = 0.5;
    drawGlow(ctx, 'rgba(96, 165, 250, 0.7)', 0, 0, 15, 1);
    ctx.globalAlpha = 1;
    ctx.rotate(angle);
    const R = 5.2;
    // Vidro (bulbo) com contorno
    ctx.fillStyle = 'rgba(219, 234, 254, 0.45)';
    ctx.strokeStyle = '#0b1220';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 1.5, R, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Líquido: a metade de baixo do bulbo NO MUNDO (contra-gira), com a superfície ondulando
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 1.5, R - 0.8, 0, TAU);
    ctx.clip();
    ctx.rotate(-angle);
    const wave = Math.sin(t * 9) * 0.9;
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(-R, -0.4 + wave);
    ctx.quadraticCurveTo(0, -1.6 - wave, R, -0.4 + wave);
    ctx.lineTo(R, R + 2);
    ctx.lineTo(-R, R + 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(-R, -0.6 + wave, R * 2, 0.9);
    ctx.restore();
    // Cruz dourada no vidro
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(0, -1.4);
    ctx.lineTo(0, 4.2);
    ctx.moveTo(-1.6, 0.4);
    ctx.lineTo(1.6, 0.4);
    ctx.stroke();
    // Gargalo e rolha
    ctx.fillStyle = 'rgba(219, 234, 254, 0.75)';
    ctx.strokeStyle = '#0b1220';
    ctx.lineWidth = 1;
    ctx.fillRect(-1.5, -7.6, 3, 4.4);
    ctx.strokeRect(-1.5, -7.6, 3, 4.4);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-1.9, -9.4, 3.8, 2);
    // Reflexo no vidro
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(-2.4, -0.6, 0.8, 1.8, 0.5, 0, TAU);
    ctx.fill();
    ctx.restore();
}

// Frasco no ar: sombra no chão (menor quanto mais alto), um rastro de gotas atrás e o frasco girando no arco
function renderFlask(f, t) {
    const at = (p) => ({
        x: f.x0 + (f.x1 - f.x0) * p,
        ground: f.y0 + 20 + (f.y1 - f.y0 - 20) * p,
        lift: 20 * (1 - p) + Math.sin(p * Math.PI) * 95
    });
    const p = f.age / f.seconds;
    const now = at(p);
    // Sombra
    const k = 1 - Math.min(1, now.lift / 110) * 0.6;
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(now.x, now.ground, 9 * k, 3.8 * k, 0, 0, TAU);
    ctx.fill();
    // Rastro de gotas que escapam do frasco
    ctx.fillStyle = '#93c5fd';
    for (let g = 1; g <= 4; g++) {
        const q = Math.max(0, p - g * 0.045);
        const back = at(q);
        ctx.globalAlpha = 0.6 * (1 - g / 5);
        ctx.beginPath();
        ctx.arc(back.x, back.ground - back.lift, 1.8 - g * 0.25, 0, TAU);
        ctx.fill();
    }
    drawVial(now.x, now.ground - now.lift, p * 5, t);      // gira devagar (menos de uma volta), para ler o frasco
}

// Chão molhado de água benta: poça azul translúcida com borda clara e anéis que se abrem devagar; some aos poucos
function renderPuddles(t) {
    for (const p of L.puddles) {
        const grow = Math.min(1, p.age / 0.25);
        const fade = Math.min(1, (p.seconds - p.age) / 0.8);
        const r = p.radius * (0.6 + 0.4 * grow);
        ctx.globalAlpha = 0.32 * fade;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, r, r * SQUASH, 0, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 0.55 * fade;
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        // Anéis de onda
        ctx.lineWidth = 1;
        for (let k = 0; k < 2; k++) {
            const w = ((t * 0.6 + p.seed + k * 0.5) % 1);
            ctx.globalAlpha = 0.45 * fade * (1 - w);
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, r * w, r * w * SQUASH, 0, 0, TAU);
            ctx.stroke();
        }
    }
}

// Chuva benta (Blessed Rain): a tela escurece num azul fraco e uma chuva densa e inclinada cai sobre tudo, em duas camadas
// (gotas de trás finas e lentas, as da frente grossas e rápidas), com pingos abrindo anéis no chão. Entra e sai aos poucos.
// Tudo num caminho só por camada: ~220 traços e ~24 anéis por quadro.
function renderRain(t) {
    if (L.rain <= 0) return;
    const R = EVOLUTIONS.holyWater.rain;
    const fade = Math.min(1, L.rain / 0.8, (R.seconds - L.rain) / 0.8);
    const w = state.width;
    const h = state.height;
    ctx.globalAlpha = 0.14 * fade;
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, w, h);
    const layers = [
        { count: 130, speed: 520, len: 12, slant: 3, width: 1, color: '#93c5fd', alpha: 0.35, seed: 0 },
        { count: 90, speed: 820, len: 22, slant: 6, width: 1.6, color: '#dbeafe', alpha: 0.6, seed: 7.3 }
    ];
    for (const Lr of layers) {
        ctx.globalAlpha = Lr.alpha * fade;
        ctx.strokeStyle = Lr.color;
        ctx.lineWidth = Lr.width;
        ctx.beginPath();
        for (let i = 0; i < Lr.count; i++) {
            const x = ((i * 97.31 + Lr.seed * 31) % w + t * Lr.slant * 8 + w) % w;
            const y = ((i * 53.77 + Lr.seed * 17) % h + t * Lr.speed) % h;
            ctx.moveTo(x, y);
            ctx.lineTo(x - Lr.slant, y + Lr.len);
        }
        ctx.stroke();
    }
    // Pingos no chão: anéis pequenos que abrem e somem
    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 24; i++) {
        const phase = (t * 1.6 + i * 0.37) % 1;
        const cycle = Math.floor(t * 1.6 + i * 0.37);
        const x = ((i * 151.7 + cycle * 211.3) % w + w) % w;
        const y = ((i * 89.3 + cycle * 127.1) % h + h) % h;
        const r = 2 + phase * 7;
        ctx.moveTo(x + r, y);
        ctx.ellipse(x, y, r, r * SQUASH, 0, 0, TAU);
    }
    ctx.globalAlpha = 0.5 * fade;
    ctx.stroke();
    ctx.globalAlpha = 1;
}

// No chão, antes dos monstros: os círculos da skill e o da Fúria
export function renderLightGround() {
    const t = state.runTime;
    renderPuddles(t);
    L.grounds.forEach((g, i) => renderGroundSkill(g, i, t));
    if (consecration.on) renderSacredGround(t);
    ctx.globalAlpha = 1;
}

// Por cima: frascos no ar, raios caindo, estouros de luz e a cruz do fim da Fúria
export function renderLightFront() {
    renderRain(state.runTime);
    renderGroundSkillsFront(state.runTime);
    renderChurchBell();
    renderFaithShields();
    if (!L.flasks.length && !L.grounds.length && !L.drops.length && !L.bolts.length && !L.bursts.length && !consecration.on && consecration.finale <= 0) {
        ctx.globalAlpha = 1;
        return;
    }
    const tt = state.runTime;
    for (const f of L.flasks) renderFlask(f, tt);
    // Respingos do frasco estourando: gotas azuis voando para fora e caindo
    ctx.fillStyle = '#60a5fa';
    for (const d of L.drops) {
        ctx.globalAlpha = 0.9 * (1 - d.age / d.life);
        ctx.beginPath();
        ctx.arc(d.x, d.y - d.z, d.size, 0, TAU);
        ctx.fill();
    }
    for (const b of L.bolts) renderBolt(b);
    for (const b of L.bursts) {
        const k = b.age / b.seconds;
        ctx.globalAlpha = 0.7 * (1 - k);
        drawGlow(ctx, 'rgba(254, 249, 231, 0.9)', b.x, b.y, b.radius * (0.6 + 0.6 * k), 1);
        if (b.cross) {
            ctx.globalAlpha = 1 - k;
            groundCross(b.x, b.y, b.radius * (0.5 + 0.5 * k), 1 - k);
        }
    }
    if (consecration.on) renderSacredMotes(state.runTime);
    if (consecration.finale > 0) renderFinaleCross();
    ctx.globalAlpha = 1;
}

// --- TERRA CONSAGRADA (a Fúria do Avgustino, js/systems/fury.js) ---
// Luz, não símbolos: um clarão dourado que enche o círculo (mais forte no centro), um anel fino com contas de luz, raios suaves
// girando devagar e, de pé na borda, uma cortina de colunas de luz que sobe e treme. A cada pulso de dano uma onda clara
// atravessa o círculo. Ao abrir, uma cúpula de luz estoura do chão; no fim, uma cruz de luz (feita de dois feixes em forma de
// lente, sem blocos duros) desce e crava no centro. Só gradientes e brilhos: nenhum sprite.
const GOLD_SOFT = 'rgba(253, 230, 138, 0.55)';
const easeOut = (k) => 1 - (1 - k) * (1 - k) * (1 - k);
const BEADS = 28;
const COLUMNS = 26;

function renderSacredGround(t) {
    const C = consecration;
    const open = easeOut(Math.min(1, C.age / 0.5));
    const R = C.radius * (0.4 + 0.6 * open);
    const lift = 0.8 + 0.4 * C.pulse;
    ctx.save();
    ctx.translate(C.x, C.y);
    ctx.scale(1, SQUASH);
    // Chão aceso: do branco-quente no centro ao dourado e sumindo na borda
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    g.addColorStop(0, 'rgba(255, 251, 235, 0.55)');
    g.addColorStop(0.45, 'rgba(253, 230, 138, 0.28)');
    g.addColorStop(1, 'rgba(253, 224, 71, 0.04)');
    ctx.globalAlpha = Math.min(1, lift) * open;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fill();
    // Raios suaves saindo do centro (setores fracos), girando devagar
    ctx.save();
    ctx.rotate(t * 0.12);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.16 * open;
    ctx.fillStyle = '#fde68a';
    for (let i = 0; i < 10; i++) {
        const a0 = (i / 10) * TAU;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R * 0.96, a0, a0 + TAU / 20);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
    // Anel fino e um segundo anel mais fraco por dentro
    ctx.globalAlpha = 0.9 * open;
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.35 * open;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.9, 0, TAU);
    ctx.stroke();
    // Contas de luz no anel, girando devagar
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#fffbeb';
    for (let i = 0; i < BEADS; i++) {
        const a = t * 0.2 + (i / BEADS) * TAU;
        ctx.globalAlpha = (0.55 + 0.4 * Math.sin(t * 3 + i * 0.9)) * open;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * R, Math.sin(a) * R, 1.7, 0, TAU);
        ctx.fill();
    }
    // Onda do pulso: um anel claro que atravessa o círculo do centro até a borda
    if (C.pulse > 0) {
        const w = 1 - C.pulse;
        ctx.globalAlpha = 0.75 * C.pulse * open;
        ctx.strokeStyle = '#fffbeb';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, R * (0.1 + 0.9 * w), 0, TAU);
        ctx.stroke();
    }
    ctx.restore();
    // Brilho do centro (onde o padre está)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (0.4 + 0.25 * C.pulse) * open;
    drawGlow(ctx, GOLD_SOFT, C.x, C.y, R * 0.55, 1);
    ctx.restore();
    ctx.globalAlpha = 1;
}

// Por cima: a cortina de colunas de luz na borda, a cúpula que estoura ao abrir e os pontos de luz subindo
function renderSacredMotes(t) {
    const C = consecration;
    const open = easeOut(Math.min(1, C.age / 0.5));
    const R = C.radius * (0.4 + 0.6 * open);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // Ao abrir: um clarão em cúpula que estoura do centro e some
    if (C.age < 0.7) {
        const k = C.age / 0.7;
        ctx.globalAlpha = 0.45 * (1 - k);
        drawGlow(ctx, 'rgba(255, 244, 200, 0.9)', C.x, C.y - 14 * k, C.radius * (0.35 + 0.9 * k), 1);
    }
    // Cortina: colunas finas de luz de pé na borda, com altura e brilho tremendo de leve (um gradiente só, copiado)
    const h = 64;
    const grad = ctx.createLinearGradient(0, 0, 0, -h);
    grad.addColorStop(0, 'rgba(255, 245, 200, 0.55)');
    grad.addColorStop(0.5, 'rgba(253, 230, 138, 0.2)');
    grad.addColorStop(1, 'rgba(253, 230, 138, 0)');
    ctx.fillStyle = grad;
    for (let i = 0; i < COLUMNS; i++) {
        const a = (i / COLUMNS) * TAU + t * 0.1;
        const x = C.x + Math.cos(a) * R;
        const y = C.y + Math.sin(a) * R * SQUASH;
        const shimmer = 0.65 + 0.35 * Math.sin(t * 2.4 + i * 1.7);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, shimmer * open);
        ctx.globalAlpha = Math.sin(a) < -0.3 ? 0.45 : 1;      // as de trás ficam mais fracas
        ctx.fillRect(-1.6, -h, 3.2, h);
        ctx.restore();
    }
    // Pontos de luz subindo dentro do círculo
    ctx.fillStyle = '#fffbeb';
    for (let i = 0; i < 18; i++) {
        const phase = (t * 0.4 + i * 0.37) % 1;
        const a = i * 2.39996;
        const r = C.radius * 0.9 * Math.sqrt((i * 0.618) % 1);
        ctx.globalAlpha = Math.sin(phase * Math.PI) * 0.85 * open;
        ctx.beginPath();
        ctx.arc(C.x + Math.cos(a) * r, C.y + Math.sin(a) * r * SQUASH - phase * 70, 1.4, 0, TAU);
        ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
}

// Feixe em forma de lente (afunila nas duas pontas): o braço de uma cruz de luz, branco no miolo e dourado nas bordas
function lensBeam(x, y, length, thick, vertical, alpha) {
    ctx.save();
    ctx.translate(x, y);
    if (!vertical) ctx.rotate(-Math.PI / 2);
    ctx.globalAlpha = alpha;
    const half = length / 2;
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.quadraticCurveTo(thick, 0, 0, half);
    ctx.quadraticCurveTo(-thick, 0, 0, -half);
    ctx.closePath();
    const g = ctx.createLinearGradient(-thick, 0, thick, 0);
    g.addColorStop(0, 'rgba(253, 224, 71, 0.15)');
    g.addColorStop(0.5, 'rgba(255, 251, 235, 1)');
    g.addColorStop(1, 'rgba(253, 224, 71, 0.15)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
}

// A cruz de luz do fim: desce do céu bem rápido, crava no centro e vira um clarão que se abre e some
function renderFinaleCross() {
    const C = consecration;
    const k = 1 - C.finale / CONSECRATION_FINALE_SECONDS;
    const fall = Math.min(1, k / 0.18);
    const fade = k < 0.18 ? 1 : Math.max(0, 1 - (k - 0.18) / 0.82);
    const drop = (1 - easeOut(fall)) * 300;
    const cy = C.y - 90 - drop;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // Brilho em volta da cruz
    ctx.globalAlpha = 0.65 * fade;
    drawGlow(ctx, 'rgba(255, 244, 200, 0.9)', C.x, cy, 90 + 30 * (1 - fade), 1);
    // Os dois braços (um raio vertical comprido e a travessa mais curta), mais finos conforme some
    const sharp = 0.6 + 0.4 * fade;
    lensBeam(C.x, cy - 10, 210, 11 * sharp, true, fade);
    lensBeam(C.x, cy - 40, 120, 9 * sharp, false, fade);
    // O impacto: clarão no chão que abre e some
    if (fall >= 1) {
        const hit = Math.min(1, (k - 0.18) / 0.82);
        ctx.globalAlpha = 0.85 * (1 - hit);
        drawGlow(ctx, 'rgba(255, 251, 235, 0.95)', C.x, C.y, C.finaleRadius * (0.45 + 0.7 * hit), 1);
        ctx.globalAlpha = 0.6 * (1 - hit);
        ctx.strokeStyle = '#fffbeb';
        ctx.lineWidth = 2.5 * (1 - hit) + 1;
        ctx.beginPath();
        ctx.ellipse(C.x, C.y, C.finaleRadius * (0.3 + 0.8 * hit), C.finaleRadius * (0.3 + 0.8 * hit) * SQUASH, 0, 0, TAU);
        ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
}

// --- CHURCH BELL: o sino sobre a tocha e as ondas de som ---
// Sino dourado translúcido flutuando em volta da tocha, em cima da chama; balança forte quando toca (amortecendo) e acende. Cada
// badalada solta um anel dourado no chão que abre da tocha até o alcance, e dois arcos de "som" sobem do sino.
const BELL_Y = 104;                 // altura média do sino acima da base da tocha, px
const BELL_ORBIT = { x: 38, y: 9, speed: 0.7, bob: 3 };   // o sino flutua em volta da tocha, em cima: raio (largura e altura), rad/s e subida e descida
function renderChurchBell() {
    if (powers.churchBell.lvl <= 0) return;
    const B = L.bell;
    // O sino flutua devagar em volta da tocha (uma elipse acima dela) e balança um pouquinho; ao tocar, faz a animação de sempre
    const tt = performance.now() / 1000;
    const orbit = tt * BELL_ORBIT.speed;
    const x = state.coreX + Math.cos(orbit) * BELL_ORBIT.x;
    const y = state.coreY - BELL_Y + Math.sin(orbit) * BELL_ORBIT.y + Math.sin(tt * 1.7) * BELL_ORBIT.bob;
    // Anéis no chão
    for (const ring of L.bellRings) {
        const k = ring.age / ring.seconds;
        const r = ring.radius * easeOut(Math.min(1, k * 1.3));
        ctx.globalAlpha = 0.85 * (1 - k);
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 4 * (1 - k) + 1;
        ctx.beginPath();
        ctx.ellipse(state.coreX, state.coreY, r, r * SQUASH, 0, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 0.35 * (1 - k);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(state.coreX, state.coreY, r * 0.85, r * 0.85 * SQUASH, 0, 0, TAU);
        ctx.stroke();
        // Arcos de som saindo do sino
        ctx.globalAlpha = 0.7 * (1 - k);
        ctx.lineWidth = 2;
        for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(x, y - 4, 14 + k * 26, side > 0 ? -0.6 : Math.PI - 0.6 + 0.0, side > 0 ? 0.6 : Math.PI + 0.6);
            ctx.stroke();
        }
    }
    // O sino flutuando (sem viga): inclina de leve com o movimento e balança forte ao tocar
    const swing = Math.sin(tt * 9) * 0.45 * B.swing + Math.sin(tt * 1.3) * 0.06 + Math.cos(orbit) * 0.05;
    ctx.save();
    ctx.translate(x, y - 16);
    ctx.rotate(swing);
    if (B.flash > 0) {
        ctx.globalAlpha = 0.6 * B.flash;
        drawGlow(ctx, 'rgba(253, 230, 138, 0.9)', 0, 14, 30, 1);
    }
    ctx.globalAlpha = 0.88;
    // Corpo do sino: ombro arredondado, boca larga, contorno escuro
    ctx.fillStyle = '#d4a017';
    ctx.strokeStyle = '#3f2a14';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-4, 2);
    ctx.quadraticCurveTo(-8, 3, -8.5, 12);
    ctx.quadraticCurveTo(-9, 19, -12, 21);
    ctx.lineTo(12, 21);
    ctx.quadraticCurveTo(9, 19, 8.5, 12);
    ctx.quadraticCurveTo(8, 3, 4, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Luz do lado esquerdo e a faixa da boca
    ctx.fillStyle = 'rgba(254, 243, 199, 0.75)';
    ctx.fillRect(-6.5, 6, 2, 11);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(-11.5, 18.5, 23, 2.5);
    // Alça e badalo
    ctx.strokeStyle = '#3f2a14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 1, 2.5, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#3f2a14';
    ctx.beginPath();
    ctx.arc(-swing * 6, 22.5, 2.2, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
}

// --- OATH OF FAITH: três escudos de luz girando em volta do herói ---
// Cada escudo: uma área de luz branco-amarelada em volta e o escudo dourado (formato de brasão) com uma cruz clara no meio,
// sempre de frente para a câmera. Os de trás do herói ficam um pouco mais apagados.
function renderFaithShields() {
    if (!L.shieldsOn) return;
    const S = PASSIVE_SKILL_MODELS.oathFaith.shields;
    const t = state.runTime;
    for (let i = 0; i < S.count; i++) {
        const a = (L.shieldAngle ?? 0) + (i / S.count) * TAU;
        const x = player.x + Math.cos(a) * S.orbit;
        const y = player.y + Math.sin(a) * S.orbit * SQUASH - 14;
        const behind = Math.sin(a) < 0 ? 0.65 : 1;
        const s = S.size;
        ctx.globalAlpha = 0.55 * behind;
        drawGlow(ctx, 'rgba(254, 249, 220, 0.85)', x, y, s * 2.4 + Math.sin(t * 4 + i) * 1.5, 1);
        ctx.globalAlpha = behind;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.8, y - s * 0.75);
        ctx.lineTo(x + s * 0.8, y - s * 0.75);
        ctx.lineTo(x + s * 0.8, y + s * 0.05);
        ctx.quadraticCurveTo(x + s * 0.7, y + s * 0.7, x, y + s);
        ctx.quadraticCurveTo(x - s * 0.7, y + s * 0.7, x - s * 0.8, y + s * 0.05);
        ctx.closePath();
        ctx.fillStyle = '#f5c542';
        ctx.fill();
        ctx.strokeStyle = '#8a6d12';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.strokeStyle = '#fffbeb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.5);
        ctx.lineTo(x, y + s * 0.6);
        ctx.moveTo(x - s * 0.42, y - s * 0.12);
        ctx.lineTo(x + s * 0.42, y - s * 0.12);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

// --- SACRED GROUND / CONSECRATED EARTH (a skill do círculo de luz; js/systems/skills_light.js) ---
// Sacred Ground: um chão aceso de luz dourada, anel fino com contas, seis velas com a chama tremendo (a arte do ícone: as duas
// velas com auréola) e pontos de luz subindo. Consecrated Earth (evoluída): o mesmo, mais raios suaves girando e CRUZES DE LUZ que
// sobem do centro uma atrás da outra, com uma auréola no alto, como almas subindo. Só gradientes e brilhos.
function groundLife(g) {
    return Math.max(0, Math.min(1, g.age / 0.35, (g.seconds - g.age) / 0.6));
}

function renderGroundSkill(g, index, t) {
    const life = groundLife(g);
    if (life <= 0) return;
    const R = g.radius * (0.55 + 0.45 * easeOut(Math.min(1, g.age / 0.4)));
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.scale(1, SQUASH);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    grad.addColorStop(0, `rgba(255, 251, 235, ${g.evolved ? 0.42 : 0.3})`);
    grad.addColorStop(0.55, 'rgba(253, 230, 138, 0.2)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0.03)');
    ctx.globalAlpha = life;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fill();
    if (g.evolved) {
        // Raios suaves girando devagar
        ctx.save();
        ctx.rotate(t * 0.14 + index);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.085 * life;
        ctx.fillStyle = '#fde68a';
        for (let i = 0; i < 12; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, R * 0.96, (i / 12) * TAU, (i / 12) * TAU + TAU / 30);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
    ctx.globalAlpha = 0.85 * life;
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#fffbeb';
    const beads = g.evolved ? 22 : 16;
    for (let i = 0; i < beads; i++) {
        const a = t * 0.2 + (i / beads) * TAU;
        ctx.globalAlpha = (0.5 + 0.4 * Math.sin(t * 3 + i)) * life;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * R, Math.sin(a) * R, 1.5, 0, TAU);
        ctx.fill();
    }
    ctx.restore();
    // Velas no anel: cera branca e chama tremendo (seis; a Consecrated Earth tem oito)
    const candles = g.evolved ? 8 : 6;
    for (let i = 0; i < candles; i++) {
        const a = (i / candles) * TAU + Math.PI / candles;
        const x = g.x + Math.cos(a) * R * 0.96;
        const y = g.y + Math.sin(a) * R * 0.96 * SQUASH;
        const flick = 0.8 + 0.2 * Math.sin(t * 11 + i * 2.3) + 0.08 * Math.sin(t * 27 + i);
        ctx.globalAlpha = life;
        ctx.fillStyle = '#f5f0e1';
        ctx.fillRect(x - 1.6, y - 5, 3.2, 5);
        ctx.fillStyle = '#cfc6ad';
        ctx.fillRect(x - 1.6, y - 5, 1, 5);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.6 * life * flick;
        drawGlow(ctx, 'rgba(253, 224, 71, 0.9)', x, y - 8, 7, 1);
        ctx.restore();
        ctx.globalAlpha = life;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(x, y - 8, 1.7, 3.2 * flick, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.ellipse(x, y - 7.4, 0.9, 1.8 * flick, 0, 0, TAU);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// Por cima: pontos de luz subindo e, na Consecrated Earth, as cruzes de luz subindo do centro com a auréola no alto
function renderGroundSkillsFront(t) {
    for (const [index, g] of L.grounds.entries()) {
        const life = groundLife(g);
        if (life <= 0) continue;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = '#fffbeb';
        for (let i = 0; i < 9; i++) {
            const phase = (t * 0.4 + i * 0.31 + index * 0.17) % 1;
            const a = i * 2.39996;
            const r = g.radius * 0.85 * Math.sqrt((i * 0.618) % 1);
            ctx.globalAlpha = Math.sin(phase * Math.PI) * 0.8 * life;
            ctx.beginPath();
            ctx.arc(g.x + Math.cos(a) * r, g.y + Math.sin(a) * r * SQUASH - phase * 46, 1.3, 0, TAU);
            ctx.fill();
        }
        if (g.evolved) {
            // Duas cruzes de luz defasadas: cada uma nasce no centro, sobe devagar crescendo, ganha uma auréola e some no alto
            for (let c = 0; c < 2; c++) {
                const p = (t * 0.32 + c * 0.5 + index * 0.23) % 1;
                const fadeIn = Math.min(1, p / 0.2);
                const fadeOut = Math.min(1, (1 - p) / 0.35);
                const a = fadeIn * fadeOut * life;
                const scale = 0.55 + 0.45 * Math.min(1, p / 0.5);
                const cy = g.y - 8 - p * g.radius * 1.15;
                ctx.globalAlpha = 0.3 * a;
                drawGlow(ctx, 'rgba(255, 244, 200, 0.9)', g.x, cy, 20 * scale, 1);
                lensBeam(g.x, cy, 76 * scale, 5.6 * scale, true, a);
                lensBeam(g.x, cy - 12 * scale, 46 * scale, 4.4 * scale, false, a);
                // Auréola flutuando sobre o alto da cruz
                ctx.globalAlpha = 0.8 * a;
                ctx.strokeStyle = '#fde68a';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.ellipse(g.x, cy - 46 * scale, 10 * scale, 3.4 * scale, 0, 0, TAU);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
    ctx.globalAlpha = 1;
}
