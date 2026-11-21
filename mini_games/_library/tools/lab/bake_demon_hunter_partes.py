#!/usr/bin/env python3
"""Recorta o retrato pintado do Demon Hunter em camadas para a animação do Laboratório (demon_hunter_foto.html).

Entrada: ../../characters/hunter/art_reference/images/demon-hunter.webp (1024x1024, fundo transparente).
Saída em demon_hunter/:
  base.webp   o retrato inteiro (a capa é animada por faixas na página)
  head.webp   só o capuz com a máscara, com a borda suave (vai por cima da base e se mexe separado)
  parts.json  onde o capuz fica na imagem, os pivôs e os olhos
Rode:  python3 bake_demon_hunter_partes.py   (precisa de Pillow)
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
SRC = HERE.parent.parent / 'characters/hunter/art_reference/images/demon-hunter.webp'
OUT = HERE / 'demon_hunter'
OUT.mkdir(exist_ok=True)

im = Image.open(SRC).convert('RGBA')
W, H = im.size

# Capuz + máscara: o polígono acompanha o capuz e corta no pescoço, onde as dobras da capa começam
HEAD = [(240, 10), (655, 10), (655, 300), (610, 345), (530, 385), (450, 405), (385, 425), (330, 435), (240, 405)]
FEATHER = 9

mask = Image.new('L', (W, H), 0)
ImageDraw.Draw(mask).polygon(HEAD, fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(FEATHER))
head = im.copy()
alpha = Image.composite(head.getchannel('A'), Image.new('L', (W, H), 0), mask)  # alfa do desenho x máscara suave
head.putalpha(Image.eval(alpha, lambda v: v))
box = head.getbbox()
head = head.crop(box)

im.save(OUT / 'base.webp', quality=92, method=6)
head.save(OUT / 'head.webp', quality=92, method=6)
json.dump({
    'size': [W, H],
    'head': {'x': box[0], 'y': box[1], 'w': head.width, 'h': head.height},
    'neck': [395, 415],          # pivô do capuz (onde a cabeça gira)
    'hips': [512, 1010],         # pivô da respiração (base do busto)
    'eyes': [[402, 235, 24, 18], [326, 258, 12, 14]],   # x, y, rx, ry dos olhos da máscara
    'clothTop': 330,             # a capa começa a ondular daqui para baixo
    'clothBottom': 980
}, open(OUT / 'parts.json', 'w'), indent=2)
print('ok', box, (OUT / 'base.webp').stat().st_size // 1024, 'KB base;', (OUT / 'head.webp').stat().st_size // 1024, 'KB head')
