# Yara Demon Hunter

Site Jekyll (GitHub Pages) bilíngue (pt/en) com mini-games em JS puro.

## Estrutura
- Site: _layouts, _includes, _data, assets/, pt/, en/
- Jogos: mini_games/<jogo>/ (HTML/CSS/JS, sem framework, exceto yara-rpg com Tailwind)
- _site/ e vendor/ são gerados: nunca editar nem ler.

## Regras
- Todo conteúdo novo precisa existir em pt/ e en/.
- Rodar `ruby script/validate_content.rb` antes de concluir mudanças no site.
- Para melhorar jogos, usar as skills de game dev em .claude/skills/.