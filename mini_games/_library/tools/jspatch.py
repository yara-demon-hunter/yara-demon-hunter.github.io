"""Edita valores dentro de objetos de arquivos .js da biblioteca (os blocos `export const X_VISUALS = { ... }` e as tabelas MONSTER_DEATH / MONSTER_SPAWN)
sem mexer no resto do arquivo. Usado pelo serve.py para o ajuste ao vivo (tuner.html) gravar direto no arquivo.

Não é um parser de JavaScript inteiro: só entende o que esses arquivos usam (objetos, listas, textos, números, comentários, `...espalhar`)."""
import re


def _skip_string(text, i):
    """i aponta para ' " ou `; devolve o índice logo depois do texto."""
    q = text[i]
    i += 1
    while i < len(text):
        c = text[i]
        if c == "\\":
            i += 2
            continue
        if c == q:
            return i + 1
        i += 1
    return i


def _skip_comment(text, i):
    """Se em i há comentário, devolve o índice depois dele; senão i."""
    if text.startswith("//", i):
        j = text.find("\n", i)
        return len(text) if j < 0 else j
    if text.startswith("/*", i):
        j = text.find("*/", i + 2)
        return len(text) if j < 0 else j + 2
    return i


def _value_end(text, i):
    """Do começo de um valor, devolve onde ele termina (antes da vírgula ou do } de fora)."""
    depth = 0
    n = len(text)
    while i < n:
        c = text[i]
        if c in "'\"`":
            i = _skip_string(text, i)
            continue
        j = _skip_comment(text, i)
        if j != i:
            i = j
            continue
        if c in "{[(":
            depth += 1
        elif c in "}])":
            if depth == 0:
                return i
            depth -= 1
        elif c == "," and depth == 0:
            return i
        i += 1
    return i


def _properties(text, open_idx):
    """Propriedades do objeto que abre em open_idx: [(chave, valor_ini, valor_fim)], e o índice do } que fecha."""
    props = []
    i = open_idx + 1
    n = len(text)
    while i < n:
        c = text[i]
        if c.isspace() or c == ",":
            i += 1
            continue
        j = _skip_comment(text, i)
        if j != i:
            i = j
            continue
        if c == "}":
            return props, i
        if text.startswith("...", i):
            i = _value_end(text, i)
            continue
        m = re.compile(r"""(?:([A-Za-z_$][\w$]*)|'([^']*)'|"([^"]*)")\s*:\s*""").match(text, i)
        if not m:
            i = _value_end(text, i)          # atalho {a, b} ou coisa que não entendemos: pula
            continue
        key = m.group(1) or m.group(2) or m.group(3)
        vs = m.end()
        ve = _value_end(text, vs)
        # o valor termina antes de espaços e de um comentário de linha que sobra
        k = ve
        while k > vs and text[k - 1].isspace():
            k -= 1
        props.append((key, vs, k))
        i = ve
    return props, n


def _literal(v, indent=""):
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        r = f"{v:.4f}".rstrip("0").rstrip(".") if isinstance(v, float) else str(v)
        return r if r not in ("-0", "") else "0"
    if isinstance(v, str):
        return "'" + v.replace("\\", "\\\\").replace("'", "\\'") + "'"
    if isinstance(v, list):
        return "[" + ", ".join(_literal(x) for x in v) + "]"
    raise ValueError("valor não suportado")


def _line_indent(text, idx):
    start = text.rfind("\n", 0, idx) + 1
    m = re.match(r"[ \t]*", text[start:])
    return m.group(0)


def set_path(text, open_idx, path, value_literal):
    """Põe value_literal em path (lista de chaves) dentro do objeto que abre em open_idx. Devolve o texto novo."""
    props, close = _properties(text, open_idx)
    key = path[0]
    found = next((p for p in props if p[0] == key), None)
    if len(path) == 1:
        if found:
            return text[:found[1]] + value_literal + text[found[2]:]
        return _insert(text, props, close, key, value_literal, open_idx)
    if found:
        vs = found[1]
        if text[vs] != "{":
            raise ValueError(f'"{key}" não é um objeto neste arquivo')
        return set_path(text, vs, path[1:], value_literal)
    nested = "{ " + _nested_literal(path[1:], value_literal) + " }"
    return _insert(text, props, close, key, nested, open_idx)


def _nested_literal(path, value_literal):
    if len(path) == 1:
        return f"{path[0]}: {value_literal}"
    return f"{path[0]}: {{ {_nested_literal(path[1:], value_literal)} }}"


def _insert(text, props, close, key, literal, open_idx):
    """Acrescenta `key: literal,` no fim do objeto (antes do } que fecha), garantindo a vírgula da propriedade anterior."""
    base = _line_indent(text, open_idx)
    indent = base + "    "
    before = text[:close].rstrip()
    # há algo antes no objeto sem vírgula no fim? (a última propriedade)
    if before.endswith("{"):
        sep = ""
    elif before.endswith(","):
        sep = ""
    else:
        sep = ","
    # o comentário de linha da última propriedade fica onde está: a vírgula vai antes dele
    if sep and props:
        last_end = props[-1][2]
        text = text[:last_end] + "," + text[last_end:]
        close += 1
        before = text[:close].rstrip()
        sep = ""
    return before + "\n" + indent + f"{key}: {literal},\n" + base + text[close:]


def find_object(text, name=None):
    """Índice do { do objeto `export const NAME = {` (o primeiro, se name for None)."""
    pat = rf"export const {re.escape(name)}\s*=\s*\{{" if name else r"export const \w+\s*=\s*\{"
    m = re.search(pat, text)
    if not m:
        raise ValueError("objeto exportado não encontrado" if not name else f"{name} não encontrado")
    return m.end() - 1


def apply_props(text, edits, object_name=None):
    """edits: { 'a.b.c': valor }. Vetores já chegam inteiros (lista)."""
    for path, value in edits.items():
        open_idx = find_object(text, object_name)
        text = set_path(text, open_idx, path.split("."), _literal(value))
    return text


def apply_entry(text, object_name, key, value_text):
    """Troca (ou cria) a entrada `key` de uma tabela (MONSTER_DEATH, MONSTER_SPAWN) pelo texto do valor."""
    open_idx = find_object(text, object_name)
    return set_path(text, open_idx, [key], value_text)
