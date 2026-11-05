// --- ESQUELETO COMUM 2,5D (rig) ---
// Personagens montados como um boneco 3D simples e vistos por uma câmera 3/4 (levemente de cima).
// Poses-chave em js/data/rig/<id>.js. Ver art_reference/README.md e art_reference/STYLE.md.
//
// Espaço do personagem (unidades de altura do corpo: 1 = dos pés ao topo da cabeça):
//   f = para a frente (para onde ele olha), y = para baixo (chão em 0, cima é negativo),
//   s = lado (positivo = lado mais perto da câmera). Membros "F" ficam do lado da câmera, "B" do lado oposto.
// Câmera: character.camera = { yaw, pitch } — yaw gira o personagem em direção à tela (3/4), pitch olha de cima.
//
// Ângulos (graus), no plano lateral do corpo:
//   membro: 0 = para baixo, 90 = para frente, 180 = para cima, -90 = para trás;
//   torso/cabeça: 0 = em pé, positivo inclina para frente;
//   ombro relativo ao torso; cotovelo e joelho relativos ao segmento anterior; perna e arma absolutos.
// Campos da pose (opcionais; o que faltar vem de `base`):
//   torso, head, armF:[ombro, cotovelo], armB, legF:[quadril, joelho], legB,
//   yaw (giro do corpo todo), twist (giro do tronco sobre o quadril), headYaw (olhar para os lados),
//   feet:[fFrente, fTrás] → pés PLANTADOS (IK 3D; quadril livre), crouch, hipShift, x, lift,
//   weapon, grip/grip2, twoHand, weaponOnBack, lid, frown, potion, seat
// Animação: { loop, impact?, noise?, blink?, keys: [{ t, ease?: 'smooth'|'in'|'out'|'inOut'|'linear'|'hold', pose }] }
//   'smooth' (padrão) = curva Catmull-Rom por todas as poses; noise = microvariações; blink = piscadas.
window.YaraRig = (() => {
    const RAD = Math.PI / 180;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, k) => a + (b - a) * k;
    // vetores 3D [f, y, s]
    const v3 = {
        add: (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k],
        sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
        dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
        len: (a) => Math.hypot(a[0], a[1], a[2]),
        norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
        mix: (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]
    };
    // direção no plano lateral: ângulo de membro (0 = baixo, 90 = frente)
    const down = (deg) => [Math.sin(deg * RAD), Math.cos(deg * RAD), 0];
    const up = (deg) => [Math.sin(deg * RAD), -Math.cos(deg * RAD), 0];
    // gira em torno do eixo vertical que passa por `pivot` (frente vai em direção à câmera)
    const yawAround = (p, deg, pivot = [0, 0, 0]) => {
        const a = deg * RAD, f = p[0] - pivot[0], s = p[2] - pivot[2];
        return [pivot[0] + f * Math.cos(a) - s * Math.sin(a), p[1], pivot[2] + f * Math.sin(a) + s * Math.cos(a)];
    };
    const EASE = {
        linear: (k) => k,
        inOut: (k) => k * k * (3 - 2 * k),
        in: (k) => k * k * k,
        out: (k) => 1 - (1 - k) ** 3,
        hold: () => 0
    };

    // --- AMOSTRAGEM DAS POSES ---
    const catmull = (p0, p1, p2, p3, t) => {
        const t2 = t * t, t3 = t2 * t;
        return .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
    };
    function blend([p0, p1, p2, p3], k, smooth) {
        const out = {};
        for (const key of new Set([...Object.keys(p1), ...Object.keys(p2)])) {
            const v1 = p1[key] ?? p2[key], v2 = p2[key] ?? v1;
            const v0 = p0[key] ?? v1, v3_ = p3[key] ?? v2;
            if (Array.isArray(v1)) out[key] = v1.map((v, i) => (smooth ? catmull(v0[i] ?? v, v, v2[i], v3_[i] ?? v2[i], k) : lerp(v, v2[i], k)));
            else if (typeof v1 === 'number') out[key] = smooth ? catmull(v0, v1, v2, v3_, k) : lerp(v1, v2, k);
            else out[key] = k < .5 ? v1 : v2;
        }
        return out;
    }
    const wobble = (t, seed) => Math.sin(t * 1.31 + seed) * .5 + Math.sin(t * 2.73 + seed * 2.1) * .3 + Math.sin(t * .57 + seed * 3.7) * .2;
    const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

    // Piscadas: uma por ciclo de 4 s em momento sorteado, às vezes dupla; fecha em 60 ms e abre em 110 ms.
    function blinkLid(ms) {
        const cycle = Math.floor(ms / 4000), at = ms - cycle * 4000, start = hash(cycle) * 2600;
        const one = (s) => { const d = at - s; return d < 0 || d > 170 ? 0 : d < 60 ? d / 60 : 1 - (d - 60) / 110; };
        return Math.max(one(start), hash(cycle + 99) > .7 ? one(start + 230) : 0);
    }

    function sample(character, name, ms) {
        const animation = character.animations[name] || character.animations.idle;
        const keys = animation.keys, n = keys.length, total = keys[n - 1].t;
        const time = animation.loop ? ((ms % total) + total) % total : clamp(ms, 0, total);
        let i = 0;
        while (i < n - 2 && time >= keys[i + 1].t) i++;
        const at = (j) => {
            if (animation.loop) { if (j < 0) j += n - 1; if (j > n - 1) j -= n - 1; }
            return { ...character.base, ...keys[clamp(j, 0, n - 1)].pose };
        };
        const a = keys[i], b = keys[Math.min(i + 1, n - 1)];
        const raw = clamp((time - a.t) / Math.max(1, b.t - a.t), 0, 1);
        const ease = a.ease || 'smooth';
        const pose = ease === 'smooth'
            ? blend([at(i - 1), at(i), at(i + 1), at(i + 2)], raw, true)
            : blend([at(i), at(i), at(i + 1), at(i + 1)], EASE[ease](raw), false);
        const fa = at(i).feet, fb = at(i + 1).feet;
        if (fa && fb && ease !== 'hold') pose.footLift = fa.map((x, j) => Math.sin(Math.PI * raw) * Math.min(.07, Math.abs(fb[j] - x) * .9));

        const s = ms / 1000;
        if (animation.noise) {
            const amp = animation.noise;
            pose.breath = (Math.sin(s * Math.PI * 2 / 3.9) + 1) / 2;
            pose.torso += wobble(s * .6, 1) * 1.2 * amp + pose.breath * .8 * amp;
            pose.head += wobble(s * .45, 2) * 3 * amp;
            pose.headYaw = (pose.headYaw || 0) + wobble(s * .3, 8) * 6 * amp;
            pose.twist = (pose.twist || 0) + wobble(s * .35, 9) * 2 * amp;
            pose.hipShift = (pose.hipShift || 0) + wobble(s * .25, 3) * .012 * amp;
            pose.armF = [pose.armF[0] + wobble(s * .7, 4) * 1.5 * amp, pose.armF[1] + wobble(s * .5, 5) * 2 * amp];
            pose.armB = [pose.armB[0] + wobble(s * .8, 6) * 2 * amp + pose.breath * 1.5 * amp, pose.armB[1] + wobble(s * .6, 7) * 3 * amp];
        }
        if (animation.blink) pose.lid = Math.max(pose.lid || 0, blinkLid(ms));
        return pose;
    }

    function duration(character, name) {
        const keys = character.animations[name]?.keys;
        return keys ? keys[keys.length - 1].t : 0;
    }

    // --- ESQUELETO 3D ---
    // IK de dois ossos em 3D; o cotovelo/joelho dobra na direção de `pole`.
    function reach(from, to, a, b, pole) {
        const d = v3.sub(to, from);
        const dist = clamp(v3.len(d), 1e-4, a + b - 1e-4);
        const dn = v3.norm(d);
        const along = (a * a - b * b + dist * dist) / (2 * dist);
        const h = Math.sqrt(Math.max(0, a * a - along * along));
        let p = v3.sub(pole, v3.add([0, 0, 0], dn, v3.dot(pole, dn)));
        p = v3.norm(p);
        const mid = v3.add(v3.add(from, dn, along), p, h);
        return { mid, end: v3.add(mid, v3.norm(v3.sub(to, mid)), b) };
    }

    function solve(character, pose) {
        const P = character.body;
        const J = { pose };
        const planted = Array.isArray(pose.feet);
        const lift = pose.lift || 0;
        const legLen = P.thigh + P.shin;
        const hipY = planted ? -(legLen + P.foot - .006 - (pose.crouch || 0)) - lift : -(legLen + P.foot);
        J.hip = [(pose.x || 0) + (pose.hipShift || 0), hipY, 0];
        const twist = pose.twist || 0;
        const T = (p) => yawAround(p, twist, J.hip);                 // aplica o giro do tronco

        J.torsoUp = up(pose.torso);
        J.neck = T(v3.add(J.hip, J.torsoUp, P.torso + (pose.breath || 0) * .004));
        J.twist = twist;
        J.headYaw = twist + (pose.headYaw || 0);
        J.headPitch = pose.torso + pose.head;
        const headC = v3.add(v3.add(J.hip, J.torsoUp, P.torso), up((pose.torso + J.headPitch) / 2), P.neck + P.head * .42);
        J.head = T(headC);

        const shoulderBase = v3.add(J.hip, J.torsoUp, P.torso - P.shoulderDrop);
        const arm = ([sh, el], side) => {
            const s0 = [shoulderBase[0], shoulderBase[1], side * P.shoulderW];
            const upper = pose.torso + sh;
            const e = v3.add(s0, down(upper), P.upperArm);
            const h = v3.add(e, down(upper + el), P.forearm);
            return { s: T(s0), e: T([e[0], e[1], e[2] + side * .012]), h: T([h[0], h[1], h[2] + side * .006]) };
        };
        J.armF = arm(pose.armF, 1);
        J.armB = arm(pose.armB, -1);

        const leg = (i, [hp, kn], side) => {
            const hip = [J.hip[0], J.hip[1], side * P.hipW];
            if (planted) {
                const target = [pose.feet[i], -P.foot - lift - (pose.footLift?.[i] || 0), side * P.hipW * .85];
                const ik = reach(hip, target, P.thigh, P.shin, [1, 0, side * .15]);
                return { hip, k: ik.mid, a: ik.end };
            }
            const k = v3.add(hip, down(hp), P.thigh);
            return { hip, k, a: v3.add(k, down(hp + kn), P.shin) };
        };
        J.legF = leg(0, pose.legF, 1);
        J.legB = leg(1, pose.legB, -1);

        // arma no plano do tronco; a mão de trás alcança o cabo com IK 3D
        const W = character.weapon;
        const wd = yawAround(down(pose.weapon), twist);
        J.weapon = { dir: wd, side: yawAround([0, 0, 1], twist) };
        J.weapon.butt = v3.add(J.armF.h, wd, -(pose.grip ?? W.grip));
        J.weapon.end = v3.add(J.weapon.butt, wd, W.length);
        if (pose.twoHand && !pose.weaponOnBack) {
            const target = v3.add(J.weapon.butt, wd, pose.grip2 ?? W.grip2);
            const ik = reach(J.armB.s, target, P.upperArm, P.forearm, [0, 1, -.6]);
            J.armB = { ...J.armB, e: ik.mid, h: ik.end };
        }

        if (!planted) {
            const shift = -(Math.max(J.legF.a[1], J.legB.a[1]) + P.foot) - lift;
            const move = (p) => { p[1] += shift; };
            [J.hip, J.neck, J.head, J.weapon.butt, J.weapon.end].forEach(move);
            [J.armF, J.armB].forEach((a) => [a.s, a.e, a.h].forEach(move));
            [J.legF, J.legB].forEach((l) => [l.hip, l.k, l.a].forEach(move));
        }
        [J.legF, J.legB].forEach((l) => {
            l.shin = Math.atan2(l.a[0] - l.k[0], l.a[1] - l.k[1]) / RAD;
            l.grounded = l.a[1] > -P.foot - .012;
        });
        return J;
    }

    // --- MOVIMENTO SECUNDÁRIO (molas) ---
    function springs(state, J, now) {
        if (!state) return { hair: [0, 0], hem: [0, 0], bag: [0, 0] };
        const dt = clamp((now - (state.t ?? now)) / 1000, 0, .05);
        state.t = now;
        const step = (name, anchor, stiff, damp, gain) => {
            const s = state[name] || (state[name] = { p: [0, 0], v: [0, 0], last: [anchor[0], anchor[1]] });
            const moved = [anchor[0] - s.last[0], anchor[1] - s.last[1]];
            s.last = [anchor[0], anchor[1]];
            for (let i = 0; i < 2; i++) {
                s.p[i] -= moved[i] * gain;
                s.v[i] += (-stiff * s.p[i] - damp * s.v[i]) * dt;
                s.p[i] = clamp(s.p[i] + s.v[i] * dt, -.05, .05);
            }
            return s.p;
        };
        return { hair: step('hair', J.head, 70, 9, .9), hem: step('hem', J.hip, 90, 10, .8), bag: step('bag', J.hip, 50, 6, 1) };
    }

    // --- DESENHO ---
    const LIGHT = (() => { const l = Math.hypot(.55, .85); return [.55 / l, -.85 / l]; })();
    function shade(hex, f) {
        const n = parseInt(hex.slice(1), 16);
        const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
            .map((v) => Math.round(clamp(f >= 1 ? v + (255 - v) * (f - 1) : v * f, 0, 255)));
        return `rgb(${c[0]},${c[1]},${c[2]})`;
    }

    function draw(g, character, J, H, sec, view) {
        const C = character.colors, P = character.body, S = character.style;
        const pose = J.pose;
        const yaw = (character.camera?.yaw ?? 28) + (pose.yaw || 0) + (view?.yaw || 0);
        const pitch = (character.camera?.pitch ?? 10) * RAD;
        // projeção: espaço do personagem → tela (x, y) e profundidade z (maior = mais perto da câmera)
        const project = (p) => {
            const r = yawAround(p, yaw);
            return { x: r[0] * H, y: (r[1] * Math.cos(pitch) + r[2] * Math.sin(pitch)) * H, z: r[2] };
        };
        const P2 = (p) => { const q = project(p); return [q.x, q.y]; };
        const depth = (p) => project(p).z;
        const ol = S.outline * H;
        const mid2 = (a, b, k = .5) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

        const lit = (c, size, ramp, dim = 1) => {
            const r = size * H;
            const gr = g.createLinearGradient(c[0] - LIGHT[0] * r, c[1] - LIGHT[1] * r, c[0] + LIGHT[0] * r, c[1] + LIGHT[1] * r);
            gr.addColorStop(0, shade(ramp[0], dim));
            gr.addColorStop(.42, shade(ramp[1], dim));
            gr.addColorStop(.78, shade(ramp[1], dim));
            gr.addColorStop(1, shade(ramp[2], dim));
            return gr;
        };
        const smooth2 = (p) => {
            g.moveTo(...mid2(p[p.length - 1], p[0]));
            p.forEach((q, i) => g.quadraticCurveTo(q[0], q[1], ...mid2(q, p[(i + 1) % p.length])));
            g.closePath();
        };
        const fillPath = (pts, fill, ramp, dim = 1) => {
            g.beginPath(); smooth2(pts);
            g.fillStyle = fill; g.fill();
            g.strokeStyle = shade(ramp[0], .55 * dim); g.lineWidth = ol; g.stroke();
        };
        const centerOf = (pts) => pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
        const line2 = (a, b, color, w) => { g.strokeStyle = color; g.lineWidth = w; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); };
        const curve2 = (a, c, b, color, w) => { g.strokeStyle = color; g.lineWidth = w; g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(...c, ...b); g.stroke(); };

        // cilindro (membro) pela tela: eixo projetado + larguras (cilindro não muda de largura ao girar)
        const tube = (axis3, widths, ramp, dim = 1) => {
            const axis = axis3.map(P2);
            const left = [], right = [];
            axis.forEach((p, i) => {
                const a = axis[Math.max(0, i - 1)], b = axis[Math.min(axis.length - 1, i + 1)];
                let n = [-(b[1] - a[1]), b[0] - a[0]];
                const l = Math.hypot(n[0], n[1]) || 1; n = [n[0] / l, n[1] / l];
                const w = widths[i] * H / 2;
                left.push([p[0] + n[0] * w, p[1] + n[1] * w]);
                right.push([p[0] - n[0] * w, p[1] - n[1] * w]);
            });
            const pts = [...left, ...right.reverse()];
            fillPath(pts, lit(centerOf(axis), Math.max(...widths) * .9, ramp, dim), ramp, dim);
            return axis;
        };
        const along = v3.mix;
        const parts = [];                                  // { z, draw } → ordenado por profundidade
        const part = (z, fn) => parts.push({ z, fn });

        // --- pernas e botas ---
        const legPart = (l, back) => {
            const dim = back ? .8 : 1;
            const bootTop = along(l.a, l.k, P.bootHeight / P.shin);
            part(depth(l.k) - .001, () => {
                tube([l.hip, along(l.hip, l.k, .45), l.k, along(l.k, l.a, .3), bootTop],
                    [P.thighW[0], P.thighW[1], P.kneeW, P.calfW, P.bootW * .95], C.pants, dim);
                const k = P2(l.k), a = P2(along(l.k, l.a, .15));
                curve2([k[0] - P.kneeW * .3 * H, k[1]], [k[0] - P.kneeW * .05 * H, k[1] + .01 * H], a, shade(C.pants[0], .7 * dim), ol * .8);
                tube([bootTop, along(bootTop, l.a, .5), l.a], [P.bootW, P.bootW * .95, P.bootW * .9], C.boot, dim);
                // pé: perfil da bota no plano do corpo, com largura; plano no chão, inclinado no ar
                const tilt = l.grounded ? 0 : clamp(-l.shin * (l.shin < 0 ? .6 : .3), -25, 40) * RAD;
                const F = P.footLength, f = P.foot;
                const local = (x, y, z = 0) => {
                    const c = Math.cos(tilt), s = Math.sin(tilt);
                    return [l.a[0] + x * c - y * s, l.a[1] + x * s + y * c, l.a[2] + z];
                };
                const w = P.bootW * .45;
                const top = [local(-.03, -.012, -w), local(.03, -.008, -w), local(F * .9, .015, -w * .8), local(F, .03, 0), local(F * .9, .015, w * .8), local(.03, -.008, w), local(-.03, -.012, w)];
                const bottom = [local(-.035, f, w), local(F * .95, f, w * .8), local(F * 1.0, f * .7, 0), local(F * .95, f, -w * .8), local(-.035, f, -w)];
                const outline = [...top, ...bottom].map(P2);
                // contorno convexo simples: ordena em volta do centro
                const c = centerOf(outline);
                outline.sort((p, q) => Math.atan2(p[1] - c[1], p[0] - c[0]) - Math.atan2(q[1] - c[1], q[0] - c[0]));
                fillPath(outline, lit(c, F * .55, C.boot, dim), C.boot, dim);
                const sole = [local(-.036, f * .72, w), local(F * .98, f * .72, w * .8), local(F * .96, f, w * .8), local(-.035, f, w)].map(P2);
                g.fillStyle = shade(C.sole, dim);
                g.beginPath(); sole.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.closePath(); g.fill();
            });
        };
        legPart(J.legB, true);
        legPart(J.legF, false);

        // --- braços e mãos ---
        const fist = (a, dim) => {
            const e = P2(a.e), h = P2(a.h);
            let d = [h[0] - e[0], h[1] - e[1]];
            const l = Math.hypot(d[0], d[1]) || 1; d = [d[0] / l, d[1] / l];
            const n = [-d[1], d[0]];
            const c = [h[0] + d[0] * P.hand * .45 * H, h[1] + d[1] * P.hand * .45 * H];
            const at = (x, y) => [c[0] + d[0] * x * P.hand * H + n[0] * y * P.handW * H, c[1] + d[1] * x * P.hand * H + n[1] * y * P.handW * H];
            fillPath([at(-.5, .45), at(.35, .5), at(.58, 0), at(.35, -.55), at(-.5, -.45)], lit(c, P.hand * .6, C.skin, dim), C.skin, dim);
            for (let i = 1; i <= 2; i++) line2(at(.1 + i * .13, -.5), at(.1 + i * .13, -.15), shade(C.skin[0], .75 * dim), ol * .7);
            g.beginPath(); g.ellipse(...at(.05, .45), P.handW * .24 * H, P.handW * .14 * H, Math.atan2(d[1], d[0]), 0, Math.PI * 2);
            g.fillStyle = shade(C.skin[1], dim); g.fill(); g.strokeStyle = shade(C.skin[0], .55 * dim); g.lineWidth = ol; g.stroke();
        };
        const armPart = (a, back, withFist) => {
            const dim = back ? .8 : 1;
            part(depth(a.e), () => {
                const axis = tube([a.s, along(a.s, a.e, .5), a.e, along(a.e, a.h, .45), a.h],
                    [P.upperArmW[0], P.upperArmW[1], P.elbowW, P.forearmW, P.wristW], C.jacket, dim);
                const e = axis[2], h = axis[4];
                let d = [h[0] - e[0], h[1] - e[1]]; const l = Math.hypot(...d) || 1; d = [d[0] / l, d[1] / l];
                const cuff = [h[0] - d[0] * .014 * H, h[1] - d[1] * .014 * H], n = [-d[1] * P.wristW * .55 * H, d[0] * P.wristW * .55 * H];
                line2([cuff[0] + n[0], cuff[1] + n[1]], [cuff[0] - n[0], cuff[1] - n[1]], shade(C.jacket[0], .8 * dim), ol * 1.2);
                if (withFist) fist(a, back ? .84 : 1);
            });
        };
        const handOnHandle = pose.twoHand && !pose.weaponOnBack;
        armPart(J.armB, true, !handOnHandle && !pose.potion);
        armPart(J.armF, false, true);
        if (handOnHandle) part(depth(J.armB.h) + .02, () => fist(J.armB, .86));
        if (pose.potion) part(depth(J.armB.h) + .02, () => {
            fist(J.armB, .86);
            const h = P2(J.armB.h);
            g.beginPath(); g.ellipse(h[0], h[1] - .035 * H, .022 * H, .026 * H, 0, 0, Math.PI * 2);
            g.fillStyle = lit([h[0], h[1] - .035 * H], .03, C.potion); g.fill(); g.strokeStyle = shade(C.potion[0], .6); g.lineWidth = ol; g.stroke();
            g.fillStyle = shade(C.wood[1], 1); g.fillRect(h[0] - .007 * H, h[1] - .08 * H, .014 * H, .022 * H);
        });

        // --- tronco: seções ovais empilhadas (cintura → ombros), com giro e respiração ---
        const torsoSection = (u, a, b, off = 0) => {
            const k = clamp(u / P.torso, 0, 1);
            const ang = J.twist * k;
            const center = yawAround(v3.add(v3.add(J.hip, J.torsoUp, u), [off, 0, 0]), ang, J.hip);
            return { center, a, b, yaw: ang };
        };
        const ringPoint = (sc, theta) => {     // theta: 0 = frente, 90 = lado da câmera; anel perpendicular ao tronco
            const l = pose.torso * RAD, ca = sc.a * Math.cos(theta * RAD);
            const off = yawAround([Math.cos(l) * ca, Math.sin(l) * ca, sc.b * Math.sin(theta * RAD)], sc.yaw);
            return v3.add(sc.center, off);
        };
        const silhouette = (secs) => {
            const left = [], right = [];
            secs.forEach((sc) => {
                const pts = [];
                for (let t = 0; t < 360; t += 15) pts.push(P2(ringPoint(sc, t)));
                const c = P2(sc.center);
                const axis = P2(v3.add(sc.center, J.torsoUp, .05));
                let n = [-(axis[1] - c[1]), axis[0] - c[0]]; const l = Math.hypot(...n) || 1; n = [n[0] / l, n[1] / l];
                let lo = Infinity, hi = -Infinity;
                pts.forEach((p) => { const d = (p[0] - c[0]) * n[0] + (p[1] - c[1]) * n[1]; lo = Math.min(lo, d); hi = Math.max(hi, d); });
                left.push([c[0] + n[0] * lo, c[1] + n[1] * lo]);
                right.push([c[0] + n[0] * hi, c[1] + n[1] * hi]);
            });
            return [...left, ...right.reverse()];
        };
        const breath = 1 + (pose.breath || 0) * .05;
        const hemU = (P.torsoShape?.[0]?.[0] ?? -.37) * P.torso;
        // seções do tronco vindas do personagem: [altura (fração do torso; negativo = barra), meia-profundidade, meia-largura]
        const shape = P.torsoShape || [[-.37, .075, .1], [0, .066, .095], [.35, .062, .088], [.65, .078, .102], [.9, .06, .112], [1, .03, .05]];
        const sections = shape.map(([u, a, b], i) => torsoSection(u * P.torso, a * (i === 3 ? breath : 1), b * (i === 3 ? breath : 1)));
        // barra da jaqueta com mola
        const hemSpring = [sec.hem[0], sec.hem[1], 0];
        sections[0].center = v3.add(sections[0].center, hemSpring, .7);
        const visible = (sc, t) => {
            const p = ringPoint(sc, t), c = sc.center;
            return depth(p) - depth(c) > -0.004;
        };
        const surfaceLine = (from, to, steps, color, width) => {          // linha sobre a superfície visível
            g.strokeStyle = color; g.lineWidth = width; g.beginPath();
            let pen = false;
            for (let i = 0; i <= steps; i++) {
                const k = i / steps;
                const sc = torsoSection(lerp(from[0], to[0], k), lerp(from[2], to[2], k), lerp(from[3], to[3], k));
                const t = lerp(from[1], to[1], k);
                if (!visible(sc, t)) { pen = false; continue; }
                const p = P2(ringPoint(sc, t));
                if (pen) g.lineTo(...p); else { g.moveTo(...p); pen = true; }
            }
            g.stroke();
        };
        part(0, () => {
            const outline = silhouette(sections);
            const c = P2(sections[3].center);
            fillPath(outline, lit(c, P.torso * .55, C.jacket), C.jacket);
            g.save();
            g.beginPath(); smooth2(outline); g.clip();
            // lado oposto à câmera mais escuro (plano lateral)
            const far = P2(ringPoint(sections[3], -100)), near = P2(ringPoint(sections[3], 80));
            const side = g.createLinearGradient(...far, ...near);
            side.addColorStop(0, 'rgba(0,0,0,.32)'); side.addColorStop(.5, 'rgba(0,0,0,0)');
            g.fillStyle = side; g.fillRect(-3 * H, -3 * H, 6 * H, 6 * H);
            // abotoadura (linha da frente), dobras e emblema
            surfaceLine([P.torso * .92, 8, .06, .11], [hemU * .9, 8, .075, .1], 12, shade(C.jacket[0], .72), ol * .9);
            surfaceLine([.02, 30, .066, .095], [.12, 45, .062, .088], 4, shade(C.jacket[0], .85), ol);
            surfaceLine([.02, -20, .066, .095], [.12, -35, .062, .088], 4, shade(C.jacket[0], .85), ol);
            const em = torsoSection(P.torso * .62, .078, .102);
            if (visible(em, 40)) {
                const p = P2(ringPoint(em, 40));
                g.strokeStyle = shade(C.jacket[0], .8); g.lineWidth = ol; g.beginPath(); g.arc(...p, .014 * H, 0, Math.PI * 2); g.stroke();
            }
            g.restore();
            // cinto: anel na cintura, só a metade visível
            const belt = torsoSection(.03, .07, .1);
            const beltPts = [];
            for (let t = -180; t <= 180; t += 10) if (visible(belt, t)) beltPts.push(P2(ringPoint(belt, t)));
            if (beltPts.length > 1) {
                g.lineCap = 'butt';
                [[shade(C.belt[0], .6), P.belt * H + ol * 2], [lit(c, .1, C.belt), P.belt * H]].forEach(([col, w]) => {
                    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); beltPts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.stroke();
                });
                g.lineCap = 'round';
                if (visible(belt, 25)) {
                    const b = P2(ringPoint(belt, 25));
                    g.fillStyle = lit(b, .02, C.buckle); g.fillRect(b[0] - P.belt * .45 * H, b[1] - P.belt * .55 * H, P.belt * .9 * H, P.belt * 1.1 * H);
                    g.strokeStyle = shade(C.buckle[0], .6); g.lineWidth = ol; g.strokeRect(b[0] - P.belt * .45 * H, b[1] - P.belt * .55 * H, P.belt * .9 * H, P.belt * 1.1 * H);
                }
            }
            // alça de couro: ombro do lado da câmera → quadril do lado oposto, passando pelo peito
            surfaceLine([P.torso * .95, 70, .06, .112], [.06, -50, .066, .095], 14, shade(C.strap[0], .6), P.strap * H + ol * 1.6);
            surfaceLine([P.torso * .95, 70, .06, .112], [.06, -50, .066, .095], 14, lit(c, .1, C.strap), P.strap * H);
            // gola
            const neck = sections[5];
            const collar = [0, 60, 120, 180, 240, 300].map((t) => P2(ringPoint({ ...neck, a: .045, b: .06 }, t)));
            fillPath(collar, lit(P2(neck.center), .03, C.jacket), C.jacket);
        });

        // --- bolsa na cintura (atrás, do lado oposto) ---
        part(depth(ringPoint(torsoSection(.02, .07, .1), -150)), () => {
            const base = ringPoint(torsoSection(.02, .085, .11), -150);
            const c = P2(base);
            const w = P.bag[0] * H, h = P.bag[1] * H;
            const bx = c[0] + sec.bag[0] * H * .8, by = c[1] + sec.bag[1] * H * .8;
            fillPath([[bx - w * .45, by - h * .5], [bx + w * .4, by - h * .5], [bx + w * .5, by + h * .45], [bx - w * .5, by + h * .5]], lit([bx, by], P.bag[0] * .7, C.bag), C.bag);
            fillPath([[bx - w * .5, by - h * .52], [bx + w * .45, by - h * .52], [bx + w * .48, by - h * .05], [bx - w * .52, by - h * .02]], lit([bx, by - h * .3], P.bag[0] * .5, C.bag, .9), C.bag, .9);
        });

        // --- arma ---
        const weaponPart = () => {
            const W = character.weapon;
            let butt = J.weapon.butt, end = J.weapon.end, dir = J.weapon.dir, side = pose.blade ?? 1;
            if (pose.weaponOnBack) {
                dir = yawAround(up(pose.torso - 38), J.twist);
                butt = v3.add(ringPoint(torsoSection(-.02, .085, .02), 180), dir, -.05);
                end = v3.add(butt, dir, W.length);
                side = -1;
            }
            // lâmina no plano do golpe: perpendicular ao cabo, dentro do plano lateral do tronco
            const flat = yawAround(dir, -J.twist);
            const nrm = yawAround([-flat[1], flat[0], 0], J.twist);
            const z = (depth(butt) + depth(end)) / 2 + (pose.weaponOnBack ? -.2 : .01);
            part(z, () => {
                const bend = v3.add(v3.mix(butt, end, .5), nrm, .008 * side);
                tube([butt, along(butt, bend, .5), bend, along(bend, end, .5), end],
                    [W.handleW * 1.25, W.handleW, W.handleW * .95, W.handleW * .9, W.handleW], C.wood);
                const s = W.head;
                const o = v3.add(end, dir, -s * .25);
                // a lâmina tem espessura: a face fica de frente para a câmera conforme o giro
                const at = (x, y) => P2(v3.add(v3.add(o, dir, x * s), nrm, y * s * side));
                const blade = [at(.45, -.32), at(.5, .25), at(.62, .85), at(.55, 1.25), at(-.1, 1.2), at(-.55, 1.25), at(-.45, .8), at(-.32, .25), at(-.35, -.35)];
                fillPath(blade, lit(at(0, .5), s, C.steel), C.steel);
                curve2(at(.5, 1.1), at(-.05, 1.32), at(-.48, 1.12), C.steel[2], Math.max(1, s * .14 * H));
                curve2(at(.4, .85), at(-.05, .95), at(-.38, .82), shade(C.steel[0], .9), ol);
                g.beginPath(); g.arc(...at(0, 0), W.handleW * .6 * H, 0, Math.PI * 2);
                g.fillStyle = shade(C.wood[1], 1); g.fill(); g.strokeStyle = shade(C.wood[0], .55); g.lineWidth = ol; g.stroke();
            });
        };
        weaponPart();

        // --- pescoço e cabeça (esfera com rosto em 3/4) ---
        part(depth(J.neck) + .005, () => {
            tube([J.neck, v3.mix(J.neck, J.head, .55)], [P.neckW, P.neckW * .9], C.skin, .86);
        });
        part(depth(J.head) + .03, () => {
            const R = P.head * .5;
            const pitchH = J.headPitch * RAD;
            // ponto da cabeça: f/s/y locais (unidades do raio) → espaço do personagem
            const hp = (f, y, s) => {
                const c = Math.cos(pitchH), sn = Math.sin(pitchH);
                const f2 = f * c - y * sn, y2 = f * sn + y * c;
                return v3.add(J.head, yawAround([f2 * R, y2 * R, s * R], J.headYaw));
            };
            const facing = (f, y, s) => depth(hp(f * 1.2, y * 1.2, s * 1.2)) - depth(hp(f, y, s));   // >0 = virado para a câmera
            const hc = P2(J.head);
            const hair = sec.hair;
            const rx = R * H * .98, ry = R * H * 1.12;
            // volume do cabelo atrás
            const back = P2(hp(-.35, -.15, 0));
            g.beginPath(); g.ellipse(back[0] + hair[0] * H * .5, back[1] + hair[1] * H * .5, rx * 1.02, ry * .98, 0, 0, Math.PI * 2);
            g.fillStyle = lit(back, R * 1.2, C.hair); g.fill(); g.strokeStyle = shade(C.hair[0], .55); g.lineWidth = ol; g.stroke();
            // crânio + mandíbula (contorno feito antes do preenchimento para não marcar a emenda)
            const jaw = [hp(-.1, .55, -.72), hp(.45, .55, -.55), hp(.78, .82, -.2), hp(.82, .95, 0), hp(.78, .82, .2), hp(.45, .55, .55), hp(-.1, .55, .72), hp(-.2, .1, 0)].map(P2);
            const skull = () => g.ellipse(hc[0], hc[1], rx, ry, 0, 0, Math.PI * 2);
            g.strokeStyle = shade(C.skin[0], .55); g.lineWidth = ol * 2;
            g.beginPath(); skull(); g.stroke();
            g.beginPath(); smooth2(jaw); g.stroke();
            const skin = lit(hc, R * 1.3, C.skin);
            g.fillStyle = skin;
            g.beginPath(); skull(); g.fill();
            g.beginPath(); smooth2(jaw); g.fill();
            g.save();
            g.beginPath(); skull(); smooth2(jaw); g.clip();
            const glow = (p, r, color) => {
                const gr = g.createRadialGradient(...p, 0, ...p, r * H);
                gr.addColorStop(0, color); gr.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
                g.fillStyle = gr; g.fillRect(-3 * H, -3 * H, 6 * H, 6 * H);
            };
            glow(P2(hp(-.2, .3, -.9)), R * 1.3, 'rgba(100,50,30,.38)');       // lado oposto e mandíbula
            glow(P2(hp(.55, .35, .45)), R * .35, 'rgba(225,110,90,.22)');     // bochecha
            glow(P2(hp(.6, -.45, .2)), R * .45, 'rgba(255,236,212,.28)');     // testa
            g.restore();
            // orelhas (só a que está virada para a câmera)
            [1, -1].forEach((sd) => {
                if (facing(0, .1, sd) <= 0) return;
                const e = P2(hp(-.05, .12, sd * .98));
                g.beginPath(); g.ellipse(e[0], e[1], R * .2 * H, R * .3 * H, 0, 0, Math.PI * 2);
                g.fillStyle = lit(e, R * .3, C.skin, .95); g.fill(); g.strokeStyle = shade(C.skin[0], .55); g.lineWidth = ol; g.stroke();
                curve2([e[0] - R * .05 * H, e[1] - R * .12 * H], [e[0] - R * .12 * H, e[1]], [e[0] - R * .04 * H, e[1] + R * .14 * H], shade(C.skin[0], .7), ol * .8);
            });
            // olhos: dois, cada um some e se achata conforme vira para longe
            const lid = clamp(pose.lid || 0, 0, 1), frown = pose.frown || 0;
            [1, -1].forEach((sd) => {
                const f = facing(.85, -.05, sd * .5);
                if (f <= .002) return;
                const squash = clamp(f * 9, .25, 1);
                const c = P2(hp(.86, -.06, sd * .42));
                const w = R * .3 * H * squash, h = R * .15 * H;
                g.save();
                g.beginPath(); g.moveTo(c[0] - w, c[1]); g.quadraticCurveTo(c[0], c[1] - h * 1.4, c[0] + w, c[1] - h * .2); g.quadraticCurveTo(c[0], c[1] + h * .9, c[0] - w, c[1]);
                g.fillStyle = '#efe8df'; g.fill(); g.clip();
                const iris = P2(hp(.95, -.07, sd * .42 + .08));
                g.fillStyle = C.iris; g.beginPath(); g.ellipse(iris[0], iris[1], h * .62 * squash, h * .7, 0, 0, Math.PI * 2); g.fill();
                g.fillStyle = '#120c08'; g.beginPath(); g.ellipse(iris[0], iris[1], h * .3 * squash, h * .32, 0, 0, Math.PI * 2); g.fill();
                g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(iris[0] - h * .3, iris[1] - h * .35, h * .22, 0, Math.PI * 2); g.fill();
                if (lid > 0) { g.fillStyle = shade(C.skin[1], .95); g.fillRect(c[0] - w * 1.2, c[1] - h * 1.5, w * 2.4, h * 2.4 * lid); }
                g.restore();
                curve2([c[0] - w, c[1] + h * lid * .5], [c[0], c[1] - h * 1.4 + h * 2 * lid], [c[0] + w, c[1] - h * .2 + h * .6 * lid], '#1b120c', ol * 1.1);
                // sobrancelha
                const b0 = P2(hp(.86, -.32, sd * .62)), b1 = P2(hp(.93, -.34 + frown * .06, sd * .22));
                curve2(b0, [(b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2 - h * .5], b1, shade(C.hair[0], 1), R * .08 * H);
            });
            // nariz: ponte → ponta → asa (a lateral visível depende do giro)
            const n0 = P2(hp(.97, -.12, 0)), n1 = P2(hp(1.2, .3, 0)), n2 = P2(hp(.98, .38, 0)), n3 = P2(hp(.95, .36, .2));
            g.beginPath(); g.moveTo(...n0); g.quadraticCurveTo(n1[0], n0[1] + (n1[1] - n0[1]) * .7, ...n1); g.quadraticCurveTo(n2[0], n1[1], ...n2); g.lineTo(...n3); g.closePath();
            g.fillStyle = lit(n1, R * .4, C.skin, .97); g.fill();
            curve2(n0, [n1[0], n0[1] + (n1[1] - n0[1]) * .7], n1, shade(C.skin[0], .65), ol * .9);
            curve2(n1, [n2[0], n1[1]], n2, shade(C.skin[0], .6), ol);
            // boca
            const m0 = P2(hp(.9, .62, -.25)), m1 = P2(hp(.97, .63 + frown * .03, 0)), m2 = P2(hp(.9, .62, .25));
            curve2(m0, m1, m2, shade(C.skin[0], .6), ol * 1.1);
            // cabelo: calota acima da linha do cabelo (testa alta na frente, nuca baixa atrás)
            const hairline = [];
            for (let a = -180; a <= 180; a += 12) {
                const r = a * RAD;
                const front = Math.cos(r);                          // 1 = frente
                const yline = front > .5 ? lerp(-.35, -.55, (front - .5) * 2) : lerp(.55, -.35, (front + 1) / 1.5);
                const k = Math.sqrt(Math.max(0, 1 - yline * yline));
                hairline.push({ p: hp(Math.cos(r) * k, yline, Math.sin(r) * k), a });
            }
            // só o trecho VISÍVEL da linha do cabelo, em ordem; acima dele (dentro do crânio) é cabelo
            const vis = hairline.map(({ p }) => facing(...[(p[0] - J.head[0]), 0, 0]) * 0 + depth(p) - depth(J.head) > -R * .05);
            let startAt = vis.findIndex((v, i) => v && !vis[(i - 1 + vis.length) % vis.length]);
            if (startAt < 0) startAt = 0;
            const arc = [];
            for (let i = 0; i < hairline.length; i++) {
                const j = (startAt + i) % hairline.length;
                if (!vis[j]) break;
                arc.push(P2(hairline[j].p));
            }
            g.save();
            const hairShell = () => g.ellipse(hc[0] - rx * .04, hc[1] - ry * .05, rx * 1.12, ry * 1.1, 0, 0, Math.PI * 2);
            g.beginPath(); hairShell(); g.clip();
            if (arc.length > 1) {
                const first = arc[0], last = arc[arc.length - 1];
                const out = Math.sign(last[0] - first[0]) || 1;
                const top = hc[1] - ry * 3;
                g.beginPath();
                arc.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p)));
                g.lineTo(last[0] + out * rx * 3, last[1]); g.lineTo(last[0] + out * rx * 3, top);
                g.lineTo(first[0] - out * rx * 3, top); g.lineTo(first[0] - out * rx * 3, first[1]);
                g.closePath();
                g.fillStyle = lit([hc[0], hc[1] - ry * .4], R * 1.3, C.hair); g.fill();
                g.save(); g.clip(); g.beginPath(); hairShell(); g.strokeStyle = shade(C.hair[0], .55); g.lineWidth = ol * 2; g.stroke(); g.restore();
                // fios ao longo da linha do cabelo
                g.strokeStyle = shade(C.hair[0], .8); g.lineWidth = ol * .8;
                g.beginPath(); arc.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.stroke();
            }
            g.restore();
            // mechas da franja e do topo (com mola), no espaço da tela em volta da cabeça
            const tuft = (base3, tip3, w, k = 1) => {
                const b = P2(base3), t0 = P2(tip3);
                const t = [t0[0] + hair[0] * H * k, t0[1] + hair[1] * H * k];
                const d = [t[0] - b[0], t[1] - b[1]], l = Math.hypot(...d) || 1, n = [-d[1] / l * w * H, d[0] / l * w * H];
                const pts = [[b[0] + n[0], b[1] + n[1]], [(b[0] + t[0]) / 2 + n[0] * .6, (b[1] + t[1]) / 2 + n[1] * .6], t, [(b[0] + t[0]) / 2 - n[0] * .5, (b[1] + t[1]) / 2 - n[1] * .5], [b[0] - n[0], b[1] - n[1]]];
                g.beginPath(); smooth2(pts); g.fillStyle = lit(b, R, C.hair); g.fill();
                g.strokeStyle = shade(C.hair[0], .75); g.lineWidth = ol * .7;
                g.beginPath(); g.moveTo(...b); g.quadraticCurveTo((b[0] + t[0]) / 2 + n[0] * .3, (b[1] + t[1]) / 2 + n[1] * .3, ...t); g.stroke();
            };
            tuft(hp(.45, -.85, .25), hp(.05, -1.12, .35), R * .38, 1.1);    // volume do topo, penteado para trás
            tuft(hp(-.1, -.95, .1), hp(-.6, -1.02, .2), R * .4, 1.2);
            tuft(hp(.7, -.65, .35), hp(1.02, -.3, .5), R * .26, .8);       // franja caindo na testa
            tuft(hp(.78, -.6, .05), hp(1.06, -.25, .12), R * .24, .7);
            tuft(hp(-.85, -.3, .3), hp(-1.1, .2, .35), R * .3, 1.4);       // nuca
            // brilho
            const s0 = P2(hp(-.4, -.8, .3)), s1 = P2(hp(.1, -.98, .3)), s2 = P2(hp(.55, -.78, .35));
            curve2(s0, s1, s2, C.hair[2], ol * 1.3);
        });

        // --- toco (descanso) ---
        if (pose.seat) part(-1, () => {
            const c = P2([J.hip[0] - .03, -.1, 0]);
            g.beginPath(); g.ellipse(c[0], c[1], .12 * H, .1 * H, 0, 0, Math.PI * 2);
            g.fillStyle = lit(c, .1, C.wood, .8); g.fill(); g.strokeStyle = shade(C.wood[0], .5); g.lineWidth = ol; g.stroke();
        });

        g.lineJoin = 'round'; g.lineCap = 'round';
        parts.sort((a, b) => a.z - b.z).forEach((p) => p.fn());
        return project;
    }

    // Desenha com os pés em (x, gy), altura H px.
    // opts: flip, alpha, tint (0–1 vermelho), glow (0–1 laranja), state (molas), yaw (giro extra da câmera)
    let buffer = null;
    function render(g, character, pose, x, gy, H, opts = {}) {
        const J = solve(character, pose);
        const sec = springs(opts.state, J, performance.now());
        const size = Math.ceil(H * 2.6);
        if (!buffer) buffer = document.createElement('canvas');
        if (buffer.width !== size) { buffer.width = size; buffer.height = size; }
        const b = buffer.getContext('2d');
        b.setTransform(1, 0, 0, 1, 0, 0);
        b.clearRect(0, 0, size, size);
        b.translate(size / 2, size * .84);
        const project = draw(b, character, J, H, sec, opts);
        if (opts.tint) {
            b.setTransform(1, 0, 0, 1, 0, 0);
            b.globalCompositeOperation = 'source-atop';
            b.fillStyle = `rgba(255,50,50,${opts.tint * .4})`;
            b.fillRect(0, 0, size, size);
            b.globalCompositeOperation = 'source-over';
        }
        g.save();
        g.globalAlpha = opts.alpha ?? 1;
        g.translate(x, gy);
        if (opts.flip) g.scale(-1, 1);
        const air = clamp(1 - (pose.lift || 0) * 4, .3, 1);
        const hx = project([J.hip[0], 0, 0]).x;
        const shadow = g.createRadialGradient(hx, 0, 0, hx, 0, H * .24);
        shadow.addColorStop(0, `rgba(0,0,0,${.5 * air})`); shadow.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = shadow;
        g.beginPath(); g.ellipse(hx, 0, H * .24 * air, H * .06, 0, 0, Math.PI * 2); g.fill();
        if (opts.glow) { g.shadowColor = `rgba(255,140,60,${opts.glow})`; g.shadowBlur = 22 * opts.glow; }
        g.drawImage(buffer, -size / 2, -size * .84);
        g.restore();
        J.project = project;
        return J;
    }

    return { sample, duration, solve, draw, render, EASE };
})();
