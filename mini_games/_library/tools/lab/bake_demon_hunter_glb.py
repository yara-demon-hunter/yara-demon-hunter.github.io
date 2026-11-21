# Grava o atlas do Demon Hunter 3D. Precisa do servidor em mini_games na porta 18900 e do modelo em demon_hunter/hunter.glb:
#   (cd mini_games && python3 -m http.server 18900)  e depois  python3 bake_demon_hunter.py [tamanho] [quadros] [animação]
# animação: o valor da lista que o script imprime (ex.: glb:0, proc:idle, proc:run). Sem ela, usa a primeira.
# Atlas: 5 linhas (ângulos: 0 frente, 45 frente-lado, 90 lado, 135 costas-lado, 180 costas; à esquerda o jogo espelha) x N quadros, fundo transparente.
# Fica em exemplos/ até a arte ser aprovada; aí vai para characters/hunter/ junto com o código do jogo.
import base64, sys, os
from playwright.sync_api import sync_playwright
AQUI = os.path.dirname(os.path.abspath(__file__))
TAM = int(sys.argv[1]) if len(sys.argv) > 1 else 192
QUADROS = int(sys.argv[2]) if len(sys.argv) > 2 else 12
ANIM = sys.argv[3] if len(sys.argv) > 3 else None
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'])
    pg = b.new_context(viewport={'width': 800, 'height': 600}).new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.text[:200]) if m.type == 'error' and '404' not in m.text else None); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:18900/_library/tools/lab/demon_hunter_glb.html?bake=1'); pg.wait_for_function('window.__ready && window.__ready()', timeout=120000)
    print('animações:', *pg.evaluate('window.__clips()'), sep='\n  ')
    if ANIM: pg.evaluate(f"window.__clip('{ANIM}')")
    url = pg.evaluate(f"window.__bake({QUADROS},{TAM},[0,45,90,135,180])")
    nome = 'demon_hunter_' + (ANIM or 'anim').replace(':', '_') + '_atlas.webp'
    os.makedirs(os.path.join(AQUI, 'exemplos'), exist_ok=True)
    out = os.path.join(AQUI, 'exemplos', nome)
    open(out, 'wb').write(base64.b64decode(url.split(',')[1]))
    print('gravado', out, os.path.getsize(out), 'bytes; erros', errs or 'nenhum'); b.close()
