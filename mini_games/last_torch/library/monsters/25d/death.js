// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/death.js e rode o sync.
// --- MORTE DOS MONSTROS 2.5D ---
// Como cada monstro morre, num lugar só (o Last Torch e o quadro "Morte" do Ateliê leem daqui; ver tools/tuner.html).
//
//   groups  os pedaços que voam. Cada grupo: { count, colors, shape } e, se quiser, multiplicadores: size (tamanho), speed
//           (velocidade lateral), lift (impulso para cima), life (quanto tempo ficam), gravity (1 = cai normal; folhas caem leve)
//           shape: 'drop' (gota: água e lodo), 'ember' (brasa), 'plate' (placa de armadura), 'cloth' (trapo), 'bone' (osso), 'rock' (pedra), 'log' (tora de madeira, com a face cortada), 'wood' (casca), 'leaf' (folha que balança),
//           'shard' e 'blob' (lasca)
//   stain   a mancha que fica no chão
//   fall    (opcional) o corpo não some: ele TOMBA. { seconds (duração total), tiltSeconds (tempo até cair), tilt (ângulo, rad),
//           shake (tremor antes de cair), sink (quanto afunda no chão), pivot (a que distância abaixo do centro fica o pé, onde ele
//           gira) — estes três em RAIOS do monstro, para valerem em qualquer tamanho —, squash (achata: 1 = não achata),
//           fade (fração final em que desaparece) }
//   dust    (opcional, só com fall) a poeira quando bate no chão: { radius (em raios do monstro), seconds, width, color }
//
// Os números de física dos pedaços (gravidade, quique, velocidades) são os mesmos para todos: DEATH_PHYSICS.
export const DEATH_PHYSICS = {
    gravity: 520,
    bounce: 0.35,
    speedMin: 70,
    speedMax: 240,
    liftMin: 90,
    liftMax: 240,
    lifeMin: 0.7,
    lifeMax: 1.3
};

const plain = (count, colors, shape, stain) => ({ groups: [{ count, colors, shape }], stain });

export const MONSTER_DEATH = {
    skeleton: plain(6, ['#e7e0cf', '#b9b09a', '#8f8772'], 'bone', 'rgba(14, 12, 9, 0.5)'),
    skeleton_crawler: plain(7, ['#e0d8c2', '#b2a98f', '#857d69'], 'bone', 'rgba(14, 12, 9, 0.5)'),
    bat: plain(4, ['#3b1d5c', '#7c3aed', '#2a1740'], 'shard', 'rgba(24, 8, 44, 0.5)'),
    vampire: plain(6, ['#7f1d1d', '#1c1917', '#b91c1c'], 'shard', 'rgba(48, 6, 10, 0.62)'),
    witch: plain(6, ['#581c87', '#f50bca', '#2e1065'], 'shard', 'rgba(30, 8, 48, 0.55)'),
    moth: plain(4, ['#d6b98a', '#8a6d47', '#f5e6c8'], 'shard', 'rgba(30, 22, 12, 0.42)'),
    bloater: plain(8, ['#a3e635', '#4d7c0f', '#d9f99d'], 'blob', 'rgba(30, 48, 6, 0.62)'),
    wraith: plain(5, ['#a5f3fc', '#0e7490', '#ecfeff'], 'shard', 'rgba(6, 30, 38, 0.42)'),
    shadow_wolf: plain(6, ['#2e2c3f', '#8ea3bf', '#0b0a12'], 'shard', 'rgba(10, 8, 20, 0.55)'),
    // Lobo zumbi: lascas roxas do corpo e ossos soltos, como os do esqueleto
    zombie_wolf: {
        groups: [
            { count: 4, colors: ['#2b2744', '#a78bfa', '#0d0b17'], shape: 'shard' },
            { count: 6, colors: ['#e0d8c2', '#b2a98f', '#857d69'], shape: 'bone', size: 1.1, lift: 1.1 }
        ],
        stain: 'rgba(20, 10, 40, 0.55)'
    },
    // --- Monstros das telas novas (22/11/2026). Os de osso (esqueletos e o zumbi) explodem no mesmo tipo de osso. ---
    skeleton_warrior: {
        groups: [
            { count: 10, colors: ['#e7e0cf', '#b9b09a', '#8f8772'], shape: 'bone', size: 1.15, lift: 1.2 },
            { count: 4, colors: ['#8a5532', '#6b7280', '#3b4452'], shape: 'plate', size: 1.1 },
            { count: 3, colors: ['#7a5a34', '#6a4a2c'], shape: 'wood', size: 1 }
        ],
        stain: 'rgba(14, 12, 9, 0.5)'
    },
    skeleton_archer: {
        groups: [
            { count: 10, colors: ['#e7e0cf', '#b9b09a', '#8f8772'], shape: 'bone', size: 1.1, lift: 1.2 },
            { count: 4, colors: ['#7a5a34', '#4a3320', '#dc2626'], shape: 'wood', size: 0.8, lift: 1.3 }
        ],
        stain: 'rgba(14, 12, 9, 0.5)'
    },
    // Zumbi de Armadura: tomba pesado como o cavaleiro, soltando placas enferrujadas e carne verde
    armored_zombie: {
        groups: [
            { count: 8, colors: ['#7c7468', '#3e3a33', '#8a4a2a'], shape: 'plate', size: 1.3, speed: 1.1, lift: 1.2 },
            { count: 6, colors: ['#e7e0cf', '#b9b09a', '#8f8772'], shape: 'bone', size: 1.1 },
            { count: 4, colors: ['#7f996a', '#52684a', '#5a1f2a'], shape: 'blob', size: 1.2, speed: 0.9 }
        ],
        stain: 'rgba(24, 34, 14, 0.62)',
        fall: { seconds: 1.5, tiltSeconds: 0.6, tilt: 1.4, shake: 0.07, sink: 0.3, pivot: 0.55, squash: 0.8, fade: 0.4 },
        dust: { radius: 2.4, seconds: 0.5, width: 5, color: '#a8a29e' }
    },
    // Zumbi: os mesmos ossos dos esqueletos, mais pedaços de carne verde e trapo
    zombie: {
        groups: [
            { count: 10, colors: ['#e7e0cf', '#b9b09a', '#8f8772'], shape: 'bone', size: 1.15, lift: 1.2 },
            { count: 5, colors: ['#86a070', '#55704a', '#5a1f2a'], shape: 'blob', size: 1.2, speed: 0.9 },
            { count: 3, colors: ['#5a4a38', '#3a2f24'], shape: 'cloth', size: 1.1 }
        ],
        stain: 'rgba(24, 34, 14, 0.62)'
    },
    // Enguia: a água explode em gotas azuis e o corpo se desfaz no chão (tomba, achata e afunda num respingo)
    river_eel: {
        groups: [
            { count: 12, colors: ['#38bdf8', '#7dd3fc', '#0ea5e9'], shape: 'drop', size: 1.1, lift: 1.3, speed: 1.1 },
            { count: 8, colors: ['#e0f2fe', '#a5f3fc'], shape: 'drop', size: 0.6, lift: 1.5 }
        ],
        stain: 'rgba(6, 40, 66, 0.5)',
        fall: { seconds: 1, tiltSeconds: 0.28, tilt: 0.9, shake: 0.05, sink: 0.5, pivot: 0.4, squash: 0.5, fade: 0.45 },
        dust: { radius: 1.7, seconds: 0.4, width: 3, color: '#7dd3fc' }
    },
    // Afogado: desmancha em água e algas, caindo devagar e afundando
    drowned: {
        groups: [
            { count: 10, colors: ['#5ea0b4', '#8fb4c4', '#2f6b4a'], shape: 'drop', size: 1.1, lift: 1.1 },
            { count: 8, colors: ['#2f6b4a', '#4c9a6a', '#1d3a40'], shape: 'leaf', size: 1.1, gravity: 0.5, life: 1.4 }
        ],
        stain: 'rgba(8, 36, 44, 0.55)',
        fall: { seconds: 1.4, tiltSeconds: 0.55, tilt: 1.25, shake: 0.04, sink: 0.7, pivot: 0.5, squash: 0.6, fade: 0.5 },
        dust: { radius: 1.6, seconds: 0.45, width: 3, color: '#67e8f9' }
    },
    // Sapo: vira de barriga para cima, achatado, e estoura em gotas verdes
    bog_toad: {
        groups: [
            { count: 10, colors: ['#5d9438', '#8cc85a', '#3a6524'], shape: 'drop', size: 1.1, lift: 1.2 },
            { count: 4, colors: ['#d8e089', '#e9c46a'], shape: 'drop', size: 0.8 }
        ],
        stain: 'rgba(20, 40, 10, 0.6)',
        fall: { seconds: 1.1, tiltSeconds: 0.35, tilt: 1.5, shake: 0.06, sink: 0.35, pivot: 0.45, squash: 0.5, fade: 0.4 },
        dust: { radius: 1.5, seconds: 0.35, width: 3, color: '#a3e635' }
    },
    // Lodo vivo: espirra para todo lado em gotas grandes e uma mancha larga
    bog_slime: {
        groups: [
            { count: 14, colors: ['#3f7a2c', '#7cc050', '#23491a'], shape: 'drop', size: 1.5, speed: 1.2, lift: 1.1 },
            { count: 12, colors: ['#bef264', '#7cc050'], shape: 'drop', size: 0.7, speed: 1.4, lift: 1.5 }
        ],
        stain: 'rgba(14, 34, 10, 0.68)'
    },
    // Miliciano: cai de lado, com lascas de madeira (machado e escudo) e trapos
    militia: {
        groups: [
            { count: 4, colors: ['#8a6238', '#6a4a2c', '#b91c1c'], shape: 'wood', size: 1.1 },
            { count: 5, colors: ['#b8a06c', '#7a6a50'], shape: 'cloth', size: 1 }
        ],
        stain: 'rgba(40, 22, 12, 0.55)',
        fall: { seconds: 1.2, tiltSeconds: 0.5, tilt: 1.35, shake: 0.05, sink: 0.3, pivot: 0.5, squash: 0.75, fade: 0.4 },
        dust: { radius: 1.8, seconds: 0.4, width: 3.5, color: '#a8a29e' }
    },
    // Cavaleiro de Placas: tomba pesado, com um estrondo, soltando pedaços de armadura
    plate_knight: {
        groups: [
            { count: 8, colors: ['#a9b2c0', '#5b6473', '#e1e7f0'], shape: 'plate', size: 1.3, speed: 1.1, lift: 1.2 },
            { count: 3, colors: ['#b91c1c', '#7f1d1d'], shape: 'cloth', size: 1.1 }
        ],
        stain: 'rgba(10, 12, 20, 0.55)',
        fall: { seconds: 1.5, tiltSeconds: 0.6, tilt: 1.45, shake: 0.07, sink: 0.25, pivot: 0.55, squash: 0.8, fade: 0.4 },
        dust: { radius: 2.4, seconds: 0.5, width: 5, color: '#cbd5e1' }
    },
    // Lanceiro: tomba como o cavaleiro, com lascas da lança
    lancer: {
        groups: [
            { count: 7, colors: ['#59627a', '#2c3344', '#98a3bd'], shape: 'plate', size: 1.2, speed: 1.1, lift: 1.2 },
            { count: 3, colors: ['#7c3aed', '#5b21b6'], shape: 'cloth', size: 1.1 },
            { count: 3, colors: ['#6a4a2c', '#2e2012'], shape: 'wood', size: 0.9, lift: 1.3 }
        ],
        stain: 'rgba(14, 10, 28, 0.55)',
        fall: { seconds: 1.4, tiltSeconds: 0.55, tilt: 1.4, shake: 0.06, sink: 0.25, pivot: 0.55, squash: 0.8, fade: 0.4 },
        dust: { radius: 2.2, seconds: 0.45, width: 4.5, color: '#a78bfa' }
    },
    // Demônio: estoura em brasas que sobem e caem devagar, e fica uma mancha queimada
    demon: {
        groups: [
            { count: 18, colors: ['#fb923c', '#fbbf24', '#ef4444'], shape: 'ember', size: 1, lift: 1.4, gravity: 0.55, life: 1.3, speed: 1.1 },
            { count: 4, colors: ['#7a1d18', '#3a0d0a'], shape: 'plate', size: 0.9 }
        ],
        stain: 'rgba(30, 6, 4, 0.68)'
    },
    headless_knight: plain(9, ['#4f576b', '#2b3140', '#a5f3fc'], 'shard', 'rgba(10, 12, 20, 0.6)'),
    bone_colossus: plain(16, ['#c9bfa3', '#8a806a', '#fb923c'], 'bone', 'rgba(30, 24, 14, 0.6)'),
    // Golem: explode em pedras (grandes e pequenas) e algumas brasas; não tomba
    golem: {
        groups: [
            { count: 12, colors: ['#6b625a', '#9a8f82', '#3b352f'], shape: 'rock', size: 1.9, speed: 1.3, lift: 1.3, life: 1.5 },
            { count: 12, colors: ['#8a8074', '#4a433c'], shape: 'rock', size: 1, speed: 1.6, lift: 1.1 },
            { count: 4, colors: ['#ff6a13', '#ffc14d', '#ff3d00'], shape: 'shard', size: 0.8, speed: 1.2, lift: 1.5, life: 1.1 }
        ],
        stain: 'rgba(30, 20, 14, 0.6)'
    },
    // Treant: explode em troncos de madeira e uma nuvem de folhas que descem devagar; não tomba
    treant: {
        groups: [
            { count: 9, colors: ['#6b4423', '#5b3b22', '#7a5230'], shape: 'log', size: 1.7, speed: 1.4, lift: 1.25, life: 1.7 },
            { count: 6, colors: ['#5b3b22', '#3f2815', '#7a5230'], shape: 'wood', size: 1.4, speed: 1.1 },
            { count: 26, colors: ['#4ade80', '#22c55e', '#166534'], shape: 'leaf', size: 1.2, speed: 1, lift: 1.15, life: 2, gravity: 0.3 }
        ],
        stain: 'rgba(24, 40, 12, 0.55)'
    }
};

// Os grupos de pedaços de uma definição (as antigas, planas, com count/colors/shape direto, também valem)
export const groupsOf = (def) => def?.groups ?? (def?.count ? [{ count: def.count, colors: def.colors, shape: def.shape }] : []);

// Prepara UM pedaço (g é um objeto reaproveitado: nada é criado aqui). scale: tamanho do monstro em relação ao padrão
export function setupGib(g, group, x, y, scale = 1, random = Math.random) {
    const P = DEATH_PHYSICS;
    const angle = random() * Math.PI * 2;
    const speed = (P.speedMin + random() * (P.speedMax - P.speedMin)) * (group.speed ?? 1);
    const life = (P.lifeMin + random() * (P.lifeMax - P.lifeMin)) * (group.life ?? 1);
    g.x = x;
    g.y = y;
    g.z = 6;
    g.vx = Math.cos(angle) * speed;
    g.vy = Math.sin(angle) * speed;
    g.vz = (P.liftMin + random() * (P.liftMax - P.liftMin)) * (group.lift ?? 1);
    g.rotation = random() * Math.PI * 2;
    g.spin = (random() - 0.5) * 16;
    g.size = (2.2 + random() * 3.4) * Math.min(1.6, 0.8 + scale * 0.2) * (group.size ?? 1);
    g.color = group.colors[Math.floor(random() * group.colors.length)];
    g.shape = group.shape;
    g.gravity = group.gravity ?? 1;
    g.seed = random() * 6.28;
    g.life = life;
    g.maxLife = life;
    return g;
}

// Um passo da física de um pedaço: sobe, cai, quica uma vez e fica no chão até sumir
export function stepGib(g, dt) {
    const P = DEATH_PHYSICS;
    g.life -= dt;
    if (g.life <= 0) return false;
    if (g.z > 0 || g.vz > 0) {
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        // Folha: balança de um lado para o outro enquanto cai
        if (g.shape === 'leaf') g.x += Math.sin(g.life * 8 + g.seed) * 22 * dt;
        g.z += g.vz * dt;
        g.vz -= P.gravity * (g.gravity ?? 1) * dt;
        g.rotation += g.spin * dt;
        if (g.z <= 0) {
            g.z = 0;
            g.vz = -g.vz * P.bounce;
            g.vx *= 0.5;
            g.vy *= 0.5;
            g.spin *= 0.4;
            if (g.vz < 26) g.vz = 0;
        }
    }
    return true;
}

// Desenha um pedaço no ctx (o ctx fica como estava; o chamador zera globalAlpha no fim)
export function drawGib(ctx, g) {
    ctx.globalAlpha = Math.min(1, (g.life / g.maxLife) * 2.5);
    ctx.fillStyle = g.color;
    const s = g.size;
    ctx.translate(g.x, g.y - g.z);
    ctx.rotate(g.rotation);
    if (g.shape === 'bone') {
        ctx.fillRect(-s * 1.2, -s * 0.34, s * 2.4, s * 0.68);
        ctx.fillRect(-s * 1.4, -s * 0.6, s * 0.6, s * 1.2);
        ctx.fillRect(s * 0.8, -s * 0.6, s * 0.6, s * 1.2);
    } else if (g.shape === 'log') {
        // Tora: um cilindro de madeira visto de lado, com a face cortada (clara, com o anel de crescimento) numa ponta
        ctx.fillRect(-s * 1.5, -s * 0.55, s * 3, s * 1.1);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.fillRect(-s * 1.5, -s * 0.55, s * 3, s * 0.3);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.fillRect(-s * 1.5, s * 0.3, s * 3, s * 0.25);
        ctx.fillStyle = '#c8a06a';
        ctx.fillRect(s * 1.2, -s * 0.55, s * 0.3, s * 1.1);
        ctx.fillStyle = '#8a5d36';
        ctx.fillRect(s * 1.28, -s * 0.28, s * 0.14, s * 0.56);
    } else if (g.shape === 'rock') {
        // Pedra: pedaço irregular de 5 lados, com o topo mais claro e a base escura
        ctx.beginPath();
        ctx.moveTo(-s * 0.9, s * 0.1);
        ctx.lineTo(-s * 0.4, -s * 0.8);
        ctx.lineTo(s * 0.7, -s * 0.6);
        ctx.lineTo(s * 1.0, s * 0.3);
        ctx.lineTo(s * 0.1, s * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(-s * 0.4, -s * 0.8);
        ctx.lineTo(s * 0.7, -s * 0.6);
        ctx.lineTo(s * 0.2, -s * 0.1);
        ctx.lineTo(-s * 0.8, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fillRect(-s * 0.5, s * 0.4, s * 1.2, s * 0.35);
    } else if (g.shape === 'wood') {
        // Casca: um tablado torto, com uma lasca mais clara em cima
        ctx.fillRect(-s * 0.9, -s * 0.5, s * 1.8, s * 1.0);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.fillRect(-s * 0.9, -s * 0.5, s * 1.8, s * 0.28);
    } else if (g.shape === 'leaf') {
        // Folha: um losango fino
        ctx.beginPath();
        ctx.moveTo(-s * 1.1, 0);
        ctx.lineTo(0, -s * 0.55);
        ctx.lineTo(s * 1.1, 0);
        ctx.lineTo(0, s * 0.55);
        ctx.closePath();
        ctx.fill();
    } else if (g.shape === 'drop') {
        // Gota (água, lodo): bolinha com um brilho no alto
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.62, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(-s * 0.2, -s * 0.22, s * 0.22, 0, Math.PI * 2);
        ctx.fill();
    } else if (g.shape === 'ember') {
        // Brasa: ponto quente que brilha e esfria; o miolo claro some antes
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 245, 200, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
        ctx.fill();
    } else if (g.shape === 'plate') {
        // Placa de armadura: retângulo de metal com brilho em cima e sombra embaixo
        ctx.fillRect(-s * 0.9, -s * 0.6, s * 1.8, s * 1.2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-s * 0.9, -s * 0.6, s * 1.8, s * 0.3);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-s * 0.9, s * 0.3, s * 1.8, s * 0.3);
    } else if (g.shape === 'cloth') {
        // Trapo: tira fina e comprida
        ctx.fillRect(-s * 1.1, -s * 0.28, s * 2.2, s * 0.56);
        ctx.fillRect(s * 0.4, -s * 0.5, s * 0.5, s * 0.5);
    } else {
        ctx.fillRect(-s * 0.7, -s * 0.5, s * 1.4, s);
    }
    ctx.rotate(-g.rotation);
    ctx.translate(-g.x, -(g.y - g.z));
}

// --- O CORPO TOMBANDO ---
// age em segundos desde a morte. Devolve como desenhar o corpo agora:
//   rot (rad, vezes o sentido sorteado de cada morte), shake e dy (em raios do monstro: de lado e para baixo),
//   sy (achatamento vertical), alpha, landed (já bateu no chão)
const easeInQuad = (t) => t * t;
export function fallPose(fall, age) {
    const q = Math.min(1, age / fall.tiltSeconds);
    const landed = age >= fall.tiltSeconds;
    const sinkP = landed ? Math.min(1, (age - fall.tiltSeconds) / Math.max(0.001, fall.seconds - fall.tiltSeconds)) : 0;
    const fadeStart = fall.seconds * (1 - fall.fade);
    return {
        rot: fall.tilt * easeInQuad(q),
        shake: landed ? 0 : Math.sin(age * 70) * fall.shake * (1 - q),
        dy: fall.sink * sinkP,
        sy: 1 - (1 - fall.squash) * easeInQuad(q),
        alpha: age <= fadeStart ? 1 : Math.max(0, 1 - (age - fadeStart) / Math.max(0.001, fall.seconds - fadeStart)),
        landed
    };
}
