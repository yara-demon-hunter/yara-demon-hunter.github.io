import { CHARACTER_STYLE as S } from '../../data_model/visuals/characters.js';
import { drawFluffy } from './character_fluffy.js';
import { drawFrog } from './character_frog.js';
import { drawCat } from './character_cat.js';
import { drawDog } from './character_dog.js';
import { drawMouse } from './character_mouse.js';

// --- ARTE PROCEDURAL DOS LUTADORES ---
// Desenha um lutador em unidades de "raio do corpo" (origem no centro, olhando para a direita).
// pose: { bob, footA, footB, tuck, armSwing, armUp, ear, tail, eye, mouth, sweat, stars }
// Não roda a cada quadro do jogo: character_sprites.js chama isto uma vez por quadro de animação.
export function shade(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const mix = (c) => Math.max(0, Math.min(255, Math.round(c + (amount < 0 ? c : 255 - c) * amount)));
    return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}

function outlined(g, fill, width = S.outlineWidth) {
    g.fillStyle = fill;
    g.strokeStyle = S.outline;
    g.lineWidth = width;
    g.lineJoin = 'round';
    g.fill();
    g.stroke();
}

// --- ORELHAS ---
// Atrás do corpo (a base some embaixo dele), menos as orelhas caídas do cachorro, que ficam por cima
function earsBehind(g, spec, pose) {
    const flap = pose.ear;
    const pair = (draw) => [-1, 1].forEach((side) => {
        g.save();
        draw(side);
        g.restore();
    });
    switch (spec.ears) {
        case 'pointy':
        case 'round':
            pair((side) => {
                g.translate(side * 0.42 + 0.08, -0.82);
                g.rotate(side * (0.22 + flap * 0.45) - 0.12 * flap);
                g.beginPath();
                if (spec.ears === 'pointy') {
                    g.moveTo(-0.3, 0.2); g.lineTo(0, -0.78); g.lineTo(0.3, 0.2);
                } else {
                    g.moveTo(-0.3, 0.2);
                    g.quadraticCurveTo(-0.34, -0.55, 0, -0.55);
                    g.quadraticCurveTo(0.34, -0.55, 0.3, 0.2);
                }
                g.closePath();
                outlined(g, spec.body);
                g.fillStyle = spec.earInner;
                g.beginPath();
                g.moveTo(-0.14, 0.12); g.lineTo(0, -0.42); g.lineTo(0.14, 0.12);
                g.closePath();
                g.fill();
            });
            break;
        case 'mouse':
            pair((side) => {
                g.translate(side * 0.6 + 0.08, -0.72 + flap * 0.08);
                g.rotate(side * flap * 0.3);
                g.beginPath();
                g.arc(0, 0, 0.44, 0, Math.PI * 2);
                outlined(g, spec.body);
                g.fillStyle = spec.earInner;
                g.beginPath();
                g.arc(0.02, 0.02, 0.29, 0, Math.PI * 2);
                g.fill();
            });
            break;
        case 'bunny':
            pair((side) => {
                g.translate(side * 0.3 + 0.1, -0.78);
                g.rotate(side * 0.18 - flap * 0.7);
                g.beginPath();
                g.ellipse(0, -0.55, 0.2, 0.62, 0, 0, Math.PI * 2);
                outlined(g, spec.body);
                g.fillStyle = spec.earInner;
                g.beginPath();
                g.ellipse(0, -0.55, 0.1, 0.46, 0, 0, Math.PI * 2);
                g.fill();
            });
            break;
        case 'pig':
            pair((side) => {
                g.translate(side * 0.48 + 0.08, -0.8);
                g.rotate(side * 0.35 + flap * 0.3);
                g.beginPath();
                g.moveTo(-0.22, 0.15); g.lineTo(side * 0.1, -0.4); g.lineTo(0.22, 0.15);
                g.closePath();
                outlined(g, spec.body);
                g.fillStyle = spec.earInner;
                g.beginPath();
                g.moveTo(-0.1, 0.1); g.lineTo(side * 0.06, -0.2); g.lineTo(0.1, 0.1);
                g.closePath();
                g.fill();
            });
            break;
        case 'elephant':
            pair((side) => {
                g.translate(side * 0.92 + 0.05, -0.18);
                g.rotate(side * (0.15 + flap * 0.25));
                g.beginPath();
                g.ellipse(0, 0, 0.52, 0.7, 0, 0, Math.PI * 2);
                outlined(g, shade(spec.body, -0.08));
                g.fillStyle = spec.earInner;
                g.beginPath();
                g.ellipse(side * 0.06, 0.04, 0.34, 0.5, 0, 0, Math.PI * 2);
                g.fill();
            });
            break;
        default:
    }
}

function earsFront(g, spec, pose) {
    if (spec.ears !== 'floppy') return;
    [-1, 1].forEach((side) => {
        g.save();
        g.translate(side * 0.62 + 0.06, -0.62);
        g.rotate(side * (0.25 + pose.ear * 0.5));
        g.beginPath();
        g.ellipse(side * 0.12, 0.32, 0.22, 0.45, side * -0.2, 0, Math.PI * 2);
        outlined(g, spec.earColor);
        g.restore();
    });
}

// --- CAUDA ---
function tail(g, spec, pose) {
    if (spec.tail === 'none') return;
    g.save();
    g.translate(-0.82, 0.3);
    g.rotate(-0.5 + pose.tail);
    g.lineJoin = 'round';
    g.lineCap = 'round';
    const tube = (width, color, path) => {
        g.strokeStyle = S.outline;
        g.lineWidth = width + 0.14;
        g.beginPath(); path(); g.stroke();
        g.strokeStyle = color;
        g.lineWidth = width;
        g.beginPath(); path(); g.stroke();
    };
    switch (spec.tail) {
        case 'bushy':
            g.beginPath();
            g.moveTo(0, -0.18);
            g.quadraticCurveTo(-0.7, -0.6, -1.1, 0.05);
            g.quadraticCurveTo(-0.7, 0.5, 0, 0.2);
            g.closePath();
            outlined(g, spec.body);
            g.fillStyle = spec.tailTip;
            g.beginPath();
            g.moveTo(-0.78, -0.4);
            g.quadraticCurveTo(-1.12, -0.2, -1.1, 0.05);
            g.quadraticCurveTo(-0.95, 0.35, -0.72, 0.34);
            g.quadraticCurveTo(-0.95, 0, -0.78, -0.4);
            g.fill();
            break;
        case 'thin': {
            const tip = -0.45 + pose.tail * 0.4;
            tube(0.2, spec.body, () => { g.moveTo(0, 0); g.quadraticCurveTo(-0.7, 0.25, -1.0, tip); });
            g.fillStyle = spec.tailTip;
            g.beginPath();
            g.arc(-1.0, tip, 0.13, 0, Math.PI * 2);
            g.fill();
            break;
        }
        case 'mouse':
            tube(0.08, spec.tailColor, () => {
                g.moveTo(0, 0);
                g.bezierCurveTo(-0.6, 0.5, -0.9, -0.5 + pose.tail * 0.3, -1.25, -0.1 + pose.tail * 0.3);
            });
            break;
        case 'curly':
            tube(0.1, spec.body, () => {
                g.moveTo(0, 0);
                g.bezierCurveTo(-0.35, -0.1, -0.45, -0.45, -0.25, -0.45);
                g.bezierCurveTo(-0.05, -0.45, -0.1, -0.15, -0.35, -0.2 + pose.tail * 0.1);
            });
            break;
        case 'stub':
            g.rotate(pose.tail * 0.6);
            g.beginPath();
            g.ellipse(-0.18, -0.1, 0.24, 0.13, -0.4, 0, Math.PI * 2);
            outlined(g, spec.body);
            break;
        case 'cotton':
            g.beginPath();
            g.arc(-0.05, -0.05, 0.24, 0, Math.PI * 2);
            outlined(g, spec.tailTip);
            break;
        default:
    }
    g.restore();
}

// --- PÉS E BRAÇOS ---
function foot(g, spec, x, shift, lift, tuck) {
    g.beginPath();
    g.ellipse(x + shift * 0.35, 0.95 - lift * 0.22 - tuck * 0.35, 0.3, 0.2, 0, 0, Math.PI * 2);
    outlined(g, spec.feet ?? shade(spec.body, -0.35), S.outlineWidth * 0.8);
}

function arm(g, spec, side, pose) {
    // side 1 = braço da frente, -1 = de trás; armSwing leva para frente/trás e armUp levanta
    const swing = pose.armSwing * side;
    const x = side * 0.78 + swing * 0.14;
    const y = 0.32 - pose.armUp * 0.5;
    g.save();
    g.translate(x, y);
    g.beginPath();
    if (spec.arms === 'flipper') {
        g.rotate(side * (0.35 - pose.armUp * 0.8) + swing * 0.3);
        g.ellipse(0, 0.12, 0.14, 0.38, 0, 0, Math.PI * 2);
    } else {
        g.ellipse(0, 0, 0.2, 0.17, 0, 0, Math.PI * 2);
    }
    outlined(g, side < 0 ? shade(spec.body, -0.3) : shade(spec.body, -0.12), S.outlineWidth * 0.8);
    g.restore();
}

// --- ROSTO ---
function eyes(g, spec, pose) {
    const e = spec.eye ?? S.eye;
    g.lineCap = 'round';
    if (spec.frogEyes) {
        // Olhos de sapo: bolinhas da cor do corpo no alto da cabeça
        e.x.forEach((ex) => {
            g.beginPath();
            g.arc(ex, e.y + 0.04, e.rx * 1.45, 0, Math.PI * 2);
            outlined(g, spec.body);
        });
    }
    e.x.forEach((ex) => {
        if (pose.eye === 'x') {
            g.strokeStyle = S.pupil;
            g.lineWidth = 0.08;
            g.beginPath();
            g.moveTo(ex - 0.13, e.y - 0.13); g.lineTo(ex + 0.13, e.y + 0.13);
            g.moveTo(ex + 0.13, e.y - 0.13); g.lineTo(ex - 0.13, e.y + 0.13);
            g.stroke();
        } else if (pose.eye === 'blink') {
            g.strokeStyle = S.pupil;
            g.lineWidth = 0.08;
            g.beginPath();
            g.arc(ex, e.y + 0.05, 0.16, Math.PI * 1.1, Math.PI * 1.9);
            g.stroke();
        } else {
            const wide = pose.eye === 'wide' ? 1.22 : 1;
            g.beginPath();
            g.ellipse(ex, e.y, e.rx * wide, e.ry * wide, 0, 0, Math.PI * 2);
            outlined(g, S.eyeWhite, 0.05);
        }
    });
    if (pose.eye === 'angry') {
        g.strokeStyle = S.outline;
        g.lineWidth = 0.1;
        g.beginPath();
        g.moveTo(e.x[0] - 0.22, e.y - 0.42); g.lineTo(e.x[0] + 0.2, e.y - 0.26);
        g.moveTo(e.x[1] + 0.22, e.y - 0.42); g.lineTo(e.x[1] - 0.2, e.y - 0.26);
        g.stroke();
    }
}

function snout(g, spec) {
    switch (spec.snout) {
        case 'muzzle':
            g.beginPath();
            g.ellipse(0.5, 0.24, 0.38, 0.27, 0, 0, Math.PI * 2);
            g.fillStyle = spec.muzzle;
            g.fill();
            g.fillStyle = S.nose;
            g.beginPath();
            g.ellipse(0.62, 0.08, 0.13, 0.09, 0, 0, Math.PI * 2);
            g.fill();
            return { mx: 0.52, my: 0.36 };
        case 'pig':
            g.beginPath();
            g.ellipse(0.62, 0.14, 0.24, 0.18, 0, 0, Math.PI * 2);
            outlined(g, spec.snoutColor, 0.06);
            g.fillStyle = shade(spec.snoutColor, -0.5);
            g.beginPath();
            g.ellipse(0.55, 0.14, 0.04, 0.07, 0, 0, Math.PI * 2);
            g.ellipse(0.7, 0.14, 0.04, 0.07, 0, 0, Math.PI * 2);
            g.fill();
            return { mx: 0.42, my: 0.42 };
        case 'trunk': {
            const path = () => {
                g.moveTo(0.45, 0.02);
                g.bezierCurveTo(0.95, 0.05, 1.05, 0.45, 0.92, 0.72);
                g.quadraticCurveTo(0.86, 0.86, 1.02, 0.86);
            };
            g.lineCap = 'round';
            g.strokeStyle = S.outline;
            g.lineWidth = 0.4;
            g.beginPath(); path(); g.stroke();
            g.strokeStyle = spec.body;
            g.lineWidth = 0.28;
            g.beginPath(); path(); g.stroke();
            g.strokeStyle = shade(spec.body, -0.25);
            g.lineWidth = 0.03;
            g.beginPath();
            [[0.78, 0.12], [0.92, 0.3], [0.96, 0.5]].forEach(([x, y]) => { g.moveTo(x - 0.1, y - 0.06); g.lineTo(x + 0.1, y + 0.06); });
            g.stroke();
            if (spec.tusks) {
                g.strokeStyle = '#fffaf0';
                g.lineWidth = 0.08;
                g.beginPath();
                g.moveTo(0.4, 0.3);
                g.quadraticCurveTo(0.55, 0.5, 0.7, 0.42);
                g.stroke();
            }
            return { mx: 0.3, my: 0.42 };
        }
        case 'beak':
            g.beginPath();
            g.moveTo(0.42, 0.0); g.lineTo(0.98, 0.14); g.lineTo(0.42, 0.28);
            g.closePath();
            outlined(g, spec.beak, 0.06);
            return { mx: 0.5, my: 0.42 };
        default:
            g.fillStyle = spec.nose ?? S.nose;
            g.beginPath();
            g.ellipse(0.36, 0.1, 0.07, 0.05, 0, 0, Math.PI * 2);
            g.fill();
            return { mx: 0.36, my: 0.3 };
    }
}

function mouth(g, spec, pose, mx, my) {
    g.strokeStyle = S.mouth;
    g.fillStyle = S.mouth;
    g.lineWidth = 0.07;
    g.lineCap = 'round';
    const wide = spec.mouthWide ? 1.8 : 1;
    g.beginPath();
    switch (pose.mouth) {
        case 'open':
            g.ellipse(mx, my + 0.05, 0.17 * wide, 0.2, 0, 0, Math.PI * 2);
            g.fill();
            break;
        case 'o':
            g.arc(mx, my + 0.04, 0.09, 0, Math.PI * 2);
            g.fill();
            break;
        case 'flat':
            g.moveTo(mx - 0.15 * wide, my + 0.05); g.lineTo(mx + 0.15 * wide, my + 0.05);
            g.stroke();
            break;
        case 'frown':
            g.arc(mx, my + 0.22, 0.17, Math.PI * 1.15, Math.PI * 1.85);
            g.stroke();
            break;
        case 'tongue':
            g.arc(mx, my - 0.02, 0.18 * wide, 0.1, Math.PI - 0.1);
            g.closePath();
            g.fill();
            g.fillStyle = S.tongue;
            g.beginPath();
            g.ellipse(mx + 0.02, my + 0.17, 0.1, 0.12, 0, 0, Math.PI * 2);
            g.fill();
            break;
        default: // smile
            g.arc(mx, my - 0.08 * wide, 0.17 * wide, 0.2 * Math.PI, 0.8 * Math.PI);
            g.stroke();
    }
    if (spec.teeth && pose.mouth !== 'open') {
        g.fillStyle = '#ffffff';
        g.strokeStyle = S.outline;
        g.lineWidth = 0.03;
        g.beginPath();
        g.rect(mx - 0.08, my + 0.02, 0.075, 0.11);
        g.rect(mx + 0.005, my + 0.02, 0.075, 0.11);
        g.fill();
        g.stroke();
    }
}

function whiskers(g, mx, my) {
    g.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    g.lineWidth = 0.035;
    g.beginPath();
    [-0.06, 0.04].forEach((dy) => {
        g.moveTo(mx - 0.52, my - 0.1 + dy); g.lineTo(mx - 0.88, my - 0.14 + dy * 2.2);
        g.moveTo(mx + 0.5, my - 0.1 + dy); g.lineTo(mx + 0.86, my - 0.14 + dy * 2.2);
    });
    g.stroke();
}

export function drawCharacter(g, spec, pose) {
    if (spec.style === 'fluffy') return drawFluffy(g, spec, pose);
    if (spec.style === 'frog') return drawFrog(g, spec, pose);
    if (spec.style === 'cat') return drawCat(g, spec, pose);
    if (spec.style === 'dog') return drawDog(g, spec, pose);
    if (spec.style === 'mouse') return drawMouse(g, spec, pose);
    g.save();
    g.translate(0, pose.bob);
    tail(g, spec, pose);
    arm(g, spec, -1, pose);
    foot(g, spec, -0.4, pose.footA, Math.max(0, pose.footA), pose.tuck);
    earsBehind(g, spec, pose);

    // Corpo com luz de cima
    const grad = g.createRadialGradient(-0.35, -0.45, 0.1, 0, 0, 1.15);
    grad.addColorStop(0, shade(spec.body, 0.35));
    grad.addColorStop(0.6, spec.body);
    grad.addColorStop(1, shade(spec.body, -0.3));
    g.beginPath();
    g.arc(0, 0, 1, 0, Math.PI * 2);
    outlined(g, grad);

    // Barriga, mancha e brilho
    g.fillStyle = spec.belly;
    g.beginPath();
    if (spec.bellyBig) g.ellipse(0.22, 0.2, 0.68, 0.72, 0, 0, Math.PI * 2);
    else g.ellipse(0.18, 0.5, 0.58, 0.42, 0, 0, Math.PI * 2);
    g.fill();
    if (spec.spot) {
        g.fillStyle = spec.spot.color;
        g.beginPath();
        g.arc(spec.spot.x, spec.spot.y, spec.spot.r, 0, Math.PI * 2);
        g.fill();
    }
    g.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    g.lineWidth = 0.07;
    g.lineCap = 'round';
    g.beginPath();
    g.arc(0, 0, 0.84, Math.PI * 1.12, Math.PI * 1.42);
    g.stroke();

    foot(g, spec, 0.4, pose.footB, Math.max(0, pose.footB), pose.tuck);
    earsFront(g, spec, pose);

    // Rosto
    g.fillStyle = spec.cheek;
    g.globalAlpha = 0.6;
    g.beginPath();
    g.ellipse(-0.12, 0.12, 0.13, 0.08, 0, 0, Math.PI * 2);
    g.ellipse(0.86, 0.12, 0.1, 0.07, 0, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
    eyes(g, spec, pose);
    const { mx, my } = snout(g, spec);
    mouth(g, spec, pose, mx, my);
    if (spec.whiskers) whiskers(g, mx, my);
    arm(g, spec, 1, pose);
    g.restore();

    // Estrelinhas de tontura em volta da cabeça
    if (pose.stars !== undefined) {
        g.fillStyle = S.star;
        for (let i = 0; i < 3; i++) {
            const a = pose.stars + i * 2.09;
            g.save();
            g.translate(Math.cos(a) * 0.95 + 0.1, -1.1 + Math.sin(a) * 0.22);
            g.rotate(a * 2);
            g.beginPath();
            for (let k = 0; k < 8; k++) {
                const r = k % 2 === 0 ? 0.18 : 0.07;
                const t = (k / 8) * Math.PI * 2;
                g.lineTo(Math.cos(t) * r, Math.sin(t) * r);
            }
            g.closePath();
            g.fill();
            g.restore();
        }
    }
    if (pose.sweat) {
        g.fillStyle = S.sweat;
        g.beginPath();
        g.moveTo(0.95, -0.7);
        g.quadraticCurveTo(1.15, -0.4, 0.95, -0.36);
        g.quadraticCurveTo(0.75, -0.4, 0.95, -0.7);
        g.fill();
    }
}
