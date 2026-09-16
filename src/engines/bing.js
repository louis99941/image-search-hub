export const bing = {
  id: 'bing',
  name: 'Bing Visual Search',
  badge: '暫停自動搜尋',
  description: 'Bing 目前保留官方 Visual Search 頁面，暫不使用不穩定的自動帶圖 URL。',
  mode: 'manual',
  buildUrl() {
    return 'https://www.bing.com/visualsearch';
  },
  buildManualUrl() {
    return 'https://www.bing.com/visualsearch';
  }
};
