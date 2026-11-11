# Monstro 2.5D: Esqueleto

- **id do boneco:** `skeleton` (`registerBody` em `../skeleton25d.js`)
- **Papel:** morto-vivo de pé, que avança cambaleando com os braços esticados à frente
- **Feito a partir de:** o Esqueleto do Last Torch, `monsters/topdown/skeleton/` (desenho plano visto de cima), e a
  imagem `images/skeleton_idle.webp` (referência original do monstro)
- **Resultado:** `images/skeleton_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco do yara-rpg embaixo)

## Como foi criado

O desenho de cima só existe olhado do alto. Para servir em qualquer câmera, o Esqueleto foi montado no **boneco 2.5D
dos heróis** (`characters/hunter/hero25d.js`): o motor cuida da passada, da pose, da câmera e da ordem de desenho, e
este monstro só troca as peças de carne por peças de osso (ganchos do `registerBody`).

| Peça | De onde veio | Como ficou em 2.5D |
|---|---|---|
| Crânio rachado, órbitas de chama verde | topdown | esfera de osso com rachadura em zigue-zague no topo, órbitas fundas com brilho verde, furo do nariz |
| Mandíbula que bate | topdown (`chatterHz`) | arcada de dentes embaixo da frente do crânio, abrindo e fechando; dentes de cima no maxilar |
| Tranco de cabeça | topdown (`twitchHz`) | de vez em quando a cabeça dá um tranco para o lado |
| Alma verde nas costelas | topdown | chama verde pulsando dentro da caixa torácica |
| Costelas, esterno, clavículas | topdown | arcos 3D saindo da coluna até o esterno, seguindo o eixo da coluna |
| Coluna e bacia com furos | topdown | vértebras da bacia ao pescoço; bacia em disco com os dois furos na frente |
| Trapo podre na bacia | topdown | três tiras que balançam e arrastam com o movimento |
| Braços esticados, 3 garras | topdown | braços de osso à frente, balançando com a passada; três garras em leque |
| Pernas e pés | referência (de pé) | ossos com joelho marcado e pé comprido |

## Cores

As mesmas do desenho de cima: `skeleton25d_visual.js` lê `topdown/skeleton/skeleton_visual.js`. Mudar uma cor lá
muda os dois desenhos (e o Esqueleto Rastejante).

## Decisões e o que foi rejeitado

- 1ª versão: crânio grande demais (cabeçudo, estilo chibi) e a mandíbula virou uma bola cinza na frente do rosto. Ficou
  `skullRadius` 2,5 e a mandíbula virou uma arcada estreita com dentes.
- O usuário quis manter também o clássico "deitado" do Last Torch: virou outro monstro, o Esqueleto Rastejante
  (`../skeleton_crawler/`), com as mesmas peças.
- O Last Torch continua usando o desenho de cima (decisão do usuário); este é para o yara-rpg e jogos futuros.

## Ajuste

`tools/tuner.html?model=skeleton` (Monstros, Topdown desmarcado). Medidas em `../skeleton25d_visual.js`.
