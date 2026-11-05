// Palco de ação: uma faixa lateral (1D) acima do log que mostra o que está acontecendo.
// O herói (silhueta desenhada em código) anda ao explorar, senta na fogueira ao descansar,
// avança contra o monstro ao atacar etc. O monstro usa a própria imagem, esfumada na névoa.
// Só descreve: não muda nenhuma regra. Liga-se ao jogo embrulhando as ações globais
// (exploreForest, combatQuickAttack…) e observando HP/combate a cada quadro.
// Personagens com esqueleto (js/data/rig/<id>.js) usam js/systems/rig.js; os demais, a silhueta abaixo.
// Classic browser script; carregar depois de combat.js, combat-outcomes.js, pets.js e rig.js.
window.YaraStage = (() => {
    const canvas = document.getElementById('action-stage-canvas');
    if (!canvas) return null;
    const g = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const ANIM_SECONDS = {
        walk: 1.1, rest: 2.6, potion: 1.1, attack: .45, heavy: .75,
        parry: .7, dodge: .6, flee: 1.2, fleeFail: .6, pet: .8
    };
    const INK = '#0b0f13';
    const RIM = 'rgba(150, 225, 235, .45)';
    const STEEL = '#d5dde3';

    let width = 0, height = 0;
    let anim = null;                  // ação do herói em andamento { type, start }
    let heroHurt = -9, monsterHurt = -9, monsterLunge = -9;
    let monster = null;               // { key, image, enter, dieAt }
    let scroll = 0;
    let last = { heroHp: null, monsterHp: null, inCombat: false };
    let particles = [];
    const images = new Map();

    const now = () => performance.now() / 1000;
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const ease = (p) => p * p * (3 - 2 * p);
    // 0 → 1 → 0 dentro de [a, b] da animação
    const bump = (p, a, b) => (p < a || p > b ? 0 : Math.sin(((p - a) / (b - a)) * Math.PI));

    function loadImage(src) {
        if (!src) return null;
        if (images.has(src)) return images.get(src);
        const entry = { img: new Image(), ready: false, masked: null };
        entry.img.onload = () => { entry.ready = true; };
        entry.img.src = src;
        images.set(src, entry);
        return entry;
    }

    // Imagem do monstro recortada num oval que se desfaz na névoa (feito uma vez por imagem).
    function maskedMonster(entry) {
        if (!entry?.ready) return null;
        if (entry.masked) return entry.masked;
        const size = 256;
        const off = document.createElement('canvas');
        off.width = off.height = size;
        const o = off.getContext('2d');
        const { naturalWidth: iw, naturalHeight: ih } = entry.img;
        const s = Math.max(size / iw, size / ih);
        o.drawImage(entry.img, (size - iw * s) / 2, (size - ih * s) / 2, iw * s, ih * s);
        o.globalCompositeOperation = 'destination-in';
        const fade = o.createRadialGradient(size / 2, size * .45, size * .18, size / 2, size * .5, size * .5);
        fade.addColorStop(0, 'rgba(0,0,0,1)');
        fade.addColorStop(.7, 'rgba(0,0,0,.85)');
        fade.addColorStop(1, 'rgba(0,0,0,0)');
        o.fillStyle = fade;
        o.fillRect(0, 0, size, size);
        entry.masked = off;
        return off;
    }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // --- FUNDO: cena da região rolando, névoa e chão ---
    function drawBackground(t, region) {
        const entry = loadImage(region?.sceneImage || region?.image);
        g.fillStyle = '#0d1517';
        g.fillRect(0, 0, width, height);
        if (entry?.ready) {
            const { naturalWidth: iw, naturalHeight: ih } = entry.img;
            const s = Math.max(width / iw, (height * 1.6) / ih);
            const w = iw * s, h = ih * s;
            const x = -((scroll * .35) % w);
            const y = (height - h) * .55;
            g.globalAlpha = .55;
            g.drawImage(entry.img, x, y, w, h);
            if (x + w < width) g.drawImage(entry.img, x + w, y, w, h);
            g.globalAlpha = 1;
        }
        const shade = g.createLinearGradient(0, 0, 0, height);
        shade.addColorStop(0, 'rgba(6,10,12,.55)');
        shade.addColorStop(.6, 'rgba(6,10,12,.15)');
        shade.addColorStop(1, 'rgba(6,10,12,.85)');
        g.fillStyle = shade;
        g.fillRect(0, 0, width, height);

        // troncos em primeiro plano passando mais rápido (paralaxe)
        g.fillStyle = 'rgba(5,8,10,.75)';
        for (let i = 0; i < 4; i++) {
            const span = width * .42;
            const x = ((i * span - scroll * 1.4) % (span * 4) + span * 4) % (span * 4) - span * .4;
            g.fillRect(x, 0, height * .07, height);
        }

        // névoa em faixas
        for (let i = 0; i < 3; i++) {
            const y = height * (.62 + i * .1);
            const x = ((t * (8 + i * 5) - scroll * .6) % width + width) % width;
            const mist = g.createRadialGradient(x, y, 0, x, y, width * .35);
            mist.addColorStop(0, 'rgba(170,205,210,.10)');
            mist.addColorStop(1, 'rgba(170,205,210,0)');
            g.fillStyle = mist;
            g.fillRect(0, 0, width, height);
        }
        const groundY = ground();
        g.fillStyle = 'rgba(4,6,8,.8)';
        g.fillRect(0, groundY, width, height - groundY);
        g.fillStyle = 'rgba(150,225,235,.12)';
        g.fillRect(0, groundY, width, 1);
    }

    const ground = () => height * .86;

    // --- HERÓI: caçador encapuzado de perfil, olhando para a direita ---
    function drawHero(x, gy, H, pose, t) {
        g.save();
        g.translate(x, gy);
        if (pose.flip) g.scale(-1, 1);
        g.rotate(pose.lean || 0);
        g.lineCap = 'round';
        g.lineJoin = 'round';
        const sit = pose.sit || 0;
        const hipY = -H * (.42 - sit * .22);

        // pernas
        g.strokeStyle = INK;
        g.lineWidth = H * .085;
        const stride = Math.sin(pose.walk || 0) * H * .13 * (1 - sit);
        g.beginPath();
        if (sit) {
            g.moveTo(-H * .02, hipY); g.lineTo(H * .16, hipY + H * .02); g.lineTo(H * .2, 0);
            g.moveTo(-H * .04, hipY); g.lineTo(H * .1, hipY + H * .06); g.lineTo(H * .08, 0);
        } else {
            g.moveTo(0, hipY); g.lineTo(stride, -H * .01);
            g.moveTo(0, hipY); g.lineTo(-stride, -H * .01);
        }
        g.stroke();

        // capa: balança com o vento e abre mais quando corre
        const top = hipY - H * .4;
        const flap = Math.sin(t * 5 + (pose.walk || 0)) * H * .03 + (pose.cape || 0) * H * .14;
        g.fillStyle = INK;
        g.strokeStyle = RIM;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(-H * .1, top);
        g.quadraticCurveTo(-H * .2 - flap, hipY - H * .1, -H * .27 - flap, hipY + H * .14);
        g.lineTo(-H * .17 - flap * .6, hipY + H * .1);
        g.lineTo(-H * .1 - flap * .3, hipY + H * .16);
        g.lineTo(-H * .02, hipY + H * .09);
        g.lineTo(H * .1, hipY + H * .12);
        g.quadraticCurveTo(H * .14, hipY - H * .15, H * .09, top);
        g.closePath();
        g.fill();
        g.stroke();

        // capuz e máscara
        const headX = H * .03, headY = top - H * .07;
        g.beginPath();
        g.moveTo(-H * .15, top + H * .03);
        g.quadraticCurveTo(-H * .11, headY - H * .14, headX + H * .02, headY - H * .1);
        g.quadraticCurveTo(headX + H * .13, headY - H * .02, headX + H * .1, headY + H * .07);
        g.lineTo(H * .09, top + H * .02);
        g.closePath();
        g.fill();
        g.stroke();
        g.fillStyle = '#c9d3d8';
        g.beginPath();
        g.ellipse(headX + H * .065, headY + H * .005, H * .035, H * .055, .15, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#7fe8f0';
        g.fillRect(headX + H * .07, headY - H * .012, H * .022, H * .012);

        // braço e espada
        const shoulderX = H * .04, shoulderY = top + H * .08;
        const a = pose.arm ?? .9;
        const handX = shoulderX + Math.cos(a) * H * .26;
        const handY = shoulderY + Math.sin(a) * H * .26;
        g.strokeStyle = INK;
        g.lineWidth = H * .075;
        g.beginPath(); g.moveTo(shoulderX, shoulderY); g.lineTo(handX, handY); g.stroke();
        if (pose.item === 'potion') {
            g.fillStyle = '#d9324a';
            g.beginPath(); g.arc(handX, handY - H * .05, H * .055, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#a87a4a';
            g.fillRect(handX - H * .02, handY - H * .13, H * .04, H * .04);
        } else {
            const sa = a + (pose.sword ?? -1.9);
            g.strokeStyle = STEEL;
            g.lineWidth = Math.max(1.5, H * .035);
            g.beginPath();
            g.moveTo(handX, handY);
            g.lineTo(handX + Math.cos(sa) * H * .48, handY + Math.sin(sa) * H * .48);
            g.stroke();
            g.strokeStyle = '#e5b956';
            g.lineWidth = Math.max(1.5, H * .03);
            const ga = sa + Math.PI / 2;
            g.beginPath();
            g.moveTo(handX + Math.cos(ga) * H * .06, handY + Math.sin(ga) * H * .06);
            g.lineTo(handX - Math.cos(ga) * H * .06, handY - Math.sin(ga) * H * .06);
            g.stroke();
        }
        g.restore();
    }

    // --- PET: quadrúpede pequeno que acompanha o passo ---
    function drawPet(x, gy, H, walk, t) {
        g.save();
        g.translate(x, gy);
        g.fillStyle = INK;
        g.strokeStyle = INK;
        g.lineCap = 'round';
        g.lineWidth = H * .05;
        const bodyY = -H * .2 + Math.abs(Math.sin(walk)) * -H * .02;
        const step = Math.sin(walk) * H * .05;
        g.beginPath();
        g.moveTo(-H * .1, bodyY); g.lineTo(-H * .1 + step, 0);
        g.moveTo(-H * .06, bodyY); g.lineTo(-H * .06 - step, 0);
        g.moveTo(H * .08, bodyY); g.lineTo(H * .08 - step, 0);
        g.moveTo(H * .12, bodyY); g.lineTo(H * .12 + step, 0);
        g.stroke();
        g.beginPath(); g.ellipse(0, bodyY, H * .16, H * .07, 0, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.arc(H * .17, bodyY - H * .08, H * .065, 0, Math.PI * 2); g.fill();
        g.beginPath();
        g.moveTo(H * .14, bodyY - H * .13); g.lineTo(H * .16, bodyY - H * .2); g.lineTo(H * .2, bodyY - H * .12);
        g.fill();
        g.beginPath();
        g.moveTo(-H * .15, bodyY - H * .02);
        g.quadraticCurveTo(-H * .25, bodyY - H * .1 + Math.sin(t * 6) * H * .03, -H * .27, bodyY - H * .16);
        g.stroke();
        g.fillStyle = '#fde68a';
        g.fillRect(H * .19, bodyY - H * .1, H * .025, H * .02);
        g.restore();
    }

    function drawCampfire(x, gy, H, t, alpha) {
        g.save();
        g.globalAlpha = alpha;
        const glow = g.createRadialGradient(x, gy - H * .1, 0, x, gy - H * .1, H * 1.2);
        glow.addColorStop(0, 'rgba(255,150,60,.35)');
        glow.addColorStop(1, 'rgba(255,150,60,0)');
        g.fillStyle = glow;
        g.fillRect(x - H * 1.2, gy - H * 1.3, H * 2.4, H * 1.5);
        g.strokeStyle = '#4a2c18';
        g.lineWidth = H * .06;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x - H * .14, gy - H * .01); g.lineTo(x + H * .14, gy - H * .07);
        g.moveTo(x - H * .14, gy - H * .07); g.lineTo(x + H * .14, gy - H * .01);
        g.stroke();
        const flick = 1 + Math.sin(t * 17) * .08 + Math.sin(t * 7) * .06;
        [['#f08a24', .2], ['#ffd75e', .11]].forEach(([color, size]) => {
            g.fillStyle = color;
            g.beginPath();
            g.moveTo(x - H * size * .8, gy - H * .05);
            g.quadraticCurveTo(x - H * size, gy - H * size * 1.6 * flick, x, gy - H * size * 2.6 * flick);
            g.quadraticCurveTo(x + H * size, gy - H * size * 1.6 * flick, x + H * size * .8, gy - H * .05);
            g.fill();
        });
        g.restore();
    }

    function drawMonster(x, gy, H, t) {
        const sprite = maskedMonster(monster.entry);
        const size = H * 1.35;
        const appear = clamp((t - monster.enter) / .6);
        const dying = monster.dieAt ? clamp((t - monster.dieAt) / .9) : 0;
        const hurt = clamp(1 - (t - monsterHurt) / .35);
        const lunge = bump(clamp((t - monsterLunge) / .45), 0, 1);
        const shake = hurt ? Math.sin(t * 70) * H * .04 * hurt : 0;
        const breathe = Math.sin(t * 2.2) * H * .015;
        const px = x + (1 - ease(appear)) * H * .8 - lunge * H * .45 + shake;
        const py = gy - size * .52 + breathe - dying * H * .3;
        g.save();
        g.globalAlpha = ease(appear) * (1 - dying);
        // sombra no chão
        g.fillStyle = 'rgba(0,0,0,.5)';
        g.beginPath(); g.ellipse(px, gy, size * .32, size * .05, 0, 0, Math.PI * 2); g.fill();
        if (sprite) {
            g.drawImage(sprite, px - size / 2, py - size / 2, size, size);
            if (hurt) {
                g.globalCompositeOperation = 'source-atop';
                g.globalAlpha = hurt * .55 * (1 - dying);
            }
        } else {
            // sem imagem: vulto com olhos acesos
            g.fillStyle = INK;
            g.beginPath(); g.ellipse(px, py + size * .1, size * .22, size * .32, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#f87171';
            g.fillRect(px - size * .08, py - size * .02, size * .04, size * .025);
            g.fillRect(px + size * .02, py - size * .02, size * .04, size * .025);
        }
        g.restore();
        if (hurt && sprite) {
            g.save();
            g.globalAlpha = hurt * .45;
            g.fillStyle = '#ff3b3b';
            g.beginPath(); g.ellipse(px, py, size * .3, size * .38, 0, 0, Math.PI * 2); g.fill();
            g.restore();
        }
        return px;
    }

    function spark(x, y, color, count = 10, speed = 90) {
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const v = speed * (.4 + Math.random() * .8);
            particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, life: .5 + Math.random() * .3, age: 0, color });
        }
    }

    function drawParticles(dt) {
        particles = particles.filter((p) => (p.age += dt) < p.life);
        particles.forEach((p) => {
            p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 160 * dt;
            g.globalAlpha = 1 - p.age / p.life;
            g.fillStyle = p.color;
            g.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        });
        g.globalAlpha = 1;
    }

    function slashArc(cx, cy, r, from, to, color, alpha) {
        if (alpha <= 0) return;
        g.save();
        g.globalAlpha = alpha;
        g.strokeStyle = color;
        g.lineWidth = r * .14;
        g.lineCap = 'round';
        g.beginPath(); g.arc(cx, cy, r, from, to); g.stroke();
        g.restore();
    }

    // --- ESTADO DO JOGO → EVENTOS ---
    function watchGame(t) {
        const fighting = Boolean(inCombat && currentMonster);
        if (fighting) {
            const key = `${combatEncounterId}:${currentMonster.name}`;
            if (!monster || monster.key !== key) {
                monster = { key, entry: loadImage(currentMonster.image), enter: t + (anim?.type === 'walk' ? .35 : 0), dieAt: 0 };
                last.monsterHp = currentMonster.hp;
            }
            if (last.monsterHp !== null && currentMonster.hp < last.monsterHp) {
                monsterHurt = t;
                spark(width * .7, ground() - height * .35, '#fca5a5', 12);
            }
            last.monsterHp = currentMonster.hp;
        } else if (monster && !monster.dieAt) {
            const fled = anim?.type === 'flee';
            if (fled) monster.dieAt = t + .4;
            else {
                monster.dieAt = t;
                monsterHurt = t;
                spark(width * .7, ground() - height * .3, '#c4b5fd', 22, 120);
            }
            last.monsterHp = null;
        }
        if (monster?.dieAt && t - monster.dieAt > 1) monster = null;

        if (last.heroHp !== null && hero.hp < last.heroHp && fighting) {
            heroHurt = t;
            monsterLunge = t - .1;
        }
        last.heroHp = hero.hp;
        last.inCombat = fighting;
    }

    function heroPose(t) {
        const pose = { walk: 0, arm: .9, sword: -1.9, lean: 0, cape: 0 };
        let dx = 0;
        const breathe = Math.sin(t * 2) * .02;
        pose.arm += breathe;
        if (!anim) return { pose, dx };
        const p = clamp((t - anim.start) / ANIM_SECONDS[anim.type]);
        switch (anim.type) {
            case 'walk':
                pose.walk = t * 11; pose.cape = .6; pose.lean = .08; pose.arm = 1.2;
                break;
            case 'rest':
                pose.sit = ease(clamp(p * 4)) * (1 - ease(clamp((p - .85) / .15)));
                pose.arm = 1.3; pose.sword = -2.6;
                break;
            case 'potion': {
                const lift = bump(p, 0, 1);
                pose.item = 'potion'; pose.arm = .9 - lift * 2.2;
                pose.lean = -lift * .12;
                break;
            }
            case 'attack': {
                const thrust = bump(p, 0, 1);
                dx = thrust * width * .22;
                pose.arm = .9 - thrust * 1.1; pose.sword = -1.9 + thrust * 1.6; pose.lean = thrust * .18; pose.cape = thrust;
                pose.walk = p * 8;
                break;
            }
            case 'heavy': {
                const wind = bump(p, 0, .45), hit = bump(p, .35, 1);
                dx = hit * width * .24 - wind * width * .03;
                pose.arm = .9 - wind * 2.4 + hit * 1.2; pose.sword = -1.9 - wind * .5 + hit * 2.2;
                pose.lean = -wind * .15 + hit * .22; pose.cape = hit;
                break;
            }
            case 'parry': {
                const guard = bump(p, 0, 1);
                pose.arm = .9 - guard * 1.3; pose.sword = -1.9 - guard * .2; pose.lean = -guard * .08;
                break;
            }
            case 'dodge': {
                const hop = bump(p, 0, 1);
                dx = -hop * width * .1; pose.lean = -hop * .3; pose.cape = hop;
                break;
            }
            case 'flee': {
                pose.flip = true; pose.walk = t * 14; pose.cape = 1; pose.lean = .1;
                dx = -ease(clamp(p / .55)) * width * .5 + ease(clamp((p - .6) / .4)) * width * .5;
                if (p > .6) pose.flip = false;
                break;
            }
            case 'fleeFail': {
                pose.flip = p < .5; pose.walk = t * 14; dx = -bump(p, 0, 1) * width * .06;
                break;
            }
            case 'pet':
                pose.arm = .9 - bump(p, 0, .5) * 1.4; pose.sword = -1.9 + .6;
                break;
        }
        return { pose, dx };
    }

    // --- PERSONAGEM NO ESQUELETO (js/systems/rig.js + js/data/rig/<id>.js) ---
    // Cada ação do palco vira uma animação do personagem; quem não tem rig usa a silhueta acima.
    const BASE_SECONDS = { ...ANIM_SECONDS };
    const RIG_ANIMATION = {
        walk: 'walk', attack: 'attack', heavy: 'special', parry: 'parry', dodge: 'dodge',
        rest: 'rest', potion: 'potion', flee: 'walk', fleeFail: 'walk'
    };

    const rigState = {};                 // molas do cabelo/jaqueta/bolsa entre um quadro e outro

    function rigCharacter() {
        const id = typeof selectedCharacter !== 'undefined' ? selectedCharacter?.id : null;
        return (window.YaraRig && window.YaraRpgData.rig?.[id]) || null;
    }

    // As ações duram o mesmo que as animações do personagem.
    function syncDurations(character) {
        Object.assign(ANIM_SECONDS, BASE_SECONDS);
        if (!character) return;
        Object.entries(RIG_ANIMATION).forEach(([type, name]) => {
            if (!['flee', 'fleeFail', 'walk'].includes(type) && character.animations[name]) {
                ANIM_SECONDS[type] = window.YaraRig.duration(character, name) / 1000;
            }
        });
    }

    // Instante de impacto (0–1) da ação, para o rastro do golpe sair junto com o machado.
    function impactAt(character, type) {
        const name = RIG_ANIMATION[type];
        const animation = character?.animations[name];
        return animation?.impact ? animation.impact / window.YaraRig.duration(character, name) : null;
    }

    function drawRigHero(character, t, x, gy, H, fighting, hurt) {
        let name = fighting ? 'guard' : 'idle';
        let ms = t * 1000;
        let flip = false;
        if (anim && RIG_ANIMATION[anim.type]) {
            name = RIG_ANIMATION[anim.type];
            ms = (t - anim.start) * 1000;
            const p = clamp((t - anim.start) / ANIM_SECONDS[anim.type]);
            if (anim.type === 'flee') { flip = p < .6; ms *= 1.4; }
            if (anim.type === 'fleeFail') { flip = p < .5; ms *= 1.4; }
        }
        if (t - heroHurt < .4 && character.animations.hit) {
            name = 'hit';
            ms = (t - heroHurt) * 1000;
        }
        const pose = window.YaraRig.sample(character, name, ms);
        const special = anim?.type === 'heavy' ? bump(clamp((t - anim.start) / ANIM_SECONDS.heavy), 0, .6) : 0;
        window.YaraRig.render(g, character, pose, x, gy, H, { flip, tint: hurt, glow: special, state: rigState });
        return true;
    }

    let lastRig;
    let prev = now();
    function frame() {
        requestAnimationFrame(frame);
        if (document.hidden || !canvas.isConnected || canvas.offsetParent === null) return;
        if (canvas.clientWidth !== Math.round(width) || canvas.clientHeight !== Math.round(height)) resize();
        if (!width || !height) return;
        const t = now();
        const dt = Math.min(.05, t - prev);
        prev = t;
        let region = null;
        try { region = getCurrentRegionData(); } catch { /* jogo ainda carregando */ }
        try { watchGame(t); } catch { /* idem */ }
        const rig = rigCharacter();
        if (rig !== lastRig) { syncDurations(rig); lastRig = rig; }
        if (anim && t - anim.start > ANIM_SECONDS[anim.type]) anim = null;
        if (anim?.type === 'walk' && !reduceMotion.matches) scroll += dt * width * .55;

        drawBackground(t, region);
        const gy = ground();
        const H = height * .7;
        const fighting = Boolean(monster);
        const baseX = fighting ? width * .3 : width * .42;
        const { pose, dx } = heroPose(t);
        const hurt = clamp(1 - (t - heroHurt) / .35);
        const heroX = baseX + dx - hurt * H * .18;

        if (anim?.type === 'rest') {
            const p = clamp((t - anim.start) / ANIM_SECONDS.rest);
            drawCampfire(baseX + H * .55, gy, H, t, bump(p, 0, 1) * 1.4);
            if (Math.random() < .25) particles.push({ x: baseX + H * .55, y: gy - H * .3, vx: (Math.random() - .5) * 10, vy: -40, life: .9, age: 0, color: '#fbbf24' });
        }

        let monsterX = width * .74;
        if (monster) monsterX = drawMonster(width * .74, gy, H, t);

        // pet: trota atrás do herói; no comando, corre até o monstro e volta
        if (hero.equipment?.pet) {
            let petX = heroX - H * .45;
            if (anim?.type === 'pet') {
                const p = clamp((t - anim.start) / ANIM_SECONDS.pet);
                petX += bump(p, 0, 1) * (monsterX - petX - H * .3);
            }
            const moving = anim && ['walk', 'flee', 'pet', 'attack'].includes(anim.type);
            if (!(anim?.type === 'flee' && pose.flip)) drawPet(petX, gy, H * .7, moving ? t * 13 : 0, t);
        }

        // cabeça grande e membros finos: o personagem do rig fica um pouco maior que a silhueta
        const rigH = H * 1.22;
        const drewRig = rig && drawRigHero(rig, t, heroX + (hurt ? Math.sin(t * 80) * H * .02 : 0), gy, rigH, fighting, hurt);
        if (!drewRig) drawHero(heroX, gy, H, pose, t);
        if (hurt && !drewRig) {
            g.save();
            g.globalAlpha = hurt * .4;
            g.fillStyle = '#ff3b3b';
            g.beginPath(); g.ellipse(heroX, gy - H * .5, H * .25, H * .5, 0, 0, Math.PI * 2); g.fill();
            g.restore();
        }

        // rastros dos golpes
        if (anim && (anim.type === 'attack' || anim.type === 'heavy')) {
            const p = clamp((t - anim.start) / ANIM_SECONDS[anim.type]);
            const heavy = anim.type === 'heavy';
            // com rig, o rastro sai no instante de impacto da animação
            const hitAt = impactAt(rig, anim.type);
            const show = hitAt !== null
                ? bump(p, hitAt - .08, hitAt + .25)
                : (heavy ? bump(p, .4, .85) : bump(p, .25, .7));
            slashArc(monsterX - H * .1, gy - H * .55, H * (heavy ? .5 : .32), -1.9, heavy ? 1.2 : .2, heavy ? '#ff8a5c' : '#e6f3f5', show * .9);
        }
        if (anim?.type === 'parry') {
            const p = clamp((t - anim.start) / ANIM_SECONDS.parry);
            if (p > .3 && p < .34) spark(heroX + H * .3, gy - H * .85, '#fde68a', 14, 110);
        }
        if (anim?.type === 'potion') {
            const p = clamp((t - anim.start) / ANIM_SECONDS.potion);
            if (p > .5 && Math.random() < .5) particles.push({ x: heroX + (Math.random() - .5) * H * .4, y: gy - Math.random() * H, vx: 0, vy: -50, life: .7, age: 0, color: '#86efac' });
        }
        if (anim?.type === 'dodge') {
            const p = clamp((t - anim.start) / ANIM_SECONDS.dodge);
            g.save();
            g.globalAlpha = bump(p, 0, 1) * .3;
            if (drewRig) window.YaraRig.render(g, rig, window.YaraRig.sample(rig, 'guard', 0), baseX, gy, rigH, { alpha: .25 });
            else drawHero(baseX, gy, H, { arm: .9, sword: -1.9 }, t);
            g.restore();
        }
        drawParticles(dt);
    }

    function play(type) {
        if (!ANIM_SECONDS[type]) return;
        anim = { type, start: now() };
        if (type === 'pet') spark(width * .7, ground() - height * .3, '#fde68a', 10);
    }

    // Embrulha uma ação global; só anima se a ação de fato aconteceu (algo mudou no estado).
    function wrap(name, typeFor) {
        const original = window[name];
        if (typeof original !== 'function') return;
        window[name] = function (...args) {
            const before = snapshot();
            const result = original.apply(this, args);
            const after = snapshot();
            const type = typeof typeFor === 'function' ? typeFor(before, after) : typeFor;
            if (type && JSON.stringify(before) !== JSON.stringify(after)) play(type);
            return result;
        };
    }
    const snapshot = () => ({
        gold: hero.gold, potions: hero.potions, hp: hero.hp, foco: hero.foco,
        locked: combatActionLocked, inCombat, explored: explorationCount,
        stuff: [pendingStoryEvent, pendingChest, pendingMistContact].map(Boolean).join()
    });

    function install() {
        wrap('exploreForest', 'walk');
        wrap('restAtCamp', 'rest');
        wrap('usePotion', 'potion');
        wrap('combatQuickAttack', 'attack');
        wrap('combatHeavyAttack', 'heavy');
        wrap('combatCriticalAttack', 'heavy');
        wrap('combatDefend', 'parry');
        wrap('combatDodge', 'dodge');
        wrap('combatRun', (before, after) => (before.inCombat && !after.inCombat ? 'flee' : 'fleeFail'));
        // O botão do pet chama funções internas de pets.js: basta ouvir o clique (botão desligado não dispara)
        document.getElementById('pet-command-button')?.addEventListener('click', () => play('pet'));
        resize();
        window.addEventListener('resize', resize);
        requestAnimationFrame(frame);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
    else install();

    return { play };
})();
