// --- HERÓIS DO PALCO (biblioteca de personagens) ---
// Os bonecos 2.5D (Demon Hunter, Azael, Yara, Zeph, Oskar) vêm da biblioteca: library/characters/, cópia de
// mini_games/_library gerada por `ruby mini_games/_library/sync.rb` (nunca edite library/). Este módulo liga a
// biblioteca à câmera do palco e expõe para os scripts clássicos:
//   window.YaraStage25D.hero { createAnim, updateAnim, startSwing, render, bladeTip, headTop, moves }
//   window.YaraRpgData.visuals.hero25d { hero, body, azael, yara, zeph, oskar }  (paleta e medidas de cada boneco)
// O que é só do palco (peso da altura, arco do golpe, empurrão, sombra, capa, salto mais baixo) está em
// js/data/visuals/stage.js → hero.
// Entra como módulo em partials/scripts.html, depois de js/data/visuals/stage.js e antes de js/stage/stage.js.
import { setCtx } from '../../library/core/canvas.js';
import { HERO_VISUALS } from '../../library/characters/hunter/hero_visual.js';
import { HERO_25D_VISUALS } from '../../library/characters/hunter/hero25d_visual.js';
import { renderHero25D, heroBladeTip } from '../../library/characters/hunter/hero25d.js';
import { createHeroAnim, steerHeroAnim, startHeroSwing } from '../../library/characters/hunter/hero_anim.js';
import { BODIES } from '../../library/characters/hunter/body_registry.js';
import { AZAEL_VISUALS } from '../../library/characters/azael/azael_visual.js';
import { YARA_VISUALS } from '../../library/characters/yara/yara_visual.js';
import { ZEPH_VISUALS } from '../../library/characters/zeph/zeph_visual.js';
import { OSKAR_VISUALS } from '../../library/characters/oskar/oskar_visual.js';
import '../../library/characters/azael/azael25d.js';
import '../../library/characters/yara/yara25d.js';
import '../../library/characters/zeph/zeph25d.js';
import '../../library/characters/oskar/oskar25d.js';

const NS = window.YaraStage25D = window.YaraStage25D || {};
const DATA = window.YaraRpgData = window.YaraRpgData || {};
DATA.visuals = DATA.visuals || {};
const STAGE_HERO = DATA.visuals.stage?.hero ?? {};

const V = HERO_25D_VISUALS;
DATA.visuals.hero25d = Object.freeze({
    hero: HERO_VISUALS, body: V, azael: AZAEL_VISUALS, yara: YARA_VISUALS, zeph: ZEPH_VISUALS, oskar: OSKAR_VISUALS
});

// Golpes especiais: os da biblioteca com os ajustes do palco por cima
const MOVES = Object.fromEntries(Object.entries(V.moves).map(([kind, move]) => [kind, { ...move, ...(STAGE_HERO.moves?.[kind] ?? {}) }]));

// Câmera e relógio de um quadro do palco (opts de render: { x, y, scale, model, colors, camera, frenzy, alpha, time })
function viewOf(opts) {
    return {
        camera: {
            heightScale: opts.camera?.heightScale ?? V.heightScale,
            groundSquash: opts.camera?.groundSquash ?? V.groundSquash,
            depthHeightWeight: STAGE_HERO.depthHeightWeight ?? V.depthHeightWeight
        },
        scale: opts.scale,
        time: (opts.time ?? performance.now() / 1000) * 1000,
        moves: MOVES,
        knockback: STAGE_HERO.knockback ? { ...HERO_VISUALS.knockback, ...STAGE_HERO.knockback } : undefined,
        frenzyGlow: STAGE_HERO.frenzyGlow,
        body: STAGE_HERO.body
    };
}

// O corpo do palco ({ hitTime em s, hitDirX, hitDirY, move }) no formato da biblioteca, com os pés em (x, y)
function bodyOf(body, opts) {
    return {
        x: opts.x,
        y: opts.y,
        hitTime: (body.hitTime ?? -99) * 1000,
        hitDirX: body.hitDirX || 0,
        hitDirY: body.hitDirY || 0,
        iFrames: 0,
        move: body.move,
        enraged: !!opts.frenzy
    };
}

const colorsOf = (model) => (BODIES[model]?.vis.colors ?? HERO_VISUALS.colors);

function createAnim(facing = 0) {
    const a = createHeroAnim(false);
    a.facing = facing;
    return a;
}

function render(context, body, a, opts) {
    const previous = setCtx(context);
    context.save();
    context.globalAlpha *= opts.alpha ?? 1;
    try {
        const model = opts.model || 'hunter';
        return renderHero25D(bodyOf(body, opts), a, opts.colors || colorsOf(model), null, model, viewOf(opts));
    } finally {
        context.restore();
        setCtx(previous);
    }
}

function bladeTip(body, a, opts) {
    return heroBladeTip(bodyOf(body, opts), a, opts.model || 'hunter', viewOf(opts));
}

// Altura do topo da cabeça na tela (unidades × escala), para pôr números e ícones acima do herói
function headTop(opts) {
    const hs = opts.camera?.heightScale ?? V.heightScale;
    return (V.headHeight + V.hoodRadius + 1) * hs * opts.scale * (BODIES[opts.model]?.vis.bodyScale ?? 1);
}

NS.hero = {
    createAnim,
    updateAnim: (a, body, dt) => steerHeroAnim(a, body, dt),
    startSwing: (a, step) => startHeroSwing(a, step, STAGE_HERO.swingHalfArc),
    render,
    bladeTip,
    headTop,
    moves: MOVES
};
