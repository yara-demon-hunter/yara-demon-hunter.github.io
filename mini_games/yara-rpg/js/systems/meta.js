// Meta-progressão: conquistas, bestiário, coleção, poderes descobertos, recordes, tempo de jogo,
// resumo da jornada, brilho de drops raros e aviso de telegrafia.
// Dados em ../data/achievements.js; textos em translations-*.js (chaves "meta..."); marcação HTML em partials/.
// Classic browser script; carregado antes de game.js. Os demais sistemas só chamam
// `window.YaraMeta?.hook()`, então o jogo continua funcionando se este arquivo faltar.
window.YaraMeta = (() => {
    const META_KEY = 'yara-rpg-meta-v1';
    const ACHIEVEMENTS = window.YaraRpgData.achievements;
    const MINUTE = 60000;

    const m = (key, values = {}) => t(`meta${key[0].toUpperCase()}${key.slice(1)}`, values);
    const localized = (obj) => obj[gameLanguage] || obj.pt;

    // Como cada tipo de condição de achievements.js é avaliado.
    const CONDITIONS = Object.freeze({
        totalKills: (c, v) => c.meta.totals.kills >= v,
        totalBosses: (c, v) => c.meta.totals.bosses >= v,
        totalInterrupts: (c, v) => c.meta.totals.interrupts >= v,
        totalSpared: (c, v) => c.meta.totals.spared >= v,
        totalChests: (c, v) => c.meta.totals.chests >= v,
        wins: (c, v) => c.meta.wins >= v,
        bestLevel: (c, v) => c.meta.best.level >= v,
        bestRegion: (c, v) => c.meta.best.region >= v,
        monsterDefeated: (c, v) => c.meta.bestiary[v]?.killed > 0,
        runFlawless: (c, v) => c.run.maxFlawless >= v,
        distinctItems: (c, v) => Object.keys(c.meta.items).length >= v,
        itemRarityIndex: (c, v) => Object.values(c.meta.items).some((item) => item.best >= v),
        gold: (c, v) => (Number(c.hero.gold) || 0) >= v,
        runMinutes: (c, v) => c.run.playMs >= v * MINUTE,
        totalMinutes: (c, v) => c.meta.totals.playMs >= v * MINUTE,
        spiritEye: (c) => Boolean(c.hero.spiritWorldUnlocked),
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
        const source = item.image || item.iconImage;
        if (source) {
            const img = el('img');
            img.src = source; img.alt = ''; img.setAttribute('aria-hidden', 'true');
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
        ACHIEVEMENTS.forEach((achievement) => {
            if (meta.achievements[achievement.id]) return;
            const { type, value } = achievement.condition;
            let reached = false;
            try { reached = Boolean(CONDITIONS[type]?.(ctx, value)); } catch {}
            if (!reached) return;
            meta.achievements[achievement.id] = Date.now();
            changed = true;
            pushToast(achievement.icon, m('achUnlocked'), localized(achievement.name));
            try { playSound('regionDiscovered'); } catch {}
        });
        if (changed) save();
    }

    // Registra passivas e pactos que o herói já possui (iniciais, recompensas e contatos da névoa).
    function recordPowers() {
        let changed = false;
        (hero.passiveSkills || []).forEach((id) => { if (!meta.passives[id]) { meta.passives[id] = true; changed = true; } });
        (hero.monsterPacts || []).forEach((id) => { if (!meta.pacts[id]) { meta.pacts[id] = true; changed = true; } });
        // O Olho Espiritual é uma bandeira do herói, não um item de passiveSkills.
        if (hero.spiritWorldUnlocked && !meta.passives[SPIRIT_EYE_PASSIVE.id]) { meta.passives[SPIRIT_EYE_PASSIVE.id] = true; changed = true; }
        if (changed) save();
    }

    // ---------- Tempo de jogo ----------
    function formatDuration(ms) {
        const total = Math.floor(ms / 1000);
        const h = Math.floor(total / 3600), min = Math.floor((total % 3600) / 60), sec = total % 60;
        const two = (n) => String(n).padStart(2, '0');
        return h > 0 ? `${h}h ${two(min)}min ${two(sec)}s` : `${min}min ${two(sec)}s`;
    }
    function formatClock(ms) {
        const total = Math.floor(ms / 1000);
        const h = Math.floor(total / 3600), min = Math.floor((total % 3600) / 60), sec = total % 60;
        const two = (n) => String(n).padStart(2, '0');
        return h > 0 ? `${h}:${two(min)}:${two(sec)}` : `${two(min)}:${two(sec)}`;
    }

    // Faixa no banner de exploração: números que mudam durante a jornada. Tocar abre o Santuário.
    function renderRunStats() {
        const strip = document.getElementById('run-stats');
        if (!strip) return;
        const r = run();
        const done = ACHIEVEMENTS.filter((a) => meta.achievements[a.id]).length;
        const chips = [
            ['⏱️', formatClock(r.playMs), 'statTime'],
            ['⚔️', r.kills, 'statKills'],
            ['🔥', r.flawless, 'statStreak'],
            ['🏆', `${done}/${ACHIEVEMENTS.length}`, 'statAchievements'],
        ];
        strip.setAttribute('aria-label', m('statOpen'));
        strip.title = m('statOpen');
        strip.replaceChildren(...chips.map(([icon, value, key]) => {
            const chip = el('span', 'run-stat');
            chip.title = m(key);
            chip.append(el('span', 'run-stat-icon', icon), el('b', '', String(value)));
            return chip;
        }));
    }

    // Conta só o tempo ativo: aba visível, jornada em andamento e sem fim de jogo.
    let tickCount = 0;
    window.setInterval(() => {
        const gameMain = document.getElementById('game-main');
        const r = run();
        if (document.hidden || !gameMain || gameMain.hidden || !r.characterId || r.finished || gameOver || campaignComplete) return;
        r.playMs += 1000;
        meta.totals.playMs += 1000;
        renderRunStats();
        tickCount++;
        if (tickCount % 10 === 0) { save(); check(); }
    }, 1000);

    // ---------- Ciclo da jornada ----------
    function beginRun(character) {
        meta.runs++;
        meta.run = blankRun(character?.id);
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
        [['summaryTime', formatDuration(summary.time)], ['summaryLevel', summary.level], ['summaryRegion', summary.region],
         ['summaryKills', summary.kills], ['summaryBosses', summary.bosses], ['summaryChests', summary.chests],
         ['summarySpared', summary.spared], ['summaryInterrupts', summary.interrupts]]
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

    // ---------- Telegrafia e atualização da tela ----------
    function sync() {
        const active = typeof inCombat !== 'undefined' && inCombat && enemyTelegraphing;
        document.getElementById('monster-icon')?.classList.toggle('monster-telegraphing', active);
        const hint = document.getElementById('telegraph-hint');
        if (hint) { hint.hidden = !active; hint.textContent = m('telegraphHint'); }
        if (typeof hero !== 'undefined') { recordPowers(); check(); }
        renderRunStats();
    }

    // ---------- Santuário ----------
    const TABS = Object.freeze([
        { id: 'achievements', emoji: '🏆', labelKey: 'tabAchievements', render: () => renderAchievements() },
        { id: 'bestiary', emoji: '👹', labelKey: 'tabBestiary', render: () => renderBestiary() },
        { id: 'collection', emoji: '🎒', labelKey: 'tabCollection', render: () => renderCollection() },
        { id: 'powers', emoji: '✨', labelKey: 'tabPowers', render: () => renderPowers() },
        { id: 'records', emoji: '📜', labelKey: 'tabRecords', render: () => renderRecords() },
    ]);
    let activeTab = 'achievements';
    function openSanctuary(tab = activeTab) {
        activeTab = tab;
        renderSanctuary();
        const dialog = document.getElementById('meta-dialog');
        if (!dialog.open) dialog.showModal();
    }
    function closeSanctuary() {
        const dialog = document.getElementById('meta-dialog');
        if (dialog.open) dialog.close();
    }
    function renderSanctuary() {
        document.getElementById('meta-dialog-tabs').replaceChildren(...TABS.map((tab) => {
            const button = el('button', `meta-tab${tab.id === activeTab ? ' meta-tab-active' : ''}`, `${tab.emoji} ${m(tab.labelKey)}`);
            button.type = 'button';
            button.addEventListener('click', () => { activeTab = tab.id; renderSanctuary(); });
            return button;
        }));
        document.getElementById('meta-dialog-body').replaceChildren(TABS.find((tab) => tab.id === activeTab).render());
    }

    function renderAchievements() {
        const wrap = el('div');
        const done = ACHIEVEMENTS.filter((a) => meta.achievements[a.id]).length;
        wrap.append(el('p', 'meta-progress', m('achProgress', { a: done, b: ACHIEVEMENTS.length })));
        const list = el('div', 'meta-list');
        ACHIEVEMENTS.forEach((achievement) => {
            const got = Boolean(meta.achievements[achievement.id]);
            const row = el('div', `meta-row${got ? ' meta-row-done' : ' meta-row-locked'}`);
            row.append(el('span', 'meta-row-icon', got ? achievement.icon : '🔒'));
            const text = el('div', 'meta-row-text');
            text.append(el('strong', '', localized(achievement.name)), el('span', '', localized(achievement.description)));
            row.append(text);
            list.append(row);
        });
        wrap.append(list);
        return wrap;
    }
    function bestiaryTemplates() {
        return [...Object.values(GAME_DATA.monsters.byRegion).flat(), ...(GAME_DATA.specialMonsters || [])];
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
            card.append(el('strong', '', known ? localized(tpl.name) : m('unknown')));
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
            card.append(el('strong', '', entry ? localized(item.name) : m('unknown')));
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
        const section = (titleKey, entries, known, tagKey) => {
            wrap.append(el('h3', 'meta-section-title', m(titleKey)));
            const list = el('div', 'meta-list');
            entries.forEach((entry) => {
                const got = Boolean(known[entry.id]);
                const row = el('div', `meta-row${got ? ' meta-row-done' : ' meta-row-locked'}`);
                row.append(got ? visualIcon(entry, 'meta-row-icon') : el('span', 'meta-row-icon', '🔒'));
                const text = el('div', 'meta-row-text');
                text.append(
                    el('strong', '', got ? `${localized(entry.name)}${tagKey ? ` · ${m(tagKey)}` : ''}` : m('unknown')),
                    el('span', '', got ? localized(entry.description) : '')
                );
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
         ['recRegion', `${meta.best.region}/${GAME_DATA.regions.length}`], ['recLevel', meta.best.level],
         ['recLongest', formatDuration(meta.best.time)], ['recPlaytime', formatDuration(meta.totals.playMs)]]
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

    renderRunStats();

    return {
        beginRun, onEncounter, onVictory, onSpare, onChest, onInterrupt, onLevelUp, onRegionChange, onItem,
        onDefeat, onCampaignComplete, sync, renderContinueSummary, openSanctuary, closeSanctuary, check,
        get data() { return meta; }
    };
})();
