# Boss: Demon Lord

- **id no jogo:** demon_lord (`BOSS_MODELS.DEMON_LORD` em `data_model/bosses.js`)
- **Papel:** boss que aparece a cada 2 turnos; lento, resistente e atira de longe

## Aparência

- **Silhueta / forma geral:** demônio vermelho com asas grandes abertas e uma cauda longa.
- **Cabeça e rosto:** dois chifres grandes de carneiro (cinza-escuros, com anéis, enrolando para trás), orelhas pontudas, olhos vermelho-alaranjados em brasa, testa franzida e sorriso largo de dentes à mostra.
- **Cauda:** longa, termina numa ponta de lança.
- **Asas:** de morcego, enormes (cada uma maior que o corpo), membrana vermelho-escura entre ossos, borda recortada e garra preta na ponta de cima.
- **Partes que se movem separadamente:** asas (batem devagar), cauda (ondula), braços (balançam no passo; o direito estica para lançar), corpo (anda pesado).
- **Tamanho relativo:** bem maior que o herói (raio de colisão 32, o herói ~2x menor).
- **Detalhes que NÃO podem faltar:** pele vermelha, dois chifres, asas, cauda com ponta de lança.
- **Detalhes que podem ser simplificados:** músculos (viram manchas de luz), dedos dos pés, rachaduras da pele.

## Cores

- **Pele:** #9b1c1c, sombra #5f0f12, luz #c2412d, contorno #1c0505
- **Chifres:** #3f3f46, anéis #5b5b66, contorno #1c1c21
- **Asas:** membrana #7a1616, sombra #4c0c0e, ossos #3a0a0b, garra #18181b
- **Ponta da cauda:** lança #3f3f46 com fio #8b8b96
- **Olhos:** #ff5a1f com brilho laranja
- **Bola de fogo:** #dc2626 → #f97316 → #fde047 → núcleo #fff7d6

## Personalidade e estilo

Dark fantasy, pixel art. Imponente e pesado: anda devagar com as asas abertas, estica a mão com garras e forma uma bola de fogo antes de lançar.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| idle / andar | sempre | corpo balança no passo; asas batem devagar; cauda ondula; braços balançam | ~1,1 passos/s, asas ~0,7 batidas/s | images/demon-lord-body.jpeg |
| atacar | a cada tiro (~1s) | braço direito estica; bola de fogo cresce na mão; olhos acendem; clarão no disparo | carrega ~0,7s, clarão ~0,3s | images/demon-lord.webp |
| projétil | voando | bola de fogo em camadas tremulando, rastro de chamas | contínuo | — |
