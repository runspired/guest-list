import { service } from '@ember-decorators/service';
import { Promise, resolve, all } from 'rsvp';
import {
  getRelationshipState,
  getRecordDataFromSnapshot,
  getInverseRelationship
} from '../-private/-ember-data-utils';

export default class FirebaseAdapter {
  @service() firebase;
  @service() store;

  constructor(createArgs) {
    Object.assign(this, createArgs);
  }

  shouldReloadRecord() { return false; }
  shouldBackgroundReloadRecord() { return false; }

  deleteRecord(store, modelClass, snapshot) {
    let cascadeDelete = snapshot.adapterOptions && snapshot.adapterOptions.cascadeDelete;
    let promise;

    if (Array.isArray(cascadeDelete)) {
      let metas = modelClass.relationshipsByName;
      let toDelete = [];

      for (let i = 0; i < cascadeDelete.length; i++) {
        // TODO allow more than one level deep of cascade
        let meta = metas.get(cascadeDelete[0]);

        if (meta) {
          let data = snapshot[meta.kind](meta.name);

          if (Array.isArray(data)) {
            toDelete.push(...data);
          } else if (data) {
            toDelete.push(data);
          }
        }
      }

      let promises = toDelete.map(snapshot => {
        let record = snapshot.record;
        record.deleteRecord();
        return record.save()
          .then(() => record.unloadRecord());
      });

      promise = all(promises);
    }

    let savePromises = [];
    snapshot.eachRelationship((name, rel) => {
      let hasInverse = rel.meta.inverse !== null;

      if (hasInverse && (!Array.isArray(cascadeDelete) || cascadeDelete.indexOf(name) === -1)) {
        let inverse = getInverseRelationship(this.store, rel);

        if (!inverse) {
          return;
        }

        let recordData = getRecordDataFromSnapshot(snapshot);
        let snapshots = snapshot[rel.meta.kind](name);

        if (Array.isArray(snapshots)) {
          snapshots.forEach(snapshot => {
            savePromises.push(saveDeletionOnInverse(snapshot, recordData, inverse));
          });
        } else if (snapshots) {
          savePromises.push(saveDeletionOnInverse(snapshots, recordData, inverse));
        }
      }
    });

    return resolve(promise)
      .then(() => {
        return all(savePromises);
      })
      .then(() => {
        return _getRef(this.firebase.db, modelClass.modelName, snapshot.id)
          .delete()
          .then(() => {
            return { data: null };
          })
      });
  }

  fetchDocument(cacheKey /*, query*/) {
    return new Promise((resolve) => {
      let ref = _getRef(this.firebase.db, cacheKey);

      _getAndSubscribe(ref, resolve, (document) => {
        this.store.pushDocument(cacheKey, document);
      });
    });
  }

  queryRecord(store, modelClass, query) {
    if (query.id) {
      return this.findRecord(store, modelClass, query.id);
    }
  }

  findRecord(store, modelClass, id) {
    let ref = _getRef(this.firebase.db, modelClass.modelName, id);

    return new Promise((resolve, reject) => {
      _getAndSubscribe(
        ref,
        (doc) => {
          if (!doc || !doc.data) {
            reject({
              code: 404,
              message: 'Not Found'
            });
          } else {
            resolve(doc);
          }
        },
        (doc) => {
          if (doc && doc.data) {
            this.store.push(doc);
          }
        })
    });
  }

  updateRecord(store, modelClass, snapshot) {
    let serialized = store.serializerFor('application').serializeSnapshot(snapshot);
    let { data, _relatedChanges } = serialized;
    let options = snapshot.adapterOptions || {};

    return _getRef(this.firebase.db, modelClass.modelName, data.id)
      .set(data)
      .then(() => {
        if (options.propagateSave !== false) {
          let promises = _relatedChanges.map(related => {
            return related.record.save({ adapterOptions: {
              propagateSave: false
            }});
          });

          return all(promises);
        }
      })
      .then(() => {
        return {
          data: data
        };
      });
  }

  createRecord(store, modelClass, snapshot) {
    return this.updateRecord(store, modelClass, snapshot);
  }

  static create(createArgs) {
    return new this(createArgs);
  }
}

function saveDeletionOnInverse(snapshot, recordData, inverse) {
  let inverseState = getRelationshipState(snapshot, inverse.kind, inverse.name);
  inverseState.removeRecordData(recordData);

  return snapshot.record.save({
    adapterOptions: {
      propagateSave: false
    }
  });
}

function _getRef(db, type, id) {
  let collection = db.collection(type);

  if (typeof id !== 'undefined') {
    return collection.doc(id);
  }

  return collection;
}

function  _getAndSubscribe(ref, cb, update) {
  let isFirst = true;
  ref.onSnapshot(function(snapshot) {
    let promise;

    if (snapshot.docs) {
      let promises = snapshot.docs.map(docRef => {
        return docRef.ref.get({ source: 'default' })
          .then(ref => ref.data());
      });
      promise = all(promises);
    } else {
      promise = resolve(snapshot.data());
    }

    promise.then(data => {
      let document = { data };

      if (isFirst === true) {
        isFirst = false;
        cb(document);
      } else {
        update(document);
      }
    });
  }, function(error) {
    throw error;
  });
}
