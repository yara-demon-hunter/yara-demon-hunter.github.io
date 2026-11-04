// --- DADOS VISUAIS: lutadores ---
// A arte é procedural (js/render/character_art.js) e roda uma vez por quadro de animação para um atlas
// (js/render/character_sprites.js). Em campo, cada lutador custa 1 drawImage.
// Unidades do desenho: 1 = raio do corpo, olhando para a direita. Nada aqui muda a física.
//
// style: 'fluffy' = esfera de pelo sem membros (js/render/character_fluffy.js); 'frog' = esfera lisa (character_frog.js); 'cat' = gato preto (character_cat.js); 'dog' = cachorro (character_dog.js); 'mouse' = rato (character_mouse.js); sem style = desenho com contorno
// ears:  pointy | round | floppy | mouse | elephant | bunny | pig | none
// tail:  bushy | thin | mouse | stub | curly | cotton | none
// snout: muzzle (cachorro) | pig | trunk | beak | null
// arms:  paw | flipper
export const CHARACTER_ART = {
    fox: {   // segue art_reference/fox: esfera de pelo, rosto de frente, sem braços, pernas nem contorno
        style: 'fluffy',
        body: '#f26a1b', bodyLight: '#ff9a3d', bodyDark: '#c8480f', stripe: '#d9531a',
        cream: '#fff3dc', creamShade: '#f0d9b5', earInner: '#fff0dc', tailTip: '#fff6e4',
        eyeColor: '#2a1613', nose: '#3b211c', liveEyes: false
    },
    cat: {   // segue art_reference/cat: gato preto felpudo, barriga e focinho brancos, bigodes enrolados
        style: 'cat',
        body: '#1f2230', bodyLight: '#3a3f55', bodyDark: '#0e0f16', rim: '#4b5170',
        white: '#ffffff', whiteShade: '#dfe3ee', earInner: '#2c2f3e',
        iris: '#e6c82e', pupil: '#0b0b10', nose: '#ff8fab', mouth: '#0b0b10',
        liveEyes: false
    },
    dog: {   // segue art_reference/dog/images/dog_new.jpeg: caramelo de pelo curtinho, em 3/4, focinho creme, nariz vermelho grande
        style: 'dog',
        body: '#c48a5c', bodyLight: '#dcab80', bodyDark: '#94643f', earInner: '#a87048',
        cream: '#f0d2ac', creamShade: '#d9ae84', iris: '#5a3018',
        nose: '#b3121f', noseLight: '#e0404a', noseDark: '#5e0a11', mouth: '#4a2a1c',
        liveEyes: false
    },
    mouse: { // art_reference/mouse em versão fofa: cinza liso (sem pelo), orelha interna e barriga rosa, cauda rosa pelada
        style: 'mouse',
        body: '#8f8f94', bodyLight: '#b9b9be', bodyDark: '#66666c', pink: '#f2a3ab', earInner: '#ec949d',
        tail: '#f0a4ad', tailDark: '#c97680', nose: '#d02a33', eye: '#2a1a14', whisker: '#ffffff', mouth: '#3a2226',
        liveEyes: false
    },
    elephant: {
        body: '#9aa3b5', belly: '#c9d0dd', earInner: '#e8b4c6', cheek: '#e8b4c6',
        ears: 'elephant', tail: 'thin', tailTip: '#5c6577', snout: 'trunk', tusks: true, arms: 'paw'
    },
    bunny: {
        body: '#f3eefc', belly: '#ffffff', earInner: '#ffb3cf', cheek: '#ffb3cf',
        ears: 'bunny', tail: 'cotton', tailTip: '#ffffff', nose: '#ff7fa0', snout: null, teeth: true, arms: 'paw'
    },
    pig: {
        body: '#ff9fbf', belly: '#ffd3e2', earInner: '#ff7aa6', cheek: '#ff7aa6',
        ears: 'pig', tail: 'curly', snout: 'pig', snoutColor: '#ff7aa6', arms: 'paw'
    },
    penguin: {
        body: '#2c3550', belly: '#ffffff', bellyBig: true, cheek: '#ff9fb8',
        ears: 'none', tail: 'stub', snout: 'beak', beak: '#ffa94d', feet: '#ffa94d', arms: 'flipper'
    },
    frog: {  // segue art_reference/frog: esfera lisa, olhos dourados saltados, sem membros nem contorno preto
        style: 'frog',
        body: '#5a9a46', bodyLight: '#7bb75c', bodyDark: '#2f6a2c', lid: '#8cc86d', spots: '#9ed17f',
        iris: '#e0a91d', irisLight: '#ffd75e', irisEdge: '#b57f10', pupil: '#1b1a10', mouth: '#2a3a22',
        liveEyes: false
    }
};

export const CHARACTER_STYLE = {
    outline: 'rgba(8, 10, 20, 0.85)',
    outlineWidth: 0.1,
    eyeWhite: '#ffffff',
    pupil: '#101423',
    nose: '#2b1220',
    mouth: '#2b1220',
    tongue: '#ff6b81',
    star: '#ffd32a',
    sweat: '#9fdcff',
    eye: { x: [0.1, 0.6], y: -0.22, rx: 0.23, ry: 0.28 },
    pupilRadius: 0.11,
    pupilReach: 0.09,           // quanto a pupila acompanha a velocidade
    ghostAlpha: 0.4,            // rastro do dash
    marker: { size: 6, gap: 12 }    // setinha com a cor do jogador acima da cabeça
};
