# Grava o atlas do Demon Hunter 2 (procedural). Precisa do servidor em mini_games na porta 18900:
#   (cd mini_games && python3 -m http.server 18900)  e depois  python3 bake_demon_hunter2.py [tamanho] [parado] [andar] [golpe]
# Atlas: 8 linhas (direções, de 45 em 45 graus) x (parado + andar + golpe) colunas, fundo transparente.
# Fica em exemplos/ até a arte ser aprovada; aí vai para characters/hunter/ junto com o código do jogo.
import base64, sys, os
from playwright.sync_api import sync_playwright
AQUI = os.path.dirname(os.path.abspath(__file__))
TAM = int(sys.argv[1]) if len(sys.argv) > 1 else 192
PARADO, ANDAR, GOLPE = (int(a) for a in sys.argv[2:5]) if len(sys.argv) > 4 else (4, 8, 6)
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'])
    pg = b.new_context(viewport={'width': 800, 'height': 600}).new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.text[:200]) if m.type == 'error' and '404' not in m.text else None); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:18900/_library/tools/lab/demon_hunter2_foto.html?bake=1'); pg.wait_for_function('window.__ready && window.__ready()', timeout=240000)
    url = pg.evaluate(f"window.__bake({PARADO},{ANDAR},{GOLPE},8,{TAM})")
    os.makedirs(os.path.join(AQUI, 'exemplos'), exist_ok=True)
    out = os.path.join(AQUI, 'exemplos', 'demon_hunter2_atlas.webp')
    open(out, 'wb').write(base64.b64decode(url.split(',')[1]))
    print('gravado', out, os.path.getsize(out), 'bytes; erros', errs or 'nenhum'); b.close()
