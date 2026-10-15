"""Analyse une musique pour caler le montage : tempo (BPM) et moments forts (« drops »).

Usage : python3 scripts/analyze_music.py public/audio/musique.mp3
Sortie : BPM estimé, durée d'un temps en images (30 i/s), grille des temps sur 40 s
et les 8 attaques les plus fortes (candidats pour le logo et les changements de scène).
"""
import subprocess
import sys

import numpy as np

SR = 22050
path = sys.argv[1]
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)
print(f"durée : {len(x) / SR:.1f} s")

# Enveloppe d'attaques : flux spectral positif sur trames de 512 échantillons
hop, win = 256, 2048
frames = np.lib.stride_tricks.sliding_window_view(x, win)[::hop] * np.hanning(win)
spec = np.log1p(np.abs(np.fft.rfft(frames, axis=1)))
flux = np.maximum(0, np.diff(spec, axis=0)).sum(1)
flux = (flux - flux.mean()) / (flux.std() + 1e-9)
fps = SR / hop

# Tempo : autocorrélation de l'enveloppe, recherche entre 80 et 180 BPM
ac = np.correlate(flux, flux, "full")[len(flux) - 1 :]
lags = np.arange(len(ac)) / fps
mask = (lags > 60 / 180) & (lags < 60 / 80)
k = np.where(mask)[0][np.argmax(ac[mask])]
# interpolation parabolique autour du pic (précision sous la trame)
d = 0.5 * (ac[k - 1] - ac[k + 1]) / (ac[k - 1] - 2 * ac[k] + ac[k + 1])
lag = (k + d) / fps
bpm = 60 / lag
print(f"tempo estimé : {bpm:.1f} BPM  → 1 temps = {30 * lag:.2f} images à 30 i/s")

# Phase de la grille : décalage qui maximise l'énergie sur les temps
best = max(np.arange(0, lag, 1 / fps), key=lambda ph: flux[np.clip(((np.arange(ph, len(flux) / fps, lag)) * fps).astype(int), 0, len(flux) - 1)].sum())
print(f"premier temps : {best:.3f} s")

top = np.argsort(flux)[::-1]
picked = []
for i in top:
    t = i / fps
    if all(abs(t - p) > 1.0 for p in picked):
        picked.append(t)
    if len(picked) == 8:
        break
print("attaques les plus fortes (s) :", ", ".join(f"{t:.2f}" for t in sorted(picked)))
