export const tineye = {
  id:'tineye', name:'TinEye', badge:'核心', description:'專注找相同或修改過的圖片與來源；支援公開圖片 URL 直接搜尋。', mode:'url',
  buildUrl(imageUrl){ return imageUrl ? `https://tineye.com/search?url=${encodeURIComponent(imageUrl)}` : 'https://tineye.com/'; },
  buildManualUrl(){ return 'https://tineye.com/'; }
};
