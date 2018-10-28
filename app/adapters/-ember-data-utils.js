import { guidFor } from '@ember/object/internals';

export function getRelationshipState(snapshot, kind, member) {
  let relProxy = snapshot.record[kind](member);

  return relProxy.belongsToRelationship || relProxy.hasManyRelationship;
}

export function getRecordDataFromSnapshot(snapshot) {
  return snapshot.record._internalModel._recordData;
}

export function isInverseMembershipCanonical(snapshot, kind, member, inverseSnapshot) {
  let state = getRelationshipState(snapshot, kind, member);
  let inverseId = guidFor(getRecordDataFromSnapshot(inverseSnapshot));

  return state.canonicalMembers.has(inverseId);
}

export function getInverseRelationship(store, relInfo) {
  let meta = relInfo.meta;
  let inverseProperty = meta.options.inverse || relInfo.__inverseKey;
  let inverseModelClass = store.modelFor(meta.type);

  return inverseModelClass.relationshipsByName.get(inverseProperty);
}
