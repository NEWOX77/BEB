"""Détourage exact des groupes électrogènes par « triangulation matting ».

Les photos BEB sont livrées en deux versions alignées au pixel : fond noir et fond blanc.
Pour chaque pixel :  noir = a·F   et   blanc = a·F + (1 − a)·255
d'où  a = 1 − (blanc − noir) / 255   et   F = noir / a.
On obtient l'alpha réel (bords, transparences) et la couleur d'origine, sans IA ni retouche.

Convention de nommage dans assets-src/photos/ :
    <nom>-fond-noir.jpg  +  <nom>-fond-blanc.jpg   →   public/media/<nom>-detoure.png
Toutes les photos sont aussi copiées dans public/media/ (qualité JPEG 95).

Usage : python3 scripts/make_cutouts.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src/photos"
OUT = ROOT / "public/media"
OUT.mkdir(parents=True, exist_ok=True)


def load(p):
    return np.asarray(Image.open(p).convert("RGB")).astype(np.float32)


for src in sorted(SRC.glob("*.jpg")):
    Image.open(src).convert("RGB").save(OUT / src.name, quality=95)

for black_path in sorted(SRC.glob("*-fond-noir.jpg")):
    name = black_path.name[: -len("-fond-noir.jpg")]
    white_path = SRC / f"{name}-fond-blanc.jpg"
    if not white_path.exists():
        print(f"{name} : pas de version fond blanc → pas de détourage (utilisée sur fond noir)")
        continue
    B, W = load(black_path), load(white_path)
    if B.shape != W.shape:
        print(f"{name} : tailles différentes, détourage impossible")
        continue
    a = 1.0 - (W - B).mean(axis=2) / 255.0
    # Bruit JPEG : on écrase les ±3 % autour de 0 et 1
    a = np.clip((a - 0.03) / 0.94, 0.0, 1.0)
    F = np.where(a[..., None] > 0.004, B / np.maximum(a[..., None], 1e-3), 0.0)
    F = np.clip(F, 0, 255)
    rgba = np.dstack([F, a * 255.0]).round().astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(OUT / f"{name}-detoure.png", optimize=True)
    ys, xs = np.nonzero(a > 0.5)
    print(f"{name} : détouré  bbox x {xs.min()}→{xs.max()}  y {ys.min()}→{ys.max()}  (image {B.shape[1]}×{B.shape[0]})")
