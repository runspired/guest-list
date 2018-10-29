import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class AuthInvitationsIndexRoute extends Route {
  @service stats;

  model() {
    let model = this.modelFor('auth.invitations');

    return this.store.fetchCollection('guest')
      .then(guestCollection => {
        this.stats.set('invitations', model);
        this.stats.set('guests', guestCollection);

        return model;
      });
  }

  setupController(controller, model) {
    controller.set('model', model);
    controller.set('stats', this.stats);
  }
}
