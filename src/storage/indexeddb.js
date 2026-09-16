const DB_NAME = 'image-search-hub';
const DB_VERSION = 1;
const STORE = 'history';

function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>req.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}
export async function addHistory(entry){
  try{const db=await openDb(); await new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).add({...entry,createdAt:Date.now()});tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();}catch{}
}
export async function getHistory(limit=20){
  try{const db=await openDb();const rows=await new Promise((res,rej)=>{const tx=db.transaction(STORE);const req=tx.objectStore(STORE).getAll();req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)});db.close();return rows.sort((a,b)=>b.createdAt-a.createdAt).slice(0,limit);}catch{return[]}
}
export async function clearHistory(){try{const db=await openDb();await new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();}catch{}}
