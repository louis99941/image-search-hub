export const google = {
  id:'google', name:'Google Lens', badge:'核心', description:'Google 的視覺搜尋、相似圖片與網頁來源。', mode:'url',
  buildUrl(imageUrl){ return imageUrl ? `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}` : 'https://lens.google.com/'; },
  buildManualUrl(){ return 'https://lens.google.com/'; }
};
