const MAX_BYTES = 12 * 1024 * 1024;
const TTL_MS = 10 * 60 * 1000;
const PREFIX = 'temporary/';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/image') {
      if (request.method === 'POST') return uploadImage(request, env);
      return json({ error: 'Method not allowed' }, 405);
    }

    if (url.pathname.startsWith('/api/image/')) {
      const id = url.pathname.slice('/api/image/'.length);
      if (!isValidId(id)) return new Response('Not found', { status: 404 });
      if (request.method === 'GET') return getImage(id, env);
      if (request.method === 'DELETE') return deleteImage(id, env);
      return json({ error: 'Method not allowed' }, 405);
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_event, env, _ctx) {
    await purgeExpired(env);
  },
};

async function uploadImage(request, env) {
  if (!env.IMAGE_BUCKET) return json({ error: 'R2 binding IMAGE_BUCKET is not configured.' }, 503);
  const type = request.headers.get('content-type') || '';
  if (!type.startsWith('image/')) return json({ error: 'Only image/* uploads are accepted.' }, 415);

  const length = Number(request.headers.get('content-length') || 0);
  if (length && length > MAX_BYTES) return json({ error: 'Image exceeds the 12 MB limit.' }, 413);

  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) return json({ error: 'Image exceeds the 12 MB limit.' }, 413);

  const id = crypto.randomUUID();
  const expiresAt = Date.now() + TTL_MS;
  await env.IMAGE_BUCKET.put(`${PREFIX}${id}`, body, {
    httpMetadata: { contentType: type, cacheControl: 'private, max-age=60' },
    customMetadata: { expiresAt: String(expiresAt) },
  });

  return json({
    url: new URL(`/api/image/${id}`, request.url).toString(),
    expiresAt,
  });
}

async function getImage(id, env) {
  if (!env.IMAGE_BUCKET) return new Response('R2 binding not configured', { status: 503 });
  const key = `${PREFIX}${id}`;
  const object = await env.IMAGE_BUCKET.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const expiresAt = Number(object.customMetadata?.expiresAt || 0);
  if (expiresAt && Date.now() > expiresAt) {
    await env.IMAGE_BUCKET.delete(key);
    return new Response('Expired', { status: 410 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('cache-control', 'private, max-age=60');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('cross-origin-resource-policy', 'cross-origin');
  return new Response(object.body, { headers });
}

async function deleteImage(id, env) {
  if (!env.IMAGE_BUCKET) return new Response('R2 binding not configured', { status: 503 });
  await env.IMAGE_BUCKET.delete(`${PREFIX}${id}`);
  return new Response(null, { status: 204 });
}

async function purgeExpired(env) {
  if (!env.IMAGE_BUCKET) return;
  let cursor;
  do {
    const page = await env.IMAGE_BUCKET.list({ prefix: PREFIX, cursor, include: ['customMetadata'] });
    const now = Date.now();
    const expired = page.objects
      .filter(object => Number(object.customMetadata?.expiresAt || 0) > 0)
      .filter(object => Number(object.customMetadata.expiresAt) <= now)
      .map(object => object.key);

    if (expired.length) await env.IMAGE_BUCKET.delete(expired);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
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
