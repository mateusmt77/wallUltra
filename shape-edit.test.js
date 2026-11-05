import test from 'node:test';
import assert from 'node:assert/strict';
import { shapeHandles, hitShapeHandle, beginShapeTransform, transformShape } from './shape-edit.js';
import { blankState, createShape, getShapeLayouts, validateState } from './wallpaper.js';
import { parseProject, serializeProject } from './project.js';
const W = 1920, H = 1080;
const shape = createShape('editable', 'rectangle', { width: 320, height: 200, strokeWidth: 12 });
const box = { ...getShapeLayouts({ shapes: [shape] }, W, H)[0] };
function resize(name, delta, proportional = false, source = shape, layout = box) {
  const handle = shapeHandles(layout, W, H, .5).find(h => h.name === name);
  return transformShape(beginShapeTransform(source, layout, handle, handle, W, H, .5), { x: handle.x + delta.x, y: handle.y + delta.y }, proportional);
}
test('há oito alças de tamanho e um controle de contorno acessível no quadro', () => {
  const handles = shapeHandles(box, W, H, .5);
  assert.equal(handles.length, 9);
  assert.deepEqual(handles.map(h => h.name), ['nw','n','ne','e','se','s','sw','w','stroke']);
  const east = handles.find(h => h.name === 'e');
  assert.equal(hitShapeHandle(handles, {x:east.x+40,y:east.y}, .5), undefined);
  assert.equal(hitShapeHandle(handles, {x:east.x+40,y:east.y}, .5, true).name, 'e');
});
test('o canto redimensiona largura e altura mantendo o canto oposto fixo', () => {
  const next = resize('se', {x:160,y:100});
  assert.equal(next.width,480); assert.equal(next.height,300);
  assert.equal(next.x/100*W-next.width/2,box.x-box.width/2);
  assert.equal(next.y/100*H-next.height/2,box.y-box.height/2);
  assert.equal(next.keepInside,false);
});
test('alças laterais alteram apenas a dimensão correspondente', () => {
  const horizontal = resize('e',{x:100,y:70}), vertical = resize('n',{x:80,y:-50});
  assert.equal(horizontal.width,420);assert.equal(horizontal.height,200);assert.equal(horizontal.y,50);
  assert.equal(vertical.width,320);assert.equal(vertical.height,250);
  assert.equal(vertical.y/100*H+vertical.height/2,box.y+box.height/2);
});
test('formas rotacionadas usam eixos locais no redimensionamento', () => {
  const rotated = { ...shape, rotation:90 }, layout = getShapeLayouts({shapes:[rotated]},W,H)[0];
  const next = resize('e',{x:0,y:160},false,rotated,layout);
  assert.ok(Math.abs(next.width-480)<1e-9);assert.equal(next.height,200);
  assert.ok(Math.abs(next.y/100*H-next.width/2-(layout.y-layout.width/2))<1e-9);
  assert.ok(Math.abs(next.x/100*W-layout.x)<1e-9);
});
test('Shift preserva a proporção e os limites de dimensão continuam válidos', () => {
  const next=resize('se',{x:100,y:10},true);
  assert.ok(Math.abs(next.width/next.height-1.6)<1e-9);
  const huge=resize('se',{x:99999,y:99999},true);
  assert.ok(huge.width<=4000&&huge.height<=2160);
  const small=resize('nw',{x:99999,y:99999});assert.equal(small.width,1);assert.equal(small.height,1);
});
test('o círculo amarelo controla a espessura, inclusive a remoção do contorno', () => {
  assert.equal(resize('stroke',{x:60,y:500}).strokeWidth,42);
  assert.equal(resize('stroke',{x:-9999,y:0}).strokeWidth,0);
  assert.equal(resize('stroke',{x:9999,y:0}).strokeWidth,240);
  const outline={...shape,fill:false};assert.equal(resize('stroke',{x:-9999,y:0},false,outline).strokeWidth,.5);
});
test('posições fora do quadro não são perdidas ao salvar e reabrir', () => {
  const project={...blankState(),shapes:[createShape('cropped','ellipse',{x:-12,y:115,width:700,height:600})]};
  const loaded=parseProject(serializeProject(project));assert.deepEqual(loaded,project);
  const [layout]=getShapeLayouts(loaded,W,H);assert.equal(layout.x,-.12*W);assert.equal(layout.y,1.15*H);assert.equal(layout.width,700);
  assert.equal(validateState({shapes:[{...shape,x:-900,y:900}]}).shapes[0].x,-200);
});
test('alças de formas parcialmente fora do quadro continuam dentro da área visível', () => {
  const outside=getShapeLayouts({shapes:[{...shape,x:-5,y:0}]},W,H)[0];
  assert.ok(shapeHandles(outside,W,H,.5).every(h=>h.x>=0&&h.x<=W&&h.y>=0&&h.y<=H));
});
