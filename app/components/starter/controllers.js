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
      $scope.isStarted = false;
      //$scope.paths = PathRealtimeService;
    }

    $scope.startMappingProcess = function(workAllocation){
      console.log("Starting mapping process : " + workAllocation.url );
      WorkAllocation.query({url: $scope.workAllocation.url, account_key: "account_key_here"})
        .$promise.then(function(value){
          $scope.isStarted = true;
        });

      PathRealtimeService.connect("/streamPathExperience", "account_key_here",function(message) {
        console.log("Recieved message from server " + message + " :: " + Object.keys(message));
        $scope.paths.push(JSON.parse(message.data));
        $scope.$apply();
      });
    }

    $scope.stopMappingProcess = function(account_key){
      WorkAllocation.stopWork({account_key: "account_key_here"})
        .$promise.then(function(){
          $scope.isStarted = false;
        })
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
