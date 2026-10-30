# Monstro: Lobo Zumbi

- **id no jogo:** zombie_wolf (`MONSTER_MODELS.ZOMBIE_WOLF`)
- **Papel:** caçador rápido e frágil que chega em matilha. Corre em volta do herói e, quando está perto, para um instante, mira e se lança com uma investida em linha reta (a mesma mecânica `lunge` do Espectro, só que mais curta e mais rápida). Quem vê o aviso e dá o dash na hora certa passa ileso; quem não vê leva a mordida. Pune ficar parado, premia mirar bem e atacar cedo.
- **Liberado:** a partir da hora 4 no sorteio normal (peso baixo) e a partir da hora 5 também em horda (`HORDES.packHunt`, tipo `swarm`: 3 lobos mais 0,5 por hora, juntos num canto). A hora 4 é de boss, que não tem hordas.
- **Contraste com o resto:** o Morcego é rápido mas voa em zigue-zague e não tem aviso; o Espectro atira de longe. O lobo é o único que ataca em grupo, de perto e com aviso curto.

## Aparência

- **Silhueta / forma geral:** lobo grande e magro, de pelo preto-azulado arrepiado, com a coluna e as costelas à mostra em remendos, como se a carne tivesse apodrecido e a maldição o mantivesse de pé. Vista de cima, a leitura é: focinho comprido à frente, ombros altos e estreitos, torso afunilando até a bacia, patas finas abertas e um rastro de chamas roxas saindo das costas e da cauda.
- **Cabeça e rosto:** focinho longo com o lábio puxado para trás mostrando presas amareladas; um lado do crânio sem pelo, osso à mostra; orelhas rasgadas, uma com a ponta cortada. Dois olhos que brilham em **violeta com núcleo esverdeado**, sem pupila.
- **Pelagem e maldição:** manchas de pelo emaranhado e úmido; ao longo da espinha, uma crina de **chamas roxas** que não queimam (tremulam para trás com a corrida); a ponta da cauda termina em chama. Marcas de runa riscadas em brasa fraca nas patas.
- **Coleira:** coleira de ferro enferrujado partida, com 3 elos de corrente arrastando. É o detalhe que conta a história (alguém o prendeu e ele se soltou) e some do foco quando o lobo corre.
- **Patas:** longas e finas, garras claras; na corrida as quatro se estendem e se recolhem em galope; na investida ficam esticadas para trás.
- **Partes que se movem separadamente:** cabeça (abaixa para morder), mandíbula (abre ao investir e rosna parado), orelhas (voltam para trás ao correr), patas (galope), crina de chamas (ondula), cauda (balança), corrente da coleira (chacoalha).
- **Tamanho relativo:** um pouco menor que o Esqueleto na largura, mais comprido no corpo (raio de colisão 13, proposta). Mais baixo e mais longo que a Bruxa.
- **Detalhes que NÃO podem faltar:** olhos violeta brilhando, chama roxa na espinha, costelas à mostra, presas, coleira partida.
- **Detalhes que podem ser simplificados:** runas das patas, elos individuais da corrente, dentes (bastam 3 triângulos), pelos soltos.

## Cores

- **Pelo:** #1c1a2b, sombra #0d0b17, realce #3b3656
- **Osso exposto (costelas e crânio):** #d8d0b8, sombra #8a8168
- **Boca e interior das orelhas:** #2a0f1f, presas #e8dfa8
- **Olhos:** núcleo #d9f99d, brilho rgba(192, 132, 252, 0.95)
- **Chama da maldição:** base #6d28d9, meio #a78bfa, ponta #ede9fe, brilho rgba(139, 92, 246, 0.6)
- **Coleira e corrente:** #6b4a2f, ferrugem #8a5a2b
- **Aura (fraca, só para destacar no escuro):** #7c3aed
- **Cor do monstro no jogo (barra de vida e partículas):** #a78bfa

## Personalidade e estilo

Dark fantasy. Faminto e paciente: não corre em linha reta até o alvo, **circula**, testando a distância, e quando chega perto abaixa a cabeça, as chamas se apertam contra o corpo e os olhos acendem forte. Esse é o aviso. Em seguida salta. Em matilha, os lobos chegam um de cada vez, por ângulos diferentes, nunca todos juntos no mesmo instante. Contrasta com o herói (azul) pelo roxo da maldição.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| correr | sempre | galope de quatro patas, corpo sobe e desce, chama da crina para trás, orelhas coladas, corrente chacoalha | ~2,6 passadas por segundo (acelera com a velocidade) | images/zombie_wolf_idle.png (a de corrida ainda não foi feita) |
| rosnar | parado ou girando em volta do herói | mandíbula abre e fecha leve, crina ondula devagar, cauda balança | ~1 ciclo por segundo | — |
| mirar (aviso da investida) | ao chegar a ~300 de distância | cabeça abaixa, corpo encolhe, chama se comprime, olhos acendem fortes, aura branco-violeta | ~0,5s | (adicionar images/zombie_wolf_aim.png) |
| investida | depois da mira | corpo estica, patas para trás, mandíbula escancarada, rastro de chama roxa atrás | ~0,35s em linha reta | (adicionar images/zombie_wolf_lunge.png) |
| levar dano | ao perder vida | corpo pisca branco, chamas falham, pelo arrepia | ~0,2s | — |
| morrer | ao zerar a vida | a chama se apaga de uma vez e o corpo desfaz em fumaça roxa e cinza (efeito de partículas já existente, cor do monstro) | ~0,5s | — |

## Balanceamento (valores usados em `data_model/monsters.js`)

| Campo | Valor | Observação |
|---|---|---|
| hpBase / hpPerTurn | 36 / 8 | morre em 1 ou 2 golpes no começo; frágil de propósito |
| speedMin / speedMax | 78 / 96 | entre o Esqueleto e o Morcego |
| radius | 13 | |
| damage | 15 | igual ao Esqueleto |
| lunge | cooldownSeconds 4, aimSeconds 0.5, seconds 0.35, speed 520, triggerDistance 300 | aviso mais curto que o do Espectro (0,75s), mas a investida é menor |
| scoreReward / goldBase | 28 / 3 | |
| xpRewardBase / xpRewardPerTurn | 20 / 3 | |
| spawnWeight | 0.08 | pouco no sorteio normal; a maior parte vem em horda |
| Horda | `swarm`, 3 lobos + 0,5 por hora, a partir da hora 5 | banner "THE PACK HUNTS" |

## Imagens

- `images/zombie_wolf_idle.png`: conceito em pixel art, lobo parado rosnando, de lado. Desenhado em código (não é ilustração de IA): serve para fixar forma, cores e posição das chamas. Para uma ilustração mais rica, use o prompt abaixo num gerador de imagens e coloque o resultado ao lado.
- Ainda não adicionadas: `zombie_wolf_aim.png`, `zombie_wolf_lunge.png`, `zombie_wolf_top.png` (vista de cima, como aparece no jogo).

**Prompt sugerido para gerar a ilustração:** "Pixel art, dark fantasy monster sprite, a gaunt zombie wolf in side view, snarling, black-blue matted fur with exposed ribs and a bare skull patch on one side, glowing violet eyes with green core, a mane of violet ghost flames along its spine and tail tip, broken rusty iron collar with a short chain, torn ears, yellowed fangs, standing on four thin legs with pale claws, plain white background, no ground, centered, game asset."

## Implementação

- **Dados visuais:** `data_model/visuals/monsters/zombie_wolf_visual.js` (`ZOMBIE_WOLF_VISUALS`)
- **Desenho:** `js/render/zombie_wolf.js` (`renderZombieWolf`), com sprite assado em `js/render/monster_sprites.js` como os demais. O brilho de mira da investida fica em `js/render/entities.js`
- **Prévia:** `previews/monsters_preview.html` (como abrir: `previews/README.md`)
- **Balanceamento:** `data_model/monsters.js` (`MONSTER_MODELS.ZOMBIE_WOLF`), `data_model/difficulty.js` (`monsterUnlockTurn.ZOMBIE_WOLF: 4`) e `data_model/night.js` (horda `packHunt`, `minHour: 5`)
- **Bestiário:** entrada em `data_model/sanctuary.js` (`MONSTER_ENTRIES`), com a arte do sprite
- Coordenadas locais do desenho: +x é a frente do lobo, +y é o lado direito; medidas em múltiplos do raio.
