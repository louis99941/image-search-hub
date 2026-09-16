import { google } from './google.js';
import { bing } from './bing.js';
import { yandex } from './yandex.js';
import { tineye } from './tineye.js';
import { sogou } from './sogou.js';
import { baidu } from './baidu.js';
import { lenso } from './lenso.js';
import { copyseeker } from './copyseeker.js';

export const engines = [google, bing, yandex, tineye, sogou, baidu, lenso, copyseeker];

export function selectedEngines(ids) {
  return engines.filter((engine) => ids.includes(engine.id));
}
