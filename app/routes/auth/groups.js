import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class MyRoute extends Route {
  @service store;

  model() {
    return this.get('store').fetchCollection('group');
  }
}
