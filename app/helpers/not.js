import { helper } from '@ember/component/helper';

export function not([bool]/*, hash*/) {
  return !bool;
}

export default helper(not);
