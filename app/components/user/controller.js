'use strict';

angular.module('Qanairy.user', ['ui.router', 'Qanairy.TestUserService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.users', {
    url: "/users",
    templateUrl: 'components/user/index.html',
    controller: 'TestUserCtrl'
  });
}])

.controller('TestUserCtrl', ['$rootScope', '$scope', 'TestUser', 'store', '$state',
  function($rootScope, $scope, TestUser, store, $state) {
    $scope.edit_user = function(){
        $state.go("main.edit_user");
    }
  }
]);
