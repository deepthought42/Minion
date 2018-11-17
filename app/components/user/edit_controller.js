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

.controller('UserEditCtrl', ['$rootScope', '$scope', 'TestUser', 'Domain', 'store', '$state', '$stateParams', 'segment',
  function($rootScope, $scope, TestUser, Domain, store, $state, $stateParams, segment) {

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
      Domain.addUser({domain_id: $scope.domain.id, username: user.username, password: user.password, role: user.role, enabled: user.enabled}).$promise
        .then(function(user){
          store.set('current_user', null);
          console.log("user saved successfully");

          segment.track("Created user", {
            domain: $scope.domain.id,
            user: user.username,
            succeeded : true
          }, function(success){});
          $state.go("main.users");
        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push("Error occurred while creating test user");
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });
    }

    $scope.update_user = function(user){
      console.log(user);
      console.log($scope.domain);
      TestUser.update({id: user.id, username: user.username, password: user.password, role: user.role, isEnabled: user.enabled}).$promise
        .then(function(data){
          segment.track("Updated user", {
            user: user.username,
            succeeded : true
          }, function(success){});
          store.set('current_user', null);
          console.log("user updated successfully");
          $state.go("main.users")
        }).
        catch(function(err){
          if(err.data){
            $scope.errors.push("An error occured while updating user");
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });
    }

    $scope.cancel = function(){
      $state.go("main.users");
    }
    this._init();
  }
]);
