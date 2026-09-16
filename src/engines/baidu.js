export const baidu = {
  id: 'baidu',
  name: 'Baidu 以圖搜圖',
  badge: '核心',
  description: '百度識圖；支援本地圖片或圖片 URL 的官方識圖頁。',
  mode: 'manual',
  buildUrl() { return 'https://graph.baidu.com/pcpage/index?tpl_from=pc'; },
  buildManualUrl() { return 'https://graph.baidu.com/pcpage/index?tpl_from=pc'; }
};
