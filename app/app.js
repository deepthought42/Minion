'use strict';

// Declare app level module which depends on views, and components
angular.module('Minion', [
  'ui.router',
  'Minion.starter',
  'Minion.dashboard',
  'Minion.tester',
  'Minion.d3visualization',
  'bd.sockjs',
  'Minion.version'
]).
config(['$urlRouterProvider', function($urlRouterProvider) {
  $urlRouterProvider.otherwise('/starter');
}]);
