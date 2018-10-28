import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class AuthRoute extends Route {
  @service session;

  beforeModel(transition) {
    return this.session.reauth()
      .catch(e => {
        transition.abort();
        this.transitionTo('login');
      });
  }
}
