import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';
import { all } from 'rsvp';

export default class InvitationsRoute extends Route {
  @service store;

  model() {
    let { store } = this;

    return store.fetchCollection('invitation')
      .then(collection => {
        return all([
          store.fetchCollection('guest'),
          store.fetchCollection('address')
        ]).then(() => collection);
      });
  }
}
