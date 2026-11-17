# Ferramentas do layout fluido

O HUD e os controles de toque usam o **layout fluido** (`js/ui/fluid_layout.js`, tabela em `data_model/fluid_layout.js`): três
perfis (portrait, landscape e desktop) com algumas telas de referência cada, interpolando entre elas e escalando
proporcionalmente fora delas. A tabela é gerada, não editada à mão.

Como aplicar um envio novo do HUD tuner (precisa de Playwright e do Chrome):
1. Gere o pacote (`ruby mini_games/last_torch/build-standalone.rb`) e sirva `standalone-build/` por HTTPS.
2. Meça o layout **base** (sem a camada fluida) nas telas de referência: `python3 fluid_measure.py base.json 'https://.../?fluid=0'`.
3. Meça onde o dono deixou cada peça (o jogo atual com os ajustes do envio somados) e salve como `ajustado.json`.
4. `python3 fluid_solve.py base.json ajustado.json` regera `data_model/fluid_layout.js`.
Uma tela nova entra como ponto de referência novo (acrescente-a em `SCREENS` de `fluid_measure.py`); uma tela já existente é atualizada.
