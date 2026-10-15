# Direction sonore & feuille de synchronisation — BEB V2

## Ce qui est intégré

`public/audio/beb-sound-design.wav` est une **maquette sonore synthétisée entièrement par code**
(`scripts/generate_audio.py`) : oscillateurs et bruit filtré, **aucun échantillon, aucune boucle, aucune
musique tierce** — donc libre de droits. C'est une maquette de synchronisation et d'intention : elle peut être
conservée ou remplacée par une création d'un sound designer en respectant les repères ci-dessous.

- 48 kHz, stéréo, 34,00 s, **−14 LUFS intégrés, crête −1,5 dBTP** (cible Instagram / LinkedIn).
- Synchronisation vérifiée par détection d'attaques : écart ≤ 1 image sur tous les accents.
- Médiums renforcés pour l'écoute sur téléphone. Le film reste compréhensible **sans le son**.

## Brief pour un remplacement

- **Style** : électro-industriel premium, énergique : grosse caisse sur chaque temps, claquement sur 2 et 4,
  cliquetis en doubles-croches, basse en croches. Impacts secs et résonances métalliques sur les apparitions clés.
- **Tempo** : 120 BPM (1 temps = 15 images, 1 croche = 7,5 images). Toutes les coupes tombent sur le temps ou la croche.
- **Tonalité** : ré mineur. Respirations : pas de grosse caisse sur le logo (3–5 s) ni sur les 1,0 dernière seconde.

## Sections musicales (timeline.json → `music`)

| Temps | Accord | Grosse caisse | Cliquetis | Basse |
|---|---|---|---|---|
| 0.0–1.0 s | Dm | — | — | — |
| 1.0–3.0 s | Dm | oui | 0.5 | 0.7 |
| 3.0–5.0 s | Bb | — | — | — |
| 5.0–9.0 s | Dm | oui | 1 | 1 |
| 9.0–11.0 s | C | oui | 1 | 1 |
| 11.0–13.0 s | Bb | oui | 1 | 1 |
| 13.0–15.0 s | F | oui | 1 | 1 |
| 15.0–17.0 s | C | oui | 1 | 1 |
| 17.0–19.0 s | Dm | oui | 0.6 | 0.8 |
| 19.0–21.0 s | Bb | oui | 1 | 1 |
| 21.0–22.0 s | C | oui | 1.2 | 1 |
| 22.0–25.0 s | Dm | oui | 0.7 | 1 |
| 25.0–26.5 s | Bb | oui | 1.2 | 1 |
| 26.5–28.0 s | A | oui | 1.2 | 1 |
| 28.0–31.0 s | Dm | oui | 1 | 1 |
| 31.0–33.0 s | Bb | oui | 0.6 | 0.8 |
| 33.0–34.0 s | Dm | — | — | — |

## Feuille de synchronisation (timeline.json → `cues`)

| Temps | Image | Événement visuel | Son |
|---|---|---|---|
|  0.00 s | 0 | « CHANTIER. » | Impact court + résonance (un mot par croche) |
|  0.27 s | 8 | « ÉVÉNEMENT. » | Impact court + résonance (un mot par croche) |
|  0.50 s | 15 | « INDUSTRIE. » | Impact court + résonance (un mot par croche) |
|  0.77 s | 23 | « URGENCE. » | Impact court + résonance (un mot par croche) |
|  1.00 s | 30 | « BESOIN D’ÉNERGIE ? » | Impact |
|  2.00 s | 60 | « BEB S’EN CHARGE. » | Impact moyen |
|  3.07 s | 92 | Logo · B | Grand impact + résonance métallique |
|  3.30 s | 99 | Logo · E | Clic mécanique |
|  3.53 s | 106 | Logo · B | Clic mécanique |
|  3.87 s | 116 | Baseline | Clic mécanique |
|  5.00 s | 150 | « LEADER EN BRETAGNE » · aplat orange | Grand impact grave |
|  7.00 s | 210 | Barres du E | Souffle filtré montant + impact |
|  7.13 s | 214 | 40 ans | Impact + cliquetis de compteur qui ralentit |
|  7.63 s | 229 | 39 collaborateurs | Impact + cliquetis de compteur qui ralentit |
|  8.13 s | 244 | 1 300 contrats | Impact + cliquetis de compteur qui ralentit |
|  8.63 s | 259 | 15 000 m² | Impact + cliquetis de compteur qui ralentit |
| 11.00 s | 330 | Barres du E | Souffle filtré montant + impact |
| 11.07 s | 332 | VENTE | Impact moyen |
| 11.33 s | 340 | LOCATION | Impact moyen |
| 11.57 s | 347 | MAINTENANCE | Impact moyen |
| 12.50 s | 375 | Groupes électrogènes | Impact |
| 14.00 s | 420 | Compresseurs | Souffle bref + impact |
| 15.50 s | 465 | Mâts d’éclairage | Souffle bref + impact |
| 17.00 s | 510 | Barres du E | Souffle filtré montant + impact |
| 17.20 s | 516 | Le tracé dessine la côte | Montée filtrée |
| 18.20 s | 546 | Brest | Signal bref, panoramique |
| 18.47 s | 554 | Saint-Brieuc | Signal bref, panoramique |
| 18.70 s | 561 | Rennes | Signal bref, panoramique |
| 18.97 s | 569 | Lorient | Signal bref, panoramique |
| 19.20 s | 576 | Nantes | Signal bref, panoramique |
| 19.50 s | 585 | 5 agences | Impact moyen |
| 22.00 s | 660 | Astreinte · cadran 24 h | Grand impact grave |
| 22.50 s | 675 | « ASTREINTE » | Impact moyen |
| 25.00 s | 750 | « RÉACTIVITÉ. » · aplat orange | Impact |
| 26.50 s | 795 | « PRÉVOIR LES IMPRÉVUS. » | Impact moyen |
| 28.00 s | 840 | Barres du E | Souffle filtré montant + impact |
| 28.20 s | 846 | « UN PROJET ? » | Impact moyen |
| 28.47 s | 854 | « UNE URGENCE ? » | Impact moyen |
| 29.00 s | 870 | Bouton « DEMANDEZ VOTRE DEVIS » | Impact |
| 29.50 s | 885 | Téléphone + site | Clic mécanique |
| 34.00 s | 1020 | Fin | Fondu de sortie (0,6 s) |
