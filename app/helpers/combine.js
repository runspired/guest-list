import { helper } from '@ember/component/helper';

export function concat(params/*, hash*/) {
  return [].concat(...params);
}

export default helper(concat);
