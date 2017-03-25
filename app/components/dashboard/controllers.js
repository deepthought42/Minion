'use strict';

angular.module('Qanairy.dashboard', ['ui.router'])

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

.controller('DashboardCtrl', ['$rootScope', '$scope',
  function($rootScope, $scope) {
    this._init = function(){
      $scope.paths = [];
      $scope.isStarted = false;
      $scope.current_node_image = "";
      $scope.current_node = null;
    }

    this._init();
  }
]);
