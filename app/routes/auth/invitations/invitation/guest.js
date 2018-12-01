import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class AuthGuestRoute extends Route {
  @service store;

  model({ guest_id }) {
    return this.store.findRecord('guest', guest_id)
      .then(guest => {
        let invitation = this.modelFor('auth.invitations.invitation');

        return {
          guest,
          invitation
        };
      });
  }
}
