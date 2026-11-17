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

## Decisão do dono (17/11)

Sem tutorial de joystick/dash: a interface é simples. Os itens "primeiros monstros mais fracos" e "primeiro nível em 15 s" ficam para depois de o dono jogar o pacote e dizer se o começo está difícil ou lento. A Fase 2 está feita no que importa.

## Próximo passo
Fase 2: primeiro minuto no celular. Antes, jogar o pacote novo por uma noite para confirmar que nada quebrou, e enviar à CrazyGames.
