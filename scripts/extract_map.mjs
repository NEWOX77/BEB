// Trait de côte réel du Grand Ouest (Natural Earth 1:10m, domaine public, via world-atlas)
// → src/data/grandOuest.ts : polygones projetés, prêts à dessiner en SVG.
// Usage : node scripts/extract_map.mjs
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {feature} from 'topojson-client';

const require = createRequire(import.meta.url);
const topo = require('world-atlas/land-10m.json');
const land = feature(topo, topo.objects.land);

// Cadre géographique : Bretagne + Loire-Atlantique
const BBOX = {w: -5.35, e: -0.75, s: 46.75, n: 48.95};
const K = Math.cos((48 * Math.PI) / 180); // correction de latitude (équirectangulaire)

// Découpage Sutherland–Hodgman d'un anneau par le rectangle BBOX
const clip = (ring) => {
  const edges = [
    [(p) => p[0] >= BBOX.w, (a, b) => inter(a, b, 0, BBOX.w)],
    [(p) => p[0] <= BBOX.e, (a, b) => inter(a, b, 0, BBOX.e)],
    [(p) => p[1] >= BBOX.s, (a, b) => inter(a, b, 1, BBOX.s)],
    [(p) => p[1] <= BBOX.n, (a, b) => inter(a, b, 1, BBOX.n)],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) out.push(cut(prev, cur));
    }
    if (!out.length) break;
  }
  return out;
};
const inter = (a, b, axis, v) => {
  const t = (v - a[axis]) / (b[axis] - a[axis]);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
};

// Simplification Douglas–Peucker (tolérance en degrés)
const simplify = (pts, tol) => {
  if (pts.length < 3) return pts;
  const d = (p, a, b) => {
    const [x, y] = p, [x1, y1] = a, [x2, y2] = b;
    const L = Math.hypot(x2 - x1, y2 - y1);
    if (L < 1e-9) return Math.hypot(x - x1, y - y1); // anneau fermé : premier = dernier point
    return Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / L;
  };
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const v = d(pts[i], pts[0], pts[pts.length - 1]);
    if (v > max) { max = v; idx = i; }
  }
  if (max <= tol) return [pts[0], pts[pts.length - 1]];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
};

const rings = [];
for (const f of land.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    for (const ring of poly.slice(0, 1)) {
      const c = clip(ring);
      if (c.length < 4) continue;
      const s = simplify(c, 0.004);
      // ignore les îlots minuscules
      const xs = s.map((p) => p[0]), ys = s.map((p) => p[1]);
      if ((Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)) < 0.0004) continue;
      rings.push(s.map(([lon, lat]) => [+((lon - BBOX.w) * K).toFixed(4), +(BBOX.n - lat).toFixed(4)]));
    }
  }
}
const W = +((BBOX.e - BBOX.w) * K).toFixed(4), H = +(BBOX.n - BBOX.s).toFixed(4);

// Trait de côte seul : on coupe les anneaux là où ils longent le cadre de découpage
const onEdge = ([x, y]) => x < 1e-3 || y < 1e-3 || Math.abs(x - W) < 1e-3 || Math.abs(y - H) < 1e-3;
const coast = [];
for (const r of rings) {
  const closed = [...r, r[0]];
  let cur = [];
  for (let i = 0; i < closed.length; i++) {
    const p = closed[i];
    const prev = closed[i - 1];
    if (prev && onEdge(prev) && onEdge(p)) {
      if (cur.length > 1) coast.push(cur);
      cur = [p];
    } else cur.push(p);
  }
  if (cur.length > 1) coast.push(cur);
}
const ts = `// Fichier généré par scripts/extract_map.mjs — ne pas modifier à la main.
// Trait de côte Natural Earth 1:10m (domaine public), via le paquet world-atlas.
// Unités : degrés de longitude × cos(48°) (x, vers l'est) et degrés de latitude (y, vers le sud).
export const MAP_BBOX = ${JSON.stringify(BBOX)};
export const MAP_K = ${K};
export const MAP_SIZE = {w: ${W}, h: ${H}};
export const MAP_RINGS: [number, number][][] = ${JSON.stringify(rings)};
/** Trait de côte uniquement (sans les bords du cadre de découpage). */
export const MAP_COAST: [number, number][][] = ${JSON.stringify(coast)};
/** Projection d'un point GPS dans les unités de la carte. */
export const project = (lat: number, lon: number): [number, number] => [(lon - MAP_BBOX.w) * MAP_K, MAP_BBOX.n - lat];
`;
fs.writeFileSync('src/data/grandOuest.ts', ts);
console.log('anneaux', rings.length, 'côtes', coast.length, 'points', rings.reduce((a, r) => a + r.length, 0), 'taille', W, H);
