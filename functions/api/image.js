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
  const expiresAt = Date.now() + TTL_SECONDS * 1000;
  await env.IMAGE_BUCKET.put(`temporary/${id}`, body, {
    httpMetadata: { contentType, cacheControl: 'private, max-age=60' },
    customMetadata: { expiresAt: String(expiresAt) }
  });
  return json({ url: new URL(`/api/image/${id}`, request.url).toString(), expiresAt });
}

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
