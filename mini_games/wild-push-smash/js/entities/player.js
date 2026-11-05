import { BOUNCE } from '../../data_model/bounce.js';
import { DEFAULT_PICKS, ROSTER } from '../../data_model/characters.js';
import { STAGES } from '../../data_model/stages.js';
import { CHARACTER_ART } from '../../data_model/visuals/characters.js';
import { COMBAT } from '../../data_model/combat.js';
import { KEYS } from '../../data_model/controls.js';
import { ARENA, MATCH } from '../../data_model/match.js';
import { MOVEMENT, PHYSICS } from '../../data_model/physics.js';
import { CHARACTER_ATLAS as A } from '../../data_model/visuals/sprites.js';
import { PLAYERS } from '../../data_model/players.js';
import { TEXTS } from '../../data_model/texts.js';
import { WHISTLE } from '../../data_model/audio.js';
import { playSound, setLoop, stopLoop } from '../audio/sound.js';
import { arcs, flatRange, groundYAt, ledges, leftWall, platform, rightWall, terrain } from '../core/arena.js';
import { H, W } from '../core/canvas.js';
import { keys } from '../core/input.js';
import { state } from '../core/state.js';
import { botInput } from '../systems/bot_ai.js';
import { addBlast, addBurst, addPopup, addRing, comicImpact, createDebris, createDust, groundWave, createParticles, rocketTrail } from '../systems/effects.js';
import { triggerKO } from '../systems/replay.js';

// Cores do fogo do DASH TURBO
const FIRE = ['#ffd32a', '#ff8a00', '#ff4d1f'];

export class Player {
    constructor(id, x, name, color, controls) {
        this.id = id;
        this.startX = x;
        this.name = name;
        this.color = color;
        this.controls = controls;
        this.setCharacter(DEFAULT_PICKS[id - 1]);
        this.resetMatch();
        this.reset();
    }

    // Personagem escolhido no menu: muda massa, velocidade e pulo
    setCharacter(index) {
        this.charIndex = index;
        this.character = ROSTER[index];
        this.bodyColor = CHARACTER_ART[this.character.id].body;
    }

    resetMatch() {
        this.roundWins = 0;
        // Medidor de especial (0 a COMBAT.special.max): só zera na partida nova, passa de um round
        // para o outro — quem apanhou muito chega no round seguinte com o TURBO perto para virar o jogo
        this.special = 0;
    }

    reset() {
        this.x = this.startX;
        this.y = platform.y - ARENA.startOffsetY;
        this.vx = 0;
        this.vy = 0;
        this.mass = this.character.mass;
        this.radius = PHYSICS.baseRadius * Math.sqrt(this.mass);
        this.isGrounded = false;
        this.isTouchingWall = false;
        this.wallDir = 0; // -1 left, 1 right
        this.facing = this.id === 1 ? 1 : -1;
        this.isAlive = true;
        this.dashCooldown = 0;
        this.dashTimer = 0;
        this.turbo = false;        // o dash em andamento é o DASH TURBO
        this.isPounding = false;
        this.poundWindup = 0;
        this.poundLag = 0;
        this.upHeld = false;
        this.isGliding = false;
        this.runPhase = 0;
        this.onSlope = false;
        this.onLedge = false;
        this.dropTimer = 0;
        this.hold = { x: 0, y: 0 };
        this.chain = { x: 0, y: 0 };       // cadeias de quiques, uma por eixo
        this.chainTimer = { x: 0, y: 0 };
        this.stunTimer = 0;
        this.tauntTimer = 0;
        this.sx = 1; // squash & stretch
        this.sy = 1;
        this.downWasHeld = false;
        this.dashWasHeld = false;
        this.tauntWasHeld = false;
        this.wantTaunt = false;
        this.ai = null;            // memória do bot (zera a cada round)
        this.hearts = MATCH.hearts;
        this.skyDrop = 0;          // SKY DROP: frames restantes lá no alto (0 = fora dele)
        this.skyAge = 0;
        this.skyRising = false;    // ainda subindo como foguete
        this.skyDropQueued = false; // apertou ▼ durante a subida: solta assim que chegar lá em cima
        this.smashBounce = false;  // quicando depois de um smash (não vale como pisão até pousar)
        this.skyFalling = false;   // caindo do SKY DROP (a mira continua no chão até pousar)
        this.trail = [];
    }

    get isDashing() { return this.dashTimer > 0; }
    get effMass() { return this.mass; }
    get speedMul() { return this.character.speed; }

    squash(sx, sy) {
        this.sx = sx;
        this.sy = sy;
    }

    humanInput() {
        const c = this.controls;
        const down = !!keys[c.down];
        const dash = !!keys[c.dash];
        const taunt = !!keys[c.taunt];
        const input = {
            left: !!keys[c.left],
            right: !!keys[c.right],
            up: !!keys[c.up],
            downPressed: down && !this.downWasHeld,
            dashPressed: dash && !this.dashWasHeld,
            tauntPressed: taunt && !this.tauntWasHeld
        };
        this.downWasHeld = down;
        this.dashWasHeld = dash;
        this.tauntWasHeld = taunt;
        return input;
    }

    update() {
        if (!this.isAlive) return;
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.dashTimer > 0) this.dashTimer--;
        if (this.dashTimer === 0) this.turbo = false;
        else if (this.turbo) createParticles(this.x, this.y, FIRE[Math.floor(Math.random() * FIRE.length)], 3, 5);
        this.addSpecial(COMBAT.special.passivePerFrame);
        if (this.stunTimer > 0) this.stunTimer--;
        if (this.tauntTimer > 0) this.tauntTimer--;
        if (this.poundLag > 0) this.poundLag--;
        if (this.dropTimer > 0) this.dropTimer--;

        const input = this.controls.isBot ? botInput(this, otherPlayer(this)) : this.humanInput();
        if (this.skyFalling && !this.isPounding) this.skyFalling = false;
        if (this.skyDrop > 0) return this.updateSkyDrop(input);
        const canAct = this.stunTimer === 0 && this.poundLag === 0 && !this.isPounding;
        const accel = MOVEMENT.runAccel * this.speedMul / this.effMass * (this.isGrounded ? 1 : PHYSICS.airControl);
        this.upHeld = canAct && input.up;
        this.hold = canAct ? { x: (input.right ? 1 : 0) - (input.left ? 1 : 0), y: input.up ? -1 : 0 } : { x: 0, y: 0 };
        ['x', 'y'].forEach(axis => {
            if (this.chainTimer[axis] > 0 && --this.chainTimer[axis] === 0) this.chain[axis] = 0;
        });

        if (canAct) {
            if (input.left) { this.vx -= accel; this.facing = -1; }
            if (input.right) { this.vx += accel; this.facing = 1; }

            // Pulo Normal e Wall Jump
            if (input.up) {
                if (this.isGrounded) {
                    this.vy = -MOVEMENT.jumpSpeed * this.character.jump;
                    this.chain.y = 0;
                    this.isGrounded = false;
                    this.squash(0.75, 1.3);
                    playSound('jump');
                    createDust(this.x, this.y + this.radius, 4, 2.5);
                } else if (this.isTouchingWall) {
                    this.vy = -MOVEMENT.jumpSpeed * this.character.jump;
                    this.vx = -this.wallDir * MOVEMENT.wallJumpKick; // Quicar da parede
                    this.isTouchingWall = false;
                    this.squash(0.75, 1.3);
                    playSound('jump');
                    createParticles(this.x, this.y, '#ffffff', 8);
                }
            }

            // Dash (no chão ou no ar) tem botão próprio; baixo no ar é o SMASH
            if (input.dashPressed && this.dashCooldown === 0) {
                this.triggerDash(input.right ? 1 : (input.left ? -1 : this.facing));
            }
            if (input.downPressed && !this.isGrounded) this.startPound();
            else if (input.downPressed && this.onLedge) this.dropTimer = 14;     // desce da plataforma do alto

            if (input.tauntPressed && this.tauntTimer === 0) {
                this.tauntTimer = MOVEMENT.tauntFrames;
                this.squash(1.2, 0.85);
                playSound('taunt');
                addPopup(this.x, this.y - this.radius - 12, TEXTS.taunts[Math.floor(Math.random() * TEXTS.taunts.length)], this.color);
            }
        }

        // Ground Pound: paradinha no ar e depois despenca
        if (this.isPounding && this.poundWindup > 0) {
            this.poundWindup--;
            this.vx *= MOVEMENT.pound.windupDrag;
            this.vy = 0;
            if (this.poundWindup === 0) {
                this.vy = MOVEMENT.pound.fallSpeed;
                playSound('dash');
            }
        } else {
            this.vy = Math.min(this.vy + PHYSICS.gravity, PHYSICS.maxFallSpeed);
        }

        // Planar (corvo): segurando ↑ no ar e já caindo, freia a queda até fallSpeed e ganha controle lateral
        const glide = this.character.glide;
        this.isGliding = !!glide && canAct && input.up && !this.isGrounded && !this.isTouchingWall &&
            !this.isDashing && this.vy > 0;
        if (this.isGliding) {
            if (this.vy > glide.fallSpeed) this.vy += (glide.fallSpeed - this.vy) * glide.brake;
            const steer = accel * (glide.airControl - 1);
            if (input.left) this.vx -= steer;
            if (input.right) this.vx += steer;
        }
        if (this.isPounding && this.poundWindup === 0) this.squash(0.7, 1.35);

        // Aplicação de Física: cada eixo é independente (atrito só no horizontal, gravidade só no vertical)
        const groundFriction = STAGES[state.stage].groundFriction ?? PHYSICS.groundFriction;
        const dashGroundFriction = this.character.dash.groundFriction;
        const friction = this.isGrounded && this.isDashing && dashGroundFriction !== undefined
            ? dashGroundFriction
            : (this.isGrounded ? groundFriction : PHYSICS.airDrag);
        // Na parte inclinada da rampa quase não há atrito: é o que dá o embalo de skate
        this.vx *= this.onSlope ? 1 : friction;
        this.vx = Math.max(-PHYSICS.maxSpeedX, Math.min(PHYSICS.maxSpeedX, this.vx));
        this.x += this.vx;
        this.y += this.vy;
        if (this.isGrounded) this.runPhase += Math.abs(this.vx) * A.runPhasePerPixel;

        // Massa muda o tamanho aos poucos
        const targetR = PHYSICS.baseRadius * Math.sqrt(this.effMass);
        this.radius += (targetR - this.radius) * PHYSICS.radiusLerp;

        // Squash & stretch volta ao normal (amassado fica achatado enquanto atordoado)
        const tsx = this.stunTimer > 0 ? MOVEMENT.stunSquash.x : 1;
        const tsy = this.stunTimer > 0 ? MOVEMENT.stunSquash.y : 1;
        this.sx += (tsx - this.sx) * MOVEMENT.squashRecover;
        this.sy += (tsy - this.sy) * MOVEMENT.squashRecover;

        // Efeito de Rastro no Dash e no Smash
        if (this.isDashing || (this.isPounding && this.poundWindup === 0)) {
            this.trail.push({ x: this.x, y: this.y, alpha: 0.8 });
            if (this.trail.length > 6) this.trail.shift();
        } else if (this.trail.length > 0) {
            this.trail.shift();
        }

        // Colisão com Paredes Laterais (Wall Slide / Wall Jump / rebote)
        // SMASH e SKY DROP despencam direto: encostar na parede não freia a queda
        const wallSlide = this.isPounding ? 1 : PHYSICS.wallSlideFactor;
        this.isTouchingWall = false;
        if (this.x - this.radius <= leftWall.x + leftWall.width && this.y >= leftWall.y && this.y <= leftWall.y + leftWall.height) {
            this.x = leftWall.x + leftWall.width + this.radius;
            if (this.vx < -BOUNCE.wall.minSpeed) this.bounceOffWall(1);
            this.isTouchingWall = true;
            this.wallDir = -1;
            if (this.vy > 0) this.vy *= wallSlide; // Deslizar devagar na parede
        } else if (this.x + this.radius >= rightWall.x && this.y >= rightWall.y && this.y <= rightWall.y + rightWall.height) {
            this.x = rightWall.x - this.radius;
            if (this.vx > BOUNCE.wall.minSpeed) this.bounceOffWall(-1);
            this.isTouchingWall = true;
            this.wallDir = 1;
            if (this.vy > 0) this.vy *= wallSlide;
        }

        // Colisão Plataforma Central
        const wasGrounded = this.isGrounded;
        const flat = flatRange();
        const overFlat = terrain.type === 'flat'
            ? this.x + this.radius > flat.l && this.x - this.radius < flat.r
            : this.x > flat.l && this.x < flat.r;
        let grounded = false;
        if (overFlat && this.y + this.radius >= platform.y && this.y - this.radius < platform.y + platform.height && this.vy > 0) {
            const impactVy = this.vy;
            this.y = platform.y - this.radius;
            this.vy = 0;
            grounded = true;
            this.onSlope = false;
            if (this.isPounding) this.landPound();
            else if (!wasGrounded && impactVy > BOUNCE.floor.minImpact) this.landBounce(impactVy);
        } else if (!overFlat) {
            grounded = terrain.type === 'zigzag' ? this.collideHeightfield() : this.collideRamp();
        } else {
            this.onSlope = false;
        }
        // Plataformas no alto: mão única, só segura quem vem de cima
        this.onLedge = false;
        if (!grounded && this.dropTimer === 0) {
            for (const l of ledges()) {
                const prevBottom = this.y - this.vy + this.radius;
                if (this.x > l.x - this.radius * 0.3 && this.x < l.x + l.width + this.radius * 0.3 &&
                    this.vy >= 0 && prevBottom <= l.y + 2 && this.y + this.radius >= l.y) {
                    const impactVy = this.vy;
                    this.y = l.y - this.radius;
                    this.vy = 0;
                    grounded = true;
                    this.onLedge = true;
                    this.onSlope = false;
                    if (this.isPounding) this.landPound();
                    else if (!wasGrounded && impactVy > BOUNCE.floor.minImpact) this.landBounce(impactVy);
                    break;
                }
            }
        }
        this.isGrounded = grounded;
        if (grounded || this.isTouchingWall) this.smashBounce = false;

        // Queda na Morte (K.O.)
        if ((this.y > H + PHYSICS.fallOutBottom || this.x < -PHYSICS.fallOutSides || this.x > W + PHYSICS.fallOutSides) && this.isAlive) {
            this.isAlive = false;
            triggerKO(this);
        }
    }

    // Chão em "WWW" (ou qualquer chão desenhado por uma função de altura): procura o ponto do chão mais perto
    // do centro e empurra o lutador para fora dele. Só perde a velocidade que ia contra o chão, então escorrega
    // dos picos para os vales.
    collideHeightfield() {
        this.onSlope = false;
        const r = this.radius;
        let best = null;
        let bestD = Infinity;
        for (let i = -8; i <= 8; i++) {
            const px = this.x + (i * r) / 8;
            const py = groundYAt(px);
            if (py === null) continue;
            const d = Math.hypot(this.x - px, this.y - py);
            if (d < bestD) { bestD = d; best = [px, py]; }
        }
        if (!best) return false;
        const gy = groundYAt(this.x);
        // Veio pela lateral ou por baixo do bloco de areia (no quadro anterior já estava abaixo da superfície,
        // ex.: caindo depois de bater na parede): não pode ser puxado para cima da rampa, tem que cair.
        if (gy !== null && this.y > gy + r * 0.5) {
            const prevX = this.x - this.vx;
            const prevY = this.y - this.vy;
            const prevGround = groundYAt(prevX);
            const cameFromAbove = prevGround !== null && prevY <= prevGround + r * 0.5;
            if (!cameFromAbove) {
                if (this.y - r < platform.y + terrain.thickness) {
                    // Ainda na altura do bloco: empurra para fora pela lateral mais próxima
                    const leftSide = this.x < platform.x + platform.width / 2;
                    this.x = leftSide ? platform.x - r : platform.x + platform.width + r;
                    if (leftSide ? this.vx > 0 : this.vx < 0) this.vx = 0;
                }
                return false;
            }
        }
        const sunk = gy !== null && this.y > gy;      // o centro passou para dentro do chão
        if (!sunk && bestD >= r) return false;
        let nx;
        let ny;
        if (sunk || bestD < 1e-6) {
            const m = ((groundYAt(this.x + 1) ?? gy) - (groundYAt(this.x - 1) ?? gy)) / 2;   // inclinação
            const len = Math.hypot(m, 1);
            nx = m / len;
            ny = -1 / len;
            this.x = this.x + nx * r;
            this.y = gy + ny * r;
        } else {
            nx = (this.x - best[0]) / bestD;
            ny = (this.y - best[1]) / bestD;
            this.x = best[0] + nx * r;
            this.y = best[1] + ny * r;
        }
        const vn = this.vx * nx + this.vy * ny;      // negativo = indo contra o chão
        if (vn < 0) {
            if (this.isPounding) this.landPound();
            this.vx -= nx * vn;
            this.vy -= ny * vn;
        }
        this.onSlope = Math.abs(nx) > 0.12;
        if (this.onSlope) {
            this.vx *= terrain.slopeDamping;
            this.vy *= terrain.slopeDamping;
        }
        // Em cima da ponta de um pico não dá para ficar: o chão desce dos dois lados, então escorrega
        const yl = groundYAt(this.x - r * 0.5);
        const yr = groundYAt(this.x + r * 0.5);
        const top = groundYAt(this.x);
        if (yl !== null && yr !== null && yl > top + 2 && yr > top + 2 && Math.abs(this.vx) < 1) {
            this.vx += (this.vx === 0 ? this.facing : Math.sign(this.vx)) * 0.35;
        }
        return ny < -0.35;
    }

    // Rampa em U: a casca de gelo é sólida dos dois lados.
    //  - Dentro do U: o lutador fica dentro do círculo do arco (raio do arco - raio dele). Ao passar, volta e perde
    //    só a velocidade que ia contra a parede; o resto desliza (quem desce pega velocidade e sobe do outro lado).
    //  - Na borda (topo das pontas do U): dá para pousar em cima, como numa plataforma estreita.
    //  - Por fora do U: bate na casca e é empurrado para fora (antes atravessava ou era puxado para dentro).
    collideRamp() {
        this.onSlope = false;
        const T = terrain.thickness;
        for (const a of arcs()) {
            // Borda de cima da ponta: faixa de largura T logo depois do fim do arco
            const rimIn = a.cx + a.side * a.r;
            const rimOut = a.cx + a.side * (a.r + T);
            const rimL = Math.min(rimIn, rimOut) - this.radius * 0.5;
            const rimR = Math.max(rimIn, rimOut) + this.radius * 0.5;
            if (this.x > rimL && this.x < rimR && this.y < a.cy && this.y + this.radius >= a.cy && this.vy >= 0) {
                this.y = a.cy - this.radius;
                if (this.isPounding) this.landPound();
                this.vy = 0;
                return true;
            }

            // Região do arco: do lado de fora do centro e abaixo da altura do centro
            if ((this.x - a.cx) * a.side <= 0 || this.y <= a.cy) continue;
            const dx = a.cx - this.x;
            const dy = a.cy - this.y;
            const dist = Math.hypot(dx, dy) || 1;
            const nx = dx / dist;      // aponta para o centro do arco (para dentro do U)
            const ny = dy / dist;

            if (dist > a.r + T * 0.5) {
                // Por fora da casca: empurra para fora e tira a velocidade que ia para dentro dela
                const outside = a.r + T + this.radius;
                if (dist >= outside) continue;
                this.x = a.cx - nx * outside;
                this.y = a.cy - ny * outside;
                const inward = this.vx * nx + this.vy * ny;
                if (inward > 0) {
                    this.vx -= nx * inward;
                    this.vy -= ny * inward;
                }
                return false;
            }

            const limit = a.r - this.radius;
            if (dist <= limit) continue;
            this.x = a.cx - nx * limit;
            this.y = a.cy - ny * limit;
            const into = -(this.vx * nx + this.vy * ny);     // velocidade indo contra o chão
            if (into > 0) {
                if (this.isPounding) this.landPound();
                this.vx += nx * into;
                this.vy += ny * into;
            }
            this.onSlope = true;
            this.vx *= terrain.slopeDamping;
            this.vy *= terrain.slopeDamping;
            return ny < -0.35;         // chão virado para cima o bastante para contar como "no chão"
        }
        return false;
    }

    // Sobe a cadeia de quiques de um eixo ('x' parede/rival, 'y' chão/cabeça)
    chainUp(axis) {
        this.chain[axis] = Math.min(this.chain[axis] + 1, BOUNCE.maxChain);
        this.chainTimer[axis] = BOUNCE.chainFrames;
        if (this.chain[axis] >= BOUNCE.popupFromChain) {
            addPopup(this.x, this.y - this.radius - 14, `x${this.chain[axis]}`, '#45f3df');
        }
    }

    // Está segurando o direcional no sentido em que o quique vai empurrar?
    heldToward(nx, ny) {
        const m = Math.hypot(this.hold.x, this.hold.y);
        return m > 0 && (this.hold.x * nx + this.hold.y * ny) / m > BOUNCE.holdThreshold;
    }

    // Pouso no chão (eixo vertical): devolve parte da queda; segurando pra cima ganha impulso extra
    landBounce(impactVy) {
        let out = impactVy * BOUNCE.restitution.floor;
        if (this.upHeld) {
            this.chainUp('y');
            out += BOUNCE.floor.pumpBase + this.chain.y * BOUNCE.floor.pumpPerChain;
            this.squash(0.7, 1.4);
            playSound('jump');
            createParticles(this.x, this.y + this.radius, '#45f3df', 6 + this.chain.y * 2);
        } else {
            this.chain.y = 0;
            if (impactVy < BOUNCE.floor.settleBelow) out = 0;
            this.squash(1.3, 0.72);
        }
        createDust(this.x, this.y + this.radius, 3 + Math.min(6, Math.round(impactVy / 4)), 3);
        if (out > 0.5) {
            this.vy = -Math.min(out, BOUNCE.floor.maxSpeed);
            this.isGrounded = false;
        }
    }

    // Batida na parede (eixo horizontal); nx = direção para longe da parede
    bounceOffWall(nx) {
        let out = Math.abs(this.vx) * BOUNCE.restitution.wall;
        if (this.hold.x !== 0) { // qualquer direcional horizontal vale
            this.chainUp('x');
            out += BOUNCE.wall.pumpBase + this.chain.x * BOUNCE.wall.pumpPerChain;
            createParticles(this.x, this.y, '#45f3df', 6 + this.chain.x * 2);
        } else {
            createParticles(this.x, this.y, this.color, 8);
        }
        this.vx = nx * Math.min(out, BOUNCE.wall.maxSpeed);
        this.squash(0.65, 1.3);
        addBurst(this.x - nx * this.radius, this.y, 20 + this.radius * 0.5, '#ffffff');
        playSound('land');
    }

    // SKY DROP: lançado como um foguete depois de pisar na cabeça do rival
    startSkyDrop() {
        const s = COMBAT.skyDrop;
        this.skyDrop = s.hoverFrames;
        this.skyAge = 0;
        this.skyRising = true;
        this.skyDropQueued = false;
        this.isPounding = false;
        this.poundWindup = 0;
        this.dashTimer = 0;
        this.vy = -s.launchSpeed;
        this.chain.y = 0;
        playSound('rocket');
        addRing(this.x, this.y + this.radius, 90, '#ffa502');
        createDust(this.x, this.y + this.radius, 10, 5);
    }

    // Sobe acelerando até sair da tela; lá em cima anda pros lados (a mira no chão acompanha) com o assobio de queda
    updateSkyDrop(input) {
        const s = COMBAT.skyDrop;
        this.skyAge++;
        const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        if (dir) this.facing = dir;
        this.vx += (dir * s.moveSpeed * this.character.speed - this.vx) * s.moveLerp;
        this.x += this.vx;
        const minX = leftWall.x + leftWall.width + this.radius;
        const maxX = rightWall.x - this.radius;
        if (this.x < minX || this.x > maxX) {
            this.x = Math.max(minX, Math.min(maxX, this.x));
            this.vx = 0;
        }
        this.isGrounded = false;
        this.isTouchingWall = false;
        this.onLedge = false;
        this.onSlope = false;
        if (input.downPressed) this.skyDropQueued = true;

        if (this.skyRising) {
            this.vy = Math.max(this.vy - s.rocketAccel, -s.rocketMaxSpeed);
            this.y += this.vy;
            this.sx = 0.72;
            this.sy = 1.45;
            rocketTrail(this.x, this.y + this.radius);
            this.trail.push({ x: this.x, y: this.y, alpha: 0.6 });
            if (this.trail.length > 6) this.trail.shift();
            if (this.y <= s.hoverY) {
                this.y = s.hoverY;
                this.skyRising = false;
            }
            return;
        }

        this.vy = 0;
        this.skyDrop--;
        this.sx += (1 - this.sx) * MOVEMENT.squashRecover;
        this.sy += (1 - this.sy) * MOVEMENT.squashRecover;
        if (this.trail.length > 0) this.trail.shift();
        const w = WHISTLE;
        const k = 1 - this.skyDrop / s.hoverFrames;
        setLoop('whistle' + this.id, w.wave, w.from * Math.pow(w.to / w.from, k),
            w.volumeFrom + (w.volumeTo - w.volumeFrom) * k, w.vibratoHz, w.vibratoDepth);
        if (this.skyDrop === 0 || this.skyDropQueued) this.dropFromSky();
    }

    // Despenca em linha reta em cima da mira: é um SMASH (acerta o rival = tira coração; errou = fica preso)
    dropFromSky() {
        stopLoop('whistle' + this.id);
        this.skyDrop = 0;
        this.skyRising = false;
        this.skyDropQueued = false;
        this.skyFalling = true;
        this.isPounding = true;
        this.poundWindup = 0;
        this.vx = 0;
        this.vy = COMBAT.skyDrop.fallSpeed;
        this.squash(0.7, 1.35);
        playSound('dash');
    }

    // Enche o medidor; ao chegar no máximo avisa que o DASH TURBO está pronto
    addSpecial(amount) {
        const max = COMBAT.special.max;
        const was = this.special;
        this.special = Math.min(max, was + amount);
        if (was < max && this.special >= max) {
            playSound('coin');
            addPopup(this.x, this.y - this.radius - 30, TEXTS.turboReady, '#c45bff');
        }
    }

    triggerDash(dir) {
        const skill = this.character.dash;
        const T = COMBAT.special.turbo;
        this.turbo = this.special >= COMBAT.special.max;
        this.dashTimer = Math.round(skill.frames * (this.turbo ? T.framesMul : 1));
        this.dashCooldown = this.turbo ? T.cooldown : skill.cooldown;
        this.facing = dir;
        this.vx = dir * skill.speed * (this.turbo ? T.speedMul : 1);
        if (this.turbo) {
            this.special = 0;
            playSound('rocket');
            addRing(this.x, this.y, 80, '#ff8a00');
            addBurst(this.x, this.y, 60, '#ffd32a');
        }
        if (skill.verticalSpeed !== undefined) this.vy = skill.verticalSpeed;
        else if (!this.isGrounded && skill.airVerticalSpeed !== undefined) this.vy = skill.airVerticalSpeed;
        this.squash(1.35, 0.75);
        playSound('dash');
        createParticles(this.x, this.y, this.color, 10);
    }

    startPound() {
        this.isPounding = true;
        this.poundWindup = MOVEMENT.pound.windupFrames;
        this.dashTimer = 0;
        this.squash(1.25, 0.8);
        playSound('jump');
    }

    // Pouso do SKY DROP: onda de choque proporcional à massa que atira o rival para fora, acertando ou não
    skyDropImpact() {
        const S = COMBAT.skyDrop.shock;
        const power = Math.sqrt(this.mass);
        const reach = S.range * power;
        const gx = this.x, gy = this.y + this.radius;
        state.cameraShake = Math.max(state.cameraShake, S.shake * (0.7 + power * 0.3));
        state.hitStop = Math.max(state.hitStop, S.hitStopFrames);
        groundWave(gx, gy, reach);
        addRing(gx, gy, reach, '#ffffff');
        addRing(gx, gy, reach * 0.65, '#ffd32a');
        addRing(gx, gy, reach * 0.35, '#ff8a00');
        addBlast(gx, gy - 10, 90 + power * 40);
        comicImpact(gx, gy - 20, 'smash', 80 + power * 30);
        createDebris(gx, gy, 6 + Math.round(power * 3), 10 + power * 2);
        const opp = players.find(p => p !== this);
        const dx = opp.x - this.x;
        if (!opp.isAlive || Math.abs(dx) > reach) return;
        const near = 1 - (1 - S.falloff) * Math.abs(dx) / reach;
        const dir = dx === 0 ? -this.facing : Math.sign(dx);
        opp.vx += dir * S.push * power / Math.sqrt(opp.effMass) * near;
        opp.vy = Math.min(opp.vy, -S.lift * near);
        opp.isGrounded = false;
        opp.stunTimer = Math.max(opp.stunTimer, S.stunFrames);
        opp.squash(1.5, 0.6);
    }

    landPound() {
        const fromSky = this.skyFalling;
        this.isPounding = false;
        this.poundLag = MOVEMENT.pound.missLagFrames; // errou o smash: fica preso um instante
        this.squash(1.5, 0.6);
        state.cameraShake = Math.max(state.cameraShake, COMBAT.shake.headBounce);
        playSound('land');
        createParticles(this.x, this.y + this.radius, '#45f3df', 14);
        createDust(this.x, this.y + this.radius, 8, 5);
        addRing(this.x, this.y + this.radius, 70, '#45f3df');
        if (!fromSky) comicImpact(this.x, this.y + this.radius, 'land', 50);
        if (fromSky) return this.skyDropImpact();
        // Onda de choque empurra quem estiver perto no chão
        const opp = players.find(p => p !== this);
        const dx = opp.x - this.x;
        if (opp.isAlive && opp.isGrounded && Math.abs(dx) < MOVEMENT.pound.shockRange && Math.abs(dx) > this.radius + opp.radius - 2) {
            opp.vx += Math.sign(dx) * MOVEMENT.pound.shockPush / Math.sqrt(opp.effMass);
            opp.vy = -MOVEMENT.pound.shockLift;
        }
    }
}

// Os dois lutadores
export const players = PLAYERS.map((cfg, i) =>
    new Player(cfg.id, ARENA.startX[i], cfg.name, cfg.color, { ...KEYS[i], isBot: i === 1 }));
export const otherPlayer = p => players.find(o => o !== p);
