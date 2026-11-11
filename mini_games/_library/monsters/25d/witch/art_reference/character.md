# Monstro 2.5D: Bruxa

- **id do boneco:** `witch` (`registerBody` em `../witch25d.js`)
- **Papel:** inimiga lenta que conjura bolas de magia escura de longe
- **Feito a partir de (blend dos dois jogos):**
  - a Bruxa do Last Torch, `monsters/topdown/witch/` (vista de cima), com as imagens `images/witch.webp`,
    `images/witch_running.webp` e `images/witch_attacking.webp` (referências originais);
  - a Bruxa do palco do yara-rpg, desenhada de lado em `yara-rpg/js/stage/monsters25d.js` (função `witch`).
- **Resultado:** `images/witch_25d_resultado.png` (o tuner: câmera do Last Torch em cima, palco embaixo)

## Como foi criado

Pedido do usuário: juntar as duas Bruxas num boneco 2.5D só. Montada no boneco dos heróis
(`characters/hunter/hero25d.js`), com a postura corcunda pelo gancho `poseTweak`.

| Peça | De onde veio | Como ficou em 2.5D |
|---|---|---|
| Corcunda, cabeça baixa à frente, mancando | Last Torch (`hunchForward`, `hobbleHz`) | tronco inclinado, cabeça baixa e projetada; balança ao mancar |
| Manto roxo-escuro até o chão, barra rasgada | Last Torch + RPG | cone do peito ao chão; a barra rasgada ondula e arrasta para trás; dobras e borda clara do lado da câmera |
| Cordão na cintura com nó e ponta pendurada | RPG | metade da frente do cordão, nó e a ponta balançando |
| Capuz com a ponta caindo para trás | RPG | capuz redondo com a ponta em fita que cai e balança atrás |
| Rosto pálido, nariz comprido, queixo | RPG (perfil) + Last Torch | rosto comprido e magro no fundo escuro do capuz, nariz apontando para baixo, queixo, rugas |
| Um olho vermelho brilhando, o outro afundado | Last Torch | olho direito vermelho com brilho (mais forte ao carregar); o esquerdo, escuro |
| Mechas grisalhas saindo do capuz | Last Torch + RPG | mechas finas dos dois lados, balançando |
| Mangas largas, mãos ossudas com garras | Last Torch (4 garras) + RPG (manga) | manga que abre no punho; mão ossuda de quatro garras |
| Bola de magia escura | Last Torch + RPG | núcleo escuro de borda roxa, redemoinho girando, faíscas subindo (RPG) e, ao carregar, partículas sugadas (Last Torch); cresce com o feitiço |

## Cores

As mesmas do desenho de cima: `witch25d_visual.js` lê `topdown/witch/witch_visual.js`.

## Decisões

- 1ª versão: o rosto virou um disco branco grande, o brilho do olho cobria tudo, as mechas pareciam tiras chapadas e
  a mão estava grande. Ficou: rosto mais estreito e fundo no capuz, brilho menor, mechas finas, mão menor.
- O Last Torch continua usando o desenho de cima (decisão do usuário).

## Ajuste

`tools/tuner.html?model=witch`. `previewCharge` (0 a 1) simula o feitiço carregando. No jogo, `renderWitch25D(e)`
carrega pela contagem do tiro (`e.shootTimer` e `chargeSeconds`).
