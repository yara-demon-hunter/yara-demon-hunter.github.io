# Monstro: Cavaleiro Sem Cabeça

- **id no jogo:** headless_knight (`MONSTER_MODELS.HEADLESS_KNIGHT`)
- **Papel:** tanque lento que marcha direto para a tocha. Aguenta muito dano, quase não é empurrado e bate forte. É o monstro que obriga o jogador a **escolher o que fazer**: gastar tempo e dano nele, ou deixá-lo passar e proteger a tocha de outro jeito. A cabeça dele não está no corpo: ela flutua como um fogo-fátuo ao lado e **atira**, então o cavaleiro tem duas ameaças (o corpo que avança e a cabeça que acompanha).
- **Liberado:** a partir da hora 8 (proposta). Nunca em horda: no máximo um por vez em campo, com peso baixo.
- **Contraste com o resto:** o Inchado também é lento e resistente, mas explode; o cavaleiro não explode, ele **pesa**. O Vampiro é duro, mas se desfaz em morcegos; o cavaleiro não deixa nada para trás além de uma boa recompensa em ouro.

## Aparência

- **Silhueta / forma geral:** guerreiro alto e largo em armadura pesada de aço escuro, com ombreiras enormes e espinhos. Vista de cima, lê-se como dois ombros grandes e redondos, um **vazio entre eles onde deveria estar a cabeça** (só a gola da armadura, oca, com chama azul saindo) e a espada comprida arrastando de um lado.
- **Pescoço e chama:** a gola (gorjal) é um anel de aço aberto e escuro por dentro; dele sobe uma **chama fantasma azul-esbranquiçada**, que tremula e some em fiapos. É o centro visual do monstro.
- **A cabeça:** um elmo fechado (grande elmo) com pluma rasgada e duas fendas que brilham em **laranja-brasa**. Ela não fica no corpo: na imagem de conceito o cavaleiro a carrega ao lado do quadril, agarrada pela manopla; no jogo, ela flutua ao lado dele em órbita lenta, olhando para o herói, e é dela que sai o disparo.
- **Armadura:** aço escuro com marcas de golpes, manchas de ferrugem e uma faixa de tecido roxo-escuro rasgada na cintura; peitoral com um brasão apagado (um sol riscado). Joelheiras e botas pesadas, de passos lentos e marcados.
- **Arma:** montante (espada de duas mãos) denteado e sem brilho, arrastado pelo chão na mão direita; solta faíscas a cada passo.
- **Capa:** capa rasgada roxo-escura, presa às ombreiras por dois fechos dourados ligados por uma corrente no peito, com a barra em tiras. **Cobre as costas por cima do tronco e das pernas:** vista de cima, os pés só aparecem pela frente do corpo, nunca atrás da capa.
- **Partes que se movem separadamente:** corpo (balança de leve de um lado para o outro, passos pesados), espada (arrasta e solta faíscas), capa (ondula devagar), chama do pescoço (tremula), cabeça flutuante (orbita e vira para o herói).
- **Tamanho relativo:** o maior monstro comum, só menor que os bosses (raio de colisão 20, proposta). Maior que o Vampiro e o Inchado.
- **Detalhes que NÃO podem faltar:** o vazio com a chama azul no lugar da cabeça, a cabeça (elmo com olhos laranja) separada do corpo, ombreiras grandes, espada arrastando.
- **Detalhes que podem ser simplificados:** rebites, brasão, desgaste e ferrugem, a pluma do elmo.

## Cores

- **Aço:** #4b5365, sombra #2a303c, realce #8a96ab, contorno #11141b
- **Ferrugem e marcas:** #7a4a2a
- **Tecido e capa:** #2a1740, forro #4c2a78, borda #6b46a3
- **Chama do pescoço:** base #38bdf8, meio #a5f3fc, ponta #f0fdff, brilho rgba(56, 189, 248, 0.6)
- **Olhos do elmo:** #fb923c, brilho rgba(251, 146, 60, 0.95)
- **Espada:** #6b7280, gume #9ca3af, faíscas #fde68a
- **Aura (fraca):** #1d4ed8
- **Cor do monstro no jogo (barra de vida e partículas):** #7c8aa5

## Personalidade e estilo

Dark fantasy. Implacável e sem pressa: **nunca corre**, não desvia e não hesita. Marcha em linha reta na direção da tocha, de passos pesados, e só muda de rumo se o herói chegar muito perto. A cabeça flutuante é o oposto: curiosa, vigia o herói e acende os olhos antes de atirar. Contrasta com o herói (ágil e azul) pelo peso, pelo aço e pelo laranja dos olhos.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| marchar | sempre | passos pesados e lentos: o pé que avança sai pela frente do corpo e o que recua some sob o tronco e a capa; as ombreiras alternam com o passo, a espada arrasta soltando faíscas, a capa ondula, a chama do pescoço tremula | ~1 passo por segundo | images/headless_knight_idle.png |
| cabeça orbitando | sempre | o elmo flutua numa órbita lenta ao redor do corpo, sempre virado para o herói | ~0,4 volta por segundo | — |
| disparo da cabeça | a cada poucos segundos, com o herói à vista | os olhos do elmo acendem forte, a cabeça recua e lança uma bola de chama azul em linha reta | ~0,6s de aviso | (adicionar images/headless_knight_shoot.png) |
| golpe | quando encosta no herói | o braço da espada sobe e desce, um abalo de tela curto | ~0,4s | (adicionar images/headless_knight_attack.png) |
| levar dano | ao perder vida | a armadura pisca branca, faíscas saltam, o corpo quase não se move (resiste ao empurrão) | ~0,15s | — |
| morrer | ao zerar a vida | a armadura desmorona em peças, a chama azul se apaga e a cabeça cai e rola; solta um baú pequeno de ouro (ver abaixo) | ~0,8s | — |

## Balanceamento (valores usados em `data_model/monsters.js`)

| Campo | Valor | Observação |
|---|---|---|
| hpBase / hpPerTurn | 190 / 26 | o monstro mais duro que não é boss |
| speedMin / speedMax | 24 / 28 | só o Inchado é mais lento |
| radius | 20 | |
| damage | 24 | forte, mas devagar: dá para fugir |
| knockbackResist | 0.7 | quase não é empurrado (como os elites BRUTE) |
| Cabeça | dispara uma bola azul a cada 3,5s com o alvo a até 320 de distância; dano ~11 (0,45 do dano do corpo); também fere a tocha (3) | usa o `shoot` da Bruxa, saindo da posição do elmo; o brilho dos olhos avisa 0,6s antes |
| scoreReward / goldBase | 60 / 10 | recompensa alta, é o preço do tempo gasto |
| xpRewardBase / xpRewardPerTurn | 26 / 3 | |
| spawnWeight | 0.05 | limite de 1 em campo |

## Imagens

- `images/headless_knight_idle.png`: conceito em pixel art, o cavaleiro de pé, de frente, com a cabeça (o elmo) carregada ao lado do quadril. Desenhado em código (não é ilustração de IA): serve para fixar forma, cores e a posição da chama. Para uma ilustração mais rica, use o prompt abaixo num gerador de imagens e coloque o resultado ao lado.
- Ainda não adicionadas: `headless_knight_shoot.png`, `headless_knight_attack.png`, `headless_knight_top.png` (vista de cima, como aparece no jogo).

**Prompt sugerido para gerar a ilustração:** "Pixel art, dark fantasy monster sprite, a tall headless knight in heavy dark steel plate armor with huge spiked pauldrons, front view, a hollow neck gorget with a pale blue ghost flame rising where the head should be, carrying its own closed great helm with a torn plume and glowing orange eye slits at its left hip, gripped by the gauntlet, a jagged two-handed greatsword resting point-down in its right hand, tattered dark purple cape and waist cloth, rust and dents on the armor, standing on heavy boots, plain white background, no ground, centered, game asset."

## Implementação

- **Dados visuais:** `data_model/visuals/monsters/headless_knight_visual.js` (`HEADLESS_KNIGHT_VISUALS`)
- **Desenho:** `js/render/headless_knight.js` (`renderHeadlessKnight`); a cabeça flutua de lado (`V.head`) e o sprite é assado em `js/render/monster_sprites.js`. A posição do elmo no mundo (`knightHeadPosition`) é de onde sai o tiro e o brilho da mira
- **Balanceamento:** `data_model/monsters.js` (`MONSTER_MODELS.HEADLESS_KNIGHT`) e `data_model/difficulty.js` (`monsterUnlockTurn.HEADLESS_KNIGHT: 8`)
- **Comportamento:** o disparo da cabeça reaproveita `shoot` de `js/systems/enemies.js` (alcance em `shootRange`); o limite de 1 em campo é `maxAlive` em `MONSTER_MODELS`, aplicado em `js/systems/spawner.js`
- **Prévia:** `previews/monsters_preview.html` (como abrir: `previews/README.md`)
- **Bestiário:** entrada em `data_model/sanctuary.js` (`MONSTER_ENTRIES`), com a arte do sprite
- Coordenadas locais do desenho: +x é a frente do cavaleiro, +y é o lado direito; medidas em múltiplos do raio.
