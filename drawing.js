// Ink is stored as vectors. The eraser operates only on this transparent layer.
export const MAX_STROKES = 2000;
export const MAX_STROKE_POINTS = 5000;
export const MAX_DRAWING_POINTS = 200000;
export const inkTools = ['pencil', 'pen', 'brush', 'marker', 'eraser'];
const bound = (n, min, max, fallback) => Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
export function drawingPoint(x, y, width, pressure = 1) {
  // Coordinates relative to the screen centre and its height preserve proportions
  // when a project changes from a regular monitor to an ultrawide monitor.
  return [bound(x / 1080 - width / 2160, -4, 4, 0), bound(y / 1080, -2, 3, .5), bound(pressure, .05, 1, 1)];
}
export function validateStrokes(value) {
  if (!Array.isArray(value)) return [];
  const result = []; let total = 0;
  for (const raw of value.slice(0, MAX_STROKES)) {
    if (!raw || !Array.isArray(raw.points) || !inkTools.includes(raw.tool)) continue;
    const points = [];
    for (const p of raw.points.slice(0, Math.min(MAX_STROKE_POINTS, MAX_DRAWING_POINTS - total))) {
      if (!Array.isArray(p) || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue;
      points.push([bound(p[0], -4, 4, 0), bound(p[1], -2, 3, .5), bound(p[2], .05, 1, 1)]);
    }
    if (!points.length) continue;
    result.push({ tool: raw.tool, color: typeof raw.color === 'string' && /^#[a-f\d]{6}$/i.test(raw.color) ? raw.color : '#ffffff',
      size: bound(raw.size, .5, 240, 6), opacity: bound(raw.opacity, 0, 100, 100), pressure: raw.pressure === true, points });
    total += points.length;
    if (total >= MAX_DRAWING_POINTS) break;
  }
  return result;
}
export function drawStroke(ctx, stroke, width) {
  if (!stroke?.points.length) return;
  const points = stroke.points.map(p => [p[0] * 1080 + width / 2, p[1] * 1080, p[2]]);
  ctx.save(); ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.globalAlpha = stroke.opacity / 100; ctx.strokeStyle = ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.size; ctx.lineJoin = 'round'; ctx.lineCap = stroke.tool === 'marker' ? 'square' : 'round';
  if (stroke.pressure && ['pencil', 'brush'].includes(stroke.tool)) {
    // Fill a single union of disks and segment polygons: opacity is applied once,
    // without dark blobs where individual segments join.
    ctx.beginPath();
    const radius = p => stroke.size / 2 * (.15 + .85 * p[2]);
    points.forEach((p, i) => {
      const r = radius(p); ctx.moveTo(p[0] + r, p[1]); ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
      if (!i) return;
      const prev = points[i - 1], pr = radius(prev), dx = p[0] - prev[0], dy = p[1] - prev[1], len = Math.hypot(dx, dy);
      if (!len) return;
      const nx = -dy / len, ny = dx / len;
      ctx.moveTo(prev[0] - nx * pr, prev[1] - ny * pr); ctx.lineTo(p[0] - nx * r, p[1] - ny * r);
      ctx.lineTo(p[0] + nx * r, p[1] + ny * r); ctx.lineTo(prev[0] + nx * pr, prev[1] + ny * pr); ctx.closePath();
    });
    ctx.fill();
  } else if (points.length === 1) {
    ctx.beginPath();
    if (stroke.tool === 'marker') ctx.rect(points[0][0] - stroke.size / 2, points[0][1] - stroke.size / 2, stroke.size, stroke.size);
    else ctx.arc(points[0][0], points[0][1], stroke.size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length - 1; i++) ctx.quadraticCurveTo(points[i][0], points[i][1], (points[i][0] + points[i + 1][0]) / 2, (points[i][1] + points[i + 1][1]) / 2);
    const last = points.at(-1); ctx.lineTo(last[0], last[1]); ctx.stroke();
  }
  ctx.restore();
}
let cache, working;
export function renderInk(ctx, strokes, pixelWidth, pixelHeight, draftStroke) {
  if (!strokes.length && !draftStroke) return;
  const W = 1080 * pixelWidth / pixelHeight, scale = pixelHeight / 1080;
  if (!cache || cache.strokes !== strokes || cache.width !== pixelWidth || cache.height !== pixelHeight) {
    const canvas = cache?.canvas || document.createElement('canvas');
    canvas.width = pixelWidth; canvas.height = pixelHeight;
    const ink = canvas.getContext('2d'); ink.scale(scale, scale);
    for (const stroke of strokes) drawStroke(ink, stroke, W);
    cache = { strokes, width: pixelWidth, height: pixelHeight, canvas };
  }
  let result = cache.canvas;
  if (draftStroke) {
    working ??= document.createElement('canvas');
    if (working.width !== pixelWidth || working.height !== pixelHeight) { working.width = pixelWidth; working.height = pixelHeight; }
    const ink = working.getContext('2d'); ink.setTransform(1, 0, 0, 1, 0, 0); ink.clearRect(0, 0, pixelWidth, pixelHeight);
    ink.drawImage(cache.canvas, 0, 0); ink.scale(scale, scale); drawStroke(ink, draftStroke, W); result = working;
  }
  // The caller uses logical coordinates; map the raster ink back to that space.
  ctx.drawImage(result, 0, 0, W, 1080);
}
