'use strict';

angular.module('Qanairy.account', ['ui.router', 'Qanairy.AccountService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.account', {
    url: "/accounts",
    templateUrl: 'components/accounts/index.html',
    controller: 'AccountCtrl'
  });
}])

.controller('AccountCtrl', ['$rootScope', '$scope', 'Account', 'Auth', 'store', 'segment', '$mdDialog',
  function($rootScope, $scope, Account, Auth, store, segment, $mdDialog) {
    //INITIALIZATION

    $scope.$on('new-account', function(event, args){
      var account = {
        service_package: "alpha",
        payment_acct: payment_acct
      }
      Account.save(account);
    });

    $scope.createAccount = function(account_type){
      Account.save({service_package: account_type, payment_acct: payment_acct});
    }

    $scope.askDelete = function() {
       // Appending dialog to document.body to cover sidenav in docs app
       var confirm = $mdDialog.confirm()
             .title('Are you sure you would like to delete your account?')
             .targetEvent()
             .ok('Confirm')
             .cancel('Cancel');

       $mdDialog.show(confirm).then(function() {
         $scope.deleteAccount();
       }, function() {
         $scope.status = 'You decided to keep your account.';
       });
    };

    $scope.deleteAccount = function(){
      Account.delete().$promise
        .then(function(response){
          //logout
          Auth.logout();
          Auth.login();
        })
        .catch(function(err){
          alert("Error occurred deleting user");
        });
      segment.track("Delete user account", {
        email: $scope.profile.email
      }, function(success){

      });
    }

    if (Auth.getCachedProfile()) {
      $scope.profile = Auth.getCachedProfile();
    } else {
      Auth.getProfile(function(err, profile) {
        $scope.profile = profile;
      });
    }
  }
]);
