import { run } from '@ember/runloop';
import { set } from '@ember/object';
import { service } from '@ember-decorators/service';
import { Promise, resolve } from 'rsvp';

export default class SessionService {
  @service() firebase;

  constructor(createArgs) {
    Object.assign(this, createArgs);
    this.auth = this.firebase.app.auth();
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
    });
  }

  authenticate(email, password) {
    let promise = this.auth.signInWithEmailAndPassword(email, password)
      .catch(e => {
        return this.auth.createUserWithEmailAndPassword(email, password);
      });

    return resolve(promise);
  }

  static create(createArgs) {
    return new this(createArgs);
  }
}
