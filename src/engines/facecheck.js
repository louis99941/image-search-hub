export const facecheck = {
  id: 'facecheck',
  name: 'FaceCheck.ID',
  badge: '真人臉部',
  description: '專門以人臉特徵尋找公開網頁中的相同人物照片。',
  mode: 'manual',
  buildUrl() { return 'https://facecheck.id/'; },
  buildManualUrl() { return 'https://facecheck.id/'; }
};
