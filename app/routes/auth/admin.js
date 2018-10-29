import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';
import { run } from '@ember/runloop';

export default class AuthAdminRoute extends Route {
  @service store;
  @service session;

  model() {
    let id = this.session.auth.currentUser.uid;
    let user;

    this.store.findRecord('user', id)
      .catch(e => {
        let record = this.store.peekRecord('user', id);
        if (record) {
          run(() => record.unloadRecord());
        }
        record = this.store.createRecord('user', { id });
        return record.save();
      })
      .then(record => {
        user = record;
        return record.get('wedding');
      })
      .then(wedding => {
        if (!wedding) {
          wedding = this.store.createRecord('wedding', {
            admins: [user]
          });
        }

        return wedding;
      });
  }
}
