'use strict';

angular.module('Qanairy.account', ['ui.router', 'Qanairy.AccountService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('account', {
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
      console.log("NEW ACCOUNT! WOOO!");
      var account = {
        service_package: "alpha",
        users: ["test32@qanairy.com"]
      }
      Account.save(account);
    });

    $scope.createAlphaAccount = function(){
      var account = {
        service_package: "alpha",
        users: ["test32@qanairy.com"]
      }
      Account.save(account);
    }
  }
]);
