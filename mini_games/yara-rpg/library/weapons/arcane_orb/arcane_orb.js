// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/weapons/arcane_orb/arcane_orb.js e rode o sync.
// --- ESFERA ARCANA (arremesso do Gudran) ---
// Uma esfera de energia azul com um anel claro em volta e um rastro curto atrás. Desenhada ao longo de +x (a cauda atrás, a frente
// em +x), origem no centro, no mesmo molde do crucifixo e da adaga (usada em voo, em weapons/thrown.js, e na mão do herói).
export const ARCANE_ORB_VISUALS = {
    colors: { glow: '#60a5fa', trail: 'rgba(96, 165, 250, 0.55)', shadow: 'rgba(15, 23, 42, 0.35)', edge: '#bfdbfe', core: '#eff6ff', body: '#3b82f6', rim: '#1d4ed8' },
    shape: { centerX: 0, radius: 2.6, tail: 5.5 }
};

export function drawArcaneOrb(ctx, t) {
    const C = ARCANE_ORB_VISUALS.colors;
    const S = ARCANE_ORB_VISUALS.shape;
    const pulse = 1 + 0.1 * Math.sin((t ?? 0) * 8);
    // Rastro: uma cauda que afina para trás
    const tail = ctx.createLinearGradient(-S.tail, 0, 0, 0);
    tail.addColorStop(0, 'rgba(96, 165, 250, 0)');
    tail.addColorStop(1, C.trail);
    ctx.fillStyle = tail;
    ctx.beginPath();
    ctx.moveTo(-S.tail, 0);
    ctx.lineTo(0, -S.radius * 0.85);
    ctx.lineTo(0, S.radius * 0.85);
    ctx.closePath();
    ctx.fill();
    // Brilho, corpo, anel e miolo
    ctx.fillStyle = 'rgba(96, 165, 250, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, S.radius * 1.55 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.body;
    ctx.strokeStyle = C.rim;
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.arc(0, 0, S.radius * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = C.edge;
    ctx.lineWidth = 0.35;
    ctx.beginPath();
    ctx.arc(0, 0, S.radius * 0.78, -2.4, 0.4);
    ctx.stroke();
    ctx.fillStyle = C.core;
    ctx.beginPath();
    ctx.arc(S.radius * 0.18, -S.radius * 0.1, S.radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
}
