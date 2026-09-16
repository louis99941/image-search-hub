const MAX_BYTES = 12 * 1024 * 1024;
const TTL_SECONDS = 10 * 60;

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
      if (request.method === 'GET') return getImage(request, env);
      if (request.method === 'DELETE') return deleteImage(request, env);
      return json({ error: 'Method not allowed' }, 405);
    }

    return env.ASSETS.fetch(request);
  },
};

async function uploadImage(request, env) {
  const type = request.headers.get('content-type') || '';
  if (!type.startsWith('image/')) return json({ error: 'Only image/* uploads are accepted.' }, 415);

  const length = Number(request.headers.get('content-length') || 0);
  if (length && length > MAX_BYTES) return json({ error: 'Image exceeds the 12 MB limit.' }, 413);

  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) return json({ error: 'Image exceeds the 12 MB limit.' }, 413);

  const id = crypto.randomUUID();
  const expiresAt = Date.now() + TTL_SECONDS * 1000;

  await env.IMAGE_KV.put(`image:${id}`, body, {
    expirationTtl: TTL_SECONDS,
    metadata: {
      contentType: type,
      expiresAt,
    },
  });

  const imageUrl = new URL(`/api/image/${id}`, request.url);
  return json({ url: imageUrl.toString(), expiresAt });
}

async function getImage(request, env) {
  const id = new URL(request.url).pathname.slice('/api/image/'.length);
  const result = await env.IMAGE_KV.getWithMetadata(`image:${id}`, { type: 'arrayBuffer' });

  if (result.value === null) return new Response('Not found or expired', { status: 404 });

  const metadata = result.metadata || {};
  const expiresAt = Number(metadata.expiresAt || 0);
  if (expiresAt && Date.now() >= expiresAt) {
    await env.IMAGE_KV.delete(`image:${id}`);
    return new Response('Expired', { status: 410 });
  }

  return new Response(result.value, {
    headers: {
      'content-type': metadata.contentType || 'image/webp',
      'cache-control': 'public, max-age=600, s-maxage=600',
      'x-content-type-options': 'nosniff',
      'cross-origin-resource-policy': 'cross-origin',
    },
  });
}

async function deleteImage(request, env) {
  const id = new URL(request.url).pathname.slice('/api/image/'.length);
  await env.IMAGE_KV.delete(`image:${id}`);
  return new Response(null, { status: 204 });
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
