// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/spawn.js e rode o sync.
// --- NASCIMENTO DOS MONSTROS ---
// Como cada monstro APARECE, num lugar só (o Last Torch e o quadro "Nascimento" do Ateliê leem daqui; ver tools/tuner.html).
// É o par de death.js: lá o monstro morre, aqui ele nasce. Todo monstro tem uma entrada em MONSTER_SPAWN; um monstro novo sem entrada
// simplesmente aparece de uma vez (sem efeito).
//
//   style    o jeito: 'rise' (sai do chão: poeira e rachaduras, o corpo levanta), 'smoke' (surge numa nuvem de fumaça), 'fade' (surge
//            no ar, num clarão rápido: para os que voam) ou 'portal' (um anel brilhante no chão e o corpo aparece dentro dele)
//   seconds  quanto dura (o monstro não anda nem ataca enquanto nasce)
//   color    a cor da poeira / fumaça / brilho
//   size     o tamanho do efeito no chão, em raios do monstro
//   rise     (só 'rise') quanto o corpo começa abaixo do chão, em raios do monstro
export const SPAWN_STYLES = {
    rise: 'Sai do chão (poeira e rachaduras)',
    smoke: 'Surge numa nuvem de fumaça',
    fade: 'Surge no ar (clarão rápido)',
    portal: 'Portal (anel brilhante no chão)'
};

const rise = (seconds, color, extra = {}) => ({ style: 'rise', seconds, color, size: 1.8, rise: 1.3, ...extra });
const smoke = (seconds, color, extra = {}) => ({ style: 'smoke', seconds, color, size: 1.6, ...extra });
const fade = (seconds, color, extra = {}) => ({ style: 'fade', seconds, color, size: 1.5, ...extra });
const portal = (seconds, color, extra = {}) => ({ style: 'portal', seconds, color, size: 1.7, ...extra });

export const MONSTER_SPAWN = {
    skeleton: rise(0.9, 'rgba(168, 162, 158, 0.9)'),
    skeleton_crawler: rise(0.8, 'rgba(168, 162, 158, 0.9)', { rise: 0.9 }),
    zombie_wolf: rise(0.9, 'rgba(120, 110, 150, 0.9)'),
    bloater: rise(1, 'rgba(132, 204, 22, 0.8)', { size: 2 }),
    bone_colossus: rise(1.4, 'rgba(201, 191, 163, 0.9)', { size: 2.2, rise: 1.6 }),
    golem: rise(1.4, 'rgba(154, 143, 130, 0.9)', { size: 2.2, rise: 1.6 }),
    treant: rise(1.3, 'rgba(120, 160, 90, 0.85)', { size: 2.2, rise: 1.5 }),
    vampire: smoke(0.9, 'rgba(127, 29, 29, 0.85)'),
    witch: smoke(0.9, 'rgba(162, 28, 175, 0.8)'),
    wraith: smoke(1, 'rgba(103, 232, 249, 0.8)'),
    necromancer: smoke(1, 'rgba(74, 222, 128, 0.8)'),
    headless_knight: smoke(1, 'rgba(100, 116, 139, 0.85)'),
    shadow_wolf: smoke(0.8, 'rgba(99, 102, 241, 0.8)'),
    bat: fade(0.5, 'rgba(167, 139, 250, 0.9)'),
    moth: fade(0.5, 'rgba(245, 230, 200, 0.9)')
};

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (p) => 1 - (1 - p) ** 3;
const easeOutBack = (p) => 1 + 2.2 * (p - 1) ** 3 + 1.2 * (p - 1) ** 2;
const TAU = Math.PI * 2;

// A definição de um monstro do jogo (tipo em MAIÚSCULAS, como MONSTER_MODELS) ou null se ele não tem nascimento
export const spawnDefOf = (type) => MONSTER_SPAWN[String(type).toLowerCase()] ?? null;

// A pose do corpo enquanto nasce: alpha (opacidade), dy (quanto fica abaixo da posição final, em raios), scale e shake (tremor, em raios)
export function spawnPose(def, age) {
    const p = clamp01(age / def.seconds);
    switch (def.style) {
        case 'rise': return { p, alpha: Math.min(1, p * 2.4), dy: (1 - easeOut(p)) * (def.rise ?? 1.3), scale: 1, shake: (1 - p) * 0.06 };
        case 'smoke': return { p, alpha: easeOut(p), dy: 0, scale: 0.82 + 0.18 * easeOut(p), shake: 0 };
        case 'fade': return { p, alpha: Math.min(1, p * 1.8), dy: -(1 - p) * 0.5, scale: 0.5 + 0.5 * Math.min(1.08, easeOutBack(p)), shake: 0 };
        default: { const q = clamp01((p - 0.35) / 0.65); return { p, alpha: easeOut(q), dy: 0, scale: 0.9 + 0.1 * q, shake: 0 };      // portal
        }
    }
}

// O efeito no chão (e no ar), em unidades do mundo, com (x, y) no pé do monstro. g é o contexto do canvas; nada é criado aqui.
// O chão é visto de cima e de frente: o que é redondo no chão vira elipse achatada (0,6).
export function drawSpawnFx(g, def, age, x, y, radius) {
    const p = clamp01(age / def.seconds);
    const R = radius * (def.size ?? 1.7);
    g.save();
    // a sombra escura no chão, que cresce e some no fim
    g.globalAlpha = Math.min(1, p * 3) * (1 - p * 0.5) * 0.45;
    g.fillStyle = '#0c0a09';
    g.beginPath(); g.ellipse(x, y, R * 0.55 * easeOut(Math.min(1, p * 1.6)), R * 0.33 * easeOut(Math.min(1, p * 1.6)), 0, 0, TAU); g.fill();
    g.fillStyle = def.color;
    g.strokeStyle = def.color;
    if (def.style === 'rise') {
        // rachaduras saindo do centro e uma nuvem de poeira que sobe e se abre
        g.globalAlpha = (1 - p) * 0.8;
        g.lineWidth = Math.max(1, radius * 0.09);
        for (let i = 0; i < 7; i++) {
            const a = (i / 7) * TAU + 0.4;
            const len = R * 0.55 * easeOut(Math.min(1, p * 2));
            g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len * 0.6); g.stroke();
        }
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU + i * 0.3;
            const d = R * (0.2 + 0.55 * p) * (0.8 + (i % 3) * 0.15);
            g.globalAlpha = (1 - p) * 0.5;
            g.beginPath(); g.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6 - p * radius * 0.5, radius * 0.32 * (0.6 + p), radius * 0.26 * (0.6 + p), 0, 0, TAU); g.fill();
        }
    } else if (def.style === 'smoke') {
        // baforadas que sobem e se espalham em volta do corpo
        for (let i = 0; i < 9; i++) {
            const a = (i / 9) * TAU + i * 0.7;
            const spread = R * (0.15 + 0.5 * p) * (0.7 + (i % 3) * 0.2);
            g.globalAlpha = (1 - p) ** 1.3 * 0.5;
            g.beginPath(); g.arc(x + Math.cos(a) * spread, y + Math.sin(a) * spread * 0.6 - p * radius * (0.8 + (i % 3) * 0.5), radius * 0.45 * (0.7 + p * 0.7), 0, TAU); g.fill();
        }
    } else if (def.style === 'fade') {
        // um clarão: anel que se abre depressa e faíscas
        g.lineWidth = Math.max(1, radius * 0.14);
        g.globalAlpha = (1 - p) * 0.9;
        g.beginPath(); g.ellipse(x, y - radius * 0.5, R * 0.8 * easeOut(p), R * 0.8 * easeOut(p) * 0.7, 0, 0, TAU); g.stroke();
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * TAU + 0.5;
            g.beginPath(); g.arc(x + Math.cos(a) * R * 0.9 * easeOut(p), y - radius * 0.5 + Math.sin(a) * R * 0.6 * easeOut(p), Math.max(0.8, radius * 0.1), 0, TAU); g.fill();
        }
    } else {
        // portal: anel brilhante no chão, um segundo anel menor e uma coluna de luz que se apaga no fim
        const pulse = 0.85 + 0.15 * Math.sin(age * 14);
        g.lineWidth = Math.max(1.5, radius * 0.16);
        g.globalAlpha = Math.min(1, p * 3) * (1 - clamp01((p - 0.7) / 0.3)) * 0.9;
        g.beginPath(); g.ellipse(x, y, R * 0.62 * pulse, R * 0.62 * pulse * 0.6, 0, 0, TAU); g.stroke();
        g.lineWidth = Math.max(1, radius * 0.08);
        g.beginPath(); g.ellipse(x, y, R * 0.4 * pulse, R * 0.4 * pulse * 0.6, 0, 0, TAU); g.stroke();
        g.globalAlpha *= 0.35;
        g.fillRect(x - radius * 0.55, y - radius * 2.6 * easeOut(p), radius * 1.1, radius * 2.6 * easeOut(p));
    }
    g.restore();
}
