'use strict';

angular.module('Qanairy.domain', ['ui.router'])

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

.controller('DomainCtrl', ['$rootScope', '$scope',
  function($rootScope, $scope) {
    this._init = function(){
      $scope.domain = [];
    }

    this._init();
  }
]);
