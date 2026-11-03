export const palettes = [
  { name: 'Lavanda', accent: '#b8a0ed', dark: '#24232e', light: '#eee9f5', second: '#766591' },
  { name: 'Sálvia', accent: '#b2c99e', dark: '#202d2b', light: '#eff0df', second: '#668c7d' },
  { name: 'Pêssego', accent: '#efb091', dark: '#382a2c', light: '#ffede2', second: '#b86b72' },
  { name: 'Oceano', accent: '#91bfe2', dark: '#1c2b3b', light: '#e6eef5', second: '#477ca1' },
  { name: 'Areia', accent: '#dbc78e', dark: '#302e27', light: '#f5f0df', second: '#9b8c65' }
];
export const templates = [
  { id: 'orbit', name: 'Órbita', tag: 'Abstrato', text: 'MAKE\nSPACE.', palette: 0 },
  { id: 'landscape', name: 'Horizonte', tag: 'Natureza', text: 'vá com calma.', palette: 1 },
  { id: 'aurora', name: 'Aurora', tag: 'Gradiente', text: 'breathe.', palette: 3 },
  { id: 'geometry', name: 'Equilíbrio', tag: 'Geométrico', text: 'LESS,\nBUT BETTER.', palette: 4 }
];
export const initialState = { template: 'orbit', palette: 0, accent: '#b8a0ed', resolution: '1920x1080', text: 'MAKE\nSPACE.', showText: true, font: 'sans', align: 'left', grain: true, intensity: 70, name: 'Meu novo universo' };
export function validateState(value) {
  if (!value || typeof value !== 'object') return { ...initialState };
  const s = { ...initialState };
  if (templates.some(t => t.id === value.template)) s.template = value.template;
  if (Number.isInteger(value.palette) && palettes[value.palette]) s.palette = value.palette;
  if (/^#[a-f\d]{6}$/i.test(value.accent)) s.accent = value.accent;
  if (['1920x1080', '2560x1440', '3840x2160', '2560x1080'].includes(value.resolution)) s.resolution = value.resolution;
  for (const key of ['showText', 'grain']) if (typeof value[key] === 'boolean') s[key] = value[key];
  for (const [key, limit] of [['text', 90], ['name', 60]]) if (typeof value[key] === 'string') s[key] = value[key].slice(0, limit);
  if (['sans', 'serif', 'mono'].includes(value.font)) s.font = value.font;
  if (['left', 'center', 'right'].includes(value.align)) s.align = value.align;
  if (Number.isFinite(value.intensity)) s.intensity = Math.min(100, Math.max(0, value.intensity));
  return s;
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
  const p = { ...palettes[state.palette], accent: state.accent };
  const W = 1920, H = 1080, strength = state.intensity / 100;
  ctx.save(); ctx.scale(canvas.width / W, canvas.height / H);
  ctx.fillStyle = p.dark; ctx.fillRect(0, 0, W, H);
  if (state.template === 'orbit') {
    const bg = ctx.createLinearGradient(0, H, W, 0); bg.addColorStop(0, p.dark); bg.addColorStop(1, '#44404d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
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
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, p.dark); sky.addColorStop(1, p.accent); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = strength;
    ctx.fillStyle = p.light; ctx.beginPath(); ctx.arc(1420, 340, 130, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = [p.second, p.accent, p.second, p.dark][i]; ctx.globalAlpha = strength * (.6 + i * .13);
      ctx.beginPath(); ctx.moveTo(0, 540 + i * 145); ctx.bezierCurveTo(400, 160 + i * 190, 680, 1080 - i * 100, 1100, 560 + i * 130); ctx.bezierCurveTo(1500, 220 + i * 160, 1700, 680 + i * 150, W, 520 + i * 140); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    } ctx.restore();
  } else if (state.template === 'aurora') {
    ctx.save(); ctx.globalAlpha = strength;
    for (const [x,y,r,color] of [[350,800,1000,p.second],[1380,230,1050,p.accent],[1700,1000,750,p.second]]) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    }
    ctx.strokeStyle = p.light; ctx.globalAlpha = strength * .12;
    for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.ellipse(1400, 650, 420 + i * 42, 100 + i * 28, -.6, 0, Math.PI * 2); ctx.stroke(); } ctx.restore();
  } else {
    ctx.fillStyle = p.light; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalAlpha = strength;
    ctx.strokeStyle = p.second; ctx.globalAlpha = strength * .12;
    for (let x = 0; x <= W; x += 120) { ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); }
    for (let y = 0; y <= H; y += 120) { ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }
    ctx.globalAlpha = strength; ctx.fillStyle = p.accent; ctx.fillRect(1120, 220, 580, 600);
    ctx.fillStyle = p.dark; ctx.beginPath(); ctx.arc(1410, 220, 290, 0, Math.PI); ctx.fill();
    ctx.fillStyle = p.second; ctx.beginPath(); ctx.arc(1410, 820, 290, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = p.dark; ctx.lineWidth = 2; ctx.strokeRect(1040, 300, 580, 600); ctx.restore();
  }
  if (state.grain && !thumbnail) { ctx.save();ctx.globalAlpha = .065; ctx.fillStyle = ctx.createPattern(noiseTexture(), 'repeat');ctx.fillRect(0,0,W,H);ctx.restore(); }
  const textColor = state.template === 'geometry' ? p.dark : p.light;
  if (state.showText && state.text.trim()) {
    const family = state.font === 'serif' ? 'Georgia, serif' : state.font === 'mono' ? 'monospace' : 'Arial, sans-serif';
    const lines = state.text.split('\n');
    const area = state.align === 'left' ? 1000 : 1640;
    let fontSize = Math.min(state.font === 'serif' ? 160 : 166, 510 / Math.max(lines.length,1));
    const setFont = () => { ctx.font = `${state.font === 'sans' ? '700' : '400'} ${fontSize}px ${family}`; }; setFont();
    const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    if (maxWidth > area) { fontSize *= area / maxWidth; setFont(); }
    ctx.fillStyle = textColor; ctx.textAlign = state.align; ctx.textBaseline = 'middle';
    const x = state.align === 'left' ? 140 : state.align === 'right' ? 1780 : 960;
    const lineH = fontSize * 1.04, y = H / 2 - (lines.length - 1) * lineH / 2;
    lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineH));
  }
  if (!thumbnail) {
    ctx.fillStyle = textColor;ctx.globalAlpha = .55;ctx.font = '15px monospace';ctx.textAlign = 'left';ctx.textBaseline = 'alphabetic';
    ctx.fillText('P E R S O N A L   S P A C E   /   0 1', 140, 110);
    ctx.font = '17px monospace';ctx.fillText('A LITTLE MORE YOU. A LITTLE LESS NOISE.', 140, 975);
    ctx.textAlign = 'right';ctx.fillText('✳', 1780, 975);
  }
  ctx.restore();
}
