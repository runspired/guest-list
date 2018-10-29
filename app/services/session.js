import { run } from '@ember/runloop';
import { set } from '@ember/object';
import { service } from '@ember-decorators/service';
import { Promise, resolve } from 'rsvp';

export default class SessionService {
  @service firebase;
  @service store;

  constructor(createArgs) {
    Object.assign(this, createArgs);
    this.auth = this.firebase.app.auth();
  }

  getUser() {
    let id = this.auth.currentUser.uid;

    return this.store.queryRecord('user', { id })
      .catch(e => {
        let record = this.store.createRecord('user', { id, uid: id, wedding: null });

        return record.save();
      })
      .then(user => {
        this.user = user;
        return user.get('wedding');
      })
      .then(wedding => {
        this.wedding = wedding;
        return this.user;
      });
  }

  reauth() {
    return new Promise((resolve, reject) => {
      const unsub = this.auth.onAuthStateChanged((user) => {
          unsub();
          if (user === null) {
            reject(new Error('Not Authenticated'));
          } else {
            resolve(user);
          }
        },
        (err) => {
          unsub();
          reject(err);
        });
    })
    .then(() => {
      return this.getUser()
    });
  }

  authenticate(email, password) {
    let promise = this.auth.signInWithEmailAndPassword(email, password)
      .catch(e => {
        return this.auth.createUserWithEmailAndPassword(email, password);
      })
      .then(() => {
        return this.getUser()
      });

    return resolve(promise);
  }

  static create(createArgs) {
    return new this(createArgs);
  }
}
