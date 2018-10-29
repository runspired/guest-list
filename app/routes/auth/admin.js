import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';
import { run } from '@ember/runloop';

export default class AuthAdminRoute extends Route {
  @service store;
  @service session;

  model() {
    let user = this.session.user;

    return user.get('wedding')
      .then(wedding => {
        if (!wedding) {
          return this.store.fetchCollection('wedding')
            .then(weddings => {
              let wedding = weddings.data.objectAt(0);

              if (wedding) {
                user.set('wedding', wedding);
                return wedding.save()
                  .then(() => user.save())
                  .then(_ => wedding);
              }

              return wedding;
            });
        }

        return wedding;
      })
      .then(wedding => {
        if (!wedding) {
          wedding = this.store.createRecord('wedding');
          user.set('wedding', wedding);
          return wedding.save()
            .then(() => user.save())
            .then(_ => wedding);
        }

        return wedding;
      });
  }
}
