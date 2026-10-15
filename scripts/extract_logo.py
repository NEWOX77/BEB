"""Extrait le logo BEB vectoriel (avec / sans baseline) depuis la charte PDF.

Source : assets-src/brand/CharteGraphiqueBEB.pdf, page 3 (« Le logo BEB horizontal »).
Aucune retouche de forme : les tracés et glyphes sont copiés tels quels depuis le PDF,
seule la couleur est remplacée par les valeurs RVB officielles de la charte (page 5).

Usage : python3 scripts/extract_logo.py
"""
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "assets-src/brand/CharteGraphiqueBEB.pdf"
OUT = ROOT / "public/brand"

WHITE = "#ffffff"
ORANGE = "#ea5614"  # RVB officiel charte (page 5)

with tempfile.TemporaryDirectory() as tmp:
    svg_path = Path(tmp) / "p3.svg"
    subprocess.run(["pdftocairo", "-svg", "-f", "3", "-l", "3", str(PDF), str(svg_path)], check=True)
    svg = svg_path.read_text()

# Les 3 lettres du logo « avec base-line » (bloc de gauche, x entre 170 et 360)
letter_paths = []
for m in re.finditer(r'<path fill-rule="nonzero" fill="rgb\(([^)]*)\)" fill-opacity="1" d="([^"]+)"/>', svg):
    color, d = m.group(1), m.group(2)
    xs = [float(v) for v in re.findall(r"M ([\d.]+)", d)]
    if not xs or not (170 < xs[0] < 360):
        continue
    if color.startswith("100%"):
        letter_paths.append((WHITE, d))
    elif color.startswith("94.5"):
        letter_paths.append((ORANGE, d))
assert len(letter_paths) == 3, letter_paths

# Glyphes de la baseline (groupe glyph-2-*, placé sous le logo, y ≈ 328)
glyph_defs = dict(re.findall(r'<g id="(glyph-2-\d+)">\s*(<path[^>]*/>)?', svg))
uses = re.findall(r'<use xlink:href="#(glyph-2-\d+)" x="([\d.]+)" y="([\d.]+)"/>', svg)
uses = [(g, float(x), float(y)) for g, x, y in uses if 320 < float(y) < 335]
assert uses, "baseline introuvable"


def glyph_path(gid):
    p = glyph_defs.get(gid) or ""
    m = re.search(r'd="([^"]+)"', p)
    return m.group(1) if m else None


# Bornes exactes du monogramme (zone de protection = hauteur du B)
all_nums = [float(v) for _, d in letter_paths for v in re.findall(r"-?[\d.]+", d)]
xs, ys = all_nums[0::2], all_nums[1::2]
x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
B = y1 - y0
print(f"monogramme : x {x0:.2f}→{x1:.2f}  y {y0:.2f}→{y1:.2f}  (hauteur B = {B:.2f})")


def letters_svg():
    return "\n".join(f'  <path fill="{c}" d="{d}"/>' for c, d in letter_paths)


def write(name, vb, body):
    (OUT / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]:.3f} {vb[1]:.3f} {vb[2]:.3f} {vb[3]:.3f}">\n{body}\n</svg>\n'
    )
    print("écrit", OUT / name)


OUT.mkdir(parents=True, exist_ok=True)
# Sans baseline : cadrage serré sur le monogramme
write("beb-logo.svg", (x0, y0, x1 - x0, y1 - y0), letters_svg())

# Avec baseline : glyphes repositionnés exactement comme dans le PDF
baseline = []
for gid, gx, gy in uses:
    d = glyph_path(gid)
    if d:
        baseline.append(f'  <path fill="{ORANGE}" transform="translate({gx:.4f} {gy:.4f})" d="{d}"/>')
base_bottom = max(gy for _, _, gy in uses) + 1.0
write("beb-logo-baseline.svg", (x0, y0, x1 - x0, base_bottom - y0), letters_svg() + "\n" + "\n".join(baseline))

# Module TypeScript : tracés inline pour animer les lettres sans jamais les déformer
ts = ROOT / "src/brand/logoPaths.ts"
lines = [
    "// Fichier généré par scripts/extract_logo.py — ne pas modifier à la main.",
    "// Tracés copiés tels quels depuis la charte (CharteGraphiqueBEB.pdf, page 3).",
    f"export const LOGO_VIEWBOX = {{x: {x0:.4f}, y: {y0:.4f}, width: {x1 - x0:.4f}, height: {y1 - y0:.4f}}};",
    f"export const LOGO_BASELINE_VIEWBOX = {{x: {x0:.4f}, y: {y0:.4f}, width: {x1 - x0:.4f}, height: {base_bottom - y0:.4f}}};",
    "/** Hauteur de la lettre B = zone de protection minimale (charte p.2), en unités du viewBox. */",
    f"export const LOGO_B_HEIGHT = {B:.4f};",
    "export const LOGO_LETTERS: {color: 'white' | 'orange'; d: string}[] = [",
]
order = sorted(letter_paths, key=lambda cd: float(re.findall(r"M ([\d.]+)", cd[1])[0]))
for c, d in order:
    lines.append(f"  {{color: '{'orange' if c == ORANGE else 'white'}', d: '{d.strip()}'}},")
lines.append("];")
lines.append("export const LOGO_BASELINE_GLYPHS: {x: number; y: number; d: string}[] = [")
for gid, gx, gy in uses:
    d = glyph_path(gid)
    if d:
        lines.append(f"  {{x: {gx:.4f}, y: {gy:.4f}, d: '{d.strip()}'}},")
lines.append("];")
ts.parent.mkdir(parents=True, exist_ok=True)
ts.write_text("\n".join(lines) + "\n")
print("écrit", ts)
