'use strict';

// Declare app level module which depends on views, and components
angular.module('Minion', [
  'ui.router',
  'Minion.starter',
  'Minion.dashboard',
  'Minion.tester',
  'Minion.main',
  'Minion.auth',
  'Minion.d3visualization',
  'stormpath',
  'stormpath.templates',
  'Minion.version'
]).
config(['$urlRouterProvider', function($urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
}]);
