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
import jspatch
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


LIB = REPO / "mini_games" / "_library"
TUNER_DIRS = ("monsters/", "characters/", "buddies/", "weapons/")
TUNER_TABLES = {"monsters/25d/death.js": "MONSTER_DEATH", "monsters/25d/spawn.js": "MONSTER_SPAWN"}
KEY_RE = re.compile(r"^[A-Za-z_]\w*(\.\w+)*$")


def tuner_file(rel):
    """O arquivo .js da biblioteca que o ajuste ao vivo pode gravar (só dentro de _library/monsters, characters, buddies e weapons)."""
    if not isinstance(rel, str) or not re.fullmatch(r"[\w./-]+\.js", rel) or ".." in rel or not rel.startswith(TUNER_DIRS):
        raise ValueError("arquivo não permitido")
    path = (LIB / rel).resolve()
    if LIB.resolve() not in path.parents or not path.is_file():
        raise ValueError(f"arquivo não encontrado: {rel}")
    return path


def validate_tuner(data):
    if not isinstance(data, dict) or not isinstance(data.get("items"), list) or not data["items"] or len(data["items"]) > 40:
        return "pedido inválido"
    for item in data["items"]:
        if not isinstance(item, dict):
            return "item inválido"
        try:
            tuner_file(item.get("file"))
        except ValueError as err:
            return str(err)
        if item.get("kind") == "props":
            edits = item.get("edits")
            if not isinstance(edits, dict) or not edits or len(edits) > 400:
                return "edições inválidas"
            for k, v in edits.items():
                if not KEY_RE.match(k):
                    return f"campo inválido: {k}"
                ok = isinstance(v, (bool, int, float, str)) or (isinstance(v, list) and len(v) <= 8 and all(isinstance(x, (int, float)) and not isinstance(x, bool) for x in v))
                if not ok or (isinstance(v, str) and len(v) > 200):
                    return f"valor inválido em {k}"
        elif item.get("kind") == "entry":
            if item["file"] not in TUNER_TABLES or not isinstance(item.get("key"), str) or not re.fullmatch(r"\w+", item["key"]):
                return "entrada inválida"
            text = item.get("text")
            if not isinstance(text, str) or not text.strip().startswith("{") or len(text) > 20000:
                return "texto da entrada inválido"
        else:
            return "tipo de item desconhecido"
    return None


def write_tuner(data):
    done = []
    for item in data["items"]:
        path = tuner_file(item["file"])
        text = path.read_text(encoding="utf-8")
        if item["kind"] == "props":
            new = jspatch.apply_props(text, item["edits"])
            done.append(f"{item['file']} ({len(item['edits'])} valores)")
        else:
            new = jspatch.apply_entry(text, TUNER_TABLES[item["file"]], item["key"], item["text"].strip().rstrip(","))
            done.append(f"{item['file']} ({item['key']})")
        tmp = path.with_suffix(".js.tmp")
        tmp.write_text(new, encoding="utf-8")
        tmp.replace(path)
    return done


MAP_FILE = REPO / "mini_games" / "last_torch" / "data_model" / "map_layout.js"
MAP_FONTS = ("cinzel", "inter")
COLOR_RE = re.compile(r"^(#[0-9a-fA-F]{3,8}|rgba?\([0-9., %]{3,40}\))$")
SCENERY_IDS = ("dark_forest_2", "river_crossing_2", "swamp", "graveyard_2", "village_gate_3", "castle_gate_2")


def _num(v, lo=-5000, hi=5000):
    return isinstance(v, (int, float)) and not isinstance(v, bool) and lo <= v <= hi


def _pt(v):
    return isinstance(v, list) and len(v) == 2 and all(_num(x, -100, 3000) for x in v)


def validate_map(data):
    """O layout do mapa entre as telas (last_torch/data_model/map_layout.js): só números, textos curtos e cores simples."""
    if not isinstance(data, dict):
        return "corpo inválido"
    screens = data.get("screens")
    if not isinstance(screens, list) or len(screens) != len(SCENERY_IDS):
        return "são 6 telas"
    for i, s in enumerate(screens):
        if not isinstance(s, dict) or s.get("id") != SCENERY_IDS[i]:
            return f"a tela {i + 1} precisa ser {SCENERY_IDS[i]}"
        if not isinstance(s.get("name"), str) or not 1 <= len(s["name"]) <= 40:
            return f"nome inválido na tela {i + 1}"
        if not _pt(s.get("node")):
            return f"posição inválida na tela {i + 1}"
        leg = s.get("leg")
        last = i == len(SCENERY_IDS) - 1
        if last and leg is not None:
            return "a última tela não tem caminho"
        if not last and (not isinstance(leg, list) or not 2 <= len(leg) <= 60 or not all(_pt(p) for p in leg)):
            return f"caminho inválido na tela {i + 1}"
    labels = data.get("labels")
    if not isinstance(labels, list) or len(labels) > 80:
        return "textos inválidos"
    for l in labels:
        if not isinstance(l, dict) or not isinstance(l.get("text"), str) or len(l["text"]) > 200:
            return "texto inválido"
        if not (_num(l.get("x"), -100, 3000) and _num(l.get("y"), -100, 3000) and _num(l.get("size"), 4, 400)):
            return "posição ou tamanho de texto inválido"
        if not isinstance(l.get("color"), str) or not COLOR_RE.match(l["color"]):
            return "cor de texto inválida"
        if l.get("font", "cinzel") not in MAP_FONTS:
            return "fonte inválida"
        for k, lo, hi in (("rot", -360, 360), ("weight", 100, 900), ("opacity", 0, 1)):
            if k in l and not _num(l[k], lo, hi):
                return f"{k} inválido"
        for k in ("shadow", "italic"):
            if k in l and not isinstance(l[k], bool):
                return f"{k} inválido"
    m, n, w, t = data.get("marker"), data.get("nodes"), data.get("walk"), data.get("texts")
    if not (isinstance(m, dict) and _num(m.get("size"), 1, 30) and _num(m.get("borderWidth"), 0, 12) and isinstance(m.get("border"), str) and COLOR_RE.match(m["border"])):
        return "marcador inválido"
    if not (isinstance(n, dict) and _num(n.get("size"), 0.2, 8) and all(isinstance(n.get(k), str) and COLOR_RE.match(n[k]) for k in ("done", "idle", "next"))):
        return "bolinhas inválidas"
    if not (isinstance(w, dict) and _num(w.get("seconds"), 0.5, 12)):
        return "duração inválida"
    if not (isinstance(t, dict) and all(isinstance(t.get(k), str) and len(t[k]) <= 80 for k in ("title", "sub", "button"))):
        return "textos do mapa inválidos"
    return None


MAP_HEADER = """// --- O MAPA ENTRE AS TELAS: LAYOUT ---
// Gravado pelo editor do mapa (Ateliê: _library/tools/map_editor.html, pelo servidor tools/serve.py). Pode editar à mão também.
// Tudo em PIXELS da imagem do mapa (images/map/map.webp, 1375 x 767); o jogo converte para porcentagem, então vale em qualquer tela.
//   screens  as 6 telas na ordem: id do cenário, nome (aparece no jogo), node (onde fica no mapa) e leg (o caminho daqui até a PRÓXIMA tela; o 1º e o
//            último ponto são os nós das duas telas; null na última)
//   labels   textos por cima do mapa: text, x, y (centro), size (altura da letra em pixels do mapa), color, font ('cinzel' ou 'inter'), weight, italic,
//            rot (graus), shadow (true/false), opacity (0 a 1)
//   marker   o retrato do herói que anda: size (% da largura do mapa), border (cor), borderWidth (px)
//   nodes    as bolinhas das telas: size (% da largura), done (já passou), idle (ainda não), next (a próxima)
//   walk     seconds: quanto dura a caminhada
//   texts    title / sub / button: {to} e {from} viram o nome das telas
"""


def write_map(data):
    keep = {k: data[k] for k in ("screens", "labels", "marker", "nodes", "walk", "texts")}
    text = json.dumps(keep, indent=4, ensure_ascii=False)
    text = re.sub(r"\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]", r"[\1, \2]", text)             # os pontos [x, y] numa linha só
    text = re.sub(r'"(\w+)":', r"\1:", text)                                                   # chaves sem aspas, como no resto do projeto
    out = MAP_HEADER + "export const MAP_LAYOUT = " + text + ";\n"
    tmp = MAP_FILE.with_suffix(".js.tmp")
    tmp.write_text(out, encoding="utf-8")
    tmp.replace(MAP_FILE)
    return str(MAP_FILE.relative_to(REPO))


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
            return self.send_json(200, {"ok": True, "features": ["colliders", "profiles", "tuner", "map"]})
        return super().do_GET()

    def do_POST(self):
        if self.path == "/__save_map":
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
            error = validate_map(data)
            if error:
                return self.send_json(400, {"ok": False, "error": error})
            return self.send_json(200, {"ok": True, "file": write_map(data)})
        if self.path == "/__save_tuner":
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
            error = validate_tuner(data)
            if error:
                return self.send_json(400, {"ok": False, "error": error})
            try:
                done = write_tuner(data)
            except ValueError as err:
                return self.send_json(400, {"ok": False, "error": str(err)})
            return self.send_json(200, {"ok": True, "files": done, "sync": run_sync()})
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
