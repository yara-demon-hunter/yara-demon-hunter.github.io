# Testes do Last Torch

`qa_sweep.py` procura falhas sem gastar tokens: roda tudo e imprime **só o que falhou** (FAIL = quebra, WARN = vale olhar).

```
virtualenv --python=python3.12 .venv
source .venv/bin/activate
pip install -r requeriments.txt

# Execute
python3 mini_games/last_torch/_tests/qa_sweep.py                  # dados + telas nos 4 tamanhos
python3 mini_games/last_torch/_tests/qa_sweep.py --play           # + partida rápida de cada herói
python3 mini_games/last_torch/_tests/qa_sweep.py --only desk,p390 --shots   # imagens só das falhas em _tests/out/
```

Precisa de `pip install playwright` e do Chrome. Sai com código 1 se houver FAIL.
O `_` no nome da pasta a mantém fora do pacote da CrazyGames e do Jekyll.

Confere: erros de console e arquivos que não carregam; duas telas ao mesmo tempo; botões fora da tela; rolagem lateral;
alvos de toque pequenos; texto cortado; tela com informação demais; conquistas alcançáveis; ícones; ligações da árvore.
Os WARN de "emoji repetido" e "tela cheia" são avisos de gosto, não quebras.
