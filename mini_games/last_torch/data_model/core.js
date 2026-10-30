export const CORE_MODEL = {
    name: 'Torch',
    initialHp: 100,
    collisionRadius: 22,
    playerBlockRadius: 40,    // o herói não entra neste raio em volta da tocha
    damageTakenPerMonster: 12,   // monstros sem torchDamage próprio
    bossHitDamage: 5,            // boss encostado na tocha: dano a cada bossHitSeconds
    bossHitSeconds: 1.6,
    bossStopDistance: 74,        // o boss para aqui, em vez de se jogar na chama
    lowHpRatio: 0.35,            // abaixo disso a tocha pede socorro
    visualRadius: 22,
    pulseRadius: 32,
    pulseAmplitude: 6,
    pulseFrequency: 0.005
};
