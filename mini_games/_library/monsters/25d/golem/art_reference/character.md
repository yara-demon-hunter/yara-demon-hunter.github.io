# Monstro 2.5D: Golem de Brasa e Musgo

- **id do boneco:** `golem` (em `../golem25d.js`)
- **Papel:** gigante lento e resistente que bate com o punho (mesmo soco do Treant, definido no jogo)
- **Feito a partir de:** o teste 3D do laboratório, `tools/lab/monstro_foto.js` (imagens em `tools/lab/exemplos/`). Não tem desenho de cima.
- **Montado sobre:** o motor de criaturas (`creature25d.js`), como o Treant

## Versão que vale no jogo: sprites do golem 3D do laboratório

A primeira versão (bolas e membros do boneco, `golem25d.js`) ficou chapada e não lembrava o laboratório, então hoje ela é só a **reserva**
(aparece se a imagem não carregou). O que vale é `golem_atlas.webp` (~250 KB), gravado do próprio golem 3D do laboratório:
- 8 direções (linhas, de 45 em 45 graus, começando para a direita e girando para baixo) x 10 quadros (colunas): 6 de passada e 4 de soco (braços subindo com `e.swing`).
- Câmera ortográfica a 40 graus, fundo transparente, 160 px por quadro, desenhado com raio x 6. Musgo reduzido (0,28) para não cobrir tudo visto de cima.
- Para regravar (mudou o golem do laboratório): `python3 -m http.server 18900` em `mini_games` e `python3 tools/lab/bake_golem.py 160` (Playwright + Chrome; ajuste o caminho de saída no topo do script). Ele abre `monstro_foto.html?bake=1` e chama `window.__bake`.
- No jogo: `golem25d.js` escolhe a linha pelo ângulo do monstro e a coluna pela distância andada; na morte, o corpo que tomba usa o mesmo sprite (`golemStill`).

## Como foi criada a versão de reserva

Criado em 2026-11-17. O golem do laboratório usa textura PBR, AO, bloom e névoa em WebGL: pesado demais para o jogo (Canvas 2D, sprites num atlas).
Aqui o mesmo monstro foi refeito só com bolas e membros do boneco, imitando em 2D o que mais mudava a cara dele:

| No laboratório | No jogo 2.5D |
|---|---|
| Pedra com textura PBR | cada pedra é 4 bolas: contorno, corpo, luz em cima/frente e sombra embaixo (dá volume) |
| Musgo por inclinação (triplanar) | capuz de musgo só no alto das peças (ombros, joelhos, pés, punhos, cabeça) |
| Lava nas rachaduras (emissivo) | linhas laranja com miolo claro, só do lado virado para a câmera |
| Núcleo e olhos brilhando (bloom) | um `glowAt` no núcleo e um em cada olho |
| Chifres, ombros largos, braços abertos | mesmos: chifres de pedra, ombreiras, punhos enormes |

## Morte

Desmorona: tomba pouco, afunda e se desfaz em pedras grandes voando (forma `rock`), lascas de lava e poeira (`death.js`).

## Uso e ajuste

No jogo: `MONSTERS_25D.golem.render(e)`; `e.swing` ergue os braços no soco. Ajuste ao vivo: `tools/tuner.html?model=golem`; medidas em `../golem25d_visual.js`.
