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
import { shutterstock } from './shutterstock.js';

export const engines = [
  google, bing, yandex, tineye, sogou, baidu, lenso, copyseeker,
  saucenao, iqdb, ascii2d, tracemoe, animetrace, pinterest, pimeyes, shutterstock
];

export function selectedEngines(ids) {
  return engines.filter((engine) => ids.includes(engine.id));
}
