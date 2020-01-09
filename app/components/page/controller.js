'use strict';

angular.module('Qanairy.page', ['ui.router', 'Qanairy.DomainService', 'Qanairy.insights'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.page', {
    url: "/page",
    templateUrl: 'components/page/index.html',
    controller: 'PageCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('PageCtrl', ['$rootScope', '$scope', 'Domain',  '$mdDialog', 'store', '$state',
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
