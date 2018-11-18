'use strict';

angular.module('Qanairy.user', ['ui.router', 'Qanairy.TestUserService', 'ui.toggle'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.users', {
    url: "/users",
    templateUrl: 'components/user/index.html',
    controller: 'TestUserCtrl'
  });
}])

.controller('TestUserCtrl', ['$rootScope', '$scope', 'Domain', 'store', '$state', 'segment', '$mdDialog',
  function($rootScope, $scope, Domain, store, $state, segment, $mdDialog) {
    this._init = function(){

      $scope.domains = null;
      $scope.domain_id = store.get('domain').id;
      Domain.getUsers({domain_id: $scope.domain_id}).$promise
        .then(function(users){
          $scope.users = users;
        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push(err.data);
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        })

        //ERRORS
        $scope.unresponsive_server_err = "Qanairy servers are currently unresponsive. Please try again in a few minutes.";
    }

    $scope.askDelete = function(user, index) {
       // Appending dialog to document.body to cover sidenav in docs app
       var confirm = $mdDialog.confirm()
             .title('Would you like to delete this user?')
             .targetEvent(user)
             .ok('Confirm')
             .cancel('Cancel');

       $mdDialog.show(confirm).then(function() {
         $scope.deleteUser(user, index);
       }, function() {
         $scope.status = 'You decided to keep your debt.';
       });
    };

    $scope.deleteUser = function(user, index){
      console.log("USER :: "+JSON.stringify(user));
      Domain.deleteUser({user_id: user.id, domain_key: store.get('domain').key, username: user.username}).$promise
        .then(function(response){
          console.log('deleted test user');
          $scope.users.splice(index, 1);
          segment.track("Deleted Test User", {
              domain : store.get('domain').url
            }, function(success){  });
        })
        .catch(function(err){
          if(err.data){
            $scope.errors.push("Error deleting test user");
          }
          else{
            $scope.errors.push({message: $scope.unresponsive_server_err });
          }
        });
    }

    $scope.editUser = function(user){
      $state.go("main.edit_user", {user: user, state: "update"});
    }

    $scope.createUser = function(user){
      $state.go("main.edit_user", {user: null, state: "create"});
    }

    this._init();
  }
]);
