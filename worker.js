const MAX_BYTES = 12 * 1024 * 1024;
const TTL_SECONDS = 10 * 60;
const TTL_MS = TTL_SECONDS * 1000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/image') {
      if (request.method === 'POST') return uploadImage(request);
      return json({ error: 'Method not allowed' }, 405);
    }

    if (url.pathname.startsWith('/api/image/')) {
      const id = url.pathname.slice('/api/image/'.length);
      if (!isValidId(id)) return new Response('Not found', { status: 404 });
      if (request.method === 'GET') return getImage(request);
      if (request.method === 'DELETE') return deleteImage(request);
      return json({ error: 'Method not allowed' }, 405);
    }

    return env.ASSETS.fetch(request);
  },
};

async function uploadImage(request) {
  const type = request.headers.get('content-type') || '';
  if (!type.startsWith('image/')) return json({ error: 'Only image/* uploads are accepted.' }, 415);

  const length = Number(request.headers.get('content-length') || 0);
  if (length && length > MAX_BYTES) return json({ error: 'Image exceeds the 12 MB limit.' }, 413);

  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) return json({ error: 'Image exceeds the 12 MB limit.' }, 413);

  const id = crypto.randomUUID();
  const expiresAt = Date.now() + TTL_MS;
  const imageUrl = new URL(`/api/image/${id}`, request.url);
  const cacheRequest = new Request(imageUrl.toString(), { method: 'GET' });
  const response = new Response(body, {
    headers: {
      'content-type': type,
      'cache-control': `public, max-age=${TTL_SECONDS}, s-maxage=${TTL_SECONDS}`,
      'x-content-type-options': 'nosniff',
      'cross-origin-resource-policy': 'cross-origin',
      'content-length': String(body.byteLength),
      'x-image-expires-at': String(expiresAt),
    },
  });

  // Wait for the cache write before returning the public URL. This prevents
  // Bing/Google/etc. from fetching the URL during the small put() race window.
  await caches.default.put(cacheRequest, response);
  return json({ url: imageUrl.toString(), expiresAt });
}

async function getImage(request) {
  const cached = await caches.default.match(new Request(request.url, { method: 'GET' }));
  if (!cached) return new Response('Not found or expired', { status: 404 });

  const expiresAt = Number(cached.headers.get('x-image-expires-at') || 0);
  if (expiresAt && Date.now() >= expiresAt) {
    await caches.default.delete(new Request(request.url, { method: 'GET' }));
    return new Response('Expired', { status: 410 });
  }
  return cached;
}

async function deleteImage(request) {
  const deleted = await caches.default.delete(new Request(request.url, { method: 'GET' }));
  return new Response(null, { status: deleted ? 204 : 404 });
}

function isValidId(id) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
