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


# O tuner mostra o jogo dentro de um iframe, em qualquer tamanho de tela. Para simular um celular (controles de toque), o
# jogo é servido também sob um prefixo: /__touch/ (o CSS ganha (pointer: coarse) sempre verdadeiro e o JS acredita em toque)
# e /__desk/ (como no computador). Todos os caminhos do jogo são relativos, então <base> basta.
FRAME_PREFIXES = {"/__touch/": True, "/__desk/": False}
TOUCH_SHIM = """<script>
(() => {
  const real = window.matchMedia.bind(window);
  window.matchMedia = (q) => {
    if (typeof q === 'string' && q.replace(/\\s+/g, '') === '(pointer:coarse)') {
      return { matches: true, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } };
    }
    return real(q);
  };
})();
</script>"""


# FORMATO DE TELA do sandbox inteiro (cookie sbx_format, escolhido no painel): desktop (padrão, a página direta) ou celular deitado / em pé.
# Nos formatos de celular a página "/" vira uma moldura (shell) com o sandbox COMPLETO dentro de um iframe do tamanho do celular
# (390x844 ou 844x390): o jogo mede o iframe, então mundo, HUD e media queries se comportam como no aparelho. O iframe pede "/?frame=1".
PHONE_FORMATS = {"portrait": (390, 844, "Celular em pé · 390×844"), "landscape": (844, 390, "Celular deitado · 844×390")}


def shell_page(fmt: str) -> bytes:
    w, h, label = PHONE_FORMATS[fmt]
    options = "".join(f'<option value="{k}"{" selected" if k == fmt else ""}>{v[2]}</option>' for k, v in PHONE_FORMATS.items())
    html = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Last Torch Sandbox · {label}</title>
<style>
html,body{{margin:0;height:100%;background:#05070d;color:#94a3b8;font:600 13px Inter,system-ui,sans-serif}}
#bar{{height:40px;display:flex;align-items:center;gap:10px;padding:0 12px;border-bottom:1px solid #1e293b}}
#bar select{{background:#111a2e;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:4px 8px;font:inherit}}
#stage{{height:calc(100% - 41px);display:flex;align-items:center;justify-content:center;overflow:hidden}}
iframe{{width:{w}px;height:{h}px;border:2px solid #334155;border-radius:14px;background:#000;flex:none;box-sizing:content-box}}
</style></head><body>
<div id="bar"><span>Tela do sandbox:</span><select id="fmt"><option value="desktop">Computador (janela inteira)</option>{options}</select><span>{label} — vale para todas as abas</span></div>
<div id="stage"><iframe id="game" src="/?frame=1" title="Sandbox"></iframe></div>
<script>
const f=document.getElementById('game'),st=document.getElementById('stage');
const fit=()=>{{const s=Math.min((st.clientWidth-24)/({w}+4),(st.clientHeight-16)/({h}+4),1);f.style.transform='scale('+s+')';}};
fit();addEventListener('resize',fit);
document.getElementById('fmt').onchange=(e)=>{{document.cookie='sbx_format='+e.target.value+'; path=/; max-age=31536000; SameSite=Lax';location.href='/';}};
</script></body></html>"""
    return html.encode("utf-8")


def sandbox_page(frame_prefix: str | None = None, embed: bool = False) -> bytes:
    html = (GAME / "last_torch.html").read_text(encoding="utf-8")
    html = re.sub(r"\A---\n.*?\n---\n", "", html, flags=re.S)
    html = re.sub(r"^[ \t]*<!-- Google Analytics.*?-->\n", "", html, flags=re.M)
    html = re.sub(r"^[ \t]*\{% include head-resources\.html %\}\n", "", html, flags=re.M)
    html = html.replace("</head>", '<link rel="stylesheet" href="/_sandbox/sandbox.css"><link rel="stylesheet" href="/_sandbox/tuner.css"></head>', 1)
    if frame_prefix:
        # Página do iframe do tuner: o jogo rodando sozinho (frame.js liga o modo deus e expõe a API), sem o painel
        shim = TOUCH_SHIM if FRAME_PREFIXES[frame_prefix] else ""
        html = html.replace("<head>", f'<head><base href="{frame_prefix}">{shim}', 1)
        html = html.replace("</body>", '<script type="module" src="/_sandbox/frame.js"></script></body>', 1)
    else:
        if embed:
            html = html.replace("<head>", f"<head>{TOUCH_SHIM}", 1)          # dentro da moldura do celular: o jogo acredita em toque
        html = html.replace("</body>", '<script type="module" src="/_sandbox/sandbox.js"></script></body>', 1)
    return html.encode("utf-8")


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def frame_prefix(self):
        path = self.path.split("?")[0]
        return next((p for p in FRAME_PREFIXES if path.startswith(p)), None)

    def translate_path(self, path):
        prefix = next((p for p in FRAME_PREFIXES if path.split("?")[0].startswith(p)), None)
        if prefix:
            path = "/" + path[len(prefix):]
        return super().translate_path(path)

    def format_cookie(self) -> str:
        for part in (self.headers.get("Cookie") or "").split(";"):
            key, _, value = part.strip().partition("=")
            if key == "sbx_format" and value in PHONE_FORMATS:
                return value
        return "desktop"

    def send_page(self, body: bytes, content_type="text/html; charset=utf-8"):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        prefix = self.frame_prefix()
        if prefix:
            rest = self.path.split("?")[0][len(prefix):]
            if rest in ("", "index.html"):
                self.send_page(sandbox_page(prefix))
                return
            if rest.endswith(".css") and FRAME_PREFIXES[prefix]:
                css = Path(self.translate_path(self.path)).read_text(encoding="utf-8")
                css = css.replace("not (pointer: coarse)", "not (min-width: 0px)").replace("(pointer: coarse)", "(min-width: 0px)")
                self.send_page(css.encode("utf-8"), "text/css; charset=utf-8")
                return
        if self.path.split("?")[0] in ("/", "/index.html", "/sandbox"):
            fmt = self.format_cookie()
            if "frame=1" in self.path:
                self.send_page(sandbox_page(embed=True))
            elif fmt != "desktop":
                self.send_page(shell_page(fmt))
            else:
                self.send_page(sandbox_page())
            return
        if self.path.split("?")[0].endswith(".css") and self.format_cookie() != "desktop":
            # moldura de celular: os estilos de toque ((pointer: coarse)) valem sempre, como no aparelho
            css = Path(self.translate_path(self.path)).read_text(encoding="utf-8")
            css = css.replace("not (pointer: coarse)", "not (min-width: 0px)").replace("(pointer: coarse)", "(min-width: 0px)")
            self.send_page(css.encode("utf-8"), "text/css; charset=utf-8")
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
