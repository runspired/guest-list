import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class InvitationsRoute extends Route {
  @service store;

  model() {
    return this.store.fetchCollection('invitation');
  }
}
