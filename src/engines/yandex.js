export const yandex = {
  id:'yandex', name:'Yandex Images', badge:'核心', description:'Yandex 圖片搜尋；使用公開圖片 URL 直接進入以圖搜圖。', mode:'url',
  buildUrl(imageUrl){ return imageUrl ? `https://yandex.ru/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}` : 'https://yandex.ru/images/'; },
  buildManualUrl(){ return 'https://yandex.ru/images/'; }
};
