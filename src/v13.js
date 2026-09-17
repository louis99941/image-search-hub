const STORAGE_KEY = 'ish-engine-selection-v1';
const DEFAULT_IDS = new Set(['pimeyes', 'facecheck', 'google', 'yandex', 'tineye', 'lenso', 'copyseeker']);

function getInputs() {
  return [...document.querySelectorAll('#engineGrid input[data-engine]')];
}

function getSelection() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(value) ? new Set(value) : null;
  } catch {
    return null;
  }
}

function saveSelection() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getInputs().filter(x => x.checked).map(x => x.dataset.engine)));
}

function restoreSelection() {
  const saved = getSelection();
  if (!saved) return;
  for (const input of getInputs()) input.checked = saved.has(input.dataset.engine);
}

function resetSelection() {
  for (const input of getInputs()) input.checked = DEFAULT_IDS.has(input.dataset.engine);
  saveSelection();
  window.dispatchEvent(new Event('ish-selection-reset'));
}

function addHealthAndStatus() {
  for (const input of getInputs()) {
    const card = input.closest('.engine');
    if (!card || card.querySelector('.engine-health')) continue;
    const mode = card.querySelector('.mode');
    if (!mode) continue;
    const health = document.createElement('span');
    health.className = 'engine-health';
    health.dataset.state = 'ready';
    health.textContent = input.dataset.engine ? '● 可啟動' : '●';
    mode.append(' · ', health);

    const button = card.querySelector('button[data-engine-search]');
    if (button) {
      button.addEventListener('click', () => {
        health.dataset.state = 'started';
        health.textContent = '● 已啟動';
      });
    }
  }
}

function addSettings() {
  if (document.getElementById('engineSettings')) return;
  const section = document.createElement('section');
  section.id = 'engineSettings';
  section.className = 'engine-settings';
  section.innerHTML = '<div><strong>搜尋組設定</strong><span>記住本機的「加入全部搜尋」選擇；不會上傳或保存搜尋歷史。</span></div><button id="resetEngineSelection" class="secondary" type="button">恢復預設</button>';
  const engineCard = document.querySelector('#engineGrid')?.closest('.card');
  engineCard?.append(section);
  document.getElementById('resetEngineSelection')?.addEventListener('click', resetSelection);
}

function observeResults() {
  const results = document.getElementById('results');
  if (!results) return;
  const observer = new MutationObserver(() => {
    for (const row of results.querySelectorAll('.result')) {
      const name = row.querySelector('.result-main strong')?.textContent?.trim();
      const status = row.querySelector('.result-main span')?.textContent?.trim();
      if (!name || !status) continue;
      const card = getInputs().find(x => x.closest('.engine')?.querySelector('.engine-title strong')?.textContent?.trim() === name)?.closest('.engine');
      const health = card?.querySelector('.engine-health');
      if (!health) continue;
      if (status.includes('失敗') || status.includes('阻擋')) {
        health.dataset.state = 'error';
        health.textContent = '● 啟動失敗';
      } else if (status.includes('已開啟')) {
        health.dataset.state = 'started';
        health.textContent = '● 已啟動';
      }
    }
  });
  observer.observe(results, { childList: true, subtree: true, characterData: true });
}

function init() {
  restoreSelection();
  addHealthAndStatus();
  addSettings();
  observeResults();
  for (const input of getInputs()) input.addEventListener('change', saveSelection);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
