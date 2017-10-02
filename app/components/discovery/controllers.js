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
      $scope.selectedTab = {};
      $scope.selectedTab.dataTab = 0;
      $scope.group = {};
      $scope.group.name = "";
      $scope.group.description = ""

      if(store.get('active') === undefined){
        $scope.selectedTab.dataTab = 0;
      }
      else{
        $scope.selectedTab.dataTab = store.get('active');
      }

      if(store.get('domain') != null){

        $scope.discovery_url = store.get('domain').url;
        $scope.tests = Tester.getUnverified({url: $scope.discovery_url});

        // Enable pusher logging - don't include this in production
        Pusher.logToConsole = true;

        var pusher = new Pusher('77fec1184d841b55919e', {
          cluster: 'us2',
          encrypted: true
        });



        console.debug($scope.extractHostname($scope.discovery_url))
        var channel = pusher.subscribe($scope.extractHostname($scope.discovery_url));
        channel.bind('test-discovered', function(data) {
          console.log("discovery url :: " + $scope.extractHostname($scope.discovery_url));
          alert(data.message);
          $scope.paths.push(JSON.parse(message.data));

        });

        /*var channel = $scope.pusher.subscribe($scope.discovery_url);
        channel.bind('test-discovered', function(data) {
          alert(data.message);
          $scope.paths.push(JSON.parse(message.data));
        });
        */
      }
      else{
        $state.go("main.domains")
      }
    }

    $scope.extractHostname =  function(url) {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf("://") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    }

    $scope.onTabChanges = function(currentTabIndex){
       store.set('active',currentTabIndex);
       $scope.selectedTab.dataTab = currentTabIndex;
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
      WorkAllocation.query({url:  $scope.discovery_url})
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
    }

    $scope.setTestName = function(key, name){
      Tester.updateName({key: key, name: name});
    }

    $scope.showTestData = function(test, node){
      test.visible = true;
      setCurrentNode(node);
    }


    $scope.toggleTestDataVisibility = function(test, node){
      $scope.selectedTab.dataTab = 0;

      test.visible = !test.visible || true;
    }

    $scope.stopMappingProcess = function(){
      WorkAllocation.stopWork()
        .$promise.then(function(){
          $scope.isStarted = false;
        });
    }


    $scope.addGroup = function(test, group){
      Tester.addGroup({name: group.name, description: group.description, key: test.key})
    }

    $scope.removeGroup = function(key, group){
      Tester.removeGroup({key: key, name: group.name});
    }

    /**
    * Displays a info for a selected path object in the drop down that
    * accompanies the error panel for the associated path
    */
    $scope.showInfoPanel = function(obj){

    }

    $scope.updateCorrectness = function(test, correctness, idx){
      Tester.updateCorrectness({key: test.key, correct: correctness}).$promise
        .then(function(data){
          test.correct = data.correct;
          //remove from list
          $scope.tests.splice(idx, 1);
          //update approved test count

          if(!store.get('approved_test_cnt')){
            store.set('approved_test_cnt', 1);
          }
          else{
            var approved_cnt = store.get('approved_test_cnt');
            store.set('approved_test_cnt', approved_cnt);
          }
        });
    }

    this._init();
  }
]);
