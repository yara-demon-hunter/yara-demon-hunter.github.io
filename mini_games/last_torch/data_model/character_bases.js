// Valores-base de movimento por personagem.
// Os perfis de jogador e de boss ficam juntos para manter uma fonte por personagem,
// mas continuam separados para permitir balanceá-los independentemente.
export const CHARACTER_BASES = {
    hunter: {
        player: {
            mods: { maxHp: 0.15, knifeDamage: 0.2, knifeRange: 0.25, stillAttack: 0.15, warmth: 0.2, damage: -0.05 },
            moveSpeed: 150,
            dash: { distance: 150, seconds: 0.17 }
        },
        boss: {
            moveSpeed: 85,
            lungeLength: 300,
            lungeSeconds: 0.12
        }
    },
    azael: {
        player: {
            mods: { damage: 0.25, lifeSteal: 0.05, maxHp: -0.25, knifeRange: -0.35 },
            moveSpeed: 180,
            dash: { distance: 220, seconds: 0.17 }
        },
        boss: {
            moveSpeed: 140,
            lungeLength: 400,
            lungeSeconds: 0.09
        }
    }
};

export function getCharacterBase(model = 'hunter') {
    return CHARACTER_BASES[model] ?? CHARACTER_BASES.hunter;
}
