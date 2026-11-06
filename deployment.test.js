import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSite } from './scripts/build.mjs';
import { publicFiles } from './site-files.mjs';
import { createMembership } from './membership.mjs';

const config = { VERCEL:'1', WALLULTRA_SESSION_SECRET:'deployment-test-secret-over-32-characters', WALLULTRA_HIGH_CODE:'deployment-test-high-code' };
function request(handler, pathname, { method='GET', body, cookie='', origin='https://wallultra.example', headers={} } = {}) {
  const req = { method, body, headers:{ host:'wallultra.example', origin, cookie, ...headers } };
  // Intentionally no readable stream or TLS socket, matching pre-parsed function requests.
  const res = { headers:{}, setHeader(key,value){this.headers[key]=value;}, writeHead(status,headers){this.status=status;Object.assign(this.headers,headers);}, end(raw){this.body=JSON.parse(raw);} };
  return handler(req,res,pathname).then(() => res);
}
test('Vercel recebe somente os arquivos públicos e desativa a autodetecção do app.js', async () => {
  const dir=await mkdtemp(join(tmpdir(),'wallultra-build-'));
  try {
    assert.equal(await buildSite(dir),publicFiles.length);
    for(const file of publicFiles) assert.ok((await stat(join(dir,file))).size>0);
    const published=await readdir(dir,{recursive:true});
    for(const name of ['server.mjs','membership.mjs','.env','.env.example','membership.test.js','README.md']) assert.equal(published.includes(name),false);
    const html=await readFile(join(dir,'index.html'),'utf8');
    for(const match of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css|woff2|svg))"/g)) assert.ok(publicFiles.includes(match[1]),match[1]);
    const cfg=JSON.parse(await readFile(new URL('./vercel.json',import.meta.url),'utf8'));
    assert.equal(cfg.framework,null);assert.equal(cfg.outputDirectory,'public');assert.equal(cfg.buildCommand,'npm run build');
  } finally {await rm(dir,{recursive:true,force:true});}
});
test('ativação e autorização funcionam com JSON já interpretado e HTTPS terminado no Vercel', async () => {
  const handler=createMembership(config);
  const activation=await request(handler,'/api/membership/activate',{method:'POST',body:{code:config.WALLULTRA_HIGH_CODE}});
  assert.equal(activation.status,200);assert.equal(activation.body.plan,'high');
  assert.match(activation.headers['Set-Cookie'],/Secure/);
  const cookie=activation.headers['Set-Cookie'].split(';')[0];
  assert.equal((await request(handler,'/api/membership',{cookie})).body.plan,'high');
  assert.equal((await request(handler,'/api/access',{method:'POST',cookie,body:Buffer.from(JSON.stringify({feature:'blend'}))})).status,200);
  const removed=await request(handler,'/api/membership',{method:'DELETE',cookie});assert.match(removed.headers['Set-Cookie'],/Max-Age=0; Secure/);
});
test('a função rejeita origem externa, JSON inválido e corpo excessivo', async () => {
  const handler=createMembership(config);
  assert.equal((await request(handler,'/api/membership/activate',{method:'POST',body:{code:config.WALLULTRA_HIGH_CODE},origin:'https://foreign.example'})).status,403);
  assert.equal((await request(handler,'/api/access',{method:'POST',body:'invalid'})).status,400);
  assert.equal((await request(handler,'/api/access',{method:'POST',body:{feature:'x'.repeat(9000)}})).status,413);
  assert.equal((await request(handler,'/api/access',{method:'POST',body:null})).status,400);
});
test('os três entrypoints exportam handlers sem abrir portas', async () => {
  for(const [entry,method] of [['./api/membership.mjs','GET'],['./api/access.mjs','POST'],['./api/membership/activate.mjs','POST']]) {
    const {default:handler}=await import(entry);assert.equal(typeof handler,'function');
    const res=await request(handler,'ignored',{method,origin:undefined,body:{feature:'blend'}});
    assert.notEqual(res.status,500);assert.ok(res.body);
  }
});
