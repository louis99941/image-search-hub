export const iqdb = {
  id:'iqdb', name:'IQDB', badge:'動漫',
  description:'二次元圖片相似搜尋，涵蓋多個動漫圖片資料庫。', mode:'url',
  buildUrl(imageUrl){ return imageUrl ? `https://iqdb.org/?url=${encodeURIComponent(imageUrl)}` : 'https://iqdb.org/'; },
  buildManualUrl(){ return 'https://iqdb.org/'; }
};
