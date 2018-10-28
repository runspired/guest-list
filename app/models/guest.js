import Model from 'ember-data/model';
import { attr, belongsTo } from '@ember-decorators/data';

export default class GuestModel extends Model {
  @attr name;
  @belongsTo('invitation', { async: true, inverse: 'guests'})
  invitation;
}
