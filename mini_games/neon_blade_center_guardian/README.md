# Neon Blade: Center Guardian

## Estrutura

- `neon_blade_center_guardian.html`: tela e elementos da interface.
- `css/game.css`: estilos próprios e ajustes para telas pequenas, áreas seguras e orientação horizontal.
- `data_model/skills.js`: upgrades, dano/alcance/cadência da lâmina, Frenzy Nova e power-ups.
- `data_model/monsters.js`: atributos, aparição, pontuação e recompensas de cada monstro e chefão.
- `data_model/character.js`: atributos e progressão do herói.
- `data_model/core.js`: vida, colisão e aparência do núcleo.
- `js/sound-engine.js`: efeitos de áudio via Web Audio API.
- `js/game.js`: inicialização, controles, regras, atualização e renderização. O motor importa os dados de `data_model/`.
- `draft/`: versões anteriores mantidas como referência.

O HTML carrega os módulos JavaScript; mantenha os caminhos relativos ao reorganizar os arquivos.

## Controles

- **Desktop:** mova o mouse para direcionar o herói ou use `WASD`/setas para movimentar diretamente.
- **Celular ou tablet:** toque na arena para mover o herói até o ponto escolhido; arraste o dedo para atualizar o destino enquanto se move. Os ataques são automáticos, sem joystick ou botões extras.

O jogo usa a mesma lógica e progressão em todas as telas; apenas a disposição da interface e o controle de movimento se adaptam ao dispositivo.

Como o jogo usa módulos ES, abra-o por um servidor HTTP local ou pelo site publicado, não diretamente via `file://`.
