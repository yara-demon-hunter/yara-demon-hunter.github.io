#!/usr/bin/env python3
"""Servidor local das prévias SEM cache: o navegador sempre baixa a versão nova de cada .js.

O `python3 -m http.server` deixa o navegador guardar os módulos; depois de mudar o código ele mistura arquivos novos e
velhos e a página fica preta. Rode da pasta do jogo (mini_games/last_torch):

    python3 previews/serve.py          # http://localhost:8000/previews/
    python3 previews/serve.py 8001     # outra porta
"""
import http.server
import os
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f'Prévias em http://localhost:{port}/previews/ (sem cache)')
    http.server.ThreadingHTTPServer(('', port), NoCache).serve_forever()
