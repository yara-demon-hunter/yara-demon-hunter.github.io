# 1. Diagnóstico

## 1.1 Quanto falta de verdade

A nota de cada aparelho é a soma de três métricas, cada uma valendo de 1 a 5. O mínimo é 9.

### Desktop: 6/15, faltam 3 pontos

| Métrica | Hoje | Nota | Para nota 3 | Quanto falta |
|---|---|---|---|---|
| Average Playtime | 8m54s | 2 | 9m53s | +59s (+11%) |
| Retention D1 | 1,64% | 2 | 3,23% | quase o dobro |
| Gameplay Conversion | 49,38% | 2 | 57,89% | +8,5 pontos percentuais |

Para chegar a 9, **as três** precisam subir um degrau, ou uma delas subir dois. Playtime e conversão estão perto. D1 é o mais difícil.

### Mobile & Tablet: 4/15, faltam 5 pontos

| Métrica | Hoje | Nota | Próximo degrau | Quanto falta |
|---|---|---|---|---|
| Average Playtime | 3m48s | 1 | 4m58s (nota 2) | +1m10s |
| Retention D1 | 1,16% | 2 | 1,59% (nota 3) | +0,43 p.p. |
| Gameplay Conversion | 17,88% | 1 | 23,24% (nota 2) | +5,4 p.p. |

Subindo um degrau em todas, a nota seria 2 + 3 + 2 = **7**. Ainda não passa. O painel não mostra os degraus seguintes, mas é preciso chegar perto dos números do desktop (por exemplo, conversão acima de 50% e playtime acima de 8 minutos) para somar 9.

**Conclusão:** o desktop dá para garantir com melhorias focadas. O celular precisa de uma mudança grande no primeiro minuto.

## 1.2 O que a CrazyGames mede (documentação oficial)

| Métrica | Definição oficial | Referência de jogo bom |
|---|---|---|
| Conversion | % de jogadores que jogam **pelo menos 1 minuto** depois de abrir o jogo | 80%+, carregando em menos de 10s |
| Average playtime | tempo médio de uma sessão | 10+ minutos |
| D1 | % de jogadores que voltam no dia seguinte | 10–15% |
| CTR | % de quem vê a capa e clica | top 20% da categoria |

Fonte: [docs.crazygames.com/resources/basic-launch-metrics](https://docs.crazygames.com/resources/basic-launch-metrics/).

O tempo de carregamento conta contra a conversão: o relógio começa quando o jogador abre a página, não quando a caçada começa.

## 1.3 Por que o celular está tão atrás

A diferença de conversão (49% contra 18%) é grande demais para ser só gosto do jogador. As causas prováveis, em ordem:

1. **Carregamento.** O pacote tem **287 módulos JS separados** (279 `modulepreload` no `index.html`), 387 arquivos, 4,3 MB. No desktop com fibra isso dá os 6,0s da média. No celular com 4G, cada arquivo é uma ida e volta na rede: é provável que muitos passem de 10s e fechem a aba antes da primeira imagem. O pico de 7,7s em 15/11 mostra que o tempo varia bastante.
2. **Primeira tela no celular.** A primeira visita cai direto na caçada (`skipMenuOnFirstVisit`), o que é bom, mas no celular o jogador precisa entender o joystick, a adaga, o dash e a tocha ao mesmo tempo, com o polegar cobrindo parte da tela.
3. **Pontos de skill parados.** A escolha rápida vem desligada (`quickPickDefault: false`). Os bots de 13/11 mostraram que o jogador que não abre a árvore morre na onda 1. No celular, achar a árvore no medalhão pequeno é mais difícil que no desktop.
4. **Duelo com diálogo na hora 1.** A hora 1 tem o rival (Azael) com três falas antes da luta. No celular, uma caixa de texto em inglês nos primeiros 60s é um ponto de saída.
5. **Desempenho.** O ajuste automático de qualidade existe (`state.quality`), mas um celular fraco pode travar nos primeiros segundos, antes de o ajuste agir.

Nenhuma dessas causas foi medida em celular real ainda. O primeiro passo do plano é confirmar.

## 1.4 Por que o D1 é tão baixo (1,4%)

O que fica de uma noite para a outra hoje:

- troféus e façanhas (Santuário);
- heróis liberados (Rowan na onda 2, Avgustino na onda 4, os outros bem mais longe);
- a noite em andamento (CONTINUE).

O que **some** ao fim da noite: ouro, skills, relíquias. A árvore volta ao zero. O jogador que morreu na onda 2 não volta mais forte no dia seguinte, e não tem um motivo marcado no relógio para voltar.

Jogos do gênero que retêm bem (estilo survivors) têm sempre duas coisas: **uma moeda que fica** e compra melhorias permanentes pequenas, e **um motivo diário** (desafio do dia, recompensa de login, baú diário).

Também falta mostrar no fim da noite **o que vem a seguir**: "faltam 120 monstros para liberar X", "amanhã: desafio Lua de Sangue".

## 1.5 Por que o playtime no desktop está quase lá

8m54s já é bom. Cada noite tem 12 horas de ~45s mais o acampamento, então quem passa da onda 4 joga mais de 10 minutos. Para ganhar o minuto que falta basta:

- menos gente morrendo nas ondas 1–3 (já melhorou em 13/11, mas o painel só pegou parte disso);
- um "mais uma" forte na tela de fim de noite (botão grande de jogar de novo, com a recompensa permanente visível).

## 1.6 CTR (vale nota a partir de 23/11)

| Origem | Impressões | CTR |
|---|---|---|
| Homepage | 13.000 | 0,2% |
| Gamepage | 66.000 | 0,7% |
| Tag page | 2.900 | 0,6% |
| Recent | 537 | 2,4% |

A capa quase não converte onde aparece mais. A CrazyGames recomenda: um ponto focal claro, título grande, gênero óbvio de relance, capa honesta com o jogo, e vídeo de prévia de 15–20s com os melhores momentos.

O jogo é um "survivors" com tocha no meio. A capa precisa mostrar isso em um segundo: herói, tocha acesa, muitos monstros em volta, números de dano.

## 1.7 Sobre as regras novas

O Basic Launch atual (11/11) segue as regras antigas, sem CTR. Se a decisão for **relançar**, e isso acontecer a partir de 23/11, a avaliação passa a ter **quatro métricas**, com CTR incluído. O painel ainda não mostra qual será o mínimo novo; conferir antes de relançar.

Os dados de D1 levam um dia a mais para aparecer. Os de D7 levam oito. Um relançamento curto (7 dias) mede bem a conversão e o playtime, mas o D1 dos últimos dias fica incompleto.
