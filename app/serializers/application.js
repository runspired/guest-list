import { service } from '@ember-decorators/service';
import {
  getRecordDataFromSnapshot,
  isInverseMembershipCanonical,
} from '../-private/-ember-data-utils';
import makeId from '../-private/-generate-id-util';

export default class ApplicationSerializer {
  @service() store;

  constructor(createArgs) {
    Object.assign(this, createArgs);
  }

  normalizeResponse() {
    return arguments[2];
  }

  serializeSnapshot(snapshot) {
    let type = snapshot.modelName;

    if (!snapshot.id) {
      let id = makeId(type);
      snapshot.record.set('id', id);
      // patch store
      this.store._setRecordId(snapshot._internalModel, id, snapshot._internalModel.clientId);
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
      data: serialized,
      _relatedChanges: relationshipsToSave
    };
  }

  static create(createArgs) {
    return new this(createArgs);
  }
}
