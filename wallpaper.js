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
export const MAX_TEXTS = 8;
export function createText(id, overrides = {}) {
  return { id, text: 'Seu texto aqui', font: 'sans', size: 100, color: '#eee9f5', bold: false,
    italic: false, shadow: false, visible: true, align: 'center', x: 50, y: 50,
    rotation: 0, opacity: 100, ...overrides };
}
export const initialState = {
  version: 2, template: 'orbit', palette: 0, accent: '#b8a0ed', background: '#24232e',
  secondary: '#766591', highlight: '#eee9f5', resolution: '1920x1080', grain: true,
  intensity: 70, name: 'Meu novo universo', exportFormat: 'png', exportQuality: 92,
  texts: [
    createText('title', { text: 'MAKE\nSPACE.', size: 166, bold: true, align: 'left', x: 25, y: 50 }),
    createText('label', { text: 'P E R S O N A L   S P A C E   /   0 1', font: 'mono', size: 15, x: 22, y: 10, opacity: 60 }),
    createText('footer', { text: 'A LITTLE MORE YOU. A LITTLE LESS NOISE.', font: 'mono', size: 17, x: 25, y: 90, opacity: 60 })
  ]
};
const color = value => typeof value === 'string' && /^#[a-f\d]{6}$/i.test(value);
const bounded = (value, min, max, fallback) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
export function validateState(value) {
  const s = structuredClone(initialState);
  if (!value || typeof value !== 'object') return s;
  if (templates.some(t => t.id === value.template)) s.template = value.template;
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
      for (const key of ['bold', 'italic', 'shadow', 'visible']) if (typeof raw[key] === 'boolean') t[key] = raw[key];
      if (['left', 'center', 'right'].includes(raw.align)) t.align = raw.align;
      for (const [key, min, max] of [['size', 12, 260], ['x', 0, 100], ['y', 0, 100], ['rotation', -180, 180], ['opacity', 0, 100]]) t[key] = bounded(raw[key], min, max, t[key]);
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
  return s;
}

// Layout in logical screen coordinates, shared by drawing, selection and dragging.
export function getTextLayouts(ctx, state, W, H) {
  return state.texts.filter(t => t.visible && t.text.trim()).map(t => {
    const lines = t.text.split('\n');
    const family = fonts.find(f => f.id === t.font)?.family || fonts[0].family;
    let size = Math.min(t.size, H * .84 / (lines.length * 1.15));
    const font = () => `${t.italic ? 'italic ' : ''}${t.bold ? '700' : '400'} ${size}px ${family}`;
    ctx.font = font();
    let width = Math.max(...lines.map(line => ctx.measureText(line).width), size / 2);
    if (width > W * .9) { size *= W * .9 / width; ctx.font = font(); width = Math.max(...lines.map(line => ctx.measureText(line).width), size / 2); }
    let height = lines.length * size * 1.15;
    const angle = t.rotation * Math.PI / 180;
    const extent = () => [Math.abs(Math.cos(angle)) * width + Math.abs(Math.sin(angle)) * height, Math.abs(Math.sin(angle)) * width + Math.abs(Math.cos(angle)) * height];
    let [bw, bh] = extent();
    const scale = Math.min(1, W * .94 / bw, H * .94 / bh);
    size *= scale; width *= scale; height *= scale; [bw, bh] = extent();
    const x = Math.min(W - bw / 2 - 10, Math.max(bw / 2 + 10, t.x / 100 * W));
    const y = Math.min(H - bh / 2 - 10, Math.max(bh / 2 + 10, t.y / 100 * H));
    return { t, lines, size, width, height, angle, x, y, font: font() };
  });
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
export function render(canvas, state, { thumbnail = false } = {}) {
  const ctx = canvas.getContext('2d');
  const p = { accent: state.accent, dark: state.background, second: state.secondary, light: state.highlight };
  const H = 1080, W = H * canvas.width / canvas.height, strength = state.intensity / 100;
  // Background artwork keeps its proportions on every monitor shape.
  ctx.save(); ctx.scale(canvas.height / H, canvas.height / H);
  ctx.fillStyle = p.dark; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate((W - 1920) / 2, 0);
  if (state.template === 'orbit') {
    const bg = ctx.createLinearGradient(0, H, W, 0); bg.addColorStop(0, p.dark); bg.addColorStop(1, p.second); ctx.fillStyle = bg; ctx.fillRect(-(W - 1920) / 2, 0, W, H);
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
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, p.dark); sky.addColorStop(1, p.accent); ctx.fillStyle = sky; ctx.fillRect(-(W - 1920) / 2, 0, W, H);
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
    ctx.fillStyle = g; ctx.fillRect(-(W - 1920) / 2, 0, W, H);
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
    ctx.fillStyle = p.dark; ctx.fillRect(-(W - 1920) / 2, 0, W, H); ctx.save(); ctx.globalAlpha = strength;
    ctx.strokeStyle = p.second; ctx.globalAlpha = strength * .12;
    for (let x = -(W - 1920) / 2; x <= (W + 1920) / 2; x += 120) { ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); }
    for (let y = 0; y <= H; y += 120) { ctx.beginPath();ctx.moveTo(-(W - 1920) / 2,y);ctx.lineTo((W + 1920) / 2,y);ctx.stroke(); }
    ctx.globalAlpha = strength; ctx.fillStyle = p.accent; ctx.fillRect(1120, 220, 580, 600);
    ctx.fillStyle = p.dark; ctx.beginPath(); ctx.arc(1410, 220, 290, 0, Math.PI); ctx.fill();
    ctx.fillStyle = p.second; ctx.beginPath(); ctx.arc(1410, 820, 290, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = p.light; ctx.lineWidth = 2; ctx.strokeRect(1040, 300, 580, 600); ctx.restore();
  }
  ctx.restore(); // Artwork transform; text uses the actual screen aspect ratio.
  if (state.grain && !thumbnail) { ctx.save(); ctx.globalAlpha = .065; ctx.fillStyle = ctx.createPattern(noiseTexture(), 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore(); }
  const layouts = thumbnail ? [] : getTextLayouts(ctx, state, W, H);
  for (const box of layouts) {
    const { t, lines, size, width, height, angle, x, y, font } = box;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.font = font;
    ctx.fillStyle = t.color; ctx.globalAlpha = t.opacity / 100;
    ctx.textAlign = t.align; ctx.textBaseline = 'middle';
    if (t.shadow) { ctx.shadowColor = '#000000aa'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5; }
    const tx = t.align === 'left' ? -width / 2 : t.align === 'right' ? width / 2 : 0;
    lines.forEach((line, i) => ctx.fillText(line, tx, -height / 2 + size * 1.15 * (i + .5)));
    ctx.restore();
  }
  ctx.restore();
  return layouts;
}
