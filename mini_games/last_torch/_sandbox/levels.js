// Aba "Levels" do sandbox: uma CALCULADORA (não joga nada) que mostra, da onda 1 à 18, o nível do herói, os níveis ganhos, o XP que falta e o total de
// pontos de skill, para ajustar a curva de XP e os pontos por nível sem rodar noites inteiras. Muda só esta página: o jogo só muda quando você cola a linha
// copiada em data_model/character.js (xpCurve) e data_model/skill_tree/points.js (perLevel), ou usa o botão "Use in this sandbox" (vale para a Arena e a Fast run daqui).
//
// De onde vem o XP de cada onda: medido em 27/11/2026 com o autopiloto da aba Fast run (herói imortal, ~1.900 abates em 18 ondas). É o XP TOTAL que o herói
// ganhou até o fim de cada onda, independente da curva de níveis. Jogador melhor ou pior que o autopiloto: use o campo "Player pace".
import { CHARACTER_MODEL } from '/data_model/character.js';
import { TREE_POINTS } from '/data_model/skill_tree/index.js';
import { screenOfTurn, TOTAL_WAVES } from '/data_model/campaign.js';

const KEY = 'sbLevels';
// XP acumulado no FIM de cada onda (1 a 18), medido (a última é estimada: a onda 18 rende ~26 mil como a 17)
const XP_END = [1636, 3154, 5573, 9841, 13345, 19802, 23487, 27242, 33895, 39257, 47658, 61417, 72441, 83863, 103922, 129318, 155171, 181000];
const OLD_CURVE = { mode: 'quad', base: 260, linear: 110, quadratic: 5 };       // a curva de antes de 27/11/2026 (para comparar)

const xpNext = (c, level) => Math.round(c.mode === 'quad' ? c.base + c.linear * (level - 1) + c.quadratic * (level - 1) ** 2 : c.base * c.growth ** (level - 1));
// Nível depois de ter `xp` de XP acumulado, e quanto falta para o próximo
function levelAt(c, xp) {
    let level = 1, spent = 0;
    for (let guard = 0; guard < 200; guard++) {
        const need = xpNext(c, level);
        if (spent + need > xp) return { level, toNext: spent + need - xp, into: xp - spent, need };
        spent += need;
        level++;
    }
    return { level, toNext: 0, into: 0, need: 1 };
}
const isBossWave = (w) => w % 3 === 0 || w >= 16;

export function mountLevels(host) {
    let file = { base: CHARACTER_MODEL.xpCurve.base, growth: CHARACTER_MODEL.xpCurve.growth ?? 1.37, perLevel: TREE_POINTS.perLevel };
    let DEFAULT = { ...file, other: 3, start: 0, pace: 100 };
    const cfg = { ...DEFAULT };
    try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY)) ?? {}); } catch { /* sem armazenamento */ }
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch { /* ok */ } };

    const FIELDS = [
        { k: 'base', label: 'XP for level 1 → 2', step: 10, min: 20, hint: 'First level-up cost. Lower = skills arrive faster at the start' },
        { k: 'growth', label: 'Growth per level (×)', step: 0.01, min: 1.0, hint: '1.37 = each level costs 37% more than the last. Higher = slower late game' },
        { k: 'perLevel', label: 'Skill points per level', step: 1, min: 0, hint: 'TREE_POINTS.perLevel' },
        { k: 'other', label: 'Other points per wave', step: 0.5, min: 0, hint: 'Chests, Rush and stars. Estimated ≈ 3 per wave (~55 in a night)' },
        { k: 'start', label: 'Starting points', step: 1, min: 0, hint: 'Darkness levels and Insight (Altar) give points at the start' },
        { k: 'pace', label: 'Player pace (% of autopilot XP)', step: 5, min: 20, hint: '100 = the autopilot used for the measurements. Better players earn more' }
    ];

    host.innerHTML = `
      <p class="note">A calculator: shows the hero level and skill points at the end of each wave (1 to 18) for the numbers below. Nothing here changes the game files. XP per wave was measured with the Fast run autopilot (~1,900 kills in a night).</p>
      <div id="sbLvFields"></div>
      <div class="sb-row">
        <button class="sb-opt" id="sbLvFile" title="Back to the numbers written in the game files">↺ File values</button>
        <button class="sb-opt" id="sbLvApply" title="Use these XP and points-per-level numbers in the Arena and Fast run of THIS sandbox (until you reload)">▶ Use in this sandbox</button>
        <button class="sb-opt" id="sbLvSave" title="Write these numbers into data_model/character.js (xpCurve) and data_model/skill_tree/points.js (perLevel). Only those two lines change">💾 Save to game files</button>
        <button class="sb-opt" id="sbLvCopy" title="Copy the lines to paste in character.js and points.js">📋 Copy lines for the game</button>
        <button class="sb-opt" id="sbLvTable" title="Copy the table as text">📋 Copy table</button>
      </div>
      <div id="sbLvSummary" class="note"></div>
      <div id="sbLvChart"></div>
      <div style="overflow-x:auto"><table class="sb-lv" id="sbLvTbl"></table></div>`;
    const q = (s) => host.querySelector(s);

    const fieldsHost = q('#sbLvFields');
    fieldsHost.className = 'sb-bal-stats';
    for (const f of FIELDS) {
        const label = document.createElement('label');
        label.className = 'sb-field';
        label.title = f.hint;
        label.innerHTML = `<span>${f.label}</span><input type="number" step="${f.step}" min="${f.min}" id="sbLv_${f.k}">`;
        fieldsHost.appendChild(label);
        const input = label.querySelector('input');
        input.value = cfg[f.k];
        input.oninput = () => {
            const v = parseFloat(input.value);
            if (Number.isFinite(v)) { cfg[f.k] = v; save(); render(); }
        };
    }
    const setFields = () => FIELDS.forEach(f => { q('#sbLv_' + f.k).value = cfg[f.k]; });

    // Um ponto por onda: nível no fim, níveis ganhos, XP que falta, pontos de nível, outros pontos e o total
    function compute(curve, perLevel) {
        const rows = [];
        let prevLevel = 1;
        for (let w = 1; w <= TOTAL_WAVES; w++) {
            const xp = XP_END[w - 1] * (cfg.pace / 100);
            const gained = xp - (w > 1 ? XP_END[w - 2] * (cfg.pace / 100) : 0);
            const at = levelAt(curve, xp);
            const levelPts = (at.level - 1) * perLevel;
            const other = cfg.other * w;
            rows.push({ w, gained, level: at.level, up: at.level - prevLevel, toNext: at.toNext, need: at.need, levelPts, other, total: cfg.start + levelPts + other });
            prevLevel = at.level;
        }
        return rows;
    }
    const mine = () => ({ mode: 'exp', base: cfg.base, growth: cfg.growth });
    const fmt = (n) => Math.round(n).toLocaleString('en-US');

    function render() {
        const rows = compute(mine(), cfg.perLevel);
        const old = compute(OLD_CURVE, 2);
        const last = rows[rows.length - 1];
        const early = rows[2];
        q('#sbLvSummary').innerHTML = `<b>End of wave 3:</b> level ${early.level}, ${fmt(early.total)} points · <b>End of wave 9:</b> level ${rows[8].level}, ${fmt(rows[8].total)} points · <b>End of wave 18:</b> level ${last.level}, <b>${fmt(last.total)} points in total</b> (${fmt(last.levelPts)} from levels + ${fmt(last.other)} other + ${fmt(cfg.start)} start). Before 27/11 (old curve, 2 per level): level ${old[17].level}, ${fmt(old[17].total)} points.`;

        // Gráfico: nível (azul) e total de pontos (dourado) por onda; linha tracejada fina = a curva antiga
        const W = 640, H = 170, pad = 28;
        const maxY = Math.max(10, ...rows.map(r => r.total), ...old.map(r => r.total));
        const x = (w) => pad + ((w - 1) / (TOTAL_WAVES - 1)) * (W - pad * 2);
        const y = (v) => H - pad - (v / maxY) * (H - pad * 2);
        const line = (list, key, color, dash = '') => `<polyline fill="none" stroke="${color}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ''} points="${list.map(r => `${x(r.w)},${y(r[key])}`).join(' ')}"/>`;
        const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => `<text x="2" y="${y(maxY * f) + 4}" fill="#64748b" font-size="10">${Math.round(maxY * f)}</text>`).join('');
        const waves = [1, 3, 6, 9, 12, 15, 18].map(w => `<text x="${x(w) - 4}" y="${H - 8}" fill="#64748b" font-size="10">${w}</text>`).join('');
        q('#sbLvChart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;background:#0b1220;border-radius:8px">${ticks}${waves}
          ${line(old, 'total', '#64748b', '4 4')}${line(rows, 'level', '#7dd3fc')}${line(rows, 'total', '#fbbf24')}
          <text x="${W - 190}" y="14" fill="#fbbf24" font-size="11">● total skill points</text><text x="${W - 190}" y="28" fill="#7dd3fc" font-size="11">● hero level</text><text x="${W - 190}" y="42" fill="#64748b" font-size="11">┅ old curve (total points)</text></svg>`;

        const head = ['Wave', 'Screen', 'XP in wave', 'Level', '+Lv', 'XP to next', 'Pts (levels)', 'Pts (other)', 'TOTAL pts', 'Old level', 'Old total'];
        q('#sbLvTbl').innerHTML = `<thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>` + rows.map((r, i) => {
            const screen = screenOfTurn(r.w)?.name ?? '';
            const o = old[i];
            const slow = r.up === 0 ? ' class="sb-lv-zero"' : '';
            return `<tr${isBossWave(r.w) ? ' class="sb-lv-boss"' : ''}><td>${r.w}${isBossWave(r.w) ? ' 💀' : ''}</td><td>${screen}</td><td>${fmt(r.gained)}</td><td><b>${r.level}</b></td><td${slow}>${r.up > 0 ? '+' + r.up : '·'}</td><td>${fmt(r.toNext)}</td><td>${fmt(r.levelPts)}</td><td>${fmt(r.other)}</td><td><b>${fmt(r.total)}</b></td><td>${o.level}</td><td>${fmt(o.total)}</td></tr>`;
        }).join('') + '</tbody>';
    }

    q('#sbLvFile').onclick = () => { Object.assign(cfg, DEFAULT); save(); setFields(); render(); };
    q('#sbLvApply').onclick = () => {
        CHARACTER_MODEL.xpCurve = { base: cfg.base, growth: cfg.growth };
        TREE_POINTS.perLevel = cfg.perLevel;
        q('#sbLvApply').textContent = '✔ In use (until reload)';
    };
    // Grava no arquivo do jogo pelo serve.py (POST /__save_levels). Depois disso "File values" passa a ser o que acabou de ser gravado
    q('#sbLvSave').onclick = async (e) => {
        const btn = e.target;
        const label = '💾 Save to game files';
        try {
            const r = await fetch('/__save_levels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base: cfg.base, growth: cfg.growth, perLevel: cfg.perLevel }) });
            if (r.status === 404) throw new Error('the server does not know this save yet: stop serve.py (Ctrl+C) and start it again');
            const out = await r.json();
            if (!out.ok) throw new Error(out.error);
            file = { base: cfg.base, growth: cfg.growth, perLevel: cfg.perLevel };
            DEFAULT = { ...file, other: DEFAULT.other, start: DEFAULT.start, pace: DEFAULT.pace };
            btn.textContent = '✔ Saved in character.js and points.js (reload the game to use)';
        } catch (err) {
            btn.textContent = '✖ Could not save: ' + (err.message || err);
        }
        setTimeout(() => { btn.textContent = label; }, 7000);
    };
    const copy = async (text, btn, label) => {
        try { await navigator.clipboard.writeText(text); btn.textContent = '✔ Copied'; } catch { prompt('Copy:', text); }
        setTimeout(() => { btn.textContent = label; }, 1400);
    };
    q('#sbLvCopy').onclick = (e) => copy(`// data_model/character.js\nxpCurve: { base: ${cfg.base}, growth: ${cfg.growth} },\n// data_model/skill_tree/points.js\nperLevel: ${cfg.perLevel}`, e.target, '📋 Copy lines for the game');
    q('#sbLvTable').onclick = (e) => {
        const rows = compute(mine(), cfg.perLevel);
        copy('wave\tlevel\t+lv\tto_next\tlevel_pts\tother_pts\ttotal\n' + rows.map(r => [r.w, r.level, r.up, r.toNext, r.levelPts, r.other, r.total].join('\t')).join('\n'), e.target, '📋 Copy table');
    };
    render();
    return { render };
}
