// --- BATIDAS, SMASH E K.O. ---
export const COMBAT = {
    hitCooldownFrames: 12,     // a mesma batida não conta duas vezes
    dashMomentumTransfer: 0.35, // fração do momento do dash transferida como impulso extra
    maxDashImpulse: 24,         // limite para o bônus de impulso do dash
    hitStopFrames: { normal: 2, dash: 5, headBounce: 4, smash: 9 },
    shake: { normal: 7, dash: 14, headBounce: 8, smash: 18, ko: 20 },
    platformShrinkOnHit: 1.5,
    smash: {
        aboveRatio: 0.3,       // atacante precisa estar acima do rival
        stunFrames: 150,       // atordoado ~2,5 s: não toma dano, mas dá para pisar na cabeça e lançar outro SKY DROP
        pushX: 0.15,
        victimFallInAir: 15,
        victimFallOnGround: 2,
        attackerBounce: 10,
        platformShrink: 3,
        botTauntChance: 0.5
    },
    // SKY DROP: pisar na cabeça do rival lança você como um foguete para fora da tela, por cima. Lá em cima
    // você anda pros lados com uma mira no chão logo abaixo e depois despenca (um SMASH em linha reta) nela.
    skyDrop: {
        launchSpeed: 10,       // velocidade de saída do foguete
        rocketAccel: 1.4,      // o foguete acelera a cada frame...
        rocketMaxSpeed: 36,    // ... até essa velocidade
        hoverY: -160,          // altura em que fica lá em cima (negativo = acima da tela)
        hoverFrames: 300,      // 5 s lá em cima antes de cair sozinho (▼ solta na hora)
        moveSpeed: 7,          // velocidade lateral lá em cima (multiplicada pela velocidade do bicho)
        moveLerp: 0.2,
        fallSpeed: 24,         // velocidade inicial da queda
        // Pouso do SKY DROP (mesmo errando o rival): onda de choque que o atira para longe.
        // Alcance e força crescem com a raiz da massa de quem cai; a massa de quem leva reduz o efeito.
        shock: {
            range: 150,        // alcance horizontal com massa 1
            push: 10,          // empurrão horizontal com massa 1 (rival de massa 1)
            lift: 7,           // sobe um pouco, para sair do chão e deslizar
            falloff: 0.45,     // no limite do alcance a força cai por esse fator
            stunFrames: 16,    // rival atordoado um instante (não corta o arremesso com dash)
            shake: 22,
            hitStopFrames: 7
        }
    },
    // MEDIDOR DE ESPECIAL: enche batendo e apanhando; cheio, o próximo DASH vira o DASH TURBO,
    // que tira um coração de quem acertar (K.O. se for o último). Errar gasta o medidor do mesmo jeito.
    special: {
        max: 100,
        passivePerFrame: 0.02,       // ~1,2 por segundo: mesmo sem bater, o medidor chega lá com o tempo
        gain: {
            hit: 12,                 // batida normal: vale para quem bateu e para quem apanhou
            dashHit: 20,             // batida com dash (quem usou o dash)
            takeHit: 12,             // apanhar de uma batida com dash
            smash: 15,               // quem deu o smash
            takeSmash: 25,           // quem levou o smash (reação de quem está perdendo)
            stomp: 18                // pisar na cabeça (SKY DROP)
        },
        turbo: {
            speedMul: 1.45,          // velocidade do dash
            framesMul: 1.3,          // duração do dash
            cooldown: 75,            // recarga do dash depois do turbo
            forceMul: 1.8,           // multiplica o impulso da batida
            maxImpulseMul: 2,        // limite do impulso (múltiplo de maxDashImpulse)
            stunFrames: 45,          // o rival atingido fica atordoado
            shake: 24,
            hitStopFrames: 11
        }
    },
    replayFrames: 55,          // quanto do final entra no replay (curto: ~1,5 s)
    replaySpeed: 0.6,
    replayZoom: 1.8
};
