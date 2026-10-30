// --- ÍCONES DE SKILLS (arte procedural) ---
// Cada skill e relíquia é desenhada uma vez, em tamanho fixo, num único atlas. A imagem vira fundo CSS e os
// elementos só mudam a posição: nada é redesenhado e a memória é a de uma imagem só.
// A chave do ícone é o id do nó em data_model/tree.js e data_model/relics.js. Coordenadas de 0 a 48.
const CELL = 48;
const COLUMNS = 8;
const TAU = Math.PI * 2;
const INK = '#050814';
const STEEL = '#cbd5e1';
const STEEL_DARK = '#64748b';
const GOLD = '#fbbf24';
const FIRE = '#f97316';
const FIRE_CORE = '#fde047';
const BLOOD = '#dc2626';
const ICE = '#7dd3fc';
const VIOLET = '#a78bfa';
const BONE = '#e7e0cf';
const GREEN = '#4ade80';

function shape(g, points, fill) {
    g.beginPath();
    points.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
    g.closePath();
    g.fillStyle = fill;
    g.lineWidth = 2;
    g.strokeStyle = INK;
    g.stroke();
    g.fill();
}

function line(g, points, color, width = 3) {
    g.lineCap = 'round';
    g.lineJoin = 'round';
    [[INK, width + 2], [color, width]].forEach(([c, w]) => {
        g.beginPath();
        points.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
        g.strokeStyle = c;
        g.lineWidth = w;
        g.stroke();
    });
}

function dot(g, x, y, r, fill) {
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fillStyle = fill;
    g.lineWidth = 2;
    g.strokeStyle = INK;
    g.stroke();
    g.fill();
}

function ring(g, x, y, r, color, width = 3, from = 0, to = TAU) {
    [[INK, width + 2], [color, width]].forEach(([c, w]) => {
        g.beginPath();
        g.arc(x, y, r, from, to);
        g.strokeStyle = c;
        g.lineWidth = w;
        g.stroke();
    });
}

// Desenha com a origem em (x, y), girado e escalado
function at(g, x, y, angle, scale, draw) {
    g.save();
    g.translate(x, y);
    g.rotate(angle);
    g.scale(scale, scale);
    draw();
    g.restore();
}

// Espada apontando para cima, com o cabo na origem
function sword(g, x, y, angle, scale = 1, color = STEEL) {
    at(g, x, y, angle, scale, () => {
        shape(g, [[-3, -6], [0, -32], [3, -6]], color);
        line(g, [[-7, -5], [7, -5]], GOLD, 3);
        line(g, [[0, -4], [0, 4]], '#7c4a21', 3);
    });
}

function dagger(g, x, y, angle, scale = 1, color = STEEL) {
    at(g, x, y, angle, scale, () => {
        shape(g, [[-3, -3], [0, -19], [3, -3]], color);
        line(g, [[-4, -2], [4, -2]], GOLD, 2);
        line(g, [[0, -1], [0, 4]], '#7c4a21', 2);
    });
}

function flame(g, x, y, s, outer = FIRE, inner = FIRE_CORE) {
    const tongue = (k, fill) => shape(g, [
        [x, y - 15 * s * k], [x + 5 * s * k, y - 6 * s * k], [x + 9 * s * k, y - 8 * s * k], [x + 9 * s * k, y + 3 * s * k],
        [x + 4 * s * k, y + 10 * s * k], [x - 4 * s * k, y + 10 * s * k], [x - 9 * s * k, y + 3 * s * k], [x - 6 * s * k, y - 6 * s * k]
    ], fill);
    tongue(1, outer);
    tongue(0.55, inner);
}

function bolt(g, x, y, s, color = FIRE_CORE) {
    shape(g, [[x + 3 * s, y - 16 * s], [x - 8 * s, y + 2 * s], [x - 1 * s, y + 2 * s], [x - 4 * s, y + 16 * s], [x + 8 * s, y - 4 * s], [x + 1 * s, y - 4 * s]], color);
}

function heart(g, x, y, s, color) {
    g.beginPath();
    g.moveTo(x, y + 14 * s);
    g.bezierCurveTo(x - 20 * s, y, x - 12 * s, y - 15 * s, x, y - 6 * s);
    g.bezierCurveTo(x + 12 * s, y - 15 * s, x + 20 * s, y, x, y + 14 * s);
    g.closePath();
    g.fillStyle = color;
    g.lineWidth = 2;
    g.strokeStyle = INK;
    g.stroke();
    g.fill();
}

function star(g, x, y, outer, inner, tips, color, spin = -Math.PI / 2) {
    const points = [];
    for (let i = 0; i < tips * 2; i++) {
        const r = i % 2 ? inner : outer;
        const a = spin + (i / (tips * 2)) * TAU;
        points.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
    }
    shape(g, points, color);
}

function eye(g, x, y, s, iris) {
    shape(g, [[x - 17 * s, y], [x - 8 * s, y - 8 * s], [x + 8 * s, y - 8 * s], [x + 17 * s, y], [x + 8 * s, y + 8 * s], [x - 8 * s, y + 8 * s]], BONE);
    dot(g, x, y, 6 * s, iris);
    dot(g, x, y, 2.4 * s, INK);
}

function skull(g, x, y, s) {
    dot(g, x, y - 3 * s, 12 * s, BONE);
    shape(g, [[x - 7 * s, y + 5 * s], [x + 7 * s, y + 5 * s], [x + 6 * s, y + 13 * s], [x - 6 * s, y + 13 * s]], BONE);
    dot(g, x - 5 * s, y - 3 * s, 3 * s, INK);
    dot(g, x + 5 * s, y - 3 * s, 3 * s, INK);
}

function boot(g, x, y, color) {
    shape(g, [[x - 8, y - 16], [x + 4, y - 16], [x + 4, y + 2], [x + 15, y + 8], [x + 15, y + 14], [x - 8, y + 14]], color);
    line(g, [[x - 8, y - 9], [x + 4, y - 9]], GOLD, 2);
}

function hood(g, x, y, s, color, face = BONE) {
    shape(g, [[x, y - 17 * s], [x + 13 * s, y - 2 * s], [x + 15 * s, y + 16 * s], [x - 15 * s, y + 16 * s], [x - 13 * s, y - 2 * s]], color);
    dot(g, x, y - 1 * s, 6 * s, face);
}

function coin(g, x, y, r) {
    dot(g, x, y, r, GOLD);
    ring(g, x, y, r * 0.62, '#b45309', 1.5);
}

function flask(g, x, y, fill) {
    shape(g, [[x - 4, y - 18], [x + 4, y - 18], [x + 4, y - 7], [x + 14, y + 14], [x - 14, y + 14], [x - 4, y - 7]], '#334155');
    shape(g, [[x - 8, y + 1], [x + 8, y + 1], [x + 12, y + 12], [x - 12, y + 12]], fill);
}

function shield(g, x, y, s, fill) {
    shape(g, [[x, y - 18 * s], [x + 15 * s, y - 12 * s], [x + 13 * s, y + 6 * s], [x, y + 18 * s], [x - 13 * s, y + 6 * s], [x - 15 * s, y - 12 * s]], fill);
}

function snowflake(g, x, y, r, color = ICE) {
    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI;
        line(g, [[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], color, 2.5);
    }
}

const ICONS = {
    // --- Lâmina ---
    damage: (g) => { sword(g, 18, 40, 0.42); sword(g, 30, 40, -0.42); },
    atkSpeed: (g) => { sword(g, 22, 42, 0.2); line(g, [[34, 12], [42, 12]], ICE); line(g, [[32, 21], [44, 21]], ICE); line(g, [[34, 30], [42, 30]], ICE); },
    radius: (g) => { ring(g, 24, 24, 17, BLOOD, 3); dot(g, 24, 24, 4, STEEL); line(g, [[24, 24], [41, 24]], STEEL, 2); },
    slashArc: (g) => { ring(g, 12, 38, 28, ICE, 5, -1.5, -0.1); line(g, [[12, 38], [12, 10]], STEEL, 2); line(g, [[12, 38], [40, 36]], STEEL, 2); },
    keenEye: (g) => eye(g, 24, 24, 1.15, ICE),
    orbitBlades: (g) => { ring(g, 24, 24, 15, ICE, 1.5); for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; dagger(g, 24 + Math.cos(a) * 15, 24 + Math.sin(a) * 15, a + Math.PI, 0.72); } },
    knockback: (g) => { shape(g, [[6, 16], [24, 16], [24, 8], [43, 24], [24, 40], [24, 32], [6, 32]], STEEL); },
    bloodEdge: (g) => { sword(g, 18, 44, 0.1); shape(g, [[36, 12], [44, 28], [36, 36], [28, 28]], BLOOD); },
    orbitEvolve: (g) => { for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; dagger(g, 24 + Math.cos(a) * 16, 24 + Math.sin(a) * 16, a + 2.1, 0.68, GOLD); } dot(g, 24, 24, 5, ICE); },
    shadowWhirl: (g) => { ring(g, 24, 24, 18, VIOLET, 4, 0.2, 4.6); ring(g, 24, 24, 10, VIOLET, 3, 2.4, 6.4); dot(g, 24, 24, 3, BONE); },
    corpseBurst: (g) => { star(g, 24, 25, 22, 10, 9, FIRE); skull(g, 24, 25, 0.62); },
    corpseEvolve: (g) => { star(g, 24, 25, 22, 10, 9, BLOOD); heart(g, 24, 24, 0.68, '#fb7185'); },
    // --- Sombra ---
    moveSpeed: (g) => { boot(g, 21, 24, '#7c4a21'); line(g, [[38, 12], [45, 12]], ICE, 2); line(g, [[36, 21], [45, 21]], ICE, 2); },
    ricochet: (g) => { line(g, [[5, 39], [24, 9], [43, 39]], ICE, 2); dagger(g, 37, 29, 2.6, 0.75); shape(g, [[16, 8], [32, 8], [24, 3]], STEEL_DARK); },
    phantomDash: (g) => { hood(g, 30, 25, 0.9, '#1e293b'); line(g, [[4, 15], [15, 15]], VIOLET, 2.5); line(g, [[2, 25], [15, 25]], VIOLET, 2.5); line(g, [[4, 35], [15, 35]], VIOLET, 2.5); },
    emberTrail: (g) => { flame(g, 13, 32, 0.62); flame(g, 25, 24, 0.72); flame(g, 37, 15, 0.82); },
    quickHands: (g) => { shape(g, [[12, 42], [12, 18], [18, 18], [18, 8], [24, 8], [24, 18], [30, 8], [36, 11], [31, 22], [34, 42]], BONE); line(g, [[39, 26], [45, 26]], ICE, 2); line(g, [[39, 34], [45, 34]], ICE, 2); },
    soulMagnet: (g) => { ring(g, 24, 22, 14, BLOOD, 7, Math.PI, TAU); line(g, [[10, 22], [10, 35]], BLOOD, 7); line(g, [[38, 22], [38, 35]], BLOOD, 7); line(g, [[10, 36], [10, 41]], STEEL, 7); line(g, [[38, 36], [38, 41]], STEEL, 7); },
    emberEvolve: (g) => { shape(g, [[13, 44], [35, 44], [38, 30], [10, 30]], '#292524'); flame(g, 24, 22, 1.25, BLOOD, FIRE); },
    daggerMastery: (g) => { dagger(g, 24, 38, 0, 1.6); star(g, 37, 12, 7, 3, 4, FIRE_CORE); },
    shadowClone: (g) => { hood(g, 18, 23, 0.9, VIOLET, '#1e1b4b'); hood(g, 30, 26, 0.9, '#334155'); },
    longThrow: (g) => { ring(g, 16, 24, 21, '#a16207', 3.5, -1.2, 1.2); line(g, [[23, 4], [23, 44]], BONE, 1.5); dagger(g, 30, 24, Math.PI / 2, 0.85); },
    fleetFoot: (g) => { shape(g, [[8, 30], [24, 30], [36, 18], [43, 22], [30, 38], [8, 38]], ICE); shape(g, [[14, 30], [26, 12], [34, 18], [24, 30]], '#e0f2fe'); },
    fanOfKnives: (g) => { dagger(g, 24, 42, -0.62, 1.2); dagger(g, 24, 42, 0, 1.3); dagger(g, 24, 42, 0.62, 1.2); },
    // --- Chama ---
    frenzyNova: (g) => { star(g, 24, 24, 21, 11, 10, BLOOD); flame(g, 24, 25, 0.72); },
    playerHp: (g) => heart(g, 24, 24, 1.3, BLOOD),
    torchBolts: (g) => { line(g, [[17, 44], [20, 26]], '#7c4a21', 5); flame(g, 21, 17, 0.78); line(g, [[31, 14], [44, 8]], FIRE, 3); dot(g, 44, 8, 3, FIRE_CORE); },
    torchKeeper: (g) => { line(g, [[24, 44], [24, 28]], '#7c4a21', 6); shape(g, [[13, 28], [35, 28], [31, 34], [17, 34]], STEEL_DARK); flame(g, 24, 17, 0.95); },
    emberHeart: (g) => { heart(g, 24, 25, 1.25, '#7f1d1d'); flame(g, 24, 25, 0.68); },
    sunEvolve: (g) => { star(g, 24, 24, 22, 13, 12, GOLD); dot(g, 24, 24, 10, FIRE_CORE); },
    warmHearth: (g) => { line(g, [[8, 41], [40, 33]], '#7c4a21', 5); line(g, [[8, 33], [40, 41]], '#7c4a21', 5); flame(g, 24, 21, 1.05); },
    ironSkin: (g) => { shield(g, 24, 24, 1.1, STEEL_DARK); line(g, [[13, 18], [35, 18]], STEEL, 2); line(g, [[24, 8], [24, 40]], STEEL, 2); },
    mirrorWard: (g) => { dot(g, 24, 24, 18, GOLD); dot(g, 24, 24, 13, ICE); line(g, [[17, 28], [28, 16]], '#e0f2fe', 2.5); },
    // --- Maldição ---
    arcaneStudy: (g) => { shape(g, [[6, 12], [24, 17], [42, 12], [42, 38], [24, 43], [6, 38]], '#4c1d95'); line(g, [[24, 17], [24, 43]], VIOLET, 2); star(g, 15, 26, 5, 2, 4, GOLD); },
    chillAura: (g) => { ring(g, 24, 24, 19, ICE, 2); snowflake(g, 24, 24, 13); },
    chainLightning: (g) => { dot(g, 8, 10, 4, ICE); dot(g, 40, 38, 4, ICE); bolt(g, 24, 24, 1.3, ICE); },
    darkPact: (g) => { skull(g, 24, 21, 1.05); line(g, [[9, 39], [39, 43]], GOLD, 3); },
    soulNova: (g) => { ring(g, 24, 24, 19, VIOLET, 3); ring(g, 24, 24, 11, '#c4b5fd', 2.5); dot(g, 24, 24, 5, '#f5f3ff'); },
    wrathEvolve: (g) => { shape(g, [[8, 20], [15, 10], [33, 10], [41, 20], [33, 26], [15, 26]], STEEL_DARK); bolt(g, 18, 33, 0.72, FIRE_CORE); bolt(g, 32, 33, 0.72, FIRE_CORE); },
    starfall: (g) => { line(g, [[42, 4], [24, 24]], FIRE, 3); line(g, [[34, 3], [18, 20]], FIRE_CORE, 2); star(g, 18, 30, 14, 6, 5, FIRE_CORE); },
    novaEvolve: (g) => { shape(g, [[24, 3], [41, 14], [41, 34], [24, 45], [7, 34], [7, 14]], '#0ea5e9'); snowflake(g, 24, 24, 15, '#f0f9ff'); },
    // --- Relíquias ---
    greedyIdol: (g) => { shape(g, [[14, 8], [34, 8], [37, 42], [11, 42]], '#78716c'); dot(g, 18, 20, 3, GOLD); dot(g, 30, 20, 3, GOLD); line(g, [[17, 31], [31, 31]], INK, 2); },
    luckyCoin: (g) => { coin(g, 24, 24, 19); dot(g, 20, 20, 4, GREEN); dot(g, 28, 20, 4, GREEN); dot(g, 20, 28, 4, GREEN); dot(g, 28, 28, 4, GREEN); },
    witchEye: (g) => { dot(g, 24, 24, 19, '#581c87'); eye(g, 24, 24, 0.82, '#f50bca'); },
    emberFlask: (g) => flask(g, 24, 25, FIRE),
    warmCloak: (g) => { shape(g, [[17, 7], [31, 7], [43, 43], [26, 38], [22, 38], [5, 43]], '#9a3412'); line(g, [[18, 12], [30, 12]], GOLD, 3); },
    ironHeart: (g) => { heart(g, 24, 24, 1.3, STEEL_DARK); line(g, [[14, 20], [34, 20]], STEEL, 2); line(g, [[24, 10], [24, 38]], STEEL, 2); },
    secondPrayer: (g) => { ring(g, 24, 14, 11, GOLD, 3); line(g, [[24, 25], [24, 44]], BONE, 4); line(g, [[15, 32], [33, 32]], BONE, 4); },
    berserkDraught: (g) => flask(g, 24, 25, BLOOD),
    thornCrown: (g) => { for (let i = 0; i < 5; i++) shape(g, [[6 + i * 7.2, 34], [10 + i * 7.2, 12 + (i % 2) * 7], [14 + i * 7.2, 34]], '#4d7c0f'); line(g, [[5, 36], [43, 36]], '#7c4a21', 4); },
    furyStone: (g) => { shape(g, [[24, 4], [41, 19], [33, 44], [15, 44], [7, 19]], '#b91c1c'); line(g, [[24, 4], [24, 44]], '#fca5a5', 1.5); line(g, [[7, 19], [41, 19]], '#fca5a5', 1.5); },
    hunterMark: (g) => { ring(g, 24, 24, 17, BLOOD, 3); line(g, [[24, 2], [24, 46]], BONE, 2); line(g, [[2, 24], [46, 24]], BONE, 2); dot(g, 24, 24, 3, BLOOD); },
    boneCharm: (g) => { line(g, [[13, 35], [35, 13]], BONE, 6); dot(g, 10, 31, 4, BONE); dot(g, 17, 38, 4, BONE); dot(g, 31, 10, 4, BONE); dot(g, 38, 17, 4, BONE); }
};

// Evoluções: o poder evoluído troca para o ícone do nó de evolução
const EVOLVED_ICONS = {
    orbitBlades: 'orbitEvolve', emberTrail: 'emberEvolve', corpseBurst: 'corpseEvolve',
    chainLightning: 'wrathEvolve', soulNova: 'novaEvolve', torchBolts: 'sunEvolve'
};

const keys = Object.keys(ICONS);
const rows = Math.ceil(keys.length / COLUMNS);
let atlasReady = false;

// Monta o atlas uma vez. O canvas vira uma imagem e é descartado
function buildAtlas() {
    atlasReady = true;
    const canvas = document.createElement('canvas');
    canvas.width = CELL * COLUMNS;
    canvas.height = CELL * rows;
    const g = canvas.getContext('2d');
    keys.forEach((key, i) => {
        g.save();
        g.translate((i % COLUMNS) * CELL, Math.floor(i / COLUMNS) * CELL);
        ICONS[key](g);
        g.restore();
    });
    const root = document.documentElement.style;
    root.setProperty('--skill-atlas', `url(${canvas.toDataURL('image/png')})`);
    root.setProperty('--skill-atlas-size', `${COLUMNS * 100}% ${rows * 100}%`);
}

// Coloca o ícone num elemento (substitui o conteúdo)
export function setSkillIcon(element, key) {
    if (!atlasReady) buildAtlas();
    const i = keys.indexOf(key);
    element.textContent = '';
    const icon = document.createElement('i');
    icon.className = 'skill-icon';
    icon.style.backgroundPosition = `${((i % COLUMNS) / (COLUMNS - 1)) * 100}% ${(Math.floor(i / COLUMNS) / Math.max(1, rows - 1)) * 100}%`;
    element.appendChild(icon);
}

export function getPowerIconKey(power) {
    return power.evolved ? EVOLVED_ICONS[power.key] : power.key;
}
