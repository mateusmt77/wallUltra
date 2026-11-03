import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, validateState } from './wallpaper.js';
test('restaura um projeto válido sem perder opções',()=>{
  const project={...initialState,template:'geometry',palette:4,accent:'#112233',text:'Olá\nmundo',font:'serif',align:'right',resolution:'3840x2160',grain:false,showText:false,intensity:25,name:'Meu projeto'};
  assert.deepEqual(validateState(project),project);
});
test('projetos antigos ou corrompidos voltam a valores utilizáveis',()=>{
  assert.deepEqual(validateState(null),initialState);
  assert.deepEqual(validateState({palette:99,template:'missing',resolution:'99999x99999',accent:'invalid',font:'fake',showText:'yes'}),initialState);
});
test('limita conteúdo e intensidade sem propagar campos desconhecidos',()=>{
  const state=validateState({text:'x'.repeat(1000),name:'y'.repeat(100),intensity:900,unexpected:'ignored'});
  assert.equal(state.text.length,90);assert.equal(state.name.length,60);assert.equal(state.intensity,100);assert.equal(state.unexpected,undefined);
  assert.equal(validateState({intensity:-5}).intensity,0);
});
