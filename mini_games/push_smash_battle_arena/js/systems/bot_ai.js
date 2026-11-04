import { BOT_LEVELS, DEFAULT_BOT_LEVEL } from '../../data_model/bot.js';
import { MOVEMENT } from '../../data_model/physics.js';
import { platform } from '../core/arena.js';
import { W } from '../core/canvas.js';
import { state } from '../core/state.js';

// --- IA DO BOT ---
// Prioridades a cada frame: SKY DROP (mirar e soltar) > voltar para a arena > desviar de ameaças >
// atacar (posição, pulo, smash, dash). A dificuldade (data_model/bot.js) só mexe nos "defeitos":
// atraso para enxergar o rival, erro de mira, hesitação e o quanto ele usa cada truque.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const randRange = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));

// O que o bot "vê" do rival (guardado num histórico curto para simular o tempo de reação)
const snapOf = p => ({
    x: p.x, y: p.y, vx: p.vx, vy: p.vy, radius: p.radius,
    isAlive: p.isAlive, isGrounded: p.isGrounded, isDashing: p.isDashing, isPounding: p.isPounding,
    skyDrop: p.skyDrop, skyFalling: p.skyFalling, stunTimer: p.stunTimer
});

export function botLevelOf(self) {
    return BOT_LEVELS[self.botLevel ?? state.botLevel] ?? BOT_LEVELS[DEFAULT_BOT_LEVEL];
}

function brainOf(self) {
    if (!self.ai) self.ai = { seen: [], hesitate: 0, aimOffset: 0, aimTimer: 0, threat: null, dodging: false };
    return self.ai;
}

function steer(input, fromX, toX, deadZone) {
    if (toX < fromX - deadZone) input.left = true;
    else if (toX > fromX + deadZone) input.right = true;
}

function dash(input, self, dir) {
    if (self.dashCooldown > 0) return;
    input.dashPressed = true;
    input.left = dir < 0;
    input.right = dir > 0;
}

export function botInput(self, opp) {
    const L = botLevelOf(self);
    const ai = brainOf(self);
    const input = { left: false, right: false, up: false, downPressed: false, dashPressed: false, tauntPressed: false };

    // Percepção atrasada: o bot age sobre o rival de `reaction` frames atrás
    ai.seen.push(snapOf(opp));
    while (ai.seen.length > L.reaction + 1) ai.seen.shift();
    const o = ai.seen[0];

    // Erro de mira: muda de tempos em tempos (não treme a cada frame)
    if (--ai.aimTimer <= 0) {
        ai.aimOffset = (Math.random() * 2 - 1) * L.aimError;
        ai.aimTimer = 30;
    }

    const cx = W / 2;
    const left = platform.x;
    const right = platform.x + platform.width;
    const outOf = x => (x >= cx ? 1 : -1);          // para que lado fica a beirada mais perto de x
    const dx = o.x - self.x;
    const gap = self.radius + o.radius;

    // 1. SKY DROP: lá no alto, alinha a mira com o rival (com antecipação no difícil) e solta
    if (self.skyDrop > 0) {
        const aimX = clamp(o.x + o.vx * L.skyLead + ai.aimOffset * 0.5, left, right);
        steer(input, self.x, aimX, L.deadZone);
        input.downPressed = self.skyAge >= L.skyDropMinHover && Math.abs(aimX - self.x) < L.skyDropAim;
        return input;
    }

    // 2. Voltar para a arena: fora da plataforma, ou voando para fora perto da beirada
    const overPlat = self.x > left + 6 && self.x < right - 6;
    const edgeDist = self.x >= cx ? right - self.x : self.x - left;
    const flyingOut = !self.isGrounded && self.vx * outOf(self.x) > 5 && edgeDist < 90;
    if (!self.isGrounded && (!overPlat || flyingOut)) {
        const toCenter = -outOf(self.x);
        input.left = toCenter < 0;
        input.right = toCenter > 0;
        if (self.isTouchingWall) input.up = true;      // wall jump sempre joga para o centro
        // Dash no ar de volta (menos o do sapo, que mergulha para baixo)
        const divesDown = (self.character.dash.airVerticalSpeed ?? 0) > 0;
        if (L.recoverDash && !overPlat && !divesDown && self.y > platform.y - 120) dash(input, self, toCenter);
        return input;
    }

    // Hesitação: às vezes o bot "trava" um instante, como um jogador distraído
    if (ai.hesitate > 0) {
        ai.hesitate--;
        return input;
    }
    if (Math.random() < L.hesitateChance) ai.hesitate = randRange(L.hesitateFrames);

    // 3. Ameaças: sorteia uma vez por ameaça se vai desviar dela
    const overHead = (o.isPounding && o.y < self.y - 10 && Math.abs(dx) < 140);
    const dashingAtMe = o.isDashing && Math.sign(o.vx) === -Math.sign(dx) && Math.abs(dx) < 150 && Math.abs(o.y - self.y) < 50;
    const threat = (o.skyDrop > 0 || o.skyFalling) ? 'sky' : overHead ? 'pound' : dashingAtMe ? 'dash' : null;
    if (threat !== ai.threat) {
        ai.threat = threat;
        ai.dodging = !!threat && Math.random() < L.dodgeChance;
    }
    if (threat && ai.dodging && o.isAlive) {
        if (threat === 'dash') {
            if (self.isGrounded) input.up = true;           // pula por cima do dash
            steer(input, self.x, cx, L.deadZone);
        } else {
            // Sai de baixo da mira: corre para o lado com espaço (sem cair da plataforma)
            const safe = gap * 1.6 + 20;
            if (Math.abs(dx) < safe) {
                const mySide = self.x >= o.x ? 1 : -1;
                const room = mySide > 0 ? right - self.x : self.x - left;
                const dir = room > safe ? mySide : -mySide;
                input.left = dir < 0;
                input.right = dir > 0;
                if (L.dodgeDash && o.skyFalling && self.isGrounded) dash(input, self, dir);
            }
        }
        return finish(input, self);
    }

    // 4. Ataque
    // "Por fora": o bot está entre o rival e a beirada (qualquer batida joga ele para fora). Tem que contornar.
    const iAmOuter = L.smartPositioning && o.isAlive && (self.x - o.x) * outOf(o.x) > 0;
    let targetX;
    if (!o.isAlive) targetX = cx;
    else if (iAmOuter) targetX = o.x - outOf(o.x) * (gap + 40);    // passar para o lado do centro
    else targetX = o.x;                                             // empurrar o rival (para fora, se estiver por dentro)
    // No ar e acima do rival: mira cair na cabeça dele (antecipando, no difícil)
    if (!self.isGrounded && o.isAlive && self.y < o.y - 10) {
        const t = L.predict ? Math.max(0, (o.y - self.y) / 12) : 0;
        targetX = o.x + o.vx * t + ai.aimOffset * 0.4;
    }
    targetX = clamp(targetX, left + L.edgeMargin, right - L.edgeMargin);
    steer(input, self.x, targetX, L.deadZone);

    // Pulos
    if (self.isTouchingWall) input.up = true;
    else if (self.isGrounded && o.isAlive) {
        if (iAmOuter && Math.abs(dx) < gap + 60) input.up = Math.random() < 0.15;       // pula por cima para contornar
        else if (Math.abs(dx) < L.jumpAttackRange && o.stunTimer === 0 && Math.random() < L.jumpAttackChance) input.up = true;
        else if (o.y < self.y - 40 && Math.abs(dx) < 100 && Math.random() < 0.05) input.up = true;   // rival numa plataforma no alto
        else if (Math.random() < L.randomJumpChance) input.up = true;
    }

    // SMASH: em cima do rival e descendo (no difícil, mira onde ele vai estar quando o smash chegar)
    if (!self.isGrounded && !self.isPounding && o.isAlive && o.stunTimer === 0 && self.vy > -2 && self.y < o.y - L.smashAbove) {
        const fallFrames = MOVEMENT.pound.windupFrames + (o.y - self.y) / MOVEMENT.pound.fallSpeed;
        const landX = L.predict ? o.x + o.vx * fallFrames : o.x;
        if (Math.abs(landX + ai.aimOffset * 0.3 - self.x) < gap * 0.8 && Math.random() < L.smashChance) input.downPressed = true;
    }

    // Dash de ataque: só quando empurra o rival para a beirada (no fácil, a qualquer hora)
    if (self.dashCooldown === 0 && o.isAlive && o.skyDrop === 0 && Math.abs(dx) < L.dashRange &&
        Math.abs(o.y - self.y) < 40) {
        const pushesOut = !L.smartPositioning || Math.sign(dx) === outOf(o.x);
        const rivalNearEdge = (o.x >= cx ? right - o.x : o.x - left) < 120;
        const chance = L.dashChance * (L.smartPositioning && rivalNearEdge ? 2 : 1);
        if (pushesOut && Math.random() < chance) dash(input, self, Math.sign(dx) || self.facing);
    }

    return finish(input, self);
}

function finish(input, self) {
    if (self.wantTaunt) {
        input.tauntPressed = true;
        self.wantTaunt = false;
    }
    return input;
}
