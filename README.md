# BEB — « L'énergie des possibles » · film motion design vertical (V2)

Film de marque de **34 s** pour BEB, format **1080 × 1920, 30 i/s**, pour Instagram Reels et LinkedIn.
V2 : **100 % motion design, sans photo** — typographie cinétique en Space Grotesk, aplats noir / orange / blanc
coupés sur le tempo (120 BPM), compteurs, pictogrammes tracés au trait, carte réelle de la Bretagne.
Réalisé avec [Remotion](https://www.remotion.dev) : animations déterministes, timeline au frame près.

## Livrables

| Fichier | Contenu |
|---|---|
| `out/BEB_V2_energie-des-possibles_1080x1920.mp4` | **Version de diffusion** — H.264, 1080 × 1920, 30 i/s, yuv420p, AAC, lecture rapide en ligne (faststart). |
| `out/BEB_V2_version-de-travail_1080x1920.mp4` | Même film + zones masquées par les interfaces réseaux sociaux + timecode. |
| `public/audio/beb-sound-design.wav` | Maquette sonore synthétisée par code, libre de droits, calée sur l'image. |
| `docs/direction-sonore.md` | Direction sonore + feuille de synchronisation. |

La V1 (avec photos des groupes) reste disponible dans l'historique Git (commit `59717e7`).

## Structure du film

| Temps | Séquence | Contenu |
|---|---|---|
| 0–3 s | Accroche | « QUEL QUE SOIT LE CONTEXTE » · CHANTIER. ÉVÉNEMENT. INDUSTRIE. URGENCE. (un aplat par croche) · « BESOIN D'ÉNERGIE ? » · « BEB S'EN CHARGE. » |
| 3–5 s | Logo | Logo officiel avec baseline, lettre par lettre ; le cadre de protection part en onde |
| 5–7 s | Leader | Aplat orange : « BEB, LEADER EN BRETAGNE » · « Depuis 40 ans, l'énergie des professionnels. » |
| 7–11 s | Mérite | Compteurs : 40 ans d'expérience · 39 collaborateurs · 1 300 contrats d'entretien · 15 000 m² d'atelier et de stockage |
| 11–12,5 s | Métiers | « SOLUTIONS CLÉ EN MAIN » · VENTE. LOCATION. MAINTENANCE. |
| 12,5–17 s | Location | Groupes électrogènes (40 à 2 500 kVA) · **Compresseurs thermiques** (5 000 à 25 000 L/min) · **Mâts d'éclairage** autonomes · bandeau accessoires |
| 17–22 s | Proximité | « PROCHES DE VOUS. » · carte de la Bretagne (trait de côte réel), 5 agences reliées par le tracé |
| 22–25 s | Astreinte | Cadran 24 h · « H24 » · « ASTREINTE 24H/24 · 7J/7 » · « Nos techniciens interviennent jour et nuit. » |
| 25–28 s | Réactivité | « RÉACTIVITÉ. » · « Une source d'énergie fiable, en toutes circonstances. » · « PRÉVOIR LES IMPRÉVUS. » |
| 28–34 s | Devis | Logo · « UN PROJET ? UNE URGENCE ? » · bouton **DEMANDEZ VOTRE DEVIS** · 09 73 44 55 55 · groupe-beb.com |

## Sources

- **Charte** (`assets-src/brand/CharteGraphiqueBEB.pdf`) : logo vectoriel extrait tel quel (`scripts/extract_logo.py`),
  zone de protection (hauteur du B) respectée, couleurs `#130f14` / `#ea5614` / `#ffffff` (+ gris `#e2e2e4` du site),
  police Space Grotesk (fichiers locaux, licence SIL OFL).
- **Site groupe-beb.com** (fichier HTML fourni) : chiffres des compteurs, gammes et plages de puissance / débit,
  astreinte « URGENCE H24 7/7 », « techniciens pouvant intervenir 24h/24 et 7j/7 », « PRÉVOIR LES IMPRÉVUS »,
  « en toutes circonstances », « solutions clé en main », villes des agences, téléphone, « Demander un devis ».
- **« Leader en Bretagne »** : affirmation fournie par BEB, absente du site. En publicité, une allégation de
  leadership doit pouvoir être justifiée (parts de marché, classement…) ; modifiable dans `src/config/content.ts`.
- **Carte** : trait de côte Natural Earth 1:10m (domaine public) via le paquet `world-atlas`, extrait par
  `scripts/extract_map.mjs` ; agences placées à leurs coordonnées GPS réelles.
- **Pictogrammes** : schémas au trait dessinés pour le film (pas de représentation réaliste de matériel).

## Rendu

Prérequis : Node 18+ (testé avec Node 22), Python 3 + numpy, ffmpeg.

```bash
npm install
npm run render          # → out/BEB_V2_energie-des-possibles_1080x1920.mp4
npm run render:draft    # → out/BEB_V2_version-de-travail_1080x1920.mp4
npm run studio          # aperçu interactif
npm run audio           # régénère la maquette sonore depuis la timeline
```

Sans téléchargement possible de Chrome Headless Shell : `REMOTION_BROWSER_EXECUTABLE=/chemin/vers/headless_shell npm run render`.

## Modifier le film

- **Textes et chiffres** : `src/config/content.ts`. Un passage entre crochets passe en orange : `'DE [VOUS.]'`.
  Les titres s'ajustent automatiquement à la colonne de 888 px (aucun texte coupé).
- **Durées et synchronisation** : `src/config/timeline.json` (scènes, repères, sections musicales). Les mêmes
  repères pilotent l'image et `scripts/generate_audio.py` : relancer `npm run audio` puis le rendu.
- **Couleurs / marges / zone utile** : `src/config/brand.ts`.

## Contrôles effectués

- 1 020 images, 34,00 s ; chaque séquence aux temps du tableau ci-dessus.
- Textes importants dans la zone y 260–1480 et les marges de 96 px ; accents jamais rognés par les masques.
- Couleurs charte vérifiées après encodage H.264 (écarts de quelques unités).
- Son : −14 LUFS, crête −1,5 dBTP ; accents à ≤ 1 image de leur repère visuel (détection d'attaques).
- Le film reste compréhensible sans le son (tous les messages sont à l'écran).
