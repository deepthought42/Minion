'use strict';

angular.module('Qanairy.user', ['ui.router', 'Qanairy.TestUserService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.users', {
    url: "/users",
    templateUrl: 'components/user/index.html',
    controller: 'TestUserCtrl'
  });
}])

.controller('TestUserCtrl', ['$rootScope', '$scope', 'Domain', 'store', '$state',
  function($rootScope, $scope, Domain, store, $state) {
    this._init = function(){
      $scope.domains = null;
      $scope.domain_id = store.get('domain').id;
      Domain.getUsers({domain_id: $scope.domain_id}).$promise
        .then(function(users){
          console.log('retreived domain users');
          $scope.users = users;
        })
        .catch(function(){

        })
    }

    $scope.editUser = function(user){
      console.log("USER :: "+Object.keys(user));
        $state.go("main.edit_user", {user: user, state: "update"});
    }

    $scope.createUser = function(user){
        $state.go("main.edit_user", {user: null, state: "create"});
    }

    this._init();
  }
]);
