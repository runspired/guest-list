import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { RELATIONS, ROLES } from '../utils/options';

export default class ManageGuestComponent extends Component {
  constructor() {
    super(...arguments);
    this.relations = RELATIONS;
    this.roles = ROLES;
  }

  @service store;

  @action updateGuest(guest, event) {
    event.preventDefault();
    guest.save();
    return false;
  }
}
