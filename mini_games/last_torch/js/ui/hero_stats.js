import { getCharacterBase } from '../../data_model/characters/index.js';
import { ACTIVE_HEROES, HEROES } from '../../data_model/heroes.js';
import { save } from '../core/save.js';

// --- BARRAS DE ATRIBUTO DO HERÓI (tela inicial) ---
// Como no Wild Push Smash: cada barra é o valor do herói em proporção ao melhor dos heróis ativos (a barra cheia é
// quem lidera naquele atributo; a diferença entre as barras é a diferença real). Os valores vêm dos mesmos dados do jogo (data_model/characters/).
const STATS = [
    // Tudo vem do arquivo de cada personagem (data_model/characters/): b.player = valores absolutos, h.mods = bônus em %.
    // Nove barras, três colunas por três linhas, lidas da esquerda para a direita:
    //   HP      DAMAGE   DEFENSE
    //   FURY    REGEN    SPEED
    //   RANGE   DAGGER   MAGIC
    // HP é a vida máxima
    { label: 'HP', value: (h, b) => b.player.maxHp },
    // DAMAGE é o dano da lâmina por segundo: dano de cada golpe x golpes por segundo (a velocidade parado conta pela metade)
    { label: 'DAMAGE', value: (h, b) => b.player.attackDamage * (1 + (h.mods.bladeDamage ?? 0)) / (b.player.attackCooldown * Math.max(0.2, 1 - 0.5 * (h.mods.stillAttack ?? 0))) },
    // DEFENSE: quanto menos dano ele recebe (`damageTaken` do personagem: -10 = recebe 10% menos). Sem redução, a barra fica no mínimo.
    // A vida é a barra HP e a cura do calor da tocha não é defesa.
    { label: 'DEFENSE', value: (h, b) => Math.max(0, -(h.mods.damageTaken ?? 0)) },
    // FURY combina carga por golpe com o dano estimado de uma Fúria completa
    { label: 'FURY', value: (h, b) => furyEstimate(h, b).score },
    // REGEN junta as três curas base: a do calor da tocha (`warmthHeal`, vida por segundo) multiplicada pelo alcance dele (`warmthRadius` em
    // relação ao raio de referência de 92px: quanto maior, mais tempo ele passa curando) e o roubo de vida (`lifeSteal`) sobre o dano da
    // lâmina por segundo. É o que ele se cura sem comprar nada.
    { label: 'REGEN', value: (h, b) => {
        const dps = b.player.attackDamage * (1 + (h.mods.bladeDamage ?? 0)) / b.player.attackCooldown;
        return b.player.stats.warmthHeal * (b.player.stats.warmthRadius / 92) + (h.mods.lifeSteal ?? 0) * dps;
    } },
    // SPEED junta a velocidade de movimento com o alcance do dash: dá a velocidade real de jogo
    { label: 'SPEED', value: (h, b) => b.player.moveSpeed * (1 + b.player.dash.distance / 600) },
    // RANGE é o alcance da lâmina (a espada ou o machado), não o da adaga
    { label: 'RANGE', value: (h, b) => b.player.bladeRange },
    // DAGGER junta o dano e o alcance da adaga num valor só (dano x alcance; o dano é o de magia quando o arremesso é mágico: Rowan e Avgustino). noKnives (Brutos): sem adaga, fica no mínimo
    { label: 'DAGGER', value: (h, b) => (h.mods.noKnives ? 0 : (h.mods.magicKnife ? b.player.stats.magicDamage : b.player.attackDamage) * (1 + (h.mods.knifeDamage ?? 0)) * b.player.stats.knifeDamageRatio * b.player.knifeRange) },
    // MAGIC é o dano dos feitiços: o `magicDamage` do personagem (0 = sem magia), com o bônus de feitiço
    { label: 'MAGIC', value: (h, b) => b.player.stats.magicDamage * (1 + (h.mods.spellDamage ?? 0)) }
];
// Estimativa contra um alvo: considera a duração base e o bônus de dano da skill Fury, sem área, críticos ou bônus temporários.
function furyEstimate(h, b) {
    const F = b.player.fury;
    const blade = b.player.attackDamage
        * (1 + (h.mods.damage ?? 0))
        * (1 + (h.mods.bladeDamage ?? 0))
        * (1 + F.damageBonusPerLevel);
    const magic = b.player.stats.magicDamage * (1 + (h.mods.spellDamage ?? 0));
    const seconds = F.durationSeconds + (F.extraSeconds ?? 0);
    const chargePerHit = F.chargePerHit * (1 + (h.mods.furyCharge ?? 0));
    let damage;
    switch (F.kind) {
        case 'swordRain': {
            const normalSwords = Math.ceil(Math.max(0, seconds - F.giantFallSeconds - 0.12) / F.stepSeconds);
            damage = blade * (F.damage * normalSwords + F.giantDamage);
            break;
        }
        case 'bloodWaltz':
            damage = blade * F.cuts * F.cutDamage;
            break;
        case 'stomp':
            damage = blade * F.damage * Math.ceil(seconds / F.stepSeconds);
            break;
        case 'forestGuardian':
            damage = magic * F.damage * Math.ceil(seconds / F.tickSeconds);
            break;
        case 'consecration':
            damage = magic * (F.damage * Math.ceil(seconds / F.tickSeconds) + F.finaleDamage);
            break;
        default:
            throw new Error(`Unknown Fury kind: ${F.kind}`);
    }
    return { chargePerHit, damage, score: chargePerHit * damage };
}

const MIN_BAR = 12;                 // % mínimo, para a barra nunca sumir

const values = (key) => {
    const hero = HEROES[key];
    return STATS.map(stat => stat.value({ ...hero, mods: hero.mods ?? {} }, getCharacterBase(hero.model ?? 'hunter')));
};

export function renderHeroStats() {
    const panel = document.getElementById('heroAttrs');
    if (!panel) return;
    const key = ACTIVE_HEROES.includes(save.hero) ? save.hero : 'hunter';
    const hero = HEROES[key];
    const all = ACTIVE_HEROES.map(values);
    const mine = values(key);
    const rows = STATS.map((stat, i) => {
        const best = Math.max(...all.map(v => v[i]));
        const t = best > 0 ? mine[i] / best : 1;
        const percent = Math.max(MIN_BAR, Math.round(t * 100));
        const fury = stat.label === 'FURY' ? furyEstimate({ ...hero, mods: hero.mods ?? {} }, getCharacterBase(hero.model ?? 'hunter')) : null;
        const title = fury
            ? `Fury charge: ${fury.chargePerHit.toFixed(1)} per hit | estimated damage: ${Math.round(fury.damage)} per use`
            : '';
        return `<div class="hs-row"${title ? ` title="${title}" aria-label="${title}"` : ''}><span>${stat.label}</span><div class="hs-bar"><i style="width:${percent}%"></i></div></div>`;
    }).join('');
    panel.innerHTML = `<div class="hs-bars">${rows}</div>`
        + (hero.perk ? `<div class="hs-perk"><strong>${hero.perk.name}</strong><span>${hero.perk.text}</span></div>` : '');
}
