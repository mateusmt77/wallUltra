import test from 'node:test';
import assert from 'node:assert/strict';
import { drawingPoint, validateStrokes, MAX_STROKE_POINTS, MAX_DRAWING_POINTS } from './drawing.js';
import { blankState, validateState, shapeTypes, createShape } from './wallpaper.js';
import { serializeProject, parseProject, loadWorkspaces } from './project.js';

const pen = { tool:'pen',color:'#ff3366',size:14,opacity:80,pressure:false,points:[[0,.5,1],[.1,.6,1]] };
test('projetos antigos ganham uma camada de desenho vazia',()=>{
  assert.deepEqual(validateState({version:3,texts:[]}).strokes,[]);
  assert.deepEqual(blankState().strokes,[]);
});
test('tinta e borracha preservam ordem e propriedades no arquivo de projeto',()=>{
  const strokes=[pen,{tool:'eraser',color:'#ffffff',size:32,opacity:65,pressure:false,points:[[.05,.55,1]]}];
  const project={...blankState(),strokes};
  assert.deepEqual(parseProject(serializeProject(project)),project);
  const saved=loadWorkspaces(JSON.stringify({app:'wallultra-workspaces',activeMode:'blank',projects:{blank:project}}));
  assert.deepEqual(saved.projects.blank.strokes,strokes);assert.deepEqual(saved.projects.templates.strokes,[]);
});
test('coordenadas guardam o centro e proporções do desenho em monitores diferentes',()=>{
  const p=drawingPoint(1060,540,1920,.4);
  assert.ok(Math.abs(p[0]-100/1080)<1e-12);assert.equal(p[1],.5);assert.equal(p[2],.4);
  assert.equal(Math.round(p[0]*1080+3840/2),2020);
});
test('traços inválidos não viram linhas acidentais nem comandos de canvas',()=>{
  assert.deepEqual(validateStrokes([null,{tool:'javascript',points:[[0,0,1]]},{tool:'pen',points:[[NaN,0],[1,Infinity],[]]}]),[]);
  const [stroke]=validateStrokes([{...pen,color:'url(secret)',size:Infinity,opacity:-20,points:[[900,-900,12],[null,1,1],[0,.5]]}]);
  assert.equal(stroke.color,'#ffffff');assert.equal(stroke.size,6);assert.equal(stroke.opacity,0);
  assert.deepEqual(stroke.points,[[4,-2,1],[0,.5,1]]);
});
test('importações respeitam os limites de pontos para manter o editor responsivo',()=>{
  const points=Array.from({length:MAX_STROKE_POINTS+500},()=>[0,.5,1]);
  const strokes=validateStrokes(Array.from({length:50},()=>({...pen,points})));
  assert.ok(strokes.every(s=>s.points.length<=MAX_STROKE_POINTS));
  assert.equal(strokes.reduce((n,s)=>n+s.points.length,0),MAX_DRAWING_POINTS);
});
test('novas formas, contornos, reflexos e liberdade de borda são recuperados',()=>{
  assert.equal(shapeTypes.length,24);
  const project={...blankState(),shapes:shapeTypes.map((type,i)=>createShape('s'+i,type.id,{fill:false,keepInside:false,flipX:true,strokeWidth:100,width:2,height:2000}))};
  assert.deepEqual(parseProject(serializeProject(project)),project);
});
