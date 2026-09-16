export const saucenao = {
  id:'saucenao', name:'SauceNAO', badge:'動漫',
  description:'動漫、插畫、Pixiv、Danbooru 等來源搜尋。支援公開圖片 URL。', mode:'url',
  buildUrl(imageUrl){ return imageUrl ? `https://saucenao.com/search.php?db=999&url=${encodeURIComponent(imageUrl)}` : 'https://saucenao.com/'; },
  buildManualUrl(){ return 'https://saucenao.com/'; }
};
