import { CAMPAIGN } from '../../data_model/campaign.js';
import { MAP_LAYOUT } from '../../data_model/map_layout.js';
import { HEROES } from '../../data_model/heroes.js';
import { save } from '../core/save.js';
import { audio, state } from '../core/state.js';
import { NIGHT } from '../../data_model/night.js';
import { CAMPAIGN as CAMP, screenIndexOf } from '../../data_model/campaign.js';
import { BOSS_MODELS, chooseBossType } from '../../data_model/bosses.js';

// --- O MAPA ENTRE AS TELAS ---
// Depois do chefe de uma tela, o mapa (images/map/map.webp) aparece e o retrato do herói anda pelo caminho pontilhado até a tela seguinte
// (data_model/campaign.js: node e leg de cada tela, em pixels da imagem). Quando chega, CONTINUE (ou toque, Enter, espaço) começa a próxima onda.
const ANIMATION_SECONDS = MAP_LAYOUT.walk?.seconds ?? 2.8;
const HERO_FALLBACK = 'images/characters/demon-hunter-small.webp';

const screen = () => document.getElementById('mapScreen');
let raf = 0;
let onDone = null;
let arrived = false;

const [MAP_W, MAP_H] = CAMPAIGN.map.size;
const pct = ([x, y]) => [`${(x / MAP_W) * 100}%`, `${(y / MAP_H) * 100}%`];
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);

// Ponto a uma fração (0 a 1) do comprimento do caminho
function pointAlong(points, k) {
    const lengths = [];
    let total = 0;
    for (let i = 1; i < points.length; i++) {
        const d = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
        lengths.push(d);
        total += d;
    }
    let want = k * total;
    for (let i = 0; i < lengths.length; i++) {
        if (want <= lengths[i] || i === lengths.length - 1) {
            const t = lengths[i] ? Math.min(1, want / lengths[i]) : 0;
            return [points[i][0] + (points[i + 1][0] - points[i][0]) * t, points[i][1] + (points[i + 1][1] - points[i][1]) * t];
        }
        want -= lengths[i];
    }
    return points[points.length - 1];
}

const fillText = (template, from, to) => template.replace('{to}', CAMPAIGN.screens[to].name).replace('{from}', CAMPAIGN.screens[from].name);

// Textos por cima do mapa (MAP_LAYOUT.labels): o tamanho é em pixels da imagem do mapa e acompanha a largura dela (unidades cqw do .map-frame)
export const FONTS = { cinzel: "'Cinzel', serif", inter: "'Inter', sans-serif" };
function buildLabels() {
    const host = document.getElementById('mapLabels');
    host.textContent = '';
    for (const l of MAP_LAYOUT.labels ?? []) {
        const el = document.createElement('div');
        el.className = 'map-label' + (l.shadow === false ? '' : ' has-shadow');
        el.textContent = l.text;
        [el.style.left, el.style.top] = pct([l.x, l.y]);
        el.style.setProperty('--s', l.size);
        el.style.setProperty('--rot', `${l.rot ?? 0}deg`);
        el.style.color = l.color;
        el.style.fontFamily = FONTS[l.font] ?? FONTS.cinzel;
        el.style.fontWeight = l.weight ?? 700;
        el.style.fontStyle = l.italic ? 'italic' : 'normal';
        el.style.opacity = l.opacity ?? 1;
        host.appendChild(el);
    }
}

function buildNodes(from, to) {
    const host = document.getElementById('mapNodes');
    host.textContent = '';
    CAMPAIGN.screens.forEach((s, i) => {
        const node = document.createElement('i');
        // já passou: dourada · a próxima (destino): vermelha pulsando · as que ainda faltam: vermelhas (mostram para onde vamos)
        node.className = 'map-node' + (i <= from ? ' is-done' : i === to ? ' is-next' : ' is-ahead');
        node.style.setProperty('--done', MAP_LAYOUT.nodes.done);
        node.style.setProperty('--idle', MAP_LAYOUT.nodes.idle);
        node.style.setProperty('--next', MAP_LAYOUT.nodes.next);
        node.style.width = `${MAP_LAYOUT.nodes.size}%`;
        [node.style.left, node.style.top] = pct(s.node);
        node.title = s.name;
        host.appendChild(node);
        // As ondas da tela, como no Ranks: cada onda mostra ★★★ (as que ganhou acesas, as que faltam apagadas); a última é a do chefe (caveira)
        const waves = document.createElement('div');
        waves.className = 'map-waves';
        [waves.style.left, waves.style.top] = pct(s.node);
        let total = 0;
        for (let j = 1; j <= CAMP.wavesPerScreen; j++) {
            const wave = i * CAMP.wavesPerScreen + j;
            const won = wave < state.turn;
            const earned = won ? Math.min(3, state.run?.waveStars?.[wave] ?? 0) : 0;
            total += earned;
            const slot = document.createElement('span');
            const isBossWave = !!chooseBossType(wave, HEROES[save.hero]?.model ?? 'hunter');
            slot.className = 'mw-slot' + (isBossWave ? ' is-boss' : '') + (won ? ' is-won' : wave === state.turn ? ' is-now' : '');
            slot.title = `Wave ${wave}${isBossWave ? ' (boss)' : ''}${won ? `: ${earned} of 3 stars` : ''}`;
            slot.innerHTML = [0, 1, 2].map(k => `<i class="mw-star${k < earned ? ' is-on' : ''}">★</i>`).join('');
            waves.appendChild(slot);
        }
        host.appendChild(waves);
        // Resumo para telas pequenas (no celular os 9 ★ não cabem): ★ ganhas / possíveis nesta tela
        const sum = document.createElement('div');
        sum.className = 'map-sum' + (total === CAMP.wavesPerScreen * 3 ? ' is-full' : '');
        [sum.style.left, sum.style.top] = pct(s.node);
        sum.textContent = `★ ${total}/${CAMP.wavesPerScreen * 3}`;
        host.appendChild(sum);
    });
}

// A moldura de jogo em volta do mapa: herói, estrelas e ouro no alto; a trilha das 6 telas, a legenda e o chefe que espera, embaixo
function fillHud(here, target) {
    const hero = HEROES[save.hero];
    document.getElementById('mapHeroCard').src = hero?.portraitImage ?? HERO_FALLBACK;
    document.getElementById('mapHeroName').textContent = (hero?.name ?? 'Hero').toUpperCase();
    document.getElementById('mapHeroLevel').textContent = `LV ${state.playerLevel}`;
    document.getElementById('mapStars').textContent = state.run?.stars ?? 0;
    document.getElementById('mapGold').textContent = state.coins ?? 0;
    // Trilha: uma casa por tela, com as ondas vencidas e as estrelas
    const rail = document.getElementById('mapRail');
    rail.textContent = '';
    CAMPAIGN.screens.forEach((s, i) => {
        let won = 0;
        let stars = 0;
        for (let j = 1; j <= CAMP.wavesPerScreen; j++) {
            const wave = i * CAMP.wavesPerScreen + j;
            if (wave < state.turn) { won++; stars += state.run?.waveStars?.[wave] ?? 0; }
        }
        const seg = document.createElement('div');
        seg.className = 'rail-seg' + (i === target ? ' is-target' : '') + (i === here ? ' is-here' : '') + (won === CAMP.wavesPerScreen ? ' is-done' : '');
        seg.innerHTML = `<b></b><span></span><i style="width:${(won / CAMP.wavesPerScreen) * 100}%"></i>`;
        seg.querySelector('b').textContent = s.name;
        seg.querySelector('span').textContent = won ? `${won}/${CAMP.wavesPerScreen} · ★${stars}` : `0/${CAMP.wavesPerScreen}`;
        rail.appendChild(seg);
    });
    // O chefe que fecha a tela onde o herói vai jogar
    const idx = target >= 0 ? target : here;
    // O próximo chefe da tela (o primeiro ainda não vencido; a tela do Castle tem três)
    const waves = Array.from({ length: CAMP.wavesPerScreen }, (_, k) => idx * CAMP.wavesPerScreen + k + 1);
    const hm = hero?.model ?? 'hunter';
    const bossWave = waves.find(w => chooseBossType(w, hm) && w >= state.turn) ?? [...waves].reverse().find(w => chooseBossType(w, hm)) ?? waves[waves.length - 1];
    const boss = chooseBossType(bossWave, hero?.model ?? 'hunter');
    const next = document.getElementById('mapNext');
    next.textContent = '';
    if (boss && BOSS_MODELS[boss]) {
        const beaten = bossWave < state.turn;
        next.textContent = beaten ? `✔ ${BOSS_MODELS[boss].name} defeated` : `☠ Boss on wave ${bossWave}: ${BOSS_MODELS[boss].name}`;
        next.classList.toggle('is-beaten', beaten);
    }
}

function finish() {
    if (!arrived) return;
    window.removeEventListener('keydown', onKey);
    screen().classList.add('hidden');
    const done = onDone;
    onDone = null;
    done?.();
}

function onKey(e) {
    if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (!arrived) arriveNow(); else finish();
    }
}

let arriveNow = () => {};

// from, to: índices das telas (CAMPAIGN.screens). callback: roda quando o jogador continua.
export function showMapTransition(from, to, callback) {
    const root = screen();
    const leg = CAMPAIGN.screens[from].leg;
    if (!root || !leg) { callback(); return; }
    cancelAnimationFrame(raf);
    onDone = callback;
    arrived = false;
    document.getElementById('mapImg').src = CAMPAIGN.map.src;
    document.getElementById('mapHero').src = HEROES[save.hero]?.portraitImage ?? HERO_FALLBACK;
    document.getElementById('mapTitle').textContent = fillText(MAP_LAYOUT.texts.title, from, to);
    document.getElementById('mapSub').textContent = fillText(MAP_LAYOUT.texts.sub, from, to);
    const btn = document.getElementById('btnMapContinue');
    btn.disabled = true;
    btn.textContent = MAP_LAYOUT.texts.button;
    buildNodes(from, to);
    buildLabels();
    fillHud(from, to);
    const marker = document.getElementById('mapMarker');
    marker.style.width = `${MAP_LAYOUT.marker.size}%`;
    marker.style.setProperty('--border', MAP_LAYOUT.marker.border);
    marker.style.setProperty('--border-w', `${MAP_LAYOUT.marker.borderWidth}px`);
    const place = (p) => { [marker.style.left, marker.style.top] = pct(p); };
    place(leg[0]);
    root.classList.remove('hidden');
    window.addEventListener('keydown', onKey);

    const arrive = () => {
        cancelAnimationFrame(raf);
        place(leg[leg.length - 1]);
        marker.classList.add('is-arrived');
        document.querySelector('.map-node.is-next')?.classList.add('is-done');
        arrived = true;
        btn.disabled = false;
        btn.focus?.();
    };
    arriveNow = arrive;
    marker.classList.remove('is-arrived');
    const start = performance.now() + 450;           // um respiro antes de andar
    const step = (now) => {
        const k = Math.max(0, Math.min(1, (now - start) / (ANIMATION_SECONDS * 1000)));
        place(pointAlong(leg, easeInOut(k)));
        if (k >= 1) arrive();
        else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
}

// O mapa parado: o retrato do herói fica em cima da tela onde ele está agora (só olhar; o botão volta). subtitle: o texto de cima (ex.: "WAVE 8 OF 30")
export function showMapHere(index, subtitle, callback) {
    const root = screen();
    if (!root) { callback?.(); return; }
    cancelAnimationFrame(raf);
    onDone = callback;
    arrived = true;
    document.getElementById('mapImg').src = CAMPAIGN.map.src;
    document.getElementById('mapHero').src = HEROES[save.hero]?.portraitImage ?? HERO_FALLBACK;
    document.getElementById('mapTitle').textContent = `YOU ARE IN THE ${CAMPAIGN.screens[index].name}`;
    document.getElementById('mapSub').textContent = subtitle ?? '';
    const btn = document.getElementById('btnMapContinue');
    btn.disabled = false;
    btn.textContent = 'BACK ◀';
    buildNodes(index, -1);
    buildLabels();
    fillHud(index, -1);
    const marker = document.getElementById('mapMarker');
    marker.style.width = `${MAP_LAYOUT.marker.size}%`;
    marker.style.setProperty('--border', MAP_LAYOUT.marker.border);
    marker.style.setProperty('--border-w', `${MAP_LAYOUT.marker.borderWidth}px`);
    [marker.style.left, marker.style.top] = pct(CAMPAIGN.screens[index].node);
    marker.classList.add('is-arrived');
    arriveNow = () => {};
    root.classList.remove('hidden');
    window.addEventListener('keydown', onKey);
}

// Abre o mapa parado de dentro do jogo (ícone do mapa no HUD e no acampamento, tecla M): na caçada pausa o jogo enquanto o mapa está aberto
export function openMapView() {
    const from = state.gameState;
    if (from !== 'PLAYING' && from !== 'CAMP') return;
    if (!screen().classList.contains('hidden')) return;
    const wave = from === 'CAMP' ? Math.max(1, state.turn - 1) : state.turn;           // no acampamento, o herói ainda está na tela da onda que acabou
    if (from === 'PLAYING') {
        state.gameState = 'MAP';
        audio.setPaused(true);
    }
    showMapHere(screenIndexOf(wave), `WAVE ${wave} OF ${NIGHT.hours}`, () => {
        if (from === 'PLAYING' && state.gameState === 'MAP') {
            state.knifeInput.stick.fire = false;
            state.gameState = 'PLAYING';
            audio.setPaused(false);
        }
    });
}

export function setupMapScreen() {
    document.getElementById('btnMap').addEventListener('click', openMapView);
    document.getElementById('btnCampMap').addEventListener('click', openMapView);
    window.addEventListener('keydown', (e) => { if (e.code === 'KeyM' && !e.repeat && !e.ctrlKey && !e.metaKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) openMapView(); });
    document.getElementById('btnMapContinue').addEventListener('click', () => { if (arrived) finish(); });
    // Tocar no mapa pula a caminhada, e depois continua
    document.getElementById('mapFrame').addEventListener('click', () => { if (!arrived) arriveNow(); });
}
