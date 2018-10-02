'use strict';

angular.module('Qanairy.user_edit', ['ui.router', 'Qanairy.TestUserService', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.edit_user', {
    url: "/users/edit",
    templateUrl: 'components/user/edit.html',
    controller: 'UserEditCtrl',
    params: {user: null, state: null}
  });
}])

.controller('UserEditCtrl', ['$rootScope', '$scope', 'TestUser', 'Domain', 'store', '$state', '$stateParams',
  function($rootScope, $scope, TestUser, Domain, store, $state, $stateParams) {

    this._init = function(){
      $scope.user = null;
      $scope.domain = store.get('domain');
      console.log("USER  ::: "+$stateParams.user);
      if($stateParams.state){
        $scope.state = $stateParams.state;
        store.set('last_user_state', $scope.state);
      }
      else{
        $scope.state = store.get('last_user_state');
      }

      if($stateParams.user){
        $scope.user = $stateParams.user;
        store.set('current_user', $scope.user);
      }
      else{
        $scope.user = store.get('current_user');
      }
    }

    $scope.save_user = function(user){
      console.log(user);
      console.log($scope.domain);
      Domain.saveUser({domain_id: $scope.domain.id, username: user.username, password: user.password, role: user.role, enabled: user.enabled}).$promise
        .then(function(){
          console.log("user saved successfully");
          $state.go("main.users")
        });
    }

    $scope.update_user = function(user){
      console.log(user);
      console.log($scope.domain);
      Domain.updateUser({domain_id: $scope.domain.id, user_id: user.id, username: user.username, password: user.password, role: user.role, enabled: user.enabled}).$promise
        .then(function(){
          console.log("user updated successfully");
          $state.go("main.users")
        });
    }

    this._init();
  }
]);
