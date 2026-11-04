# Personagem: Sapo (Frog)

- **id no jogo:** frog (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`)
- **Papel:** o pulador: leve, velocidade média e o **pulo mais alto** do elenco.

## Aparência

Regras gerais em `../README.md`: esfera, sem braços e sem pernas. Referência: `images/frog.webp`.

- **Silhueta / forma geral:** esfera verde lisa e bem redonda, ligeiramente mais larga que alta, vista de frente (levemente virada). Superfície lisa e brilhante, sem pelo, com luz suave de cima à esquerda.
- **Cabeça e rosto:** olhos grandes e **saltados no alto da esfera**, um em cada lado, cada um com uma "pálpebra" de relevo em volta (um meio-anel mais claro acima do olho). Íris amarelo-dourada com pupila escura grande e dois reflexos brancos. Narinas pequenas (dois pontinhos) no meio da cara e sorriso largo e fino, só uma curva escura.
- **Manchas:** bochechas claras (dois ovais verde-claros) e algumas manchinhas claras no lado direito da esfera, na parte de cima.
- **Barriga:** sem barriga de outra cor; o corpo é um verde só, mais escuro embaixo.
- **Orelhas / cauda:** nenhuma.
- **Partes que se movem separadamente:** olhos (piscam, giram, arregalam); o corpo todo faz squash & stretch (é o que dá a graça do pulo).
- **Detalhes que NÃO podem faltar:** olhos saltados no alto com íris dourada e reflexos, sorriso fino, bochechas claras, corpo liso e redondo.
- **Detalhes que podem ser simplificados:** manchinhas do lado, relevo da pálpebra, narinas.
- **NÃO ter:** braços, mãos, pernas, pés, língua para fora (só ao provocar), cauda.

## Cores

> Aproximadas da imagem; ajustar com um conta-gotas.

- **Corpo:** #5a9a46 (verde médio), luz #7bb75c, sombra #2f6a2c
- **Contorno:** só uma borda fina verde-escura #2f6a2c (sem contorno preto)
- **Pálpebra / relevo do olho:** #8cc86d (mais claro que o corpo)
- **Íris:** #e0a91d (dourado), borda #b57f10
- **Pupila:** #1b1a10; reflexos #ffffff
- **Bochechas e manchas:** #9ed17f
- **Sorriso e narinas:** #2a3a22

## Personalidade e estilo

Calmo, simpático e meio sonso; só se agita na hora de pular. Expressões suaves, sorriso sempre discreto.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo |
|---|---|---|---|
| parada (idle) | sem se mexer | respira (esfera sobe e desce de leve), pisca, olhos olham em volta | ~1 s |
| correr | andando no chão | esfera quica em pulinhos curtos (achata ao tocar, estica ao subir) | ciclo curto, segue a velocidade |
| pular | no ar | estica na subida (olhos arregalados), achata na queda | 2 poses (subindo / caindo); é o ponto forte do sapo |
| dash | botão de dash | esfera esticada na horizontal, olhos estreitos e bravos | 1 pose |
| smash | apertando baixo no ar | esfera esticada na vertical, olhos bravos | 1 pose |
| tonto | levou smash | achatado, olhos em X, estrelas girando | ~0,6 s |
| provocar | botão de provocar | pula e mostra a língua, olhos fechados de gozação | ~0,4 s |
| com medo | está com a bomba | olhos arregalados, gota de suor, treme | ~0,3 s |

## Imagens (em `images/`)

Atual: `frog.webp` (visão principal). Nomes sugeridos para o resto:

```
front.png          visão principal
palette.png        (opcional) paleta de cores
pose-idle.png      poses-chave de cada animação
pose-run.png
pose-jump.png
pose-dash.png
pose-smash.png
pose-stun.png
pose-taunt.png
pose-scared.png
inspiration-*.png  referências de estilo (não precisam ser do sapo)
```
