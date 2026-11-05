# Zeph

> Copie esta pasta para `art_reference/<id>/` (o id de `js/data/characters.js`, ex.: `zeph`, `yara`, `oskar`).
> Campos com `?` são opcionais. Rabisco vale mais que texto: na dúvida, desenhe.

## 1. Identidade
- **id:** zeph
- **Uma frase:** lenhador jovem de jaqueta oliva, luta com um machado de duas mãos (golpe de cima para baixo)
- **Personalidade no movimento:** ( ) leve/rápido  ( ) pesado/forte  ( ) elegante  ( ) selvagem  ( ) sobrenatural
- **Altura comparada ao Zeph:** ( ) menor  ( ) igual  ( ) maior — quanto? ____ %

## 2. Silhueta (o que tem que dar para reconhecer só pela sombra)
- **Cabeça / cabelo / capuz:** 
- **Tronco / roupa:** 
- **Capa, cabelo comprido, cauda ou algo que balança?** (vira os pontos 16–18 do rig)
- **Arma:** tipo ____ · comprimento comparado ao braço ____ · mão: ( ) direita ( ) esquerda ( ) duas mãos
- **Detalhe que brilha ou se destaca?** (olhos, lâmina, runa…)

## 3. Cores (até 5)
| Parte | Cor (hex ou nome) |
|---|---|
| Sombra / contorno | |
| Roupa principal | |
| Pele / máscara | |
| Arma | |
| Brilho / efeito | |

## 3b. Para ficar realista (ver `../STYLE.md`)
- **Idade / corpo:** jovem (≈18), magro-atlético · **6,5 cabeças**
- **Materiais:** jaqueta e calça de tecido grosso (oliva), botas/cinto/bolsa de couro, alça de couro claro, machado de aço com cabo de madeira
- **O que balança:** mechas do cabelo (leve), barra da jaqueta (média), bolsa na cintura (pesada)
- **Postura:** ereta e relaxada fora de combate; em guarda, joelhos dobrados e tronco à frente
- **Hábitos no idle:** machado apoiado no ombro, troca o peso devagar, olha levemente em volta
- **Peso do golpe:** lento e pesado (golpe de lenhador, de cima para baixo) · dá passo à frente: sim
- **Rosto de perfil:** nariz reto, queixo fino, olhos azul-acinzentados, sobrancelha grossa
- Referências: `images/zeph_idle.webp`, `zeph_walking.webp`, `zeph_axe_attack.webp` (cores, roupa e ritmo do golpe)

## 4. Animações — o que cada uma precisa mostrar
Desenhe as poses em `pose-sheet` (uma imagem por pose ou a folha inteira). Aqui, só o que não dá para desenhar:

| Animação | Duração total | Sensação / detalhe |
|---|---|---|
| IDLE (loop) | ~2000 ms | |
| EXPLORAR (loop) | ~800 ms por passo duplo | |
| ATAQUE | ~450 ms | |
| ESPECIAL | ~800 ms | efeito: |
| APARO | ~600 ms | |
| ESQUIVA | ~600 ms | |
| HIT | ~350 ms | |
| MORTE? | | |
| POÇÃO? / DESCANSO? | | |

## 5. Efeitos
- **Rastro do ataque:** cor ____ · formato ( ) arco ( ) estocada reta ( ) faíscas
- **Especial:** (fogo, sombra, luz, garras…)
- **Som que combina?** 

## 6. Imagens nesta pasta
Coloque em `images/` (nunca carregadas pelo jogo, só referência):
- `portrait.*` — arte final (pode ser a mesma de `images/characters/`)
- `pose-sheet.png` — a folha preenchida **ou** uma imagem por pose:
  `idle-1.png`, `idle-2.png`, `walk-1.png` … `walk-4.png`, `attack-1.png` … `attack-4.png`,
  `special-1.png` …, `parry-1.png` …, `dodge-1.png` …, `hit-1.png` …
- `inspiration-*.png`? — referências de estilo ou movimento (vídeo → print de quadros também serve)
