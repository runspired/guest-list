import Model from 'ember-data/model';
import { attr, belongsTo } from '@ember-decorators/data';

export default class GuestModel extends Model {
  @attr name;
  @attr({ defaultValue: '' })
  email;
  @attr({ defaultValue: '' })
  mobilePhone;
  @attr({ defaultValue: '' })
  relation;
  @attr({ defaultValue: '' })
  role;
  @attr({ defaultValue: false })
  isChild;
  @attr({ defaultValue: true })
  isInvited;
  @attr({ defaultValue: false })
  hasPlusOne;
  @belongsTo('invitation', { async: true, inverse: 'guests'})
  invitation;
}
