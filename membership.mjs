import { createHmac, timingSafeEqual } from 'node:crypto';
import { plans, canUse, hasPlan, requiredPlan } from './plans.js';
const equal = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
export function createMembership(config = process.env) {
  const secret = config.WALLULTRA_SESSION_SECRET;
  const enabled = typeof secret === 'string' && secret.length >= 32;
  const sign = value => createHmac('sha256', secret).update(value).digest('base64url');
  function getPlan(req) {
    if (!enabled) return 'basic';
    try {
      const token = req.headers.cookie?.split(';').map(x => x.trim()).find(x => x.startsWith('wallultra_access='))?.slice(17);
      if (!token) return 'basic';
      const [data, signature] = token.split('.');
      if (!signature || !equal(sign(data), signature)) return 'basic';
      const payload = JSON.parse(Buffer.from(data, 'base64url'));
      return Object.hasOwn(plans, payload.plan) && payload.exp > Date.now() ? payload.plan : 'basic';
    } catch { return 'basic'; }
  }
  const attempts = new Map();
  // Vercel terminates HTTPS before Node; forwarded headers from arbitrary local proxies are not trusted.
  const secureCookies = config.NODE_ENV === 'production' || config.VERCEL === '1';
  return async function membership(req, res, pathname) {
    if (!pathname.startsWith('/api/')) return false;
    const json = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vercel-CDN-Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); return true; };
    if (pathname === '/api/membership' && req.method === 'GET') return json(200, { plan: getPlan(req), activationAvailable: enabled && ['WALLULTRA_MEDIUM_CODE', 'WALLULTRA_HIGH_CODE'].some(key => typeof config[key] === 'string' && config[key].length >= 16) });
    const expectedOrigin = config.WALLULTRA_ORIGIN || `${config.VERCEL === '1' || req.socket?.encrypted ? 'https' : 'http'}://${req.headers.host}`;
    if (req.headers.origin && req.headers.origin !== expectedOrigin) return json(403, { error: 'Origem não permitida.' });
    if (pathname === '/api/membership' && req.method === 'DELETE') {
      res.setHeader('Set-Cookie', 'wallultra_access=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' + (secureCookies ? '; Secure' : ''));
      return json(200, { plan: 'basic' });
    }
    if (req.method !== 'POST') return json(404, { error: 'Rota não encontrada.' });
    let raw = '';
    try {
      // Vercel may parse JSON before invoking the function. Local Node provides a stream.
      if (req.body !== undefined) raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      else {
        for await (const chunk of req) {
          raw += chunk;
          if (Buffer.byteLength(raw) > 8192) return json(413, { error: 'Solicitação muito grande.' });
        }
      }
      if (Buffer.byteLength(raw) > 8192) return json(413, { error: 'Solicitação muito grande.' });
    } catch { return json(400, { error: 'Solicitação inválida.' }); }
    let body; try { body = JSON.parse(raw); } catch { return json(400, { error: 'JSON inválido.' }); }
    if (!body || typeof body !== 'object') return json(400, { error: 'Solicitação inválida.' });
    if (pathname === '/api/membership/activate') {
      if (!enabled) return json(503, { error: 'Ativação ainda não disponível. Continue criando com wallBasic.' });
      const ip = config.VERCEL === '1' ? req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown' : req.socket?.remoteAddress || 'unknown';
      const now = Date.now();
      for (const [key, item] of attempts) if (item.until < now) attempts.delete(key);
      const item = attempts.get(ip) || { count: 0, until: now + 600000 };
      if (++item.count > 10) return json(429, { error: 'Muitas tentativas. Aguarde 10 minutos.' });
      attempts.set(ip, item);
      const code = typeof body.code === 'string' ? body.code : '';
      const plan = ['high', 'medium'].find(p => config[`WALLULTRA_${p.toUpperCase()}_CODE`]?.length >= 16 && equal(code, config[`WALLULTRA_${p.toUpperCase()}_CODE`]));
      if (!plan) return json(403, { error: 'Código inválido ou indisponível.' });
      const data = Buffer.from(JSON.stringify({ plan, exp: now + 7 * 86400000 })).toString('base64url');
      const secure = secureCookies ? '; Secure' : '';
      res.setHeader('Set-Cookie', `wallultra_access=${data}.${sign(data)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secure}`);
      return json(200, { plan });
    }
    if (pathname === '/api/access') {
      const plan = getPlan(req);
      if (body.project && (typeof body.project.resolution !== 'string' || !Array.isArray(body.project.shapes) || !Array.isArray(body.project.texts))) return json(400, { error: 'Metadados inválidos.' });
      const allowed = typeof body.feature === 'string' ? canUse(plan, body.feature) : body.project && hasPlan(plan, requiredPlan(body.project));
      return json(allowed ? 200 : 403, { allowed: !!allowed, plan });
    }
    return json(404, { error: 'Rota não encontrada.' });
  };
}
