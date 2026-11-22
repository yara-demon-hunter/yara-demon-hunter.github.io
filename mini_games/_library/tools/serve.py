#!/usr/bin/env python3
"""Servidor local do Ateliê da biblioteca (mini_games/_library/tools).

    python3 mini_games/_library/tools/serve.py [porta]        # padrão: 8010

Abre http://localhost:8010/_library/tools/ . Serve a pasta mini_games (como o `python3 -m http.server 8010` que o manual
descrevia) e, a mais, deixa o editor de cenário GRAVAR o layout no projeto:

  POST /__save_layout   { scenery, profile?, placed, baked, colliders }  ->  mini_games/_library/scenery/layouts/<id>.js  (+ layouts/index.js)
                        profile = desktop (padrão) | landscape | portrait (celular deitado / em pé): grava <id>--<tipo>.js
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
PROFILES = ("desktop", "landscape", "portrait")      # tipos de tela: desktop = <id>.js; os outros = <id>--<tipo>.js
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
    if data.get("profile", "desktop") not in PROFILES:
        return "tipo de tela desconhecido"
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
    colliders = data.get("colliders", [])
    if not isinstance(colliders, list) or len(colliders) > 2000:
        return "colliders precisa ser uma lista"
    num = (int, float)
    for c in colliders:
        if not isinstance(c, dict) or c.get("shape") not in ("rect", "circle"):
            return "área de contato inválida"
        needed = ("x", "y", "w", "h") if c["shape"] == "rect" else ("x", "y", "r")
        if not all(isinstance(c.get(k), num) and not isinstance(c.get(k), bool) for k in needed):
            return "medidas da área de contato inválidas"
        if "rot" in c and not isinstance(c["rot"], num):
            return "giro da área de contato inválido"
        if "ry" in c and (not isinstance(c["ry"], num) or isinstance(c["ry"], bool)):
            return "raio Y da área de contato inválido"
        if "cr" in c and (not isinstance(c["cr"], num) or isinstance(c["cr"], bool)):
            return "raio dos cantos da área de contato inválido"
        if "fit" in c and (not isinstance(c["fit"], list) or len(c["fit"]) != 2 or not all(isinstance(v, num) and not isinstance(v, bool) and v > 0 for v in c["fit"])):
            return "medida de referência (fit) da área inválida"
        if c.get("kind", "contact") not in ("contact", "behind", "spawn", "slow"):
            return "tipo da área inválido"
        if "slow" in c and (not isinstance(c["slow"], num) or isinstance(c["slow"], bool) or not 0 < c["slow"] <= 0.95):
            return "lentidão da área inválida"
        if "weight" in c and (not isinstance(c["weight"], num) or isinstance(c["weight"], bool) or c["weight"] < 0):
            return "peso da zona de nascimento inválido"
        if "boss" in c and not isinstance(c["boss"], bool):
            return "marca de chefe inválida"
        if "types" in c and (not isinstance(c["types"], list) or len(c["types"]) > 80 or not all(isinstance(t, str) and len(t) <= 40 for t in c["types"])):
            return "tipos de monstro da zona inválidos"
        if "object" in c and (not isinstance(c["object"], str) or len(c["object"]) > 40):
            return "objeto da área de trás inválido"
        blocks = c.get("blocks", {})
        if not isinstance(blocks, dict) or not all(isinstance(v, bool) for v in blocks.values()):
            return "bloqueios da área de contato inválidos"
    return None


def write_layout(data: dict) -> dict:
    sid = data["scenery"]
    profile = data.get("profile", "desktop")
    path = LAYOUTS / (f"{sid}.js" if profile == "desktop" else f"{sid}--{profile}.js")
    LAYOUTS.mkdir(exist_ok=True)
    placed, baked = data["placed"], data.get("baked", [])
    colliders = data.get("colliders", [])
    saved_at = int(time.time() * 1000)
    if not placed and not baked and not colliders:
        path.unlink(missing_ok=True)
        rebuild_index()
        return {"savedAt": 0, "file": None}
    rows = ",\n".join("    " + json.dumps(item, ensure_ascii=False, separators=(", ", ": ")) for item in placed)
    crows = ",\n".join("    " + json.dumps(item, ensure_ascii=False, separators=(", ", ": ")) for item in colliders)
    text = (
        f"// Layout do cenário \"{sid}\" gravado pelo editor (tools/scenery_editor.html, via tools/serve.py).\n"
        "// x e y em fração do mundo. Para voltar ao cenário original, apague este arquivo (ou grave um layout vazio no editor).\n"
        "import { registerLayout } from '../layouts.js';\n\n"
        f"registerLayout('{sid}', {{\n  profile: '{profile}',\n  savedAt: {saved_at},\n  baked: {json.dumps(baked)},\n  placed: [\n{rows}\n  ],\n  // Áreas de contato: ninguém passa (x, y = centro em fração do mundo; w, h, r em unidades; rot em graus)\n  colliders: [\n{crows}\n  ]\n}});\n"
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
            return self.send_json(200, {"ok": True, "features": ["colliders", "profiles"]})
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
        self.send_json(200, {"ok": True, **result, "profile": data.get("profile", "desktop"), "colliders": len(data.get("colliders", [])), "objects": len(data["placed"]), "sync": run_sync()})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8010
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(ROOT)))
    print(f"Ateliê em http://localhost:{port}/_library/tools/  (editor de cenário grava em _library/scenery/layouts/)")
    print("Abra por localhost, 127.0.0.1 ou 0.0.0.0; outros endereços não podem gravar.")
    server.serve_forever()
