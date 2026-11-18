import base64, sys
from playwright.sync_api import sync_playwright
OUT = '/home/miguel-amaral/Dev/yara-demon-hunter.github.io/mini_games/_library/buddies/treant/treant_atlas.webp'
ANDAR, SOCO, DIRS, TAM = 12, 6, 8, int(sys.argv[1]) if len(sys.argv) > 1 else 144
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'])
    pg = b.new_context(viewport={'width':800,'height':600}).new_page(); errs=[]
    pg.on('console', lambda m: errs.append(m.text[:200]) if m.type == 'error' and '404' not in m.text else None); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:18900/_library/tools/lab/treant_foto.html?bake=1'); pg.wait_for_function("window.__bake", timeout=240000)
    url = pg.evaluate(f"window.__bake({ANDAR},{SOCO},{DIRS},{TAM})", )
    open(OUT, 'wb').write(base64.b64decode(url.split(',')[1]))
    import os; print('bytes', os.path.getsize(OUT), 'erros', errs or 'nenhum'); b.close()
