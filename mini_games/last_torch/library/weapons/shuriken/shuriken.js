// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/weapons/shuriken/shuriken.js e rode o sync.
// --- SHURIKEN (estrela ninja de arremesso, 4 pontas) ---
// Desenhada em +x com a origem no centro da estrela (o jogo gira o desenho em voo: weapon.spin).
export const SHURIKEN_VISUALS = {
    colors: {
        steel: '#cfd6e0', steelShade: '#7b8494', steelLight: '#f4f7fb', outline: '#1b1f2a', hole: '#0f1218',
        glow: 'rgba(165, 180, 252, 0.55)', trail: 'rgba(224, 231, 255, 0.85)', shadow: 'rgba(0, 0, 0, 0.35)', edge: '#e0e7ff'
    },
    shape: { points: 4, outer: 5.2, inner: 1.5, hole: 0.7, centerX: 0 }
};

export function drawShuriken(ctx, t) {
    const S = SHURIKEN_VISUALS.shape, C = SHURIKEN_VISUALS.colors;
    const n = S.points;
    const star = () => {
        ctx.beginPath();
        for (let i = 0; i < n * 2; i++) {
            const a = (i / (n * 2)) * Math.PI * 2;
            // as pontas são curvas (a ponta de cada braço "vira" para o lado do giro)
            const r = i % 2 === 0 ? S.outer : S.inner;
            const swirl = i % 2 === 0 ? 0.18 : 0;
            ctx.lineTo(Math.cos(a + swirl) * r, Math.sin(a + swirl) * r);
        }
        ctx.closePath();
    };
    ctx.lineJoin = 'miter';
    star();
    ctx.fillStyle = C.steel;
    ctx.fill();
    // metade de cada braço mais escura: dá a ideia de lâmina facetada
    ctx.fillStyle = C.steelShade;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a + 0.18) * S.outer, Math.sin(a + 0.18) * S.outer);
        ctx.lineTo(Math.cos(a + Math.PI / n) * S.inner, Math.sin(a + Math.PI / n) * S.inner);
        ctx.closePath();
        ctx.fill();
    }
    star();
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.55;
    ctx.stroke();
    // brilho nas pontas e furo no meio
    ctx.fillStyle = C.steelLight;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.18;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * S.outer * 0.86, Math.sin(a) * S.outer * 0.86, 0.35, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = C.hole;
    ctx.beginPath();
    ctx.arc(0, 0, S.hole, 0, Math.PI * 2);
    ctx.fill();
}
