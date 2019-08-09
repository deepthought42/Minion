'use strict';

angular.module('Qanairy.dashboard', ['ui.router', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.dashboard', {
    url: "/dashboard",
    templateUrl: 'components/dashboard/index.html',
    controller: 'DashboardCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('DashboardCtrl', ['$rootScope', '$scope', 'Domain',  '$mdDialog', 'store', '$state', 'Account',
  function($rootScope, $scope, Domain,  $mdDialog, store, $state, Account) {
    this._init = function(){
      $scope.errors = [];
      Account.usageStats({domain_host: store.get("domain").url}).$promise.
        then(function(data){
          $scope.usage = data;
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    };

    this._init();
  }
]);
