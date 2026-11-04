# Personagem: Elefante (Elephant)

- **id no jogo:** elephant (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`)
- **Papel:** o mais pesado do elenco: empurra muito e quase não voa quando apanha, mas é o mais lento e pula baixo.

## Aparência

Regras gerais em `../README.md`: esfera, sem braços e sem pernas. Referência: `images/elephant.jpeg`.

- **Silhueta / forma geral:** esfera cinza **lisa** e grande, vista de frente (levemente virada para o lado em que olha). É o **maior bicho do jogo** (massa 1,85).
- **Cabeça e rosto:** olhinhos pequenos (branco com pupila preta e brilho). **Sem boca aparecendo**: a tromba e as presas fazem o rosto.
- **Orelhas:** **enormes**, iguais e espelhadas (mesmo tamanho e formato), atrás dos dois lados da esfera, da mesma cor (interior um pouco mais escuro); abanam.
- **Tromba:** grossa, desce do meio do rosto **entre as duas presas** e a ponta **enrola para trás e para cima**, com rugas; balança. Nunca fica por cima de uma presa.
- **Presas:** **curtinhas**, brancas e curvas, **uma de cada lado da base da tromba**, espelhadas; a tromba fica no meio e nunca passa por cima delas.
- **Cauda:** fininha com **tufo na ponta**, jogada para trás, balançando.
- **Partes que se movem separadamente:** orelhas, tromba (o corpo todo faz squash & stretch, devagar e pesado).
- **Detalhes que NÃO podem faltar:** orelhas enormes, tromba enrolada, presas brancas, tamanho grande.
- **Detalhes que podem ser simplificados:** rugas, unhas.
- **NÃO ter:** braços, mãos, pernas ou pés.

## Cores

> Tiradas da imagem.

- **Corpo:** #9a9ca3 (cinza liso), luz #c2c4ca, sombra #6c6e76
- **Interior da orelha:** #8c8e96
- **Tromba:** #a3a5ac
- **Presas:** **curtinhas**, brancas e curvas, **uma de cada lado da base da tromba**, espelhadas; a tromba fica no meio e nunca passa por cima delas.
- **Olhos:** branco com pupila #111116
- **Contorno:** sem contorno preto; só uma borda levemente mais escura que o corpo

## Personalidade e estilo

> Ex.: gentil, lento, bonachão. Define o ritmo e as expressões.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo |
|---|---|---|---|
| parada (idle) | sem se mexer | respira devagar, pisca, orelhas abanam, tromba balança | ~1 s |
| correr | andando no chão | esfera quica pesada, orelhas batem, tromba balança | ciclo lento, segue a velocidade |
| pular | no ar | esfera estica pouco na subida e achata bastante na queda | 2 poses (subindo / caindo) |
| dash | botão de dash | esfera esticada na horizontal, olhos bravos, tromba para trás | 1 pose |
| smash | apertando baixo no ar | esfera esticada na vertical, olhos bravos | 1 pose |
| tonto | levou smash | achatado, olhos em X, estrelas girando | ~0,6 s |
| provocar | botão de provocar | pula, olhos fechados de gozação, orelhas abertas | ~0,4 s |
| com medo | está com a bomba | olhos arregalados, gota de suor, orelhas encolhidas | ~0,3 s |

## Imagens (em `images/`)

Nomes sugeridos:

```
front.png          visão principal (de frente)
palette.png        (opcional) paleta de cores
pose-idle.png      poses-chave de cada animação
pose-run.png
pose-jump.png
pose-dash.png
pose-smash.png
pose-stun.png
pose-taunt.png
pose-scared.png
inspiration-*.png  referências de estilo (não precisam ser do elefante)
```
