import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class AuthGuestsRoute extends Route {
  @service store;

  model() {
    return this.store.fetchCollection('guest');
  }
}
