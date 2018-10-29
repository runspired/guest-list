import Model from 'ember-data/model';
import { attr } from '@ember-decorators/data';

export default class WeddingModel extends Model {
  @attr
  name;
  @attr
  party1;
  @attr
  party2;
}
