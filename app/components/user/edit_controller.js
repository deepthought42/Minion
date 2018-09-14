'use strict';

angular.module('Qanairy.user_edit', ['ui.router', 'Qanairy.TestUserService', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.edit_user', {
    url: "/users/edit",
    templateUrl: 'components/user/edit.html',
    controller: 'UserEditCtrl'
  });
}])

.controller('UserEditCtrl', ['$rootScope', '$scope', 'TestUser', 'Domain', 'store', '$state',
  function($rootScope, $scope, TestUser, Domain, store, $state) {

    this._init = function(){
      $scope.domain = store.get('domain');
    }

    $scope.create_user = function(user){
      console.log(user);
      console.log($scope.domain);
      Domain.saveUser({domain_id: $scope.domain.id, username: user.username, password: user.password, role: user.role, enabled: user.isEnabled}).$promise
        .then(function(){
          console.log("user saved successfully");
          $state.go("main.users")
        });
    }

    this._init();
  }
]);
