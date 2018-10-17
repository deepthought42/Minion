'use strict';

angular.module('Qanairy.user_form_discovery', ['ui.router', 'Qanairy.TestUserService', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.user_form_discovery', {
    url: "/users/user_form_discovery",
    templateUrl: 'components/user/userFormDiscovery.html',
    controller: 'UserFormDiscoveryCtrl',
    params: {form: null}
  });
}])

.controller('UserFormDiscoveryCtrl', ['$rootScope', '$scope', 'TestUser', 'Domain', 'store', '$state', '$stateParams',
  function($rootScope, $scope, TestUser, Domain, store, $state, $stateParams) {

    this._init = function(){
      $scope.user = {
        enabled: true
      };
      $scope.domain = store.get('domain');
      $scope.form = $stateParams.form;
      console.log("USER  ::: "+$stateParams.form);

    }

    $scope.save_user = function(user){
      console.log(user);
      console.log("Scope.domain : "+$scope.domain);
      console.log("scope.form : "+$scope.form);
      Domain.addUser({domain_id: $scope.domain.id, username: user.username, password: user.password, role: user.role, enabled: user.enabled}).$promise
        .then(function(user){
          store.set('current_user', null);
          console.log("user saved successfully");
          Domain.updateForm({domain_id: $scope.domain.id, key: $scope.form.key, name: $scope.form.name, form_type: $scope.form.type}).$promise
            .then(function(data){
              console.log("Successfully updated form");
              $state.go("main.discovery");
            })
            .catch(function(err){
              alert("error occurred while initiating login/registration form discovery");
              console.log("error occured while saving form");
            })
        })
        .catch(function(err){
          alert("Error occurred while creating user");
          console.log("an error occurred while creating user :: "+err);
        });
    }

    this._init();
  }
]);
