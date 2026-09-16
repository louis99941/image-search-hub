const MAX_BYTES = 12 * 1024 * 1024;
const TTL_SECONDS = 10 * 60;

export async function onRequestPost({ request, env }) {
  if (!env.IMAGE_BUCKET) return json({ error: 'R2 binding IMAGE_BUCKET is not configured.' }, 503);
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) return json({ error: 'Only image/* uploads are accepted.' }, 415);
  const length = Number(request.headers.get('content-length') || 0);
  if (length && length > MAX_BYTES) return json({ error: 'Image exceeds the 12 MB limit.' }, 413);

  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) return json({ error: 'Image exceeds the 12 MB limit.' }, 413);
  const id = crypto.randomUUID();
  const key = `temporary/${id}`;
  const expires = new Date(Date.now() + TTL_SECONDS * 1000).toUTCString();
  await env.IMAGE_BUCKET.put(key, body, { httpMetadata: { contentType, cacheControl: 'private, max-age=60' }, customMetadata: { expiresAt: String(Date.now() + TTL_SECONDS * 1000) } });
  return json({ url: new URL(`/api/image/${id}`, request.url).toString(), expiresAt: Date.now() + TTL_SECONDS * 1000 });
}

export async function onRequestDelete({ request, env }) {
  if (!env.IMAGE_BUCKET) return json({ error: 'R2 binding IMAGE_BUCKET is not configured.' }, 503);
  const id = new URL(request.url).pathname.split('/').pop();
  if (!id || id.includes('/') || id.length > 80) return json({ error: 'Invalid image id.' }, 400);
  await env.IMAGE_BUCKET.delete(`temporary/${id}`);
  return new Response(null, { status: 204 });
}

export async function onRequestGet({ request, env, params }) {
  if (!env.IMAGE_BUCKET) return new Response('R2 binding not configured', { status: 503 });
  const id = params.id;
  if (!id || id.includes('/')) return new Response('Not found', { status: 404 });
  const object = await env.IMAGE_BUCKET.get(`temporary/${id}`);
  if (!object) return new Response('Not found', { status: 404 });
  const expiresAt = Number(object.customMetadata?.expiresAt || 0);
  if (expiresAt && Date.now() > expiresAt) { await env.IMAGE_BUCKET.delete(`temporary/${id}`); return new Response('Expired', { status: 410 }); }
  const headers = new Headers(); object.writeHttpMetadata(headers); headers.set('cache-control','private, max-age=60'); headers.set('x-content-type-options','nosniff');
  return new Response(object.body, { headers });
}

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
