export const yandex = {
  id:'yandex', name:'Yandex Images', badge:'核心', description:'Yandex 圖片搜尋；可能要求 CAPTCHA，失敗時回到手動頁。', mode:'url',
  buildUrl(imageUrl){ return imageUrl ? `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}` : 'https://yandex.com/images/'; },
  buildManualUrl(){ return 'https://yandex.com/images/'; }
};
