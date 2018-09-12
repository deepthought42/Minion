'use strict';

angular.module('Qanairy.user_profile', ['ui.router', 'Qanairy.UserService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.test_users', {
    url: "/users",
    templateUrl: 'components/user/index.html',
    controller: 'TestUserCtrl'
  });
}])

.controller('TestUserCtrl', ['$rootScope', '$scope', 'User', 'store', '$state',
  function($rootScope, $scope, User, store, $state) {

  }
]);
