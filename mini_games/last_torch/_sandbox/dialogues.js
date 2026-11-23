// Aba "Dialogues" do sandbox: escolha um herói e veja TODAS as conversas dele na ordem da partida (o duelo com o rival, as provocações antes de cada
// chefe, a revanche), na mesma tela do jogo: faixas de cinema, retratos, fala letra a letra. Toque, clique, Espaço ou Enter passa a fala.
// "Play all" toca tudo em sequência; cada cena também abre sozinha. Usa as funções reais (js/ui/dialogue.js), então o que aparece é o que o jogador vê.
import { ACTIVE_HEROES, HEROES } from '/data_model/heroes.js';
import { save, persist } from '/js/core/save.js';
import { listDialogueScenes, playScene, stopScene } from '/js/ui/dialogue.js';

export function mountDialogues(host, { hidePanel, showPanel }) {
    const v = { hero: ACTIVE_HEROES[0], scenes: [], at: -1 };
    host.innerHTML = `
      <p class="note">Pick a hero, then watch his conversations exactly as in the game. <b>Space</b>, <b>Enter</b> or a click moves to the next line. During a scene the panel hides; press <b>🧪 Sandbox</b> (bottom-left) to come back.</p>
      <h3>Hero <small>(the one you play; the rival and the lines change with him)</small></h3><div class="sb-row" id="dlHeroes"></div>
      <h3>Scenes <small>(in the order they happen in a night)</small></h3><div class="sb-row" id="dlScenes"></div>
      <div class="sb-row" id="dlControls"></div>
      <p class="note" id="dlNote"></p>`;
    const q = (s) => host.querySelector(s);
    const note = (t) => { q('#dlNote').textContent = t; };

    // O botão que para a sequência (só aparece enquanto toca)
    const stop = document.createElement('button');
    stop.textContent = '⏹ Stop dialogues';
    stop.style.cssText = 'position:fixed;top:12px;right:12px;z-index:100000;padding:8px 12px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#e2e8f0;font:600 13px Inter,sans-serif;cursor:pointer;display:none';
    document.body.appendChild(stop);
    let running = 0;                      // número da execução: parar invalida a sequência em andamento

    function setHero(key) {
        v.hero = key;
        v.scenes = listDialogueScenes(key);
        v.at = -1;
        // O jogo lê o herói do save (getHero): o save do sandbox é separado do do jogo
        if (!save.unlockedHeroes.includes(key) && !HEROES[key].free) save.unlockedHeroes.push(key);
        save.hero = key;
        persist();
        fillHeroes();
        fillScenes();
    }
    function fillHeroes() {
        const h = q('#dlHeroes');
        h.innerHTML = '';
        ACTIVE_HEROES.forEach(key => {
            const b = document.createElement('button');
            b.className = 'sb-opt' + (v.hero === key ? ' on' : '');
            b.textContent = HEROES[key].name;
            b.onclick = () => setHero(key);
            h.appendChild(b);
        });
    }
    function fillScenes() {
        const s = q('#dlScenes');
        s.innerHTML = '';
        if (!v.scenes.length) s.innerHTML = '<span class="note">This hero has no conversations.</span>';
        v.scenes.forEach((scene, i) => {
            const b = document.createElement('button');
            b.className = 'sb-opt' + (v.at === i ? ' on' : '');
            b.innerHTML = `${scene.label}<small>${scene.script.length} lines</small>`;
            b.onclick = () => playOne(i);
            s.appendChild(b);
        });
    }
    function begin() {
        running++;
        hidePanel();
        stop.style.display = 'block';
        return running;
    }
    function end() {
        stop.style.display = 'none';
        showPanel();
        fillScenes();
    }
    // Uma cena só; ao acabar o painel volta
    function playOne(i) {
        const id = begin();
        v.at = i;
        note(`Playing: ${v.scenes[i].label}`);
        playScene(v.scenes[i], () => { if (id === running) end(); });
    }
    // Todas em sequência, a partir da cena i, com uma pausa curta entre elas
    function playFrom(i) {
        const id = begin();
        const next = (k) => {
            if (id !== running) return;
            if (k >= v.scenes.length) { note('That was the last conversation.'); end(); return; }
            v.at = k;
            note(`Playing ${k + 1} of ${v.scenes.length}: ${v.scenes[k].label}`);
            playScene(v.scenes[k], () => setTimeout(() => next(k + 1), 200));
        };
        next(i);
    }
    stop.onclick = () => { running++; stopScene(); end(); note('Stopped.'); };

    const ctl = q('#dlControls');
    [['▶ Play all', () => playFrom(0)], ['⏭ Continue from the last one', () => playFrom(Math.max(0, v.at + 1))]].forEach(([label, fn]) => {
        const b = document.createElement('button');
        b.className = 'sb-opt';
        b.textContent = label;
        b.onclick = fn;
        ctl.appendChild(b);
    });
    setHero(v.hero);
}
