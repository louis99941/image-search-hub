export const animetrace = {
  id:'animetrace', name:'AnimeTrace', badge:'動畫',
  description:'AI 動畫與 Galgame 識別；官方支援使用公開圖片 URL 深鏈。', mode:'url',
  buildUrl(imageUrl){ return imageUrl ? `https://ai.animedb.cn/?url=${encodeURIComponent(imageUrl)}` : 'https://www.animetrace.com/'; },
  buildManualUrl(){ return 'https://www.animetrace.com/'; }
};
