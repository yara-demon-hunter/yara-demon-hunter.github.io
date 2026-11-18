import { TREANT_25D_VISUALS as S } from './treant25d_visual.js';
import { registerCreature, glowAt, facesCamera } from '../../monsters/25d/creature25d.js';
import { renderMonster25D } from '../../monsters/25d/monster25d.js';
import { mix } from '../../characters/hunter/kit25d.js';
import { ctx } from '../../core/canvas.js';
import { host } from '../../core/host.js';
import { renderNow } from '../../core/clock.js';
import { drawGlow } from '../../core/glow.js';

const TAU = Math.PI * 2;

// --- TREANT 2.5D (buddy: a árvore andante) ---
// A árvore do Wicked Oak depois da Ancient Grove: sai andando e luta. Duas pernas de raiz com passos pesados (a passada vem do
// motor, rig.anim.stride), tronco largo de casca com veios e musgo, uma cara entalhada com olhos âmbar brilhando, dois braços de
// galho que balançam no ritmo do passo (e erguem ao bater) e uma copa de folhas por cima. Medidas e cores: treant25d_visual.js.
// Uso: renderTreant25D(e); e.swing (0..1) ergue os braços para o golpe.
let swing = null;
const swingNow = () => swing ?? 0;

function leg(rig, pose, side) {
    const { C, limb, ball } = rig;
    const g = rig.anim.stride + (side > 0 ? 0 : Math.PI);
    const run = pose.run;
    const hip = [0, side * S.legSpread, S.hipHeight];
    const reach = Math.sin(g) * S.stride * (0.15 + run);
    const lift = Math.max(0, Math.cos(g)) * S.footLift * (0.15 + run);
    const foot = [reach, side * S.legSpread * 1.15, 0.8 + lift];
    const knee = [reach * 0.45 + 1, side * S.legSpread * 1.05, S.hipHeight * 0.52 + lift * 0.5];
    return {
        depth: rig.project(...knee).depth,
        draw() {
            limb([hip, knee, foot], S.legWidth + 0.7, C.ink);
            limb([hip, knee, foot], S.legWidth, C.bark);
            limb([[hip[0] + 0.5, hip[1], hip[2] - 1], [knee[0] + 0.5, knee[1], knee[2]]], S.legWidth * 0.3, C.barkLight);
            // Pé de raiz: três dedos abertos para a frente
            for (const k of [-1, 0, 1]) limb([foot, [foot[0] + 2.2, foot[1] + k * 1.5, foot[2] - 0.3]], 1.2, C.barkDark);
            ball(foot, S.legWidth * 0.7, C.barkDark);
        }
    };
}

function arm(rig, pose, side) {
    const { C, limb, ball } = rig;
    const g = rig.anim.stride + (side > 0 ? Math.PI : 0);
    const run = pose.run;
    const k = swingNow();
    const shoulder = [0.6, side * (S.trunkWidth * 0.52), S.chestHeight - 2];
    const idle = [Math.sin(g) * 3 * run + 1.5, side * (S.trunkWidth * 0.52 + 4), S.chestHeight - 12];
    const raised = [S.armLength * 0.55, side * 5, S.chestHeight + 3];
    const hand = mix(idle, raised, k);
    const elbow = [(shoulder[0] + hand[0]) / 2 - 0.5, (shoulder[1] + hand[1]) / 2 + side * 2.2, (shoulder[2] + hand[2]) / 2 + 0.8];
    return {
        depth: rig.project(...elbow).depth + 0.3,
        draw() {
            limb([shoulder, elbow, hand], S.armWidth + 0.7, C.ink);
            limb([shoulder, elbow, hand], S.armWidth, C.bark);
            limb([mix(shoulder, elbow, 0.2), mix(elbow, hand, 0.7)].map(p => [p[0] + 0.3, p[1], p[2] + 0.4]), S.armWidth * 0.3, C.barkLight);
            // Mão de galhos: quatro dedos finos com uma folha na ponta
            const dir = [hand[0] - elbow[0], hand[1] - elbow[1], hand[2] - elbow[2]];
            const len = Math.hypot(...dir) || 1;
            for (const f of [-1.2, -0.4, 0.4, 1.2]) {
                const tip = [hand[0] + dir[0] / len * 4 + 0.2, hand[1] + dir[1] / len * 4 + f * 1.4, hand[2] + dir[2] / len * 4 + Math.abs(f) * 0.3];
                limb([hand, tip], 0.75, C.barkDark);
                ball(tip, 0.7, C.leafDark);
            }
            ball(hand, S.armWidth * 0.75, C.bark);
        }
    };
}

function body(rig, pose) {
    const { C, limb, ball } = rig;
    const bounce = Math.sin(rig.anim.stride * 2) * S.bounce * pose.run;
    const base = [0, 0, S.hipHeight + bounce];
    const top = [0, 0, S.chestHeight + bounce];
    return {
        depth: rig.project(0, 0, (base[2] + top[2]) / 2).depth,
        draw() {
            // Tronco: mais largo embaixo (as raízes que o seguram), casca com veios e musgo no ombro
            limb([[0, 0, S.hipHeight - 2 + bounce], base, top], S.trunkWidth + 0.8, C.ink);
            limb([[0, 0, S.hipHeight - 2 + bounce], base, top], S.trunkWidth, C.bark);
            ball([0, 0, S.hipHeight + 0.5 + bounce], S.trunkWidth * 0.5, C.barkDark);
            ball([0, 0, S.chestHeight + 0.4 + bounce], S.trunkWidth * 0.55, C.bark);
            for (const side of [-1, 1]) {
                limb([[0.8, side * S.trunkWidth * 0.3, base[2] + 0.5], [0.8, side * S.trunkWidth * 0.38, top[2] - 1]], 0.7, C.barkDark);
                limb([[1.5, side * S.trunkWidth * 0.12, base[2] + 1], [1.5, side * S.trunkWidth * 0.16, top[2] - 2]], 0.5, C.barkLight);
            }
            ball([1.2, S.trunkWidth * 0.34, top[2] - 0.6], 1.4, C.moss);
            ball([1.4, -S.trunkWidth * 0.22, base[2] + 3], 1.1, C.moss);
            // Cara entalhada no tronco, mais baixa que o pescoço: vista de cima, a copa cobre o alto do tronco, e uma cara lá
            // em cima nunca aparecia. Um oco escuro, sobrancelhas pesadas e franzidas, olhos âmbar com pupila em fenda, um nó
            // de madeira no lugar do nariz, uma boca em fenda com dentes de lasca, barba de musgo e um broto na testa.
            const fz = S.chestHeight - S.faceDrop + bounce;
            const front = S.trunkWidth * 0.5;
            const u = S.faceScale;
            const f = (a, b, z) => [front + a, b * u, fz + z * u];                 // ponto na cara (a: para fora, b: lado, z: altura)
            if (facesCamera(rig, f(0, 0, 0), [0, 0, fz], 0.1)) {
                // O oco: o rosto afundado na casca, mais largo em cima e fechando para o queixo
                ball(f(-0.2, 0, 0.4), 3.9 * u, C.barkDark);
                ball(f(-0.2, 0, -2.4), 3 * u, C.barkDark);
                ball(f(-0.1, 0, 2.6), 3 * u, C.barkDark);
                for (const side of [-1, 1]) {
                    // Sobrancelha: um bloco escuro com a quina de cima clara, descendo para o meio (cara de bravo)
                    limb([f(0, side * 4.6, 2.9), f(0.5, side * 0.8, 1.2)], 1.9 * u, C.ink);
                    limb([f(0.2, side * 4.4, 3.5), f(0.7, side * 1, 1.9)], 0.75 * u, C.barkLight);
                    // Olho: órbita escura, brilho âmbar e a pupila em fenda
                    const eye = f(0.5, side * 2.4, 0.3);
                    ball(eye, 1.55 * u, C.ink);
                    glowAt(rig, eye, C.eyeGlow, 2.7 * u, 0.8);
                    ball(eye, 1.05 * u, C.eye);
                    limb([f(0.75, side * 2.4, 0.9), f(0.75, side * 2.4, -0.3)], 0.32 * u, C.ink);
                    // Bochecha: um nó e uma cicatriz na casca
                    ball(f(0.2, side * 4.2, -2), 0.9 * u, C.barkLight);
                    limb([f(0.1, side * 3.4, -3.4), f(0.1, side * 4.6, -4.6)], 0.4 * u, C.barkDark);
                }
                // Nariz: um nó grosso de madeira, com sombra embaixo
                ball(f(0.7, 0, -1.6), 1.15 * u, C.ink);
                ball(f(0.95, 0, -1.3), 0.95 * u, C.barkLight);
                // Boca: uma fenda larga e torta, com dentes de lasca para cima e para baixo
                const m = -4.3;
                limb([f(0.2, -3.4, m + 0.9), f(0.35, -1.8, m - 0.1), f(0.4, 0, m - 0.5), f(0.35, 1.8, m - 0.1), f(0.2, 3.4, m + 0.9)], 1.8 * u, C.mouth);
                for (const k of [-2.4, -0.9, 0.9, 2.4]) {
                    const sag = Math.abs(k) * 0.12;
                    limb([f(0.55, k, m + 0.45 - sag), f(0.55, k * 1.02, m - 0.55 - sag)], 0.55 * u, C.tooth);
                }
                // Barba de musgo caindo do queixo
                for (const k of [-2.6, -1.2, 0, 1.2, 2.6]) limb([f(0.3, k, m - 1.1), f(0.15, k * 1.1, m - 3.0 - (1 - Math.abs(k) / 3) * 1.2)], 0.7 * u, C.moss);
                // Broto na testa: um galhinho com duas folhas
                limb([f(0.1, 0, 3.6), f(-0.2, 0.7, 5.4)], 0.5 * u, C.barkDark);
                ball(f(-0.2, 0.7, 5.5), 0.9 * u, C.leafLight);
                ball(f(-0.2, -0.5, 4.9), 0.7 * u, C.leaf);
            }
        }
    };
}

function crown(rig, pose) {
    const { C, ball, limb } = rig;
    const bounce = Math.sin(rig.anim.stride * 2) * S.bounce * pose.run;
    const c = [0, 0, S.crownHeight + bounce];
    return {
        depth: rig.project(...c).depth + 0.5,
        draw() {
            // Galhos grossos que sobem do tronco para sustentar a copa
            for (const side of [-1, 1]) limb([[0, side * 2, S.chestHeight - 1 + bounce], [0.5, side * 4.6, S.crownHeight - 2 + bounce]], 1.8, C.bark);
            // A copa: um monte de bolas de folhas, as escuras por baixo e as claras em cima
            for (let i = 0; i < S.crownBlobs; i++) {
                const a = (i / S.crownBlobs) * Math.PI * 2 + 0.4;
                const r = S.crownRadius * (0.55 + 0.25 * ((i * 5) % 3) / 2);
                const p = [Math.cos(a) * r * 0.9, Math.sin(a) * r, c[2] + ((i * 3) % 4) * 0.9 - 1.2];
                ball(p, S.crownRadius * 0.62, i % 3 === 0 ? C.leafDark : C.leaf);
            }
            ball([0, 0, c[2] + 2.2], S.crownRadius * 0.7, C.leaf);
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2 + 1.1;
                ball([Math.cos(a) * 3.6, Math.sin(a) * 4, c[2] + 4 + (i % 2)], 1.9, C.leafLight);
            }
        }
    };
}

function parts(pose, rig) {
    const order = [leg(rig, pose, -1), leg(rig, pose, 1), body(rig, pose), arm(rig, pose, -1), arm(rig, pose, 1), crown(rig, pose)];
    return order;
}

// --- A VERSÃO EM SPRITES (a que vale no jogo, para o monstro e para o buddy) ---
// treant_atlas.webp foi gravado do Treant 3D do laboratório (tools/lab/treant_foto.js?bake=1, bake_treant.py): 8 direções (linhas, de 45 em 45 graus,
// começando para a direita e girando para baixo) x 18 quadros (colunas): 12 de passada (pé que sobe, corpo que sobe e desce, copa em pêndulo) e
// 6 de soco (recua, bate, volta), 144 px por quadro. Se a imagem ainda não carregou, vale a versão em bolas e galhos mais acima, que continua como reserva.
// A versão anterior do sprite (6 + 4 quadros, 176 px) fica em tools/lab/exemplos/treant_atlas_v1.webp só para comparar no Ateliê
// (tuner.html?model=treant_sprite_v1); ela só é baixada quando alguém a pede, nunca no jogo.
const TAU_ = TAU;
function loadAtlas(cfg, url) {
    const image = new Image();
    let started = false;
    return { ...cfg, image, start() { if (!started) { started = true; image.src = url(); } return this; }, ready() { return image.complete && image.naturalWidth > 0; } };
}
const inLibrary = /\/_?library\//.test(import.meta.url);
const NOVO = loadAtlas({ walk: 12, punch: 6, dirs: 8, size: 144 }, () => inLibrary ? new URL('./treant_atlas.webp', import.meta.url).href : new URL('library/buddies/treant/treant_atlas.webp', document.baseURI).href).start();
// Caminho no jogo com bundle (game.min.js na raiz): o import.meta.url não aponta mais para a pasta library, então a imagem é buscada a partir da página
const V1 = loadAtlas({ walk: 6, punch: 4, dirs: 8, size: 176 }, () => new URL('../../tools/lab/exemplos/treant_atlas_v1.webp', import.meta.url).href);
const ready = () => NOVO.ready();
const sprites = new WeakMap();
const dirOf = (angle, A = NOVO) => Math.round((((angle % TAU_) + TAU_) % TAU_) / TAU_ * A.dirs) % A.dirs;
const colOf = (swingK, phase, A = NOVO) => swingK > 0.02 ? A.walk + Math.min(A.punch - 1, Math.ceil(swingK * A.punch) - 1) : Math.floor(phase) % A.walk;

// Peça única com o sprite, para quem desenha pelo boneco (Ateliê, outros jogos)
function spriteRigPart(rig, A = NOVO) {
    const c0 = rig.project(0, 0, 0);
    const c1 = rig.project(0, 0, 1);
    const unit = Math.hypot(c1.x - c0.x, c1.y - c0.y);
    return {
        depth: c0.depth,
        draw() {
            const phase = (((rig.anim.stride % TAU_) + TAU_) % TAU_) / TAU_ * A.walk;
            const size = unit * S.spriteUnits;
            const at = rig.project(0, 0, S.center);
            ctx.drawImage(A.image, colOf(swingNow(), phase, A) * A.size, dirOf(rig.anim.facing, A) * A.size, A.size, A.size, at.x - size / 2, at.y - size / 2 + size * S.spriteLift, size, size);
        }
    };
}
// A versão ANTIGA (bolas e galhos), guardada para comparar no Ateliê (tuner.html?model=treant_classico): sempre desenha as peças, nunca o sprite
registerCreature('treant_classico', S, parts);

registerCreature('treant_sprite', S, (pose, rig) => ready() ? [spriteRigPart(rig)] : parts(pose, rig));
// O sprite da versão anterior (6 + 4 quadros), só para comparar no Ateliê
registerCreature('treant_sprite_v1', S, (pose, rig) => V1.start().ready() ? [spriteRigPart(rig, V1)] : parts(pose, rig));

// Um quadro parado (corpo que tomba na morte): desenha no ponto (0, 0) do contexto atual, no tamanho de um monstro de raio radius
export function treantStill(facing, radius) {
    if (!ready()) return false;
    const size = radius * S.spriteScale;
    ctx.drawImage(NOVO.image, 0, dirOf(facing) * NOVO.size, NOVO.size, NOVO.size, -size / 2, -size / 2 + size * S.spriteLift, size, size);
    return true;
}

export function renderTreant25D(e) {
    if (!ready()) {
        swing = e.swing ?? 0;
        renderMonster25D(e, 'treant_classico', S);
        swing = null;
        return;
    }
    const now = renderNow();
    let st = sprites.get(e);
    if (!st) sprites.set(e, st = { x: e.x, y: e.y, phase: Math.random() * NOVO.walk });
    const dist = Math.hypot(e.x - st.x, e.y - st.y);
    st.x = e.x; st.y = e.y;
    if (host.animating()) st.phase = (st.phase + dist / S.pixelsPerCycle * NOVO.walk) % NOVO.walk;
    if (e.bakeFrame !== undefined) st.phase = e.bakeFrame * NOVO.walk;
    const size = e.radius * S.spriteScale;
    if (!e.baking) {
        drawGlow(ctx, S.colors.aura, e.x, e.y, size * 0.5, S.auraAlpha);
        // Sombra mole presa aos pés
        ctx.save();
        ctx.translate(e.x, e.y + size * S.spriteFeet);
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
    ctx.drawImage(NOVO.image, colOf(e.swing ?? 0, st.phase) * NOVO.size, dirOf(e.angle) * NOVO.size, NOVO.size, NOVO.size, e.x - size / 2, e.y - size / 2 + size * S.spriteLift, size, size);
}
