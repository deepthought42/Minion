'use strict';

angular.module('Minion.starter', ['ui.router', 'Minion.WorkAllocationService', 'Minion.PathRealtimeService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('starter', {
    url: "/starter",
    templateUrl: 'starter/index.html',
    controller: 'StarterIndexCtrl'
  });
}])

.controller('StarterIndexCtrl', ['$scope', 'WorkAllocation', 'PathRealtimeService',
  function($scope, WorkAllocation, PathRealtimeService) {
    this._init = function(){
      $scope.paths = [];
    }

    $scope.startMappingProcess = function(workAllocation){
      console.log("Starting mapping process : " + workAllocation.url );
      WorkAllocation.query({url: $scope.workAllocation.url});

      PathRealtimeService.connect("/streamPathExperience", function(message) {
        console.log("Recieved message from server " + message + " :: " + Object.keys(message));
        $scope.paths.push(JSON.parse(message.data));
        $scope.$apply();
      });
    }

    this._init();
  }
]);
