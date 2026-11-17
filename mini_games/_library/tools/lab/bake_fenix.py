# Grava os atlas da Fênix de fogo (laranja e azul) para o jogo. Precisa do servidor em /home/.../mini_games na porta 18900:
#   (cd mini_games && python3 -m http.server 18900)  e depois  python3 bake_fenix.py [tamanho] [quadros]
# Cada atlas é UMA linha de quadros com fundo transparente (o preto da renderização vira alfa).
import base64, sys, os
from playwright.sync_api import sync_playwright
BASE = os.path.join(os.path.dirname(__file__), '..', '..', 'buddies', 'hearth_phoenix')
TAM = int(sys.argv[1]) if len(sys.argv) > 1 else 128
QUADROS = int(sys.argv[2]) if len(sys.argv) > 2 else 20
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'])
    pg = b.new_context(viewport={'width': 800, 'height': 600}).new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.text[:200]) if m.type == 'error' and '404' not in m.text else None); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:18900/_library/tools/lab/fenix_foto.html?bake=1'); pg.wait_for_function('window.__lab', timeout=240000)
    for cor, nome in (('fogo', 'fenix_fogo_atlas.webp'), ('azul', 'fenix_azul_atlas.webp')):
        url = pg.evaluate(f"window.__bake('{cor}',{QUADROS},{TAM})")
        out = os.path.join(BASE, nome); open(out, 'wb').write(base64.b64decode(url.split(',')[1]))
        print(nome, os.path.getsize(out), 'bytes')
    print('erros', errs or 'nenhum'); b.close()
