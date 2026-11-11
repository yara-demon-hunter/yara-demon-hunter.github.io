// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/bat/bat25d.js e rode o sync.
import { BAT_25D_VISUALS as S } from './bat25d_visual.js';
import { registerCreature, poly, glowAt, facesCamera } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';
import { mix } from '../../../characters/hunter/kit25d.js';

// --- MORCEGO 2.5D ---
// O Morcego de topdown/bat/bat.js voando em 2.5D: corpo peludo, cabeça com orelhas pontudas (rosa por dentro), olhos
// vermelhos brilhando e presinhas; as duas asas de membrana (borda recortada em "dentes", ossos escuros) batem para
// cima e para baixo, e o corpo sobe quando elas descem. Medidas: bat25d_visual.js (cores do topdown).
// Uso: renderBat25D(e), ou o modelo 'bat' em renderHero25D.
function wing(rig, side, z0, elev, sway) {
    const { C, limb } = rig;
    const rootFront = [1.1, sway + side * S.bodyRadius * 0.6, z0 + 0.6];
    const rootBack = [1.1 - S.wingChord, sway + side * S.bodyRadius * 0.5, z0];
    const tip = [-S.wingSweep, sway + side * (S.bodyRadius * 0.6 + S.wingSpan * Math.cos(elev)), z0 + 0.6 + S.wingSpan * Math.sin(elev)];
    const pts = [rootFront, tip];
    const bones = [tip];
    for (let i = 1; i <= S.wingScallops; i++) {
        // "Dente" da membrana entre dois ossos, puxado para dentro da asa
        pts.push(mix(mix(tip, rootBack, (i - 0.5) / S.wingScallops), rootFront, 0.22));
        const p = mix(tip, rootBack, i / S.wingScallops);
        pts.push(p);
        bones.push(p);
    }
    poly(rig, pts, C.wing, C.wingEdge, 0.45);
    bones.slice(0, S.wingBones + 1).forEach(p => limb([rootFront, p], 0.35, C.wingBone));
    return mix(rootFront, tip, 0.5);
}

function parts(pose, rig) {
    const { C, project, ball, limb } = rig;
    const t = pose.t;
    const flap = Math.sin(t * S.flapHz * Math.PI * 2);
    const sway = Math.sin(t * S.wobbleHz * Math.PI * 2) * S.wobble;
    const z0 = S.flyHeight - flap * S.bob;
    const elev = flap * S.flapAngle;
    const body = [-0.6, sway, z0];
    const head = [S.headForward, sway, z0 + 0.8];
    const wingPart = (side) => {
        const mid = [-S.wingSweep * 0.5, sway + side * S.wingSpan * 0.5, z0 + S.wingSpan * 0.5 * Math.sin(elev)];
        return { depth: project(...mid).depth, draw: () => wing(rig, side, z0, elev, sway) };
    };
    return [wingPart(-1), wingPart(1), {
        depth: project(...body).depth + 0.2,
        draw() {
            // Corpo peludo: duas bolas, a de trás mais escura
            limb([[body[0] - S.bodyLength * 0.45, sway, z0 - 0.3], [body[0] + S.bodyLength * 0.3, sway, z0]], S.bodyRadius * 2 + 0.5, C.wingBone);
            limb([[body[0] - S.bodyLength * 0.45, sway, z0 - 0.3], [body[0] + S.bodyLength * 0.3, sway, z0]], S.bodyRadius * 2, C.body);
            ball([body[0] - S.bodyLength * 0.3, sway, z0 - 0.4], S.bodyRadius * 0.7, C.bodyShade);
            // Orelhas pontudas, rosa por dentro
            for (const side of [-1, 1]) {
                const base = [head[0] - 0.4, sway + side * S.earSpread * 0.5, head[2] + S.headRadius * 0.6];
                const tip = [head[0] + 0.3, sway + side * S.earSpread * 1.35, head[2] + S.headRadius * 0.6 + S.earLength];
                const front = [head[0] + 0.9, sway + side * S.earSpread * 0.3, head[2] + S.headRadius * 0.7];
                poly(rig, [base, tip, front], C.ear, C.wingBone, 0.3);
                poly(rig, [mix(base, front, 0.3), mix(mix(base, front, 0.5), tip, 0.75), mix(base, front, 0.8)], C.earInner);
            }
            ball(head, S.headRadius + 0.25, C.wingBone);
            ball(head, S.headRadius, C.body);
            // Olhos vermelhos e presinhas: só de frente
            for (const side of [-1, 1]) {
                const eye = [head[0] + S.headRadius * 0.75, sway + side * S.headRadius * 0.45, head[2] + 0.35];
                if (!facesCamera(rig, eye, head)) continue;
                glowAt(rig, eye, C.eyeGlow, S.eyeGlow, 0.8);
                ball(eye, 0.38, C.eye);
                const fang = [head[0] + S.headRadius * 0.9, sway + side * S.headRadius * 0.25, head[2] - S.headRadius * 0.45];
                limb([fang, [fang[0] + 0.1, fang[1], fang[2] - 0.8]], 0.3, C.fang);
            }
        }
    }];
}

registerCreature('bat', S, parts);

export function renderBat25D(e) {
    renderMonster25D(e, 'bat', S);
}
