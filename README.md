# BEB — « L'énergie des possibles » · film motion design vertical

Film de marque de 30 s pour BEB (vente, location et maintenance de groupes électrogènes),
format **1080 × 1920, 30 i/s**, pour Instagram Reels et LinkedIn. Réalisé avec
[Remotion](https://www.remotion.dev) : animations déterministes, timeline au frame près, rendu MP4 H.264.

## Livrables

| Fichier | Contenu |
|---|---|
| `out/BEB_energie-des-possibles_1080x1920.mp4` | **Version principale** — H.264, 1080 × 1920, 30 i/s, yuv420p, audio AAC. Uniquement des médias réels fournis. |
| `out/BEB_version-de-travail_1080x1920.mp4` | **Version de travail** — emplacements « photo terrain à fournir », zones d'interface réseaux sociaux, timecode. |
| `public/audio/beb-sound-design.wav` | Maquette sonore synthétisée par code, libre de droits, calée sur l'image. |
| `docs/direction-sonore.md` | Direction sonore + feuille de synchronisation. |
| `src/` | Projet source complet. |

## Structure du film

| Temps | Séquence | Image | Rôle du tracé d'énergie |
|---|---|---|---|
| 00–03 s | Accroche | Gros plan 330 kVA, lumière rasante · « VOS PROJETS / ONT BESOIN D'ÉNERGIE. » | traverse l'écran, l'image se referme sur lui |
| 03–07 s | Révélation | Le 66 kVA détouré, posé sur la ligne · logo · « NOUS LA METTONS EN ACTION. » | **ligne de révélation** puis ligne de sol |
| 07–10 s | Vente | 330 kVA, élévation · « La puissance adaptée à vos besoins. » · NEUF ET OCCASION | **soulignement**, balayage vertical |
| 10–13 s | Location | 66 kVA « LOUEUR D'ÉNERGIE » sur fond clair, travelling · « L'énergie au rythme de vos projets. » · DE 40 À 2 500 kVA | soulignement, balayage horizontal |
| 13–16 s | Maintenance | Tableau de commande, poussée + mise au point · « La fiabilité s'entretient. » · SAV 24H/24 · 7J/7 | repère technique autour du contrôleur |
| 16–22 s | Le terrain | Montage au tempo de détails réels · réseau des 5 agences · « À VOS CÔTÉS. / SUR LE TERRAIN. » | **cadre** du montage, puis liaison des agences |
| 22–26 s | Signature | Logo BEB, « L'énergie des possibles. » — le rythme ralentit | le cadre se resserre en un trait |
| 26–30 s | Appel à l'action | « UN PROJET ? PARLONS ÉNERGIE. » · 09 73 44 55 55 · groupe-beb.com | le trait devient le **bouton** de contact |

## Sources et respect de la charte

- **Logo** : tracés vectoriels extraits tels quels de `assets-src/brand/CharteGraphiqueBEB.pdf` (p.3) par
  `scripts/extract_logo.py`. Jamais redessiné ni déformé ; les lettres sont révélées par masque.
  **Zone de protection** (hauteur du B, charte p.2) respectée partout où le logo est posé.
- **Couleurs** : `#130f14` et `#ea5614` (charte p.5, RVB digital), `#ffffff`, et `#e2e2e4` (gris du site).
  Définies dans `src/config/brand.ts`.
- **Typographie** : Space Grotesk (charte p.6), fichiers locaux `public/fonts/` (licence SIL OFL).
- **Photos** : uniquement les photos fournies (groupes 66 kVA « 60-04 » et 330 kVA « 305-13 »).
  Détourage **exact** par triangulation : chaque photo existe sur fond noir et fond blanc, alignées
  au pixel ; `scripts/make_cutouts.py` en déduit l'alpha réel (aucune IA, aucune retouche de la machine).
  Aucune image générée, aucun faux technicien, aucune référence client.
- **Faits affichés** (« neuf et occasion », « 40 à 2 500 kVA », « SAV 24h/24 · 7j/7 », 5 agences
  Rennes · Brest · Saint-Brieuc · Lorient · Nantes, téléphone) : issus du fichier HTML du site fourni.
  Les positions des agences sur le réseau sont leurs coordonnées géographiques réelles.

## Rendu

Prérequis : Node 18+ (testé avec Node 22), Python 3 + numpy, ffmpeg.

```bash
npm install
npm run render          # → out/BEB_energie-des-possibles_1080x1920.mp4
npm run render:draft    # → out/BEB_version-de-travail_1080x1920.mp4
npm run studio          # aperçu interactif, timeline et réglages
```

Dans un environnement sans téléchargement de Chrome Headless Shell, pointer vers un navigateur installé :
`REMOTION_BROWSER_EXECUTABLE=/chemin/vers/headless_shell npm run render`.

Outils de régénération :

```bash
python3 scripts/extract_logo.py      # logo depuis la charte PDF
python3 scripts/make_cutouts.py      # détourages depuis les paires fond noir / fond blanc
python3 scripts/generate_audio.py    # maquette sonore (lit src/config/timeline.json)
node scripts/stills.mjs BEB-Main 8,240,850   # images fixes de contrôle → out/stills/
```

## Modifier le film

- **Textes** : `src/config/content.ts`. Un passage entre crochets passe en orange : `'SUR LE [TERRAIN.]'`.
  Les corps de titre s'ajustent automatiquement à la colonne de 888 px (pas de texte coupé).
- **Durées et synchronisation** : `src/config/timeline.json`. Les mêmes repères pilotent l'image et
  `scripts/generate_audio.py` : après modification, relancer `npm run audio` puis le rendu.
- **Cadrages photo** : `viewFrom` / `viewTo` dans `content.ts` (point source au centre du cadre + échelle).
- **Couleurs / marges / zone utile** : `src/config/brand.ts`.

## Médias manquants — à fournir pour la version finale

1. **Photos de terrain** (interventions, installations, techniciens, livraisons) : aucune n'a été fournie.
   La séquence 16–19 s utilise donc des détails réels des machines ; la version de travail montre les
   6 emplacements prévus. Déposer les photos dans `public/media/terrain/`, puis les déclarer dans
   `TERRAIN_SHOTS` (`src/config/content.ts`).
2. **Groupe 330 kVA, vues de face et 3/4 sur fond blanc** : 4 photos ont été envoyées en cours de
   séance mais ne sont pas parvenues jusqu'aux fichiers du projet. Les déposer dans `assets-src/photos/`
   sous la forme `beb-330kva-face-fond-noir.jpg`, `beb-330kva-face-fond-blanc.jpg`,
   `beb-330kva-34-fond-blanc.jpg` puis lancer `python3 scripts/make_cutouts.py` : le détourage du
   330 kVA sera généré automatiquement.
3. **Photos haute définition** (≥ 4000 px de large) : les fichiers reçus font 2000 px ; les gros plans
   sont agrandis jusqu'à ×1,7, ce qui reste net sur téléphone mais gagnerait en finesse.

## Contrôles effectués

- Durée réelle 30,00 s (900 images) ; séquences aux temps du storyboard (voir tableau ci-dessus).
- Textes : tous les titres calculés pour tenir dans la colonne, vérifiés sur images fixes ; accents
  (É, À, Ô) jamais rognés par les masques ; aucun texte important hors de la zone y 260–1480.
- Lisibilité téléphone : titres de 92 à 228 px, textes secondaires ≥ 46 px, chaque texte reste
  immobile au moins 1,3 s (2 s et plus pour les sous-titres) ; appel à l'action entièrement lisible pendant les 2 dernières secondes.
- Son : −14 LUFS, crête −1,5 dBTP, accents à ≤ 25 ms de leur repère visuel.
