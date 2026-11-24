// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/weapons/kunai/kunai.js e rode o sync.
// --- KUNAI (faca de arremesso do Kurama) ---
// Folha de aço escuro com argola no cabo e cabo enfaixado. Desenhada em +x, origem no meio do cabo; voa reto e gira de leve.
export const KUNAI_VISUALS = {
    colors: {
        steel: '#b9c0cb', steelShade: '#6b7280', steelLight: '#eef2f7', outline: '#101216', wrap: '#25262b', wrapLine: '#4b4d57',
        glow: 'rgba(203, 213, 225, 0.5)', trail: 'rgba(226, 232, 240, 0.85)', shadow: 'rgba(0, 0, 0, 0.35)', edge: '#e2e8f0'
    },
    shape: { ring: -6.2, ringR: 1.9, gripStart: -4.2, gripEnd: 0.5, gripHalf: 0.75, bladeStart: 0.5, bladeEnd: 9, bladeHalf: 2.3, centerX: 1 }
};

export function drawKunai(ctx, t) {
    const S = KUNAI_VISUALS.shape, C = KUNAI_VISUALS.colors;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // argola
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(S.ring, 0, S.ringR, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.steel;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // cabo enfaixado
    ctx.fillStyle = C.wrap;
    ctx.fillRect(S.gripStart, -S.gripHalf, S.gripEnd - S.gripStart, S.gripHalf * 2);
    ctx.strokeStyle = C.wrapLine;
    ctx.lineWidth = 0.4;
    for (let x = S.gripStart + 0.6; x < S.gripEnd; x += 0.9) { ctx.beginPath(); ctx.moveTo(x - 0.4, -S.gripHalf); ctx.lineTo(x + 0.4, S.gripHalf); ctx.stroke(); }
    // lâmina em folha: metade clara, metade na sombra
    for (const side of [-1, 1]) {
        ctx.fillStyle = side < 0 ? C.steelLight : C.steelShade;
        ctx.beginPath();
        ctx.moveTo(S.bladeStart, 0);
        ctx.lineTo(S.bladeStart + 0.4, side * S.bladeHalf * 0.55);
        ctx.quadraticCurveTo(S.bladeStart + 3.5, side * S.bladeHalf * 1.15, S.bladeEnd, 0);
        ctx.closePath();
        ctx.fill();
    }
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(S.bladeStart + 0.4, -S.bladeHalf * 0.55);
    ctx.quadraticCurveTo(S.bladeStart + 3.5, -S.bladeHalf * 1.15, S.bladeEnd, 0);
    ctx.quadraticCurveTo(S.bladeStart + 3.5, S.bladeHalf * 1.15, S.bladeStart + 0.4, S.bladeHalf * 0.55);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = C.edge;
    ctx.lineWidth = 0.3;
    ctx.beginPath(); ctx.moveTo(S.bladeStart + 0.8, 0); ctx.lineTo(S.bladeEnd - 1.5, 0); ctx.stroke();
}
