import { buildSpriteSheet, drawSheetFrame, frameAt } from './scenery_kit.js';
import { getProp } from './props/index.js';

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
//   palette       troca valores padrão da peça só neste cenário (cores, medidas)
//   animadas:     frames (lista por detalhe: menos quadros = atlas menor), variants, size (entra no desenho e na célula: o
//                 atlas nasce nítido), cycleSeconds (duração do balanço ou do pulso)
//
// A ORDEM da receita é a ordem em que as peças estáticas são pintadas e em que o sorteio é consumido: mudá-la muda o cenário.
// O chão (paintBase) vem sempre antes das peças. O motor (scenery.js) recebe o resultado como um cenário comum.

const TAU = Math.PI * 2;
const perQuality = (value, quality) => (Array.isArray(value) ? value[quality] : value);

// Os valores padrão da peça, com o que a receita trocou por cima. Lê a cada chamada: o tuner edita ao vivo.
const paletteOf = (prop, entry) => ({ ...prop.visual, ...entry.palette });

export function composeScenery({ id, name, visual, paintBase }) {
    const entries = () => visual.props.map(entry => ({ entry, prop: getProp(entry.prop) }));

    // O chão: a base e depois as peças estáticas, na ordem da receita
    function paintGround(g, w, h, rand, env) {
        paintBase(g, w, h, rand, env);
        const density = (w * h) / 100000;
        entries().forEach(({ entry, prop }) => {
            if (prop.kind !== 'static') return;
            const p = paletteOf(prop, entry);
            const count = perQuality(entry.per100kPx, env.quality) * density;
            if (entry.avoidCenter === undefined) {
                for (let i = 0; i < count; i++) {
                    const x = rand() * w;
                    const y = rand() * h;
                    prop.draw(g, x, y, prop.roll(rand, p), p);
                }
                return;
            }
            const maxTries = entry.maxTries ?? 60;
            for (let i = 0, placed = 0; placed < count && i < maxTries; i++) {
                const x = rand() * w;
                const y = rand() * h;
                const attrs = prop.roll(rand, p);      // os atributos são sorteados antes de saber se a peça cabe
                if (Math.hypot(x - w / 2, y - h / 2) < entry.avoidCenter) continue;
                placed++;
                prop.draw(g, x, y, attrs, p);
            }
        });
    }

    // As peças animadas: um atlas por entrada da receita (só se aparecer neste nível de detalhe) e a posição de cada uma
    function buildSway(w, h, rand, quality, env) {
        const density = (w * h) / 100000;
        const items = [];
        let bytes = 0;
        let index = 0;
        entries().forEach(({ entry, prop }) => {
            if (prop.kind !== 'animated') return;
            const slot = index++;
            const count = Math.round(perQuality(entry.per100kPx, quality) * density);
            if (count <= 0) return;                      // sem atlas para o que não aparece: é memória que não se gasta
            const p = paletteOf(prop, entry);
            const size = entry.size ?? 1;
            const variants = entry.variants ?? prop.variants;
            const sheet = buildSpriteSheet({
                cell: [prop.cell[0] * size, prop.cell[1] * size], anchor: prop.anchor, frames: perQuality(entry.frames, quality),
                variants, res: env.res, seed: visual.seed + slot * 977,
                paint: (g, r, phase) => {
                    g.scale(size, size);
                    prop.paint(g, r, phase, p);
                }
            });
            bytes += sheet.bytes;
            let placed = 0;
            for (let tries = 0; placed < count && tries < count * 10; tries++) {
                const x = rand() * w;
                const y = rand() * h;
                if (Math.hypot(x - w / 2, y - h / 2) < (entry.avoidCenter ?? 0)) continue;
                const variant = Math.floor(rand() * 99) % variants;
                const scale = 0.85 + rand() * 0.3;
                const jitter = rand() * 0.1;
                placed++;
                items.push({
                    sheet, x, y, variant, scale, cycle: entry.cycleSeconds,
                    // Defasagem pela posição: as rajadas atravessam a tela da esquerda para a direita
                    offset: (x * visual.windWaveLength + y * visual.windWaveLength * 0.4) / TAU + jitter
                });
            }
        });
        return { items, bytes };
    }

    function drawSway(ctx, t, built) {
        const { items } = built;
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            drawSheetFrame(ctx, it.sheet, it.variant, frameAt(it.sheet, t, it.cycle, it.offset), it.x, it.y, it.scale);
        }
    }

    return { id, name, visual, paintGround, buildSway, drawSway };
}
