export const bing = {
  id: 'bing',
  name: 'Bing Visual Search',
  badge: '核心',
  description: 'Bing 視覺搜尋，可使用圖片 URL 搜尋相似圖片與來源。',
  mode: 'url',
  buildUrl(imageUrl) {
    if (!imageUrl) return 'https://www.bing.com/visualsearch?mkt=en-US';
    const params = new URLSearchParams({
      cbir: 'sbi',
      iss: 'sbi',
      mkt: 'en-US',
      imgurl: imageUrl,
    });
    return `https://www.bing.com/images/searchbyimage?${params.toString()}`;
  },
  buildManualUrl() {
    return 'https://www.bing.com/visualsearch?mkt=en-US';
  },
};
