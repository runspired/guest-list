import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class GuestsAddController extends Controller {
  @action
  addGroup(groupName) {
    let groupRecord = this.get('store').createRecord('group', { name: groupName });

    groupRecord.save();
  }

  @action
  addInvitation(group, name) {
    let invitation = this.get('store')
      .createRecord('invitation', {
        name,
        group
      });

    invitation.save();
  }

  @action
  addGuest(invitation, name) {
    let guest = this.get('store')
      .createRecord('guest', {
        name,
        invitation
      });

    guest.save();
  }
}
