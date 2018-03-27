'use strict';

angular.module('Qanairy.account', ['ui.router', 'Qanairy.AccountService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.account', {
    url: "/accounts",
    templateUrl: 'components/accounts/index.html',
    controller: 'AccountCtrl',
    sp: {
      authenticate: true
    }
  });
}])

.controller('AccountCtrl', ['$rootScope', '$scope', 'Account',
  function($rootScope, $scope, Account) {
    this._init = function(){

    }

    this._init();

    $scope.$on('new-account', function(event, args){
      console.log("NEW ACCOUNT event! WOOO!");
      var account = {
        service_package: "alpha",
        payment_acct: payment_acct
      }
      Account.save(account);
    });

    $scope.createAccount = function(account_type){
      Account.save({service_package: account_type, payment_acct: payment_acct});
    }

    $scope.deleteAccount = function(){
      console.log("Deleting account maybe..");
      Account.delete();
    }
  }
]);
