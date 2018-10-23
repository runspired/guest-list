import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

export default class ManageAddressComponent extends Component {
  @service store;
  @action
  createAddress() {
    if (this.address) {
      this.set('isEditing', true);
      return;
    }
    let address = this.store.createRecord('address');
    this.set('address', address);
    this.set('isEditing', true);
  }

  @action
  saveAddress(address) {
    this.set('isEditing', false);
    this.onUpdate(address);
  }
}
