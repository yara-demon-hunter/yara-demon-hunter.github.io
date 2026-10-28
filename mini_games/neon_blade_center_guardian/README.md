# Neon Blade: Center Guardian

## Estrutura

- `neon_blade_center_guardian.html`: tela e elementos da interface.
- `css/game.css`: estilos próprios e ajustes para telas pequenas, áreas seguras e orientação horizontal.
- `js/models.js`: modelos iniciais dos atributos e do jogador.
- `js/sound-engine.js`: efeitos de áudio via Web Audio API.
- `js/game.js`: inicialização, controles, regras, atualização e renderização do jogo.
- `draft/`: versões anteriores mantidas como referência.

O HTML carrega os módulos JavaScript; mantenha os caminhos relativos ao reorganizar os arquivos.

## Controles

- **Desktop:** mova o mouse para direcionar o herói ou use `WASD`/setas para movimentar diretamente.
- **Celular ou tablet:** toque na arena para mover o herói até o ponto escolhido; arraste o dedo para atualizar o destino enquanto se move. Os ataques são automáticos, sem joystick ou botões extras.

O jogo usa a mesma lógica e progressão em todas as telas; apenas a disposição da interface e o controle de movimento se adaptam ao dispositivo.

Como o jogo usa módulos ES, abra-o por um servidor HTTP local ou pelo site publicado, não diretamente via `file://`.
