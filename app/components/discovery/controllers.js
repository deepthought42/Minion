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

.controller('WorkManagementCtrl', ['$rootScope', '$scope', 'WorkAllocation', 'PathRealtimeService', 'Tester', 'store',
  function($rootScope, $scope, WorkAllocation, PathRealtimeService, Tester, store) {
    this._init = function(){
      $scope.paths = [];
      $scope.isStarted = false;
      $scope.current_node_image = "";
      $scope.current_node = null;
      $scope.paths= [];
      if(store.get('domain') != null){
        $scope.discovery_url = store.get('domain').url;
      }
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

    $scope.startMappingProcess = function(){
      console.log("Starting mapping process : " + $scope.discovery_url );
      WorkAllocation.query({url:  "http://"+$scope.discovery_url})
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

    $scope.stopMappingProcess = function(){
      WorkAllocation.stopWork()
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

    $scope.updateCorrectness = function(test, correctness){
      Tester.updateCorrectness({key: test.key, correct: correctness}).$promise
        .then(function(data){
          console.log("successfully updated");
        })
    }

    this._init();
  }
]);
