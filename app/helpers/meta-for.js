import { helper } from '@ember/component/helper';

const META = new WeakMap();

export function metaFor([obj]/*, hash*/) {
  let meta = META.get(obj);

  if (meta === undefined) {
    meta = Object.create(null);
    META.set(obj, meta);
  }

  return meta;
}

export default helper(metaFor);
