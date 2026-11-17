// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/golem/golem25d.js e rode o sync.
import { GOLEM_25D_VISUALS as S } from './golem25d_visual.js';
import { registerCreature, glowAt, facesCamera } from '../creature25d.js';
import { renderMonster25D } from '../monster25d.js';
import { mix } from '../../../characters/hunter/kit25d.js';
import { ctx } from '../../../core/canvas.js';
import { host } from '../../../core/host.js';
import { renderNow } from '../../../core/clock.js';
import { drawGlow } from '../../../core/glow.js';

const TAU = Math.PI * 2;

// --- GOLEM DE BRASA E MUSGO 2.5D (monstro) ---
// Feito a partir do teste de fotorrealismo (tools/lab/monstro_foto.*), mas leve: tudo é pedra em bolas e membros do boneco 2.5D,
// sem textura nem pós-processamento (o desenho é gravado num atlas de sprites). O "fotorrealismo" vira três truques baratos:
// cada peça tem sombra embaixo e luz em cima (volume), o musgo cobre só as faces de cima, e a lava e o núcleo brilham com um
// único glow. Duas pernas, tronco largo de blocos, dois braços com punhos enormes, cabeça com chifres e olhos de brasa.
// Medidas e cores: golem25d_visual.js. Uso: renderGolem25D(e); e.swing (0..1) ergue os braços para o soco.
let swing = null;
const swingNow = () => swing ?? 0;

// Uma pedra: contorno escuro, corpo, luz de cima/frente; mossy põe um capuz de musgo no alto
function rock(rig, p, r, mossy = false) {
    const { C, ball } = rig;
    ball(p, r * 1.07, C.ink);
    ball(p, r, C.stone);
    ball([p[0] + r * 0.22, p[1] - r * 0.12, p[2] + r * 0.38], r * 0.7, C.stoneLight);
    if (mossy) {
        ball([p[0] - r * 0.25, p[1] + r * 0.3, p[2] + r * 0.7], r * 0.36, C.moss);
        ball([p[0] - r * 0.15, p[1] + r * 0.35, p[2] + r * 0.85], r * 0.2, C.mossLight);
    }
}

// Rachadura de lava entre dois pontos: linha escura com fio laranja e miolo claro
function crack(rig, a, b, w = 0.5) {
    const { C, limb } = rig;
    limb([a, b], w * 1.9, C.stoneDark);
    limb([a, b], w, C.lava);
    limb([a, b], w * 0.35, C.lavaLight);
}

function leg(rig, pose, side) {
    const g = rig.anim.stride + (side > 0 ? 0 : Math.PI);
    const run = pose.run;
    const hip = [0, side * S.legSpread, S.hipHeight];
    const reach = Math.sin(g) * S.stride * (0.15 + run);
    const lift = Math.max(0, Math.cos(g)) * S.footLift * (0.15 + run);
    const foot = [reach, side * S.legSpread * 1.1, 2.2 + lift];
    const knee = [reach * 0.45 + 1, side * S.legSpread * 1.05, S.hipHeight * 0.5 + lift * 0.5];
    return {
        depth: rig.project(...knee).depth,
        draw() {
            rock(rig, hip, S.legWidth * 0.95, false);
            rock(rig, knee, S.legWidth * 0.85, false);
            rock(rig, [foot[0] + 1, foot[1], foot[2] - 0.4], S.legWidth * 1.05, true);
            crack(rig, [knee[0] + 1.6, knee[1], knee[2] - 1.2], [foot[0] + 1.8, foot[1], foot[2] + 1.2], 0.4);
        }
    };
}

function arm(rig, pose, side) {
    const g = rig.anim.stride + (side > 0 ? Math.PI : 0);
    const run = pose.run;
    const k = swingNow();
    const shoulder = [0.4, side * (S.torsoWidth * 0.78), S.chestHeight - 2.5];
    const idle = [Math.sin(g) * 2.5 * run + 2, side * (S.torsoWidth * 0.78 + 3), S.chestHeight - 13];
    const raised = [S.armLength * 0.6, side * 4, S.chestHeight + 5];
    const hand = mix(idle, raised, k);
    const elbow = [(shoulder[0] + hand[0]) / 2 - 0.4, (shoulder[1] + hand[1]) / 2 + side * 2, (shoulder[2] + hand[2]) / 2 + 0.6];
    return {
        depth: rig.project(...elbow).depth + 0.3,
        draw() {
            rock(rig, shoulder, S.armWidth * 1.25, true);        // ombreira
            rock(rig, mix(shoulder, elbow, 0.55), S.armWidth * 0.8);
            rock(rig, elbow, S.armWidth * 0.85, false);
            rock(rig, mix(elbow, hand, 0.55), S.armWidth * 0.8);
            rock(rig, hand, S.fistSize, false);                    // punho
            crack(rig, mix(elbow, hand, 0.2), mix(elbow, hand, 0.8), 0.4);
        }
    };
}

function body(rig, pose) {
    const { C, limb, ball } = rig;
    const bounce = Math.sin(rig.anim.stride * 2) * S.bounce * pose.run;
    const z0 = S.hipHeight + bounce;
    const z1 = S.chestHeight + bounce;
    return {
        depth: rig.project(0, 0, (z0 + z1) / 2).depth,
        draw() {
            // Pélvis, barriga e peito: três blocos empilhados, o peito mais largo
            rock(rig, [0, 0, z0 + 0.5], S.torsoWidth * 0.78, false);
            rock(rig, [0.3, 0, (z0 + z1) / 2], S.torsoWidth * 0.86, false);
            rock(rig, [0.4, 0, z1 - 0.5], S.torsoWidth * 0.98, false);
            ball([-1.5, 2.5, z1 + S.torsoWidth * 0.6], S.torsoWidth * 0.3, C.moss);
            // Rachaduras de lava espalhadas pelo tronco (posições fixas, em volta)
            for (let i = 0; i < S.cracks; i++) {
                const a = (i / S.cracks) * Math.PI * 2 + 0.5;
                const z = z0 + 1 + ((i * 7) % 5) * 2.2;
                const r = S.torsoWidth * 0.86;
                const p = [Math.cos(a) * r, Math.sin(a) * r, z];
                if (!facesCamera(rig, p, [0, 0, z], 0.05)) continue;
                const q = [Math.cos(a + 0.28) * r, Math.sin(a + 0.28) * r, z + 2.6 - (i % 3)];
                crack(rig, p, q, 0.38);
            }
            // Núcleo no peito, virado para a frente: cristal laranja com glow
            const core = [S.torsoWidth * 0.9, 0, z0 + S.coreHeight + 2];
            if (facesCamera(rig, core, [0, 0, core[2]], 0.05)) {
                glowAt(rig, core, C.coreGlow, S.coreSize * 3.2, 0.85);
                ball(core, S.coreSize * 1.15, C.ink);
                ball(core, S.coreSize, C.core);
                ball([core[0] + 0.5, core[1] - 0.4, core[2] + 0.5], S.coreSize * 0.45, C.lavaLight);
            }
        }
    };
}

function head(rig, pose) {
    const { C, limb, ball } = rig;
    const bounce = Math.sin(rig.anim.stride * 2) * S.bounce * pose.run;
    const hz = S.headHeight + bounce;
    const hs = S.headSize;
    return {
        depth: rig.project(0, 0, hz).depth + 0.4,
        draw() {
            rock(rig, [0.8, 0, hz], hs, true);
            // Brow: pedra saliente sobre os olhos
            rock(rig, [hs * 0.75 + 0.8, 0, hz + hs * 0.35], hs * 0.5);
            // Chifres que saem para cima e para fora, com a ponta curvada
            for (const side of [-1, 1]) {
                const base = [0.4, side * hs * 0.7, hz + hs * 0.6];
                const mid = [0.2, side * (hs * 1.1), hz + hs * 0.6 + S.hornLength * 0.55];
                const tip = [0.7, side * (hs * 1.05), hz + hs * 0.6 + S.hornLength];
                limb([base, mid, tip], 1.9, C.ink);
                limb([base, mid, tip], 1.3, C.stoneDark);
                limb([[base[0] + 0.2, base[1], base[2] + 0.5], mid], 0.5, C.stoneLight);
            }
            // Olhos de brasa
            const front = hs * 1.02 + 0.8;
            if (facesCamera(rig, [front, 0, hz], [0, 0, hz], 0.1)) {
                for (const side of [-1, 1]) {
                    const eye = [front, side * hs * 0.42, hz + hs * 0.12];
                    glowAt(rig, eye, C.eyeGlow, hs * 0.7, 0.8);
                    ball(eye, hs * 0.2, C.eye);
                }
                limb([[front - 0.2, -hs * 0.45, hz - hs * 0.45], [front - 0.2, hs * 0.45, hz - hs * 0.45]], 0.8, C.ink);   // boca
            }
        }
    };
}



// --- A VERSÃO EM SPRITES (a que vale no jogo) ---
// golem_atlas.webp foi gravado a partir do golem 3D do laboratório (tools/lab/monstro_foto.js?bake=1, ver art_reference/character.md):
// 8 direções (linhas, de 45 em 45 graus, começando para a direita e girando para baixo) x 10 quadros (colunas): 6 de passada e
// 4 de soco (braços subindo). Se a imagem ainda não carregou, desenha a versão em bolas, que continua aqui como reserva.
// Colunas: 6 de passada, 4 de golpe (as duas mãos subindo), 1 de impacto (as duas mãos no chão) e 3 de jogar a pedra (só uma mão sobe)
const ATLAS = { walk: 6, punch: 4, hit: 1, throw: 3, dirs: 8, size: 192 };
// Qual coluna desenhar: impacto > jogar > golpe subindo > passada
const columnOf = ({ slamHit, throwK = 0, swing = 0 }, phase) => {
    if (slamHit) return ATLAS.walk + ATLAS.punch;
    if (throwK > 0.02) return ATLAS.walk + ATLAS.punch + ATLAS.hit + Math.min(ATLAS.throw - 1, Math.ceil(throwK * ATLAS.throw) - 1);
    if (swing > 0.02) return ATLAS.walk + Math.min(ATLAS.punch - 1, Math.ceil(swing * ATLAS.punch) - 1);
    return Math.floor(phase) % ATLAS.walk;
};
const atlas = new Image();
// Caminho da imagem: ao lado deste arquivo; mas no pacote com bundle (game.min.js na raiz) o import.meta.url não aponta mais para a pasta
// library, então a imagem é buscada em library/... a partir da página (o pacote e o site mantêm a pasta library junto da página)
atlas.src = import.meta.url.includes('/library/') ? new URL('./golem_atlas.webp', import.meta.url).href
    : new URL('library/monsters/25d/golem/golem_atlas.webp', document.baseURI).href;
const sprites = new WeakMap();

// Peça única com o sprite do atlas, para quem desenha pelo boneco (Ateliê, outros jogos): o ponto, o tamanho e o quadro saem do rig
function spriteRigPart(rig) {
    const c0 = rig.project(0, 0, 0);
    const c1 = rig.project(0, 0, 1);
    const unit = Math.hypot(c1.x - c0.x, c1.y - c0.y);
    return {
        depth: c0.depth,
        draw() {
            const turn = ((rig.anim.facing % TAU) + TAU) % TAU;
            const dir = Math.round(turn / TAU * ATLAS.dirs) % ATLAS.dirs;
            const col = columnOf({ swing: swingNow() }, (((rig.anim.stride % TAU) + TAU) % TAU) / TAU * ATLAS.walk);
            const size = unit * S.spriteUnits;
            const at = rig.project(0, 0, S.center);
            ctx.drawImage(atlas, col * ATLAS.size, dir * ATLAS.size, ATLAS.size, ATLAS.size, at.x - size / 2, at.y - size / 2 + size * S.spriteLift, size, size);
        }
    };
}
const ready = () => atlas.complete && atlas.naturalWidth > 0;

registerCreature('golem', S, (pose, rig) => ready() ? [spriteRigPart(rig)]
    : [leg(rig, pose, -1), leg(rig, pose, 1), body(rig, pose), arm(rig, pose, -1), arm(rig, pose, 1), head(rig, pose)]);

// Um quadro parado (corpo que tomba na morte): desenha no ponto (0, 0) do contexto atual, virado para facing, no tamanho de um monstro de raio radius. false = sem imagem ainda
export function golemStill(facing, radius) {
    const size = radius * S.spriteScale;
    if (!atlas.complete || !atlas.naturalWidth) return false;
    const turn = ((facing % TAU) + TAU) % TAU;
    const dir = Math.round(turn / TAU * ATLAS.dirs) % ATLAS.dirs;
    ctx.drawImage(atlas, 0, dir * ATLAS.size, ATLAS.size, ATLAS.size, -size / 2, -size / 2 + size * S.spriteLift, size, size);
    return true;
}

export function renderGolem25D(e) {
    if (!atlas.complete || !atlas.naturalWidth) {
        swing = e.swing ?? 0;
        renderMonster25D(e, 'golem', S);
        swing = null;
        return;
    }
    const now = renderNow();
    let st = sprites.get(e);
    if (!st) sprites.set(e, st = { x: e.x, y: e.y, phase: Math.random() * ATLAS.walk, last: now, dir: 0 });
    const dt = Math.min(0.1, Math.max(0, (now - st.last) / 1000));
    const dist = Math.hypot(e.x - st.x, e.y - st.y);
    st.last = now; st.x = e.x; st.y = e.y;
    if (host.animating()) st.phase = (st.phase + dist / S.pixelsPerCycle * ATLAS.walk) % ATLAS.walk;
    if (e.bakeFrame !== undefined) st.phase = e.bakeFrame * ATLAS.walk;
    // Direção: o ângulo (0 = direita, cresce para baixo na tela) em 8 fatias
    const turn = ((e.angle % TAU) + TAU) % TAU;
    st.dir = Math.round(turn / TAU * ATLAS.dirs) % ATLAS.dirs;
    const col = columnOf({ swing: e.swing ?? 0, slamHit: e.slamHit, throwK: e.throwArm ?? 0 }, st.phase);
    const size = e.radius * S.spriteScale;
    // Sombra e aura no chão, depois a imagem centrada no corpo
    if (!e.baking) {
        drawGlow(ctx, S.colors.aura, e.x, e.y, size * 0.5, S.auraAlpha);
        // Sombra mole presa aos pés (os pés ficam a spriteFeet do tamanho abaixo do centro do corpo)
        const fy = e.y + size * S.spriteFeet;
        ctx.save();
        ctx.translate(e.x, fy);
        ctx.scale(1, 0.5);
        const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, size * S.shadowRadius);
        sh.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
        sh.addColorStop(0.6, 'rgba(0, 0, 0, 0.28)');
        sh.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sh;
        ctx.beginPath();
        ctx.arc(0, 0, size * S.shadowRadius, 0, TAU);
        ctx.fill();
        ctx.restore();
    }
    ctx.drawImage(atlas, col * ATLAS.size, st.dir * ATLAS.size, ATLAS.size, ATLAS.size, e.x - size / 2, e.y - size / 2 + size * S.spriteLift, size, size);
}
