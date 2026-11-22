// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/river_eel/river_eel25d.js e rode o sync.
import { RIVER_EEL_25D_VISUALS as S } from './river_eel25d_visual.js';
import { registerCreature, poly, glowAt } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';

const TAU = Math.PI * 2;

// --- ENGUIA DO RIO 2.5D ---
// Serpente d'água azul: o corpo é uma fila de bolas que ondula em S (mais rápido ao andar), engrossa na cabeça e afina até a cauda; a nadadeira das
// costas e as manchas ciano seguem a fila. A cabeça sobe, com olhos que brilham e a boca aberta cheia de dentes. Peças ordenadas pela profundidade.
// Medidas e cores: river_eel25d_visual.js. Uso: renderRiverEel25D(e), ou o modelo 'river_eel' em renderHero25D.
function parts(pose, rig) {
    const { C, project, ball, limb } = rig;
    const t = pose.t;
    const hz = S.waveHz + S.waveHzRun * pose.run;
    const pts = [];
    for (let i = 0; i <= S.segments; i++) {
        const k = i / S.segments;
        const rise = (1 - k) * (1 - k);
        pts.push({
            p: [S.headA - i * S.spacing, Math.sin(t * hz * TAU - k * S.waveLength * TAU * 0.5) * S.waveAmp * (0.3 + k * 0.9), S.baseZ + (S.headHeight - S.baseZ) * rise],
            r: S.thick * (1 - (1 - S.tailThin) * k) * (i === 0 ? 0.9 : 1)
        });
    }
    const items = [];
    for (let i = S.segments; i >= 0; i--) {
        const { p, r } = pts[i];
        items.push({
            depth: project(...p).depth,
            draw() {
                ball(p, r + 0.35, C.outline);
                ball(p, r, i % 2 ? C.body : C.bodyDark);
                ball([p[0] + 0.1, p[1], p[2] + r * 0.35], r * 0.62, C.bodyLight);
                ball([p[0] + 0.2, p[1], p[2] - r * 0.55], r * 0.4, C.belly);
                if (i > 0 && i < S.segments && i % S.spotEvery === 0) {
                    const sp = [p[0], p[1], p[2] + r * 0.9];
                    glowAt(rig, sp, C.spotGlow, 2.1, 0.5);
                    ball(sp, 0.4, C.spot);
                }
                // Nadadeira nas costas: um triângulo entre este pedaço e o seguinte
                if (i > 0 && i < S.segments) {
                    const q = pts[i + 1];
                    poly(rig, [[p[0], p[1], p[2] + r * 0.9], [p[0] - S.spacing * 0.3, p[1], p[2] + r + S.finHeight * (1 - i / S.segments * 0.5)], [q.p[0], q.p[1], q.p[2] + q.r * 0.9]], C.fin, C.finEdge, 0.25);
                }
            }
        });
    }
    const h = pts[0].p;
    const R = S.headR;
    // Cabeça: focinho, boca aberta com dentes, olhos e as barbatanas do pescoço
    items.push({
        depth: project(h[0] + 1.2, h[1], h[2]).depth + 0.05,
        draw() {
            for (const sd of [-1, 1]) {
                poly(rig, [[h[0] - 1.2, sd * 1.4, h[2] - 0.8], [h[0] - 3.2, sd * 4.2, h[2] - 1.8], [h[0] - 2.6, sd * 1.8, h[2] - 2.4]], C.fin, C.finEdge, 0.25);
            }
            ball([h[0], h[1], h[2]], R + 0.35, C.outline);
            ball([h[0], h[1], h[2]], R, C.body);
            ball([h[0] + R * 0.85, h[1], h[2] - R * 0.15], R * 0.72 + 0.3, C.outline);
            ball([h[0] + R * 0.85, h[1], h[2] - R * 0.15], R * 0.72, C.bodyLight);
            const mouth = [h[0] + R * 1.35, h[1], h[2] - R * 0.5];
            ball(mouth, R * 0.42, C.mouth);
            for (const k of [-0.5, -0.17, 0.17, 0.5]) limb([[mouth[0] + 0.1, mouth[1] + k * R * 0.7, mouth[2] + R * 0.28], [mouth[0] + 0.15, mouth[1] + k * R * 0.7, mouth[2] + R * 0.04]], 0.2, C.tooth);
            for (const sd of [-1, 1]) {
                const eye = [h[0] + R * 0.78, sd * R * 0.62, h[2] + R * 0.4];
                glowAt(rig, eye, C.eyeGlow, 2.6, 0.8);
                ball(eye, 0.48, C.eye);
            }
        }
    });
    return items;
}

registerCreature('river_eel', S, parts);

export function renderRiverEel25D(e) {
    renderMonster25D(e, 'river_eel', S);
}
