import Model from 'ember-data/model';
import { attr, belongsTo } from '@ember-decorators/data';

export default class UserModel extends Model {
  @attr
  uid;
  @attr({ defaultValue: '' })
  name;
  @belongsTo('wedding', { async: true, inverse: null })
  wedding;
}
