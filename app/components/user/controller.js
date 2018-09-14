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
        .then(function(domains){
          console.log('retreived domain users');
          $scope.domains = domains;
        })
        .catch(function(){

        })
    }

    $scope.edit_user = function(){
        $state.go("main.edit_user");
    }

    this._init();
  }
]);
