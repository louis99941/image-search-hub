const MAX_SIDE = 2400;
const OUTPUT_QUALITY = .88;

function loadImage(source){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('無法讀取圖片'));img.src=source;});}
export async function normalizeImage(file){
  if(!(file instanceof Blob)) throw new Error('圖片資料無效');
  const source=URL.createObjectURL(file);
  try{
    const img=await loadImage(source);
    const scale=Math.min(1,MAX_SIDE/Math.max(img.naturalWidth,img.naturalHeight));
    const w=Math.max(1,Math.round(img.naturalWidth*scale)); const h=Math.max(1,Math.round(img.naturalHeight*scale));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d',{alpha:false});ctx.drawImage(img,0,0,w,h);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('圖片轉換失敗')),'image/webp',OUTPUT_QUALITY));
    return {blob,width:w,height:h,type:'image/webp',dataUrl:await blobToDataUrl(blob)};
  }finally{URL.revokeObjectURL(source)}
}
export async function rotateImage(blob,degrees){
  const source=URL.createObjectURL(blob);
  try{
    const img=await loadImage(source);const turns=((Math.round(degrees/90)%4)+4)%4;const swap=turns%2===1;
    const canvas=document.createElement('canvas');canvas.width=swap?img.naturalHeight:img.naturalWidth;canvas.height=swap?img.naturalWidth:img.naturalHeight;
    const ctx=canvas.getContext('2d',{alpha:false});ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(turns*Math.PI/2);ctx.drawImage(img,-img.naturalWidth/2,-img.naturalHeight/2);
    const out=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('旋轉失敗')),'image/webp',OUTPUT_QUALITY));return {blob:out,dataUrl:await blobToDataUrl(out),width:canvas.width,height:canvas.height,type:'image/webp'};
  }finally{URL.revokeObjectURL(source)}
}
function blobToDataUrl(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});}
