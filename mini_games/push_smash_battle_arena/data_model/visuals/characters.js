// --- DADOS VISUAIS: lutadores ---
// A arte é procedural (js/render/character_art.js) e roda uma vez por quadro de animação para um atlas
// (js/render/character_sprites.js). Em campo, cada lutador custa 1 drawImage.
// Unidades do desenho: 1 = raio do corpo, olhando para a direita. Nada aqui muda a física.
//
// style: 'fluffy' = esfera de pelo sem membros (js/render/character_fluffy.js); 'frog' = esfera lisa (character_frog.js); 'cat' = gato preto (character_cat.js); 'dog' = cachorro (character_dog.js); 'mouse' = rato (character_mouse.js); 'penguin' = pinguim (character_penguin.js); 'elephant' = elefante (character_elephant.js); 'bunny' = coelho (character_bunny.js); 'pig' = porco (character_pig.js); sem style = desenho com contorno
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
    dog: {   // BEAGLE, segue art_reference/dog/images/dog_beagle.webp: marrom, faixa e focinho brancos, mancha preta nas costas
        style: 'dog',
        body: '#c9843f', bodyLight: '#e3a560', bodyDark: '#8f5a26',
        patch: '#1d1816', cream: '#fbf7f0', creamShade: '#e6ddd0',
        ear: '#9a6532', earDark: '#6b4220', earLight: '#c28a54', earInner: '#9a6532',
        iris: '#141010',
        nose: '#3a2a2b', noseLight: '#6e5658', noseDark: '#140c0c', mouth: '#4a2a1c', tongueLine: '#d9566e', blush: '#ff9aa2',
        liveEyes: false
    },
    mouse: { // art_reference/mouse em versão fofa: cinza liso (sem pelo), orelha interna e barriga rosa, cauda rosa pelada
        style: 'mouse',
        body: '#8f8f94', bodyLight: '#b9b9be', bodyDark: '#66666c', pink: '#f2a3ab', earInner: '#ec949d',
        tail: '#f0a4ad', tailDark: '#c97680', nose: '#d02a33', eye: '#2a1a14', whisker: '#ffffff', mouth: '#3a2226',
        liveEyes: false
    },
    elephant: { // segue art_reference/elephant: cinza liso, orelhas enormes, tromba enrolada, presas brancas
        style: 'elephant',
        body: '#9a9ca3', bodyLight: '#c2c4ca', bodyDark: '#6c6e76', earInner: '#8c8e96', trunk: '#a3a5ac',
        tusk: '#fbfbf7', tuskShade: '#c9c9c0', eye: '#111116',
        liveEyes: false
    },
    bunny: { // segue art_reference/bunny: cinza liso, orelhas compridas rosa por dentro, nariz de coração, pompom branco
        style: 'bunny',
        body: '#a3a3a8', bodyLight: '#cacace', bodyDark: '#77777e', pink: '#f6a9b4', pinkDark: '#e4808f',
        white: '#f7f7f8', whiteShade: '#d5d5da', blush: '#ff9aa8', nose: '#ff8fa3',
        iris: '#5b5b60', eye: '#1a1a1e', mouth: '#3a3a40',
        liveEyes: false
    },
    pig: {   // segue art_reference/pig: rosa liso, orelhas triangulares, focinho grande com narinas, rabinho enrolado
        style: 'pig',
        body: '#f6b6bd', bodyLight: '#ffd6da', bodyDark: '#d68991', earInner: '#ea8c97', blush: '#f2848f',
        snout: '#c94a5c', snoutLight: '#e2717f', snoutDark: '#8f2a3a', eye: '#1c1012', mouth: '#6a2030',
        liveEyes: false
    },
    penguin: { // segue art_reference/penguin: preto felpudo em 3/4, máscara branca, bico amarelo, sem asas soltas
        style: 'penguin',
        body: '#1f2433', bodyLight: '#3a4258', bodyDark: '#0c0e15', rim: '#4b5370',
        white: '#ffffff', whiteShade: '#dde3ec', eye: '#0d0d12',
        beak: '#f2b90c', beakLight: '#ffe14a', beakDark: '#b88400', mouth: '#5a1e10',
        liveEyes: false
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
