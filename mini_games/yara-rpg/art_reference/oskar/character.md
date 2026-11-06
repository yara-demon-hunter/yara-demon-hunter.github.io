# Oskar

- **id no jogo:** oskar (`js/data/characters.js`; boneco do palco em `js/data/visuals/stage.js` → `characters.oskar`)
- **Papel:** **personagem jogável** do RPG. Caçador implacável que prefere encerrar uma luta com um golpe forte. Passiva: Força predadora (+5% de Ataque total). Começa com Machado do Caçador, Escudo de Madeira e Armadura de Couro; leva um Machado de Duas Lâminas na bolsa.
- **Desenho:** **2.5D**, no mesmo esquema da Yara (`js/stage/yara25d.js`): boneco próprio, cabeça com rosto de verdade (geometria de `NS.azael.kit`), sem capuz nem máscara. Hoje ele usa o corpo do Demon Hunter recolorido de marrom (provisório).

> **Como completar:** coloque as imagens em `images/` (veja a lista em **Imagens**) e troque cada `_(a definir)_`.
> O que já está preenchido vem do retrato do jogo (`images/characters/oskar.webp`) e dos dados em `js/data/characters.js`.

## Aparência

- **Silhueta / forma geral:** homem adulto, forte e largo, pescoço grosso e braços musculosos. _(a definir: altura, se é maior que o Demon Hunter)_
- **Cabeça e rosto:** rosto duro e sério, testa franzida, nariz reto, **barba cheia** castanho-escura aparada, olhos claros.
- **Pele:** clara/bronzeada, com veias e músculos marcados no pescoço e nos braços.
- **Cabelo:** castanho-escuro, **curto e raspado** dos lados, com entradas na testa.
- **Vestuário:**
  - **Camisa verde-oliva sem mangas**, gasta, com **remendos** costurados e gola aberta amarrada com cordão.
  - Braços nus.
  - _(a definir: armadura de couro, calça, cinto, botas)_
- **Mãos e pés:** _(a definir)_
- **Arma:** **machado** (Machado do Caçador) de uma mão e **escudo de madeira** na outra. _(a definir: forma do machado e do escudo)_
- **Partes que se movem separadamente:** braços, machado, escudo, pernas. _(a definir)_
- **Tamanho relativo:** _(a definir)_
- **Detalhes que NÃO podem faltar:** barba cheia, cabelo raspado, camisa sem mangas remendada, braços fortes, machado e escudo.
- **Detalhes que podem ser simplificados:** veias e músculos (manchas de luz), remendos, cordão da gola.

## Cores

_(estimadas a partir do retrato; completar com as outras imagens)_

- **Pele:** #d39a6e, sombra #a46a45, luz #ecb88d, contorno #1a1410
- **Cabelo e barba:** #4a3020, sombra #2e1d12
- **Olhos:** #d8d2c0 (claros)
- **Camisa:** #4a4f33, sombra #33371f, luz #5f6542; remendos #3a3d27
- **Cordão da gola:** #b89d68
- **Calça / botas / couro:** _(a definir)_
- **Machado / escudo:** _(a definir)_

## Personalidade e estilo

Caçador bruto e direto: poucos movimentos, golpes pesados. _(a definir: expressão de combate, jeito de andar)_

## Desenho em 2.5D

Seguir o esquema da Yara (`js/stage/yara25d.js`): cabeça como esfera com o rosto desenhado na superfície da frente, virando um pouco para a câmera de lado.

- **Cabeça:** cabelo curto e raspado (quase a forma da cabeça), barba cheia cobrindo o queixo e a mandíbula.
- **Tronco:** largo; camisa sem mangas verde-oliva com remendos.
- **Braços:** grossos e nus, com músculos marcados.
- **Arma:** machado na mão direita e escudo de madeira no braço esquerdo. _(a definir: idle e golpes)_
- **Contorno:** escuro em tudo.

## Animações

Mesmos estados do palco do RPG (ver `previews/characters_preview.html`):

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| idle (parado) | sem ação | _(a definir)_ | loop ~1,2s | |
| andar (explorar) | ao explorar | _(a definir)_ | acompanha a velocidade | |
| ataques (combo, pesado, crítico) | ao atacar | _(a definir: golpes de machado)_ | ~0,25s | |
| aparo | ao aparar | _(a definir: bloqueio com o escudo)_ | | |
| esquiva | ao esquivar | _(a definir)_ | ~0,3s | |
| poção | ao beber | leva o frasco à boca | ~1,1s | |
| descanso | na fogueira | _(a definir)_ | lento | |
| levar dano | ao ser atingido | pisca branco e é empurrado | ~0,1s | |
| derrota | ao perder | ajoelha e tomba | ~1,4s | |
| retrato | seleção de personagem | — | — | `../../images/characters/oskar.webp` |

## Imagens

_(a adicionar em `images/`; nomes sugeridos, como os da Yara)_

- `images/oskar-perfil.png`: close do rosto e do busto
- `images/oskar-body.png`: corpo inteiro (de preferência de frente)
- `images/oskar-poses.png`: folha de personagem (de frente, de lado, de costas, em combate)

## Observações

- Lados sempre do ponto de vista dele (no boneco 2.5D, direita = lado +b).
- O retrato é de perfil: a barba e o cabelo raspado precisam ser confirmados nas imagens de frente e de costas.
- _(a definir)_
