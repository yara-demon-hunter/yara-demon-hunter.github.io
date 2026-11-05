# Blender — personagens do Yara RPG

Pasta de trabalho 3D do yara-rpg. Nada aqui é carregado pelo jogo nem publicado no site (excluída em `_config.yml`).
Serve para modelar, posar e renderizar personagens; o que for útil sai como imagem para `../art_reference/<id>/images/`.

## Fluxo (sempre em loop)
1. **Modele a partir das imagens de `../art_reference/<id>/images/`**, não das proporções do rig 2D.
   Extraia os quadros (o script faz isso em `renders/<id>/_ref/`), meça proporções e anote no topo de `characters/<id>.py`.
2. Escreva/edite o script `bpy`: personagem em `characters/<id>.py`, cena em `scenes/<id>_render.py`.
3. Renderize sem janela: `./run.sh scenes/<id>_render.py` (`--only a,b` para alguns quadros).
4. **Abra `renders/<id>/_comparacao.png`** (referência | 3D, lado a lado) e compare: silhueta, proporção,
   cabelo, rosto, roupa, cores, pose. Depois `_folha.png` (giro de 4 vistas + poses).
5. Corrija e renderize de novo. Só diga que terminou depois de olhar o último render.

## Regras
- **Convenções iguais às de `../js/systems/rig.js`**: perfil olhando para +X, câmera em -Y, ângulos do jogo
  (0 = membro para baixo, 90 = para frente). Uma pose de `../js/data/rig/<id>.js` cola em `POSES` sem conversão.
- Cores vêm das rampas de `../js/data/rig/<id>.js`, conferidas com as referências; a proporção vem das imagens. Não importe nada do jogo.
  Guia de realismo: `../art_reference/STYLE.md`.
- **Estilo padrão = pixel art igual às referências**: Eevee (GPU AMD integrada, < 1 s por quadro), 3 faixas de cor
  por material = rampa `[sombra, base, luz]`, luz única sem sombra projetada, render pequeno (`--px`, altura do
  personagem em pixels) sem antisserrilhado, contorno de 1 px em pós-processamento.
- Contorno (`STYLE["outline_mode"] = "post"`): um render auxiliar grava parte + profundidade; a linha vai na
  silhueta e na borda da peça da frente quando a parte muda (`obj["part"]`, padrão `<cadeia>:<material>`).
  Detalhe sem contorno (íris, corda, fivela): `part(obj, "head:skin")` com a parte de quem está embaixo.
  Não use o modo "hull" (casca invertida): pontilha onde as peças se cruzam.
- `--smooth` = toon liso em alta resolução; `--realista` = Cycles + PBR (lento na CPU, sem GPU NVIDIA).
- `renders/` e `assets/` (HDRI, texturas, .glb) não vão para o git. Reconstrua sempre a partir dos scripts.
- Malha complexa (gerada no Hunyuan3D/TRELLIS ou baixada): coloque em `assets/models/`, importe com
  `bpy.ops.import_scene.gltf(filepath=...)` e prenda aos ossos do rig com `attach()` ou weight paint automático.

## Mapa
| Arquivo | O que tem |
|---|---|
| `run.sh` | roda `blender -b -P <cena> -- <args>` e filtra o log |
| `lib/yara_bpy.py` | render toon/realista, contorno pós, câmera, luz, materiais, formas (`limb blob box disc spike prism tube`), armadura, `pose_rig` (FK + IK), quadros da referência, folhas |
| `characters/<id>.py` | o que a referência mostra (topo), `BODY`, `COLORS`, `BASE`, `POSES` e `build(scene)` |
| `scenes/<id>_render.py` | `COMPARE` (pose, giro, referência, quadro), giro de 4 vistas; salva PNGs, `_comparacao.png`, `_folha.png`, `.blend` |

Ossos: `hips` (tronco), `neck`, `head`, `thigh/shin/foot.{F,B}`, `upperArm/forearm/hand.{F,B}`, `weapon` (filho de `hand.F`).
F = lado da frente (perto da câmera, y < 0). Peças: +Y local ao longo do osso; em ossos que apontam para baixo
+X = frente; em ossos que apontam para cima (tronco, cabeça) -X = frente.

Campos extras de pose só do 3D: `reachF` (alvo da mão da frente), `cross`, `weaponSide`, `bladeRoll`.
Ainda não feito: `weaponOnBack` só esconde a arma; `lid`/`frown` não animam o rosto.
