import Controller from '../groups';

export default class GroupsIndexController extends Controller {
  model() {
    return this.modelFor('groups');
  }
}
