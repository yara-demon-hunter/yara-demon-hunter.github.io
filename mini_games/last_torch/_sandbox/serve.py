#!/usr/bin/env python3
"""Servidor local da arena de testes do Last Torch.

    python3 mini_games/last_torch/_sandbox/serve.py [porta]

Abre http://localhost:8800/ . Serve a pasta do jogo e entrega o MESMO last_torch.html do jogo, sem o front matter do
Jekyll, com o painel de testes (sandbox.js) injetado. Nada daqui entra no jogo: a pasta começa com "_" (o Jekyll ignora)
e build-standalone.rb só copia js, css, data_model e images.
Outra porta = outro localStorage: o save da arena não toca o do jogo.
"""
import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

GAME = Path(__file__).resolve().parent.parent


def sandbox_page() -> bytes:
    html = (GAME / "last_torch.html").read_text(encoding="utf-8")
    html = re.sub(r"\A---\n.*?\n---\n", "", html, flags=re.S)
    html = re.sub(r"^[ \t]*<!-- Google Analytics.*?-->\n", "", html, flags=re.M)
    html = re.sub(r"^[ \t]*\{% include head-resources\.html %\}\n", "", html, flags=re.M)
    html = html.replace("</head>", '<link rel="stylesheet" href="/_sandbox/sandbox.css"></head>', 1)
    html = html.replace("</body>", '<script type="module" src="/_sandbox/sandbox.js"></script></body>', 1)
    return html.encode("utf-8")


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?")[0] in ("/", "/index.html", "/sandbox"):
            body = sandbox_page()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8800
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(GAME)))
    print(f"Last Torch sandbox: http://localhost:{port}/   (Ctrl+C para sair)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
