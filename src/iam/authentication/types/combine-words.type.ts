export type CombineWordsTypes = 'fl' | 'lf' | 'f' | 'l' | 'sfl' | 'slf' | 'lsf' | 'fsl';

export const combineMapper = new Map<CombineWordsTypes, (w1: string, w2: string) => string>();
combineMapper.set('f', (w1, w2) => `${w1}${Math.round(Math.random() * 100)}`);
combineMapper.set('l', (w1, w2) => `${w2}${Math.round(Math.random() * 100)}`);
combineMapper.set('fl', (w1, w2) => `${w1}${w2}${Math.round(Math.random() * 100)}`);
combineMapper.set('lf', (w1, w2) => `${w2}${w1}${Math.round(Math.random() * 100)}`);
combineMapper.set('sfl', (w1, w2) => `${w1.charAt(0)}${w2}${Math.round(Math.random() * 100)}`);
combineMapper.set('slf', (w1, w2) => `${w2.charAt(0)}${w1}${Math.round(Math.random() * 100)}`);
combineMapper.set('lsf', (w1, w2) => `${w2}${w1.charAt(0)}${Math.round(Math.random() * 100)}`);
combineMapper.set('fsl', (w1, w2) => `${w1}${w2.charAt(0)}${Math.round(Math.random() * 100)}`);