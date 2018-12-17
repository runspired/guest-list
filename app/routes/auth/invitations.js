import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';
import { all } from 'rsvp';

export default class InvitationsRoute extends Route {
  @service store;
  @service stats;

  model() {
    let { store } = this;

    return store.fetchCollection('invitation')
      .then(collection => {
        return all([
          store.fetchCollection('guest'),
          store.fetchCollection('address')
        ]).then((results) => {
          this.stats.set('invitations', collection);
          this.stats.set('guests', results[0]);
          this.stats.set('addresses', results[1]);

          return collection;
        });
      });
  }

  setupController(controller, model) {
    controller.set('model', model);
    controller.set('stats', this.stats);
  }
}
