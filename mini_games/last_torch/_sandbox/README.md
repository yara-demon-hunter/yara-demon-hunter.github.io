# Last Torch Sandbox

Arena de testes: escolha o herói e o boss e a luta começa na hora. Não faz parte do jogo.

```bash
python3 mini_games/last_torch/_sandbox/serve.py        # http://localhost:8800/
```

- Usa o `last_torch.html` e os módulos reais do jogo (um balanceamento novo aparece ao recarregar a página).
- A pasta começa com `_`, então o Jekyll não a publica, e `build-standalone.rb` não a copia.
- Porta diferente da do jogo = `localStorage` separado: o save da arena nunca toca o do jogo.
- Botão **🧪 Sandbox** (canto inferior esquerdo): reabre o painel para trocar de herói ou boss.
- Opções padrão: **modo deus** ligado para o herói, o boss e a tocha (vida cheia a cada quadro; dá para desligar na hora, mesmo no meio da luta) e **100 pontos de skill** para começar.
- Lista **Monsters**: clique em um ou mais monstros para pô-los na luta (quantos de cada: campo ao lado; nascem em círculo em volta do herói). Para lutar só com eles, clique de novo no boss escolhido para desmarcá-lo. O **modo deus dos monstros** também vem ligado (eles não morrem).
- **Preview: hero unlocked:** botões com cada herói mostram a tela de prêmio de personagem liberado (a mesma do jogo). A caixa "mid-run" mostra a versão do acampamento. Clique em LATER, PLAY AS ou Esc/Enter para fechar e voltar ao painel.

## Aba HUD tuner (ajustar a tela de jogo)

Segunda aba do painel (**📐 HUD tuner**). Mostra o jogo de verdade num iframe do tamanho de qualquer celular, tablet ou monitor.

- **Três perfis, três telas de referência:** *Portrait · phone 390×844*, *Landscape · phone 844×390* e *Desktop 1920×1080*. Você ajusta uma tela de cada perfil e o jogo usa os valores **proporcionalmente** em todas as outras telas (layout fluido, `js/ui/fluid_layout.js`). Para ver como ficou em outro tamanho, use **Custom size** (largura × altura) e **⟳** para girar. A caixa **touch** liga os controles de toque: o servidor entrega o jogo sob `/__touch/` (o CSS ganha `(pointer: coarse)` sempre verdadeiro) ou `/__desk/` (como no computador).
- **Cena:** barra do boss, sequência de mortes, selo de pontos de skill e o botão **▶ Play / ⏸ Pause** sobre o palco (o jogo começa pausado; a barra de espaço também alterna). O modo deus fica ligado: nada mata o herói nem a tocha.
- **Peças:** cada elemento do HUD e dos controles ganha uma alça tracejada. **Arraste** na tela, use as **setas** (1 px; Shift = 10 px) ou os campos X, Y e Tamanho (%). Também dá para esconder a peça.
- **Os ajustes** são só as propriedades `translate` e `scale` dentro do iframe: não mudam nenhum arquivo do jogo. Ficam guardados no `localStorage` do sandbox, por resolução.
- **📋 COPY ALL CHANGES** copia **só o que foi alterado**, por resolução (movimento em px, tamanho em %, e onde o jogo tem a peça hoje), mais um JSON. Cole na conversa com a IA para ela aplicar no CSS. **Copy this screen only** copia só a resolução atual; **Reset piece** e **Reset this screen** desfazem.

**Ajustes que já foram aplicados não contam duas vezes.** O tuner guarda, junto com os ajustes, uma impressão digital do CSS do jogo e da tabela do layout fluido. Se ao abrir o CSS mudou (a IA aplicou os ajustes), os ajustes antigos deixam de ser somados por cima, aparece um aviso e eles ficam numa cópia (**Restore them anyway** traz de volta, se a mudança no CSS foi outra). **Reset ALL screens** continua disponível para zerar à mão. No texto copiado, a posição "game has it at" da tela aberta é medida na hora.

Os ajustes do tuner **somam** ao layout fluido do jogo (deslocamentos se somam, tamanhos se multiplicam). Para aplicar um envio novo na tabela, veja `tools/README.md`.

## Aba Fast run (partida acelerada)

Terceira aba do painel (**⏩ Fast run**): escolha o **herói**, deixe ligada (ou desligue) a caixa **Never die (hero and torch)** e clique em **Start run**. Começa uma partida normal (sem boss isolado, sem pontos de skill extras) e uma barra sobre o jogo, no canto inferior esquerdo, troca a velocidade a qualquer momento: **×1, ×2, ×4, ×10 e ×20**.

- Acelerar = rodar a lógica do jogo (`update`) mais vezes por quadro; o desenho continua uma vez por quadro. Em ×10 e ×20 a máquina precisa dar conta de ~10 e ~20 atualizações por quadro (num PC fraco pode ficar abaixo disso).
- A barra mostra a onda, o tempo da onda em andamento (m:ss de **tempo de jogo**, não de relógio), uma linha com o tempo de cada onda terminada (`W1 3:05 · W2 3:12 … total`), as mortes e o nível, e tem a caixa **autopilot**: o herói anda perto da tocha, ataca quem chega, gasta os pontos de skill, passa as conversas sozinho. **O acampamento (relíquias, loja) fica por sua conta**: o jogo espera você escolher e sair; a caixa **auto camp** da barra faz o piloto sair dele sozinho. Desligue para jogar você mesmo (vale em qualquer velocidade). Se o herói morrer (sem Never die), a barra mostra onde parou.
- O som é suspenso fora do ×1 (viraria chiado) e volta no ×1. O **✕** esconde a barra.
- As travas do modo deus da aba Arena (monstros que não morrem, etc.) só valem numa luta da Arena; a Fast run é uma partida normal.
