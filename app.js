import { palettes, templates, resolutions, fonts, MAX_TEXTS, initialState, createText, validateState, render } from './wallpaper.js';

const $ = id => document.getElementById(id);
const canvas = $('wallpaper');
let state = structuredClone(initialState);
let restored = false;
try {
  const saved = localStorage.getItem('wallultra-project');
  if (saved) { state = validateState(JSON.parse(saved)); restored = true; }
} catch { /* A blocked store or corrupt save must not prevent editing. */ }
let selectedId = state.texts[0]?.id;
let history = [], future = [], pendingBefore, toastTimer, revision = 0, layouts = [];
let showSelection = false, drag;
const clone = () => structuredClone(state);
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
  liveEdit({ texts: state.texts.map(t => t.id === selectedId ? { ...t, ...patch } : t) });
}
function draw() {
  layouts = render(canvas, state);
  const box = showSelection && layouts.find(b => b.t.id === selectedId);
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
  for (const key of ['resolution', 'accent', 'background', 'secondary', 'highlight', 'intensity']) setValue(key, state[key]);
  setValue('project-name', state.name);
  setValue('export-format', state.exportFormat);
  setValue('export-quality', state.exportQuality);
  $('quality-control').hidden = state.exportFormat === 'png';
  $('export-quality-value').textContent = state.exportQuality + '%';
  $('file-type').textContent = state.exportFormat.toUpperCase();
  $('grain').checked = state.grain;
  $('intensity-value').textContent = state.intensity + '%';
  $('palette-name').textContent = palettes[state.palette].name + ' · personalize cada cor';
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
    for (const [id, key] of [['headline', 'text'], ['font', 'font'], ['text-color', 'color'], ['text-size', 'size'], ['text-x', 'x'], ['text-y', 'y'], ['text-rotation', 'rotation'], ['text-opacity', 'opacity']]) setValue(id, text[key]);
    $('show-text').checked = text.visible;
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
  canvas.setAttribute('aria-label', `Wallpaper ${templates.find(t => t.id === state.template).name}. ${state.texts.filter(t => t.visible && t.text.trim()).length} textos visíveis. Arraste um texto ou use os controles de posição.`);
  draw();
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
  const swatch = document.createElement('span'); swatch.style.background = `linear-gradient(135deg, ${p.accent} 50%, ${p.second} 50%)`;
  b.append(swatch); b.addEventListener('click', () => commit(palettePatch(i))); $('palettes').append(b);
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
$('text-layer').addEventListener('change', e => { finishEdit(); selectedId = e.target.value; showSelection = true; sync(); });
$('add-text').addEventListener('click', () => {
  finishEdit(); if (state.texts.length >= MAX_TEXTS) return;
  const text = createText(crypto.randomUUID(), { color: state.highlight });
  selectedId = text.id; showSelection = true;
  commit({ texts: [...state.texts, text] }); $('headline').focus(); $('headline').select();
});
$('duplicate-text').addEventListener('click', () => {
  finishEdit(); const source = currentText(); if (!source || state.texts.length >= MAX_TEXTS) return;
  const copy = { ...source, id: crypto.randomUUID(), x: Math.min(95, source.x + 3), y: Math.min(95, source.y + 5) };
  selectedId = copy.id; showSelection = true; commit({ texts: [...state.texts, copy] });
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
    return Math.abs(x) < b.width / 2 + 12 && Math.abs(y) < b.height / 2 + 12 && b.t.opacity > 0;
  };
  // The layer chosen in the controls keeps priority when texts overlap.
  const box = layouts.find(b => b.t.id === selectedId && hit(b)) || [...layouts].reverse().find(hit);
  if (!box) { showSelection = false; draw(); return; }
  selectedId = box.t.id; showSelection = true;
  drag = { before: clone(), start: p, x: box.x, y: box.y, pointerId: e.pointerId };
  canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging'); e.preventDefault(); sync();
});
canvas.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.pointerId) return;
  const p = point(e), W = 1080 * canvas.width / canvas.height;
  const x = Math.min(100, Math.max(0, (drag.x + p.x - drag.start.x) / W * 100));
  const y = Math.min(100, Math.max(0, (drag.y + p.y - drag.start.y) / 1080 * 100));
  state = { ...state, texts: state.texts.map(t => t.id === selectedId ? { ...t, x, y } : t) }; sync();
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
  try { localStorage.setItem('wallultra-project', JSON.stringify(state)); $('save-status').textContent = 'SALVO'; toast('Projeto salvo neste navegador. Volte quando quiser.'); }
  catch { toast('Não foi possível salvar. Verifique o armazenamento do navegador.'); }
});
$('download').addEventListener('click', async () => {
  finishEdit();
  const button = $('download'); button.disabled = true; button.setAttribute('aria-busy', 'true');
  const exportState = clone(), exportRevision = revision;
  try {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const output = document.createElement('canvas');
    [output.width, output.height] = exportState.resolution.split('x').map(Number);
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
sync();
if (restored) $('save-status').textContent = 'SALVO';
