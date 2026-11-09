# Captain Brutos

- **id no jogo:** `brutos` em `HEROES` (`data_model/heroes.js`) e `BRUTOS` em `BOSS_MODELS` (`data_model/bosses.js`); boneco `brutos` (`js/render/brutos25d.js`, dados em `data_model/visuals/characters/brutos_visual.js`).
- **Papel:** **semi-boss e herói jogável** do Last Torch. Como herói (id `brutos` em `HEROES`, `data_model/heroes.js`): liberado ao vencê-lo como semi-boss (conquista Iron Captain); lento e pesado, dash curto, golpes fortes e demorados, sem adaga; rival: o Azael. Como semi-boss: Aparece na hora 6, no meio da noite: o rival do herói (o Azael, ou o Demon Hunter se o jogador for o Azael) o chama e ele entra falando uma frase curta ("I will break him." / "He will not."). **Estático e lento**: anda devagar direto para o herói, dá golpes fortes de machado (preparação lenta), pancadas no chão e um **dash curto**. **Não lança adaga** nem atira, e não anda de lado. Falas em `BOSS_INTROS` (`data_model/dialogues.js`).
- **Desenho:** boneco **2.5D** no mesmo esquema do Oskar do RPG (cabeça com rosto na geometria do Azael, machado de duas lâminas sempre nas duas mãos), com armadura, capa e cicatriz.
- **Imagens:** `images/brutos-full-body.webp` (parado, corpo inteiro), `images/burtos-running.webp` (correndo), `images/burtos-attack.webp` (golpe por cima) e `images/brutos.webp` (busto de perfil, o retrato). Retrato do diálogo, da escolha de herói e do bestiário: `images/characters/brutos-small.webp`, gerado de `brutos.webp` por `make_portrait.py` (nesta pasta; rode `python3 mini_games/last_torch/art_reference/captain-brutos/make_portrait.py`, precisa só de ffmpeg e Python 3). O script faz um recorte fechado de dentro da armadura (embaixo e na esquerda), para a imagem encher o quadro como a do Azael em vez de parecer um busto cortado; espelha para ele olhar para a direita (o diálogo espelha o lado do rival, então ele sempre olha para o centro); e **limpa o contorno claro** que a remoção do fundo deixou nas bordas da capa e do corpo (cinza-claro de 1 a 2 px, que aparecia como branco contra o fundo escuro do quadro). O recorte (`CROP` no script) vale para esta arte; outra imagem pode pedir outros números, e o arquivo original `brutos.webp` não é alterado. As cores abaixo foram conferidas com as imagens.

## Aparência

- **Silhueta / forma geral:** guerreiro **alto**, de compleição imponente, **extremamente musculoso e robusto**. Lê-se como um comandante blindado de preto, com ombreiras largas, capa pesada nas costas e um machado grande nas mãos. Transmite força bruta e intimidação.
- **Cabeça e rosto:** traços **severos e marcantes**, expressão **séria, fechada e focada em combate**. Uma **cicatriz profunda corta a região superior do rosto** (testa/sobrancelha/olho): é o detalhe que mais marca o rosto.
- **Cabelo e barba:** cabelo **curto e preto**. **Barba densa, volumosa e bem alinhada**, contornando maxilar e queixo (preta, combinando com o cabelo).
- **Pele:** bronzeada, com músculos marcados nos braços.
- **Vestuário e equipamento:**
  - **Armadura pesada negra**: **ombreiras robustas**, **peitoral articulado de placas escuras**, proteções **texturizadas nos braços**.
  - **Cota de malha (chainmail)** visível por baixo das placas (nas juntas, cavas e barra do peitoral).
  - **Calça de couro resistente** e **botas de combate reforçadas**.
  - **Grevas e joelheiras de ferro escurecidas** (pernas e joelhos blindados).
  - **Capa preta longa e pesada**, presa aos ombros por **fechos robustos**, descendo pelas costas e **esvoaçando levemente** com o movimento.
- **Mãos e pés:** mãos de pele, sem luva, grandes e fechadas no cabo; botas de combate reforçadas, escuras.
- **Arma:** **machado de duas faces grande e robusto**: **cabo longo de madeira reforçada** e **lâminas de aço afiadas em ambas as laterais superiores**, feito para golpes devastadores. Empunhado (mãos a confirmar pelas imagens; um machado desse tamanho sugere as duas mãos).
- **Partes que se movem separadamente:** braços, machado, capa, peito (respiração), pernas.
- **Tamanho relativo:** alto e largo, do porte do Oskar ou maior (a confirmar).
- **Detalhes que NÃO podem faltar:** cicatriz na parte de cima do rosto, barba preta densa e alinhada, armadura negra com ombreiras e peitoral de placas, cota de malha aparecendo, capa preta longa, machado de duas faces de cabo longo.
- **Detalhes que podem ser simplificados:** textura dos braços, malha da cota (pode ser trama/pontilhado), fechos da capa, rebites.

## Cores

_(conferidas com as imagens)_

- **Pele:** #c98a5e, sombra #9a5f3c, luz #e0a679, contorno #1a1410
- **Cabelo e barba:** #15110f, sombra #0a0807, brilho #2b2522
- **Cicatriz:** #8a4a42 (mais clara e avermelhada que a pele)
- **Olhos:** #cfc9b8
- **Armadura (placas):** #26282d, sombra #15161a, luz #3d4047; bordas/rebites #5a5e66
- **Cota de malha:** #5d6169, sombra #2f3136
- **Calça de couro:** #2e2418, sombra #1c150d
- **Botas, grevas e joelheiras:** botas #2a1f16; ferro escurecido #34363b, luz #50535a
- **Capa:** #0f0f13, dobras #1b1b22, borda #26262e; fechos #6c6f77
- **Machado:** lâminas aço #aab0b8 com fio #dfe3e8 e meio #50555c; cabo madeira #5e3d1f, sombra #3f2713; reforços/amarração #2c2c30

## Personalidade e estilo

Pixel art de RPG, contorno escuro. Capitão duro e implacável: postura firme e dominante, peito aberto, poucos gestos; quando ataca, é com a força do corpo inteiro.

## Desenho em 2.5D

Implementado em `js/render/brutos25d.js`, a partir do Oskar do RPG (cabeça de pele com rosto, mesmo porte grande); a capa é a padrão do herói, preta:

- **Cabeça:** cabelo preto curto colado à cabeça; barba preta densa em massa única; sobrancelhas grossas; **cicatriz desenhada por cima do rosto** (traço claro na testa/sobrancelha/olho).
- **Tronco:** largo, peitoral de placas escuras, ombreiras grandes e redondas, cota de malha como trama nas juntas.
- **Braços:** proteções texturizadas escuras, grossos.
- **Pernas:** calça de couro, grevas e joelheiras de ferro, botas reforçadas.
- **Costas:** capa preta longa e pesada, com atraso e esvoaçar leve (como a capa do herói).
- **Arma:** machado de duas faces de cabo longo (`drawBlade`).
- **Corpo:** alto e massudo (`bodyScale` > 1, valor a testar).
- **Contorno:** escuro em tudo.

## Animações

Como boss, o Brutos usa as animações do corpo de herói do Last Torch (andar, golpe, dash). Descrição do que acontece, a ajustar:

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| idle (parado) | sem ação | de pé, firme, machado em guarda; respiração lenta e pesada, capa balança de leve | loop ~1,4s | `images/brutos-full-body.webp` |
| andar | indo até o herói | passos pesados e lentos; capa esvoaça para trás | acompanha a velocidade | `images/burtos-running.webp` |
| golpe de machado | herói perto (`meleeRange`) | ergue o machado e desce com o corpo todo; a preparação é lenta (~0,4s) e o corte é largo | ~0,4s + recuperação ~1,9s | `images/burtos-attack.webp` |
| dash curto | no ataque `lunge` | para e mira (~0,8s), depois avança 150 px em ~0,2s com o machado | ~1s | |
| pancada no chão | no ataque `slam` | o machado desce e dois círculos grandes estouram no chão depois de ~1,1s | ~1,2s | |
| levar dano | ao ser atingido | pisca branco e recua pouco (é pesado) | ~0,1s | |
| retrato | diálogo de chegada e bestiário | — | — | `../../images/characters/brutos-small.webp` |

## Imagens

Imagens paradas (`.webp`, pixel art, fundo transparente):

- `images/brutos.webp` — busto de perfil virado para a esquerda: cabelo curto preto, barba densa, cara fechada, **cicatriz diagonal na testa cruzando a sobrancelha**, colar de cota de malha, peitoral de placas, ombreira com frisos e capa preta (é o retrato)
- `images/brutos-full-body.webp` — parado em guarda, 3/4: machado inclinado na frente do corpo, seguro nas duas mãos (a de baixo perto do pomo, a de cima no meio do cabo), capa aberta para os dois lados, pernas afastadas
- `images/burtos-running.webp` — correndo de frente, machado atravessado, capa para trás
- `images/burtos-attack.webp` — machado erguido acima da cabeça com as duas mãos (o alto do golpe), de lado

O que as imagens mostram e a descrição não dizia: **braços de pele à mostra (bíceps)** com **braçadeiras pretas** no antebraço, **colar e saia de cota de malha** (a saia pendurada do cinto), **cinto e tiras de couro marrons**, **ombreiras redondas e com frisos**, ponteira de aço no pomo do machado. A cicatriz só aparece bem no busto (`brutos.webp`): uma linha diagonal na testa que cruza a sobrancelha. No boneco ela é um traço claro do alto da testa até a bochecha, cruzando a sobrancelha e o olho direito.

## Observações

- Lados sempre do ponto de vista dele (no boneco 2.5D, direita = lado +b).
- Machado **sempre nas duas mãos** (decidido pelas imagens).
- Valores de luta (vida, dano, alcance do dash, intervalos) em `BOSS_MODELS.BRUTOS`: são um primeiro palpite e pedem teste de jogo.
