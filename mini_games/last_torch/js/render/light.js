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

// Círculo sagrado: brilho, anel duplo, marcas girando devagar e a cruz no centro
function holyCircle(x, y, radius, t, alpha, withCross) {
    ctx.globalAlpha = 0.5 * alpha;
    drawGlow(ctx, 'rgba(253, 230, 138, 0.55)', x, y, radius * 1.05, 1);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.85 * alpha;
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * SQUASH, 0, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5 * alpha;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 0.86, radius * 0.86 * SQUASH, 0, 0, TAU);
    ctx.stroke();
    // Marcas entre os dois anéis, girando
    ctx.globalAlpha = 0.7 * alpha;
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
        const a = t * 0.25 + (i / 12) * TAU;
        const c = Math.cos(a);
        const s = Math.sin(a) * SQUASH;
        ctx.beginPath();
        ctx.moveTo(x + c * radius * 0.88, y + s * radius * 0.88);
        ctx.lineTo(x + c * radius * 0.97, y + s * radius * 0.97);
        ctx.stroke();
    }
    if (withCross) groundCross(x, y, radius * 0.3, 0.8 * alpha);
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
    for (const g of L.grounds) {
        const fade = Math.min(1, g.age / 0.3, (g.seconds - g.age) / 0.5);
        holyCircle(g.x, g.y, g.radius * (0.7 + 0.3 * Math.min(1, g.age / 0.3)), t, Math.max(0, fade) * (g.evolved ? 1 : 0.85), g.evolved);
    }
    if (consecration.on) renderSacredGround(t);
    ctx.globalAlpha = 1;
}

// Por cima: frascos no ar, raios caindo, estouros de luz e a cruz do fim da Fúria
export function renderLightFront() {
    renderRain(state.runTime);
    renderChurchBell();
    renderFaithShields();
    if (!L.flasks.length && !L.drops.length && !L.bolts.length && !L.bursts.length && !consecration.on && consecration.finale <= 0) {
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
    for (const b of L.bolts) {
        const k = 1 - b.age / b.seconds;
        pillar(b.x, b.y, b.radius * 0.5 * (0.4 + 0.6 * k), 340, 0.9 * k);
        ctx.globalAlpha = 0.6 * k;
        drawGlow(ctx, 'rgba(254, 249, 231, 0.8)', b.x, b.y, b.radius * 1.4, 1);
    }
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
// Um selo de luz no chão: brilho dourado, anel duplo com uma faixa de runas e quatro cruzes girando devagar, uma estrela de
// oito pontas girando ao contrário e a cruz grande no centro. A cada pulso de dano o selo acende e uma onda sai do centro.
// Por cima: um feixe de luz desce do céu ao abrir, e pontos de luz sobem do chão enquanto dura. No fim, uma cruz de luz
// gigante desce, crava no centro e some. Só traços e brilhos prontos: nada de sprite novo.
const GOLD_SOFT = 'rgba(253, 230, 138, 0.55)';
const easeOut = (k) => 1 - (1 - k) * (1 - k) * (1 - k);

function renderSacredGround(t) {
    const C = consecration;
    const open = easeOut(Math.min(1, C.age / 0.45));
    const R = C.radius * (0.35 + 0.65 * open);
    const glow = 0.35 + 0.35 * C.pulse;
    ctx.save();
    ctx.globalAlpha = glow * open;
    drawGlow(ctx, GOLD_SOFT, C.x, C.y, R * 1.15, 1);
    ctx.translate(C.x, C.y);
    ctx.scale(1, SQUASH);
    // Chão iluminado
    ctx.globalAlpha = (0.1 + 0.08 * C.pulse) * open;
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fill();
    // Anel duplo
    ctx.globalAlpha = 0.9 * open;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.84, 0, TAU);
    ctx.stroke();
    // Faixa de runas entre os anéis (traços curtos) e quatro cruzes pequenas, girando devagar
    ctx.save();
    ctx.rotate(t * 0.18);
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.75 * open;
    ctx.beginPath();
    for (let i = 0; i < 28; i++) {
        if (i % 7 === 0) continue;
        const a = (i / 28) * TAU;
        ctx.moveTo(Math.cos(a) * R * 0.88, Math.sin(a) * R * 0.88);
        ctx.lineTo(Math.cos(a + 0.05) * R * 0.96, Math.sin(a + 0.05) * R * 0.96);
    }
    ctx.stroke();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = WHITE;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU;
        const cx = Math.cos(a) * R * 0.92;
        const cy = Math.sin(a) * R * 0.92;
        ctx.moveTo(cx, cy - 7);
        ctx.lineTo(cx, cy + 7);
        ctx.moveTo(cx - 4.5, cy - 2);
        ctx.lineTo(cx + 4.5, cy - 2);
    }
    ctx.stroke();
    ctx.restore();
    // Estrela de oito pontas (dois quadrados), girando ao contrário
    ctx.save();
    ctx.rotate(-t * 0.12);
    ctx.globalAlpha = 0.55 * open;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.4;
    const s = R * 0.6;
    for (const rot of [0, Math.PI / 4]) {
        ctx.save();
        ctx.rotate(rot);
        ctx.strokeRect(-s / Math.SQRT2, -s / Math.SQRT2, s * Math.SQRT2, s * Math.SQRT2);
        ctx.restore();
    }
    ctx.restore();
    // Onda do pulso: um anel claro saindo do centro até a borda
    if (C.pulse > 0) {
        ctx.globalAlpha = 0.8 * C.pulse * open;
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, R * (1 - C.pulse) + 4, 0, TAU);
        ctx.stroke();
    }
    ctx.restore();
    // A cruz grande no centro, deitada no chão
    ctx.lineWidth = 5;
    groundCross(C.x, C.y, R * 0.34, (0.75 + 0.25 * C.pulse) * open);
    ctx.globalAlpha = 1;
}

// Por cima: o feixe que desce do céu ao abrir e os pontos de luz subindo do chão
function renderSacredMotes(t) {
    const C = consecration;
    if (C.age < 0.6) {
        const k = C.age / 0.6;
        pillar(C.x, C.y, 46 * (1 - k) + 6, 520, 1 - k * k);
    }
    const open = Math.min(1, C.age / 0.45);
    ctx.fillStyle = '#fef3c7';
    for (let i = 0; i < 22; i++) {
        const phase = (t * 0.45 + i * 0.37) % 1;
        const a = i * 2.39996;
        const r = C.radius * 0.92 * Math.sqrt((i * 0.618) % 1);
        const x = C.x + Math.cos(a) * r;
        const y = C.y + Math.sin(a) * r * SQUASH - phase * 80;
        ctx.globalAlpha = Math.sin(phase * Math.PI) * 0.9 * open;
        ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
    }
    ctx.globalAlpha = 1;
}

// A cruz de luz gigante do fim: desce do céu (primeiro terço), crava no centro com um clarão e some aos poucos
function renderFinaleCross() {
    const C = consecration;
    const k = 1 - C.finale / CONSECRATION_FINALE_SECONDS;
    const fall = Math.min(1, k / 0.18);      // desce rápido: o golpe (dano e onda) acontece na hora em que ela crava
    const fade = k < 0.18 ? 1 : 1 - (k - 0.18) / 0.82;
    const h = 190;
    const w = 24;
    const drop = (1 - easeOut(fall)) * 320;
    const baseY = C.y - drop;
    ctx.save();
    ctx.globalAlpha = 0.7 * fade;
    drawGlow(ctx, 'rgba(254, 243, 199, 0.85)', C.x, baseY - h * 0.55, 120, 1);
    ctx.globalAlpha = fade;
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    // Haste em pé e a travessa no alto
    ctx.fillRect(C.x - w / 2, baseY - h, w, h);
    ctx.strokeRect(C.x - w / 2, baseY - h, w, h);
    ctx.fillRect(C.x - w * 2.6, baseY - h * 0.74, w * 5.2, w);
    ctx.strokeRect(C.x - w * 2.6, baseY - h * 0.74, w * 5.2, w);
    ctx.restore();
    // O impacto: clarão no chão que abre e some
    if (fall >= 1) {
        const hit = Math.min(1, (k - 0.18) / 0.82);
        ctx.globalAlpha = 0.8 * (1 - hit);
        drawGlow(ctx, 'rgba(254, 249, 231, 0.95)', C.x, C.y, C.finaleRadius * (0.5 + 0.6 * hit), 1);
    }
    ctx.globalAlpha = 1;
}

// --- CHURCH BELL: o sino sobre a tocha e as ondas de som ---
// Sino dourado translúcido pendurado numa viga curta acima da chama; balança quando toca (amortecendo) e acende. Cada
// badalada solta um anel dourado no chão que abre da tocha até o alcance, e dois arcos de "som" sobem do sino.
const BELL_Y = 104;                 // altura do sino acima da base da tocha, px
function renderChurchBell() {
    if (powers.churchBell.lvl <= 0) return;
    const B = L.bell;
    const x = state.coreX;
    const y = state.coreY - BELL_Y;
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
    // A viga e o sino
    const swing = Math.sin(performance.now() / 1000 * 9) * 0.45 * B.swing;
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = '#3f2a14';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 13, y - 17);
    ctx.lineTo(x + 13, y - 17);
    ctx.stroke();
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
