import DS from 'ember-data';
const { Serializer } = DS;

export default class ApplicationSerializer extends Serializer {
  normalizeResponse() {
    return arguments[2];
  }
}
