#!/usr/bin/env python3
"""Gera o retrato do jogo (last_torch/images/characters/brutos-small.webp) a partir de images/brutos.webp.

Uso, de qualquer pasta:  python3 mini_games/_library/characters/brutos/art_reference/make_portrait.py
O retrato é uma imagem do jogo, então é gravado na pasta dele (GAME abaixo); outro jogo pode rodar com outro GAME.
Precisa de ffmpeg (com libwebp) e Python 3; sem bibliotecas extras.

Passos:
1. Recorte fechado de dentro da armadura (embaixo e na esquerda), para a imagem encher o quadro como a do Azael em vez de
   parecer um busto cortado, e espelho para ele olhar para a direita (o diálogo espelha o lado do rival, então ele
   sempre olha para o centro). CROP = largura:altura:x:y vale para esta arte; outra imagem pode pedir outros números.
2. Limpa o contorno claro que a remoção do fundo deixou nas bordas da capa e do corpo (cinza-claro, 1 a 2 px): esses
   pixels viram o contorno escuro da arte. Pele (saturada) e o interior da arte não são tocados.
3. Reduz para 512x512 com filtro de área (o lanczos cria um halo claro de alfa baixo nas bordas).
"""
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'images' / 'brutos.webp'
# mini_games/_library/characters/brutos/art_reference -> mini_games/<GAME>/images/characters
GAME = 'last_torch'
TARGET = HERE.parents[3] / GAME / 'images' / 'characters' / 'brutos-small.webp'

SIZE = 640
CROP = f'{SIZE}:{SIZE}:210:140'
OUT = 512

BAND = 3                 # largura da faixa de borda examinada, em pixels
MIN_LIGHT = 70           # menor canal para um pixel de borda contar como claro demais
MAX_SPREAD = 50          # diferença máxima entre canais: cinza (a pele é bem mais saturada)
OUTLINE = (18, 13, 16)   # cor do contorno escuro da arte


def run(args, **kw):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kw).stdout


def edge_band(alpha, w, h):
    """Distância (até BAND) de cada pixel opaco ao fundo transparente; 0 = fora da faixa."""
    dist = [0] * (w * h)
    frontier = []
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if alpha[i] == 0:
                continue
            # vizinho transparente (ou semitransparente) = pixel de borda; o limite do recorte não conta
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and alpha[ny * w + nx] < 255:
                    dist[i] = 1
                    frontier.append((x, y))
                    break
    for level in range(2, BAND + 1):
        nxt = []
        for x, y in frontier:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h:
                    j = ny * w + nx
                    if alpha[j] > 0 and dist[j] == 0:
                        dist[j] = level
                        nxt.append((nx, ny))
        frontier = nxt
    return dist


def main():
    raw = bytearray(run(['ffmpeg', '-loglevel', 'error', '-i', str(SOURCE), '-vf', f'crop={CROP},hflip',
                         '-f', 'rawvideo', '-pix_fmt', 'rgba', '-']))
    w = h = SIZE
    assert len(raw) == w * h * 4, 'tamanho inesperado do recorte'
    alpha = [raw[i * 4 + 3] for i in range(w * h)]
    band = edge_band(alpha, w, h)
    fixed = 0
    for i in range(w * h):
        if not band[i]:
            continue
        r, g, b = raw[i * 4], raw[i * 4 + 1], raw[i * 4 + 2]
        if min(r, g, b) >= MIN_LIGHT and max(r, g, b) - min(r, g, b) <= MAX_SPREAD:
            raw[i * 4:i * 4 + 3] = bytes(OUTLINE)
            fixed += 1
    print(f'{fixed} pixels claros de borda viraram contorno escuro')
    webp = run(['ffmpeg', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{w}x{h}', '-i', '-',
                '-vf', f'scale={OUT}:{OUT}:flags=area', '-c:v', 'libwebp', '-quality', '90', '-f', 'webp', '-'],
               input=bytes(raw))
    TARGET.write_bytes(webp)
    print(f'gravado {TARGET} ({len(webp)} bytes)')


if __name__ == '__main__':
    main()
