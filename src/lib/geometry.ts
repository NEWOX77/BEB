/** Géométrie du tracé : segments droits et angles chanfreinés à 45°, comme les lettres du logo. */

export type Pt = [number, number];
export type Rect = {x: number; y: number; w: number; h: number};

const fmt = (n: number) => n.toFixed(2);

/** Polyligne → chemin SVG avec angles coupés de longueur `c`. */
export const chamferPolyline = (pts: Pt[], c: number, closed = false) => {
  if (pts.length < 2) return '';
  const out: Pt[] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const isEnd = !closed && (i === 0 || i === n - 1);
    if (isEnd || c <= 0) {
      out.push(p);
      continue;
    }
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const d1 = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    const d2 = Math.hypot(next[0] - p[0], next[1] - p[1]);
    const k = Math.min(c, d1 / 2, d2 / 2);
    out.push([p[0] + ((prev[0] - p[0]) / (d1 || 1)) * k, p[1] + ((prev[1] - p[1]) / (d1 || 1)) * k]);
    out.push([p[0] + ((next[0] - p[0]) / (d2 || 1)) * k, p[1] + ((next[1] - p[1]) / (d2 || 1)) * k]);
  }
  return `M ${out.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' L ')}${closed ? ' Z' : ''}`;
};

/**
 * Cadre chanfreiné (coins haut-droit et bas-gauche coupés, en écho aux lettres B/E).
 * Le tracé démarre en haut à gauche et tourne dans le sens horaire.
 */
export const chamferFrame = (r: Rect, c: number) => {
  const k = Math.max(0, Math.min(c, r.w / 2, r.h / 2));
  const pts: Pt[] = [
    [r.x, r.y],
    [r.x + r.w - k, r.y],
    [r.x + r.w, r.y + k],
    [r.x + r.w, r.y + r.h],
    [r.x + k, r.y + r.h],
    [r.x, r.y + r.h - k],
  ];
  return `M ${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' L ')} Z`;
};

export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});

/** Même découpe que chamferFrame, en clip-path CSS (pour masquer une image dans le cadre). */
export const chamferClip = (r: Rect, c: number) => {
  const k = Math.max(0, Math.min(c, r.w / 2, r.h / 2));
  const pts: Pt[] = [
    [r.x, r.y],
    [r.x + r.w - k, r.y],
    [r.x + r.w, r.y + k],
    [r.x + r.w, r.y + r.h],
    [r.x + k, r.y + r.h],
    [r.x, r.y + r.h - k],
  ];
  return `polygon(${pts.map(([x, y]) => `${fmt(x)}px ${fmt(y)}px`).join(', ')})`;
};
