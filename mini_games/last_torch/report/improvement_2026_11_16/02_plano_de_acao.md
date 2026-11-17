# 2. Plano de ação

Ordem pensada pelo efeito na nota. Cada item diz qual métrica sobe, em qual aparelho, e onde mexer.

Legenda de esforço: **P** = poucas horas · **M** = um dia · **G** = vários dias.

---

## Fase 1: carregamento (Conversion, os dois aparelhos, principalmente celular)

### 1.1 Juntar os 287 módulos em um arquivo só (P–M)

Hoje o `build-standalone.rb` copia os módulos soltos e lista todos em `modulepreload`. Cada um é um pedido de rede.

- Usar o **esbuild** (um binário único, sem Node) dentro do `build-standalone.rb`: `esbuild js/game.js --bundle --minify --format=esm --outfile=standalone-build/game.min.js`.
- O código-fonte continua igual. Só o pacote enviado à CrazyGames muda.
- Testar com o mesmo teste de pixel a pixel com Chrome headless + Playwright para garantir que nada mudou na tela.

**Meta:** carregamento médio abaixo de 3s no desktop e abaixo de 5s em 4G simulado.

### 1.2 Mostrar a caçada antes de tudo estar baixado (M)

A CrazyGames recomenda "carregar o primeiro nível antes do resto". Para o Last Torch, isso é:

- baixar primeiro só o necessário para a onda 1 (Demon Hunter, tocha, esqueleto, morcego, lobo das sombras, cenário);
- deixar para depois: os outros heróis, bosses das horas 4+, arte da árvore, sons que não tocam na onda 1, retratos grandes;
- o `azael-small.webp` tem 384 KB e é o maior arquivo do pacote. Só é usado no duelo; pode vir depois ou ficar menor.

### 1.3 Medir em celular de verdade (P)

Antes de mexer em mais nada no celular, abrir o jogo publicado na CrazyGames em um celular Android comum com 4G e cronometrar:

- tempo até a primeira imagem;
- tempo até o primeiro monstro morto;
- se a tela trava nos primeiros 10s.

No Chrome headless dá para simular com `Network.emulateNetworkConditions` (4G lento) e CPU 4x mais lenta.

---

## Fase 2: o primeiro minuto no celular (Conversion e Playtime, celular)

O objetivo é que **todo** jogador novo de celular mate o primeiro monstro em até 5s e sinta que ficou mais forte antes dos 60s.

### 2.1 Primeira noite com skill que se escolhe sozinha (P) — decisão sua

Os bots mostraram: sem gastar pontos, morre na onda 1. Com pontos gastos, chega na onda 3–4.

Você preferiu deixar a escolha rápida desligada (13/11). Três opções que respeitam isso:

| Opção | Como funciona | Efeito esperado |
|---|---|---|
| A | Só na **primeira noite** do jogador, a escolha rápida abre sozinha. Depois segue desligada. | maior |
| B | Na primeira noite, os pontos são **gastos sozinhos** em uma skill boa do ramo Blade, com um aviso "Skill learned: …". | médio, sem pausa |
| C | O medalhão vira um **botão grande "LEARN"** no celular, pulsando, perto do polegar. | menor |

Recomendação: **A**. Mexer em `data_model/start.js` (ex.: `quickPickFirstNight: true`).

### 2.2 Duelo da hora 1 sem pausa longa (P)

O rival com três falas na hora 1 é lindo, mas acontece dentro do primeiro minuto. Opções:

- na primeira noite do jogador, só uma fala curta, ou nenhuma;
- ou o duelo da primeira noite ir para a hora 2 e a hora 1 ser só monstros comuns.

### 2.3 Tutorial na tela, não em texto (P)

Hoje as dicas são toasts com tempo marcado (`js/ui/hints.js`). No celular:

- uma seta ou mão animada mostrando "arraste aqui" no lugar do joystick, que some no primeiro movimento;
- um brilho no botão de dash quando o primeiro monstro chega perto;
- nada de texto longo antes dos 30s.

### 2.4 Os 3 primeiros monstros mais fracos e mais perto (P)

`NIGHT.openingMonsters: 3` já nasce perto. Na primeira noite do jogador, eles podem morrer com 1 golpe e soltar ouro e XP em dobro. A primeira sensação é "sou forte".

### 2.5 Primeiro nível em até 15s (P)

Confirmar com o bot quanto tempo leva hoje até o primeiro nível. Se passar de 15s, baixar o XP do primeiro nível só na primeira noite.

### 2.6 Testar o jogo em pé e deitado, com CPU lenta (P)

Conferir HUD, joystick e diálogo nas duas posições. Ver se o polegar cobre a tocha ou o herói.

---

## Fase 3: progresso que fica (D1 e Playtime, os dois aparelhos)

### 3.1 Uma moeda permanente: Brasas (G)

- Ao fim de cada noite (vitória **ou** morte), o jogador ganha Brasas, proporcional à onda alcançada e aos monstros mortos.
- No menu, um **Altar da Tocha** (ou dentro do Santuário) compra melhorias permanentes pequenas: +5% vida, +5% dano, +1 ponto de skill no início, tocha com +10% de chama, ímã maior, etc.
- Cada melhoria tem 5 níveis, com preço crescente.
- O primeiro nível de alguma coisa precisa ser comprável **depois da primeira noite**, mesmo morrendo na onda 1.

Isso resolve o principal motivo do D1 baixo: hoje, morrer na onda 2 não deixa nada.

### 3.2 Tela de fim de noite que puxa a próxima (M)

A tela de resumo deve mostrar, nesta ordem:

1. Brasas ganhas, com animação;
2. o que dá para comprar agora ("Você pode comprar +5% vida");
3. o próximo herói e quanto falta ("Avgustino: chegue à onda 4 — você chegou na 3");
4. um botão grande **HUNT AGAIN**, maior que os outros.

### 3.3 Heróis liberados mais cedo e com promessa visível (P)

Rowan já sai na onda 2. Avgustino na onda 4. Os outros (Reaver, Warden, Azael, Brutos) exigem bosses de horas avançadas. Mostrar na tela de heróis a foto em silhueta e a condição de cada um, para virar meta.

---

## Fase 4: motivo para voltar amanhã (D1)

### 4.1 Recompensa diária (M)

- Ao abrir o jogo num dia novo: um baú com Brasas.
- Dias seguidos aumentam a recompensa (dia 1, 2, 3 … 7).
- Na tela de fim de noite: "Volte amanhã: baú do dia 2".

### 4.2 Desafio do dia (M)

- Uma noite com regra fixa do dia, igual para todos (ex.: "Lua de Sangue sempre ativa", "só Rowan", "monstros com -30% vida e +50% velocidade"). Os Presságios (`OMENS` em `data_model/night.js`) já são quase isso.
- Recompensa em Brasas maior que uma noite comum.
- Muda à meia-noite. A semente pode ser a data.

### 4.3 Salvar o progresso com segurança (P–M)

Hoje tudo fica no `localStorage`. Dentro do iframe da CrazyGames, alguns navegadores (Safari, modo anônimo) apagam isso. Quem volta e encontra tudo zerado não volta de novo.

O módulo de dados do SDK da CrazyGames salva na conta do jogador. Você disse que o SDK fica para depois; ele vai ser obrigatório no Full Launch de qualquer jeito. **Decisão sua:** integrar só a parte de dados agora, ou esperar.

### 4.4 Competição sem leaderboard (M)

O leaderboard do SDK da CrazyGames **só está disponível para jogos convidados** (documentação oficial), então não conta para este relançamento. Depois do Full Launch dá para pedir convite ao suporte. Enquanto isso, a competição vem de:

- **Recordes pessoais visíveis:** melhor onda, mais monstros mortos e maior sequência, guardados no `localStorage`. No fim da noite, aviso "NOVO RECORDE" com a marca antiga ao lado. Mostrar também no menu.
- **Desafio diário com semente fixa (4.2):** todos jogam a mesma noite no dia. O resultado aparece ao lado do melhor do jogador e dos dias anteriores, com uma sequência de dias jogados.
- **Compartilhar o resultado:** botão que copia um texto curto ("Last Torch, desafio de 18/11: onda 6, 312 mortes") para colar em chat e redes. Não precisa de servidor nem de SDK.
- **Ranking próprio com servidor:** só se o jogo crescer, porque exige guardar e validar pontuações e tem custo de manutenção. Fica fora do plano atual.

Como testar: simular dias diferentes mudando a data do sistema (ou uma chave de depuração) e conferir que a semente muda, que o recorde só atualiza quando é superado e que o texto de compartilhar sai correto.

---

## Fase 5: capa e vídeo (CTR, conta a partir de 23/11)

### 5.1 Nova capa (P–M)

- Um ponto focal: o herói com a tocha acesa no meio, monstros em círculo, luz quente contra o escuro.
- Título **LAST TORCH** grande e legível em tamanho pequeno.
- Números de dano e brilho de ataque, para mostrar que é ação.
- Testar em tamanho de miniatura (cerca de 200 px de largura): se não dá para entender, está errado.
- As capas atuais estão em `previews/covers/`. Fazer 2–3 versões novas e comparar com a atual em miniatura.

### 5.2 Vídeo de prévia de 15–20s (P)

Já existem vídeos em `previews/videos/`. O vídeo da capa deve ter só ação: Fúria, Rush (SLAUGHTER, CARNAGE), horda em volta da tocha, boss. Sem menus nem texto.

---

## O que NÃO fazer agora

- Mais conteúdo para horas avançadas (bosses novos, ramos novos). Quem sai, sai antes da onda 3. Conteúdo do fim não muda a nota.
- Arte pesada nova. Cada MB a mais piora o carregamento no celular.
- Mudanças grandes de balanceamento depois da onda 4.

---

## Resumo de efeito esperado

| Mudança | Conversion | Playtime | D1 | CTR | Aparelho |
|---|---|---|---|---|---|
| 1.1 um arquivo só | ●●● | ● | | | celular > desktop |
| 1.2 carregar a onda 1 primeiro | ●● | | | | celular |
| 2.1 escolha de skill na 1ª noite | ●● | ●● | ● | | os dois |
| 2.2 duelo da hora 1 curto | ● | ● | | | celular |
| 2.3–2.5 primeiro minuto | ●● | ● | | | celular |
| 3.1 Brasas permanentes | | ●● | ●●● | | os dois |
| 3.2 tela de fim de noite | | ●● | ●● | | os dois |
| 4.1–4.2 baú e desafio diário | | ● | ●●● | | os dois |
| 4.3 salvar na conta | | | ●● | | celular (Safari) |
| 5.1–5.2 capa e vídeo | | | | ●●● | os dois |

● = pouco · ●● = médio · ●●● = grande (estimativa, não medido).
