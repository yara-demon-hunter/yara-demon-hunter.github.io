# Personagem: Corvo (Crow)

- **id no jogo:** crow (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`, desenho em `js/render/character_crow.js`)
- **Papel:** o planador: leve, velocidade e pulo médios. **Especial:** segurando ▲ no ar (já caindo), abre as asas e desce flutuando devagar, com mais controle para os lados. Os números ficam em `glide` no `ROSTER` (`fallSpeed`, `brake`, `airControl`).

## Aparência

> Preencher junto com as imagens. Regras gerais em `../README.md`: esfera, sem braços e sem pernas.

- **Silhueta / forma geral:** esfera de penas pretas com brilho azulado, vista de frente (levemente virada para o lado em que olha).
- **Cabeça e rosto:** olhos grandes, brancos, com pupila preta e brilho. Bico cinza curto e grosso, com a pontinha curvada, apontando para o lado em que olha.
- **Topete:** três peninhas no alto da cabeça, balançando.
- **Asas:** **única exceção à regra "sem membros"**: fechadas ficam quase escondidas atrás da esfera; abrem um pouco no pulo e inteiras ao planar (batendo devagar).
- **Cauda:** leque de três penas para trás.
- **Barriga / marcas:** peito um pouco mais claro, com escamas de pena bem suaves.
- **Partes que se movem separadamente:** asas, topete, cauda (o corpo todo faz squash & stretch).
- **Detalhes que NÃO podem faltar:** asas abertas ao planar, bico cinza, olhos grandes brancos (o corpo é escuro e o rosto precisa aparecer na arena de noite).
- **Detalhes que podem ser simplificados:** (ex.: penas do peito, narina)
- **NÃO ter:** braços, mãos, pernas ou pés (nem patinhas de pássaro).

## Cores

> Valores atuais do código; troque pelos da sua arte.

- **Corpo:** #262a3d, luz #4b5378, sombra #0d0f18
- **Brilho das penas:** #5a6390
- **Asas e cauda:** #1b1e2c, luz #3b4262
- **Peito:** #33384f
- **Bico:** #5c606c, luz #9a9eab, borda #2e3038
- **Olhos:** branco com pupila #0b0b10
- **Contorno:** sem contorno preto; só uma borda levemente mais escura que o corpo

## Personalidade e estilo

> Ex.: esperto, curioso, debochado. Define o ritmo e as expressões.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo |
|---|---|---|---|
| parada (idle) | sem se mexer | respira, pisca, topete e cauda balançam | ~0,8 s |
| correr | andando no chão | esfera quica, topete para trás, cauda balança | ciclo curto, segue a velocidade |
| pular | no ar | esfera estica na subida e achata na queda, asas entreabertas | 2 poses (subindo / caindo) |
| **planar** | **segurando ▲ no ar, caindo** | **asas bem abertas batendo devagar, cauda abre** | **2 poses (asa em cima / embaixo), ~0,25 s cada** |
| dash | botão de dash | esfera esticada na horizontal, olhos bravos | 1 pose |
| smash | apertando baixo no ar | esfera esticada na vertical, olhos bravos, asas para cima | 1 pose |
| tonto | levou smash | achatado, olhos em X, estrelas girando | ~0,6 s |
| provocar | botão de provocar | pula, bico aberto, asas batendo | ~0,4 s |
| com medo | está com a bomba | olhos arregalados, gota de suor, treme | ~0,3 s |

## Imagens (em `images/`)

Nomes sugeridos:

```
front.png          visão principal (de frente)
palette.png        (opcional) paleta de cores
pose-idle.png      poses-chave de cada animação
pose-run.png
pose-jump.png
pose-glide.png     asas abertas (a pose mais importante do corvo)
pose-dash.png
pose-smash.png
pose-stun.png
pose-taunt.png
pose-scared.png
inspiration-*.png  referências de estilo (não precisam ser do corvo)
```
