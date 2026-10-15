# Direction sonore & feuille de synchronisation — BEB « L'énergie des possibles »

## Ce qui est intégré

`public/audio/beb-sound-design.wav` est une **maquette sonore synthétisée entièrement par code**
(`scripts/generate_audio.py`) : oscillateurs et bruit filtré, **aucun échantillon, aucune boucle,
aucune musique tierce**. Elle est donc libre de droits pour l'usage prévu.

C'est une **maquette de synchronisation et d'intention**, pas une musique composée : elle fixe les
accents, le tempo et l'énergie de chaque séquence. Pour la diffusion, elle peut être conservée telle
quelle ou remplacée par une création d'un sound designer / compositeur en respectant les repères
ci-dessous.

- 48 kHz, stéréo, 30,00 s, **−14 LUFS intégrés, crête −1,5 dBTP** (cible Instagram / LinkedIn).
- Synchronisation vérifiée par détection d'attaques : écart ≤ 25 ms (moins d'une image) sur tous les accents.
- Médiums renforcés pour rester perceptible sur haut-parleur de téléphone. Le film reste
  entièrement compréhensible **sans le son** (tous les messages sont à l'écran).

## Caractéristiques de la bande-son (brief pour un remplacement)

- **Style** : électro-industriel premium, sobre. Basses maîtrisées, pulsation mécanique, impacts courts.
- **Tempo** : 120 BPM (1 temps = 15 images). Toutes les scènes commencent sur un temps.
- **Tonalité** : ré mineur (Ré – Si♭ – Do – Ré – La, puis accord suspendu sur la signature, résolution en Ré).
- **Textures** : démarreur et prise du moteur diesel à 3,07–3,80 s, ralenti grave discret sous les expertises,
  résonances métalliques (tôle, châssis) sur les apparitions du logo.
- **Pas de whoosh systématique** : seules les transitions majeures ont une montée (2,0 s et 21,1 s).
- **Dynamique** : montée continue jusqu'à 21 s, respiration sur la signature (le rythme s'arrête),
  reprise douce de la pulsation sur l'appel à l'action, fin nette à 30 s.

## Feuille de synchronisation

Les repères sont définis dans `src/config/timeline.json` (source unique pour l'image ET le son).

| Temps | Image | Événement visuel | Son |
|---|---|---|---|
| 0,07 s | 2 | « VOS PROJETS » apparaît | Impact court + résonance métallique |
| 0–1,9 s | 0–58 | Lumière rasante qui révèle la matière | Drone grave Ré/La |
| 1,00 s | 30 | « ONT BESOIN D'ÉNERGIE. » | Impact |
| 2,00–3,00 s | 60–90 | Le tracé traverse l'écran, l'image se referme | Montée (bruit filtré + ton ascendant) |
| 3,00 s | 90 | Le tracé s'ouvre, l'image apparaît | Transitoire sec |
| 3,07–3,80 s | 92–114 | Ouverture, la ligne se pose au sol | Démarreur électrique |
| 3,80 s | 114 | Le moteur prend, la lumière s'allume | Prise du diesel + impact grave |
| 4,20 s | 126 | Logo BEB | Résonance métallique + grosse caisse |
| 4,80 s | 144 | « NOUS LA METTONS EN ACTION. » | Clic mécanique |
| 5,00 s | 150 | — | Début de la pulsation (grosse caisse seule) |
| 7,00 s | 210 | VENTE (balayage vers le haut) | Impact · basse + cliquetis en doubles-croches |
| 10,00 s | 300 | LOCATION (balayage vers la droite, fond clair) | Impact · accord Si♭ |
| 13,00 s | 390 | MAINTENANCE (balayage vers le bas) | Impact · accord Do |
| 16,00 s | 480 | « À VOS CÔTÉS. » + montage | Impact · accord Ré |
| 16,5 / 17 / 17,5 / 18 / 18,5 s | 495…555 | Coupes du montage (1 plan par temps) | Clics de coupe |
| 19,00 s | 570 | « SUR LE TERRAIN. » + réseau d'agences | Impact · accord La |
| 19,47 → 20,53 s | 584…616 | Les 5 agences s'allument | 5 signaux brefs, panoramiques |
| 21,07–22,00 s | 632–660 | Sortie du terrain | Montée |
| 22,00 s | 660 | Signature : le cadre se resserre | Grand impact grave, arrêt de la pulsation |
| 22,40 s | 672 | Logo BEB | Résonance métallique |
| 23,33 s | 700 | « L'énergie des possibles. » | Clic |
| 26,00 s | 780 | Le logo monte vers l'appel à l'action | Souffle filtré (crescendo) |
| 26,50 s | 795 | « UN PROJET ? » | Impact · reprise douce de la pulsation |
| 27,00 s | 810 | « PARLONS ÉNERGIE. » | Impact |
| 27,50 s | 825 | Bouton téléphone + site | Clic |
| 29,4–30,0 s | 882–900 | Composition finale tenue | Fondu de sortie (0,6 s) |
