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

.controller('UserFormDiscoveryCtrl', ['$rootScope', '$scope', 'TestUser', 'Domain', 'store', '$state', '$stateParams', 'segment',
  function($rootScope, $scope, TestUser, Domain, store, $state, $stateParams, segment) {

    this._init = function(){
      $scope.user = {
        enabled: true
      };
      $scope.domain = store.get('domain');
      $scope.form = $stateParams.form;
    }

    $scope.save_user = function(user){
      Domain.addUser({domain_id: $scope.domain.id, username: user.username, password: user.password, role: user.role, enabled: user.enabled}).$promise
        .then(function(user){
          segment.track("Created user", {
            domain: $scope.domain.id,
            user: user.username,
            succeeded : true
          }, function(success){});

          store.set('current_user', null);
          Domain.updateForm({domain_id: $scope.domain.id, id: $scope.form.id, name: $scope.form.name, form_type: $scope.form.type}).$promise
            .then(function(data){
              segment.track("Updated form", {
                form_key: $scope.form.key,
                domain: $scope.domain.id,
                succeeded : true
              }, function(success){});

              $state.go("main.discovery");
            })
            .catch(function(err){
              segment.track("Updated form", {
                form_key: $scope.form.key,
                domain: $scope.domain.id,
                succeeded : false
              }, function(success){});

              alert("error occurred while initiating login/registration form discovery");
            })
        })
        .catch(function(err){
          segment.track("Created user", {
            domain: $scope.domain.id,
            user: user.username,
            succeeded : false
          }, function(success){});

          alert("Error occurred while creating user");
        });
    }

    this._init();
  }
]);
