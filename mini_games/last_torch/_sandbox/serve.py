#!/usr/bin/env python3
"""Servidor local da arena de testes do Last Torch.

    python3 mini_games/last_torch/_sandbox/serve.py [porta]

Abre http://localhost:8800/ . Serve a pasta do jogo e entrega o MESMO last_torch.html do jogo, sem o front matter do
Jekyll, com o painel de testes (sandbox.js) injetado. Nada daqui entra no jogo: a pasta começa com "_" (o Jekyll ignora)
e build-standalone.rb só copia js, css, data_model e images.
Outra porta = outro localStorage: o save da arena não toca o do jogo.
"""
import json
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


FLUID_FILE = GAME / "data_model" / "fluid_layout.js"
FLUID_AXIS = {"portrait": "height", "tablet": "width", "landscape": "width", "desktop": "width"}


def js_to_json(text: str):
    """O objeto de FLUID_LAYOUT é JS simples (chaves sem aspas, aspas simples): vira JSON para mexer e volta a ser escrito no mesmo formato."""
    body = text.split("export const FLUID_LAYOUT =", 1)[1].strip().rstrip(";")
    body = re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:", r'\1"\2":', body).replace("'", '"')
    return json.loads(body)


def fluid_text(head: str, layout: dict) -> str:
    inline = lambda o: json.dumps(o, ensure_ascii=False, separators=(", ", ": "))
    out = [head.rstrip("\n") + "\nexport const FLUID_LAYOUT = {"]
    groups = list(layout.items())
    for n, (name, group) in enumerate(groups):
        out.append(f"    {name}: {{ axis: '{group['axis']}', anchors: [")
        anchors = group["anchors"]
        for i, a in enumerate(anchors):
            out.append(f"        {{ at: {a['at']}, screen: '{a['screen']}',")
            out.append("          hud: {" + ", ".join(f"{k}: {inline(v)}" for k, v in a["hud"].items()) + "},")
            out.append("          ctl: {" + ", ".join(f"{k}: {inline(v)}" for k, v in a["ctl"].items()) + "} }" + ("," if i < len(anchors) - 1 else ""))
        out.append("    ] }" + ("," if n < len(groups) - 1 else ""))
    out.append("};")
    return "\n".join(out) + "\n"


def save_hud(entries: list) -> int:
    text = FLUID_FILE.read_text(encoding="utf-8")
    head = text.split("export const FLUID_LAYOUT", 1)[0]
    layout = js_to_json(text)
    for e in entries:
        group = layout.setdefault(e["profile"], {"axis": FLUID_AXIS[e["profile"]], "anchors": []})
        anchor = next((a for a in group["anchors"] if a["screen"] == e["screen"]), None)
        if anchor is None:
            anchor = {"at": e["at"], "screen": e["screen"], "hud": {}, "ctl": {}}
            group["anchors"].append(anchor)
        anchor["hud"].update(e.get("hud", {}))
        anchor["ctl"].update(e.get("ctl", {}))
        group["anchors"].sort(key=lambda a: a["at"])
    FLUID_FILE.write_text(fluid_text(head, layout), encoding="utf-8")
    return len(entries)


BOSS_FIELDS = ("hp", "damage", "speed", "physicalDef", "magicDef")


def save_bosses(stats):
    """Grava em data_model/bosses.js SÓ os números de BOSS_STATS (vida, dano, velocidade e as duas defesas) dos chefes enviados.
    Comentários, espaçamento e o resto do arquivo não mudam. Devolve quantos chefes foram alterados."""
    path = GAME / "data_model" / "bosses.js"
    text = path.read_text(encoding="utf-8")
    start = text.index("export const BOSS_STATS")
    end = text.index("};", start)
    block = text[start:end]
    for key, values in stats.items():
        if not re.fullmatch(r"[A-Z_]+", key):
            raise ValueError(f"chefe inválido: {key}")
        m = re.search(rf"^(\s*{key}:\s*\{{)([^}}]*)(\}})", block, re.M)
        if not m:
            raise ValueError(f"{key} não está em BOSS_STATS")
        inner = m.group(2)
        for field, v in values.items():
            if field not in BOSS_FIELDS or not isinstance(v, (int, float)) or isinstance(v, bool) or v < 0:
                raise ValueError(f"valor inválido: {key}.{field}")
            inner, n = re.subn(rf"\b{field}:\s*-?[\d.]+", f"{field}: {v:g}" if field != "hp" else f"{field}: {int(round(v))}", inner, count=1)
            if n != 1:
                raise ValueError(f"{key}.{field} não achado")
        block = block[:m.start(2)] + inner + block[m.end(2):]
    tmp = path.with_suffix(".js.tmp")
    tmp.write_text(text[:start] + block + text[end:], encoding="utf-8")
    tmp.replace(path)
    return len(stats)


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

    # --- Gravar o HUD tuner no arquivo do jogo (POST /__save_hud) ---
    # Recebe pontos de referência { profile, at, screen, hud, ctl } e os mistura na tabela data_model/fluid_layout.js (um ponto já existente da mesma
    # tela só tem as peças enviadas trocadas; as outras ficam como estavam). O resto do arquivo (comentários e demais pontos) não muda.
    def do_POST(self):
        route = self.path.split("?")[0]
        if route not in ("/__save_hud", "/__save_bosses"):
            self.send_error(404)
            return
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            n = save_hud(body["entries"]) if route == "/__save_hud" else save_bosses(body["stats"])
            out, code = {"ok": True, "saved": n}, 200
        except Exception as err:  # noqa: BLE001 - devolve o motivo para o tuner mostrar
            out, code = {"ok": False, "error": str(err)}, 500
        data = json.dumps(out).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

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
