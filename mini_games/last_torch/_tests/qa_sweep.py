#!/usr/bin/env python3
"""Varredura de falhas do Last Torch, feita para gastar pouco: roda tudo e imprime SÓ o que falhou (texto, sem imagens).

    python3 mini_games/last_torch/_tests/qa_sweep.py                 # telas + dados, nos 4 tamanhos
    python3 mini_games/last_torch/_tests/qa_sweep.py --play          # e uma partida rápida de cada herói
    python3 mini_games/last_torch/_tests/qa_sweep.py --only desk,p390 --shots

O que confere (ver README.md): erros de console e arquivos que não carregam, mais de uma tela ao mesmo tempo, botões principais
fora da tela, rolagem lateral, alvos de toque pequenos, texto cortado, telas com informação demais, e uma auditoria dos dados
(conquistas alcançáveis, ícones que existem e não se repetem, ligações da árvore). FAIL = quebra; WARN = vale olhar.
Código de saída 1 se houver FAIL. Precisa de: pip install playwright, e do Chrome instalado (usa channel='chrome').
"""
import argparse
import json
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
GAME = HERE.parent
OUT = HERE / "out"
PORT = 18890

VIEWPORTS = {
    "desk": ({"width": 1280, "height": 720}, False),
    "p390": ({"width": 390, "height": 844}, True),
    "p360": ({"width": 360, "height": 640}, True),
    "land": ({"width": 844, "height": 390}, True),
}

# Telas exclusivas (uma só por vez) e sobreposições. Pares permitidos: o Santuário e o Altar abrem por cima da tela inicial.
EXCLUSIVE = ["#startScreen", "#gameOverScreen", "#campScreen", "#victoryScreen", "#sanctuaryScreen", "#altarScreen"]
OVERLAYS = [".wave-results", "#giftPopup", ".hero-unlock"]
ALLOWED_PAIRS = [{"#startScreen", "#sanctuaryScreen"}, {"#startScreen", "#altarScreen"}, {"#gameOverScreen", "#altarScreen"}]
PRIMARY = ["#btnStart", "#btnRestart", "#btnMenu", ".vic-menu", ".vic-share", "#btnCampLeave", "#btnCloseSanctuary", "#btnCloseAltar"]

# (texto do botão da aba Screens, espera em ms, ação depois, o que deve estar à vista, o que NÃO pode estar)
SCENARIOS = [
    ("Start menu", 900, None, ["#startScreen"], ["#gameOverScreen", "#victoryScreen"]),
    ("Daily gift", 900, None, ["#giftPopup"], ["#gameOverScreen"]),
    ("Ranks", 900, None, ["#sanctuaryScreen"], ["#victoryScreen"]),
    ("The hero fell", 5200, None, ["#gameOverScreen"], [".wave-results", "#victoryScreen", "#giftPopup"]),
    ("The torch went out", 5200, None, ["#gameOverScreen"], [".wave-results", "#victoryScreen", "#giftPopup"]),
    ("Dawn: you finished", 6200, None, [".wave-results"], ["#gameOverScreen", "#victoryScreen"]),
    ("Dawn: you finished", 6200, "close-card", ["#victoryScreen"], ["#gameOverScreen", ".wave-results", "#btnEndless"]),
    ("Wave cleared", 3800, None, ["#campScreen"], ["#gameOverScreen", "#victoryScreen"]),
    ("Camp only", 1500, None, ["#campScreen"], ["#gameOverScreen", "#victoryScreen", ".wave-results"]),
]

# Medido no navegador: o que está à vista, o que sai da tela, o que é pequeno ou cortado, e quanta coisa há na tela
MEASURE = """() => {
  const vw = innerWidth, vh = innerHeight;
  const shown = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 && !el.closest('.hidden'); };
  const name = (el) => el.id ? '#' + el.id : (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/)[0] : el.tagName.toLowerCase());
  const q = (sels) => sels.filter(s => { const el = document.querySelector(s); return el && shown(el); });
  const out = { exclusive: q(%EXCLUSIVE%), overlays: q(%OVERLAYS%), primary: [], overflowX: document.scrollingElement.scrollWidth > vw + 1, off: [], small: [], clipped: [], buttons: 0, words: 0 };
  for (const s of %PRIMARY%) { const el = document.querySelector(s); if (el && shown(el)) { const r = el.getBoundingClientRect();
    if (r.bottom > vh + 1 || r.top < -1 || r.right > vw + 1 || r.left < -1) out.primary.push(s + ' (' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.right) + 'x' + Math.round(r.bottom) + ' em ' + vw + 'x' + vh + ')'); } }
  // Só o que está na tela de cima: a última tela exclusiva visível ou a sobreposição
  const top = document.querySelector(out.overlays[0] || out.exclusive[out.exclusive.length - 1] || 'body');
  const scope = top || document.body;
  out.words = (scope.innerText || '').split(/\\s+/).filter(Boolean).length;
  scope.querySelectorAll('button, [role=button]').forEach(b => { if (!shown(b)) return; const r = b.getBoundingClientRect(); out.buttons++;
    if (Math.min(r.width, r.height) < 30) out.small.push(name(b) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); });
  scope.querySelectorAll('*').forEach(el => { if (!shown(el) || el.children.length > 0) return; const r = el.getBoundingClientRect();
    if (r.right > vw + 2 && out.off.length < 4) out.off.push(name(el) + ' → ' + Math.round(r.right));
    const cs = getComputedStyle(el);
    if (el.scrollWidth > el.clientWidth + 2 && cs.overflow === 'hidden' && cs.textOverflow !== 'ellipsis' && (el.textContent || '').trim() && out.clipped.length < 4) out.clipped.push(name(el) + ' "' + el.textContent.trim().slice(0, 24) + '"'); });
  return out;
}""".replace("%EXCLUSIVE%", json.dumps(EXCLUSIVE)).replace("%OVERLAYS%", json.dumps(OVERLAYS)).replace("%PRIMARY%", json.dumps(PRIMARY))

# Auditoria dos dados do jogo, dentro da própria página (usa os mesmos módulos do jogo)
AUDIT = """async () => {
  const O = location.origin; const M = (p) => import(O + p); const issues = [];
  const [S, H, T, R, I, TI, MO, AL, SV, PW] = await Promise.all([M('/data_model/sanctuary.js'), M('/data_model/heroes.js'), M('/data_model/tree.js'), M('/data_model/relics.js'), M('/data_model/icon_images.js'), M('/data_model/tree_images.js'), M('/data_model/monsters.js'), M('/data_model/embers.js'), M('/js/core/save.js'), M('/data_model/passives.js')]);
  const stats = SV.save.stats;
  // Conquistas: alcançáveis e ligadas a coisas que existem
  for (const a of S.ACHIEVEMENTS) {
    if (a.hero && !H.HEROES[a.hero]) issues.push(['FAIL', 'achievement ' + a.id + ': herói inexistente ' + a.hero]);
    if (a.beast && !MO.MONSTER_MODELS[a.beast]) issues.push(['FAIL', 'achievement ' + a.id + ': monstro inexistente ' + a.beast]);
    if ((a.stat === 'fiveStarWaves' || a.stat === 'threeStarWaves') && a.target > 12) issues.push(['FAIL', 'achievement ' + a.id + ': pede estrelas em ' + a.target + ' ondas, só existem 12']);
    if (a.stat && !(a.stat in stats) && !/^(boss_|oath_)/.test(a.stat) && !['fiveStarWaves', 'threeStarWaves'].includes(a.stat)) issues.push(['WARN', 'achievement ' + a.id + ': stat "' + a.stat + '" não existe no save']);
    if (!I.ICON_IMAGES[a.id]) issues.push(['WARN', 'achievement ' + a.id + ': sem ícone (usa emoji)']);
    if (!(a.id in S.ACHIEVEMENT_EMBERS) && !(a.hero && H.HEROES[a.hero] && !H.HEROES[a.hero].shelved)) issues.push(['WARN', 'achievement ' + a.id + ': não paga Brasas']);
  }
  // Emojis repetidos (conquistas + bestiário)
  const seen = {}; [...S.ACHIEVEMENTS.map(a => [a.id.replace(/^beast_/, ''), a.icon]), ...S.getBestiary().map(b => [b.key, b.icon])].forEach(([k, i]) => { (seen[i] ??= []); if (!seen[i].includes(k)) seen[i].push(k); });
  for (const [i, ks] of Object.entries(seen)) if (ks.length > 1) issues.push(['WARN', 'emoji repetido ' + i + ': ' + ks.join(', ')]);
  // Altar e relíquias com ícone
  for (const k of AL.ALTAR_KEYS) if (!I.ICON_IMAGES['altar_' + k]) issues.push(['WARN', 'altar ' + k + ': sem ícone']);
  for (const n of R.RELIC_NODES) if (!I.ICON_IMAGES[n.key]) issues.push(['WARN', 'relíquia ' + n.key + ': sem ícone']);
  // Árvores: pedidos que apontam para nós que não existem
  for (const n of T.TREE_NODES) for (const r of n.requires) if (!T.TREE_BY_ID[r.id]) issues.push(['FAIL', 'skill ' + n.id + ' pede ' + r.id + ' que não existe']);
  for (const n of R.RELIC_NODES) for (const r of n.requires) if (!R.RELIC_BY_ID[r.id]) issues.push(['FAIL', 'relíquia ' + n.id + ' pede ' + r.id + ' que não existe']);
  for (const [k, h] of Object.entries(H.HEROES)) { if (h.shelved) continue;
    for (const b of h.sealedBranches ?? []) if (!T.TREE_BRANCHES[b]) issues.push(['FAIL', 'herói ' + k + ': ramo selado inexistente ' + b]);
    if (h.affinity && !T.TREE_BRANCHES[h.affinity]) issues.push(['FAIL', 'herói ' + k + ': afinidade inexistente ' + h.affinity]);
    if (h.emberPrice && h.free) issues.push(['WARN', 'herói ' + k + ': é grátis e tem preço']); }
  // Arquivos de imagem: todos os caminhos citados existem?
  const paths = new Set([...Object.values(I.ICON_IMAGES), ...Object.values(TI.TREE_IMAGES), ...Object.values(TI.BRANCH_IMAGES), ...Object.values(H.HEROES).map(h => h.portraitImage).filter(Boolean)]);
  const bad = []; await Promise.all([...paths].map(async p => { try { const r = await fetch('/' + p, { method: 'HEAD' }); if (!r.ok) bad.push(p); } catch { bad.push(p); } }));
  bad.slice(0, 8).forEach(p => issues.push(['FAIL', 'imagem não carrega: ' + p]));
  // O amanhecer calcula o resultado da onda 12? (sem isso, "estrelas em todas as ondas" é impossível)
  const night = await (await fetch('/js/systems/night.js')).text();
  if (!/beginDawn[\\s\\S]{0,600}grantWaveSpoils/.test(night)) issues.push(['FAIL', 'night.js: o amanhecer não chama grantWaveSpoils (a onda 12 nunca ganha estrelas)']);
  return issues;
}"""

# Partida rápida de um herói (herói imortal, anda em volta da tocha, compra skills): erros, números inválidos e travamentos
PLAY = """async ([waves, secs]) => {
  const O = location.origin; const M = (p) => import(O + p);
  const [st, g, T, camp, dash, qp, sc, H, SV] = await Promise.all([M('/js/core/state.js'), M('/js/game.js'), M('/js/systems/tree.js'), M('/js/ui/camp.js'), M('/js/systems/dash.js'), M('/js/ui/quick_pick.js'), M('/js/ui/screens.js'), M('/data_model/heroes.js'), M('/js/core/save.js')]);
  const S = st.state, P = st.player, issues = []; const note = (m) => { if (issues.length < 6 && !issues.includes(m)) issues.push(m); };
  H.HEROES[SV.save.hero].mods = { ...(H.HEROES[SV.save.hero].mods || {}), damageTaken: -0.9 };
  sc.startGame(); const t0 = performance.now(); let t = 0, camps = 0;
  while (S.turn <= waves && performance.now() - t0 < secs * 1000) {
    if (S.gameState === 'CAMP') { camps++; const b = T.getBuyableNodes(); b.slice(0, 4).forEach(n => T.buyNode(n.id)); camp.leaveCamp(); continue; }
    if (S.gameState === 'DIALOGUE') { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); S.gameState = 'PLAYING'; continue; }
    if (S.gameState === 'PAUSED' || qp.isPicking()) { if (qp.isPicking()) qp.choosePick(0); else S.gameState = 'PLAYING'; continue; }
    if (S.gameState !== 'PLAYING') break;
    for (let i = 0; i < 40; i++) { t += 0.05; const a = t * 0.35; P.targetX = S.coreX + Math.cos(a) * 150; P.targetY = S.coreY + Math.sin(a) * 110;
      S.knifeInput.held = Math.floor(t * 2) % 5 === 0; if (Math.floor(t * 20) % 70 === 0) dash.tryDash();
      if (S.skillPoints > 0 && Math.floor(t * 20) % 20 === 0) { const b = T.getBuyableNodes(); if (b.length) T.buyNode(b[0].id); }
      try { g.update(0.05); } catch (e) { note('update: ' + e.message); break; }
      if (![P.x, P.y, P.hp, S.coreHp].every(Number.isFinite)) note('NaN no herói ou na tocha, onda ' + S.turn);
      if (S.enemies.some(e => !Number.isFinite(e.x) || !Number.isFinite(e.hp))) note('NaN num monstro, onda ' + S.turn);
      if (S.enemies.length > 400) note('monstros demais: ' + S.enemies.length);
      if (S.gameState !== 'PLAYING') break; }
  }
  return { issues, wave: S.turn, state: S.gameState, camps, ms: Math.round(performance.now() - t0) };
}"""


def wait_server(url, timeout=30):
    end = time.time() + timeout
    while time.time() < end:
        try:
            urllib.request.urlopen(url, timeout=1)
            return True
        except Exception:
            time.sleep(0.3)
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default=",".join(VIEWPORTS), help="tamanhos: desk,p390,p360,land")
    ap.add_argument("--play", action="store_true", help="joga algumas ondas com cada herói (mais lento)")
    ap.add_argument("--waves", type=int, default=3)
    ap.add_argument("--shots", action="store_true", help="salva uma imagem de cada falha em _tests/out/")
    ap.add_argument("-v", action="store_true", help="mostra também o que passou")
    args = ap.parse_args()

    base = f"http://127.0.0.1:{PORT}/"
    server = subprocess.Popen([sys.executable, str(GAME / "_sandbox" / "serve.py"), str(PORT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    results = []   # (nível, onde, mensagem)
    started = time.time()
    try:
        if not wait_server(base):
            print("FAIL servidor do sandbox não subiu"); return 1
        if args.shots:
            OUT.mkdir(exist_ok=True)
        with sync_playwright() as p:
            browser = p.chromium.launch(channel="chrome", headless=True)

            def new_page(vp, touch):
                ctx = browser.new_context(viewport=vp, has_touch=touch, is_mobile=touch)
                page = ctx.new_page()
                errs = []
                page.on("pageerror", lambda e: errs.append("erro de script: " + str(e)[:140]))
                page.on("console", lambda m: m.type == "error" and errs.append("console: " + m.text[:140]))
                page.on("response", lambda r: r.status >= 400 and errs.append(f"{r.status} {r.url.split('127.0.0.1:%d' % PORT)[-1][:90]}"))
                page.goto(base)
                page.wait_for_selector("#sbPanel", timeout=60000)
                page.wait_for_timeout(1200)
                return ctx, page, errs

            # 1) Auditoria dos dados (uma vez só)
            print("  ... auditoria dos dados", file=sys.stderr, flush=True)
            ctx, page, errs = new_page(*VIEWPORTS["desk"])
            for level, msg in page.evaluate(AUDIT):
                results.append((level, "dados", msg))
            ctx.close()

            # 2) Telas × tamanhos
            for vname in [v for v in args.only.split(",") if v in VIEWPORTS]:
                vp, touch = VIEWPORTS[vname]
                for label, wait, action, want, forbid in SCENARIOS:
                    ctx, page, errs = new_page(vp, touch)
                    where = f"{label}{' (card fechado)' if action else ''} @{vname}"
                    print(f"  ... {where}", file=sys.stderr, flush=True)
                    try:
                        page.evaluate("document.getElementById('sbPanel').classList.remove('hidden')")
                        page.click(".sb-tabs button[data-tab=screens]")
                        page.evaluate("(l) => [...document.querySelectorAll('#sbScreens .sb-opt')].find(b => b.textContent.includes(l)).click()", label)
                        page.wait_for_timeout(wait)
                        if action == "close-card":
                            page.mouse.click(vp["width"] // 2, vp["height"] // 2)
                            page.wait_for_timeout(300)
                            page.mouse.click(vp["width"] // 2, vp["height"] // 2)
                            page.wait_for_timeout(2400)
                        m = page.evaluate(MEASURE)
                    except Exception as e:  # um cenário que não abriu é falha
                        results.append(("FAIL", where, f"não abriu: {str(e)[:100]}"))
                        ctx.close()
                        continue
                    found = []
                    for e in errs[:3]:
                        found.append(("FAIL", e))
                    layers = m["exclusive"] + m["overlays"]
                    for s in want:
                        if s not in layers and not (s == "#btnEndless" and False):
                            found.append(("FAIL", f"deveria estar à vista: {s} (à vista: {', '.join(layers) or 'nada'})"))
                    for s in forbid:
                        if s in layers:
                            found.append(("FAIL", f"não deveria estar à vista: {s}"))
                    ex = set(m["exclusive"])
                    if len(ex) > 1 and not any(ex == pair for pair in ALLOWED_PAIRS):
                        found.append(("FAIL", f"duas telas ao mesmo tempo: {', '.join(m['exclusive'])}"))
                    if len(m["overlays"]) > 1:
                        found.append(("WARN", f"mais de uma sobreposição: {', '.join(m['overlays'])}"))
                    if m["primary"]:
                        found.append(("FAIL", "botão fora da tela: " + "; ".join(m["primary"][:3])))
                    if m["overflowX"]:
                        found.append(("FAIL", "a página rola para o lado"))
                    if m["off"]:
                        found.append(("WARN", "sai da tela: " + "; ".join(m["off"][:3])))
                    if touch and m["small"]:
                        found.append(("WARN", f"alvos de toque pequenos ({len(m['small'])}): " + "; ".join(m["small"][:3])))
                    if m["clipped"]:
                        found.append(("WARN", "texto cortado: " + "; ".join(m["clipped"][:3])))
                    if m["buttons"] > 7 or m["words"] > 90:
                        found.append(("WARN", f"tela cheia: {m['buttons']} botões, {m['words']} palavras"))
                    for level, msg in found:
                        results.append((level, where, msg))
                    if found and args.shots:
                        page.screenshot(path=str(OUT / f"{label.split(':')[0].replace(' ', '_')}_{vname}.png".replace("/", "_")))
                    if args.v and not found:
                        results.append(("ok", where, "passou"))
                    ctx.close()

            # 3) Partida rápida com cada herói
            if args.play:
                ctx, page, errs = new_page(*VIEWPORTS["desk"])
                heroes = page.evaluate("import('/data_model/heroes.js').then(m => m.ACTIVE_HEROES)")
                ctx.close()
                for hero in heroes:
                    print(f"  ... partida {hero}", file=sys.stderr, flush=True)
                    ctx, page, errs = new_page(*VIEWPORTS["desk"])
                    page.evaluate("(h) => { const s = JSON.parse(localStorage.getItem('last_torch_save_v1') || '{}'); s.hero = h; s.stats = { runs: 3 }; s.unlockedHeroes = ['hunter', 'rowan', 'avgustino', 'gudran', 'azael', 'brutos']; s.seenTutorial = true; localStorage.setItem('last_torch_save_v1', JSON.stringify(s)); }", hero)
                    page.reload()
                    page.wait_for_selector("#sbPanel", timeout=60000)
                    page.wait_for_timeout(1000)
                    page.evaluate("document.getElementById('sbPanel').classList.add('hidden')")
                    try:
                        r = page.evaluate(PLAY, [args.waves, 40])
                        for msg in r["issues"]:
                            results.append(("FAIL", f"partida {hero}", msg))
                        for e in errs[:3]:
                            results.append(("FAIL", f"partida {hero}", e))
                        if r["state"] == "GAMEOVER":
                            results.append(("WARN", f"partida {hero}", f"morreu na onda {r['wave']} mesmo imortal"))
                        if args.v:
                            results.append(("ok", f"partida {hero}", f"onda {r['wave']} em {r['ms']} ms"))
                    except Exception as e:
                        results.append(("FAIL", f"partida {hero}", f"travou: {str(e)[:100]}"))
                    ctx.close()
            browser.close()
    finally:
        server.terminate()

    order = {"FAIL": 0, "WARN": 1, "ok": 2}
    results.sort(key=lambda r: (order[r[0]], r[1]))
    for level, where, msg in results:
        print(f"{level:4} {where}: {msg}")
    fails = sum(1 for r in results if r[0] == "FAIL")
    warns = sum(1 for r in results if r[0] == "WARN")
    print(f"\n{fails} FAIL, {warns} WARN em {time.time() - started:.0f}s")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
