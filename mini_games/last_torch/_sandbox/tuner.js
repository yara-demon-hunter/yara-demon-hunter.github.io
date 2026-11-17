// Tuner da tela de jogo (aba "HUD tuner" do sandbox).
// Mostra o jogo de verdade num iframe do tamanho de qualquer celular, tablet ou monitor; cada peça do HUD e dos controles
// ganha uma alça que dá para ARRASTAR, e um painel ajusta posição fina e tamanho. O botão COPY leva só o que foi alterado
// (por resolução) para colar na conversa com a IA, que aplica no CSS do jogo. Nada aqui altera o jogo: os ajustes são só as
// propriedades `translate` e `scale` do elemento dentro do iframe, e ficam guardados no localStorage do sandbox.
const STORE_KEY = 'lt_tuner_v1';
const CSS_KEY = 'lt_tuner_css';          // impressão digital do CSS do jogo quando os ajustes foram feitos
const BACKUP_KEY = 'lt_tuner_backup';    // ajustes antigos guardados quando o CSS mudou (para restaurar, se preciso)

// Impressão digital do CSS do jogo (game.css e tudo o que ele importa). Se mudou desde os ajustes, eles provavelmente já
// foram aplicados no CSS pela IA: reaplicá-los por cima contaria cada um DUAS vezes.
async function cssFingerprint() {
    const seen = new Set();
    let text = '';
    async function grab(url) {
        if (seen.has(url)) return;
        seen.add(url);
        const body = await (await fetch(url, { cache: 'no-store' })).text();
        text += body;
        for (const m of body.matchAll(/@import\s+url\(['"]?([^'")]+)['"]?\)/g)) await grab(new URL(m[1], url).href);
    }
    try {
        await grab(new URL('/css/game.css', location.origin).href);
        await grab(new URL('/data_model/fluid_layout.js', location.origin).href);
    } catch { return null; }
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    return String(h >>> 0);
}

// Peças ajustáveis (id do elemento no last_torch.html). touch: só existe em tela de toque; desktop: só no computador.
const ELEMENTS = [
    { id: 'heroCard', label: 'Hero card' },
    { id: 'btnPause', label: 'Skill medal' },
    { id: 'hudButtons', label: 'Settings button' },
    { id: 'bossHpContainer', label: 'Boss bar' },
    { id: 'hudBottom', label: 'Wave bar (bottom)' },
    { id: 'hudScore', label: 'Score' },
    { id: 'hudStreak', label: 'Streak' },
    { id: 'toasts', label: 'Toasts / hints' },
    { id: 'joystick', label: 'Joystick', touch: true },
    { id: 'knifeButton', label: 'Dagger button', touch: true },
    { id: 'dashButton', label: 'Dash button', touch: true },
    { id: 'mouseHint', label: 'Mouse hint', desktop: true }
];

// Os três perfis do jogo (js/ui/fluid_layout.js): o dono ajusta UMA tela de cada e o jogo usa os valores, proporcionalmente, em
// todas as outras. [rótulo, largura, altura, toque]
const PRESETS = [
    ['Portrait · phone 390×844', 390, 844, true],
    ['Landscape · phone 844×390', 844, 390, true],
    ['Desktop 1280×720', 1280, 720, false]
];

const keyOf = (w, h, touch) => `${w}x${h}${touch ? 't' : 'd'}`;
const describe = (w, h, touch) => `${w}x${h} · ${touch ? 'touch' : 'desktop'} · ${w >= h ? 'landscape' : 'portrait'}`;
const round = (n) => Math.round(n * 100) / 100;
const signed = (n) => (n > 0 ? `+${round(n)}` : `${round(n)}`);

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {}; } catch { return {}; }
}
let currentCss = null;
function writeStore(data) {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
        if (currentCss) localStorage.setItem(CSS_KEY, currentCss);
    } catch { /* sem armazenamento: só vale nesta aba */ }
}

// Só o que mudou: posição (dx, dy) e tamanho (s). Tudo igual ao padrão = nada a copiar
const isChanged = (c) => Boolean(c) && (c.dx !== 0 || c.dy !== 0 || c.s !== 1 || c.hide === true);

export function mountTuner(root) {
    const data = readStore();                 // { "390x844t": { heroCard: { dx, dy, s, hide, base: [l, t, w, h] } } }
    let view = { w: 390, h: 844, touch: true };
    let selected = 'heroCard';
    let frame = null;
    let raf = 0;
    let scale = 1;
    let paused = true;                        // o jogo começa PAUSADO: rodando sozinho atrapalha o ajuste
    let cssNow = null;                        // impressão digital do CSS atual do jogo

    root.innerHTML = `
      <div class="tn">
        <div class="tn-stage" id="tnStage">
          <button id="tnPause" class="tn-pause" title="Pause or resume the game (Space)"></button>
          <div class="tn-device" id="tnDevice"><iframe id="tnFrame" title="Game"></iframe><div id="tnHandles"></div></div>
        </div>
        <aside class="tn-side">
          <h3>Screen</h3>
          <select id="tnPreset"></select>
          <div class="tn-custom">
            <input id="tnW" type="number" min="240" max="3840" aria-label="Width"> ×
            <input id="tnH" type="number" min="240" max="2160" aria-label="Height">
            <label><input id="tnTouch" type="checkbox"> touch</label>
            <button id="tnRotate" title="Swap width and height">⟳</button>
          </div>
          <h3>Scene</h3>
          <label class="tn-check"><input id="tnBoss" type="checkbox"> Boss bar</label>
          <label class="tn-check"><input id="tnStreak" type="checkbox"> Kill streak</label>
          <label class="tn-check"><input id="tnPoints" type="checkbox" checked> Skill points badge</label>
          <h3>Pieces <small>(drag on the screen, or pick here)</small></h3>
          <div id="tnList" class="tn-list"></div>
          <div id="tnFields" class="tn-fields"></div>
          <div class="tn-actions">
            <button id="tnResetPiece">Reset piece</button>
            <button id="tnResetScreen">Reset this screen</button>
          </div>
          <button id="tnResetAll" class="tn-copy-one" title="Use this after the AI applied your changes to the game CSS, so they are not applied twice">Reset ALL screens (after the AI applied them)</button>
          <button id="tnCopy" class="tn-copy">📋 COPY ALL CHANGES</button>
          <button id="tnCopyOne" class="tn-copy-one">Copy this screen only</button>
          <p id="tnStatus" class="tn-status"></p>
          <div id="tnCssNotice" class="tn-notice" hidden>
            The game CSS changed since your last adjustments (they were probably applied by the AI), so they are no longer
            added on top: otherwise each one would count twice. <button id="tnRestore">Restore them anyway</button>
          </div>
          <textarea id="tnOut" class="tn-out" readonly rows="6" placeholder="What you changed shows up here, ready to paste."></textarea>
        </aside>
      </div>`;
    const $ = (id) => root.querySelector(`#${id}`);

    // CSS mudou desde os ajustes guardados? Então eles saem de cena (ficam numa cópia, com botão para restaurar)
    const cssChecked = cssFingerprint().then(fp => {
        cssNow = currentCss = fp;
        let saved = null;
        try { saved = localStorage.getItem(CSS_KEY); } catch { /* sem armazenamento */ }
        const hasData = Object.keys(data).length > 0;
        if (fp && hasData && saved && saved !== fp) {
            try { localStorage.setItem(BACKUP_KEY, JSON.stringify(data)); } catch { /* sem armazenamento */ }
            Object.keys(data).forEach(k => delete data[k]);
            writeStore(data);
            $('tnCssNotice').hidden = false;
        } else if (fp) {
            try { localStorage.setItem(CSS_KEY, fp); } catch { /* sem armazenamento */ }
        }
        applyAll(); renderList(); renderFields(); renderStatus();
    });

    function renderPause() {
        const b = $('tnPause');
        b.textContent = paused ? '▶ Play game' : '⏸ Pause game';
        b.classList.toggle('is-paused', paused);
    }
    function togglePause() {
        paused = !paused;
        frame?.contentWindow?.tunerApi?.freeze(paused);
        renderPause();
    }

    // ---------- Estado de uma resolução ----------
    const key = () => keyOf(view.w, view.h, view.touch);
    const changesHere = () => (data[key()] ??= {});
    const doc = () => frame?.contentDocument ?? null;
    const target = (id) => doc()?.getElementById(id) ?? null;

    // O jogo já posiciona as peças do HUD pelo layout fluido (translate e scale em linha); o ajuste do tuner soma por cima:
    // deslocamentos se somam e os tamanhos se multiplicam. Os controles de toque usam variáveis, então ali não há nada a somar.
    const fluidOf = (id) => frame?.contentWindow?.tunerApi?.fluid?.(id) ?? [0, 0, 1];
    function paint(node, id, c) {
        const [fx, fy, fs] = fluidOf(id);
        const dx = fx + (c?.dx ?? 0), dy = fy + (c?.dy ?? 0), size = fs * (c?.s ?? 1);
        if (dx || dy) node.style.translate = `${dx}px ${dy}px`; else node.style.removeProperty('translate');
        if (Math.abs(size - 1) > 0.0005) node.style.scale = String(size); else node.style.removeProperty('scale');
    }
    function applyOne(id) {
        const node = target(id);
        if (!node) return;
        paint(node, id, changesHere()[id]);
        node.style.visibility = changesHere()[id]?.hide ? 'hidden' : '';
    }
    const applyAll = () => ELEMENTS.forEach(e => applyOne(e.id));

    // Posição do elemento SEM os ajustes do tuner (só o layout fluido do jogo): é o "onde o jogo a coloca hoje" do texto copiado
    function baseRect(id) {
        const node = target(id);
        if (!node) return null;
        const t = node.style.translate, s = node.style.scale;
        paint(node, id, null);
        const r = node.getBoundingClientRect();
        if (t) node.style.translate = t; else node.style.removeProperty('translate');
        if (s) node.style.scale = s; else node.style.removeProperty('scale');
        return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    }

    function edit(id, patch) {
        const all = changesHere();
        const was = all[id];
        const next = { dx: 0, dy: 0, s: 1, hide: false, ...was, ...patch };
        if (!was || !isChanged(was)) next.base = baseRect(id) ?? next.base;
        next.dx = round(next.dx); next.dy = round(next.dy); next.s = Math.max(0.3, Math.min(3, round(next.s)));
        if (isChanged(next)) all[id] = next; else delete all[id];
        if (!Object.keys(all).length) delete data[key()];
        writeStore(data);
        applyOne(id);
        renderFields();
        renderList();
        renderStatus();
    }

    // ---------- Palco: iframe do tamanho escolhido, encolhido para caber ----------
    function fit() {
        const stage = $('tnStage');
        const room = { w: stage.clientWidth - 16, h: stage.clientHeight - 16 };
        scale = Math.min(room.w / view.w, room.h / view.h, 1.6);
        const device = $('tnDevice');
        device.style.width = `${view.w}px`;
        device.style.height = `${view.h}px`;
        device.style.transform = `scale(${scale})`;
        stage.style.setProperty('--tn-box-w', `${view.w * scale}px`);
        stage.style.setProperty('--tn-box-h', `${view.h * scale}px`);
    }

    function loadFrame() {
        frame = $('tnFrame');
        frame.style.width = `${view.w}px`;
        frame.style.height = `${view.h}px`;
        frame.onload = () => {
            // O jogo precisa terminar de carregar: frame.js avisa por window.tunerApi
            const wait = setInterval(() => {
                if (!frame.contentWindow?.tunerApi?.ready) return;
                clearInterval(wait);
                cssChecked.then(() => { applyScene(); applyAll(); renderFields(); });
                applyScene();
                applyAll();
                renderFields();
            }, 120);
        };
        frame.src = `${view.touch ? '/__touch/' : '/__desk/'}?t=${Date.now()}`;
        fit();
    }

    function applyScene() {
        const api = frame?.contentWindow?.tunerApi;
        if (!api) return;
        api.boss($('tnBoss').checked);
        api.streak($('tnStreak').checked ? 24 : 0);
        api.points($('tnPoints').checked ? 2 : 0);
        api.freeze(paused);
        renderPause();
        applyAll();
    }

    function setView(w, h, touch, reload = true) {
        view = { w: Math.round(w), h: Math.round(h), touch };
        $('tnW').value = view.w;
        $('tnH').value = view.h;
        $('tnTouch').checked = touch;
        const index = PRESETS.findIndex(p => p[1] === view.w && p[2] === view.h && p[3] === touch);
        $('tnPreset').value = index >= 0 ? String(index) : 'custom';
        buildHandles();
        renderList();
        renderFields();
        renderStatus();
        if (reload) loadFrame(); else fit();
    }

    // ---------- Alças: uma caixa por peça, por cima do iframe, na posição atual dela ----------
    const handles = new Map();
    function buildHandles() {
        const host = $('tnHandles');
        host.replaceChildren();
        handles.clear();
        ELEMENTS.filter(e => (!e.touch || view.touch) && (!e.desktop || !view.touch)).forEach(e => {
            const box = el('div', 'tn-h');
            box.dataset.id = e.id;
            box.append(el('span', '', e.label));
            box.addEventListener('pointerdown', (ev) => startDrag(ev, e.id));
            host.appendChild(box);
            handles.set(e.id, box);
        });
    }

    function placeHandles() {
        const d = doc();
        handles.forEach((box, id) => {
            const node = d?.getElementById(id);
            const r = node?.getBoundingClientRect();
            const visible = r && r.width > 0 && r.height > 0 && getComputedStyle(node).display !== 'none';
            box.style.display = visible ? '' : 'none';
            if (!visible) return;
            box.style.left = `${r.left}px`;
            box.style.top = `${r.top}px`;
            box.style.width = `${r.width}px`;
            box.style.height = `${r.height}px`;
            box.classList.toggle('is-selected', id === selected);
            box.classList.toggle('is-changed', isChanged(changesHere()[id]));
        });
        raf = requestAnimationFrame(placeHandles);
    }

    let drag = null;
    function startDrag(ev, id) {
        ev.preventDefault();
        select(id);
        const c = changesHere()[id] ?? { dx: 0, dy: 0, s: 1 };
        drag = { id, x: ev.clientX, y: ev.clientY, dx: c.dx, dy: c.dy };
        ev.currentTarget.setPointerCapture(ev.pointerId);
        ev.currentTarget.onpointermove = (m) => {
            if (!drag) return;
            // O palco está encolhido (scale): o movimento do mouse vale 1/scale pixels do jogo
            edit(drag.id, { dx: drag.dx + (m.clientX - drag.x) / scale, dy: drag.dy + (m.clientY - drag.y) / scale });
        };
        ev.currentTarget.onpointerup = ev.currentTarget.onpointercancel = () => { drag = null; };
    }

    // ---------- Painel ----------
    function select(id) {
        selected = id;
        renderList();
        renderFields();
    }

    function renderList() {
        const list = $('tnList');
        list.replaceChildren();
        ELEMENTS.filter(e => (!e.touch || view.touch) && (!e.desktop || !view.touch)).forEach(e => {
            const b = el('button', `tn-item${e.id === selected ? ' on' : ''}${isChanged(changesHere()[e.id]) ? ' changed' : ''}`, e.label);
            b.onclick = () => select(e.id);
            list.appendChild(b);
        });
    }

    function renderFields() {
        const box = $('tnFields');
        box.replaceChildren();
        const info = ELEMENTS.find(e => e.id === selected);
        if (!info) return;
        const c = changesHere()[selected] ?? { dx: 0, dy: 0, s: 1, hide: false };
        const row = (label, input) => { const r = el('label', 'tn-field'); r.append(el('span', '', label), input); box.appendChild(r); return input; };
        const number = (value, step, onChange) => {
            const i = el('input'); i.type = 'number'; i.step = step; i.value = round(value);
            i.onchange = () => onChange(parseFloat(i.value) || 0);
            return i;
        };
        row('Move X (px)', number(c.dx, 1, v => edit(selected, { dx: v })));
        row('Move Y (px)', number(c.dy, 1, v => edit(selected, { dy: v })));
        const size = row('Size (%)', number(c.s * 100, 1, v => edit(selected, { s: v / 100 })));
        const slider = el('input'); slider.type = 'range'; slider.min = 40; slider.max = 220; slider.step = 1; slider.value = Math.round(c.s * 100);
        slider.oninput = () => { size.value = slider.value; edit(selected, { s: slider.value / 100 }); };
        const sliderRow = el('div', 'tn-slider'); sliderRow.append(slider); box.appendChild(sliderRow);
        const hide = el('input'); hide.type = 'checkbox'; hide.checked = Boolean(c.hide);
        hide.onchange = () => edit(selected, { hide: hide.checked });
        row('Hide it', hide);
        const base = baseRect(selected);
        if (base) box.appendChild(el('p', 'tn-base', `Game puts it at left ${base[0]}, top ${base[1]}, ${base[2]}×${base[3]} px`));
    }

    function counts() {
        let pieces = 0;
        const screens = Object.keys(data).filter(k => Object.values(data[k]).some(isChanged));
        screens.forEach(k => { pieces += Object.values(data[k]).filter(isChanged).length; });
        return { pieces, screens: screens.length };
    }
    function renderStatus() {
        const { pieces, screens } = counts();
        $('tnStatus').textContent = pieces ? `${pieces} piece${pieces === 1 ? '' : 's'} changed on ${screens} screen${screens === 1 ? '' : 's'}.` : 'Nothing changed yet.';
    }

    // ---------- O texto copiado: só o que mudou ----------
    function describeChange(id, c, onScreen) {
        const label = ELEMENTS.find(e => e.id === id)?.label ?? id;
        const parts = [];
        if (c.dx !== 0 || c.dy !== 0) parts.push(`move x ${signed(c.dx)}px, y ${signed(c.dy)}px`);
        if (c.s !== 1) parts.push(`size ${Math.round(c.s * 100)}%`);
        if (c.hide) parts.push('hidden');
        // Na tela aberta agora, a posição é medida na hora (o registro guardado pode ser de um CSS antigo)
        const where = (onScreen && baseRect(id)) || c.base;
        const base = where ? `   [game has it at left ${where[0]}, top ${where[1]}, ${where[2]}x${where[3]}]` : '';
        return `  - ${label} (#${id}): ${parts.join(', ')}${base}`;
    }

    function buildText(onlyKey) {
        const keys = Object.keys(data).filter(k => (!onlyKey || k === onlyKey) && Object.values(data[k]).some(isChanged)).sort();
        if (!keys.length) return '';
        const lines = [
            'LAST TORCH - HUD TUNER (only what was changed)',
            'Moves are CSS px from where the game puts the piece today (the game layout is already fluid: portrait, landscape and',
            'desktop reference screens, interpolated for every other size); size is a % around the piece center.',
            'Please add each screen below as a reference point (or update it) in the fluid layout table, keeping the other points.',
            ''
        ];
        const json = {};
        keys.forEach(k => {
            const m = /^(\d+)x(\d+)([td])$/.exec(k);
            lines.push(`== ${m ? describe(+m[1], +m[2], m[3] === 't') : k} ==`);
            json[k] = {};
            ELEMENTS.forEach(e => {
                const c = data[k][e.id];
                if (!isChanged(c)) return;
                lines.push(describeChange(e.id, c, k === key()));
                const out = {};
                if (c.dx !== 0) out.dx = c.dx;
                if (c.dy !== 0) out.dy = c.dy;
                if (c.s !== 1) out.scale = c.s;
                if (c.hide) out.hide = true;
                json[k][e.id] = out;
            });
            lines.push('');
        });
        lines.push('JSON:', JSON.stringify(json));
        return lines.join('\n');
    }

    async function copy(onlyKey) {
        const text = buildText(onlyKey);
        $('tnOut').value = text;
        if (!text) { $('tnStatus').textContent = 'Nothing changed yet: nothing to copy.'; return; }
        try {
            await navigator.clipboard.writeText(text);
            $('tnStatus').textContent = 'Copied! Paste it in the chat.';
        } catch {
            $('tnOut').select();
            $('tnStatus').textContent = 'Could not reach the clipboard: the text is selected below, press Ctrl+C.';
        }
    }

    // ---------- Ligações ----------
    PRESETS.forEach((p, i) => { const o = el('option', '', p[0]); o.value = String(i); $('tnPreset').appendChild(o); });
    $('tnPreset').appendChild(Object.assign(el('option', '', 'Custom size'), { value: 'custom' }));
    $('tnPreset').onchange = (e) => { const p = PRESETS[+e.target.value]; if (p) setView(p[1], p[2], p[3]); };
    const fromInputs = () => setView(+$('tnW').value || view.w, +$('tnH').value || view.h, $('tnTouch').checked);
    ['tnW', 'tnH', 'tnTouch'].forEach(id => { $(id).onchange = fromInputs; });
    $('tnRotate').onclick = () => setView(view.h, view.w, view.touch);
    ['tnBoss', 'tnStreak', 'tnPoints'].forEach(id => { $(id).onchange = applyScene; });
    $('tnPause').onclick = togglePause;
    renderPause();
    $('tnResetPiece').onclick = () => { const all = changesHere(); delete all[selected]; if (!Object.keys(all).length) delete data[key()]; writeStore(data); applyOne(selected); renderFields(); renderList(); renderStatus(); };
    $('tnResetScreen').onclick = () => { delete data[key()]; writeStore(data); applyAll(); renderFields(); renderList(); renderStatus(); };
    // Depois que a IA aplicar os ajustes no CSS do jogo, os deslocamentos guardados aqui passariam a valer DUAS vezes
    $('tnResetAll').onclick = () => {
        if (!confirm('Clear every adjustment on every screen? Do this after the changes were applied to the game CSS.')) return;
        Object.keys(data).forEach(k => delete data[k]);
        writeStore(data); applyAll(); renderFields(); renderList(); renderStatus();
    };
    $('tnRestore').onclick = () => {
        let backup = {};
        try { backup = JSON.parse(localStorage.getItem(BACKUP_KEY)) ?? {}; } catch { /* nada guardado */ }
        Object.assign(data, backup);
        writeStore(data);
        $('tnCssNotice').hidden = true;
        applyAll(); renderList(); renderFields(); renderStatus();
    };
    $('tnCopy').onclick = () => copy(null);
    $('tnCopyOne').onclick = () => copy(key());

    // Setas movem a peça escolhida: 1 px (10 com Shift)
    root.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 10 : 1;
        const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        if (e.code === 'Space' && !e.target.closest('input, select, textarea, button')) { e.preventDefault(); togglePause(); return; }
        if (!move || e.target.closest('input, select, textarea')) return;
        e.preventDefault();
        const c = changesHere()[selected] ?? { dx: 0, dy: 0 };
        edit(selected, { dx: c.dx + move[0], dy: c.dy + move[1] });
    });
    root.tabIndex = 0;
    window.addEventListener('resize', () => { if (!root.classList.contains('hidden')) fit(); });

    return {
        // A aba foi aberta ou fechada: a primeira vez carrega o jogo; fechada, o laço das alças para
        show() {
            if (!frame) setView(view.w, view.h, view.touch);
            else fit();
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(placeHandles);
        },
        hide() { cancelAnimationFrame(raf); }
    };
}
