// --- DADOS VISUAIS: Rebate (passiva Mirror Ward). ---
// Cores, tamanhos e ritmos de animação lidos por js/render/reflect.js.
// O tempo de recarga e o dano ficam em MIRROR_WARD (data_model/passives.js).

export const REFLECT_VISUALS = {
    colors: {
        shield: '#7dd3fc',
        shieldCore: '#f0f9ff',
        flash: 'rgba(186, 230, 253, 0.9)',
        ring: '#38bdf8',
        ready: 'rgba(125, 211, 252, 0.28)',
        recharge: 'rgba(125, 211, 252, 0.55)',
        boltCore: '#f0f9ff',
        boltRim: '#38bdf8',
        boltGlow: 'rgba(56, 189, 248, 0.85)',
        trailLight: '#bae6fd',
        trailDark: '#0c4a6e'
    },

    // Animação do rebate (parry): escudo em arco na direção do tiro + anel + clarão
    parrySeconds: 0.4,
    shieldDistance: 26,         // distância do herói até o arco do escudo
    shieldHalfAngle: 0.95,      // abertura do arco (radianos)
    shieldLineWidth: 4,
    shieldGlow: 14,
    shieldPushOut: 10,          // quanto o escudo se afasta do herói enquanto some
    ringStartRadius: 14,
    ringEndRadius: 52,
    ringLineWidth: 2.5,
    flashRadius: 34,

    // Indicador discreto ao redor do herói
    readyRadius: 21,            // anel fraco quando o rebate está pronto
    readyPulseHz: 1.4,
    rechargeRadius: 19,         // arco fino que enche enquanto recarrega
    indicatorLineWidth: 1.2,

    // Tiro rebatido (em múltiplos do raio do projétil)
    bolt: {
        glowRadius: 3.4,
        trailParticles: 6,
        trailSpacing: 0.9,
        spinHz: 4
    }
};
