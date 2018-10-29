import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class AuthAdminController extends Controller {
  @action
  saveWedding(wedding) {
    wedding.save();
  }
}
