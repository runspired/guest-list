import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

export default class LoginController extends Controller {
  @service session;

  @action
  login(email, password) {
    this.set('disabled', true);
    this.session.authenticate(email, password)
      .then(
        () => { this.transitionToRoute('auth.index'); },
        (e) => { this.set('error', e); }
        )
      .finally(() => {
        this.set('disabled', false);
      });
  }
}
