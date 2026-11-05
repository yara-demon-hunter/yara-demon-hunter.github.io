"""Zeph: compara com as referências e gera giro de 4 vistas + poses.

    ./run.sh scenes/zeph_render.py               # pixel art (como as referências), ~1 s por quadro
    ./run.sh scenes/zeph_render.py --smooth      # toon liso em alta resolução
    ./run.sh scenes/zeph_render.py --realista    # Cycles + PBR (lento na CPU)
    ./run.sh scenes/zeph_render.py --only idle,caminhada

Saída em renders/zeph/:
  _comparacao.png  referência | 3D, lado a lado (idle, caminhada, ataque)  ← olhe esta primeiro
  _folha.png       giro (perfil, frente, 3/4, costas) + todas as poses
  <quadro>.png, zeph.blend
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, "..", "lib"), os.path.join(HERE, "..", "characters")]

import yara_bpy as Y  # noqa: E402
import zeph  # noqa: E402

REF_DIR = os.path.join(Y.BLENDER_DIR, "..", "art_reference", "zeph", "images")
# (pose, giro em graus: 0 = perfil olhando para a direita, -90 = de frente, referência, quadro da referência)
COMPARE = [
    ("idle", -70, "zeph_idle.webp", 0),
    ("caminhada", 0, "zeph_walking.webp", 0),
    ("ataque_impacto", -35, "zeph_axe_attack.webp", 3),
]
TURN = [("giro_perfil", 0), ("giro_frente", -90), ("giro_tres_quartos", -45), ("giro_costas", 90)]

opt = Y.args()
scene = Y.reset_scene()
frame_h = zeph.HEIGHT * 1.6
res = round(opt.px * frame_h / zeph.HEIGHT) * (4 if opt.smooth else 1)
if opt.realista:
    Y.setup_cycles(scene, (res * 3, res * 3), final=opt.final)
    Y.three_point_lights(scene, zeph.HEIGHT)
else:
    Y.setup_toon(scene, (res, res), smooth=opt.smooth)
    Y.toon_sun(scene)
Y.side_camera(scene, frame_h, center=(.1, frame_h / 2 - .1))
Y.ground_shadow(scene)
rig = zeph.build(scene)

out_dir = os.path.join(Y.RENDERS_DIR, "zeph")
only = {s for s in opt.only.split(",") if s}
frames = [(name, rot) for name, rot, *_ in COMPARE] + TURN
frames += [(name, 0) for name in zeph.POSES if name not in {f[0] for f in frames} and name != "neutro"]

done = {}
for name, rot in frames:
    if only and name not in only:
        continue
    rig.rotation_euler.z = rot * Y.RAD
    Y.pose_rig(rig, zeph.BODY, zeph.POSES.get(name, {}), base=zeph.BASE)
    done[name] = Y.render_to(scene, os.path.join(out_dir, f"{name}.png"))

pairs = []
for name, _, ref, idx in COMPARE:
    if name in done:
        refs = Y.reference_frames(os.path.join(REF_DIR, ref), os.path.join(out_dir, "_ref", ref.split(".")[0]))
        pairs += [refs[min(idx, len(refs) - 1)], done[name]]
if pairs:
    Y.contact_sheet(pairs, os.path.join(out_dir, "_comparacao.png"), cols=len(pairs), cell=(330, 520))
rest = [p for n, p in done.items() if n not in {c[0] for c in COMPARE}]
if rest:
    Y.contact_sheet(rest, os.path.join(out_dir, "_folha.png"), cols=4, cell=(330, 480))
Y.save_blend(os.path.join(out_dir, "zeph.blend"))
