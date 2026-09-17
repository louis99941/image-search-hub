import { google } from './google.js';
import { bing } from './bing.js';
import { yandex } from './yandex.js';
import { tineye } from './tineye.js';
import { sogou } from './sogou.js';
import { baidu } from './baidu.js';
import { lenso } from './lenso.js';
import { copyseeker } from './copyseeker.js';
import { saucenao } from './saucenao.js';
import { iqdb } from './iqdb.js';
import { ascii2d } from './ascii2d.js';
import { tracemoe } from './tracemoe.js';
import { animetrace } from './animetrace.js';
import { pinterest } from './pinterest.js';
import { pimeyes } from './pimeyes.js';
import { facecheck } from './facecheck.js';
import { shutterstock } from './shutterstock.js';

const people = new Set(['pimeyes', 'facecheck', 'google', 'yandex', 'tineye', 'lenso', 'copyseeker']);
const anime = new Set(['saucenao', 'iqdb', 'ascii2d', 'tracemoe', 'animetrace']);

const rawEngines = [
  pimeyes, facecheck,
  google, yandex, tineye, lenso, copyseeker,
  baidu, sogou, bing,
  saucenao, iqdb, ascii2d, tracemoe, animetrace,
  pinterest, shutterstock
];

export const engines = rawEngines.map((engine) => ({
  ...engine,
  group: people.has(engine.id) ? 'people' : anime.has(engine.id) ? 'anime' : 'general',
}));

export function selectedEngines(ids) {
  return engines.filter((engine) => ids.includes(engine.id));
}
