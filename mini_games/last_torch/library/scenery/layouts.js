// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/layouts.js e rode o sync.
// --- LAYOUTS GRAVADOS DOS CENÁRIOS ---
// O editor (tools/scenery_editor.html), rodando pelo servidor do Ateliê (tools/serve.py), grava o trabalho de cada cenário em
// scenery/layouts/ (objetos `placed`, `baked` e as áreas de contato `colliders`), que se registra aqui. Cada cenário pode ter até 3 layouts,
// um por TIPO DE TELA: 'desktop' (<id>.js), 'landscape' (<id>--landscape.js, celular deitado) e 'portrait' (<id>--portrait.js, celular em pé).
// createScenery(id) aplica o layout da tela atual (baked + placed + colliders), então o editor, o sandbox e o jogo mostram sempre o mesmo
// cenário. Para voltar ao original, apague o arquivo (ou grave vazio no editor).
const layouts = new Map();

export const PROFILES = ['desktop', 'landscape', 'portrait'];

const keyOf = (id, profile) => (profile && profile !== 'desktop' ? `${id}@${profile}` : id);

export function registerLayout(id, data) {
    layouts.set(keyOf(id, data.profile), data);
}

// O layout EXATO desse tipo de tela (undefined se ele não tem um próprio): é o que o editor edita
export function getLayout(id, profile = 'desktop') {
    return layouts.get(keyOf(id, profile));
}

// O layout que o jogo usa: o do tipo de tela, ou (se ainda não existe) o do desktop
export function resolveLayout(id, profile = 'desktop') {
    return getLayout(id, profile) ?? getLayout(id, 'desktop');
}
