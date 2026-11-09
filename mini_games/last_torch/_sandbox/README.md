# Last Torch Sandbox

Arena de testes: escolha o herói e o boss e a luta começa na hora. Não faz parte do jogo.

```bash
python3 mini_games/last_torch/_sandbox/serve.py        # http://localhost:8800/
```

- Usa o `last_torch.html` e os módulos reais do jogo (um balanceamento novo aparece ao recarregar a página).
- A pasta começa com `_`, então o Jekyll não a publica, e `build-standalone.rb` não a copia.
- Porta diferente da do jogo = `localStorage` separado: o save da arena nunca toca o do jogo.
- Botão **🧪 Sandbox** (canto inferior esquerdo): reabre o painel para trocar de herói ou boss.
