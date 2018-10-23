import Model from 'ember-data/model';
import { attr, belongsTo } from '@ember-decorators/data';

export default class AddressModel extends Model {
  @belongsTo('invitation', { async: true, inverse: 'address'})
  invitation;
  @attr
  street;
  @attr
  street2;
  @attr
  city;
  @attr
  state;
  @attr
  zipcode;
}
