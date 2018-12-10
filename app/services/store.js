import Store from 'ember-data/store';
import { Promise, resolve } from 'rsvp';
import { set } from '@ember/object';
import { run } from '@ember/runloop';

export default class StoreService extends Store {
  constructor() {
    super(...arguments);
    this.documents = Object.create(null);
  }

  pushDocument(cacheKey, document) {
    return new Promise((resolve) => {
      run.join(() => {
        let collection = this.documents[cacheKey];
        let records;
  
        if (!document.errors && document.data) {
          records = this.push(document);
        }
  
        if (!collection) {
          collection = {};
          this.documents[cacheKey] = collection;
        }
  
        set(collection, 'errors', document.errors || null);
        set(collection, 'meta', document.meta || null);
        set(collection, 'links', document.links || null);
        set(collection, 'data', records);

        resolve(collection);
      });
    });
  }

  fetchCollection(cacheKey, query) {
    let collection = this.documents[cacheKey];

    if (collection === undefined) {
      let adapter = this.adapterFor('application');

      return adapter.fetchDocument(cacheKey, query)
        .then((doc) => this.pushDocument(cacheKey, doc));
    }

    return resolve(collection);
  }

}
