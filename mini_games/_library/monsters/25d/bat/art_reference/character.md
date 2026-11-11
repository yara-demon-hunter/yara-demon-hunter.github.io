# Monstro 2.5D: Morcego

- **id do boneco:** `bat` (em `../bat25d.js`)
- **Papel:** voador pequeno e rápido, em zigue-zague
- **Feito a partir de:** o desenho de cima do Last Torch, `monsters/topdown/bat/`. Não havia imagem de referência: a forma veio do código do desenho de cima
- **Montado sobre:** criatura (`../creature25d.js`): voa, sem pernas
- **Resultado:** `images/bat_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco do yara-rpg embaixo)

## Como foi criado

Criado em 2026-11-11, quando todos os monstros do desenho de cima ganharam versão 2.5D. Cada peça do desenho antigo
foi refeita em 3D simples, para servir em qualquer câmera:

| Peça (do desenho de cima) | Como ficou em 2.5D |
|---|---|
| Corpo pequeno e peludo | duas bolas (a de trás mais escura) a `flyHeight` do chão |
| Asas de membrana que batem rápido | polígonos 3D: borda de trás recortada em "dentes", ossos escuros; sobem e descem (`flapAngle`) e o corpo sobe quando elas descem (`bob`) |
| Orelhas pontudas, rosa por dentro | dois triângulos em pé sobre a cabeça |
| Olhos vermelhos e presinhas | brilho vermelho e duas presas, só quando o rosto está virado para a câmera |
| Zigue-zague de voo | o corpo balança de lado (`wobble`) |

## Cores

As mesmas do desenho de cima: `bat25d_visual.js` lê `topdown/bat/bat_visual.js`. Mudar uma cor lá muda os dois.

## Decisões

- A sombra fica no chão e o corpo voa acima dela: de lado (palco do RPG) dá para ver a altura do voo.
- O Last Torch continua usando o desenho de cima (decisão do usuário); este é para o yara-rpg e jogos futuros.

## Uso e ajuste

No jogo: `renderBat25D(e)`. Ajuste ao vivo: `tools/tuner.html?model=bat`; medidas em `../bat25d_visual.js`.
