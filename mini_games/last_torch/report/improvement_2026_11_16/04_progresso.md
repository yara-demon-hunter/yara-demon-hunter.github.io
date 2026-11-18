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
