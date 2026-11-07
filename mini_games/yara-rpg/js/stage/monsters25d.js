// --- PALCO 2.5D: MONSTROS DESENHADOS ---
// Monstros da Floresta da Névoa (Esqueleto, Bruxa, Espectro Corrompido = espectro) do Last Torch, mais o Lobo Sombriço (desenho próprio) redesenhados de lado para o palco (cópia adaptada; mudar aqui não muda o Last Torch).
// Mesmas cores e mesmas peças do original (alma verde nas costelas, trapo, crânio rachado; manto corcunda,
// capuz, rosto cinza de olhos vermelhos, bola de magia roxa), mas vistos de perfil em vez de cima.
// O palco (js/stage/stage.js) chama paint(tipo, g, opts) no lugar da imagem recortada quando kindFor(imagem) acha um tipo.
// Unidades: as do palco (o monstro comum tem ~31 de altura). +x local é a frente (virada para o herói).
// Script clássico: window.YaraStage25D.monsters.
(() => {
    const NS = window.YaraStage25D = window.YaraStage25D || {};
    const { drawGlow } = NS.fx;

    const SKELETON = {
        bone: '#e3dcc6', boneShade: '#a89f86', boneDark: '#5c5444', socket: '#120f0a',
        soul: '#86efac', soulCore: '#f0fdf4', soulGlow: 'rgba(74, 222, 128, 0.4)', aura: 'rgba(34, 197, 94, 0.5)',
        rag: '#3b2f25', ragEdge: '#57463a'
    };
    const WITCH = {
        robe: '#2a2333', robeShade: '#17121f', robeFold: '#3d3350', robeEdge: '#4a3f5e',
        hood: '#251e2e', hoodInner: '#08060c', hoodFold: '#3a3048',
        skin: '#b9bab2', skinShade: '#8a8c85', wrinkle: '#5f615b',
        eye: '#ef4444', eyeGlow: 'rgba(239, 68, 68, 0.85)',
        hair: '#9fb3b0', hairShade: '#6e8886', hand: '#a9aaa2', claw: '#ecebe4', rope: '#5e5246',
        orbCore: '#12061c', orbRim: '#7e22ce', orbSwirl: '#c084fc', orbGlow: 'rgba(126, 34, 206, 0.85)',
        aura: 'rgba(59, 7, 100, 0.7)'
    };

    // Imagem do monstro (js/data/monsters.js) -> tipo desenhado
    const BY_IMAGE = { 'squeleton.webp': 'skeleton', 'skeleton.webp': 'skeleton', 'witch.webp': 'witch',
        'shadow-wolf.webp': 'wolf', 'corrupted-spirit.webp': 'wraith' };
    function kindFor(image) {
        if (!image) return null;
        return BY_IMAGE[String(image).split('/').pop()] || null;
    }

    // Cor clareada pelo piscar de dano
    const mixCache = new Map();
    function tint(hex, k) {
        if (k <= 0.02 || hex[0] !== '#') return hex;
        const key = hex + Math.round(k * 10);
        let v = mixCache.get(key);
        if (!v) {
            const n = parseInt(hex.slice(1), 16);
            const q = Math.round(k * 10) / 10;
            const ch = (sh) => Math.round(((n >> sh) & 255) + (255 - ((n >> sh) & 255)) * q);
            v = `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
            mixCache.set(key, v);
        }
        return v;
    }

    // ---------- ESQUELETO ----------
    function skeleton(g, o) {
        const C = SKELETON;
        const t = o.t;
        const f = o.flash;
        const bone = tint(C.bone, f);
        const shade = tint(C.boneShade, f);
        const dark = C.boneDark;
        const rattle = o.hurt;
        const sh = (i) => rattle * 0.9 * Math.sin(t * 90 + i * 12.9);
        const atk = o.attack;
        const fall = o.dying;               // desmonta: cada parte cai num tempo
        const drop = (delay, h) => {
            const k = Math.max(0, Math.min(1, (fall - delay) / 0.5));
            return k * k * h;
        };
        const pulse = 0.5 + 0.5 * Math.sin(t * 3.1);
        const step = Math.sin(t * 2.4);

        const line = (pts, w, col) => {
            g.lineCap = 'round';
            g.lineJoin = 'round';
            g.beginPath();
            pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
            g.strokeStyle = dark;
            g.lineWidth = w + Math.max(0.45, w * 0.45);
            g.stroke();
            g.strokeStyle = col;
            g.lineWidth = w;
            g.stroke();
        };
        const dot = (x, y, r, col) => {
            g.fillStyle = col;
            g.strokeStyle = dark;
            g.lineWidth = 0.4;
            g.beginPath();
            g.arc(x, y, r, 0, Math.PI * 2);
            g.fill();
            g.stroke();
        };

        drawGlow(g, C.aura, 0, 12, 16, 0.18 + pulse * 0.06);

        // Corpo inclinado para a frente; mais ainda no bote
        const lean = 2 + atk * 3 + sh(9);
        const hipY = 14 + step * 0.3 - drop(0.15, 12);
        const hip = [sh(1), hipY];
        const neck = [hip[0] + lean, hipY + 9 - drop(0.0, 2)];

        // Pernas: a de trás mais escura
        const legs = [[-1, shade], [1, bone]];
        legs.forEach(([side, col]) => {
            const swing = side * (1.6 + atk * 2) + sh(side + 3);
            const foot = [hip[0] + swing, 0];
            const knee = [(hip[0] + foot[0]) / 2 + 1.8, hipY * 0.5 - drop(0.2, 4)];
            line([[hip[0], hip[1]], knee, foot], 1.3, col);
            line([foot, [foot[0] + 2.6, 0]], 1.2, col);
            dot(knee[0], knee[1], 0.75, col);
        });

        // Trapo podre pendurado na bacia, balançando
        for (let i = 0; i < 4; i++) {
            const x0 = hip[0] - 2 + i * 1.3;
            const len = 5 + (i % 2) * 2;
            const wav = Math.sin(t * 2.6 + i * 1.7) * 0.8;
            g.fillStyle = C.rag;
            g.strokeStyle = C.ragEdge;
            g.lineWidth = 0.3;
            g.beginPath();
            g.moveTo(x0 - 0.7, hip[1] + 0.5);
            g.lineTo(x0 + 0.7, hip[1] + 0.5);
            g.lineTo(x0 + 0.4 + wav - 1.5, hip[1] - len);
            g.lineTo(x0 - 0.3 + wav - 1.5, hip[1] - len + 1);
            g.closePath();
            g.fill();
            g.stroke();
        }

        // Braço de trás (atrás das costelas)
        const arm = (side, col) => {
            const reach = atk * 6 + (side < 0 ? 1 : 0);
            const sway = Math.sin(t * 2.4 + (side < 0 ? Math.PI : 0)) * 0.8;
            const sho = [neck[0] - 0.5, neck[1] - 1];
            const elb = [sho[0] + 2.5 + reach * 0.5 + sh(side), sho[1] - 3.5 + atk * 2 - drop(0.3, 8)];
            const hand = [elb[0] + 3 + reach * 0.6 + sway + sh(side + 1), elb[1] + 0.5 + atk * 2 - drop(0.3, 6)];
            line([sho, elb, hand], 1.1, col);
            dot(sho[0], sho[1], 0.9, col);
            dot(elb[0], elb[1], 0.7, col);
            const dir = Math.atan2(hand[1] - elb[1], hand[0] - elb[0]);
            [-0.5, 0, 0.5].forEach((a) => line([hand, [hand[0] + Math.cos(dir + a) * 1.6, hand[1] + Math.sin(dir + a) * 1.6]], 0.35, col));
        };
        arm(-1, shade);

        // Coluna: vértebras da bacia até o pescoço
        line([hip, neck], 0.5, shade);
        for (let i = 0; i <= 7; i++) {
            const k = i / 7;
            dot(hip[0] + (neck[0] - hip[0]) * k, hip[1] + (neck[1] - hip[1]) * k, 0.5, bone);
        }
        // Bacia com furo
        g.fillStyle = bone;
        g.strokeStyle = dark;
        g.lineWidth = 0.45;
        g.beginPath();
        g.ellipse(hip[0], hip[1], 2.2, 1.5, -0.3, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.fillStyle = C.socket;
        g.beginPath();
        g.ellipse(hip[0] + 0.4, hip[1] - 0.1, 0.6, 0.5, 0, 0, Math.PI * 2);
        g.fill();

        // Alma verde dentro da caixa torácica
        const chest = [hip[0] + lean * 0.62 + 1.2, hipY + 5.8 - drop(0.05, 3)];
        if (fall < 0.4) {
            const sz = 1.6 * (0.85 + 0.3 * pulse) * (1 - fall / 0.4);
            drawGlow(g, C.soulGlow, chest[0], chest[1], 6 * (0.8 + 0.3 * pulse), 0.6 + 0.3 * pulse);
            g.fillStyle = C.soul;
            g.beginPath();
            g.moveTo(chest[0], chest[1] + sz * 2.2);
            g.quadraticCurveTo(chest[0] + sz * 1.2, chest[1], chest[0], chest[1] - sz);
            g.quadraticCurveTo(chest[0] - sz * 1.2, chest[1], chest[0], chest[1] + sz * 2.2);
            g.fill();
            g.fillStyle = C.soulCore;
            g.beginPath();
            g.arc(chest[0], chest[1], sz * 0.45, 0, Math.PI * 2);
            g.fill();
        }
        // Costelas curvando da coluna para a frente
        for (let i = 0; i < 4; i++) {
            const k = 0.42 + i * 0.14;
            const bx = hip[0] + (neck[0] - hip[0]) * k;
            const by = hip[1] + (neck[1] - hip[1]) * k;
            const span = 3.2 - Math.abs(i - 1.5) * 0.4;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(bx, by);
            g.quadraticCurveTo(bx + span * 0.9, by + 0.9, bx + span * 0.95, by - 1.1);
            g.strokeStyle = dark;
            g.lineWidth = 0.75;
            g.stroke();
            g.strokeStyle = bone;
            g.lineWidth = 0.42;
            g.stroke();
        }
        // Clavícula
        line([[neck[0] - 1.4, neck[1] - 0.6], [neck[0] + 1.6, neck[1] - 1.2]], 0.6, bone);

        // Braço da frente
        arm(1, bone);

        // Crânio: tranco de vez em quando, mandíbula batendo
        const wave = Math.sin(t * 0.9);
        const twitch = wave > 0.97 ? (wave - 0.97) / 0.03 * 0.35 : 0;
        const jaw = Math.max(0, Math.sin(t * 7)) * 0.7 + atk * 0.8;
        g.save();
        g.translate(neck[0] + 1.6 + sh(5), Math.max(2.2, neck[1] + 2.6 + sh(6) - drop(0.0, 24)));
        g.rotate(-0.15 + twitch + fall * 1.4);
        // mandíbula
        g.fillStyle = shade;
        g.strokeStyle = dark;
        g.lineWidth = 0.4;
        g.beginPath();
        g.ellipse(1.2, -1.8 - jaw, 1.8, 0.8, -0.2, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.lineWidth = 0.25;
        for (const x of [0.8, 1.6, 2.4]) {
            g.beginPath();
            g.moveTo(x, -1.2 - jaw);
            g.lineTo(x, -1.9 - jaw);
            g.stroke();
        }
        // caixa craniana
        g.fillStyle = bone;
        g.lineWidth = 0.45;
        g.beginPath();
        g.ellipse(0, 0.4, 2.8, 2.4, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.fillStyle = shade;
        g.beginPath();
        g.ellipse(-1.1, 0.6, 1.4, 1.8, 0, 0, Math.PI * 2);
        g.fill();
        // focinho
        g.fillStyle = bone;
        g.beginPath();
        g.ellipse(2, -0.9, 1.3, 1.1, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        // rachadura
        g.strokeStyle = dark;
        g.lineWidth = 0.3;
        g.beginPath();
        g.moveTo(-1.8, 2.3);
        g.lineTo(-0.9, 1.5);
        g.lineTo(-0.5, 2.2);
        g.lineTo(0.3, 1.4);
        g.stroke();
        // órbita com chama verde e nariz
        g.fillStyle = C.socket;
        g.beginPath();
        g.ellipse(1.5, 0.5, 0.85, 1, 0, 0, Math.PI * 2);
        g.fill();
        if (fall < 0.5) {
            drawGlow(g, C.soulGlow, 1.6, 0.5, 2.6 * (0.8 + 0.4 * pulse), 0.9);
            g.fillStyle = C.soul;
            g.beginPath();
            g.arc(1.7, 0.5, 0.4 * (0.8 + 0.4 * pulse), 0, Math.PI * 2);
            g.fill();
        }
        g.fillStyle = C.socket;
        g.beginPath();
        g.moveTo(3.1, -0.3);
        g.lineTo(2.6, -0.9);
        g.lineTo(3.2, -1.1);
        g.closePath();
        g.fill();
        g.restore();
    }

    // ---------- BRUXA ----------
    function witch(g, o) {
        const C = WITCH;
        const t = o.t;
        const f = o.flash;
        const robe = tint(C.robe, f);
        const skin = tint(C.skin, f);
        const atk = o.attack;
        const charge = Math.max(o.telegraph ? 0.6 + 0.4 * Math.sin(t * 9) : 0, atk);
        const sink = o.dying * 10;            // afunda no manto ao morrer
        const sq = 1 - o.dying * 0.6;
        const hover = 1.2 + Math.sin(t * 1.6) * 0.8;
        const shk = o.hurt * Math.sin(t * 80) * 0.6;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.3);

        drawGlow(g, C.aura, 0, 10, 15, 0.22 + pulse * 0.08);

        g.save();
        g.translate(shk, hover - sink * 0.3);
        g.scale(1, sq);

        // Manto: base larga arrastando, barra rasgada balançando para trás
        const hemY = -hover + 0.3;
        const sho = [1.2 + atk * 1.5, 19];
        g.fillStyle = robe;
        g.strokeStyle = C.robeShade;
        g.lineWidth = 0.5;
        g.beginPath();
        g.moveTo(sho[0] - 4, sho[1] + 0.5);
        g.quadraticCurveTo(sho[0] + 3.5, sho[1] + 1, sho[0] + 4, sho[1] - 3);
        g.lineTo(5.5, hemY + 1);
        for (let i = 0; i <= 8; i++) {
            const x = 5.5 - i * 1.6;
            const y = hemY + (i % 2 ? 1.2 : 0) + Math.sin(t * 3 + i) * 0.4;
            g.lineTo(x - Math.sin(t * 1.8 + i * 0.7) * 0.6, y);
        }
        g.quadraticCurveTo(-8, 8, sho[0] - 4, sho[1] + 0.5);
        g.closePath();
        g.fill();
        g.stroke();
        // Dobras
        g.strokeStyle = C.robeFold;
        g.lineWidth = 0.45;
        for (const k of [-0.25, 0.25, 0.65]) {
            g.beginPath();
            g.moveTo(sho[0] + k * 4, sho[1] - 2);
            g.quadraticCurveTo(k * 6 + Math.sin(t * 2 + k * 5) * 0.5, 8, k * 9 - 1, hemY + 1.5);
            g.stroke();
        }
        // Cordão na cintura
        g.strokeStyle = C.rope;
        g.lineWidth = 0.7;
        g.beginPath();
        g.moveTo(-3.2, 11.5);
        g.quadraticCurveTo(0.5, 10.8, 4, 11.8);
        g.stroke();
        g.beginPath();
        g.moveTo(1, 11.2);
        g.lineTo(1.4 + Math.sin(t * 2.2) * 0.4, 8);
        g.stroke();

        // Mão de trás: garra aberta junto ao corpo
        claw(g, C, skin, sho[0] - 0.5, 12.5 + Math.sin(t * 1.4) * 0.5, -0.6);

        // Cabeça à frente dos ombros (corcunda)
        const head = [sho[0] + 3.2 + atk * 1.2, 20.5 + Math.sin(t * 1.6 + 1) * 0.3];
        // Capuz com ponta caindo para trás
        g.fillStyle = tint(C.hood, f);
        g.strokeStyle = C.robeShade;
        g.lineWidth = 0.5;
        g.beginPath();
        g.moveTo(head[0] + 2.4, head[1] - 2.4);
        g.quadraticCurveTo(head[0] + 3.1, head[1] + 3.5, head[0] - 0.5, head[1] + 3.8);
        g.quadraticCurveTo(head[0] - 4, head[1] + 3.6 + Math.sin(t * 2) * 0.4, head[0] - 6.5, head[1] + 1 + Math.sin(t * 2.4) * 0.6);
        g.quadraticCurveTo(head[0] - 3.5, head[1] - 0.2, head[0] - 2.8, head[1] - 3.2);
        g.closePath();
        g.fill();
        g.stroke();
        g.strokeStyle = C.hoodFold;
        g.lineWidth = 0.4;
        g.beginPath();
        g.moveTo(head[0] - 0.8, head[1] + 3.2);
        g.quadraticCurveTo(head[0] - 2.3, head[1] + 0.8, head[0] - 2, head[1] - 2.4);
        g.stroke();
        // Abertura escura do capuz
        g.fillStyle = C.hoodInner;
        g.beginPath();
        g.ellipse(head[0] + 1.2, head[1] - 0.3, 1.8, 2.6, -0.2, 0, Math.PI * 2);
        g.fill();
        // Cabelo claro escorrendo para fora do capuz
        g.strokeStyle = tint(C.hair, f);
        g.lineWidth = 0.45;
        g.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
            const x0 = head[0] - 0.3 + i * 0.35;
            g.beginPath();
            g.moveTo(x0, head[1] + 1.2);
            g.quadraticCurveTo(x0 - 0.8, head[1] - 2.5, x0 - 1 + Math.sin(t * 1.7 + i) * 0.5, head[1] - 5 - i * 0.5);
            g.strokeStyle = i % 2 ? C.hairShade : tint(C.hair, f);
            g.stroke();
        }
        // Rosto de perfil: testa, nariz comprido, queixo
        g.fillStyle = skin;
        g.strokeStyle = C.skinShade;
        g.lineWidth = 0.35;
        g.beginPath();
        g.moveTo(head[0] + 0.6, head[1] + 1.8);
        g.quadraticCurveTo(head[0] + 2, head[1] + 1.4, head[0] + 2.1, head[1] + 0.2);
        g.lineTo(head[0] + 3.4, head[1] - 0.9);           // ponta do nariz
        g.lineTo(head[0] + 2.2, head[1] - 1.1);
        g.quadraticCurveTo(head[0] + 2.4, head[1] - 1.8, head[0] + 2.1, head[1] - 2.3);
        g.quadraticCurveTo(head[0] + 2.4, head[1] - 2.8, head[0] + 1.6, head[1] - 3);  // queixo
        g.quadraticCurveTo(head[0] + 0.4, head[1] - 2.6, head[0] + 0.3, head[1] - 0.5);
        g.closePath();
        g.fill();
        g.stroke();
        g.strokeStyle = C.wrinkle;
        g.lineWidth = 0.22;
        g.beginPath();
        g.moveTo(head[0] + 1.1, head[1] - 1.9);
        g.quadraticCurveTo(head[0] + 1.6, head[1] - 1.6, head[0] + 2, head[1] - 2);
        g.stroke();
        // Olho vermelho brilhando
        const eyeK = 0.8 + 0.4 * pulse + charge * 0.5;
        drawGlow(g, C.eyeGlow, head[0] + 1.7, head[1] + 0.5, 1.8 * eyeK, 0.9);
        g.fillStyle = C.eye;
        g.beginPath();
        g.arc(head[0] + 1.7, head[1] + 0.5, 0.42, 0, Math.PI * 2);
        g.fill();

        // Braço da frente: manga larga e a mão com a bola de magia
        const hand = [sho[0] + 5 + atk * 3.5, 13 + charge * 2.5 + Math.sin(t * 1.6) * 0.4];
        g.fillStyle = robe;
        g.strokeStyle = C.robeShade;
        g.lineWidth = 0.45;
        g.beginPath();
        g.moveTo(sho[0] - 1, sho[1] - 0.6);
        g.quadraticCurveTo(sho[0] + 3.5, sho[1] - 1, hand[0] - 0.8, hand[1] + 1.4);
        g.lineTo(hand[0] - 1.4, hand[1] - 1.2);
        g.quadraticCurveTo(sho[0] + 1, sho[1] - 6, sho[0] - 2, sho[1] - 3);
        g.closePath();
        g.fill();
        g.stroke();
        g.strokeStyle = C.robeEdge;
        g.lineWidth = 0.4;
        g.beginPath();
        g.moveTo(hand[0] - 0.8, hand[1] + 1.4);
        g.lineTo(hand[0] - 1.4, hand[1] - 1.2);
        g.stroke();
        claw(g, C, skin, hand[0], hand[1], 0.3);

        // Bola de magia flutuando sobre a mão; cresce no aviso do golpe forte
        if (o.dying < 0.5) {
            const r = (1.3 + charge * 1.2) * (1 - o.dying * 2);
            const ox = hand[0] + 1.2;
            const oy = hand[1] + 2.2 + r;
            g.globalCompositeOperation = 'lighter';
            drawGlow(g, C.orbGlow, ox, oy, r * 3.2, 0.55 + 0.25 * pulse + charge * 0.3);
            g.globalCompositeOperation = 'source-over';
            g.fillStyle = C.orbCore;
            g.strokeStyle = C.orbRim;
            g.lineWidth = 0.5;
            g.beginPath();
            g.arc(ox, oy, r, 0, Math.PI * 2);
            g.fill();
            g.stroke();
            g.strokeStyle = C.orbSwirl;
            g.lineWidth = 0.3;
            g.beginPath();
            g.arc(ox, oy, r * 0.6, t * 4, t * 4 + 2.4);
            g.stroke();
            g.beginPath();
            g.arc(ox, oy, r * 0.35, -t * 6, -t * 6 + 2);
            g.stroke();
            // Faíscas roxas subindo
            for (let i = 0; i < 4; i++) {
                const k = (t * 0.8 + i / 4) % 1;
                const a = i * 1.9 + t;
                g.globalAlpha *= 1;
                drawGlow(g, i % 2 ? 'rgba(168, 85, 247, 0.9)' : 'rgba(46, 16, 70, 0.9)',
                    ox + Math.cos(a) * r * 1.4, oy + Math.sin(a) * r * 0.6 + k * 4, 0.6 + (1 - k) * 0.5, 1 - k);
            }
        }
        g.restore();
    }

    // Mão ossuda com três garras compridas
    function claw(g, C, skin, x, y, ang) {
        g.fillStyle = skin === C.skin ? C.hand : skin;
        g.strokeStyle = C.skinShade;
        g.lineWidth = 0.3;
        g.beginPath();
        g.ellipse(x, y, 0.9, 0.7, ang, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.strokeStyle = C.claw;
        g.lineWidth = 0.28;
        g.lineCap = 'round';
        for (const s of [-0.6, 0, 0.6]) {
            const a = ang + s - 0.4;
            g.beginPath();
            g.moveTo(x + Math.cos(a) * 0.7, y + Math.sin(a) * 0.7);
            g.quadraticCurveTo(x + Math.cos(a) * 1.8, y + Math.sin(a) * 1.8, x + Math.cos(a - 0.5) * 2.4, y + Math.sin(a - 0.5) * 2.4);
            g.stroke();
        }
    }

    // ---------- LOBO SOMBRIÇO (desenho próprio, referência: images/monsters/shadow-wolf.webp) ----------
    // Lobo de pelo cinza-azulado escuro com mechas claras, olhos vermelhos e boca vermelha;
    // a juba desgrenhada e o rabo se desfazem em fumaça preta para trás.
    const WOLF = {
        fur: '#2e2c3f', furDark: '#1a1826', furMid: '#3d3a55', furLight: '#8ea3bf', ink: '#07060c',
        smoke: '#0b0a12', mouth: '#7f1d1d', mouthDark: '#3b0a0a', fang: '#f1efe6', nose: '#111018',
        eye: '#ef4444', eyeGlow: 'rgba(239, 68, 68, 0.9)', aura: 'rgba(30, 27, 60, 0.75)'
    };

    // Mecha de pelo/fumaça: triângulo curvo saindo de (x, y) na direção ang
    function tuft(g, x, y, ang, len, w, bend, col) {
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const nx = -sa * w, ny = ca * w;
        const tx = x + ca * len - sa * bend, ty = y + sa * len + ca * bend;
        g.fillStyle = col;
        g.beginPath();
        g.moveTo(x - nx, y - ny);
        g.quadraticCurveTo(x + ca * len * 0.5 - nx * 0.5 - sa * bend * 0.6, y + sa * len * 0.5 - ny * 0.5 + ca * bend * 0.6, tx, ty);
        g.quadraticCurveTo(x + ca * len * 0.5 + nx * 0.5 - sa * bend * 0.3, y + sa * len * 0.5 + ny * 0.5 + ca * bend * 0.3, x + nx, y + ny);
        g.closePath();
        g.fill();
    }

    function wolf(g, o) {
        const C = WOLF;
        const t = o.t;
        const f = o.flash;
        const fur = tint(C.fur, f);
        const furD = tint(C.furDark, f);
        const furM = tint(C.furMid, f);
        const furL = tint(C.furLight, f);
        const atk = o.attack;
        const fall = o.dying;
        const sh = o.hurt * Math.sin(t * 85) * 0.7;
        const breath = Math.sin(t * 2.6);
        const crouch = o.telegraph ? 1.3 : 0;
        const jump = Math.sin(atk * Math.PI) * 4;
        const bodyY = 9.5 - crouch + jump + breath * 0.2 - fall * 5;
        const tilt = -atk * 0.15;
        const hip = [-6, bodyY];
        const sho = [4.5, bodyY + 0.8 + atk * 1.2];

        drawGlow(g, C.aura, -1, 8, 15, 0.35);
        g.save();
        g.translate(sh, 0);

        // Fumaça preta soltando da traseira e da juba, subindo para trás (some primeiro ao morrer)
        for (let i = 0; i < 7; i++) {
            const k = (t * 0.6 + i / 7) % 1;
            const sx = hip[0] - 1 - k * 7 + Math.sin(i * 2.1) * 1.5;
            const sy = bodyY + 1 + k * 5 + Math.sin(t * 2 + i) * 0.8;
            g.globalAlpha = (1 - k) * 0.8 * (1 - fall);
            tuft(g, sx, sy, Math.PI * (0.85 + Math.sin(i) * 0.1), 2.5 + (1 - k) * 2, 0.7 * (1 - k * 0.5), Math.sin(t * 3 + i), C.smoke);
        }
        g.globalAlpha = 1;
        // Rabo de fumaça
        for (let i = 0; i < 4; i++) {
            const wav = Math.sin(t * 3 + i * 0.9) * 1.2;
            tuft(g, hip[0] - 0.5, hip[1] + 0.8, 2.75 + i * 0.12, 6 - i * 0.8, 1.2 - i * 0.2, wav, i % 2 ? C.smoke : furD);
        }

        // Pernas: as de longe mais escuras
        const leg = (x, y, side, front) => {
            const col = side < 0 ? furD : fur;
            const ph = t * 2.6 + (front ? 0 : Math.PI) + (side < 0 ? 0.6 : 0);
            const lift = o.telegraph ? 0 : Math.max(0, Math.sin(ph)) * 0.6;
            const reach = atk ? (front ? 3 : -3) * Math.sin(atk * Math.PI) : 0;
            const foot = [x + (front ? 0.6 : -0.6) + reach, Math.max(0, lift + jump * 0.5 - fall * 2)];
            const knee = [x + (front ? -0.4 : 1.6) + reach * 0.5, (y + foot[1]) * 0.5 + 0.4];
            g.strokeStyle = C.ink;
            g.lineCap = 'round';
            g.lineJoin = 'round';
            g.lineWidth = front ? 1.6 : 1.9;
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(knee[0], knee[1]);
            g.lineTo(foot[0], foot[1]);
            g.lineTo(foot[0] + 1.3, foot[1]);
            g.stroke();
            g.strokeStyle = col;
            g.lineWidth = front ? 1.05 : 1.3;
            g.stroke();
        };
        leg(hip[0] + 0.5, hip[1] - 1, -1, false);
        leg(sho[0] - 0.5, sho[1] - 1.4, -1, true);

        // Corpo: costas arqueadas, peito fundo, barriga recolhida
        g.save();
        g.translate(0, bodyY);
        g.rotate(tilt);
        g.translate(0, -bodyY);
        g.fillStyle = fur;
        g.strokeStyle = C.ink;
        g.lineWidth = 0.5;
        g.beginPath();
        g.moveTo(hip[0] - 1.8, hip[1] + 1);
        g.quadraticCurveTo(-1, bodyY + 3.6, sho[0] + 0.5, sho[1] + 3);
        g.quadraticCurveTo(sho[0] + 3.2, sho[1] + 0.5, sho[0] + 1.6, sho[1] - 2.8);
        g.quadraticCurveTo(0, bodyY - 1.8, hip[0] - 0.4, hip[1] - 2);
        g.quadraticCurveTo(hip[0] - 2.6, hip[1] - 0.6, hip[0] - 1.8, hip[1] + 1);
        g.closePath();
        g.fill();
        g.stroke();
        // Sombra da barriga e mechas claras no lombo
        g.fillStyle = furD;
        g.beginPath();
        g.ellipse(0, bodyY - 0.9, 5, 1, 0, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = furL;
        g.lineWidth = 0.3;
        g.lineCap = 'round';
        for (let i = 0; i < 6; i++) {
            const x = hip[0] + 0.5 + i * 1.8;
            const y = bodyY + 1.8 + Math.sin(i * 1.7) * 0.5;
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x - 1.4, y + 0.4);
            g.stroke();
        }
        // Pelo desfiado no lombo virando fumaça
        for (let i = 0; i < 6; i++) {
            const x = hip[0] + i * 1.9;
            const wav = Math.sin(t * 4 + i * 1.3) * 0.5;
            tuft(g, x, bodyY + 2.6 + Math.sin(i * 0.8) * 0.3, 2.5, 2.2 + (i % 2), 0.6, wav, i % 2 ? furD : C.smoke);
        }
        g.restore();

        // Pernas de perto
        leg(hip[0] + 0.5, hip[1] - 1, 1, false);
        leg(sho[0] - 0.5, sho[1] - 1.4, 1, true);

        // Juba volumosa no pescoço, desgrenhada para trás
        const nx = sho[0] + 0.8;
        const ny = sho[1] + 2 - crouch * 0.5;
        for (let i = 0; i < 9; i++) {
            const a = 2.2 + i * 0.22 + Math.sin(t * 3 + i) * 0.06;
            const col = i % 3 === 0 ? furM : i % 3 === 1 ? fur : furD;
            tuft(g, nx + Math.cos(a) * 0.6, ny + Math.sin(a) * 0.6 - 0.8, a, 3.4 + (i % 2) * 1.2, 1, Math.sin(t * 3.4 + i) * 0.5, col);
        }
        // Mechas da juba se soltando como fumaça
        for (let i = 0; i < 3; i++) {
            const k = (t * 0.8 + i / 3) % 1;
            g.globalAlpha = (1 - k) * (1 - fall);
            tuft(g, nx - 3 - k * 4, ny + 1.5 + k * 3 - i, 2.7, 2 + k, 0.5, Math.sin(t * 4 + i), C.smoke);
        }
        g.globalAlpha = 1;
        // Peito claro
        g.fillStyle = furM;
        g.beginPath();
        g.ellipse(sho[0] + 1.4, sho[1] - 0.6, 1.3, 2.2, 0.3, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = furL;
        g.lineWidth = 0.25;
        for (let i = 0; i < 3; i++) {
            g.beginPath();
            g.moveTo(sho[0] + 1 + i * 0.4, sho[1] + 0.8 - i * 0.6);
            g.lineTo(sho[0] + 0.6 + i * 0.4, sho[1] - 0.6 - i * 0.6);
            g.stroke();
        }

        // Cabeça: rosnando, boca vermelha que abre no bote e no aviso
        const snarl = Math.max(atk, o.telegraph ? 0.65 + 0.25 * Math.sin(t * 12) : 0.18 + 0.08 * breath);
        g.save();
        g.translate(nx + 1.6, ny + 0.4);
        g.rotate(-0.1 - crouch * 0.12 + tilt + fall * 0.6);
        g.scale(1.35, 1.35);   // cabeça grande: é o destaque da imagem de referência
        // Mandíbula de baixo
        g.save();
        g.rotate(-snarl * 0.5);
        g.fillStyle = furD;
        g.strokeStyle = C.ink;
        g.lineWidth = 0.4;
        g.beginPath();
        g.moveTo(0, -0.5);
        g.lineTo(4.3, -0.8);
        g.quadraticCurveTo(4.4, -1.6, 3.6, -1.7);
        g.quadraticCurveTo(1.4, -2.3, -0.5, -1.4);
        g.closePath();
        g.fill();
        g.stroke();
        g.fillStyle = C.fang;
        for (const x of [1.6, 2.6, 3.6]) {
            g.beginPath();
            g.moveTo(x, -0.8);
            g.lineTo(x + 0.25, x > 3 ? 0.2 : -0.2);
            g.lineTo(x + 0.5, -0.8);
            g.fill();
        }
        g.restore();
        // Boca por dentro
        const ja = -snarl * 0.5;
        g.fillStyle = C.mouth;
        g.beginPath();
        g.moveTo(0.3, -0.6);
        g.lineTo(4.6, -0.55);
        g.lineTo(4.3 * Math.cos(ja) + 0.8 * Math.sin(ja), 4.3 * Math.sin(ja) - 0.8 * Math.cos(ja));
        g.closePath();
        g.fill();
        g.fillStyle = C.mouthDark;
        g.beginPath();
        g.moveTo(0.3, -0.6);
        g.lineTo(2, -0.6);
        g.lineTo(2 * Math.cos(ja) + 0.6 * Math.sin(ja), 2 * Math.sin(ja) - 0.6 * Math.cos(ja));
        g.closePath();
        g.fill();
        // Crânio e focinho, testa franzida
        g.fillStyle = fur;
        g.strokeStyle = C.ink;
        g.lineWidth = 0.45;
        g.beginPath();
        g.moveTo(-1.8, -1.2);
        g.quadraticCurveTo(-2, 2.6, 0.4, 2.4);
        g.quadraticCurveTo(1.6, 2.2, 2.2, 1.4);
        g.lineTo(5.3, 0.4);
        g.quadraticCurveTo(6, 0, 5.6, -0.6);
        g.lineTo(0.2, -0.6);
        g.closePath();
        g.fill();
        g.stroke();
        // Mecha clara no focinho e na bochecha
        g.fillStyle = furL;
        g.beginPath();
        g.moveTo(2.4, 0.9);
        g.quadraticCurveTo(4, 0.6, 5, 0.2);
        g.quadraticCurveTo(3.8, 0.2, 2.6, 0.4);
        g.closePath();
        g.fill();
        g.beginPath();
        g.moveTo(-0.6, 0.2);
        g.quadraticCurveTo(0.6, -0.4, 1.8, 0.1);
        g.quadraticCurveTo(0.8, 0.5, -0.6, 0.2);
        g.fill();
        // Rugas do rosnado no focinho
        g.strokeStyle = C.ink;
        g.lineWidth = 0.22;
        for (const x of [3, 3.7]) {
            g.beginPath();
            g.moveTo(x, 0.95 - (x - 3) * 0.3);
            g.quadraticCurveTo(x + 0.2, 0.4, x, 0.1);
            g.stroke();
        }
        // Nariz
        g.fillStyle = C.nose;
        g.beginPath();
        g.ellipse(5.6, -0.15, 0.55, 0.42, 0, 0, Math.PI * 2);
        g.fill();
        // Presas de cima
        g.fillStyle = C.fang;
        for (const x of [1.4, 2.4, 3.4, 4.3]) {
            const big = x === 1.4 || x === 4.3;
            g.beginPath();
            g.moveTo(x, -0.6);
            g.lineTo(x + 0.25, big ? -1.7 : -1.2);
            g.lineTo(x + 0.5, -0.6);
            g.fill();
        }
        // Orelhas em pé
        for (const [ox, col] of [[-1.4, furD], [-0.4, fur]]) {
            g.fillStyle = col;
            g.strokeStyle = C.ink;
            g.lineWidth = 0.4;
            g.beginPath();
            g.moveTo(ox - 0.6, 1.8);
            g.lineTo(ox - 0.3 - crouch * 0.6, 4.6 - crouch * 0.6);
            g.lineTo(ox + 1.2, 2.1);
            g.closePath();
            g.fill();
            g.stroke();
        }
        // Sobrancelha franzida e olho vermelho brilhando
        g.fillStyle = furM;
        g.beginPath();
        g.moveTo(0.4, 1.7);
        g.lineTo(2.6, 1.05);
        g.lineTo(2.2, 1.45);
        g.closePath();
        g.fill();
        const pulse = 0.5 + 0.5 * Math.sin(t * 3);
        drawGlow(g, C.eyeGlow, 1.6, 0.95, 2.2 * (0.8 + 0.3 * pulse + (o.telegraph ? 0.4 : 0)), 0.9);
        g.fillStyle = C.eye;
        g.beginPath();
        g.ellipse(1.6, 0.95, 0.5, 0.36, -0.25, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#fee2e2';
        g.beginPath();
        g.arc(1.75, 1.02, 0.12, 0, Math.PI * 2);
        g.fill();
        g.restore();
        g.restore();
    }

    // ---------- ESPECTRO CORROMPIDO (espectro do Last Torch, com olhos vermelhos como na imagem do RPG) ----------
    const WRAITH = {
        cloak: '#0b2530', cloakLight: '#155e75', wisp: 'rgba(103, 232, 249, 0.5)',
        eye: '#fca5a5', eyeGlow: 'rgba(239, 68, 68, 0.95)', aura: 'rgba(34, 211, 238, 0.55)',
        aimAura: 'rgba(165, 243, 252, 0.95)'
    };

    function wraith(g, o) {
        const C = WRAITH;
        const t = o.t;
        const f = o.flash;
        const atk = o.attack;
        const aim = o.telegraph ? 1 : 0;
        const fly = 6 + Math.sin(t * 1.1 * Math.PI * 2 * 0.5) * 1.4 - o.dying * 3;
        const stretch = 1 + atk * 0.6;                  // no bote os fiapos esticam para trás
        const lean = 0.2 + atk * 0.35;
        const sh = o.hurt * Math.sin(t * 80) * 0.7;
        const fade = 0.86 * (1 - o.dying * 0.5);
        const cloak = tint(C.cloak, f);
        const light = tint(C.cloakLight, f);

        drawGlow(g, C.aura, 0, fly + 9, 15, 0.22 + aim * 0.2);
        if (aim) {
            g.globalCompositeOperation = 'lighter';
            drawGlow(g, C.aimAura, 0, fly + 10, 11, 0.25 + 0.2 * Math.sin(t * 9));
            g.globalCompositeOperation = 'source-over';
        }
        g.save();
        g.translate(sh, fly);
        g.rotate(-lean);
        const prev = g.globalAlpha;
        g.globalAlpha = prev * fade;

        // Fiapos de névoa saindo da barra do manto, ondulando para trás e para baixo
        g.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
            const x0 = -2 + i * 1.3;
            const len = (5 + (i % 2) * 2.5) * stretch;
            const wav = Math.sin(t * 2.4 * Math.PI + i * 1.3) * 1.2;
            g.strokeStyle = i % 2 ? cloak : light;
            g.lineWidth = 1.8 - i * 0.15;
            g.beginPath();
            g.moveTo(x0, 1);
            g.quadraticCurveTo(x0 - len * 0.4 + wav, -len * 0.4, x0 - len * 0.9 - wav * 0.5, -len * 0.55 + wav * 0.3);
            g.stroke();
            g.strokeStyle = C.wisp;
            g.lineWidth = 0.5;
            g.stroke();
        }

        // Manto em gota: largo em cima, afinando em fiapos embaixo
        g.fillStyle = cloak;
        g.strokeStyle = light;
        g.lineWidth = 0.5;
        g.beginPath();
        g.moveTo(-3.8, 1.5);
        g.quadraticCurveTo(-5.2, 9, -2.5, 16);
        g.quadraticCurveTo(0.5, 19.5, 3.5, 16.5);
        g.quadraticCurveTo(5.2, 11, 4.2, 2);
        for (let i = 0; i <= 5; i++) {
            const x = 4.2 - i * 1.6;
            g.lineTo(x, (i % 2 ? 2.4 : 0.6) + Math.sin(t * 5 + i) * 0.4);
        }
        g.closePath();
        g.fill();
        g.stroke();
        // Dobras claras
        g.strokeStyle = light;
        g.lineWidth = 0.4;
        for (const k of [-1.5, 0.5, 2.3]) {
            g.beginPath();
            g.moveTo(k * 0.5, 14);
            g.quadraticCurveTo(k + Math.sin(t * 2 + k) * 0.5, 8, k * 1.1, 2);
            g.stroke();
        }
        // Braços de manto estendidos para a frente, mãos de névoa
        const reach = 2 + atk * 3 + aim * 1;
        for (const side of [-1, 1]) {
            const y0 = 13 - (side < 0 ? 0.6 : 0);
            const hx = 3 + reach + (side < 0 ? -0.8 : 0) + Math.sin(t * 2 + side) * 0.4;
            const hy = y0 - 3 + Math.sin(t * 2.2 + side) * 0.5;
            g.strokeStyle = side < 0 ? C.cloak : light;
            g.lineWidth = 1.7;
            g.beginPath();
            g.moveTo(1.5, y0);
            g.quadraticCurveTo(hx - 1, y0, hx, hy);
            g.stroke();
            drawGlow(g, C.wisp, hx + 0.4, hy, 1.8, 0.8);
        }
        // Capuz vazio: só escuro e dois olhos vermelhos acesos
        g.fillStyle = cloak;
        g.strokeStyle = light;
        g.lineWidth = 0.5;
        g.beginPath();
        g.ellipse(1, 16.6, 3.3, 3.5, -0.2, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.fillStyle = '#020a0d';
        g.beginPath();
        g.ellipse(2.3, 16.2, 1.9, 2.4, -0.2, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = prev;
        const eyeK = 1 + aim * 0.6 + atk * 0.4;
        for (const dx of [1.9, 3.2]) {
            drawGlow(g, C.eyeGlow, dx, 16.6, 1.6 * eyeK, 0.9);
            g.fillStyle = C.eye;
            g.beginPath();
            g.ellipse(dx, 16.6, 0.32, 0.5, 0, 0, Math.PI * 2);
            g.fill();
        }
        g.restore();
    }

    const PAINTERS = { skeleton, witch, wolf, wraith };
    const SIZE = { wolf: 0.9 };   // ajuste de tamanho por tipo (o lobo, com a cabeça grande, passaria do herói)

    // opts: x, y (pés na tela), s (pixels por unidade), hs (achatamento da altura), facing (-1 olha para a esquerda),
    // t (segundos), alpha, flash (0-1), hurt (0-1), attack (0-1, bote), dying (0-1), telegraph (bool), scale
    function paint(kind, g, o) {
        const fn = PAINTERS[kind];
        if (!fn || o.alpha <= 0) return;
        const k = (o.scale || 1) * (SIZE[kind] || 1);
        g.save();
        g.globalAlpha = o.alpha;
        g.translate(o.x, o.y);
        g.scale(o.s * k * (o.facing || -1), -o.s * k * o.hs);
        fn(g, o);
        g.restore();
        g.globalAlpha = 1;
    }

    NS.monsters = { kindFor, paint };
})();
