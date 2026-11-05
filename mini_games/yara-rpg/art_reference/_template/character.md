# <Nome do personagem>

> Copie esta pasta para `art_reference/<id>/` (o id de `js/data/characters.js`, ex.: `zeph`, `yara`, `oskar`).
> Campos com `?` são opcionais. Rabisco vale mais que texto: na dúvida, desenhe.

## 1. Identidade
- **id:** 
- **Uma frase:** (ex.: "caçador ágil e magro, luta com uma espada curta e se move como gato")
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
- **Idade / corpo:** ( ) criança ( ) jovem ( ) adulto ( ) idoso · ( ) magro ( ) atlético ( ) forte ( ) pesado
- **Altura em cabeças:** ____ (adulto 6,5–7)
- **Materiais de cada peça:** (tecido, couro, metal, madeira, pelo…) — cada um ganha rampa de 3 tons
- **O que balança sozinho:** ( ) cabelo ( ) capa ( ) barra da roupa ( ) bolsa ( ) cauda ( ) orelhas — e quão pesado é
- **Postura:** ( ) ereta ( ) curvada ( ) relaxada ( ) tensa · perna de apoio no idle: ( ) da frente ( ) de trás
- **Hábitos no idle:** (ex.: ajeita o machado, olha em volta, coça a cabeça, bate o pé)
- **Peso do golpe:** ( ) rápido e leve ( ) lento e pesado · dá passo à frente no ataque? ( ) sim ( ) não
- **Rosto de perfil:** nariz ( ) reto ( ) arrebitado ( ) adunco · queixo ( ) fino ( ) quadrado · olhos ( ) claros ( ) escuros
- **Fotos de pessoas reais** na mesma pose ajudam muito (perfil): `images/ref-*.jpg`

## 4. Animações — o que cada uma precisa mostrar
Desenhe as poses em `pose-sheet` (uma imagem por pose ou a folha inteira). Aqui, só o que não dá para desenhar:

| Animação | Duração total | Sensação / detalhe |
|---|---|---|
| IDLE (loop) | ~6000 ms | hábitos, troca de peso |
| EXPLORAR (loop) | ~1000 ms por ciclo | |
| ATAQUE | ~900 ms | |
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
