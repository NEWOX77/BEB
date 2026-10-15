"""Maquette sonore électro-industrielle BEB — synthétisée entièrement par code.

Aucun échantillon, aucune boucle, aucune musique tierce : chaque son (pulsation, basse,
impacts, démarreur, nappe) est calculé ici à partir d'oscillateurs et de bruit.
Le résultat est donc libre de droits. C'est une MAQUETTE de synchronisation et de direction
sonore, destinée à être remplacée ou enrichie par un compositeur / sound designer.

Calage : lit src/config/timeline.json (mêmes repères que l'image).
Sortie : public/audio/beb-sound-design.wav (48 kHz, stéréo, −14 LUFS intégrés, crête −1,5 dBTP).

Usage : python3 scripts/generate_audio.py   (numpy + ffmpeg requis)
"""
import json
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src/config/timeline.json").read_text())
OUT = ROOT / "public/audio/beb-sound-design.wav"

SR = 48000
FPS = TL["fps"]
DUR = TL["durationInFrames"] / FPS
N = int(round(DUR * SR))
BEAT = 60 / TL["bpm"]
rng = np.random.default_rng(7)  # déterministe : même fichier à chaque génération

CUES = {c["id"]: c for c in TL["cues"]}


def sec(frame):
    return frame / FPS


def cue_t(cid):
    return sec(CUES[cid]["frame"])


# ---------------------------------------------------------------- outils DSP
def fft_filter(x, lo=None, hi=None, slope=1.0):
    """Filtre passe-bande doux dans le domaine fréquentiel (pentes ~12 dB/oct)."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (4 * slope))
    if hi:
        g *= 1 / np.sqrt(1 + (f / hi) ** (4 * slope))
    return np.fft.irfft(X * g, n)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


def adsr(n, a=0.005, r=0.05):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def sweep_sine(n, f0, f1, tau):
    """Sinus dont la fréquence glisse exponentiellement de f0 vers f1 (constante tau)."""
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / tau)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def saw(freq, n, harmonics=14, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(1, harmonics + 1):
        if freq * k > SR / 2.4:
            break
        out += np.sin(2 * np.pi * freq * (1 + detune) * k * t + k * 0.37) / k
    return out * 0.6


def noise(n):
    return rng.standard_normal(n)


class Bus:
    def __init__(self):
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, sig, t0, gain=1.0, pan=0.0):
        i0 = int(round(t0 * SR))
        if i0 >= N:
            return
        if i0 < 0:
            sig = sig[-i0:]
            i0 = 0
        sig = sig[: N - i0]
        gl = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
        gr = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        self.L[i0 : i0 + len(sig)] += sig * gl
        self.R[i0 : i0 + len(sig)] += sig * gr


dry, verb_send, beat_bus, pad_bus = Bus(), Bus(), Bus(), Bus()


# ---------------------------------------------------------------- sons
def kick(level=1.0):
    n = int(0.42 * SR)
    # saturation douce : harmoniques audibles sur haut-parleur de téléphone
    body = np.tanh(2.6 * sweep_sine(n, 150, 46, 0.035) * env_exp(n, 0.14)) / np.tanh(2.6)
    click = fft_filter(noise(n), lo=2500) * env_exp(n, 0.003) * 0.45
    return (body + click) * level


def tick(bright=1.0, n_ms=40):
    n = int(n_ms / 1000 * SR)
    s = fft_filter(noise(n), lo=3500 * bright, hi=12000) * env_exp(n, 0.006)
    s += np.sin(2 * np.pi * 1900 * bright * np.arange(n) / SR) * env_exp(n, 0.004) * 0.3
    return s


def metal(f0=170.0, n_s=1.4, level=1.0):
    """Résonance métallique inharmonique (tôle, châssis) — courte, sans effet « gaming »."""
    n = int(n_s * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for ratio, tau, g in [(1, 0.55, 1), (2.76, 0.35, 0.6), (5.4, 0.2, 0.35), (8.93, 0.12, 0.2), (13.34, 0.07, 0.12)]:
        out += np.sin(2 * np.pi * f0 * ratio * t) * np.exp(-t / tau) * g
    return out * level * 0.25


def impact(size=1.0):
    n = int(1.6 * SR)
    sub = np.tanh(2.2 * sweep_sine(n, 70, 36, 0.12) * env_exp(n, 0.55 * size)) / np.tanh(2.2)
    body = fft_filter(noise(n), lo=120, hi=2400) * env_exp(n, 0.08) * 0.7
    snap = fft_filter(noise(n), lo=1800, hi=9000) * env_exp(n, 0.014) * 0.35
    return (sub * 0.9 + body + snap) * adsr(n, 0.001, 0.2)


def riser(length_s):
    n = int(length_s * SR)
    t = np.arange(n) / SR
    x = t / length_s
    nz = noise(n)
    # balayage de filtre par blocs (passe-bande montant)
    out = np.zeros(n)
    blk = 2048
    for i in range(0, n, blk):
        j = min(n, i + blk + 512)
        c = 400 + 5200 * (i / n) ** 2
        seg = fft_filter(nz[i:j], lo=c * 0.6, hi=c * 1.8)
        w = np.ones(j - i)
        w[-min(512, j - i):] = np.linspace(1, 0, min(512, j - i))
        if i:
            w[: min(512, j - i)] = np.linspace(0, 1, min(512, j - i))
        out[i:j] += seg * w
    tone = np.sin(2 * np.pi * np.cumsum(180 + 520 * x ** 2) / SR) * 0.25
    return (out * 0.6 + tone) * x ** 2.2 * adsr(n, 0.01, 0.015)


def starter(length_s):
    """Démarreur électrique : rotation qui accélère, compressions du moteur (modulation)."""
    n = int(length_s * SR)
    t = np.arange(n) / SR
    rate = 7 + 4 * t / length_s
    phase = np.cumsum(rate) / SR
    cyc = 0.35 + 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * phase)) ** 3
    whir = saw(95, n, 10) * 0.5 + fft_filter(noise(n), lo=250, hi=1600) * 0.5
    whir = fft_filter(whir, hi=2200)
    return whir * cyc * adsr(n, 0.02, 0.03) * 0.8


def engine(length_s, fade=1.2):
    """Le diesel prend : explosions rapprochées puis ralenti grave."""
    n = int(length_s * SR)
    t = np.arange(n) / SR
    rate = 14 + 16 * np.exp(-t / 0.35)  # emballement puis stabilisation
    phase = np.cumsum(rate) / SR
    pulses = (0.5 + 0.5 * np.cos(2 * np.pi * phase)) ** 10
    body = fft_filter(noise(n), lo=40, hi=420) * pulses * 1.6
    hum = np.sin(2 * np.pi * np.cumsum(rate * 3.5) / SR) * 0.25
    level = 0.25 + 0.75 * np.exp(-t / fade)
    return (body + hum) * level * adsr(n, 0.004, 0.4)


def blip(freq=1320):
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2.01 * t)) * env_exp(n, 0.045) * adsr(n, 0.002, 0.02)


def pad(freqs, length_s, cutoff=1400, attack=0.6, release=0.8):
    n = int(length_s * SR)
    out = np.zeros(n)
    for i, f in enumerate(freqs):
        out += saw(f, n, 10, detune=0.0025) + saw(f, n, 10, detune=-0.0031)
    out = fft_filter(out, lo=60, hi=cutoff)
    return out / max(1, len(freqs)) * adsr(n, attack, release)


# ---------------------------------------------------------------- notes
D2, F2, A2, BB1, C2, A1 = 73.42, 87.31, 110.0, 58.27, 65.41, 55.0
D3, F3, A3, BB2, C3, E3, G3, E4 = 146.83, 174.61, 220.0, 116.54, 130.81, 164.81, 196.0, 329.63

# ---------------------------------------------------------------- arrangement
t_beat0 = cue_t("beat.start")
t_sig = cue_t("signature.in")
t_cta1 = cue_t("cta.l1")
t_end = DUR

# Nappe / drone : tension dès l'accroche, ouverture progressive
pad_bus.add(pad([D2, A2], 3.4, cutoff=500, attack=0.02, release=0.6), 0.0, 0.55)
pad_bus.add(pad([D2, A2, D3], sec(210) - 3.0 + 0.6, cutoff=800, attack=0.4), 3.0, 0.5)
sections = [  # (début, fin, accord, basse, coupure filtre)
    (sec(210), sec(300), [D3, F3, A3], D2, 1200),
    (sec(300), sec(390), [BB2, D3, F3], BB1, 1500),
    (sec(390), sec(480), [C3, E3, G3], C2, 1800),
    (sec(480), sec(570), [D3, F3, A3], D2, 2200),
    (sec(570), t_sig, [A2, E3, A3], A1, 2600),
]
for a, b, chord, _, cut in sections:
    pad_bus.add(pad(chord, b - a + 0.5, cutoff=cut, attack=0.08, release=0.45), a, 0.42)
# Signature : respiration, accord suspendu
pad_bus.add(pad([D2, A2, E4, D3], cue_t("cta.in") - t_sig + 0.8, cutoff=1600, attack=0.5, release=0.7), t_sig, 0.6)
# Appel à l'action : résolution
pad_bus.add(pad([D2, D3, F3, A3], t_end - cue_t("cta.in"), cutoff=1900, attack=0.4, release=1.0), cue_t("cta.in"), 0.55)

# Pulsation mécanique : grosse caisse sur chaque temps, basse en croches, cliquetis en doubles-croches
duck = np.ones(N)


def beats(a, b, step):
    k = np.arange(np.ceil((a - t_beat0) / step - 1e-6), np.floor((b - t_beat0) / step - 1e-6) + 1)
    return t_beat0 + k * step


for tb in beats(t_beat0, sec(645), BEAT):
    lvl = 0.55 if tb < sec(210) else 0.9
    beat_bus.add(kick(lvl), tb, 0.9)
    i0 = int(tb * SR)
    dn = int(0.22 * SR)
    duck[i0 : i0 + dn] = np.minimum(duck[i0 : i0 + dn], 0.35 + 0.65 * np.linspace(0, 1, len(duck[i0 : i0 + dn])) ** 0.7)

for a, b, _, root, _ in sections:
    for k, tb in enumerate(beats(a, min(b, sec(645)), BEAT / 2)):
        n = int(BEAT / 2 * SR * 0.92)
        note = saw(root * (2 if k % 4 == 3 else 1), n, 16)
        note = np.tanh(1.8 * fft_filter(note, hi=900 + 300 * (k % 2))) * adsr(n, 0.004, 0.06)
        beat_bus.add(note, tb, 0.42)

for k, tb in enumerate(beats(sec(210), sec(645), BEAT / 4)):
    accent = 1.0 if k % 4 == 2 else 0.45
    if tb >= sec(480):
        accent *= 1.2  # le montage terrain pousse un peu plus
    beat_bus.add(tick(1.0 if k % 2 else 0.8), tb, 0.16 * accent, pan=0.25 if k % 2 else -0.25)

# Retour de la pulsation, plus douce, sur l'appel à l'action
for tb in beats(t_cta1, sec(885), BEAT):
    beat_bus.add(kick(0.6), tb, 0.75)

# Accents synchronisés sur les repères (pas de whoosh systématique)
for c in TL["cues"]:
    t0 = sec(c["frame"])
    kind = c["type"]
    if kind == "impact":
        dry.add(impact(0.9), t0, 0.8)
        dry.add(metal(160), t0, 0.5, pan=-0.15)
        verb_send.add(metal(160), t0, 0.6)
    elif kind == "riser":
        dry.add(riser(sec(c["length"])), t0, 0.45)
    elif kind == "cut" and c["id"] == "reveal.open":
        dry.add(tick(0.7, 60), t0, 0.5)
        dry.add(kick(0.5), t0, 0.5)
    elif kind == "cut":
        dry.add(tick(0.6, 50), t0, 0.3)
    elif kind == "starter":
        dry.add(starter(sec(c["length"])), t0, 0.55)
    elif kind == "engine":
        dry.add(engine(3.2), t0, 0.75)
        dry.add(impact(1.2), t0, 0.7)
        verb_send.add(impact(1.0), t0, 0.35)
    elif kind == "logo":
        dry.add(metal(220, 1.8), t0, 0.7, pan=0.1)
        dry.add(metal(330, 1.2), t0, 0.35, pan=-0.1)
        verb_send.add(metal(220, 1.8), t0, 0.8)
        dry.add(kick(0.7), t0, 0.6)
    elif kind == "tick":
        dry.add(tick(0.9, 50), t0, 0.35)
        verb_send.add(tick(0.9, 50), t0, 0.3)
    elif kind == "hit":
        dry.add(impact(0.8), t0, 0.7)
        dry.add(metal(190), t0, 0.35, pan=0.2)
        verb_send.add(metal(190), t0, 0.45)
    elif kind == "blip":
        dry.add(blip(1180 + 70 * int(c["id"][-1])), t0, 0.22, pan=-0.4 + 0.2 * int(c["id"][-1]))
        verb_send.add(blip(1180), t0, 0.25)
    elif kind == "drop":
        dry.add(impact(2.2), t0, 1.0)
        dry.add(metal(110, 2.4), t0, 0.5)
        verb_send.add(impact(1.6), t0, 0.6)
    elif kind == "swell":
        n = int(sec(15) * SR)
        sw = fft_filter(noise(n), lo=200, hi=2400) * np.linspace(0, 1, n) ** 3
        dry.add(sw, t0, 0.18)

# Ronronnement discret du groupe au ralenti, sous la révélation et les expertises (texture)
idle_a, idle_b = cue_t("reveal.engine") + 1.5, sec(480)
n = int((idle_b - idle_a) * SR)
idle = engine(idle_b - idle_a, fade=0.01) * adsr(n, 0.8, 1.2)
dry.add(fft_filter(idle, hi=300), idle_a, 0.22)


# ---------------------------------------------------------------- réverbération + mixage
def reverb(L, R, seconds=1.6):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = []
    for ch in (0, 1):
        ir = fft_filter(rng.standard_normal(n), lo=200, hi=5000) * np.exp(-t / (seconds / 5))
        ir[: int(0.012 * SR)] = 0
        ir /= np.sqrt(np.sum(ir**2))
        x = (L, R)[ch]
        m = len(x) + n
        y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]
        out.append(y)
    return out


wl, wr = reverb(verb_send.L + 0.25 * pad_bus.L, verb_send.R + 0.25 * pad_bus.R)
L = dry.L + beat_bus.L + pad_bus.L * duck + wl * 0.5
R = dry.R + beat_bus.R + pad_bus.R * duck + wr * 0.5

# Nettoyage du grave, présence dans les médiums (écoute téléphone), saturation douce, fondu de fin
L, R = fft_filter(L, lo=32), fft_filter(R, lo=32)
L = L - 0.35 * fft_filter(L, hi=120) + 0.4 * fft_filter(L, lo=900, hi=5000)
R = R - 0.35 * fft_filter(R, hi=120) + 0.4 * fft_filter(R, lo=900, hi=5000)
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = np.tanh(1.4 * L / peak) / np.tanh(1.4), np.tanh(1.4 * R / peak) / np.tanh(1.4)
fade = np.ones(N)
nf = int(0.6 * SR)
fade[-nf:] = np.linspace(1, 0, nf) ** 1.5
L, R = L * fade * 0.7, R * fade * 0.7

OUT.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    raw = Path(tmp) / "raw.wav"
    pcm = (np.clip(np.stack([L, R], 1), -1, 1) * 32767).astype(np.int16)
    with wave.open(str(raw), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    # Normalisation EBU R128 pour les réseaux sociaux
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw),
         "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000",
         "-t", f"{DUR:.3f}", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", str(OUT)],
        check=True,
    )
print("écrit", OUT, f"({DUR:.2f} s)")
