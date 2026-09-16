export async function onRequestGet({ env, params }) {
  if (!env.IMAGE_BUCKET) return new Response('R2 binding not configured', { status: 503 });
  const id = params.id;
  if (!id || id.includes('/')) return new Response('Not found', { status: 404 });
  const object = await env.IMAGE_BUCKET.get(`temporary/${id}`);
  if (!object) return new Response('Not found', { status: 404 });
  const expiresAt = Number(object.customMetadata?.expiresAt || 0);
  if (expiresAt && Date.now() > expiresAt) { await env.IMAGE_BUCKET.delete(`temporary/${id}`); return new Response('Expired', { status: 410 }); }
  const headers = new Headers(); object.writeHttpMetadata(headers);
  headers.set('cache-control','private, max-age=60'); headers.set('x-content-type-options','nosniff');
  return new Response(object.body, { headers });
}

export async function onRequestDelete({ request, env, params }) {
  if (!env.IMAGE_BUCKET) return new Response('R2 binding not configured', { status: 503 });
  const id = params.id;
  if (!id || id.includes('/')) return new Response('Not found', { status: 404 });
  await env.IMAGE_BUCKET.delete(`temporary/${id}`);
  return new Response(null, { status: 204 });
}
