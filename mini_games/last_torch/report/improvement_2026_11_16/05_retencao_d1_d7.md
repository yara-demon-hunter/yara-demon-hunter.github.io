# 5. Retenção: como subir o D1 e o D7

**Criado em:** 17/11/2026
**Decisão:** implementar tudo o que está abaixo, na ordem da seção 5.9.

## 5.1 O que são

- **D1:** % de jogadores que voltam no dia seguinte à primeira sessão. Hoje: **1,64%** desktop, **1,16%** celular (geral 1,40%).
- **D7:** a mesma conta para o sétimo dia. Hoje: 0,00% (dados ainda recentes).
- **Referência da CrazyGames:** jogos bons chegam a 10–15% de D1.

## 5.2 Por que o D1 está baixo

O jogador não tem **algo que perde se não voltar** nem **algo que ganha voltando**:

- ouro, skills e relíquias somem ao fim da noite;
- a árvore volta ao zero;
- nada muda de um dia para o outro;
- o que fica (troféus, heróis) não aparece como meta na tela.

O jogador que morreu na onda 2 não volta mais forte no dia seguinte.

---

## 5.3 Progresso permanente — maior efeito no D1

**Brasas + Altar**

- Toda noite, **vencendo ou morrendo**, o jogador ganha Brasas, proporcionais à onda alcançada e aos monstros mortos.
- No menu, um **Altar** compra melhorias permanentes pequenas, com 5 níveis cada e preço crescente:
  - +5% vida
  - +5% dano
  - +1 ponto de skill no início da noite
  - tocha com mais chama
- A **primeira compra** tem que estar disponível depois da primeira noite, mesmo morrendo na onda 1.
- Por que funciona: "amanhã volto mais forte". É o motor de retenção de praticamente todo jogo do estilo survivors.

## 5.4 Motivo marcado no relógio — D1 e D7

- **Baú diário com sequência:** o prêmio cresce do dia 1 ao dia 7. O dia 7 tem algo especial (herói ou aparência). Puxa o D7 diretamente.
- **Desafio do dia:** uma noite com regra fixa que muda à meia-noite, igual para todos (semente = data). Base: os Presságios que já existem (`OMENS` em `data_model/night.js`). Paga mais Brasas que uma noite comum.
- **Missões diárias:** 3 tarefas curtas por dia, que pagam Brasas. Exemplos: "mate 300 monstros", "chegue à onda 4 com o Rowan", "abra 3 baús".

## 5.5 Metas visíveis — D1 e D7

- **Próximo herói:** silhueta e condição na tela de heróis e no fim da noite ("Avgustino: chegue à onda 4 — você chegou à 3"). Os heróis já existem; falta mostrar.
- **Troféus que pagam:** os troféus do Santuário passam a dar Brasas, além de registrar.
- **Recordes pessoais:** melhor onda, mais monstros mortos e maior sequência, com aviso "NOVO RECORDE" no fim da noite e no menu.
- **Compartilhar resultado:** botão que copia um texto curto do desafio do dia para colar em chat e redes.
- **Escuridão:** os níveis já existem depois da vitória; é a meta de longo prazo de quem já venceu.

> O leaderboard do SDK da CrazyGames só existe para **jogos convidados**. Pedir convite ao suporte depois do Full Launch. Enquanto isso, a competição vem dos recordes, do desafio do dia e do compartilhar.

## 5.6 Fechar a sessão com um gancho

- A tela de fim de noite mostra, nesta ordem:
  1. Brasas ganhas, com animação;
  2. o que dá para comprar agora;
  3. o próximo herói e quanto falta;
  4. o que espera amanhã ("Baú do dia 2 amanhã", "Novo desafio em 6 h");
  5. botão grande **HUNT AGAIN**, maior que os outros.
- Quem sai no meio da noite já tem o **CONTINUE**; deixá-lo bem visível no menu.

## 5.7 Não perder o progresso

- Dentro do iframe da CrazyGames, Safari e janela anônima podem apagar o `localStorage`. Quem volta e encontra tudo zerado não volta de novo.
- O **módulo de dados do SDK** salva na conta da CrazyGames. Ele será obrigatório no Full Launch de qualquer jeito.

## 5.8 Primeira sessão melhor (D1 indireto)

Quem não gostou do primeiro minuto não volta. Já feito: carregamento mais rápido, mãozinha do medalhão, duelo curto na primeira noite (ver [04_progresso.md](04_progresso.md)).

## O que não adianta agora

- Conteúdo para as horas finais: a maioria sai antes da onda 3.
- Notificações: o portal não oferece.

---

## 5.9 Ordem de implementação

1. Brasas + Altar, junto com a tela de fim de noite
2. Baú diário com sequência de 7 dias
3. Desafio do dia
4. Metas visíveis (próximo herói, recordes, troféus que pagam)
5. Missões diárias
6. Compartilhar resultado
7. Salvar na conta (SDK)

Os itens 1 e 2 são o mínimo antes do relançamento.

---

## 5.10 Checklist

No [06_checklist.md](06_checklist.md), junto com todas as outras fases (Fases 3 e 4).
