import { helper } from '@ember/component/helper';

export function actions(actions/*, hash*/) {
  return (...args) => {
    actions.forEach(action => action(...args))
  };
}

export default helper(actions);
