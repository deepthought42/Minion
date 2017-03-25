'use strict';

angular.module('Qanairy.domain', ['ui.router', 'Qanairy.DomainService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.domain', {
    url: "/domain",
    templateUrl: 'components/domain/index.html',
    controller: 'DomainCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('DomainCtrl', ['$rootScope', '$scope', 'Domain',
  function($rootScope, $scope, Domain) {
    this._init = function(){
      $scope.domain = Domain.query();
    }

    $scope.createDomain = function(){
      $scope.newDomain = {name: "localhost:8001"};
      Domain.save($scope.newDomain);
      alert("creating domain ");
    }
    this._init();
  }
]);
