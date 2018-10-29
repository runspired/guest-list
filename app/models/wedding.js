import Model from 'ember-data/model';
import { attr } from '@ember-decorators/data';

export default class WeddingModel extends Model {
  @attr({ defaultValue: '' })
  name;
  @attr({ defaultValue: '' })
  party1;
  @attr({ defaultValue: '' })
  party2;
}
