import { plans, featurePlans, canUse, basicShapes, basicTemplates, resolutionPlan, requiredPlan, hasPlan } from './plans.js';
let membership = { plan: 'basic', activationAvailable: false };
import { palettes, templates, resolutions, fonts, MAX_TEXTS, initialState, createText, blankState, createShape, shapeTypes, MAX_SHAPES, moveLayer, prepareImage, shapePath, render } from './wallpaper.js';
import { loadWorkspaces, parseProject, serializeProject, normalizeImageFile } from './project.js';
import { MAX_STROKES, MAX_STROKE_POINTS, MAX_DRAWING_POINTS, drawingPoint } from './drawing.js';
import { SHAPE_LIMITS, shapeHandles, hitShapeHandle, beginShapeTransform, transformShape, drawShapeControls } from './shape-edit.js';

const $ = id => document.getElementById(id);
const canvas = $('wallpaper');
let storage = loadWorkspaces(null), restored = false;
try {
  const saved = localStorage.getItem('wallultra-project');
  if (saved) { storage = loadWorkspaces(saved); restored = true; }
} catch { /* Corrupt or blocked storage must never prevent editing. */ }
let state = storage.projects[storage.activeMode];
const workspaces = Object.fromEntries(Object.entries(storage.projects).map(([mode, project]) => [mode, { state: project, history: [], future: [] }]));
let selectedId = state.texts[0]?.id;
let history = [], future = [], pendingBefore, toastTimer, revision = 0, layouts = [];
let showSelection = false, drag;
let activeTool = 'texts', selectedShapeId, selectionKind = 'text', lastImageSrc;
let assetBusy = false;
let boardTool = 'select', lastInkTool = 'pen', paintGesture, paintFrame = 0;
let expandedEditor = false, previousScroll = 0;
const brushSettings = {
  pencil: { color: '#ad7bff', size: 3, opacity: 75, pressure: true },
  pen: { color: '#ad7bff', size: 6, opacity: 100, pressure: false },
  brush: { color: '#ff68ae', size: 22, opacity: 100, pressure: true },
  marker: { color: '#c2ff6d', size: 38, opacity: 32, pressure: false },
  eraser: { color: '#ffffff', size: 60, opacity: 100, pressure: false },
  shape: { color: '#ad7bff', size: 4, opacity: 100, type: 'rectangle', fill: false, pressure: false }
};
const clone = () => structuredClone(state);
const currentShape = () => state.shapes.find(shape => shape.id === selectedShapeId);
const currentText = () => state.texts.find(t => t.id === selectedId);
const setValue = (id, value) => { if ($(id).value !== String(value)) $(id).value = value; };

function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3500);
}
// History shares immutable state. Replace layer arrays/items instead of mutating them.
function remember(before) {
  const equalItem = (a, b) => a === b || (a && b && typeof a === 'object' && typeof b === 'object' && Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(key => a[key] === b[key]));
  const equalValue = (a, b) => a === b || (Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((item, i) => equalItem(item, b[i])) : equalItem(a, b));
  if (Object.keys(before).every(key => equalValue(before[key], state[key]))) return;
  history.push(before);
  if (history.length > 60) history.shift();
  future = [];
  revision++;
  $('save-status').textContent = 'RASCUNHO';
}
function finishEdit() {
  if (!pendingBefore) return;
  remember(pendingBefore);
  pendingBefore = undefined;
  sync();
}
function commit(patch) {
  if (paintGesture) cancelPaint();
  finishEdit();
  const before = state;
  state = { ...state, ...patch };
  remember(before);
  sync();
}
function patchText(patch) {
  if (!currentText()) return;
  selectionKind = 'text'; showSelection = true;
  commit({ texts: state.texts.map(t => t.id === selectedId ? { ...t, ...patch } : t) });
}
function liveEdit(patch) {
  if (paintGesture) cancelPaint();
  pendingBefore ??= state;
  state = { ...state, ...patch };
  $('save-status').textContent = 'RASCUNHO';
  sync();
}
function liveText(patch) {
  if (!currentText()) return;
  selectionKind = 'text'; showSelection = true;
  liveEdit({ texts: state.texts.map(t => t.id === selectedId ? { ...t, ...patch } : t) });
}
function draw() {
  layouts = render(canvas, state, { draftStroke: paintGesture?.stroke, draftShape: paintGesture?.shape });
  const box = !paintGesture && showSelection && layouts.find(b => b.kind === selectionKind && b.item.id === (selectionKind === 'text' ? selectedId : selectedShapeId));
  if (!box) return;
  const ctx = canvas.getContext('2d');
  const metrics = canvasMetrics();
  ctx.save(); ctx.scale(canvas.height / 1080, canvas.height / 1080);
  if (box.kind === 'shape') drawShapeControls(ctx, box, metrics.W, metrics.H, metrics.viewScale);
  else {
    ctx.translate(box.x, box.y); ctx.rotate(box.angle); ctx.strokeStyle = '#bfa4ee';
    ctx.lineWidth = 2 / metrics.viewScale; ctx.setLineDash([6 / metrics.viewScale, 4 / metrics.viewScale]);
    ctx.strokeRect(-box.width / 2 - 8, -box.height / 2 - 8, box.width + 16, box.height + 16);
  }
  ctx.restore();
}
function sync() {
  syncPlanUI();
  if (!currentText()) selectedId = state.texts[0]?.id;
  const text = currentText();
  syncExtended();
  for (const key of ['resolution', 'accent', 'background', 'secondary', 'highlight', 'intensity']) setValue(key, state[key]);
  setValue('project-name', state.name);
  setValue('export-format', state.exportFormat);
  setValue('export-quality', state.exportQuality);
  $('quality-control').hidden = state.exportFormat === 'png';
  $('export-quality-value').textContent = state.exportQuality + '%';
  $('file-type').textContent = state.exportFormat.toUpperCase();
  $('grain').checked = state.grain;
  $('intensity-value').textContent = state.intensity + '%';
  const selectedPalette = palettes.find(p => p.accent === state.accent && p.dark === state.background && p.second === state.secondary && p.light === state.highlight);
  $('palette-name').textContent = selectedPalette ? selectedPalette.name + ' selecionada. Ajuste as cores abaixo se quiser.' : 'Paleta personalizada. Suas cores, do seu jeito.';
  $('layer-count').textContent = `${state.texts.length} de ${MAX_TEXTS} textos`;
  const layerSelect = $('text-layer');
  const labels = state.texts.map((t, i) => `${i + 1}. ${t.text.replace(/\n/g, ' ').slice(0, 30) || 'Texto vazio'}${t.visible ? '' : ' (oculto)'}`);
  if (layerSelect.options.length !== state.texts.length || state.texts.some((t, i) => layerSelect.options[i]?.value !== t.id)) {
    layerSelect.replaceChildren(...state.texts.map((t, i) => new Option(labels[i], t.id)));
  } else labels.forEach((label, i) => { if (layerSelect.options[i].text !== label) layerSelect.options[i].text = label; });
  layerSelect.disabled = !text;
  setValue('text-layer', selectedId || '');
  $('text-controls').hidden = !text;
  $('text-controls').disabled = !text;
  $('empty-texts').hidden = !!text;
  $('add-text').disabled = state.texts.length >= MAX_TEXTS;
  $('add-text').title = state.texts.length >= MAX_TEXTS ? `Limite de ${MAX_TEXTS} textos atingido` : `Adicionar texto (${state.texts.length}/${MAX_TEXTS})`;
  $('duplicate-text').disabled = !text || state.texts.length >= MAX_TEXTS;
  $('remove-text').disabled = !text;
  $('remove-all-texts').disabled = !state.texts.length;
  if (text) {
    for (const [id, key] of [['headline', 'text'], ['font', 'font'], ['text-color', 'color'], ['text-size', 'size'], ['text-x', 'x'], ['text-y', 'y'], ['text-rotation', 'rotation'], ['text-opacity', 'opacity'], ['text-lineHeight', 'lineHeight']]) setValue(id, text[key]);
    $('show-text').checked = text.visible;
    $('text-lineHeight-value').textContent = text.lineHeight.toFixed(2) + '×';
    $('text-count').textContent = `${text.text.length}/300`;
    for (const [key, suffix] of [['size', ' px'], ['x', '%'], ['y', '%'], ['rotation', '°'], ['opacity', '%']]) $(`text-${key}-value`).textContent = Math.round(text[key]) + suffix;
  }
  document.querySelectorAll('[data-template]').forEach(el => {
    const active = el.dataset.template === state.template;
    el.classList.toggle('active', active); el.setAttribute('aria-pressed', active);
  });
  document.querySelectorAll('[data-palette]').forEach(el => {
    const p = palettes[Number(el.dataset.palette)];
    const active = p.accent === state.accent && p.dark === state.background && p.second === state.secondary && p.light === state.highlight;
    el.classList.toggle('active', active); el.setAttribute('aria-pressed', active);
  });
  for (const [attribute, predicate] of [['align', el => text?.align === el.dataset.align], ['style', el => !!text?.[el.dataset.style]]]) {
    document.querySelectorAll(`[data-${attribute}]`).forEach(el => {
      const active = predicate(el);
      el.classList.toggle('active', active); el.setAttribute('aria-pressed', active); el.disabled = !text;
    });
  }
  $('undo').disabled = !history.length;
  $('redo').disabled = !future.length;
  const [width, height] = state.resolution.split('x').map(Number);
  // Exact aspect ratio at a lower resolution; no expensive 5K redraw while typing.
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const divisor = gcd(width, height);
  const unitW = width / divisor, unitH = height / divisor;
  const multiple = Math.min(divisor, Math.floor(1600 / unitW));
  const w = unitW * multiple, h = unitH * multiple;
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const format = resolutions.find(r => r.value === state.resolution);
  document.querySelector('.workspace').style.setProperty('--canvas-ratio', String(width / height));
  $('canvas-dimensions').textContent = `${width} × ${height} px`;
  $('aspect-label').textContent = format.ratio;
  $('resolution-label').textContent = format.name;
  canvas.setAttribute('aria-label', `Wallpaper ${state.mode === 'blank' ? 'livre' : templates.find(t => t.id === state.template).name}. ${state.texts.filter(t => t.visible && t.text.trim()).length} textos visíveis. Arraste um texto ou use os controles de posição.`);
  draw();
  if (lastImageSrc !== state.image?.src) {
    lastImageSrc = state.image?.src;
    if (state.image) { const src = state.image.src; prepareImage(state.image).then(() => { if (state.image?.src === src) draw(); }).catch(() => toast('Não foi possível carregar a imagem do projeto.')); }
  }
}

resolutions.forEach(r => $('resolution').add(new Option(`${r.name} · ${r.ratio} · ${r.value.replace('x', ' × ')}`, r.value)));
fonts.forEach(f => $('font').add(new Option(f.name, f.id)));
for (const template of templates) {
  const button = document.createElement('button');
  button.className = 'template-card'; button.dataset.template = template.id;
  button.title = `Usar estilo ${template.name}. Seus textos serão preservados.`;
  const thumb = document.createElement('canvas'); thumb.width = 480; thumb.height = 200; thumb.setAttribute('aria-hidden', 'true');
  const p = palettes[template.palette];
  render(thumb, { ...initialState, template: template.id, accent: p.accent, background: p.dark, secondary: p.second, highlight: p.light }, { thumbnail: true });
  const caption = document.createElement('div'); caption.className = 'template-caption';
  const name = document.createElement('strong'); name.textContent = template.name;
  const tag = document.createElement('span'); tag.textContent = template.tag;
  caption.append(name, tag); button.append(thumb, caption); $('templates').append(button);
  if (!basicTemplates.includes(template.id)) { button.dataset.feature = 'premiumTemplates'; tag.textContent += ' · Medium'; }
  button.addEventListener('click', () => { if (!basicTemplates.includes(template.id) && !demand('premiumTemplates')) return; commit({ template: template.id }); });
}
function palettePatch(index) {
  const p = palettes[index];
  return { palette: index, accent: p.accent, background: p.dark, secondary: p.second, highlight: p.light };
}
palettes.forEach((p, i) => {
  const b = document.createElement('button'); b.className = 'palette'; b.dataset.palette = i;
  b.title = p.name; b.setAttribute('aria-label', 'Paleta ' + p.name);
  const swatch = document.createElement('span'); swatch.className = 'palette-swatch'; swatch.setAttribute('aria-hidden', 'true'); swatch.style.background = `linear-gradient(135deg, ${p.accent} 50%, ${p.second} 50%)`;
  const label = document.createElement('span'); label.className = 'palette-label'; label.textContent = p.name;
  b.append(swatch, label); b.addEventListener('click', () => commit(palettePatch(i))); $('palettes').append(b);
});
// Accessible category navigation keeps only the active tools in the tab order.
function activateTool(name, focus = false) {
  if (paintGesture) cancelPaint();
  if (['texts', 'elements'].includes(name) && boardTool !== 'select') setBoardTool('select', false);
  finishEdit();
  const changed = name !== activeTool;
  activeTool = name;
  document.querySelectorAll('.tool-tabs [data-tool]').forEach(tab => {
    const selected = tab.dataset.tool === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $(tab.getAttribute('aria-controls')).hidden = !selected;
    if (selected && focus) tab.focus();
  });
  if (changed) $('tool-content').scrollTop = 0;
}
const toolTabs = [...document.querySelectorAll('.tool-tabs [data-tool]')];
toolTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTool(tab.dataset.tool));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % toolTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + toolTabs.length) % toolTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = toolTabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    activateTool(toolTabs[next].dataset.tool, true);
  });
});
$('resolution').addEventListener('change', e => { if (!demandPlan(resolutionPlan(e.target.value))) { sync(); return; } commit({ resolution: e.target.value }); });
$('export-format').addEventListener('change', e => commit({ exportFormat: e.target.value }));
$('export-quality').addEventListener('input', e => liveEdit({ exportQuality: Number(e.target.value) }));
$('export-quality').addEventListener('change', finishEdit);
$('export-quality').addEventListener('blur', finishEdit);
$('grain').addEventListener('change', e => commit({ grain: e.target.checked }));
for (const id of ['accent', 'background', 'secondary', 'highlight', 'intensity', 'project-name']) {
  const key = id === 'project-name' ? 'name' : id;
  $(id).addEventListener('input', e => liveEdit({ [key]: id === 'intensity' ? Number(e.target.value) : e.target.value }));
  $(id).addEventListener('change', finishEdit);
  $(id).addEventListener('blur', finishEdit);
}
$('text-layer').addEventListener('change', e => { finishEdit(); setBoardTool('select', false); selectedId = e.target.value; selectionKind = 'text'; showSelection = true; sync(); });
$('add-text').addEventListener('click', () => {
  finishEdit(); if (state.texts.length >= MAX_TEXTS) return;
  const text = createText(crypto.randomUUID(), { color: state.highlight });
  selectedId = text.id; selectionKind = 'text'; showSelection = true;
  commit({ texts: [...state.texts, text] }); $('headline').focus(); $('headline').select();
});
$('duplicate-text').addEventListener('click', () => {
  finishEdit(); const source = currentText(); if (!source || state.texts.length >= MAX_TEXTS) return;
  const copy = { ...source, id: crypto.randomUUID(), x: Math.min(95, source.x + 3), y: Math.min(95, source.y + 5) };
  selectedId = copy.id; selectionKind = 'text'; showSelection = true; commit({ texts: [...state.texts, copy] });
});
$('remove-text').addEventListener('click', () => {
  const id = selectedId; commit({ texts: state.texts.filter(t => t.id !== id) });
});
$('remove-all-texts').addEventListener('click', () => { commit({ texts: [] }); toast('Todos os textos removidos. Você pode desfazer.'); });
$('show-text').addEventListener('change', e => patchText({ visible: e.target.checked }));
$('font').addEventListener('change', e => { showSelection = true; patchText({ font: e.target.value }); });
for (const [id, key, convert] of [['headline', 'text', String], ['text-color', 'color', String], ['text-size', 'size', Number], ['text-x', 'x', Number], ['text-y', 'y', Number], ['text-rotation', 'rotation', Number], ['text-opacity', 'opacity', Number]]) {
  $(id).addEventListener('input', e => { showSelection = true; liveText({ [key]: convert(e.target.value) }); });
  $(id).addEventListener('change', finishEdit);
  $(id).addEventListener('blur', finishEdit);
}
document.querySelectorAll('[data-align]').forEach(b => b.addEventListener('click', () => patchText({ align: b.dataset.align })));
document.querySelectorAll('[data-style]').forEach(b => b.addEventListener('click', () => patchText({ [b.dataset.style]: !currentText()?.[b.dataset.style] })));

function travel(undo) {
  if (paintGesture) { cancelPaint(); return; }
  if (drag) { cancelObjectDrag(); return; }
  finishEdit();
  const source = undo ? history : future, target = undo ? future : history;
  if (!source.length) return;
  target.push(state); state = source.pop(); revision++;
  $('save-status').textContent = 'RASCUNHO'; sync();
}
$('undo').addEventListener('click', () => travel(true));
$('redo').addEventListener('click', () => travel(false));
document.addEventListener('keydown', e => {
  if ($('plans-dialog').open) return;
  if (document.getElementById('page-editor')?.hidden) {
    // Native undo can otherwise reach the last focused, now-hidden text field.
    if ((e.ctrlKey || e.metaKey) && ['z', 'y'].includes(e.key.toLowerCase())) e.preventDefault();
    return;
  }
  if (e.key === 'Escape' && drag) { e.preventDefault(); cancelObjectDrag(); return; }
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); travel(!e.shiftKey); }
});
function point(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) / rect.width * (1080 * canvas.width / canvas.height), y: (event.clientY - rect.top) / rect.height * 1080 };
}
function canvasMetrics() {
  return { W: 1080 * canvas.width / canvas.height, H: 1080,
    viewScale: canvas.getBoundingClientRect().height / 1080 || canvas.height / 1080 };
}
function selectedShapeBox() {
  return showSelection && selectionKind === 'shape' ? layouts.find(box => box.kind === 'shape' && box.item.id === selectedShapeId) : undefined;
}
function handleAt(p, event) {
  const box = selectedShapeBox(); if (!box) return;
  const { W, H, viewScale } = canvasMetrics();
  return hitShapeHandle(shapeHandles(box, W, H, viewScale), p, viewScale, event.pointerType === 'touch');
}
canvas.addEventListener('pointerdown', e => {
  if (e.button !== 0 || !e.isPrimary) return;
  if (boardTool !== 'select') { startPaint(e); return; }
  finishEdit(); canvas.focus({ preventScroll: true }); const p = point(e);
  const handle = handleAt(p, e);
  const hit = b => {
    const dx = p.x - b.x, dy = p.y - b.y;
    const x = dx * Math.cos(b.angle) + dy * Math.sin(b.angle), y = -dx * Math.sin(b.angle) + dy * Math.cos(b.angle);
    return Math.abs(x) < b.width / 2 + 12 && Math.abs(y) < b.height / 2 + 12 && b.item.opacity > 0;
  };
  const box = handle ? selectedShapeBox() : layouts.find(b => b.kind === selectionKind && b.item.id === (selectionKind === 'text' ? selectedId : selectedShapeId) && hit(b)) || [...layouts].reverse().find(hit);
  if (!box) { showSelection = false; draw(); return; }
  selectionKind = box.kind;
  if (box.kind === 'text') selectedId = box.item.id; else selectedShapeId = box.item.id;
  showSelection = true; activateTool(box.kind === 'text' ? 'texts' : 'elements');
  const { W, H, viewScale } = canvasMetrics();
  drag = { before: state, start: p, x: box.x, y: box.y, box, kind: box.kind, id: box.item.id, pointerId: e.pointerId,
    transform: handle ? beginShapeTransform(box.item, box, p, handle, W, H, viewScale) : undefined };
  canvas.style.cursor = handle?.cursor || 'grabbing';
  canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging'); e.preventDefault(); sync();
});
function moveObject(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  const p = point(e), { W, H } = canvasMetrics();
  if (Math.hypot(p.x - drag.start.x, p.y - drag.start.y) < .001) return;
  const key = drag.kind === 'text' ? 'texts' : 'shapes';
  let patch;
  if (drag.transform) patch = transformShape(drag.transform, p, e.shiftKey);
  else {
    const min = drag.kind === 'shape' ? SHAPE_LIMITS.minPosition : 0, max = drag.kind === 'shape' ? SHAPE_LIMITS.maxPosition : 100;
    patch = { x: Math.min(max, Math.max(min, (drag.x + p.x - drag.start.x) / W * 100)),
      y: Math.min(max, Math.max(min, (drag.y + p.y - drag.start.y) / H * 100)) };
    if (drag.kind === 'shape') Object.assign(patch, { width: drag.box.width, height: drag.box.height, keepInside: false });
  }
  state = { ...state, [key]: state[key].map(item => item.id === drag.id ? { ...item, ...patch } : item) }; sync();
}
canvas.addEventListener('pointermove', e => {
  updateBrushCursor(e);
  if (paintGesture) { movePaint(e); return; }
  if (drag) { moveObject(e); return; }
  if (boardTool === 'select') canvas.style.cursor = handleAt(point(e), e)?.cursor || '';
});
function releaseObjectDrag() {
  const previous = drag; drag = undefined;
  canvas.classList.remove('dragging'); canvas.style.cursor = '';
  if (previous && canvas.hasPointerCapture(previous.pointerId)) canvas.releasePointerCapture(previous.pointerId);
  return previous;
}
function cancelObjectDrag() {
  const previous = releaseObjectDrag(); if (!previous) return;
  state = previous.before; sync();
}
function finishDrag(e) {
  if (paintGesture) { finishPaint(e); return; }
  if (!drag || e.pointerId !== drag.pointerId) return;
  moveObject(e);
  const previous = releaseObjectDrag(); remember(previous.before); sync();
}
canvas.addEventListener('pointerup', finishDrag);
canvas.addEventListener('pointercancel', e => {
  if (paintGesture && e.pointerId === paintGesture.pointerId) cancelPaint();
  else if (drag && e.pointerId === drag.pointerId) cancelObjectDrag();
});
canvas.addEventListener('lostpointercapture', e => {
  if (paintGesture && e.pointerId === paintGesture.pointerId) cancelPaint();
  else if (drag && e.pointerId === drag.pointerId) cancelObjectDrag();
});
canvas.addEventListener('pointerleave', () => { $('brush-cursor').hidden = true; });
$('shuffle').addEventListener('click', () => {
  const template = templates.filter(t => basicTemplates.includes(t.id) || canUse(membership.plan, 'premiumTemplates'))[Math.floor(Math.random() * templates.filter(t => basicTemplates.includes(t.id) || canUse(membership.plan, 'premiumTemplates')).length)];
  const palette = Math.floor(Math.random() * palettes.length);
  commit({ template: template.id, ...palettePatch(palette), intensity: 40 + Math.floor(Math.random() * 61) });
  toast('Uma nova composição. Seus textos foram preservados.');
});
$('save').addEventListener('click', () => {
  finishEdit();
  try { workspaces[state.mode].state = state;
    localStorage.setItem('wallultra-project', JSON.stringify({ app: 'wallultra-workspaces', version: 5, activeMode: state.mode, projects: { templates: workspaces.templates.state, blank: workspaces.blank.state } })); $('save-status').textContent = 'SALVO'; toast('Seus dois espaços de criação foram salvos neste navegador.'); }
  catch { toast('O armazenamento está cheio ou bloqueado. Use “Baixar projeto” para guardar sua criação em um arquivo.'); }
});
$('download').addEventListener('click', async () => {
  finishEdit();
  if (!await authorizeProject()) return;
  const button = $('download'); button.disabled = true; button.setAttribute('aria-busy', 'true');
  const exportState = clone(), exportRevision = revision;
  try {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const output = document.createElement('canvas');
    [output.width, output.height] = exportState.resolution.split('x').map(Number);
    await prepareImage(exportState.image);
    render(output, exportState); // Selection guides are preview-only.
    const blob = await new Promise(resolve => output.toBlob(resolve, 'image/' + exportState.exportFormat, exportState.exportQuality / 100));
    if (!blob) throw new Error('Export failed');
    const extension = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' })[blob.type] || 'png';
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url;
    a.download = (exportState.name.trim().replace(/[^\p{L}\p{N}_-]+/gu, '-') || 'wallultra') + '-' + exportState.resolution + '.' + extension;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast(`${extension.toUpperCase()} em ${exportState.resolution.replace('x', ' × ')} pronto!${exportRevision !== revision ? ' Exportada a versão do momento do clique.' : ''}`);
  } catch { toast('Não foi possível exportar. Tente uma resolução menor.'); }
  finally { button.disabled = false; button.removeAttribute('aria-busy'); }
});
function switchMode(mode) {
  if (mode === state.mode || assetBusy) return;
  setBoardTool('select', false);
  finishEdit();
  workspaces[state.mode] = { state, history, future };
  const workspace = workspaces[mode];
  state = workspace.state; history = workspace.history; future = workspace.future;
  selectedId = state.texts[0]?.id; selectedShapeId = state.shapes[0]?.id;
  selectionKind = 'text'; showSelection = false;
  activateTool(mode === 'blank' ? 'colors' : 'texts'); sync();
  $('save-status').textContent = 'RASCUNHO';
}
const modeTabs = [...document.querySelectorAll('[data-mode]')];
modeTabs.forEach((button, index) => {
  button.addEventListener('click', () => switchMode(button.dataset.mode));
  button.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
    switchMode(modeTabs[next].dataset.mode); modeTabs[next].focus();
  });
});
for (const mode of ['blank', 'templates']) $('hero-' + mode).addEventListener('click', () => {
  switchMode(mode); $('studio').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
});
$('blank-add-text').addEventListener('click', () => { activateTool('texts'); $('add-text').click(); });
$('blank-add-shape').addEventListener('click', () => activateTool('elements'));
$('clear-blank').addEventListener('click', () => {
  commit({ ...blankState(), resolution: state.resolution, name: state.name, exportFormat: state.exportFormat, exportQuality: state.exportQuality });
  toast('Tela limpa. Use Desfazer para recuperar sua composição.');
});
function patchShape(patch, live = false) {
  if (!currentShape()) return;
  selectionKind = 'shape'; showSelection = true;
  const update = { shapes: state.shapes.map(shape => shape.id === selectedShapeId ? { ...shape, ...patch } : shape) };
  if (live) liveEdit(update); else commit(update);
}
function addShape(type) {
  setBoardTool('select', false);
  finishEdit(); if (state.shapes.length >= MAX_SHAPES) return;
  if (!basicShapes.includes(type) && !demand('advancedShapes')) return;
  const shape = createShape(crypto.randomUUID(), type, { color: state.accent });
  selectedShapeId = shape.id; selectionKind = 'shape'; showSelection = true;
  commit({ shapes: [...state.shapes, shape] }); activateTool('elements');
}
shapeTypes.forEach(type => {
  $('shape-type').add(new Option(type.name, type.id));
  const button = document.createElement('button'); button.dataset.addShape = type.id;
  const symbol = document.createElement('canvas'); symbol.width = 100; symbol.height = 64; symbol.setAttribute('aria-hidden', 'true');
  const ctx = symbol.getContext('2d'); ctx.translate(50, 32); ctx.fillStyle = '#a979ed'; ctx.strokeStyle = '#a979ed'; ctx.lineWidth = 4;
  shapePath(ctx, type.id, 48, 42); if (type.id !== 'line') ctx.fill(); else ctx.stroke();
  const label = document.createElement('span'); label.textContent = type.name;
  button.dataset.shapeName = type.name;
  if (!basicShapes.includes(type.id)) { button.dataset.feature = 'advancedShapes'; button.title = type.name + ' · wallMedium'; label.textContent += ' · Medium'; }
  button.append(symbol, label); button.addEventListener('click', () => addShape(type.id)); $('shape-library').append(button);
});
$('shape-layer').addEventListener('change', event => { finishEdit(); setBoardTool('select', false); selectedShapeId = event.target.value; selectionKind = 'shape'; showSelection = true; sync(); });
$('shape-center').addEventListener('click', () => patchShape({ x: 50, y: 50 }));
$('shape-type').addEventListener('change', event => { if (!basicShapes.includes(event.target.value) && !demand('advancedShapes')) { sync(); return; } patchShape({ type: event.target.value }); });
$('duplicate-shape').addEventListener('click', () => {
  finishEdit(); const source = currentShape(); if (!source || state.shapes.length >= MAX_SHAPES) return;
  const shape = { ...source, id: crypto.randomUUID(), x: Math.min(95, source.x + 4), y: Math.min(95, source.y + 4) };
  selectedShapeId = shape.id; selectionKind = 'shape'; showSelection = true; commit({ shapes: [...state.shapes, shape] });
});
$('remove-shape').addEventListener('click', () => commit({ shapes: state.shapes.filter(shape => shape.id !== selectedShapeId) }));
for (const key of ['visible', 'shadow', 'fill', 'keepInside']) $('shape-' + key).addEventListener('change', event => patchShape({ [key]: event.target.checked }));
for (const key of ['color', 'strokeColor', 'strokeWidth', 'width', 'height', 'x', 'y', 'rotation', 'opacity']) {
  const element = $('shape-' + key);
  element.addEventListener('input', event => patchShape({ [key]: ['color', 'strokeColor'].includes(key) ? event.target.value : Number(event.target.value) }, true));
  element.addEventListener('change', finishEdit); element.addEventListener('blur', finishEdit);
}
for (const [prefix, collection, id] of [['shape', 'shapes', () => selectedShapeId], ['text', 'texts', () => selectedId]]) {
  for (const [direction, increment] of [['back', -1], ['front', 1]]) $(prefix + '-' + direction).addEventListener('click', () => commit({ [collection]: moveLayer(state[collection], id(), increment) }));
}
$('text-lineHeight').addEventListener('input', event => liveText({ lineHeight: Number(event.target.value) }));
$('text-lineHeight').addEventListener('change', finishEdit); $('text-lineHeight').addEventListener('blur', finishEdit);
for (const [id, key] of [['background-mode', 'backgroundMode'], ['pattern', 'pattern']]) $(id).addEventListener('change', event => commit({ [key]: event.target.value }));
const globalRanges = [['gradient-angle', 'gradientAngle', '°'], ['grain-amount', 'grainAmount', '%'], ['pattern-opacity', 'patternOpacity', '%'], ['vignette', 'vignette', '%'], ['frame-width', 'frameWidth', ' px']];
for (const [id, key] of [...globalRanges, ['frame-color', 'frameColor']]) {
  $(id).addEventListener('input', event => liveEdit({ [key]: id === 'frame-color' ? event.target.value : Number(event.target.value) }));
  $(id).addEventListener('change', finishEdit); $(id).addEventListener('blur', finishEdit);
}
function syncExtended() {
  syncDrawingUI();
  const blank = state.mode === 'blank';
  modeTabs.forEach(tab => {
    const selected = tab.dataset.mode === state.mode;
    tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; tab.disabled = assetBusy;
  });
  $('editor-content').setAttribute('aria-labelledby', 'mode-' + state.mode);
  $('template-library').hidden = blank; $('blank-library').hidden = !blank;
  $('shuffle').hidden = blank; $('clear-blank').hidden = !blank;
  $('intensity').closest('.range-field').hidden = blank;
  setValue('background-mode', state.backgroundMode);
  $('background-mode').querySelector('[value="auto"]').disabled = blank;
  $('gradient-angle-control').hidden = state.backgroundMode !== 'linear';
  setValue('pattern', state.pattern); setValue('frame-color', state.frameColor);
  for (const [id, key, suffix] of globalRanges) { setValue(id, state[key]); $(id + '-value').textContent = state[key] + suffix; }
  $('grain-amount').closest('.range-field').hidden = !state.grain;
  $('pattern-opacity').closest('.range-field').hidden = state.pattern === 'none';
  if (!currentShape()) selectedShapeId = state.shapes[0]?.id;
  const shape = currentShape(), select = $('shape-layer');
  const labels = state.shapes.map((item, index) => `${index + 1}. ${shapeTypes.find(type => type.id === item.type).name}${item.visible ? '' : ' (oculta)'}`);
  if (select.options.length !== state.shapes.length || state.shapes.some((item, index) => select.options[index]?.value !== item.id)) select.replaceChildren(...state.shapes.map((item, index) => new Option(labels[index], item.id)));
  else labels.forEach((label, index) => { select.options[index].text = label; });
  setValue('shape-layer', selectedShapeId || ''); select.disabled = !shape;
  $('shape-count').textContent = `${state.shapes.length} de ${MAX_SHAPES}`;
  $('shape-controls').hidden = !shape; $('shape-controls').disabled = !shape;
  $('empty-shapes').hidden = !!shape;
  document.querySelectorAll('[data-add-shape]').forEach(button => { button.disabled = state.shapes.length >= MAX_SHAPES; });
  $('duplicate-shape').disabled = !shape || state.shapes.length >= MAX_SHAPES;
  if (shape) {
    for (const key of ['type', 'color', 'strokeColor', 'strokeWidth', 'width', 'height', 'x', 'y', 'rotation', 'opacity']) setValue('shape-' + key, shape[key]);
    for (const key of ['visible', 'shadow', 'fill', 'keepInside']) $('shape-' + key).checked = shape[key];
    for (const [key, suffix] of [['strokeWidth', ' px'], ['width', ' px'], ['height', ' px'], ['x', '%'], ['y', '%'], ['rotation', '°'], ['opacity', '%']]) $('shape-' + key + '-value').textContent = (key === 'strokeWidth' ? Number(shape[key].toFixed(1)) : Math.round(shape[key])) + suffix;
  }
  for (const [prefix, collection, id] of [['shape', 'shapes', selectedShapeId], ['text', 'texts', selectedId]]) {
    const index = state[collection].findIndex(item => item.id === id);
    $(prefix + '-back').disabled = index <= 0; $(prefix + '-front').disabled = index < 0 || index === state[collection].length - 1;
  }
  $('choose-image').disabled = assetBusy; $('import-project').disabled = assetBusy;
  $('image-file').disabled = assetBusy; $('project-file').disabled = assetBusy;
  $('image-controls').hidden = !state.image; $('image-controls').disabled = !state.image;
  $('image-status').textContent = assetBusy ? 'Preparando seu arquivo…' : state.image ? state.image.name : 'Nenhuma imagem adicionada.';
  if (state.image) {
    for (const key of ['fit', 'zoom', 'opacity', 'x', 'y']) setValue('image-' + key, state.image[key]);
    for (const key of ['zoom', 'opacity', 'x', 'y']) $('image-' + key + '-value').textContent = state.image[key] + '%';
  }
}
$('choose-image').addEventListener('click', () => { if (!assetBusy) $('image-file').click(); });
$('image-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file || assetBusy) return;
  const mode = state.mode; assetBusy = true; sync();
  try {
    const image = await normalizeImageFile(file); await prepareImage(image);
    if (state.mode !== mode) throw new Error('Volte ao projeto original para adicionar a imagem.');
    commit({ image }); toast('Sua imagem está na composição. Ajuste o enquadramento abaixo.');
  } catch (error) { toast(error.message); }
  finally { assetBusy = false; event.target.value = ''; sync(); }
});
function patchImage(patch, live = false) {
  if (!state.image) return;
  const update = { image: { ...state.image, ...patch } };
  live ? liveEdit(update) : commit(update);
}
$('image-fit').addEventListener('change', event => patchImage({ fit: event.target.value }));
for (const key of ['zoom', 'opacity', 'x', 'y']) {
  $('image-' + key).addEventListener('input', event => patchImage({ [key]: Number(event.target.value) }, true));
  $('image-' + key).addEventListener('change', finishEdit); $('image-' + key).addEventListener('blur', finishEdit);
}
$('remove-image').addEventListener('click', () => commit({ image: null }));
function downloadFile(blob, name) {
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = name;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
$('export-project').addEventListener('click', () => {
  finishEdit(); const name = state.name.trim().replace(/[^\p{L}\p{N}_-]+/gu, '-') || 'wallultra';
  downloadFile(new Blob([serializeProject(state)], { type: 'application/json' }), name + '.wallultra.json');
  toast('Projeto baixado. Use “Abrir projeto” para continuar em outro navegador.');
});
$('import-project').addEventListener('click', () => { if (!assetBusy) $('project-file').click(); });
$('project-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file || assetBusy) return;
  assetBusy = true; sync();
  try {
    if (file.size > 32 * 1024 * 1024) throw new Error('O projeto deve ter no máximo 32 MB.');
    const project = parseProject(await file.text()); await prepareImage(project.image);
    assetBusy = false; switchMode(project.mode); commit(project); toast('Projeto aberto. Você pode desfazer a importação.');
  } catch (error) { toast(error.message); }
  finally { assetBusy = false; event.target.value = ''; sync(); }
});

const toolNames = { select: 'Selecionar', pencil: 'Lápis', pen: 'Caneta', brush: 'Pincel', marker: 'Marcador', eraser: 'Borracha', shape: 'Desenhar forma' };
const inkColors = [
  ['#ffffff', 'Branco'], ['#171321', 'Preto'], ['#ad7bff', 'Violeta'], ['#7138df', 'Roxo'],
  ['#ff68ae', 'Rosa'], ['#ff3c53', 'Vermelho'], ['#ff8b42', 'Laranja'], ['#ffdb52', 'Amarelo'],
  ['#c2ff6d', 'Lima'], ['#22c783', 'Verde'], ['#28dcd0', 'Turquesa'], ['#49bbff', 'Azul claro'],
  ['#3968ee', 'Azul'], ['#8856bd', 'Ameixa'], ['#c78c68', 'Terracota'], ['#97a3b6', 'Cinza']
];
function currentBrush() { return brushSettings[boardTool] || brushSettings[lastInkTool]; }
function setBoardTool(tool, openPanel = true) {
  if (paintGesture) cancelPaint();
  if (drag) cancelObjectDrag();
  canvas.style.cursor = '';
  if (!(tool === 'select' || tool in brushSettings)) return;
  boardTool = tool;
  if (['pencil', 'pen', 'brush', 'marker'].includes(tool)) lastInkTool = tool;
  if (openPanel) activateTool('drawing');
  if (tool !== 'select') showSelection = false;
  $('brush-cursor').hidden = true;
  syncDrawingUI(); draw();
}
function syncDrawingUI() {
  const settings = currentBrush(), erasing = boardTool === 'eraser', shaping = boardTool === 'shape', selecting = boardTool === 'select';
  canvas.dataset.boardTool = boardTool;
  for (const button of document.querySelectorAll('[data-brush]')) button.setAttribute('aria-pressed', String(button.dataset.brush === boardTool));
  for (const [id, active] of [['board-select', selecting], ['board-draw', !selecting && !erasing], ['board-eraser', erasing]]) {
    $(id).classList.toggle('active', active); $(id).setAttribute('aria-pressed', String(active));
  }
  $('selection-hint').textContent = selecting ? 'Arraste textos e formas para posicionar' : erasing ? 'Apaga apenas os traços livres' : shaping ? 'Arraste para definir o tamanho' : 'Desenhe com mouse, toque ou caneta';
  $('board-status').textContent = selecting ? (selectionKind === 'shape' && showSelection ? 'Arraste a forma para mover ou recortar nas bordas. Alças brancas: tamanho. Círculo amarelo: contorno. Shift mantém a proporção.' : 'Selecione e arraste textos ou formas. Desenho livre: use a aba Desenho.') : shaping ? 'Arraste para criar uma forma. Shift mantém largura e altura iguais. Esc cancela.' : `${toolNames[boardTool]} ativo · desenhe na tela. Esc cancela o gesto; Ctrl/Cmd + Z desfaz.`;
  $('drawing-instructions').textContent = selecting ? 'Modo de seleção ativo. Escolha um material abaixo para desenhar, ou arraste textos e formas na prévia.' : erasing ? 'Passe a borracha sobre os traços livres. O fundo, as imagens, as formas e os textos serão preservados.' : shaping ? 'Clique ou arraste na prévia para desenhar a forma escolhida. Volte a Selecionar para movê-la depois.' : `${toolNames[boardTool]} ativo. Desenhe diretamente na prévia; cor, espessura e opacidade são lembradas para cada material durante a sessão.`;
  $('brush-controls').disabled = selecting;
  $('shape-draw-options').hidden = !shaping;
  $('ink-colors').hidden = erasing;
  $('pressure-control').hidden = !['pencil', 'brush'].includes(boardTool);
  setValue('draw-shape-type', brushSettings.shape.type); $('draw-shape-fill').checked = brushSettings.shape.fill;
  $('draw-shape-fill').disabled = brushSettings.shape.type === 'line';
  setValue('draw-color', settings.color); setValue('draw-hex', settings.color.toUpperCase());
  $('draw-color-error').hidden = true; $('draw-hex').setAttribute('aria-invalid', 'false');
  setValue('draw-size', settings.size); setValue('draw-opacity', settings.opacity); $('draw-pressure').checked = settings.pressure;
  $('draw-size-value').textContent = settings.size + ' px'; $('draw-opacity-value').textContent = settings.opacity + '%';
  $('draw-size-label').textContent = erasing ? 'Tamanho da borracha' : shaping ? 'Espessura do contorno' : 'Espessura do traço';
  $('draw-opacity-label').textContent = erasing ? 'Força da borracha' : shaping ? 'Opacidade da forma' : 'Opacidade da tinta';
  document.querySelectorAll('[data-ink-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.inkColor === settings.color.toLowerCase())));
  $('remove-last-stroke').disabled = !state.strokes.length; $('clear-drawing').disabled = !state.strokes.length;
  $('stroke-count').textContent = state.strokes.length ? `${state.strokes.length} gesto(s) no desenho. Os traços e as passadas da borracha são salvos com o projeto.` : 'Nenhum traço ainda. Sua próxima ideia começa com um gesto.';
}
function queuePaint() {
  if (paintFrame) return;
  paintFrame = requestAnimationFrame(() => { paintFrame = 0; draw(); });
}
function updateBrushCursor(event) {
  const cursor = $('brush-cursor'), rect = canvas.getBoundingClientRect();
  if (['select', 'shape'].includes(boardTool) || event.pointerType === 'touch' || event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) { cursor.hidden = true; return; }
  const size = Math.max(5, currentBrush().size * rect.height / 1080);
  cursor.hidden = false; cursor.dataset.material = boardTool;
  cursor.style.width = cursor.style.height = size + 'px';
  cursor.style.left = event.clientX - rect.left + 'px'; cursor.style.top = event.clientY - rect.top + 'px';
}
function strokePoint(event) {
  const p = point(event), W = 1080 * canvas.width / canvas.height;
  const pressure = event.pointerType === 'pen' ? (event.pressure > 0 ? event.pressure : paintGesture?.stroke?.points.at(-1)?.[2] || .5) : 1;
  return drawingPoint(p.x, p.y, W, pressure);
}
function startPaint(event) {
  finishEdit();
  if (paintGesture) return;
  const total = state.strokes.reduce((count, stroke) => count + stroke.points.length, 0);
  if (boardTool === 'shape' && state.shapes.length >= MAX_SHAPES) { toast(`O projeto já tem ${MAX_SHAPES} formas. Exclua uma para continuar.`); return; }
  if (boardTool !== 'shape' && (state.strokes.length >= MAX_STROKES || total >= MAX_DRAWING_POINTS)) { toast('Este desenho ficou muito grande. Baixe uma cópia do projeto e remova alguns traços para continuar.'); return; }
  if (boardTool === 'eraser' && !state.strokes.length) { toast('Ainda não há traços livres para apagar.'); return; }
  canvas.focus({ preventScroll: true }); showSelection = false;
  paintGesture = { pointerId: event.pointerId, tool: boardTool, start: point(event), settings: { ...currentBrush() }, limit: Math.min(MAX_STROKE_POINTS, MAX_DRAWING_POINTS - total) };
  if (boardTool !== 'shape') paintGesture.stroke = { tool: boardTool, ...paintGesture.settings, points: [strokePoint(event)] };
  canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-painting'); event.preventDefault();
  updateBrushCursor(event); queuePaint();
}
function shapeFromGesture(event, click = false) {
  const W = 1080 * canvas.width / canvas.height, start = paintGesture.start, end = point(event), settings = paintGesture.settings;
  end.x = Math.max(0, Math.min(W, end.x)); end.y = Math.max(0, Math.min(1080, end.y));
  let dx = end.x - start.x, dy = end.y - start.y;
  if (event.shiftKey && !click) {
    const side = Math.min(Math.max(Math.abs(dx), Math.abs(dy)), dx < 0 ? start.x : W - start.x, dy < 0 ? start.y : 1080 - start.y);
    dx = (dx < 0 ? -1 : 1) * side; dy = (dy < 0 ? -1 : 1) * side;
  }
  return createShape('draft', settings.type, { x: (click ? start.x : start.x + dx / 2) / W * 100, y: (click ? start.y : start.y + dy / 2) / 1080 * 100,
    width: click ? 200 : Math.max(1, Math.abs(dx)), height: click ? 200 : Math.max(1, Math.abs(dy)),
    color: settings.color, strokeColor: settings.color, strokeWidth: settings.size, fill: settings.fill,
    opacity: settings.opacity, keepInside: false, flipX: settings.type === 'line' && dx < 0, flipY: settings.type === 'line' && dy < 0 });
}
function movePaint(event) {
  if (!paintGesture || event.pointerId !== paintGesture.pointerId) return;
  if (paintGesture.tool === 'shape') paintGesture.shape = shapeFromGesture(event);
  else {
    const events = event.getCoalescedEvents?.();
    for (const sample of events?.length ? events : [event]) {
      const next = strokePoint(sample), points = paintGesture.stroke.points, last = points.at(-1);
      if (Math.hypot(next[0] - last[0], next[1] - last[1]) < .0008) continue;
      if (points.length >= paintGesture.limit) { paintGesture.clipped = true; break; }
      points.push(next);
    }
  }
  queuePaint();
}
function releasePaint() {
  const gesture = paintGesture; paintGesture = undefined;
  if (paintFrame) cancelAnimationFrame(paintFrame); paintFrame = 0;
  canvas.classList.remove('is-painting');
  if (gesture && canvas.hasPointerCapture(gesture.pointerId)) canvas.releasePointerCapture(gesture.pointerId);
  return gesture;
}
function cancelPaint() { releasePaint(); $('brush-cursor').hidden = true; draw(); }
function finishPaint(event) {
  if (!paintGesture || event.pointerId !== paintGesture.pointerId) return;
  movePaint(event);
  if (paintGesture.tool === 'shape') {
    const end = point(event), click = Math.hypot(end.x - paintGesture.start.x, end.y - paintGesture.start.y) < 3;
    paintGesture.shape = shapeFromGesture(event, click);
  }
  const gesture = releasePaint();
  if (gesture.tool === 'shape') {
    const shape = { ...gesture.shape, id: crypto.randomUUID() }; selectedShapeId = shape.id; selectionKind = 'shape';
    commit({ shapes: [...state.shapes, shape] });
  } else {
    const stroke = { ...gesture.stroke, points: gesture.stroke.points.map(p => [...p]) };
    commit({ strokes: [...state.strokes, stroke] });
    if (gesture.clipped) toast('Este traço ficou longo. Continue com um novo gesto; o desenho anterior foi preservado.');
  }
}
for (const button of document.querySelectorAll('[data-brush]')) button.addEventListener('click', () => setBoardTool(button.dataset.brush));
function toggleExpandedEditor() {
  if (!expandedEditor) previousScroll = window.scrollY;
  expandedEditor = !expandedEditor;
  document.body.classList.toggle('editor-expanded', expandedEditor);
  $('studio').classList.toggle('is-expanded', expandedEditor);
  $('board-expand').setAttribute('aria-pressed', String(expandedEditor));
  $('board-expand').textContent = expandedEditor ? 'Voltar ao site' : 'Ampliar editor';
  window.scrollTo(0, expandedEditor ? 0 : previousScroll);
}
$('board-expand').addEventListener('click', toggleExpandedEditor);
$('board-select').addEventListener('click', () => setBoardTool('select', false));
$('board-draw').addEventListener('click', () => setBoardTool(lastInkTool));
$('board-eraser').addEventListener('click', () => setBoardTool('eraser'));
$('blank-draw').addEventListener('click', () => setBoardTool(lastInkTool));
$('draw-shape-type').replaceChildren(...shapeTypes.map(type => new Option(type.name, type.id)));
$('draw-shape-type').addEventListener('change', event => { if (!basicShapes.includes(event.target.value) && !demand('advancedShapes')) { syncDrawingUI(); return; } brushSettings.shape.type = event.target.value; syncDrawingUI(); });
$('draw-shape-fill').addEventListener('change', event => { brushSettings.shape.fill = event.target.checked; });
$('draw-size').addEventListener('input', event => { currentBrush().size = Number(event.target.value); syncDrawingUI(); });
$('draw-opacity').addEventListener('input', event => { currentBrush().opacity = Number(event.target.value); syncDrawingUI(); });
$('draw-pressure').addEventListener('change', event => { currentBrush().pressure = event.target.checked; });
function setInkColor(color) { currentBrush().color = color.toLowerCase(); syncDrawingUI(); }
$('draw-color').addEventListener('input', event => setInkColor(event.target.value));
$('draw-hex').addEventListener('change', event => {
  if (/^#[a-f\d]{6}$/i.test(event.target.value)) setInkColor(event.target.value);
  else { $('draw-color-error').hidden = false; event.target.setAttribute('aria-invalid', 'true'); }
});
inkColors.forEach(([color, name]) => {
  const button = document.createElement('button'); button.dataset.inkColor = color; button.style.background = color;
  button.title = name; button.setAttribute('aria-label', `Tinta ${name}`); button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => setInkColor(color)); $('ink-swatches').append(button);
});
$('clear-drawing').addEventListener('click', () => { commit({ strokes: [] }); toast('Desenho limpo. Use Desfazer para recuperar os traços.'); });
$('remove-last-stroke').addEventListener('click', () => commit({ strokes: state.strokes.slice(0, -1) }));
$('shape-search').addEventListener('input', event => {
  const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const query = normalize(event.target.value.trim()); let matches = 0;
  document.querySelectorAll('[data-add-shape]').forEach(button => { button.hidden = !normalize(button.dataset.shapeName).includes(query); if (!button.hidden) matches++; });
  $('shape-search-empty').hidden = !!matches;
});
document.addEventListener('keydown', event => {
  if ($('plans-dialog').open) return;
  if (document.getElementById('page-editor')?.hidden) return;
  if (event.key === 'Escape' && paintGesture) { event.preventDefault(); cancelPaint(); return; }
  if (event.key === 'Escape' && expandedEditor) { event.preventDefault(); toggleExpandedEditor(); return; }
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
  const tool = { v: 'select', p: 'pencil', l: 'pen', b: 'brush', m: 'marker', e: 'eraser', f: 'shape' }[event.key.toLowerCase()];
  if (tool) { event.preventDefault(); setBoardTool(tool); }
});

for (const workspace of Object.values(workspaces)) {
  if (workspace.state.image) {
    try { await prepareImage(workspace.state.image); }
    catch { workspace.state.image = null; restored = false; toast('Uma imagem salva não pôde ser lida. O restante do projeto foi recuperado.'); }
  }
}
sync();
if (restored) $('save-status').textContent = 'SALVO';

// Membership is obtained from an HttpOnly server session, never from a project or localStorage.
function showPlans(message = 'Comece livre. Amplie suas possibilidades quando quiser.') {
  $('plan-reason').textContent = message;
  if (!$('plans-dialog').open) $('plans-dialog').showModal();
}
function demandPlan(required) {
  if (hasPlan(membership.plan, required)) return true;
  showPlans(`Este recurso faz parte do ${plans[required].name}. Seu acesso atual é ${plans[membership.plan].name}.`);
  return false;
}
function demand(feature) { return demandPlan(featurePlans[feature]); }
function syncPlanUI() {
  $('membership-label').textContent = plans[membership.plan].name;
  $('reset-plan').hidden = membership.plan === 'basic';
  document.querySelectorAll('[data-plan]').forEach(card => {
    card.classList.toggle('current-plan', card.dataset.plan === membership.plan);
    card.setAttribute('aria-label', `${plans[card.dataset.plan].name}${card.dataset.plan === membership.plan ? ' — seu plano atual' : ''}`);
  });
  document.querySelectorAll('[data-feature]').forEach(element => {
    const locked = !canUse(membership.plan, element.dataset.feature);
    element.classList.toggle('plan-locked', locked);
    element.setAttribute('aria-disabled', String(locked));
    if (locked) element.title = `Disponível no ${plans[featurePlans[element.dataset.feature]].name}`;
    else element.removeAttribute('title');
  });
  for (const selectId of ['resolution', 'shape-type', 'draw-shape-type']) {
    for (const option of $(selectId).options) {
      const required = selectId === 'resolution' ? resolutionPlan(option.value) : basicShapes.includes(option.value) ? 'basic' : 'medium';
      option.dataset.originalLabel ||= option.textContent;
      option.textContent = option.dataset.originalLabel + (hasPlan(membership.plan, required) ? '' : ` · ${plans[required].name}`);
    }
  }
  const needed = requiredPlan(state);
  $('plan-project-notice').textContent = hasPlan(membership.plan, needed) ? `${plans[membership.plan].name} · exportação disponível` : `Esta criação usa recursos ${plans[needed].name}. Você pode continuar editando e guardar o projeto; a exportação da imagem exige esse plano.`;
  $('adapt-plan').hidden = hasPlan(membership.plan, needed);
  $('gradient3').checked = !!state.gradient3;
  for (const key of ['saturation', 'contrast']) {
    $('image-' + key).value = state.image?.[key] ?? 100;
    $('image-' + key + '-value').textContent = (state.image?.[key] ?? 100) + '%';
  }
  $('image-blend').value = state.image?.blend || 'source-over';
}
async function refreshMembership() {
  try {
    const response = await fetch('/api/membership', { cache: 'no-store' });
    if (!response.ok) throw new Error();
    const data = await response.json();
    membership = { plan: plans[data.plan] ? data.plan : 'basic', activationAvailable: data.activationAvailable === true };
    $('activation-status').textContent = membership.activationAvailable ? 'Use apenas o código fornecido pelo responsável pela plataforma.' : 'Ativação manual ainda não configurada. O wallBasic está disponível gratuitamente.';
  } catch { membership = { plan: 'basic', activationAvailable: false }; $('activation-status').textContent = 'Não foi possível verificar o acesso. Usando wallBasic até reconectar ao servidor.'; }
  syncPlanUI(); renderLocalLibrary();
}
async function accessRequest(body) {
  const response = await fetch('/api/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) { await refreshMembership(); return false; }
  return (await response.json()).allowed === true;
}
async function authorizeProject(project = state) {
  if (!demandPlan(requiredPlan(project))) return false;
  try {
    // Only capability metadata goes to the server; images and text content remain local.
    const metadata = { resolution: project.resolution, template: project.template, mode: project.mode, gradient3: project.gradient3,
      shapes: project.shapes.map(x => ({ type: x.type })), texts: project.texts.map(x => ({ shadow: x.shadow, outline: x.outline })),
      image: project.image ? { saturation: project.image.saturation, contrast: project.image.contrast, blend: project.image.blend } : null };
    if (await accessRequest({ project: metadata })) return true;
    showPlans('Seu acesso mudou. Verifique o plano antes de exportar esta criação.');
  } catch { toast('Não foi possível verificar seu plano. Reconecte ao servidor e tente novamente.'); }
  return false;
}
$('open-plans').addEventListener('click', () => showPlans());
$('close-plans').addEventListener('click', () => $('plans-dialog').close());
$('activate-plan').addEventListener('submit', async event => {
  event.preventDefault(); $('activate-plan-button').disabled = true;
  try {
    const response = await fetch('/api/membership/activate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: $('plan-code').value.trim() }) });
    const result = await response.json(); if (!response.ok) throw new Error(result.error);
    $('plan-code').value = ''; await refreshMembership(); sync();
    $('activation-status').textContent = `${plans[membership.plan].name} ativado por 7 dias neste navegador. Nenhuma cobrança foi feita.`;
  } catch (error) { $('activation-status').textContent = error.message || 'Não foi possível ativar o acesso.'; }
  finally { $('activate-plan-button').disabled = false; }
});
$('reset-plan').addEventListener('click', async () => {
  try { const response = await fetch('/api/membership', { method: 'DELETE' }); if (!response.ok) throw new Error(); await refreshMembership(); sync(); toast('Acesso encerrado. Seus projetos foram preservados.'); }
  catch { $('activation-status').textContent = 'Não foi possível encerrar o acesso. Tente novamente.'; }
});
// Capture before editor handlers so mouse, keyboard and range inputs share the policy.
for (const type of ['click', 'input', 'change', 'pointerdown', 'keydown']) document.addEventListener(type, event => {
  const element = event.target.closest('[data-feature]');
  if (!element || canUse(membership.plan, element.dataset.feature)) return;
  if (type === 'keydown' && ['Tab', 'Escape'].includes(event.key)) return;
  event.preventDefault(); event.stopImmediatePropagation();
  if (['click', 'keydown', 'pointerdown'].includes(type)) demand(element.dataset.feature);
  syncPlanUI();
}, true);
$('gradient3').addEventListener('change', event => commit({ gradient3: event.target.checked }));
for (const key of ['saturation', 'contrast']) {
  $('image-' + key).addEventListener('input', event => { if (!state.image) return toast('Adicione uma imagem primeiro.'); patchImage({ [key]: Number(event.target.value) }, true); });
  $('image-' + key).addEventListener('change', finishEdit);
}
$('image-blend').addEventListener('change', event => { if (!state.image) { syncPlanUI(); return toast('Adicione uma imagem primeiro.'); } patchImage({ blend: event.target.value }); });
$('extract-palette').addEventListener('click', async () => {
  if (!state.image) return toast('Adicione uma imagem primeiro.');
  const src = state.image.src;
  try {
    const image = new Image(); image.src = src; await image.decode();
    if (src !== state.image?.src) return;
    const sample = document.createElement('canvas'); sample.width = sample.height = 48;
    const ctx = sample.getContext('2d'); ctx.drawImage(image, 0, 0, 48, 48);
    const pixels = ctx.getImageData(0, 0, 48, 48).data, buckets = new Map();
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) continue;
      const rgb = [pixels[i], pixels[i+1], pixels[i+2]].map(x => Math.min(255, Math.round(x/32)*32));
      const hex = '#' + rgb.map(x => x.toString(16).padStart(2,'0')).join(''); buckets.set(hex, (buckets.get(hex) || 0) + 1);
    }
    const colors = [...buckets].sort((a,b) => b[1]-a[1]).slice(0,4).map(x => x[0]);
    if (!colors.length) return toast('A imagem está transparente. Escolha outra imagem para extrair cores.');
    commit({ background: colors[0], accent: colors[1] || colors[0], secondary: colors[2] || colors[0], highlight: colors[3] || '#ffffff' });
    toast('Cores mais frequentes aplicadas à paleta da arte.');
  } catch { toast('Não foi possível extrair as cores desta imagem.'); }
});
const paletteKeys = ['background', 'accent', 'secondary', 'highlight'];
const styleKeys = [...paletteKeys, 'backgroundMode', 'gradientAngle', 'gradient3', 'pattern', 'patternOpacity', 'grain', 'grainAmount', 'frameColor', 'frameWidth', 'vignette'];
function readLocal(key) { try { const data = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(data) ? data : []; } catch { return []; } }
function writeLocal(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); renderLocalLibrary(); return true; } catch { toast('Armazenamento cheio ou bloqueado. Baixe seu projeto para não perder a criação.'); return false; } }
function renderLocalLibrary() {
  for (const [containerId, key, feature] of [['saved-palettes','wallultra-palettes','savedPalettes'], ['saved-styles','wallultra-styles','stylePresets'], ['project-shelf','wallultra-shelf',null]]) {
    const list = $(containerId); list.replaceChildren();
    const items = readLocal(key).slice(0,100);
    items.forEach((item, index) => {
      if (!item || typeof item !== 'object') return;
      const row = document.createElement('div'), use = document.createElement('button'), remove = document.createElement('button'); row.className = 'saved-row'; use.className = remove.className = 'button';
      use.textContent = item.name || `Item ${index+1}`; if (feature) use.dataset.feature = feature;
      remove.textContent = '×'; remove.setAttribute('aria-label', `Excluir ${use.textContent}`);
      use.addEventListener('click', async () => {
        try {
          if (feature && !demand(feature)) return;
          if (key === 'wallultra-shelf') { const project = parseProject(JSON.stringify({ app:'wallultra', schema:5, project:item.project })); await prepareImage(project.image); switchMode(project.mode); commit(project); }
          else { const keys = key === 'wallultra-palettes' ? paletteKeys : styleKeys; const valid = parseProject(JSON.stringify({ app:'wallultra', schema:5, project:{ ...clone(), ...item.patch } })); commit(Object.fromEntries(keys.map(k => [k,valid[k]]))); }
        } catch { toast('Não foi possível abrir este item.'); }
      });
      remove.addEventListener('click', () => writeLocal(key, items.filter((_, i) => i !== index))); row.append(use,remove); list.append(row);
    });
  }
  const limit = { basic:3, medium:25, high:100 }[membership.plan];
  $('shelf-count').textContent = `${readLocal('wallultra-shelf').length} de ${limit} projetos. Os dois rascunhos do editor continuam disponíveis separadamente.`;
  syncPlanUI();
}
for (const [id,key,keys,feature] of [['save-palette','wallultra-palettes',paletteKeys,'savedPalettes'], ['save-style','wallultra-styles',styleKeys,'stylePresets']]) $(id).addEventListener('click', () => {
  if (!demand(feature)) return;
  const items = readLocal(key); if (items.length >= 20) return toast('Limite de 20 favoritos. Exclua um item para guardar outro.');
  writeLocal(key, [...items, { name: `${state.name || 'Minha criação'} · ${items.length+1}`, patch: Object.fromEntries(keys.map(k => [k,state[k]])) }]);
});
$('save-to-shelf').addEventListener('click', () => {
  finishEdit(); const items = readLocal('wallultra-shelf'), limit = { basic:3, medium:25, high:100 }[membership.plan];
  if (items.length >= limit) return showPlans(`Sua biblioteca atingiu ${limit} projetos. Exclua um item ou use um plano com mais espaço. Você ainda pode baixar o projeto como arquivo.`);
  if (writeLocal('wallultra-shelf', [...items,{ name:state.name || 'Minha criação', project:clone() }])) toast('Projeto guardado na biblioteca deste navegador.');
});
$('batch-export').addEventListener('click', async () => {
  if (!demand('batch')) return;
  const button = $('batch-export'); button.disabled = true; const project = clone();
  try {
    if (!await authorizeProject(project) || !await accessRequest({feature:'batch'})) return;
    await prepareImage(project.image);
    for (const resolution of ['1920x1080','2560x1440','3840x2160']) {
      const output = document.createElement('canvas'); [output.width, output.height] = resolution.split('x').map(Number);
      render(output, {...project,resolution}); const blob = await new Promise(resolve => output.toBlob(resolve,'image/png'));
      if (!blob) throw new Error(); downloadFile(blob, `wallultra-${resolution}.png`); output.width = output.height = 1;
    }
    toast('Três resoluções geradas. Se necessário, permita vários downloads no navegador.');
  } catch { toast('Não foi possível gerar o pacote. Tente exportar os tamanhos individualmente.'); }
  finally { button.disabled = false; }
});
window.addEventListener('focus', refreshMembership);
refreshMembership();

$('adapt-plan').addEventListener('click', () => {
  const level = plans[membership.plan].level;
  const patch = {};
  if (!hasPlan(membership.plan, resolutionPlan(state.resolution))) patch.resolution = level === 0 ? '1920x1080' : '3840x2160';
  if (level < 1) {
    patch.template = basicTemplates.includes(state.template) ? state.template : 'orbit';
    patch.shapes = state.shapes.map(x => basicShapes.includes(x.type) ? x : {...x,type:'rectangle'});
    patch.texts = state.texts.map(x => ({...x,shadow:false,outline:false}));
    patch.gradient3 = false;
  }
  if (state.image) patch.image = {...state.image, ...(level < 1 ? {contrast:100,saturation:100} : {}), ...(level < 2 ? {blend:'source-over'} : {})};
  commit(patch); toast('Criação adaptada. Use Desfazer para recuperar a versão anterior.');
});
