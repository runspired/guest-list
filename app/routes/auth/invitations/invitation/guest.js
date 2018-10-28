import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class AuthGuestRoute extends Route {
  @service store;

  model({ guestId }) {
    return this.store.findRecord('guest', guestId)
      .then(guest => {
        let invitation = this.modelFor('auth.invitations.invitation');

        return {
          guest,
          invitation
        };
      });
  }
}
