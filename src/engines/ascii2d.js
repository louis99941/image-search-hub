export const ascii2d = {
  id:'ascii2d', name:'ASCII2D', badge:'動漫',
  description:'日本二次元圖片搜尋；可直接使用公開圖片 URL。', mode:'url',
  buildUrl(imageUrl){ return imageUrl ? `https://ascii2d.net/search/url/${encodeURIComponent(imageUrl)}` : 'https://www.ascii2d.net/'; },
  buildManualUrl(){ return 'https://www.ascii2d.net/'; }
};
