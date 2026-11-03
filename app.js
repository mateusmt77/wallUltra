import { palettes, templates, resolutions, fonts, MAX_TEXTS, initialState, createText, blankState, createShape, shapeTypes, MAX_SHAPES, moveLayer, prepareImage, render } from './wallpaper.js';
import { loadWorkspaces, parseProject, serializeProject, normalizeImageFile } from './project.js';

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
function remember(before) {
  if (JSON.stringify(before) === JSON.stringify(state)) return;
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
  finishEdit();
  const before = clone();
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
  pendingBefore ??= clone();
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
  layouts = render(canvas, state);
  const box = showSelection && layouts.find(b => b.kind === selectionKind && b.item.id === (selectionKind === 'text' ? selectedId : selectedShapeId));
  if (!box) return;
  const ctx = canvas.getContext('2d');
  ctx.save();
  const scale = canvas.height / 1080;
  ctx.scale(scale, scale); ctx.translate(box.x, box.y); ctx.rotate(box.angle);
  ctx.strokeStyle = '#bfa4ee'; ctx.lineWidth = 2 / scale; ctx.setLineDash([6 / scale, 4 / scale]);
  ctx.strokeRect(-box.width / 2 - 8, -box.height / 2 - 8, box.width + 16, box.height + 16);
  ctx.restore();
}
function sync() {
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
  $('add-text').title = state.texts.length >= MAX_TEXTS ? 'Limite de 8 textos atingido' : `Adicionar texto (${state.texts.length}/${MAX_TEXTS})`;
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
  button.addEventListener('click', () => commit({ template: template.id }));
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
  finishEdit();
  const changed = name !== activeTool;
  activeTool = name;
  document.querySelectorAll('[data-tool]').forEach(tab => {
    const selected = tab.dataset.tool === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $(tab.getAttribute('aria-controls')).hidden = !selected;
    if (selected && focus) tab.focus();
  });
  if (changed) $('tool-content').scrollTop = 0;
}
const toolTabs = [...document.querySelectorAll('[data-tool]')];
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
$('resolution').addEventListener('change', e => commit({ resolution: e.target.value }));
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
$('text-layer').addEventListener('change', e => { finishEdit(); selectedId = e.target.value; selectionKind = 'text'; showSelection = true; sync(); });
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
  finishEdit();
  const source = undo ? history : future, target = undo ? future : history;
  if (!source.length) return;
  target.push(clone()); state = source.pop(); revision++;
  $('save-status').textContent = 'RASCUNHO'; sync();
}
$('undo').addEventListener('click', () => travel(true));
$('redo').addEventListener('click', () => travel(false));
document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); travel(!e.shiftKey); }
});
function point(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) / rect.width * (1080 * canvas.width / canvas.height), y: (event.clientY - rect.top) / rect.height * 1080 };
}
canvas.addEventListener('pointerdown', e => {
  if (e.button !== 0 || !e.isPrimary) return;
  finishEdit(); const p = point(e);
  const hit = b => {
    const dx = p.x - b.x, dy = p.y - b.y;
    const x = dx * Math.cos(b.angle) + dy * Math.sin(b.angle), y = -dx * Math.sin(b.angle) + dy * Math.cos(b.angle);
    return Math.abs(x) < b.width / 2 + 12 && Math.abs(y) < b.height / 2 + 12 && b.item.opacity > 0;
  };
  // The layer chosen in the controls keeps priority when texts overlap.
  const box = layouts.find(b => b.kind === selectionKind && b.item.id === (selectionKind === 'text' ? selectedId : selectedShapeId) && hit(b)) || [...layouts].reverse().find(hit);
  if (!box) { showSelection = false; draw(); return; }
  selectionKind = box.kind;
  if (box.kind === 'text') selectedId = box.item.id; else selectedShapeId = box.item.id;
  showSelection = true; activateTool(box.kind === 'text' ? 'texts' : 'elements');
  drag = { before: clone(), start: p, x: box.x, y: box.y, pointerId: e.pointerId };
  canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging'); e.preventDefault(); sync();
});
canvas.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.pointerId) return;
  const p = point(e), W = 1080 * canvas.width / canvas.height;
  const x = Math.min(100, Math.max(0, (drag.x + p.x - drag.start.x) / W * 100));
  const y = Math.min(100, Math.max(0, (drag.y + p.y - drag.start.y) / 1080 * 100));
  const key = selectionKind === 'text' ? 'texts' : 'shapes';
  const id = selectionKind === 'text' ? selectedId : selectedShapeId;
  state = { ...state, [key]: state[key].map(item => item.id === id ? { ...item, x, y } : item) }; sync();
});
function finishDrag(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  const before = drag.before; drag = undefined;
  canvas.classList.remove('dragging'); remember(before); sync();
}
canvas.addEventListener('pointerup', finishDrag);
canvas.addEventListener('pointercancel', finishDrag);
canvas.addEventListener('lostpointercapture', finishDrag);
$('shuffle').addEventListener('click', () => {
  const template = templates[Math.floor(Math.random() * templates.length)];
  const palette = Math.floor(Math.random() * palettes.length);
  commit({ template: template.id, ...palettePatch(palette), intensity: 40 + Math.floor(Math.random() * 61) });
  toast('Uma nova composição. Seus textos foram preservados.');
});
$('save').addEventListener('click', () => {
  finishEdit();
  try { workspaces[state.mode].state = state;
    localStorage.setItem('wallultra-project', JSON.stringify({ app: 'wallultra-workspaces', version: 3, activeMode: state.mode, projects: { templates: workspaces.templates.state, blank: workspaces.blank.state } })); $('save-status').textContent = 'SALVO'; toast('Seus dois espaços de criação foram salvos neste navegador.'); }
  catch { toast('O armazenamento está cheio ou bloqueado. Use “Baixar projeto” para guardar sua criação em um arquivo.'); }
});
$('download').addEventListener('click', async () => {
  finishEdit();
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
  finishEdit(); if (state.shapes.length >= MAX_SHAPES) return;
  const shape = createShape(crypto.randomUUID(), type, { color: state.accent });
  selectedShapeId = shape.id; selectionKind = 'shape'; showSelection = true;
  commit({ shapes: [...state.shapes, shape] }); activateTool('elements');
}
shapeTypes.forEach(type => {
  $('shape-type').add(new Option(type.name, type.id));
  const button = document.createElement('button'); button.dataset.addShape = type.id;
  const symbol = document.createElement('span'); symbol.textContent = type.symbol; symbol.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span'); label.textContent = type.name;
  button.append(symbol, label); button.addEventListener('click', () => addShape(type.id)); $('shape-library').append(button);
});
$('shape-layer').addEventListener('change', event => { finishEdit(); selectedShapeId = event.target.value; selectionKind = 'shape'; showSelection = true; sync(); });
$('shape-type').addEventListener('change', event => patchShape({ type: event.target.value }));
$('duplicate-shape').addEventListener('click', () => {
  finishEdit(); const source = currentShape(); if (!source || state.shapes.length >= MAX_SHAPES) return;
  const shape = { ...source, id: crypto.randomUUID(), x: Math.min(95, source.x + 4), y: Math.min(95, source.y + 4) };
  selectedShapeId = shape.id; selectionKind = 'shape'; showSelection = true; commit({ shapes: [...state.shapes, shape] });
});
$('remove-shape').addEventListener('click', () => commit({ shapes: state.shapes.filter(shape => shape.id !== selectedShapeId) }));
for (const key of ['visible', 'shadow']) $('shape-' + key).addEventListener('change', event => patchShape({ [key]: event.target.checked }));
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
    for (const key of ['visible', 'shadow']) $('shape-' + key).checked = shape[key];
    for (const [key, suffix] of [['strokeWidth', ' px'], ['width', ' px'], ['height', ' px'], ['x', '%'], ['y', '%'], ['rotation', '°'], ['opacity', '%']]) $('shape-' + key + '-value').textContent = Math.round(shape[key]) + suffix;
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
    if (file.size > 8 * 1024 * 1024) throw new Error('O projeto deve ter no máximo 8 MB.');
    const project = parseProject(await file.text()); await prepareImage(project.image);
    assetBusy = false; switchMode(project.mode); commit(project); toast('Projeto aberto. Você pode desfazer a importação.');
  } catch (error) { toast(error.message); }
  finally { assetBusy = false; event.target.value = ''; sync(); }
});

for (const workspace of Object.values(workspaces)) {
  if (workspace.state.image) {
    try { await prepareImage(workspace.state.image); }
    catch { workspace.state.image = null; restored = false; toast('Uma imagem salva não pôde ser lida. O restante do projeto foi recuperado.'); }
  }
}
sync();
if (restored) $('save-status').textContent = 'SALVO';
