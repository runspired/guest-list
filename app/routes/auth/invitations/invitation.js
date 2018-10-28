import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class AuthInvitationsInvitationRoute extends Route {
  @service store;

  model({ inviteId }) {
    return this.store.findRecord('invitation', inviteId);
  }
}
