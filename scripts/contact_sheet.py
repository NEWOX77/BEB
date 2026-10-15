"""Planche contact des images fixes (contrôle visuel). Usage : python3 scripts/contact_sheet.py out/stills/BEB-Main out.jpg [colonnes]"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

src, out = Path(sys.argv[1]), sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
files = sorted(src.glob("f*.png"))
tw, th = 270, 480
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (tw + 8) + 8, rows * (th + 34) + 8), (60, 60, 60))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS)
    x, y = 8 + (i % cols) * (tw + 8), 8 + (i // cols) * (th + 34)
    sheet.paste(im, (x, y))
    fr = int(f.stem[1:])
    d.text((x + 4, y + th + 6), f"img {fr}  ({fr / 30:.2f} s)", fill=(255, 255, 255))
sheet.save(out, quality=88)
print(out, sheet.size)
