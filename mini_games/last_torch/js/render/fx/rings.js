// --- ANÉIS TRACEJADOS ---
// setLineDash refaz o tracejado a cada traço. Aqui o caminho é montado uma vez por raio e reaproveitado.
const TAU = Math.PI * 2;
const MAX_CACHED = 24;
const rings = new Map();

// dash: comprimento de cada traço e do espaço entre eles (em unidades do mundo). Centrado na origem.
export function getDashedRing(radius, dash) {
    const size = Math.round(radius);
    const key = size * 100 + dash;
    let ring = rings.get(key);
    if (!ring) {
        if (rings.size >= MAX_CACHED) rings.clear();
        ring = new Path2D();
        const count = Math.max(6, Math.round((size * TAU) / (dash * 2)));
        for (let i = 0; i < count; i++) {
            const from = (i / count) * TAU;
            ring.moveTo(Math.cos(from) * size, Math.sin(from) * size);
            ring.arc(0, 0, size, from, from + (TAU / count) * 0.5);
        }
        rings.set(key, ring);
    }
    return ring;
}
