import { validateStrokes, renderInk } from './drawing.js';
export const palettes = [
  { name: 'Lavanda', accent: '#b8a0ed', dark: '#24232e', light: '#eee9f5', second: '#766591' },
  { name: 'Sálvia', accent: '#b2c99e', dark: '#202d2b', light: '#eff0df', second: '#668c7d' },
  { name: 'Pêssego', accent: '#efb091', dark: '#382a2c', light: '#ffede2', second: '#b86b72' },
  { name: 'Oceano', accent: '#91bfe2', dark: '#1c2b3b', light: '#e6eef5', second: '#477ca1' },
  { name: 'Areia', accent: '#dbc78e', dark: '#302e27', light: '#f5f0df', second: '#9b8c65' },
  { name: 'Neon', accent: '#a6ff00', dark: '#101b17', light: '#edffcf', second: '#426c38' },
  { name: 'Rosa', accent: '#ff92c2', dark: '#351d36', light: '#fff0f7', second: '#a65088' },
  { name: 'Solar', accent: '#ffcc55', dark: '#39241e', light: '#fff1cb', second: '#cf643f' },
  { name: 'Cobalto', accent: '#7b97ff', dark: '#141c42', light: '#e4eaff', second: '#4249a3' },
  { name: 'Gelo', accent: '#a2e6df', dark: '#163138', light: '#eafffb', second: '#468994' },
  { name: 'Terracota', accent: '#d48e70', dark: '#382823', light: '#f7e5cc', second: '#95604b' },
  { name: 'Monocromática', accent: '#bbbbbb', dark: '#1b1b1b', light: '#f4f4f4', second: '#686868' }
];
export const templates = [
  { id: 'orbit', name: 'Órbita', tag: 'Abstrato', text: 'MAKE\nSPACE.', palette: 0 },
  { id: 'landscape', name: 'Horizonte', tag: 'Natureza', text: 'vá com calma.', palette: 1 },
  { id: 'aurora', name: 'Aurora', tag: 'Gradiente', text: 'breathe.', palette: 3 },
  { id: 'geometry', name: 'Equilíbrio', tag: 'Geométrico', text: 'LESS,\nBUT BETTER.', palette: 4 },
  { id: 'sunset', name: 'Pôr do sol', tag: 'Retrô', text: 'slow down.', palette: 7 },
  { id: 'waves', name: 'Maré', tag: 'Orgânico', text: 'go with the flow.', palette: 9 },
  { id: 'stars', name: 'Cosmos', tag: 'Espacial', text: 'STAY CURIOUS.', palette: 8 },
  { id: 'minimal', name: 'Essência', tag: 'Minimalista', text: 'less is more.', palette: 11 }
];
export const resolutions = [
  { value: '1920x1080', name: 'Full HD', ratio: '16:9' },
  { value: '2560x1440', name: 'Quad HD', ratio: '16:9' },
  { value: '3840x2160', name: '4K Ultra HD', ratio: '16:9' },
  { value: '1920x1200', name: 'Desktop amplo', ratio: '16:10' },
  { value: '2560x1600', name: 'Wide QHD', ratio: '16:10' },
  { value: '1600x1200', name: 'Clássico', ratio: '4:3' },
  { value: '2560x1080', name: 'Ultrawide HD', ratio: '64:27' },
  { value: '3440x1440', name: 'Ultrawide QHD', ratio: '43:18' },
  { value: '3840x1080', name: 'Dois monitores', ratio: '32:9' },
  { value: '5120x1440', name: 'Super ultrawide', ratio: '32:9' }
];
export const fonts = [
  { id: 'sans', name: 'Grotesca · Arial', family: 'Arial, sans-serif' },
  { id: 'serif', name: 'Editorial · Georgia', family: 'Georgia, serif' },
  { id: 'mono', name: 'Código · Courier', family: '"Courier New", monospace' },
  { id: 'humanist', name: 'Humanista · Trebuchet', family: '"Trebuchet MS", sans-serif' },
  { id: 'classic', name: 'Clássica · Times', family: '"Times New Roman", serif' },
  { id: 'rounded', name: 'Amigável · Verdana', family: 'Verdana, sans-serif' },
  { id: 'impact', name: 'Impacto · Impact', family: 'Impact, "Arial Black", sans-serif' },
  { id: 'hand', name: 'Manuscrita · Cursiva', family: '"Comic Sans MS", cursive' }
];
export const MAX_TEXTS = 32;
export const MAX_SHAPES = 100;
export const shapeTypes = [
  { id: 'ellipse', name: 'Círculo / elipse', symbol: '●' },
  { id: 'rectangle', name: 'Retângulo', symbol: '■' },
  { id: 'pill', name: 'Forma arredondada', symbol: '▰' },
  { id: 'triangle', name: 'Triângulo', symbol: '▲' },
  { id: 'star', name: 'Estrela', symbol: '★' },
  { id: 'ring', name: 'Anel', symbol: '◯' },
  { id: 'diamond', name: 'Losango' }, { id: 'pentagon', name: 'Pentágono' },
  { id: 'hexagon', name: 'Hexágono' }, { id: 'octagon', name: 'Octógono' },
  { id: 'heart', name: 'Coração' }, { id: 'arrow', name: 'Seta à direita' },
  { id: 'arrowLeft', name: 'Seta à esquerda' }, { id: 'chevron', name: 'Chevron' },
  { id: 'line', name: 'Linha' }, { id: 'cross', name: 'Cruz' },
  { id: 'bolt', name: 'Raio' }, { id: 'drop', name: 'Gota' },
  { id: 'moon', name: 'Lua' }, { id: 'cloud', name: 'Nuvem' },
  { id: 'speech', name: 'Balão de fala' }, { id: 'flower', name: 'Flor' },
  { id: 'spark', name: 'Brilho' }, { id: 'arch', name: 'Arco' }
];
export function createShape(id, type = 'ellipse', overrides = {}) {
  return { id, type, x: 50, y: 50, width: 320, height: 320, rotation: 0, opacity: 100,
    color: '#b3ff59', strokeColor: '#ffffff', strokeWidth: 0, shadow: false, visible: true, fill: true, keepInside: true, flipX: false, flipY: false, ...overrides };
}
export function moveLayer(items, id, direction) {
  const next = [...items], index = next.findIndex(item => item.id === id);
  const target = Math.max(0, Math.min(next.length - 1, index + direction));
  if (index >= 0 && target !== index) [next[index], next[target]] = [next[target], next[index]];
  return next;
}
export function createText(id, overrides = {}) {
  return { id, text: 'Seu texto aqui', font: 'sans', size: 100, color: '#eee9f5', bold: false,
    italic: false, shadow: false, visible: true, align: 'center', x: 50, y: 50,
    rotation: 0, opacity: 100, lineHeight: 1.15, outline: false, ...overrides };
}
export const initialState = {
  version: 4, strokes: [], mode: 'templates', backgroundMode: 'auto', gradientAngle: 135, pattern: 'none', patternOpacity: 15,
  vignette: 0, grainAmount: 6.5, frameWidth: 0, frameColor: '#b3ff59', shapes: [], image: null, template: 'orbit', palette: 0, accent: '#b8a0ed', background: '#24232e',
  secondary: '#766591', highlight: '#eee9f5', resolution: '1920x1080', grain: true,
  intensity: 70, name: 'Meu novo universo', exportFormat: 'png', exportQuality: 92,
  texts: [
    createText('title', { text: 'MAKE\nSPACE.', size: 166, bold: true, align: 'left', x: 25, y: 50 }),
    createText('label', { text: 'P E R S O N A L   S P A C E   /   0 1', font: 'mono', size: 15, x: 22, y: 10, opacity: 60 }),
    createText('footer', { text: 'A LITTLE MORE YOU. A LITTLE LESS NOISE.', font: 'mono', size: 17, x: 25, y: 90, opacity: 60 })
  ]
};
export function blankState() {
  return { ...structuredClone(initialState), mode: 'blank', template: 'blank', backgroundMode: 'solid',
    background: '#18102b', accent: '#8f52ff', secondary: '#ff64ba', highlight: '#ffffff',
    grain: false, texts: [], name: 'Minha criação do zero' };
}
export function validImageSource(src) {
  return typeof src === 'string' && src.length <= 4 * 1024 * 1024 && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(src);
}
const color = value => typeof value === 'string' && /^#[a-f\d]{6}$/i.test(value);
const bounded = (value, min, max, fallback) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
export function validateState(value) {
  const s = structuredClone(initialState);
  if (!value || typeof value !== 'object') return s;
  if (templates.some(t => t.id === value.template) || value.template === 'blank') s.template = value.template;
  s.mode = value.mode === 'blank' || s.template === 'blank' ? 'blank' : 'templates';
  if (s.mode === 'blank') s.template = 'blank';
  if (['auto', 'solid', 'linear', 'radial'].includes(value.backgroundMode)) s.backgroundMode = value.backgroundMode;
  else if (s.mode === 'blank') s.backgroundMode = 'solid';
  if (['none', 'grid', 'dots', 'stripes'].includes(value.pattern)) s.pattern = value.pattern;
  for (const [key, min, max] of [['gradientAngle', 0, 360], ['patternOpacity', 0, 50], ['vignette', 0, 100], ['grainAmount', 0, 30], ['frameWidth', 0, 60]]) s[key] = bounded(value[key], min, max, s[key]);
  if (color(value.frameColor)) s.frameColor = value.frameColor;
  if (Number.isInteger(value.palette) && palettes[value.palette]) s.palette = value.palette;
  const p = palettes[s.palette];
  for (const [key, fallback] of [['accent', p.accent], ['background', p.dark], ['secondary', p.second], ['highlight', p.light]]) s[key] = color(value[key]) ? value[key] : fallback;
  if (resolutions.some(r => r.value === value.resolution)) s.resolution = value.resolution;
  if (typeof value.grain === 'boolean') s.grain = value.grain;
  if (typeof value.name === 'string') s.name = value.name.slice(0, 60);
  s.intensity = bounded(value.intensity, 0, 100, s.intensity);
  if (['png', 'jpeg', 'webp'].includes(value.exportFormat)) s.exportFormat = value.exportFormat;
  s.exportQuality = bounded(value.exportQuality, 10, 100, s.exportQuality);
  if (Array.isArray(value.texts)) {
    const ids = new Set();
    s.texts = value.texts.slice(0, MAX_TEXTS).map((entry, i) => {
      const raw = entry && typeof entry === 'object' ? entry : {};
      let id = typeof raw.id === 'string' ? raw.id.slice(0, 80) : `text-${i}`;
      while (ids.has(id)) id += `-${i}`;
      ids.add(id);
      const t = createText(id);
      if (typeof raw.text === 'string') t.text = raw.text.slice(0, 300);
      if (fonts.some(f => f.id === raw.font)) t.font = raw.font;
      if (color(raw.color)) t.color = raw.color;
      for (const key of ['bold', 'italic', 'shadow', 'visible', 'outline']) if (typeof raw[key] === 'boolean') t[key] = raw[key];
      if (['left', 'center', 'right'].includes(raw.align)) t.align = raw.align;
      for (const [key, min, max] of [['size', 12, 260], ['x', 0, 100], ['y', 0, 100], ['rotation', -180, 180], ['opacity', 0, 100], ['lineHeight', .85, 2]]) t[key] = bounded(raw[key], min, max, t[key]);
      return t;
    });
  } else {
    // Migrate the original single-text prototype without losing saved work.
    const t = s.texts[0];
    if (typeof value.text === 'string') t.text = value.text.slice(0, 300);
    if (fonts.some(f => f.id === value.font)) t.font = value.font;
    if (['left', 'center', 'right'].includes(value.align)) { t.align = value.align; t.x = value.align === 'left' ? 25 : value.align === 'right' ? 75 : 50; }
    if (typeof value.showText === 'boolean') t.visible = value.showText;
    s.texts.forEach(text => { text.color = p.light; });
  }
  if (s.mode === 'blank' && !Array.isArray(value.texts) && typeof value.text !== 'string') s.texts = [];
  if (s.mode === 'blank' && s.backgroundMode === 'auto') s.backgroundMode = 'solid';
  s.strokes = validateStrokes(value.strokes);
  if (Array.isArray(value.shapes)) {
    const ids = new Set();
    s.shapes = value.shapes.slice(0, MAX_SHAPES).filter(raw => raw && typeof raw === 'object').map((raw, i) => {
      let id = typeof raw.id === 'string' ? raw.id.slice(0, 80) : `shape-${i}`;
      while (ids.has(id)) id += `-${i}`;
      ids.add(id);
      const shape = createShape(id);
      if (shapeTypes.some(type => type.id === raw.type)) shape.type = raw.type;
      for (const key of ['color', 'strokeColor']) if (color(raw[key])) shape[key] = raw[key];
      for (const key of ['visible', 'shadow', 'fill', 'keepInside', 'flipX', 'flipY']) if (typeof raw[key] === 'boolean') shape[key] = raw[key];
      for (const [key, min, max] of [['x', 0, 100], ['y', 0, 100], ['width', 1, 4000], ['height', 1, 2160], ['rotation', -180, 180], ['opacity', 0, 100], ['strokeWidth', 0, 240]]) shape[key] = bounded(raw[key], min, max, shape[key]);
      return shape;
    });
  }
  if (value.image && validImageSource(value.image.src)) {
    const image = value.image;
    s.image = { src: image.src, name: typeof image.name === 'string' ? image.name.slice(0, 100) : 'Minha imagem',
      fit: image.fit === 'contain' ? 'contain' : 'cover', opacity: bounded(image.opacity, 0, 100, 100),
      zoom: bounded(image.zoom, 100, 250, 100), x: bounded(image.x, 0, 100, 50), y: bounded(image.y, 0, 100, 50) };
  }
  return s;
}

// Layout in logical screen coordinates, shared by drawing, selection and dragging.
export function getTextLayouts(ctx, state, W, H) {
  return state.texts.filter(t => t.visible && t.text.trim()).map(t => {
    const lines = t.text.split('\n');
    const family = fonts.find(f => f.id === t.font)?.family || fonts[0].family;
    let size = Math.min(t.size, H * .84 / (1.15 + (lines.length - 1) * t.lineHeight));
    const font = () => `${t.italic ? 'italic ' : ''}${t.bold ? '700' : '400'} ${size}px ${family}`;
    ctx.font = font();
    let width = Math.max(...lines.map(line => ctx.measureText(line).width), size / 2);
    if (width > W * .9) { size *= W * .9 / width; ctx.font = font(); width = Math.max(...lines.map(line => ctx.measureText(line).width), size / 2); }
    let height = size * (1.15 + (lines.length - 1) * t.lineHeight);
    const angle = t.rotation * Math.PI / 180;
    const extent = () => [Math.abs(Math.cos(angle)) * width + Math.abs(Math.sin(angle)) * height, Math.abs(Math.sin(angle)) * width + Math.abs(Math.cos(angle)) * height];
    let [bw, bh] = extent();
    const scale = Math.min(1, W * .94 / bw, H * .94 / bh);
    size *= scale; width *= scale; height *= scale; [bw, bh] = extent();
    const x = Math.min(W - bw / 2 - 10, Math.max(bw / 2 + 10, t.x / 100 * W));
    const y = Math.min(H - bh / 2 - 10, Math.max(bh / 2 + 10, t.y / 100 * H));
    return { kind: 'text', item: t, t, lines, size, width, height, angle, x, y, font: font() };
  });
}
export function getShapeLayouts(state, W, H) {
  return state.shapes.filter(shape => shape.visible).map(shape => {
    const angle = shape.rotation * Math.PI / 180;
    let width = shape.width, height = shape.height;
    const extent = () => [Math.abs(Math.cos(angle)) * width + Math.abs(Math.sin(angle)) * height, Math.abs(Math.sin(angle)) * width + Math.abs(Math.cos(angle)) * height];
    let [bw, bh] = extent();
    const scale = shape.keepInside ? Math.min(1, W * .94 / bw, H * .94 / bh) : 1;
    width *= scale; height *= scale; [bw, bh] = extent();
    return { kind: 'shape', item: shape, width, height, angle,
      x: shape.keepInside ? Math.min(W - bw / 2 - 10, Math.max(bw / 2 + 10, shape.x / 100 * W)) : shape.x / 100 * W,
      y: shape.keepInside ? Math.min(H - bh / 2 - 10, Math.max(bh / 2 + 10, shape.y / 100 * H)) : shape.y / 100 * H };
  });
}
const imageCache = new Map();
export async function prepareImage(image) {
  if (!image) return;
  if (!validImageSource(image.src)) throw new Error('Imagem inválida.');
  const existing = imageCache.get(image.src);
  if (existing) return existing.ready;
  const element = new Image();
  const entry = { element, ready: null };
  entry.ready = new Promise((resolve, reject) => {
    element.onload = () => resolve(element);
    element.onerror = () => { imageCache.delete(image.src); reject(new Error('Não foi possível abrir a imagem.')); };
    element.src = image.src;
  });
  imageCache.set(image.src, entry);
  // Cache only a few decoded assets; the project and history retain their data URLs.
  while (imageCache.size > 4) imageCache.delete(imageCache.keys().next().value);
  return entry.ready;
}
function drawImageLayer(ctx, image, W, H) {
  const element = imageCache.get(image?.src)?.element;
  if (!element?.complete || !element.naturalWidth) return;
  const scale = (image.fit === 'contain' ? Math.min(W / element.naturalWidth, H / element.naturalHeight) : Math.max(W / element.naturalWidth, H / element.naturalHeight)) * image.zoom / 100;
  const w = element.naturalWidth * scale, h = element.naturalHeight * scale;
  ctx.save(); ctx.globalAlpha = image.opacity / 100;
  ctx.drawImage(element, (W - w) * image.x / 100, (H - h) * image.y / 100, w, h); ctx.restore();
}
export function shapePath(ctx, type, w, h) {
  const polygon = points => { points.forEach(([x,y], i) => i ? ctx.lineTo(x*w,y*h) : ctx.moveTo(x*w,y*h)); ctx.closePath(); };
  ctx.beginPath();
  if (type === 'ellipse' || type === 'ring') {
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    if (type === 'ring') { ctx.moveTo(w * .34, 0); ctx.ellipse(0, 0, w * .34, h * .34, 0, 0, Math.PI * 2, true); }
  } else if (type === 'triangle') { ctx.moveTo(0, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); }
  else if (type === 'star') {
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .22 : .5; const x = Math.cos(a) * w * r, y = Math.sin(a) * h * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath();
  } else if (['pentagon', 'hexagon', 'octagon'].includes(type)) {
    const sides = {pentagon:5,hexagon:6,octagon:8}[type];
    polygon(Array.from({length:sides},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/sides;return [Math.cos(a)*.5,Math.sin(a)*.5];}));
  } else if (type === 'diamond') polygon([[0,-.5],[.5,0],[0,.5],[-.5,0]]);
  else if (type === 'heart') {ctx.moveTo(0,h*.5);ctx.bezierCurveTo(-w*.85,0,-w*.45,-h*.8,0,-h*.25);ctx.bezierCurveTo(w*.45,-h*.8,w*.85,0,0,h*.5);ctx.closePath();}
  else if (type === 'arrow' || type === 'arrowLeft') {const d=type==='arrow'?1:-1;polygon([[-.5*d,-.2],[.05*d,-.2],[.05*d,-.5],[.5*d,0],[.05*d,.5],[.05*d,.2],[-.5*d,.2]]);}
  else if (type === 'chevron') polygon([[-.5,-.5],[0,-.5],[.5,0],[0,.5],[-.5,.5],[0,0]]);
  else if (type === 'line') {ctx.moveTo(-w/2,-h/2);ctx.lineTo(w/2,h/2);}
  else if (type === 'cross') polygon([[-.17,-.5],[.17,-.5],[.17,-.17],[.5,-.17],[.5,.17],[.17,.17],[.17,.5],[-.17,.5],[-.17,.17],[-.5,.17],[-.5,-.17],[-.17,-.17]]);
  else if (type === 'bolt') polygon([[0,-.5],[-.45,.05],[-.05,.05],[-.2,.5],[.45,-.15],[.08,-.15],[.25,-.5]]);
  else if (type === 'drop') {ctx.moveTo(0,-h/2);ctx.bezierCurveTo(w*.1,-h*.2,w*.48,0,w*.42,h*.2);ctx.bezierCurveTo(w*.3,h*.6,-w*.3,h*.6,-w*.42,h*.2);ctx.bezierCurveTo(-w*.48,0,-w*.1,-h*.2,0,-h/2);ctx.closePath();}
  else if (type === 'moon') {ctx.moveTo(w*.25,-h*.45);ctx.bezierCurveTo(-w*.75,-h*.65,-w*.75,h*.65,w*.25,h*.45);ctx.bezierCurveTo(-w*.2,h*.3,-w*.2,-h*.3,w*.25,-h*.45);ctx.closePath();}
  else if (type === 'cloud') {ctx.moveTo(-w*.3,h*.35);ctx.bezierCurveTo(-w*.6,h*.35,-w*.6,-h*.15,-w*.3,-h*.12);ctx.bezierCurveTo(-w*.35,-h*.65,w*.2,-h*.65,w*.26,-h*.2);ctx.bezierCurveTo(w*.58,-h*.3,w*.65,h*.35,w*.3,h*.35);ctx.closePath();}
  else if (type === 'speech') {ctx.moveTo(-w*.5,-h*.45);ctx.lineTo(w*.5,-h*.45);ctx.lineTo(w*.5,h*.25);ctx.lineTo(-w*.1,h*.25);ctx.lineTo(-w*.38,h*.5);ctx.lineTo(-w*.3,h*.25);ctx.lineTo(-w*.5,h*.25);ctx.closePath();}
  else if (type === 'flower') {polygon(Array.from({length:96},(_,i)=>{const a=i*Math.PI*2/96,r=.36+.14*Math.cos(a*6);return [Math.cos(a)*r,Math.sin(a)*r];}));}
  else if (type === 'spark') {polygon([[0,-.5],[.12,-.12],[.5,0],[.12,.12],[0,.5],[-.12,.12],[-.5,0],[-.12,-.12]]);}
  else if (type === 'arch') {ctx.moveTo(-w/2,h/2);ctx.lineTo(-w/2,0);ctx.bezierCurveTo(-w/2,-h*.67,w/2,-h*.67,w/2,0);ctx.lineTo(w/2,h/2);ctx.closePath();}
  else if (type === 'pill') ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) / 3);
  else ctx.rect(-w / 2, -h / 2, w, h);
}
function drawBackdrop(ctx, state, W, H) {
  let fill = state.background;
  if (state.backgroundMode === 'linear') {
    const a = state.gradientAngle * Math.PI / 180, length = Math.abs(W * Math.cos(a)) + Math.abs(H * Math.sin(a));
    fill = ctx.createLinearGradient(W/2 - Math.cos(a)*length/2, H/2 - Math.sin(a)*length/2, W/2 + Math.cos(a)*length/2, H/2 + Math.sin(a)*length/2);
    fill.addColorStop(0, state.background); fill.addColorStop(1, state.accent);
  } else if (state.backgroundMode === 'radial') {
    fill = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.hypot(W,H)/2);
    fill.addColorStop(0,state.accent); fill.addColorStop(1,state.background);
  }
  ctx.fillStyle = fill; ctx.fillRect(0,0,W,H);
}
function drawPattern(ctx, state, W, H) {
  if (state.pattern === 'none') return;
  ctx.save(); ctx.globalAlpha = state.patternOpacity / 100; ctx.strokeStyle = ctx.fillStyle = state.highlight; ctx.lineWidth = 1.5;
  if (state.pattern === 'dots') {
    for (let x=30;x<W;x+=60) for (let y=30;y<H;y+=60) { ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill(); }
  } else if (state.pattern === 'grid') {
    for (let x=0;x<W;x+=80) {ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for (let y=0;y<H;y+=80) {ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  } else for (let x=-H;x<W;x+=70) {ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+H,H);ctx.stroke();}
  ctx.restore();
}
let noise;
function noiseTexture() {
  if (noise) return noise;
  noise = document.createElement('canvas'); noise.width = noise.height = 256;
  const ctx = noise.getContext('2d'), img = ctx.createImageData(256, 256);
  let seed = 37;
  for (let i = 0; i < img.data.length; i += 4) { seed = (seed * 16807) % 2147483647; img.data[i] = img.data[i + 1] = img.data[i + 2] = seed % 255; img.data[i + 3] = 255; }
  ctx.putImageData(img, 0, 0); return noise;
}
export function render(canvas, state, { thumbnail = false, draftStroke, draftShape } = {}) {
  const ctx = canvas.getContext('2d');
  const p = { accent: state.accent, dark: state.background, second: state.secondary, light: state.highlight };
  const H = 1080, W = H * canvas.width / canvas.height, strength = state.intensity / 100;
  // Background artwork keeps its proportions on every monitor shape.
  ctx.save(); ctx.scale(canvas.height / H, canvas.height / H);
  drawBackdrop(ctx, state, W, H);
  ctx.save(); ctx.translate((W - 1920) / 2, 0);
  if (state.template === 'blank') {
    // A blank workspace has no preset artwork or default text.
  } else if (state.template === 'orbit') {
    const bg = ctx.createLinearGradient(0, H, W, 0); bg.addColorStop(0, p.dark); bg.addColorStop(1, p.second); if (state.backgroundMode === 'auto') { ctx.fillStyle = bg; ctx.fillRect(-(W - 1920) / 2, 0, W, H); }
    ctx.save(); ctx.globalAlpha = strength;
    const sphere = (x, y, r, c1, c2) => { const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .05, x, y, r); g.addColorStop(0, c1); g.addColorStop(.6, c2); g.addColorStop(1, p.dark); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
    ctx.strokeStyle = p.accent; ctx.lineWidth = 1.5;
    ctx.save(); ctx.translate(1390, 555); ctx.rotate(-.65); ctx.beginPath(); ctx.ellipse(0, 0, 640, 210, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    sphere(1430, 560, 390, p.light, p.accent);
    const g = ctx.createLinearGradient(1050, 1000, 1900, 1000); g.addColorStop(0, p.second); g.addColorStop(.55, p.accent); g.addColorStop(1, p.dark);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(1520, 1320, 525, Math.PI, Math.PI * 2); ctx.fill();
    sphere(1120, 220, 40, p.light, p.accent);
    ctx.fillStyle = p.light; ctx.font = '42px Georgia'; ctx.fillText('✦', 1695, 180); ctx.fillText('✧', 1030, 830);
    ctx.restore();
  } else if (state.template === 'landscape') {
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, p.dark); sky.addColorStop(1, p.accent); if (state.backgroundMode === 'auto') { ctx.fillStyle = sky; ctx.fillRect(-(W - 1920) / 2, 0, W, H); }
    ctx.save(); ctx.globalAlpha = strength;
    ctx.fillStyle = p.light; ctx.beginPath(); ctx.arc(1420, 340, 130, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = [p.second, p.accent, p.second, p.dark][i]; ctx.globalAlpha = strength * (.6 + i * .13);
      ctx.beginPath(); ctx.moveTo(-(W - 1920) / 2, 540 + i * 145); ctx.bezierCurveTo(400, 160 + i * 190, 680, 1080 - i * 100, 1100, 560 + i * 130); ctx.bezierCurveTo(1500, 220 + i * 160, 1700, 680 + i * 150, (W + 1920) / 2, 520 + i * 140); ctx.lineTo((W + 1920) / 2, H); ctx.lineTo(-(W - 1920) / 2, H); ctx.fill();
    } ctx.restore();
  } else if (state.template === 'aurora') {
    ctx.save(); ctx.globalAlpha = strength;
    for (const [x,y,r,color] of [[350,800,1000,p.second],[1380,230,1050,p.accent],[1700,1000,750,p.second]]) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(-(W - 1920) / 2,0,W,H);
    }
    ctx.strokeStyle = p.light; ctx.globalAlpha = strength * .12;
    for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.ellipse(1400, 650, 420 + i * 42, 100 + i * 28, -.6, 0, Math.PI * 2); ctx.stroke(); } ctx.restore();
  } else if (state.template === 'sunset') {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, p.dark); g.addColorStop(.6, p.second); g.addColorStop(1, p.accent);
    if (state.backgroundMode === 'auto') { ctx.fillStyle = g; ctx.fillRect(-(W - 1920) / 2, 0, W, H); }
    ctx.save(); ctx.globalAlpha = strength; ctx.fillStyle = p.light;
    ctx.beginPath(); ctx.arc(960, 480, 240, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.dark; ctx.fillRect(-(W - 1920) / 2, 720, W, 360);
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) { const y = 735 + i * i * 1.6; ctx.beginPath(); ctx.moveTo(300 - i * 28, y); ctx.lineTo(1620 + i * 28, y); ctx.stroke(); }
    ctx.restore();
  } else if (state.template === 'waves') {
    ctx.save(); ctx.globalAlpha = strength;
    const left = -(W - 1920) / 2;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = [p.second, p.accent, p.light][i % 3]; ctx.globalAlpha = strength * (.18 + i * .09);
      ctx.beginPath(); ctx.moveTo(left, 350 + i * 85);
      ctx.bezierCurveTo(600, -400 + i * 120, 1000, 1200 - i * 20, left + W, 230 + i * 85);
      ctx.lineTo(left + W, H); ctx.lineTo(left, H); ctx.fill();
    } ctx.restore();
  } else if (state.template === 'stars') {
    ctx.save(); ctx.globalAlpha = strength;
    let seed = 92; const rand = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
    const left = -(W - 1920) / 2;
    for (let i = 0; i < 240; i++) { const x = left + rand() * W, y = rand() * H, r = .5 + rand() * 2.5; ctx.globalAlpha = strength * (.2 + rand() * .8); ctx.fillStyle = i % 3 ? p.light : p.accent; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); }
    ctx.globalAlpha = strength; const g = ctx.createRadialGradient(1450, 350, 0, 1450, 350, 150); g.addColorStop(0,p.light);g.addColorStop(.7,p.accent);g.addColorStop(1,p.second);
    ctx.fillStyle = g; ctx.beginPath();ctx.arc(1450,350,150,0,Math.PI*2);ctx.fill();ctx.restore();
  } else if (state.template === 'minimal') {
    ctx.save();ctx.globalAlpha = strength;ctx.strokeStyle = p.accent;ctx.lineWidth = 3;
    for (let i=0;i<8;i++) {ctx.beginPath();ctx.arc(1490,540,170+i*35,-Math.PI*.65,Math.PI*.65);ctx.stroke();}
    ctx.fillStyle = p.second;ctx.beginPath();ctx.arc(1490,540,95,0,Math.PI*2);ctx.fill();ctx.restore();
  } else {
    if (state.backgroundMode === 'auto') { ctx.fillStyle = p.dark; ctx.fillRect(-(W - 1920) / 2, 0, W, H); } ctx.save(); ctx.globalAlpha = strength;
    ctx.strokeStyle = p.second; ctx.globalAlpha = strength * .12;
    for (let x = -(W - 1920) / 2; x <= (W + 1920) / 2; x += 120) { ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); }
    for (let y = 0; y <= H; y += 120) { ctx.beginPath();ctx.moveTo(-(W - 1920) / 2,y);ctx.lineTo((W + 1920) / 2,y);ctx.stroke(); }
    ctx.globalAlpha = strength; ctx.fillStyle = p.accent; ctx.fillRect(1120, 220, 580, 600);
    ctx.fillStyle = p.dark; ctx.beginPath(); ctx.arc(1410, 220, 290, 0, Math.PI); ctx.fill();
    ctx.fillStyle = p.second; ctx.beginPath(); ctx.arc(1410, 820, 290, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = p.light; ctx.lineWidth = 2; ctx.strokeRect(1040, 300, 580, 600); ctx.restore();
  }
  ctx.restore(); // Artwork transform; text uses the actual screen aspect ratio.
  if (!thumbnail) drawImageLayer(ctx, state.image, W, H);
  drawPattern(ctx, state, W, H);
  if (state.vignette) {
    ctx.save(); const g = ctx.createRadialGradient(W/2,H/2,H*.15,W/2,H/2,Math.hypot(W,H)/2); g.addColorStop(0,'transparent');g.addColorStop(1,`rgba(0,0,0,${state.vignette/100})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();
  }
  if (state.grain && !thumbnail) { ctx.save(); ctx.globalAlpha = state.grainAmount / 100; ctx.fillStyle = ctx.createPattern(noiseTexture(), 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore(); }
  const shapeLayouts = thumbnail ? [] : getShapeLayouts(draftShape ? { ...state, shapes: [...state.shapes, draftShape] } : state, W, H);
  for (const box of shapeLayouts) {
    const shape = box.item;
    ctx.save(); ctx.translate(box.x,box.y);ctx.rotate(box.angle);ctx.scale(shape.flipX?-1:1,shape.flipY?-1:1);ctx.globalAlpha=shape.opacity/100;
    if (shape.shadow) {ctx.shadowColor='#00000066';ctx.shadowBlur=24;ctx.shadowOffsetY=10;}
    ctx.fillStyle=shape.color;shapePath(ctx,shape.type,box.width,box.height);if (shape.fill && shape.type !== 'line') ctx.fill();
    ctx.shadowColor='transparent';
    if (shape.strokeWidth || shape.type === 'line' || !shape.fill) {ctx.strokeStyle=shape.type === 'line' && !shape.strokeWidth ? shape.color : shape.strokeColor;ctx.lineWidth=shape.strokeWidth || 3;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
    ctx.restore();
  }
  if (!thumbnail) renderInk(ctx, state.strokes, canvas.width, canvas.height, draftStroke);
  const layouts = thumbnail ? [] : getTextLayouts(ctx, state, W, H);
  for (const box of layouts) {
    const { t, lines, size, width, height, angle, x, y, font } = box;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.font = font;
    ctx.fillStyle = t.color; ctx.globalAlpha = t.opacity / 100;
    ctx.textAlign = t.align; ctx.textBaseline = 'middle';
    if (t.shadow) { ctx.shadowColor = '#000000aa'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5; }
    const tx = t.align === 'left' ? -width / 2 : t.align === 'right' ? width / 2 : 0;
    lines.forEach((line, i) => {
      const y = (i - (lines.length - 1) / 2) * size * t.lineHeight;
      if (t.outline) {ctx.strokeStyle = t.color;ctx.lineWidth = Math.max(1, size / 35);ctx.strokeText(line,tx,y);} else ctx.fillText(line,tx,y);
    });
    ctx.restore();
  }
  if (state.frameWidth) {ctx.strokeStyle=state.frameColor;ctx.lineWidth=state.frameWidth*2;ctx.strokeRect(0,0,W,H);}
  ctx.restore();
  return [...shapeLayouts, ...layouts];
}
