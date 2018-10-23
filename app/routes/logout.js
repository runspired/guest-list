import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class LogoutRoute extends Route {
  @service session;

  beforeModel(transition) {
    return this.session.auth.signOut()
      .then(
        () => {
          transition.abort();
          return this.transitionTo('login');
        },
        () => {
          transition.abort();
          return this.transitionTo('login');
        }
      );
  }
}
