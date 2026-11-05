# Guia de estilo — personagens realistas no rig 2,5D

Regras que o motor (`js/systems/rig.js`) segue e que cada personagem (`js/data/rig/<id>.js`) deve respeitar.
Ao pedir um personagem novo, a IA usa este guia + a ficha `character.md` + as imagens de referência.

## 0. Vista 2,5D (câmera 3/4)
- O personagem é um **boneco 3D simples** (articulações com profundidade) visto por uma câmera fixa em **3/4**:
  girado ~35° para a tela e olhando ~10° de cima (`camera: { yaw, pitch }` no arquivo do personagem).
- Tudo é desenhado **em ordem de profundidade**: braço/perna do lado da câmera por cima, os do outro lado por baixo e mais escuros.
- O tronco é feito de **seções ovais** (barra, cintura, peito, ombros) em `body.torsoShape`: meia-profundidade e meia-largura de cada uma.
  Ombros largos (meia-largura ≥ .12) para o corpo não virar "tubo" na vista 3/4.
- O rosto é uma **esfera**: olhos, nariz, boca e orelhas ficam na superfície e somem/achatam ao virar.
- Giros que dão vida: `twist` (tronco sobre o quadril — recua no preparo do golpe, volta no impacto),
  `headYaw` (olhar em volta; no idle ele chega a olhar para a câmera), `yaw` (o corpo todo, ex.: esquiva).
  Cuidado: giro demais no impacto deixa o golpe "de frente" e ele perde leitura (impacto: twist ≤ 10).

## 1. Proporção
- **6,5 a 7 cabeças** de altura para adultos (criança: 5; criatura: livre). Nada de cabeça grande estilo chibi.
- Marcos (1 = altura total): tornozelo .045 · joelho .27 · quadril .5 · ombro .78 · queixo .86 · topo 1.0.
- Braço solto: o pulso chega no quadril, a ponta dos dedos no meio da coxa.
- Membros afinam: coxa (.095) → joelho (.058) → panturrilha (.064) → tornozelo; braço (.058) → cotovelo (.044) → pulso (.034).

## 2. Luz e cor
- **Luz única de cima e da frente** (personagem olha para a direita). O motor aplica gradiente em toda parte.
- Cada material tem **rampa de 3 tons**: `[sombra, base, luz]`. A sombra puxa para o frio/escuro, a luz para o quente/claro.
- Membros do lado de trás ficam ~20% mais escuros (profundidade).
- **Contorno fino na cor da sombra do próprio material**, nunca preto puro.
- Rosto: sombra na mandíbula e na lateral, rubor leve na bochecha, luz na testa.

## 3. Materiais
| Material | Como se comporta |
|---|---|
| Tecido (jaqueta, calça) | dobras nas articulações e saindo do cinto; barra balança (mola) |
| Couro (bota, cinto, bolsa) | brilho baixo, costuras/vincos; bolsa balança devagar |
| Metal (lâmina) | contraste alto, fio bem claro, bisel escuro |
| Madeira (cabo) | levemente curvo e afinando, veio mais escuro |
| Cabelo | massa + mechas; mechas soltas balançam (mola) |

## 4. Movimento realista
- **Pés plantados:** em pé e em combate os pés ficam no chão (IK) e o quadril se move. Pé só sai do chão quando dá um passo.
- **Peso:** o corpo sempre "cai" em uma perna; o idle troca o peso devagar (6 s).
- **Respiração:** ciclo de ~4 s (peito expande, ombros sobem pouco). Em combate, mais rápida.
- **Piscar:** a cada 2,5–5,5 s, às vezes duplo, fecha em 60 ms e abre em 110 ms.
- **Antecipação → ação → recuperação:** todo golpe recua antes; impacto rápido (ease `in`) e segurado (`hold`) por ~130 ms.
- **Cabeça lidera:** ao tomar dano, a cabeça vai primeiro e o tronco segue.
- **Movimento secundário:** cabelo, barra e bolsa atrasam e balançam (molas do motor; não precisa animar).
- **Curvas, não retas:** as poses são ligadas por curvas (Catmull-Rom). Poucas poses bem escolhidas > muitas poses.

## 5. Tempos de referência
| Animação | Duração | Notas |
|---|---|---|
| Idle | 6000 ms loop | + ruído procedural e piscar |
| Guarda | 3000 ms loop | joelhos dobrados, respiração mais curta |
| Caminhada | 1000 ms por ciclo | 8 poses: contato, descida, passagem, subida × 2 |
| Ataque | 800–1000 ms | antecipação ≥ 2× o tempo do golpe |
| Especial | 1200–1500 ms | carga visível, salto ou giro, impacto pesado |
| Aparo | 500–700 ms | |
| Esquiva | 500–650 ms | |
| Dano | 350–450 ms | |
