import test from 'node:test';
import assert from 'node:assert/strict';
import { canUse, requiredPlan, resolutionPlan, hasPlan } from './plans.js';
import { blankState, validateState } from './wallpaper.js';
import { serializeProject, parseProject } from './project.js';
test('a política é cumulativa, desconhecidos não concedem acesso', () => {
  assert.equal(canUse('basic','gradient3'),false); assert.equal(canUse('medium','gradient3'),true);
  assert.equal(canUse('medium','blend'),false); assert.equal(canUse('high','gradient3'),true);
  assert.equal(canUse('high','invalid'),false); assert.equal(canUse('high','__proto__'),false); assert.equal(hasPlan('invalid','basic'),false);
});
test('resoluções respeitam os limites e múltiplos monitores', () => {
  for(const r of ['1920x1080','1920x1200','1600x1200']) assert.equal(resolutionPlan(r),'basic');
  for(const r of ['3840x2160','3440x1440']) assert.equal(resolutionPlan(r),'medium');
  for(const r of ['7680x4320','3840x1080','5120x1440']) assert.equal(resolutionPlan(r),'high');
});
test('importação não contorna direitos nem destrói conteúdo premium', () => {
  const s=blankState(); s.gradient3=true; s.texts=[{text:'Meu texto',shadow:true}];
  const imported=parseProject(serializeProject(s)); assert.equal(requiredPlan(imported),'medium');
  assert.equal(imported.gradient3,true); assert.equal(imported.texts[0].shadow,true);
  assert.equal(hasPlan('basic',requiredPlan(imported)),false);
  s.image={blend:'overlay'}; assert.equal(requiredPlan(s),'high');
});
test('efeitos novos são validados, migrados e preservados no projeto', () => {
  const src='data:image/png;base64,AAAA';
  const s=validateState({...blankState(),gradient3:true,image:{src,saturation:160,contrast:120,blend:'screen'}});
  assert.deepEqual(parseProject(serializeProject(s)),s);
  const old=validateState({image:{src,saturation:999,contrast:-50,blend:'invalid'}});
  assert.equal(old.image.saturation,200); assert.equal(old.image.contrast,0); assert.equal(old.image.blend,'source-over');
  assert.equal(validateState({image:{src}}).image.saturation,100);
});
