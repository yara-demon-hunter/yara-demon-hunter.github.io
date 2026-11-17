# Checklist geral — Last Torch rumo ao Full Launch

`[x]` feito · `[ ]` falta · `[~]` em andamento · `[-]` dispensado

Detalhes: [02_plano_de_acao.md](02_plano_de_acao.md) · números: [04_progresso.md](04_progresso.md) · retenção: [05_retencao_d1_d7.md](05_retencao_d1_d7.md)

## Metas

| | Desktop | Celular |
|---|---|---|
| Nota hoje | 6/15 | 4/15 |
| Playtime | 8m54s → **11m+** | 3m48s → **8m+** |
| D1 | 1,64% → **4%+** | 1,16% → **3%+** |
| Conversão | 49% → **65%+** | 18% → **50%+** |
| CTR | 1,3% → top 20% Strategy | |

---

## Já existe no jogo
- [x] CONTINUE (noite salva no acampamento)
- [x] heróis liberados por conquista
- [x] Santuário: troféus, façanhas, bestiário
- [x] níveis de Escuridão depois da vitória
- [x] Presságios (base do desafio do dia)

## Fase 1 — Carregamento
- [x] JS e CSS em um arquivo só (esbuild no build)
- [x] esbuild baixado sozinho pelo build
- [x] `--serve` para jogar o pacote local
- [x] ícones da árvore baixam depois da caçada começar
- [x] medido: 4G lento 6,9 s → 4,0 s · 371 → 9 pedidos
- [-] adiar arte do Azael e dos bosses (já não carregava antes)
- [ ] teste pixel a pixel antes/depois
- [ ] noite inteira jogada no pacote novo, sem erro

## Fase 2 — Primeiro minuto
- [x] mãozinha "Upgrade your skills" na onda 1 (some ao abrir a árvore)
- [x] dica da tocha em toda onda 1
- [x] duelo da hora 1 curto na primeira noite
- [-] tutorial de joystick e dash
- [ ] escolha de skill automática na 1ª noite? (decidir depois de jogar)
- [ ] monstros iniciais mais fracos? (só se o começo estiver difícil)
- [ ] primeiro nível em até 15 s? (só se estiver lento)
- [ ] testado em celular real, em pé e deitado

## Fase 3 — Progresso permanente (D1)
- [x] Brasas ao fim de toda noite (vitória ou morte)
- [x] Brasas no save
- [x] tela do Altar no menu
- [x] +5% vida (5 níveis)
- [x] +2% velocidade de movimento (5 níveis)
- [x] +5% dano mágico (5 níveis)
- [x] +5% alcance da adaga (5 níveis)
- [x] +3% dano durante a Fúria (5 níveis)
- [x] +6% distância do dash (5 níveis)
- [x] +1 carga de dash (1 nível)
- [x] +5% dano (5 níveis)
- [x] +1 ponto de skill no início (5 níveis)
- [x] tela inicial mostra os pontos iniciais ao lado da Escuridão, entre parênteses
- [x] tocha mais forte (5 níveis)
- [x] 1ª compra possível depois de 1 noite (8 Brasas por noite, a 1ª melhoria custa 10)
- [ ] balanceamento conferido (jogar com tudo no máximo; valores em `data_model/embers.js`)

## Fase 3b — Tela de fim de noite
- [x] Brasas ganhas com animação
- [x] "Você pode comprar…"
- [ ] próximo herói e quanto falta
- [ ] o que espera amanhã (baú, desafio)
- [x] botão HUNT AGAIN grande (já existia)
- [ ] CONTINUE bem visível no menu

## Fase 4 — Motivo diário (D1 e D7)
- [ ] baú diário
- [ ] sequência de 7 dias (zera se pular)
- [ ] prêmio especial no dia 7
- [ ] desafio do dia (Presságios + semente da data)
- [ ] desafio muda à meia-noite
- [ ] resultado do dia ao lado do melhor e dos dias anteriores
- [ ] desafio paga mais Brasas
- [ ] 3 missões diárias, sorteadas pela data
- [ ] progresso das missões visível
- [ ] missões pagam Brasas
- [ ] testado mudando a data do sistema

## Fase 4b — Metas e competição (D1 e D7)
- [ ] silhueta + condição dos heróis bloqueados
- [ ] troféus pagam Brasas
- [ ] recordes pessoais (onda, mortes, sequência)
- [ ] aviso "NOVO RECORDE"
- [ ] botão de compartilhar resultado do desafio
- [-] leaderboard da CrazyGames (só por convite)

## Fase 4c — Salvar na conta
- [ ] decidir: integrar só o módulo de dados do SDK?
- [ ] save na conta + `localStorage` de reserva

## Fase 5 — Capa (CTR)
- [ ] 2–3 capas novas testadas em miniatura
- [ ] vídeo de 15–20 s só com ação
- [ ] trocar no portal

## Fase 6 — Interface no celular em pé (conversão e playtime do mobile)
Achados do dono em 17/11, olhando o responsivo.

**Árvore de skills**
- [ ] Light Path vaza para fora do quadro da árvore
- [ ] textos longos de skill encolhem os nós e forçam rolagem: limitar o texto (e/ou mover o detalhe para um painel) e manter o tamanho dos nós
- [ ] conferir os 6 ramos em pé e deitado, sem rolar para ver a árvore

**Menus apertados**
- [ ] revisar espaçamento e tamanho de toque: status, árvore, acampamento, heróis, Altar, Santuário, fim da noite
- [ ] menos texto por tela no celular em pé

**Barra de vida do boss**
- [ ] em pé: ficar **abaixo** da barra de status do herói, não ao lado apertada
- [ ] retrato do boss ao lado da barra (já existem retratos de alguns: `BOSS_MODELS.portraitImage`)
- [ ] bosses sem retrato: placeholder em `images/` para o dono trocar depois
- [ ] deitado e desktop continuam como estão (ou melhorados), sem regressão

**Tuner da tela de jogo**
- [ ] **como uma aba nova no sandbox** (`mini_games/last_torch/_sandbox`), e não uma ferramenta separada
- [ ] ferramenta como a dos personagens, só para a tela de jogo (HUD e controles)
- [ ] mexer no tamanho de cada elemento
- [ ] arrastar botões e peças do HUD
- [ ] ver em pé e deitado, em tamanhos de celular diferentes
- [ ] botão "copiar" que gera as medidas/posições para colar e pedir à IA que aplique
- [ ] checar o que já existe: o editor de controles de toque das Settings (`touch.scale` e `touch.positions`)

## Antes de relançar
- [ ] conferir o mínimo de pontos das regras novas (4 métricas)
- [ ] build novo gerado e testado
- [ ] 0 erros no console numa noite inteira
- [ ] teste com uma pessoa nova no celular
- [ ] anotar versão e data enviadas
- [ ] commit das mudanças

## Depois do Full Launch
- [ ] pedir convite de leaderboard ao suporte
