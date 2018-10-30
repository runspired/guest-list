import Store from 'ember-data/store';
import { Promise, resolve } from 'rsvp';
import { run } from '@ember/runloop';
import { set } from '@ember/object';

export default class StoreService extends Store {
  constructor() {
    super(...arguments);
    this.documents = Object.create(null);
  }

  _push(doc) {
    if (!doc.data) {
      debugger;
    }
    return super._push(doc);
  }

  pushDocument(cacheKey, document) {
    return new Promise((resolve) => {
      let collection = this.documents[cacheKey];
      let records;

      if (!document.errors && document.data) {
        records = run(() => this.push(document));
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
