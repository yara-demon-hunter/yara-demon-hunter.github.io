# Monstro: Bruxa

- **id no jogo:** witch (`MONSTER_MODELS.WITCH`)
- **Papel:** inimiga lenta que atira bolas de magia escura de longe

## Aparência

- **Silhueta / forma geral:** velha corcunda envolta num manto com capuz; vista de cima, lê-se como um capuz redondo projetado à frente de ombros curvados, com o manto esfarrapado arrastando atrás.
- **Cabeça e rosto:** capuz profundo e escuro. Dentro dele, rosto pálido cinzento, muito enrugado e cadavérico, nariz comprido, um olho vermelho brilhante e o outro afundado e escuro.
- **Cabelo:** mechas longas grisalhas (cinza-esverdeado) caindo do capuz pelos dois lados do rosto até os ombros.
- **Vestuário:** manto longo roxo-escuro quase preto, com a barra rasgada e desgastada, preso na cintura por um cordão com nó e ponta pendurada.
- **Mãos:** ossudas e pálidas, dedos longos terminando em garras.
- **Partes que se movem separadamente:** manto (arrasta e tremula), braço que conjura, braço livre, cabelo (balança), corpo (anda mancando).
- **Tamanho relativo:** parecida com o herói, um pouco mais curvada.
- **Detalhes que NÃO podem faltar:** olho vermelho, rosto pálido dentro do capuz escuro, mãos com garras, bola de magia escura no ataque.
- **Detalhes que podem ser simplificados:** boca e dentes, pés (ficam escondidos pelo manto), textura do tecido.

## Cores

- **Manto:** #2a2333, sombra #17121f, dobras #3d3350, borda #4a3f5e
- **Capuz:** #251e2e, abertura #08060c
- **Pele:** #b9bab2, sombra #8a8c85, rugas #5f615b
- **Olho:** #ef4444 com brilho vermelho
- **Cabelo:** #9fb3b0, sombra #6e8886
- **Mãos:** #a9aaa2, garras #ecebe4
- **Cordão:** #5e5246
- **Magia:** núcleo #12061c, borda #7e22ce, redemoinho #c084fc, partículas #2e1046 / #a855f7

## Personalidade e estilo

Dark fantasy. Sinistra, lenta e corcunda: anda mancando com o manto arrastando, estica a mão com garras e forma uma bola de magia escura que suga partículas antes de ser lançada.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| idle / andar | sempre (ela anda devagar o tempo todo) | corpo balança mancando; mão direita agarrando à frente, esquerda para trás; manto arrasta e tremula; cabelo balança | ~1,4 passos por segundo | images/witch.webp, images/witch_running.webp |
| carregar feitiço | ~0,9s antes de cada tiro | braço direito estica com a mão aberta; bola escura cresce na frente da mão sugando partículas; olho e aura acendem | acompanha o cooldown do tiro | images/witch_attacking.webp |
| lançar | no disparo | partículas explodem para fora; braço segura esticado e volta | ~0,35s | images/witch_attacking.webp |
| projétil | voando | bola escura com borda roxa girando e rastro de partículas | contínuo | images/witch_attacking.webp |
