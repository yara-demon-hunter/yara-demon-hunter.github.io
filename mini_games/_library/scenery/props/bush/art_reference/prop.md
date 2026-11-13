# Peça: Arbusto

- **id:** `bush` (`registerProp` em `../bush.js`; valores padrão em `../bush_visual.js`)
- **Tipo:** estática
- **Papel:** enfeite do chão: um arbusto de folhagem escura, visto de cima. Não esconde nem bloqueia nada.
- **Feito a partir de:** o antigo poder Ambush Bush do Last Torch (2026-11-13), que saiu da árvore de skills; sobrou só o visual, agora como peça de cenário.

## Como é desenhada

sombra no chão, depois três passadas de tufos redondos (escuro, meio, claro; cada uma menor e um pouco mais alta) e seis pontinhos de luz nas folhas.

## O que a paleta controla

`shadow`, `dark`, `mid`, `light`, `spark`, `radius` (faixa de tamanho) e `blobs` (quantos tufos). A receita de um cenário pode trocar qualquer um (`palette`).

## Custo

pintado uma vez; zero por quadro.

## Decisões

- O poder (esconder o herói e dar golpe forte) foi removido do jogo; o arbusto ficou só como cenário.
- Verdes mais frios e escuros para combinar com a Floresta da Névoa.

## Ajuste

`tools/prop_tuner.html?prop=bush`. Grave com **Copiar alterados**, cole em `bush_visual.js` e rode `ruby mini_games/_library/sync.rb`.
