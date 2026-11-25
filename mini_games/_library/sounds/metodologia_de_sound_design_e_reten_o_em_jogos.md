# Metodologia de Sound Design para Retenção e *Game Feel*

Este documento consolida os fundamentos psicoacústicos, o roteiro de estudo prático, o mapeamento de efeitos por momento de jogo e as boas práticas para criar sons satisfatórios e com alta retenção sem causar fadiga auditiva.

---

## 1. Fundamentos: por que certos sons prendem o jogador?

A sensação de "vício" (ou **retenção / *game feel* / *juice***) gerada pelo áudio em jogos não depende de volume alto ou efeitos aleatórios, mas de **feedback imediato, antecipação, recompensa dopaminérgica e contraste dinâmico**.

### 1.1 Condicionamento operante e dopamina por antecipação
* **Referências:** B.F. Skinner / Wolfram Schultz.
* **Princípio:** O cérebro libera dopamina não apenas quando recebe uma recompensa final, mas principalmente *no sinal que antecipa* a recompensa ou o risco (ex.: o *chime* de *level up*, o clique antes de um disparo, o grave anunciando uma onda).

### 1.2 Lei de Weber-Fechner e contraste psicoacústico
* **Princípio:** A percepção humana responde a mudanças em *proporção*, não em valores absolutos.
* **Aplicação:** Se tudo no jogo está alto e comprimido, nada se destaca. O ideal é manter o ambiente relativamente limpo ou aplicar *ducking* (redução temporária do volume de música/ambiente) para que sons críticos apareçam com clareza.

### 1.3 Isomorfismo e física implícita
* **Referência:** Andy Farnell (*Designing Sound*).
* **Princípio:** Sons procedurais ou sintetizados que imitam propriedades físicas reais (massa, tensão, ressonância, impacto) tendem a parecer mais "tangíveis" e satisfatórios do que efeitos genéricos de biblioteca.

---

## 2. Roteiro prático de estudo

### 2.1 Leituras fundamentais
* ***Designing Sound* (Andy Farnell):** Foco em síntese sonora e física por trás dos efeitos.
* ***Game Feel* (Steve Swink) / estudos sobre *A Sense of Sound*:** Conexão entre áudio, resposta tátil e ritmo de jogo.

### 2.2 Engenharia reversa de áudio ("reverse engineering")
1. Grave clipes curtos de jogos que você considera satisfatórios.
2. Abra os clipes em uma DAW ou editor de áudio (como o Audacity) e dê zoom na forma de onda (*waveform*).
3. Analise três pontos principais:
   * **Transiente (*attack*):** Onde está o impacto ou estalo inicial? (Ex.: 5–20 ms).
   * **Cauda (*decay/release*):** O som morre seco e rápido (ideal para *spam* de ações sem embolar) ou possui ressonância longa (ideal para marcos raros, como *level up* ou entrada de *boss*)?
   * **Variação de *pitch* e filtro:** Pequenas variações aleatórias de tom (`±3%` a `±8%`) e uso de *low-pass filter* reduzem a fadiga auditiva em repetições frequentes.

### 2.3 Prototipagem e síntese
* Teste camadas simples em motores leves ou APIs de áudio (como Web Audio API): ruído branco filtrado + *pitch envelope* em ondas senoidais ou triangulares.
* Observe como cada camada contribui para o "peso" (graves/médios-graves) ou para o "brilho/definição" (médios-agudos/agudos).

---

## 3. Mapeamento de sons por momento de jogo

| Momento do jogo | Melhores tipos de som | Por que funciona no cérebro / *game feel* | Jogos de referência |
| :--- | :--- | :--- | :--- |
| **Início de partida** | *Riser* curto ou impacto grave (*sub/low-mid thud*) + som mecânico/metálico de "engatilhamento" (ex.: mola, lâmina, tambor) com final limpo. | Marca a transição do estado passivo (menu/pausa) para o estado de alerta e ação sem arrastar o ritmo. | *Counter-Strike*, *Overwatch*, *Vampire Survivors* |
| **Início de wave** | Grave profundo (*boom* ou *horn* sintético) + sinal de alerta rítmico ou *sweep* ascendente curto, seguido de leve aumento de tensão no fundo. | Gera antecipação e urgência: o cérebro reconhece o "gatilho de ameaça" e prepara o foco motor. | *Call of Duty: Zombies*, *Left 4 Dead*, *Hades* |
| **Morte do jogador** | Impacto seco de "quebra/queda" + *low-pass filter* abrupto abafando o som do mundo + silêncio breve (*hitstop* / *silence gap*) antes de um grave curto. | O contraste entre o caos anterior e o corte súbito cria peso dramático e evita que o jogador ouça um ruído caótico e irritante ao perder. | *Celeste*, *Hollow Knight*, *Dark Souls* |
| **Monstro morrendo** | Camadas curtas: *pop/crunch* agudo/médio na hora do *kill* + *pitch* descendente rápido ou estalo de estilhaço, com *cooldown*/limite de vozes. | Dá recompensa imediata e tátil a cada eliminação. Em enxames, o som precisa ser curto e variado para não virar uma parede de ruído. | *Vampire Survivors*, *Diablo III / IV*, *Doom Eternal* |
| **Entrada / aparição de boss** | Subgrave prolongado (*sub-drop*), som metálico/ressonante grave ou percussão pesada espaçada, com *ducking* da música/ambiente. | Sinaliza mudança de escala e perigo maior; o grave longo ativa resposta visceral de tensão e respeito ao inimigo. | *Shadow of the Colossus*, *Dark Souls*, *Monster Hunter* |
| **Up level** | Acorde limpo ou arpejo ascendente brilhante (*bell/chime/synth* harmônico) com *attack* definido e cauda limpa. | Frequências ascendentes e harmônicas consonantes disparam sensação clara de progresso, conquista e recompensa. | *World of Warcraft*, *The Witcher 3*, *Persona 5* |
| **Hit / dano causado** | *Tick* ou *thwack* agudo/médio muito curto (10–40 ms) com variação leve de *pitch* a cada acerto. | Confirma visualmente e auditivamente que o golpe conectou; fundamental para precisão e *flow*. | *Quake*, *Apex Legends*, *Hades* |
| **Coleta de recurso / XP** | *Pops* ou notas escalonadas (subindo o tom a cada item pego em sequência rápida) de curta duração. | A progressão ascendente de tom cria um "efeito escada" viciante — pegar o próximo som parece completar uma frase musical. | *Super Mario*, *Vampire Survivors*, *Sonic* |
| **Skill pronta / cooldown** | Clique cristalino, *chime* sutil de alta frequência ou *whoosh* curto e discreto. | Informa disponibilidade sem roubar atenção do combate principal; ajuda na memória muscular. | *League of Legends*, *Overwatch*, *Hades* |
| **Vitória / conclusão de fase** | Resolução harmônica (acorde maior ou cadência conclusiva) com timbre quente/brilhante e dinâmica controlada. | Encerra o ciclo de tensão com alívio e sensação de fechamento bem-feito, incentivando o próximo ciclo. | *Final Fantasy* (clássico fanfare), *Mario Kart*, *Hades* |

---

## 4. Checklist anti-fadiga e armadilhas comuns

* **Excesso de graves em tudo:** Evite colocar graves pesados em *hit*, *kill*, *wave* e *boss* ao mesmo tempo. Isso embola o mix (sobretudo em alto-falantes de celular ou notebook) e tira o impacto do que realmente exige peso.
* **Duração desproporcional ao ritmo do jogo:** Se o jogador sobe de nível a cada 20–40 segundos e o som dura vários segundos, ele pode cansar ou atropelar a ação seguinte. Ajuste a duração do *feedback* ao ritmo da partida.
* **Falta de variação em sons repetitivos:** Repetir exatamente o mesmo arquivo dezenas de vezes por minuto causa fadiga auditiva. Aplique variação sutil de *pitch*, volume ou *filter cutoff* e limite o número de vozes simultâneas (*voice limiting*).

---

## 5. Espaço para anotações do seu projeto

* **Gênero / ritmo do jogo:** Last Torch: sobrevivência em ondas de poucos minutos, enxames, boss no fim de cada tela; level up e moeda a cada poucos segundos.
* **Plataforma principal de áudio (fone, PC, mobile, TV):** celular e notebook (portais web): evitar grave abaixo de ~100 Hz em sons frequentes.
* **Regras de *mix* e *ducking* definidas:** ver `README.md` desta pasta (ducking no aviso e rugido do boss e no level up; muffle na morte; limite de 40 vozes curtas).
* **Testes de *pitch* / *cooldown* a validar:** variação ±6% em hit/slash, ±1,2% em kill (para não desafinar a escada); validar no Ateliê > Sons com o teste "Mesmo hit 8 vezes". Pendente: som de "skill pronta" (o jogo não tem cooldown visível ainda).