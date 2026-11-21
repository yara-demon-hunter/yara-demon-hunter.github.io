#!/usr/bin/env python3
"""Servidor local do Ateliê da biblioteca (mini_games/_library/tools).

    python3 mini_games/_library/tools/serve.py [porta]        # padrão: 8010

Abre http://localhost:8010/_library/tools/ . Serve a pasta mini_games (como o `python3 -m http.server 8010` que o manual
descrevia) e, a mais, deixa o editor de cenário GRAVAR o layout no projeto:

  POST /__save_layout   { scenery, placed, baked }  ->  mini_games/_library/scenery/layouts/<id>.js  (+ layouts/index.js)
                                                         e roda `ruby mini_games/_library/sync.rb` para os jogos receberem a cópia

Só escreve dentro de _library/scenery/layouts/. Só aceita pedidos feitos pela própria página (cabeçalho X-Atelie, Host local):
outra página aberta no navegador não consegue mandar gravar nada. Layout vazio apaga o arquivo daquele cenário.
"""
import json
import re
import subprocess
import sys
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]            # mini_games
REPO = ROOT.parent
SCENERY = ROOT / "_library" / "scenery"
LAYOUTS = SCENERY / "layouts"
ID_RE = re.compile(r"^[a-z0-9_]+$")
MAX_BODY = 4 * 1024 * 1024


def host_name(header: str) -> str:
    """O nome do cabeçalho Host, sem a porta ([::1]:8010 -> [::1])."""
    return header.split("]")[0] + "]" if header.startswith("[") else header.split(":")[0]


def is_local_host(host: str) -> bool:
    """Endereços que levam a este computador: localhost, 127.x.x.x, [::1] e 0.0.0.0 (o http.server costuma imprimir este último).
    Qualquer outro nome (um site que apontou o DNS para cá, por exemplo) é recusado."""
    return host in ("localhost", "0.0.0.0", "[::1]") or host.endswith(".localhost") or re.fullmatch(r"127\.\d+\.\d+\.\d+", host) is not None


def rebuild_index() -> None:
    names = sorted(p.stem for p in LAYOUTS.glob("*.js") if p.name != "index.js")
    lines = ["// Gerado por tools/serve.py: um import por layout gravado. Não edite à mão."]
    lines += [f"import './{name}.js';" for name in names]
    (LAYOUTS / "index.js").write_text("\n".join(lines) + "\n", encoding="utf-8")


def validate(data) -> str | None:
    """Devolve a mensagem de erro, ou None se o pedido é válido."""
    if not isinstance(data, dict):
        return "corpo inválido"
    sid = data.get("scenery")
    if not isinstance(sid, str) or not ID_RE.match(sid) or not (SCENERY / sid).is_dir():
        return "cenário desconhecido"
    placed, baked = data.get("placed"), data.get("baked", [])
    if not isinstance(placed, list) or not isinstance(baked, list):
        return "placed e baked precisam ser listas"
    if len(placed) > 5000:
        return "objetos demais"
    for item in placed:
        if not isinstance(item, dict) or not isinstance(item.get("prop"), str) or not ID_RE.match(item["prop"]):
            return "objeto inválido"
        if not all(isinstance(item.get(k), (int, float)) for k in ("x", "y")):
            return "posição inválida"
    if not all(isinstance(i, int) for i in baked):
        return "baked inválido"
    return None


def write_layout(data: dict) -> dict:
    sid = data["scenery"]
    path = LAYOUTS / f"{sid}.js"
    LAYOUTS.mkdir(exist_ok=True)
    placed, baked = data["placed"], data.get("baked", [])
    saved_at = int(time.time() * 1000)
    if not placed and not baked:
        path.unlink(missing_ok=True)
        rebuild_index()
        return {"savedAt": 0, "file": None}
    rows = ",\n".join("    " + json.dumps(item, ensure_ascii=False, separators=(", ", ": ")) for item in placed)
    text = (
        f"// Layout do cenário \"{sid}\" gravado pelo editor (tools/scenery_editor.html, via tools/serve.py).\n"
        "// x e y em fração do mundo. Para voltar ao cenário original, apague este arquivo (ou grave um layout vazio no editor).\n"
        "import { registerLayout } from '../layouts.js';\n\n"
        f"registerLayout('{sid}', {{\n  savedAt: {saved_at},\n  baked: {json.dumps(baked)},\n  placed: [\n{rows}\n  ]\n}});\n"
    )
    tmp = path.with_suffix(".js.tmp")
    tmp.write_text(text, encoding="utf-8")
    tmp.replace(path)
    rebuild_index()
    return {"savedAt": saved_at, "file": str(path.relative_to(REPO))}


def run_sync() -> str:
    try:
        done = subprocess.run(["ruby", "mini_games/_library/sync.rb"], cwd=REPO, capture_output=True, text=True, timeout=90)
        return "ok" if done.returncode == 0 else f"falhou: {done.stderr.strip()[:200]}"
    except (OSError, subprocess.SubprocessError) as err:
        return f"não rodou ({err})"


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, status: int, body: dict):
        raw = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def refusal(self) -> str | None:
        """Por que o pedido não é aceito (None = aceito). Tem de vir da própria página do editor e de um endereço local."""
        if self.headers.get("X-Atelie") != "1":
            return "o pedido não veio da página do editor (falta o cabeçalho X-Atelie): recarregue a página com Ctrl+Shift+R"
        host = host_name(self.headers.get("Host") or "")
        if not is_local_host(host):
            return f"o endereço \"{host}\" não é local: abra o editor por http://localhost:{self.server.server_address[1]}/_library/tools/"
        return None

    def do_GET(self):
        if self.path.split("?")[0] == "/__layout_api":
            return self.send_json(200, {"ok": True})
        return super().do_GET()

    def do_POST(self):
        if self.path != "/__save_layout":
            return self.send_json(404, {"ok": False, "error": "caminho desconhecido"})
        reason = self.refusal()
        if reason:
            return self.send_json(403, {"ok": False, "error": f"pedido recusado: {reason}"})
        size = int(self.headers.get("Content-Length") or 0)
        if size <= 0 or size > MAX_BODY:
            return self.send_json(400, {"ok": False, "error": "tamanho inválido"})
        try:
            data = json.loads(self.rfile.read(size))
        except ValueError:
            return self.send_json(400, {"ok": False, "error": "JSON inválido"})
        error = validate(data)
        if error:
            return self.send_json(400, {"ok": False, "error": error})
        result = write_layout(data)
        self.send_json(200, {"ok": True, **result, "sync": run_sync()})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8010
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(ROOT)))
    print(f"Ateliê em http://localhost:{port}/_library/tools/  (editor de cenário grava em _library/scenery/layouts/)")
    print("Abra por localhost, 127.0.0.1 ou 0.0.0.0; outros endereços não podem gravar.")
    server.serve_forever()
