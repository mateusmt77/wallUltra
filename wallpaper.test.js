import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, validateState, createText, MAX_TEXTS, getTextLayouts, resolutions } from './wallpaper.js';

test('restaura todas as opções de um projeto com várias camadas', () => {
  const project = {
    ...structuredClone(initialState), template: 'stars', palette: 8, accent: '#112233',
    background: '#101020', secondary: '#445566', highlight: '#aabbcc',
    resolution: '5120x1440', grain: false, intensity: 25, name: 'Meu projeto', exportFormat: 'webp', exportQuality: 80,
    texts: [createText('custom', { text: 'Olá\nmundo', font: 'classic', bold: true, italic: true, shadow: true, color: '#ffffff', x: 12, y: 80, rotation: 45, opacity: 70 }), createText('other', { visible: false })]
  };
  assert.deepEqual(validateState(project), project);
});
test('migra os projetos do protótipo original preservando texto, fonte e visibilidade', () => {
  const s = validateState({ template: 'landscape', palette: 1, text: 'Meu texto antigo', font: 'serif', align: 'right', showText: false, name: 'Antigo', resolution: '3840x2160', grain: false });
  assert.equal(s.texts[0].text, 'Meu texto antigo');
  assert.equal(s.texts[0].font, 'serif'); assert.equal(s.texts[0].visible, false);
  assert.equal(s.texts[0].align, 'right'); assert.equal(s.texts[0].x, 75);
  assert.equal(s.background, '#202d2b'); assert.equal(s.name, 'Antigo');
  assert.equal(s.resolution, '3840x2160'); assert.equal(s.version, 5);
});
test('projetos sem textos continuam sem textos ao recarregar', () => {
  assert.deepEqual(validateState({ texts: [] }).texts, []);
});
test('projetos corrompidos usam padrões seguros e não compartilham objetos', () => {
  assert.deepEqual(validateState(null), initialState);
  const a = validateState(null); a.texts[0].text = 'mudou';
  assert.notEqual(initialState.texts[0].text, a.texts[0].text);
  const bad = validateState({ palette: 99, template: 'missing', resolution: '99999x99999', accent: 'invalid', intensity: NaN, exportFormat: 'invalid', exportQuality: -20 });
  assert.equal(bad.template, 'orbit'); assert.equal(bad.palette, 0);
  assert.equal(bad.exportFormat, 'png'); assert.equal(bad.exportQuality, 10);
  assert.equal(bad.resolution, '1920x1080'); assert.equal(bad.accent, initialState.accent);
});
test('limita camadas, conteúdo e valores numéricos de projetos externos', () => {
  const s = validateState({ intensity: 900, name: 'y'.repeat(100), texts: Array.from({length: MAX_TEXTS + 10}, () => ({ id: 'duplicate', text: 'x'.repeat(1000), size: 999, x: -10, y: 999, rotation: 900, opacity: -20, color: 'red', visible: 'yes', unexpected: true })) });
  assert.equal(s.texts.length, MAX_TEXTS); assert.equal(new Set(s.texts.map(t => t.id)).size, MAX_TEXTS);
  assert.equal(s.name.length, 60); assert.equal(s.intensity, 100);
  const t = s.texts[0]; assert.equal(t.text.length, 300); assert.equal(t.size, 260);
  assert.equal(t.x, 0); assert.equal(t.y, 100); assert.equal(t.rotation, 180); assert.equal(t.opacity, 0);
  assert.equal(t.color, '#eee9f5'); assert.equal(t.visible, true); assert.equal(t.unexpected, undefined);
});
test('textos longos e rotacionados cabem em todos os formatos de monitor', () => {
  const ctx = { font: '', measureText(text) { const size = Number(this.font.match(/([\d.]+)px/)[1]); return { width: text.length * size * .6 }; } };
  for (const resolution of resolutions) {
    const [w, h] = resolution.value.split('x').map(Number);
    const W = 1080 * w / h;
    const s = { texts: [createText('long', {text:'Teste longo '.repeat(25), size:260, rotation:45,x:0,y:100}), createText('lines', {text:'Linha\n'.repeat(80), rotation:90}), createText('hidden',{visible:false}), createText('empty',{text:''})] };
    const layouts = getTextLayouts(ctx, s, W, 1080);
    assert.equal(layouts.length, 2);
    for (const box of layouts) {
      const bw = Math.abs(Math.cos(box.angle))*box.width + Math.abs(Math.sin(box.angle))*box.height;
      const bh = Math.abs(Math.sin(box.angle))*box.width + Math.abs(Math.cos(box.angle))*box.height;
      assert.ok(box.x - bw/2 >= 0 && box.x + bw/2 <= W, resolution.name);
      assert.ok(box.y - bh/2 >= 0 && box.y + bh/2 <= 1080, resolution.name);
    }
  }
});
