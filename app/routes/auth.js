import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';
import { hash } from 'rsvp';

export default class AuthRoute extends Route {
  @service session;

  beforeModel(transition) {
    return this.session.reauth()
      .catch(() => {
        transition.abort();
        this.transitionTo('login');
      });
  }

  model() {
    let user = this.session.user;

    return hash({
      user,
      wedding: user.get('wedding'),
      email: this.session.auth.currentUser.email
    });
  }
}
