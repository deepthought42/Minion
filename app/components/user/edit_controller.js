'use strict';

angular.module('Qanairy.user_edit', ['ui.router', 'Qanairy.TestUserService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.edit_user', {
    url: "/users/edit",
    templateUrl: 'components/user/edit.html',
    controller: 'UserEditCtrl'
  });
}])

.controller('UserEditCtrl', ['$rootScope', '$scope', 'TestUser', 'store', '$state',
  function($rootScope, $scope, TestUser, store, $state) {

  }
]);
