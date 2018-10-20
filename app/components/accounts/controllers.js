'use strict';

angular.module('Qanairy.account', ['ui.router', 'Qanairy.AccountService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.account', {
    url: "/accounts",
    templateUrl: 'components/accounts/index.html',
    controller: 'AccountCtrl'
  });
}])

.controller('AccountCtrl', ['$rootScope', '$scope', 'Account', 'Auth', 'store',
  function($rootScope, $scope, Account, Auth, store) {
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

    $scope.deleteAccount = function(acct){
      console.log("Deleting account maybe..");
      Account.delete(acct);
      segment.track("Delete user account", {
        account_id: acct.id
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
