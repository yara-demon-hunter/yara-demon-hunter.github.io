# Personagem: Coelho (Bunny / Rabbit)

- **id no jogo:** bunny (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`)
- **Papel:** o saltitante: leve, rápido e com pulo alto (só perde para o sapo).

## Aparência

Regras gerais em `../README.md`: esfera, sem braços e sem pernas. Referência: `images/bunny.webp`.

- **Silhueta / forma geral:** esfera **cinza lisa**, redonda, vista de frente (levemente virada para o lado em que olha).
- **Cabeça e rosto:** olhos brancos com íris cinza-escura e brilho, sobrancelhas finas, **nariz de coração rosa**, focinho branco e sorriso em "w". **Bochechas rosadas grandes.**
- **Orelhas:** **compridas**, em pé, cinza por fora e **rosa por dentro**, com tufinhos rosa na base; balançam e deitam para trás ao correr.
- **Barriga / marcas:** nenhuma; só o focinho branco e as bochechas rosadas.
- **Cauda:** **pompom branco** e fofo, jogado para trás.
- **Partes que se movem separadamente:** orelhas, cauda (o corpo todo faz squash & stretch, bem elástico).
- **Detalhes que NÃO podem faltar:** orelhas compridas rosa por dentro, nariz de coração, bochechas rosadas, pompom branco.
- **Detalhes que podem ser simplificados:** pelos, bigodes.
- **NÃO ter:** braços, mãos, pernas ou pés.

## Cores

> Tiradas da imagem.

- **Corpo:** #a3a3a8 (cinza liso), luz #cacace, sombra #77777e
- **Interior da orelha:** #f6a9b4, tufinhos #e4808f
- **Bochechas:** #ff9aa8
- **Focinho e pompom:** #f7f7f8
- **Nariz:** #ff8fa3
- **Olhos:** branco, íris #5b5b60, pupila #1a1a1e
- **Contorno:** sem contorno preto; só uma borda levemente mais escura que o corpo (o corpo é claro, então a borda ajuda a separar do fundo)

## Personalidade e estilo

> Ex.: agitado, alegre, saltitante. Define o ritmo e as expressões.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo |
|---|---|---|---|
| parada (idle) | sem se mexer | respira, pisca, nariz mexe, orelhas balançam | ~0,8 s |
| correr | andando no chão | esfera saltita, orelhas dobram para trás | ciclo curto, segue a velocidade |
| pular | no ar | esfera estica bastante na subida e achata na queda, orelhas sobem | 2 poses (subindo / caindo) |
| dash | botão de dash | esfera esticada na horizontal, olhos bravos, orelhas deitadas para trás | 1 pose |
| smash | apertando baixo no ar | esfera esticada na vertical, olhos bravos, orelhas para cima | 1 pose |
| tonto | levou smash | achatado, olhos em X, estrelas girando, orelhas caídas | ~0,6 s |
| provocar | botão de provocar | pula, língua de fora, orelhas balançando | ~0,4 s |
| com medo | está com a bomba | olhos arregalados, gota de suor, orelhas caídas, treme | ~0,3 s |

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
inspiration-*.png  referências de estilo (não precisam ser do coelho)
```
