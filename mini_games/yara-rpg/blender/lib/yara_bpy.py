"""Helpers comuns para as cenas do Yara RPG no Blender (rodar com blender -b -P, ver run.sh).

Convenções iguais às de js/systems/rig.js, para que uma pose do jogo funcione aqui sem conversão:
- personagem de perfil olhando para a DIREITA (+X no Blender); câmera em -Y olhando para +Y;
- Z para cima, chão em z = 0; medidas do corpo em frações da altura (1 = pés ao topo da cabeça);
- membro: 0 = aponta para baixo, 90 = para frente, 180 = para cima, -90 = para trás;
- torso/cabeça: 0 = em pé, positivo inclina para frente;
- ombro é relativo ao torso; cotovelo e joelho, ao segmento anterior; perna e arma são absolutos.

Dois estilos de render (STYLE["toon"]):
- toon (padrão): Eevee, 3 faixas de cor por material (a rampa [sombra, base, luz] do jogo), contorno escuro
  e render em baixa resolução = visual de pixel art igual às referências;
- realista: Cycles + materiais PBR.
"""
import argparse
import math
import os
import shutil
import subprocess
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

BLENDER_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RENDERS_DIR = os.path.join(BLENDER_DIR, "renders")
ASSETS_DIR = os.path.join(BLENDER_DIR, "assets")
RAD = math.pi / 180

STYLE = {
    "toon": True,
    # "post": contorno de 1 px desenhado depois do render (silhueta + borda da peça da frente entre partes);
    # "hull": casca invertida em 3D (pode pontilhar onde peças se cruzam)
    "outline_mode": "post",
    "outline": .016,           # espessura da casca (só no modo hull)
    "outline_color": "#1e1712",
    "outline_jump": .08,       # modo post: degrau de profundidade (m) que vira linha dentro da mesma parte
    "cuts": (.16, .66),
}


# ---------------------------------------------------------------- argumentos
def args(extra=None):
    """Lê os argumentos depois de `--` (ver run.sh)."""
    p = argparse.ArgumentParser()
    p.add_argument("--only", default="", help="renderiza só estes quadros (separados por vírgula)")
    p.add_argument("--px", type=int, default=150, help="altura do personagem em pixels (pixel art)")
    p.add_argument("--smooth", action="store_true", help="toon em alta resolução, sem pixelizar")
    p.add_argument("--realista", action="store_true", help="Cycles + PBR em vez de toon")
    p.add_argument("--final", action="store_true", help="realista: mais samples")
    if extra:
        extra(p)
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    o = p.parse_args(argv)
    STYLE["toon"] = not o.realista
    return o


# ---------------------------------------------------------------- cena e render
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def setup_toon(scene, size, smooth=False):
    """Eevee sem antisserrilhado = pixels nítidos. --smooth: suave em alta resolução."""
    scene["smooth"] = smooth
    scene.render.dither_intensity = 0
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 16 if smooth else 1
    scene.render.filter_size = 1.5 if smooth else 0.0
    _common(scene, size)
    scene.view_settings.view_transform = "Standard"  # cores exatas do hex
    scene.view_settings.look = "None"


def setup_cycles(scene, size, final=False):
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 256 if final else 32
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = "OPENIMAGEDENOISE"
    _common(scene, size)
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Punchy"


def _common(scene, size):
    scene.render.resolution_x, scene.render.resolution_y = size
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"


def render_to(scene, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    post = STYLE["toon"] and STYLE["outline_mode"] == "post"
    if post:
        id_path = path[:-4] + ".__id.png"
        _render_id_pass(scene, id_path)
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    if post:
        _post_outline(path, id_path, scene)
        os.remove(id_path)
    print(f"[yara] render: {path}")
    return path


# ---------------------------------------------------------------- contorno em pós-processamento
_Z_RANGE = (8.6, 11.4)  # câmera em y = -10: profundidades do personagem caem neste intervalo


def _srgb(v):
    return 12.92 * v if v <= .0031308 else 1.055 * v ** (1 / 2.4) - .055


def _id_material():
    mat = bpy.data.materials.get("_part_id")
    if mat:
        return mat
    mat = bpy.data.materials.new("_part_id")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    n, L = nt.nodes.new, nt.links.new
    attr = n("ShaderNodeAttribute")
    attr.attribute_type, attr.attribute_name = "OBJECT", "part_val"
    cam = n("ShaderNodeCameraData")
    rng = n("ShaderNodeMapRange")
    rng.inputs["From Min"].default_value, rng.inputs["From Max"].default_value = _Z_RANGE
    comb = n("ShaderNodeCombineColor")
    em = n("ShaderNodeEmission")
    out = n("ShaderNodeOutputMaterial")
    L(attr.outputs["Fac"], comb.inputs[0])
    L(cam.outputs["View Z Depth"], rng.inputs["Value"])
    L(rng.outputs["Result"], comb.inputs[1])
    L(comb.outputs[0], em.inputs["Color"])
    L(em.outputs[0], out.inputs["Surface"])
    return mat


def _render_id_pass(scene, path):
    """Render auxiliar: R = parte do corpo (obj["part"]), G = profundidade."""
    meshes = [o for o in scene.objects if o.type == "MESH" and not o.hide_render]
    parts = sorted({o.get("part", o.name) for o in meshes})
    ids = {p: i + 1 for i, p in enumerate(parts)}
    scene["part_count"] = len(parts)
    hidden = []
    for o in meshes:
        if o.get("no_id"):
            o.hide_render = True
            hidden.append(o)
        o["part_val"] = ids[o.get("part", o.name)] / (len(parts) + 1)
    vl = bpy.context.view_layer
    vl.material_override = _id_material()
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    vl.material_override = None
    for o in hidden:
        o.hide_render = False


def _post_outline(path, id_path, scene):
    import numpy as np
    img = _load_px(path)
    idp = _load_px(id_path)
    n = scene["part_count"]
    expected = np.array([0] + [round(255 * _srgb(i / (n + 1))) for i in range(1, n + 1)], np.float32)
    rb = np.round(idp[..., 0] * 255)
    pid = np.abs(rb[..., None] - expected[None, None, :]).argmin(-1)
    pid[idp[..., 3] < .5] = 0
    depth = idp[..., 1] * 255
    zr = _Z_RANGE[1] - _Z_RANGE[0]
    jump = STYLE["outline_jump"] / zr * 255 * .6  # bytes (codificação sRGB ≈ 0,6 de inclinação no meio)
    inside = pid > 0
    mark = np.zeros(pid.shape, bool)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        q_id = np.roll(pid, (dy, dx), (0, 1))
        q_d = np.roll(depth, (dy, dx), (0, 1))
        q_in = q_id > 0
        front = (depth < q_d) | ((depth == q_d) & (pid > q_id))
        mark |= inside & q_in & (((pid != q_id) & front) | (q_d - depth > jump))
        mark |= ~inside & q_in  # silhueta: anel de 1 px por fora
    k = 3 if scene.get("smooth") else 0
    for _ in range(k):
        grow = mark.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            grow |= np.roll(mark, (dy, dx), (0, 1))
        mark = grow
    oc = [_srgb(c) for c in hex_rgb(STYLE["outline_color"])]
    img[mark] = (*oc, 1)
    _save_px(img, path)


def _save_px(px, path):
    h, w = px.shape[:2]
    out = bpy.data.images.new("_out", w, h, alpha=True)
    out.pixels.foreach_set(px.ravel())
    out.filepath_raw = path
    out.file_format = "PNG"
    out.save()
    bpy.data.images.remove(out)


def save_blend(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=path)
    print(f"[yara] blend: {path}")


# ---------------------------------------------------------------- câmera e luz
def side_camera(scene, frame_h, center=(0, 0)):
    """Câmera ortográfica de frente para o plano XZ (o personagem de perfil olha para a direita).
    frame_h = altura do quadro em metros."""
    cam_data = bpy.data.cameras.new("Camera")
    cam_data.type = "ORTHO"
    cam_data.sensor_fit = "VERTICAL"
    cam_data.ortho_scale = frame_h
    cam = bpy.data.objects.new("Camera", cam_data)
    scene.collection.objects.link(cam)
    cam.location = (center[0], -10, center[1])
    cam.rotation_euler = (math.pi / 2, 0, 0)
    scene.camera = cam
    return cam


def toon_sun(scene, frm=(-.7, -1.6, 2.0), strength=3.0):
    """Luz única (STYLE.md): de cima, do lado da câmera, um pouco da esquerda."""
    data = bpy.data.lights.new("Sun", "SUN")
    data.energy = strength
    data.angle = .02
    data.use_shadow = False  # pixel art: sombreado só pela forma, sem sombra projetada (evita pontilhado)
    obj = bpy.data.objects.new("Sun", data)
    scene.collection.objects.link(obj)
    obj.rotation_euler = (-Vector(frm)).to_track_quat("-Z", "Y").to_euler()
    w = bpy.data.worlds.new("World")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0
    scene.world = w
    return obj


def three_point_lights(scene, height=1.75):
    """Realista: principal quente de cima/frente, preenchimento frio, contraluz."""
    for name, loc, energy, color, size in (
            ("Key", (2.2, -2.4, height * 2.0), 380, (1.0, .92, .82), 1.6),
            ("Fill", (-2.0, -3.0, height * 1.0), 70, (.78, .86, 1.0), 2.5),
            ("Rim", (-1.5, 2.5, height * 1.6), 300, (1.0, .95, .9), 1.0)):
        data = bpy.data.lights.new(name, "AREA")
        data.energy, data.color, data.size = energy, color, size
        obj = bpy.data.objects.new(name, data)
        scene.collection.objects.link(obj)
        obj.location = loc
        obj.rotation_euler = (Vector((0, 0, .9)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    w = bpy.data.worlds.new("World")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (.05, .055, .07, 1)
    scene.world = w


def ground_shadow(scene, size=(.32, .2), alpha=.28):
    """Sombra oval nos pés (como nas referências)."""
    bpy.ops.mesh.primitive_circle_add(vertices=32, radius=1, fill_type="NGON", location=(0, 0, .001))
    obj = bpy.context.active_object
    obj.name = "GroundShadow"
    obj["no_id"] = True
    obj.scale = (size[0], size[1], 1)
    mat = bpy.data.materials.new("ground_shadow")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    mix = nt.nodes.new("ShaderNodeMixShader")
    mix.inputs["Fac"].default_value = alpha
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (0, 0, 0, 1)
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    mat.surface_render_method = "BLENDED"
    obj.data.materials.append(mat)
    return obj


# ---------------------------------------------------------------- materiais
def hex_rgb(h):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in srgb)


def _ramp3(ramp):
    return list(ramp) if isinstance(ramp, (list, tuple)) else [ramp, ramp, ramp]


def material(name, ramp, roughness=.7, metallic=0.0, sheen=0.0, subsurface=0.0):
    """Toon: 3 faixas exatas da rampa do jogo [sombra, base, luz]. Realista: PBR com a cor base."""
    if bpy.data.materials.get(name):
        return bpy.data.materials[name]
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    shadow, base, light = _ramp3(ramp)
    if STYLE["toon"]:
        nt.nodes.clear()
        n = nt.nodes.new
        out, diff, s2r = n("ShaderNodeOutputMaterial"), n("ShaderNodeBsdfDiffuse"), n("ShaderNodeShaderToRGB")
        bw, cr, em = n("ShaderNodeRGBToBW"), n("ShaderNodeValToRGB"), n("ShaderNodeEmission")
        L = nt.links.new
        L(diff.outputs[0], s2r.inputs[0])
        L(s2r.outputs["Color"], bw.inputs[0])
        L(bw.outputs[0], cr.inputs["Fac"])
        L(cr.outputs["Color"], em.inputs["Color"])
        L(em.outputs[0], out.inputs["Surface"])
        r = cr.color_ramp
        r.interpolation = "CONSTANT"
        r.elements[0].position, r.elements[0].color = 0, (*hex_rgb(shadow), 1)
        r.elements[1].position, r.elements[1].color = STYLE["cuts"][0], (*hex_rgb(base), 1)
        r.elements.new(STYLE["cuts"][1]).color = (*hex_rgb(light), 1)
        return mat
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*hex_rgb(base), 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if sheen:
        bsdf.inputs["Sheen Weight"].default_value = sheen
    if subsurface:
        bsdf.inputs["Subsurface Weight"].default_value = subsurface
        bsdf.inputs["Subsurface Scale"].default_value = .01
    return mat


def _outline_material():
    mat = bpy.data.materials.get("_outline")
    if mat:
        return mat
    mat = bpy.data.materials.new("_outline")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*hex_rgb(STYLE["outline_color"]), 1)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    mat.use_backface_culling = True
    return mat


def add_outline(obj, thickness=None):
    """Contorno por 'casca invertida': cópia um pouco maior, de normais invertidas, só com as costas visíveis."""
    t = STYLE["outline"] if thickness is None else thickness
    if not STYLE["toon"] or STYLE["outline_mode"] != "hull" or t <= 0:
        return
    obj.data.materials.append(_outline_material())
    m = obj.modifiers.new("Outline", "SOLIDIFY")
    m.thickness, m.offset, m.use_flip_normals = t, 1, True
    m.material_offset = len(obj.data.materials) - 1
    m.use_rim = False


# ---------------------------------------------------------------- formas básicas
def _new(name):
    obj = bpy.context.active_object
    obj.name = name
    return obj


def _finish(obj, mat, subsurf=2, bevel=0.0, smooth=True, outline=None):
    if mat:
        obj.data.materials.append(mat)
    if bevel:
        m = obj.modifiers.new("Bevel", "BEVEL")
        m.width, m.segments = bevel, 2
    if subsurf:
        m = obj.modifiers.new("Subsurf", "SUBSURF")
        m.levels = m.render_levels = subsurf
    for poly in obj.data.polygons:
        poly.use_smooth = smooth
    add_outline(obj, outline)
    return obj


def limb(name, length, r_top, r_bottom, mat, subsurf=2, squash=1.0, verts=32, outline=None):
    """Segmento afunilado ao longo de +Y local, de 0 (r_top) até `length` (r_bottom).
    squash < 1 achata no X local (frente-trás)."""
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r_top, radius2=r_bottom, depth=length,
                                    location=(0, length / 2, 0), rotation=(-math.pi / 2, 0, 0))
    obj = _new(name)
    obj.scale = (squash, 1, 1)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return _finish(obj, mat, subsurf, outline=outline)


def blob(name, size, mat, loc=(0, 0, 0), rot=(0, 0, 0), subsurf=2, outline=None):
    """Elipsoide. `size` = raios em X, Y, Z locais; `rot` em graus."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=loc)
    obj = _new(name)
    obj.scale = size
    obj.rotation_euler = [a * RAD for a in rot]
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    return _finish(obj, mat, subsurf, outline=outline)


def box(name, size, mat, loc=(0, 0, 0), rot=(0, 0, 0), bevel=.004, subsurf=1, outline=None):
    """Caixa de tamanho total `size`, arredondada por bevel + subsurf."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = _new(name)
    obj.scale = size
    obj.rotation_euler = [a * RAD for a in rot]
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    return _finish(obj, mat, subsurf, bevel, outline=outline)


def disc(name, radius, thickness, mat, loc, normal, outline=None):
    """Remendo redondo achatado, com a face voltada para `normal`."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=radius, depth=thickness, location=loc)
    obj = _new(name)
    obj.rotation_euler = Vector(normal).to_track_quat("Z", "Y").to_euler()
    bpy.ops.object.transform_apply(rotation=True)
    return _finish(obj, mat, 1, outline=outline)


def spike(name, base, direction, length, radius, mat, verts=7, outline=None):
    """Mecha/espinho: cone com a base em `base` apontando para `direction`."""
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=radius, radius2=0, depth=length,
                                    location=(0, 0, length / 2))
    obj = _new(name)
    bpy.ops.object.transform_apply(location=True)
    obj.rotation_euler = Vector(direction).to_track_quat("Z", "Y").to_euler()
    obj.location = base
    bpy.ops.object.transform_apply(rotation=True)
    return _finish(obj, mat, 1, outline=outline)


def prism(name, pts, thickness, mat, loc=(0, 0, 0), outline=None):
    """Polígono (x, y) extrudado em Z (lâminas, placas)."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    face = bm.faces.new([bm.verts.new((x, y, -thickness / 2)) for x, y in pts])
    res = bmesh.ops.extrude_face_region(bm, geom=[face])
    bmesh.ops.translate(bm, vec=(0, 0, thickness), verts=[g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = loc
    return _finish(obj, mat, 0, bevel=.002, smooth=False, outline=outline)


def tube(name, pts, radius, mat, outline=None):
    """Corda/alça passando pelos pontos (convertida em malha para ganhar contorno)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth, cu.bevel_resolution = radius, 2
    sp = cu.splines.new("NURBS")
    sp.points.add(len(pts) - 1)
    for p, co in zip(sp.points, pts):
        p.co = (*co, 1)
    sp.use_endpoint_u, sp.order_u = True, 3
    obj = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(obj)
    for o in bpy.context.selected_objects:
        o.select_set(False)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj = bpy.context.active_object
    return _finish(obj, mat, 0, outline=outline)


def attach(obj, arm, bone):
    """Prende a peça ao osso. Coordenadas da peça = locais ao osso, a partir da articulação:
    +Y ao longo do osso; ver o topo de characters/<id>.py para o sentido de X e Z.
    obj["part"] (padrão "<cadeia>:<material>", ex. "arm.F:jacket") decide o contorno no modo post:
    peças com a mesma parte não ganham linha entre si; dê a parte de quem está embaixo para um detalhe
    que não deve ter contorno (ex.: íris → "head:skin")."""
    if "part" not in obj:
        chain = {"hips": "torso", "neck": "torso", "head": "head", "weapon": "weapon"}.get(bone)
        if not chain:
            limb_, side = bone.split(".")
            chain = ("arm." if limb_ in ("upperArm", "forearm", "hand") else "leg.") + side
        mat = obj.data.materials[0].name if obj.data.materials else "none"
        obj["part"] = f"{chain}:{mat}"
    obj.parent = arm
    obj.parent_type = "BONE"
    obj.parent_bone = bone
    obj.location = obj.location + Vector((0, -arm.data.bones[bone].length, 0))  # BONE prende na cauda
    return obj


# ---------------------------------------------------------------- esqueleto
def build_armature(scene, body, height, weapon_len=0.5, name="Rig"):
    """Armadura em pose neutra. Ossos soltos (use_connect=False): pose_rig() calcula tudo (FK + IK)."""
    b = {k: v * height for k, v in body.items()}
    data = bpy.data.armatures.new(name)
    arm = bpy.data.objects.new(name, data)
    scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    up, down, fwd = Vector((0, 0, 1)), Vector((0, 0, -1)), Vector((1, 0, 0))
    hip_z = b["foot"] + b["shin"] + b["thigh"]
    sh_z = hip_z + b["torso"] - b["shoulderDrop"]

    def bone(n, head, direction, length, parent=None):
        eb = data.edit_bones.new(n)
        eb.head = head
        eb.tail = Vector(head) + direction * length
        eb.align_roll(Vector((0, 1, 0)))
        eb.use_connect = False
        if parent:
            eb.parent = data.edit_bones[parent]

    bone("hips", (0, 0, hip_z), up, b["torso"])
    bone("neck", (0, 0, hip_z + b["torso"]), up, b["neck"], "hips")
    bone("head", (0, 0, hip_z + b["torso"] + b["neck"]), up, b["head"], "neck")
    for side, y in (("F", -1), ("B", 1)):
        hy, sy = y * b["hipDepth"], y * b["shoulderDepth"]
        bone(f"thigh.{side}", (0, hy, hip_z), down, b["thigh"], "hips")
        bone(f"shin.{side}", (0, hy, hip_z - b["thigh"]), down, b["shin"], f"thigh.{side}")
        bone(f"foot.{side}", (0, hy, b["foot"]), fwd, b["footLength"], f"shin.{side}")
        bone(f"upperArm.{side}", (0, sy, sh_z), down, b["upperArm"], "hips")
        bone(f"forearm.{side}", (0, sy, sh_z - b["upperArm"]), down, b["forearm"], f"upperArm.{side}")
        bone(f"hand.{side}", (0, sy, sh_z - b["upperArm"] - b["forearm"]), down, b["hand"], f"forearm.{side}")
    bone("weapon", (.2, -b["shoulderDepth"], hip_z), up, weapon_len * height, "hand.F")
    bpy.ops.object.mode_set(mode="OBJECT")
    arm["height"] = height
    arm["weapon_len"] = weapon_len * height
    return arm


def _dir_down(deg):  # membro: 0 = para baixo, 90 = para frente
    return Vector((math.sin(deg * RAD), 0, -math.cos(deg * RAD)))


def _dir_up(deg):  # tronco: 0 = em pé, + = para frente
    return Vector((math.sin(deg * RAD), 0, math.cos(deg * RAD)))


def _bone_matrix(head, direction, up_hint=Vector((0, 1, 0))):
    y = direction.normalized()
    x = y.cross(up_hint)
    if x.length < 1e-4:
        x = y.cross(Vector((1, 0, 0)))
    x.normalize()
    z = x.cross(y)
    m = Matrix((x, y, z)).transposed().to_4x4()
    m.translation = head
    return m


def _ik2(root, target, l1, l2, pole):
    """IK de duas juntas em 3D: devolve as direções do 1º e 2º segmento; o meio dobra para `pole`."""
    v = target - root
    d = min(max(v.length, 1e-4), (l1 + l2) * .999)
    n = v.normalized()
    a = math.acos(max(-1, min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))))
    u = Vector(pole) - n * Vector(pole).dot(n)
    if u.length < 1e-5:
        u = n.orthogonal()
    u.normalize()
    mid = root + (n * math.cos(a) + u * math.sin(a)) * l1
    end = root + n * d
    return (mid - root).normalized(), (end - mid).normalized()


def pose_rig(arm, body, pose, base=None):
    """Aplica uma pose no formato do jogo (campos de js/data/rig/<id>.js):
    torso, head, armF/armB [ombro, cotovelo], legF/legB [quadril, joelho], feet [xFrente, xTrás] (IK),
    crouch, hipShift, x, lift, weapon (ângulo), grip/grip2 (onde cada mão segura, a partir do pé do cabo),
    twoHand (mão de trás vai ao cabo por IK), blade (1/-1 vira a lâmina), weaponOnBack (esconde a arma).
    Extras do 3D: cross (0..1) traz a mão da frente para o meio do peito; reachF [x, y, z] põe a mão da frente
    num ponto relativo aos ombros (y < 0 = lado da câmera); weaponSide (graus) inclina a arma para o lado;
    bladeRoll (graus) gira a arma em torno do cabo."""
    p = dict(base or {})
    p.update(pose)
    h = arm["height"]
    L = arm["weapon_len"]
    b = {k: v * h for k, v in body.items()}
    T = p.get("torso", 0)
    hip_z = b["foot"] + b["shin"] + b["thigh"] - p.get("crouch", 0) * h + p.get("lift", 0) * h
    hip = Vector(((p.get("x", 0) + p.get("hipShift", 0)) * h, 0, hip_z))
    put = {}

    t_dir = _dir_up(T)
    put["hips"] = (hip, t_dir)
    neck = hip + t_dir * b["torso"]
    n_dir = _dir_up(T + p.get("head", 0) * .5)
    put["neck"] = (neck, n_dir)
    put["head"] = (neck + n_dir * b["neck"], _dir_up(T * .4 + p.get("head", 0)))
    shoulder = hip + t_dir * (b["torso"] - b["shoulderDrop"])

    feet = p.get("feet")
    for side, y in (("F", -1), ("B", 1)):
        hip_s = hip + Vector((0, y * b["hipDepth"], 0))
        if feet and not p.get("lift"):
            target = Vector(((p.get("x", 0) + feet[0 if side == "F" else 1]) * h, y * b["hipDepth"], b["foot"]))
            thigh, shin = _ik2(hip_s, target, b["thigh"], b["shin"], (1, 0, 0))
        else:
            leg = p.get(f"leg{side}", [0, 0])
            thigh, shin = _dir_down(leg[0]), _dir_down(leg[0] + leg[1])
        knee = hip_s + thigh * b["thigh"]
        put[f"thigh.{side}"] = (hip_s, thigh)
        put[f"shin.{side}"] = (knee, shin)
        put[f"foot.{side}"] = (knee + shin * b["shin"], Vector((1, 0, 0)))

    def arm_fk(side):
        a = p.get(f"arm{side}", [0, 0])
        sh = shoulder + Vector((0, (-1 if side == "F" else 1) * b["shoulderDepth"], 0))
        return sh, _dir_down(T + a[0]), _dir_down(T + a[0] + a[1])

    def arm_ik(sh, grip, pole):
        return _ik2(sh, grip, b["upperArm"], b["forearm"] + b["hand"] * .5, pole)

    def put_arm(side, sh, ua, fa):
        elbow = sh + ua * b["upperArm"]
        wrist = elbow + fa * b["forearm"]
        put[f"upperArm.{side}"] = (sh, ua)
        put[f"forearm.{side}"] = (elbow, fa)
        put[f"hand.{side}"] = (wrist, fa)
        return wrist + fa * b["hand"] * .5  # centro do punho fechado

    sh, ua, fa = arm_fk("F")
    grip = sh + ua * b["upperArm"] + fa * (b["forearm"] + b["hand"] * .5)
    if p.get("reachF"):  # alvo direto da mão da frente, relativo ao meio dos ombros (em alturas do corpo)
        grip = shoulder + Vector(p["reachF"]) * h
        ua, fa = arm_ik(sh, grip, (-.2, -1, -.6))
    elif p.get("cross"):
        grip.y *= 1 - p["cross"]
        ua, fa = arm_ik(sh, grip, (-.2, -1, -.6))
    grip = put_arm("F", sh, ua, fa)

    wdir = _dir_down(p.get("weapon", 180))
    if p.get("weaponSide"):  # inclina a arma para o lado da frente (-Y), ex.: cabo cruzando o peito
        wdir = Matrix.Rotation(p["weaponSide"] * RAD, 3, "X") @ wdir
    butt = grip - wdir * p.get("grip", .2) * L
    put["weapon"] = (butt, wdir)

    sh, ua, fa = arm_fk("B")
    if p.get("twoHand"):
        ua, fa = arm_ik(sh, butt + wdir * p.get("grip2", .05) * L, (-.3, .6, -1))
    put_arm("B", sh, ua, fa)

    order = ["hips", "neck", "head"] + [f"{s}.{x}" for x in "FB" for s in
                                         ("thigh", "shin", "foot", "upperArm", "forearm", "hand")] + ["weapon"]
    roll = p.get("bladeRoll", 0) + (180 if p.get("blade", 1) < 0 else 0)
    for name in order:
        head, direction = put[name]
        m = _bone_matrix(head, direction)
        if name == "weapon" and roll:
            m = m @ Matrix.Rotation(roll * RAD, 4, "Y")
        arm.pose.bones[name].matrix = m
        bpy.context.view_layer.update()
    for child in arm.children:
        if child.parent_bone == "weapon":
            child.hide_render = bool(p.get("weaponOnBack"))


# ---------------------------------------------------------------- referências e folhas
def reference_frames(path, out_dir):
    """Quadros de uma referência animada (WebP/GIF) como PNG. Usa anim_dump se existir; senão, só o 1º quadro."""
    os.makedirs(out_dir, exist_ok=True)
    frames = sorted(f for f in os.listdir(out_dir) if f.endswith(".png"))
    tool = shutil.which("anim_dump")
    if not frames and tool:
        subprocess.run([tool, "-folder", out_dir, "-prefix", "f_", path], capture_output=True)
        frames = sorted(f for f in os.listdir(out_dir) if f.endswith(".png"))
    return [os.path.join(out_dir, f) for f in frames] or [path]


def _load_px(path):
    import numpy as np
    im = bpy.data.images.load(path, check_existing=False)
    w, h = im.size
    px = np.empty(w * h * 4, np.float32)
    im.pixels.foreach_get(px)
    bpy.data.images.remove(im)
    return px.reshape(h, w, 4)


def _crop(px, pad=4):
    import numpy as np
    ys, xs = np.where(px[..., 3] > .05)
    if not len(ys):
        return px
    return px[max(0, ys.min() - pad):ys.max() + pad + 1, max(0, xs.min() - pad):xs.max() + pad + 1]


def _fit(px, cw, ch):
    """Escala por vizinho mais próximo (pixels nítidos); ampliações em múltiplos inteiros."""
    import numpy as np
    h, w = px.shape[:2]
    s = min(cw / w, ch / h)
    if s >= 1:
        s = max(1, math.floor(s))
    nh, nw = max(1, int(h * s)), max(1, int(w * s))
    yi = np.minimum((np.arange(nh) / s).astype(int), h - 1)
    xi = np.minimum((np.arange(nw) / s).astype(int), w - 1)
    return px[yi][:, xi]


def contact_sheet(paths, out, cols=4, cell=(360, 520), bg=.93):
    """Junta imagens numa folha (cortadas no conteúdo, alinhadas pelo chão)."""
    import numpy as np
    cw, ch = cell
    rows = math.ceil(len(paths) / cols)
    sheet = np.ones((rows * ch, cols * cw, 4), np.float32)
    sheet[..., :3] = bg
    for i, path in enumerate(paths):
        px = _fit(_crop(_load_px(path)), cw - 20, ch - 20)
        h, w = px.shape[:2]
        r, c = divmod(i, cols)
        y0 = (rows - 1 - r) * ch + 10  # linhas do Blender vêm de baixo para cima
        x0 = c * cw + (cw - w) // 2
        dst = sheet[y0:y0 + h, x0:x0 + w]
        a = px[..., 3:4]
        dst[..., :3] = px[..., :3] * a + dst[..., :3] * (1 - a)
    _save_px(sheet, out)
    print(f"[yara] folha: {out}")
    return out
