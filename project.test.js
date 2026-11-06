import test from 'node:test';
import assert from 'node:assert/strict';
import { blankState, initialState, validateState, createShape, getShapeLayouts, MAX_SHAPES, moveLayer } from './wallpaper.js';
import { loadWorkspaces, parseProject, serializeProject } from './project.js';

test('criação livre é vazia e independente dos estilos', () => {
  const blank = blankState();
  assert.equal(blank.mode, 'blank'); assert.equal(blank.template, 'blank');
  assert.deepEqual(blank.texts, []); assert.deepEqual(blank.shapes, []); assert.equal(blank.image, null);
  assert.equal(blank.grain, false); assert.equal(blank.backgroundMode, 'solid');
  blank.texts.push({text:'teste'}); assert.equal(initialState.texts.length, 3);
  assert.deepEqual(validateState({ mode: 'blank' }).texts, []);
});
test('salvamento recupera os dois espaços sem misturar seus conteúdos', () => {
  const templates = structuredClone(initialState), blank = blankState();
  templates.name = 'Estilos'; blank.name = 'Livre'; blank.shapes.push(createShape('one', 'star'));
  const result = loadWorkspaces(JSON.stringify({ app:'wallultra-workspaces',activeMode:'blank',projects:{templates,blank} }));
  assert.equal(result.activeMode,'blank'); assert.equal(result.projects.templates.name,'Estilos');
  assert.equal(result.projects.blank.name,'Livre'); assert.equal(result.projects.blank.shapes[0].type,'star');
  result.projects.blank.shapes[0].color='#000000';assert.equal(templates.shapes.length,0);
});
test('salvamentos antigos continuam no espaço de estilos', () => {
  const result=loadWorkspaces(JSON.stringify({text:'Projeto antigo',font:'serif',name:'Meu título'}));
  assert.equal(result.activeMode,'templates');assert.equal(result.projects.templates.texts[0].text,'Projeto antigo');
  assert.equal(result.projects.templates.name,'Meu título');assert.equal(result.projects.blank.texts.length,0);
});
test('arquivo de projeto preserva formas, imagem e efeitos', () => {
  const project = {...blankState(),backgroundMode:'linear',gradientAngle:225,pattern:'dots',patternOpacity:24,vignette:40,frameWidth:12,frameColor:'#ff0000',shapes:[createShape('star','star',{strokeWidth:12,shadow:true,rotation:40})],image:{src:'data:image/png;base64,AAAA',name:'Imagem',fit:'contain',saturation:100,contrast:100,blend:'source-over',zoom:130,opacity:80,x:25,y:75}};
  assert.deepEqual(parseProject(serializeProject(project)),project);
});
test('arquivos incompatíveis e imagens externas são rejeitados antes de editar', () => {
  assert.throws(()=>parseProject('invalid'));
  assert.throws(()=>parseProject('{}'));
  assert.throws(()=>parseProject(JSON.stringify({app:'wallultra',schema:99,project:initialState})));
  assert.throws(()=>parseProject(serializeProject({...blankState(),image:{src:'https://example.com/image.png'}})));
  assert.equal(validateState({image:{src:'javascript:alert(1)'}}).image,null);
});
test('limita formas e normaliza valores importados', () => {
  const project=validateState({...blankState(),shapes:Array.from({length:MAX_SHAPES+10},()=>({id:'same',type:'wrong',width:99999,height:-50,strokeWidth:100,rotation:Infinity,opacity:-5}))});
  assert.equal(project.shapes.length,MAX_SHAPES);assert.equal(new Set(project.shapes.map(s=>s.id)).size,MAX_SHAPES);
  assert.equal(project.shapes[0].type,'ellipse');assert.equal(project.shapes[0].width,4000);assert.equal(project.shapes[0].height,1);
  assert.equal(project.shapes[0].strokeWidth,100);assert.equal(project.shapes[0].rotation,0);assert.equal(project.shapes[0].opacity,0);
});
test('ordenação de camadas não altera o estado anterior e respeita as bordas', () => {
  const layers=[{id:'a'},{id:'b'},{id:'c'}];
  assert.deepEqual(moveLayer(layers,'b',1),[{id:'a'},{id:'c'},{id:'b'}]);
  assert.deepEqual(moveLayer(layers,'a',-1),layers);assert.deepEqual(moveLayer(layers,'missing',1),layers);
  assert.deepEqual(layers,[{id:'a'},{id:'b'},{id:'c'}]);
});
test('formas rotacionadas mantêm as proporções e cabem em monitores diferentes', () => {
  for (const W of [1440,1920,3840]) {
    const [box]=getShapeLayouts({shapes:[createShape('a','rectangle',{width:1400,height:1000,x:0,y:100,rotation:45,keepInside:true})]},W,1080);
    const bw=Math.abs(Math.cos(box.angle))*box.width+Math.abs(Math.sin(box.angle))*box.height;
    const bh=Math.abs(Math.sin(box.angle))*box.width+Math.abs(Math.cos(box.angle))*box.height;
    assert.ok(box.x-bw/2>=0&&box.x+bw/2<=W);assert.ok(box.y-bh/2>=0&&box.y+bh/2<=1080);
    assert.ok(Math.abs(box.width/box.height-1.4)<.000001);
  }
});
