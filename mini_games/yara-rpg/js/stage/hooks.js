// --- PALCO 2.5D ↔ RPG ---
// Liga o palco (js/stage/stage.js) ao jogo, sem mudar nenhuma regra:
// - source: o que o palco consulta a cada quadro (personagem, região, monstro, baú...), lido das variáveis do RPG.
// - Embrulha as ações dos botões (exploreForest, combatQuickAttack...): tira uma foto do estado antes e depois,
//   monta o relatório do turno (acertou? quanto? o monstro revidou? aparado? esquivado?) e pede a cena ao palco.
//   Os efeitos sonoros tocados durante a ação dizem o que só o som sabe (crítico, atordoar, aparar, esquivar).
// Carregar depois de todos os sistemas do jogo e antes de js/game.js.
(() => {
    const NS = window.YaraStage25D;

    function install() {
        const canvas = document.getElementById('action-stage-canvas');
        if (!canvas || !NS?.createStage) return;

        const source = {
            characterId: () => selectedCharacter?.id,
            regionId: () => {
                try { return getCurrentRegionData()?.id; } catch { return null; }
            },
            monster: () => (inCombat && currentMonster
                ? { key: String(combatEncounterId), image: currentMonster.image, boss: !!currentMonster.isBoss, telegraph: !!enemyTelegraphing }
                : null),
            furyReady: () => !!(inCombat && currentMonster && hero.fury >= getEffectiveFuryThreshold()),
            level: () => hero.level,
            petImage: () => hero.equipment?.pet?.image || null,
            chest: () => !!pendingChest,
            presence: () => !!(pendingStoryEvent || pendingMistContact),
            defeated: () => !!gameOver,
            language: () => gameLanguage
        };
        const stage = NS.createStage(canvas, source);

        // --- O que aconteceu durante a ação ---
        let depth = 0;                       // ações chamando ações (o ataque rápido vira crítico com a Fúria cheia)
        const heard = [];                    // efeitos sonoros tocados durante a ação
        let lifeSteal = 0;                   // HP recuperado pelo Dreno espiritual durante a ação

        const playSoundOriginal = window.playSound;
        if (typeof playSoundOriginal === 'function') {
            window.playSound = function (effect, ...rest) {
                if (depth > 0) heard.push(effect);
                return playSoundOriginal.call(this, effect, ...rest);
            };
        }
        const lifeStealOriginal = window.healFromLifeSteal;
        if (typeof lifeStealOriginal === 'function') {
            window.healFromLifeSteal = function (...args) {
                const healed = lifeStealOriginal.apply(this, args);
                if (depth > 0) lifeSteal += Number(healed) || 0;
                return healed;
            };
        }

        const snapshot = () => ({
            hp: hero.hp,
            foco: hero.foco,
            fury: hero.fury,
            potions: hero.potions,
            gold: hero.gold,
            level: hero.level,
            inCombat,
            encounter: combatEncounterId,
            monsterHp: currentMonster ? currentMonster.hp : null,
            turns: enemyTurnCount,
            explored: explorationCount,
            chest: !!pendingChest,
            events: !!(pendingStoryEvent || pendingMistContact),
            evasionBonus: hero.evasionBonus,
            parryBonus: hero.parryBonus
        });
        const changed = (a, b) => Object.keys(a).some(key => a[key] !== b[key]);

        // Relatório do turno para o palco (formato em js/stage/stage.js → SCRIPTS)
        function report(before, after, action) {
            const sameFight = before.encounter === after.encounter && before.monsterHp !== null;
            const dealt = sameFight && after.monsterHp !== null ? before.monsterHp - after.monsterHp : 0;
            const attacked = action === 'attack' || action === 'heavy' || action === 'critical';
            const r = {
                hit: dealt > 0 ? { damage: dealt, crit: heard.includes('criticalHit'), stun: heard.includes('stun') } : null,
                missed: attacked && dealt <= 0,
                killed: sameFight && after.monsterHp !== null && after.monsterHp <= 0,
                enemy: null,
                heal: null
            };
            let healed = lifeSteal;
            if (action === 'potion') {
                const potionHp = Math.max(0, Math.min(POTION_HEAL_AMOUNT_HP, getEffectiveStat('maxHp') - before.hp));
                healed += potionHp;
                r.heal = { hp: potionHp };
            }
            if (after.turns > before.turns) {
                const taken = Math.max(0, before.hp + healed - after.hp);
                if (heard.includes('dodge') && taken === 0) r.enemy = { result: 'evaded', damage: 0 };
                else r.enemy = { result: heard.includes('parry') ? 'parried' : 'hit', damage: taken };
            }
            return r;
        }

        // Embrulha uma ação global; só pede a cena se a ação de fato aconteceu (algo mudou no estado)
        function wrap(name, action) {
            const original = window[name];
            if (typeof original !== 'function') return;
            window[name] = function (...args) {
                const outer = depth === 0;
                const before = outer ? snapshot() : null;
                if (outer) {
                    heard.length = 0;
                    lifeSteal = 0;
                }
                depth++;
                let result;
                try {
                    result = original.apply(this, args);
                } finally {
                    depth--;
                }
                if (outer) {
                    try {
                        const after = snapshot();
                        const type = typeof action === 'function' ? action(before, after) : action;
                        if (type && changed(before, after)) stage.play(type, report(before, after, type));
                    } catch (error) {
                        console.error('[stage]', error);
                    }
                }
                return result;
            };
        }

        wrap('exploreForest', 'explore');
        wrap('restAtCamp', 'rest');
        wrap('usePotion', 'potion');
        // Com a Fúria cheia o ataque rápido vira o golpe crítico (zera a Fúria)
        wrap('combatQuickAttack', (before, after) => (before.fury > 0 && after.fury === 0 && before.fury >= getEffectiveFuryThreshold() ? 'critical' : 'attack'));
        wrap('combatHeavyAttack', 'heavy');
        wrap('combatCriticalAttack', 'critical');
        wrap('combatDefend', 'parry');
        wrap('combatDodge', 'dodge');
        wrap('combatRun', (before, after) => (before.inCombat && !after.inCombat ? 'flee' : 'fleeFail'));

        // O comando do pet é um botão de pets.js (sem função global): foto antes do clique e depois dele
        document.addEventListener('click', (event) => {
            if (!(event.target instanceof Element) || !event.target.closest('#pet-command-button')) return;
            const before = snapshot();
            window.setTimeout(() => {
                const after = snapshot();
                if (changed(before, after)) stage.play('pet', report(before, after, 'pet'));
            }, 0);
        }, true);

        window.YaraStage = stage;
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
    else install();
})();
