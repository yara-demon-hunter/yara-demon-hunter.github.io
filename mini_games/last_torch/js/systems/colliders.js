// --- ÁREAS DE CONTATO DO CENÁRIO ---
// Retângulos (girados, com cantos retos ou arredondados), círculos e elipses desenhados no editor de cenários (_library/tools/scenery_editor.html, modo "Áreas de contato") e gravados no
// layout do cenário (visual.colliders). Ninguém atravessa: herói, monstros (chefes também) e tiros. Cada área escolhe o que bloqueia
// (blocks: { hero, monsters, heroShots, monsterShots }, tudo ligado por padrão; um `shots` antigo vale para os dois tipos de tiro).
// Dá para ter, por exemplo, uma parede (barra tudo), uma mureta (só os corpos: os tiros passam) e um escudo (só os tiros: os corpos passam). Sem áreas no cenário, nada aqui custa nada.
//
// Como funciona: depois que o jogo move tudo no quadro (js/game.js chama applyColliders), cada personagem é empurrado para fora das áreas.
// Para ninguém atravessar uma parede fina com um dash, um empurrão ou um tiro rápido, o caminho entre a posição de ontem e a de hoje é
// percorrido em passos curtos, empurrando em cada um (o que também faz o personagem DESLIZAR ao longo da parede em vez de grudar nela).
//
// Os monstros andam em linha reta para o alvo (não há busca de caminho): uma parede inteira na frente deles os segura. Deixe vãos, e
// nunca feche o caminho até a tocha.
import { CHARACTER_MODEL } from '../../data_model/character.js';
import { player, state } from '../core/state.js';
import { fittedSize, getSceneryColliders, inZone } from '../render/scenery.js';
import { createExplosion } from './effects.js';

const DEG = Math.PI / 180;
const EMPTY = [];
const compiled = { source: null, w: 0, h: 0, list: EMPTY };
let lastPos = new WeakMap();           // onde cada personagem/tiro estava no fim do quadro anterior (já fora das áreas)

// As áreas em coordenadas do mundo atual (x, y do arquivo são frações do mundo; o tamanho do mundo muda de tela para tela)
function areas() {
    const raw = getSceneryColliders();
    if (!raw || raw.length === 0) return EMPTY;
    if (compiled.source === raw && compiled.w === state.width && compiled.h === state.height) return compiled.list;
    compiled.source = raw;
    compiled.w = state.width;
    compiled.h = state.height;
    compiled.list = raw.filter(c => (c.kind ?? 'contact') === 'contact').map(c => {        // só as áreas de CONTATO bloqueiam (as de trás e de nascimento são outras coisas)
        const rot = (c.rot ?? 0) * DEG;
        const f = fittedSize(c, state.width, state.height);        // `fit`: a área esticou junto com o mundo
        return {
            rect: c.shape === 'rect',
            cx: c.x * state.width, cy: c.y * state.height,
            hw: f.w / 2, hh: f.h / 2, r: f.r, ry: f.ry,
            cr: f.cr,                                                                       // raio dos cantos do retângulo (0 = canto reto)
            ell: c.shape === 'circle' && Math.abs(f.ry - f.r) > 0.01,        // elipse: círculo esticado (raio X = r, raio Y = ry)
            cos: Math.cos(rot), sin: Math.sin(rot),
            hero: c.blocks?.hero !== false, monsters: c.blocks?.monsters !== false,
            heroShots: (c.blocks?.heroShots ?? c.blocks?.shots) !== false,          // as adagas e poderes do herói
            monsterShots: (c.blocks?.monsterShots ?? c.blocks?.shots) !== false     // os tiros dos monstros
        };
    });
    return compiled.list;
}

// O mundo mudou de tamanho: as posições antigas não valem mais (senão o primeiro quadro "varreria" o personagem de volta pelas áreas)
export function resetColliderMemory() { lastPos = new WeakMap(); }

// --- ÁREAS 🐌 LENTO (poça de lodo): só o HERÓI anda mais devagar dentro delas (monstros e dash não) ---
const slowCache = { source: null, w: 0, h: 0, list: EMPTY };
function slowAreas() {
    const raw = getSceneryColliders();
    if (!raw || raw.length === 0) return EMPTY;
    if (slowCache.source === raw && slowCache.w === state.width && slowCache.h === state.height) return slowCache.list;
    slowCache.source = raw;
    slowCache.w = state.width;
    slowCache.h = state.height;
    slowCache.list = raw.filter(c => c.kind === 'slow').map(c => {
        const rot = (c.rot ?? 0) * DEG;
        const f = fittedSize(c, state.width, state.height);
        return { rect: c.shape === 'rect', cx: c.x * state.width, cy: c.y * state.height, hw: f.w / 2, hh: f.h / 2, r: f.r, ry: f.ry, cr: f.cr, cos: Math.cos(rot), sin: Math.sin(rot), slow: Math.max(0, Math.min(0.95, c.slow ?? 0.4)) };
    });
    return slowCache.list;
}

// Multiplicador da velocidade do herói em (x, y): 1 = normal; 0.6 = 40% mais lento. A maior lentidão entre as áreas em que ele está.
export function heroSpeedFactorAt(x, y) {
    const list = slowAreas();
    let slow = 0;
    for (let i = 0; i < list.length; i++) if (list[i].slow > slow && inZone(list[i], x, y)) slow = list[i].slow;
    return 1 - slow;
}

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// Empurra o ponto p (um círculo de raio r) para fora da área c. Devolve true se mexeu.
function pushOut(c, p, r) {
    const dx = p.x - c.cx;
    const dy = p.y - c.cy;
    if (c.ell) {
        // elipse (girada): infla os dois raios pelo raio de quem encosta e empurra o ponto para a borda, na direção do centro
        const lx = dx * c.cos + dy * c.sin;
        const ly = -dx * c.sin + dy * c.cos;
        const A = c.r + r;
        const B = c.ry + r;
        const v = (lx / A) * (lx / A) + (ly / B) * (ly / B);
        if (v >= 1) return false;
        let nx = A;
        let ny = 0;
        if (v > 1e-12) { const k = 1 / Math.sqrt(v); nx = lx * k; ny = ly * k; }
        p.x = c.cx + nx * c.cos - ny * c.sin;
        p.y = c.cy + nx * c.sin + ny * c.cos;
        return true;
    }
    if (!c.rect) {
        const d = Math.hypot(dx, dy);
        const min = c.r + r;
        if (d >= min) return false;
        if (d < 1e-6) { p.x = c.cx + min; return true; }
        p.x = c.cx + (dx / d) * min;
        p.y = c.cy + (dy / d) * min;
        return true;
    }
    // retângulo: vai para as coordenadas dele (sem o giro), acha o ponto mais próximo e empurra na direção contrária.
    // Canto arredondado (cr) = o retângulo MENOR (menos cr de cada lado) com o raio de quem encosta somado a cr: a distância a um retângulo
    // arredondado é a distância ao menor menos cr. Com cr no máximo vira uma cápsula.
    const hw = c.hw - c.cr;
    const hh = c.hh - c.cr;
    const rr = r + c.cr;
    const lx = dx * c.cos + dy * c.sin;
    const ly = -dx * c.sin + dy * c.cos;
    const qx = clamp(lx, -hw, hw);
    const qy = clamp(ly, -hh, hh);
    const ex = lx - qx;
    const ey = ly - qy;
    const d2 = ex * ex + ey * ey;
    if (d2 >= rr * rr) return false;
    let nx;
    let ny;
    if (d2 > 1e-9) {
        const d = Math.sqrt(d2);
        nx = qx + (ex / d) * rr;
        ny = qy + (ey / d) * rr;
    } else {                                           // o centro já está dentro: sai pelo lado mais perto
        const px = hw - Math.abs(lx);
        const py = hh - Math.abs(ly);
        if (px < py) { nx = (lx >= 0 ? 1 : -1) * (hw + rr); ny = ly; } else { nx = lx; ny = (ly >= 0 ? 1 : -1) * (hh + rr); }
    }
    p.x = c.cx + nx * c.cos - ny * c.sin;
    p.y = c.cy + nx * c.sin + ny * c.cos;
    return true;
}

// Empurra p para fora de todas as áreas que bloqueiam `flag` ('hero', 'monsters', 'heroShots' ou 'monsterShots'). Algumas passadas: sair de uma pode entrar na vizinha.
function resolve(list, p, r, flag) {
    let moved = false;
    for (let pass = 0; pass < 3; pass++) {
        let again = false;
        for (let i = 0; i < list.length; i++) if (list[i][flag] && pushOut(list[i], p, r)) again = moved = true;
        if (!again) break;
    }
    return moved;
}

// Move o personagem de onde estava (lastPos) até onde o jogo o pôs, em passos curtos, resolvendo cada um
function settle(list, e, r, flag) {
    const last = lastPos.get(e);
    const p = { x: e.x, y: e.y };
    if (last) {
        const dist = Math.hypot(e.x - last.x, e.y - last.y);
        if (dist > 0.5 && dist < 400) {
            const n = Math.min(60, Math.ceil(dist / Math.max(3, Math.min(8, r * 0.6))));
            const dx = (e.x - last.x) / n;
            const dy = (e.y - last.y) / n;
            p.x = last.x;
            p.y = last.y;
            for (let i = 0; i < n; i++) {
                p.x += dx;
                p.y += dy;
                resolve(list, p, r, flag);
            }
        } else resolve(list, p, r, flag);
    } else resolve(list, p, r, flag);
    if (p.x !== e.x || p.y !== e.y) { e.x = p.x; e.y = p.y; }
    if (last) { last.x = e.x; last.y = e.y; } else lastPos.set(e, { x: e.x, y: e.y });
}

// Tiros (adagas do herói e tiros dos monstros): somem ao bater numa área que bloqueia tiros
function blockShots(list, shots, radius, flag) {
    for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        const last = lastPos.get(s);
        const dist = last ? Math.hypot(s.x - last.x, s.y - last.y) : 0;
        const n = dist > 4 ? Math.min(40, Math.ceil(dist / 4)) : 1;
        const p = { x: 0, y: 0 };
        let hit = false;
        for (let k = 1; k <= n && !hit; k++) {
            p.x = last ? last.x + ((s.x - last.x) * k) / n : s.x;
            p.y = last ? last.y + ((s.y - last.y) * k) / n : s.y;
            const probe = { x: p.x, y: p.y };
            hit = resolve(list, probe, radius(s), flag);
        }
        if (hit) {
            createExplosion(p.x, p.y, '#cbd5e1', 3);
            shots.splice(i, 1);
        } else if (last) { last.x = s.x; last.y = s.y; } else lastPos.set(s, { x: s.x, y: s.y });
    }
}

// Chamado uma vez por quadro, depois de tudo ter se mexido (js/game.js)
export function applyColliders() {
    const list = areas();
    if (list.length === 0) return;
    settle(list, player, CHARACTER_MODEL.collisionRadius, 'hero');
    // O ponto clicado para onde o herói anda não fica dentro de uma parede (senão ele empurraria a parede para sempre)
    const target = { x: player.targetX, y: player.targetY };
    if (resolve(list, target, CHARACTER_MODEL.collisionRadius, 'hero')) { player.targetX = target.x; player.targetY = target.y; }
    for (const e of state.enemies) settle(list, e, e.radius * 0.85, 'monsters');
    blockShots(list, state.knives, () => 2, 'heroShots');
    blockShots(list, state.enemyProjectiles, (s) => Math.min(6, (s.radius ?? 4) * 0.5), 'monsterShots');
}

// Esse ponto (um círculo de raio r) está dentro de alguma área que bloqueia `flag` ('hero', 'monsters' ou 'shots')? (usado para não nascer na parede)
export function blockedAt(x, y, r, flag = 'monsters') {
    const list = areas();
    if (list.length === 0) return false;
    const p = { x, y };
    for (let i = 0; i < list.length; i++) if (list[i][flag] && pushOut(list[i], p, r)) return true;
    return false;
}

// Até onde um corpo de raio r chega andando em linha reta de (x0, y0) para (x1, y1) antes de bater numa área que bloqueia `flag`.
// Devolve o último ponto livre (ou o próprio destino, se o caminho está livre). Usado pela investida dos chefes: o risco vermelho e o avanço
// terminam na parede, em vez de atravessá-la.
export function clipSegment(x0, y0, x1, y1, r, flag = 'monsters') {
    const list = areas();
    const end = { x: x1, y: y1 };
    if (list.length === 0) return end;
    const dist = Math.hypot(x1 - x0, y1 - y0);
    if (dist < 1) return end;
    const steps = Math.ceil(dist / 4);
    let lastFree = { x: x0, y: y0 };
    const probe = { x: 0, y: 0 };
    for (let i = 1; i <= steps; i++) {
        probe.x = x0 + ((x1 - x0) * i) / steps;
        probe.y = y0 + ((y1 - y0) * i) / steps;
        if (blockedAt(probe.x, probe.y, r, flag)) {
            // refina entre o último ponto livre e este: 5 divisões ao meio
            let lo = (i - 1) / steps;
            let hi = i / steps;
            for (let k = 0; k < 5; k++) {
                const mid = (lo + hi) / 2;
                if (blockedAt(x0 + (x1 - x0) * mid, y0 + (y1 - y0) * mid, r, flag)) hi = mid; else lo = mid;
            }
            return { x: x0 + (x1 - x0) * lo, y: y0 + (y1 - y0) * lo };
        }
        lastFree = { x: probe.x, y: probe.y };
    }
    return end;
}
