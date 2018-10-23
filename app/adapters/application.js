import { service } from '@ember-decorators/service';
import { Promise, resolve, all } from 'rsvp';
import {
  getRelationshipState,
  getRecordDataFromSnapshot,
  isInverseMembershipCanonical,
  getInverseRelationship
} from './-ember-data-utils';
import makeId from './-generate-id-util';

function saveDeletionOnInverse(snapshot, recordData, inverse) {
  let inverseState = getRelationshipState(snapshot, inverse.kind, inverse.name);
  inverseState.removeRecordData(recordData);

  return snapshot.record.save({
    adapterOptions: {
      propagateSave: false
    }
  });
}

export default class FirebaseAdapter {
  @service() firebase;
  @service() store;

  constructor(createArgs) {
    Object.assign(this, createArgs);
  }

  _getRef(type, id) {
    let collection = this.firebase.db.collection(type);

    if (typeof id !== 'undefined') {
      return collection.doc(id);
    }

    return collection;
  }

  _getAndSubscribe(ref, cb, update) {
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
        }
        update(document);
      });
    }, function(error) {
      // TODO what now?
      debugger;
    });
  }

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
        return this.firebase.db
          .collection(modelClass.modelName)
          .doc(snapshot.id)
          .delete()
          .then(() => {
            return { data: null };
          })
      });
  }

  fetchDocument(cacheKey /*, query*/) {
    return new Promise((resolve) => {
      let ref = this._getRef(cacheKey);

      this._getAndSubscribe(ref, resolve, (document) => {
        this.store.pushDocument(cacheKey, document);
      });
    });
  }

  findRecord(store, modelClass, id) {
    let ref = this.firebase.db
      .collection(modelClass.modelName)
      .doc(id);

    return new Promise(resolve => {
      this._getAndSubscribe(ref, resolve, (doc) => {
        this.store.push(doc);
      })
    });
  }

  updateRecord(store, modelClass, snapshot) {
    let { serialized, relatedSnapshots } = this._serialize(store, modelClass.modelName, snapshot);
    let options = snapshot.adapterOptions || {};

    return this.firebase.db
      .collection(modelClass.modelName)
      .doc(serialized.id)
      .set(serialized)
      .then(() => {
        if (options.propagateSave !== false) {
          let promises = relatedSnapshots.map(related => {
            return related.record.save({ adapterOptions: {
              propagateSave: false
            }});
          });

          return all(promises);
        }
      })
      .then(() => {
        return {
          data: serialized
        };
      });
  }

  _serialize(store, type, snapshot) {
    if (!snapshot.id) {
      let id = makeId(type);
      snapshot.record.set('id', id);
      // patch store
      store._setRecordId(snapshot._internalModel, id, snapshot._internalModel.clientId);
      snapshot.id = id;
      getRecordDataFromSnapshot(snapshot).id = id;
    }
    let serialized = {
      id: snapshot.id,
      type,
      attributes: snapshot.attributes(),
      relationships: {}
    };

    let relationshipsToSave = [];

    snapshot.eachRelationship((name, meta) => {
      let linkage = serialized.relationships[name] = {};
      if (meta.kind === 'hasMany') {
        let relData = snapshot.hasMany(name) || [];

        linkage.data = relData.map(r => {
          if (!isInverseMembershipCanonical(snapshot, meta.kind, name, r)) {
            relationshipsToSave.push(r);
          }

          return {
            id: r.id,
            type: r.modelName
          };
        });

      } else {
        let relData = snapshot.belongsTo(name);

        if (relData) {
          if (!isInverseMembershipCanonical(snapshot, meta.kind, name, relData)) {
            relationshipsToSave.push(relData);
          }

          linkage.data = {
            id: relData.id,
            type: relData.modelName
          };
        }
      }
    });

    return {
      serialized,
      relatedSnapshots: relationshipsToSave
    };
  }

  createRecord(store, modelClass, snapshot) {
    return this.updateRecord(store, modelClass, snapshot);
  }

  static create(createArgs) {
    return new this(createArgs);
  }
}
