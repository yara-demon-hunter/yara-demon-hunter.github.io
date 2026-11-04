import { BOT } from '../../data_model/bot.js';
import { BOUNCE } from '../../data_model/bounce.js';
import { DEFAULT_PICKS, ROSTER } from '../../data_model/characters.js';
import { STAGES } from '../../data_model/stages.js';
import { CHARACTER_ART } from '../../data_model/visuals/characters.js';
import { COMBAT } from '../../data_model/combat.js';
import { KEYS } from '../../data_model/controls.js';
import { ARENA, ITEMS } from '../../data_model/match.js';
import { MASS, MOVEMENT, PHYSICS } from '../../data_model/physics.js';
import { CHARACTER_ATLAS as A } from '../../data_model/visuals/sprites.js';
import { PLAYERS } from '../../data_model/players.js';
import { TEXTS } from '../../data_model/texts.js';
import { playSound } from '../audio/sound.js';
import { leftWall, platform, rightWall } from '../core/arena.js';
import { H, W } from '../core/canvas.js';
import { keys } from '../core/input.js';
import { state } from '../core/state.js';
import { giveBomb } from '../systems/bomb.js';
import { addBurst, addPopup, addRing, createDust, createParticles } from '../systems/effects.js';
import { triggerKO } from '../systems/replay.js';
import { updateScoreHUD } from '../ui/hud.js';

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
        this.isPounding = false;
        this.poundWindup = 0;
        this.poundLag = 0;
        this.upHeld = false;
        this.runPhase = 0;
        this.hold = { x: 0, y: 0 };
        this.chain = { x: 0, y: 0 };       // cadeias de quiques, uma por eixo
        this.chainTimer = { x: 0, y: 0 };
        this.stunTimer = 0;
        this.tauntTimer = 0;
        this.speedTimer = 0;
        this.knockTimer = 0;
        this.heavyTimer = 0;
        this.hasShield = false;
        this.sx = 1; // squash & stretch
        this.sy = 1;
        this.downWasHeld = false;
        this.dashWasHeld = false;
        this.tauntWasHeld = false;
        this.wantTaunt = false;
        this.matchCoins = 0;
        this.trail = [];
    }

    get isDashing() { return this.dashTimer > 0; }
    get effMass() { return this.mass * (this.heavyTimer > 0 ? MASS.heavyMultiplier : 1); }
    get speedMul() { return this.character.speed * (this.speedTimer > 0 ? ITEMS.SPEED.multiplier : 1); }

    addMass(d) {
        this.mass = Math.min(PHYSICS.maxMass, Math.max(PHYSICS.minMass, this.mass + d));
    }

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

    // IA do Jogador 2
    botInput() {
        const input = { left: false, right: false, up: false, downPressed: false, dashPressed: false, tauntPressed: false };
        const opp = players.find(p => p !== this);
        const platEnd = platform.x + platform.width;
        const overPlatform = this.x > platform.x + 10 && this.x < platEnd - 10;
        let targetX = opp.isAlive ? opp.x : W / 2;

        if (state.bombHolder === opp) {
            // Fugir de quem está com a bomba
            targetX = this.x < opp.x ? opp.x - BOT.bombFleeDistance : opp.x + BOT.bombFleeDistance;
        } else if (state.bombHolder !== this) {
            // Comer massa no chão, depois moedas se o rival estiver longe
            const blob = nearest(this, state.massBlobs.filter(b => b.age > MASS.blobEatDelayFrames), BOT.blobSearchRadius);
            const coin = nearest(this, state.spawnableCoins, BOT.coinSearchRadius);
            if (blob) targetX = blob.x;
            else if (coin && Math.abs(opp.x - this.x) > BOT.coinIgnoreWhenRivalWithin) targetX = coin.x;
        }

        targetX = Math.max(platform.x + BOT.edgeMargin, Math.min(platEnd - BOT.edgeMargin, targetX));
        if (!overPlatform && !this.isGrounded) targetX = W / 2; // voltar pra arena

        if (targetX < this.x - BOT.deadZone) input.left = true;
        else if (targetX > this.x + BOT.deadZone) input.right = true;

        const dx = opp.x - this.x;
        if (this.isTouchingWall) input.up = true; // wall jump sempre joga pro centro
        else if (this.isGrounded && (Math.random() < BOT.jumpChance ||
            (Math.abs(dx) < BOT.nearRivalDistance && Math.random() < BOT.jumpChanceNearRival))) input.up = true;

        // SMASH: caindo por cima do rival
        if (!this.isGrounded && opp.isAlive && opp.stunTimer === 0 && Math.abs(dx) < this.radius + opp.radius &&
            this.y < opp.y - BOT.smashAbove && this.vy > -2) {
            input.downPressed = true;
        }

        // Dash de ataque
        if (this.dashCooldown === 0 && Math.abs(dx) < BOT.dashDistance &&
            Math.abs(opp.y - this.y) < BOT.dashVerticalTolerance && Math.random() < BOT.dashChance) {
            input.dashPressed = true;
            input.left = dx < 0;
            input.right = dx > 0;
        }

        if (this.wantTaunt) {
            input.tauntPressed = true;
            this.wantTaunt = false;
        }
        return input;
    }

    update() {
        if (!this.isAlive) return;
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.dashTimer > 0) this.dashTimer--;
        if (this.speedTimer > 0) this.speedTimer--;
        if (this.knockTimer > 0) this.knockTimer--;
        if (this.heavyTimer > 0) this.heavyTimer--;
        if (this.stunTimer > 0) this.stunTimer--;
        if (this.tauntTimer > 0) this.tauntTimer--;
        if (this.poundLag > 0) this.poundLag--;

        const input = this.controls.isBot ? this.botInput() : this.humanInput();
        const canAct = this.stunTimer === 0 && this.poundLag === 0 && !this.isPounding;
        const accel = MOVEMENT.runAccel * this.speedMul / Math.sqrt(this.effMass) * (this.isGrounded ? 1 : PHYSICS.airControl);
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
        if (this.isPounding && this.poundWindup === 0) this.squash(0.7, 1.35);

        // Aplicação de Física: cada eixo é independente (atrito só no horizontal, gravidade só no vertical)
        const groundFriction = STAGES[state.stage].groundFriction ?? PHYSICS.groundFriction;
        this.vx *= this.isGrounded ? groundFriction : PHYSICS.airDrag;
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
        this.isTouchingWall = false;
        if (this.x - this.radius <= leftWall.x + leftWall.width && this.y >= leftWall.y && this.y <= leftWall.y + leftWall.height) {
            this.x = leftWall.x + leftWall.width + this.radius;
            if (this.vx < -BOUNCE.wall.minSpeed) this.bounceOffWall(1);
            this.isTouchingWall = true;
            this.wallDir = -1;
            if (this.vy > 0) this.vy *= PHYSICS.wallSlideFactor; // Deslizar devagar na parede
        } else if (this.x + this.radius >= rightWall.x && this.y >= rightWall.y && this.y <= rightWall.y + rightWall.height) {
            this.x = rightWall.x - this.radius;
            if (this.vx > BOUNCE.wall.minSpeed) this.bounceOffWall(-1);
            this.isTouchingWall = true;
            this.wallDir = 1;
            if (this.vy > 0) this.vy *= PHYSICS.wallSlideFactor;
        }

        // Colisão Plataforma Central
        const wasGrounded = this.isGrounded;
        if (
            this.x + this.radius > platform.x &&
            this.x - this.radius < platform.x + platform.width &&
            this.y + this.radius >= platform.y &&
            this.y - this.radius < platform.y + platform.height &&
            this.vy > 0
        ) {
            const impactVy = this.vy;
            this.y = platform.y - this.radius;
            this.vy = 0;
            this.isGrounded = true;
            if (this.isPounding) this.landPound();
            else if (!wasGrounded && impactVy > BOUNCE.floor.minImpact) this.landBounce(impactVy);
        } else {
            this.isGrounded = false;
        }

        // Coletar Moedas na Arena
        for (let i = state.spawnableCoins.length - 1; i >= 0; i--) {
            const c = state.spawnableCoins[i];
            if (Math.hypot(this.x - c.x, this.y - c.y) < this.radius + c.radius) {
                playSound('coin');
                this.matchCoins++;
                updateScoreHUD();
                createParticles(c.x, c.y, '#ffd32a', 10);
                addPopup(c.x, c.y - 10, '+1', '#ffd32a');
                addBurst(c.x, c.y, 22, '#fff3b0');
                state.spawnableCoins.splice(i, 1);
            }
        }

        // Coletar Power-ups
        for (let i = state.airDrops.length - 1; i >= 0; i--) {
            const p = state.airDrops[i];
            if (Math.hypot(this.x - p.x, this.y - p.y) >= this.radius + p.radius) continue;
            playSound('dash');
            createParticles(p.x, p.y, p.color, 18);
            if (p.type === 'SPEED') this.speedTimer = ITEMS.SPEED.frames;
            else if (p.type === 'KNOCKBACK') this.knockTimer = ITEMS.KNOCKBACK.frames;
            else if (p.type === 'SHIELD') this.hasShield = true;
            else if (p.type === 'HEAVY') this.heavyTimer = ITEMS.HEAVY.frames;
            else if (p.type === 'BOMB') giveBomb(this);
            state.airDrops.splice(i, 1);
        }

        // Queda na Morte (K.O.)
        if ((this.y > H + PHYSICS.fallOutBottom || this.x < -PHYSICS.fallOutSides || this.x > W + PHYSICS.fallOutSides) && this.isAlive) {
            this.isAlive = false;
            triggerKO(this);
        }
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

    triggerDash(dir) {
        this.dashTimer = MOVEMENT.dash.frames;
        this.dashCooldown = MOVEMENT.dash.cooldown;
        this.facing = dir;
        this.vx = dir * MOVEMENT.dash.speed / Math.sqrt(this.effMass);
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

    landPound() {
        this.isPounding = false;
        this.poundLag = MOVEMENT.pound.missLagFrames; // errou o smash: fica preso um instante
        this.squash(1.5, 0.6);
        state.cameraShake = Math.max(state.cameraShake, COMBAT.shake.headBounce);
        playSound('land');
        createParticles(this.x, this.y + this.radius, '#45f3df', 14);
        createDust(this.x, this.y + this.radius, 8, 5);
        addRing(this.x, this.y + this.radius, 70, '#45f3df');
        // Onda de choque empurra quem estiver perto no chão
        const opp = players.find(p => p !== this);
        const dx = opp.x - this.x;
        if (opp.isAlive && opp.isGrounded && Math.abs(dx) < MOVEMENT.pound.shockRange && Math.abs(dx) > this.radius + opp.radius - 2) {
            opp.vx += Math.sign(dx) * MOVEMENT.pound.shockPush / Math.sqrt(opp.effMass);
            opp.vy = -MOVEMENT.pound.shockLift;
        }
    }
}

export function nearest(from, list, maxDist) {
    let best = null;
    let bestD = maxDist;
    list.forEach(o => {
        const d = Math.hypot(o.x - from.x, o.y - from.y);
        if (d < bestD) { best = o; bestD = d; }
    });
    return best;
}

// Os dois lutadores
export const players = PLAYERS.map((cfg, i) =>
    new Player(cfg.id, ARENA.startX[i], cfg.name, cfg.color, { ...KEYS[i], isBot: i === 1 }));
export const otherPlayer = p => players.find(o => o !== p);
