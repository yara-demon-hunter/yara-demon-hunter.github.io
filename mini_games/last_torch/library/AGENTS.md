# Instruções para IAs e agentes de código

Esta pasta (`library/`) é uma **cópia gerada**. **Nunca edite, crie ou apague arquivos aqui**: o próximo sync
desfaz tudo e `sync.rb --check` acusa a diferença.

Para qualquer mudança de arte de personagem ou monstro (desenho, cores, medidas, animação):

1. Edite o arquivo de mesmo caminho em `mini_games/_library/` (ex.: `library/monsters/bat/bat.js` →
   `mini_games/_library/monsters/bat/bat.js`). A primeira linha de cada `.js` daqui diz qual é o original.
2. Rode na raiz do repositório: `ruby mini_games/_library/sync.rb`
3. Confira: `ruby mini_games/_library/sync.rb --check`

Regras do jogo e balanceamento (vida, dano, ataques) não ficam aqui: ficam no código do próprio jogo.
Manual completo: `mini_games/_library/README.md`. Referência de arte: `mini_games/_library/<tipo>/<id>/art_reference/`.
