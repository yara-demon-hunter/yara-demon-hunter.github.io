# Referências de Arte: Push & Smash

Pasta de **referência** para transformar cada personagem em animações desenhadas em código (Canvas 2D), no mesmo método do last_torch. As imagens daqui **nunca são carregadas pelo jogo**: servem só para entender a forma, as cores e o movimento e recriar tudo proceduralmente (`js/render/character_art.js`), que depois vira atlas (`character_sprites.js`).

## Regras de estilo (valem para todos os personagens)

- **O personagem é uma esfera.** O corpo é um círculo perfeito; tudo o mais é detalhe colado nele.
- **Sem braços e sem pernas.** Nada de membros saindo do corpo, nem pés, nem mãos. Quem se move é a esfera inteira (quica, rola, estica e achata).
- **Partes permitidas:** orelhas, cauda, focinho/bico/tromba, bochechas, mancha, barriga, olhos e boca. Têm que ser pequenas e grudadas na esfera.
- **Silhueta redonda e legível** de longe: o jogador vê o bicho com ~40 px na tela.
- **Rosto de frente** (levemente virado para o lado em que olha; o jogo espelha para a esquerda).
- **Pelo macio, sem contorno escuro**, sombreado suave (luz de cima à esquerda), como em `fox/images/fox_1.webp`. Os bichos antigos ainda usam contorno escuro.
- Animação vem de **escala (squash & stretch)**, pulinhos, orelhas/cauda balançando e troca de expressão, não de membros.

## Como adicionar um personagem

1. Crie `art_reference/<id>/` com `character.md` e `images/` (copie a pasta `fox/`). O `<id>` é o mesmo de `data_model/characters.js`.
2. Coloque as imagens em `images/` (nomes sugeridos no `character.md`).
3. Preencha o `character.md`.
4. Peça: "recrie `art_reference/<id>` seguindo as regras de estilo".

## Dicas para as imagens

- **Fundo liso** e personagem centralizado.
- Rabiscos e esboços servem. Setas indicando movimento ajudam.
- Para animações, poses-chave (início, meio e fim) bastam; o resto é matemática.
