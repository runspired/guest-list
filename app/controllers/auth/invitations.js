import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';

export default class AuthInvitationsController extends Controller {
  constructor() {
    super(...arguments);
    this.filterSideOfTheWedding = 'all';
    this.listSortProperty = 'id';
    this.listSortOrder = 'desc';
  }

  @computed('model.data.@each.{name,id}', 'listSortProperty', 'listSortOrder')
  get sortedInvitations() {
    let sortProp = this.listSortProperty;
    let order = this.listSortOrder;
    let up = order === 'desc' ? 1 : -1;
    let down = -up;
    let data = [...this.model.data]; // we can only sort in place

    data.sort((a, b) => {
      return a[sortProp] > b[sortProp] ? up : down;
    });

    return data;
  }

  @computed('sortedInvitations.@each.sideOfTheWedding', 'filterSideOfTheWedding')
  get filteredInvitations() {
    let filter = this.filterSideOfTheWedding;

    if (filter === 'all' || !filter) {
      return this.sortedInvitations;
    }

    return this.sortedInvitations.filter(i => i.sideOfTheWedding === filter);
  }
}
