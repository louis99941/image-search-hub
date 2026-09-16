export const bing = {
  id:'bing', name:'Bing Visual Search', badge:'核心', description:'Bing 視覺搜尋，可貼圖片或圖片 URL。', mode:'url',
  buildUrl(imageUrl){ return imageUrl ? `https://www.bing.com/images/searchbyimage?cbir=sbi&imgurl=${encodeURIComponent(imageUrl)}` : 'https://www.bing.com/visualsearch'; },
  buildManualUrl(){ return 'https://www.bing.com/visualsearch'; }
};
