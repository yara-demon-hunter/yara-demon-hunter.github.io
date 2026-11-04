# Personagem: Pinguim (Penguin)

- **id no jogo:** penguin (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`)
- **Papel:** o firme: um pouco pesado, velocidade e pulo médios. Combina com a arena de neve.

## Aparência

Regras gerais em `../README.md`: esfera, sem braços e sem pernas. Referência: `images/pinguim.webp`.

- **Silhueta / forma geral:** esfera **preta e branca** felpuda, vista em **3/4** (rosto virado para o lado em que olha).
- **Cabeça e rosto:** máscara branca que sobe em **dois lobos em volta dos olhos**, com um "V" preto entre eles, e desce até a barriga. Olhinhos pretos pequenos com um reflexo branco.
- **Bico:** **amarelo brilhante**, deitado, com a linha da boca no meio, um pouco à frente do rosto; abre nas expressões.
- **Barriga:** branca, contínua com a máscara do rosto; costas, topo e lateral de trás pretos.
- **Asas / nadadeiras:** só uma marca na lateral de trás do corpo, sem sair da esfera.
- **Cauda:** nenhuma. No lugar do rabo balançando, **o corpo todo ginga** de um lado para o outro.
- **Partes que se movem separadamente:** bico (abre e fecha); o corpo todo faz squash & stretch.
- **Detalhes que NÃO podem faltar:** contraste preto e branco, bico amarelo, barriga branca.
- **Detalhes que podem ser simplificados:** penas, brilho.
- **NÃO ter:** braços, asas soltas, mãos, pernas ou pés.

## Cores

> Tiradas da imagem.

- **Corpo (preto):** #1f2433 (preto azulado, para o sombreado aparecer), luz #3a4258, sombra #0c0e15, borda #4b5370
- **Máscara e barriga:** #ffffff, sombra #dde3ec
- **Bico:** #f2b90c, luz #ffe14a, borda #b88400
- **Olhos:** #0d0d12 com reflexo branco
- **Contorno:** sem contorno preto; só uma borda levemente mais clara para separar do fundo noturno

## Personalidade e estilo

> Ex.: calmo, elegante, meio desajeitado. Define o ritmo e as expressões.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo |
|---|---|---|---|
| parada (idle) | sem se mexer | respira, pisca, balança de um lado para o outro (gingado) | ~0,8 s |
| correr | andando no chão | esfera quica gingando | ciclo curto, segue a velocidade |
| pular | no ar | esfera estica na subida e achata na queda, bico abre | 2 poses (subindo / caindo) |
| dash | botão de dash | esfera esticada na horizontal (como se deslizasse de barriga), olhos bravos | 1 pose |
| smash | apertando baixo no ar | esfera esticada na vertical, olhos bravos | 1 pose |
| tonto | levou smash | achatado, olhos em X, estrelas girando | ~0,6 s |
| provocar | botão de provocar | pula, bico aberto rindo | ~0,4 s |
| com medo | está com a bomba | olhos arregalados, gota de suor, treme | ~0,3 s |

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
inspiration-*.png  referências de estilo (não precisam ser do pinguim)
```
