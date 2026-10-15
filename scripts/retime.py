"""Recale la timeline sur le tempo d'une musique : chaque coupe reste sur un temps.

Usage : python3 scripts/retime.py 117.061
Met à l'échelle scènes, repères et sections musicales de src/config/timeline.json
(rapport ancien BPM / nouveau BPM). Idempotent pour un même tempo.
"""
import json
import sys
from pathlib import Path

P = Path(__file__).resolve().parent.parent / "src/config/timeline.json"
tl = json.loads(P.read_text())
target = float(sys.argv[1])
k = tl["bpm"] / target
r = lambda f: int(round(f * k))

total = r(tl["durationInFrames"])
starts = [r(s["from"]) for s in tl["scenes"]]
for i, s in enumerate(tl["scenes"]):
    s["from"] = starts[i]
    s["duration"] = (starts[i + 1] if i + 1 < len(starts) else total) - starts[i]
for c in tl["cues"]:
    c["frame"] = total if c["type"] == "end" else r(c["frame"])
    if "length" in c:
        c["length"] = r(c["length"])
for m in tl["music"]:
    m["from"], m["to"] = r(m["from"]), r(m["to"])
tl["music"][-1]["to"] = total
tl["durationInFrames"] = total
tl["bpm"] = target
P.write_text(json.dumps(tl, ensure_ascii=False, indent=1) + "\n")
print(f"facteur {k:.5f} → {total} images ({total / 30:.2f} s) à {target} BPM")
