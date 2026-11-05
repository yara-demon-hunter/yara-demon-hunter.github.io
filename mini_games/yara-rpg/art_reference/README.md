# Referências de arte e animação — Yara RPG

As imagens desta pasta **nunca são carregadas pelo jogo**. Elas servem para a IA entender forma, cor e
movimento e recriar o personagem **em código** no palco de ação (`js/systems/stage.js`).

## A ideia (o que muda em relação ao Last Torch)
No Last Torch cada monstro ganhou um arquivo de desenho próprio, com a animação escrita à mão em matemática.
Funciona, mas cada personagem novo começa do zero e o movimento varia de qualidade.

Aqui separamos em três camadas:

1. **Rig comum** — um esqueleto de 18 pontos igual para todos (`_template/rig-guide.svg`).
2. **Poses como dados** — cada animação é uma lista de *poses-chave* (ângulos das articulações + tempo).
   Ficam em `js/data/animations/<id>.js`, legíveis e ajustáveis sem mexer no motor.
3. **Visual por personagem** — só a "roupa" desenhada sobre o rig (capuz, armadura, arma, cores).

O motor interpola entre as poses com suavização (antecipação, impacto, recuperação), aplica
*overlap* (capa e cabelo atrasam em relação ao corpo) e respiração. Resultado: qualquer personagem
novo herda movimento fluido; você só desenha as poses-chave e a aparência.

## Fluxo para um personagem
1. Copie `_template/` para `art_reference/<id>/`.
2. Imprima ou abra `pose-sheet.svg` num app de desenho (Procreate, Krita, Photoshop, papel e celular…)
   e desenhe por cima. Siga as regras do topo da folha:
   - **3/4 olhando para a direita** (meio virado para você, como nos GIFs do Zeph; o inimigo fica à direita);
   - **pés na linha do chão**, **topo da cabeça na linha H** — mantém a escala igual em todas as poses;
   - bonecos de palito servem; o que importa é a posição das articulações do `rig-guide.svg`.
3. Preencha `character.md` (silhueta, cores, duração e sensação de cada animação).
4. Peça: **"crie a animação de `art_reference/<id>`"**. A IA:
   - converte cada desenho em uma pose do rig e grava em `js/data/animations/<id>.js`;
   - desenha a aparência em `js/render/characters/<id>.js` (ou similar);
   - gera uma **prévia** (`art_reference/preview.html`) com todas as animações lado a lado,
     em velocidade normal e em câmera lenta, para você aprovar antes de entrar no jogo.

## Poses-chave de cada animação (o mínimo)
| Animação | Poses | Por quê |
|---|---|---|
| IDLE | neutro, inspira, expira (+ detalhe) | respiração dá vida; detalhe evita parecer robô |
| EXPLORAR | 2 contatos + 2 passagens | ciclo de caminhada clássico de 4 poses |
| ATAQUE | guarda, antecipação, **impacto**, recuperação | sem antecipação o golpe não tem peso |
| ESPECIAL | carga, antecipação máxima, **impacto**, recuperação | exagere: é o golpe que o jogador espera |
| APARO | guarda, bloqueio, empurrão, volta | faísca no bloqueio |
| ESQUIVA | agacha, no ar, aterrissa, volta | |
| HIT | impacto, recuo máximo, recupera | a cabeça vai primeiro, o corpo segue |

**Dicas que fazem diferença:**
- Exagere a pose de **antecipação** e a de **impacto**; o meio o motor resolve.
- Anote o tempo entre poses: antecipação lenta + impacto rápido = golpe forte.
- Marque em vermelho rastros e faíscas; em azul, o que balança (capa, cabelo).
- Uma foto de você mesmo fazendo a pose de perfil já é ótima referência.

## Estrutura
```
art_reference/
  README.md
  _template/
    character.md      ficha descritiva
    pose-sheet.svg    folha de poses (7 animações × 4 poses) para desenhar por cima
    pose-sheet.png    a mesma folha em imagem
    rig-guide.svg     mapa das 18 articulações
    rig-guide.png
    images/
  <id>/               um por personagem jogável ou monstro animado
```

## Referências animadas (GIF/WebP) — caso do Zeph
GIFs do personagem ajudam muito, mas **só como referência**: o jogo nunca usa os quadros.
A IA estuda proporções, cores, roupa e o ritmo do movimento (tempo de cada quadro) e recria tudo no rig.

- Coloque em `art_reference/<id>/images/` com nomes `<id>_idle`, `<id>_walking`, `<id>_<arma>_attack`…
- O que sai: `js/data/rig/<id>.js` com proporções (`body`), cores, arma e as poses-chave de cada animação.
- Os tempos do GIF viram os `t` das poses (ex.: ataque do Zeph 200/90/200/70 ms → subida lenta, golpe rápido).

## Onde fica cada coisa no código
| Arquivo | O que tem |
|---|---|
| `js/systems/rig.js` | motor comum 2,5D: esqueleto 3D, câmera 3/4, ordem por profundidade, curvas entre poses, pés plantados (IK 3D), molas, piscar |
| `js/data/rig/<id>.js` | o personagem: proporções, cores, arma e animações (só dados) |
| `js/systems/stage.js` | palco do jogo: decide qual animação tocar em cada ação |
| `art_reference/STYLE.md` | regras de realismo: proporção, luz, materiais, movimento, tempos |
| `art_reference/preview.html` | prévia: todas as animações, câmera lenta, esqueleto e a referência ao lado |

Para ajustar uma pose, mude os ângulos em `js/data/rig/<id>.js` e recarregue `preview.html`.
