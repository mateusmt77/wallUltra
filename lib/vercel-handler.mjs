import { createMembership } from '../membership.mjs';
const membership = createMembership();
export function apiHandler(pathname) {
  return async (req, res) => {
    try {
      await membership(req, res, pathname);
    } catch {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ error: 'Não foi possível processar a solicitação. Tente novamente.' }));
      } else if (!res.writableEnded) res.end();
    }
  };
}
