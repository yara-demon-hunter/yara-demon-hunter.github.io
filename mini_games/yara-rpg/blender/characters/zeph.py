"""Zeph em 3D, modelado a partir de ../../art_reference/zeph/images (zeph_idle, zeph_walking, zeph_axe_attack).

O que as referências mostram (e este arquivo reproduz):
- jovem de cabeça grande (~4,3 cabeças de altura), cabelo castanho bagunçado em mechas, franja na testa,
  olhos verdes, sobrancelha grossa franzida;
- jaqueta verde-oliva de gola alta, remendos redondos (ombro, peito, cotovelo), corda clara cruzando o peito,
  cinto marrom, barra da jaqueta abrindo abaixo do cinto, bolsinha nas costas;
- calça oliva mais escura e larga, enfiada em botas altas marrons com dobra no cano;
- machado grande: cabo longo de madeira com ponta arredondada, lâmina larga em leque com fio mais claro.

Coordenadas locais de cada peça (ver lib/yara_bpy.attach):
- +Y = ao longo do osso, a partir da articulação;
- ossos que apontam para BAIXO (braços, pernas): +X = frente do personagem;
- ossos que apontam para CIMA (tronco, pescoço, cabeça): -X = frente;
- pé: +Y = frente, +X = para cima;
- -Z = lado da câmera (na vista de perfil); +Z = longe da câmera.
"""
import math
import random

from mathutils import Vector
from yara_bpy import attach, blob, box, build_armature, disc, limb, material, prism, spike, tube


def part(obj, name):
    """Junta a peça a outra parte (sem contorno entre elas). Ver yara_bpy.attach."""
    obj["part"] = name
    return obj

HEIGHT = 1.6  # metros (a escala não muda o render; só a proporção importa)

# Proporção medida em zeph_idle (1 = pés ao topo do cabelo):
# queixo .75 · olhos .84 · ombro .71 · cinto .49 · quadril .45 · barra da jaqueta .39 · joelho .21 · cano da bota .16
BODY = dict(
    foot=.04, shin=.175, thigh=.235, torso=.26, neck=.025, head=.23,
    shoulderDrop=.035, shoulderDepth=.115, hipDepth=.06,
    upperArm=.15, forearm=.13, hand=.05, footLength=.1,
)
WEAPON_LEN = .55  # cabo, em alturas do corpo

# Rampas [sombra, base, luz], conferidas com as referências (mesmas cores de js/data/rig/zeph.js)
COLORS = dict(
    skin=['#c98a66', '#f0b98f', '#fcd9b8'],
    hair=['#2e1d12', '#4d311f', '#73492c'],
    eye_white='#f4f1ea', iris=['#1f5a4a', '#2f8a6b', '#57b08c'], pupil='#14100c',
    brow='#2e1d12', mouth='#7a3f2c',
    jacket=['#36431f', '#55682e', '#76894a'],
    jacket_dark=['#2b3519', '#45552a', '#5d7039'],
    pants=['#262f19', '#3a4628', '#506039'],
    boot=['#5a3a1f', '#8a5c32', '#b07c4b'], sole='#2a1c12',
    belt=['#3a2412', '#5f3d22', '#835a37'], buckle=['#6e5426', '#b08a4a', '#e2c27e'],
    rope=['#9a7a4c', '#c9a774', '#e9cf9c'],
    bag=['#4a3420', '#6e4f30', '#93714c'],
    wood=['#4a2b17', '#7a4a2a', '#a06a3c'],
    steel=['#5d646b', '#9aa3ab', '#c9d0d6'], edge=['#a9b1b8', '#dfe5ea', '#ffffff'],
)

# Poses no formato do jogo (mesmos campos e convenções de rig.js) + `cross` (só do 3D)
BASE = dict(torso=2, head=0, armF=[6, 10], armB=[-6, 10], legF=[4, -2], legB=[-4, -2], weapon=200, grip=.3)

POSES = {
    "neutro": {},
    # zeph_idle: machado na diagonal à frente do peito, as duas mãos no cabo, cabeça do machado no alto
    "idle": dict(feet=[.03, -.03], torso=0, head=-2, reachF=[.1, -.03, -.1], weapon=188, weaponSide=42,
                 bladeRoll=90, grip=.55, grip2=.22, twoHand=True),
    # zeph_walking: passo largo, braços balançando, sem o machado
    "caminhada": dict(torso=4, head=-2, legF=[30, -10], legB=[-28, -18], armF=[-24, 20], armB=[26, 26],
                      weaponOnBack=True),
    # zeph_axe_attack (impacto): tronco à frente, base larga, machado embaixo e à frente com as duas mãos
    "ataque_impacto": dict(feet=[.17, -.13], crouch=.06, hipShift=.02, torso=24, head=8, armF=[32, 18],
                           weapon=40, grip=.45, grip2=.2, twoHand=True, cross=.6),
    "guarda": dict(feet=[.1, -.08], crouch=.03, torso=8, head=-2, armF=[28, 70], weapon=140, grip=.4,
                   grip2=.12, twoHand=True, cross=.5),
}


def build(scene):
    h = HEIGHT
    b = {k: v * h for k, v in BODY.items()}
    arm = build_armature(scene, BODY, h, weapon_len=WEAPON_LEN, name="Zeph")
    M = {k: material(k, v) for k, v in COLORS.items()}

    # ---------------- cabeça (frente = -X)
    H = b["head"]
    attach(blob("skull", (.15, .155, .145), M["skin"], loc=(0, .2, 0)), arm, "head")
    attach(blob("face", (.115, .105, .118), M["skin"], loc=(-.035, .11, 0)), arm, "head")
    attach(part(blob("nose", (.02, .03, .016), M["skin"], loc=(-.152, .135, 0)), "head:skin"), arm, "head")
    for s, z in (("R", -1), ("L", 1)):
        attach(blob(f"ear.{s}", (.03, .045, .02), M["skin"], loc=(.005, .165, z * .143)), arm, "head")
        attach(blob(f"eye.{s}", (.014, .042, .034), M["eye_white"], loc=(-.126, .165, z * .062), outline=0), arm, "head")
        attach(part(blob(f"iris.{s}", (.012, .036, .022), M["iris"], loc=(-.134, .16, z * .058)), "head:skin"), arm, "head")
        attach(part(blob(f"pupil.{s}", (.008, .018, .011), M["pupil"], loc=(-.142, .162, z * .058)), "head:skin"), arm, "head")
        attach(part(box(f"lid.{s}", (.02, .014, .078), M["pupil"], loc=(-.134, .203, z * .062), rot=(z * 6, 0, 0)),
                        "head:skin"), arm, "head")
        attach(part(box(f"brow.{s}", (.024, .024, .08), M["brow"], loc=(-.14, .235, z * .064), rot=(z * 16, 0, 0)),
                        "head:skin"), arm, "head")
    attach(part(box("mouth", (.012, .008, .035), M["mouth"], loc=(-.142, .07, 0)), "head:skin"), arm, "head")

    # cabelo: calota + mechas grandes caindo para trás/lados + franja sobre a testa (semente fixa)
    C = Vector((.025, .255, 0))
    attach(blob("hair_cap", (.182, .152, .178), M["hair"], loc=C), arm, "head")
    attach(blob("hair_back", (.13, .175, .156), M["hair"], loc=(.065, .15, 0)), arm, "head")
    rnd = random.Random(11)
    n = 0
    while n < 16:
        az, el = math.radians(rnd.uniform(-160, 160)), math.radians(rnd.uniform(5, 80))
        if abs(math.degrees(az)) > 105 and el < math.radians(55):
            continue  # não cobre o rosto
        d = Vector((math.cos(el) * math.cos(az), math.sin(el), math.cos(el) * math.sin(az)))
        base = C + Vector((d.x * .14, d.y * .11, d.z * .145))
        droop = 1 - el / (math.pi / 2)
        direction = d + Vector((.4, -.8, 0)) * droop + Vector((.25, .2, 0))
        attach(spike(f"lock{n}", base, direction, rnd.uniform(.12, .19), rnd.uniform(.06, .08), M["hair"]),
               arm, "head")
        n += 1
    for i, z in enumerate((-.13, -.085, -.04, 0, .04, .085, .13)):  # franja deitada sobre a testa
        attach(spike(f"bang{i}", (-.125, .335, z), (-.4, -1, z * 1.4), .15 - abs(z) * .35, .06, M["hair"]), arm, "head")
    for z in (-1, 1):  # mechas laterais por cima das orelhas (param acima delas, como na referência)
        attach(spike(f"side{z}", (.0, .3, z * .15), (.1, -1, z * .5), .1, .055, M["hair"]), arm, "head")

    attach(limb("neck", b["neck"] + .07, .05, .048, M["skin"]), arm, "neck").location.y -= .04

    # ---------------- tronco (frente = -X)
    attach(blob("pelvis", (.11, .1, .15), M["pants"], loc=(0, .0, 0)), arm, "hips")
    attach(box("waist", (.25, .17, .31), M["jacket"], loc=(0, .1, 0), bevel=.04, subsurf=2), arm, "hips")
    attach(box("chest", (.27, .25, .36), M["jacket"], loc=(-.005, .27, 0), bevel=.05, subsurf=2), arm, "hips")
    hem = limb("hem", .14, .175, .15, M["jacket"], squash=.85)
    hem.location.y -= .11
    attach(hem, arm, "hips")
    belt = limb("belt", .045, .155, .155, M["belt"], squash=.85)
    belt.location.y += .025
    attach(belt, arm, "hips")
    attach(part(box("buckle", (.016, .045, .05), M["buckle"], loc=(-.132, .048, -.03)), "torso:belt"), arm, "hips")
    collar = limb("collar", .07, .085, .078, M["jacket_dark"], squash=.92)
    collar.location.y += .37
    attach(collar, arm, "hips")
    attach(disc("patch_chest", .036, .012, M["jacket_dark"], (-.132, .3, -.075), (-1, 0, -.3)), arm, "hips")
    attach(blob("bag", (.05, .07, .06), M["bag"], loc=(.13, .02, .12)), arm, "hips")
    # corda cruzando do ombro da frente até o quadril de trás, e voltando pelas costas
    attach(part(tube("rope", [(-.02, .41, -.15), (-.125, .33, -.08), (-.143, .2, .03), (-.132, .07, .13),
                  (0, .04, .165), (.13, .1, .12), (.14, .28, -.02), (.04, .41, -.15)], .009, M["rope"]), "torso:jacket"), arm, "hips")

    # ---------------- braços (+X = frente)
    for s in "FB":
        attach(blob(f"shoulder.{s}", (.068, .068, .068), M["jacket"], loc=(0, .02, 0)), arm, f"upperArm.{s}")
        attach(limb(f"upperArm.{s}", b["upperArm"], .066, .058, M["jacket"]), arm, f"upperArm.{s}")
        attach(blob(f"elbow.{s}", (.056, .05, .056), M["jacket"]), arm, f"forearm.{s}")
        attach(limb(f"forearm.{s}", b["forearm"], .057, .052, M["jacket"]), arm, f"forearm.{s}")
        cuff = limb(f"cuff.{s}", .035, .056, .057, M["jacket_dark"])
        cuff.location.y += b["forearm"] - .03
        attach(cuff, arm, f"forearm.{s}")
        attach(box(f"fist.{s}", (.07, .085, .062), M["skin"], loc=(0, .04, 0), bevel=.02, subsurf=2), arm, f"hand.{s}")
        attach(disc(f"patch_elbow.{s}", .03, .012, M["jacket_dark"], (-.01, .02, -.057), (0, 0, -1)),
               arm, f"forearm.{s}")
    attach(disc("patch_shoulder", .038, .012, M["jacket_dark"], (0, .07, -.066), (0, 0, -1)), arm, "upperArm.F")

    # ---------------- pernas (+X = frente)
    for s in "FB":
        attach(limb(f"thigh.{s}", b["thigh"], .1, .084, M["pants"]), arm, f"thigh.{s}")
        attach(blob(f"knee.{s}", (.08, .06, .08), M["pants"]), arm, f"shin.{s}")
        attach(limb(f"shin.{s}", b["shin"] * .7, .084, .074, M["pants"]), arm, f"shin.{s}")
        bh = .17
        shaft = limb(f"bootShaft.{s}", bh, .066, .066, M["boot"])
        shaft.location.y += b["shin"] - bh + .03
        attach(shaft, arm, f"shin.{s}")
        fold = limb(f"bootFold.{s}", .04, .078, .074, M["boot"])
        fold.location.y += b["shin"] - bh + .01
        attach(fold, arm, f"shin.{s}")
        attach(box(f"boot.{s}", (.085, .19, .105), M["boot"], loc=(-.015, .05, 0), bevel=.035, subsurf=2),
               arm, f"foot.{s}")
        attach(box(f"sole.{s}", (.022, .2, .108), M["sole"], loc=(-.055, .05, 0), bevel=.006), arm, f"foot.{s}")

    # ---------------- machado (+Y = do pé do cabo para a cabeça; +X = lado da lâmina)
    L = WEAPON_LEN * h
    attach(limb("handle", L, .021, .018, M["wood"]), arm, "weapon")
    attach(blob("knob", (.03, .03, .03), M["wood"], loc=(0, .005, 0)), arm, "weapon")
    top = L - .07
    attach(box("axe_eye", (.07, .12, .05), M["steel"], loc=(0, top, 0), bevel=.01), arm, "weapon")
    attach(box("axe_poll", (.05, .08, .045), M["steel"], loc=(-.05, top, 0), bevel=.01), arm, "weapon")
    k = 1.35
    blade = [(x * k, y * k) for x, y in [(.03, -.05), (.03, .055), (.09, .08), (.17, .13), (.21, .07), (.222, -.01),
                                         (.21, -.1), (.175, -.17), (.09, -.09)]]
    attach(prism("axe_blade", blade, .024, M["steel"], loc=(0, top, 0)), arm, "weapon")
    edge = [(x * k, y * k) for x, y in [(.17, .13), (.21, .07), (.222, -.01), (.21, -.1), (.175, -.17),
                                        (.185, -.1), (.197, -.01), (.186, .06)]]
    attach(part(prism("axe_edge", edge, .028, M["edge"], loc=(0, top, 0)), "weapon:steel"), arm, "weapon")
    return arm

