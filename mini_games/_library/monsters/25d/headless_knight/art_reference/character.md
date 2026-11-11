# Monstro 2.5D: Cavaleiro Sem Cabeça

- **id do boneco:** `headless_knight` (em `../headless_knight25d.js`)
- **Papel:** cavaleiro pesado; o elmo flutuante vigia e é dele que sai o tiro
- **Feito a partir de:** o desenho de cima do Last Torch, `monsters/topdown/headless_knight/`, e as referências originais `images/headless_knight_idle.png`
- **Montado sobre:** boneco de gente (`characters/hunter/hero25d.js`) com peças próprias
- **Resultado:** `images/headless_knight_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco do yara-rpg embaixo)

## Como foi criado

Criado em 2026-11-11, quando todos os monstros do desenho de cima ganharam versão 2.5D. Cada peça do desenho antigo
foi refeita em 3D simples, para servir em qualquer câmera:

| Peça (do desenho de cima) | Como ficou em 2.5D |
|---|---|
| Armadura de aço gasta | peitoral com crista central, cinto com fivela dourada, manchas de ferrugem; grevas com joelheiras e botas |
| Ombreiras enormes com espinhos | cúpula em camadas em cada ombro, com dois espinhos; manoplas |
| Gorjal oco com a chama azul | anel escuro no pescoço e três línguas de chama subindo onde estaria a cabeça |
| Capa roxa rasgada | a capa padrão do boneco, presa por cima das ombreiras; de costas cobre o tronco |
| Montante arrastando no chão | em repouso a lâmina arrasta atrás, do lado direito, soltando faíscas ao andar; no golpe volta à varredura normal |
| Elmo flutuando ao lado | do lado esquerdo: cúpula com crista, fenda dos olhos em brasa, pluma rasgada e fiapos de chama embaixo |

## Cores

As mesmas do desenho de cima: `headless_knight25d_visual.js` lê `topdown/headless_knight/headless_knight_visual.js`. Mudar uma cor lá muda os dois.

## Decisões

- A imagem de referência mostra o elmo na mão; aqui ele flutua ao lado, como no desenho de cima (é dele que sai o tiro).
- O Last Torch continua usando o desenho de cima (decisão do usuário); este é para o yara-rpg e jogos futuros.

## Uso e ajuste

No jogo: `renderHeadlessKnight25D(e)`. Ajuste ao vivo: `tools/tuner.html?model=headless_knight`; medidas em `../headless_knight25d_visual.js`.
