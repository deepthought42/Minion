'use strict';

angular.module('Minion.starter', ['ui.router', 'Minion.WorkAllocationService', 'Minion.PathRealtimeService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.starter', {
    url: "/starter",
    templateUrl: 'components/starter/index.html',
    controller: 'StarterIndexCtrl',
    sp: {
      authenticate: true
    }
  });
}])

.controller('StarterIndexCtrl', ['$scope', 'WorkAllocation', 'PathRealtimeService',
  function($scope, WorkAllocation, PathRealtimeService) {
    this._init = function(){
      $scope.paths = [];
      //$scope.paths = PathRealtimeService;
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

    /**
    * Displays a info for a selected path object in the drop down that
    * accompanies the error panel for the associated path
    */
    $scope.showInfoPanel = function(obj){

    }

    this._init();
  }
]);
