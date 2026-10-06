import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, extname, basename } from 'node:path';
import { plain, check } from './schema.js';
import { cookieSession, sessionCookie } from './auth.js';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const encode = data => JSON.stringify(data).replace(/</g, '\\u003c');
export function makeApp({ store, root, secure = false }) {
  const loginFailures = new Map();
  function send(res, code, body, type = 'application/json; charset=utf-8', headers = {}) {
    res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin', 'X-Frame-Options': 'SAMEORIGIN', ...headers });
    res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
  }
  function redirect(res, location) { send(res, 302, '', 'text/plain', { Location: location }); }
  async function body(req) {
    check(req.headers['content-type']?.split(';')[0] === 'application/json', 'Use application/json.', 415);
    let size = 0, chunks = [];
    for await (const chunk of req) {
      size += chunk.length; check(size <= 12 * 1024 * 1024, 'Request is too large.', 413); chunks.push(chunk);
    }
    try {
      const data = JSON.parse(Buffer.concat(chunks).toString());
      check(plain(data), 'Request must be an object.'); return data;
    } catch (error) { if (error.status) throw error; throw Object.assign(new Error('Invalid JSON.'), { status: 400 }); }
  }
  function originCheck(req) {
    const origin = req.headers.origin;
    check(origin && new URL(origin).host === req.headers.host, 'Request origin is not allowed.', 403);
    check(!req.headers['sec-fetch-site'] || ['same-origin', 'none'].includes(req.headers['sec-fetch-site']), 'Cross-site request is not allowed.', 403);
  }
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost'), path = decodeURIComponent(url.pathname);
      const bearer = false;
      const user = store.session(cookieSession(req));
      if (path === '/health') return send(res, 200, { status: 'ok', application: 'CommerceOS' });
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        if (!bearer) originCheck(req);
        if (!['/api/login', '/api/setup'].includes(path)) {
          check(user, 'Sign in to continue.', 401);
          if (!bearer) check(req.headers['x-csrf-token'] === user.csrf, 'Your session token is invalid. Reload this page.', 403);
        }
      }
      const userCount = store.db.prepare('SELECT count(*) AS n FROM users').get().n;
      if (path === '/api/setup' && req.method === 'POST') {
        check(userCount === 0, 'Initial setup has already been completed.', 403);
        const input = await body(req);
        check(store.db.prepare('SELECT count(*) AS n FROM users').get().n === 0, 'Initial setup has already been completed.', 403);
        const account = store.createUser({ ...input, role: 'owner' });
        const session = store.login(account.email, input.password);
        return send(res, 201, { user: session.user, csrf: session.csrf, start: store.startPage(session.user) }, undefined, { 'Set-Cookie': sessionCookie(session.secret, secure) });
      }
      if (path === '/api/login' && req.method === 'POST') {
        const key = req.socket.remoteAddress || 'local', failed = loginFailures.get(key);
        check(!failed || failed.until < Date.now() || failed.count < 10, 'Too many sign-in attempts. Try again in 15 minutes.', 429);
        const input = await body(req);
        try {
          const session = store.login(input.email, input.password);
          loginFailures.delete(key);
          return send(res, 200, { user: session.user, csrf: session.csrf, start: store.startPage(session.user) }, undefined, { 'Set-Cookie': sessionCookie(session.secret, secure) });
        } catch (error) {
          loginFailures.set(key, { count: failed && failed.until > Date.now() ? failed.count + 1 : 1, until: Date.now() + 900000 });
          throw error;
        }
      }
      if (path === '/api/logout' && req.method === 'POST') {
        store.logout(cookieSession(req));
        return send(res, 200, { ok: true }, undefined, { 'Set-Cookie': sessionCookie('', secure, true) });
      }
      if (['/assets/login.js', '/assets/login.css'].includes(path)) {
        const file = resolve(root, 'public', basename(path));
        return send(res, 200, readFileSync(file), mime[extname(file)]);
      }
      if (path === '/login' || path === '/setup' || path.endsWith('/SignIn.dc.html')) {
        if (user && !url.searchParams.has('signed-out')) return redirect(res, '/dashboard-preview/Main.dc.html');
        const html = readFileSync(resolve(root, 'public/login.html'), 'utf8')
          .replace('__AUTH_CONFIG__', encode({ setup: userCount === 0, logout: !!user && url.searchParams.has('signed-out'), csrf: user?.csrf || '' }));
        return send(res, 200, html, mime['.html']);
      }
      if (!user) {
        if (path.startsWith('/api/')) return send(res, 401, { error: 'Sign in to continue.' });
        return redirect(res, userCount ? '/login' : '/setup');
      }
      if (path === '/' || path === '/index.html') return redirect(res, '/dashboard-preview/Main.dc.html');
      if (path === '/api/session' && req.method === 'GET') return send(res, 200, { user: { id: user.id, name: user.name, email: user.email, role: user.role }, csrf: user.csrf });
      if (path.startsWith('/dashboard-preview/')) {
        const base = resolve(root, 'dashboard-preview'), file = resolve(root, '.' + path);
        check(file.startsWith(base + '/') && existsSync(file) && statSync(file).isFile() && ['.html', '.js', '.css', '.json'].includes(extname(file)), 'Page not found.', 404);
        const name = basename(file, '.dc.html');

        let content = readFileSync(file, 'utf8');
        return send(res, 200, content, mime[extname(file)]);
      }
      send(res, 404, { error: 'Page not found.' });
    } catch (error) {
      if (!res.headersSent) send(res, error.status || 500, { error: error.status ? error.message : 'An unexpected server error occurred.' });
      if (!error.status) console.error(error);
    }
  });
}
