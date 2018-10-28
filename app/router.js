import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('auth', { path: '/' }, function() {
    this.route('index', { path: '/' });

    this.route('groups', { path: 'groups' }, function() {
      this.route('group', { path: '/:id' }, function() {
        this.route('invitation', { path: 'invitation/:id' }, function() {
          this.route('guest', { path: 'guest/:id' });
        });
      });
    });

    this.route('invitations', function() {
      this.route('invitation');
    });
  });
  this.route('login');
  this.route('logout');

});

export default Router;
