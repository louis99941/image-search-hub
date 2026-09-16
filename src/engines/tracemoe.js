export const tracemoe = {
  id:'tracemoe', name:'trace.moe', badge:'動畫',
  description:'動畫截圖搜尋；依畫面內容尋找動畫、集數與時間位置。', mode:'url',
  buildUrl(imageUrl){ return imageUrl ? `https://trace.moe/?url=${encodeURIComponent(imageUrl)}` : 'https://trace.moe/'; },
  buildManualUrl(){ return 'https://trace.moe/'; }
};
