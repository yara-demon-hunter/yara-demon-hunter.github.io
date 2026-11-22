// --- ZONAS DE NASCIMENTO DO CENÁRIO ---
// Áreas verdes desenhadas no editor de cenários (_library/tools/scenery_editor.html, tipo "Nascimento") e gravadas no layout
// (colliders com kind: 'spawn'). Dizem ONDE os monstros nascem. Cada zona tem:
//   weight  a chance de ser sorteada entre as zonas que servem (padrão 1)
//   types   quais monstros nascem nela (lista de tipos, como 'SKELETON'); vazia = serve para todos
//   boss    true = zona do CHEFE: é onde o círculo de invocação dele aparece (e só ele usa)
// Para cada monstro valem primeiro as zonas que listam o tipo dele; se não há, as zonas sem tipos; se também não há, ele nasce pela
// borda do mundo como sempre (pickSpawnPoint devolve null e o spawner usa o caminho antigo). Cenário sem zonas = nada muda.
import { state } from '../core/state.js';
import { fittedSize, getSceneryColliders } from '../render/scenery.js';
import { blockedAt } from './colliders.js';

const compiled = { source: null, w: 0, h: 0, list: [] };

function zones() {
    const raw = getSceneryColliders();
    if (!raw || raw.length === 0) return compiled.list.length ? (compiled.list = []) : compiled.list;
    if (compiled.source === raw && compiled.w === state.width && compiled.h === state.height) return compiled.list;
    compiled.source = raw;
    compiled.w = state.width;
    compiled.h = state.height;
    compiled.list = [];
    for (const c of raw) {
        if (c.kind !== 'spawn') continue;
        const rot = (c.rot ?? 0) * Math.PI / 180;
        const f = fittedSize(c, state.width, state.height);
        compiled.list.push({
            rect: c.shape === 'rect', cx: c.x * state.width, cy: c.y * state.height,
            hw: f.w / 2, hh: f.h / 2, r: f.r, ry: f.ry, cr: f.cr,
            cos: Math.cos(rot), sin: Math.sin(rot),
            weight: Math.max(0, c.weight ?? 1), types: Array.isArray(c.types) ? c.types : [], boss: c.boss === true
        });
    }
    return compiled.list;
}

// Um ponto sorteado DENTRO da zona (retângulo com cantos arredondados, círculo ou elipse, tudo girado)
function sampleIn(z) {
    let lx;
    let ly;
    if (z.rect) {
        const ax = z.hw - z.cr;
        const ay = z.hh - z.cr;
        for (let i = 0; i < 12; i++) {                       // sorteia no retângulo e descarta o que cai fora do canto arredondado
            lx = (Math.random() * 2 - 1) * z.hw;
            ly = (Math.random() * 2 - 1) * z.hh;
            const qx = Math.max(-ax, Math.min(ax, lx));
            const qy = Math.max(-ay, Math.min(ay, ly));
            if (Math.hypot(lx - qx, ly - qy) <= z.cr) break;
        }
    } else {
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random());
        lx = Math.cos(a) * d * z.r;
        ly = Math.sin(a) * d * z.ry;
    }
    return { x: z.cx + lx * z.cos - ly * z.sin, y: z.cy + lx * z.sin + ly * z.cos };
}

function pickFrom(list, flag = 'monsters') {
    const total = list.reduce((sum, z) => sum + z.weight, 0);
    if (list.length === 0 || total <= 0) return null;
    let roll = Math.random() * total;
    const zone = list.find(z => (roll -= z.weight) < 0) ?? list[list.length - 1];
    for (let i = 0; i < 24; i++) {
        const p = sampleIn(zone);
        p.x = Math.max(20, Math.min(state.width - 20, p.x));
        p.y = Math.max(20, Math.min(state.height - 20, p.y));
        if (!blockedAt(p.x, p.y, 12, flag)) return p;       // nunca nasce dentro de uma parede (área de contato)
    }
    return null;
}

// Onde nasce um monstro comum deste tipo (null = sem zona para ele: o spawner usa a borda)
export function pickSpawnPoint(type) {
    const all = zones();
    if (all.length === 0) return null;
    const own = all.filter(z => !z.boss && z.types.includes(type));
    const any = own.length ? own : all.filter(z => !z.boss && z.types.length === 0);
    return pickFrom(any);
}

// Onde o chefe nasce (null = sem zona de chefe)
export function pickBossSpawnPoint() {
    const all = zones();
    if (all.length === 0) return null;
    return pickFrom(all.filter(z => z.boss));
}
