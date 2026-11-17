"""Mede onde cada peça do HUD e dos controles fica em cada tela de referência (usado por fluid_solve.py).

Precisa de Playwright (pip install playwright; usa o Chrome instalado) e do pacote do jogo servido por HTTPS
(ex.: `ruby mini_games/last_torch/build-standalone.rb` e servir standalone-build/). Veja README.md desta pasta.
    python3 fluid_measure.py saida.json 'https://127.0.0.1:18766/?fluid=0'      # ?fluid=0 = layout base, sem a camada fluida
"""
import json, sys
from playwright.sync_api import sync_playwright
# Telas de referência (largura, altura, toque). Acrescente aqui a tela nova de um envio do tuner.
SCREENS = [(360,640,1),(360,740,1),(390,844,1),(412,915,1),(768,1024,1),(640,360,1),(740,360,1),(844,390,1),(915,412,1),(1024,768,1),(1280,720,0),(1920,1080,0)]
IDS = ['heroCard','btnPause','hudButtons','bossHpContainer','hudBottom','hudScore','hudStreak','joystick','knifeButton','dashButton']
SETUP = """async () => {
  const st = await import(location.origin+'/js/core/state.js'); const hud = await import(location.origin+'/js/ui/hud.js'); const bs = await import(location.origin+'/data_model/bosses.js');
  const boss = bs.createBoss('AZAEL', 1, st.state.coreX + 220, st.state.coreY - 160);
  st.state.totalScore = 0; st.state.run.kills = 0; st.state.enemies.push(boss); st.state.currentBoss = boss; st.state.streak = 24; st.state.streakTimer = 9999; st.state.skillPoints = 2;
  hud.updateHUD(); hud.flushHud(performance.now()+100000); st.state.gameState = 'PAUSED';
  document.getElementById('hudStreak').classList.add('is-visible');
  await new Promise(r => setTimeout(r, 800)); }"""
GET = "(ids) => Object.fromEntries(ids.map(id => { const n = document.getElementById(id); const b = n.getBoundingClientRect(); return [id, [b.left,b.top,b.width,b.height].map(x => Math.round(x*100)/100)]; }))"
def run(out, base_url='https://127.0.0.1:18766/?fluid=0'):
    res = {}
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome', headless=True, args=['--ignore-certificate-errors'])
        for W, H, touch in SCREENS:
            pg = b.new_context(ignore_https_errors=True, viewport={'width':W,'height':H}, has_touch=bool(touch), is_mobile=bool(touch)).new_page()
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto(base_url); pg.add_style_tag(content='*{animation:none!important;transition:none!important}'); pg.wait_for_timeout(2500); pg.evaluate(SETUP)
            res[f'{W}x{H}'] = {'touch': bool(touch), 'rects': pg.evaluate(GET, IDS)}
            if errs: print(W, H, 'errs', errs)
        b.close()
    json.dump(res, open(out, 'w'))
    print('saved', out)
if __name__ == '__main__': run(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'https://127.0.0.1:18766/?fluid=0')
