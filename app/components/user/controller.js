'use strict';

angular.module('Qanairy.user_profile', ['ui.router', 'Qanairy.UserService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.user_profile', {
    url: "/profile",
    templateUrl: 'components/user/index.html',
    controller: 'UserProfileCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('UserProfileCtrl', ['$rootScope', '$scope', 'User', 'store', '$state',
  function($rootScope, $scope, User, store, $state) {
  }
]);
