"""Maquette sonore électro-industrielle BEB (V2, 120 BPM) — synthétisée entièrement par code.

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
import sys

# --sfx-only : uniquement les impacts synchronisés (à poser par-dessus une musique du commerce)
SFX_ONLY = "--sfx-only" in sys.argv
OUT = ROOT / ("public/audio/beb-sfx.wav" if SFX_ONLY else "public/audio/beb-sound-design.wav")

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
NOTE = {"D": 73.42, "E": 82.41, "F": 87.31, "G": 98.0, "A": 110.0, "Bb": 116.54, "C": 130.81, "C#": 138.59}
CHORDS = {  # (basse, notes de la nappe en Hz)
    "Dm": (73.42, [146.83, 174.61, 220.0, 293.66]),
    "Bb": (58.27, [116.54, 146.83, 174.61, 233.08]),
    "C": (65.41, [130.81, 164.81, 196.0, 261.63]),
    "F": (87.31, [174.61, 220.0, 261.63, 349.23]),
    "A": (55.0, [110.0, 138.59, 164.81, 220.0]),
}

# ---------------------------------------------------------------- arrangement
# Sections musicales : timeline.json → "music" (accord, grosse caisse, cliquetis, basse)
duck = np.ones(N)
for k, sct in enumerate(TL["music"]):
    a, b = sec(sct["from"]), sec(sct["to"])
    root, chord = CHORDS[sct["chord"]]
    # Nappe (s'ouvre au fil du film)
    cut = 900 + 1800 * (sct["from"] / TL["durationInFrames"])
    pad_bus.add(pad(chord, b - a + 0.35, cutoff=cut, attack=0.03, release=0.3), a, 0.34)
    if sct["kick"]:
        for tb in np.arange(a, b - 1e-6, BEAT):
            beat_bus.add(kick(0.95), tb, 0.9)
            i0 = int(tb * SR)
            dn = min(int(0.2 * SR), N - i0)
            duck[i0 : i0 + dn] = np.minimum(duck[i0 : i0 + dn], 0.3 + 0.7 * np.linspace(0, 1, dn) ** 0.7)
    if sct["bass"]:
        for j, tb in enumerate(np.arange(a, b - 1e-6, BEAT / 2)):
            n = int(BEAT / 2 * SR * 0.9)
            f = root * (2 if j % 4 == 3 else 1)
            note = np.tanh(1.9 * fft_filter(saw(f, n, 16), hi=1000 + 300 * (j % 2))) * adsr(n, 0.004, 0.05)
            beat_bus.add(note, tb, 0.4 * sct["bass"])
    if sct["hats"]:
        for j, tb in enumerate(np.arange(a, b - 1e-6, BEAT / 4)):
            acc = 1.0 if j % 4 == 2 else 0.45
            beat_bus.add(tick(1.0 if j % 2 else 0.8), tb, 0.15 * acc * sct["hats"], pan=0.25 if j % 2 else -0.25)
        # claquement sur les temps 2 et 4
        for j, tb in enumerate(np.arange(a + BEAT, b - 1e-6, 2 * BEAT)):
            n = int(0.25 * SR)
            clap = fft_filter(noise(n), lo=900, hi=6000) * env_exp(n, 0.05)
            beat_bus.add(clap, tb, 0.22 * sct["hats"])
            verb_send.add(clap, tb, 0.12 * sct["hats"])

# Accents synchronisés sur les repères (pas de whoosh systématique)
for c in TL["cues"]:
    t0 = sec(c["frame"])
    kind = c["type"]
    if kind == "flash":
        dry.add(impact(0.5), t0, 0.55)
        dry.add(tick(0.8, 60), t0, 0.4)
        dry.add(metal(240 + 40 * int(c["id"][-1]), 0.6), t0, 0.35)
    elif kind == "impact":
        dry.add(impact(0.9), t0, 0.8)
        dry.add(metal(160), t0, 0.45, pan=-0.15)
        verb_send.add(metal(160), t0, 0.5)
    elif kind == "hit":
        dry.add(impact(0.7), t0, 0.6)
        dry.add(metal(200), t0, 0.3, pan=0.2)
        verb_send.add(metal(200), t0, 0.4)
    elif kind == "logo":
        dry.add(impact(1.3), t0, 0.9)
        dry.add(metal(220, 1.8), t0, 0.7, pan=0.1)
        dry.add(metal(330, 1.2), t0, 0.35, pan=-0.1)
        verb_send.add(metal(220, 1.8), t0, 0.8)
    elif kind == "tick":
        dry.add(tick(0.9, 50), t0, 0.45)
        dry.add(kick(0.5), t0, 0.35)
        verb_send.add(tick(0.9, 50), t0, 0.3)
    elif kind == "drop":
        dry.add(impact(1.8), t0, 1.0)
        dry.add(metal(110, 2.0), t0, 0.45)
        verb_send.add(impact(1.4), t0, 0.5)
    elif kind == "wipe":
        n = int(sec(10) * SR)
        sw = fft_filter(noise(n), lo=400, hi=5000) * np.linspace(0, 1, n) ** 2
        dry.add(sw, t0 - sec(10), 0.22)
        dry.add(impact(0.6), t0, 0.5)
    elif kind == "push":
        n = int(sec(10) * SR)
        sw = fft_filter(noise(n), lo=600, hi=4000) * np.sin(np.linspace(0, np.pi, n)) ** 2
        dry.add(sw, t0 - sec(10), 0.2, pan=0.3)
        dry.add(impact(0.6), t0, 0.5)
    elif kind == "count":
        # cliquetis de compteur qui ralentit avec le défilement des chiffres
        L = c.get("length", 20)
        for j in range(12):
            tt = (1 - (1 - j / 12) ** 0.45) * sec(L)
            dry.add(tick(1.2, 20), t0 + tt, 0.22 * (1 - j / 14), pan=-0.2 + 0.4 * (j % 2))
        dry.add(impact(0.6), t0, 0.55)
    elif kind == "riser":
        dry.add(riser(sec(c["length"])), t0, 0.4)
    elif kind == "blip":
        k = int(c["id"][-1])
        dry.add(blip(1100 + 110 * k), t0, 0.3, pan=-0.5 + 0.25 * (k - 1))
        verb_send.add(blip(1100 + 110 * k), t0, 0.3)

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


if SFX_ONLY:
    beat_bus, pad_bus = Bus(), Bus()
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
         "-af", ("loudnorm=I=-20:TP=-3:LRA=11" if SFX_ONLY else "loudnorm=I=-14:TP=-1.5:LRA=11") + ",aresample=48000",
         "-t", f"{DUR:.3f}", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", str(OUT)],
        check=True,
    )
print("écrit", OUT, f"({DUR:.2f} s)")
