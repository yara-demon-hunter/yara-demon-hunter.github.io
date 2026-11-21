// --- LAYOUTS GRAVADOS DOS CENÁRIOS ---
// O editor (tools/scenery_editor.html), rodando pelo servidor do Ateliê (tools/serve.py), grava o trabalho de cada cenário em
// scenery/layouts/<id>.js, que se registra aqui. createScenery(id) aplica o layout gravado ao cenário (baked + placed), então o editor,
// o sandbox e o jogo mostram sempre o mesmo cenário. Para voltar ao original de um cenário, apague o arquivo dele (ou grave vazio).
const layouts = new Map();

export function registerLayout(id, data) {
    layouts.set(id, data);
}

export function getLayout(id) {
    return layouts.get(id);
}
