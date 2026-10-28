import {hashValue} from './hash.js';
const validated=new WeakMap();
export const planDigest=p=>hashValue(Object.fromEntries(Object.entries(p).filter(([k])=>k!=='hash')));
export function certify(p){validated.set(p,p.hash);}
export function assertValidated(p){if(!p||validated.get(p)!==p.hash||planDigest(p)!==p.hash)throw Error('Model must be validated and unchanged');}
