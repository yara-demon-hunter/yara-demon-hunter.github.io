# Personagem: Raposa (Fox)

- **id no jogo:** fox (`ROSTER` em `data_model/characters.js`; arte em `data_model/visuals/characters.js`)
- **Papel:** o equilibrado: massa, velocidade e pulo médios. É o P1 padrão.

## Aparência

> Preencher junto com as imagens. Regras gerais em `../README.md`: esfera, sem braços e sem pernas.

- **Silhueta / forma geral:** esfera de pelo laranja, redonda e fofa, vista de frente (referência: `images/fox_1.webp`).
- **Cabeça e rosto:** olhos grandes, escuros e brilhantes (dois reflexos brancos), narizinho escuro, sorriso pequeno em "w". Bochechas e peito cremes.
- **Orelhas:** pontudas, coladas no topo da esfera, com o interior mais claro.
- **Cauda:** grossa e peluda, de ponta clara, saindo de trás da esfera (balancando)
- **Barriga / marcas:** barriga creme na frente; (descrever outras marcas).
- **Partes que se movem separadamente:** orelhas, cauda (o corpo todo faz squash & stretch).
- **Detalhes que NÃO podem faltar:** ponta creme da cauda, faixas na cauda, orelhas pontudas com interior creme, olhos grandes com brilho
- **Detalhes que podem ser simplificados:** (ex.: pelos, bigodes)
- **NÃO ter:** braços, mãos, pernas ou pés.

## Cores

> Valores atuais do código; troque pelos da sua arte.

- **Corpo:** #f26a1b
- **Barriga:** #fff3dc
- **Interior da orelha:** #fff0dc
- **Bochecha:** (sem bochecha rosa; bochechas cremes #fff3dc)
- **Ponta da cauda:** #fff6e4
- **Sem contorno escuro:** só uma borda levemente mais escura que o corpo; pelo felpudo

## Personalidade e estilo

> Ex.: esperta, atrevida, animada. Define o ritmo e as expressões.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo |
|---|---|---|---|
| parada (idle) | sem se mexer | respira (sobe e desce), pisca, **cauda balança de um lado para o outro** | ~0,8 s |
| correr | andando no chão | esfera quica, orelhas para trás, cauda estica | ciclo curto, segue a velocidade |
| pular | no ar | esfera estica na subida e achata na queda, orelhas | 2 poses (subindo / caindo) |
| dash | botão de dash | esfera esticada na horizontal, olhos bravos, cauda reta | 1 pose |
| smash | apertando baixo no ar | esfera esticada na vertical, olhos bravos | 1 pose |
| tonta | levou smash | achatada, olhos em X, estrelas girando | ~0,6 s |
| provocar | botão de provocar | pula, língua de fora, cauda balançando | ~0,4 s |
| com medo | está com a bomba | olhos arregalados, gota de suor, treme | ~0,3 s |

## Imagens (em `images/`)

Nomes sugeridos:

```
front.png          visão principal (lateral, olhando para a direita)
palette.png        (opcional) paleta de cores
pose-idle.png      poses-chave de cada animação
pose-run.png
pose-jump.png
pose-dash.png
pose-smash.png
pose-stun.png
pose-taunt.png
pose-scared.png
inspiration-*.png  referências de estilo (não precisam ser da raposa)
```
