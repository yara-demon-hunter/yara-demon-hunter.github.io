# Personagem: Caçador das Sombras

- **id no jogo:** hero
- **Papel:** herói (jogador)

## Aparência

- **Silhueta / forma geral:** figura encapuzada e esguia, envolta numa capa esfarrapada; vista de cima, lê-se como um capuz redondo sobre ombros estreitos com a capa se abrindo em leque para trás.
- **Cabeça e rosto:** capuz escuro e profundo que projeta sombra sobre a parte superior do rosto. Dentro dele, uma máscara branca (de osso) com traços marcantes e enigmáticos: olhos vazados escuros e linhas de caveira.
- **Vestuário:** túnica/blusa de mangas compridas, calças justas e botas altas enfaixadas até a panturrilha, tudo em preto ou cinza-escuro, com faixa na cintura.
- **Capa:** preta, esfarrapada e desgastada nas pontas, com dobras texturizadas. Balança e se estica com o vento.
- **Armamento:** espada curta com lâmina azul neon, adornada com runas místicas que se iluminam ao longo do gume e pulsam.
- **Partes que se movem separadamente:** corpo/ombros, capuz, capa, braço da espada, espada, botas (passada na corrida).
- **Tamanho relativo:** pequeno (câmera de longe, vista de cima), mas grande o bastante para ler a máscara e o brilho da espada.
- **Detalhes que NÃO podem faltar:** máscara branca dentro do capuz sombreado, capa esfarrapada, espada azul brilhante com runas.
- **Detalhes que podem ser simplificados:** tom geral bem escuro para disfarçar detalhes; botas e mangas viram formas simples.

## Cores

- **Cor principal (capa):** #07222d (preto azulado)
- **Cor secundária (roupas/capuz):** #0b1d26 a #12232c (cinza-escuro)
- **Máscara:** #e8eef2 com sombra #9fb1bc; olhos #020617
- **Cor do brilho (neon/glow):** #38bdf8 (azul), lâmina #7dd3fc, runas #e0f2fe
- **Estado especial:** Frenzy Nova → brilho rosa #f0abfc; Dano dobrado → âmbar #f59e0b
- **Levando dano:** pisca branco #ffffff

## Personalidade e estilo

Dark fantasy. Caçador / guerreiro místico / assassino das sombras. Rápido e agressivo; movimentos bruscos; deve parecer perigoso e misterioso.

## Animações

| Animação | Quando acontece | O que se move | Duração / ritmo | Imagens |
|---|---|---|---|---|
| idle (parado) | sem movimento | corpo respira ofegante; capa balança leve; espada abaixada ao lado, brilho pulsando | loop ~1,1s | images/hero-idle.png |
| andar / correr | ao se mover | inclina na direção; capa se estica ao vento; botas alternam a passada | acompanha a velocidade | images/hero-running.png |
| ataque 1 (combo) | 1º golpe | corte horizontal rápido da direita para a esquerda | ~0,12s | images/hero-attacking.png |
| ataque 2 (combo) | 2º golpe seguido | corte de volta (esquerda → direita), mais largo | ~0,12s | images/hero-attacking.png |
| ataque 3 (finalizador) | 3º golpe seguido | giro completo de 360° com a espada brilhando forte, avanço (dash) | ~0,2s | images/hero-attacking.png |
| levar dano | ao ser atingido | pisca branco, achata | ~0,1s | |
| morte | ao morrer | (a definir) explode em fragmentos de sombra | ~0,4s | |
| especial | Frenzy Nova | espada e runas ficam rosa, brilho intenso | duração do Frenzy | |

## Efeitos ao redor

- Rastro de sombra escura, quase imperceptível.
- Espada com brilho azul pulsante e runas que acendem ao longo do gume.

## Referências de estilo

Dark fantasy; caçador encapuzado com máscara de osso; espada rúnica neon. Ver `images/hero-side.png` (melhor referência de cores e da espada).

## Observações

- O jogo é visto de cima: priorizar silhueta (capuz + capa + espada) e contraste da máscara branca.
- Não usar contorno azul forte no capuz (no jogo parecia uma "bolinha azul"); o brilho azul fica só na espada.
