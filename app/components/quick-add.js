import Component from '@ember/component';
import { action } from '@ember-decorators/object';

export default class QuickAddComponent extends Component {
  @action
  submitForm() {
    if (this.newValue) {
      this.onSubmit(this.newValue);
      this.set('newValue', '');
    }
  }
}
