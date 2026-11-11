// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/characters/hunter/hero_hooks.js e rode o sync.
// --- O QUE O JOGO ACRESCENTA AO BONECO 2.5D ---
// O boneco (hero25d.js) e a animação dele (hero_anim.js) não conhecem as regras do jogo que os usa. O jogo liga aqui,
// com setHeroHooks, o que muda o desenho: o gesto de arremesso, o que a mão livre segura, efeitos na lâmina,
// equipamento extra... Tudo é opcional: sem ganchos o boneco anda, corre, golpeia, dá dash e faz os golpes especiais.
// No Last Torch quem liga é js/render/player25d.js.
export const heroHooks = {
    // --- ARREMESSO (mão livre) ---
    // Medidas do gesto: { throwSeconds, throwLean, windupFraction, releaseFraction, letGoFraction, handScale, colors: { trail } }
    throwVisual: null,
    // Progresso do arremesso agora: 0 a 1 durante o gesto, -1 fora dele
    throwProgress: () => -1,
    // O arremesso ainda está acontecendo no instante now (ms)? O boneco vira rápido para throwAngle()
    throwing: (now) => false,
    throwAngle: () => 0,
    // Mão puxada para trás carregando (0 a 1): um arremesso carregado e uma bola de fogo crescendo
    chargeRatio: () => 0,
    fireHoldRatio: () => 0,
    // Desenha o que está na mão livre durante o arremesso ou a carga: (rig, { shoulder, hand, pose, charge, fireHold })
    drawHeldItem: null,

    // --- LÂMINA ---
    // Golpe novo: o corte que o jogo acabou de fazer por este corpo ({ arcWidth, spin }), ou null
    lastSlash: (body) => null,
    // Lâmina acesa (cores bladeGlow*Frenzy)
    frenzy: (body) => !!body.enraged,
    // Brilho extra em volta da lâmina, já em modo 'lighter': (rig, body, x, y)
    drawBladeAura: null,
    // Por cima da lâmina (fogo etc.): (rig, body, hand, dir, t). rig.bladeLength tem o comprimento atual
    drawBladeExtras: null,

    // --- EQUIPAMENTO EXTRA (gear) ---
    // gear é uma chave do jogo (ou null). gearShape(gear): { bladeLength, bladeWidth, hoodTip, hoodRise } (multiplicadores)
    gearShape: (gear) => null,
    // No chão, antes do corpo: (gear, pose, rig)
    gearGround: null,
    // Peças a mais, ordenadas por profundidade junto com o corpo: (gear, pose, rig) => [{ depth, draw }]
    gearParts: null
};

export function setHeroHooks(values) {
    Object.assign(heroHooks, values);
}
