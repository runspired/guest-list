import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class IndexRoute extends Route {
  @service store;
}
