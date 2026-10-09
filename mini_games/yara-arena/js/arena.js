const GAME_DATA = window.YaraRpgData;
const GAME_RULES = GAME_DATA.rules;
const DARK_FOREST_MONSTERS = GAME_DATA.monsters.byRegion['dark-forest'];
const TURN_DURATION_SECONDS = 20;
const MAX_TEAM_SIZE = 2;
const selectedFighters = new Set();
let playerTeam = [];
let enemyTeam = [];
let activeFighterId = null;
let selectedMove = null;
let activeSide = 'player';
let turnNumber = 1;
let secondsRemaining = TURN_DURATION_SECONDS;
let turnTimer = null;
let cpuActionTimeout = null;
let matchFinished = false;
let gameLanguage = new URLSearchParams(window.location.search).get('lang');

if (gameLanguage !== 'pt' && gameLanguage !== 'en') gameLanguage = 'en';

const text = {
    pt: {
        back: 'Todos os mini games',
        prototype: 'PROTÓTIPO LOCAL · AINDA SEM PARTIDAS ONLINE',
        title: 'Arena da Floresta',
        intro: 'Escolha dois lutadores. Os outros dois formarão a equipe rival.',
        chooseTwo: 'Escolha 2 lutadores',
        startMatch: 'Começar duelo',
        battleLabel: 'FLORESTA SOMBRIA · PARTIDA LOCAL',
        battleTitle: 'O sino tocou',
        seconds: 'SEGUNDOS',
        yourTeam: 'Sua equipe',
        chooseFighter: 'Escolha um lutador ativo',
        rivalTeam: 'Equipe rival',
        chooseTarget: 'Escolha um alvo',
        yourMove: 'SUA JOGADA',
        selectMove: 'Escolha um movimento',
        quickAttack: 'Golpe rápido',
        quickAttackInfo: 'Dano confiável',
        heavyAttack: 'Golpe pesado',
        heavyAttackInfo: 'Custa 15 de foco',
        recover: 'Recuperar foco',
        recoverInfo: 'Recupera até 25 de foco',
        guard: 'Defender',
        guardInfo: 'Reduz o próximo golpe pela metade',
        offlineNotice: 'Protótipo: esta partida acontece apenas neste navegador.',
        newMatch: 'Nova partida',
        playerTurn: 'SUA VEZ',
        rivalTurn: 'VEZ DO RIVAL',
        round: 'RODADA {number}',
        pickTwo: 'Escolha exatamente dois lutadores para começar.',
        pickMove: 'Escolha um movimento.',
        pickTarget: 'Escolha um alvo para {move}.',
        noLivingFighter: 'Sua equipe não tem lutadores disponíveis.',
        selected: '{name} está pronto para lutar.',
        quickName: 'golpe rápido',
        heavyName: 'golpe pesado',
        hit: '{attacker} usou {move} em {target}: {damage} de dano.',
        guarded: ' {target} defendeu e reduziu o dano!',
        stunned: ' {target} ficou atordoado!',
        recoverLog: '{fighter} recuperou {amount} de foco.',
        guardLog: '{fighter} preparou uma defesa.',
        skipped: '{fighter} está atordoado e perdeu a vez.',
        timeout: 'O tempo acabou: {fighter} fez um golpe rápido automático.',
        cpuTimeout: 'O rival não escolheu a tempo.',
        victory: 'Vitória! A equipe rival foi derrotada.',
        defeat: 'Derrota. Sua equipe foi vencida.',
        tie: 'As duas equipes caíram juntas.',
        targetLabel: 'Atacar {name}',
        roleHunter: 'Caçadora de demônios',
        roleHunterEn: 'Demon hunter',
        roleScout: 'Caçador errante',
        roleScoutEn: 'Wandering hunter',
        roleBeast: 'Criatura da floresta',
        roleBeastEn: 'Forest creature',
        roleSpirit: 'Espírito das águas',
        roleSpiritEn: 'Water spirit',
        hp: 'HP',
        focusShort: 'FOC',
        attackShort: 'ATQ',
        defenseShort: 'DEF'
    },
    en: {
        back: 'All mini games',
        prototype: 'LOCAL PROTOTYPE · ONLINE PLAY IS NOT AVAILABLE YET',
        title: 'Dark Forest Arena',
        intro: 'Choose two fighters. The remaining two will form the rival team.',
        chooseTwo: 'Choose 2 fighters',
        startMatch: 'Start duel',
        battleLabel: 'DARK FOREST · LOCAL MATCH',
        battleTitle: 'The bell has rung',
        seconds: 'SECONDS',
        yourTeam: 'Your team',
        chooseFighter: 'Choose an active fighter',
        rivalTeam: 'Rival team',
        chooseTarget: 'Choose a target',
        yourMove: 'YOUR MOVE',
        selectMove: 'Select a move',
        quickAttack: 'Quick strike',
        quickAttackInfo: 'Reliable damage',
        heavyAttack: 'Heavy strike',
        heavyAttackInfo: 'Costs 15 focus',
        recover: 'Recover focus',
        recoverInfo: 'Recover up to 25 focus',
        guard: 'Guard',
        guardInfo: 'Halve the next hit',
        offlineNotice: 'Prototype: this match runs only in this browser.',
        newMatch: 'New match',
        playerTurn: 'YOUR TURN',
        rivalTurn: "RIVAL'S TURN",
        round: 'ROUND {number}',
        pickTwo: 'Choose exactly two fighters to start.',
        pickMove: 'Choose a move.',
        pickTarget: 'Choose a target for {move}.',
        noLivingFighter: 'Your team has no available fighters.',
        selected: '{name} is ready to fight.',
        quickName: 'quick strike',
        heavyName: 'heavy strike',
        hit: '{attacker} used {move} on {target}: {damage} damage.',
        guarded: ' {target} guarded and reduced the damage!',
        stunned: ' {target} was stunned!',
        recoverLog: '{fighter} recovered {amount} focus.',
        guardLog: '{fighter} prepared a guard.',
        skipped: '{fighter} is stunned and lost the turn.',
        timeout: 'Time is up: {fighter} made an automatic quick strike.',
        cpuTimeout: 'The rival ran out of time.',
        victory: 'Victory! The rival team has been defeated.',
        defeat: 'Defeat. Your team has been beaten.',
        tie: 'Both teams fell together.',
        targetLabel: 'Attack {name}',
        roleHunter: 'Demon hunter',
        roleHunterEn: 'Demon hunter',
        roleScout: 'Wandering hunter',
        roleScoutEn: 'Wandering hunter',
        roleBeast: 'Forest creature',
        roleBeastEn: 'Forest creature',
        roleSpirit: 'Water spirit',
        roleSpiritEn: 'Water spirit',
        hp: 'HP',
        focusShort: 'FOC',
        attackShort: 'ATK',
        defenseShort: 'DEF'
    }
};

function t(key, values = {}) {
    return text[gameLanguage][key].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}

const roster = [
    {
        id: 'yara',
        name: { pt: 'Yara', en: 'Yara' },
        role: 'roleHunter',
        portrait: '/assets/images/common/characters/yara/yara_portrait.jpeg',
        icon: '⚔',
        hp: GAME_DATA.hero.initial.maxHp,
        focus: GAME_DATA.hero.initial.maxFoco,
        atk: GAME_DATA.hero.initial.atk + 2,
        def: GAME_DATA.hero.initial.def,
        stunChance: GAME_DATA.hero.initial.stunChance
    },
    {
        id: 'zeph',
        name: { pt: 'Zeph', en: 'Zeph' },
        role: 'roleScout',
        portrait: '/assets/images/common/books/book-1/chapters/002.jpeg',
        icon: '🗡',
        hp: GAME_DATA.hero.initial.maxHp,
        focus: GAME_DATA.hero.initial.maxFoco,
        atk: GAME_DATA.hero.initial.atk,
        def: GAME_DATA.hero.initial.def + 1,
        stunChance: GAME_DATA.hero.initial.stunChance
    },
    {
        id: 'possessed-wolf',
        name: { pt: 'Lobo Possuído', en: 'Possessed Wolf' },
        role: 'roleBeast',
        portrait: '/assets/images/common/characters/possessed_wolf/possessed_wolf.jpeg',
        icon: DARK_FOREST_MONSTERS[0].icon,
        hp: 80,
        focus: 35,
        atk: DARK_FOREST_MONSTERS[0].atk + 2,
        def: DARK_FOREST_MONSTERS[0].def + 1,
        stunChance: 8
    },
    {
        id: 'river-spirit',
        name: { pt: DARK_FOREST_MONSTERS[1].name.pt, en: DARK_FOREST_MONSTERS[1].name.en },
        role: 'roleSpirit',
        portrait: '/assets/images/common/characters/mysterious_creature/mysterious_creature.jpeg',
        icon: DARK_FOREST_MONSTERS[1].icon,
        hp: 90,
        focus: 55,
        atk: DARK_FOREST_MONSTERS[1].atk + 1,
        def: DARK_FOREST_MONSTERS[1].def,
        stunChance: 6
    }
];

function fighterName(fighter) {
    return fighter.name[gameLanguage];
}

function fighterRole(fighter) {
    const key = gameLanguage === 'pt'
        ? fighter.role
        : `${fighter.role}En`;
    return t(key);
}

function updateLanguage() {
    document.documentElement.lang = gameLanguage === 'pt' ? 'pt-BR' : 'en';
    document.title = gameLanguage === 'pt'
        ? 'Arena da Floresta · Yara Demon Hunter'
        : 'Dark Forest Arena · Yara Demon Hunter';
    document.querySelectorAll('[data-copy]').forEach((element) => {
        element.textContent = t(element.dataset.copy);
    });
    document.querySelectorAll('[data-language]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.language === gameLanguage));
    });
    document.getElementById('arena-back').href = gameLanguage === 'pt'
        ? '/pt/mini-games/'
        : '/en/mini-games/';
    [...playerTeam, ...enemyTeam].forEach((fighter) => {
        const template = roster.find((item) => item.id === fighter.id);
        if (template) fighter.name = fighterName(template);
    });
    renderRoster();
    if (playerTeam.length) renderBattle();
}

document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => {
        const nextLanguage = button.dataset.language;
        if (nextLanguage === gameLanguage) return;
        gameLanguage = nextLanguage;
        const url = new URL(window.location.href);
        url.searchParams.set('lang', gameLanguage);
        window.history.replaceState(null, '', url);
        updateLanguage();
    });
});

function createFighter(template) {
    return {
        ...template,
        name: fighterName(template),
        maxHp: template.hp,
        currentHp: template.hp,
        maxFocus: template.focus,
        currentFocus: template.focus,
        guarding: false,
        stunned: false
    };
}

function renderRoster() {
    const rosterGrid = document.getElementById('roster-grid');
    rosterGrid.innerHTML = roster.map((fighter) => {
        const selected = selectedFighters.has(fighter.id);
        const art = fighter.portrait
            ? `<img src="${fighter.portrait}" alt="">`
            : fighter.icon;
        return `
            <button type="button" class="roster-card" data-roster-id="${fighter.id}"
                aria-pressed="${selected}" ${!selected && selectedFighters.size >= MAX_TEAM_SIZE ? 'disabled' : ''}>
                <span class="fighter-art">${art}</span>
                <span class="roster-card__body">
                    <strong>${fighterName(fighter)}</strong>
                    <span>${fighterRole(fighter)} · ${t('hp')} ${fighter.hp} · ${t('attackShort')} ${fighter.atk}</span>
                </span>
            </button>
        `;
    }).join('');

    document.getElementById('selected-count').textContent = selectedFighters.size;
    document.getElementById('start-match').disabled = selectedFighters.size !== MAX_TEAM_SIZE;
}

document.getElementById('roster-grid').addEventListener('click', (event) => {
    const card = event.target.closest('[data-roster-id]');
    if (!card) return;
    const id = card.dataset.rosterId;
    if (selectedFighters.has(id)) selectedFighters.delete(id);
    else if (selectedFighters.size < MAX_TEAM_SIZE) selectedFighters.add(id);
    renderRoster();
});

function startMatch() {
    if (selectedFighters.size !== MAX_TEAM_SIZE) return;
    clearTurnTimers();
    playerTeam = roster.filter((fighter) => selectedFighters.has(fighter.id)).map(createFighter);
    enemyTeam = roster.filter((fighter) => !selectedFighters.has(fighter.id)).map(createFighter);
    activeFighterId = playerTeam[0]?.id ?? null;
    selectedMove = null;
    activeSide = 'player';
    turnNumber = 1;
    matchFinished = false;
    document.getElementById('team-select').hidden = true;
    document.getElementById('battle-screen').hidden = false;
    document.getElementById('battle-log').innerHTML = '';
    appendLog(gameLanguage === 'pt'
        ? 'O duelo começou. Cada lado tem 20 segundos por turno.'
        : 'The duel begins. Each side has 20 seconds per turn.');
    startTurn('player');
}

document.getElementById('start-match').addEventListener('click', startMatch);

function fighterCardMarkup(fighter, side) {
    const isPlayer = side === 'player';
    const isDead = fighter.currentHp <= 0;
    const isActive = isPlayer && fighter.id === activeFighterId;
    const isTarget = !isPlayer && selectedMove && !isDead;
    const cardTag = isPlayer ? 'button' : 'button';
    const art = fighter.portrait
        ? `<img src="${fighter.portrait}" alt="">`
        : fighter.icon;
    const hpPercent = Math.max(0, (fighter.currentHp / fighter.maxHp) * 100);
    const focusPercent = Math.max(0, (fighter.currentFocus / fighter.maxFocus) * 100);
    const stunned = fighter.stunned ? ' is-stunned' : '';
    const defeated = isDead ? ' is-defeated' : '';
    const active = isActive ? ' is-active' : '';
    const target = isTarget ? ' is-target' : '';
    const label = isPlayer
        ? `${fighter.name}, ${t('hp')} ${fighter.currentHp} / ${fighter.maxHp}`
        : t('targetLabel', { name: fighter.name });

    return `
        <${cardTag} type="button" class="fighter-card${active}${target}${defeated}${stunned}"
            data-fighter-id="${fighter.id}" data-fighter-side="${side}" aria-label="${label}"
            ${isDead || (isPlayer && activeSide !== 'player') ? 'disabled' : ''}>
            <span class="fighter-portrait">${art}</span>
            <span class="fighter-info">
                <span class="fighter-info__name">${fighter.name}</span>
                <span class="fighter-info__role">${fighterRole(fighter)}</span>
                <span class="meter-row"><span>${t('hp')}</span><span class="meter meter--hp"><span style="width:${hpPercent}%"></span></span><span>${fighter.currentHp}/${fighter.maxHp}</span></span>
                <span class="meter-row"><span>${t('focusShort')}</span><span class="meter meter--focus"><span style="width:${focusPercent}%"></span></span><span>${fighter.currentFocus}/${fighter.maxFocus}</span></span>
                <span class="fighter-stats"><span>${t('attackShort')} ${fighter.atk}</span><span>${t('defenseShort')} ${fighter.def}</span></span>
            </span>
        </${cardTag}>
    `;
}

function renderBattle() {
    document.getElementById('player-team').innerHTML = playerTeam
        .map((fighter) => fighterCardMarkup(fighter, 'player'))
        .join('');
    document.getElementById('enemy-team').innerHTML = enemyTeam
        .map((fighter) => fighterCardMarkup(fighter, 'enemy'))
        .join('');
    document.getElementById('turn-label').textContent = t(activeSide === 'player' ? 'playerTurn' : 'rivalTurn');
    document.getElementById('turn-timer').textContent = secondsRemaining;
    document.querySelector('.turn-clock').classList.toggle('is-urgent', secondsRemaining <= 5);
    document.getElementById('round-label').textContent = t('round', { number: turnNumber });

    const activeFighter = playerTeam.find((fighter) => fighter.id === activeFighterId);
    document.getElementById('active-fighter-label').textContent = activeFighter
        ? activeFighter.name
        : '';
    const prompt = selectedMove === 'quick' || selectedMove === 'heavy'
        ? t('pickTarget', { move: t(selectedMove === 'quick' ? 'quickName' : 'heavyName') })
        : t('pickMove');
    document.getElementById('battle-prompt').textContent = matchFinished
        ? document.getElementById('battle-prompt').textContent
        : activeSide === 'player'
            ? prompt
            : t('rivalTurn');

    document.querySelectorAll('[data-move]').forEach((button) => {
        button.disabled = activeSide !== 'player' || matchFinished;
        button.classList.toggle('is-selected', button.dataset.move === selectedMove);
    });
}

document.getElementById('battle-screen').addEventListener('click', (event) => {
    const card = event.target.closest('[data-fighter-id]');
    if (!card || activeSide !== 'player' || matchFinished) return;
    if (card.dataset.fighterSide === 'player') {
        activeFighterId = card.dataset.fighterId;
        selectedMove = null;
        document.getElementById('battle-prompt').textContent = t('selected', {
            name: playerTeam.find((fighter) => fighter.id === activeFighterId).name
        });
        renderBattle();
        return;
    }
    if (selectedMove === 'quick' || selectedMove === 'heavy') {
        executeAttack(
            playerTeam.find((fighter) => fighter.id === activeFighterId),
            enemyTeam.find((fighter) => fighter.id === card.dataset.fighterId),
            selectedMove
        );
    }
});

document.querySelectorAll('[data-move]').forEach((button) => {
    button.addEventListener('click', () => {
        if (activeSide !== 'player' || matchFinished) return;
        const fighter = playerTeam.find((unit) => unit.id === activeFighterId);
        if (!fighter || fighter.currentHp <= 0) return;
        const move = button.dataset.move;
        if (move === 'heavy' && fighter.currentFocus < GAME_RULES.combat.heavyAttack.focoCost) return;
        if (fighter.stunned) {
            fighter.stunned = false;
            appendLog(t('skipped', { fighter: fighter.name }));
            finishAction();
            return;
        }
        if (move === 'recover') {
            const previousFocus = fighter.currentFocus;
            fighter.currentFocus = Math.min(
                fighter.maxFocus,
                fighter.currentFocus + GAME_RULES.camp.focoRecovery
            );
            appendLog(t('recoverLog', {
                fighter: fighter.name,
                amount: fighter.currentFocus - previousFocus
            }));
            finishAction();
            return;
        }
        if (move === 'guard') {
            fighter.guarding = true;
            appendLog(t('guardLog', { fighter: fighter.name }));
            finishAction();
            return;
        }
        selectedMove = move;
        document.getElementById('battle-prompt').textContent = t('pickTarget', {
            move: t(move === 'quick' ? 'quickName' : 'heavyName')
        });
        renderBattle();
    });
});

function appendLog(message) {
    const log = document.getElementById('battle-log');
    const line = document.createElement('p');
    line.textContent = message;
    log.prepend(line);
    while (log.children.length > 12) log.lastElementChild.remove();
}

function livingFighters(team) {
    return team.filter((fighter) => fighter.currentHp > 0);
}

function executeAttack(attacker, target, move) {
    if (
        !attacker
        || !target
        || attacker.currentHp <= 0
        || target.currentHp <= 0
        || matchFinished
    ) return;

    if (attacker.stunned) {
        attacker.stunned = false;
        appendLog(t('skipped', { fighter: attacker.name }));
        finishAction();
        return;
    }

    const rules = move === 'heavy'
        ? GAME_RULES.combat.heavyAttack
        : GAME_RULES.combat.quickAttack;
    if (move === 'heavy') {
        const focusCost = GAME_RULES.combat.heavyAttack.focoCost;
        if (attacker.currentFocus < focusCost) return;
        attacker.currentFocus -= focusCost;
    }

    const rolledBonus = Math.floor(Math.random() * rules.randomBonusRange);
    const rawDamage = Math.round(
        attacker.atk * rules.attackMultiplier - target.def * 0.35 + rolledBonus
    );
    let damage = Math.max(rules.minimumDamage, rawDamage);
    let message = '';
    if (target.guarding) {
        damage = Math.max(1, Math.ceil(damage * GAME_RULES.combat.monsterParryDamageMultiplier));
        target.guarding = false;
        message = t('guarded', { target: target.name });
    }
    target.currentHp = Math.max(0, target.currentHp - damage);
    if (target.currentHp > 0 && Math.random() * 100 < attacker.stunChance) {
        target.stunned = true;
        message += t('stunned', { target: target.name });
    }
    appendLog(t('hit', {
        attacker: attacker.name,
        move: t(move === 'quick' ? 'quickName' : 'heavyName'),
        target: target.name,
        damage
    }) + message);
    finishAction();
}

function finishAction() {
    selectedMove = null;
    if (livingFighters(enemyTeam).length === 0 || livingFighters(playerTeam).length === 0) {
        finishMatch();
        return;
    }
    const nextSide = activeSide === 'player' ? 'enemy' : 'player';
    if (nextSide === 'player') turnNumber += 1;
    startTurn(nextSide);
}

function startTurn(side) {
    clearTurnTimers();
    if (matchFinished) return;
    activeSide = side;
    secondsRemaining = TURN_DURATION_SECONDS;
    const activeTeam = side === 'player' ? playerTeam : enemyTeam;
    const available = livingFighters(activeTeam);
    activeFighterId = available[0]?.id ?? null;
    selectedMove = null;
    if (side === 'player' && activeFighterId) {
        const firstNonStunned = available.find((fighter) => !fighter.stunned);
        activeFighterId = firstNonStunned?.id ?? activeFighterId;
    }
    renderBattle();

    // Multiplayer seam: use a server-issued turn deadline instead of a browser-owned timer.
    // The server should reject late actions; this countdown is presentation-only in the offline build.
    turnTimer = window.setInterval(() => {
        secondsRemaining -= 1;
        document.getElementById('turn-timer').textContent = secondsRemaining;
        document.querySelector('.turn-clock').classList.toggle('is-urgent', secondsRemaining <= 5);
        if (secondsRemaining > 0) return;
        clearTurnTimers();
        if (activeSide === 'player') playAutomaticTurn();
        else {
            appendLog(t('cpuTimeout'));
            playCpuTurn();
        }
    }, 1000);

    if (side === 'enemy') {
        // Multiplayer seam: replace this local AI with the other room participant's submitted action.
        cpuActionTimeout = window.setTimeout(playCpuTurn, 900);
    }
}

function playAutomaticTurn() {
    const attacker = livingFighters(playerTeam)[0];
    const target = livingFighters(enemyTeam).sort((a, b) => a.currentHp - b.currentHp)[0];
    if (!attacker || !target) {
        finishMatch();
        return;
    }
    if (attacker.stunned) {
        activeSide = 'player';
        activeFighterId = attacker.id;
        appendLog(t('skipped', { fighter: attacker.name }));
        finishAction();
        return;
    }
    appendLog(t('timeout', { fighter: attacker.name }));
    executeAttack(attacker, target, 'quick');
}

function playCpuTurn() {
    if (activeSide !== 'enemy' || matchFinished) return;
    clearTurnTimers();
    const attacker = livingFighters(enemyTeam).find((fighter) => !fighter.stunned);
    const target = livingFighters(playerTeam).sort((a, b) => a.currentHp - b.currentHp)[0];
    if (!attacker) {
        const stunned = livingFighters(enemyTeam)[0];
        if (stunned) {
            stunned.stunned = false;
            appendLog(t('skipped', { fighter: stunned.name }));
            finishAction();
            return;
        }
    }
    if (!attacker || !target) {
        finishMatch();
        return;
    }

    activeFighterId = attacker.id;
    const move = attacker.currentFocus >= GAME_RULES.combat.heavyAttack.focoCost
        ? 'heavy'
        : 'quick';
    executeAttack(attacker, target, move);
}

function clearTurnTimers() {
    if (turnTimer !== null) window.clearInterval(turnTimer);
    if (cpuActionTimeout !== null) window.clearTimeout(cpuActionTimeout);
    turnTimer = null;
    cpuActionTimeout = null;
}

function finishMatch() {
    clearTurnTimers();
    matchFinished = true;
    const playerAlive = livingFighters(playerTeam).length > 0;
    const enemyAlive = livingFighters(enemyTeam).length > 0;
    const result = playerAlive && enemyAlive
        ? t('tie')
        : playerAlive
            ? t('victory')
            : t('defeat');
    renderBattle();
    document.getElementById('battle-prompt').textContent = result;
    appendLog(result);
    document.getElementById('battle-title').textContent = result;
    document.getElementById('turn-label').textContent = '—';
    document.getElementById('turn-timer').textContent = '0';
    document.querySelectorAll('[data-move]').forEach((button) => {
        button.disabled = true;
    });
}

document.getElementById('restart-match').addEventListener('click', () => {
    clearTurnTimers();
    selectedFighters.clear();
    playerTeam = [];
    enemyTeam = [];
    activeFighterId = null;
    selectedMove = null;
    activeSide = 'player';
    matchFinished = false;
    document.getElementById('battle-screen').hidden = true;
    document.getElementById('team-select').hidden = false;
    renderRoster();
});

updateLanguage();
