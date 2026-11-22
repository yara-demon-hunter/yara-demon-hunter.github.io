import { buildSpriteSheet, drawSheetFrame, frameAt } from './scenery_kit.js';
import { getProp } from './props/index.js';
import { createRandom } from '../core/random.js';

// --- RECEITA DO CENÁRIO ---
// Um cenário feito de peças: a BASE (o chão, o clima) é desenhada por ele; o resto vem da lista `visual.props`, a receita:
//
//   props: [
//     { prop: 'moss', per100kPx: 12 },                                          // estática: número fixo
//     { prop: 'rock', per100kPx: 0.4, avoidCenter: 90, maxTries: 60 },          // sem nascer perto da tocha
//     { prop: 'fern', per100kPx: [0.8, 0.45, 0.2], frames: [10, 6, 4], variants: 3, size: 1.8, cycleSeconds: 3.4,
//       avoidCenter: 70, palette: { frond: '#2f5f50' } }                        // animada: listas por nível de detalhe
//   ]
//
//   prop          o id da peça (scenery/props/<id>)
//   per100kPx     quantas por 100 mil unidades quadradas do mundo; número ou lista [detalhe 0, 1, 2]
//   avoidCenter   raio em volta do centro (a tocha) onde a peça não nasce
//   maxTries      (estática) limite de sorteios ao evitar o centro
//   zone          { axis: 'y', from: 0.4, to: 0.6, invert?: true }: só nasce nessa faixa do mundo (fração da altura; axis 'x' = da largura);
//                 invert = só nasce FORA da faixa. Rios, estradas, margens.
//   avoidRect     [x0, y0, x1, y1] (frações do mundo): retângulo onde a peça não nasce (uma ponte, um portão)
//   palette       troca valores padrão da peça só neste cenário (cores, medidas)
//   animadas:     frames (lista por detalhe: menos quadros = atlas menor), variants, size (entra no desenho e na célula: o
//                 atlas nasce nítido), cycleSeconds (duração do balanço ou do pulso)
//
// OBJETOS COLOCADOS À MÃO (editor: tools/scenery_editor.html): `visual.placed` é uma lista de { prop, x, y, seed, scale?, flip?, rot? (graus, só estáticas), front? (estática na frente das animadas), palette? (cores só deste objeto), occlude? (esconde quem passa atrás: padrão da peça), id? (para uma área de trás se ligar a ele) }, com x e y em
// FRAÇÃO do mundo (0 a 1: valem em qualquer tela). Entram depois da receita; as estáticas são pintadas no chão e as animadas viram atlas
// (um por peça; parâmetros em `prop.anim` ou PLACED_ANIM). `visual.placedPalette[<id da peça>]` troca a paleta dos colocados.
//
//   visual.baked   lista de índices de entradas da receita "convertidas" em objetos editáveis pelo editor (tools/scenery_editor.html): a entrada
//                  continua sorteando (o resto do cenário não muda) mas não desenha; os objetos dela ficam em visual.placed com `from` (o índice)
//                  e, nas estáticas, `attrs` (a aparência sorteada); nas animadas, `variant`, `scale` e `phase`.
//
// A ORDEM da receita é a ordem em que as peças estáticas são pintadas e em que o sorteio é consumido: mudá-la muda o cenário.
// O chão (paintBase) vem sempre antes das peças. O motor (scenery.js) recebe o resultado como um cenário comum.

const TAU = Math.PI * 2;
const PLACED_ANIM = { frames: [6, 4, 3], size: 1.5, cycleSeconds: 3 };
// Onde a peça pode nascer: faixa (zone) e retângulo proibido (avoidRect). Sem nenhum dos dois, vale tudo (cenários antigos intactos).
function allowed(entry, x, y, w, h) {
    const z = entry.zone;
    if (z) {
        const v = (z.axis === 'x' ? x / w : y / h);
        if ((v >= z.from && v <= z.to) === Boolean(z.invert)) return false;
    }
    const a = entry.avoidRect;
    return !(a && x >= a[0] * w && x <= a[2] * w && y >= a[1] * h && y <= a[3] * h);
}
// Objeto colocado que ESCONDE quem passa atrás dele (casa, catedral): a peça declara `occludes: true` e o objeto pode mudar com `occlude`.
// Vira um sprite (não é pintado no chão) e o jogo o redesenha por cima do herói quando ele está atrás (last_torch/js/render/scenery.js).
const occludes = (pl, prop) => (pl.occlude ?? prop.occludes) === true;
const spriteRect = (sheet, x, y, scale) => ({ x0: x - sheet.anchor[0] * sheet.cell[0] * scale, y0: y - sheet.anchor[1] * sheet.cell[1] * scale, x1: x + (1 - sheet.anchor[0]) * sheet.cell[0] * scale, y1: y + (1 - sheet.anchor[1]) * sheet.cell[1] * scale });
const perQuality = (value, quality) => (Array.isArray(value) ? value[quality] : value);

// Os valores padrão da peça, com o que a receita trocou por cima. Lê a cada chamada: o tuner edita ao vivo.
const paletteOf = (prop, entry) => ({ ...prop.visual, ...entry.palette });

export function composeScenery({ id, name, visual, paintBase }) {
    const entries = () => visual.props.map(entry => ({ entry, prop: getProp(entry.prop) }));

    // Receita "convertida" em objetos editáveis (visual.baked = índices das entradas): o sorteio continua igual (assim o resto do cenário
    // não muda), mas a entrada não desenha mais: quem desenha são os objetos em visual.placed, que têm a posição de cada peça.
    const isBaked = (idx) => Boolean(visual.baked?.includes(idx));
    // Guarda a lista de objetos "capturados" enquanto o editor analisa a receita (scenery.bake): nada é desenhado nem montado.
    const state = { capture: null };

    // O chão: a base e depois as peças estáticas, na ordem da receita
    function paintGround(g, w, h, rand, env) {
        paintBase(g, w, h, rand, env, visual);
        const density = (w * h) / 100000;
        entries().forEach(({ entry, prop }, idx) => {
            if (prop.kind !== 'static') return;
            const p = paletteOf(prop, entry);
            const count = perQuality(entry.per100kPx, env.quality) * density;
            const emit = (x, y, attrs) => {
                if (state.capture) state.capture.push({ entry: idx, prop: entry.prop, kind: 'static', x: x / w, y: y / h, attrs });
                else if (!isBaked(idx)) prop.draw(g, x, y, attrs, p);
            };
            if (entry.avoidCenter === undefined && !entry.zone && !entry.avoidRect) {
                for (let i = 0; i < count; i++) {
                    const x = rand() * w;
                    const y = rand() * h;
                    emit(x, y, prop.roll(rand, p));
                }
                return;
            }
            const maxTries = entry.maxTries ?? (entry.zone || entry.avoidRect ? Math.ceil(count * 12) + 20 : 60);
            for (let i = 0, placed = 0; placed < count && i < maxTries; i++) {
                const x = rand() * w;
                const y = rand() * h;
                const attrs = prop.roll(rand, p);      // os atributos são sorteados antes de saber se a peça cabe
                if (Math.hypot(x - w / 2, y - h / 2) < (entry.avoidCenter ?? 0) || !allowed(entry, x, y, w, h)) continue;
                placed++;
                emit(x, y, attrs);
            }
        });
        if (state.capture) return;
        // Colocadas à mão (estáticas): na posição exata, com a escala e o espelho escolhidos.
        // Se vieram da receita (from), levam a paleta da entrada e os atributos sorteados (attrs); senão, uma aparência pela seed.
        (visual.placed ?? []).forEach(pl => {
            const prop = getProp(pl.prop);
            if (prop.kind !== 'static' || pl.front || occludes(pl, prop)) return;          // `front` e as que escondem quem passa atrás: sprites (buildSway)
            const p = { ...prop.visual, ...(pl.from !== undefined ? visual.props[pl.from]?.palette : null), ...visual.placedPalette?.[pl.prop], ...pl.palette };
            const x = pl.x * w;
            const y = pl.y * h;
            const s = pl.scale ?? 1;
            g.save();
            g.translate(x, y);
            if (pl.rot) g.rotate(pl.rot * Math.PI / 180);          // graus; só peças estáticas giram (as animadas vêm de atlas)
            g.scale((pl.flip ? -1 : 1) * s, s);
            g.translate(-x, -y);
            prop.draw(g, x, y, pl.attrs ?? prop.roll(createRandom(pl.seed ?? 1), p), p);
            g.restore();
        });
    }

    // As peças animadas: um atlas por entrada da receita (só se aparecer neste nível de detalhe) e a posição de cada uma
    function buildSway(w, h, rand, quality, env) {
        const density = (w * h) / 100000;
        const items = [];
        let bytes = 0;
        let index = 0;
        entries().forEach(({ entry, prop }, idx) => {
            if (prop.kind !== 'animated') return;
            const slot = index++;
            const count = Math.round(perQuality(entry.per100kPx, quality) * density);
            if (count <= 0) return;                      // sem atlas para o que não aparece: é memória que não se gasta
            const live = !state.capture && !isBaked(idx);
            const p = paletteOf(prop, entry);
            const size = entry.size ?? 1;
            const variants = entry.variants ?? prop.variants;
            const sheet = live ? buildSpriteSheet({
                cell: [prop.cell[0] * size, prop.cell[1] * size], anchor: prop.anchor, frames: perQuality(entry.frames, quality),
                variants, res: env.res, seed: visual.seed + slot * 977,
                paint: (g, r, phase) => {
                    g.scale(size, size);
                    prop.paint(g, r, phase, p);
                }
            }) : null;
            if (sheet) bytes += sheet.bytes;
            let placed = 0;
            for (let tries = 0; placed < count && tries < count * (entry.zone || entry.avoidRect ? 40 : 10); tries++) {
                const x = rand() * w;
                const y = rand() * h;
                if (Math.hypot(x - w / 2, y - h / 2) < (entry.avoidCenter ?? 0) || !allowed(entry, x, y, w, h)) continue;
                const variant = Math.floor(rand() * 99) % variants;
                const scale = 0.85 + rand() * 0.3;
                const jitter = rand() * 0.1;
                placed++;
                if (state.capture) { state.capture.push({ entry: idx, prop: entry.prop, kind: 'animated', x: x / w, y: y / h, variant, scale, phase: jitter }); continue; }
                if (!live) continue;
                items.push({
                    sheet, x, y, variant, scale, cycle: entry.cycleSeconds,
                    // Defasagem pela posição: as rajadas atravessam a tela da esquerda para a direita
                    offset: (x * visual.windWaveLength + y * visual.windWaveLength * 0.4) / TAU + jitter
                });
            }
        });
        if (state.capture) return { items, bytes };
        // Colocadas à mão, na ORDEM da lista (a ordem é a sobreposição: o último fica na frente). Vão para a camada das peças animadas:
        //  - animadas: um atlas por peça (e por entrada da receita de onde vieram), uma posição por objeto;
        //  - estáticas com `front: true`: viram um sprite de um quadro só, para poderem ficar NA FRENTE de casas e braseiros (as estáticas
        //    normais são pintadas no chão, que fica sempre atrás das animadas).
        const sheets = new Map();
        let g2 = 0;
        (visual.placed ?? []).forEach(pl => {
            const prop = getProp(pl.prop);
            const occ = occludes(pl, prop);
            if (prop.kind === 'static') {
                if (!pl.front && !occ) return;
                const p = { ...prop.visual, ...(pl.from !== undefined ? visual.props[pl.from]?.palette : null), ...visual.placedPalette?.[pl.prop], ...pl.palette };
                const s = pl.scale ?? 1;
                const half = (prop.extent ? prop.extent(p) : (prop.previewSize ?? 40)) * 0.75 * s + 16;            // cabe a peça girada em qualquer ângulo
                const sheet = buildSpriteSheet({
                    cell: [half * 2, half * 2], anchor: [0.5, 0.5], frames: 1, variants: 1, res: env.res, seed: visual.seed + 12000 + g2++ * 977,
                    paint: (g) => {
                        if (pl.rot) g.rotate(pl.rot * Math.PI / 180);
                        g.scale((pl.flip ? -1 : 1) * s, s);
                        prop.draw(g, 0, 0, pl.attrs ?? prop.roll(createRandom(pl.seed ?? 1), p), p);
                    }
                });
                bytes += sheet.bytes;
                const sx = pl.x * w;
                const sy = pl.y * h;
                items.push({ sheet, x: sx, y: sy, variant: 0, scale: 1, cycle: 1, offset: 0, ...(occ ? { occ: { id: pl.id }, rect: spriteRect(sheet, sx, sy, 1) } : null) });
                return;
            }
            const key = `${pl.prop}#${pl.from ?? ''}#${pl.palette ? JSON.stringify(pl.palette) : ''}`;      // cores próprias = outro atlas
            if (!sheets.has(key)) {
                const entry = pl.from !== undefined ? visual.props[pl.from] : null;
                const a = entry
                    ? { frames: entry.frames, size: entry.size ?? 1, cycleSeconds: entry.cycleSeconds, variants: entry.variants ?? prop.variants }
                    : { ...PLACED_ANIM, variants: prop.variants, ...prop.anim };
                const p = { ...prop.visual, ...entry?.palette, ...(entry ? null : visual.placedPalette?.[pl.prop]), ...pl.palette };
                const sheet = buildSpriteSheet({
                    cell: [prop.cell[0] * a.size, prop.cell[1] * a.size], anchor: prop.anchor, frames: perQuality(a.frames, quality),
                    variants: a.variants, res: env.res, seed: visual.seed + 9000 + g2++ * 977,
                    paint: (g, r, phase) => {
                        g.scale(a.size, a.size);
                        prop.paint(g, r, phase, p);
                    }
                });
                bytes += sheet.bytes;
                sheets.set(key, { sheet, a });
            }
            const { sheet, a } = sheets.get(key);
            const x = pl.x * w;
            const y = pl.y * h;
            items.push({
                sheet, x, y, variant: Math.abs(pl.variant ?? pl.seed ?? 0) % a.variants, scale: pl.scale ?? 1, cycle: a.cycleSeconds,
                offset: (x * visual.windWaveLength + y * visual.windWaveLength * 0.4) / TAU + (pl.phase ?? 0),
                ...(occ ? { occ: { id: pl.id }, rect: spriteRect(sheet, x, y, pl.scale ?? 1) } : null)
            });
        });
        return { items, bytes };
    }

    // Um sprite só (o jogo redesenha por cima do herói os que escondem quem passa atrás)
    function drawItem(ctx, t, it) {
        drawSheetFrame(ctx, it.sheet, it.variant, frameAt(it.sheet, t, it.cycle, it.offset), it.x, it.y, it.scale);
    }

    function drawSway(ctx, t, built) {
        const { items } = built;
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            drawSheetFrame(ctx, it.sheet, it.variant, frameAt(it.sheet, t, it.cycle, it.offset), it.x, it.y, it.scale);
        }
    }

    return { id, name, visual, paintGround, buildSway, drawSway, drawItem, state };
}
