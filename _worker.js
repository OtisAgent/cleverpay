// Mirror: always serve the live haf-cleverpay build (single source of truth).
export default {
  async fetch(request) {
    const url = new URL(request.url);
    let path = url.pathname;
    if (path.endsWith('/')) path += 'index.html';
    const upstream = 'https://otisagent.github.io/haf-cleverpay' + path + url.search;
    const resp = await fetch(upstream, { redirect: 'follow' });
    const headers = new Headers(resp.headers);
    headers.set('cache-control', 'no-cache');
    return new Response(resp.body, { status: resp.status, headers });
  }
};
