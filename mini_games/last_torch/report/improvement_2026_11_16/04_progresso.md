# 4. Progresso

## 17/11/2026 — Fase 1 (carregamento): feita

**Como medi:** Chrome headless com tela de celular (390x844), servidor com TLS + gzip, cache desligado, mediana de 3 execuções, até o botão PLAY acender (a primeira visita já entra na caçada). 4G rápido = 40 ms de latência, 9 Mbps, CPU 4x mais lenta. 4G lento = 150 ms, 1,6 Mbps, CPU 4x mais lenta. São simulações: falta confirmar em celular real.

| Cenário | Antes | Depois |
|---|---|---|
| Desktop | 0,70 s | 0,55 s |
| 4G rápido | 3,06 s | 2,32 s |
| 4G lento | 6,87 s | 4,03 s |
| Pedidos de rede | 371 | 9 |
| Arquivos no pacote | 386 | 81 |

**O que mudou**
- `build-standalone.rb`: junta todos os módulos JS em `game.min.js` (229 KB com gzip) e todo o CSS em `css/game.css`, com esbuild; preload das duas fontes; barra de carregamento anda por tempo, já que não há mais um arquivo por módulo.
- `js/ui/screens.js` e `data_model/tree_images.js`: os ~70 ícones da árvore (650 KB) começam a baixar 4 s depois da caçada começar, com prioridade baixa.
- O código-fonte do site não mudou: só o pacote da CrazyGames.

**Verificado:** o jogo empacotado abre direto na caçada, sem erros no console e sem 404; a tela é a mesma da versão antiga. **Não verificado:** teste pixel a pixel (só conferi a imagem), celular real, e uma noite inteira jogada no pacote novo.

**Não fiz:** adiar a arte do Azael e dos bosses (já não carregam antes da caçada, então não havia ganho). Juntar o CSS no site normal (só no pacote).

## 17/11/2026 — Fase 2 (primeiro minuto): mãozinha do medalhão (item 2.3, parte 1)

Uma mão animada (👆, só emoji e CSS, sem imagem nova) aponta para o medalhão de skills e solta um anel, em ciclo. Aparece **só na onda 1**, quando há pontos para gastar, e some quando os pontos acabam, quando a onda 1 termina ou quando o jogador abre a árvore. Depois de abrir a árvore uma vez ela não volta naquela partida, mesmo ganhando mais pontos; volta na onda 1 da partida seguinte (a dica da tocha também aparece em toda onda 1). Não pega toque e não cobre a ação. Não aparece para quem ligou a escolha rápida em Settings.

- Arquivos: `js/ui/hints.js` (`updateTreeHand`, `hideTreeHand`), `js/ui/hud.js`, `js/ui/status.js`, `js/core/save.js`, `last_torch.html`, `css/components/banner.css`.
- Verificado no Chrome headless, celular em pé e deitado: a mão aparece junto do medalhão (com +2 pontos desde o início da noite), abrir a árvore a esconde e ela volta na partida seguinte; sem erros no console.
- Não verificado: celular real, nem o efeito na conversão.

## 17/11/2026 — Fase 2: duelo da hora 1 mais curto (item 2.2)

Na **primeira noite do jogador** (`save.stats.runs === 0`), o duelo com o rival tem 1 fala antes da luta e 1 depois, em vez de 3 e 3, porque cada fala para a caçada. Da segunda noite em diante o duelo vem inteiro, e a revanche da hora 12 nunca é cortada. Ajuste em `START.firstNightDuelLines` (`data_model/start.js`; 0 desliga o corte), aplicado em `playDuelDialogue` (`js/ui/dialogue.js`).

Verificado chamando o diálogo direto no navegador (runs = 0: 1 e 1; runs = 1: 3 e 3, sem erros). Não verificado: um duelo de verdade, jogando até o boss da hora 1.

## 17/11/2026 — Fase 3: Brasas e Altar

O jogo já teve Brasas e o Hearth (11 melhorias), tirados em 30/10 por informação demais. Voltaram **enxutos**: uma moeda, 4 melhorias, uma tela.

- **Ganho:** 8 por noite + 6 por onda fechada + 1 a cada 10 mortes + 15 por boss + 120 pelo amanhecer. Uma noite que acaba na onda 1 já rende o bastante para a primeira compra (custa 10).
- **Altar:** Vitality +5% vida, Might +5% dano, Insight +1 ponto de skill inicial (3 níveis), Hearth Flame +10 vida da tocha. Preços de 10 a 75 por nível.
- **Altar ampliado (17/11):** 10 melhorias, moderadas: + velocidade, dano mágico, alcance da adaga, dano de Fúria, distância do dash, 1 carga de dash e Insight até 5 níveis. Dois bônus novos no jogo: `dashDistance` e `furyPower` (`stats.js`). Verificado: com 1 nível de cada, dash 180→190,8, cargas 1→2, bônus de Fúria 12%→15%, magia 20→21, alcance 400→420. No celular em pé as 10 cabem numa tela, sem rolar.
- **Onde aparece:** botão ALTAR na tela inicial (brilha quando há compra possível) e no fim da noite, com "+N EMBERS" e "You can buy: …".
- **Arquivos:** `data_model/embers.js`, `js/ui/altar.js`, `css/components/altar.css`, e ligações em `screens.js`, `buttons.js`, `modifiers.js`, `save.js`, `last_torch.html`.
- **Verificado** no Chrome headless (em pé e deitado): uma noite na onda 3 com 40 mortes rendeu 24 Brasas; comprei Vitality e Insight; na noite seguinte os pontos iniciais foram de 2 para 3 e a vida subiu 5%; sem erros no console.
- **Corrigido de passagem:** a mãozinha do medalhão ficava atrás da tela de fim de noite e do acampamento.
- **Não verificado:** balanceamento com tudo no máximo (precisa jogar), e uma noite inteira no pacote final.

## 17/11/2026 — Fase 6: árvore de skills e barra do boss no celular em pé

- **Light Path vazando:** a fileira de 6 abas pedia 3,5 rem por aba (mais de 22 rem) e passava do quadro em telas de 360 px. Agora as abas dividem a largura em partes iguais.
- **Textos longos esmagando a árvore:** medi que, ao selecionar a skill de texto mais longo, o mapa caía para 17 px (e 0 px em telas menores). O detalhe agora tem altura máxima (38% da tela, 31% em telas baixas), o texto rola dentro dele e o botão LEARN fica sempre à vista. O mapa nunca desce de ~127 px (181 a 210 px nos celulares comuns).
- **Barra do boss:** em pé ela vai para uma linha própria abaixo do cartão do herói, com a largura toda, e ganhou o retrato do boss (o do bestiário, pintado só quando o boss muda). Deitado e desktop seguem no canto, agora também com retrato.
- Verificado em 390×844, 360×740, 360×640 e 412×915 (árvore) e em 4 formatos (boss), sem erros no console. Não verificado: celular real.
- **Falta da Fase 6:** revisar os outros menus apertados e o tuner da tela de jogo (aba no sandbox).

## 17/11/2026 — Fase 6: tuner da tela de jogo e tela inicial

- **Tuner (aba "HUD tuner" do sandbox):** o jogo real num iframe de qualquer tamanho; alças arrastáveis em cada peça do HUD e dos controles, campos de posição e tamanho, e **COPY** que leva só o que mudou, por resolução. Para simular celular o servidor serve o jogo também sob `/__touch/` (CSS com `(pointer: coarse)` sempre verdadeiro). Arquivos: `_sandbox/tuner.js`, `tuner.css`, `frame.js`, `serve.py`, `sandbox.js`. Uso no `_sandbox/README.md`.
- **Verificado** no Chrome (1500×900): abrir a aba, arrastar o cartão do herói, mudar o tamanho do medalhão, ligar o boss, copiar (o texto saiu só com as duas peças alteradas) e trocar de resolução (390×844 em pé, 844×390 deitado), sem erros.
- **Tela inicial:** título ~22% menor; "DARKNESS (N skill pts)" com os pontos depois da palavra; Sanctuary e Altar sem vazar em 6 tamanhos de tela; dicas dos heróis dentro do cartão.
- **Não verificado:** celular real; arrastar com o dedo no tuner (testado só com mouse).

## 17/11/2026 — HUD e controles do celular em pé, ajustados pelo dono no tuner (360×640)

O dono ajustou o 360×640 em pé no tuner e a IA reproduziu o mesmo estilo em todos os celulares em pé (largura até 599 px), com medidas em rem e proporções:
- **Barra do boss:** 70% da largura, letras e barra menores, retrato retirado (só o nome com a caveira).
- **Sequência de mortes e pontuação:** coluna à direita; a sequência sobe para a altura da barra do boss e a pontuação desce para baixo dela.
- **Controles de toque:** joystick e adaga ~30% menores (61 px) e mais perto das bordas; o dash (38 px) fica à esquerda e acima da adaga.
- **Verificado:** em 360×640, 360×740, 390×844, 412×915 e 430×932 as medidas bateram com as do dono no 360×640 (joystick, adaga, dash, pontuação e barra do boss) e não há erros. Os cantos do dash e da adaga se encostam um pouco, como no ajuste do dono.
- **Não verificado:** celular real.

## 17/11/2026 — Ajustes do dono por resolução aplicados ao CSS

O dono ajustou 6 telas no tuner; a IA aplicou como regras proporcionais, não como pixels soltos:
- **Celulares em pé (até 599 px):** o tamanho dos controles cresce com a altura da tela (`clamp(3.8rem, 9.4dvh, 5.2rem)`: ~61 px em 640, ~82 px em 915); a adaga é 92% do joystick e o dash 55%. A coluna sequência/pontuação sobe e a sequência encolhe a 88% em telas de até 700 px de altura; a barra do boss cresce para 75,5% da largura a partir de 385 px.
- **Tablet em pé (a partir de 600 px):** controles do tamanho padrão, mais altos; barra do boss 38% maior à direita do centro; sequência 34% e pontuação 32% maiores.
- **Desktop 1280×720:** barra do boss 38% maior, no topo, perto do centro (52%).
- **Verificado:** posição final de cada peça medida nos 6 tamanhos contra o alvo do dono: quase tudo dentro de ±5 px; tablet e desktop dentro de ±1 px; o dash varia até 9 px (imprecisão do arrasto). Sem erros no console.
- **Lição:** os deslocamentos do tuner valem sobre o CSS da hora e ficam guardados no navegador; por isso há agora o botão **Reset ALL screens**, para usar depois de cada aplicação.
- **Não verificado:** celular real, tablet real.

## 17/11/2026 — Segundo ajuste do 360×640 (telas baixas, até 700 px de altura)

Aplicado só às telas baixas (o 360×740 e maiores não mudaram): joystick 62 px, mais para dentro (25 px da borda, 59 px de baixo); adaga 54 px; dash 28 px; sequência de mortes volta para a altura da barra do boss (4rem, 88%); pontuação desce para 8rem. Medido: o 360×640 bateu com o ajuste do dono com no máximo 0,5 px.
Os valores da barra do boss e do dash vieram iguais aos da vez anterior porque o tuner ainda guardava os ajustes antigos e os somou ao CSS novo; foi aplicado o que o dono viu na tela. **Use _Reset ALL screens_** no tuner antes do próximo ajuste.

## 17/11/2026 — Terceiro envio do tuner: celulares em pé por faixa de altura

- Os controles e o HUD dos celulares em pé passaram a ser definidos por **faixa de altura** (até 700, 701–790, 791–880, 881+ px), cada uma com os valores exatos que o dono deixou em 360×640, 360×740, 390×844 e 412×915. Cada controle (joystick, adaga, dash) tem tamanho e posição próprios em variáveis CSS; o tamanho de Settings continua multiplicando.
- **Medido:** as 6 peças dos 4 celulares ficaram a no máximo 0,1 px do que o dono viu no tuner. Tablet (768×1024) e desktop (1280×720) não mudaram.
- **Não aplicado:** tablet e desktop, porque os valores vieram idênticos aos do envio anterior (ajustes antigos ainda guardados no tuner, não mudança nova). Aplicar de novo levaria a barra do boss do desktop para fora da tela.

## 17/11/2026 — Quarto envio do tuner: 360×640 (faixa até 700 px de altura)

Primeiro envio feito sobre o CSS atual, sem soma em dobro (o tuner agora ignora ajustes guardados quando o CSS muda). Mudanças só na faixa de até 700 px de altura: joystick maior (64 px) e mais para dentro; adaga 62 px; dash 38 px, mais para a esquerda e para cima; barra do boss 74,15% da largura; sequência e pontuação um pouco mais para cima/dentro. Medido: o 360×640 bateu com o ajuste do dono (diferença de no máximo 0,4 px); as outras telas não mudaram.
O "left 282" da sequência no texto do dono era a posição de referência antiga; o tuner agora mostra 274, igual ao jogo.

## 17/11/2026 — Quinto envio do tuner: celulares deitados, tablet e retoques

Primeiro envio com 7 telas e todas as posições de referência batendo com o CSS atual (a correção do tuner funcionou). Aplicado:
- **Celulares em pé 390×844 e 412×915:** joystick, adaga e dash reposicionados por faixa de altura; pontuação do 412×915 14% maior.
- **Tablet em pé 768×1024:** controles, sequência (157%) e pontuação (127%) reposicionados.
- **Celulares deitados (novo):** controles por faixa de largura (≤690, 691–790, 791–880, 881+ px) e HUD por faixa com `translate` e `scale`, as mesmas propriedades do tuner: cartão do herói, medalhão, botão de ajustes, barra do boss, barra da onda, pontuação e sequência.
- **Estrutura:** os botões da adaga e do dash passaram a usar variáveis (`--knife-*`, `--dash-*`) com o padrão antigo como reserva, então só as faixas as alteram.
- **Medido:** nos 7 tamanhos, cada peça ficou a no máximo 0,7 px do ajuste do dono (o medalhão pulsa); 360×640 e desktop não mudaram. Sem erros no console.
- **Não verificado:** celular e tablet reais; telas de tamanho diferente dos testados usam a faixa mais próxima.

## 17/11/2026 — Sexto envio do tuner: tablet deitado e desktops

Aplicado, por faixa de largura (telas altas, acima de 520 px): **1024×768** (controles de toque por variáveis e HUD com `translate`/`scale`), **1280×720** (retoques: barra do boss, barra da onda, pontuação e sequência) e **1920×1080** (cartão do herói, medalhão, botão de ajustes, barra do boss, pontuação e sequência bem maiores). Faixas: 1024–1151, 1152–1599 e 1600+ px; telas intermediárias usam a mais próxima.
Medido: nos 3 tamanhos cada peça ficou a no máximo 0,2 px do ajuste do dono; os 7 tamanhos do envio anterior e o 360×640 não mudaram. Não verificado: tela real.

## Decisão do dono (17/11)

Sem tutorial de joystick/dash: a interface é simples. Os itens "primeiros monstros mais fracos" e "primeiro nível em 15 s" ficam para depois de o dono jogar o pacote e dizer se o começo está difícil ou lento. A Fase 2 está feita no que importa.

## Próximo passo
Fase 2: primeiro minuto no celular. Antes, jogar o pacote novo por uma noite para confirmar que nada quebrou, e enviar à CrazyGames.
