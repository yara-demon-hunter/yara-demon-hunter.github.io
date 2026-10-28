// Meta-progression: Essência, melhorias permanentes, conquistas, bestiário, coleção,
// desafio diário, resumo da jornada, mercador e efeitos de recompensa.
// Classic browser script; carregado antes de game.js. Os hooks são chamados por
// game.js, combat*.js, exploration.js, equipment-core.js, hud.js e persistence.js
// sempre como `window.YaraMeta?.hook()` para nunca quebrar o jogo se este arquivo faltar.
window.YaraMeta = (() => {
    const META_KEY = 'yara-rpg-meta-v1';

    // ---------- Textos (PT/EN) ----------
    const S = {
        pt: {
            sanctuary: 'Santuário', sanctuaryHint: 'Conquistas, bestiário, coleções e poderes descobertos', close: 'Fechar',
            tabAchievements: 'Conquistas', tabBestiary: 'Bestiário', tabCollection: 'Coleção', tabPowers: 'Poderes', tabRecords: 'Recordes',
            summaryTime: 'Tempo de sobrevivência', recLongest: 'Maior tempo de sobrevivência', recPlaytime: 'Tempo total de jogo',
            achUnlocked: 'Conquista desbloqueada',
            seen: 'Visto', defeated: 'Derrotado', unknown: '???', foundTimes: 'Encontrado {n}x', notFound: 'Não encontrado',
            bestiaryProgress: 'Bestiário: {a}/{b} derrotados', collectionProgress: 'Coleção: {a}/{b} itens encontrados',
            achProgress: 'Conquistas: {a}/{b}', powersProgress: 'Poderes descobertos: {a}/{b}',
            passivesTitle: 'Habilidades passivas', pactsTitle: 'Pactos com monstros', pactTag: 'Pacto',
            recRuns: 'Jornadas iniciadas', recWins: 'Campanhas vencidas', recKills: 'Monstros derrotados (total)',
            recRegion: 'Região mais profunda', recLevel: 'Maior nível', recBosses: 'Chefes derrotados',
            summaryTitle: 'Resumo da jornada', summaryKills: 'Monstros derrotados', summaryBosses: 'Chefes', summaryChests: 'Baús abertos',
            summarySpared: 'Monstros poupados', summaryInterrupts: 'Golpes interrompidos', summaryLevel: 'Nível alcançado',
            summaryRegion: 'Região alcançada', newRecord: 'Novo recorde!',
            retry: 'Tentar de novo', openSanctuary: '🏛️ Santuário',
            continueSummary: 'Parou na {region} · Nível {level} · {potions} poção(ões) · 🪙{gold}',
            telegraphHint: '⚠️ Ataque agora para INTERROMPER o golpe devastador!',
            interrupted: '⚡ Golpe interrompido! {monster} perde o ritmo (+{fury} fúria).',
            vendorTitle: 'O vendedor ambulante',
            vendorDescription: 'Um vendedor encapuzado surge da névoa puxando uma carroça cheia de tralhas. "Ouro por sobrevivência, caçador. Dê uma olhada."',
            vendorLook: 'Ver as mercadorias', vendorLeave: 'Seguir viagem',
            vendorLeft: 'Você acena para o vendedor e segue pela trilha.',
            vendorAppears: '🛒 Um vendedor ambulante cruza seu caminho.',
            vendorIntro: 'Escolha com cuidado: cada mercadoria tem estoque limitado.',
            vendorSold: 'Esgotado', vendorStock: 'Estoque: {n}',
            bought: 'Você comprou: {item}.',
            offerPotion: 'Poção de cura', offerPotionDesc: '+1 poção (se houver espaço)',
            offerElixir: 'Elixir restaurador', offerElixirDesc: 'Recupera todo o HP e Foco agora',
            offerWhetstone: 'Pedra de afiar', offerWhetstoneDesc: '+1 ATQ permanente',
            offerIronCharm: 'Talismã de ferro', offerIronCharmDesc: '+1 DEF permanente',
            offerTonic: 'Tônico vital', offerTonicDesc: '+10 HP máximo (e cura 10)',
            offerFocusDraught: 'Infusão de foco', offerFocusDraughtDesc: '+10 Foco máximo (e recupera 10)',
            offerEagleEye: 'Lente do falcão', offerEagleEyeDesc: '+1% de chance crítica permanente',
            offerScroll: 'Pergaminho de treino', offerScrollDesc: '+1 Ponto de Habilidade',
            offerMap: 'Mapa do tesouro', offerMapDesc: '+10% de chance de baú na próxima descoberta',
            gambleWin: 'A sorte sorri! Você ganha 🪙{gold}.', gambleLose: 'Não deu certo… você perde {hp} HP.',
            rarityFound: '✨ {rarity}!',
        },
        en: {
            sanctuary: 'Sanctuary', sanctuaryHint: 'Achievements, bestiary, collections and discovered powers', close: 'Close',
            tabAchievements: 'Achievements', tabBestiary: 'Bestiary', tabCollection: 'Collection', tabPowers: 'Powers', tabRecords: 'Records',
            summaryTime: 'Survival time', recLongest: 'Longest survival', recPlaytime: 'Total play time',
            achUnlocked: 'Achievement unlocked',
            seen: 'Seen', defeated: 'Defeated', unknown: '???', foundTimes: 'Found {n}x', notFound: 'Not found',
            bestiaryProgress: 'Bestiary: {a}/{b} defeated', collectionProgress: 'Collection: {a}/{b} items found',
            achProgress: 'Achievements: {a}/{b}', powersProgress: 'Powers discovered: {a}/{b}',
            passivesTitle: 'Passive skills', pactsTitle: 'Monster pacts', pactTag: 'Pact',
            recRuns: 'Journeys started', recWins: 'Campaigns won', recKills: 'Monsters defeated (total)',
            recRegion: 'Deepest region', recLevel: 'Highest level', recBosses: 'Bosses defeated',
            summaryTitle: 'Journey summary', summaryKills: 'Monsters defeated', summaryBosses: 'Bosses', summaryChests: 'Chests opened',
            summarySpared: 'Monsters spared', summaryInterrupts: 'Strikes interrupted', summaryLevel: 'Level reached',
            summaryRegion: 'Region reached', newRecord: 'New record!',
            retry: 'Try again', openSanctuary: '🏛️ Sanctuary',
            continueSummary: 'Stopped at {region} · Level {level} · {potions} potion(s) · 🪙{gold}',
            telegraphHint: '⚠️ Attack now to INTERRUPT the devastating strike!',
            interrupted: '⚡ Strike interrupted! {monster} loses its rhythm (+{fury} fury).',
            vendorTitle: 'The wandering vendor',
            vendorDescription: 'A hooded vendor steps out of the mist pulling a cart full of odds and ends. "Gold for survival, hunter. Have a look."',
            vendorLook: 'Browse the wares', vendorLeave: 'Move on',
            vendorLeft: 'You wave at the vendor and continue down the trail.',
            vendorAppears: '🛒 A wandering vendor crosses your path.',
            vendorIntro: 'Choose carefully: every ware has limited stock.',
            vendorSold: 'Sold out', vendorStock: 'Stock: {n}',
            bought: 'You bought: {item}.',
            offerPotion: 'Healing potion', offerPotionDesc: '+1 potion (if there is room)',
            offerElixir: 'Restorative elixir', offerElixirDesc: 'Restores all HP and Focus now',
            offerWhetstone: 'Whetstone', offerWhetstoneDesc: '+1 permanent ATK',
            offerIronCharm: 'Iron talisman', offerIronCharmDesc: '+1 permanent DEF',
            offerTonic: 'Vital tonic', offerTonicDesc: '+10 max HP (and heals 10)',
            offerFocusDraught: 'Focus infusion', offerFocusDraughtDesc: '+10 max Focus (and restores 10)',
            offerEagleEye: "Falcon's lens", offerEagleEyeDesc: '+1% permanent critical chance',
            offerScroll: 'Training scroll', offerScrollDesc: '+1 Skill Point',
            offerMap: 'Treasure map', offerMapDesc: '+10% chest chance on the next discovery',
            gambleWin: 'Luck smiles! You win 🪙{gold}.', gambleLose: 'It did not work out… you lose {hp} HP.',
            rarityFound: '✨ {rarity}!',
        }
    };
    function m(key, values = {}) {
        const text = (S[gameLanguage] || S.pt)[key] ?? key;
        return text.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
    }
    const bi = (obj) => obj[gameLanguage] || obj.pt;

    // ---------- Catálogo ----------
    const MINUTE = 60000;
    const ACHIEVEMENTS = Object.freeze([
        { id: 'first-blood', icon: '🩸', name: { pt: 'Primeiro sangue', en: 'First blood' }, desc: { pt: 'Derrote seu primeiro monstro.', en: 'Defeat your first monster.' }, test: (c) => c.meta.totals.kills >= 1 },
        { id: 'slayer-50', icon: '🗡️', name: { pt: 'Caçador veterano', en: 'Veteran hunter' }, desc: { pt: 'Derrote 50 monstros no total.', en: 'Defeat 50 monsters in total.' }, test: (c) => c.meta.totals.kills >= 50 },
        { id: 'slayer-200', icon: '☠️', name: { pt: 'Ceifador da névoa', en: 'Mist reaper' }, desc: { pt: 'Derrote 200 monstros no total.', en: 'Defeat 200 monsters in total.' }, test: (c) => c.meta.totals.kills >= 200 },
        { id: 'boss-slayer', icon: '👹', name: { pt: 'Quebra-chefes', en: 'Boss breaker' }, desc: { pt: 'Derrote um chefe.', en: 'Defeat a boss.' }, test: (c) => c.meta.totals.bosses >= 1 },
        { id: 'dragon', icon: '🐉', name: { pt: 'Matador de dragões', en: 'Dragon slayer' }, desc: { pt: 'Derrote o Dragão da Névoa.', en: 'Defeat the Mist Dragon.' }, test: (c) => c.meta.bestiary['mist-dragon']?.killed > 0 },
        { id: 'flawless-5', icon: '🛡️', name: { pt: 'Intocável', en: 'Untouchable' }, desc: { pt: 'Vença 5 lutas seguidas sem perder HP.', en: 'Win 5 fights in a row without losing HP.' }, test: (c) => c.run.maxFlawless >= 5 },
        { id: 'interrupt-10', icon: '⚡', name: { pt: 'Leitor de golpes', en: 'Strike reader' }, desc: { pt: 'Interrompa 10 golpes devastadores no total.', en: 'Interrupt 10 devastating strikes in total.' }, test: (c) => c.meta.totals.interrupts >= 10 },
        { id: 'merciful-5', icon: '🕊️', name: { pt: 'Coração piedoso', en: 'Merciful heart' }, desc: { pt: 'Poupe 5 monstros no total.', en: 'Spare 5 monsters in total.' }, test: (c) => c.meta.totals.spared >= 5 },
        { id: 'chests-10', icon: '🧰', name: { pt: 'Saqueador de baús', en: 'Chest looter' }, desc: { pt: 'Abra 10 baús no total.', en: 'Open 10 chests in total.' }, test: (c) => c.meta.totals.chests >= 10 },
        { id: 'collector-15', icon: '🎒', name: { pt: 'Colecionador', en: 'Collector' }, desc: { pt: 'Encontre 15 equipamentos diferentes.', en: 'Find 15 different pieces of gear.' }, test: (c) => Object.keys(c.meta.items).length >= 15 },
        { id: 'legendary', icon: '🔥', name: { pt: 'Brilho lendário', en: 'Legendary glow' }, desc: { pt: 'Encontre um equipamento Lendário ou superior.', en: 'Find a Legendary or better item.' }, test: (c) => Object.values(c.meta.items).some((i) => i.best >= 5) },
        { id: 'divine', icon: '👑', name: { pt: 'Toque divino', en: 'Divine touch' }, desc: { pt: 'Encontre um equipamento Divino.', en: 'Find a Divine item.' }, test: (c) => Object.values(c.meta.items).some((i) => i.best >= 7) },
        { id: 'level-10', icon: '📈', name: { pt: 'Veterano', en: 'Veteran' }, desc: { pt: 'Chegue ao nível 10.', en: 'Reach level 10.' }, test: (c) => c.meta.best.level >= 10 },
        { id: 'region-3', icon: '🏘️', name: { pt: 'Além do rio', en: 'Beyond the river' }, desc: { pt: 'Alcance a terceira região.', en: 'Reach the third region.' }, test: (c) => c.meta.best.region >= 3 },
        { id: 'region-5', icon: '🏰', name: { pt: 'Às portas do trono', en: "At the throne's gate" }, desc: { pt: 'Alcance a quinta região.', en: 'Reach the fifth region.' }, test: (c) => c.meta.best.region >= 5 },
        { id: 'rich', icon: '💰', name: { pt: 'Mão de ouro', en: 'Golden hand' }, desc: { pt: 'Tenha 500 de ouro ao mesmo tempo.', en: 'Hold 500 gold at once.' }, test: (c) => (Number(c.hero.gold) || 0) >= 500 },
        { id: 'survive-15', icon: '⏳', name: { pt: 'Sobrevivente', en: 'Survivor' }, desc: { pt: 'Sobreviva 15 minutos em uma única jornada.', en: 'Survive 15 minutes in a single journey.' }, test: (c) => c.run.playMs >= 15 * MINUTE },
        { id: 'survive-30', icon: '⌛', name: { pt: 'Inabalável', en: 'Unshakable' }, desc: { pt: 'Sobreviva 30 minutos em uma única jornada.', en: 'Survive 30 minutes in a single journey.' }, test: (c) => c.run.playMs >= 30 * MINUTE },
        { id: 'playtime-1h', icon: '🕐', name: { pt: 'Preso na névoa', en: 'Lost in the mist' }, desc: { pt: 'Jogue 1 hora no total.', en: 'Play for 1 hour in total.' }, test: (c) => c.meta.totals.playMs >= 60 * MINUTE },
        { id: 'playtime-5h', icon: '🕰️', name: { pt: 'Alma da floresta', en: 'Soul of the forest' }, desc: { pt: 'Jogue 5 horas no total.', en: 'Play for 5 hours in total.' }, test: (c) => c.meta.totals.playMs >= 300 * MINUTE },
        { id: 'victory', icon: '🔔', name: { pt: 'O sino toca', en: 'The bell tolls' }, desc: { pt: 'Vença a campanha.', en: 'Win the campaign.' }, test: (c) => c.meta.wins >= 1 },
    ]);

    // Mercadorias do vendedor ambulante. Preço base escala com a região; 4 ofertas sorteadas por visita.
    const VENDOR = Object.freeze({
        chance: 10,           // % por exploração, respeitando o intervalo mínimo
        cooldownExplorations: 4,
        offers: Object.freeze([
            { id: 'potion', key: 'offerPotion', icon: '🧪', price: 40, stock: 2 },
            { id: 'elixir', key: 'offerElixir', icon: '🍶', price: 75, stock: 1 },
            { id: 'whetstone', key: 'offerWhetstone', icon: '🪨', price: 90, stock: 1 },
            { id: 'ironCharm', key: 'offerIronCharm', icon: '🔩', price: 90, stock: 1 },
            { id: 'tonic', key: 'offerTonic', icon: '🍷', price: 80, stock: 1 },
            { id: 'focusDraught', key: 'offerFocusDraught', icon: '💧', price: 70, stock: 1 },
            { id: 'eagleEye', key: 'offerEagleEye', icon: '🦅', price: 110, stock: 1 },
            { id: 'scroll', key: 'offerScroll', icon: '📜', price: 120, stock: 1 },
            { id: 'map', key: 'offerMap', icon: '🗺️', price: 60, stock: 1 },
        ])
    });

    // ---------- Armazenamento ----------
    function blankRun(characterId = null) {
        return { characterId, kills: 0, bosses: 0, chests: 0, spared: 0, interrupts: 0, flawless: 0, maxFlawless: 0, hpAtStart: 0, playMs: 0, finished: false };
    }
    function blankMeta() {
        return {
            v: 1, runs: 0, wins: 0,
            best: { region: 1, level: 1, time: 0 },
            totals: { kills: 0, bosses: 0, chests: 0, spared: 0, interrupts: 0, playMs: 0 },
            bestiary: {}, items: {}, passives: {}, pacts: {}, achievements: {}, run: blankRun()
        };
    }
    let meta = load();
    function load() {
        const base = blankMeta();
        try {
            const saved = JSON.parse(localStorage.getItem(META_KEY) || 'null');
            if (saved && saved.v === 1) {
                return { ...base, ...saved, best: { ...base.best, ...saved.best }, totals: { ...base.totals, ...saved.totals },
                    run: { ...base.run, ...saved.run } };
            }
        } catch {}
        return base;
    }
    function save() { try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch {} }
    const run = () => meta.run;

    // ---------- DOM helpers ----------
    function el(tag, className = '', text = '') {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== '') node.textContent = text;
        return node;
    }
    function visualIcon(item, className) {
        const box = el('span', className);
        if (item.image || item.iconImage) {
            const img = el('img');
            img.src = item.image || item.iconImage; img.alt = ''; img.setAttribute('aria-hidden', 'true');
            img.addEventListener('error', () => { img.replaceWith(document.createTextNode(item.icon || '❔')); }, { once: true });
            box.append(img);
        } else box.textContent = item.icon || '❔';
        return box;
    }

    // ---------- Conquistas ----------
    const toastQueue = [];
    let toastBusy = false;
    function showNextToast() {
        const toast = document.getElementById('meta-toast');
        if (!toast || toastBusy || !toastQueue.length) return;
        toastBusy = true;
        const { icon, title, text } = toastQueue.shift();
        const box = el('div');
        box.append(el('strong', '', title), el('span', '', text));
        toast.replaceChildren(el('span', 'meta-toast-icon', icon), box);
        toast.hidden = false;
        toast.classList.remove('meta-toast-show'); void toast.offsetWidth; toast.classList.add('meta-toast-show');
        window.setTimeout(() => { toast.hidden = true; toastBusy = false; showNextToast(); }, 3600);
    }
    function pushToast(icon, title, text) { toastQueue.push({ icon, title, text }); showNextToast(); }

    function check() {
        const ctx = { meta, run: run(), hero };
        let changed = false;
        ACHIEVEMENTS.forEach((ach) => {
            if (meta.achievements[ach.id]) return;
            let ok = false;
            try { ok = ach.test(ctx); } catch {}
            if (!ok) return;
            meta.achievements[ach.id] = Date.now();
            changed = true;
            pushToast(ach.icon, m('achUnlocked'), bi(ach.name));
            try { playSound('regionDiscovered'); } catch {}
        });
        if (changed) save();
    }

    // Registra passivas e pactos que o herói já possui (iniciais, recompensas e contatos da névoa).
    function recordPowers() {
        let changed = false;
        (hero.passiveSkills || []).forEach((id) => { if (!meta.passives[id]) { meta.passives[id] = true; changed = true; } });
        (hero.monsterPacts || []).forEach((id) => { if (!meta.pacts[id]) { meta.pacts[id] = true; changed = true; } });
        if (changed) save();
    }

    // ---------- Tempo de jogo ----------
    // Conta só o tempo ativo: aba visível, jornada em andamento e sem fim de jogo.
    function formatTime(ms) {
        const total = Math.floor(ms / 1000);
        const h = Math.floor(total / 3600), min = Math.floor((total % 3600) / 60), sec = total % 60;
        const two = (n) => String(n).padStart(2, '0');
        return h > 0 ? `${h}h ${two(min)}min ${two(sec)}s` : `${min}min ${two(sec)}s`;
    }
    let tickCount = 0;
    window.setInterval(() => {
        const gameMain = document.getElementById('game-main');
        const r = run();
        if (document.hidden || !gameMain || gameMain.hidden || !r.characterId || r.finished || gameOver || campaignComplete) return;
        r.playMs += 1000;
        meta.totals.playMs += 1000;
        tickCount++;
        if (tickCount % 10 === 0) { save(); check(); }
    }, 1000);

    // ---------- Ciclo da jornada ----------
    let explorationsSinceVendor = 0;
    function beginRun(character) {
        meta.runs++;
        meta.run = blankRun(character?.id);
        explorationsSinceVendor = 0;
        Object.values(hero.equipment).filter(Boolean).forEach(recordItem);
        trackBest();
        save();
        check();
    }
    function trackBest() {
        const region = (typeof currentRegion === 'number' ? currentRegion : 0) + 1;
        if (region > meta.best.region) meta.best.region = region;
        if (hero.level > meta.best.level) meta.best.level = hero.level;
    }

    function onEncounter(monster) {
        const key = monster.bestiaryKey;
        if (key) {
            const entry = meta.bestiary[key] || (meta.bestiary[key] = { seen: 0, killed: 0 });
            entry.seen++;
        }
        run().hpAtStart = hero.hp;
        save();
    }
    function onVictory(monster) {
        const r = run();
        meta.totals.kills++; r.kills++;
        if (monster.isBoss) { meta.totals.bosses++; r.bosses++; }
        const entry = monster.bestiaryKey && (meta.bestiary[monster.bestiaryKey] || (meta.bestiary[monster.bestiaryKey] = { seen: 1, killed: 0 }));
        if (entry) entry.killed++;
        if (hero.hp >= r.hpAtStart) { r.flawless++; r.maxFlawless = Math.max(r.maxFlawless, r.flawless); } else r.flawless = 0;
        trackBest();
        save();
        check();
    }
    function onSpare(monster) {
        meta.totals.spared++; run().spared++;
        const key = monster?.bestiaryKey;
        if (key) { const entry = meta.bestiary[key] || (meta.bestiary[key] = { seen: 1, killed: 0 }); entry.killed++; }
        trackBest(); save(); check();
    }
    function onChest() { meta.totals.chests++; run().chests++; save(); check(); }
    function onInterrupt() { meta.totals.interrupts++; run().interrupts++; save(); check(); }
    function onLevelUp() { trackBest(); save(); check(); }
    function onRegionChange() { trackBest(); save(); check(); }

    function recordItem(item) {
        if (!item?.id) return -1;
        const rarityIndex = Math.max(0, GAME_RULES.loot.equipmentRarities.findIndex((r) => r.id === item.rarity));
        const entry = meta.items[item.id] || (meta.items[item.id] = { count: 0, best: 0 });
        entry.count++;
        entry.best = Math.max(entry.best, rarityIndex);
        return rarityIndex;
    }
    function onItem(item) {
        const rarityIndex = recordItem(item);
        save();
        if (rarityIndex >= 4) showRarityFlash(item, rarityIndex);
        check();
    }

    function showRarityFlash(item, rarityIndex) {
        const flash = document.getElementById('rarity-flash');
        if (!flash) return;
        const rarity = GAME_RULES.loot.equipmentRarities[rarityIndex];
        flash.className = `rarity-flash rarity-flash-${rarity.id}`;
        flash.replaceChildren(el('strong', '', m('rarityFound', { rarity: rarity.name[gameLanguage] })), el('span', '', item.name[gameLanguage]));
        flash.hidden = false;
        void flash.offsetWidth;
        flash.classList.add('rarity-flash-show');
        try { playSound(rarityIndex >= 7 ? 'levelUp' : 'chestDiscovery'); } catch {}
        window.clearTimeout(showRarityFlash.timer);
        showRarityFlash.timer = window.setTimeout(() => { flash.hidden = true; }, 2200);
    }

    function finishRun(won) {
        const r = run();
        if (r.finished) return null;
        const before = { region: meta.best.region, level: meta.best.level, time: meta.best.time };
        meta.best.time = Math.max(meta.best.time, r.playMs);
        trackBest();
        r.finished = true;
        if (won) meta.wins++;
        const summary = {
            kills: r.kills, bosses: r.bosses, chests: r.chests, spared: r.spared, interrupts: r.interrupts,
            level: hero.level, region: (currentRegion || 0) + 1, time: r.playMs,
            record: (currentRegion || 0) + 1 > before.region || hero.level > before.level || r.playMs > before.time
        };
        save();
        check();
        return summary;
    }

    function renderSummary(summary) {
        const card = document.getElementById('campaign-ending-card');
        if (!card || !summary) return;
        card.querySelector('.run-summary')?.remove();
        const box = el('div', 'run-summary');
        box.append(el('h3', '', m('summaryTitle')));
        const list = el('ul');
        [['summaryTime', formatTime(summary.time)], ['summaryLevel', summary.level], ['summaryRegion', summary.region], ['summaryKills', summary.kills], ['summaryBosses', summary.bosses],
         ['summaryChests', summary.chests], ['summarySpared', summary.spared], ['summaryInterrupts', summary.interrupts]]
            .forEach(([key, value]) => { const li = el('li'); li.append(el('span', '', m(key)), el('b', '', String(value))); list.append(li); });
        box.append(list);
        if (summary.record) box.append(el('p', 'run-summary-record', `🏆 ${m('newRecord')}`));
        const sanctuaryBtn = el('button', 'start-secondary-button', m('openSanctuary'));
        sanctuaryBtn.type = 'button';
        sanctuaryBtn.addEventListener('click', () => openSanctuary('achievements'));
        box.append(sanctuaryBtn);
        const primary = card.querySelector('.start-primary-button');
        primary?.before(box);
        if (primary) primary.textContent = m('retry');
    }

    function onDefeat() { renderSummary(finishRun(false)); }
    function onCampaignComplete() { renderSummary(finishRun(true)); }

    // ---------- Telegrafia ----------
    function sync() {
        const active = typeof inCombat !== 'undefined' && inCombat && enemyTelegraphing;
        document.getElementById('monster-icon')?.classList.toggle('monster-telegraphing', active);
        const hint = document.getElementById('telegraph-hint');
        if (hint) { hint.hidden = !active; hint.textContent = m('telegraphHint'); }
        if (typeof hero !== 'undefined') recordPowers();
    }

    // ---------- Santuário ----------
    let activeTab = 'achievements';
    function openSanctuary(tab = activeTab) {
        activeTab = tab;
        renderSanctuary();
        const dialog = document.getElementById('meta-dialog');
        if (!dialog.open) dialog.showModal();
    }
    function renderSanctuary() {
        const body = document.getElementById('meta-dialog-body');
        const tabs = document.getElementById('meta-dialog-tabs');
        document.getElementById('meta-dialog-title').textContent = `🏛️ ${m('sanctuary')}`;
        tabs.replaceChildren(...[['achievements', 'tabAchievements', '🏆'], ['bestiary', 'tabBestiary', '👹'], ['collection', 'tabCollection', '🎒'], ['powers', 'tabPowers', '✨'], ['records', 'tabRecords', '📜']]
            .map(([id, key, emoji]) => {
                const b = el('button', `meta-tab${id === activeTab ? ' meta-tab-active' : ''}`, `${emoji} ${m(key)}`);
                b.type = 'button';
                b.addEventListener('click', () => { activeTab = id; renderSanctuary(); });
                return b;
            }));
        body.replaceChildren(({ achievements: renderAchievements, bestiary: renderBestiary, collection: renderCollection, powers: renderPowers, records: renderRecords })[activeTab]());
    }

    function renderAchievements() {
        const wrap = el('div');
        const done = ACHIEVEMENTS.filter((a) => meta.achievements[a.id]).length;
        wrap.append(el('p', 'meta-progress', m('achProgress', { a: done, b: ACHIEVEMENTS.length })));
        const list = el('div', 'meta-list');
        ACHIEVEMENTS.forEach((ach) => {
            const got = Boolean(meta.achievements[ach.id]);
            const row = el('div', `meta-row${got ? ' meta-row-done' : ' meta-row-locked'}`);
            row.append(el('span', 'meta-row-icon', got ? ach.icon : '🔒'));
            const text = el('div', 'meta-row-text');
            text.append(el('strong', '', bi(ach.name)), el('span', '', bi(ach.desc)));
            row.append(text);
            list.append(row);
        });
        wrap.append(list);
        return wrap;
    }
    function bestiaryTemplates() {
        const regionMonsters = Object.values(GAME_DATA.monsters.byRegion).flat();
        return [...regionMonsters, ...(GAME_DATA.specialMonsters || [])];
    }
    function renderBestiary() {
        const wrap = el('div');
        const templates = bestiaryTemplates();
        const keyOf = (tpl) => tpl.id || tpl.name.en;
        const killed = templates.filter((tpl) => meta.bestiary[keyOf(tpl)]?.killed > 0).length;
        wrap.append(el('p', 'meta-progress', m('bestiaryProgress', { a: killed, b: templates.length })));
        const grid = el('div', 'meta-grid');
        templates.forEach((tpl) => {
            const entry = meta.bestiary[keyOf(tpl)];
            const known = Boolean(entry?.killed);
            const card = el('div', `meta-card${known ? '' : ' meta-card-unknown'}`);
            card.append(visualIcon(tpl, 'meta-card-icon'));
            card.append(el('strong', '', known ? bi(tpl.name) : m('unknown')));
            card.append(el('span', '', known ? `${m('defeated')} ${entry.killed}x · ${m('seen')} ${entry.seen}x` : (entry ? `${m('seen')} ${entry.seen}x` : '')));
            if (known) card.append(el('span', 'meta-card-stats', `❤️${tpl.hp} ⚔️${tpl.atk} 🛡️${tpl.def}`));
            grid.append(card);
        });
        wrap.append(grid);
        return wrap;
    }
    function renderCollection() {
        const wrap = el('div');
        const items = ITEM_DATA.equipment;
        const found = items.filter((item) => meta.items[item.id]).length;
        wrap.append(el('p', 'meta-progress', m('collectionProgress', { a: found, b: items.length })));
        const grid = el('div', 'meta-grid');
        items.forEach((item) => {
            const entry = meta.items[item.id];
            const card = el('div', `meta-card${entry ? '' : ' meta-card-unknown'}`);
            card.append(visualIcon(item, 'meta-card-icon'));
            card.append(el('strong', '', entry ? bi(item.name) : m('unknown')));
            if (entry) {
                const rarity = GAME_RULES.loot.equipmentRarities[entry.best];
                card.append(el('span', `equipment-rarity-${rarity.id}`, rarity.name[gameLanguage]), el('span', '', m('foundTimes', { n: entry.count })));
            } else card.append(el('span', '', m('notFound')));
            grid.append(card);
        });
        wrap.append(grid);
        return wrap;
    }
    // Passivas e pactos descobertos; os não descobertos aparecem como mistério.
    function renderPowers() {
        const wrap = el('div');
        const skills = [...PASSIVE_SKILL_DATA.skills, SPIRIT_EYE_PASSIVE];
        const pacts = PASSIVE_SKILL_DATA.pacts;
        const found = skills.filter((x) => meta.passives[x.id]).length + pacts.filter((x) => meta.pacts[x.id]).length;
        wrap.append(el('p', 'meta-progress', m('powersProgress', { a: found, b: skills.length + pacts.length })));
        const section = (titleKey, entries, known, tag) => {
            wrap.append(el('h3', 'meta-section-title', m(titleKey)));
            const list = el('div', 'meta-list');
            entries.forEach((entry) => {
                const got = Boolean(known[entry.id]);
                const row = el('div', `meta-row${got ? ' meta-row-done' : ' meta-row-locked'}`);
                row.append(got ? visualIcon(entry, 'meta-row-icon') : el('span', 'meta-row-icon', '🔒'));
                const text = el('div', 'meta-row-text');
                text.append(el('strong', '', got ? `${bi(entry.name)}${tag ? ` · ${m(tag)}` : ''}` : m('unknown')), el('span', '', got ? bi(entry.description) : ''));
                row.append(text);
                list.append(row);
            });
            wrap.append(list);
        };
        section('passivesTitle', skills, meta.passives, null);
        section('pactsTitle', pacts, meta.pacts, 'pactTag');
        return wrap;
    }
    function renderRecords() {
        const list = el('div', 'meta-list');
        [['recRuns', meta.runs], ['recWins', meta.wins], ['recKills', meta.totals.kills], ['recBosses', meta.totals.bosses],
         ['recRegion', `${meta.best.region}/${GAME_DATA.regions.length}`], ['recLevel', meta.best.level], ['recLongest', formatTime(meta.best.time)], ['recPlaytime', formatTime(meta.totals.playMs)]]
            .forEach(([key, value]) => {
                const row = el('div', 'meta-row');
                row.append(el('div', 'meta-row-text', m(key)), el('b', '', String(value)));
                list.append(row);
            });
        return list;
    }

    // ---------- Tela inicial ----------
    function renderContinueSummary(snapshot) {
        const holder = document.getElementById('continue-summary');
        if (!holder) return;
        if (!snapshot) { holder.hidden = true; return; }
        const region = GAME_DATA.regions[snapshot.currentRegion] || GAME_DATA.regions[0];
        holder.textContent = m('continueSummary', {
            region: region.title[gameLanguage], level: snapshot.hero?.level ?? 1,
            potions: snapshot.hero?.potions ?? 0, gold: snapshot.hero?.gold ?? 0
        });
        holder.hidden = false;
    }

    // ---------- Vendedor ambulante (evento de exploração) ----------
    // Chamado por exploreForest(): decide se o vendedor aparece nesta exploração.
    function shouldOfferVendor() {
        explorationsSinceVendor++;
        if (explorationsSinceVendor < VENDOR.cooldownExplorations) return false;
        if (Math.random() * GAME_RULES.probabilityScale >= VENDOR.chance) return false;
        explorationsSinceVendor = 0;
        return true;
    }
    function createVendorEvent() {
        logMessage(m('vendorAppears'), 'special');
        return {
            id: 'wandering-vendor',
            vendor: true,
            title: { pt: S.pt.vendorTitle, en: S.en.vendorTitle },
            description: { pt: S.pt.vendorDescription, en: S.en.vendorDescription },
            choices: [
                { label: { pt: S.pt.vendorLook, en: S.en.vendorLook }, effect: 'vendor' },
                { label: { pt: S.pt.vendorLeave, en: S.en.vendorLeave }, effect: 'vendor-leave' }
            ]
        };
    }

    let vendorStock = [];
    function rollVendorStock() {
        const pool = [...VENDOR.offers];
        const picked = [pool.find((o) => o.id === 'potion')];
        pool.splice(pool.findIndex((o) => o.id === 'potion'), 1);
        while (picked.length < 4 && pool.length) {
            picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        }
        const regionScale = 1 + (currentRegion || 0) * 0.35;
        vendorStock = picked.map((offer) => ({
            ...offer,
            stock: offer.stock,
            price: Math.round(offer.price * regionScale * (0.9 + Math.random() * 0.2))
        }));
    }
    function openVendor() {
        rollVendorStock();
        renderVendor();
        const dialog = document.getElementById('vendor-dialog');
        if (!dialog.open) dialog.showModal();
    }
    function renderVendor() {
        document.getElementById('vendor-dialog-title').textContent = `🛒 ${m('vendorTitle')}`;
        document.getElementById('vendor-dialog-gold').textContent = `🪙 ${hero.gold}`;
        const list = el('div', 'meta-list');
        list.append(el('p', 'meta-progress', m('vendorIntro')));
        vendorStock.forEach((offer) => {
            const row = el('div', 'meta-row');
            row.append(el('span', 'meta-row-icon', offer.icon));
            const text = el('div', 'meta-row-text');
            text.append(el('strong', '', m(offer.key)), el('span', '', `${m(`${offer.key}Desc`)} · ${m('vendorStock', { n: offer.stock })}`));
            row.append(text);
            const btn = el('button', 'meta-buy');
            btn.type = 'button';
            if (offer.stock <= 0) { btn.textContent = m('vendorSold'); btn.disabled = true; }
            else {
                btn.textContent = `🪙${offer.price}`;
                btn.disabled = hero.gold < offer.price;
                btn.addEventListener('click', () => buyOffer(offer));
            }
            row.append(btn);
            list.append(row);
        });
        document.getElementById('vendor-dialog-body').replaceChildren(list);
    }
    function buyOffer(offer) {
        if (inCombat || gameOver || campaignComplete || offer.stock <= 0 || hero.gold < offer.price) return;
        const max = () => ({ hp: getEffectiveStat('maxHp'), foco: getEffectiveStat('maxFoco') });
        if (offer.id === 'potion') {
            if (hero.potions >= hero.maxPotions) { logMessage(t('eventPotionFull')); return; }
            hero.potions++;
        } else if (offer.id === 'elixir') {
            if (hero.hp >= max().hp && hero.foco >= max().foco) { logMessage(t('hpFull')); return; }
            hero.hp = max().hp; hero.foco = max().foco;
        } else if (offer.id === 'whetstone') hero.atk += 1;
        else if (offer.id === 'ironCharm') hero.def += 1;
        else if (offer.id === 'tonic') { hero.maxHp += 10; hero.hp = Math.min(max().hp, hero.hp + 10); }
        else if (offer.id === 'focusDraught') { hero.maxFoco += 10; hero.foco = Math.min(max().foco, hero.foco + 10); }
        else if (offer.id === 'eagleEye') hero.criticalChance = Math.min(selectedCharacter.limits.maxCriticalChance, hero.criticalChance + 1);
        else if (offer.id === 'scroll') hero.skillPoints = (Number(hero.skillPoints) || 0) + 1;
        else if (offer.id === 'map') hero.chestChanceBonus = Math.max(hero.chestChanceBonus, EXPLORATION_RULES.map.treasureChanceBonus);
        hero.gold -= offer.price;
        offer.stock--;
        logMessage(m('bought', { item: m(offer.key) }), 'loot');
        updateUI(); saveGame(); renderVendor();
    }

    // ---------- Montagem da interface ----------
    function buildDialog(id, titleId, extraHeading) {
        const dialog = el('dialog', 'item-drop-dialog meta-dialog');
        dialog.id = id;
        dialog.setAttribute('aria-labelledby', titleId);
        const content = el('div', 'item-drop-content');
        const heading = el('div', 'equipment-bag-heading');
        const title = el('h2', 'text-lg font-bold text-amber-300');
        title.id = titleId;
        heading.append(title);
        if (extraHeading) heading.append(extraHeading);
        const close = el('button', 'dialog-close-button', '×');
        close.type = 'button'; close.setAttribute('aria-label', 'Close');
        close.addEventListener('click', () => dialog.close());
        heading.append(close);
        content.append(heading);
        return { dialog, content };
    }
    function initDom() {
        const s = buildDialog('meta-dialog', 'meta-dialog-title');
        const tabs = el('div', 'meta-tabs'); tabs.id = 'meta-dialog-tabs';
        const body = el('div', 'meta-body'); body.id = 'meta-dialog-body';
        s.content.append(tabs, body); s.dialog.append(s.content);

        const gold = el('span', 'equipped-item-count'); gold.id = 'vendor-dialog-gold';
        const v = buildDialog('vendor-dialog', 'vendor-dialog-title', gold);
        const vBody = el('div', 'meta-body'); vBody.id = 'vendor-dialog-body';
        v.content.append(vBody); v.dialog.append(v.content);

        const toast = el('div', 'meta-toast'); toast.id = 'meta-toast'; toast.hidden = true; toast.setAttribute('role', 'status');
        const flash = el('div', 'rarity-flash'); flash.id = 'rarity-flash'; flash.hidden = true; flash.setAttribute('aria-hidden', 'true');
        document.body.append(s.dialog, v.dialog, toast, flash);

        const hint = el('p', 'telegraph-hint'); hint.id = 'telegraph-hint'; hint.hidden = true;
        document.getElementById('encounter-card')?.append(hint);

        const actions = document.querySelector('#character-setup .setup-actions');
        if (actions) {
            const summary = el('p', 'continue-summary'); summary.id = 'continue-summary'; summary.hidden = true;
            const sanctuaryBtn = el('button', 'start-secondary-button', m('openSanctuary'));
            sanctuaryBtn.type = 'button'; sanctuaryBtn.title = m('sanctuaryHint');
            sanctuaryBtn.addEventListener('click', () => openSanctuary('achievements'));
            actions.prepend(summary);
            actions.before(el('div', 'meta-setup-extras'));
            actions.previousElementSibling.append(sanctuaryBtn);
        }
    }

    // Modais e botões dependem do DOM já analisado (scripts deferred).
    initDom();

    return {
        beginRun, onEncounter, onVictory, onSpare, onChest, onInterrupt, onLevelUp, onRegionChange, onItem,
        onDefeat, onCampaignComplete, sync, text: m, renderContinueSummary, openSanctuary,
        shouldOfferVendor, createVendorEvent, openVendor, save, check,
        get data() { return meta; }
    };
})();
