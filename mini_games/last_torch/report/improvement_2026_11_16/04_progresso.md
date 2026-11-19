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

## 17/11/2026 — Layout fluido: tudo responsivo a partir de 3 perfis

Problema do dono: os ajustes viravam faixas por tamanho de tela, e uma tela entre duas ajustadas ficava torta. Solução: **layout fluido** (`js/ui/fluid_layout.js` + `data_model/fluid_layout.js`). O CSS voltou à base limpa; os ajustes do dono (12 telas) viraram pontos de referência em três perfis (portrait, landscape, desktop, mais um balde interno para tablet em pé); entre dois pontos o jogo interpola e fora deles escala proporcionalmente. O HUD usa `translate`/`scale`; os controles, variáveis CSS. O tuner agora tem só 3 telas de referência e soma ao layout fluido. Ferramentas de conversão em `_sandbox/tools/`.
- **Verificado:** o jogo reproduz os 12 tamanhos ajustados (no máximo 1,2 px), 17 tamanhos intermediários (iPhone SE/8/X, 393×852, 430×932, iPad, 568×320, 667×375, 1366×768, 2560×1440...) sem peça fora da tela nem controles sobrepostos, e varreduras de altura e largura sem saltos. Corrigido de passagem: o cartão do herói esticava em celular deitado com menos de 640 px de largura.
- **Observação:** peças que o dono não ajustou numa tela (ex.: cartão do herói no 844×390) ficam no padrão ali, e a interpolação passa por esse ponto.
- **Não verificado:** celular real.

## 17/11/2026 — Primeiro envio do tuner sobre o layout fluido

Os 3 perfis de referência foram retocados: **desktop 1280×720** (barra do boss 107%, pontuação 114%, sequência 116%), **portrait 390×844** (joystick 93%, adaga 80%, dash deslocado) e **landscape 844×390** (barra do boss, pontuação 95%, sequência 117%). Só esses pontos mudaram na tabela `data_model/fluid_layout.js`; as demais telas e os outros pontos de referência ficaram iguais, e todas as telas intermediárias passam a acompanhar. O jogo carrega sem erros nas três telas. Não verificado: celular real.

## 17/11/2026 — Segunda chance no Altar e Altar na morte

- **Torch's Call (Altar, 160 Brasas, 1 nível):** a segunda chance da tocha (uma vez por noite ela gasta 25% da chama e traz o herói de volta) deixou de ser automática. Sem comprar, morreu morreu; comprada, vale em qualquer Escuridão (o limite de Escuridão 1 foi removido).
- **Altar na morte:** depois de um instante no resumo, se há Brasas para gastar, o Altar abre sozinho com "TRY AGAIN, BUT STRONGER" e um botão HUNT AGAIN; fechar volta ao resumo. Se o prêmio de um herói liberado está na tela, o Altar espera o jogador fechá-lo. Não abre na vitória nem sem Brasas. O botão ALTAR do resumo abre o mesmo modo.
- **Verificado** no Chrome: sem a melhoria não há segunda chance, com ela há; o Altar abre na morte, depois do prêmio do herói; comprar e HUNT AGAIN recomeça na onda 1 com a compra no save; na vitória não abre sozinho; sem erros. Não testado: a segunda chance em si durante uma queda real (só a condição de ela valer).

## 17/11/2026 — Retoque do desktop 1280×720 no tuner

Cartão do herói (82%, −6,5 px), medalhão (96%, −24,6 px) e botão de ajustes (83%, −17,4 px) reajustados. Só o ponto de referência 1280×720 do perfil desktop mudou na tabela; os demais pontos e perfis ficaram iguais, e as telas desktop intermediárias acompanham.

## 17/11/2026 — Desktop 1920×1080 passa a ser a tela de referência do desktop

O dono joga em 1920×1080, e o ajuste que fez no 1280×720 nunca chegava a ele (o jogo usa o ponto da largura exata; entre pontos interpola). O tuner agora usa **Desktop 1920×1080** como referência. Primeiro ajuste nele: cartão do herói 89%, medalhão 86%, botão de ajustes 77% (+6,25/+2,78 px) e barra do boss 86%; no ponto do 1920 isso dá cartão 126%, medalhão 150% e botão de ajustes 167% do tamanho original do CSS. O ponto do 1280×720 continua na tabela para janelas desse tamanho.

## 17/11/2026 — Morte do Treant e quadro de morte no Ateliê

O Treant só desaparecia. Agora o corpo **tomba** de lado, bate no chão com poeira, afunda e some, enquanto casca e folhas (que caem leves e balançam) voam e deixam uma mancha verde-escura. A definição de morte de todos os monstros 2.5D foi para a biblioteca (`_library/monsters/25d/death.js`), e o Last Torch passou a lê-la de lá; no Ateliê, o tuner de **Monstros** ganhou o painel **Morte** (vista "Morrendo", botão ▶ Morrer, repetir, ajuste de pedaços/queda/poeira e "Copiar morte"). Verificado no Chrome: o Treant cria o corpo e os pedaços (casca e folha), o esqueleto continua soltando ossos, o painel edita e copia, sem erros. Não verificado: o impacto no desempenho em celular fraco (o corpo é 1 sprite, no máximo 8 de cada vez, desligado no menor nível de detalhe).

## 17/11/2026 — Peito do Demon Lord em blocos

As duas bolas claras do peito (que lembravam um busto) viraram duas placas retas de peitoral, com faixa de sombra embaixo e o sulco do meio, e o abdômen ficou em quadrados (2 colunas por 3 linhas). Mudança em `_library/monsters/25d/demon_lord/demon_lord25d.js` (função `drawTorso`), sincronizada com o Last Torch e o yara-rpg. Verificado no Ateliê (vista de frente, antes e depois). Não verificado: o aspecto dentro do jogo em movimento.

## 17/11/2026 — Mais explosão na morte do Treant e ossos no lobo zumbi

A morte do Treant ganhou **toras** de madeira (cilindro com a face cortada), mais casca e 26 folhas, todas saindo mais rápidas e mais altas ("explodindo"), além da queda do tronco; o **lobo zumbi** passou a soltar ossos (6) junto das lascas. O limite de pedaços ao mesmo tempo subiu de 44/26/12 para 64/40/14 (por nível de detalhe), porque no nível do celular o Treant sozinho passava do teto e cortava as folhas. Tudo na biblioteca (`death.js`) e ajustável no painel "Morte" do Ateliê. Verificado no jogo: toras, cascas, folhas e ossos aparecem; sem erros. Não verificado: desempenho em celular fraco com vários pedaços.

## 17/11/2026 — Rosto novo do Treant

O rosto do Treant foi refeito e **desceu no tronco**: vista de cima pela câmera do jogo, a copa cobria o alto do tronco e a cara antiga (dois pontinhos e um risco) nunca aparecia. Agora tem um oco escuro, sobrancelhas pesadas e franzidas, olhos âmbar com pupila em fenda, nariz de nó de madeira, boca em fenda com dentes de lasca, barba de musgo e um broto na testa (`faceDrop` e `faceScale` em `treant25d_visual.js`). É o mesmo desenho do buddy, então o buddy também mudou. Verificado no Ateliê (de perto e no tamanho do jogo) e no jogo, com o Treant virado para a câmera. O rosto só se vê quando ele vem de cima para baixo; de costas, aparece a copa. Não verificado: celular real.

## Decisão do dono (17/11)

Sem tutorial de joystick/dash: a interface é simples. Os itens "primeiros monstros mais fracos" e "primeiro nível em 15 s" ficam para depois de o dono jogar o pacote e dizer se o começo está difícil ou lento. A Fase 2 está feita no que importa.

## Próximo passo
Fase 2: primeiro minuto no celular. Antes, jogar o pacote novo por uma noite para confirmar que nada quebrou, e enviar à CrazyGames.

## 17/11/2026 — Laboratório de fotorrealismo (fora dos jogos)

Criado `_library/tools/lab/` (só no Ateliê; o sync não copia, nenhum jogo é afetado): a metodologia das 7 técnicas (`metodologia_fotorrealismo.md`) e um monstro novo, o **Golem de Brasa e Musgo**, em WebGL/Three.js (copiado em `vendor/`, funciona sem internet) com liga/desliga por técnica. Feito: PBR procedural, triplanar, AO, instancing (Poisson), névoa, pós-processamento. Aproximado: GI, SSS, god rays. Fora: Gaussian Splatting e reflexos em tela. Verificado só em Chrome headless com WebGL por software, sem erros; não medi GPU real nem celular. Cartão "Laboratório" na página inicial do Ateliê.

## 17/11/2026 — Golem de Brasa e Musgo entra no jogo (2.5D)

Novo monstro **GOLEM** (wave 4+, até 2 vivos, 320 de vida +110 por turno, mesmo soco lento do Treant, bestiário "Ember Golem"). Arte em `_library/monsters/25d/golem/` (só bolas e membros do boneco 2.5D: pedra com luz em cima, musgo nos ombros/pés/cabeça, rachaduras de lava, núcleo e olhos com glow, chifres), com ficha em `art_reference/character.md` e painel no tuner (`?model=golem`). Morte: desmorona, tomba pouco e afunda, com **pedras** voando (nova forma `rock` em `death.js`), lascas de lava, folhas de musgo e poeira. Verificado no jogo (Chrome headless): aparece, anda, morre com pedras voando, sem erros. Não verificado: desempenho em celular, equilíbrio de dificuldade. De cima o golem lê como pedras empilhadas; cabeça e rosto aparecem melhor na câmera do Ateliê.

## 17/11/2026 — Golem com a arte do laboratório (sprites animados)

A versão em bolas ficou chapada. Agora o jogo usa **sprites gravados do golem 3D do laboratório** (`golem_atlas.webp`, 250 KB, 8 direções x 6 quadros de passada + 4 de soco): ele anda, vira para o lado que caminha, ergue os braços no soco e tomba na morte (o corpo que cai usa o mesmo sprite), com as pedras voando. A versão em bolas virou reserva. Para regravar: `tools/lab/bake_golem.py`. Verificado no jogo em Chrome headless, sem erros. Não verificado: celular real e equilíbrio. Limites: o bestiário ainda mostra a versão em bolas; a luz do sprite é fixa.

## 17/11/2026 — Treant com a arte do laboratório (sprites animados, floresta de noite)

Segundo personagem do laboratório: o **Treant** (`tools/lab/treant_foto.*`), numa floresta escura de noite (luar, vagalumes, névoa), com rosto simpático. Gravado em `buddies/treant/treant_atlas.webp` (235 KB, 8 direções x 6 passos + 4 de soco) e ligado ao jogo no mesmo molde do Golem: vale para o monstro e para o buddy; a versão em bolas é reserva; o corpo que tomba na morte usa o mesmo sprite (toras e folhas voando como antes). O laboratório ganhou uma tela de escolha (`tools/lab/index.html`) com os dois monstros. Verificado no jogo (Chrome headless): anda, morre tombando, sem erros. Não verificado: celular real; o Ateliê (tuner do buddy) usa o sprite pelo mesmo caminho do golem, mas só conferi o jogo.

## 17/11/2026 — Treant de madeira e monstros gigantes mais lentos

O Treant do laboratório trocou a casca de pedra rachada por **casca de madeira** (sulcos verticais compridos, cristas escuras e liquens; formas do tronco menos rochosas) e o atlas foi regravado. Velocidades (px/s, antes da escala da onda): Golem 8–11 → **4–5,5**, Treant 9–12 → **6–8**, Colosso de Ossos 22 → **14**. Medido no jogo (4 s, onda 5): Golem 15 px, Treant 27 px, Colosso 48 px, Esqueleto 231 px. A passada dos sprites (`pixelsPerCycle` 8) acompanha. Equilíbrio de dificuldade ainda por jogar.

## 17/11/2026 — Treant magro e alto

No laboratório (`treant_foto.js`) o Treant foi afinado (x 0,62, z 0,66) e esticado (y 1,3): mais comprido que largo; atlas regravado com enquadramento maior e `spriteScale` 8,3 (`treant25d_visual.js`), então fica uns 30% mais alto e uns 25% mais fino na tela. A versão antiga (`treant_classico`) não mudou. Verificado no jogo e no Ateliê.

## 17/11/2026 — Treant remodelado como árvore esguia

Espremer o modelo antigo deu uma "gorda fina". O Treant do laboratório foi **remodelado**: tronco fino e contínuo que afina para cima, um nó pequeno no tronco com o rosto simpático, braços de galho finos e contínuos (ombro, cotovelo, mão e gravetos), duas raízes finas como pernas e uma copa larga e aérea em cima (silhueta de árvore: tronco fino, copa grande). Atlas regravado (`spriteScale` 7,1). Verificado no laboratório, no Ateliê e no jogo. De cima, a copa cobre a maior parte do rosto.

## 17/11/2026 — Volta o Treant robusto; o esguio fica guardado

A pedido do dono, o jogo voltou ao Treant encorpado de casca de madeira (atlas regravado, medidas de sprite de antes). O Treant esguio ficou no laboratório (`treant_esguio.*`, cartão "alternativa") com o atlas pronto em `exemplos/treant_esguio_atlas.webp`.

## 17/11/2026 — Correção: sprites do Golem e do Treant não apareciam no pacote com bundle

No pacote standalone (esbuild, `game.min.js` na raiz) o `import.meta.url` não aponta mais para a pasta `library/`, então o atlas era procurado no lugar errado e o jogo caía no desenho básico de reserva. Agora, se o `import.meta.url` não tem `/library/`, a imagem vem de `library/...` a partir da página. Verificado no pacote **com bundle**: os dois atlas carregam (200) e não há erro. Quem gerou o pacote antes disso precisa gerar de novo.

## 17/11/2026 — Olhos vermelhos na névoa

Monstros longe da tocha (mais de 230 de distância; força total aos 340) ganham um par de olhos vermelhos brilhando por cima da névoa, avisando que vêm vindo; some quando chegam na luz. Os que ainda estão fora da tela aparecem na borda, mais fracos. Pisca de vez em quando; tamanho cresce com o raio do monstro (o golem tem olhos maiores). Teto de pares por nível de detalhe (26/16/8). Dados em `data_model/visuals/effects/far_eyes_visual.js` (`enabled` liga/desliga), desenho em `js/render/far_eyes.js`. Verificado no desktop e no celular, sem erros. Não medido: custo em celular fraco.

Ajuste dos olhos na névoa: agora cada monstro tem a posição da própria cabeça (`byType` em `far_eyes_visual.js`: up, forward e gap em raios do monstro), os olhos acompanham o lado para onde ele olha (de frente abrem na horizontal, de lado ficam juntos, de costas ficam mais fracos), o Treant e o Golem têm olhos âmbar e o Cavaleiro Sem Cabeça não tem olhos. O olho é desenhado normal (não aditivo) para aparecer até em cima do crânio claro do Colosso. Verificado em foto de todos os tipos, de frente e de lado.

## 17/11/2026 — Olhos na névoa ajustáveis no Ateliê

Os olhos vermelhos de cada monstro/boss agora moram na biblioteca (`_library/monsters/25d/eyes.js`, `MONSTER_EYES`; o jogo lê o mesmo, com o mapa tipo → id em `far_eyes_visual.js`). No tuner de monstros (e de heróis, para os bosses humanos) há o quadro **"Olhos na névoa"**: acima do centro, à frente, distância entre os olhos, cor do olho e do brilho; os olhos aparecem por cima do monstro nas vistas do Last Torch (caixa "Mostrar na prévia") e **"Copiar olhos"** gera só os monstros alterados, para mandar ao Claude (ou colar em `eyes.js` e rodar o sync). Verificado no Ateliê (copiar) e no jogo, sem erros.

## 17/11/2026 — Olhos vermelhos na névoa removidos

A pedido do dono, a função dos olhos vermelhos na névoa foi **removida** por completo (jogo, biblioteca e painel do Ateliê); as seções acima sobre ela ficam só como histórico. Ficou o **giro lateral** do tuner (barra de cima: "Girar", controle de 0° a 360° e botões → ↓ ← ↑), que vale para as vistas do Last Torch.

## 17/11/2026 — Golem joga pedras

O Golem agora joga uma pedra pequena (raio 7, velocidade 130, dano 0,6 do dano dele, 3 na tocha) a **meia distância** (entre 160 e 340 do alvo; colado nele ele soca, longe demais ele só anda), a cada 4,5 s, erguendo os braços 0,5 s antes. Dados em `GOLEM` (`monsters.js`: `shootMinRange`, `shootRange`, `throwWindup`, `projectile*`); `shootMinRange` e `throwWindup` são novos em `updateAttacks` (`enemies.js`) e valem para qualquer monstro. A pedra gira em voo (`monster_sprites.js`: `drawRock`, `entities.js`). Verificado no jogo (Chrome headless): ele joga, a pedra aparece e voa, sem erros. Equilíbrio (dano, frequência) ainda por jogar.

## 17/11/2026 — Golem: pedra com uma mão e pancada em área com as duas

- **Pedra:** agora ergue só **uma mão** (a direita do boneco) nos últimos 0,5 s antes de jogar (`e.throwArm`, 3 quadros novos no sprite).
- **Perto dele:** em vez do soco em leque, **bate as duas mãos no chão** num golpe em área de raio **175** (`punch.area`/`areaRadius` em `GOLEM`). Um círculo vermelho no chão mostra onde vai pegar durante os 1,4 s de preparação (braços subindo); quando as mãos batem (quadro de impacto, corpo inclinado) estoura um anel de pedra e quem estiver dentro leva dano (também a tocha, 8, e os clones). Quem sair do círculo antes (dash) não leva. Se o golem morre no meio, o aviso some junto.
- Atlas regravado: 14 colunas (6 passada, 4 subir, 1 impacto, 3 jogar) por 8 direções, 192 px, ~470 KB. `addSlam` (boss_ai.js) ganhou `shockColor` e devolve o aviso; `punch.area` vale para qualquer monstro com `punch`.
- Verificado no jogo (Chrome headless): o círculo aparece com os braços subindo, o impacto causa dano uma vez só, a pedra sai com uma mão levantada, sem erros. Dano do golpe em área (2,4x) ainda por equilibrar.

## 2026-11-17 · Flaming Phoenix: voo maior, mais ângulos e jato de fogo

- Voo: raio da órbita 38 → 125 (elipse achatada 0,5, velocidade 0,7), em `HEARTH_PHOENIX` (`passives.js`).
- Sprites: atlas com 5 visões (lado, frente-lado, frente, costas-lado, costas) × 12 quadros de 144 px (~350 KB cada cor). A visão sai da direção do voo; ao atirar, olha para o alvo.
- Ataque novo: a cada 8 s ela cospe um jato de fogo (lança-chamas) de 1,6 s em cone de 270 de alcance, que segue o monstro mais perto, dá dano em pulsos de 0,15 s e deixa em chamas. As bolas de fogo continuam entre os jatos. Visual sem estado (brilhos em 'lighter'), 44 partículas (26 em qualidade alta de fumaça/efeitos), som `playFlame`.
- Testado no Chrome headless: 4 visões usadas, 4 monstros queimando, sem erros. Não medido em celular real.

- Ajuste do jato (mesmo dia): fim das tremidinhas (a vista e o lado da ave só trocam depois de 0,25 s, 0,5 s durante o jato; o tremor de tela do início foi tirado; a boca do fogo anda macia). O fogo agora sai do bico de verdade: a posição do bico em cada vista foi medida no Laboratório (`window.__beak` em `fenix_foto.js`) e vai em `beak` de `hearth_phoenix_visual.js` (antes era chute, e o y estava abaixo do centro).

## 2026-11-18 · Blue Torch: todo o fogo do herói fica azul

Com a Blue Torch: chamas da espada de fogo e o corte, bolas de fogo (Fireballs e da Flaming Phoenix), chama em cima dos monstros queimando e fogo no chão (normal e evoluído) ficam azuis (`fireLook()` em `js/render/fire.js`; chão em `js/render/powers.js`); o fogo dos inimigos segue vermelho. A fênix do Phoenix Pact ganha atlas azul próprio, com as cores da paleta giradas no matiz (`buddies/phoenix/phoenix.js`, `kind: 'blue'`). Testado no Chrome headless, sem erros.

- Torch Ward ganhou arte: a imagem antiga do Vigil (encapuzado de braços cruzados com a espada, no redemoinho de fogo; estava sem uso) foi renomeada para `images/buttons/torch-ward(-small).webp` e ligada ao nó `torchWard` em `tree_images.js` (árvore, escolha rápida, status e ficha da skill). O nome da skill já era Torch Ward.

## 2026-11-18 · Fire Tornado (no lugar do Banked Coals)

Passiva nova no ramo Flame, custo 4: a cada 20 s um furacão de fogo se forma sobre a tocha e dura 5 s; pulsos de 0,25 s dão 1,1× o dano do fogo da tocha em tudo dentro do círculo tracejado (o calor), deixam em chamas e puxam para o centro (chefes não). Dados em `FIRE_TORNADO` (`passives.js`), lógica em `updateFireTornado` (`skills_flame.js`), visual sem estado em `js/render/fire_tornado.js` (funil + braços em espiral + anel; azul com a Blue Torch; menos brilhos em qualidade baixa). O Banked Coals saiu da árvore (o mod `torchGuard` segue existindo para os Juramentos); a Flaming Phoenix agora pede o Fire Tornado. Testado no Chrome headless: 4 de 6 monstros dentro morreram/feriram, sem erros. Dano não balanceado em jogo.

- Fire Tornado: só se forma quando há monstro dentro do círculo de calor (pronta, ela espera sem gastar a recarga); no fim da onda (fase fora de HUNT) some na hora (lógica e desenho). O mesmo vale para o jato da Flaming Phoenix, que também continuava desenhado fora da caçada.

## 2026-11-18 · Ondas de no mínimo 3 minutos, com mais monstros ao longo da onda

`TURN_DIFFICULTY.waveMinSeconds = 180` e `spawnGrowth = 0.9` (`difficulty.js`). A onda (e a chamada do boss) só fecha quando a cota de pontos E os 3 minutos passaram: `waveProgress` = o menor entre pontos/cota e tempo/180 (usado em `spawner.js`, `night.js` e na barra do HUD; hordas e elites também disparam por ele, então se espalham pelos 3 minutos). O intervalo entre monstros encolhe com o tempo (`waveSpawnBoost`: de ×1 a ×1,9 aos 180 s). Teste com cota já cumprida: a onda 1 fechou aos 181 s e a taxa de nascimento subiu de ~0,7 para ~1 monstro/s. Balanceamento com jogador de verdade não feito (a onda 1 fica mais densa no fim).

## 2026-11-18 · Bots de balanceamento e ajuste de skills

Bot (build de uma skill maxada, onda 5, 170 s, herói perto da tocha, vida do herói travada; mede kills e quanto a tocha sobrevive; 2 a 3 rodadas, ruído grande: o `base` varia de 11 a 60 kills). Sinais repetidos: **Hearth Ring / Solar Wall**, **Event Horizon**, **Phoenix Pact**, Cathedral Toll e Flaming Phoenix no topo; **Corpse Burst, Soul Nova e Torch Ward** (e o Fire Tornado, antes do ajuste) no fim. Mudanças:
- Fire Tornado: recarga 20 → 32 s; raio fixo em 190 (o raio máximo do Hearth Ring), não mais o calor da tocha.
- Blessed Rain: a cada 40 s (era 25).
- Nerfs: Hearth Ring dps [0,3 · 0,4 · 0,5 · 0,6 · 0,8] (era 0,35 … 1); Solar Wall dps 1,1 (era 1,3); Event Horizon recarga 9 s e dano 4 (era 7 s e 4,5).
- Buffs: Corpse Burst dano [1,3 · 1,3 · 1,6 · 1,6 · 2]; Soul Nova recargas [6 · 6 · 5 · 5 · 4].
Depois do ajuste o Hearth Ring ainda lidera no bot; o resultado individual é ruidoso, vale confirmar jogando.

## 2026-11-18 · Menos bagunça na tela: skills que atiram sem parar ficam mais lentas e fortes por tiro

Princípio: poucos disparos grandes em vez de muitos pequenos. Recarga ×1,4 a ×3 e dano por tiro subindo para o dano por segundo cair só uns 10 a 20 %.
- Flame Sentinel: recargas [3,2 · 2,6 · 2,6 · 2,6 · 2,2] (era [2,1 · 1,5 · 1,5 · 1,5 · 1,3]), dano por bola [1,5 · 1,5 · 1,5 · 2,1 · 2,1].
- Sun Spire (evolução): 5 bolas a cada 2,4 s com dano 4,6 (era a cada 0,8 s com 1,7: ~6 bolas/s caiam para ~2/s).
- Grave Wisp: recargas ×1,5, dano ×1,4. Storm Sigil e Wrath of Heaven: recargas ×1,35, dano ×1,3.
- Flaming Phoenix: bola a cada 2,6 s com 1,7× (era 1,8 s e 1,2×). Phoenix Pact: bola a cada 2,4 s com 2,2× (era 1,5 s e 1,4×).
Bot (ruidoso): as skills seguem úteis (Sun Spire, Flaming Phoenix, Phoenix Pact no topo).

- Fire Tornado, arte nova (`js/render/fire_tornado.js`): funil de verdade (20 anéis de chama girando, estreito embaixo e largo em cima, com sombra de fumaça para dar corpo), línguas de fogo subindo pela borda, vórtice discreto no chão e fagulhas girando; azul com a Blue Torch; menos peças em qualidade baixa. Continua sem estado e sem imagem (só canvas).

- Círculo vermelho tracejado de alcance do herói (`drawRangeCircle`, js/render/arena.js): espessura 2 → 3,2 e cor mais forte (alfa 0,65 → 0,92), para ler melhor no celular; vale no desktop e no círculo dos clones.

## 2026-11-18 · A barra de Fúria só enche com golpe de espada

Antes, além do golpe de espada (`chargePerHit` = 3 por monstro atingido), a barra também enchia com **toda morte** (`chargePerKill` 1,5, de qualquer fonte: magia, adaga, tocha, clones, fogo), com a **execução** do Executioner (+4) e com o **esquiva perfeita** do dash (+14). Os três foram removidos (e o campo `chargePerKill`, `getFuryChargePerKill`, `EXECUTIONER.furyCharge`, `PERFECT_FURY` e a linha "Charge per Kill" do painel de status). Agora só o golpe da espada do herói (`combat.js`) chama `chargeUlt`; os bônus `furyCharge` (relíquias, skills, Juramentos) só multiplicam isso. Teste: 5 monstros mortos por dano direto (sem espada) = barra em 0; golpes de espada = barra enche. A Fúria vai demorar mais para encher: se ficar rara, subir `chargePerHit` em `data_model/characters/<herói>.js`.

- Blade Path: Keen Eye foi para o fim da linha do aço (Attack Speed → Slash Width → Whirlwind → Keen Eye; pede a Whirlwind). Nerf: +7% → +5% chance de crítico e +25% → +18% dano crítico por nível (nível 5: +25% e +90%, era +35% e +125%).

- Holy Water: no máximo 1 frasco por vez (níveis 4 e 5 trocaram o 2º frasco por dano: 1,8× e 2,2×). Com a Blessed Rain os frascos continuam sendo jogados (usam os números do nível comprado) e a chuva vem por cima, a cada 40 s. Teste: com a evolução, o monstro perdeu vida só dos frascos nos primeiros 14 s (antes da 1ª chuva), sem erros.

## 2026-11-18 · Sandbox: aba Fast run
Terceira aba do sandbox (`_sandbox/fastrun.js`): escolhe o herói, caixa "Never die" (herói e tocha) e velocidades ×1/×2/×4/×10 por uma barra sobre o jogo, com piloto automático opcional. As travas de modo deus da Arena passaram a valer só em luta da Arena. Testado: ×2/×4/×10 = 2,0/3,7/9,3 s de jogo por s real; em 30 s a ×10 o piloto matou 212 monstros e a onda passou. Ver `_sandbox/README.md`.

## 2026-11-18 · Preços das relíquias fixos em degraus + ajustes do Altar

- Relíquias: cada uma tem agora o preço escrito em `cost` (`passives.js`), em 4 degraus fixos, iguais em todas as ondas (`costMultiplier` 1, `costGrowthPerHour` 0): **500** (13 relíquias, as mais simples), **700** (15), **1000** (13) e **1500** (4: Last Prayer, Second Prayer, Stone Heart, Owl's Wisdom). Antes valiam 140 a 580. O degrau veio do preço antigo (≤70 → 500, ≤100 → 700, ≤130 → 1000, o resto → 1500). Medição com o piloto do sandbox (herói imortal, mata tudo): ouro ganho acumulado ao fim das ondas 1 a 6 ≈ 1.060 · 2.520 · 3.990 · 6.000 · 8.830 · 11.470, ou seja ~1.000 na onda 1 e ~2.500 a 3.000 por onda depois: o piloto compra ~2 relíquias já na onda 1. Para forçar escolhas de verdade o preço ou o ouro por onda ainda precisam de ajuste fino jogando.
- Altar: Extra Dash removido; Swiftness passou de +2% para +1% de velocidade por nível. (Quem já tinha brasas gastas no Extra Dash as perde: o nível salvo é ignorado.)

## 2026-11-18 · Economia: ouro e preço das relíquias equilibrados com o Fast Run

Problema: com 500/700/1000/1500 o piloto comprava as 45 relíquias até a onda 9 (4 a 7 por onda; o ouro cresce muito nas ondas finais: de ~1.200 na onda 1 para 30 mil na 11).
Solução (preço **fixo**, nunca sobe com a onda):
- Relíquia: preço sobe pela coluna na árvore (as iniciais baratas, as do fim caras): **300 · 900 · 2.000 · 3.800 · 6.500**; as fortes da coluna ficam acima (Last Prayer 3.300, Second Prayer 4.800, Stone Heart 7.500). Total da loja: 108.500.
- Ouro por abate: `killGoldScale` 0,65 → **0,3** (`data_model/gold.js`).
Teste (Fast Run ×20, piloto imortal, compra a mais barata primeiro = caso mais generoso): onda 1 → 1 a 2 relíquias; depois 1 a 4 por onda; 29 de 45 relíquias na onda 11 (antes: 45 na onda 9). Um jogador de verdade, que mata menos e escolhe as caras, ficará bem abaixo. A variação entre rodadas é grande (±3 relíquias). Para afinar: preços em `passives.js` (`cost` de cada relíquia) e `killGoldScale`.

## 2026-11-18 · Equilíbrio geral: bosses, XP, skills fortes e espaços de skill ativa

Medido com o Fast Run (piloto, herói imortal, 12 ondas):
- **Bosses morriam rápido demais** (15 a 35 s; The Long Night ~80 s). Agora a vida de cada boss é multiplicada (`BOSS_HP_SCALE` em `bosses.js`): rival da 1ª hora ×1,7, Demon Lord ×2,4, Brutos ×2,2, Blood Countess ×1,8, The Long Night ×1,8, revanche final ×2, outros ×2. Com o piloto: 41 · 61 · 58 · 93 · 72 (antes do ×1,8 da Long Night) · 45 s. Um jogador que desvia leva perto do dobro.
- **XP**: o herói chegava ao nível 10 na onda 1 (uma chuva de "level up" e a build pronta cedo demais) e ~48 no fim. Curva 110/75/4 → 260/110/5 (`character.js`): nível ~8 na onda 1, ~43 no fim (~86 pontos; a árvore inteira custa 573).
- **Skills fortes mais caras**: Sun Spire, Solar Wall, Event Horizon 4 → 5 pontos; Cathedral Toll evoluído 3 → 4.
- **Espaços de skill ativa**: no máximo 6 skills que agem sozinhas em campo (`ACTIVE_SKILLS` em `data_model/tree.js`, regra em `js/systems/tree.js`); a 7ª fica fechada com "Active skill slot (6/6 used)". Evoluir ou subir de nível não gasta espaço. Força escolha de build e limita a bagunça na tela. Testado: comprar a 7ª foi recusado.
- Bagunça medida: os itens na tela são em maioria partículas de morte (≈17 em média numa onda 8) e não tiros de skill; as skills que atiram sem parar já foram espaçadas antes (Flame Sentinel, Sun Spire, Grave Wisp, Storm Sigil, fênix).
O piloto imortal morre na onda 2 quando pode morrer (não desvia nem cura), então a dificuldade "de verdade" para humano não foi medida: confirmar jogando.

- **Limite de 6 skills ativas removido** (confundia). No lugar: as skills ativas (`ACTIVE_SKILLS` em `data_model/tree.js`) custam +1 ponto por nível (`extraCost`; ex. Flame Sentinel 3 → 4, Holy Water 2 → 3, Fire Tornado 4 → 5); as de status/adaga/golpe ficam como estavam. Com ~86 pontos por partida, cabem umas 3 ou 4 ativas fortes.
- **Prêmio de fim de onda** (`WAVE_SPOILS` em `data_model/night.js`, `grantWaveSpoils` em `js/ui/camp.js`): ao chegar no acampamento, estrelas pela vida que sobrou na tocha (★ sobreviveu, ★★ ≥ 60 %, ★★★ ≥ 90 %), ouro = (60 + 30 × onda) × 1 / 1,6 / 2,4 e, com ★★★, +1 ponto de skill. Aparece num aviso e no título do acampamento ("WAVE 3 ★★☆"), sem ocupar espaço novo. Testado no celular e no desktop: onda 1 ★★★ = +216 de ouro e +1 ponto.

## 2026-11-18 · Resultado da onda (contagem estilo fim de fase)

Ao chegar no acampamento aparece um cartão (`js/ui/wave_results.js`, `css/components/wave_results.css`) que conta, com o "tic" da moeda: Kills, Best Rush, Gold (pego na onda), Torch % e Hero % → cada um vira pontos (×10, ×25, ×1, ×10, ×5) → **SCORE** da onda → 3 estrelas carimbando → prêmio (ouro e, com ★★★, +1 ponto de skill). ~3 s; um toque pula para o fim, outro fecha (fecha sozinho depois).
- **Estrelas = 3 metas**, mostradas na própria linha: Torch 60%+, Hero 50%+, Best Rush (20 + 4 × onda)+. Ouro do prêmio = (60 + 30 × onda) × 0,6 / 1 / 1,6 / 2,4 por 0 a 3 estrelas (`WAVE_SPOILS`, `data_model/night.js`).
- **Recorde por onda** no save (`save.waveBests[onda] = { score, stars }`): o cartão mostra "Best on this wave: X" e, se bater, **NEW BEST!** com o som de nível.
- Contadores da onda: `state.waveStats` (zerado em `startHour`; a maior sequência vem de `addStreakKill`).
Testado no celular (390×780), paisagem (844×390) e desktop: cabe sem rolar; NEW BEST testado com recorde falso.

- **Resultado da onda com 5 estrelas** (pedido do usuário): o dano SOFRIDO na onda conta (soma do dano ÷ vida máxima; curar não apaga). ★ tocha ≤ 50 % · ★ tocha ≤ 20 % · ★ herói ≤ 50 % · ★ herói ≤ 20 % · ★ Rush (20 + 4 × onda)+. Mais de 20 % de dano na tocha ou no herói = sem 5 estrelas. Linhas "Torch damage ≤50/20%" e "Hero damage ≤50/20%" com as estrelinhas de cada uma; pontos (100 − dano %) × 10 / × 5. Prêmio: ouro × 0,5 / 0,8 / 1,1 / 1,5 / 2 / 2,6 por 0 a 5 estrelas; ★★★★★ dá +1 ponto de skill. Contadores em `state.waveStats.torchDamage/heroDamage` (`hurtTorch`, `hurtPlayer`). Testado no celular e em paisagem.

## 2026-11-18 · Brasas contadas na tela final, recordes da noite, estrelas no Santuário, fim da onda no boss

- **Tela final (morte ou amanhecer)**: as Brasas viram uma conta linha por linha, contando com o "tic" da moeda: Night +8, Waves cleared (n × 6), Kills (n ÷ 10), Bosses (n × 15), **Stars (n ★ × 1, novo)**, Dawn +120 (`emberBreakdown` em `data_model/embers.js`; `emberTotal` usa a mesma conta). Depois, selos **NEW BEST** para o que bateu o recorde de uma noite: onda, kills, estrelas e Brasas (`save.stats.bestNight*`; o anterior fica em `run.startBests`). Testado no celular e no desktop.
- **Conquistas novas** (Troféus): 🌟 Starlit (5 estrelas em 3 ondas diferentes) e ✨ Constellation (5 estrelas nas 12 ondas), por `save.stats.fiveStarWaves` (contado dos recordes por onda).
- **Santuário → Façanhas**: grade "WAVE STARS · x/60 ★" com as 12 ondas, o melhor de estrelas e o recorde de pontos de cada; as de 5 estrelas brilham (`renderWaveStars`).
- **Boss morto = fim da onda**: depois do boss (e da conversa, se houver) todos os monstros em campo explodem e a onda fecha na hora (antes: "FINISH THEM", caçar os que sobraram). Sem ouro/XP por eles. Testado: depois do boss da onda 1 a fase foi direto para o fim, com 0 monstros.

- Tempo de leitura: o resultado da onda some sozinho depois de 8 s (era 2,6 s; um toque fecha antes) e conta um pouco mais devagar; na morte, o Altar só abre sozinho 7,5 s depois (era 1,8 s e cobria a conta das Brasas).

- **Altar mais caro**: níveis [15 · 40 · 80 · 140 · 220] (era [10 · 18 · 30 · 48 · 75]); Swiftness e Fury Power [20 · 50 · 95 · 160 · 250]; Insight [25 · 70 · 140 · 230 · 350]. Brasas por morte: 1 a cada 20 (era 10; com ondas de 3 min há ~4.000 mortes numa noite inteira). Altar inteiro: ~5.100 Brasas (era ~1.900); uma noite rende ~40 (morte cedo) a ~520 (amanhecer): antes dava para completar em ~3 vitórias, agora leva dezenas de noites. O 1º nível de cada um continua saindo com uma noite curta.

- **Wicked Oak (Rowan) cresce mais devagar e pelo nível**: cada nível tem `grow` (muda → árvore pequena → adulta que anda, e quanto cada morte adianta): nível 1 = 50 s / 320 s / 0,25 s por morte; nível 5 = 20 s / 110 s / 0,5 s (antes: 20 s / 100 s / 1,5 s por morte em qualquer nível, e com as ondas cheias ela já andava no meio da onda 1). O carvalho ancestral continua só com a evolução Ancient Grove. Teste com nível 1: virou árvore pequena aos 93 s da onda 1 e não chegou a andar nessa onda.

- **Shadow Path reorganizado**: 1ª linha Return Fire → Shadow Raven; 2ª linha, todas as de adaga: Ricochet → Death Mark → Dagger Mastery → Fan of Knives → Charged Dagger Throw (cada uma pede a anterior: Ricochet 2, Death Mark 2, Dagger Mastery 2, Fan of Knives). Clones e esquiva sem mudança. Conferido na árvore (desktop).

## 2026-11-18 · Charged Dagger Throw removido; a carga passou para a Fireballs

A adaga carregada perfurava tudo (no nível 5, "todos os alvos") e nunca chegava ao ricochete, então anulava o Ricochet. A skill saiu (modelo, nó da árvore, imagem e referências). **Fireballs** ganhou a mecânica: segurar o botão da adaga carrega a bola por até 1,4 s (`FIREBALLS.charge` em `passives.js`); carga cheia = 2,4× o tamanho e 4× o dano (a explosão cresce junto) e a bola **não ricocheteia nem atravessa**; um toque rápido continua sendo uma bola normal, com Ricochet. A descrição da Fireballs tem um aviso em vermelho (campo `warning`, também na escolha rápida). Testado: toque = escala 1, 4 saltos; carga cheia = escala 2,4, dano 93 contra 23, 0 saltos. A linha de adagas da Shadow termina na Fan of Knives.

## 2026-11-18 · Boss sozinho, ondas 20% mais curtas
- Com o boss em campo não nasce monstro comum (`updateSpawner`: `if (state.currentBoss) return`); só o que o boss invoca. Os que já estavam em campo continuam. Ao cair o boss, a onda fecha como já fazia (monstros explodem, tempo para pegar baú e itens).
- `waveMinSeconds` 180 → 144 (`difficulty.js`): o boss da onda 1 apareceu aos ~146 s (antes ~181 s); a densidade crescente (`spawnGrowth`) acompanha o novo tempo. Teste no Fast Run: durante o boss os monstros comuns só diminuíram (10 → 1) e depois do boss a fase foi direto para o fim da onda.
- Bosses com +15% de vida (`BOSS_FOCUS_BONUS` em `bosses.js`), já que a luta agora é o foco (sem monstros comuns): multiplicadores finais rival 1ª hora ×1,96, Demon Lord ×2,76, Brutos ×2,53, Blood Countess ×2,07, The Long Night ×2,07, revanche final e outros ×2,3.

## 2026-11-18 · Baú diário com sequência de 7 dias (D1 e D7)

Item 2 do mínimo antes do relançamento (5.9). Um baú por dia (data local), pago em Brasas: **20 · 30 · 40 · 55 · 70 · 90 · 200** do dia 1 ao 7 (o dia 1 já paga a 1ª melhoria do Altar; o dia 7 paga o Torch's Call). Abrir em dias seguidos sobe a sequência; pular um dia volta ao dia 1 ("Streak lost"); depois do dia 7 recomeça no 1.
- **Onde:** faixa acima do PLAY na tela inicial e abaixo das Brasas na tela final. Fechado: brilha, 🎁 balança, "OPEN · 🔥 N". Aberto: **COME BACK TOMORROW · Day N chest: 🔥 X · in Nh** (o gancho para o D1).
- **Arquivos:** `data_model/daily.js` (prêmios e regras), `js/ui/daily.js`, `css/components/daily.css`, `save.daily = { lastDay, streak }` em `save.js`, ligações em `screens.js` e `last_torch.html`.
- **Celular em pé:** os botões da tela final (HUNT AGAIN, Altar...) ficam presos no rodapé (`position: sticky`), porque a faixa empurrava o HUNT AGAIN para fora da tela no 360×640.
- **Verificado** no pacote (Chrome headless, 1280×720, 360×640, 390×844, 844×390): ontem dia 2 → hoje abre o dia 3 (+40); abrir na tela final atualiza "You have N" e "You can buy"; sem erros no console.
- **Não verificado:** celular real; virada da meia-noite com o jogo aberto (a faixa só se atualiza ao voltar ao menu ou ao fim da noite).

## 2026-11-18 · Avgustino só por Brasas (350)

Decisão do dono: Brutos e Azael continuam por conquista (são enfrentados no jogo), o Rowan continua por "Survive Wave 1", e o **Avgustino passa a sair só por Brasas**, como meta de médio prazo (alguns dias de noites + baú diário).
- `emberPrice: 350` em `data_model/characters/avgustino.js`; a conquista Blood Moon (onda 4) segue como troféu, mas não libera mais herói. Quem já o tinha continua com ele.
- **Cartão bloqueado:** "🔥 120/350"; com Brasas suficientes o cartão brilha, mostra "🔥350" e um toque compra, com o mesmo prêmio "NEW HERO UNLOCKED" das conquistas (`heroOffer`/`buyHero` em `js/ui/heroes.js`). No celular deitado o preço fica dentro do cadeado.
- **Tela final:** linha de meta "🔥 Father Avgustino · N embers to go" com barra, acima da conquista mais próxima.
- Verificado no pacote (1280×720, 360×640, 844×390): 400 → compra → 50 Brasas, herói liberado, prêmio aparece; onda 5 não libera mais; save antigo com o herói continua com ele; sem erros.

## 2026-11-18 · Conversion: o Avgustino converte monstros com uma reza

Ideia do dono. Passiva nova, **só do Avgustino**, no ramo Light (linha 5, pede Silent Vigil; conta como skill ativa, +1 ponto). A cada 9 s (a 1ª aos 3 s) ele reza pelo monstro **comum** mais perto (até 260): um feixe de luz desce, "CONVERTED", sino. O monstro sai da horda **sem morrer** (sem ouro/XP) e passa para o lado dele **até o fim da noite**, com ×3 de vida.
- **Acumulam:** até 6 ao mesmo tempo (um que morre libera a vaga). Ficam com auréola e anel dourado; a barra de vida só aparece quando apanham. Fora da caçada voltam com a vida cheia; 2 s sem apanhar, curam 4%/s.
- **Lutam:** vão atrás do monstro mais perto (até 360) e batem a cada 0,8 s com 1,4× o dano que tinham; sem inimigo, seguem o herói. As mortes que causam valem como do herói.
- **Provocam:** monstros comuns a até 220 de um convertido vão atrás dele e o machucam no contato. Bosses, elites e sombras do rival não são convertidos nem provocados.
- **Arquivos:** `CONVERSION` em `data_model/passives.js`, nó em `data_model/tree.js`, `js/systems/conversion.js`, provocação em `enemies.js`, desenho em `js/render/entities.js`, `state.converts`.
- **Verificado** (Chrome headless, 90 s na onda 1, herói parado com dano recebido −90%): os convertidos chegam a 4–5 juntos, apanham dos provocados, se curam e morrem; sem erros. **Não verificado:** jogando de verdade; equilíbrio nas ondas finais; Continue de uma noite salva (os convertidos não são guardados e se perdem).

## 2026-11-18 · Herói bloqueado mostra como desbloquear

Pedido do dono. O cartão de herói bloqueado agora é clicável: o toque troca o painel das barras por **"🔒 NOME · HOW TO UNLOCK"**, com cada requisito (ícone, texto, "x/y · %" e barra) e, embaixo, a habilidade do herói. Os requisitos vêm das conquistas que liberam o herói (`ACHIEVEMENTS` com `hero`) e do `emberPrice`; com Brasas suficientes aparece **UNLOCK · 🔥 350** no painel (a compra saiu do toque no cartão). Tocar num herói liberado volta às barras. Arquivos: `js/ui/hero_stats.js` (`unlockRequirements`), `js/ui/heroes.js`, `js/ui/buttons.js`, `start-screen.css`. Verificado em 1280×720, 360×640 e 844×390, sem erros. Hoje cada herói tem um requisito só; para ter vários (ex.: "Beat the game" + "Kill 300 vampires"), basta outra conquista com o mesmo `hero`.

## 2026-11-18 · Estrelas de dano mais fáceis

Pedido do dono: 5 estrelas quase nunca saíam (o dano soma na onda inteira e curar não apaga). `WAVE_SPOILS.damageGoals` [0,5 · 0,2] → **[0,75 · 0,4]** (`data_model/night.js`): ★ tocha ≤75%, ★ tocha ≤40%, ★ herói ≤75%, ★ herói ≤40%, ★ Rush. O cartão do resultado já lê o valor ("≤75/40%"). Não medido com jogador de verdade; se ainda ficar raro, o próximo passo é a estrela de Rush (20 + 4 × onda).

## 2026-11-18 · Estrelas de cada onda na barra de ondas

Ideia do dono: o jogador se situar ("nessa onda fui bem"). Embaixo de cada marca de onda já terminada na barra do HUD aparece **★N** (as estrelas do resultado daquela onda), e a marca muda de cor: cinza (0–1), laranja (2–3), amarelo (4), claro brilhando (5). Guardado em `state.run.waveStars` (`grantWaveSpoils`, `js/ui/camp.js`), desenhado em `js/ui/hud.js` + `css/components/hud.css` (só CSS, sem custo no jogo). A barra só ganha altura depois da primeira onda com estrelas. Verificado em 1280×720, 360×640 e 844×390, sem erros.

## 2026-11-18 · Conversion: cada convertido luta com o próprio golpe, e sem travar

Pedido do dono: o convertido só "encostava" (dano invisível) e os monstros pareciam travados.
- **Golpes próprios** (`fight` em `js/systems/conversion.js`): atiradores (bruxa, cavaleiro sem cabeça, necromante, pedra do golem) param a uma distância e atiram um tiro que persegue o monstro (o tiro refletido do Mirror Ward, com o desenho do próprio monstro e halo dourado; nunca fere o herói). Treant: soco em leque com os braços subindo. Golem: pancada em área com as duas mãos de perto e pedra de longe. Espectro e lobo zumbi: miram e investem atravessando, ferindo cada monstro no caminho. Inchado: corre até a horda e explode (morre no estouro). Os outros mordem com um tranco para a frente e faíscas douradas.
- **Sem travar:** o monstro provocado para encostado no convertido (antes entrava no meio dele e todos se empilhavam), e convertidos e monstros se empurram.
- **Verificado** (Chrome headless, um de cada tipo contra 6 esqueletos): todos convertem e atacam do seu jeito (golem 3 pancadas + pedra, treant 4 socos, espectro 6 e lobo 4 investidas, cavaleiro 5 tiros, inchado explode); sem erros. **Não verificado:** jogando de verdade; equilíbrio (a bruxa, frágil, morre rápido; o inchado é um uso só).

## 2026-11-18 · Gudran, novo herói (500 Brasas)

Pedido do dono: trazer o Gudran do yara-rpg (chefe final do Castelo de Gudran) como herói, por **500 Brasas**.
- **Arte:** o yara-rpg só tinha um retrato em pixel art (`images/special_monsters/gudran.webp`), não um boneco. Copiei-o para `images/characters/gudran-small.webp` (24 KB) e fiz um **boneco 2.5D novo** na biblioteca (`_library/characters/gudran/`: `gudran_visual.js`, `gudran25d.js`, `art_reference/` com a ficha e o retrato), derivado do Avgustino (túnica longa em três peças, braços, pernas): sem chapéu, cabelo branco em massa única que cai atrás, sobrancelhas brancas franzidas, olhos escuros, bigode e barba longos, túnica preta com barra, gola, punhos e cinto **dourados**, pingente de gema azul e **cajado com esfera azul** (`weapons/staff`). Sincronizado nos dois jogos (`sync.rb`) e adicionado ao tuner da biblioteca (`tools/tuner.html?model=gudran`).
- **Jogo:** `data_model/characters/gudran.js` (`emberPrice: 500`, `order: 3.5`), lista em `characters/index.js`, `heroes.js`, `render/bodies.js`, paleta de sombra para o Shadow Clone e falas próprias do duelo contra o Azael (`dialogues.js`).
- **Números:** canhão de vidro: 80 de vida (os outros 90–), velocidade 110, magia 42 (a maior; Avgustino 30), alcance da lâmina 58 e da adaga 340, dano de lâmina 20. **Fúria:** a mesma mecânica `consecration` do Avgustino, com o nome "Lord's Decree" e cor azul (uma Fúria nova pediria código novo). A adaga é a comum, com dano de magia.
- **Verificado** (Chrome headless): tocar no cartão bloqueado mostra o requisito, comprar com 520 Brasas deixa 20 e libera o herói com o prêmio; jogar com ele roda uma noite sem erros (desktop e celular em pé). O desenho foi conferido no tuner, nas duas câmeras.
- **Não verificado / a melhorar:** o desenho é uma primeira versão (as mechas de cabelo viram "lâminas" cinzas nas vistas de lado; falta o manto largo e bordado da arte); equilíbrio jogando; as falas contra os outros bosses usam as padrão; no celular em pé a fileira de 6 heróis ficou apertada.

## 2026-11-19 · Gudran: ataque de energia azul, esfera arcana e a Runa Soberana

Pedido do dono: o Gudran não corta, só usa magia; no lugar da adaga ele lança outra coisa; e uma passiva só dele no Curse Path.
- **Ataque básico arcano** (`basicAttack: 'arcane'` no `gudran.js`, `js/systems/arcane.js`, `js/render/arcane.js`): ele ergue o cajado (a mesma animação de golpe do boneco, sem o arco de corte) e solta um **raio de energia azul** no monstro mais perto, dentro de 230 px (o círculo vermelho dele). Dano de **magia** (número azul) = 70% da magia dele; o 3º raio do combo é maior (×1,7) e empurra mais. Cada acerto carrega a Fúria e conta para o execute. Números em `ARCANE_BOLT` (`passives.js`).
- **Esfera arcana no lugar da adaga** (`thrown: 'arcane'`, `_library/weapons/arcane_orb/`): uma esfera azul brilhante, mais lenta e maior que a adaga, que **atravessa o primeiro monstro**. É um estilo do arremesso, então as skills de adaga (Ricochet, Fan of Knives, Dagger Mastery) valem para ela, e ela aparece na mão livre dele.
- **Runa Soberana** (Curse Path, só do Gudran, linha 5, pede Arcane Study, 4 pontos): os raios furam +1 monstro e **estouram em luz azul** onde acabam (60% do dano do raio, raio 70 px). Dados em `sovereignRune` (`passives.js`), nó em `tree.js` (`hero: 'gudran'`).
- **Árvore:** o ramo Blade e a Flaming Sword ficam selados para ele (como no Rowan), porque ele não tem lâmina.
- **Verificado** (Chrome headless): os raios saem e matam, a Fúria carrega, a esfera tem estilo `arcane` e 1 furo, o nó da runa custa 4 e o Blade está selado; sem erros. **Não verificado:** equilíbrio jogando; o ícone da Runa na árvore (usa o emoji 🔷, sem imagem); o desenho da esfera de perto.

## 2026-11-19 · Gudran: segunda versão da arte (folha de poses)

Com a folha `Gudran-poses.jpeg`: **manto largo nos ombros** com borda dourada bordada, **barba única larga que afunila em ponta**, cabelo branco que cai atrás (as mechas deixaram de ser cinzas), **mangas de sino** com punho dourado e **duas faixas douradas bordadas** na frente da túnica. Conferido no tuner. Falta: o cajado com o gancho em meia-lua (usa a espiral do cajado do Rowan), as costas com o manto cobrindo mais, e a pose de conjurar com faíscas na esfera.

## 2026-11-19 · Gudran: Fúria em raio azul e ataque básico mais rápido, sem "cajadada"

- **Fúria "Lord's Decree" agora é um raio** (`kind: 'beam'`, `js/systems/fury.js` + `renderFuryBeam` em `js/render/arcane.js`): ele aponta o cajado e solta um raio azul contínuo que **cruza a tela inteira** por ~7 s. Ele fica **plantado** e só mira: o raio gira atrás do mouse (ou do joystick) a 2,6 rad/s, como um farol. A cada 0,15 s todo monstro na linha leva 32% da magia (bosses e elites +25%); leva 40% menos dano enquanto atira; o ataque básico para durante o raio. Números em `fury` de `gudran.js`.
- **Ataque básico mais rápido:** `attackCooldown` 0,75 → 0,5 (≈ 1,7 raios/s medidos), dano do raio 70% → 60% da magia.
- **Sem cajadada:** o boneco do Gudran ganhou uma pose própria (`swordRest` em `gudran25d.js`): em repouso o cajado fica em pé; ao atacar ele só **ergue o cajado com a esfera à frente**, e o raio sai da esfera (com um clarão), sem varrer. Os raios nascem mais alto, na ponta do cajado.
- **Verificado** (Chrome headless): o raio liga, acerta os 6 monstros alinhados, o herói não sai do lugar, gira para baixo seguindo a mira e acerta os de lá, termina no fim da Fúria; sem erros. **Não verificado:** a pose do cajado erguido de perto no jogo; mira por joystick no celular; equilíbrio.

## 2026-11-19 · Gudran: escudo azul invulnerável durante o raio

Durante o Lord's Decree um **escudo azul** envolve o Gudran (bolha com brilho, borda que pulsa e arcos girando) e ele fica **invulnerável** enquanto o raio dura (`player.iFrames` mantido em `updateBeam`, `js/systems/fury.js`; desenho em `renderFuryBeam`). Testado com um monstro colado nele por 2 s: a vida não mudou. A tocha continua podendo ser atacada.

Durante o raio ele também **não pode dar dash nem lançar a esfera arcana** (`tryDash` e `throwKnife` retornam se `beamActive()`), além de não andar nem atacar: só mira. Testado: dash e esfera bloqueados durante o raio e liberados depois.

## 2026-11-19 · Gudran: ataque erguendo o cajado (sem varredura de espada)

O ataque básico usava o golpe de espada do motor: a varredura e as cópias fantasmas da arma faziam parecer "outro cajado dando um golpe de lado". Agora há um movimento próprio no motor dos heróis, **staffCast** (`_library/characters/hunter/hero25d.js` + `hero25d_visual.js > moves`): ele ergue o cajado devagar com a esfera acima da cabeça (0,5 s), no alto o cajado aponta para a frente e **o raio sai da esfera** (impacto), segura e abaixa. O jogo dispara o raio no impacto (`startMove` em `combat.js`) e usa um contador de combo próprio (`player.arcaneStep`), porque mudar o `comboStep` disparava a varredura. **Mais lento:** 1 raio por segundo (`attackCooldown` 1,0), mais forte (100% da magia). Conferido em 4 quadros no jogo (repouso, erguendo, impacto, volta), sem cópias fantasmas.

## 2026-11-19 · Gudran: Escudo de Runas no clique (no lugar da esfera)

Escolha do dono. O clique (ou o botão do canto no celular) agora ergue o **Escudo de Runas**: 6 runas azuis giram em volta dele por 4 s; quem encosta leva 60% da magia e é jogado para fora (o mesmo monstro só leva outro toque depois de 0,45 s). Recarga 8 s, no mesmo relógio do Axe Quake e do Root Snare (o anel do botão mostra a recarga, ícone 🔷). Não sai durante o raio da Fúria. Números em `abilities.runeShield` (`gudran.js`), lógica em `updateRuneShield` (`js/systems/arcane.js`), desenho em `renderRuneShield`. Com isso ele passa a ser `noKnives`: **as skills de adaga ficam seladas**, além do ramo **Blade** (conferido no teste). A esfera azul fica só na mão livre, como enfeite. Testado: o escudo liga, 8 monstros em volta levaram dano, nenhuma adaga sai; sem erros.

## 2026-11-19 · Gudran vira para o alvo ao atacar andando

Andando de costas para o monstro ele atacava sem se virar (o giro para o alvo vinha só com o golpe de espada). Agora, durante o `staffCast`, o boneco gira rápido para o alvo (`hero_anim.js`, mesmo jeito do arremesso) e, quando o ataque termina, volta a olhar para onde anda. Conferido em 4 quadros: andando para a esquerda com o monstro à direita, ele vira, atira para a direita e volta.

## 2026-11-19 · Gelo mais bem feito

O monstro congelado (Soul Nova evoluída, `e.frozen`) era só um círculo azul. Agora é um **bloco de gelo** (`renderIce`, `js/render/entities.js`): poliedro irregular (um diferente por monstro), com degradê, facetas, reflexo em faixa, contorno claro, **cristais** em volta e **brilhos** piscando; névoa fria no chão. Ao congelar, o bloco cresce com um pequeno repique e **cacos voam para fora** com um anel de gelo no chão; nos últimos 0,9 s aparecem **rachaduras** piscando e, no último 0,5 s, ele esmaece e derrete. Só polígonos e riscos (sem imagem), só nos poucos monstros congelados. Conferido em 4 momentos no jogo, sem erros.

## 2026-11-19 · Soul Nova desligada

Pedido do dono: a **Soul Nova** (e a evolução que congela) saiu da árvore do Curse Path, **comentada** em `data_model/tree.js` (os dois nós `soulNova` e `novaEvolve`, com a instrução para voltar). Nenhum outro nó dependia dela (sem links quebrados, conferido no jogo). O dado e o código dela (`powers.js`, `renderIce`) ficam, só que sem nó na árvore ninguém a aprende; o gelo novo fica sem uso até outra skill congelar.

## 2026-11-19 · Absolute Zero como skill própria

O Absolute Zero era a **evolução** da Soul Nova (desligada). Virou uma skill própria (`absoluteZero` em `data_model/powers.js`, lógica `updateAbsoluteZero` em `js/systems/powers.js`), no lugar da Soul Nova na árvore do Curse Path, ligada ao **Cold Moon (Chill Aura) nível 2** como a Soul Nova era. 5 níveis: recarga 14 → 10 s, raio 170 → 250, dano 1,4× → 2,2× da magia, congelamento 1,5 → 2,5 s (o último nível iguala o antigo Absolute Zero). Boss só leva o dano. Custo 4 pontos (poder ativo do ramo). Usa o bloco de gelo novo. Testado: nó fechado sem o Cold Moon 2, abre com ele, o pulso congelou 5 monstros aos 7 s; sem erros.

## 2026-11-19 · Caminhos por personagem: afinidade (+5%) e ramos proibidos

Pedido do dono. Cada herói tem `affinity` (ramo com +5% de dano) e `sealedBranches` (ramos proibidos) no próprio arquivo:

| Herói | +5% | Proibido |
|---|---|---|
| Demon Hunter | — | nenhum (todos abertos) |
| Avgustino | Light | Curse |
| Gudran | Curse | Light e Shadow (e Blade: sem lâmina) |
| Rowan | Nature | Flame (e Blade: cajado não corta) |
| Azael | Shadow | Light |
| Brutos | Blade (inclui o golpe da lâmina) | Shadow |

- **Bônus:** `AFFINITY_BONUS` (0,05) em `data_model/tree.js`; os poderes e evoluções do ramo batem 5% mais forte (`POWER_BOOST`, aplicado em `getPowerLevel`, preenchido em `refreshModifiers`); no Blade Path também +5% de dano da lâmina. Medido: Holy Water do Avgustino 1,10× → 1,155×. As passivas do ramo (não poderes) não recebem o bônus.
- **Proibido:** usa o selo que já existia (`isRestricted`), com o texto "X cannot walk the Curse Path."; a skill Fury, do ramo Blade, continua aberta para todos.
- **Onde aparece:** tela de escolha, abaixo das barras ("🌙 CURSE +5%  ⛔ BLADE  ⛔ LIGHT"; Demon Hunter: "✦ ALL PATHS OPEN"); árvore no desktop, etiqueta no rótulo do ramo ("+5% DMG" / "⛔ LOCKED", ramo apagado); árvore no celular, aba com "+5%" e aba proibida apagada com ⛔. Conferido nos 6 heróis, desktop e celular, sem erros.

- **Rowan (19/11):** no lugar do +5% de dano no Nature Path, as **raízes seguram 20% mais tempo** (`affinityMods: { rootSeconds: 0.2 }` e `affinityLabel: "ROOTS +20%"` no `rowan.js`; vale para todo `rootEnemy`: Root Snare, Grasping Roots, carvalho...). Qualquer herói com `affinityMods` troca o bônus de dano por esses modificadores; os rótulos usam `affinityLabel`. Testado: Rowan `rootSeconds` 0,2 e nenhum bônus de dano; Avgustino segue com +5%.

- **Correção no celular (19/11):** nas abas da árvore o texto do bônus ia para a bolinha de contagem e virava um bloco por cima do ícone ("ROOTS +20% · 1"). Agora a bolinha mostra só a contagem (ou ⛔ no ramo proibido) e o ramo preferido ganha uma **★ dourada** no canto e borda dourada (o texto completo fica na tela de escolha e no rótulo do ramo no desktop). Conferido em 360×640, 390×844 e 844×390.

## 2026-11-19 · Teste automático e correção do rival

Um robô jogou noites com Demon Hunter, Gudran e Rowan (desktop). Achou um erro de desenho com o Rowan, que aparecia a cada quadro quando o rival (Azael) atacava: `comboStep` do boss podia ser indefinido e virar `NaN` (`boss_ai.js`), quebrando a animação do boneco (`hero_anim.js`). Corrigido nos dois pontos (`?? 1` e proteção no motor). Os outros heróis não deram erro, sem números inválidos nem monstros em excesso.

**Pendente:** testar os outros heróis no celular; a tela inicial em pé com 6 heróis ficou apertada (ideia: grade 3×2 e compactar o resto da tela).

## 2026-11-19 · Arte nova da Conversion e da Sovereign Rune

O dono atualizou `images/buttons/conversion.webp` (mãos em oração) e `sovereign-rune.webp` (pedra com runa azul). Gerei as versões pequenas de 128 px (`*-small.webp`, 4 a 5 KB) e liguei aos nós `conversion` e `sovereignRune` em `data_model/tree_images.js`. Conferido na árvore do Avgustino (Light Path) e do Gudran (Curse Path): os dois ícones aparecem no lugar do emoji.

- **Gudran (19/11):** o **Shadow Path** também ficou proibido para ele (`sealedBranches: [blade, light, shadow]`).

## 2026-11-19 · Troféus pagam Brasas

Pedido do dono: pouco, para não ajudar demais, mas dar motivo para conquistar os troféus.
- **Valores** (`ACHIEVEMENT_EMBERS` em `data_model/sanctuary.js`): troféus 10 a 80 (primeira noite e ondas iniciais 10; mortes 15 a 40; ondas 6/20 20 e 50; Juramentos 20 cada; evoluir, baús e elites 15; 5 estrelas 30 e 80; Escuridão 3 e 8 30 e 80), façanhas 5 a 30 (Triple Cut 5 até Annihilation 30). **Total 785 Brasas**, uns 15% do Altar (~5.100).
- **Heróis:** troféu que libera um herói jogável paga 0 (Rowan, Brutos, Azael); o que libera herói guardado paga normal.
- **Pagamento:** uma vez por troféu (`save.achievementPaid`), em `checkAchievements`. **Retroativo:** quem já tinha troféus recebe tudo na primeira abertura depois da atualização, com um aviso "Trophy rewards +N embers". Não paga de novo ao reabrir.
- **Onde aparece:** aviso do troféu e lista da tela final ("... +25 🔥"), e o Santuário mostra "🔥 +25" (cinza "received" depois de pago).
- **Verificado:** save antigo com 4 troféus recebeu 35 (100 → 135) e reabrir não pagou de novo; um troféu novo pagou na hora; total 785; Santuário em desktop e celular, sem erros.
