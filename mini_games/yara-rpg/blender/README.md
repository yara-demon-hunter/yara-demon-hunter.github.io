# Blender para os personagens do Yara RPG

Modelar, posar e renderizar os personagens em 3D com scripts Python, sem precisar abrir a interface do Blender.
O Claude Code escreve o script, renderiza, olha a imagem e corrige, repetindo o ciclo.

## Rodar
```bash
cd mini_games/yara-rpg/blender
./run.sh scenes/zeph_render.py                # pixel art igual às referências (~10 s no total)
./run.sh scenes/zeph_render.py --smooth       # mesmo visual, liso e em alta resolução
./run.sh scenes/zeph_render.py --realista     # 3D realista (Cycles; lento sem placa de vídeo)
./run.sh scenes/zeph_render.py --only idle    # só um quadro
```
Saída em `renders/zeph/`:
- `_comparacao.png`: a sua referência e o 3D lado a lado (idle, caminhada, ataque);
- `_folha.png`: giro (perfil, frente, 3/4, costas) e as outras poses;
- um PNG por quadro e `zeph.blend`, para abrir no Blender (`blender renders/zeph/zeph.blend`).

## Onde isso entra no jogo
O jogo desenha os personagens em código (`js/systems/rig.js`). O Blender usa **o mesmo esqueleto e os mesmos ângulos**,
então uma pose de `js/data/rig/zeph.js` funciona aqui sem conversão, e vice-versa. Usos possíveis:

1. **Referência** (já funciona): renders de perfil vão para `mini_games/_library/characters/<id>/art_reference/images/` e alimentam o fluxo atual.
   Também dá para testar uma pose no Blender antes de passá-la para o jogo.
2. **Sprites pré-renderizados** (próximo passo, se você quiser): renderizar cada animação quadro a quadro em PNG
   transparente e o palco do jogo passar a desenhar imagens em vez do rig. O visual fica bem mais rico, mas exige
   mudar `stage.js` e aumenta o peso do jogo.

## Pedidos que funcionam bem
- "Crie o personagem `<id>` no Blender a partir de `mini_games/_library/characters/<id>/art_reference/`"
- "Melhore o rosto/cabelo do Zeph e renderize de novo até ficar bom"
- "Passe a animação de ataque do jogo para o Blender e gere os quadros"
- "Use o HDRI `<arquivo>` e materiais PBR na jaqueta"

## Para ficar mais realista
- **HDRI** grátis do [Poly Haven](https://polyhaven.com/hdris) em `assets/hdri/` e depois `Y.world(scene, hdri="arquivo.exr")`.
- **Texturas PBR** do Poly Haven ou do [ambientCG](https://ambientcg.com) (tecido, couro, madeira, metal) em `assets/textures/`.
- **Malhas detalhadas**: gere no Hunyuan3D ou no TRELLIS (alguns rodam online), salve em `assets/models/` (.glb) e peça para prender ao rig.
- Imperfeições: bevel nas bordas e variação de rugosidade. Sem GPU, itere na prévia e use `--final` só no fim.

`assets/` e `renders/` ficam fora do git; tudo é recriado a partir dos scripts.
