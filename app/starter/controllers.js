'use strict';

angular.module('Minion.starter', ['ui.router', 'Minion.WorkAllocationService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('starter', {
    url: "/starter",
    templateUrl: 'starter/index.html',
    controller: 'StarterIndexCtrl'
  });
}])

.controller('StarterIndexCtrl', ['$scope', 'WorkAllocation', function($scope, WorkAllocation) {
  $scope.startMappingProcess = function(workAllocation){
    console.log("Starting mapping process : " + workAllocation.url );
    WorkAllocation.query({url: $scope.workAllocation.url});
  }
}]);
