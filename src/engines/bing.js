export const bing = {
  id: 'bing',
  name: 'Bing Visual Search',
  badge: '核心',
  description: 'Bing 視覺搜尋；使用圖片 URL 直接進入以圖搜圖。',
  mode: 'url',
  buildUrl(imageUrl) {
    if (!imageUrl) return 'https://www.bing.com/visualsearch';
    const q = `imgurl:${imageUrl}`;
    return `https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIIDP&sbisrc=UrlPaste&idpbck=1&q=${encodeURIComponent(q)}`;
  },
  buildManualUrl() {
    return 'https://www.bing.com/visualsearch';
  }
};
