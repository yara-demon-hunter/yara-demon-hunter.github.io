# Captain Brutos

- **id no jogo:** _(a definir; ainda não está em `js/data/characters.js` nem em `js/data/visuals/stage.js`)_
- **Papel:** _(a definir)_ Capitão guerreiro de armadura negra e machado de duas faces. Presença intimidadora, focado em combate.
- **Desenho:** ainda não existe boneco 2.5D. Quando for feito, seguir o esquema do Oskar (`js/stage/oskar25d.js`, registrado em `NS.bodies`; ver "Como criar um boneco novo" em `js/stage/README.md`).
- **Imagens:** ainda não adicionadas. Entram em `images/` (ver **Imagens**). As cores abaixo são **estimadas da descrição** e devem ser conferidas quando as imagens chegarem.

## Aparência

- **Silhueta / forma geral:** guerreiro **alto**, de compleição imponente, **extremamente musculoso e robusto**. Lê-se como um comandante blindado de preto, com ombreiras largas, capa pesada nas costas e um machado grande nas mãos. Transmite força bruta e intimidação.
- **Cabeça e rosto:** traços **severos e marcantes**, expressão **séria, fechada e focada em combate**. Uma **cicatriz profunda corta a região superior do rosto** (testa/sobrancelha/olho): é o detalhe que mais marca o rosto.
- **Cabelo e barba:** cabelo **curto e preto**. **Barba densa, volumosa e bem alinhada**, contornando maxilar e queixo (preta, combinando com o cabelo).
- **Pele:** _(a definir pelas imagens; estimada clara/bronzeada, com músculos marcados)_.
- **Vestuário e equipamento:**
  - **Armadura pesada negra**: **ombreiras robustas**, **peitoral articulado de placas escuras**, proteções **texturizadas nos braços**.
  - **Cota de malha (chainmail)** visível por baixo das placas (nas juntas, cavas e barra do peitoral).
  - **Calça de couro resistente** e **botas de combate reforçadas**.
  - **Grevas e joelheiras de ferro escurecidas** (pernas e joelhos blindados).
  - **Capa preta longa e pesada**, presa aos ombros por **fechos robustos**, descendo pelas costas e **esvoaçando levemente** com o movimento.
- **Mãos e pés:** _(a definir; estimado: manoplas/luvas de couro ou ferro escuro e botas reforçadas)_.
- **Arma:** **machado de duas faces grande e robusto**: **cabo longo de madeira reforçada** e **lâminas de aço afiadas em ambas as laterais superiores**, feito para golpes devastadores. Empunhado (mãos a confirmar pelas imagens; um machado desse tamanho sugere as duas mãos).
- **Partes que se movem separadamente:** braços, machado, capa, peito (respiração), pernas.
- **Tamanho relativo:** alto e largo, do porte do Oskar ou maior (a confirmar).
- **Detalhes que NÃO podem faltar:** cicatriz na parte de cima do rosto, barba preta densa e alinhada, armadura negra com ombreiras e peitoral de placas, cota de malha aparecendo, capa preta longa, machado de duas faces de cabo longo.
- **Detalhes que podem ser simplificados:** textura dos braços, malha da cota (pode ser trama/pontilhado), fechos da capa, rebites.

## Cores

_(estimadas da descrição; sem imagens ainda)_

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

Quando for implementar, partir do `oskar25d.js` (cabeça de pele com rosto, mesmo porte grande) e do Azael para a capa (`drawAzaelCape`):

- **Cabeça:** cabelo preto curto colado à cabeça; barba preta densa em massa única; sobrancelhas grossas; **cicatriz desenhada por cima do rosto** (traço claro na testa/sobrancelha/olho).
- **Tronco:** largo, peitoral de placas escuras, ombreiras grandes e redondas, cota de malha como trama nas juntas.
- **Braços:** proteções texturizadas escuras, grossos.
- **Pernas:** calça de couro, grevas e joelheiras de ferro, botas reforçadas.
- **Costas:** capa preta longa e pesada, com atraso e esvoaçar leve (como a capa do herói).
- **Arma:** machado de duas faces de cabo longo (`drawBlade`).
- **Corpo:** alto e massudo (`bodyScale` > 1, valor a testar).
- **Contorno:** escuro em tudo.

## Animações

Mesmos estados do palco do RPG (ver `previews/characters_preview.html`). Descrição proposta, a ajustar:

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| idle (parado) | sem ação | de pé, firme, machado em guarda; respiração lenta e pesada, capa balança de leve | loop ~1,4s | |
| andar (explorar) | ao explorar | passos pesados; capa esvoaça para trás | acompanha a velocidade | |
| ataque (combo / pesado) | ao atacar | ergue o machado, corpo todo no golpe, desce com força | ~0,5s | |
| crítico (Fúria) | ataque com a Fúria cheia | golpe maior com impacto no chão | ~0,6s | |
| aparo | ao aparar | cabo do machado atravessado na frente do corpo | ~1,1s | |
| esquiva | ao esquivar | passo pesado para trás | ~0,3s | |
| poção | ao beber | solta uma mão do machado para levar o frasco à boca | ~1,1s | |
| descanso | na fogueira | _(a definir)_ | lento | |
| levar dano | ao ser atingido | pisca branco e recua pouco (é pesado) | ~0,1s | |
| derrota | ao perder | ajoelha apoiado no machado e tomba | ~1,4s | |
| retrato | seleção de personagem | — | — | _(a definir)_ |

## Imagens

Ainda não há imagens. Quando chegarem, salvar em `images/` (`.webp`, pixel art) e listar aqui, por exemplo:

- `images/captain-brutos-idle.webp` — parado em guarda
- `images/captain-brutos-attack.webp` — machado erguido (o alto do golpe)

## Observações

- Lados sempre do ponto de vista dele (no boneco 2.5D, direita = lado +b).
- Texto escrito a partir da descrição fornecida; **nada foi inventado além disso**. Campos marcados _(a definir)_ ou _(estimado)_ esperam as imagens.
- Falta decidir: id no jogo, papel (jogável, inimigo, chefe ou NPC), mãos do machado e passiva/equipamento inicial.
