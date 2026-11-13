import { state } from '../core/state.js';
import { whenHunting } from './dialogue.js';

// --- ANÚNCIO DA FÚRIA ---
// Quando a barra enche, a caçada congela um instante e aparece a MESMA faixa escura das ondas (css/components/banner.css)
// com a foto do herói e o nome do especial. A faixa some e SÓ ENTÃO o golpe sai, com a tela livre para o jogador ver o que
// acontece. É DOM com animação de CSS (css/components/cutin.css): nada no canvas.
const FREEZE_SECONDS = 0.85;        // a pausa e a duração da faixa (a animação do CSS tem o mesmo tempo)
const HUNTER_IMAGE = 'images/characters/demon-hunter-small.webp';
let box = null;

function build() {
    box = document.createElement('div');
    box.id = 'furyCutIn';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<img alt="" draggable="false"><div class="cutin-text"><span></span><b></b></div>';
    document.body.appendChild(box);
}

// hero: entrada de HEROES (nome, retrato); name: nome da Fúria; color: cor do nome; then: o golpe, chamado quando a faixa some
export function showFuryCutIn(hero, name, color, then) {
    if (!box) build();
    const img = box.querySelector('img');
    img.src = hero.portraitImage ?? HUNTER_IMAGE;
    img.style.filter = hero.portraitImage ? '' : (hero.portrait ?? '');
    box.querySelector('span').textContent = hero.name;
    box.querySelector('b').textContent = name;
    box.style.setProperty('--tone', color);
    box.classList.remove('is-showing');
    void box.offsetWidth;              // recomeça a animação
    box.classList.add('is-showing');
    state.hitStop = Math.max(state.hitStop, FREEZE_SECONDS);
    setTimeout(() => {
        box.classList.remove('is-showing');
        // Se o jogador pausou ou a partida acabou nesse meio tempo, o golpe espera a caçada voltar (ou desiste)
        whenHunting(then);
    }, FREEZE_SECONDS * 1000);
}
