# Last Torch Sandbox

Arena de testes: escolha o herói e o boss e a luta começa na hora. Não faz parte do jogo.

```bash
python3 mini_games/last_torch/_sandbox/serve.py        # http://localhost:8800/
```

- Usa o `last_torch.html` e os módulos reais do jogo (um balanceamento novo aparece ao recarregar a página).
- A pasta começa com `_`, então o Jekyll não a publica, e `build-standalone.rb` não a copia.
- Porta diferente da do jogo = `localStorage` separado: o save da arena nunca toca o do jogo.
- Botão **🧪 Sandbox** (canto inferior esquerdo): reabre o painel para trocar de herói ou boss.
- Opções padrão: **modo deus** ligado para o herói, o boss e a tocha (vida cheia a cada quadro; dá para desligar na hora, mesmo no meio da luta) e **100 pontos de skill** para começar.
- Lista **Monsters**: clique em um ou mais monstros para pô-los na luta (quantos de cada: campo ao lado; nascem em círculo em volta do herói). Para lutar só com eles, clique de novo no boss escolhido para desmarcá-lo. O **modo deus dos monstros** também vem ligado (eles não morrem).
- **Preview: hero unlocked:** botões com cada herói mostram a tela de prêmio de personagem liberado (a mesma do jogo). A caixa "mid-run" mostra a versão do acampamento. Clique em LATER, PLAY AS ou Esc/Enter para fechar e voltar ao painel.
