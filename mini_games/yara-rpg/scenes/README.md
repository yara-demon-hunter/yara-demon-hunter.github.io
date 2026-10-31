# Cenas curtas

Cenas de poucos segundos, desenhadas em código: sem imagens, vídeo ou arquivos de áudio. Abra `preview.html` para assistir.

- `engine.js`: relógio, legendas PT/EN, sinos e sons procedurais, botão de pular e tecla Esc.
- `scenes.css`: palco, legenda e botão.
- `library/`: uma cena por arquivo, com cores e roteiro no topo.
- `preview.html`: tocador. `?scene=bell-too-late&t=5` congela um instante para revisar a arte.

## Criar uma cena

Copie `library/bell-too-late.js`, troque o `id` e acrescente o script em `preview.html`.

```js
YaraScenes.register({
    id: 'minha-cena',
    title: { pt: '...', en: '...' },
    width: 320, height: 180, duration: 10,
    cues: [{ at: 2, run: (audio) => audio.bell() }],
    captions: [{ from: 1, to: 4, text: { pt: '...', en: '...' } }],
    setup({ seededRandom, scale }) { return {}; },   // prepara camadas uma vez
    draw({ ctx, scale, state, reducedMotion }, t) {}  // desenha o instante t, em segundos
});
```

O desenho depende só de `t`, então qualquer instante pode ser revisado isoladamente. `width` e `height` são coordenadas lógicas: o motor amplia o canvas até a resolução da tela (no máximo 4x). Camadas pré-desenhadas em `setup` precisam multiplicar o tamanho por `scale`.

## Usar no jogo

`bell-too-late` abre toda jornada nova, em `playOpeningScene` (`js/game.js`). Para tocar outra cena, acrescente o script dela em `partials/scripts.html` e chame:

```js
YaraScenes.play('minha-cena', { fullscreen: true, language: gameLanguage, onEnd: () => {} });
```
