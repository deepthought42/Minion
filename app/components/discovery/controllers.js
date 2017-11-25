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
    var getFailingCount = function(){
      Tester.getFailingCount({url: $scope.domain }).$promise
        .then(function(data){
          store.set("failing_tests", data.failing);
          $scope.failing_tests = data.failing;
        })
        .catch(function(err){
          $scope.errors.push(err.data.message);
        });;
    }

    this._init = function(){
      $scope.errors = [];
      $scope.tests = [];
      $scope.isStarted = false;
      $scope.current_node = null;
      $scope.visible = false;

      $scope.visible_tab = "nodedata0";

      $scope.groups = [];
      $scope.group = {};
      $scope.group.name = "";
      $scope.group.description = "";

      if(store.get('domain') != null){
        $scope.waitingOnTests = true;
        $scope.discovery_url = store.get('domain').url;
        Tester.getUnverified({url: $scope.discovery_url}).$promise
            .then(function(data){
              $scope.tests = data
              $scope.waitingOnTests = false;
            })
            .catch(function(err){
              console.log("error getting tests");
              $scope.errors.push(err.data.message);
              $scope.waitingOnTests = false;
            });

        // Enable pusher logging - don't include this in production
        //Pusher.logToConsole = true;

        var pusher = new Pusher('77fec1184d841b55919e', {
          cluster: 'us2',
          encrypted: true
        });

        var channel = pusher.subscribe($scope.extractHostname($scope.discovery_url));
        channel.bind('test-discovered', function(data) {
          $scope.tests.push(JSON.parse(data));
          $scope.$apply();
        });
      }
      else{
        $state.go("main.domains")
      }

      getFailingCount();
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

    $scope.startMappingProcess = function(){
      WorkAllocation.query({url:  $scope.discovery_url}).$promise
        .then(function(value){
          $scope.isStarted = true;
        })
        .catch(function(err){
          console.log("error:: "+err);
          $scope.errors.push(err.data.message);
        });
    }

    $scope.setCurrentNode = function(node){
      $scope.current_node = node;
    }

    $scope.setTestName = function(test, new_name){
      test.show_waiting_icon = true;
      Tester.updateName({key: test.key, name: new_name}).$promise
        .then(function(data){
          test.show_waiting_icon = false;
          test.show_test_name_edit_field=false;
          test.name = new_name;
        })
        .catch(function(err){
          test.show_waiting_icon = false;
          test.show_test_name_edit_field = false;
        });
    }

    $scope.showTestData = function(test, node){
      test.visible = true;
      setCurrentNode(node);
    }

    $scope.toggleTestDataVisibility = function(test){
      test.visible = !test.visible;

      if(test.visible){
        $scope.setCurrentNode(test.path.path[0]);
      }
    }

    $scope.stopMappingProcess = function(){
      WorkAllocation.stopWork().$promise
        .then(function(){
          $scope.isStarted = false;
        })
        .catch(function(err){
          $scope.errors.push(err.data.message);
        });
    }


    $scope.addGroup = function(test, group){
      Tester.addGroup({name: group.name,
                       description: group.description,
                       key: test.key}).$promise
                .then(function(data){
                   $scope.groups.push(data);
                 })
                 .catch(function(err){
                   $scope.errors.push(err.data.message);
                 });
    }

    $scope.removeGroup = function(key, group){
      Tester.removeGroup({key: key, name: group.name}).$promise
        .then(function(data){
          $scope.group
        })
        .catch(function(err){
          $scope.errors.push(err.data.message);
        });;
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
        })
        .catch(function(err){
          $scope.errors.push(err.data.message);
        });
    }

    this._init();
  }
]);
