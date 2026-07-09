// Mirror: always serve the live haf-cleverpay build (single source of truth).
// Pulls from raw.githubusercontent — no redirects, no loop on the custom domain.
const MIME = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  ico: 'image/x-icon', txt: 'text/plain; charset=utf-8', woff2: 'font/woff2', woff: 'font/woff'
};
export default {
  async fetch(request) {
    const url = new URL(request.url);
    let path = url.pathname;
    if (path.endsWith('/')) path += 'index.html';
    const upstream = 'https://raw.githubusercontent.com/OtisAgent/haf-cleverpay/main' + path;
    const resp = await fetch(upstream);
    const ext = path.split('.').pop().toLowerCase();
    const headers = new Headers();
    headers.set('content-type', MIME[ext] || 'application/octet-stream');
    headers.set('cache-control', 'no-cache');
    return new Response(resp.body, { status: resp.status, headers });
  }
};
