import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

export default class ManageInvitationComponent extends Component {
  @service store;

  @action
  deleteInvitation(invitation) {
    let prompt = `Are you sure you want to delete the invitation for ${invitation.name}?\n\nThis invitation contains the following guests:\n\t - ${invitation.guests.map(g => g.name).join('\n\t - ')}`;
    if (confirm(prompt)) {
      invitation.deleteRecord();
      invitation.save({ adapterOptions: { cascadeDelete: ['guests'] }})
        .then(() => {
          invitation.unloadRecord();
        });
    }
  }

  @action
  addInvitation(name) {
    let invitation = this.store.createRecord('invitation', {
        name,
        group: null
      });

    invitation.save();
  }

  @action
  addGuest(invitation, name) {
    let guest = this.store.createRecord('guest', {
        name,
        invitation
      });

    guest.save();
  }

  @action
  updateAddress(invitation, address) {
    invitation.set('address', address);
    address.save();
  }
}
