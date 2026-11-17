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
- [x] +5% dano (5 níveis)
- [x] +1 ponto de skill no início (3 níveis)
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

## Antes de relançar
- [ ] conferir o mínimo de pontos das regras novas (4 métricas)
- [ ] build novo gerado e testado
- [ ] 0 erros no console numa noite inteira
- [ ] teste com uma pessoa nova no celular
- [ ] anotar versão e data enviadas
- [ ] commit das mudanças

## Depois do Full Launch
- [ ] pedir convite de leaderboard ao suporte
