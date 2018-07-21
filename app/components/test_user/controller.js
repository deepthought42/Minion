'use strict';

angular.module('Qanairy.test_user', ['ui.router', 'Qanairy.TestUserService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.test_user', {
    url: "/test_user",
    templateUrl: 'components/test_user/index.html',
    controller: 'TestUserCtrl'
  });
}])

.controller('TestUserCtrl', ['$rootScope', '$scope', 'TestUser', 'store', '$state',
  function($rootScope, $scope, TestUser, store, $state) {

  }
]);
