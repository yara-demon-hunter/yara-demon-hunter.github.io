// --- HERÓI 2.5D DO PALCO ---
// Cópia adaptada do boneco do Last Torch (last_torch/js/render/player25d.js e o estado de animação de player.js).
// O herói é um boneco 3D simples: pernas, tronco, braços, capuz (ou a cabeça do Azael), capa e espada. Cada peça é
// projetada pela câmera (inclinada, olhando um pouco de cima) e desenhada na ordem da profundidade.
// Fora do Last Torch ficaram a adaga, os Juramentos e as skills; entraram as posturas do RPG (aparo, poção, derrota).
// Coordenadas locais: a = frente, b = direita, z = altura. Medidas e cores: js/data/visuals/hero25d.js.
// Script clássico: expõe window.YaraStage25D.hero { createAnim, updateAnim, startSwing, render }.
(() => {
    const NS = window.YaraStage25D = window.YaraStage25D || {};
    const VIS = window.YaraRpgData.visuals.hero25d;
    const H = VIS.hero;
    const V = VIS.body;
    const AZ = VIS.azael;
    const { drawGlow, easeOutCubic, easeOutQuad, lerpAngle, clamp } = NS.fx;
    const AZP = NS.azael;
    const YA = VIS.yara;
    const YP = NS.yara;
    const ZE = VIS.zeph;
    const ZP = NS.zeph;
    const OS = VIS.oskar;
    const OP = NS.oskar;

    // Estado do boneco sendo desenhado (render troca antes de montar as peças)
    let ctx = null;
    let C = H.colors;
    let anim = null;
    let azael = false;
    // Boneco da Yara (js/stage/yara25d.js): cabeça, cachecol, braços, pernas, tronco e espada curta próprios
    let yara = false;
    // Boneco do Zeph (js/stage/zeph25d.js): cabeça, jaqueta, bolsa, braços, pernas e adaga próprios
    let zeph = false;
    // Boneco do Oskar (js/stage/oskar25d.js): maior, barba, regata, machado de duas lâminas nas duas mãos
    let oskar = false;
    let bladeLength = V.bladeLength;
    let bladeWidth = V.bladeWidth;
    // Câmera: quanto 1 unidade de altura sobe na tela e o achatamento do chão
    let HS = V.heightScale;
    let GS = V.groundSquash;
    // Direção do herói no quadro atual
    let cosF = 1;
    let sinF = 0;

    // Ponto local (a, b, z) → tela, e a profundidade (maior = mais perto da câmera, desenha por cima)
    function project(a, b, z) {
        const gx = a * cosF - b * sinF;
        const gy = a * sinF + b * cosF;
        return { x: gx, y: gy * GS - z * HS, depth: gy + z * V.depthHeightWeight };
    }

    // Mesmo que project, para direções (sem posição)
    function projectVec(a, b, z) {
        return { x: a * cosF - b * sinF, y: (a * sinF + b * cosF) * GS - z * HS };
    }

    // Disco plano no 3D (centro + dois eixos locais): cria o caminho da elipse projetada
    function disk(center, u, v) {
        const c = project(...center);
        const pu = projectVec(...u);
        const pv = projectVec(...v);
        ctx.save();
        ctx.transform(pu.x, pu.y, pv.x, pv.y, c.x, c.y);
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.restore();
    }

    // Esfera: vira uma elipse um pouco mais alta que larga por causa da inclinação da câmera
    function ball(p, radius, color) {
        const s = project(...p);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, radius, radius * Math.hypot(GS, HS), 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Membro (perna, braço): linha grossa passando pelas juntas
    function limb(points, width, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        points.forEach((p, i) => {
            const s = project(...p);
            if (i === 0) ctx.moveTo(s.x, s.y);
            else ctx.lineTo(s.x, s.y);
        });
        ctx.stroke();
    }

    // Meia-largura na tela de uma seção elíptica (A frente, B lados) virada para a direção atual
    function sectionHalfWidth(A, B) {
        return Math.hypot(A * cosF, B * sinF);
    }

    const norm3 = (v) => { const l = Math.hypot(...v) || 1; return v.map(x => x / l); };
    const add3 = (p, q) => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    const norm = (v) => {
        const l = Math.hypot(...v) || 1;
        return v.map(x => x / l);
    };

    // --- ESTADO DA ANIMAÇÃO ---
    // Só visual. O palco move o boneco e diz a velocidade (vx, vy em px/s na escala do Last Torch) e para onde
    // ele olha (face); daqui saem a corrida, a passada, o atraso da capa e o golpe.
    function createAnim(facing = 0) {
        return {
            velX: 0,
            velY: 0,
            speed: 0,
            run: 0,             // 0 a 1, suavizado
            stride: 0,
            facing,
            turnRate: 0,
            capeX: 0,           // atraso da capa (local)
            capeY: 0,
            swingActive: false,
            swingElapsed: 0,
            swingFrom: 0,
            swingTo: 0,
            swingSeconds: 0.2,
            swingBlend: 0,
            dash: 0,            // 0 a 1: pose do dash
            vigil: 0,           // 0 a 1: ajoelhado
            // Pontas fixas da barra da capa (sorteadas uma vez, para o rasgado não "tremer")
            capeJag: Array.from({ length: H.capeStrips + 1 }, (_, i) => (i % 2 === 0 ? 1 : 0.58 + Math.random() * 0.2))
        };
    }

    // body: { vx, vy, face, dashing, kneeling }
    function updateAnim(a, body, dt) {
        if (dt <= 0) return;
        const k = Math.min(1, dt * H.speedSmoothing);
        a.velX += (clamp(body.vx || 0, -600, 600) - a.velX) * k;
        a.velY += (clamp(body.vy || 0, -600, 600) - a.velY) * k;
        a.speed = Math.hypot(a.velX, a.velY);

        const runTarget = Math.min(1, a.speed / H.runSpeedForFullEffect);
        a.run += (runTarget - a.run) * Math.min(1, dt * H.runSmoothing);
        a.stride += dt * H.strideSpeed * (0.25 + a.run);

        // Giro suave para onde o palco manda olhar
        const before = a.facing;
        a.facing = lerpAngle(a.facing, body.face ?? a.facing, Math.min(1, dt * H.turnSmoothing));
        let dAng = a.facing - before;
        while (dAng > Math.PI) dAng -= Math.PI * 2;
        while (dAng < -Math.PI) dAng += Math.PI * 2;
        a.turnRate += (dAng / dt - a.turnRate) * Math.min(1, dt * 10);

        // Capa: atraso suave oposto à velocidade (no referencial do herói)
        const cos = Math.cos(-a.facing);
        const sin = Math.sin(-a.facing);
        const lx = a.velX * cos - a.velY * sin;
        const ly = a.velX * sin + a.velY * cos;
        const lag = (v) => clamp(v, -H.capeMaxLag, H.capeMaxLag);
        const targetX = lag(-lx * H.capeDragPerSpeed);
        const targetY = lag(-ly * H.capeDragPerSpeed - a.turnRate * H.capeTurnLag);
        const f = Math.min(1, dt * H.capeFollow);
        a.capeX += (targetX - a.capeX) * f;
        a.capeY += (targetY - a.capeY) * f;

        if (a.swingActive) {
            a.swingElapsed += dt;
            if (a.swingElapsed > a.swingSeconds + H.recoverSeconds) a.swingActive = false;
        }
        // Mistura suave entre a pose de repouso e a pose de golpe (entra e sai sem estalo)
        const blendTarget = a.swingActive && a.swingElapsed < a.swingSeconds + H.recoverSeconds * 0.4 ? 1 : 0;
        a.swingBlend += (blendTarget - a.swingBlend) * Math.min(1, dt * H.swingBlendRate);
        if (a.swingBlend < 0.001) a.swingBlend = 0;
        a.dash += ((body.dashing ? 1 : 0) - a.dash) * Math.min(1, dt * H.dashBlendRate);
        a.vigil += ((body.kneeling ? 1 : 0) - a.vigil) * Math.min(1, dt * H.vigilBlendRate);
    }

    // Golpe do combo: 1, 2, 3 ou 'whirl' (giro completo)
    function startSwing(a, step) {
        const combo = H.combo[step] || H.combo[1];
        a.swingSeconds = combo.seconds;
        a.swingElapsed = 0;
        a.swingActive = true;
        if (combo.spin) {
            a.swingFrom = -Math.PI;
            a.swingTo = Math.PI;
        } else {
            a.swingFrom = combo.from * (H.swingHalfArc + combo.extraArc);
            a.swingTo = combo.to * (H.swingHalfArc + combo.extraArc);
        }
        return combo.seconds;
    }

    // Ângulo local da lâmina num instante do golpe: preparação → corte → segura no fim
    function swingAngleAt(elapsed, a = anim) {
        const dur = a.swingSeconds;
        const windEnd = dur * H.windupFraction;
        const dir = Math.sign(a.swingTo - a.swingFrom) || 1;
        const windAngle = a.swingFrom - dir * H.windupExtra;
        if (elapsed <= 0) return a.swingFrom;
        if (elapsed < windEnd) {
            const p = easeOutQuad(elapsed / windEnd);
            return a.swingFrom + (windAngle - a.swingFrom) * p;
        }
        const p = Math.min(1, (elapsed - windEnd) / (dur - windEnd));
        return windAngle + (a.swingTo - windAngle) * easeOutCubic(p);
    }

    // --- POSTURAS ---
    // Uma postura muda o corpo (crouch, lift, lean...) e pode segurar as mãos num lugar: sword { hand, dir, w } e
    // free { hand, w }, onde w é o quanto ela manda (0 a 1) sobre a pose normal.

    // Espada nas duas mãos. phi: 0 = apontada para cima, PI/2 = para a frente, acima disso = para o chão
    function twoHanded(stance, phi, w, height = 19) {
        const dir = [Math.sin(phi), 0, Math.cos(phi)];
        const hand = [dir[0] * 6.5 + 1, 0.8, height + dir[2] * 5.2];
        stance.sword = { hand, dir, w };
        stance.free = { hand: [hand[0] - dir[0] * 1.6, hand[1] - 1.4, hand[2] - dir[2] * 1.6], w };
    }

    // Entra em [0, inEnd], segura e sai a partir de outStart
    const hold = (k, inEnd, outStart) => (k < inEnd ? easeOutQuad(k / inEnd) : k > outStart ? 1 - easeOutQuad((k - outStart) / (1 - outStart)) : 1);

    function slamStance(stance, k) {
        const M = V.moves.slam;
        if (k < M.crouchEnd) {
            const p = easeOutQuad(k / M.crouchEnd);
            stance.crouch += M.crouch * p;
            twoHanded(stance, -0.7 * p, p);
        } else if (k < M.riseEnd) {
            const p = (k - M.crouchEnd) / (M.riseEnd - M.crouchEnd);
            stance.crouch += M.crouch * (1 - p);
            stance.lift = M.height * easeOutCubic(p);
            twoHanded(stance, -0.7 + 0.2 * p, 1);
        } else if (k < M.impactAt) {
            const p = (k - M.riseEnd) / (M.impactAt - M.riseEnd);
            const fall = p * p;
            stance.lift = M.height * (1 - fall);
            stance.lean += 3 * fall;
            twoHanded(stance, -0.5 + 2.9 * fall, 1);
        } else {
            const p = (k - M.impactAt) / (1 - M.impactAt);
            stance.crouch += M.crouch * (1 - easeOutQuad(p));
            stance.lean += 3 * (1 - p);
            twoHanded(stance, 2.4, k < M.recoverAt ? 1 : 1 - (k - M.recoverAt) / (1 - M.recoverAt), 13);
        }
    }

    function roarStance(stance, k) {
        const M = V.moves.roar;
        const w = hold(k, 0.18, 0.74);
        stance.lean -= M.leanBack * w;
        stance.rise = 1.3 * w;
        stance.headBack = 1.7 * w;
        stance.sword = { hand: [1.5, M.armReach, 17.5], dir: [0.2, 0.68, 0.7], w };
        stance.free = { hand: [1.5, -M.armReach, 17.5], w };
    }

    // Aparo: espada atravessada na frente do corpo, inclinada para cima, com a mão livre apoiando a lâmina
    const GUARD_DIR = norm([0.25, -0.75, 0.62]);
    function guardStance(stance, k) {
        const M = V.moves.guard;
        const w = hold(k, 0.15, 0.8);
        stance.crouch += M.crouch * w;
        stance.lean -= 0.8 * w;
        stance.sword = { hand: [4.2, 2.6, 13.2], dir: GUARD_DIR, w };
        stance.free = { hand: [5.4, -1.2, 16.4], w: w * 0.9 };
    }

    // Poção: a mão livre leva o frasco à boca e a cabeça vai para trás
    function drinkStance(stance, k) {
        const lift = hold(k, 0.25, 0.75);
        const sip = k > 0.25 && k < 0.75 ? 1 : 0;
        stance.flask = Math.min(1, k * 8, (1 - k) * 8);
        stance.headBack = 1.1 * lift * (0.6 + 0.4 * sip);
        stance.lean -= 0.8 * lift;
        stance.free = { hand: [3.4, -0.9, 18.6], w: lift };
    }

    // Derrota: ajoelha, tomba para trás e fica
    function fallStance(stance, k) {
        const M = V.moves.fall;
        const p = easeOutQuad(Math.min(1, k / 0.45));
        const sag = easeOutCubic(clamp((k - 0.35) / 0.65));
        stance.crouch += M.crouch * p;
        stance.kneel = p;
        stance.lean -= 2.5 * p + 1.5 * sag;
        stance.headBack = 1.2 * p + 1.4 * sag;
        if (!azael) stance.sword = { hand: [5, 0.8, 8.8 - sag * 2], dir: [0.06, 0, -1], w: p };
        stance.free = { hand: [2, -4.6, 5 - sag * 2], w: p };
    }

    const STANCES = { slam: slamStance, roar: roarStance, guard: guardStance, drink: drinkStance, fall: fallStance };

    function applyStance(stance, body, blend) {
        if (anim.dash > 0.01) {
            const w = anim.dash;
            stance.lean += V.dashLean * w;
            stance.crouch += V.dashCrouch * w;
            // O Azael avança com a katana guardada e a mão no cabo
            if (!azael) stance.sword = { hand: [-3.5, 6, 11], dir: [-0.92, 0.3, -0.24], w: w * 0.9 };
            stance.free = { hand: [-3.5, -5.5, 11.5], w: w * 0.9 };
        }
        if (anim.vigil > 0.01) {
            const w = anim.vigil * (1 - blend);
            stance.crouch += V.vigilCrouch * w;
            stance.kneel = w;
            // Azael descansa com a katana guardada e a mão livre no joelho; o Caçador finca a espada à frente
            if (azael) stance.free = { hand: [3.4, -2.2, 6.6], w };
            else if (w > (stance.sword?.w ?? 0)) {
                stance.sword = { hand: [5, 0.8, 8.8], dir: [0.06, 0, -1], w };
                stance.free = { hand: [4.5, -0.7, 9.4], w };
            }
        }
        const move = body.move;
        if (move && STANCES[move.kind]) STANCES[move.kind](stance, Math.min(1, move.age / move.seconds));
    }

    // --- POSE DO QUADRO ---
    function buildPose(t, body) {
        const run = anim.run;
        const blend = anim.swingBlend;
        const stance = { crouch: 0, lift: 0, lean: 0, rise: 0, headBack: 0, kneel: 0, flask: 0, sword: null, free: null };
        applyStance(stance, body, blend);
        const lean = V.runLean * run + stance.lean;
        const breath = Math.sin((t / H.breathPeriodSeconds) * Math.PI * 2) * V.breathAmount * (1 - run);
        // Azael: o corpo sobe e desce duas vezes por passada e anda mais agachado
        const bob = azael ? (0.5 - 0.5 * Math.cos(anim.stride * 2)) * AZ.runBob * run - AZ.runCrouch * run : 0;
        return {
            ...stance,
            t,
            run,
            lean,
            hipZ: V.hipHeight - stance.crouch + bob,
            sashZ: V.sashHeight - stance.crouch + bob,
            shoulderZ: V.shoulderHeight + breath - run * 0.8 - stance.crouch + stance.rise + bob,
            headA: 0.8 + lean - stance.headBack,
            headZ: V.headHeight + breath - run * 1.4 - stance.crouch + stance.rise * 1.3 + bob,
            blend
        };
    }

    // --- PARTES (cada uma desenhada na ordem da profundidade) ---
    function drawShadow(lift) {
        const size = 1 - lift / (V.moves.slam.height * 1.8);
        ctx.fillStyle = V.shadowColor;
        disk([0, 0, 0], [V.shadowRadiusFront * size, 0, 0], [0, V.shadowRadiusSide * size, 0]);
        ctx.fill();
    }

    function legPart(pose, side) {
        // Pernas alternadas: a da direita usa a fase oposta da esquerda
        const phase = anim.stride + (side > 0 ? 0 : Math.PI);
        // Ajoelhado: o pé direito vai para a frente e o esquerdo para trás, com o joelho no chão
        const reach = Math.sin(phase) * V.strideLength * (0.2 + pose.run * 0.9) + pose.kneel * (side > 0 ? 3.4 : -5);
        const lift = Math.max(0, Math.cos(phase)) * V.footLift * pose.run;
        const hip = [pose.lean * 0.3, side * V.hipSpread, pose.hipZ];
        const ankle = [reach, side * V.footSpread, V.ankleHeight + lift];
        const kneeZ = (hip[2] + ankle[2]) / 2 + lift * 0.4 + (side > 0 ? pose.kneel * 1.6 : -pose.kneel * 3);
        const knee = [(hip[0] + ankle[0]) / 2 + V.kneeForward + pose.crouch * 0.7, side * (V.hipSpread + V.footSpread) / 2, kneeZ];
        const toe = [reach + V.bootLength, side * V.footSpread, 0.6 + lift];
        return {
            depth: project(...knee).depth,
            draw() {
                if (azael) {
                    AZP.drawAzaelLeg(rig, hip, knee, ankle, [reach + 0.4, side * V.footSpread, 0.9 + lift]);
                    return;
                }
                if (yara) {
                    YP.drawYaraLeg(rig, hip, knee, ankle, toe);
                    return;
                }
                if (zeph) {
                    ZP.drawZephLeg(rig, hip, knee, ankle, toe);
                    return;
                }
                if (oskar) {
                    OP.drawOskarLeg(rig, hip, knee, ankle, toe);
                    return;
                }
                limb([hip, knee, ankle], V.legWidth, C.body);
                limb([ankle, toe], V.bootWidth, C.boots);
                // Faixa no cano da bota
                limb([[ankle[0], ankle[1], ankle[2] + 1.2], ankle], V.bootWidth + 0.2, C.sash);
            }
        };
    }

    function torsoPart(pose) {
        const bottom = { a: pose.lean * 0.3, z: pose.hipZ, ...V.waist };
        const top = { a: pose.lean, z: pose.shoulderZ, ...V.chest };
        return {
            depth: project(pose.lean * 0.6, 0, 13.5).depth,
            draw() {
                const pb = project(bottom.a, 0, bottom.z);
                const pt = project(top.a, 0, top.z);
                const wb = sectionHalfWidth(bottom.A, bottom.B);
                const wt = sectionHalfWidth(top.A, top.B);
                if (azael) {
                    AZP.drawAzaelTorso(rig, pose, bottom, top, wb, wt);
                    return;
                }
                if (yara) {
                    YP.drawYaraTorso(rig, pose, bottom, top, wb, wt);
                    return;
                }
                if (zeph) {
                    ZP.drawZephTorso(rig, pose, bottom, top, wb, wt);
                    return;
                }
                if (oskar) {
                    OP.drawOskarTorso(rig, pose, bottom, top, wb, wt);
                    return;
                }

                // Quadril, corpo entre quadril e ombros, e o topo dos ombros (mais claro, pega luz de cima)
                ctx.fillStyle = C.body;
                disk([bottom.a, 0, bottom.z], [bottom.A, 0, 0], [0, bottom.B, 0]);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(pb.x - wb, pb.y);
                ctx.lineTo(pt.x - wt, pt.y);
                ctx.lineTo(pt.x + wt, pt.y);
                ctx.lineTo(pb.x + wb, pb.y);
                ctx.closePath();
                ctx.fill();

                // Faixa da cintura: só a metade da frente do anel aparece
                const sash = project(bottom.a, 0, pose.sashZ);
                ctx.save();
                ctx.beginPath();
                ctx.rect(sash.x - 20, sash.y, 40, 20);
                ctx.clip();
                disk([bottom.a, 0, pose.sashZ], [bottom.A * 1.05, 0, 0], [0, bottom.B * 1.05, 0]);
                ctx.strokeStyle = C.sash;
                ctx.lineWidth = 1.3;
                ctx.stroke();
                ctx.restore();

                ctx.fillStyle = C.sleeve;
                disk([top.a, 0, top.z], [top.A, 0, 0], [0, top.B, 0]);
                ctx.fill();

                // Tira cruzando o peito e fivela: só quando o peito está virado para a câmera
                const front = Math.max(0, Math.min(1, sinF * 1.5 + 0.4));
                if (front > 0) {
                    const base = ctx.globalAlpha;
                    ctx.globalAlpha = base * front;
                    limb([[top.a + top.A * 0.9, -top.B * 0.65, top.z - 0.6], [bottom.a + bottom.A, bottom.B * 0.6, pose.sashZ + 0.8]], 1.3, C.strap);
                    const buckle = project(pose.lean * 0.65 + 2.7, 0, 14);
                    ctx.fillStyle = C.buckle;
                    ctx.fillRect(buckle.x - 0.6, buckle.y - 0.5, 1.2, 1);
                    ctx.globalAlpha = base;
                }
            }
        };
    }

    function capePart(pose) {
        const t = pose.t;
        const run = pose.run;
        const n = H.capeStrips;
        const lengthBack = V.capeLength + V.capeRunLength * run + Math.max(0, -anim.capeX) * 0.25;
        const hemZ = V.capeHemHeight + V.capeRunLift * run;
        const wave = H.capeWaveIdle + (H.capeWaveRun - H.capeWaveIdle) * run;
        const tailHalf = V.capeTailWidth * (1 - run * 0.2);
        const jag = anim.capeJag;

        // Presa num arco nas costas dos ombros; a barra rasgada segue o atraso da capa
        const anchors = [];
        const hem = [];
        for (let i = 0; i <= n; i++) {
            const k = i / n;
            const psi = Math.PI / 2 + k * Math.PI;
            anchors.push([pose.lean + V.chest.A * 1.05 * Math.cos(psi), V.chest.B * 1.08 * Math.sin(psi), V.capeAnchorHeight + (pose.shoulderZ - V.shoulderHeight)]);
            const edge = Math.abs(k - 0.5) * 2;
            const flutter = Math.sin(t * H.capeWaveSpeed + i * 1.3) * wave;
            hem.push([
                pose.lean * 0.3 - 1.5 - lengthBack * jag[i] - edge * run * 1.5 - Math.abs(flutter) * 0.5,
                (1 - 2 * k) * tailHalf + anim.capeY * (0.6 + edge * 0.5) + flutter * 0.4,
                Math.max(0.4, hemZ * (0.85 + 0.3 * jag[i] - 0.15) + flutter * 0.3)
            ]);
        }

        return {
            depth: project(pose.lean - 3.5, 0, 9).depth,
            draw() {
                // Yara não tem capa: no lugar dela, a ponta do cachecol voando
                if (yara) {
                    YP.drawYaraScarfTail(rig, pose);
                    return;
                }
                // Zeph também não tem capa (a bolsa e a alça ficam no tronco)
                if (zeph || oskar) return;
                // Pontas da faixa da cintura: penduradas paradas, esvoaçam para trás na corrida
                for (const side of [-1, 1]) {
                    const flutter = Math.sin(t * 7 + side) * (1 + run * 1.5);
                    limb([
                        [pose.lean * 0.3 - V.waist.A, side * 1.2, pose.sashZ],
                        [pose.lean * 0.3 - V.waist.A - 1 - 3 * run + anim.capeX * 0.2, side * 2 + anim.capeY * 0.3, pose.sashZ - 4 + run * 3 + flutter * 0.5]
                    ], 1.3, C.sash);
                }

                if (azael) {
                    AZP.drawAzaelCape(rig, pose, anchors, hem);
                    return;
                }
                ctx.beginPath();
                anchors.forEach((p, i) => {
                    const s = project(...p);
                    if (i === 0) ctx.moveTo(s.x, s.y);
                    else ctx.lineTo(s.x, s.y);
                });
                // Barra rasgada (de volta), com entalhes entre as pontas
                for (let i = n; i >= 0; i--) {
                    const p = project(...hem[i]);
                    ctx.lineTo(p.x, p.y);
                    if (i > 0) {
                        const q = hem[i - 1];
                        const mid = [(hem[i][0] + q[0]) / 2 * 0.85, (hem[i][1] + q[1]) / 2, (hem[i][2] + q[2]) / 2 + 1.2];
                        const m = project(...mid);
                        ctx.lineTo(m.x, m.y);
                    }
                }
                ctx.closePath();
                ctx.fillStyle = C.cape;
                ctx.fill();
                ctx.strokeStyle = C.capeEdge;
                ctx.lineWidth = 0.6;
                ctx.stroke();

                // Dobras do ombro até as pontas compridas
                for (let i = 1; i < n; i += 2) {
                    limb([anchors[i], [(anchors[i][0] + hem[i][0]) / 2, (anchors[i][1] + hem[i][1]) / 2, (anchors[i][2] + hem[i][2]) / 2], hem[i]], 0.8, C.capeFold);
                }
            }
        };
    }

    // Frasco de poção vermelho na mão (postura drink)
    function drawFlask(hand, alpha) {
        const p = project(hand[0] + 0.3, hand[1], hand[2] + 1.2);
        const base = ctx.globalAlpha;
        ctx.globalAlpha = base * alpha;
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 1.25, 1.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(p.x - 0.2, p.y + 0.15, 0.95, 1.05, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fecaca';
        ctx.fillRect(p.x - 0.65, p.y - 0.55, 0.35, 0.5);
        ctx.fillStyle = '#a16207';
        ctx.fillRect(p.x - 0.4, p.y - 2.3, 0.8, 0.9);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, 'rgba(248, 113, 113, 0.7)', p.x, p.y, 3.2, 0.5);
        ctx.restore();
        ctx.globalAlpha = base;
    }

    // Yara parada: os braços não ficam travados. Respiram junto com o corpo, balançam devagar (cada um no seu ritmo)
    // e ficam um pouco abertos e dobrados. Some ao correr e durante golpes e posturas (idle = 0).
    function yaraIdle(pose, side) {
        if (!yara && !zeph) return { hand: [0, 0, 0], elbow: [0, 0, 0], shoulder: [0, 0, 0], angle: 0 };
        const idle = (1 - pose.run) * (1 - pose.blend) * (1 - (pose.sword?.w ?? 0));
        const t = pose.t;
        const ph = side > 0 ? 0 : 2.1;
        return {
            hand: [
                (Math.sin(t * 1.7 + ph) * 0.6 + (side > 0 ? 1.6 : 0.8)) * idle,
                side * (1.3 + Math.sin(t * 1.1 + ph) * 0.35) * idle,
                (Math.sin(t * 2.1 + ph + 0.8) * 0.5 + (side > 0 ? 2.4 : 1.6)) * idle
            ],
            elbow: [-1 * idle, side * (1.5 + Math.sin(t * 1.1 + ph) * 0.25) * idle, 0.2 * idle],
            // Ombro: o direito (da espada) rola para a frente e para trás e sobe e desce com a respiração;
            // o esquerdo mexe bem menos
            shoulder: [
                Math.sin(t * 1.7 + ph) * (side > 0 ? 0.55 : 0.2) * idle,
                side * Math.sin(t * 1.7 + ph + 1.2) * (side > 0 ? 0.25 : 0.1) * idle,
                Math.sin(t * 1.7 + ph + 0.6) * (side > 0 ? 0.6 : 0.2) * idle
            ],
            angle: (Math.sin(t * 1.3) * 0.2 - 0.55) * idle
        };
    }

    // Braço livre (esquerdo): balança contra a passada e recolhe durante o golpe
    function freeArmPart(pose) {
        const swing = Math.sin(anim.stride) * V.armSwing * pose.run;
        const shoulder = add3([pose.lean, -V.chest.B, pose.shoulderZ - 0.5], yaraIdle(pose, -1).shoulder);
        const ya = yaraIdle(pose, -1);
        const restHand = add3([pose.lean * 0.5 + 0.6 + swing * (1 - pose.blend) - pose.blend * 1.2, -V.chest.B - 0.6 + pose.blend * 1.5, V.handHeight - pose.crouch + pose.blend * 2], ya.hand);
        let hand = pose.free ? mix(restHand, pose.free.hand, pose.free.w) : restHand;
        // Azael: com a katana guardada, a mão esquerda segura a bainha logo atrás da boca (a direita fica no cabo),
        // menos quando bebe a poção
        const holdSheath = azael && !(pose.flask > 0) ? 1 - azaelDrawn(pose) : 0;
        if (holdSheath > 0) {
            const sheath = AZP.scabbardFrame(pose);
            hand = mix(hand, add3(add3(sheath.mouth, sheath.dir.map(v => v * AZ.sheathHand)), AZ.leftHandOffset), holdSheath);
        }
        // Oskar: a mão livre fica no cabo do machado, acima da outra (duas mãos), menos quando bebe a poção
        if (oskar && !(pose.flask > 0)) {
            const grip = swordArmPose(pose);
            hand = add3(grip.hand, grip.dir.map(v => v * OS.gripSpread));
        }
        // Segurando a bainha, o braço cruza na frente da barriga (cotovelo à frente) e é desenhado na frente do corpo
        const leo = azael ? AZ.leftElbowOffset.map(v => v * holdSheath) : [0, 0, 0];
        const elbow = add3(add3([(shoulder[0] + hand[0]) / 2 - 0.4 + holdSheath * 2.2, -V.chest.B - 1 + holdSheath * 2.6, (shoulder[2] + hand[2]) / 2], ya.elbow), leo);
        const armDepth = project(...elbow).depth + 0.1;
        return {
            // (na frente do corpo, mas sempre atrás da cabeça: senão o pano do ombro cobre o rosto)
            depth: holdSheath > 0.5 ? Math.min(Math.max(armDepth, project(...hand).depth + 0.2), project(pose.headA, 0, pose.headZ).depth - 0.05) : armDepth,
            draw() {
                if (azael) AZP.drawAzaelArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
                else if (yara) YP.drawYaraArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
                else if (zeph) ZP.drawZephArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
                else if (oskar) OP.drawOskarArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
                else {
                    ball(shoulder, V.shoulderRadius, C.sleeve);
                    limb([shoulder, elbow, hand], V.armWidth, C.sleeve);
                    ball(hand, V.handRadius, C.glove);
                }
                if (pose.flask > 0) drawFlask(hand, pose.flask);
            }
        };
    }

    // Braço da espada (direito): mistura a pose de repouso com a pose do golpe (swingBlend)
    function swordArmPose(pose) {
        const ya = yaraIdle(pose, 1);
        const restAngle = H.restBladeAngle + Math.sin(anim.stride) * 0.12 * pose.run + ya.angle;
        let swingAngle = restAngle;
        if (anim.swingActive || pose.blend > 0) swingAngle = swingAngleAt(Math.min(anim.swingElapsed, anim.swingSeconds), anim);
        const blend = pose.blend;
        if (azael) return holdSword(pose, azaelSwordRest(pose, swingAngle, blend));
        const restHand = add3([pose.lean * 0.5 + 1.6 + Math.sin(anim.stride + Math.PI) * V.armSwing * 0.4 * pose.run, V.chest.B + 0.8, V.handHeight - pose.crouch], ya.hand);
        const swingHand = [Math.cos(swingAngle) * V.swingRadius, Math.sin(swingAngle) * V.swingRadius, V.swingHeight];
        const hand = restHand.map((v, i) => v + (swingHand[i] - v) * blend);
        const angle = lerpAngle(restAngle, swingAngle, blend);
        const drop = V.restBladeDrop * (1 - blend);
        const len = Math.hypot(1, drop);
        let dir = [Math.cos(angle) / len, Math.sin(angle) / len, -drop / len];
        // Yara: em repouso segura a espada curta em pé, com a ponta para cima e um pouco para a frente (guarda),
        // balançando de leve; no golpe volta para a varredura normal
        if (yara || zeph) {
            const k = 1 - blend;
            // Zeph: adaga baixa à frente do quadril, ponta para a frente (guarda de faca)
            const up = zeph ? [0.95, 0.12 + Math.sin(pose.t * 1.3) * 0.06, 0.12] : [0.35 + Math.sin(pose.t * 1.3) * 0.08, 0.15, 0.92];
            const m = mix(dir, up, k);
            const size = Math.hypot(...m) || 1;
            dir = m.map(v => v / size);
        }
        // Oskar: em repouso segura o machado com as duas mãos, cabo deitado na frente da cintura e a cabeça para a
        // frente e a esquerda; sobe e desce devagar com a respiração. No golpe vai para a varredura normal.
        if (oskar) {
            const k = 1 - blend;
            const restO = [pose.lean * 0.5 + 2.8, 2.6, V.handHeight + 1.2 - pose.crouch + Math.sin(pose.t * 1.4) * 0.25];
            const dirO = [0.75 + Math.sin(pose.t * 1.1) * 0.04, -0.65, 0.12];
            const h2 = mix(hand, restO, k);
            const m = mix(dir, norm3(dirO), k);
            const size = Math.hypot(...m) || 1;
            return holdSword(pose, { hand: h2, dir: m.map(v => v / size) });
        }
        return holdSword(pose, { hand, dir });
    }

    // Postura segurando a espada num lugar (golpes especiais, dash, aparo, descanso)
    function holdSword(pose, { hand, dir }) {
        if (!pose.sword) return { hand, dir };
        const { w } = pose.sword;
        const held = mix(dir, pose.sword.dir, w);
        const size = Math.hypot(...held) || 1;
        return { hand: mix(hand, pose.sword.hand, w), dir: held.map(v => v / size) };
    }

    // Azael: em repouso a mão fica no cabo da katana guardada; no golpe ela sai da bainha e varre
    function azaelSwordRest(pose, swingAngle, blend) {
        const sheath = AZP.scabbardFrame(pose);
        const swingHand = [Math.cos(swingAngle) * V.swingRadius, Math.sin(swingAngle) * V.swingRadius, V.swingHeight];
        const d = mix(sheath.dir, [Math.cos(swingAngle), Math.sin(swingAngle), 0], blend);
        const size = Math.hypot(...d) || 1;
        // rightHandOffset: ajuste da mão direita em repouso (some no golpe)
        const grip = sheath.grip.map((v, i) => v + AZ.rightHandOffset[i]);
        return { hand: mix(grip, swingHand, blend), dir: d.map(v => v / size) };
    }

    // Azael: quanto a katana está fora da bainha (0 = guardada, 1 = na mão). A lâmina desliza para fora e para
    // dentro junto com a mão, em vez de piscar.
    function azaelDrawn(pose) {
        const k = Math.max(pose.blend, pose.sword?.w ?? 0);
        return Math.max(0, Math.min(1, (k - 0.02) / AZ.drawBlend));
    }

    function swordArmPart(pose) {
        const { hand } = swordArmPose(pose);
        const shoulder = add3([pose.lean, V.chest.B, pose.shoulderZ - 0.5], yaraIdle(pose, 1).shoulder);
        // Azael: rightElbowOffset dobra/abre o cotovelo direito em repouso (some no golpe)
        const eo = azael ? AZ.rightElbowOffset.map(v => v * (1 - pose.blend)) : [0, 0, 0];
        const elbow = add3(add3([(shoulder[0] + hand[0]) / 2 + 0.6, (shoulder[1] + hand[1]) / 2 + 1, (shoulder[2] + hand[2]) / 2], yaraIdle(pose, 1).elbow), eo);
        return {
            depth: project(...elbow).depth + 0.1,
            draw() {
                if (azael) {
                    AZP.drawAzaelArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
                    return;
                }
                if (yara) {
                    YP.drawYaraArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
                    return;
                }
                if (zeph) {
                    ZP.drawZephArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
                    return;
                }
                if (oskar) {
                    OP.drawOskarArm(rig, shoulder, elbow, hand, V.armWidth, V.handRadius);
                    return;
                }
                ball(shoulder, V.shoulderRadius, C.sleeve);
                limb([shoulder, elbow, hand], V.armWidth, C.sleeve);
                ball(hand, V.handRadius, C.glove);
            }
        };
    }

    // Lâmina 3D: plana na horizontal, com cabo, guarda, fio brilhante e runas
    function bladeShape(hand, dir, t, alpha) {
        if (azael) {
            AZP.drawKatana(rig, hand, dir, alpha);
            return;
        }
        if (yara) {
            YP.drawYaraSword(rig, hand, dir, alpha);
            return;
        }
        if (zeph) {
            ZP.drawZephDagger(rig, hand, dir, alpha);
            return;
        }
        if (oskar) {
            OP.drawOskarAxe(rig, hand, dir, alpha);
            return;
        }
        const at = (d) => [hand[0] + dir[0] * d, hand[1] + dir[1] * d, hand[2] + dir[2] * d];
        const flat = Math.hypot(dir[0], dir[1]) || 1;
        const w = [-dir[1] / flat * bladeWidth / 2, dir[0] / flat * bladeWidth / 2, 0];
        const side = (p, k) => project(p[0] + w[0] * k, p[1] + w[1] * k, p[2]);
        const base = at(0.8);
        const shoulderPt = at(bladeLength - 3);
        const tip = project(...at(bladeLength));

        const baseAlpha = ctx.globalAlpha;
        ctx.globalAlpha = baseAlpha * alpha;

        limb([at(-3), hand], 1.8, C.glove);
        limb([[base[0] - w[0] * 1.8, base[1] - w[1] * 1.8, base[2]], [base[0] + w[0] * 1.8, base[1] + w[1] * 1.8, base[2]]], 1.1, C.buckle);

        const corners = [side(base, -1), side(shoulderPt, -1), tip, side(shoulderPt, 1), side(base, 1)];
        ctx.fillStyle = C.blade;
        ctx.beginPath();
        corners.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        ctx.fill();

        limb([at(1.5), at(bladeLength - 2.5)], 0.7, C.bladeCore);

        // Runas que acendem em onda ao longo do gume
        ctx.fillStyle = C.runes;
        for (let i = 0; i < H.runeCount; i++) {
            const p = project(...at(3 + i * ((bladeLength - 7) / (H.runeCount - 1))));
            ctx.globalAlpha = baseAlpha * alpha * (0.35 + 0.65 * Math.max(0, Math.sin(t * 6 - i * 1.2)));
            ctx.fillRect(p.x - 0.6, p.y - 0.5, 1.2, 1);
        }
        ctx.globalAlpha = baseAlpha;
    }

    function swordPart(pose, frenzy) {
        const { hand, dir } = swordArmPose(pose);
        const mid = [hand[0] + dir[0] * bladeLength * 0.5, hand[1] + dir[1] * bladeLength * 0.5, hand[2] + dir[2] * bladeLength * 0.5];
        const drawn = azael ? azaelDrawn(pose) : 1;
        return {
            depth: project(...mid).depth,
            draw() {
                if (drawn <= 0) return;
                ctx.save();
                ctx.globalAlpha *= drawn;
                const t = pose.t;
                // Rastro fantasma do corte: lâminas em instantes anteriores
                if (anim.swingActive && anim.swingElapsed < anim.swingSeconds + 0.05) {
                    for (let g = H.ghostCount; g >= 1; g--) {
                        const a = swingAngleAt(anim.swingElapsed - g * H.ghostGapSeconds, anim);
                        const ghostHand = [Math.cos(a) * V.swingRadius, Math.sin(a) * V.swingRadius, V.swingHeight];
                        bladeShape(ghostHand, [Math.cos(a), Math.sin(a), 0], t, 0.5 * (1 - g / (H.ghostCount + 1)) * pose.blend);
                    }
                }

                // Brilho pulsante (somado à cena)
                const pulse = 0.5 + 0.5 * Math.sin((t / H.bladePulsePeriodSeconds) * Math.PI * 2);
                const glow = project(...mid);
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                drawGlow(ctx, frenzy ? C.bladeGlowSoftFrenzy : C.bladeGlowSoft, glow.x, glow.y,
                    (H.bladeGlowMin + (H.bladeGlowMax - H.bladeGlowMin) * pulse) * 0.8 * (1 + pose.blend * 0.7 + (pose.sword?.w ?? 0) * 0.6) * (azael ? AZ.glowScale : yara ? YA.glowScale : zeph ? ZE.glowScale : oskar ? OS.glowScale : 1) * (frenzy ? 1.4 : 1),
                    0.32 + 0.2 * pulse);
                ctx.restore();

                bladeShape(hand, dir, t, 1);
                ctx.restore();
            }
        };
    }

    // Capuz (esfera + ponta caindo para trás) e máscara de osso na frente
    function headPart(pose) {
        const center = [pose.headA, 0, pose.headZ];
        const R = V.hoodRadius;
        const tipPos = [pose.headA - R - V.hoodTipLength + anim.capeX * 0.15, anim.capeY * 0.1, pose.headZ - 0.9];
        return {
            depth: project(...center).depth,
            draw() {
                const t = pose.t;
                const c = project(...center);
                const ry = R * Math.hypot(GS, HS);
                const tip = project(...tipPos);

                const drawTip = () => {
                    const back = Math.atan2(tip.y - c.y, tip.x - c.x);
                    ctx.fillStyle = C.hood;
                    ctx.beginPath();
                    ctx.moveTo(c.x + Math.cos(back + Math.PI / 2) * R * 0.8, c.y + Math.sin(back + Math.PI / 2) * ry * 0.8);
                    ctx.lineTo(tip.x, tip.y);
                    ctx.lineTo(c.x + Math.cos(back - Math.PI / 2) * R * 0.8, c.y + Math.sin(back - Math.PI / 2) * ry * 0.8);
                    ctx.closePath();
                    ctx.fill();
                };
                const tipInFront = tip.depth > c.depth;
                if (!tipInFront) drawTip();

                ctx.fillStyle = C.hood;
                ctx.beginPath();
                ctx.ellipse(c.x, c.y, R, ry, 0, 0, Math.PI * 2);
                ctx.fill();
                // Topo do capuz pegando luz de cima
                ctx.fillStyle = C.hoodFold;
                ctx.beginPath();
                ctx.ellipse(c.x, c.y - ry * 0.3, R * 0.62, ry * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();

                if (tipInFront) drawTip();

                // Rosto: some quando o herói está de costas para a câmera
                const vis = Math.max(0, Math.min(1, (sinF + 0.45) / 0.5));
                if (vis <= 0) return;
                const baseAlpha = ctx.globalAlpha;
                ctx.globalAlpha = baseAlpha * vis;

                // Abertura escura do capuz (presa dentro da esfera)
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(c.x, c.y, R, ry, 0, 0, Math.PI * 2);
                ctx.clip();
                disk([pose.headA + R * 0.62, 0, pose.headZ - 0.4], [0, R * 0.62, 0], [0, 0, R * 0.72]);
                ctx.fillStyle = C.hoodInner;
                ctx.fill();
                ctx.restore();

                // Máscara: um "ovo" fino na frente do rosto (de frente fica larga; de perfil, estreita)
                const mc = [pose.headA + V.maskForward, 0, pose.headZ + V.maskHeightOffset];
                const m = project(...mc);
                const mw = sectionHalfWidth(V.maskDepth, V.maskWidth);
                const mh = V.maskHeight * HS + 0.5;
                ctx.fillStyle = C.mask;
                ctx.beginPath();
                ctx.ellipse(m.x, m.y, mw, mh, 0, 0, Math.PI * 2);
                ctx.fill();
                // Lado da máscara que fica na sombra do capuz
                const back = projectVec(-1, 0, 0);
                ctx.fillStyle = C.maskShade;
                ctx.beginPath();
                ctx.ellipse(m.x + back.x * 0.5, m.y + back.y * 0.5, mw * 0.55, mh * 0.85, 0, 0, Math.PI * 2);
                ctx.fill();

                // Olhos vazados (o do lado de lá some no perfil) e brilho frio pulsando
                for (const side of [-1, 1]) {
                    const e = project(mc[0] + V.maskDepth * 0.7, side * 0.9, mc[2] + 0.5);
                    if (e.depth < m.depth - 0.3) continue;
                    const ex = 0.25 + 0.5 * Math.abs(sinF);
                    ctx.fillStyle = C.maskEyes;
                    ctx.beginPath();
                    ctx.ellipse(e.x, e.y, ex, 0.55, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = baseAlpha * vis * (0.35 + 0.3 * Math.sin(t * 3));
                    ctx.fillStyle = C.eyeGlint;
                    ctx.fillRect(e.x - ex * 0.5, e.y - 0.35, ex, 0.4);
                    ctx.globalAlpha = baseAlpha * vis;
                }
                ctx.globalAlpha = baseAlpha;
            }
        };
    }

    // Ferramentas do boneco para as peças do Azael (js/stage/azael25d.js)
    const rig = {
        project, projectVec, limb, ball, disk,
        get anim() { return anim; },
        get C() { return C; },
        get sinF() { return sinF; },
        get cosF() { return cosF; },
        get heightScale() { return HS; },
        get sphereY() { return Math.hypot(GS, HS); }
    };

    // Desenha o herói com os pés em (opts.x, opts.y) da tela, opts.scale px por unidade.
    // body: { hitTime, hitDirX, hitDirY, move: { kind, age, seconds } }. a: estado de createAnim.
    // opts: { x, y, scale, model: 'hunter' | 'azael' | 'yara' | 'zeph' | 'oskar', colors, camera: { heightScale, groundSquash }, frenzy, alpha, time }
    function render(context, body, a, opts) {
        ctx = context;
        AZP.bind(context);
        YP.bind(context);
        ZP.bind(context);
        OP.bind(context);
        anim = a;
        azael = opts.model === 'azael';
        yara = opts.model === 'yara';
        zeph = opts.model === 'zeph';
        oskar = opts.model === 'oskar';
        C = opts.colors || (azael ? AZ.colors : yara ? YA.colors : zeph ? ZE.colors : oskar ? OS.colors : H.colors);
        HS = opts.camera?.heightScale ?? V.heightScale;
        GS = opts.camera?.groundSquash ?? V.groundSquash;
        bladeLength = azael ? AZ.bladeLength : yara ? YA.bladeLength : zeph ? ZE.bladeLength : oskar ? OS.bladeLength : V.bladeLength;
        bladeWidth = azael ? AZ.bladeWidth : yara ? YA.bladeWidth : zeph ? ZE.bladeWidth : oskar ? OS.bladeWidth : V.bladeWidth;
        const t = opts.time ?? performance.now() / 1000;
        cosF = Math.cos(anim.facing);
        sinF = Math.sin(anim.facing);

        // Dano: empurrão para longe do golpe e anel no chão
        const K = H.knockback;
        const hitAge = t - (body.hitTime ?? -99);
        const hitP = hitAge / K.seconds;
        let push = 0;
        if (hitP >= 0 && hitP < 1) {
            push = hitP < K.peakAt
                ? easeOutCubic(hitP / K.peakAt)
                : 1 - easeOutQuad((hitP - K.peakAt) / (1 - K.peakAt));
        }

        ctx.save();
        ctx.globalAlpha *= opts.alpha ?? 1;
        ctx.translate(opts.x, opts.y);
        // O Oskar é maior que os outros (o boneco inteiro, com a sombra)
        const bodyScale = oskar ? OS.bodyScale : 1;
        ctx.scale(opts.scale * bodyScale, opts.scale * bodyScale);

        const ringP = hitAge / K.ringSeconds;
        if (ringP >= 0 && ringP < 1) {
            const r = K.ringStartRadius + (K.ringEndRadius - K.ringStartRadius) * easeOutCubic(ringP);
            ctx.save();
            ctx.globalAlpha *= (1 - ringP) * 0.7;
            ctx.strokeStyle = C.hurtRing;
            ctx.lineWidth = (2.5 * (1 - ringP) + 0.5) / opts.scale * 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, r, r * GS, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.translate((body.hitDirX || 0) * K.distance * push, (body.hitDirY || 0) * K.distance * push * GS);
        const pose = buildPose(t, body);
        drawShadow(pose.lift);
        ctx.translate(0, -pose.lift * HS);
        const parts = [
            capePart(pose),
            legPart(pose, -1),
            legPart(pose, 1),
            torsoPart(pose),
            freeArmPart(pose),
            swordArmPart(pose),
            swordPart(pose, !!opts.frenzy),
            ...(azael
                ? [AZP.azaelHeadPart(pose, rig), AZP.azaelHairPart(pose, rig), AZP.azaelScabbardPart(pose, rig, 1 - azaelDrawn(pose))]
                : yara ? YP.yaraHeadParts(pose, rig) : zeph ? ZP.zephHeadParts(pose, rig) : oskar ? OP.oskarHeadParts(pose, rig) : [headPart(pose)])
        ];
        parts.sort((p, q) => p.depth - q.depth).forEach(p => p.draw());
        ctx.restore();

        return pose;
    }

    // Ponta da lâmina e mão da espada na tela (para o rastro e as faíscas do palco), no mesmo referencial de render
    function bladeTip(body, a, opts) {
        const prevAnim = anim;
        anim = a;
        azael = opts.model === 'azael';
        yara = opts.model === 'yara';
        zeph = opts.model === 'zeph';
        oskar = opts.model === 'oskar';
        HS = opts.camera?.heightScale ?? V.heightScale;
        GS = opts.camera?.groundSquash ?? V.groundSquash;
        bladeLength = azael ? AZ.bladeLength : yara ? YA.bladeLength : zeph ? ZE.bladeLength : oskar ? OS.bladeLength : V.bladeLength;
        cosF = Math.cos(a.facing);
        sinF = Math.sin(a.facing);
        const pose = buildPose(opts.time ?? performance.now() / 1000, body);
        const { hand, dir } = swordArmPose(pose);
        const tip = project(hand[0] + dir[0] * bladeLength, hand[1] + dir[1] * bladeLength, hand[2] + dir[2] * bladeLength - pose.lift);
        const grip = project(hand[0], hand[1], hand[2] - pose.lift);
        anim = prevAnim;
        const s = opts.scale * (oskar ? OS.bodyScale : 1);
        return { tip: { x: opts.x + tip.x * s, y: opts.y + tip.y * s }, hand: { x: opts.x + grip.x * s, y: opts.y + grip.y * s } };
    }

    // Altura do topo da cabeça na tela (unidades × escala), para pôr números e ícones acima do herói
    function headTop(opts) {
        const hs = opts.camera?.heightScale ?? V.heightScale;
        return (V.headHeight + V.hoodRadius + 1) * hs * opts.scale * (opts.model === 'oskar' ? OS.bodyScale : 1);
    }

    NS.hero = { createAnim, updateAnim, startSwing, render, bladeTip, headTop, moves: V.moves };
})();
