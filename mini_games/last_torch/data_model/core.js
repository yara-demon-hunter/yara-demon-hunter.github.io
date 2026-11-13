export const CORE_MODEL = {
    name: 'Torch',
    initialHp: 100,
    collisionRadius: 22,
    playerBlockRadius: 40,    // o herói não entra neste raio em volta da tocha
    damageTakenPerMonster: 8,   // monstros sem torchDamage próprio
    bossHitDamage: 5,            // boss encostado na tocha: dano a cada bossHitSeconds
    bossHitSeconds: 1.6,
    bossStopDistance: 74,        // o boss para aqui, em vez de se jogar na chama
    // SEGUNDA CHANCE: uma vez por noite, quando o herói cai, a tocha gasta parte da chama e o traz de volta para junto
    // dela. Só até o nível de Escuridão `maxDarkness` (acima disso a noite não perdoa). 0 em maxDarkness desliga.
    secondWind: { maxDarkness: 1, torchCostRatio: 0.25, heroHpRatio: 0.6, invulnerableSeconds: 3, knockback: 900, offsetY: 64 },
    lowHpRatio: 0.35,            // abaixo disso a tocha pede socorro
    visualRadius: 22,
    pulseRadius: 32,
    pulseAmplitude: 6,
    pulseFrequency: 0.005
};
