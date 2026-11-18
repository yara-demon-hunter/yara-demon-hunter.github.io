# Grava o atlas da Árvore Ancestral (Ancient Grove). Precisa do servidor em mini_games na porta 18900:
#   (cd mini_games && python3 -m http.server 18900)  e depois  python3 bake_arvore.py [tamanho] [quadros_andar] [quadros_ataque]
# Atlas: 5 linhas (ângulos: 0 frente, 45 frente-lado, 90 lado, 135 costas-lado, 180 costas; à esquerda o jogo espelha) x (andar + atacar) colunas, fundo transparente.
# Fica em exemplos/ até a arte ser aprovada; aí vai para buddies/oak/ junto com o código do jogo.
import base64, sys, os
from playwright.sync_api import sync_playwright
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'buddies', 'oak', 'ancient_tree_atlas.webp')
TAM = int(sys.argv[1]) if len(sys.argv) > 1 else 176
ANDAR = int(sys.argv[2]) if len(sys.argv) > 2 else 12
ATAQUE = int(sys.argv[3]) if len(sys.argv) > 3 else 10
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'])
    pg = b.new_context(viewport={'width': 800, 'height': 600}).new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.text[:200]) if m.type == 'error' and '404' not in m.text else None); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:18900/_library/tools/lab/arvore_foto.html?bake=1'); pg.wait_for_function('!!window.__bake', timeout=240000)
    url = pg.evaluate(f"window.__bake({ANDAR},{ATAQUE},{TAM},[0,45,90,135,180])")
    open(OUT, 'wb').write(base64.b64decode(url.split(',')[1]))
    print('bytes', os.path.getsize(OUT), 'erros', errs or 'nenhum'); b.close()
