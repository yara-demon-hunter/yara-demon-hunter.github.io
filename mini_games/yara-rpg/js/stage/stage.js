// --- PALCO 2.5D ---
// Mostra o que acontece no jogo: o herói (boneco 2.5D de js/stage/hero25d.js) anda pela trilha ao explorar,
// avança e golpeia o monstro, apara, esquiva, bebe poção, acende a fogueira... num cenário 2.5D por região
// (js/stage/scenery.js). Só descreve: não muda nenhuma regra do jogo.
//
// Como funciona:
// - O palco não lê o jogo direto. Ele recebe uma fonte (source) com o estado de que precisa (personagem, região,
//   monstro, baú...). js/stage/hooks.js liga a fonte ao RPG; a página de prévia usa uma fonte falsa.
// - Cada ação vira uma sequência (play(acao, relatorio)): uma lista de passos com hora marcada, tocada pelo diretor.
//   O relatório diz o que aconteceu no turno (acertou? matou? o monstro revidou e acertou?).
//   Ações seguidas entram na fila e o diretor acelera para alcançar o jogo.
// - Com o diretor parado, o palco confere o estado (watch): monstro que apareceu ou sumiu, baú, subida de nível.
//
// Tempos, posições, câmera e personagens: js/data/visuals/stage.js. Script clássico: window.YaraStage25D.createStage.
(() => {
    const NS = window.YaraStage25D;
    const { fx, scenery } = NS;
    const HERO = NS.hero;
    const { clamp, easeOutQuad, easeOutCubic, easeInOut, bump, drawGlow, glowSprite, hash } = fx;
    const DATA = window.YaraRpgData.visuals.stage;
    const HERO_VIS = window.YaraRpgData.visuals.hero25d;
    const L = DATA.layout;
    const TM = DATA.timing;
    const SP = DATA.speed;
    const FACE = DATA.facing;

    const WORDS = {
        miss: { pt: 'Errou', en: 'Miss' },
        dodge: { pt: 'Esquiva', en: 'Dodge' },
        parry: { pt: 'Aparou', en: 'Parry' },
        stun: { pt: 'Atordoado', en: 'Stunned' },
        level: { pt: 'Nível', en: 'Level' },
        crit: { pt: 'Crítico!', en: 'Critical!' }
    };

    // Sequência: passos com hora marcada (segundos) e a duração total
    function seq() {
        const steps = [];
        return {
            steps,
            duration: 0,
            at(t, fn) {
                steps.push({ at: t, fn });
                return this;
            },
            end(t) {
                this.duration = t;
                steps.sort((a, b) => a.at - b.at);
                return this;
            }
        };
    }

    // Imagens (monstro e pet) viram "recortes" de papel em pé no cenário: a parte de baixo se desfaz na névoa
    const images = new Map();
    function image(src) {
        if (!src) return null;
        let entry = images.get(src);
        if (!entry) {
            entry = { img: new Image(), ready: false, cut: null, white: null };
            entry.img.onload = () => { entry.ready = true; };
            entry.img.src = src;
            images.set(src, entry);
        }
        return entry;
    }

    function cutout(entry, fade = 0.55) {
        if (!entry?.ready) return null;
        if (entry.cut) return entry;
        const size = 256;
        const make = () => {
            const c = document.createElement('canvas');
            c.width = c.height = size;
            return c;
        };
        const cut = make();
        const g = cut.getContext('2d');
        const { naturalWidth: iw, naturalHeight: ih } = entry.img;
        const s = Math.min(size / iw, size / ih);
        g.drawImage(entry.img, (size - iw * s) / 2, size - ih * s, iw * s, ih * s);
        g.globalCompositeOperation = 'destination-in';
        const grad = g.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(fade, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size);
        const white = make();
        const w = white.getContext('2d');
        w.drawImage(cut, 0, 0);
        w.globalCompositeOperation = 'source-in';
        w.fillStyle = '#ffffff';
        w.fillRect(0, 0, size, size);
        entry.cut = cut;
        entry.white = white;
        return entry;
    }

    function create(canvas, source) {
        const g = canvas.getContext('2d');
        const scene = scenery.createScene();
        const cam = scene.cam;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let W = 0;
        let H = 0;
        let dpr = 1;
        let clock = 0;               // relógio do palco (acelera junto com o diretor)
        let lastMs = 0;
        let visible = true;
        let regionId = null;
        let look = null;             // { id, model, colors } do personagem atual

        // --- ATORES ---
        const hero = {
            homeX: 0,
            x: 0,
            anim: HERO.createAnim(FACE.right),
            body: { vx: 0, vy: 0, face: FACE.right, dashing: false, kneeling: false, move: null, hitTime: -99, hitDirX: 0, hitDirY: 0 },
            tween: null,
            walkUntil: 0,
            alpha: 1,
            frenzy: false,
            fallen: false,
            level: null,
            combo: 0,                // último passo do combo (1, 2, 3)
            ghosts: []               // imagens que ficam para trás na esquiva
        };
        let monster = null;
        let pet = null;
        const campfire = { x: 0, level: 0, target: 0 };
        let chest = null;
        let wisp = null;
        let alertAt = -9;

        // --- EFEITOS ---
        const particles = [];
        const texts = [];
        const slashes = [];
        const rings = [];
        let flash = null;
        let shake = 0;
        let fade = 0;                // névoa cobrindo tudo na troca de região

        const say = (key) => WORDS[key]?.[source.language() === 'en' ? 'en' : 'pt'] ?? key;

        function moveHero(x, seconds, opts = {}) {
            hero.tween = { from: hero.x, to: x, t0: clock, dur: Math.max(0.01, seconds), dash: !!opts.dash, ease: opts.ease || easeInOut };
        }

        function pose(kind, seconds) {
            hero.body.move = { kind, age: 0, seconds: seconds || HERO.moves[kind].seconds };
        }

        function swing(step) {
            return HERO.startSwing(hero.anim, step);
        }

        function heroHurt(damage) {
            hero.body.hitTime = clock;
            hero.body.hitDirX = -1;
            hero.body.hitDirY = 0.2;
            const top = heroTopZ();
            burst(hero.x + 2, 0, 13, '#fb7185', 12, 22);
            if (damage) number(hero.x, top, `-${damage}`, '#fb7185');
            shakeBy(5);
        }

        function heroTopZ() {
            return DATA.camera.heroTop + 3;
        }

        // Monstro: recorte da imagem saindo da névoa
        function spawnMonster(info) {
            monster = {
                key: info.key,
                entry: image(info.image),
                drawn: NS.monsters?.kindFor(info.image) || null,   // desenhado em js/stage/monsters25d.js
                boss: !!info.boss,
                homeX: hero.homeX + (L.monster - L.heroCombat),
                x: hero.homeX + (L.monster - L.heroCombat),
                born: clock,
                tween: null,
                flashAt: -9,
                hurtAt: -9,
                stunUntil: -9,
                telegraph: !!info.telegraph,
                dyingAt: 0,
                leavingAt: 0,
                killed: false
            };
            burst(monster.x, 0, 4, DATA.scenes[scene.themeId]?.monsterMist || 'rgba(160,190,200,0.6)', 18, 14, { glow: true, life: 1.1, up: 10 });
        }

        function moveMonster(x, seconds, ease = easeInOut) {
            if (!monster) return;
            monster.tween = { from: monster.x, to: x, t0: clock, dur: Math.max(0.01, seconds), ease };
        }

        function monsterHeight() {
            return monster?.boss ? 40 : 31;
        }

        function monsterHurt(damage, crit, stun) {
            if (!monster) return;
            monster.flashAt = clock;
            monster.hurtAt = clock;
            const z = monsterHeight() * 0.55;
            burst(monster.x - 3, 0, z, crit ? '#fde68a' : '#e0f2fe', crit ? 22 : 12, crit ? 34 : 24, { glow: true });
            if (damage) number(monster.x, monsterHeight() * 0.78, `-${damage}`, crit ? '#fcd34d' : '#f8fafc', crit ? 1.35 : 1);
            if (crit) {
                word(monster.x, monsterHeight() * 0.78 + 6, say('crit'), '#fcd34d');
                flashScreen('rgba(253, 230, 138, 0.35)', 0.18);
                shakeBy(7);
            } else shakeBy(2.5);
            if (stun) {
                monster.stunUntil = clock + 1.6;
                word(monster.x + 8, monsterHeight() * 0.45, say('stun'), '#fde047', 0.75);
            }
        }

        function killMonster() {
            if (!monster || monster.dyingAt) return;
            monster.killed = true;
            monster.dyingAt = clock;
            burst(monster.x, 0, monsterHeight() * 0.5, '#c4b5fd', 30, 26, { glow: true, life: 1.2, up: 16 });
            burst(monster.x, 0, monsterHeight() * 0.3, scene.theme?.monsterMist || '#94a3b8', 20, 12, { glow: true, life: 1.4, up: 8 });
        }

        function vanishMonster() {
            if (!monster || monster.dyingAt || monster.leavingAt) return;
            monster.leavingAt = clock;
            burst(monster.x, 0, 6, scene.theme?.monsterMist || '#94a3b8', 16, 12, { glow: true, life: 1.2, up: 6 });
        }

        // --- EFEITOS ---
        // Partículas no mundo (x, dr, z), com paralaxe e gravidade
        function burst(x, dr, z, color, count, speed, opts = {}) {
            const life = opts.life ?? 0.6;
            for (let i = 0; i < count; i++) {
                const a = Math.random() * Math.PI * 2;
                const v = speed * (0.35 + Math.random() * 0.75);
                particles.push({
                    x, dr: dr + (Math.random() - 0.5) * 3, z,
                    vx: Math.cos(a) * v,
                    vdr: (Math.random() - 0.5) * v * 0.3,
                    vz: Math.sin(a) * v * 0.7 + (opts.up ?? 8),
                    grav: opts.glow ? -4 : 60,
                    age: 0,
                    life: life * (0.6 + Math.random() * 0.6),
                    color,
                    size: opts.size ?? (opts.glow ? 1.6 : 0.45),
                    glow: !!opts.glow
                });
            }
            if (particles.length > 260) particles.splice(0, particles.length - 260);
        }

        function number(x, z, text, color, size = 1) {
            texts.push({ x: x + (Math.random() - 0.5) * 3, z, text, color, size, age: 0, life: TM.numberLife });
        }

        function word(x, z, text, color, size = 0.8) {
            texts.push({ x, z, text, color, size, age: 0, life: TM.numberLife * 1.1 });
        }

        function slash(x, z, color, size, angle) {
            slashes.push({ x, z, color, size, angle, age: 0, life: 0.28 });
        }

        function ring(x, color, r0, r1, life = 0.5) {
            rings.push({ x, color, r0, r1, age: 0, life });
        }

        function flashScreen(color, life = 0.2) {
            if (reduceMotion.matches) return;
            flash = { color, age: 0, life };
        }

        function shakeBy(amount) {
            if (!reduceMotion.matches) shake = Math.max(shake, amount);
        }

        // --- DIRETOR ---
        const director = {
            current: null,
            queue: [],
            speed() { return 1 + this.queue.length * 1.4; },
            idle() { return !this.current && !this.queue.length; },
            add(s) {
                if (!s) return;
                if (this.queue.length >= 2) this.queue.shift();
                if (this.current) this.queue.push(s);
                else this.start(s);
            },
            start(s) {
                s.clock = 0;
                s.next = 0;
                this.current = s;
            },
            tick(dt) {
                const s = this.current;
                if (!s) return;
                s.clock += dt;
                while (s.next < s.steps.length && s.steps[s.next].at <= s.clock) s.steps[s.next++].fn();
                if (s.clock >= s.duration) {
                    this.current = null;
                    if (this.queue.length) this.start(this.queue.shift());
                }
            }
        };

        // --- SEQUÊNCIAS DE CADA AÇÃO ---
        // r: relatório do turno (js/stage/hooks.js → report). Cada função devolve a sequência ou null.

        // O monstro revida: recua, avança até o herói e o golpe acerta, é aparado ou é esquivado
        function enemyTurn(s, t, enemy) {
            if (!enemy) return t;
            s.at(t, () => monster && moveMonster(monster.homeX + 4, TM.enemyWindup, easeOutQuad));
            t += TM.enemyWindup;
            s.at(t, () => monster && moveMonster(hero.x + L.reach * 0.55, TM.enemyLunge, (k) => k * k));
            t += TM.enemyLunge;
            s.at(t, () => {
                const top = heroTopZ();
                if (enemy.result === 'evaded') {
                    hero.ghosts.push({ x: hero.x, age: 0 });
                    moveHero(hero.homeX - 7, 0.12, { dash: true, ease: easeOutQuad });
                    word(hero.x, top, say('dodge'), '#67e8f9');
                } else if (enemy.result === 'parried') {
                    if (hero.body.move?.kind !== 'guard') pose('guard', 0.55);
                    const tip = bladeTip();
                    sparks(tip, '#fde68a', 16);
                    flashScreen('rgba(254, 240, 138, 0.18)', 0.12);
                    word(hero.x, top + 6, say('parry'), '#fde68a');
                    if (enemy.damage) number(hero.x, top, `-${enemy.damage}`, '#fca5a5', 0.8);
                    shakeBy(3);
                } else {
                    heroHurt(enemy.damage);
                }
            });
            t += 0.12;
            s.at(t, () => {
                if (monster) moveMonster(monster.homeX, TM.enemyRecover);
                if (enemy.result === 'evaded') moveHero(hero.homeX, 0.2);
            });
            return t + TM.enemyRecover;
        }

        // Faíscas saindo de um ponto da tela (convertido para o mundo na profundidade dos personagens)
        function sparks(point, color, count) {
            if (!point) return;
            const s = cam.scaleAt(0);
            const base = cam.project(cam.x, 0, 0);
            const x = cam.x + (point.x - base.x) / s;
            const z = (base.y - point.y) / (s * cam.heightScale);
            burst(x, -1, z, color, count, 30, { glow: true, life: 0.35, size: 0.9, up: 4 });
        }

        function bladeTip() {
            const p = cam.project(hero.x, 0, 0);
            return HERO.bladeTip(hero.body, hero.anim, heroOpts(p)).tip;
        }

        // Golpe do herói: avança, corta (ou salta e crava, no pesado), volta; o monstro reage e revida
        function scriptAttack(r, kind) {
            const s = seq();
            if (!monster || monster.dyingAt) {
                s.at(0, () => swing(hero.combo = hero.combo % 3 + 1));
                return s.end(0.4);
            }
            let t = 0;
            if (kind === 'critical') {
                s.at(0, () => {
                    pose('roar');
                    ring(hero.x, 'rgba(248, 113, 113, 0.9)', 3, 18, 0.45);
                    flashScreen('rgba(239, 68, 68, 0.22)', 0.25);
                });
                t += 0.42;
            }
            s.at(t, () => moveHero(monster ? monster.x - L.reach : hero.x, TM.dashIn, { dash: true, ease: easeOutQuad }));
            t += TM.dashIn;
            const hitMonster = () => {
                if (!monster) return;
                const z = monsterHeight() * 0.55;
                if (r.hit) {
                    const big = kind !== 'quick' || r.hit.crit;
                    slash(monster.x - 2, z, kind === 'critical' ? '#fca5a5' : r.hit.crit ? '#fde68a' : '#e0f2fe', big ? 1.4 : 1, hero.combo === 2 ? 0.6 : -0.6);
                    monsterHurt(r.hit.damage, r.hit.crit || kind === 'critical', r.hit.stun);
                    moveMonster(monster.homeX + (big ? 6 : 3), 0.1, easeOutQuad);
                } else if (r.missed) {
                    moveMonster(monster.homeX + 9, 0.14, easeOutQuad);
                    word(monster.x, monsterHeight() * 0.78, say('miss'), '#cbd5e1');
                }
            };
            if (kind === 'heavy') {
                const M = HERO.moves.slam;
                s.at(t, () => pose('slam'));
                t += M.seconds * M.impactAt;
                s.at(t, () => {
                    ring(hero.x + 5, 'rgba(226, 232, 240, 0.9)', 2, 22, 0.5);
                    burst(hero.x + 6, 0, 0.5, '#94a3b8', 16, 20, { life: 0.5, up: 14 });
                    shakeBy(6);
                    hitMonster();
                });
                t += M.seconds * (1 - M.impactAt) * 0.6;
            } else {
                const step = kind === 'critical' ? 'whirl' : (hero.combo = hero.combo % 3 + 1);
                s.at(t, () => swing(step));
                t += TM.swingImpact * (step === 'whirl' ? 1.7 : 1);
                s.at(t, hitMonster);
                t += TM.settle;
            }
            s.at(t, () => {
                moveHero(hero.homeX, TM.dashBack, { ease: easeInOut });
                if (monster && !r.killed) moveMonster(monster.homeX, 0.25);
            });
            t += TM.dashBack;
            if (r.killed) {
                s.at(t - 0.15, killMonster);
                return s.end(t + 0.35);
            }
            return s.end(enemyTurn(s, t + 0.05, r.enemy) + 0.05);
        }

        const SCRIPTS = {
            explore() {
                const s = seq();
                s.at(0, () => {
                    campfire.target = 0;
                    hero.body.kneeling = false;
                    hero.body.face = FACE.right;
                    hero.walkUntil = clock + TM.explore;
                });
                return s.end(TM.explore + 0.1);
            },
            rest() {
                const s = seq();
                s.at(0, () => {
                    campfire.x = hero.homeX + L.campfire;
                    campfire.target = 1;
                    hero.body.kneeling = true;
                });
                for (let k = 0.6; k < TM.rest - 0.4; k += 0.35) {
                    s.at(k, () => burst(hero.x, 0, 4 + Math.random() * 10, '#86efac', 2, 6, { glow: true, life: 0.9, up: 12, size: 1.1 }));
                }
                s.at(TM.rest - 0.35, () => { hero.body.kneeling = false; });
                return s.end(TM.rest);
            },
            potion(r) {
                const s = seq();
                s.at(0, () => pose('drink', TM.potion));
                s.at(TM.potion * 0.55, () => {
                    burst(hero.x, 0, 12, '#86efac', 18, 10, { glow: true, life: 0.9, up: 14, size: 1.2 });
                    if (r.heal?.hp) number(hero.x, heroTopZ(), `+${r.heal.hp}`, '#86efac');
                });
                return s.end(enemyTurn(s, TM.potion, r.enemy) + 0.05);
            },
            attack: (r) => scriptAttack(r, 'quick'),
            heavy: (r) => scriptAttack(r, 'heavy'),
            critical: (r) => scriptAttack(r, 'critical'),
            parry(r) {
                const s = seq();
                s.at(0, () => {
                    pose('guard', TM.guard + (r.enemy ? 0.4 : 0));
                    ring(hero.x, 'rgba(147, 197, 253, 0.85)', 4, 13, 0.6);
                });
                return s.end(enemyTurn(s, 0.32, r.enemy) + 0.05);
            },
            dodge(r) {
                const s = seq();
                s.at(0, () => {
                    hero.ghosts.push({ x: hero.x, age: 0 });
                    moveHero(hero.homeX - 8, TM.dodge * 0.5, { dash: true, ease: easeOutQuad });
                });
                s.at(TM.dodge * 0.5, () => {
                    hero.ghosts.push({ x: hero.x, age: 0 });
                    moveHero(hero.homeX, TM.dodge * 0.5, { dash: true });
                });
                return s.end(enemyTurn(s, TM.dodge + 0.05, r.enemy) + 0.05);
            },
            flee() {
                const s = seq();
                s.at(0, () => {
                    hero.body.face = FACE.left;
                    moveHero(cam.xAt(-60, 0), TM.fleeOut, { ease: (k) => k });
                });
                s.at(TM.fleeOut * 0.5, vanishMonster);
                s.at(TM.fleeOut + 0.1, () => {
                    hero.body.face = FACE.right;
                    hero.homeX = cam.x + L.heroExplore;
                    hero.x = cam.xAt(-40, 0);
                    moveHero(hero.homeX, TM.fleeBack, { ease: (k) => easeOutQuad(k) });
                });
                return s.end(TM.fleeOut + 0.1 + TM.fleeBack);
            },
            fleeFail(r) {
                const s = seq();
                s.at(0, () => {
                    hero.body.face = FACE.left;
                    moveHero(hero.homeX - 9, 0.3, { ease: (k) => k });
                });
                let t = enemyTurn(s, 0.3, r.enemy);
                s.at(t, () => {
                    hero.body.face = FACE.right;
                    moveHero(hero.homeX, 0.3);
                });
                return s.end(t + 0.3);
            },
            pet(r) {
                const s = seq();
                if (!pet || !monster) return null;
                s.at(0, () => { pet.charge = { t0: clock, dur: 0.75 }; });
                s.at(0.36, () => {
                    if (r.hit) monsterHurt(r.hit.damage, false, r.hit.stun);
                    else burst(monster.x - 4, 0, 6, '#fde68a', 8, 14, { glow: true, life: 0.4 });
                });
                return s.end(0.8);
            },
            openChest() {
                const s = seq();
                s.at(0, () => {
                    if (!chest) return;
                    chest.openAt = clock;
                    burst(chest.x, 0, 3, '#fcd34d', 26, 22, { glow: true, life: 0.9, up: 18, size: 1.1 });
                });
                return s.end(0.6);
            }
        };

        function levelUpScript(level) {
            const s = seq();
            s.at(0, () => {
                pose('roar');
                ring(hero.x, 'rgba(253, 224, 71, 0.95)', 3, 20, 0.7);
                burst(hero.x, 0, 4, '#fde047', 26, 16, { glow: true, life: 1.1, up: 20, size: 1.2 });
                word(hero.x, heroTopZ() + 4, `${say('level')} ${level}!`, '#fde047', 1);
            });
            return s.end(0.8);
        }

        function encounterScript(info) {
            const s = seq();
            s.at(0, () => {
                campfire.target = 0;
                hero.body.kneeling = false;
                hero.body.face = FACE.right;
                spawnMonster(info);
                alertAt = clock;
            });
            return s.end(TM.monsterEnter);
        }

        // --- ESTADO DO JOGO → PALCO ---
        // Sempre: região, personagem, pet, Fúria pronta, aviso do monstro. Com o diretor parado: o resto.
        function syncAlways() {
            const rid = source.regionId();
            if (rid !== regionId) {
                regionId = rid;
                if (scene.setTheme(rid) && look) fade = 1;
            }
            const cid = source.characterId();
            if (!look || look.id !== cid) {
                const cfg = DATA.characters[cid] || DATA.characters['demon-hunter'];
                const base = HERO_VIS[cfg.model]?.colors ?? HERO_VIS.hero.colors;
                look = { id: cid, model: cfg.model, colors: cfg.colors ? { ...base, ...cfg.colors } : base };
                hero.anim = HERO.createAnim(hero.anim.facing);
            }
            const petSrc = source.petImage();
            if ((pet?.src || null) !== (petSrc || null)) pet = petSrc ? { src: petSrc, entry: image(petSrc), look: L.pets?.[String(petSrc).split('/').pop()] || {}, x: hero.x - L.petBehind, charge: null } : null;
            hero.frenzy = source.furyReady();
            const info = source.monster();
            if (monster && info && info.key === monster.key) monster.telegraph = !!info.telegraph;
            const fallen = source.defeated();
            if (fallen && !hero.fallen) {
                hero.fallen = true;
                pose('fall');
            } else if (!fallen && hero.fallen) {
                hero.fallen = false;
                hero.body.move = null;
            }
        }

        function watch() {
            const info = source.monster();
            if (info && (!monster || monster.key !== info.key)) {
                if (monster && !monster.dyingAt) vanishMonster();
                director.add(encounterScript(info));
                return;
            }
            if (!info && monster && !monster.dyingAt && !monster.leavingAt) {
                if (monster.killed) killMonster();
                else vanishMonster();
            }
            const lv = source.level();
            if (hero.level === null || lv < hero.level) hero.level = lv;
            else if (lv > hero.level) {
                hero.level = lv;
                director.add(levelUpScript(lv));
                return;
            }
            const hasChest = source.chest();
            if (hasChest && !chest) chest = { x: hero.homeX + 22, born: clock, openAt: 0 };
            else if (!hasChest && chest && !chest.openAt) director.add(SCRIPTS.openChest());
            const presence = source.presence();
            if (presence && !wisp) wisp = { x: hero.homeX + 26, born: clock, goneAt: 0 };
            else if (!presence && wisp && !wisp.goneAt) wisp.goneAt = clock;
        }

        // --- ATUALIZAÇÃO ---
        function update(dt) {
            const prevX = hero.x;
            if (hero.walkUntil > clock) {
                hero.homeX += SP.explore * dt;
                hero.x = hero.homeX;
                hero.tween = null;
            } else if (hero.tween) {
                const tw = hero.tween;
                const k = clamp((clock - tw.t0) / tw.dur);
                hero.x = tw.from + (tw.to - tw.from) * tw.ease(k);
                if (k >= 1) hero.tween = null;
            }
            const vx = dt > 0 ? (hero.x - prevX) / dt : 0;
            hero.body.vx = vx * (SP.runPx / SP.explore);
            hero.body.dashing = !!hero.tween?.dash;
            const move = hero.body.move;
            if (move) {
                move.age += dt;
                if (move.age >= move.seconds && move.kind !== 'fall') hero.body.move = null;
            }
            HERO.updateAnim(hero.anim, hero.body, dt);
            hero.ghosts = hero.ghosts.filter(gh => (gh.age += dt) < 0.3);

            if (monster) {
                if (monster.tween) {
                    const tw = monster.tween;
                    const k = clamp((clock - tw.t0) / tw.dur);
                    monster.x = tw.from + (tw.to - tw.from) * tw.ease(k);
                    if (k >= 1) monster.tween = null;
                }
                if ((monster.dyingAt && clock - monster.dyingAt > TM.death) || (monster.leavingAt && clock - monster.leavingAt > 0.7)) monster = null;
            }

            if (pet) {
                let target = hero.x - (pet.look.behind ?? L.petBehind);
                if (pet.charge && monster) {
                    const k = clamp((clock - pet.charge.t0) / pet.charge.dur);
                    target += bump(k) * (monster.x - 7 - target);
                    if (k >= 1) pet.charge = null;
                }
                pet.speed = (target - pet.x) / Math.max(dt, 1e-3);
                pet.x += (target - pet.x) * Math.min(1, dt * (pet.charge ? 14 : 6));
            }

            campfire.level += (campfire.target - campfire.level) * Math.min(1, dt * (campfire.target ? 2.5 : 1.2));
            if (campfire.level > 0.3 && Math.random() < dt * 14) {
                burst(campfire.x + (Math.random() - 0.5) * 2, -1, 3, '#fbbf24', 1, 3, { glow: true, life: 1, up: 12, size: 0.6 });
            }
            if (chest?.openAt && clock - chest.openAt > 1.4) chest = null;
            if (wisp?.goneAt && clock - wisp.goneAt > 0.8) wisp = null;

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.age += dt;
                if (p.age >= p.life) {
                    particles.splice(i, 1);
                    continue;
                }
                p.x += p.vx * dt;
                p.dr += p.vdr * dt;
                p.z = Math.max(0, p.z + p.vz * dt);
                p.vz -= p.grav * dt;
                p.vx *= 1 - dt * 2;
            }
            [texts, slashes, rings].forEach(list => {
                for (let i = list.length - 1; i >= 0; i--) if ((list[i].age += dt) >= list[i].life) list.splice(i, 1);
            });
            if (flash && (flash.age += dt) >= flash.life) flash = null;
            shake = Math.max(0, shake - dt * 30);
            fade = Math.max(0, fade - dt * 1.6);

            // Câmera: segue o herói; em combate abre espaço para o monstro
            const target = hero.homeX - (monster && !monster.leavingAt ? L.heroCombat : L.heroExplore);
            cam.x += (target - cam.x) * Math.min(1, dt * 5);
        }

        // --- DESENHO ---
        function heroOpts(p) {
            return {
                x: p.x,
                y: p.y,
                scale: p.s,
                model: look?.model,
                colors: look?.colors,
                camera: { heightScale: cam.heightScale, groundSquash: cam.groundSquash },
                frenzy: hero.frenzy,
                time: clock
            };
        }

        function drawHero() {
            const p = cam.project(hero.x, 0, 0);
            // Halo de névoa atrás do herói: separa a silhueta escura do fundo
            drawGlow(g, scene.fogColor(0.5), p.x, p.y - p.s * 11, p.s * 15, 0.22 * hero.alpha);
            // Brilho por trás do herói com a Fúria pronta
            if (hero.frenzy) {
                g.globalCompositeOperation = 'lighter';
                drawGlow(g, 'rgba(239, 68, 68, 0.55)', p.x, p.y - p.s * 12, p.s * 15, 0.35 + 0.15 * Math.sin(clock * 5));
                g.globalCompositeOperation = 'source-over';
            }
            hero.ghosts.forEach((gh) => {
                const q = cam.project(gh.x, 0, 0);
                HERO.render(g, hero.body, hero.anim, { ...heroOpts(q), alpha: 0.35 * (1 - gh.age / 0.3) });
            });
            HERO.render(g, hero.body, hero.anim, heroOpts(p));
            // "!" de alerta quando um monstro aparece
            const ak = (clock - alertAt) / 0.9;
            if (ak >= 0 && ak < 1) {
                const top = cam.project(hero.x, 0, heroTopZ() + 2 + easeOutQuad(Math.min(1, ak * 4)) * 2);
                g.globalAlpha = ak < 0.8 ? 1 : (1 - ak) / 0.2;
                g.font = `900 ${Math.round(H * 0.13)}px Cinzel, Georgia, serif`;
                g.textAlign = 'center';
                g.lineWidth = 4;
                g.strokeStyle = '#1c0a0a';
                g.strokeText('!', top.x, top.y);
                g.fillStyle = '#f87171';
                g.fillText('!', top.x, top.y);
                g.globalAlpha = 1;
            }
        }

        function drawMonster() {
            const m = monster;
            const entry = cutout(m.entry);
            const t = clock;
            const enter = easeOutCubic(clamp((t - m.born) / TM.monsterEnter));
            const dying = m.dyingAt ? clamp((t - m.dyingAt) / TM.death) : 0;
            const leaving = m.leavingAt ? clamp((t - m.leavingAt) / 0.7) : 0;
            const alpha = enter * (1 - dying) * (1 - leaving);
            if (alpha <= 0) return;
            const hurt = clamp(1 - (t - m.hurtAt) / 0.3);
            const shakeX = hurt ? Math.sin(t * 90) * hurt * 0.8 : 0;
            const bob = Math.sin(t * 1.9) * 0.7;
            const size = monsterHeight();
            const z = -5 * (1 - enter) + bob + dying * 8;
            const base = cam.project(m.x, 0, 0);
            const p = cam.project(m.x + shakeX, 0, z);
            const s = p.s;
            // Sombra no chão e névoa que forma o corpo
            g.globalAlpha = alpha * 0.55;
            g.fillStyle = '#000';
            g.beginPath();
            g.ellipse(base.x, base.y, size * 0.32 * s, size * 0.32 * s * cam.groundSquash * 0.6, 0, 0, Math.PI * 2);
            g.fill();
            const mist = glowSprite(scene.theme?.monsterMist || 'rgba(140,170,180,0.55)');
            for (let i = 0; i < 4; i++) {
                const k = i / 3;
                const wob = Math.sin(t * 2.2 + i * 1.7) * 2;
                const r = (9 - k * 3) * s;
                g.globalAlpha = alpha * 0.5;
                g.drawImage(mist, p.x + (k - 0.5) * 12 * s + wob * s - r, p.y - (3 + k * 5) * s * cam.heightScale - r * 0.6, r * 2, r * 1.2);
            }
            // Aviso do golpe forte: aura vermelha pulsando
            if (m.telegraph && !dying) {
                g.globalCompositeOperation = 'lighter';
                drawGlow(g, 'rgba(239, 68, 68, 0.8)', p.x, p.y - size * 0.55 * s * cam.heightScale, size * 0.75 * s, alpha * (0.35 + 0.25 * Math.sin(t * 9)));
                g.globalCompositeOperation = 'source-over';
            }
            if (m.drawn) {
                const tw = m.tween;
                const attack = tw && tw.to < tw.from - 2 ? clamp((clock - tw.t0) / tw.dur) : 0;
                NS.monsters.paint(m.drawn, g, {
                    x: p.x, y: p.y, s, hs: cam.heightScale, facing: -1, t: t + m.born * 7,
                    alpha, flash: clamp(1 - (t - m.flashAt) / 0.2) * 0.85, hurt, attack, dying,
                    telegraph: m.telegraph, scale: m.boss ? 1.3 : 1
                });
            } else if (entry) {
                const w = size * s;
                const h = size * s;
                const x = p.x - w / 2;
                const y = p.y - h * cam.heightScale - h * (1 - cam.heightScale) * 0.5;
                g.globalAlpha = alpha;
                g.drawImage(entry.cut, x, y, w, h);
                const fl = clamp(1 - (t - m.flashAt) / 0.2);
                if (fl > 0 || dying > 0) {
                    g.globalAlpha = alpha * Math.max(fl * 0.85, dying * 0.6);
                    g.drawImage(entry.white, x, y, w, h);
                }
            }
            g.globalAlpha = 1;
            // Estrelas girando sobre o atordoado
            if (t < m.stunUntil && !dying) {
                for (let i = 0; i < 3; i++) {
                    const a = t * 5 + i * 2.09;
                    const q = cam.project(m.x + Math.cos(a) * 5, Math.sin(a) * 3, size * 0.82);
                    drawGlow(g, 'rgba(253, 224, 71, 0.9)', q.x, q.y, q.s * 1.4, 0.9);
                }
            }
        }

        function drawPet() {
            const entry = cutout(pet.entry, 0.7);
            if (!entry) return;
            const moving = Math.abs(pet.speed || 0) > 4;
            const hop = moving ? Math.abs(Math.sin(clock * 12)) * 1.6 * (pet.look.size ? 0.6 : 1) : 0;
            const base = cam.project(pet.x, 2.5, 0);
            const p = cam.project(pet.x, 2.5, hop);
            const size = (pet.look.size || L.petSize || 11) * p.s;
            g.globalAlpha = 0.45;
            g.fillStyle = '#000';
            g.beginPath();
            g.ellipse(base.x, base.y, size * 0.3, size * 0.3 * cam.groundSquash * 0.6, 0, 0, Math.PI * 2);
            g.fill();
            g.globalAlpha = 1;
            g.drawImage(entry.cut, p.x - size / 2, p.y - size * 0.92, size, size);
        }

        function drawCampfire() {
            const k = campfire.level;
            if (k < 0.02) return;
            const base = cam.project(campfire.x, -1.5, 0);
            const s = base.s;
            g.globalCompositeOperation = 'lighter';
            drawGlow(g, 'rgba(251, 146, 60, 0.6)', base.x, base.y - 3 * s, 26 * s * k, 0.55 * k);
            g.globalCompositeOperation = 'source-over';
            g.globalAlpha = Math.min(1, k * 2);
            g.strokeStyle = '#3b2312';
            g.lineCap = 'round';
            g.lineWidth = 1.4 * s;
            g.beginPath();
            g.moveTo(base.x - 3.5 * s, base.y + 0.6 * s);
            g.lineTo(base.x + 3.5 * s, base.y - 1.2 * s);
            g.moveTo(base.x - 3.5 * s, base.y - 1.2 * s);
            g.lineTo(base.x + 3.5 * s, base.y + 0.6 * s);
            g.stroke();
            const t = clock;
            [['#ea580c', 2.6, 7], ['#f59e0b', 1.8, 5.2], ['#fef3c7', 0.9, 3]].forEach(([color, w, h], i) => {
                const flick = 1 + Math.sin(t * 17 + i) * 0.1 + Math.sin(t * 7.3 + i * 2) * 0.08;
                const hh = h * k * flick * s;
                const ww = w * s;
                g.fillStyle = color;
                g.beginPath();
                g.moveTo(base.x - ww, base.y - 0.6 * s);
                g.quadraticCurveTo(base.x - ww * 1.1, base.y - hh * 0.6, base.x + Math.sin(t * 9 + i) * 0.6 * s, base.y - hh);
                g.quadraticCurveTo(base.x + ww * 1.1, base.y - hh * 0.6, base.x + ww, base.y - 0.6 * s);
                g.fill();
            });
            g.globalAlpha = 1;
        }

        function drawChest() {
            const born = easeOutCubic(clamp((clock - chest.born) / 0.5));
            const open = chest.openAt ? clamp((clock - chest.openAt) / 0.3) : 0;
            const gone = chest.openAt ? clamp((clock - chest.openAt - 0.8) / 0.6) : 0;
            const p = cam.project(chest.x, 0, 0);
            const s = p.s;
            g.globalAlpha = born * (1 - gone);
            g.globalCompositeOperation = 'lighter';
            drawGlow(g, 'rgba(251, 191, 36, 0.6)', p.x, p.y - 3 * s, 11 * s, 0.35 + 0.15 * Math.sin(clock * 3) + open * 0.4);
            g.globalCompositeOperation = 'source-over';
            const w = 5 * s;
            const h = 3.6 * s;
            g.fillStyle = 'rgba(0,0,0,0.45)';
            g.beginPath();
            g.ellipse(p.x, p.y, w * 1.2, w * 0.35, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#5b3416';
            g.fillRect(p.x - w, p.y - h, w * 2, h);
            g.fillStyle = '#d4a017';
            g.fillRect(p.x - w, p.y - h * 0.62, w * 2, h * 0.14);
            g.fillRect(p.x - w * 0.15, p.y - h * 0.8, w * 0.3, h * 0.4);
            // Tampa: abre girando para trás
            g.save();
            g.translate(p.x, p.y - h);
            g.scale(1, 1 - open * 1.6);
            g.fillStyle = '#7c4a1e';
            g.beginPath();
            g.ellipse(0, 0, w, h * 0.55, 0, Math.PI, Math.PI * 2);
            g.fill();
            g.restore();
            g.globalAlpha = 1;
        }

        function drawWisp() {
            const born = clamp((clock - wisp.born) / 0.8);
            const gone = wisp.goneAt ? clamp((clock - wisp.goneAt) / 0.8) : 0;
            const a = born * (1 - gone);
            const p = cam.project(wisp.x, 4, 14 + Math.sin(clock * 1.4) * 2);
            g.globalCompositeOperation = 'lighter';
            drawGlow(g, 'rgba(196, 181, 253, 0.8)', p.x, p.y, 9 * p.s, a * 0.6);
            drawGlow(g, 'rgba(255, 255, 255, 0.9)', p.x, p.y, 2.5 * p.s, a);
            for (let i = 0; i < 4; i++) {
                const q = cam.project(wisp.x + Math.sin(clock * 2 + i * 1.6) * 4, 4, 14 + Math.cos(clock * 1.7 + i) * 4);
                drawGlow(g, 'rgba(196, 181, 253, 0.9)', q.x, q.y, 1.2 * q.s, a * 0.8);
            }
            g.globalCompositeOperation = 'source-over';
        }

        function drawEffects() {
            rings.forEach((r) => {
                const k = r.age / r.life;
                const p = cam.project(r.x, 0, 0.2);
                const rad = (r.r0 + (r.r1 - r.r0) * easeOutCubic(k)) * p.s;
                g.globalAlpha = 1 - k;
                g.strokeStyle = r.color;
                g.lineWidth = Math.max(1, 3 * (1 - k)) * (p.s / 5);
                g.beginPath();
                g.ellipse(p.x, p.y, rad, rad * cam.groundSquash * 0.75, 0, 0, Math.PI * 2);
                g.stroke();
            });
            slashes.forEach((sl) => {
                const k = sl.age / sl.life;
                const p = cam.project(sl.x, -2, sl.z);
                const r = 11 * sl.size * p.s;
                g.save();
                g.translate(p.x, p.y);
                g.rotate(sl.angle);
                g.globalCompositeOperation = 'lighter';
                for (let i = 0; i < 3; i++) {
                    g.globalAlpha = (1 - k) * (0.8 - i * 0.22);
                    g.strokeStyle = i === 0 ? '#ffffff' : sl.color;
                    g.lineWidth = (3.2 - i) * (p.s / 4) * (1 - k * 0.5);
                    g.beginPath();
                    g.ellipse(0, 0, r * (1 + i * 0.07), r * 0.32, 0, Math.PI * (1.05 + k * 0.2), Math.PI * (1.95 + k * 0.2));
                    g.stroke();
                }
                g.restore();
            });
            g.globalAlpha = 1;
            g.globalCompositeOperation = 'lighter';
            particles.forEach((pt) => {
                const p = cam.project(pt.x, pt.dr, pt.z);
                const a = 1 - pt.age / pt.life;
                if (pt.glow) drawGlow(g, pt.color, p.x, p.y, pt.size * p.s, a);
                else {
                    g.globalAlpha = a;
                    g.fillStyle = pt.color;
                    const r = Math.max(1, pt.size * p.s);
                    g.fillRect(p.x - r / 2, p.y - r / 2, r, r);
                }
            });
            g.globalAlpha = 1;
            g.globalCompositeOperation = 'source-over';
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            texts.forEach((tx) => {
                const k = tx.age / tx.life;
                const p = cam.project(tx.x, -3, tx.z + easeOutQuad(k) * 6);
                const pop = k < 0.12 ? 0.7 + 2.5 * k : 1;
                const size = Math.round(H * 0.105 * tx.size * pop);
                p.y = Math.max(size * 0.75, p.y);
                g.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
                g.font = `700 ${size}px Cinzel, Georgia, serif`;
                g.lineWidth = Math.max(2, size * 0.16);
                g.strokeStyle = 'rgba(8, 12, 16, 0.9)';
                g.strokeText(tx.text, p.x, p.y);
                g.fillStyle = tx.color;
                g.fillText(tx.text, p.x, p.y);
            });
            g.globalAlpha = 1;
        }

        function draw() {
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            const sx = shake ? (hash(Math.floor(clock * 60), 1) - 0.5) * shake : 0;
            const sy = shake ? (hash(Math.floor(clock * 60), 2) - 0.5) * shake : 0;
            if (sx || sy) g.setTransform(dpr, 0, 0, dpr, sx * dpr, sy * dpr);
            scene.drawBack(g, clock);
            // Atores no chão, do mais longe para o mais perto
            const actors = [];
            if (wisp) actors.push({ dr: 4, draw: drawWisp });
            if (pet) actors.push({ dr: 2.5, draw: drawPet });
            if (monster) actors.push({ dr: 0.5, draw: drawMonster });
            if (chest) actors.push({ dr: 0.2, draw: drawChest });
            actors.push({ dr: 0, draw: drawHero });
            if (campfire.level > 0.02) actors.push({ dr: -1.5, draw: drawCampfire });
            actors.sort((a, b) => b.dr - a.dr).forEach(a => a.draw());
            drawEffects();
            const hx = cam.project(hero.x, 0, 0).x;
            const mx = monster ? cam.project(monster.x, 0, 0).x : hx;
            scene.drawFront(g, clock, [Math.min(hx, mx) - H * 0.25, Math.max(hx, mx) + H * 0.25]);
            if (flash) {
                g.globalAlpha = 1 - flash.age / flash.life;
                g.fillStyle = flash.color;
                g.fillRect(-20, -20, W + 40, H + 40);
                g.globalAlpha = 1;
            }
            if (fade > 0) {
                g.fillStyle = scene.fogColor(Math.min(1, fade * 1.2));
                g.fillRect(-20, -20, W + 40, H + 40);
            }
        }

        function resize() {
            const rect = canvas.getBoundingClientRect();
            W = Math.round(rect.width);
            H = Math.round(rect.height);
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, Math.round(W * dpr));
            canvas.height = Math.max(1, Math.round(H * dpr));
            scene.resize(W, H, dpr);
        }

        function frame(ms) {
            requestAnimationFrame(frame);
            const dt = Math.min(0.05, Math.max(0, (ms - lastMs) / 1000));
            lastMs = ms;
            if (!visible || document.hidden || !canvas.isConnected || canvas.offsetParent === null) return;
            const rect = canvas.getBoundingClientRect();
            if (Math.round(rect.width) !== W || Math.round(rect.height) !== H) resize();
            if (W < 2 || H < 2) return;
            try {
                syncAlways();
                const dts = dt * director.speed();
                clock += dts;
                director.tick(dts);
                if (director.idle()) watch();
                update(dts);
                draw();
            } catch (error) {
                // O palco nunca pode travar o jogo: registra e segue no próximo quadro
                console.error('[stage]', error);
            }
        }

        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => { visible = entries.some(e => e.isIntersecting); }).observe(canvas);
        }
        requestAnimationFrame((ms) => {
            lastMs = ms;
            frame(ms);
        });

        return {
            // Toca a sequência de uma ação (ver SCRIPTS). r: relatório do turno.
            play(action, r = {}) {
                const script = SCRIPTS[action];
                if (!script) return;
                syncAlways();
                director.add(script(r));
            },
            get busy() { return !director.idle(); },
            actions: Object.keys(SCRIPTS)
        };
    }

    NS.createStage = create;
})();
