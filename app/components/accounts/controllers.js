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

.controller('AccountCtrl', ['$rootScope', '$scope', 'Account', '$state', 'auth',
  function($rootScope, $scope, Account, $state, auth) {
    this._init = function(){
      $scope.paths = [];
      $scope.isStarted = false;
      $scope.current_node_image = "";
      $scope.current_node = null;
    }

    this._init();

    $scope.createAlphaAccount = function(){
      var account = {
        "orgName": "temp_org_name",
        "servicePackage": "alpha",
        "paymentAcctNum": ""
      }
      Account.save(account).$promise.then(function(){
        $state.go('main.discovery');
      },
      function(){
        console.log("Failure");
      });
    }
  }
]);
