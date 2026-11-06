import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { Readable } from 'node:stream';
import { createMembership } from './membership.mjs';
const config={WALLULTRA_SESSION_SECRET:'test-only-secret-with-at-least-32-characters',WALLULTRA_MEDIUM_CODE:'test-medium-invite-code',WALLULTRA_HIGH_CODE:'test-high-invite-code'};
function client(handler) {
  let cookie='';
  return async (path,method='GET',body={},headers={}) => {
    const req=Readable.from(method==='POST' ? [JSON.stringify(body)] : []);
    req.method=method;req.headers={host:'localhost',cookie,...headers};req.socket={remoteAddress:'127.0.0.1'};
    const res={headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(status,headers){this.status=status;Object.assign(this.headers,headers);},end(raw){this.body=JSON.parse(raw);}};
    await handler(req,res,path);if(res.headers['Set-Cookie']) cookie=res.headers['Set-Cookie'].split(';')[0];
    return res;
  };
}
test('Basic por padrão; código válido é necessário e cookie adulterado não eleva o plano',async()=>{
  const call=client(createMembership(config));
  assert.equal((await call('/api/membership')).body.plan,'basic');
  assert.equal((await call('/api/membership/activate','POST',{plan:'high',code:'bad'})).status,403);
  assert.equal((await call('/api/access','POST',{feature:'blend'})).status,403);
  const activated=await call('/api/membership/activate','POST',{code:config.WALLULTRA_MEDIUM_CODE});
  assert.match(activated.headers['Set-Cookie'],/HttpOnly; SameSite=Strict/);
  assert.equal((await call('/api/membership')).body.plan,'medium');
  assert.equal((await call('/api/access','POST',{feature:'gradient3'})).status,200);
  assert.equal((await call('/api/access','POST',{feature:'blend'})).status,403);
  assert.equal((await call('/api/membership','GET',{}, {cookie:'wallultra_access=eyJwbGFuIjoiaGlnaCJ9.forged'})).body.plan,'basic');
  await call('/api/membership/activate','POST',{code:config.WALLULTRA_HIGH_CODE});
  assert.equal((await call('/api/access','POST',{feature:'blend'})).status,200);
  await call('/api/membership','DELETE');assert.equal((await call('/api/membership')).body.plan,'basic');
});
test('sem segredos não ativa planos; origem externa e tentativas excessivas são recusadas',async()=>{
  const disabled=client(createMembership({})); assert.equal((await disabled('/api/membership/activate','POST',{code:'anything'})).status,503);
  const call=client(createMembership(config));
  assert.equal((await call('/api/membership/activate','POST',{code:config.WALLULTRA_HIGH_CODE},{origin:'https://foreign.test'})).status,403);
  for(let i=0;i<10;i++) await call('/api/membership/activate','POST',{code:'bad'});
  assert.equal((await call('/api/membership/activate','POST',{code:config.WALLULTRA_HIGH_CODE})).status,429);
});
test('exportação verifica recursos do projeto e entrada inválida não derruba API',async()=>{
  const call=client(createMembership(config));
  assert.equal((await call('/api/access','POST',{project:{resolution:'3840x2160',template:'blank',shapes:[],texts:[]}})).status,403);
  assert.equal((await call('/api/access','POST',{project:{shapes:{},texts:[]}})).status,400);
});

test('sessões vencidas retornam ao Basic e erros de metadados são recusados',async()=>{
  const call=client(createMembership(config));
  const data=Buffer.from(JSON.stringify({plan:'high',exp:Date.now()-1000})).toString('base64url');
  const sig=createHmac('sha256',config.WALLULTRA_SESSION_SECRET).update(data).digest('base64url');
  assert.equal((await call('/api/membership','GET',{}, {cookie:`wallultra_access=${data}.${sig}`})).body.plan,'basic');
  assert.equal((await call('/api/access','POST',{feature:'__proto__'})).status,403);
  assert.equal((await call('/api/access','POST',{project:{resolution:{toString:0},shapes:[],texts:[]}})).status,400);
});
