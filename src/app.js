import { engines, selectedEngines } from './engines/registry.js';
import { normalizeImage, rotateImage } from './image/processor.js';

const state = { original: null, image: null, objectUrl: null, remoteUrl: null, remoteExpiresAt: 0, cleanupTimer: null };
const $ = id => document.getElementById(id);
const els = {
  file: $('fileInput'), drop: $('dropzone'), pick: $('pickBtn'), paste: $('pasteBtn'), empty: $('emptyState'), previewState: $('previewState'),
  preview: $('preview'), name: $('imageName'), info: $('imageInfo'), status: $('inputStatus'), url: $('urlInput'),
  loadUrl: $('loadUrl'), clear: $('clearBtn'), grid: $('engineGrid'), selected: $('searchSelected'), all: $('searchAll'),
  results: $('results'), hint: $('actionHint'), theme: $('themeToggle'), left: $('rotateLeft'), right: $('rotateRight'),
  reset: $('resetBtn'), selectAll: $('selectAll'), selectNone: $('selectNone')
};

function initTheme() {
  const saved = localStorage.getItem('ish-theme');
  const dark = saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  els.theme.textContent = dark ? '☀' : '☾';
}

function renderEngines() {
  els.grid.replaceChildren(...engines.map((e, i) => {
    const label = document.createElement('label'); label.className = 'engine';
    label.innerHTML = `<input type="checkbox" data-engine="${e.id}" ${i < 4 ? 'checked' : ''}><div class="engine-body"><div class="engine-title"><strong>${e.name}</strong><span class="badge">${e.badge}</span></div><span class="engine-desc">${e.description}</span><span class="mode">${e.mode === 'url' ? '⚡ 圖片 URL 可直接啟動' : '↗ 開啟網站後手動上傳'}</span></div>`;
    return label;
  })); updateHint();
}

function checkedIds() { return [...els.grid.querySelectorAll('input[data-engine]:checked')].map(x => x.dataset.engine); }
function updateHint() { const n = checkedIds().length; els.hint.textContent = n ? `已選 ${n} 個引擎。URL 型引擎可帶入暫存圖片 URL；其他引擎開啟上傳頁。` : '至少選擇一個搜尋引擎。'; }
function setStatus(text, ok = false) { els.status.textContent = text; els.status.dataset.ok = ok ? '1' : '0'; }
function releasePreviewUrl() { if (state.objectUrl) URL.revokeObjectURL(state.objectUrl); state.objectUrl = null; }

async function deleteRemote() {
  if (!state.remoteUrl) return;
  const remote = state.remoteUrl;
  state.remoteUrl = null; state.remoteExpiresAt = 0;
  if (state.cleanupTimer) { clearTimeout(state.cleanupTimer); state.cleanupTimer = null; }
  try { await fetch(remote, { method: 'DELETE', keepalive: true }); } catch {}
}

function scheduleRemoteCleanup() {
  if (state.cleanupTimer) clearTimeout(state.cleanupTimer);
  if (!state.remoteUrl) return;
  const delay = Math.max(5_000, state.remoteExpiresAt - Date.now() + 1_000);
  state.cleanupTimer = setTimeout(() => { deleteRemote(); }, delay);
}

async function setImage(file, name = file?.name) {
  if (!(file instanceof Blob) || !file.type?.startsWith('image/')) { setStatus('請選擇有效的圖片檔。'); return; }
  try {
    setStatus('正在處理圖片…'); await deleteRemote();
    state.original = file; state.image = await normalizeImage(file);
    releasePreviewUrl(); state.objectUrl = URL.createObjectURL(state.image.blob);
    els.preview.src = state.objectUrl; els.name.textContent = name || '貼上的圖片';
    els.info.textContent = `${state.image.width} × ${state.image.height} · WebP · 本機處理`;
    els.empty.classList.add('hidden'); els.previewState.classList.remove('hidden'); els.clear.classList.remove('hidden');
    setStatus('圖片已準備完成。', true);
  } catch (err) { setStatus(err.message || '圖片處理失敗。'); }
}

async function clearImage() {
  await deleteRemote(); state.original = null; state.image = null; releasePreviewUrl();
  els.preview.removeAttribute('src'); els.empty.classList.remove('hidden'); els.previewState.classList.add('hidden'); els.clear.classList.add('hidden');
  setStatus('');
}

async function pasteImageFromClipboard() {
  if (!window.isSecureContext) {
    setStatus('iPhone 剪貼簿功能需要 HTTPS 網站。');
    return;
  }
  if (!navigator.clipboard?.read) {
    setStatus('目前瀏覽器不提供圖片剪貼簿讀取，請改用「選擇圖片」從照片圖庫加入。');
    return;
  }
  try {
    setStatus('正在讀取剪貼簿…');
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imageType = item.types.find(type => type.startsWith('image/'));
      if (imageType) {
        const blob = await item.getType(imageType);
        await setImage(blob, 'Clipboard image');
        return;
      }
    }
    setStatus('剪貼簿目前沒有圖片。先在照片 App 複製圖片，再回到這裡按一次按鈕。');
  } catch (err) {
    if (err?.name === 'NotAllowedError') {
      setStatus('瀏覽器拒絕剪貼簿權限。請允許此網站讀取剪貼簿，或改用「選擇圖片」。');
    } else {
      setStatus('無法讀取剪貼簿中的圖片，請改用「選擇圖片」。');
    }
  }
}

async function loadFromUrl() {
  const url = els.url.value.trim();
  if (!/^https?:\/\//i.test(url)) { setStatus('請輸入 http:// 或 https:// 的圖片網址。'); return; }
  try {
    setStatus('正在下載圖片到瀏覽器…');
    const r = await fetch(url, { mode: 'cors' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const b = await r.blob(); await setImage(b, url.split('/').pop()?.split('?')[0] || 'URL image');
  } catch { setStatus('此圖片網址無法由瀏覽器讀取，可能是 CORS 或防盜鏈。你仍可直接用這個 URL 啟動支援 URL 的搜尋引擎。'); }
}

async function ensureRemoteUrl() {
  if (state.remoteUrl && Date.now() < state.remoteExpiresAt - 30_000) return state.remoteUrl;
  if (!state.image?.blob) return els.url.value.trim();
  setStatus('正在建立短期暫存圖片 URL…');
  const r = await fetch('/api/image', { method: 'POST', headers: { 'content-type': state.image.blob.type || 'image/webp' }, body: state.image.blob });
  if (!r.ok) throw new Error('Cloudflare 暫存圖片服務發生錯誤，請稍後再試。');
  const data = await r.json(); state.remoteUrl = data.url; state.remoteExpiresAt = data.expiresAt || Date.now() + 9 * 60 * 1000;
  scheduleRemoteCleanup(); setStatus('暫存 URL 已建立。', true); return state.remoteUrl;
}

function openPopup(url) { return !!window.open(url, '_blank', 'noopener,noreferrer'); }

async function searchOne(engine) {
  let url = engine.buildManualUrl(); let method = 'manual';
  if (engine.mode === 'url') { const source = await ensureRemoteUrl(); if (!source) throw new Error('沒有可用的圖片 URL。'); url = engine.buildUrl(source); method = 'url'; }
  const opened = openPopup(url); return { engine, opened, method, url };
}

async function runSearch(ids) {
  if (!ids.length) { setStatus('請至少選擇一個搜尋引擎。'); return; }
  if (!state.image?.blob && !els.url.value.trim()) { setStatus('請先加入圖片。'); return; }
  els.results.replaceChildren(); const selected = selectedEngines(ids);
  for (const engine of selected) {
    const row = document.createElement('div'); row.className = 'result'; const main = document.createElement('div'); main.className = 'result-main';
    const title = document.createElement('strong'); title.textContent = engine.name; const sub = document.createElement('span'); sub.textContent = '準備中…'; main.append(title, sub);
    const button = document.createElement('button'); button.className = 'secondary'; button.type = 'button'; button.textContent = '開啟'; row.append(main, button); els.results.append(row);
    const open = async () => { try { const r = await searchOne(engine); sub.textContent = r.opened ? (r.method === 'url' ? '已以圖片 URL 開啟' : '已開啟搜尋頁，請上傳圖片') : '瀏覽器阻擋新視窗'; } catch (err) { sub.textContent = err.message || '開啟失敗'; } };
    button.addEventListener('click', open); await open();
  }
}

els.pick.addEventListener('click', e => { e.stopPropagation(); els.file.click(); });
els.paste.addEventListener('click', e => { e.stopPropagation(); pasteImageFromClipboard(); });
els.drop.addEventListener('click', e => { if (e.target === els.drop || e.target.closest('.empty-state')) els.file.click(); });
els.drop.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === els.drop) { e.preventDefault(); els.file.click(); } });
els.file.addEventListener('change', e => { const f = e.target.files?.[0]; if (f) setImage(f); });
['dragenter', 'dragover'].forEach(ev => els.drop.addEventListener(ev, e => { e.preventDefault(); els.drop.classList.add('dragover'); }));
['dragleave', 'drop'].forEach(ev => els.drop.addEventListener(ev, e => { e.preventDefault(); els.drop.classList.remove('dragover'); }));
els.drop.addEventListener('drop', e => { const f = e.dataTransfer.files?.[0]; if (f) setImage(f); });
document.addEventListener('paste', e => { const item = [...(e.clipboardData?.items || [])].find(x => x.type.startsWith('image/')); if (item) setImage(item.getAsFile(), 'Clipboard image'); });
els.loadUrl.addEventListener('click', loadFromUrl); els.url.addEventListener('keydown', e => { if (e.key === 'Enter') loadFromUrl(); }); els.clear.addEventListener('click', clearImage);
els.selectAll.addEventListener('click', () => { els.grid.querySelectorAll('input').forEach(x => x.checked = true); updateHint(); });
els.selectNone.addEventListener('click', () => { els.grid.querySelectorAll('input').forEach(x => x.checked = false); updateHint(); });
els.grid.addEventListener('change', updateHint); els.selected.addEventListener('click', () => runSearch(checkedIds()));
els.all.addEventListener('click', () => { els.grid.querySelectorAll('input').forEach(x => x.checked = true); updateHint(); runSearch(checkedIds()); });
els.left.addEventListener('click', async () => { if (!state.image) return; await deleteRemote(); state.image = await rotateImage(state.image.blob, -90); releasePreviewUrl(); state.objectUrl = URL.createObjectURL(state.image.blob); els.preview.src = state.objectUrl; els.info.textContent = `${state.image.width} × ${state.image.height} · WebP · 已處理`; });
els.right.addEventListener('click', async () => { if (!state.image) return; await deleteRemote(); state.image = await rotateImage(state.image.blob, 90); releasePreviewUrl(); state.objectUrl = URL.createObjectURL(state.image.blob); els.preview.src = state.objectUrl; els.info.textContent = `${state.image.width} × ${state.image.height} · WebP · 已處理`; });
els.reset.addEventListener('click', () => state.original && setImage(state.original, els.name.textContent));
els.theme.addEventListener('click', () => { const dark = document.documentElement.dataset.theme !== 'dark'; document.documentElement.dataset.theme = dark ? 'dark' : 'light'; els.theme.textContent = dark ? '☀' : '☾'; localStorage.setItem('ish-theme', dark ? 'dark' : 'light'); });
window.addEventListener('pagehide', () => { if (state.remoteUrl) fetch(state.remoteUrl, { method: 'DELETE', keepalive: true }).catch(() => {}); });

initTheme();
renderEngines();
