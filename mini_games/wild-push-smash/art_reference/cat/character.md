# Personagem: Gato (Cat)

- **id no jogo:** cat (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`)
- **Papel:** o ágil: leve, rápido e com pulo bom. É o P2 padrão.

## Aparência

Regras gerais em `../README.md`: esfera, sem braços e sem pernas. Referência: `images/cat.jpeg`.

- **Silhueta / forma geral:** esfera **preta**, redonda e fofa, vista de frente (levemente virada para o lado em que olha).
- **Cabeça e rosto:** olhos grandes com íris amarelo-dourada, pupila preta grande e reflexos brancos. Focinho branco pequeno, nariz rosa e boquinha em "w". **Bigodes brancos longos que descem e enrolam na ponta**, de cada lado.
- **Orelhas:** pontudas, no topo da esfera, pretas, com o interior preto mais claro.
- **Barriga:** **branca**, na frente da esfera, uma mancha redonda grande na metade de baixo.
- **Cauda:** longa e fina, preta, saindo de trás da esfera, curvada para cima e **balançando**. Ponta branca e fofa.
- **Partes que se movem separadamente:** orelhas, cauda (o corpo todo faz squash & stretch).
- **Detalhes que NÃO podem faltar:** corpo preto, barriga branca, cauda balançando, olhos que se destacam no preto.
- **Detalhes que podem ser simplificados:** pelos, bigodes.
- **NÃO ter:** braços, mãos, pernas ou pés.

## Cores

> Tiradas da imagem; o preto é azulado para o sombreado aparecer.

- **Corpo:** #1f2230 (preto azulado, para o sombreado aparecer), luz #3a3f55, sombra #0e0f16
- **Barriga:** #ffffff, sombra #e3e6ef
- **Interior da orelha:** #2c2f3e
- **Olhos:** íris #e6c82e, pupila #0b0b10, reflexos brancos
- **Bigodes e ponta da cauda:** #ffffff
- **Nariz:** #ff8fab
- **Contorno:** sem contorno preto (o corpo já é escuro); só uma borda levemente mais clara para separar do fundo noturno

## Personalidade e estilo

> Ex.: esperto, elegante, meio convencido. Define o ritmo e as expressões.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo |
|---|---|---|---|
| parada (idle) | sem se mexer | respira, pisca, cauda balança devagar | ~0,8 s |
| correr | andando no chão | esfera quica, orelhas para trás, cauda estica | ciclo curto, segue a velocidade |
| pular | no ar | esfera estica na subida e achata na queda | 2 poses (subindo / caindo) |
| dash | botão de dash | esfera esticada na horizontal, olhos bravos, cauda reta | 1 pose |
| smash | apertando baixo no ar | esfera esticada na vertical, olhos bravos | 1 pose |
| tonto | levou smash | achatado, olhos em X, estrelas girando | ~0,6 s |
| provocar | botão de provocar | pula, língua de fora, cauda balançando forte | ~0,4 s |
| com medo | está com a bomba | olhos arregalados, gota de suor, pelo arrepiado | ~0,3 s |

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
inspiration-*.png  referências de estilo (não precisam ser do gato)
```
