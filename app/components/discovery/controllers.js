'use strict';

angular.module('Qanairy.discovery', ['ui.router', 'Qanairy.WorkAllocationService', 'Qanairy.PathRealtimeService'])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('main.discovery', {
    url: "/discovery",
    templateUrl: 'components/discovery/index.html',
    controller: 'WorkManagementCtrl',
    data: {
      requiresLogin: true
    }
  });
}])

.controller('WorkManagementCtrl', ['$rootScope', '$scope', 'WorkAllocation', 'PathRealtimeService',
  function($rootScope, $scope, WorkAllocation, PathRealtimeService) {
    this._init = function(){
      $scope.paths = [];
      $scope.isStarted = false;
      $scope.current_node_image = "";
      $scope.current_node = null;
      $scope.paths= [];
    }

    $rootScope.$on("openPathStream", function(){
      console.log("OPENING PATH STREAM");

      /**We use an event source for sse over websockets because websockets are overkill for the current usage */
      $scope.eventSource = PathRealtimeService.connect("/realtime/streamPathExperience", "account_key_here", function(message) {
        console.log("Recieved message from server " + message + " :: " + Object.keys(message));
        $scope.paths.push(JSON.parse(message.data));
        $scope.$apply();
      });
    });

    $rootScope.$on("closePathStream", function(){
      console.log("Closing Event Source");
      $scope.eventSource.close();

    })
    $scope.startMappingProcess = function(workAllocation){
      console.log("Starting mapping process : " + workAllocation.url );
      WorkAllocation.query({url:  $scope.workAllocation.urlProtocol+"://"+$scope.workAllocation.url, account_key: "account_key_here"})
        .$promise.then(function(value){
          //console.log("VALUE : "+value);
          $scope.isStarted = true;
        });

      $scope.eventSource = PathRealtimeService.connect("/streamPathExperience", "account_key_here",function(message) {
        console.log("Recieved message from server " + message + " :: " + Object.keys(message));
        $scope.paths.push(JSON.parse(message.data));
        $scope.$apply();
      });
    }

    $scope.stopMappingProcess = function(account_key){
      WorkAllocation.stopWork({account_key: "account_key_here"})
        .$promise.then(function(){
          $scope.isStarted = false;
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
