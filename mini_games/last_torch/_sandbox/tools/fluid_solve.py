"""Converte as posições medidas em deslocamentos e escalas por peça e regera data_model/fluid_layout.js.

    python3 fluid_solve.py base.json ajustado.json ['https://127.0.0.1:18766/?fluid=0']
base.json = fluid_measure.py no layout base (?fluid=0); ajustado.json = onde o dono deixou cada peça nas telas de referência.
Os deslocamentos são resolvidos medindo no navegador, o que também vale para peças com `transform` próprio. Veja README.md.
"""
import json, sys
from playwright.sync_api import sync_playwright
import fluid_measure as M
import os
HERE = os.path.dirname(os.path.abspath(__file__))
S = HERE + '/'                                                            # onde ficam os .json de medição
OUT = os.path.abspath(HERE + '/../../data_model/fluid_layout.js')         # a tabela que o jogo lê
BASE_URL = sys.argv[3] if len(sys.argv) > 3 else 'https://127.0.0.1:18766/?fluid=0'
base = json.load(open(S + sys.argv[1])); tuned = json.load(open(S + sys.argv[2]))
HUD = ['heroCard','btnPause','hudButtons','btnMap','btnSettings','bossHpContainer','hudBottom','hudScore','hudStreak']
CENTER = "(id) => { const b = document.getElementById(id).getBoundingClientRect(); return [b.left + b.width/2, b.top + b.height/2]; }"
profile = lambda W, H: ('portrait' if W < 600 else 'tablet') if H >= W else ('landscape' if H <= 520 else 'desktop')
axis = lambda W, H: (H if W < 600 else W) if H >= W else W
r2 = lambda x: round(x + 0.0, 2)
groups = {'portrait': [], 'tablet': [], 'landscape': [], 'desktop': []}
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', headless=True, args=['--ignore-certificate-errors'])
    for W, H, touch in M.SCREENS:
        key = f'{W}x{H}'; bt = base[key]['rects']; tt = tuned[key]['rects']
        pg = b.new_context(ignore_https_errors=True, viewport={'width':W,'height':H}, has_touch=bool(touch), is_mobile=bool(touch)).new_page()
        pg.goto(BASE_URL); pg.add_style_tag(content='*{animation:none!important;transition:none!important}'); pg.wait_for_timeout(2500); pg.evaluate(M.SETUP)
        hud = {}
        for id in HUD:
            rb, rt = bt[id], tt[id]
            if rb[2] <= 0 or rt[2] <= 0: continue
            s = rt[2] / rb[2]
            if abs(s - 1) < 0.004: s = 1
            pg.evaluate("([id, s]) => { const el = document.getElementById(id); el.style.translate = ''; el.style.scale = s === 1 ? '' : String(s); }", [id, s])
            cx, cy = pg.evaluate(CENTER, id)
            tx, ty = rt[0] + rt[2]/2, rt[1] + rt[3]/2
            dx, dy = tx - cx, ty - cy
            if abs(s - 1) < 1e-9 and abs(dx) < 0.6 and abs(dy) < 0.6: dx = dy = 0
            hud[id] = [r2(dx), r2(dy), round(s, 4)]
        ctl = {}
        for id in ('joystick', 'knifeButton', 'dashButton'):
            x = tt[id]
            if x[2] <= 0: continue
            side = x[0] if id == 'joystick' else W - (x[0] + x[2])
            ctl[id] = [r2(x[2]), r2(side), r2(H - (x[1] + x[3]))]
        groups[profile(W, H)].append({'at': axis(W, H), 'screen': key, 'hud': hud, 'ctl': ctl})
    b.close()
for g in groups.values(): g.sort(key=lambda a: a['at'])
inline = lambda o: json.dumps(o, ensure_ascii=False, separators=(', ', ': '))
head = open(OUT).read().split('export const FLUID_LAYOUT')[0]
out = [head.rstrip('\n') + '\nexport const FLUID_LAYOUT = {']
gi = list(groups.items())
for n, (g, anchors) in enumerate(gi):
    out.append(f'    {g}: {{ axis: \'{"height" if g == "portrait" else "width"}\', anchors: [')
    for i, a in enumerate(anchors):
        out.append(f'        {{ at: {a["at"]}, screen: \'{a["screen"]}\',')
        out.append('          hud: {' + ', '.join(f'{k}: {inline(v)}' for k, v in a['hud'].items()) + '},')
        out.append('          ctl: {' + ', '.join(f'{k}: {inline(v)}' for k, v in a['ctl'].items()) + '} }' + (',' if i < len(anchors) - 1 else ''))
    out.append('    ] }' + (',' if n < len(gi) - 1 else ''))
out.append('};')
open(OUT, 'w').write('\n'.join(out) + '\n')
print('escrito', OUT)
for a in groups['landscape'][:1] + groups['portrait'][:1]: print(a['screen'], a['hud'])
