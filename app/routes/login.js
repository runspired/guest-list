import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class LoginRoute extends Route {
  @service session;

  beforeModel(transition) {
    return this.session.reauth()
      .then(() => {
        transition.abort();
        return this.transitionTo('auth.index');
      })
      .catch(() => {
        return true;
      });
  }
}
