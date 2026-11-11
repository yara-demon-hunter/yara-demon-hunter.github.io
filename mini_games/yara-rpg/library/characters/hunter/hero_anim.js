// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/characters/hunter/hero_anim.js e rode o sync.
import { HERO_VISUALS as V } from './hero_visual.js';
import { BODIES } from './body_registry.js';
import { heroHooks } from './hero_hooks.js';
import { host } from '../../core/host.js';
import { easeOutCubic, easeOutQuad, lerpAngle } from '../../core/easing.js';

// --- ANIMAÇÃO DO HERÓI ---
// Estado puramente visual (não afeta a lógica do jogo), usado pelo boneco 2.5D (hero25d.js) e pelo top-down
// (hero_topdown.js). Cada corpo animado tem o seu (o herói, uma sombra dele, um boss com o corpo dele...), criado com
// createHeroAnim e avançado com updateHeroAnim a cada quadro. Todo movimento passa por suavização para não haver
// "saltos" entre poses. No sistema local, +x é a frente do herói e +y é o lado direito.
export function createHeroAnim(throwsKnives = true) {
    return {
        throwsKnives,       // false: o corpo não lança nada, então não faz o gesto de arremesso
        lastTime: performance.now(),
        lastX: 0,
        lastY: 0,
        velX: 0,            // velocidade suavizada (px/s, mundo)
        velY: 0,
        speed: 0,
        run: 0,             // 0 a 1, suavizado
        stride: 0,
        facing: -Math.PI / 2,
        turnRate: 0,        // rad/s suavizado
        capeX: 0,           // atraso da capa (local)
        capeY: 0,
        lastComboStep: 1,
        swingActive: false,
        swingElapsed: 0,
        swingKey: 1,
        swingFrom: 0,
        swingTo: 0,
        swingSeconds: 0.2,
        swingBlend: 0,
        dash: 0,            // 0 a 1: pose do dash
        vigil: 0            // 0 a 1: pose do Vigil (um joelho no chão, espada fincada)
    };
}

// Pontas fixas da barra da capa (aleatórias uma vez, para o rasgado não "tremer"). Uma só para todos os corpos.
export const capeJag = Array.from({ length: V.capeStrips + 1 }, (_, i) => (i % 2 === 0 ? 1 : 0.58 + Math.random() * 0.2));

// Golpe novo: o corte que o jogo fez (heroHooks.lastSlash) dá a largura do arco e se é um giro
function startSwing(a, step, body) {
    const lastSlash = heroHooks.lastSlash(body);
    const key = lastSlash && lastSlash.spin ? 'whirl' : step;
    const combo = V.combo[key];
    const half = lastSlash ? lastSlash.arcWidth / 2 : 0.7;
    a.swingKey = key;
    a.swingSeconds = combo.seconds;
    a.swingElapsed = 0;
    a.swingActive = true;
    if (combo.spin) {
        a.swingFrom = -Math.PI;
        a.swingTo = Math.PI;
    } else {
        a.swingFrom = combo.from * (half + combo.extraArc);
        a.swingTo = combo.to * (half + combo.extraArc);
    }
}

// Ângulo local da lâmina em um instante do golpe: preparação → corte → segura no fim
export function swingAngleAt(elapsed, a) {
    const dur = a.swingSeconds;
    const windEnd = dur * V.windupFraction;
    const dir = Math.sign(a.swingTo - a.swingFrom) || 1;
    const windAngle = a.swingFrom - dir * V.windupExtra;
    if (elapsed <= 0) return a.swingFrom;
    if (elapsed < windEnd) {
        // Puxa a lâmina para trás antes de cortar (antecipação)
        const p = easeOutQuad(elapsed / windEnd);
        return a.swingFrom + (windAngle - a.swingFrom) * p;
    }
    const p = Math.min(1, (elapsed - windEnd) / (dur - windEnd));
    return windAngle + (a.swingTo - windAngle) * easeOutCubic(p);
}

// Avança a animação a de quem anima (body) pelo tempo real. body: { x, y, angle, comboStep, dashTimer, vigilStance }
// (comboStep muda a cada golpe; dashTimer > 0 durante o dash; vigilStance liga a pose do Vigil).
export function updateHeroAnim(a, body) {
    const now = performance.now();
    const dt = Math.min((now - a.lastTime) / 1000, 0.05);
    a.lastTime = now;
    const playing = host.animating();

    const dx = body.x - a.lastX;
    const dy = body.y - a.lastY;
    a.lastX = body.x;
    a.lastY = body.y;

    if (playing && dt > 0) {
        // Velocidade suavizada
        const k = Math.min(1, dt * V.speedSmoothing);
        a.velX += (Math.max(-600, Math.min(600, dx / dt)) - a.velX) * k;
        a.velY += (Math.max(-600, Math.min(600, dy / dt)) - a.velY) * k;
        a.speed = Math.hypot(a.velX, a.velY);

        const runTarget = Math.min(1, a.speed / V.runSpeedForFullEffect);
        a.run += (runTarget - a.run) * Math.min(1, dt * V.runSmoothing);
        // Ritmo das passadas: o do boneco do herói (a.model, guardado no render; vis.strideSpeed), ou o geral
        a.stride += dt * (BODIES[a.model]?.vis.strideSpeed ?? V.strideSpeed) * (0.25 + a.run);

        // Giro suave para o lado do movimento (não durante o golpe). No arremesso vira rápido para o alvo.
        const before = a.facing;
        const throwing = a.throwsKnives && heroHooks.throwing(now);
        if (throwing) {
            a.facing = lerpAngle(a.facing, heroHooks.throwAngle(), Math.min(1, dt * 25));
        } else if (Math.hypot(dx, dy) > 0.3 && !a.swingActive) {
            a.facing = lerpAngle(a.facing, Math.atan2(dy, dx), Math.min(1, dt * V.turnSmoothing));
        }
        let dAng = a.facing - before;
        while (dAng > Math.PI) dAng -= Math.PI * 2;
        while (dAng < -Math.PI) dAng += Math.PI * 2;
        a.turnRate += (dAng / dt - a.turnRate) * Math.min(1, dt * 10);

        // Capa: atraso suave oposto à velocidade (no referencial do herói)
        const cos = Math.cos(-a.facing);
        const sin = Math.sin(-a.facing);
        const lx = a.velX * cos - a.velY * sin;
        const ly = a.velX * sin + a.velY * cos;
        const clamp = (v) => Math.max(-V.capeMaxLag, Math.min(V.capeMaxLag, v));
        const targetX = clamp(-lx * V.capeDragPerSpeed);
        const targetY = clamp(-ly * V.capeDragPerSpeed - a.turnRate * V.capeTurnLag);
        const f = Math.min(1, dt * V.capeFollow);
        a.capeX += (targetX - a.capeX) * f;
        a.capeY += (targetY - a.capeY) * f;
    }

    // Novo golpe: o passo executado é o valor anterior do combo
    if (body.comboStep !== a.lastComboStep) {
        const executedStep = a.lastComboStep;
        a.lastComboStep = body.comboStep;
        a.facing = body.angle;
        startSwing(a, executedStep, body);
    }

    if (a.swingActive && playing) {
        a.swingElapsed += dt;
        if (a.swingElapsed > a.swingSeconds + V.recoverSeconds) a.swingActive = false;
    }
    // Mistura suave entre a pose de repouso e a pose de golpe (entra e sai sem estalo)
    const blendTarget = a.swingActive && a.swingElapsed < a.swingSeconds + V.recoverSeconds * 0.4 ? 1 : 0;
    a.swingBlend += (blendTarget - a.swingBlend) * Math.min(1, dt * V.swingBlendRate);
    if (a.swingBlend < 0.001) a.swingBlend = 0;
    a.dash += ((body.dashTimer > 0 ? 1 : 0) - a.dash) * Math.min(1, dt * V.dashBlendRate);
    a.vigil += ((body.vigilStance ? 1 : 0) - a.vigil) * Math.min(1, dt * V.vigilBlendRate);
}

// --- ANIMAÇÃO GUIADA PELO JOGO (palco do yara-rpg) ---
// Para quem não move o corpo pelo mundo: o jogo diz a velocidade (vx, vy em px/s, na escala do Last Torch), para onde
// olhar (face) e quanto tempo passou (dt). input: { vx, vy, face, dashing, kneeling }. Mesmos ritmos de hero_visual.js.
export function steerHeroAnim(a, input, dt) {
    if (dt <= 0) return;
    const clampSpeed = (v) => Math.max(-600, Math.min(600, v || 0));
    const k = Math.min(1, dt * V.speedSmoothing);
    a.velX += (clampSpeed(input.vx) - a.velX) * k;
    a.velY += (clampSpeed(input.vy) - a.velY) * k;
    a.speed = Math.hypot(a.velX, a.velY);

    const runTarget = Math.min(1, a.speed / V.runSpeedForFullEffect);
    a.run += (runTarget - a.run) * Math.min(1, dt * V.runSmoothing);
    a.stride += dt * (BODIES[a.model]?.vis.strideSpeed ?? V.strideSpeed) * (0.25 + a.run);

    // Giro suave para onde o jogo manda olhar
    const before = a.facing;
    a.facing = lerpAngle(a.facing, input.face ?? a.facing, Math.min(1, dt * V.turnSmoothing));
    let dAng = a.facing - before;
    while (dAng > Math.PI) dAng -= Math.PI * 2;
    while (dAng < -Math.PI) dAng += Math.PI * 2;
    a.turnRate += (dAng / dt - a.turnRate) * Math.min(1, dt * 10);

    // Capa: atraso suave oposto à velocidade (no referencial do herói)
    const cos = Math.cos(-a.facing);
    const sin = Math.sin(-a.facing);
    const lx = a.velX * cos - a.velY * sin;
    const ly = a.velX * sin + a.velY * cos;
    const lag = (v) => Math.max(-V.capeMaxLag, Math.min(V.capeMaxLag, v));
    const f = Math.min(1, dt * V.capeFollow);
    a.capeX += (lag(-lx * V.capeDragPerSpeed) - a.capeX) * f;
    a.capeY += (lag(-ly * V.capeDragPerSpeed - a.turnRate * V.capeTurnLag) - a.capeY) * f;

    if (a.swingActive) {
        a.swingElapsed += dt;
        if (a.swingElapsed > a.swingSeconds + V.recoverSeconds) a.swingActive = false;
    }
    const blendTarget = a.swingActive && a.swingElapsed < a.swingSeconds + V.recoverSeconds * 0.4 ? 1 : 0;
    a.swingBlend += (blendTarget - a.swingBlend) * Math.min(1, dt * V.swingBlendRate);
    if (a.swingBlend < 0.001) a.swingBlend = 0;
    a.dash += ((input.dashing ? 1 : 0) - a.dash) * Math.min(1, dt * V.dashBlendRate);
    a.vigil += ((input.kneeling ? 1 : 0) - a.vigil) * Math.min(1, dt * V.vigilBlendRate);
}

// Golpe do combo pedido pelo jogo: step 1, 2, 3 ou 'whirl' (giro); halfArc: meia abertura do corte. Devolve a duração.
export function startHeroSwing(a, step, halfArc = 0.7) {
    const combo = V.combo[step] || V.combo[1];
    a.swingSeconds = combo.seconds;
    a.swingElapsed = 0;
    a.swingActive = true;
    if (combo.spin) {
        a.swingFrom = -Math.PI;
        a.swingTo = Math.PI;
    } else {
        a.swingFrom = combo.from * (halfArc + combo.extraArc);
        a.swingTo = combo.to * (halfArc + combo.extraArc);
    }
    return combo.seconds;
}
