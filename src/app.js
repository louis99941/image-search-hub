import { engines, selectedEngines } from './engines/registry.js';
import { normalizeImage, rotateImage } from './image/processor.js';

const CORE_ENGINE_IDS = new Set(['pimeyes', 'facecheck', 'google', 'yandex', 'tineye', 'lenso', 'copyseeker']);
