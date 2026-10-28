# Referências de Arte

Pasta de **referência** para transformar personagens em animações desenhadas em código (Canvas 2D).
As imagens daqui **nunca são carregadas pelo jogo**: servem só para a IA entender a forma, as cores e o movimento e então recriar tudo proceduralmente (ver `plans/visual-art-plan.md`).

## Como adicionar um personagem

1. Copie a pasta `_template/` e renomeie com o id do personagem (o mesmo id usado no `data_model/`, ex.: `hero`, `normal`, `shooter`, `splitter`, `boss`, `core`).
2. Coloque as imagens em `images/` seguindo os nomes sugeridos abaixo.
3. Preencha o `character.md`. Quanto mais detalhes, melhor o resultado.
4. Peça à IA: "crie a animação de `art_reference/<id>` seguindo o plano visual".

## Estrutura

```
art_reference/
  README.md
  _template/                 modelo para copiar
    character.md             ficha descritiva
    images/
  hero/
    character.md
    images/
      front.png              visão principal (como aparece no jogo, vista de cima)
      side.png               (opcional) outro ângulo
      palette.png            (opcional) paleta de cores
      pose-idle.png          poses-chave de cada animação
      pose-attack-1.png
      pose-attack-2.png
      pose-hurt.png
      inspiration-*.png      referências de estilo (não precisam ser do personagem)
```

## Dicas para as imagens

- O jogo é **visto de cima** (top-down): a imagem mais útil é o personagem visto de cima ou em 3/4.
- **Fundo liso** (de preferência escuro) e personagem centralizado.
- Silhueta clara importa mais que detalhes: tudo vira formas simples (polígonos, arcos, gradientes).
- Para animações, **poses-chave** (início, meio e fim do movimento) bastam; a IA interpola o resto com matemática.
- Rabiscos e esboços servem! Pode desenhar setas indicando movimento.
