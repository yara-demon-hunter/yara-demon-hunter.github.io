import { BOSS_MODELS } from '../../data_model/bosses.js';
import { MONSTER_MODELS } from '../../data_model/monsters.js';
import { DEMON_LORD_VISUALS } from '../../library/monsters/topdown/demon_lord/demon_lord_visual.js';
import { BAT_VISUALS } from '../../library/monsters/topdown/bat/bat_visual.js';
import { BLOATER_VISUALS } from '../../library/monsters/topdown/bloater/bloater_visual.js';
import { MOTH_VISUALS } from '../../library/monsters/topdown/moth/moth_visual.js';
import { SKELETON_VISUALS } from '../../library/monsters/topdown/skeleton/skeleton_visual.js';
import {
    MONSTER_ART, MONSTER_SPRITES, MONSTER_SPRITES_25D, SPRITE_DIRECTIONS, SPRITE_FRAMES, SPRITE_MAX_SCALE, SPRITE_MIN_SCALE,
    SPRITE_UNDERLAY_PIXELS
} from '../../data_model/visuals/monsters/sprites_visual.js';
import { MONSTERS_25D } from '../../library/monsters/25d/index.js';
import { VAMPIRE_VISUALS } from '../../library/monsters/topdown/vampire/vampire_visual.js';
import { WITCH_VISUALS } from '../../library/monsters/topdown/witch/witch_visual.js';
import { SHADOW_WOLF_VISUALS } from '../../library/monsters/topdown/shadow_wolf/shadow_wolf_visual.js';
import { ZOMBIE_WOLF_VISUALS } from '../../library/monsters/topdown/zombie_wolf/zombie_wolf_visual.js';
import { BONE_COLOSSUS_VISUALS } from '../../library/monsters/topdown/bone_colossus/bone_colossus_visual.js';
import { HEADLESS_KNIGHT_VISUALS } from '../../library/monsters/topdown/headless_knight/headless_knight_visual.js';
import { WRAITH_VISUALS } from '../../library/monsters/topdown/wraith/wraith_visual.js';
import { BOSS_PALETTES, NECROMANCER_COLORS } from '../../data_model/visuals/bosses/palettes_visual.js';
import { ctx, setDrawTarget, state } from '../core/state.js';
import { renderBat } from '../../library/monsters/topdown/bat/bat.js';
import { renderBloater } from '../../library/monsters/topdown/bloater/bloater.js';
import { renderDemonFireball, renderDemonLord } from '../../library/monsters/topdown/demon_lord/demon_lord.js';
import { setRenderClock } from '../../library/core/clock.js';
import { drawGlow, getGlowSprite } from '../../library/core/glow.js';
import { makeCanvas } from './fx/sprites.js';
import { drawDagger } from './knife.js';
import { renderMoth } from '../../library/monsters/topdown/moth/moth.js';
import { renderRival } from './rival.js';
import { renderSkeleton } from '../../library/monsters/topdown/skeleton/skeleton.js';
import { renderVampire } from '../../library/monsters/topdown/vampire/vampire.js';
import { renderWitch, renderWitchBolt } from '../../library/monsters/topdown/witch/witch.js';
import { renderShadowWolf } from '../../library/monsters/topdown/shadow_wolf/shadow_wolf.js';
import { renderZombieWolf } from '../../library/monsters/topdown/zombie_wolf/zombie_wolf.js';
import { renderBoneColossus } from '../../library/monsters/topdown/bone_colossus/bone_colossus.js';
import { renderHeadlessKnight } from '../../library/monsters/topdown/headless_knight/headless_knight.js';
import { renderWraith } from '../../library/monsters/topdown/wraith/wraith.js';

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

const TAU = Math.PI * 2;
const USE_25D = MONSTER_ART === '25d';

const ART_TOPDOWN = {
    SKELETON: { visual: SKELETON_VISUALS, draw: renderSkeleton },
    SKELETON_CRAWLER: { visual: SKELETON_VISUALS, draw: renderSkeleton },
    BAT: { visual: BAT_VISUALS, draw: renderBat },
    VAMPIRE: { visual: VAMPIRE_VISUALS, draw: renderVampire },
    WITCH: { visual: WITCH_VISUALS, draw: renderWitch },
    NECROMANCER: { visual: WITCH_VISUALS, draw: (e) => withColors(WITCH_VISUALS, NECROMANCER_COLORS, () => renderWitch(e)) },
    MOTH: { visual: MOTH_VISUALS, draw: renderMoth },
    BLOATER: { visual: BLOATER_VISUALS, draw: renderBloater },
    WRAITH: { visual: WRAITH_VISUALS, draw: renderWraith },
    SHADOW_WOLF: { visual: SHADOW_WOLF_VISUALS, draw: renderShadowWolf },
    ZOMBIE_WOLF: { visual: ZOMBIE_WOLF_VISUALS, draw: renderZombieWolf },
    HEADLESS_KNIGHT: { visual: HEADLESS_KNIGHT_VISUALS, draw: renderHeadlessKnight },
    BONE_COLOSSUS: { visual: BONE_COLOSSUS_VISUALS, draw: renderBoneColossus }
};

// --- OS MONSTROS 2.5D ---
// Cada tipo do jogo → o boneco 2.5D da biblioteca (library/monsters/25d). P: as medidas e cores dele. A aura e a sombra
// do chão vêm do "underlay" (bakeUnderlay), que lê visual: o 2.5D mede a aura em unidades do boneco, então vira
// "raios do monstro" aqui; a sombra o próprio boneco já desenha.
const FOLDER_25D = {
    SKELETON: 'skeleton', SKELETON_CRAWLER: 'skeleton_crawler', BAT: 'bat', VAMPIRE: 'vampire', WITCH: 'witch',
    NECROMANCER: 'witch', MOTH: 'moth', BLOATER: 'bloater', WRAITH: 'wraith', SHADOW_WOLF: 'shadow_wolf',
    ZOMBIE_WOLF: 'zombie_wolf', HEADLESS_KNIGHT: 'headless_knight', BONE_COLOSSUS: 'bone_colossus'
};
const artOf25D = (type) => {
    const { visuals: P, render } = MONSTERS_25D[FOLDER_25D[type]];
    const visual = { scale: 1, auraRadius: P.auraRadius * P.scalePerRadius, auraAlpha: P.auraAlpha, shadowAlpha: 0, colors: P.colors };
    const draw = type === 'NECROMANCER' ? (e) => withColors(P, { ...P.colors, ...NECROMANCER_COLORS }, () => render(e)) : render;
    return { visual, draw, P };
};
const ART_25D = Object.fromEntries(Object.keys(FOLDER_25D).map(type => [type, artOf25D(type)]));

const ART = USE_25D ? ART_25D : ART_TOPDOWN;
// Os atlas a gravar (um por tipo) e as especificações de cada um
const SPECS = USE_25D ? MONSTER_SPRITES_25D : MONSTER_SPRITES;

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
    const spec = SPECS[type];
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

// Atlas direcional do 2.5D: SPRITE_DIRECTIONS linhas (uma por direção, a 0 = para a direita, girando para baixo) x
// SPRITE_FRAMES colunas. O boneco tem "cima" fixo na tela, então o sprite não pode girar: ele é gravado olhando para
// cada direção, andando, e o jogo escolhe a mais próxima. O corpo fica no centro do quadro (ver monster25d.js).
const WARMUP_STEPS_25D = 8;         // basta para a capa e a postura se assentarem em cada direção
function bakeMonster25D(type, pixels) {
    const spec = SPECS[type];
    const model = MONSTER_MODELS[type];
    const { visual, draw, P } = ART[type];
    const unit = model.radius * P.scalePerRadius * (P.bodyScale ?? 1);       // pixels do mundo por unidade do boneco
    const worldSize = spec.extent * 2 * unit;
    const cell = Math.ceil(worldSize * pixels);
    const frames = spec.frames ?? SPRITE_FRAMES;
    const directions = spec.directions ?? SPRITE_DIRECTIONS;
    const atlas = makeCanvas(cell * frames, cell * directions);
    const target = atlas.getContext('2d');
    const scratch = makeCanvas(1, 1).getContext('2d');
    const previous = setDrawTarget(scratch);
    const previousState = state.gameState;
    state.gameState = 'PLAYING';            // a arte só anima durante a partida
    const frameSeconds = spec.bakeSeconds / frames;

    for (let d = 0; d < directions; d++) {
        const angle = (d / directions) * TAU;
        // Boneco de mentira, longe de tudo, andando para essa direção. baking: a arte pula aura e balanços
        const e = {
            x: -100000, y: -100000, vx: 0, vy: 0, angle, phase: 0, hp: 1, maxHp: 1, shootTimer: 99,
            radius: model.radius, color: model.color, type, baking: true
        };
        let clock = 1000;
        const advance = (seconds) => {
            clock += seconds * 1000;
            e.x += Math.cos(angle) * spec.speed * seconds;
            e.y += Math.sin(angle) * spec.speed * seconds;
            setRenderClock(clock);
        };
        setRenderClock(clock);
        draw(e);
        for (let i = 0; i < WARMUP_STEPS_25D; i++) {
            advance(MAX_STEP_SECONDS);
            draw(e);
        }
        for (let f = 0; f < frames; f++) {
            advance(frameSeconds);
            e.bakeFrame = f / frames;            // a passada fecha o ciclo: o último quadro leva ao primeiro
            setDrawTarget(target);
            target.setTransform(pixels, 0, 0, pixels, (f + 0.5) * cell - e.x * pixels, (d + 0.5) * cell - e.y * pixels);
            draw(e);
            setDrawTarget(scratch);
        }
    }

    setDrawTarget(previous);
    setRenderClock(null);
    state.gameState = previousState;

    return {
        atlas,
        cell,
        worldSize,
        radius: model.radius,
        directions,
        frames,
        underlay: bakeUnderlay(type),
        underlaySize: model.radius * visual.auraRadius * 2,
        spec
    };
}

// Recorte do atlas para um monstro virado para angle, no ponto cycle (0 a 1) da animação. rotation: quanto girar o
// carimbo (o desenho 2D de cima gira com o monstro; o 2.5D tem uma direção por linha e não gira)
export function spriteFrame(sprite, angle, cycle) {
    const frame = Math.floor(cycle * (sprite.frames ?? SPRITE_FRAMES)) % (sprite.frames ?? SPRITE_FRAMES);
    if (!sprite.directions) return { sx: frame * sprite.cell, sy: 0, rotation: angle };
    const n = sprite.directions;
    const dir = (((Math.round((angle / TAU) * n)) % n) + n) % n;
    return { sx: frame * sprite.cell, sy: dir * sprite.cell, rotation: 0 };
}

// Quadro para mostrar parado (bestiário): virado para baixo, para a câmera, no primeiro quadro
export function spritePortrait(sprite) {
    return spriteFrame(sprite, Math.PI / 2, 0);
}

function bakeNext() {
    const type = queue.shift();
    if (!type) return;
    sprites[type] = (USE_25D ? bakeMonster25D : bakeMonster)(type, bakedScale);
    if (queue.length > 0) bakeTimer = setTimeout(bakeNext, 0);
}

// Gera aos poucos, um tipo por vez, sem travar a página ao abrir
export function scheduleMonsterSprites() {
    bakedScale = getTargetScale();
    queue = Object.keys(SPECS);
    clearTimeout(bakeTimer);
    bakeTimer = setTimeout(bakeNext, 0);
}

// Antes da partida: termina o que faltar. Se a tela mudou muito de tamanho, gera de novo.
export function ensureMonsterSprites() {
    const target = getTargetScale();
    if (!bakedScale || Math.abs(target / bakedScale - 1) > RESCALE_THRESHOLD) {
        bakedScale = target;
        queue = Object.keys(SPECS);
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
    VAMPIRE: { visual: VAMPIRE_VISUALS, extent: 1.05, shift: 0.1, draw: renderVampire },
    // Rival: o boneco do herói (js/render/rival.js), sem paleta trocável
    RIVAL: { visual: { scale: 1 }, extent: 1.7, shift: 0.05, draw: renderRival }
};
const portraits = {};

// Os bosses 2.5D (Demon Lord e Vampiro; o Rival continua o boneco do herói): extent em unidades do boneco
const BOSS_FOLDER_25D = { DEMON_LORD: 'demon_lord', VAMPIRE: 'vampire' };
const BOSS_EXTENT_25D = { DEMON_LORD: 34, VAMPIRE: 20 };

// Quem desenha um boss 2.5D ao vivo: o boneco com a paleta do boss (a paleta troca só as cores que ela traz)
const bossPaletteCache = {};
export function withBossPalette25D(renderAs, paletteKey, e) {
    const { visuals: P, render } = MONSTERS_25D[BOSS_FOLDER_25D[renderAs]];
    const cacheKey = `${renderAs}/${paletteKey}`;
    const colors = bossPaletteCache[cacheKey] ??= { ...P.colors, ...(BOSS_PALETTES[paletteKey] ?? {}) };
    withColors(P, colors, () => render(e));
}

function bakeBossPortrait25D(key) {
    const model = BOSS_MODELS[key];
    const { visuals: P } = MONSTERS_25D[BOSS_FOLDER_25D[model.renderAs]];
    const unit = model.radius * P.scalePerRadius * (P.bodyScale ?? 1);
    const pixels = PORTRAIT_PIXELS / (BOSS_EXTENT_25D[model.renderAs] * 2 * unit);
    const atlas = makeCanvas(PORTRAIT_PIXELS, PORTRAIT_PIXELS);
    const target = atlas.getContext('2d');
    // De frente para a câmera (o jogo vê de cima: "para baixo" é o rosto virado para quem olha)
    const e = {
        x: 0, y: 0, vx: 0, vy: 0, angle: Math.PI / 2, phase: 0,
        hp: 1, maxHp: 1, shootTimer: 99, radius: model.radius, color: model.color, type: key,
        baking: true
    };
    const previous = setDrawTarget(target);
    target.setTransform(pixels, 0, 0, pixels, PORTRAIT_PIXELS / 2, PORTRAIT_PIXELS / 2);
    withBossPalette25D(model.renderAs, model.palette, e);
    setDrawTarget(previous);
    return { atlas, cell: PORTRAIT_PIXELS };
}

function bakeBossPortrait(key) {
    const model = BOSS_MODELS[key];
    if (USE_25D && BOSS_FOLDER_25D[model.renderAs]) return bakeBossPortrait25D(key);
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

// Chave do BOSS_MODELS (DEMON_LORD, BLOOD_COUNTESS, LONG_NIGHT, AZAEL, DEMON_HUNTER). Gera na primeira vez.
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

// Tiro dos rivais: adaga em voo com um brilho na cor dele
function drawBossDagger(p) {
    const scale = p.radius * 0.24;
    drawGlow(ctx, p.color, p.x, p.y, p.radius * 1.6, 0.5);
    ctx.save();
    ctx.translate(p.x - 3 * scale, p.y);
    ctx.scale(scale, scale);
    drawDagger(ctx, 0);
    ctx.restore();
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
    else if (BOSS_MODELS[owner]?.projectileStyle === 'dagger') drawBossDagger(p);
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
