import { BOSS_MODELS } from '../../data_model/bosses.js';
import { MONSTER_MODELS } from '../../data_model/monsters.js';
import { DEMON_LORD_VISUALS } from '../../data_model/visuals/bosses/demon_lord_visual.js';
import { BAT_VISUALS } from '../../data_model/visuals/monsters/bat_visual.js';
import { BLOATER_VISUALS } from '../../data_model/visuals/monsters/bloater_visual.js';
import { MOTH_VISUALS } from '../../data_model/visuals/monsters/moth_visual.js';
import { SKELETON_VISUALS } from '../../data_model/visuals/monsters/skeleton_visual.js';
import {
    MONSTER_SPRITES, SPRITE_FRAMES, SPRITE_MAX_SCALE, SPRITE_MIN_SCALE, SPRITE_UNDERLAY_PIXELS
} from '../../data_model/visuals/monsters/sprites_visual.js';
import { VAMPIRE_VISUALS } from '../../data_model/visuals/monsters/vampire_visual.js';
import { WITCH_VISUALS } from '../../data_model/visuals/monsters/witch_visual.js';
import { ZOMBIE_WOLF_VISUALS } from '../../data_model/visuals/monsters/zombie_wolf_visual.js';
import { HEADLESS_KNIGHT_VISUALS } from '../../data_model/visuals/monsters/headless_knight_visual.js';
import { WRAITH_VISUALS } from '../../data_model/visuals/monsters/wraith_visual.js';
import { BOSS_PALETTES, NECROMANCER_COLORS } from '../../data_model/visuals/bosses/palettes_visual.js';
import { ctx, setDrawTarget, state } from '../core/state.js';
import { renderBat } from './bat.js';
import { renderBloater } from './bloater.js';
import { renderDemonFireball, renderDemonLord } from './demon_lord.js';
import { setRenderClock } from './fx/clock.js';
import { drawGlow, getGlowSprite } from './fx/glow.js';
import { makeCanvas } from './fx/sprites.js';
import { renderMoth } from './moth.js';
import { renderSkeleton } from './skeleton.js';
import { renderVampire } from './vampire.js';
import { renderWitch, renderWitchBolt } from './witch.js';
import { renderZombieWolf } from './zombie_wolf.js';
import { renderHeadlessKnight } from './headless_knight.js';
import { renderWraith } from './wraith.js';

// --- SPRITES DOS MONSTROS ---
// A arte continua procedural: os mesmos renderizadores desenham o monstro andando, com o relógio e o
// destino controlados, e cada quadro vai para um atlas. Daí em diante, cada monstro em campo é só
// um drawImage girado, em vez de dezenas de caminhos por quadro.
const MAX_STEP_SECONDS = 0.04;      // os renderizadores limitam o dt: passos maiores travariam a animação
const WARMUP_SECONDS = 1;           // deixa o boneco entrar no ritmo da corrida
const RESCALE_THRESHOLD = 0.3;      // a tela mudou tanto assim: gera de novo

// Reaproveita a arte de um monstro com outra paleta (bosses e necromante)
export function withColors(visuals, colors, draw) {
    if (!colors) {
        draw();
        return;
    }
    const original = visuals.colors;
    visuals.colors = colors;
    draw();
    visuals.colors = original;
}

const ART = {
    SKELETON: { visual: SKELETON_VISUALS, draw: renderSkeleton },
    BAT: { visual: BAT_VISUALS, draw: renderBat },
    VAMPIRE: { visual: VAMPIRE_VISUALS, draw: renderVampire },
    WITCH: { visual: WITCH_VISUALS, draw: renderWitch },
    NECROMANCER: { visual: WITCH_VISUALS, draw: (e) => withColors(WITCH_VISUALS, NECROMANCER_COLORS, () => renderWitch(e)) },
    MOTH: { visual: MOTH_VISUALS, draw: renderMoth },
    BLOATER: { visual: BLOATER_VISUALS, draw: renderBloater },
    WRAITH: { visual: WRAITH_VISUALS, draw: renderWraith },
    ZOMBIE_WOLF: { visual: ZOMBIE_WOLF_VISUALS, draw: renderZombieWolf },
    HEADLESS_KNIGHT: { visual: HEADLESS_KNIGHT_VISUALS, draw: renderHeadlessKnight }
};

const sprites = {};
let bakedScale = 0;
let queue = [];
let bakeTimer = 0;

function getTargetScale() {
    const { scale, pixelRatio } = state.view;
    return Math.max(SPRITE_MIN_SCALE, Math.min(SPRITE_MAX_SCALE, scale * pixelRatio));
}

// Aura e sombra no chão: borradas, em resolução baixa, e sem girar junto com o monstro
function bakeUnderlay(type) {
    const { visual } = ART[type];
    const size = SPRITE_UNDERLAY_PIXELS;
    const reach = visual.auraRadius;            // em raios desenhados
    const unit = size / (reach * 2);
    return makeCanvas(size, size, (g) => {
        g.globalAlpha = visual.auraAlpha;
        g.drawImage(getGlowSprite(visual.colors.aura), 0, 0, size, size);
        g.globalAlpha = 1;
        g.fillStyle = `rgba(0, 0, 0, ${visual.shadowAlpha ?? 0.28})`;
        g.beginPath();
        g.ellipse(size / 2 + unit * 0.1, size / 2 + unit * 0.33, unit * 0.8, unit * 0.42, 0, 0, Math.PI * 2);
        g.fill();
    });
}

function bakeMonster(type, pixels) {
    const spec = MONSTER_SPRITES[type];
    const model = MONSTER_MODELS[type];
    const { visual, draw } = ART[type];
    const drawnRadius = model.radius * visual.scale;
    const worldSize = drawnRadius * spec.extent * 2;
    const cell = Math.ceil(worldSize * pixels);
    const atlas = makeCanvas(cell * SPRITE_FRAMES, cell);
    const target = atlas.getContext('2d');

    // Boneco de mentira, longe de tudo, andando para +x. baking: a arte pula aura, sombra e balanço
    const e = {
        x: -100000, y: -100000, vx: 0, vy: 0, angle: 0, phase: 0,
        hp: 1, maxHp: 1, shootTimer: 99, radius: model.radius, color: model.color, type,
        baking: true
    };
    let clock = 1000;
    const advance = (seconds) => {
        clock += seconds * 1000;
        e.x += spec.speed * seconds;
        setRenderClock(clock);
    };

    const scratch = makeCanvas(1, 1).getContext('2d');
    const previous = setDrawTarget(scratch);
    const previousState = state.gameState;
    state.gameState = 'PLAYING';            // a arte só anima durante a partida
    setRenderClock(clock);
    draw(e);

    const warmupSteps = Math.ceil(WARMUP_SECONDS / MAX_STEP_SECONDS);
    for (let i = 0; i < warmupSteps; i++) {
        advance(MAX_STEP_SECONDS);
        draw(e);
    }

    const frameSeconds = spec.bakeSeconds / SPRITE_FRAMES;
    const steps = Math.ceil(frameSeconds / MAX_STEP_SECONDS);
    for (let f = 0; f < SPRITE_FRAMES; f++) {
        for (let s = 1; s < steps; s++) {
            advance(frameSeconds / steps);
            draw(e);
        }
        advance(frameSeconds / steps);
        setDrawTarget(target);
        target.setTransform(pixels, 0, 0, pixels, (f + 0.5) * cell - e.x * pixels, cell / 2 - e.y * pixels);
        draw(e);
        setDrawTarget(scratch);
    }

    setDrawTarget(previous);
    setRenderClock(null);
    state.gameState = previousState;

    return {
        atlas,
        cell,
        worldSize,
        radius: model.radius,
        underlay: bakeUnderlay(type),
        underlaySize: drawnRadius * visual.auraRadius * 2,
        spec
    };
}

function bakeNext() {
    const type = queue.shift();
    if (!type) return;
    sprites[type] = bakeMonster(type, bakedScale);
    if (queue.length > 0) bakeTimer = setTimeout(bakeNext, 0);
}

// Gera aos poucos, um tipo por vez, sem travar a página ao abrir
export function scheduleMonsterSprites() {
    bakedScale = getTargetScale();
    queue = Object.keys(MONSTER_SPRITES);
    clearTimeout(bakeTimer);
    bakeTimer = setTimeout(bakeNext, 0);
}

// Antes da partida: termina o que faltar. Se a tela mudou muito de tamanho, gera de novo.
export function ensureMonsterSprites() {
    const target = getTargetScale();
    if (!bakedScale || Math.abs(target / bakedScale - 1) > RESCALE_THRESHOLD) {
        bakedScale = target;
        queue = Object.keys(MONSTER_SPRITES);
    }
    clearTimeout(bakeTimer);
    while (queue.length > 0) bakeNext();
}

export function getMonsterSprite(type) {
    return sprites[type];
}

// --- RETRATOS DOS BOSSES ---
// Bosses são desenhados direto em campo (animações de ataque próprias), então não há atlas. Para o
// bestiário, um único quadro parado vira um retrato, no mesmo formato de getMonsterSprite.
const PORTRAIT_PIXELS = 224;
const BOSS_PORTRAITS = {
    // extent: metade do quadro, em raios desenhados (asas e cauda do Demon Lord pedem mais espaço)
    // shift: desloca o corpo no quadro, em frações dele, para centralizar o que a arte estende para trás
    DEMON_LORD: { visual: DEMON_LORD_VISUALS, extent: 2.7, shift: 0.25, draw: renderDemonLord },
    VAMPIRE: { visual: VAMPIRE_VISUALS, extent: 1.05, shift: 0.1, draw: renderVampire }
};
const portraits = {};

function bakeBossPortrait(key) {
    const model = BOSS_MODELS[key];
    const { visual, extent, shift, draw } = BOSS_PORTRAITS[model.renderAs];
    const worldSize = model.radius * visual.scale * extent * 2;
    const pixels = PORTRAIT_PIXELS / worldSize;
    const atlas = makeCanvas(PORTRAIT_PIXELS, PORTRAIT_PIXELS);
    const target = atlas.getContext('2d');

    const e = {
        x: 0, y: 0, vx: 0, vy: 0, angle: 0, phase: 0,
        hp: 1, maxHp: 1, shootTimer: 99, radius: model.radius, color: model.color, type: key,
        baking: true
    };
    const previous = setDrawTarget(target);
    target.setTransform(pixels, 0, 0, pixels, PORTRAIT_PIXELS * (0.5 + shift), PORTRAIT_PIXELS / 2);
    withColors(visual, BOSS_PALETTES[model.palette], () => draw(e));
    setDrawTarget(previous);
    return { atlas, cell: PORTRAIT_PIXELS };
}

// Chave do BOSS_MODELS (DEMON_LORD, BLOOD_COUNTESS, LONG_NIGHT). Gera na primeira vez.
export function getBossPortrait(key) {
    if (!BOSS_MODELS[key]) return undefined;
    return portraits[key] ??= bakeBossPortrait(key);
}

// --- PROJÉTEIS ---
// Um boss enche a tela de tiros: cada tipo é desenhado uma vez, com rastro, apontando para +x.
const BOLT_PIXELS = 2.5;            // pixels por unidade do mundo
const BOLT_LENGTH = 8;              // tamanho do sprite, em raios do tiro
const BOLT_HEIGHT = 3.6;
const bolts = new Map();

// Tiro dos demais bosses: orbe na cor de quem atirou
function drawOrb(p) {
    const r = p.radius;
    drawGlow(ctx, p.color, p.x, p.y, r * 1.7, 0.75);
    ctx.fillStyle = p.color;
    for (let i = 1; i <= 3; i++) {
        ctx.globalAlpha = 0.5 / i;
        ctx.beginPath();
        ctx.arc(p.x - r * i * 1.3, p.y, r * (1 - i * 0.18), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
}

function bakeBolt(owner, color, radius) {
    const width = radius * BOLT_LENGTH;
    const height = radius * BOLT_HEIGHT;
    const canvas = makeCanvas(width * BOLT_PIXELS, height * BOLT_PIXELS);
    const target = canvas.getContext('2d');
    target.scale(BOLT_PIXELS, BOLT_PIXELS);
    const p = { x: width * 0.72, y: height / 2, vx: 1, vy: 0, radius, color };
    const previous = setDrawTarget(target);
    if (owner === 'WITCH') renderWitchBolt(p);
    else if (owner === 'DEMON_LORD') renderDemonFireball(p);
    else drawOrb(p);
    setDrawTarget(previous);
    return { canvas, radius, width, height, centerShift: width * 0.22 };
}

export function getBoltSprite(owner, color, radius) {
    let sprite = bolts.get(owner);
    if (!sprite) {
        sprite = bakeBolt(owner, color, radius);
        bolts.set(owner, sprite);
    }
    return sprite;
}
