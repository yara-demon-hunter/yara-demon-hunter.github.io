# Last Torch Sandbox

Arena de testes: escolha o herói e o boss e a luta começa na hora. Não faz parte do jogo.

```bash
python3 mini_games/last_torch/_sandbox/serve.py        # http://localhost:8800/
```

- Usa o `last_torch.html` e os módulos reais do jogo (um balanceamento novo aparece ao recarregar a página).
- A pasta começa com `_`, então o Jekyll não a publica, e `build-standalone.rb` não a copia.
- Porta diferente da do jogo = `localStorage` separado: o save da arena nunca toca o do jogo.
- Lista **Screen format (all tabs)** (topo do painel): **Desktop** (padrão, janela inteira), **Phone · landscape 844×390** e **Phone · portrait 390×844**. Vale para o sandbox INTEIRO (Arena, Fast run, Screens, Boss moves): nos formatos de celular a página vira uma moldura com o sandbox completo dentro de um iframe do tamanho do aparelho (com toque ligado), então o mundo, o HUD e o layout são os do celular. A escolha fica num cookie (`sbx_format`); a moldura tem a mesma lista para voltar ao Desktop. A aba HUD tuner continua com seus próprios tamanhos.
- Botão **🧪 Sandbox** (canto inferior esquerdo): reabre o painel para trocar de herói ou boss.
- Caixa **Show contact areas**: desenha as áreas do cenário (as do editor de cenários): vermelho = contato (ninguém passa), azul = área de trás, verde = onde os monstros nascem e roxo = onde o chefe nasce.
- Lista **Scenery** (aba Arena, no topo): todos os cenários da biblioteca; clicar troca na hora, até no meio da luta, e vale também para a aba Fast run. O sandbox lembra a última escolha (o jogo real continua lendo só `WORLD.scenery`; a troca usa `setScenery()` em `js/render/scenery.js`, que o jogo não chama). Cenário novo: rode `ruby mini_games/_library/sync.rb` para ele aparecer aqui.
- Opções padrão: **modo deus** ligado para o herói, o boss e a tocha (vida cheia a cada quadro; dá para desligar na hora, mesmo no meio da luta) e **100 pontos de skill** para começar.
- Lista **Monsters**: clique em um ou mais monstros para pô-los na luta (quantos de cada: campo ao lado; nascem em círculo em volta do herói). Para lutar só com eles, clique de novo no boss escolhido para desmarcá-lo. O **modo deus dos monstros** também vem ligado (eles não morrem).
- Lista **Buddies**: clique em um ou mais (Phoenix Pact, Flaming Phoenix, Blue Torch, Shadow Raven, Grave Wisp, Shadow Wolf, White Wolf); cada um liga a skill que o faz existir, no nível máximo. **Druid tree**: a árvore do druida já nasce no estágio escolhido (muda, árvore jovem, Wicked Oak adulto ou Ancient Grove evoluída), perto do herói; a caixa **Keep the tree at that stage** impede que ela cresça (para ver cada fase com calma).
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

## Aba Screens (abrir as telas sem jogar até lá)

Quarta aba do painel (**🖼️ Screens**): abre uma tela do jogo na hora, com os números que você escolher, para ver o que acontece quando o jogador morre, passa uma onda ou zera o jogo, sem jogar uma noite inteira. Usa as funções reais do jogo (`triggerGameOver`, `openCamp`, `returnToMenu`...), então a tela é exatamente a do jogador.

- **Escolhas:** herói, onda, pontuação, monstros abatidos, bosses vencidos, estrelas da onda (0 a 5) e nível de Escuridão. A caixa **Hide the "new hero unlocked" popup** (ligada) marca os troféus que liberam heróis como já ganhos, porque passar da onda 1 liberaria o Rowan e o prêmio cobriria a tela; desmarque para ver o prêmio de verdade.
- **End of the night:** 💀 o herói caiu, 🔥 a tocha apagou, 🌅 o amanhecer (tela de vitória). Dá para clicar nos botões dessas telas (HUNT AGAIN, ALTAR, MENU...) e ver o que vem depois.
- **Between waves:** ⭐ onda concluída (cartão de resultado com as estrelas escolhidas e depois o acampamento) e 🏕️ só o acampamento.
- **Menus:** início, presente diário, Ranks e o Altar aberto logo depois de uma queda ("try again, but stronger").
- **Save do sandbox:** +500 Brasas, liberar todos os heróis e **🆕 Brand new player** (apaga o save deste sandbox e recarrega, para ver a experiência de quem nunca jogou).
- Depois de abrir uma tela, **🧪 Sandbox** (canto inferior esquerdo) volta ao painel. O save do sandbox é separado do do jogo (outra porta = outro `localStorage`).

## Aba Dialogues (as conversas do jogo)

Última aba do painel (**💬 Dialogues**): escolha o **herói** e veja todas as conversas dele na ordem da partida: o duelo com o rival (aparece e cai, na onda 3), a provocação antes de cada chefe (ondas 6, 9, 12, 15, 16 e 17) e a revanche da onda 18. Cada botão abre a cena na tela real do jogo (faixas de cinema, retratos, fala letra a letra; Espaço, Enter ou clique passa a fala). **▶ Play all** toca tudo em sequência, com uma pausa curta entre as cenas; **⏹ Stop dialogues** (canto superior direito) interrompe. Heróis com falas próprias (Rowan, Avgustino) mostram as deles, e o Azael mostra a conversa com o Demon Hunter. As falas ficam em `data_model/dialogues.js`.

### 💾 SAVE TO THE GAME FILE (HUD tuner)

O botão **💾 SAVE TO THE GAME FILE** grava os ajustes direto em `data_model/fluid_layout.js` (precisa abrir o sandbox por `serve.py`): cada tela ajustada vira (ou atualiza) um ponto de referência da tabela, e os ajustes saem do tuner, porque agora fazem parte do jogo. Só as peças que você mexeu mudam; o resto da tabela fica igual. Não grava: peça escondida ("Hide it") e a dica do mouse (não existem na tabela). O botão **Map** e o botão **Controls (🎮)** são peças independentes. 📋 Copy continua existindo para colar na conversa.
