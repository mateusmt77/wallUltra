// Pointer geometry uses the same logical coordinates as wallpaper rendering.
export const SHAPE_LIMITS = { minSize: 1, maxWidth: 4000, maxHeight: 2160, maxStroke: 240, minPosition: -200, maxPosition: 300 };
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rotate = (x, y, angle) => ({ x: x * Math.cos(angle) - y * Math.sin(angle), y: x * Math.sin(angle) + y * Math.cos(angle) });
const anchors = [['nw', -1, -1], ['n', 0, -1], ['ne', 1, -1], ['e', 1, 0], ['se', 1, 1], ['s', 0, 1], ['sw', -1, 1], ['w', -1, 0]];
export function shapeHandles(box, W, H, viewScale) {
  const inset = Math.min(14 / viewScale, W / 4, H / 4);
  const boundedPoint = p => ({ x: clamp(p.x + box.x, inset, W - inset), y: clamp(p.y + box.y, inset, H - inset) });
  const handles = anchors.map(([name, ax, ay]) => {
    const point = boundedPoint(rotate(ax * box.width / 2, ay * box.height / 2, box.angle));
    const angle = Math.atan2(ay, ax) + box.angle;
    const cursor = ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize'][((Math.round(angle / (Math.PI / 4)) % 4) + 4) % 4];
    return { name, ax, ay, ...point, cursor };
  });
  const point = boundedPoint(rotate(0, -box.height / 2 - 38 / viewScale, box.angle));
  handles.push({ name: 'stroke', ...point, cursor: 'ew-resize' });
  return handles;
}
export function hitShapeHandle(handles, point, viewScale, touch = false) {
  const radius = (touch ? 22 : 12) / viewScale;
  return [...handles].reverse().map(handle => ({ handle, distance: Math.hypot(handle.x - point.x, handle.y - point.y) }))
    .filter(hit => hit.distance <= radius).sort((a, b) => a.distance - b.distance)[0]?.handle;
}
export function beginShapeTransform(shape, box, point, handle, W, H, viewScale) {
  return { shape, box: { x: box.x, y: box.y, width: box.width, height: box.height, angle: box.angle },
    start: { ...point }, handle, W, H, viewScale };
}
export function transformShape(session, point, proportional = false) {
  const { shape, box, start, handle, W, H, viewScale } = session;
  const base = { width: box.width, height: box.height, x: box.x / W * 100, y: box.y / H * 100, keepInside: false };
  if (handle.name === 'stroke') {
    const minimum = !shape.fill || shape.type === 'line' ? .5 : 0;
    const original = shape.strokeWidth || (minimum ? 3 : 0);
    return { ...base, strokeWidth: clamp(original + (point.x - start.x) * viewScale, minimum, SHAPE_LIMITS.maxStroke) };
  }
  const delta = rotate(point.x - start.x, point.y - start.y, -box.angle);
  const { ax, ay } = handle;
  let width = ax ? box.width + ax * delta.x : box.width;
  let height = ay ? box.height + ay * delta.y : box.height;
  if (proportional) {
    const sx = width / box.width, sy = height / box.height;
    const scale = !ay || (ax && Math.abs(sx - 1) >= Math.abs(sy - 1)) ? sx : sy;
    const bounded = clamp(scale, Math.max(1 / box.width, 1 / box.height), Math.min(SHAPE_LIMITS.maxWidth / box.width, SHAPE_LIMITS.maxHeight / box.height));
    width = box.width * bounded; height = box.height * bounded;
  } else {
    width = clamp(width, SHAPE_LIMITS.minSize, SHAPE_LIMITS.maxWidth);
    height = clamp(height, SHAPE_LIMITS.minSize, SHAPE_LIMITS.maxHeight);
  }
  const shift = rotate(ax * (width - box.width) / 2, ay * (height - box.height) / 2, box.angle);
  return { ...base, width, height,
    x: clamp((box.x + shift.x) / W * 100, SHAPE_LIMITS.minPosition, SHAPE_LIMITS.maxPosition),
    y: clamp((box.y + shift.y) / H * 100, SHAPE_LIMITS.minPosition, SHAPE_LIMITS.maxPosition) };
}
export function drawShapeControls(ctx, box, W, H, viewScale) {
  const handles = shapeHandles(box, W, H, viewScale);
  ctx.save();
  ctx.translate(box.x, box.y); ctx.rotate(box.angle);
  ctx.strokeStyle = '#9eb7ff'; ctx.lineWidth = 1.5 / viewScale; ctx.setLineDash([5 / viewScale, 4 / viewScale]);
  ctx.strokeRect(-box.width / 2, -box.height / 2, box.width, box.height);
  ctx.restore();
  ctx.save(); ctx.setLineDash([]); ctx.lineWidth = 2 / viewScale;
  for (const handle of handles) {
    if (handle.name === 'stroke') {
      ctx.fillStyle = '#ffcf42'; ctx.strokeStyle = '#172247'; ctx.beginPath(); ctx.arc(handle.x, handle.y, 10 / viewScale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(handle.x - 5 / viewScale, handle.y); ctx.lineTo(handle.x + 5 / viewScale, handle.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(handle.x - 5 / viewScale, handle.y); ctx.lineTo(handle.x - 2 / viewScale, handle.y - 3 / viewScale); ctx.moveTo(handle.x + 5 / viewScale, handle.y); ctx.lineTo(handle.x + 2 / viewScale, handle.y + 3 / viewScale); ctx.stroke();
      const effectiveStroke = box.item.strokeWidth || (!box.item.fill || box.item.type === 'line' ? 3 : 0);
      const label = `Contorno ${Number(effectiveStroke.toFixed(1))} px`;
      ctx.font = `600 ${11 / viewScale}px Manrope, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const width = ctx.measureText(label).width + 16 / viewScale;
      const x = clamp(handle.x, width / 2 + 4 / viewScale, W - width / 2 - 4 / viewScale);
      const above = handle.y - 24 / viewScale;
      const y = clamp(above < 12 / viewScale ? handle.y + 24 / viewScale : above, 12 / viewScale, H - 12 / viewScale);
      ctx.fillStyle = '#172247'; ctx.fillRect(x - width / 2, y - 9 / viewScale, width, 18 / viewScale); ctx.fillStyle = '#ffffff'; ctx.fillText(label, x, y);
    } else {
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#304dff'; const size = 10 / viewScale;
      ctx.fillRect(handle.x - size / 2, handle.y - size / 2, size, size); ctx.strokeRect(handle.x - size / 2, handle.y - size / 2, size, size);
    }
  }
  ctx.restore();
}
