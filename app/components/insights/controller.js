'use strict';

angular.module('Qanairy.insights', ['ui.router', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.insights', {
    url: "/insights",
    templateUrl: 'components/insights/index.html',
    controller: 'InsightCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('InsightCtrl', ['$rootScope', '$scope', 'Domain',  '$mdDialog', 'store', '$state',
  function($rootScope, $scope, Domain,  $mdDialog, store, $state) {
    this._init = function(){
      $scope.errors = [];
      Domain.getPages({url: store.get("domain").url}).$promise.
        then(function(data){
          $scope.pages = data;
        })
        .catch(function(err){
          $scope.errors.push(err);
        });
    };

    this._init();


  }
]);
