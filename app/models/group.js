import DS from 'ember-data';
import { attr, hasMany } from '@ember-decorators/data';
const { Model } = DS;

export default class GroupModel extends Model {
  @attr name;
  @hasMany('invitation', { async: true, inverse: 'group' }) invitations;
}
