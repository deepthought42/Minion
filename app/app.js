'use strict';

// Declare app level module which depends on views, and components
angular.module('Minion', [
  'ui.router',
  'Minion.starter',
  'Minion.dashboard',
  'Minion.tester',
  'Minion.main',
  'Minion.register',
  'Minion.login',
  'Minion.d3visualization',
  'stormpath',
  'stormpath.templates',
  'Minion.version'
]).
config(['$urlRouterProvider', 'STORMPATH_CONFIG', function($urlRouterProvider, STORMPATH_CONFIG) {
  STORMPATH_CONFIG.ENDPOINT_PREFIX = 'http://localhost:8080';
  $urlRouterProvider.otherwise('/');
}]);
