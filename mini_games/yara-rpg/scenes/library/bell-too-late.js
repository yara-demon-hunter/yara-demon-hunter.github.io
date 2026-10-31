// Cena: "O sino tocou tarde demais". Abre toda jornada nova; é desenhada em código, sem imagens.
// Noite na floresta: o herói anda com uma tocha azul, o sino toca, a névoa estremece e olhos se abrem.
(() => {
    const { clamp, ease } = window.YaraScenes;

    // --- DADOS VISUAIS ---
    const WIDTH = 320;
    const HEIGHT = 180;
    const TAU = Math.PI * 2;
    const COLORS = {
        skyTop: '#04070f',
        skyMiddle: '#0c1a2c',
        skyHorizon: '#233f55',
        moon: '#e6eef0',
        moonShade: '#b4c5cc',
        moonHalo: '170, 210, 230',
        star: '205, 225, 240',
        hill: '#13263a',
        tower: '#0c1726',
        towerLit: '#1b2c40',
        windowGlow: '229, 185, 86',
        bell: '#2a2013',
        wave: '236, 196, 104',
        cloud: '120, 150, 175',
        mist: '165, 195, 212',
        treesFar: ['#1c3448', '#142739'],
        treesMid: ['#0f1f30', '#0a1623'],
        treesNear: ['#060c14', '#03060b'],
        ground: ['#0d1a24', '#04080d'],
        grass: '#0b1a22',
        cloak: '#10161f',
        cloakLit: '#3d5c78',
        hood: '#0a0f16',
        pants: '#1d2a38',
        skin: '#4e4238',
        wood: '#3a2a1c',
        blade: ['#f2f8fc', '#7f97aa'],
        flameOuter: '60, 170, 255',
        flameInner: '#eafcff',
        torchLight: '120, 200, 255',
        eye: '255, 64, 48',
        pupil: '#1a0403',
        bird: '#060a11',
        shade: '2, 4, 9'
    };

    // --- ROTEIRO (segundos) ---
    const DURATION = 15;
    const TOLLS = [3.4, 5.9, 8.4];
    const WALK_END = 9.4;
    const WALK_DISTANCE = 46;
    const EYES_START = 9;
    const BLADE_DRAWN_AT = 11;
    const FADE_OUT_AT = 13.6;
    const HERO_X = 118;
    const GROUND_Y = 152;
    const TOWER_X = 258;
    const TOWER_BASE_Y = 92;
    const BELL_Y = 54;
    const NEAR_TREES = [[-8, 176], [26, 132], [302, 146], [338, 184]];
    const EYES = [
        { x: 40, y: 116, size: 1, delay: 0 }, { x: 286, y: 122, size: 1.1, delay: .35 },
        { x: 74, y: 130, size: .8, delay: .7 }, { x: 242, y: 112, size: .75, delay: 1 },
        { x: 18, y: 136, size: 1.2, delay: 1.25 }, { x: 306, y: 102, size: .9, delay: 1.5 },
        { x: 206, y: 132, size: .7, delay: 1.7 }
    ];

    const tollAge = (t) => {
        const last = TOLLS.filter((at) => at <= t).pop();
        return last === undefined ? Infinity : t - last;
    };
    const walked = (t) => {
        const progress = clamp(t / WALK_END);
        return (1 - (1 - progress) ** 2) * WALK_DISTANCE;
    };
    const flicker = (t) => .88 + Math.sin(t * 13) * .06 + Math.sin(t * 29 + 1.3) * .04;

    function makeLayer(width, height, scale) {
        const layer = document.createElement('canvas');
        layer.width = Math.ceil(width * scale);
        layer.height = Math.ceil(height * scale);
        const g = layer.getContext('2d');
        g.scale(scale, scale);
        return { layer, g };
    }

    // Pinheiro de galhos caídos: cada nível é um par de curvas que termina em ponta irregular.
    function drawPine(g, x, baseY, height, random) {
        const levels = Math.max(6, Math.round(height / 8));
        g.beginPath();
        g.moveTo(x - height * .018, baseY);
        g.lineTo(x - height * .008, baseY - height * .5);
        g.lineTo(x + height * .008, baseY - height * .5);
        g.lineTo(x + height * .018, baseY);
        g.fill();
        for (let level = 0; level < levels; level++) {
            const progress = level / levels;
            const y = baseY - height * (.1 + progress * .78);
            const half = height * .27 * (1 - progress) ** .85 + height * .018;
            const rise = height * .3 * (1 - progress * .55);
            const left = half * (.85 + random() * .3);
            const right = half * (.85 + random() * .3);
            const dropLeft = (random() - .3) * height * .025;
            const dropRight = (random() - .3) * height * .025;
            g.beginPath();
            g.moveTo(x, y - rise);
            g.quadraticCurveTo(x - left * .3, y - rise * .32, x - left, y + dropLeft);
            g.quadraticCurveTo(x - left * .45, y - rise * .1, x, y - rise * .02);
            g.quadraticCurveTo(x + right * .45, y - rise * .1, x + right, y + dropRight);
            g.quadraticCurveTo(x + right * .3, y - rise * .32, x, y - rise);
            g.fill();
        }
    }

    function verticalGradient(g, [top, bottom], from, to) {
        const gradient = g.createLinearGradient(0, from, 0, to);
        gradient.addColorStop(0, top);
        gradient.addColorStop(1, bottom);
        return gradient;
    }

    function makeTreeLayer({ colors, count, minHeight, maxHeight, baseY, seed }, scale, layerWidth, seededRandom) {
        const { layer, g } = makeLayer(layerWidth, HEIGHT, scale);
        const random = seededRandom(seed);
        g.fillStyle = verticalGradient(g, colors, baseY - maxHeight, baseY);
        for (let i = 0; i < count; i++) {
            const x = (i + random() * .8) / count * layerWidth;
            const height = minHeight + random() * (maxHeight - minHeight);
            const y = baseY + random() * 3;
            const treeSeed = Math.floor(random() * 1e6);
            // Repete nas duas pontas para a camada rolar sem emenda.
            [x - layerWidth, x, x + layerWidth].forEach((copyX) => {
                drawPine(g, copyX, y, height, seededRandom(treeSeed));
            });
        }
        g.fillRect(0, baseY, layerWidth, HEIGHT - baseY);
        return layer;
    }

    // Moldura de árvores nas bordas: nunca passa na frente do herói.
    function makeNearFrame(scale, seededRandom) {
        const { layer, g } = makeLayer(WIDTH + 40, HEIGHT, scale);
        const random = seededRandom(77);
        g.fillStyle = verticalGradient(g, COLORS.treesNear, 0, HEIGHT);
        NEAR_TREES.forEach(([x, height]) => drawPine(g, x, HEIGHT + 8, height, random));
        return layer;
    }

    function makeGroundLayer(scale, layerWidth, seededRandom) {
        const { layer, g } = makeLayer(layerWidth, HEIGHT, scale);
        const random = seededRandom(31);
        const edge = (x) => GROUND_Y + Math.sin(x / layerWidth * TAU * 3) * 1.4 + Math.sin(x / layerWidth * TAU * 7) * .6;
        g.fillStyle = verticalGradient(g, COLORS.ground, GROUND_Y - 2, HEIGHT);
        g.beginPath();
        g.moveTo(0, HEIGHT);
        for (let x = 0; x <= layerWidth; x += 4) g.lineTo(x, edge(x));
        g.lineTo(layerWidth, HEIGHT);
        g.fill();
        g.strokeStyle = COLORS.grass;
        g.lineCap = 'round';
        g.lineWidth = .7;
        for (let i = 0; i < 300; i++) {
            const x = random() * layerWidth;
            const y = edge(x) + random() * 3;
            const height = 2 + random() * 4;
            g.beginPath();
            g.moveTo(x, y + 1);
            g.quadraticCurveTo(x + .4, y - height * .6, x + (random() - .5) * 3, y - height);
            g.stroke();
        }
        return layer;
    }

    // Tufos de névoa: várias manchas suaves sobrepostas, para não parecer uma elipse.
    function makeMistSprite(random) {
        const { layer, g } = makeLayer(180, 60, 2);
        for (let i = 0; i < 14; i++) {
            const x = 40 + random() * 100;
            const y = 22 + random() * 16;
            const radius = 16 + random() * 22;
            const gradient = g.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgba(${COLORS.mist}, .13)`);
            gradient.addColorStop(1, `rgba(${COLORS.mist}, 0)`);
            g.fillStyle = gradient;
            g.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
        return layer;
    }

    // Grão fino: disfarça as faixas dos degradês escuros.
    function makeGrain(random) {
        const grain = document.createElement('canvas');
        grain.width = grain.height = 128;
        const g = grain.getContext('2d');
        const pixels = g.createImageData(128, 128);
        for (let i = 0; i < pixels.data.length; i += 4) {
            const shade = random() < .5 ? 0 : 255;
            pixels.data.fill(shade, i, i + 3);
            pixels.data[i + 3] = random() * 6;
        }
        g.putImageData(pixels, 0, 0);
        return grain;
    }

    function setup({ seededRandom, scale }) {
        const random = seededRandom(1907);
        const layerWidth = WIDTH * 2;
        return {
            layerWidth,
            stars: Array.from({ length: 90 }, () => ({
                x: random() * WIDTH,
                y: random() * 92,
                radius: .2 + random() * .4,
                phase: random() * TAU
            })),
            far: makeTreeLayer({ colors: COLORS.treesFar, count: 24, minHeight: 26, maxHeight: 44, baseY: 126, seed: 11 }, scale, layerWidth, seededRandom),
            mid: makeTreeLayer({ colors: COLORS.treesMid, count: 13, minHeight: 44, maxHeight: 68, baseY: 142, seed: 23 }, scale, layerWidth, seededRandom),
            ground: makeGroundLayer(scale, layerWidth, seededRandom),
            near: makeNearFrame(scale, seededRandom),
            mistSprites: [makeMistSprite(random), makeMistSprite(random), makeMistSprite(random)],
            mist: Array.from({ length: 20 }, (_, index) => ({
                sprite: index % 3,
                x: random() * (WIDTH + 180) - 180,
                y: 92 + random() * 62,
                speed: 2.5 + random() * 6,
                size: .8 + random() * .7,
                front: random() < .4
            })),
            clouds: Array.from({ length: 4 }, (_, index) => ({
                sprite: index % 3,
                x: random() * WIDTH,
                y: 14 + random() * 34,
                speed: 1.5 + random() * 2
            })),
            birds: Array.from({ length: 9 }, () => ({
                x: 228 + random() * 56,
                y: 66 + random() * 34,
                speedX: -24 - random() * 30,
                speedY: -8 - random() * 12,
                phase: random() * TAU
            })),
            grain: makeGrain(random)
        };
    }

    function drawSky({ ctx, state }, t, distance) {
        const sky = ctx.createLinearGradient(0, 0, 0, 132);
        sky.addColorStop(0, COLORS.skyTop);
        sky.addColorStop(.6, COLORS.skyMiddle);
        sky.addColorStop(1, COLORS.skyHorizon);
        ctx.fillStyle = sky;
        ctx.fillRect(-12, -12, WIDTH + 24, HEIGHT + 24);

        state.stars.forEach((star) => {
            ctx.fillStyle = `rgba(${COLORS.star}, ${.25 + .6 * Math.abs(Math.sin(t * .7 + star.phase))})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, TAU);
            ctx.fill();
        });

        const moonX = 84 - distance * .2;
        const moonY = 42;
        const halo = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 64);
        halo.addColorStop(0, `rgba(${COLORS.moonHalo}, .42)`);
        halo.addColorStop(1, `rgba(${COLORS.moonHalo}, 0)`);
        ctx.fillStyle = halo;
        ctx.fillRect(moonX - 64, moonY - 64, 128, 128);
        const disc = ctx.createRadialGradient(moonX - 4, moonY - 4, 2, moonX, moonY, 15);
        disc.addColorStop(0, COLORS.moon);
        disc.addColorStop(1, COLORS.moonShade);
        ctx.fillStyle = disc;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 14, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(130, 150, 165, .35)';
        [[-5, -3, 3.4], [3, 4, 4.4], [5, -6, 2.2], [-4, 7, 2]].forEach(([x, y, radius]) => {
            ctx.beginPath();
            ctx.arc(moonX + x, moonY + y, radius, 0, TAU);
            ctx.fill();
        });

        ctx.globalAlpha = .28;
        state.clouds.forEach((cloud) => {
            const span = WIDTH + 260;
            const x = ((cloud.x + cloud.speed * t) % span) - 240;
            ctx.drawImage(state.mistSprites[cloud.sprite], x, cloud.y, 240, 60);
        });
        ctx.globalAlpha = 1;
    }

    function drawTower({ ctx }, t, distance) {
        const age = tollAge(t);
        const x = TOWER_X - distance * .25;
        const glow = Number.isFinite(age) ? Math.exp(-age * 1.1) : 0;

        ctx.fillStyle = verticalGradient(ctx, [COLORS.hill, '#0c1a2a'], 84, 140);
        ctx.beginPath();
        ctx.moveTo(x - 124, 140);
        ctx.bezierCurveTo(x - 70, 112, x - 34, 90, x, 88);
        ctx.bezierCurveTo(x + 34, 90, x + 80, 110, x + 130, 136);
        ctx.lineTo(x + 130, 150);
        ctx.lineTo(x - 124, 150);
        ctx.fill();

        const walls = ctx.createLinearGradient(x - 11, 0, x + 11, 0);
        walls.addColorStop(0, COLORS.towerLit);
        walls.addColorStop(.45, COLORS.tower);
        walls.addColorStop(1, COLORS.tower);
        ctx.fillStyle = walls;
        ctx.beginPath();
        ctx.moveTo(x - 11, TOWER_BASE_Y);
        ctx.lineTo(x - 8.5, 40);
        ctx.lineTo(x + 8.5, 40);
        ctx.lineTo(x + 11, TOWER_BASE_Y);
        ctx.fill();
        ctx.fillStyle = COLORS.tower;
        ctx.beginPath();
        ctx.moveTo(x - 11.5, 41);
        ctx.quadraticCurveTo(x - 4, 34, x, 16);
        ctx.quadraticCurveTo(x + 4, 34, x + 11.5, 41);
        ctx.fill();
        ctx.fillRect(x - .4, 9, .8, 8);
        ctx.fillRect(x - 2.4, 11.5, 4.8, .8);

        // Arco do campanário, que acende a cada badalada
        const arch = () => {
            ctx.beginPath();
            ctx.moveTo(x - 5.5, 62);
            ctx.lineTo(x - 5.5, 49);
            ctx.quadraticCurveTo(x, 42, x + 5.5, 49);
            ctx.lineTo(x + 5.5, 62);
            ctx.closePath();
        };
        ctx.fillStyle = `rgba(${COLORS.windowGlow}, ${.28 + glow * .72})`;
        arch();
        ctx.fill();
        const shine = ctx.createRadialGradient(x, BELL_Y, 2, x, BELL_Y, 22 + glow * 26);
        shine.addColorStop(0, `rgba(${COLORS.windowGlow}, ${.08 + glow * .32})`);
        shine.addColorStop(1, `rgba(${COLORS.windowGlow}, 0)`);
        ctx.fillStyle = shine;
        ctx.fillRect(x - 50, BELL_Y - 50, 100, 100);

        // O sino balança enquanto o som dura.
        const swing = Number.isFinite(age) ? Math.sin(age * 7) * .5 * Math.exp(-age * .9) : 0;
        ctx.save();
        ctx.translate(x, 46.5);
        ctx.rotate(swing);
        ctx.fillStyle = COLORS.bell;
        ctx.beginPath();
        ctx.moveTo(-1.6, 1);
        ctx.quadraticCurveTo(-3, 3, -3.2, 7);
        ctx.quadraticCurveTo(-3.6, 9.5, -5, 11);
        ctx.lineTo(5, 11);
        ctx.quadraticCurveTo(3.6, 9.5, 3.2, 7);
        ctx.quadraticCurveTo(3, 3, 1.6, 1);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(Math.sin(swing * 2) * 1.2, 12, 1, 0, TAU);
        ctx.fill();
        ctx.restore();

        TOLLS.forEach((at) => {
            const waveAge = t - at;
            if (waveAge < 0 || waveAge > 2.4) return;
            const radius = waveAge * 118 + 6;
            const strength = (1 - waveAge / 2.4) * .5;
            const ring = ctx.createRadialGradient(x, BELL_Y, radius * .8, x, BELL_Y, radius);
            ring.addColorStop(0, `rgba(${COLORS.wave}, 0)`);
            ring.addColorStop(.86, `rgba(${COLORS.wave}, ${strength})`);
            ring.addColorStop(1, `rgba(${COLORS.wave}, 0)`);
            ctx.fillStyle = ring;
            ctx.fillRect(x - radius, BELL_Y - radius, radius * 2, radius * 2);
        });
    }

    function drawLayer({ ctx, state }, layer, offset) {
        const x = -(offset % state.layerWidth);
        ctx.drawImage(layer, x, 0, state.layerWidth, HEIGHT);
        ctx.drawImage(layer, x + state.layerWidth, 0, state.layerWidth, HEIGHT);
    }

    function drawBirds({ ctx, state }, t) {
        const age = t - TOLLS[0];
        if (age < 0) return;
        ctx.strokeStyle = COLORS.bird;
        ctx.lineWidth = .8;
        ctx.lineCap = 'round';
        state.birds.forEach((bird) => {
            const x = bird.x + bird.speedX * age;
            const y = bird.y + bird.speedY * age + Math.sin(age * 3 + bird.phase) * 2;
            const wing = Math.sin(age * 15 + bird.phase) * 1.8;
            ctx.beginPath();
            ctx.moveTo(x - 3, y + wing);
            ctx.quadraticCurveTo(x - 1.2, y - .8, x, y);
            ctx.quadraticCurveTo(x + 1.2, y - .8, x + 3, y + wing);
            ctx.stroke();
        });
    }

    function drawMist({ ctx, state }, t, front) {
        const age = tollAge(t);
        const tremble = Number.isFinite(age) ? Math.exp(-age * 1.4) * 4 : 0;
        ctx.globalAlpha = (front ? .6 : .9) + ease(t, EYES_START, 12) * .1;
        state.mist.filter((blob) => blob.front === front).forEach((blob) => {
            const span = WIDTH + 280;
            const x = ((blob.x + blob.speed * t) % span + span) % span - 240;
            const y = blob.y + Math.sin(t * .6 + blob.x) * 2 + Math.sin(age * 8 + blob.x) * tremble;
            ctx.drawImage(state.mistSprites[blob.sprite], x, y, 180 * blob.size, 60 * blob.size);
        });
        ctx.globalAlpha = 1;
    }

    function limb(ctx, color, width, fromX, fromY, midX, midY, toX, toY) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.quadraticCurveTo(midX, midY, toX, toY);
        ctx.stroke();
    }

    // Herói encapuzado, de perfil para a direita, com origem nos pés.
    function drawHero({ ctx }, t) {
        const walking = ease(t, WALK_END - .6, WALK_END - .1);
        const pace = t * 6.4;
        const stride = Math.sin(pace) * (1 - walking);
        const bob = Math.abs(Math.cos(pace)) * .9 * (1 - walking);
        const drawn = ease(t, BLADE_DRAWN_AT, BLADE_DRAWN_AT + .5);
        const wind = Math.sin(t * 3.1) * 1.4 + Math.sin(t * 5.3) * .7;

        ctx.save();
        ctx.translate(HERO_X, GROUND_Y + 1);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const shadow = ctx.createRadialGradient(0, 1, 0, 0, 1, 15);
        shadow.addColorStop(0, 'rgba(0, 0, 0, .65)');
        shadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadow;
        ctx.save();
        ctx.scale(1, .22);
        ctx.fillRect(-16, -12, 32, 28);
        ctx.restore();

        // Pernas
        const hipY = -17 + bob;
        limb(ctx, COLORS.pants, 3, -1, hipY, 1 - stride * 3, -9, -stride * 6, -1 + Math.max(0, stride) * 1.5);
        limb(ctx, COLORS.pants, 3, 1, hipY, 2 + stride * 3, -9, stride * 6, -1 + Math.max(0, -stride) * 1.5);

        ctx.translate(0, bob);

        // A tocha está na mão direita, do lado de quem assiste. A espada sai da esquerda: esse braço
        // é desenhado antes da capa, passa por trás do corpo e a ponta fica sempre voltada para o chão.
        if (drawn > 0) {
            const angle = (.5 - drawn * .2) * Math.PI;
            const bladeLength = 20 * drawn;
            const swordHandX = 2 + drawn * 9;
            const swordHandY = -22 + drawn * 2;
            limb(ctx, COLORS.pants, 3, 1, -32, 5, -25, swordHandX, swordHandY);
            ctx.save();
            ctx.translate(swordHandX, swordHandY);
            ctx.rotate(angle);
            const blade = ctx.createLinearGradient(0, -1, 0, 1);
            blade.addColorStop(0, COLORS.blade[0]);
            blade.addColorStop(1, COLORS.blade[1]);
            ctx.fillStyle = blade;
            ctx.beginPath();
            ctx.moveTo(1, -.9);
            ctx.lineTo(bladeLength, -.5);
            ctx.lineTo(bladeLength + 2.5 * drawn, 0);
            ctx.lineTo(bladeLength, .5);
            ctx.lineTo(1, .9);
            ctx.fill();
            ctx.fillStyle = COLORS.wood;
            ctx.fillRect(-.6, -2.2, 1.4, 4.4);
            ctx.restore();
        }

        // Capa ao vento
        const cloak = ctx.createLinearGradient(-12, 0, 8, 0);
        cloak.addColorStop(0, COLORS.cloak);
        cloak.addColorStop(.72, COLORS.cloak);
        cloak.addColorStop(1, COLORS.cloakLit);
        ctx.fillStyle = cloak;
        ctx.beginPath();
        ctx.moveTo(3, -36);
        ctx.bezierCurveTo(6, -28, 6, -18, 4, -11);
        ctx.quadraticCurveTo(-1, -8 + wind * .4, -6, -9);
        ctx.quadraticCurveTo(-11, -7 - wind * .5, -17 - wind, -10 + wind);
        ctx.bezierCurveTo(-13, -19, -8, -30, -3, -37);
        ctx.closePath();
        ctx.fill();

        // Capuz pontudo caindo para trás, com o rosto quase todo na sombra
        ctx.fillStyle = COLORS.hood;
        ctx.beginPath();
        ctx.moveTo(-4, -35);
        ctx.quadraticCurveTo(-7, -38, -10.5 - wind * .4, -39 + wind * .3);
        ctx.quadraticCurveTo(-6, -41, -3.5, -44.5);
        ctx.quadraticCurveTo(0, -47.5, 3.4, -45.5);
        ctx.quadraticCurveTo(6, -43.5, 6.4, -39.5);
        ctx.quadraticCurveTo(6, -36.5, 3.5, -35);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = COLORS.skin;
        ctx.beginPath();
        ctx.moveTo(3.4, -43);
        ctx.quadraticCurveTo(5.8, -41, 5.4, -38.6);
        ctx.quadraticCurveTo(4, -37.6, 3.2, -38.6);
        ctx.quadraticCurveTo(2.6, -41, 3.4, -43);
        ctx.fill();

        // Braço e tocha à frente
        const handX = 12;
        const handY = -28 + Math.sin(pace) * .5 * (1 - walking);
        limb(ctx, COLORS.cloak, 3.2, 2, -33, 8, -31, handX, handY);
        ctx.strokeStyle = COLORS.wood;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(handX - .6, handY + 5);
        ctx.lineTo(handX + 1, handY - 10);
        ctx.stroke();

        const flameX = handX + 1.1;
        const flameBase = handY - 10;
        const height = 8 * flicker(t);
        const lean = -wind * .5;
        ctx.fillStyle = `rgb(${COLORS.flameOuter})`;
        ctx.beginPath();
        ctx.moveTo(flameX - 2.6, flameBase);
        ctx.bezierCurveTo(flameX - 3.4, flameBase - height * .5, flameX + lean, flameBase - height * .7, flameX + lean, flameBase - height);
        ctx.bezierCurveTo(flameX + lean, flameBase - height * .7, flameX + 3.4, flameBase - height * .5, flameX + 2.6, flameBase);
        ctx.quadraticCurveTo(flameX, flameBase + 2, flameX - 2.6, flameBase);
        ctx.fill();
        ctx.fillStyle = COLORS.flameInner;
        ctx.beginPath();
        ctx.ellipse(flameX + lean * .3, flameBase - height * .28, 1.2, height * .3, 0, 0, TAU);
        ctx.fill();
        ctx.restore();

        return { x: HERO_X + flameX, y: GROUND_Y + 1 + bob + flameBase - 3 };
    }

    function drawDarkness({ ctx }, t, torch) {
        const radius = 96 * flicker(t);
        const dread = ease(t, EYES_START, 12.5);
        const dark = ctx.createRadialGradient(torch.x, torch.y, 10, torch.x, torch.y, radius + 120);
        dark.addColorStop(0, `rgba(${COLORS.shade}, 0)`);
        dark.addColorStop(.4, `rgba(${COLORS.shade}, ${.08 + dread * .3})`);
        dark.addColorStop(1, `rgba(${COLORS.shade}, ${.42 + dread * .42})`);
        ctx.fillStyle = dark;
        ctx.fillRect(-12, -12, WIDTH + 24, HEIGHT + 24);

        ctx.globalCompositeOperation = 'lighter';
        const light = ctx.createRadialGradient(torch.x, torch.y, 0, torch.x, torch.y, radius * .8);
        light.addColorStop(0, `rgba(${COLORS.torchLight}, .5)`);
        light.addColorStop(.25, `rgba(${COLORS.torchLight}, .16)`);
        light.addColorStop(1, `rgba(${COLORS.torchLight}, 0)`);
        ctx.fillStyle = light;
        ctx.fillRect(-12, -12, WIDTH + 24, HEIGHT + 24);
        ctx.globalCompositeOperation = 'source-over';
    }

    // `side` espelha os olhos do par para ficarem inclinados para dentro, em expressão de ameaça.
    function drawEye(ctx, x, y, size, open, side) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 6 * size);
        glow.addColorStop(0, `rgba(${COLORS.eye}, ${.55 * open})`);
        glow.addColorStop(1, `rgba(${COLORS.eye}, 0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(x - 6 * size, y - 6 * size, 12 * size, 12 * size);
        ctx.fillStyle = `rgb(${COLORS.eye})`;
        ctx.beginPath();
        ctx.moveTo(x - 1.9 * size, y - side * .7 * size);
        ctx.quadraticCurveTo(x, y - 1.2 * size * open, x + 1.9 * size, y + side * .7 * size);
        ctx.quadraticCurveTo(x, y + 1.3 * size * open, x - 1.9 * size, y - side * .7 * size);
        ctx.fill();
        ctx.fillStyle = COLORS.pupil;
        ctx.fillRect(x - .12 * size, y - .7 * size * open, .24 * size, 1.4 * size * open);
    }

    function drawEyes({ ctx }, t) {
        EYES.forEach((eye) => {
            const blink = Math.sin(t * 1.3 + eye.x) > .96 ? 0 : 1;
            const open = ease(t, EYES_START + eye.delay, EYES_START + eye.delay + .5) * blink;
            if (open <= 0) return;
            drawEye(ctx, eye.x, eye.y, eye.size, open, 1);
            drawEye(ctx, eye.x + 6.5 * eye.size, eye.y, eye.size, open, -1);
        });
    }

    function drawGrain({ ctx, state, width, height, scale }, t) {
        const shift = Math.floor(t * 24) * 37 % 128;
        ctx.setTransform(1, 0, 0, 1, -shift, -shift);
        ctx.fillStyle = ctx.createPattern(state.grain, 'repeat');
        ctx.fillRect(0, 0, width * scale + 128, height * scale + 128);
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }

    function drawFade({ ctx }, t) {
        const opacity = Math.max(1 - ease(t, 0, 1.6), ease(t, FADE_OUT_AT, DURATION - .2));
        if (opacity <= 0) return;
        ctx.fillStyle = `rgba(2, 3, 6, ${opacity})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    function draw(frame, t) {
        const { ctx, reducedMotion, state } = frame;
        const distance = walked(t);
        const age = tollAge(t);
        const shake = !reducedMotion && Number.isFinite(age) ? Math.exp(-age * 4) * 1.6 : 0;

        ctx.save();
        ctx.translate(Math.sin(t * 57) * shake, Math.cos(t * 43) * shake);
        // Aproxima devagar: a floresta fecha em volta do herói.
        const zoom = 1.02 + ease(t, 8.6, 13.6) * .16;
        ctx.translate(HERO_X, GROUND_Y);
        ctx.scale(zoom, zoom);
        ctx.translate(-HERO_X, -GROUND_Y);

        drawSky(frame, t, distance);
        drawLayer(frame, state.far, distance * .35);
        drawTower(frame, t, distance);
        drawBirds(frame, t);
        drawMist(frame, t, false);
        drawLayer(frame, state.mid, distance * .65);
        drawLayer(frame, state.ground, distance);
        const torch = drawHero(frame, t);
        drawMist(frame, t, true);
        drawDarkness(frame, t, torch);
        ctx.drawImage(state.near, -distance * .3, 0, WIDTH + 40, HEIGHT);
        drawEyes(frame, t);
        ctx.restore();
        drawGrain(frame, t);
        drawFade(frame, t);
    }

    window.YaraScenes.register({
        id: 'bell-too-late',
        title: { pt: 'O sino tocou tarde demais', en: 'The bell rang too late' },
        width: WIDTH,
        height: HEIGHT,
        duration: DURATION,
        cues: [
            ...TOLLS.map((at) => ({ at, run: (audio) => audio.bell() })),
            { at: EYES_START, run: (audio) => audio.rumble() }
        ],
        captions: [
            { from: .8, to: 3.2, text: { pt: 'A névoa desceu antes do anoitecer.', en: 'The mist came down before nightfall.' } },
            { from: 3.7, to: 7.8, text: { pt: 'O sino tocou tarde demais.', en: 'The bell rang too late.' } },
            { from: 9.2, to: 12.6, text: { pt: 'E a floresta abriu os olhos.', en: 'And the forest opened its eyes.' } }
        ],
        setup,
        draw
    });
})();
