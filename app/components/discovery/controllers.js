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

.controller('WorkManagementCtrl', ['$rootScope', '$scope', 'WorkAllocation', 'PathRealtimeService', 'Tester', 'store', '$state',
  function($rootScope, $scope, WorkAllocation, PathRealtimeService, Tester, store, $state) {
    this._init = function(){
      $scope.tests = [];
      $scope.isStarted = false;
      $scope.current_node = null;
      $scope.visible = false;
      $scope.selectedTab = 0;
      $scope.group = {};
      $scope.group.name = "";
      $scope.group.description = ""

      if(store.get('active') === undefined){
        $scope.selectedTab = 0;
      }
      else{
        $scope.selectedTab = store.get('active');
      }

      if(store.get('domain') != null){

        $scope.discovery_url = store.get('domain').url;
        $scope.tests = Tester.getUnverified({url: $scope.discovery_url});

        // Enable pusher logging - don't include this in production
        Pusher.logToConsole = true;

        $scope.pusher = new Pusher('5103e64528e1579e78e3', {
          cluster: 'us2',
          encrypted: true
        });

        var channel = $scope.pusher.subscribe($scope.discovery_url);
        channel.bind('test-discovered', function(data) {
          alert(data.message);
          $scope.paths.push(JSON.parse(message.data));
        });
      }
      else{
        $state.go("main.domains")
      }
    }

    $scope.onTabChanges = function(currentTabIndex){
       store.set('active',currentTabIndex);
       $scope.selectedTab = currentTabIndex;
     };

    $rootScope.$on("openPathStream", function(){
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
          $scope.isStarted = true;
        });


      /*
      $scope.eventSource = PathRealtimeService.connect("/realtime/streamPathExperience", "account_key_here",function(message) {
        console.log("Recieved message from server " + message + " :: " + Object.keys(message));
        $scope.paths.push(JSON.parse(message.data));
        $scope.$apply();
      })
      */
    }

    $scope.setCurrentNode = function(node){
      $scope.current_node = node;
      store.set('active',0);
      $scope.selectedTab= 0;
      console.log('setting current node '+$scope.selectedTab);
    }

    $scope.toggleTestDataVisibility = function(test_key, node){
      $scope.selectedTab = 0;
      if(test_key == $scope.visibleTestKey){
        $scope.visible = !$scope.visible;
      }
      else{
        $scope.visibleTestKey = test_key;
        $scope.current_node = node;
        $scope.visible = true;
      }
    }

    $scope.stopMappingProcess = function(){
      WorkAllocation.stopWork()
        .$promise.then(function(){
          $scope.isStarted = false;
        });
    }


    $scope.addGroup = function(test, group){
      console.log("Adding group "+group+" to test ");

      Tester.addGroup({name: group.name, description: group.description, key: test.key})
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
          test.correct = data.correct;
        });

    }

    this._init();
  }
]);
